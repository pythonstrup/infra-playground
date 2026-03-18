CREATE SCHEMA IF NOT EXISTS inventory;

CREATE TABLE inventory.stocks (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL UNIQUE,
    quantity        INT NOT NULL DEFAULT 0,
    warehouse_zone  VARCHAR(50),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stocks_product_id ON inventory.stocks(product_id);

CREATE TABLE inventory.reservations (
    id            BIGSERIAL PRIMARY KEY,
    product_id    BIGINT NOT NULL,
    quantity      INT NOT NULL,
    reference_id  VARCHAR(255) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'HELD',
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_product_ref ON inventory.reservations(product_id, reference_id, status);

CREATE TABLE inventory.stock_ledger (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL,
    change_quantity INT NOT NULL,
    reason          VARCHAR(50) NOT NULL,
    reference_id    VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_ledger_product_id ON inventory.stock_ledger(product_id);
