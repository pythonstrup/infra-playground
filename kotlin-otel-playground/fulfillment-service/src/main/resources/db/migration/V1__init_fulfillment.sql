CREATE SCHEMA IF NOT EXISTS fulfillment;

CREATE TABLE fulfillment.shipments (
    id               BIGSERIAL PRIMARY KEY,
    product_id       BIGINT       NOT NULL,
    quantity         INT          NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'CREATED',
    tracking_number  VARCHAR(50),
    reservation_ref  VARCHAR(255),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_status ON fulfillment.shipments(status);
CREATE INDEX idx_shipments_product_id ON fulfillment.shipments(product_id);

CREATE TABLE fulfillment.shipment_events (
    id           BIGSERIAL PRIMARY KEY,
    shipment_id  BIGINT       NOT NULL REFERENCES fulfillment.shipments(id),
    from_status  VARCHAR(20),
    to_status    VARCHAR(20)  NOT NULL,
    detail       TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipment_events_shipment_id ON fulfillment.shipment_events(shipment_id);
