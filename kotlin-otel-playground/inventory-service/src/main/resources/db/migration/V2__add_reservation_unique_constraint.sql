-- Prevent duplicate HELD reservations for the same product + referenceId.
-- A partial unique index ensures only one HELD row per (product_id, reference_id).
CREATE UNIQUE INDEX idx_reservations_held_unique
    ON inventory.reservations (product_id, reference_id)
    WHERE status = 'HELD';
