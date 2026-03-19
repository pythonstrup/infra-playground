# --- Grafana Dashboards (Prometheus only) ---
# Datasource is file-provisioned via infra/grafana/provisioning/datasources/.
# Grafana → Prometheus only. Logs/traces stay in Kibana.

# --- Folder ---
resource "grafana_folder" "otel" {
  title = "OTel Playground"
}

# --- Dashboards ---
resource "grafana_dashboard" "jvm_metrics" {
  folder      = grafana_folder.otel.id
  config_json = jsonencode(local.dashboard_jvm_metrics)
}

resource "grafana_dashboard" "infra_metrics" {
  folder      = grafana_folder.otel.id
  config_json = jsonencode(local.dashboard_infra_metrics)
}

resource "grafana_dashboard" "http_overview" {
  folder      = grafana_folder.otel.id
  config_json = jsonencode(local.dashboard_http_overview)
}

# --- Dashboard JSON definitions ---

locals {
  ds_prometheus = { type = "prometheus", uid = "prometheus" }

  # ========== Dashboard: JVM Metrics (Spring WebFlux) ==========
  dashboard_jvm_metrics = {
    title       = "JVM Metrics (Spring WebFlux)"
    uid         = "jvm-metrics"
    description = "JVM heap, CPU, GC, threads, and R2DBC pool for Kotlin services"
    editable    = true
    timezone    = "browser"
    time        = { from = "now-1h", to = "now" }
    refresh     = "30s"
    templating = {
      list = [{
        name       = "service"
        type       = "query"
        datasource = local.ds_prometheus
        query      = "label_values(jvm_memory_used_bytes, service_name)"
        current    = { text = "All", value = "$__all" }
        includeAll = true
        multi      = true
        refresh    = 2
        regex      = "/kt-.*/"
      }]
    }
    panels = [
      {
        id         = 1
        title      = "JVM Heap Memory Used"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 0, y = 0 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "sum by (service_name) (jvm_memory_used_bytes{service_name=~\"$service\", jvm_memory_type=\"heap\"})"
          legendFormat = "{{service_name}}"
        }]
        fieldConfig = { defaults = { unit = "bytes", custom = { drawStyle = "line", fillOpacity = 20 } } }
      },
      {
        id         = 2
        title      = "JVM CPU Utilization"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 12, y = 0 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "avg by (service_name) (jvm_cpu_recent_utilization_ratio{service_name=~\"$service\"})"
          legendFormat = "{{service_name}}"
        }]
        fieldConfig = { defaults = { unit = "percentunit", min = 0, max = 1, custom = { drawStyle = "line", fillOpacity = 10 } } }
      },
      {
        id         = 3
        title      = "JVM GC Pause Time (rate)"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 0, y = 10 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "sum by (service_name) (rate(jvm_gc_duration_seconds_sum{service_name=~\"$service\"}[$__rate_interval]))"
          legendFormat = "{{service_name}}"
        }]
        fieldConfig = { defaults = { unit = "s", custom = { drawStyle = "bars", fillOpacity = 50, stacking = { mode = "normal" } } } }
      },
      {
        id         = 4
        title      = "JVM Thread Count"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 12, y = 10 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "sum by (service_name) (jvm_thread_count{service_name=~\"$service\"})"
          legendFormat = "{{service_name}}"
        }]
        fieldConfig = { defaults = { unit = "short", min = 0, custom = { drawStyle = "line", fillOpacity = 15 } } }
      },
      {
        id         = 5
        title      = "JVM Memory by Pool (Heap)"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 0, y = 20 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "jvm_memory_used_bytes{service_name=~\"$service\", jvm_memory_type=\"heap\"}"
          legendFormat = "{{service_name}} / {{jvm_memory_pool_name}}"
        }]
        fieldConfig = { defaults = { unit = "bytes", custom = { drawStyle = "line", fillOpacity = 15 } } }
      },
      {
        id         = 6
        title      = "R2DBC Connection Pool"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 12, y = 20 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "sum by (service_name) (db_client_connections{service_name=~\"$service\"})"
          legendFormat = "{{service_name}}"
        }]
        fieldConfig = { defaults = { unit = "short", min = 0, custom = { drawStyle = "line", fillOpacity = 15 } } }
      },
    ]
  }

  # ========== Dashboard: Infrastructure Metrics ==========
  dashboard_infra_metrics = {
    title       = "Infrastructure Metrics"
    uid         = "infra-metrics"
    description = "PostgreSQL and Redis metrics from OTel Collector receivers"
    editable    = true
    timezone    = "browser"
    time        = { from = "now-1h", to = "now" }
    refresh     = "30s"
    templating  = { list = [] }
    panels = [
      {
        id         = 1
        title      = "PostgreSQL Active Connections"
        type       = "timeseries"
        gridPos    = { h = 8, w = 12, x = 0, y = 0 }
        datasource = local.ds_prometheus
        targets = [{ expr = "postgresql_backends", legendFormat = "connections" }]
        fieldConfig = { defaults = { unit = "short", min = 0, custom = { drawStyle = "line", fillOpacity = 20 } } }
      },
      {
        id         = 2
        title      = "PostgreSQL Operations/sec"
        type       = "timeseries"
        gridPos    = { h = 8, w = 12, x = 12, y = 0 }
        datasource = local.ds_prometheus
        targets = [
          { expr = "rate(postgresql_tup_inserted[$__rate_interval])", legendFormat = "inserts/s" },
          { expr = "rate(postgresql_tup_updated[$__rate_interval])", legendFormat = "updates/s" },
          { expr = "rate(postgresql_tup_fetched[$__rate_interval])", legendFormat = "fetches/s" },
        ]
        fieldConfig = { defaults = { unit = "ops", custom = { drawStyle = "line", fillOpacity = 10 } } }
      },
      {
        id         = 3
        title      = "Redis Connected Clients"
        type       = "timeseries"
        gridPos    = { h = 8, w = 12, x = 0, y = 8 }
        datasource = local.ds_prometheus
        targets = [{ expr = "redis_clients_connected", legendFormat = "clients" }]
        fieldConfig = { defaults = { unit = "short", min = 0, custom = { drawStyle = "line", fillOpacity = 20 } } }
      },
      {
        id         = 4
        title      = "Redis Memory Used"
        type       = "timeseries"
        gridPos    = { h = 8, w = 12, x = 12, y = 8 }
        datasource = local.ds_prometheus
        targets = [{ expr = "redis_memory_used", legendFormat = "used" }]
        fieldConfig = { defaults = { unit = "bytes", custom = { drawStyle = "line", fillOpacity = 20 } } }
      },
    ]
  }

  # ========== Dashboard: HTTP Overview ==========
  dashboard_http_overview = {
    title       = "HTTP Overview"
    uid         = "http-overview"
    description = "HTTP request rate and duration across all services"
    editable    = true
    timezone    = "browser"
    time        = { from = "now-1h", to = "now" }
    refresh     = "30s"
    templating = {
      list = [{
        name       = "service"
        type       = "query"
        datasource = local.ds_prometheus
        query      = "label_values(http_server_request_duration_seconds_count, service_name)"
        current    = { text = "All", value = "$__all" }
        includeAll = true
        multi      = true
        refresh    = 2
      }]
    }
    panels = [
      {
        id         = 1
        title      = "HTTP Request Rate"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 0, y = 0 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "sum by (service_name) (rate(http_server_request_duration_seconds_count{service_name=~\"$service\"}[$__rate_interval]))"
          legendFormat = "{{service_name}}"
        }]
        fieldConfig = { defaults = { unit = "reqps", custom = { drawStyle = "line", fillOpacity = 20 } } }
      },
      {
        id         = 2
        title      = "HTTP Request Duration (p95)"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 12, y = 0 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "histogram_quantile(0.95, sum by (service_name, le) (rate(http_server_request_duration_seconds_bucket{service_name=~\"$service\"}[$__rate_interval])))"
          legendFormat = "{{service_name}} p95"
        }]
        fieldConfig = { defaults = { unit = "s", custom = { drawStyle = "line", fillOpacity = 10 } } }
      },
      {
        id         = 3
        title      = "HTTP Request Rate by Method"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 0, y = 10 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "sum by (http_request_method) (rate(http_server_request_duration_seconds_count{service_name=~\"$service\"}[$__rate_interval]))"
          legendFormat = "{{http_request_method}}"
        }]
        fieldConfig = { defaults = { unit = "reqps", custom = { drawStyle = "bars", fillOpacity = 50, stacking = { mode = "normal" } } } }
      },
      {
        id         = 4
        title      = "HTTP Error Rate (5xx)"
        type       = "timeseries"
        gridPos    = { h = 10, w = 12, x = 12, y = 10 }
        datasource = local.ds_prometheus
        targets = [{
          expr         = "sum by (service_name) (rate(http_server_request_duration_seconds_count{service_name=~\"$service\", http_response_status_code=~\"5..\"}[$__rate_interval]))"
          legendFormat = "{{service_name}}"
        }]
        fieldConfig = { defaults = { unit = "reqps", min = 0, custom = { drawStyle = "line", fillOpacity = 30 }, color = { mode = "fixed", fixedColor = "red" } } }
      },
    ]
  }
}
