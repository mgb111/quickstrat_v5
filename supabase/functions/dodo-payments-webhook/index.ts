// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const body: string = await req.text();
    let event: any;
    try {
      event = JSON.parse(body);
    } catch (err) {
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    // Dodo Payments: Expect event with email and payment status
    const email = event.email || event.customer_email;
    const paymentStatus = event.status || event.payment_status;
    if (!email || paymentStatus !== 'success') {
      return new Response("Missing email or payment not successful", { status: 400, headers: corsHeaders });
    }

    // Calculate new expiry (1 month from now)
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const subscription_expiry = expiry.toISOString();
    const campaign_count = 0;
    const campaign_count_period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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
      return new Response('Failed to update user', { status: 500, headers: corsHeaders });
    }
    if (!data || data.length === 0) {
      return new Response('No user found for email', { status: 404, headers: corsHeaders });
    }
    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response('Webhook error', { status: 500, headers: corsHeaders });
  }
}); 