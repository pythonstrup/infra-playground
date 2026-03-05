variable "elasticsearch_url" {
  description = "Elasticsearch endpoint URL"
  type        = string
  default     = "http://localhost:9200"
}

variable "kibana_url" {
  description = "Kibana endpoint URL"
  type        = string
  default     = "http://localhost:5601"
}

# --- PostgreSQL ---

variable "postgresql_host" {
  description = "PostgreSQL host"
  type        = string
  default     = "localhost"
}

variable "postgresql_port" {
  description = "PostgreSQL port"
  type        = number
  default     = 54320
}

variable "postgresql_superuser" {
  description = "PostgreSQL superuser for provider connection"
  type        = string
  default     = "otel"
}

variable "postgresql_superuser_password" {
  description = "PostgreSQL superuser password"
  type        = string
  sensitive   = true
}

variable "postgresql_database" {
  description = "Application database name"
  type        = string
  default     = "otel_playground"
}

variable "app_password" {
  description = "Password for app role (used by services)"
  type        = string
  sensitive   = true
}

variable "readonly_password" {
  description = "Password for read-only role (used for monitoring/debugging)"
  type        = string
  sensitive   = true
}
