-- ====================================================================
-- KISANCONNECT FARMERS TABLE, AUTHENTICATION & REALTIME MIGRATION
-- Table: public.farmers
-- ====================================================================

-- 1. Create FARMERS Table referencing auth.users(id)
CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  village TEXT,
  district TEXT,
  state TEXT,
  farmer_id TEXT UNIQUE,
  primary_crop TEXT DEFAULT 'Paddy (Grade A)',
  land_acres NUMERIC DEFAULT 3.5,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_farmers_auth_user_id ON public.farmers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON public.farmers(phone);
CREATE INDEX IF NOT EXISTS idx_farmers_farmer_id ON public.farmers(farmer_id);

-- 3. Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_farmers_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_update_farmers_updated_at ON public.farmers;
CREATE TRIGGER trg_update_farmers_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW
  EXECUTE FUNCTION update_farmers_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Farmers can read their own profile
DROP POLICY IF EXISTS "Farmers read own profile" ON public.farmers;
CREATE POLICY "Farmers read own profile" ON public.farmers
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Policy 2: Farmers can update only their own profile
DROP POLICY IF EXISTS "Farmers update own profile" ON public.farmers;
CREATE POLICY "Farmers update own profile" ON public.farmers
  FOR UPDATE USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);

-- Policy 3: Farmers can insert their own profile after auth
DROP POLICY IF EXISTS "Farmers insert own profile" ON public.farmers;
CREATE POLICY "Farmers insert own profile" ON public.farmers
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Policy 4: Public read allowed for Staff/Admin portal viewing & directory
DROP POLICY IF EXISTS "Public read farmer directory for staff" ON public.farmers;
CREATE POLICY "Public read farmer directory for staff" ON public.farmers
  FOR SELECT USING (true);

-- Policy 5: Public insert fallback for edge cases
DROP POLICY IF EXISTS "Public insert farmer record" ON public.farmers;
CREATE POLICY "Public insert farmer record" ON public.farmers
  FOR INSERT WITH CHECK (true);

-- Policy 6: Public update fallback for staff operations
DROP POLICY IF EXISTS "Public update farmer record" ON public.farmers;
CREATE POLICY "Public update farmer record" ON public.farmers
  FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Enable Supabase Realtime Publication for farmers table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.farmers;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
