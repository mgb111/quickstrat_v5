// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log('[DEBUG] Webhook-test function version: 2024-07-17');

function toHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(
    new Uint8Array(buffer),
    (x: number) => ("00" + x.toString(16)).slice(-2)
  ).join("");
}

async function verifySignature(body: string, signature: string, secret: string): Promise<{ valid: boolean; computed: string }> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hashHex = toHex(sig);
  return {
    valid: hashHex === signature,
    computed: hashHex,
  };
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: string = await req.text();
    console.log('[DEBUG] Webhook hit!');
    console.log('[DEBUG] Body:', body);
    const signature: string = req.headers.get("x-razorpay-signature") || "";
    // @ts-ignore
    const secret: string = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
    if (!secret) {
      console.error("[ERROR] Webhook secret not set");
      return new Response("Webhook secret not set", { status: 500, headers: corsHeaders });
    }

    // Signature verification
    const { valid, computed } = await verifySignature(body, signature, secret);
    console.log("[DEBUG] INCOMING SIGNATURE:", signature);
    console.log("[DEBUG] COMPUTED HEX SIGNATURE:", computed);
    if (!valid) {
      console.error("[ERROR] Invalid Razorpay webhook signature");
      return new Response("Invalid Razorpay webhook signature", { status: 400, headers: corsHeaders });
    }
    console.log("[SUCCESS] Valid Razorpay webhook signature!");

    // Parse event
    let event: any;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error("[ERROR] Failed to parse webhook body as JSON:", err);
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    if (event.event !== "payment.captured") {
      console.log("[INFO] Ignored event type:", event.event);
      return new Response("Event ignored", { status: 200, headers: corsHeaders });
    }

    // Extract payment info
    const payment: any = event.payload?.payment?.entity;
    if (!payment) {
      console.error("[ERROR] No payment entity in payload");
      return new Response("No payment entity", { status: 400, headers: corsHeaders });
    }
    let email: string | undefined = payment.email;
    if (!email && payment.notes && typeof payment.notes === 'object') {
      email = payment.notes.email;
    }
    if (!email) {
      console.error("[ERROR] No email found in payment entity");
      return new Response("No email in payment", { status: 400, headers: corsHeaders });
    }
    // Determine plan from payment_button_id
    let plan: string | null = null;
    if (payment.payment_button_id === 'pl_QtIGO5QujXNyrB') plan = 'monthly';
    if (payment.payment_button_id === 'pl_QtILq0eW8eEBIs') plan = 'yearly';
    if (!plan) {
      console.error("[ERROR] Unknown payment_button_id:", payment.payment_button_id);
      return new Response("Unknown payment_button_id", { status: 400, headers: corsHeaders });
    }

    // Calculate expiry and campaign period
    const now: Date = new Date();
    let expiry: Date;
    if (plan === 'monthly') {
      expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    const subscription_expiry: string = expiry.toISOString();
    const campaign_count: number = 0;
    const campaign_count_period: string = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Update user in Supabase
    // @ts-ignore
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { data, error } = await supabase.from('users').update({
      plan: 'premium',
      subscription_expiry,
      campaign_count,
      campaign_count_period
    }).eq('email', email).select('id');

    if (error) {
      console.error('[ERROR] Failed to update user subscription:', error);
      return new Response('Failed to update user', { status: 500, headers: corsHeaders });
    }
    if (!data || data.length === 0) {
      console.warn('[WARN] No user updated for email:', email);
      return new Response('No user found for email', { status: 404, headers: corsHeaders });
    }
    console.log('[SUCCESS] Updated user(s):', data.map((u: any) => u.id).join(', '), 'for email:', email, 'plan:', plan);

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('[ERROR] Webhook error:', err);
    return new Response('Webhook error', { status: 500, headers: corsHeaders });
  }
}); 