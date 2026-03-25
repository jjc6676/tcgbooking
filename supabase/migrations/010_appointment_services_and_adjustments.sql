-- 010: Create appointment_services junction table + adjustment columns
-- Fixes: multi-service bookings were silently failing (table never existed)
-- Adds: adjustment tracking for refunds/upsells/tips

-- 1. Junction table for multi-service appointments
CREATE TABLE IF NOT EXISTS appointment_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appt_services_appointment
  ON appointment_services(appointment_id);

CREATE INDEX IF NOT EXISTS idx_appt_services_service
  ON appointment_services(service_id);

-- RLS: stylists can manage their own appointment services
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists manage own appointment services"
  ON appointment_services
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN stylists s ON s.id = a.stylist_id
      WHERE a.id = appointment_services.appointment_id
        AND s.user_id = auth.uid()
    )
  );

-- Clients can view their own appointment services
CREATE POLICY "Clients view own appointment services"
  ON appointment_services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_services.appointment_id
        AND a.client_id = auth.uid()
    )
  );

-- 2. Adjustment columns on appointments (for refunds, upsells, tips)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS adjustment_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS adjustment_note text;
