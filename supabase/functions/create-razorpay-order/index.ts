import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }
    const { user_id, campaign_id } = await req.json();
    if (!user_id || !campaign_id) {
      return new Response('Invalid request', { status: 400, headers: corsHeaders });
    }

    // Set price for single campaign
    const amount = 900; // 900 INR = ₹9.00 (Razorpay expects paise)
    const currency = 'INR';
    const description = 'Unlock Campaign';

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
        receipt: `campaign_${campaign_id}_${Date.now()}`,
        payment_capture: 1,
        notes: { user_id, campaign_id }
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