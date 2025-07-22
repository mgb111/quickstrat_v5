// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Environment variables
const key_id = Deno.env.get('RAZORPAY_KEY_ID');
const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');

// Constants
const MAX_AMOUNT = 1000000; // 10,000.00 INR (in paise)
const ALLOWED_PURPOSES = ['premium_plan', 'subscription', 'donation'];

// Helper function to create response
function createResponse(
  body: any,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET, PUT, DELETE',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: { ...defaultHeaders, ...headers },
    },
  );
}

// Request validation
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body.userId || typeof body.userId !== 'string' || body.userId.trim().length === 0) {
    return { valid: false, error: 'Invalid or missing userId' };
  }

  if (typeof body.amount !== 'number' || isNaN(body.amount) || body.amount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' };
  }

  if (body.amount * 100 > MAX_AMOUNT) {
    return { valid: false, error: 'Amount exceeds maximum allowed limit' };
  }

  if (!body.purpose || typeof body.purpose !== 'string' || !ALLOWED_PURPOSES.includes(body.purpose)) {
    return { valid: false, error: `Invalid purpose. Must be one of: ${ALLOWED_PURPOSES.join(', ')}` };
  }

  return { valid: true };
}

// Main server handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createResponse({}, 204);
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createResponse(
      { error: 'Method Not Allowed' },
      405
    );
  }

  try {
    // Check environment variables
    if (!key_id || !key_secret) {
      console.error('Razorpay API credentials not configured');
      return createResponse(
        { error: 'Server configuration error' },
        500
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return createResponse(
        { error: 'Invalid JSON payload' },
        400
      );
    }

    // Validate request data
    const validation = validateRequest(requestBody);
    if (!validation.valid) {
      return createResponse(
        { error: validation.error },
        400
      );
    }

    const { userId, amount, purpose } = requestBody;
    console.log('[create-razorpay-order] Creating order for:', { userId, amount, purpose });

    // Create order payload
    const orderPayload = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      payment_capture: 1,
      notes: { 
        userId, 
        purpose,
        timestamp: new Date().toISOString()
      }
    };

    // Call Razorpay API
    const auth = btoa(`${key_id}:${key_secret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Majorbeam/1.0'
      },
      body: JSON.stringify(orderPayload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[create-razorpay-order] Razorpay API error:', {
        status: response.status,
        error: responseData.error || 'Unknown error'
      });
      
      return createResponse(
        { 
          error: 'Payment processing failed',
          details: responseData.error?.description || 'Could not create order'
        },
        500
      );
    }

    console.log('[create-razorpay-order] Order created:', responseData.id);
    
    return createResponse({
      orderId: responseData.id,
      amount: responseData.amount / 100, // Convert back to currency units
      currency: responseData.currency,
      status: responseData.status
    });

  } catch (error) {
    console.error('[create-razorpay-order] Unexpected error:', error);
    
    return createResponse(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      500
    );
  }
});