-- ====================================================================
-- KISANCONNECT PROCUREMENT JOURNEY & MILESTONES MIGRATION
-- Enhances queue_tokens and procurement_records with 13-stage timestamps
-- Enables Supabase Realtime subscriptions and RLS policies for tracking
-- ====================================================================

-- 1. Add tracking timestamps and milestone data to queue_tokens
ALTER TABLE public.queue_tokens
  ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS quality_score NUMERIC DEFAULT 92,
  ADD COLUMN IF NOT EXISTS quality_grade TEXT DEFAULT 'Grade A',
  ADD COLUMN IF NOT EXISTS moisture_pct NUMERIC DEFAULT 14.0,
  ADD COLUMN IF NOT EXISTS trash_pct NUMERIC DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS damaged_grains_pct NUMERIC DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS quality_decision TEXT DEFAULT 'ACCEPTED',
  ADD COLUMN IF NOT EXISTS quality_remarks TEXT DEFAULT 'Grain quality complies with FCI standards',
  ADD COLUMN IF NOT EXISTS quality_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gross_weight_kg NUMERIC DEFAULT 4000,
  ADD COLUMN IF NOT EXISTS tare_weight_kg NUMERIC DEFAULT 120,
  ADD COLUMN IF NOT EXISTS net_weight_kg NUMERIC DEFAULT 3880,
  ADD COLUMN IF NOT EXISTS weighing_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rate_per_quintal NUMERIC DEFAULT 2300,
  ADD COLUMN IF NOT EXISTS deductions_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_payable_amount NUMERIC DEFAULT 89240,
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS approved_by TEXT DEFAULT 'Officer S. Rao',
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS payment_reference_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- 2. Add tracking timestamps to procurement_records
ALTER TABLE public.procurement_records
  ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS token_number TEXT,
  ADD COLUMN IF NOT EXISTS queue_position INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS gross_weight_kg NUMERIC DEFAULT 4000,
  ADD COLUMN IF NOT EXISTS tare_weight_kg NUMERIC DEFAULT 120,
  ADD COLUMN IF NOT EXISTS net_weight_kg NUMERIC DEFAULT 3880,
  ADD COLUMN IF NOT EXISTS weighing_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS quality_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by TEXT DEFAULT 'Officer S. Rao',
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_reference_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ;

-- 3. Enable RLS Policies for procurement tracking (Public single-tenant / authenticated read)
DROP POLICY IF EXISTS "Public select queue_tokens_journey" ON public.queue_tokens;
CREATE POLICY "Public select queue_tokens_journey" ON public.queue_tokens FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public update queue_tokens_journey" ON public.queue_tokens;
CREATE POLICY "Public update queue_tokens_journey" ON public.queue_tokens FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Enable Supabase Realtime for live queue & status tracking
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tokens, public.procurement_records, public.payments, public.queue_events;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore if tables already in publication
    NULL;
END $$;
