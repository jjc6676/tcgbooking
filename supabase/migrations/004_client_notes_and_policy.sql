-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/zevdjxmnxdinqflhjeaq/sql/new

-- Client can leave a note when booking ("I want to go lighter", etc.)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_notes TEXT;

-- Cancellation policy shown on booking confirmation
ALTER TABLE stylists ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;
