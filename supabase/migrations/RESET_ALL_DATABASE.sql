-- ====================================================================
-- KISANCONNECT MASTER DATABASE RESET & SEED MIGRATION
-- Run this in the Supabase SQL Editor to wipe and reset all tables
-- ====================================================================

-- 1. DROP ALL EXISTING TABLES & TRIGGERS (CLEAN RESET)
DROP TABLE IF EXISTS public.queue_event_logs CASCADE;
DROP TABLE IF EXISTS public.queue_counters CASCADE;
DROP TABLE IF EXISTS public.smart_queue_tokens CASCADE;
DROP TABLE IF EXISTS public.msp_prices CASCADE;
DROP TABLE IF EXISTS public.staff_requests CASCADE;
DROP TABLE IF EXISTS public.quality_checkups CASCADE;
DROP TABLE IF EXISTS public.payment_audit_logs CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.farmer_payment_methods CASCADE;
DROP TABLE IF EXISTS public.procurement_records CASCADE;
DROP TABLE IF EXISTS public.ai_recommendations CASCADE;
DROP TABLE IF EXISTS public.satisfaction_ratings CASCADE;
DROP TABLE IF EXISTS public.week_volume CASCADE;
DROP TABLE IF EXISTS public.crop_distribution CASCADE;
DROP TABLE IF EXISTS public.smart_alerts CASCADE;
DROP TABLE IF EXISTS public.center_stats CASCADE;
DROP TABLE IF EXISTS public.platform_stats CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.queue_entries CASCADE;
DROP TABLE IF EXISTS public.tokens CASCADE;
DROP TABLE IF EXISTS public.procurement_centers CASCADE;
DROP TABLE IF EXISTS public.farmer_profiles CASCADE;
DROP TABLE IF EXISTS public.farmers CASCADE;

-- 2. FARMERS TABLE (Auth & Profiles)
CREATE TABLE public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  village TEXT DEFAULT 'Vijayawada',
  district TEXT DEFAULT 'NTR District',
  state TEXT DEFAULT 'Andhra Pradesh',
  farmer_id TEXT UNIQUE DEFAULT 'KC-AP-2026-8942',
  primary_crop TEXT DEFAULT 'Paddy (Grade A)',
  land_acres NUMERIC DEFAULT 3.5,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FARMER PROFILES TABLE (App User Sync)
CREATE TABLE public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'farmer',
  status TEXT NOT NULL DEFAULT 'active',
  village TEXT,
  district TEXT,
  state TEXT,
  preferred_language TEXT DEFAULT 'en',
  primary_crop TEXT DEFAULT 'Paddy (Grade A)',
  land_acres NUMERIC DEFAULT 3.5,
  kisan_card_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PROCUREMENT CENTERS
CREATE TABLE public.procurement_centers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  crowd TEXT NOT NULL DEFAULT 'low',
  farmers_waiting INTEGER NOT NULL DEFAULT 0,
  avg_wait_min INTEGER NOT NULL DEFAULT 0,
  capacity_pct INTEGER NOT NULL DEFAULT 0,
  best_choice BOOLEAN NOT NULL DEFAULT false,
  map_x NUMERIC NOT NULL DEFAULT 50,
  map_y NUMERIC NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TOKENS
CREATE TABLE public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  crop TEXT NOT NULL,
  quantity_quintals INTEGER NOT NULL,
  center_name TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  queue_position INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed',
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
  center_id TEXT REFERENCES public.procurement_centers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PROCUREMENT RECORDS
CREATE TABLE public.procurement_records (
  id TEXT PRIMARY KEY,
  token_id TEXT NOT NULL,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  center_name TEXT NOT NULL,
  crop TEXT NOT NULL,
  variety TEXT NOT NULL DEFAULT 'Grade A Common',
  quantity_quintals NUMERIC NOT NULL,
  moisture_pct NUMERIC NOT NULL DEFAULT 14.0,
  trash_pct NUMERIC NOT NULL DEFAULT 1.0,
  quality_grade TEXT NOT NULL DEFAULT 'Grade A',
  rate_per_quintal NUMERIC NOT NULL DEFAULT 2300,
  gross_amount NUMERIC NOT NULL,
  moisture_deduction NUMERIC NOT NULL DEFAULT 0,
  handling_deduction NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  final_payable_amount NUMERIC NOT NULL,
  verified_by TEXT NOT NULL DEFAULT 'Officer S. Rao',
  verified_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'Verified',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PAYMENTS
CREATE TABLE public.payments (
  id TEXT PRIMARY KEY,
  procurement_id TEXT REFERENCES public.procurement_records(id) ON DELETE SET NULL,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  crop TEXT NOT NULL,
  quantity_quintals NUMERIC NOT NULL,
  rate_per_quintal NUMERIC NOT NULL DEFAULT 2300,
  gross_amount NUMERIC NOT NULL,
  deductions NUMERIC NOT NULL DEFAULT 0,
  final_payable_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'dbt',
  bank_last4 TEXT NOT NULL DEFAULT '4521',
  center_name TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  provider_reference_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  gateway_signature TEXT,
  refund_id TEXT,
  refund_amount NUMERIC DEFAULT 0,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. PAYMENT AUDIT LOGS
CREATE TABLE public.payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 9. QUALITY CHECKUPS
CREATE TABLE public.quality_checkups (
  id TEXT PRIMARY KEY,
  token_id TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  crop TEXT NOT NULL,
  quantity_quintals NUMERIC NOT NULL,
  center_name TEXT NOT NULL,
  moisture_pct NUMERIC NOT NULL DEFAULT 14.0,
  foreign_matter_pct NUMERIC NOT NULL DEFAULT 1.0,
  damaged_grains_pct NUMERIC NOT NULL DEFAULT 0.5,
  shriveled_grains_pct NUMERIC NOT NULL DEFAULT 1.0,
  admixture_pct NUMERIC NOT NULL DEFAULT 0.5,
  color_appearance TEXT DEFAULT 'Natural Golden',
  quality_grade TEXT NOT NULL DEFAULT 'Grade A',
  quality_score NUMERIC NOT NULL DEFAULT 92.5,
  decision TEXT NOT NULL DEFAULT 'Approved',
  decision_reason TEXT,
  digital_certificate_id TEXT UNIQUE NOT NULL,
  tested_by TEXT NOT NULL DEFAULT 'Inspector K. Sharma',
  tested_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'Verified',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. MSP PRICES
CREATE TABLE public.msp_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  category TEXT NOT NULL,
  msp_rate_per_quintal NUMERIC NOT NULL,
  previous_year_msp NUMERIC NOT NULL,
  effective_season TEXT NOT NULL DEFAULT 'Kharif 2026-27',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. SMART QUEUE SYSTEM
CREATE TABLE public.smart_queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT UNIQUE NOT NULL,
  center_id TEXT NOT NULL,
  center_name TEXT NOT NULL,
  farmer_name TEXT NOT NULL DEFAULT 'Ravi Kumar',
  farmer_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  service_type TEXT NOT NULL DEFAULT 'Produce Procurement',
  produce_type TEXT NOT NULL DEFAULT 'Paddy (Grade A)',
  quantity_quintals NUMERIC NOT NULL DEFAULT 40,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'waiting',
  assigned_counter_id TEXT,
  estimated_wait_minutes INTEGER NOT NULL DEFAULT 15,
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.queue_counters (
  id TEXT PRIMARY KEY,
  center_id TEXT NOT NULL,
  counter_name TEXT NOT NULL,
  assigned_staff_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_token_number TEXT,
  total_served_today INTEGER NOT NULL DEFAULT 0,
  avg_service_time_min INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ENABLE ROW LEVEL SECURITY & PUBLIC POLICIES FOR ALL TABLES
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "public_select_%I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "public_select_%I" ON public.%I FOR SELECT USING (true);', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "public_insert_%I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "public_insert_%I" ON public.%I FOR INSERT WITH CHECK (true);', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "public_update_%I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "public_update_%I" ON public.%I FOR UPDATE USING (true) WITH CHECK (true);', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "public_delete_%I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "public_delete_%I" ON public.%I FOR DELETE USING (true);', tbl, tbl);
  END LOOP;
END $$;

-- 13. ENABLE SUPABASE REALTIME PUBLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.farmers, public.farmer_profiles, public.tokens, public.procurement_records, public.payments, public.quality_checkups, public.smart_queue_tokens, public.procurement_centers;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 14. SEED INITIAL DATA
INSERT INTO public.farmers (id, phone, full_name, village, district, state, farmer_id, primary_crop, land_acres)
VALUES ('f1000000-0000-0000-0000-000000000101', '+91 98765 43210', 'Ravi Kumar', 'Vijayawada Rural', 'NTR District', 'Andhra Pradesh', 'KC-AP-2026-8942', 'Paddy (Grade A)', 4.5);

INSERT INTO public.procurement_centers (id, name, district, crowd, farmers_waiting, avg_wait_min, capacity_pct, best_choice, map_x, map_y) VALUES
('c-vja', 'Vijayawada Procurement Center', 'NTR District', 'low', 12, 18, 42, true, 48, 52),
('c-gnt', 'Guntur Main Procurement Yard', 'Guntur', 'high', 45, 65, 88, false, 35, 68),
('c-tnl', 'Tenali Agricultural Market', 'Guntur', 'moderate', 24, 32, 60, false, 62, 75);

INSERT INTO public.msp_prices (crop_name, category, msp_rate_per_quintal, previous_year_msp, effective_season) VALUES
('Paddy (Grade A)', 'Cereals', 2300, 2203, 'Kharif 2026-27'),
('Paddy (Common)', 'Cereals', 2280, 2183, 'Kharif 2026-27'),
('Cotton (Long Staple)', 'Commercial Crops', 7521, 7020, 'Kharif 2026-27'),
('Cotton (Medium Staple)', 'Commercial Crops', 7121, 6620, 'Kharif 2026-27'),
('Maize (Yellow)', 'Cereals', 2225, 2090, 'Kharif 2026-27'),
('Groundnut', 'Oilseeds', 6783, 6377, 'Kharif 2026-27'),
('Soyabean (Yellow)', 'Oilseeds', 4892, 4600, 'Kharif 2026-27');

INSERT INTO public.procurement_records (id, token_id, farmer_name, farmer_phone, center_name, crop, variety, quantity_quintals, moisture_pct, quality_grade, rate_per_quintal, gross_amount, final_payable_amount, status) VALUES
('PROC-2026-8942', 'VJA-104', 'Ravi Kumar', '+91 98765 43210', 'Vijayawada Procurement Center', 'Paddy (Grade A)', 'Grade A Common', 40, 14.0, 'Grade A Super', 2300, 92000, 92000, 'Verified'),
('PROC-2026-7411', 'GNT-101', 'Ravi Kumar', '+91 98765 43210', 'Guntur Main Procurement Yard', 'Cotton (Medium Staple)', 'Medium Staple Premium', 25, 8.5, 'Grade A', 7125, 178125, 176625, 'Approved');

INSERT INTO public.payments (id, procurement_id, farmer_name, farmer_phone, crop, quantity_quintals, rate_per_quintal, gross_amount, deductions, final_payable_amount, payment_method, bank_last4, center_name, idempotency_key, provider_reference_id, status) VALUES
('PAY-2026-8942', 'PROC-2026-8942', 'Ravi Kumar', '+91 98765 43210', 'Paddy (Grade A)', 40, 2300, 92000, 0, 92000, 'dbt', '4521', 'Vijayawada Procurement Center', 'IDEM-KC-P8942-92000', 'SBIN202608284592', 'pending'),
('PAY-2026-7411', 'PROC-2026-7411', 'Ravi Kumar', '+91 98765 43210', 'Cotton (Medium Staple)', 25, 7125, 178125, 1500, 176625, 'upi', '4521', 'Guntur Main Procurement Yard', 'IDEM-KC-C7411-176625', 'UPI/20260829/849201/SUCCESS', 'processing');

INSERT INTO public.quality_checkups (id, token_id, farmer_name, farmer_phone, crop, quantity_quintals, center_name, moisture_pct, foreign_matter_pct, damaged_grains_pct, quality_grade, quality_score, decision, digital_certificate_id) VALUES
('QC-2026-8942', 'VJA-104', 'Ravi Kumar', '+91 98765 43210', 'Paddy (Grade A)', 40, 'Vijayawada Procurement Center', 14.0, 0.8, 0.4, 'Grade A Super', 94.5, 'Approved', 'CERT-KC-2026-98421');

-- MASTER RESET COMPLETE!
