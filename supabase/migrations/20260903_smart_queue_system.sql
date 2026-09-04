-- ====================================================================
-- KISANCONNECT SMART QUEUE MANAGEMENT SYSTEM MIGRATION
-- Tables: counters, queue_tokens, queue_events
-- Concurrency Protection: Atomic call_next_queue_token() Function
-- ====================================================================

-- 1. Create COUNTERS Table
CREATE TABLE IF NOT EXISTS public.counters (
  id TEXT PRIMARY KEY,
  center_id TEXT NOT NULL REFERENCES public.procurement_centers(id) ON DELETE CASCADE,
  counter_name TEXT NOT NULL,
  assigned_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_staff_name TEXT NOT NULL DEFAULT 'Unassigned',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BUSY', 'BREAK', 'OFFLINE')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create QUEUE_TOKENS Table
CREATE TABLE IF NOT EXISTS public.queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT NOT NULL,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  center_id TEXT NOT NULL REFERENCES public.procurement_centers(id) ON DELETE CASCADE,
  center_name TEXT NOT NULL,
  counter_id TEXT REFERENCES public.counters(id) ON DELETE SET NULL,
  counter_name TEXT,
  service_type TEXT NOT NULL DEFAULT 'Paddy Procurement',
  produce_type TEXT NOT NULL DEFAULT 'Paddy Grade A',
  quantity NUMERIC NOT NULL DEFAULT 40,
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'SENIOR_CITIZEN', 'SPECIAL_ASSISTANCE', 'APPOINTMENT')),
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN (
    'WAITING', 'CALLED', 'ARRIVED', 'IN_PROGRESS', 'QUALITY_CHECK',
    'PAYMENT_PENDING', 'COMPLETED', 'ON_HOLD', 'SKIPPED', 'CANCELLED', 'EXPIRED'
  )),
  queue_position INTEGER NOT NULL DEFAULT 1,
  estimated_wait_minutes INTEGER NOT NULL DEFAULT 35,
  called_at TIMESTAMPTZ,
  service_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  operating_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(token_number, center_id, operating_date)
);

-- 3. Create QUEUE_EVENTS Audit Table
CREATE TABLE IF NOT EXISTS public.queue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES public.queue_tokens(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL DEFAULT 'System',
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  counter_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_events ENABLE ROW LEVEL SECURITY;

-- Public RLS Policies (Single-tenant app access & Realtime read)
DROP POLICY IF EXISTS "Public select counters" ON public.counters;
CREATE POLICY "Public select counters" ON public.counters FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public manage counters" ON public.counters;
CREATE POLICY "Public manage counters" ON public.counters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select queue_tokens" ON public.queue_tokens;
CREATE POLICY "Public select queue_tokens" ON public.queue_tokens FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public manage queue_tokens" ON public.queue_tokens;
CREATE POLICY "Public manage queue_tokens" ON public.queue_tokens FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public select queue_events" ON public.queue_events;
CREATE POLICY "Public select queue_events" ON public.queue_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public manage queue_events" ON public.queue_events;
CREATE POLICY "Public manage queue_events" ON public.queue_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- ATOMIC CONCURRENCY PROTECTION FUNCTION: call_next_queue_token()
-- Uses FOR UPDATE SKIP LOCKED to prevent double-calling collisions
-- ====================================================================

CREATE OR REPLACE FUNCTION public.call_next_queue_token(
  p_center_id TEXT,
  p_counter_id TEXT,
  p_staff_id UUID DEFAULT NULL,
  p_staff_name TEXT DEFAULT 'Staff Officer'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_token public.queue_tokens%ROWTYPE;
  v_counter_name TEXT;
BEGIN
  -- 1. Fetch counter name
  SELECT counter_name INTO v_counter_name FROM public.counters WHERE id = p_counter_id;
  IF v_counter_name IS NULL THEN
    v_counter_name := 'Counter 1';
  END IF;

  -- 2. Lock & select the next WAITING token atomically (FIFO & Priority order)
  SELECT * INTO v_next_token
  FROM public.queue_tokens
  WHERE center_id = p_center_id
    AND status = 'WAITING'
    AND operating_date = CURRENT_DATE
  ORDER BY 
    CASE priority 
      WHEN 'SPECIAL_ASSISTANCE' THEN 1 
      WHEN 'SENIOR_CITIZEN' THEN 2 
      WHEN 'APPOINTMENT' THEN 3 
      ELSE 4 
    END ASC,
    created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- 3. Check if an eligible token was found
  IF v_next_token.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No waiting farmers in queue for this center.'
    );
  END IF;

  -- 4. Update the called token atomically
  UPDATE public.queue_tokens
  SET status = 'CALLED',
      counter_id = p_counter_id,
      counter_name = v_counter_name,
      called_at = now()
  WHERE id = v_next_token.id;

  -- 5. Update counter status to BUSY
  UPDATE public.counters
  SET status = 'BUSY',
      assigned_staff_name = p_staff_name
  WHERE id = p_counter_id;

  -- 6. Insert Queue Audit Event
  INSERT INTO public.queue_events (token_id, actor_id, actor_name, action, old_status, new_status, counter_id)
  VALUES (v_next_token.id, p_staff_id, p_staff_name, 'TOKEN_CALLED', 'WAITING', 'CALLED', p_counter_id);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Token called successfully.',
    'token', jsonb_build_object(
      'id', v_next_token.id,
      'token_number', v_next_token.token_number,
      'farmer_name', v_next_token.farmer_name,
      'counter_name', v_counter_name,
      'status', 'CALLED'
    )
  );
END;
$$;

-- ====================================================================
-- INITIAL SEED DATA FOR COUNTERS & QUEUE DEMO TOKENS
-- ====================================================================

INSERT INTO public.counters (id, center_id, counter_name, assigned_staff_name, status)
VALUES 
  ('CNT-VJA-1', 'vijayawada', 'Counter 1 (Paddy)', 'Officer S. Rao', 'ACTIVE'),
  ('CNT-VJA-2', 'vijayawada', 'Counter 2 (Paddy)', 'Tech R. Varma', 'ACTIVE'),
  ('CNT-VJA-3', 'vijayawada', 'Counter 3 (Express)', 'Supervisor M. Naidu', 'BREAK'),
  ('CNT-GNT-1', 'guntur', 'Counter 1 (Chilli & Paddy)', 'Officer K. Reddi', 'ACTIVE'),
  ('CNT-GNT-2', 'guntur', 'Counter 2 (Chilli)', 'Officer B. Prasad', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
