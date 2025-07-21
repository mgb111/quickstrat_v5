import React from 'react';

interface RazorpayPaymentButtonsProps {
  userId: string;
  amount: number; // in INR
  purpose?: string;
  endpoint?: string;
}

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({ userId, amount, purpose, endpoint }) => {
  const handlePay = async () => {
    // 1. Call backend to create Razorpay order
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5anF0b2p4d3BmbmRybXVzY2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTEzMTgsImV4cCI6MjA2Njk2NzMxOH0.Jk30U7VdWdsYcdV1akWIGF5I8FneCJMtSEBmLsoknOU'; // Hardcoded for now
    const res = await fetch(endpoint || '/functions/v1/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}` // Added Authorization header
      },
      body: JSON.stringify({ userId, amount, purpose })
    });
    if (!res.ok) {
      alert('Failed to create payment order.');
      return;
    }
    const { orderId } = await res.json();
    // 2. Open Razorpay Checkout
    // TODO: Use your real Razorpay key here
    const options = {
      key: 'rzp_test_6DK6qaeZ98ZTxA', // TODO: Switch to live key for production
      amount: amount * 100,
      currency: 'INR',
      name: 'Majorbeam',
      description: purpose || 'Premium Plan',
      order_id: orderId,
      handler: function (response: any) {
        // TODO: Optionally verify payment on backend
        window.location.href = window.location.pathname + '?payment=success';
      },
      prefill: {},
      notes: { userId, purpose },
      theme: { color: '#3b82f6' }
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button
      onClick={handlePay}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
    >
      Pay with Razorpay
    </button>
  );
};

export default RazorpayPaymentButtons; 