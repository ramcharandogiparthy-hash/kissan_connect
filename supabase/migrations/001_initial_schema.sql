-- ====================================================================
-- KISANCONNECT PRODUCTION SCHEMA & RLS MIGRATION
-- File: supabase/migrations/001_initial_schema.sql
-- ====================================================================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. HELPER FUNCTIONS & TRIGGERS
-- ====================================================================

-- Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- --------------------------------------------------------------------
-- A. PROFILES TABLE (Linked to auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'staff', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  village TEXT,
  district TEXT,
  state TEXT,
  preferred_language TEXT DEFAULT 'en',
  primary_crop TEXT DEFAULT 'Paddy (Grade A)',
  land_acres NUMERIC DEFAULT 3.5,
  kisan_card_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    phone,
    email,
    role,
    status,
    kisan_card_id
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Kisan Farmer'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', '+91' || floor(random() * 9000000000 + 1000000000)::text),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    'active',
    'KC-AP-2026-' || floor(random() * 9000 + 1000)::text
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- B. PROCUREMENT CENTERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.procurement_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  crowd_level TEXT NOT NULL DEFAULT 'low' CHECK (crowd_level IN ('low', 'moderate', 'high')),
  farmers_waiting INTEGER NOT NULL DEFAULT 0,
  avg_wait_min INTEGER NOT NULL DEFAULT 0,
  capacity_pct INTEGER NOT NULL DEFAULT 0,
  is_best_choice BOOLEAN NOT NULL DEFAULT false,
  map_x NUMERIC NOT NULL DEFAULT 50,
  map_y NUMERIC NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_procurement_centers_updated_at ON public.procurement_centers;
CREATE TRIGGER trg_procurement_centers_updated_at
  BEFORE UPDATE ON public.procurement_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- C. TOKENS (Procurement Appointments)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES public.procurement_centers(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  crop TEXT NOT NULL,
  quantity_quintals NUMERIC NOT NULL CHECK (quantity_quintals > 0),
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  queue_position INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'quality_checked', 'completed', 'cancelled')),
  moisture_pct NUMERIC DEFAULT 14.0,
  express_pass BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_tokens_updated_at ON public.tokens;
CREATE TRIGGER trg_tokens_updated_at
  BEFORE UPDATE ON public.tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- D. PROCUREMENT RECORDS (Verified Grain Batches)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.procurement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  token_id UUID REFERENCES public.tokens(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES public.procurement_centers(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  crop TEXT NOT NULL,
  variety TEXT NOT NULL DEFAULT 'Grade A Common',
  quantity_quintals NUMERIC NOT NULL CHECK (quantity_quintals > 0),
  moisture_pct NUMERIC NOT NULL DEFAULT 14.0,
  trash_pct NUMERIC NOT NULL DEFAULT 1.0,
  quality_grade TEXT NOT NULL DEFAULT 'Grade A',
  rate_per_quintal NUMERIC NOT NULL CHECK (rate_per_quintal > 0),
  gross_amount NUMERIC NOT NULL CHECK (gross_amount >= 0),
  moisture_deduction NUMERIC NOT NULL DEFAULT 0,
  handling_deduction NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  final_payable_amount NUMERIC NOT NULL CHECK (final_payable_amount >= 0),
  verified_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Verified' CHECK (status IN ('Weighed', 'Verified', 'Approved', 'Payment Initiated', 'Payment Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_procurement_records_updated_at ON public.procurement_records;
CREATE TRIGGER trg_procurement_records_updated_at
  BEFORE UPDATE ON public.procurement_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- E. PAYMENTS (Financial Ledger)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT UNIQUE NOT NULL,
  procurement_id UUID UNIQUE REFERENCES public.procurement_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  crop TEXT NOT NULL,
  quantity_quintals NUMERIC NOT NULL,
  rate_per_quintal NUMERIC NOT NULL,
  gross_amount NUMERIC NOT NULL,
  deductions NUMERIC NOT NULL DEFAULT 0,
  final_payable_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'dbt' CHECK (payment_method IN ('dbt', 'upi', 'neft')),
  bank_last4 TEXT NOT NULL DEFAULT '4521',
  center_name TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  provider_reference_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'successful', 'failed', 'on_hold')),
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  gateway_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- F. PAYMENT AUDIT LOGS (Immutable Ledger Audit)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- G. QUALITY CHECKUPS (Digital Lab Certificates)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quality_checkups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  token_id UUID REFERENCES public.tokens(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
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
  decision TEXT NOT NULL DEFAULT 'Approved' CHECK (decision IN ('Approved', 'Conditional Accept', 'Rejected')),
  decision_reason TEXT,
  digital_certificate_id TEXT UNIQUE NOT NULL,
  tested_by TEXT NOT NULL DEFAULT 'Inspector K. Sharma',
  tested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_quality_checkups_updated_at ON public.quality_checkups;
CREATE TRIGGER trg_quality_checkups_updated_at
  BEFORE UPDATE ON public.quality_checkups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- H. MSP PRICES (Government Rates)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.msp_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  msp_rate_per_quintal NUMERIC NOT NULL CHECK (msp_rate_per_quintal > 0),
  previous_year_msp NUMERIC NOT NULL CHECK (previous_year_msp > 0),
  effective_season TEXT NOT NULL DEFAULT 'Kharif 2026-27',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_msp_prices_updated_at ON public.msp_prices;
CREATE TRIGGER trg_msp_prices_updated_at
  BEFORE UPDATE ON public.msp_prices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------------------------------
-- I. SMART QUEUE TOKENS & COUNTERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.smart_queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT UNIQUE NOT NULL,
  center_id UUID NOT NULL REFERENCES public.procurement_centers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'Produce Procurement',
  produce_type TEXT NOT NULL DEFAULT 'Paddy (Grade A)',
  quantity_quintals NUMERIC NOT NULL DEFAULT 40,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'express', 'priority')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'processing', 'completed', 'cancelled')),
  assigned_counter_id UUID,
  estimated_wait_minutes INTEGER NOT NULL DEFAULT 15,
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_smart_queue_tokens_updated_at ON public.smart_queue_tokens;
CREATE TRIGGER trg_smart_queue_tokens_updated_at
  BEFORE UPDATE ON public.smart_queue_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.queue_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES public.procurement_centers(id) ON DELETE CASCADE,
  counter_name TEXT NOT NULL,
  assigned_staff_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  current_token_number TEXT,
  total_served_today INTEGER NOT NULL DEFAULT 0,
  avg_service_time_min INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_queue_counters_updated_at ON public.queue_counters;
CREATE TRIGGER trg_queue_counters_updated_at
  BEFORE UPDATE ON public.queue_counters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON public.tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_center_id ON public.tokens(center_id);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON public.tokens(status);

CREATE INDEX IF NOT EXISTS idx_procurement_user_id ON public.procurement_records(user_id);
CREATE INDEX IF NOT EXISTS idx_procurement_center_id ON public.procurement_records(center_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_procurement_id ON public.payments(procurement_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_payment_id ON public.payment_audit_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_quality_user_id ON public.quality_checkups(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_queue_center_id ON public.smart_queue_tokens(center_id);
CREATE INDEX IF NOT EXISTS idx_smart_queue_status ON public.smart_queue_tokens(status);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checkups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.msp_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_counters ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is staff or admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- PROFILES POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- PROCUREMENT CENTERS POLICIES (Public read, Staff edit)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public select procurement centers" ON public.procurement_centers;
CREATE POLICY "Public select procurement centers" ON public.procurement_centers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage procurement centers" ON public.procurement_centers;
CREATE POLICY "Staff manage procurement centers" ON public.procurement_centers
  FOR ALL USING (public.is_staff_or_admin());

-- --------------------------------------------------------------------
-- TOKENS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Farmers select own tokens" ON public.tokens;
CREATE POLICY "Farmers select own tokens" ON public.tokens
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Farmers insert own tokens" ON public.tokens;
CREATE POLICY "Farmers insert own tokens" ON public.tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Farmers and staff update tokens" ON public.tokens;
CREATE POLICY "Farmers and staff update tokens" ON public.tokens
  FOR UPDATE USING (auth.uid() = user_id OR public.is_staff_or_admin());

-- --------------------------------------------------------------------
-- PROCUREMENT RECORDS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Farmers view own procurement records" ON public.procurement_records;
CREATE POLICY "Farmers view own procurement records" ON public.procurement_records
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage procurement records" ON public.procurement_records;
CREATE POLICY "Staff manage procurement records" ON public.procurement_records
  FOR ALL USING (public.is_staff_or_admin());

-- --------------------------------------------------------------------
-- PAYMENTS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Farmers view own payments" ON public.payments;
CREATE POLICY "Farmers view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage payments" ON public.payments;
CREATE POLICY "Staff manage payments" ON public.payments
  FOR ALL USING (public.is_staff_or_admin());

-- --------------------------------------------------------------------
-- PAYMENT AUDIT LOGS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff view payment audit logs" ON public.payment_audit_logs;
CREATE POLICY "Staff view payment audit logs" ON public.payment_audit_logs
  FOR SELECT USING (public.is_staff_or_admin());

-- --------------------------------------------------------------------
-- QUALITY CHECKUPS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Farmers view own quality checkups" ON public.quality_checkups;
CREATE POLICY "Farmers view own quality checkups" ON public.quality_checkups
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage quality checkups" ON public.quality_checkups;
CREATE POLICY "Staff manage quality checkups" ON public.quality_checkups
  FOR ALL USING (public.is_staff_or_admin());

-- --------------------------------------------------------------------
-- MSP PRICES POLICIES (Public read)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public view MSP prices" ON public.msp_prices;
CREATE POLICY "Public view MSP prices" ON public.msp_prices
  FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- SMART QUEUE TOKENS & COUNTERS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Farmers view own queue tokens" ON public.smart_queue_tokens;
CREATE POLICY "Farmers view own queue tokens" ON public.smart_queue_tokens
  FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Public view queue counters" ON public.queue_counters;
CREATE POLICY "Public view queue counters" ON public.queue_counters
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage queue system" ON public.smart_queue_tokens;
CREATE POLICY "Staff manage queue system" ON public.smart_queue_tokens
  FOR ALL USING (public.is_staff_or_admin());

-- ====================================================================
-- 5. REALTIME PUBLICATION
-- ====================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.profiles, 
      public.tokens, 
      public.procurement_records, 
      public.payments, 
      public.quality_checkups, 
      public.smart_queue_tokens, 
      public.procurement_centers;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
