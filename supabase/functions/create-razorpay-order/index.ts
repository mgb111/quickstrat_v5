// Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your Supabase project environment variables before deploying this function.
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { userId, amount, purpose } = body;
    if (!userId || !amount) {
      return new Response("Missing userId or amount", { status: 400, headers: corsHeaders });
    }

    // TODO: Store these securely in environment variables
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response("Razorpay API keys not set", { status: 500, headers: corsHeaders });
    }

    // Create order via Razorpay Orders API
    const orderPayload = {
      amount: amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `${userId}-${Date.now()}`,
      payment_capture: 1,
      notes: { userId, purpose }
    };
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });
    if (!orderRes.ok) {
      const errText = await orderRes.text();
      return new Response(`Failed to create Razorpay order: ${errText}`, { status: 500, headers: corsHeaders });
    }
    const orderData = await orderRes.json();
    return new Response(JSON.stringify({ orderId: orderData.id }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response('Error creating Razorpay order', { status: 500, headers: corsHeaders });
  }
}); 