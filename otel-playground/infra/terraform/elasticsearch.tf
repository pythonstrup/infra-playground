# --- ILM Policy ---
resource "elasticstack_elasticsearch_index_lifecycle" "logs_app" {
  name = "logs-app-ilm-policy"

  hot {
    min_age = "0ms"
    rollover {
      max_primary_shard_size = "1gb"
      max_age                = "7d"
    }
  }

  delete {
    min_age = "30d"
    delete {}
  }
}

# --- Component Template: Mappings ---
resource "elasticstack_elasticsearch_component_template" "mappings" {
  name = "component-logs-app-mappings"

  template {
    mappings = jsonencode({
      properties = {
        "@timestamp" = { type = "date" }
        message      = { type = "text" }
        log = {
          properties = {
            level  = { type = "keyword" }
            logger = { type = "keyword" }
          }
        }
        service = {
          properties = {
            name = { type = "keyword" }
          }
        }
        trace = {
          properties = {
            id = { type = "keyword" }
          }
        }
        span = {
          properties = {
            id = { type = "keyword" }
          }
        }
        transaction = {
          properties = {
            id = { type = "keyword" }
          }
        }
        host = {
          properties = {
            name = { type = "keyword" }
          }
        }
      }
    })
  }
}

# --- Component Template: Settings ---
resource "elasticstack_elasticsearch_component_template" "settings" {
  name = "component-logs-app-settings"

  template {
    settings = jsonencode({
      number_of_shards   = 1
      number_of_replicas = 0
      "lifecycle.name"   = elasticstack_elasticsearch_index_lifecycle.logs_app.name
    })
  }
}

# --- Composable Index Template ---
resource "elasticstack_elasticsearch_index_template" "logs_app" {
  name           = "logs-app-template"
  index_patterns = ["logs-app-*"]
  priority       = 200

  composed_of = [
    elasticstack_elasticsearch_component_template.mappings.name,
    elasticstack_elasticsearch_component_template.settings.name,
  ]

  data_stream {}
}

# =============================================================
# PostgreSQL Logs
# =============================================================

resource "elasticstack_elasticsearch_index_lifecycle" "logs_postgres" {
  name = "logs-postgres-ilm-policy"

  hot {
    min_age = "0ms"
    rollover {
      max_primary_shard_size = "1gb"
      max_age                = "7d"
    }
  }

  delete {
    min_age = "30d"
    delete {}
  }
}

resource "elasticstack_elasticsearch_component_template" "postgres_mappings" {
  name = "component-logs-postgres-mappings"

  template {
    mappings = jsonencode({
      properties = {
        "@timestamp" = { type = "date" }
        message      = { type = "text" }
        error_severity = { type = "keyword" }
        user           = { type = "keyword" }
        dbname         = { type = "keyword" }
        pid            = { type = "integer" }
        remote_host    = { type = "keyword" }
        command_tag    = { type = "keyword" }
        sql_state_code = { type = "keyword" }
        query          = { type = "text" }
        detail         = { type = "text" }
        backend_type   = { type = "keyword" }
        application_name = { type = "keyword" }
        service = {
          properties = {
            name = { type = "keyword" }
          }
        }
      }
    })
  }
}

resource "elasticstack_elasticsearch_component_template" "postgres_settings" {
  name = "component-logs-postgres-settings"

  template {
    settings = jsonencode({
      number_of_shards   = 1
      number_of_replicas = 0
      "lifecycle.name"   = elasticstack_elasticsearch_index_lifecycle.logs_postgres.name
    })
  }
}

resource "elasticstack_elasticsearch_index_template" "logs_postgres" {
  name           = "logs-postgres-template"
  index_patterns = ["logs-postgres-*"]
  priority       = 200

  composed_of = [
    elasticstack_elasticsearch_component_template.postgres_mappings.name,
    elasticstack_elasticsearch_component_template.postgres_settings.name,
  ]

  data_stream {}
}

# =============================================================
# Redis Logs
# =============================================================

resource "elasticstack_elasticsearch_index_lifecycle" "logs_redis" {
  name = "logs-redis-ilm-policy"

  hot {
    min_age = "0ms"
    rollover {
      max_primary_shard_size = "1gb"
      max_age                = "7d"
    }
  }

  delete {
    min_age = "30d"
    delete {}
  }
}

resource "elasticstack_elasticsearch_component_template" "redis_mappings" {
  name = "component-logs-redis-mappings"

  template {
    mappings = jsonencode({
      properties = {
        "@timestamp" = { type = "date" }
        message      = { type = "text" }
        level        = { type = "keyword" }
        pid          = { type = "integer" }
        role         = { type = "keyword" }
        service = {
          properties = {
            name = { type = "keyword" }
          }
        }
      }
    })
  }
}

resource "elasticstack_elasticsearch_component_template" "redis_settings" {
  name = "component-logs-redis-settings"

  template {
    settings = jsonencode({
      number_of_shards   = 1
      number_of_replicas = 0
      "lifecycle.name"   = elasticstack_elasticsearch_index_lifecycle.logs_redis.name
    })
  }
}

resource "elasticstack_elasticsearch_index_template" "logs_redis" {
  name           = "logs-redis-template"
  index_patterns = ["logs-redis-*"]
  priority       = 200

  composed_of = [
    elasticstack_elasticsearch_component_template.redis_mappings.name,
    elasticstack_elasticsearch_component_template.redis_settings.name,
  ]

  data_stream {}
}
