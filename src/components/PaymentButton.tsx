import React, { useRef, useEffect, useState } from 'react';
import { LeadMagnetFormat } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
  selectedFormat?: LeadMagnetFormat;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, selectedFormat = 'pdf' }) => {
  
  // Get format-aware content text
  const getContentText = () => {
    switch (selectedFormat) {
      case 'interactive_quiz': return 'quiz';
      case 'pdf': return 'PDF';
      default: return 'PDF';
    }
  };
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const monthlyPrice = 19;
  const yearlyPrice = 199;

  useEffect(() => {
    if (!isOpen || !formRef.current) return;
    
    // Reset state when modal opens
    setPaymentStatus('pending');
    setPaymentMessage('');
    setBillingCycle('monthly');
    
    // Track payment modal opened
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: billingCycle === 'monthly' ? monthlyPrice : yearlyPrice,
        items: [{
          item_id: 'premium_plan',
          item_name: `Premium Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
          price: billingCycle === 'monthly' ? monthlyPrice : yearlyPrice,
          quantity: 1
        }]
      });
    }
    
    // Remove any previous script
    formRef.current.innerHTML = '';
    // Create script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.setAttribute('data-payment_button_id', 'pl_QzFk7otoHrBzkf');
    formRef.current.appendChild(script);
  }, [isOpen, billingCycle]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleFocus = () => {
      // When window regains focus, payment might be complete
      setPaymentStatus('processing');
      setPaymentMessage('Processing your payment...');
      
      // Give user time to see the processing state
      setTimeout(() => {
        setPaymentStatus('success');
        setPaymentMessage(`Payment successful! Your ${getContentText()} is ready to access.`);
        
        // Track payment success with Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', {
            transaction_id: Date.now().toString(),
            value: billingCycle === 'monthly' ? monthlyPrice : yearlyPrice,
            currency: 'USD',
            items: [{
              item_id: 'premium_plan',
              item_name: `Premium Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
              price: billingCycle === 'monthly' ? monthlyPrice : yearlyPrice,
              quantity: 1
            }]
          });
        }
        
        // Auto-close after showing success message
        setTimeout(() => {
          onClose(true);
        }, 2000);
      }, 1500);
    };

    const handleMessage = (event: MessageEvent) => {
      // Listen for Razorpay payment events
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'razorpay_payment_success') {
          setPaymentStatus('success');
          setPaymentMessage(`Payment successful! Your ${getContentText()} is ready to access.`);
          
          // Track payment success with Google Analytics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'purchase', {
              transaction_id: Date.now().toString(),
              value: billingCycle === 'monthly' ? monthlyPrice : yearlyPrice,
              currency: 'USD',
              items: [{
                item_id: 'premium_plan',
                item_name: `Premium Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
                price: billingCycle === 'monthly' ? monthlyPrice : yearlyPrice,
                quantity: 1
              }]
            });
          }
          
          setTimeout(() => onClose(true), 2000);
        } else if (event.data.type === 'razorpay_payment_failed') {
          setPaymentStatus('failed');
          setPaymentMessage('Payment failed. Please try again.');
          
          // Track payment failure with Google Analytics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'payment_failed', {
              value: billingCycle === 'monthly' ? monthlyPrice : yearlyPrice,
              currency: 'USD'
            });
          }
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onClose, billingCycle]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return '💳';
      case 'processing':
        return '⏳';
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '💳';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'text-gray-700';
      case 'processing':
        return 'text-gray-700';
      case 'success':
        return 'text-gray-700';
      case 'failed':
        return 'text-black';
      default:
        return 'text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center relative">
        {paymentStatus === 'pending' && (
          <>
            <h2 className="text-xl font-bold mb-4">Upgrade to Premium</h2>
            <p className="mb-6 text-gray-700 text-center">Unlock unlimited campaigns and all premium features</p>
            
            {/* Pricing Display */}
            <div className="mb-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${monthlyPrice}
                <span className="text-lg font-normal text-gray-500">
                  /month
                </span>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                for 3 campaigns
              </div>
            </div>
            
            {/* Plan Features */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg w-full">
              <h3 className="font-semibold text-gray-900 mb-3 text-center">Premium Plan Includes:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">✅</span>
                  <span><strong>3 Campaigns</strong> - Create up to 3 complete lead magnet campaigns</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">✅</span>
                  <span><strong>Professional PDF Generation</strong> - Beautiful, branded lead magnets</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">✅</span>
                  <span><strong>Landing Page Creation</strong> - High-converting pages to capture leads</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">✅</span>
                  <span><strong>Email Capture System</strong> - With export functionality</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">✅</span>
                  <span><strong>Priority Support</strong> - Get help when you need it</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">✅</span>
                  <span><strong>API Access</strong> - Integrate with your existing tools</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg w-full">
              <div className="text-sm text-gray-700">
                <strong>💡 Tip:</strong> After payment, you'll have access to create 3 complete campaigns.
              </div>
            </div>
            
            {/* Payment Button */}
            <div className="w-full mb-4">
              <form ref={formRef} className="w-full">
                {/* Razorpay payment button will be rendered here */}
              </form>
            </div>
            
            <button
              className="text-gray-700 hover:underline text-sm mt-4"
              onClick={() => {
                // Track payment cancelled
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'remove_from_cart', {
                    currency: 'USD',
                    value: monthlyPrice,
                    items: [{
                      item_id: 'premium_plan',
                      item_name: 'Premium Plan - Monthly',
                      price: monthlyPrice,
                      quantity: 1
                    }]
                  });
                }
                onClose(false);
              }}
            >
              Cancel
            </button>
            </>
          )}
          


        {paymentStatus === 'processing' && (
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
            <div className="mt-4 w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-sm text-gray-500">
              If you've completed payment, click below:
            </div>
            <button
              className="mt-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
              onClick={() => {
                setPaymentStatus('success');
                setPaymentMessage(`Payment successful! Your ${getContentText()} is ready to access.`);
                setTimeout(() => onClose(true), 2000);
              }}
            >
              I Completed Payment
            </button>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2 text-gray-700">Payment Successful!</h2>
            <p className="text-gray-600">Your {getContentText()} is now ready to access.</p>
            <div className="mt-4 text-sm text-gray-500">
              The download will start automatically...
            </div>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => onClose(true)}
            >
              Download Now
            </button>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2 text-black">Payment Failed</h2>
            <p className="text-gray-600">Please try again or contact support if the issue persists.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                setPaymentStatus('pending');
                setPaymentMessage('');
              }}
            >
              Try Again
            </button>
            <button
              className="mt-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => onClose(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
