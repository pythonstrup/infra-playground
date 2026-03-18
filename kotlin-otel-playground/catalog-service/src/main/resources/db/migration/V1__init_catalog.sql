CREATE SCHEMA IF NOT EXISTS catalog;

CREATE TABLE catalog.categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    parent_id   BIGINT REFERENCES catalog.categories(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent_id ON catalog.categories(parent_id);

CREATE TABLE catalog.products (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    sku           VARCHAR(100) NOT NULL UNIQUE,
    category_id   BIGINT REFERENCES catalog.categories(id),
    weight_grams  INT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category_id ON catalog.products(category_id);
CREATE INDEX idx_products_sku ON catalog.products(sku);
