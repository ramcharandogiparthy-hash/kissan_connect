/*
# KisanConnect — Core Database Schema

Creates the full backend for the KisanConnect AI-powered agricultural procurement platform.

## Tables

1. **farmers** — Farmer profiles (name, crop, contact)
2. **procurement_centers** — Procurement centers with live crowd, capacity, and wait data
3. **tokens** — Digital procurement tokens linked to a farmer + center (boarding-pass style)
4. **queue_entries** — Live queue entries per center (token number, status, position)
5. **notifications** — Slide-in notification cards (reminder, queue, produce, payment)
6. **payments** — Payment records with timeline status and transaction details
7. **platform_stats** — Aggregate platform statistics shown as animated counters
8. **center_stats** — Daily center dashboard stats (farmers, tokens, waiting, completed, quintals, payments)
9. **smart_alerts** — AI-generated alerts with recommendations (high crowd, redirect, etc.)
10. **crop_distribution** — Crop-wise procurement breakdown for donut chart
11. **week_volume** — Weekly procurement volume + waiting time for bar charts
12. **satisfaction_ratings** — Farmer satisfaction score distribution
13. **ai_recommendations** — AI slot optimization recommendations (selected vs recommended slot)

## Security

This is a single-tenant demo app with NO sign-in screen. All policies use
`TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because the
data is intentionally public/shared for demonstration purposes.

## Notes

1. All tables have RLS enabled.
2. 4 separate CRUD policies per table (select/insert/update/delete).
3. Timestamps default to `now()`.
4. UUIDs default to `gen_random_uuid()`.
*/

-- ============ farmers ============
CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  crop text NOT NULL DEFAULT 'Paddy',
  quantity_quintals integer NOT NULL DEFAULT 40,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_farmers" ON farmers;
CREATE POLICY "anon_select_farmers" ON farmers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_farmers" ON farmers;
CREATE POLICY "anon_insert_farmers" ON farmers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_farmers" ON farmers;
CREATE POLICY "anon_update_farmers" ON farmers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_farmers" ON farmers;
CREATE POLICY "anon_delete_farmers" ON farmers FOR DELETE TO anon, authenticated USING (true);

-- ============ procurement_centers ============
CREATE TABLE IF NOT EXISTS procurement_centers (
  id text PRIMARY KEY,
  name text NOT NULL,
  district text NOT NULL,
  crowd text NOT NULL DEFAULT 'low', -- low | moderate | high
  farmers_waiting integer NOT NULL DEFAULT 0,
  avg_wait_min integer NOT NULL DEFAULT 0,
  capacity_pct integer NOT NULL DEFAULT 0,
  best_choice boolean NOT NULL DEFAULT false,
  map_x numeric NOT NULL DEFAULT 50,
  map_y numeric NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE procurement_centers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_centers" ON procurement_centers;
CREATE POLICY "anon_select_centers" ON procurement_centers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_centers" ON procurement_centers;
CREATE POLICY "anon_insert_centers" ON procurement_centers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_centers" ON procurement_centers;
CREATE POLICY "anon_update_centers" ON procurement_centers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_centers" ON procurement_centers;
CREATE POLICY "anon_delete_centers" ON procurement_centers FOR DELETE TO anon, authenticated USING (true);

-- ============ tokens ============
CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number text NOT NULL,
  farmer_name text NOT NULL,
  crop text NOT NULL,
  quantity_quintals integer NOT NULL,
  center_name text NOT NULL,
  appointment_date text NOT NULL,
  appointment_time text NOT NULL,
  queue_position integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'confirmed', -- confirmed | processing | completed
  farmer_id uuid REFERENCES farmers(id) ON DELETE SET NULL,
  center_id text REFERENCES procurement_centers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tokens" ON tokens;
CREATE POLICY "anon_select_tokens" ON tokens FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tokens" ON tokens;
CREATE POLICY "anon_insert_tokens" ON tokens FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tokens" ON tokens;
CREATE POLICY "anon_update_tokens" ON tokens FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tokens" ON tokens;
CREATE POLICY "anon_delete_tokens" ON tokens FOR DELETE TO anon, authenticated USING (true);

-- ============ queue_entries ============
CREATE TABLE IF NOT EXISTS queue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number text NOT NULL,
  center_id text REFERENCES procurement_centers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'waiting', -- processing | waiting
  is_you boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_queue" ON queue_entries;
CREATE POLICY "anon_select_queue" ON queue_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_queue" ON queue_entries;
CREATE POLICY "anon_insert_queue" ON queue_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_queue" ON queue_entries;
CREATE POLICY "anon_update_queue" ON queue_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_queue" ON queue_entries;
CREATE POLICY "anon_delete_queue" ON queue_entries FOR DELETE TO anon, authenticated USING (true);

-- ============ notifications ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- reminder | queue | produce | payment
  title text NOT NULL,
  body text NOT NULL,
  display_time text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- ============ payments ============
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  crop text NOT NULL,
  quantity_quintals integer NOT NULL,
  center_name text NOT NULL,
  rate_per_quintal numeric NOT NULL DEFAULT 2310,
  transaction_id text NOT NULL,
  bank_last4 text NOT NULL DEFAULT '4521',
  status text NOT NULL DEFAULT 'processed', -- processed | pending | failed
  timeline_step integer NOT NULL DEFAULT 4, -- how many timeline steps are done (1-4)
  token_id uuid REFERENCES tokens(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE TO anon, authenticated USING (true);

-- ============ platform_stats ============
CREATE TABLE IF NOT EXISTS platform_stats (
  id text PRIMARY KEY DEFAULT 'main',
  farmers_connected integer NOT NULL DEFAULT 25000,
  procurement_centers integer NOT NULL DEFAULT 150,
  quintals_procured integer NOT NULL DEFAULT 1200000,
  payments_processed_cr integer NOT NULL DEFAULT 45,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_platform_stats" ON platform_stats;
CREATE POLICY "anon_select_platform_stats" ON platform_stats FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_platform_stats" ON platform_stats;
CREATE POLICY "anon_insert_platform_stats" ON platform_stats FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_platform_stats" ON platform_stats;
CREATE POLICY "anon_update_platform_stats" ON platform_stats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_platform_stats" ON platform_stats;
CREATE POLICY "anon_delete_platform_stats" ON platform_stats FOR DELETE TO anon, authenticated USING (true);

-- ============ center_stats ============
CREATE TABLE IF NOT EXISTS center_stats (
  id text PRIMARY KEY DEFAULT 'main',
  farmers_today integer NOT NULL DEFAULT 128,
  tokens integer NOT NULL DEFAULT 142,
  waiting integer NOT NULL DEFAULT 41,
  completed integer NOT NULL DEFAULT 87,
  quintals integer NOT NULL DEFAULT 384,
  payments_lakh numeric NOT NULL DEFAULT 8.4,
  capacity_pct integer NOT NULL DEFAULT 72,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE center_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_center_stats" ON center_stats;
CREATE POLICY "anon_select_center_stats" ON center_stats FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_center_stats" ON center_stats;
CREATE POLICY "anon_insert_center_stats" ON center_stats FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_center_stats" ON center_stats;
CREATE POLICY "anon_update_center_stats" ON center_stats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_center_stats" ON center_stats;
CREATE POLICY "anon_delete_center_stats" ON center_stats FOR DELETE TO anon, authenticated USING (true);

-- ============ smart_alerts ============
CREATE TABLE IF NOT EXISTS smart_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL DEFAULT 'high', -- high | medium | low
  title text NOT NULL,
  body text NOT NULL,
  recommendation text NOT NULL,
  center_name text NOT NULL,
  redirect_count integer NOT NULL DEFAULT 0,
  redirect_center text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alerts" ON smart_alerts;
CREATE POLICY "anon_select_alerts" ON smart_alerts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_alerts" ON smart_alerts;
CREATE POLICY "anon_insert_alerts" ON smart_alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_alerts" ON smart_alerts;
CREATE POLICY "anon_update_alerts" ON smart_alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_alerts" ON smart_alerts;
CREATE POLICY "anon_delete_alerts" ON smart_alerts FOR DELETE TO anon, authenticated USING (true);

-- ============ crop_distribution ============
CREATE TABLE IF NOT EXISTS crop_distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop text NOT NULL UNIQUE,
  pct integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#22c55e'
);

ALTER TABLE crop_distribution ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_crop_dist" ON crop_distribution;
CREATE POLICY "anon_select_crop_dist" ON crop_distribution FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_crop_dist" ON crop_distribution;
CREATE POLICY "anon_insert_crop_dist" ON crop_distribution FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_crop_dist" ON crop_distribution;
CREATE POLICY "anon_update_crop_dist" ON crop_distribution FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_crop_dist" ON crop_distribution;
CREATE POLICY "anon_delete_crop_dist" ON crop_distribution FOR DELETE TO anon, authenticated USING (true);

-- ============ week_volume ============
CREATE TABLE IF NOT EXISTS week_volume (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL UNIQUE,
  volume integer NOT NULL DEFAULT 0,
  wait_min integer NOT NULL DEFAULT 0
);

ALTER TABLE week_volume ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_week_volume" ON week_volume;
CREATE POLICY "anon_select_week_volume" ON week_volume FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_week_volume" ON week_volume;
CREATE POLICY "anon_insert_week_volume" ON week_volume FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_week_volume" ON week_volume;
CREATE POLICY "anon_update_week_volume" ON week_volume FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_week_volume" ON week_volume;
CREATE POLICY "anon_delete_week_volume" ON week_volume FOR DELETE TO anon, authenticated USING (true);

-- ============ satisfaction_ratings ============
CREATE TABLE IF NOT EXISTS satisfaction_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  pct integer NOT NULL DEFAULT 0,
  total_ratings integer NOT NULL DEFAULT 2847,
  average_rating numeric NOT NULL DEFAULT 4.7
);

ALTER TABLE satisfaction_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_satisfaction" ON satisfaction_ratings;
CREATE POLICY "anon_select_satisfaction" ON satisfaction_ratings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_satisfaction" ON satisfaction_ratings;
CREATE POLICY "anon_insert_satisfaction" ON satisfaction_ratings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_satisfaction" ON satisfaction_ratings;
CREATE POLICY "anon_update_satisfaction" ON satisfaction_ratings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_satisfaction" ON satisfaction_ratings;
CREATE POLICY "anon_delete_satisfaction" ON satisfaction_ratings FOR DELETE TO anon, authenticated USING (true);

-- ============ ai_recommendations ============
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  selected_slot text NOT NULL,
  selected_wait_min integer NOT NULL,
  recommended_slot text NOT NULL,
  recommended_wait_min integer NOT NULL,
  time_saved_min integer NOT NULL,
  farmer_name text NOT NULL DEFAULT 'Ravi Kumar',
  center_name text NOT NULL DEFAULT 'Vijayawada',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ai_rec" ON ai_recommendations;
CREATE POLICY "anon_select_ai_rec" ON ai_recommendations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ai_rec" ON ai_recommendations;
CREATE POLICY "anon_insert_ai_rec" ON ai_recommendations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ai_rec" ON ai_recommendations;
CREATE POLICY "anon_update_ai_rec" ON ai_recommendations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ai_rec" ON ai_recommendations;
CREATE POLICY "anon_delete_ai_rec" ON ai_recommendations FOR DELETE TO anon, authenticated USING (true);
