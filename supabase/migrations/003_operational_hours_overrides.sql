-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/zevdjxmnxdinqflhjeaq/sql/new

CREATE TABLE operational_hours_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  label TEXT, -- e.g. "Summer Hours", "December", "Holiday Break"
  effective_from DATE NOT NULL,
  effective_until DATE NOT NULL,
  day_of_week INT, -- 0-6 (NULL = applies to all days in range)
  open_time TIME, -- NULL = closed all day
  close_time TIME, -- NULL = closed all day
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE operational_hours_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists manage own overrides" ON operational_hours_overrides
  FOR ALL USING (
    stylist_id IN (SELECT id FROM stylists WHERE user_id = auth.uid())
  );

-- Index for fast date-range lookups
CREATE INDEX ON operational_hours_overrides (stylist_id, effective_from, effective_until);
