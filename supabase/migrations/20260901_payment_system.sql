/*
# KisanConnect — Farmer Payment System Database Schema

Creates tables for secure farmer payouts, procurement verification, payment methods, and append-only audit logging.

## Tables Created:
1. `procurement_records` - Verified harvest batches, quantity, moisture %, grade, gross amount, itemized deductions, net payable.
2. `farmer_payment_methods` - Masked payment credentials (DBT/UPI/Bank) with Aadhaar NPCI seeding status.
3. `payments` - Core payout transaction ledger with idempotency keys, statuses, and UTR references.
4. `payment_audit_logs` - Append-only security audit trail for all payment actions.
*/

-- ============ procurement_records ============
CREATE TABLE IF NOT EXISTS procurement_records (
  id text PRIMARY KEY, -- e.g. 'PROC-2026-8942'
  token_id text NOT NULL,
  farmer_id uuid REFERENCES farmers(id) ON DELETE SET NULL,
  farmer_name text NOT NULL,
  farmer_phone text NOT NULL,
  center_name text NOT NULL,
  crop text NOT NULL,
  variety text NOT NULL DEFAULT 'Grade A Common',
  quantity_quintals numeric NOT NULL,
  moisture_pct numeric NOT NULL DEFAULT 14.0,
  trash_pct numeric NOT NULL DEFAULT 1.0,
  quality_grade text NOT NULL DEFAULT 'Grade A',
  rate_per_quintal numeric NOT NULL DEFAULT 2300,
  gross_amount numeric NOT NULL,
  moisture_deduction numeric NOT NULL DEFAULT 0,
  handling_deduction numeric NOT NULL DEFAULT 0,
  total_deductions numeric NOT NULL DEFAULT 0,
  final_payable_amount numeric NOT NULL,
  verified_by text NOT NULL DEFAULT 'Officer S. Rao',
  verified_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'Verified', -- Weighed | Verified | Approved | Payment Initiated | Payment Completed
  created_at timestamptz DEFAULT now()
);

ALTER TABLE procurement_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_procurements" ON procurement_records;
CREATE POLICY "anon_select_procurements" ON procurement_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_procurements" ON procurement_records;
CREATE POLICY "anon_insert_procurements" ON procurement_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_procurements" ON procurement_records;
CREATE POLICY "anon_update_procurements" ON procurement_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_procurements" ON procurement_records;
CREATE POLICY "anon_delete_procurements" ON procurement_records FOR DELETE TO anon, authenticated USING (true);

-- ============ farmer_payment_methods ============
CREATE TABLE IF NOT EXISTS farmer_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name text NOT NULL,
  farmer_phone text NOT NULL,
  method_type text NOT NULL DEFAULT 'dbt', -- dbt | upi | neft
  bank_name text NOT NULL DEFAULT 'State Bank of India',
  account_last4 text NOT NULL DEFAULT '4521',
  ifsc_code text NOT NULL DEFAULT 'SBIN0001248',
  upi_id_masked text DEFAULT 'r****@ybl',
  aadhaar_last4 text NOT NULL DEFAULT '8849',
  npci_status text NOT NULL DEFAULT 'Seeded', -- Seeded | Pending | Failed
  is_verified boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE farmer_payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payment_methods" ON farmer_payment_methods;
CREATE POLICY "anon_select_payment_methods" ON farmer_payment_methods FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payment_methods" ON farmer_payment_methods;
CREATE POLICY "anon_insert_payment_methods" ON farmer_payment_methods FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payment_methods" ON farmer_payment_methods;
CREATE POLICY "anon_update_payment_methods" ON farmer_payment_methods FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payment_methods" ON farmer_payment_methods;
CREATE POLICY "anon_delete_payment_methods" ON farmer_payment_methods FOR DELETE TO anon, authenticated USING (true);

-- ============ payments ============
CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY, -- e.g. 'PAY-2026-9412'
  procurement_id text REFERENCES procurement_records(id) ON DELETE SET NULL,
  farmer_name text NOT NULL,
  farmer_phone text NOT NULL DEFAULT '+91 98765 43210',
  crop text NOT NULL,
  quantity_quintals numeric NOT NULL,
  rate_per_quintal numeric NOT NULL DEFAULT 2300,
  gross_amount numeric NOT NULL,
  deductions numeric NOT NULL DEFAULT 0,
  final_payable_amount numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'dbt', -- dbt | upi | neft
  bank_last4 text NOT NULL DEFAULT '4521',
  center_name text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  provider_reference_id text NOT NULL, -- e.g. UTR / Txn Ref
  status text NOT NULL DEFAULT 'pending', -- pending | processing | successful | failed | on_hold
  failure_reason text,
  retry_count integer NOT NULL DEFAULT 0,
  approved_by text,
  approved_at timestamptz,
  processed_at timestamptz,
  completed_at timestamptz,
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

-- ============ payment_audit_logs ============
CREATE TABLE IF NOT EXISTS payment_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text REFERENCES payments(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- CREATED | APPROVED | INITIATED | WEBHOOK_RECEIVED | SUCCESSFUL | FAILED | RETRIED | HELD
  actor_role text NOT NULL DEFAULT 'system', -- farmer | officer | admin | system | webhook
  actor_name text NOT NULL DEFAULT 'KisanConnect Engine',
  previous_status text,
  new_status text NOT NULL,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT '127.0.0.1',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payment_audit_logs" ON payment_audit_logs;
CREATE POLICY "anon_select_payment_audit_logs" ON payment_audit_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payment_audit_logs" ON payment_audit_logs;
CREATE POLICY "anon_insert_payment_audit_logs" ON payment_audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
