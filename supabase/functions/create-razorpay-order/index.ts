import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Always handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }
    const { email, plan } = await req.json();
    if (!email || !['monthly', 'yearly'].includes(plan)) {
      return new Response('Invalid request', { status: 400, headers: corsHeaders });
    }

    // Set plan details
    const plans = {
      monthly: { amount: 4900, currency: 'INR', description: 'Monthly Premium Subscription' },
      yearly: { amount: 39900, currency: 'INR', description: 'Yearly Premium Subscription' }
    };
    const { amount, currency, description } = plans[plan];

    // Razorpay credentials
    const key_id = Deno.env.get('RAZORPAY_KEY_ID');
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!key_id || !key_secret) {
      return new Response('Razorpay keys not set', { status: 500, headers: corsHeaders });
    }

    // Create order via Razorpay API
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${key_id}:${key_secret}`)
      },
      body: JSON.stringify({
        amount, // in paise
        currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
        notes: { email, plan }
      })
    });
    if (!orderRes.ok) {
      const err = await orderRes.text();
      return new Response(`Razorpay order error: ${err}`, { status: 500, headers: corsHeaders });
    }
    const order = await orderRes.json();

    return new Response(JSON.stringify({ orderId: order.id, keyId: key_id, amount, currency, description }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Create Razorpay order error:', err);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
}); 