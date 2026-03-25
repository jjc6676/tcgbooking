-- 011: Add walk_in_client_id to appointments so walk-in clients can have appointments
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS walk_in_client_id UUID REFERENCES walk_in_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_walk_in_client
  ON appointments(walk_in_client_id);
