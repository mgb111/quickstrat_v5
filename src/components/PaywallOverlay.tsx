import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Lock, Loader2, Download } from 'lucide-react';

// Razorpay payment link for $9 per campaign
const RAZORPAY_LINK = 'https://rzp.io/rzp/mtrC39q';

type PaywallOverlayProps = {
  campaignId: string;
  className?: string;
  onUnlock?: () => void;
  onDownloadPDF?: () => void;
};

// Explicitly use React to prevent build process from stripping it out.
console.log('Using React version:', React.version);

export default function PaywallOverlay({ 
  campaignId, 
  className = '', 
  onUnlock,
  onDownloadPDF 
}: PaywallOverlayProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Check if already paid for this campaign
  useEffect(() => {
    const paid = localStorage.getItem(`pdf_paid_${campaignId}`) === 'true';
    setIsPaid(paid);
  }, [campaignId]);

  const handlePay = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    let win: Window | null = null;
    try {
      win = window.open(RAZORPAY_LINK, '_blank', 'noopener,noreferrer');
    } catch (e) {
      win = null;
    }
    if (!win) {
      toast.error('Popup blocked! Please allow popups for this site to make a payment.');
      setIsProcessing(false);
      return;
    }
    // Focus the window if possible
    try { win.focus(); } catch {}
    // Check every second if the payment window is closed
    const paymentCheck = setInterval(() => {
      if (win && win.closed) {
        clearInterval(paymentCheck);
        handlePaymentSuccess();
      }
    }, 1000);
    // Set a timeout in case the window is closed by the user without payment
    setTimeout(() => {
      clearInterval(paymentCheck);
      setIsProcessing(false);
    }, 300000); // 5 minutes timeout
  };

  const handlePaymentSuccess = () => {
    setIsProcessing(false);
    // Mark this campaign as paid in localStorage
    localStorage.setItem(`pdf_paid_${campaignId}`, 'true');
    setIsPaid(true);
    
    toast.success('Payment successful! You can now download your PDF.', {
      duration: 5000,
      style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
    });
    
    if (onUnlock) onUnlock();
  };

  const handleDownloadPDF = () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    } else {
      toast.error('PDF download handler not configured');
    }
  };

  if (isPaid) {
    return (
      <div className={`absolute inset-0 z-40 bg-white/80 backdrop-blur flex flex-col items-center justify-center rounded-lg border-2 border-green-200 ${className}`}>
        <div className="text-green-500 mb-4 text-4xl">✓</div>
        <h2 className="text-xl font-bold mb-4">PDF Export Unlocked!</h2>
        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center font-bold text-base shadow transition"
        >
          <Download className="mr-2 h-5 w-5" />
          Download PDF
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-40 bg-white/80 backdrop-blur flex flex-col items-center justify-center rounded-lg border-2 border-blue-200 ${className}`}>
      <Lock className="w-12 h-12 text-blue-500 mb-4" />
      <h2 className="text-xl font-bold mb-2 text-center">Unlock PDF Export</h2>
      <ul className="mb-4 text-gray-700 text-sm space-y-1 text-center">
        <li>✅ One-time payment of just $9</li>
        <li>✅ Instant access to download</li>
        <li>✅ No subscription needed</li>
      </ul>
      <div className="mb-4 font-semibold text-lg">Only <span className="text-blue-600">$9</span> one time</div>
      
      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center font-bold text-base shadow transition min-w-[200px] justify-center"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Processing...
          </>
        ) : (
          'Pay Now with Razorpay'
        )}
      </button>
      
      <p className="mt-4 text-xs text-gray-500 text-center max-w-[280px]">
        Secure payment processed by Razorpay. Your financial data is never stored on our servers.
      </p>
    </div>
  );
}

