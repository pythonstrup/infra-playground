# --- Data View ---
resource "elasticstack_kibana_data_view" "app_logs" {
  data_view = {
    id              = "app-logs-data-view"
    name            = "logs-app-*"
    title           = "logs-app-*"
    time_field_name = "@timestamp"
  }
  override = true

  depends_on = [elasticstack_elasticsearch_index_template.logs_app]
}

# --- Visualizations & Dashboard ---
# Lens visualizations and dashboards have no native Terraform resource.
# elasticstack_kibana_import_saved_objects with inline ndjson is the standard approach.
# coreMigrationVersion / typeMigrationVersion are required for Kibana import API
# to skip already-applied migrations (without them, Kibana 500s).

locals {
  lens_migration = {
    coreMigrationVersion = "8.8.0"
    typeMigrationVersion = "8.9.0"
  }

  dashboard_migration = {
    coreMigrationVersion = "8.8.0"
    typeMigrationVersion = "10.2.0"
  }

  viz_log_volume = merge(local.lens_migration, {
    id   = "viz-log-volume"
    type = "lens"
    attributes = {
      title             = "Log Volume Over Time"
      visualizationType = "lnsXY"
      state = {
        visualization = {
          legend              = { isVisible = true, position = "right" }
          preferredSeriesType = "bar_stacked"
          layers = [{
            layerId    = "layer1"
            seriesType = "bar_stacked"
            xAccessor  = "col-ts"
            accessors  = ["col-count"]
            layerType  = "data"
          }]
        }
        datasourceStates = {
          formBased = {
            layers = {
              layer1 = {
                columns = {
                  col-ts = {
                    label         = "@timestamp"
                    dataType      = "date"
                    operationType = "date_histogram"
                    sourceField   = "@timestamp"
                    isBucketed    = true
                    params        = { interval = "auto" }
                  }
                  col-count = {
                    label         = "Count"
                    dataType      = "number"
                    operationType = "count"
                    isBucketed    = false
                  }
                }
                columnOrder       = ["col-ts", "col-count"]
                incompleteColumns = {}
              }
            }
          }
        }
        query   = { language = "kuery", query = "" }
        filters = []
      }
      description = ""
    }
    references = [{
      type = "index-pattern"
      id   = "app-logs-data-view"
      name = "indexpattern-datasource-layer-layer1"
    }]
  })

  viz_log_level = merge(local.lens_migration, {
    id   = "viz-log-level"
    type = "lens"
    attributes = {
      title             = "Log Level Distribution"
      visualizationType = "lnsPie"
      state = {
        visualization = {
          shape  = "donut"
          layers = [{
            layerId         = "layer1"
            primaryGroups   = ["col-level"]
            metrics         = ["col-count"]
            numberDisplay   = "percent"
            categoryDisplay = "default"
            legendDisplay   = "default"
            layerType       = "data"
          }]
        }
        datasourceStates = {
          formBased = {
            layers = {
              layer1 = {
                columns = {
                  col-level = {
                    label         = "Level"
                    dataType      = "string"
                    operationType = "terms"
                    sourceField   = "log.level"
                    isBucketed    = true
                    params = {
                      size           = 10
                      orderBy        = { type = "column", columnId = "col-count" }
                      orderDirection = "desc"
                    }
                  }
                  col-count = {
                    label         = "Count"
                    dataType      = "number"
                    operationType = "count"
                    isBucketed    = false
                  }
                }
                columnOrder       = ["col-level", "col-count"]
                incompleteColumns = {}
              }
            }
          }
        }
        query   = { language = "kuery", query = "" }
        filters = []
      }
      description = ""
    }
    references = [{
      type = "index-pattern"
      id   = "app-logs-data-view"
      name = "indexpattern-datasource-layer-layer1"
    }]
  })

  viz_log_service = merge(local.lens_migration, {
    id   = "viz-log-service"
    type = "lens"
    attributes = {
      title             = "Logs Per Service"
      visualizationType = "lnsXY"
      state = {
        visualization = {
          legend              = { isVisible = false }
          preferredSeriesType = "bar_horizontal"
          layers = [{
            layerId    = "layer1"
            seriesType = "bar_horizontal"
            xAccessor  = "col-svc"
            accessors  = ["col-count"]
            layerType  = "data"
          }]
        }
        datasourceStates = {
          formBased = {
            layers = {
              layer1 = {
                columns = {
                  col-svc = {
                    label         = "Service"
                    dataType      = "string"
                    operationType = "terms"
                    sourceField   = "service.name"
                    isBucketed    = true
                    params = {
                      size           = 10
                      orderBy        = { type = "column", columnId = "col-count" }
                      orderDirection = "desc"
                    }
                  }
                  col-count = {
                    label         = "Count"
                    dataType      = "number"
                    operationType = "count"
                    isBucketed    = false
                  }
                }
                columnOrder       = ["col-svc", "col-count"]
                incompleteColumns = {}
              }
            }
          }
        }
        query   = { language = "kuery", query = "" }
        filters = []
      }
      description = ""
    }
    references = [{
      type = "index-pattern"
      id   = "app-logs-data-view"
      name = "indexpattern-datasource-layer-layer1"
    }]
  })

  viz_log_trend = merge(local.lens_migration, {
    id   = "viz-log-trend"
    type = "lens"
    attributes = {
      title             = "Log Level Trend"
      visualizationType = "lnsXY"
      state = {
        visualization = {
          legend              = { isVisible = true, position = "right" }
          preferredSeriesType = "area_stacked"
          layers = [{
            layerId       = "layer1"
            seriesType    = "area_stacked"
            xAccessor     = "col-ts"
            accessors     = ["col-count"]
            splitAccessor = "col-level"
            layerType     = "data"
          }]
        }
        datasourceStates = {
          formBased = {
            layers = {
              layer1 = {
                columns = {
                  col-ts = {
                    label         = "@timestamp"
                    dataType      = "date"
                    operationType = "date_histogram"
                    sourceField   = "@timestamp"
                    isBucketed    = true
                    params        = { interval = "auto" }
                  }
                  col-level = {
                    label         = "Level"
                    dataType      = "string"
                    operationType = "terms"
                    sourceField   = "log.level"
                    isBucketed    = true
                    params = {
                      size           = 10
                      orderBy        = { type = "column", columnId = "col-count" }
                      orderDirection = "desc"
                    }
                  }
                  col-count = {
                    label         = "Count"
                    dataType      = "number"
                    operationType = "count"
                    isBucketed    = false
                  }
                }
                columnOrder       = ["col-ts", "col-level", "col-count"]
                incompleteColumns = {}
              }
            }
          }
        }
        query   = { language = "kuery", query = "" }
        filters = []
      }
      description = ""
    }
    references = [{
      type = "index-pattern"
      id   = "app-logs-data-view"
      name = "indexpattern-datasource-layer-layer1"
    }]
  })

  dashboard = merge(local.dashboard_migration, {
    id   = "app-logs-dashboard"
    type = "dashboard"
    attributes = {
      title       = "App Logs Monitor"
      description = "Application log monitoring - volume, level distribution, per-service breakdown, and level trend"
      panelsJSON  = jsonencode([
        { panelIndex = "p1", gridData = { x = 0, y = 0, w = 24, h = 12, i = "p1" }, type = "lens", panelRefName = "panel_p1" },
        { panelIndex = "p2", gridData = { x = 24, y = 0, w = 24, h = 12, i = "p2" }, type = "lens", panelRefName = "panel_p2" },
        { panelIndex = "p3", gridData = { x = 0, y = 12, w = 24, h = 12, i = "p3" }, type = "lens", panelRefName = "panel_p3" },
        { panelIndex = "p4", gridData = { x = 24, y = 12, w = 24, h = 12, i = "p4" }, type = "lens", panelRefName = "panel_p4" },
      ])
      timeRestore = true
      timeTo      = "now"
      timeFrom    = "now-24h"
      kibanaSavedObjectMeta = {
        searchSourceJSON = jsonencode({ query = { language = "kuery", query = "" }, filter = [] })
      }
    }
    references = [
      { name = "panel_p1", type = "lens", id = "viz-log-volume" },
      { name = "panel_p2", type = "lens", id = "viz-log-level" },
      { name = "panel_p3", type = "lens", id = "viz-log-service" },
      { name = "panel_p4", type = "lens", id = "viz-log-trend" },
    ]
  })

  saved_objects_ndjson = join("\n", [
    for obj in [local.viz_log_volume, local.viz_log_level, local.viz_log_service, local.viz_log_trend, local.dashboard] :
    jsonencode(obj)
  ])
}

resource "elasticstack_kibana_import_saved_objects" "visualizations_and_dashboard" {
  overwrite     = true
  file_contents = local.saved_objects_ndjson

  depends_on = [elasticstack_kibana_data_view.app_logs]
}
