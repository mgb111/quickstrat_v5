// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function toHex(buffer) {
  return Array.prototype.map.call(
    new Uint8Array(buffer),
    (x) => ("00" + x.toString(16)).slice(-2)
  ).join("");
}

async function verifySignature(body, signature, secret) {
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
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = (typeof Deno !== "undefined" && Deno.env && Deno.env.get)
      ? Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || ""
      : "";

    // Debug logs
    console.log("[DEBUG] RAW BODY:", body);
    console.log("[DEBUG] SECRET LENGTH:", secret.length);
    console.log("[DEBUG] INCOMING SIGNATURE:", signature);

    if (!secret) {
      console.error("[ERROR] Webhook secret not set");
      return new Response("Webhook secret not set", { status: 500, headers: corsHeaders });
    }

    const { valid, computed } = await verifySignature(body, signature, secret);
    console.log("[DEBUG] COMPUTED HEX SIGNATURE:", computed);
    if (!valid) {
      console.error("[ERROR] Invalid Razorpay webhook signature");
      return new Response("Invalid Razorpay webhook signature", { status: 400, headers: corsHeaders });
    }

    // If signature is valid, just log and return OK for now
    console.log("[SUCCESS] Valid Razorpay webhook signature!");
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[ERROR] Webhook error:", err);
    return new Response("Webhook error", { status: 500, headers: corsHeaders });
  }
}); 