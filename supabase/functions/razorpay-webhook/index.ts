import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function verifySignature(body: string, signature: string, secret: string) {
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(body);
  const cryptoKey = crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return cryptoKey.then(k => crypto.subtle.sign('HMAC', k, data)).then(sig => {
    const hashArray = Array.from(new Uint8Array(sig));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === signature;
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';
    if (!secret) throw new Error('Webhook secret not set');

    // Verify signature
    const valid = await verifySignature(body, signature, secret);
    if (!valid) {
      console.error('Invalid Razorpay webhook signature');
      return new Response('Invalid signature', { status: 400, headers: corsHeaders });
    }

    const event = JSON.parse(body);
    if (event.event !== 'payment.captured') {
      return new Response('Event ignored', { status: 200, headers: corsHeaders });
    }

    const payment = event.payload.payment.entity;
    const orderNotes = payment.notes || {};
    const user_id = orderNotes.user_id;
    const campaign_id = orderNotes.campaign_id;
    const razorpay_payment_id = payment.id;
    const amount = payment.amount;

    if (!user_id || !campaign_id) {
      console.error('Missing user_id or campaign_id in payment notes', payment);
      return new Response('Missing user_id or campaign_id', { status: 400, headers: corsHeaders });
    }

    // Supabase client
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Insert payment record
    const { error } = await supabase
      .from('campaign_payments')
      .insert({
        user_id,
        campaign_id,
        razorpay_payment_id,
        amount,
        status: 'paid'
      });

    if (error) {
      console.error('Failed to record campaign payment:', error);
      return new Response('Failed to record payment', { status: 500, headers: corsHeaders });
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Webhook error', { status: 500, headers: corsHeaders });
  }
}); 