terraform {
  required_providers {
    elasticstack = {
      source  = "elastic/elasticstack"
      version = "~> 0.11"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.25"
    }
    grafana = {
      source  = "grafana/grafana"
      version = "~> 3.0"
    }
  }
}

provider "elasticstack" {
  elasticsearch {
    endpoints = [var.elasticsearch_url]
  }
  kibana {
    endpoints = [var.kibana_url]
  }
}

provider "postgresql" {
  host     = var.postgresql_host
  port     = var.postgresql_port
  username = var.postgresql_superuser
  password = var.postgresql_superuser_password
  sslmode  = "disable"
}

provider "grafana" {
  url  = var.grafana_url
  auth = var.grafana_auth
}
