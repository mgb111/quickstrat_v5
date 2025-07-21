// Use this function as your Razorpay webhook handler for payment.captured events.
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Verify Razorpay webhook signature
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
    // @ts-ignore
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';
    if (!secret) throw new Error('Webhook secret not set');

    // 1. Verify signature
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
    const orderId = payment.order_id;
    // 2. (TODO) Check that order_id matches a real order in your DB
    // You should look up the order in your DB and ensure it was created for this user/amount
    // For now, just log it
    console.log('Received payment for order_id:', orderId);
    // Example: const order = await supabase.from('orders').select('*').eq('order_id', orderId).single();
    // if (!order) { return new Response('Unknown order_id', { status: 400, headers: corsHeaders }); }

    // Determine plan based on payment_button_id (legacy, or use notes/order info for new flow)
    const email = payment.email || (payment.notes && payment.notes.email);
    if (!email) {
      console.error('Missing email in payment entity', payment);
      return new Response('Missing email', { status: 400, headers: corsHeaders });
    }

    // Supabase client
    // @ts-ignore
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Calculate expiry and campaign period
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const subscription_expiry = expiry.toISOString();
    const campaign_count = 0;
    const campaign_count_period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 3. Only upgrade user if signature is valid and (TODO) order is valid
    const { error } = await supabase
      .from('users')
      .update({
        plan: 'premium',
        subscription_expiry,
        campaign_count,
        campaign_count_period
      })
      .eq('email', email);

    if (error) {
      console.error('Failed to update user subscription:', error);
      return new Response('Failed to update user', { status: 500, headers: corsHeaders });
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Webhook error', { status: 500, headers: corsHeaders });
  }
}); 