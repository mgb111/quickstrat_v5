import React, { useEffect } from 'react';

// Type declaration for Razorpay global
declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface RazorpayPaymentButtonsProps {
  billingCycle: 'monthly' | 'yearly';
  onPaymentSuccess?: (paymentId: string, plan: string, billing: string) => void;
  onPaymentError?: (error: any) => void;
}

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({
  billingCycle,
  onPaymentSuccess,
  onPaymentError
}) => {
  useEffect(() => {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handlePaymentSuccess = (paymentId: string) => {
    const plan = 'premium';
    const billing = billingCycle;
    console.log('Payment successful:', { paymentId, plan, billing });
    onPaymentSuccess?.(paymentId, plan, billing);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    onPaymentError?.(error);
  };

  // Payment button IDs from the user's Razorpay setup
  const paymentButtonIds = {
    monthly: 'pl_QsXORcrhWghFgg',
    yearly: 'pl_QsXQiWLwBcQ8x5'
  };

  const currentButtonId = paymentButtonIds[billingCycle];

  return (
    <div className="w-full">
      <form>
        <script 
          src="https://checkout.razorpay.com/v1/payment-button.js" 
          data-payment_button_id={currentButtonId} 
          async
        />
      </form>
    </div>
  );
};

export default RazorpayPaymentButtons; 