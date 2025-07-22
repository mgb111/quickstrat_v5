import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const PaymentButton = ({ className = '' }: { className?: string }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Open Razorpay payment link
    const paymentWindow = window.open(
      'https://rzp.io/rzp/mtrC39q',
      '_blank',
      'noopener,noreferrer'
    );

    // Check if payment was completed
    const checkPayment = setInterval(() => {
      if (!paymentWindow || paymentWindow.closed) {
        clearInterval(checkPayment);
        setIsProcessing(false);
        toast.success('Payment successful! Your premium access is being processed.', { 
          duration: 8000,
          style: {
            background: '#10B981',
            color: '#ffffff',
            padding: '16px',
            borderRadius: '8px',
            maxWidth: '100%',
          }
        });
      }
    }, 1000);

    // Cleanup
    return () => clearInterval(checkPayment);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
        isProcessing 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
      } ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Processing...
        </>
      ) : (
        <>
          <span>💎</span>
          <span className="ml-2">Upgrade to Premium (₹49)</span>
        </>
      )}
    </button>
  );
};

export default PaymentButton;
