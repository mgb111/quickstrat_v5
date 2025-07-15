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
    // You may need to adjust this depending on your Razorpay button setup
    const email = payment.email || (payment.notes && payment.notes.email);
    const plan = payment.notes && payment.notes.plan; // 'monthly' or 'yearly'
    if (!email || !plan) {
      console.error('Missing email or plan in payment entity', payment);
      return new Response('Missing email or plan', { status: 400, headers: corsHeaders });
    }

    // Supabase client
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Calculate expiry and campaign period
    const now = new Date();
    let expiry: Date;
    if (plan === 'monthly') {
      expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    const subscription_expiry = expiry.toISOString();
    const campaign_count = 0;
    const campaign_count_period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Update user in Supabase
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