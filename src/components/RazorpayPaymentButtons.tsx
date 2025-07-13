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
  // Payment button IDs from the user's Razorpay setup
  const paymentButtonIds = {
    monthly: 'pl_QsXORcrhWghFgg',
    yearly: 'pl_QsXQiWLwBcQ8x5'
  };

  const currentButtonId = paymentButtonIds[billingCycle];

  useEffect(() => {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Create and add the payment button script
    const formElement = document.getElementById(`razorpay-form-${billingCycle}`);
    if (formElement) {
      // Clear any existing content
      formElement.innerHTML = '';
      
      // Create the payment button script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', currentButtonId);
      script.async = true;
      
      // Add the script to the form
      formElement.appendChild(script);
    }
  }, [billingCycle, currentButtonId]);

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

  return (
    <div className="w-full">
      <form id={`razorpay-form-${billingCycle}`}>
        {/* Razorpay payment button will be inserted here by the script */}
      </form>
    </div>
  );
};

export default RazorpayPaymentButtons; 