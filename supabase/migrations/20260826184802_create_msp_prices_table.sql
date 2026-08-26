/*
# KisanConnect — Minimum Support Price (MSP) Table

Adds a new table to store government Minimum Support Prices for various crops,
enabling farmers to see guaranteed prices and compare them with market rates.

## New Table: `msp_prices`

- `id` (uuid, primary key)
- `crop` (text, not null, unique) — crop name e.g. "Paddy"
- `variety` (text) — variety/grade e.g. "Common", "Grade A"
- `msp_per_quintal` (integer, not null) — government guaranteed price per quintal
- `market_price_per_quintal` (integer) — current market average price per quintal
- `unit` (text, default 'Quintal') — pricing unit
- `season` (text) — e.g. "Kharif 2026", "Rabi 2026"
- `change_pct` (numeric) — percentage change from previous season (positive = increase)
- `is_active` (boolean, default true) — whether this MSP is currently in effect
- `created_at` (timestamptz, default now())

## Security

Single-tenant demo app, no sign-in required for reading MSP data.
Policies use `TO anon, authenticated` with `USING (true)` — data is intentionally public.

## Seed Data

8 major crops with realistic MSP values for Kharif/Rabi 2026 season:
Paddy, Cotton, Maize, Groundnut, Wheat, Soybean, Tur (Arhar), Sunflower
*/

CREATE TABLE IF NOT EXISTS msp_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop text NOT NULL UNIQUE,
  variety text NOT NULL DEFAULT 'Common',
  msp_per_quintal integer NOT NULL,
  market_price_per_quintal integer,
  unit text NOT NULL DEFAULT 'Quintal',
  season text NOT NULL DEFAULT 'Kharif 2026',
  change_pct numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE msp_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_msp" ON msp_prices;
CREATE POLICY "anon_select_msp" ON msp_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_msp" ON msp_prices;
CREATE POLICY "anon_insert_msp" ON msp_prices FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_msp" ON msp_prices;
CREATE POLICY "anon_update_msp" ON msp_prices FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_msp" ON msp_prices;
CREATE POLICY "anon_delete_msp" ON msp_prices FOR DELETE
  TO anon, authenticated USING (true);

-- Seed data with realistic Indian MSP values (per quintal)
INSERT INTO msp_prices (crop, variety, msp_per_quintal, market_price_per_quintal, season, change_pct) VALUES
  ('Paddy', 'Common', 2300, 2310, 'Kharif 2026', 5.0),
  ('Cotton', 'Medium Staple', 7125, 7200, 'Kharif 2026', 3.7),
  ('Maize', 'Yellow', 2250, 2180, 'Kharif 2026', 4.7),
  ('Groundnut', 'Common', 6780, 6900, 'Kharif 2026', 2.0),
  ('Wheat', 'Grade A', 2275, 2300, 'Rabi 2026', 2.3),
  ('Soybean', 'Yellow', 4980, 5050, 'Kharif 2026', 3.3),
  ('Tur (Arhar)', 'Common', 7525, 7600, 'Kharif 2026', 4.9),
  ('Sunflower', 'Common', 7980, 8100, 'Kharif 2026', 1.9)
ON CONFLICT (crop) DO UPDATE SET
  variety = EXCLUDED.variety,
  msp_per_quintal = EXCLUDED.msp_per_quintal,
  market_price_per_quintal = EXCLUDED.market_price_per_quintal,
  season = EXCLUDED.season,
  change_pct = EXCLUDED.change_pct;
