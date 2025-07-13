import React, { useEffect, useRef, useState } from 'react';
import { getPaymentConfig, isValidButtonId, getFallbackAction } from '../lib/paymentConfig';

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

const HARDCODED_BUTTON_IDS = {
  monthly: 'pl_QsXORcrhWghFgg',
  yearly: 'pl_QsXQiWLwBcQ8x5'
};

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({
  billingCycle,
  onPaymentSuccess,
  onPaymentError
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get payment configuration
  const currentButtonId = HARDCODED_BUTTON_IDS[billingCycle];
  const hasValidConfig = !!currentButtonId;
  // Fallback actions are not needed since we always have a button

  useEffect(() => {
    // If no valid button ID, don't even try to load Razorpay
    if (!hasValidConfig) {
      setIsLoading(false);
      return;
    }

    // Load Razorpay script only if we have valid configuration
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        setIsRazorpayLoaded(true);
        setIsLoading(false);
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        setHasError(true);
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      setIsRazorpayLoaded(true);
      setIsLoading(false);
    }
  }, [hasValidConfig]);

  useEffect(() => {
    // Only attempt to load payment button if we have valid config and script is loaded
    if (!hasValidConfig || !isRazorpayLoaded || !formRef.current) {
      return;
    }

    const loadPaymentButton = () => {
      if (formRef.current && isRazorpayLoaded && currentButtonId) {
        // Clear any existing content
        formRef.current.innerHTML = '';
        setHasError(false);
        
        console.log('🔧 Loading payment button with ID:', currentButtonId);
        
        // Create the payment button script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        script.setAttribute('data-payment_button_id', currentButtonId);
        script.async = true;
        
        // Add error handling
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay payment button script');
          setHasError(true);
        };
        
        // Add the script to the form
        formRef.current.appendChild(script);
        
        console.log('✅ Razorpay payment button script added with ID:', currentButtonId);
        
        // Set a timeout to check if the button loaded successfully
        setTimeout(() => {
          if (formRef.current && formRef.current.children.length === 1) {
            // Only the script tag is present, button didn't load
            console.warn('⚠️ Payment button may not have loaded correctly');
            setHasError(true);
          }
        }, 5000); // Increased timeout
      }
    };

    // Add a delay to ensure everything is ready
    const timer = setTimeout(loadPaymentButton, 500); // Increased delay
    
    return () => {
      clearTimeout(timer);
      if (formRef.current) {
        formRef.current.innerHTML = '';
      }
    };
  }, [billingCycle, currentButtonId, isRazorpayLoaded, hasValidConfig]);

  // If no valid configuration, show a clean fallback
  if (!hasValidConfig) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Payment System Coming Soon
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              {import.meta.env.DEV ? (
                <>
                  Payment buttons not configured. Add <code className="bg-blue-100 px-1 rounded text-xs">VITE_RAZORPAY_MONTHLY_BUTTON_ID</code> and <code className="bg-blue-100 px-1 rounded text-xs">VITE_RAZORPAY_YEARLY_BUTTON_ID</code> to your .env file.
                </>
              ) : (
                "We're setting up secure payment processing. For now, please contact us to upgrade your plan."
              )}
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.open('mailto:support@majorbeam.com?subject=Payment Issue', '_blank')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </button>
            
            <button 
              onClick={() => window.open('mailto:support@majorbeam.com?subject=Payment Issue', '_blank')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Contact Support
            </button>
          </div>
          
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Development Mode:</strong> Check <code className="bg-yellow-100 px-1 rounded">ENVIRONMENT_SETUP.md</code> for setup instructions.
              </p>
            </div>
          )}
          
          <p className="text-xs text-blue-600 mt-3">
            Premium features: Unlimited PDFs • 5 campaigns/month • Landing pages • Lead capture
          </p>
        </div>
      </div>
    );
  }

  // If there's an error loading the payment system
  if (hasError) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Payment System Temporarily Unavailable
            </h3>
            <p className="text-orange-700 text-sm mb-4">
              We're experiencing technical difficulties with our payment processor. Please try again later or contact us.
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              🔄 Try Again
            </button>
            
            <button 
              onClick={() => window.open('mailto:support@majorbeam.com?subject=Payment Issue', '_blank')}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              📧 Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading secure payment system...</p>
        </div>
      </div>
    );
  }

  // Render the actual payment button
  return (
    <div className="w-full">
      <form 
        ref={formRef}
        id={`razorpay-form-${billingCycle}`} 
        aria-label="Razorpay Payment Form"
        className="min-h-[60px] flex items-center justify-center"
      >
        {/* Razorpay payment button will be inserted here by the script */}
        <div className="text-gray-500 text-sm">Loading payment button...</div>
      </form>
    </div>
  );
};

export default RazorpayPaymentButtons; 