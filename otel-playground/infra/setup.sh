#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ES_URL="http://localhost:9200"
KIBANA_URL="http://localhost:5601"

# --- Wait for Elasticsearch ---
echo "Waiting for Elasticsearch..."
until curl -sf "${ES_URL}/_cluster/health?wait_for_status=yellow&timeout=2s" > /dev/null 2>&1; do
  sleep 2
done
echo "Elasticsearch is ready."

# --- 1. ILM Policy ---
echo "Creating ILM policy [logs-app-ilm-policy]..."
curl -sf -X PUT "${ES_URL}/_ilm/policy/logs-app-ilm-policy" \
  -H 'Content-Type: application/json' \
  -d @"${SCRIPT_DIR}/elasticsearch/ilm-policy.json"
echo ""
echo "ILM policy created."

# --- 2. Component Template: mappings ---
echo "Creating component template [component-logs-app-mappings]..."
curl -sf -X PUT "${ES_URL}/_component_template/component-logs-app-mappings" \
  -H 'Content-Type: application/json' \
  -d @"${SCRIPT_DIR}/elasticsearch/component-mappings.json"
echo ""
echo "Component template (mappings) created."

# --- 3. Component Template: settings (references ILM policy) ---
echo "Creating component template [component-logs-app-settings]..."
curl -sf -X PUT "${ES_URL}/_component_template/component-logs-app-settings" \
  -H 'Content-Type: application/json' \
  -d @"${SCRIPT_DIR}/elasticsearch/component-settings.json"
echo ""
echo "Component template (settings) created."

# --- 4. Composable Index Template (references component templates) ---
echo "Creating index template [logs-app-template]..."
curl -sf -X PUT "${ES_URL}/_index_template/logs-app-template" \
  -H 'Content-Type: application/json' \
  -d @"${SCRIPT_DIR}/elasticsearch/index-template.json"
echo ""
echo "Index template created."

# --- 5. Remove legacy template if exists ---
echo "Removing legacy template [app-logs-template] if exists..."
curl -sf -X DELETE "${ES_URL}/_index_template/app-logs-template" 2>/dev/null || true
echo ""
echo "Legacy template cleanup done."

# --- Wait for Kibana ---
echo "Waiting for Kibana..."
until curl -sf "${KIBANA_URL}/api/status" | grep -q '"overall":{"level":"available"' 2>/dev/null; do
  sleep 3
done
echo "Kibana is ready."

# --- 6. Import Data View ---
echo "Importing Data View..."
curl -sf -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
  -H 'kbn-xsrf: true' \
  -F file=@"${SCRIPT_DIR}/kibana/data-view.ndjson"
echo ""
echo "Data View imported."

# --- 7. Create Lens Visualizations (via direct API to avoid migration issues) ---
create_saved_object() {
  local type="$1"
  local id="$2"
  local file="$3"
  # Delete existing object first (ignore errors)
  curl -sf -X DELETE "${KIBANA_URL}/api/saved_objects/${type}/${id}" \
    -H 'kbn-xsrf: true' > /dev/null 2>&1 || true
  # Create new object
  curl -sf -X POST "${KIBANA_URL}/api/saved_objects/${type}/${id}" \
    -H 'kbn-xsrf: true' \
    -H 'Content-Type: application/json' \
    -d @"${file}" > /dev/null
}

echo "Creating Lens visualizations..."
create_saved_object "lens" "viz-log-volume"  "${SCRIPT_DIR}/kibana/viz-log-volume.json"
create_saved_object "lens" "viz-log-level"   "${SCRIPT_DIR}/kibana/viz-log-level.json"
create_saved_object "lens" "viz-log-service" "${SCRIPT_DIR}/kibana/viz-log-service.json"
create_saved_object "lens" "viz-log-trend"   "${SCRIPT_DIR}/kibana/viz-log-trend.json"
echo "Lens visualizations created."

# --- 8. Create Dashboard ---
echo "Creating Dashboard..."
create_saved_object "dashboard" "app-logs-dashboard" "${SCRIPT_DIR}/kibana/dashboard.json"
echo "Dashboard created."

echo ""
echo "Setup complete."
