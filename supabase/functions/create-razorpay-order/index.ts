// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const key_id = Deno.env.get('RAZORPAY_KEY_ID');
const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');

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
    const { userId, amount, purpose } = await req.json();

    // Create order on Razorpay
    const orderPayload = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
      payment_capture: 1,
      notes: { userId, purpose }
    };

    const auth = btoa(`${key_id}:${key_secret}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), { status: 500, headers: corsHeaders });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ orderId: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}); 