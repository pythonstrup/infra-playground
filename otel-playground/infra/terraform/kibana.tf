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

resource "elasticstack_kibana_data_view" "postgres_logs" {
  data_view = {
    id              = "postgres-logs-data-view"
    name            = "logs-postgres-*"
    title           = "logs-postgres-*"
    time_field_name = "@timestamp"
  }
  override = true

  depends_on = [elasticstack_elasticsearch_index_template.logs_postgres]
}

resource "elasticstack_kibana_data_view" "redis_logs" {
  data_view = {
    id              = "redis-logs-data-view"
    name            = "logs-redis-*"
    title           = "logs-redis-*"
    time_field_name = "@timestamp"
  }
  override = true

  depends_on = [elasticstack_elasticsearch_index_template.logs_redis]
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

  # --- Service Metrics Visualizations (APM metrics from OTel Agent) ---

  viz_jvm_heap_memory = merge(local.lens_migration, {
    id   = "viz-jvm-heap-memory"
    type = "lens"
    attributes = {
      title             = "JVM Heap Memory"
      visualizationType = "lnsXY"
      state = {
        visualization = {
          legend              = { isVisible = true, position = "right" }
          preferredSeriesType = "area"
          layers = [{
            layerId       = "layer1"
            seriesType    = "area"
            xAccessor     = "col-ts"
            accessors     = ["col-mem"]
            splitAccessor = "col-svc"
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
                  col-svc = {
                    label         = "Service"
                    dataType      = "string"
                    operationType = "terms"
                    sourceField   = "service.name"
                    isBucketed    = true
                    params = {
                      size           = 10
                      orderBy        = { type = "column", columnId = "col-mem" }
                      orderDirection = "desc"
                    }
                  }
                  col-mem = {
                    label         = "Heap Used (bytes)"
                    dataType      = "number"
                    operationType = "average"
                    sourceField   = "jvm.memory.used"
                    isBucketed    = false
                  }
                }
                columnOrder       = ["col-ts", "col-svc", "col-mem"]
                incompleteColumns = {}
              }
            }
          }
        }
        query   = { language = "kuery", query = "labels.jvm_memory_type: heap" }
        filters = []
      }
      description = ""
    }
    references = [{
      type = "index-pattern"
      id   = "apm-metrics-data-view"
      name = "indexpattern-datasource-layer-layer1"
    }]
  })

  viz_jvm_cpu = merge(local.lens_migration, {
    id   = "viz-jvm-cpu"
    type = "lens"
    attributes = {
      title             = "JVM CPU Utilization"
      visualizationType = "lnsXY"
      state = {
        visualization = {
          legend              = { isVisible = true, position = "right" }
          preferredSeriesType = "line"
          layers = [{
            layerId       = "layer1"
            seriesType    = "line"
            xAccessor     = "col-ts"
            accessors     = ["col-cpu"]
            splitAccessor = "col-svc"
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
                  col-svc = {
                    label         = "Service"
                    dataType      = "string"
                    operationType = "terms"
                    sourceField   = "service.name"
                    isBucketed    = true
                    params = {
                      size           = 10
                      orderBy        = { type = "column", columnId = "col-cpu" }
                      orderDirection = "desc"
                    }
                  }
                  col-cpu = {
                    label         = "CPU Utilization"
                    dataType      = "number"
                    operationType = "average"
                    sourceField   = "jvm.cpu.recent_utilization"
                    isBucketed    = false
                  }
                }
                columnOrder       = ["col-ts", "col-svc", "col-cpu"]
                incompleteColumns = {}
              }
            }
          }
        }
        query   = { language = "kuery", query = "service.name: kt-*" }
        filters = []
      }
      description = ""
    }
    references = [{
      type = "index-pattern"
      id   = "apm-metrics-data-view"
      name = "indexpattern-datasource-layer-layer1"
    }]
  })

  viz_jvm_gc = merge(local.lens_migration, {
    id   = "viz-jvm-gc"
    type = "lens"
    attributes = {
      title             = "JVM GC Duration"
      visualizationType = "lnsXY"
      state = {
        visualization = {
          legend              = { isVisible = true, position = "right" }
          preferredSeriesType = "bar_stacked"
          layers = [{
            layerId       = "layer1"
            seriesType    = "bar_stacked"
            xAccessor     = "col-ts"
            accessors     = ["col-gc"]
            splitAccessor = "col-svc"
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
                  col-svc = {
                    label         = "Service"
                    dataType      = "string"
                    operationType = "terms"
                    sourceField   = "service.name"
                    isBucketed    = true
                    params = {
                      size           = 10
                      orderBy        = { type = "column", columnId = "col-gc" }
                      orderDirection = "desc"
                    }
                  }
                  col-gc = {
                    label         = "GC Duration"
                    dataType      = "number"
                    operationType = "average"
                    sourceField   = "jvm.gc.duration"
                    isBucketed    = false
                  }
                }
                columnOrder       = ["col-ts", "col-svc", "col-gc"]
                incompleteColumns = {}
              }
            }
          }
        }
        query   = { language = "kuery", query = "service.name: kt-*" }
        filters = []
      }
      description = ""
    }
    references = [{
      type = "index-pattern"
      id   = "apm-metrics-data-view"
      name = "indexpattern-datasource-layer-layer1"
    }]
  })

  viz_db_pool = merge(local.lens_migration, {
    id   = "viz-db-pool"
    type = "lens"
    attributes = {
      title             = "R2DBC Connection Pool"
      visualizationType = "lnsXY"
      state = {
        visualization = {
          legend              = { isVisible = true, position = "right" }
          preferredSeriesType = "line"
          layers = [{
            layerId       = "layer1"
            seriesType    = "line"
            xAccessor     = "col-ts"
            accessors     = ["col-conn"]
            splitAccessor = "col-svc"
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
                  col-svc = {
                    label         = "Service"
                    dataType      = "string"
                    operationType = "terms"
                    sourceField   = "service.name"
                    isBucketed    = true
                    params = {
                      size           = 10
                      orderBy        = { type = "column", columnId = "col-conn" }
                      orderDirection = "desc"
                    }
                  }
                  col-conn = {
                    label         = "Active Connections"
                    dataType      = "number"
                    operationType = "max"
                    sourceField   = "db.client.connections"
                    isBucketed    = false
                  }
                }
                columnOrder       = ["col-ts", "col-svc", "col-conn"]
                incompleteColumns = {}
              }
            }
          }
        }
        query   = { language = "kuery", query = "service.name: kt-*" }
        filters = []
      }
      description = ""
    }
    references = [{
      type = "index-pattern"
      id   = "apm-metrics-data-view"
      name = "indexpattern-datasource-layer-layer1"
    }]
  })

  metrics_dashboard = merge(local.dashboard_migration, {
    id   = "service-metrics-dashboard"
    type = "dashboard"
    attributes = {
      title       = "Service Metrics Monitor"
      description = "JVM heap memory, CPU utilization, GC duration, and R2DBC connection pool for Spring WebFlux services"
      panelsJSON  = jsonencode([
        { panelIndex = "m1", gridData = { x = 0, y = 0, w = 24, h = 12, i = "m1" }, type = "lens", panelRefName = "panel_m1" },
        { panelIndex = "m2", gridData = { x = 24, y = 0, w = 24, h = 12, i = "m2" }, type = "lens", panelRefName = "panel_m2" },
        { panelIndex = "m3", gridData = { x = 0, y = 12, w = 24, h = 12, i = "m3" }, type = "lens", panelRefName = "panel_m3" },
        { panelIndex = "m4", gridData = { x = 24, y = 12, w = 24, h = 12, i = "m4" }, type = "lens", panelRefName = "panel_m4" },
      ])
      timeRestore = true
      timeTo      = "now"
      timeFrom    = "now-1h"
      kibanaSavedObjectMeta = {
        searchSourceJSON = jsonencode({ query = { language = "kuery", query = "" }, filter = [] })
      }
    }
    references = [
      { name = "panel_m1", type = "lens", id = "viz-jvm-heap-memory" },
      { name = "panel_m2", type = "lens", id = "viz-jvm-cpu" },
      { name = "panel_m3", type = "lens", id = "viz-jvm-gc" },
      { name = "panel_m4", type = "lens", id = "viz-db-pool" },
    ]
  })

  metrics_saved_objects_ndjson = join("\n", [
    for obj in [local.viz_jvm_heap_memory, local.viz_jvm_cpu, local.viz_jvm_gc, local.viz_db_pool, local.metrics_dashboard] :
    jsonencode(obj)
  ])
}

resource "elasticstack_kibana_import_saved_objects" "visualizations_and_dashboard" {
  overwrite     = true
  file_contents = local.saved_objects_ndjson

  depends_on = [elasticstack_kibana_data_view.app_logs]
}

# --- APM Metrics Data View & Dashboard ---

resource "elasticstack_kibana_data_view" "apm_metrics" {
  data_view = {
    id              = "apm-metrics-data-view"
    name            = "metrics-apm.app.*"
    title           = "metrics-apm.app.*"
    time_field_name = "@timestamp"
  }
  override = true
}

resource "elasticstack_kibana_import_saved_objects" "metrics_dashboard" {
  overwrite     = true
  file_contents = local.metrics_saved_objects_ndjson

  depends_on = [elasticstack_kibana_data_view.apm_metrics]
}
