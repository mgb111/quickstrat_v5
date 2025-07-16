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
    const key_id = Deno.env.get('RAZORPAY_KEY_ID')!;
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const authHeader = 'Basic ' + btoa(`${key_id}:${key_secret}`);

    // Prepare Razorpay order body
    const orderBody = {
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    // Create order via Razorpay API
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderBody)
    });
    if (!razorpayRes.ok) {
      const err = await razorpayRes.text();
      return new Response(`Razorpay order error: ${err}`, { status: 500, headers: corsHeaders });
    }
    const order = await razorpayRes.json();

    return new Response(JSON.stringify({ orderId: order.id, keyId: key_id, amount, currency, description }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Create Razorpay order error:', err);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
}); 