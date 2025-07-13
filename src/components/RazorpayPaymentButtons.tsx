import React, { useEffect, useRef } from 'react';

// Type declaration for Razorpay global
// (Razorpay payment button script does not support direct JS callbacks)
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
  // These callbacks are not used with Razorpay payment button script, see comment below
  onPaymentSuccess,
  onPaymentError
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  
  // Payment button IDs from the user's Razorpay setup
  const paymentButtonIds = {
    monthly: 'pl_QsXORcrhWghFgg',
    yearly: 'pl_QsXQiWLwBcQ8x5'
  };
  const currentButtonId = paymentButtonIds[billingCycle];

  useEffect(() => {
    // Load Razorpay script globally if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Wait for the form to be rendered and Razorpay script to be available
    const loadPaymentButton = () => {
      if (formRef.current) {
        // Clear any existing content
        formRef.current.innerHTML = '';
        
        // Create the payment button script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        script.setAttribute('data-payment_button_id', currentButtonId);
        script.async = true;
        
        // Add error handling
        script.onerror = () => {
          console.error('Failed to load Razorpay payment button script');
        };
        
        // Add the script to the form
        formRef.current.appendChild(script);
        
        console.log('Razorpay payment button script added with ID:', currentButtonId);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(loadPaymentButton, 100);
    
    return () => {
      clearTimeout(timer);
      if (formRef.current) {
        formRef.current.innerHTML = '';
      }
    };
  }, [billingCycle, currentButtonId]);

  // NOTE: Razorpay payment button script does NOT support direct JS callbacks for payment success/failure.
  // You must use Razorpay dashboard/webhooks for post-payment actions.
  // The onPaymentSuccess/onPaymentError props are provided for API consistency only.

  return (
    <div className="w-full">
      <form 
        ref={formRef}
        id={`razorpay-form-${billingCycle}`} 
        aria-label="Razorpay Payment Form"
      >
        {/* Razorpay payment button will be inserted here by the script */}
      </form>
    </div>
  );
};

export default RazorpayPaymentButtons; 