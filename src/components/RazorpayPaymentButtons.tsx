import React, { useEffect, useRef, useState } from 'react';

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
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Payment button IDs from environment variables or fallback to demo IDs
  const paymentButtonIds = {
    monthly: import.meta.env.VITE_RAZORPAY_MONTHLY_BUTTON_ID || 'pl_QsXORcrhWghFgg',
    yearly: import.meta.env.VITE_RAZORPAY_YEARLY_BUTTON_ID || 'pl_QsXQiWLwBcQ8x5'
  };
  const currentButtonId = paymentButtonIds[billingCycle];

  // Validate button ID format
  const isValidButtonId = (id: string) => {
    return id && id.startsWith('pl_') && id.length > 10;
  };

  useEffect(() => {
    // Check if button ID is valid
    if (!isValidButtonId(currentButtonId)) {
      setHasError(true);
      setErrorMessage(`Invalid payment button ID: ${currentButtonId}. Please check your Razorpay configuration.`);
      return;
    }

    // Load Razorpay script globally if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        setIsRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        setHasError(true);
        setErrorMessage('Failed to load Razorpay payment system. Please check your internet connection.');
      };
      document.head.appendChild(script);
    } else {
      setIsRazorpayLoaded(true);
    }
  }, [currentButtonId]);

  useEffect(() => {
    // Wait for both the form to be rendered and Razorpay script to be available
    const loadPaymentButton = () => {
      if (formRef.current && isRazorpayLoaded && isValidButtonId(currentButtonId)) {
        // Clear any existing content
        formRef.current.innerHTML = '';
        setHasError(false);
        setErrorMessage('');
        
        // Create the payment button script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        script.setAttribute('data-payment_button_id', currentButtonId);
        script.async = true;
        
        // Add error handling
        script.onerror = () => {
          console.error('Failed to load Razorpay payment button script');
          setHasError(true);
          setErrorMessage('Failed to load payment button. Please try refreshing the page.');
        };
        
        // Add the script to the form
        formRef.current.appendChild(script);
        
        console.log('Razorpay payment button script added with ID:', currentButtonId);
        
        // Set a timeout to check if the button loaded successfully
        setTimeout(() => {
          if (formRef.current && formRef.current.children.length === 1) {
            // Only the script tag is present, button didn't load
            console.warn('Payment button may not have loaded correctly');
            setHasError(true);
            setErrorMessage('Payment button failed to load. Please check your Razorpay configuration.');
          }
        }, 3000);
      }
    };

    // Add a delay to ensure everything is ready
    const timer = setTimeout(loadPaymentButton, 200);
    
    return () => {
      clearTimeout(timer);
      if (formRef.current) {
        formRef.current.innerHTML = '';
      }
    };
  }, [billingCycle, currentButtonId, isRazorpayLoaded]);

  // NOTE: Razorpay payment button script does NOT support direct JS callbacks for payment success/failure.
  // You must use Razorpay dashboard/webhooks for post-payment actions.
  // The onPaymentSuccess/onPaymentError props are provided for API consistency only.

  if (hasError) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Payment Button Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errorMessage}</p>
                <p className="mt-1">Button ID: {currentButtonId}</p>
                <p className="mt-1 text-xs">
                  To fix this, please:
                  <br />• Check your Razorpay dashboard for valid button IDs
                  <br />• Set VITE_RAZORPAY_MONTHLY_BUTTON_ID and VITE_RAZORPAY_YEARLY_BUTTON_ID in your .env file
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form 
        ref={formRef}
        id={`razorpay-form-${billingCycle}`} 
        aria-label="Razorpay Payment Form"
      >
        {/* Razorpay payment button will be inserted here by the script */}
        {!isRazorpayLoaded && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading payment button...</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default RazorpayPaymentButtons; 