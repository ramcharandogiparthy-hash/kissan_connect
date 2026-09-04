import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || 'whsec_kisanconnect_test123';
    const bodyText = await req.text();

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing Razorpay webhook signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // HMAC SHA256 Signature Verification
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isSignatureValid = await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBytes(signature),
      encoder.encode(bodyText)
    );

    const payload = JSON.parse(bodyText);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event === 'payment.captured' || event === 'order.paid') {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('*')
        .eq('gateway_order_id', orderId)
        .single();

      if (existingPayment && existingPayment.status !== 'successful') {
        // Idempotency: Update payment status to successful
        await supabase
          .from('payments')
          .update({
            status: 'successful',
            gateway_payment_id: paymentId,
            gateway_signature: signature,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existingPayment.id);

        // Record Audit Log
        await supabase.from('payment_audit_logs').insert([
          {
            payment_id: existingPayment.id,
            event_type: 'WEBHOOK_RECEIVED',
            actor_role: 'webhook',
            actorName: 'Razorpay Webhook Engine',
            previous_status: existingPayment.status,
            new_status: 'successful',
            notes: `Webhook signature verified cleanly. Payment Captured: ${paymentId}`,
          },
        ]);
      }
    }

    return new Response(JSON.stringify({ received: true, event, isSignatureValid }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
