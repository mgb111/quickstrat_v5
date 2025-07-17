// @ts-ignore
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
    console.log("[WEBHOOK-TEST] Received webhook event. Body:", body);
    // Placeholder: Add your business logic here (e.g., signature verification, DB update, etc.)
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[WEBHOOK-TEST] Error handling webhook:", err);
    return new Response("Webhook error", { status: 500, headers: corsHeaders });
  }
}); 