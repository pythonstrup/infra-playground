# --- Database ---
resource "postgresql_database" "app" {
  name  = var.postgresql_database
  owner = var.postgresql_superuser
}

# --- Schema ---
resource "postgresql_schema" "app" {
  name     = "app"
  database = postgresql_database.app.name
  owner    = var.postgresql_superuser
}

# --- Roles ---

# app_readwrite: used by application services (user-service, order-service)
resource "postgresql_role" "app_readwrite" {
  name     = "app_readwrite"
  login    = true
  password = var.app_password
}

# app_readonly: used for monitoring, debugging, analytics
resource "postgresql_role" "app_readonly" {
  name     = "app_readonly"
  login    = true
  password = var.readonly_password
}

# --- Grants: app_readwrite ---

resource "postgresql_grant" "readwrite_usage_public" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readwrite.name
  schema      = "public"
  object_type = "schema"
  privileges  = ["USAGE", "CREATE"]
}

resource "postgresql_grant" "readwrite_tables_public" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readwrite.name
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

resource "postgresql_grant" "readwrite_sequences_public" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readwrite.name
  schema      = "public"
  object_type = "sequence"
  privileges  = ["USAGE", "SELECT"]
}

resource "postgresql_grant" "readwrite_usage_app" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readwrite.name
  schema      = postgresql_schema.app.name
  object_type = "schema"
  privileges  = ["USAGE", "CREATE"]
}

resource "postgresql_grant" "readwrite_tables_app" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readwrite.name
  schema      = postgresql_schema.app.name
  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

resource "postgresql_grant" "readwrite_sequences_app" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readwrite.name
  schema      = postgresql_schema.app.name
  object_type = "sequence"
  privileges  = ["USAGE", "SELECT"]
}

# --- Default Privileges: app_readwrite ---
# Ensures future tables/sequences created by superuser are also accessible

resource "postgresql_default_privileges" "readwrite_tables_public" {
  database = postgresql_database.app.name
  role     = postgresql_role.app_readwrite.name
  schema   = "public"
  owner    = var.postgresql_superuser

  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

resource "postgresql_default_privileges" "readwrite_sequences_public" {
  database = postgresql_database.app.name
  role     = postgresql_role.app_readwrite.name
  schema   = "public"
  owner    = var.postgresql_superuser

  object_type = "sequence"
  privileges  = ["USAGE", "SELECT"]
}

resource "postgresql_default_privileges" "readwrite_tables_app" {
  database = postgresql_database.app.name
  role     = postgresql_role.app_readwrite.name
  schema   = postgresql_schema.app.name
  owner    = var.postgresql_superuser

  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

resource "postgresql_default_privileges" "readwrite_sequences_app" {
  database = postgresql_database.app.name
  role     = postgresql_role.app_readwrite.name
  schema   = postgresql_schema.app.name
  owner    = var.postgresql_superuser

  object_type = "sequence"
  privileges  = ["USAGE", "SELECT"]
}

# --- Grants: app_readonly ---

resource "postgresql_grant" "readonly_usage_public" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readonly.name
  schema      = "public"
  object_type = "schema"
  privileges  = ["USAGE"]
}

resource "postgresql_grant" "readonly_tables_public" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readonly.name
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT"]
}

resource "postgresql_grant" "readonly_sequences_public" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readonly.name
  schema      = "public"
  object_type = "sequence"
  privileges  = ["SELECT"]
}

resource "postgresql_grant" "readonly_usage_app" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readonly.name
  schema      = postgresql_schema.app.name
  object_type = "schema"
  privileges  = ["USAGE"]
}

resource "postgresql_grant" "readonly_tables_app" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readonly.name
  schema      = postgresql_schema.app.name
  object_type = "table"
  privileges  = ["SELECT"]
}

resource "postgresql_grant" "readonly_sequences_app" {
  database    = postgresql_database.app.name
  role        = postgresql_role.app_readonly.name
  schema      = postgresql_schema.app.name
  object_type = "sequence"
  privileges  = ["SELECT"]
}

# --- Default Privileges: app_readonly ---

resource "postgresql_default_privileges" "readonly_tables_public" {
  database = postgresql_database.app.name
  role     = postgresql_role.app_readonly.name
  schema   = "public"
  owner    = var.postgresql_superuser

  object_type = "table"
  privileges  = ["SELECT"]
}

resource "postgresql_default_privileges" "readonly_tables_app" {
  database = postgresql_database.app.name
  role     = postgresql_role.app_readonly.name
  schema   = postgresql_schema.app.name
  owner    = var.postgresql_superuser

  object_type = "table"
  privileges  = ["SELECT"]
}
