// Add Razorpay type to window for TypeScript
declare global {
  interface Window {
    Razorpay?: any;
  }
}

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RazorpayPaymentButtonsProps {
  billingCycle?: 'monthly' | 'yearly'; // Not used anymore
  campaignId: string;
}

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({ campaignId }) => {
  const { user } = useAuth();

  const handlePayNow = async () => {
    if (!user?.id) {
      alert('You must be logged in to purchase this campaign.');
      return;
    }
    try {
      // Call Edge Function to create order for this campaign
      const res = await fetch('https://uyjqtojxwpfndrmuscag.supabase.co/functions/v1/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, campaign_id: campaignId })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      const { orderId, keyId, amount, currency, description } = await res.json();
      // Load Razorpay JS SDK if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      // Open Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Majorbeam',
        description,
        order_id: orderId,
        prefill: {
          email: user.email
        },
        notes: {
          campaign_id: campaignId,
          user_id: user.id
        },
        handler: function (response: any) {
          alert('Payment successful! This campaign will be unlocked shortly.');
          // Optionally, you can poll or refresh campaign access here
        },
        theme: {
          color: '#3b82f6'
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert('Payment error: ' + (err?.message || err));
    }
  };

  return (
    <button
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      onClick={handlePayNow}
    >
      Pay $9 to unlock
    </button>
  );
};

export default RazorpayPaymentButtons; 