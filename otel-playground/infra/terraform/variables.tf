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
