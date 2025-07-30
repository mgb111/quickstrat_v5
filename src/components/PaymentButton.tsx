import React, { useRef, useEffect, useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    if (!isOpen || !formRef.current) return;
    
    // Reset state when modal opens
    setPaymentStatus('pending');
    setPaymentMessage('');
    
    // Track payment modal opened
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: 49.00,
        items: [{
          item_id: 'pdf_download',
          item_name: 'Lead Magnet PDF',
          price: 49.00,
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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleFocus = () => {
      // When window regains focus, payment might be complete
      setPaymentStatus('processing');
      setPaymentMessage('Processing your payment...');
      
      // Give user time to see the processing state
      setTimeout(() => {
        setPaymentStatus('success');
        setPaymentMessage('Payment successful! Your PDF is ready to download.');
        
        // Track payment success with Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'purchase', {
            transaction_id: Date.now().toString(),
            value: 49.00,
            currency: 'INR',
            items: [{
              item_id: 'pdf_download',
              item_name: 'Lead Magnet PDF',
              price: 49.00,
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
          setPaymentMessage('Payment successful! Your PDF is ready to download.');
          
          // Track payment success with Google Analytics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'purchase', {
              transaction_id: Date.now().toString(),
              value: 49.00,
              currency: 'INR',
              items: [{
                item_id: 'pdf_download',
                item_name: 'Lead Magnet PDF',
                price: 49.00,
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
              value: 49.00,
              currency: 'INR'
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
  }, [isOpen, onClose]);

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
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center relative">
        {paymentStatus === 'pending' && (
          <>
            <h2 className="text-xl font-bold mb-4">Unlock PDF Export</h2>
            <p className="mb-6 text-gray-700 text-center">To download your PDF, please complete a one-time payment.</p>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> After payment, return to this tab and your PDF will download automatically.
              </div>
            </div>
            <form ref={formRef}></form>
            <button
              className="text-blue-600 hover:underline text-sm mt-4"
              onClick={() => {
                // Track payment cancelled
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'remove_from_cart', {
                    currency: 'INR',
                    value: 49.00,
                    items: [{
                      item_id: 'pdf_download',
                      item_name: 'Lead Magnet PDF',
                      price: 49.00,
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
            <div className="mt-4 w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="mt-4 text-sm text-gray-500">
              If you've completed payment, click below:
            </div>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              onClick={() => {
                setPaymentStatus('success');
                setPaymentMessage('Payment successful! Your PDF is ready to download.');
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
            <h2 className="text-xl font-bold mb-2 text-green-600">Payment Successful!</h2>
            <p className="text-gray-600">Your PDF is now ready to download.</p>
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
            <h2 className="text-xl font-bold mb-2 text-red-600">Payment Failed</h2>
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
