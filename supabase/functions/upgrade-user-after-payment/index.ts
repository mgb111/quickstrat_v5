// Supabase Edge Function: upgrade-user-after-payment
// Receives: { userId, paymentId, orderId }
// 1. Validates payment with Razorpay API
// 2. If valid, upgrades user to premium, resets campaign count/period
// 3. Returns new user subscription state

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const key_id = Deno.env.get('RAZORPAY_KEY_ID');
const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');
const supabase_url = Deno.env.get('SUPABASE_URL');
const supabase_service_role_key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

function createResponse(
  body: any,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...defaultHeaders, ...headers } }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return createResponse({}, 204);
  if (req.method !== 'POST') return createResponse({ error: 'Method Not Allowed' }, 405);

  try {
    if (!key_id || !key_secret || !supabase_url || !supabase_service_role_key) {
      return createResponse({ error: 'Server config error' }, 500);
    }
    let body;
    try {
      body = await req.json();
    } catch {
      return createResponse({ error: 'Invalid JSON' }, 400);
    }
    const { userId, paymentId, orderId } = body;
    if (!userId || !paymentId || !orderId) {
      return createResponse({ error: 'Missing fields' }, 400);
    }
    // 1. Validate payment with Razorpay
    const auth = btoa(`${key_id}:${key_secret}`);
    const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` }
    });
    const paymentData = await paymentRes.json();
    if (!paymentRes.ok || paymentData.order_id !== orderId || paymentData.status !== 'captured') {
      return createResponse({ error: 'Payment not valid or not captured', details: paymentData }, 400);
    }
    // 2. Upgrade user in Supabase
    const updateRes = await fetch(`${supabase_url}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabase_service_role_key,
        'Authorization': `Bearer ${supabase_service_role_key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        plan: 'premium',
        campaign_count: 0,
        campaign_count_period: new Date().toISOString(),
        subscription_expiry: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString() // 31 days
      })
    });
    const updatedUser = await updateRes.json();
    if (!updateRes.ok) {
      return createResponse({ error: 'Failed to upgrade user', details: updatedUser }, 500);
    }
    return createResponse({ success: true, user: updatedUser[0] });
  } catch (e) {
    return createResponse({ error: 'Internal server error', message: e.message }, 500);
  }
});
