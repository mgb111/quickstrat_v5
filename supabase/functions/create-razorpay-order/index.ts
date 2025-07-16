Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  const body = await req.json();

  const key_id = Deno.env.get('RAZORPAY_KEY_ID')!;
  const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
  const credentials = `${key_id}:${key_secret}`;

  // Base64 encode manually
  const encoded = btoa(credentials); // Works in Deno Edge Functions
  const authHeader = `Basic ${encoded}`;

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: body.amount,
      currency: body.currency,
      receipt: body.receipt,
      payment_capture: 1,
    }),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}); 