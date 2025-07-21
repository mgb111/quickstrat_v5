import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    const { amount, userId, purpose } = await req.json();

    const key_id = Deno.env.get("RAZORPAY_KEY_ID");
    const key_secret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!key_id || !key_secret) {
      return new Response("Razorpay keys missing", { status: 500 });
    }

    const auth = btoa(`${key_id}:${key_secret}`);

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount * 100, // convert to paise
        currency: "INR",
        receipt: `${userId}-${Date.now()}`,
        payment_capture: 1,
        notes: { userId, purpose }
      })
    });

    const data = await razorpayRes.json();

    if (!razorpayRes.ok) {
      return new Response(JSON.stringify(data), { status: razorpayRes.status });
    }

    return new Response(JSON.stringify({ orderId: data.id }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
});
