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
    const res = await fetch(endpoint || '/functions/v1/create-razorpay-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, amount, purpose })
    });
    if (!res.ok) {
      alert('Failed to create payment order.');
      return;
    }
    const { orderId, error } = await res.json();
    if (!orderId) {
      alert('Failed to get orderId from backend: ' + (error || 'Unknown error'));
      return;
    }
    // 2. Open Razorpay Checkout with real orderId and live key
    const options = {
      key: 'rzp_test_6DK6qaeZ98ZTxA', // Using provided test key for Razorpay
      amount: amount * 100,
      currency: 'INR',
      name: 'Majorbeam',
      description: purpose || 'Premium Plan',
      order_id: orderId,
      handler: function (response: any) {
        // Optionally verify payment on backend here
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