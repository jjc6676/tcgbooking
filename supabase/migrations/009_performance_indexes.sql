-- Migration 009: Performance indexes for high-traffic tables
-- Created for tcgbooking performance optimization phase 2

-- ══════════════════════════════════════════════════════════════════════════════
-- walk_in_clients
-- ══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_walk_in_clients_stylist
  ON walk_in_clients (stylist_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- client_service_log
-- ══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_client_service_log_stylist
  ON client_service_log (stylist_id);

CREATE INDEX IF NOT EXISTS idx_client_service_log_client
  ON client_service_log (client_id);

CREATE INDEX IF NOT EXISTS idx_client_service_log_walk_in_client
  ON client_service_log (walk_in_client_id);

CREATE INDEX IF NOT EXISTS idx_client_service_log_visit_date
  ON client_service_log (visit_date DESC);

-- ══════════════════════════════════════════════════════════════════════════════
-- appointments (add missing indexes — client_id and stylist_id+start_at already exist)
-- ══════════════════════════════════════════════════════════════════════════════
-- Standalone start_at for date range queries without stylist filter
CREATE INDEX IF NOT EXISTS idx_appointments_start_at
  ON appointments (start_at);

-- Status for filtering confirmed/pending/cancelled
CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments (status);

-- ══════════════════════════════════════════════════════════════════════════════
-- rebooking_reminders
-- ══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_rebooking_reminders_stylist
  ON rebooking_reminders (stylist_id);

CREATE INDEX IF NOT EXISTS idx_rebooking_reminders_client
  ON rebooking_reminders (client_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- stylist_client_notes (UNIQUE constraint creates implicit index, but add explicit
-- single-column indexes for partial-key lookups)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_stylist_client_notes_stylist
  ON stylist_client_notes (stylist_id);

CREATE INDEX IF NOT EXISTS idx_stylist_client_notes_client
  ON stylist_client_notes (client_id);
