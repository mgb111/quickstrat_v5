Deno.serve(async (req) => {
  // Handle CORS preflight
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

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  const body = await req.json();

  const key_id = Deno.env.get('RAZORPAY_KEY_ID')!;
  const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
  const authHeader = 'Basic ' + btoa(`${key_id}:${key_secret}`);

  const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: body.amount,
      currency: body.currency,
      receipt: body.receipt,
      payment_capture: 1
    })
  });

  if (!razorpayRes.ok) {
    const err = await razorpayRes.text();
    return new Response(`Razorpay order error: ${err}`, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    });
  }

  const result = await razorpayRes.json();

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}); 