// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { createHmac } from "https://deno.land/std@0.168.0/hash/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';

    if (!secret) throw new Error('Webhook secret not set');

    // ✅ Correct signature verification
    const expectedSignature = createHmac("sha256", secret).update(body).digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid signature");
      return new Response("Invalid signature", { status: 400, headers: corsHeaders });
    }

    const event = JSON.parse(body);

    if (event.event !== "payment.captured") {
      return new Response("Event ignored", { status: 200, headers: corsHeaders });
    }

    const payment = event.payload.payment.entity;
    const email = payment.email || (payment.notes && payment.notes.email);

    if (!email) {
      console.error("Missing email in payment");
      return new Response("Missing email", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const subscription_expiry = expiry.toISOString();
    const campaign_count = 0;
    const campaign_count_period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { error } = await supabase
      .from('users')
      .update({
        plan: 'premium',
        subscription_expiry,
        campaign_count,
        campaign_count_period,
      })
      .eq('email', email);

    if (error) {
      console.error("Failed to update user:", error);
      return new Response("Failed to update user", { status: 500, headers: corsHeaders });
    }

    return new Response("OK", { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook error", { status: 500, headers: corsHeaders });
  }
});
