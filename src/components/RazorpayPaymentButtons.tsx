import React, { useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: new (options: any) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

interface RazorpayPaymentButtonsProps {
  userId: string;
  amount: number; // in INR
  purpose?: string;
  endpoint?: string;
}

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({ userId, amount, purpose, endpoint }) => {
  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  const handlePay = async () => {
    try {
      // 1. Call backend to create Razorpay order
      const apiUrl = endpoint || 'https://uyjqtojxwpfndrmuscag.supabase.co/functions/v1/create-razorpay-order';
      console.log('Calling Razorpay endpoint:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount, purpose }),
        credentials: 'include'
      });
      
      const responseData = await response.json().catch(() => ({}));
      console.log('Razorpay order response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to create payment order');
      }

      const { orderId, error: orderError } = responseData;
      if (!orderId) {
        throw new Error(orderError || 'Failed to get orderId from backend');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please try again.');
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
          console.log('Payment successful:', response);
          window.location.href = `${window.location.pathname}?payment=success&payment_id=${response.razorpay_payment_id}`;
        },
        prefill: {
          name: 'Customer Name', // You can prefill these from user data
          email: 'customer@example.com',
          contact: '+919999999999'
        },
        notes: { userId, purpose },
        theme: { color: '#3b82f6' }
      };
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error?.description || 'Unknown error'}`);
      });
      
      rzp.open();
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Payment error: ${errorMessage}`);
    }
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