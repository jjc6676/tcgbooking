-- Walk-in / manually added clients (no Supabase auth account required)
CREATE TABLE IF NOT EXISTS walk_in_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE walk_in_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists manage own walk-in clients"
  ON walk_in_clients FOR ALL
  USING (stylist_id IN (SELECT id FROM stylists WHERE user_id = auth.uid()));

-- Service log: manually recorded visits (for both auth clients and walk-in clients)
CREATE TABLE IF NOT EXISTS client_service_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  -- One of these must be set:
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,       -- auth user client
  walk_in_client_id UUID REFERENCES walk_in_clients(id) ON DELETE CASCADE,
  -- Service details:
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,     -- optional link to a service
  service_name TEXT NOT NULL,                                      -- denormalized name (in case service deleted)
  price_cents INTEGER NOT NULL DEFAULT 0,                          -- custom charge for this visit
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_client_type CHECK (
    (client_id IS NOT NULL AND walk_in_client_id IS NULL) OR
    (client_id IS NULL AND walk_in_client_id IS NOT NULL)
  )
);

ALTER TABLE client_service_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stylists manage own service log"
  ON client_service_log FOR ALL
  USING (stylist_id IN (SELECT id FROM stylists WHERE user_id = auth.uid()));
