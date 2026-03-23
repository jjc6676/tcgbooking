-- Add pricing / discount columns to appointments
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS final_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS discount_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_note TEXT;
