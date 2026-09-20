-- ====================================================================
-- KISANCONNECT FARMER PROFILES REALTIME SYNCHRONIZATION MIGRATION
-- Table: public.profiles
-- ====================================================================

-- 1. Ensure all farmer profile fields exist on profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_crop TEXT DEFAULT 'Paddy (Grade A)';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS land_acres NUMERIC DEFAULT 3.5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kisan_card_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'farmer123';

-- 2. Enable Row Level Security (RLS) & Set Permissive Access Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update profiles" ON public.profiles;
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete profiles" ON public.profiles;
CREATE POLICY "Public delete profiles" ON public.profiles FOR DELETE USING (true);

-- 3. Enable Supabase Realtime Publication for profiles table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
