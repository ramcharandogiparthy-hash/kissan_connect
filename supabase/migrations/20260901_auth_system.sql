-- ====================================================================
-- KISANCONNECT AUTHENTICATION & AUTHORIZATION DATABASE MIGRATION
-- Tables: profiles, staff_requests, staff_permissions, system_audit_logs
-- Security: Row Level Security (RLS) & Triggers
-- ====================================================================

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'staff', 'admin')),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'approved', 'rejected', 'suspended')),
  village TEXT,
  district TEXT,
  state TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(phone),
  UNIQUE(email)
);

-- 2. Create STAFF_REQUESTS Table
CREATE TABLE IF NOT EXISTS public.staff_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  official_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  staff_id TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  procurement_center TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create STAFF_PERMISSIONS Table
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL CHECK (permission_key IN (
    'quality_check',
    'weighing',
    'procurement_management',
    'payment_verification',
    'transport_management',
    'complaint_management',
    'farmer_management',
    'analytics_view'
  )),
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, permission_key)
);

-- 4. Create SYSTEM_AUDIT_LOGS Table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public read active farmer profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins full access to profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin' AND status IN ('active', 'approved')
    )
  );

-- Staff Requests Policies
CREATE POLICY "Staff view own registration request" ON public.staff_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins full access to staff_requests" ON public.staff_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin' AND status IN ('active', 'approved')
    )
  );

-- Staff Permissions Policies
CREATE POLICY "Staff read own permissions" ON public.staff_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage permissions" ON public.staff_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin' AND status IN ('active', 'approved')
    )
  );

-- System Audit Logs Policies
CREATE POLICY "Admins read audit logs" ON public.system_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin' AND status IN ('active', 'approved')
    )
  );

-- ====================================================================
-- INITIAL SEED DATA FOR DEMO ROLES (Farmer, Staff, Admin)
-- ====================================================================

-- Insert Demo Admin Profile if not exists
INSERT INTO public.profiles (id, full_name, email, role, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'KisanConnect Master Admin', 'admin@kisanconnect.com', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert Demo Approved Staff Profile if not exists
INSERT INTO public.profiles (id, full_name, email, phone, role, status)
VALUES ('00000000-0000-0000-0000-000000000002', 'Officer S. Rao', 'staff@kisanconnect.com', '+91 94401 99887', 'staff', 'approved')
ON CONFLICT (email) DO NOTHING;

-- Insert Demo Farmer Profile if not exists
INSERT INTO public.profiles (id, full_name, phone, role, status, village, district, state)
VALUES ('00000000-0000-0000-0000-000000000003', 'Ravi Kumar', '+91 98765 43210', 'farmer', 'active', 'Kankipadu', 'Krishna', 'Andhra Pradesh')
ON CONFLICT (phone) DO NOTHING;
