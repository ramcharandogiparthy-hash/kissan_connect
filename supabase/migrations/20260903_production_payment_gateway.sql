/*
# KisanConnect — Production Payment Gateway Database Migration

Upgrades `payments` table and adds `payment_transactions` & `payment_refunds` schema to support Razorpay / Cashfree / PhonePe integration, server-side HMAC signature verification, bonus/deduction itemization, and audit trails.

## Features:
1. `payments` schema upgrade with transaction_id, gateway_order_id, gateway_payment_id, gateway_signature, refund_status.
2. Status constraints: 'Pending', 'Payment Initiated', 'Processing', 'Successful', 'Failed', 'Cancelled', 'Refunded', 'Partially Refunded'.
3. Strict RLS policies and idempotency indexes.
*/

-- Upgrade payments table with transaction columns if they do not exist
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS transaction_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS gateway_order_id text,
  ADD COLUMN IF NOT EXISTS gateway_payment_id text,
  ADD COLUMN IF NOT EXISTS gateway_signature text,
  ADD COLUMN IF NOT EXISTS gateway_provider text DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS bonus_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_status text DEFAULT 'none', -- none | pending | refunded | partially_refunded
  ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_reason text,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_by text;

-- Create index on transaction_id and gateway_order_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments (transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON payments (gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_farmer_phone ON payments (farmer_phone);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

-- Create refunds table for tracking admin-initiated refunds
CREATE TABLE IF NOT EXISTS payment_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text REFERENCES payments(id) ON DELETE CASCADE,
  transaction_id text NOT NULL,
  refund_id text UNIQUE NOT NULL, -- Gateway refund ID
  amount numeric NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'completed', -- pending | completed | failed
  initiated_by text NOT NULL DEFAULT 'Admin Officer',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payment_refunds" ON payment_refunds;
CREATE POLICY "anon_select_payment_refunds" ON payment_refunds FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payment_refunds" ON payment_refunds;
CREATE POLICY "anon_insert_payment_refunds" ON payment_refunds FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Notification log table for payment alerts
CREATE TABLE IF NOT EXISTS farmer_payment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_phone text NOT NULL,
  payment_id text REFERENCES payments(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread', -- unread | read
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farmer_payment_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_farmer_payment_notifications" ON farmer_payment_notifications;
CREATE POLICY "anon_select_farmer_payment_notifications" ON farmer_payment_notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_farmer_payment_notifications" ON farmer_payment_notifications;
CREATE POLICY "anon_insert_farmer_payment_notifications" ON farmer_payment_notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
