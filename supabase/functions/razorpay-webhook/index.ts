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
  // Log function invocation
  console.log("[Webhook] Razorpay webhook invoked");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log headers (mask signature)
    const headers = Object.fromEntries(req.headers.entries());
    if (headers['x-razorpay-signature']) {
      headers['x-razorpay-signature'] = '***';
    }
    console.log("[Webhook] Incoming headers:", headers);

    // Read and log body
    const body = await req.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (jsonErr) {
      console.error("[Webhook] Invalid JSON body", { body });
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }
    console.log("[Webhook] Incoming body:", JSON.stringify(parsedBody));

    // Signature validation
    const signature = req.headers.get('x-razorpay-signature') || '';
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';
    if (!secret) {
      console.error("[Webhook] Webhook secret not set");
      return new Response("Webhook secret not set", { status: 500, headers: corsHeaders });
    }
    // Correct signature verification
    const expectedSignature = createHmac("sha256", secret).update(body).digest("hex");
    if (expectedSignature !== signature) {
      console.error("[Webhook] Invalid signature", { expectedSignature, signature });
      return new Response("Invalid signature", { status: 400, headers: corsHeaders });
    }
    console.log("[Webhook] Signature validated");

    // Event type check
    const eventType = parsedBody.event;
    if (eventType !== "payment.captured") {
      console.log(`[Webhook] Event '${eventType}' ignored`);
      return new Response("Event ignored", { status: 200, headers: corsHeaders });
    }

    // Extract payment entity
    const payment = parsedBody?.payload?.payment?.entity;
    if (!payment) {
      console.error("[Webhook] Missing payment entity in payload");
      return new Response("Missing payment entity", { status: 400, headers: corsHeaders });
    }

    // Extract email (from payment.email or payment.notes.email)
    const email = payment.email || (payment.notes && payment.notes.email);
    if (!email) {
      console.error("[Webhook] Missing email in payment", { payment });
      return new Response("Missing email", { status: 400, headers: corsHeaders });
    }
    console.log(`[Webhook] Payment for email: ${email}`);

    // Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error("[Webhook] Supabase env vars not set");
      return new Response("Supabase env vars not set", { status: 500, headers: corsHeaders });
    }
    // @ts-ignore
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare subscription update fields
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const subscription_expiry = expiry.toISOString();
    const campaign_count = 0;
    const campaign_count_period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Update user plan in Supabase
    let updateError = null;
    try {
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
        updateError = error;
        throw error;
      }
    } catch (err) {
      console.error("[Webhook] Failed to update user in Supabase", { email, err });
      return new Response("Failed to update user", { status: 500, headers: corsHeaders });
    }
    console.log(`[Webhook] User upgraded to premium: ${email}`);

    // Success response
    return new Response("OK", { status: 200, headers: corsHeaders });

  } catch (err) {
    // Log all errors
    console.error("[Webhook] Unhandled error:", err);
    return new Response("Webhook error", { status: 500, headers: corsHeaders });
  }
});

