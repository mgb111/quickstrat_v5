import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Lock, Loader2 } from 'lucide-react';

// Razorpay payment link for $9 per campaign
const RAZORPAY_LINK = 'https://rzp.io/rzp/mtrC39q';

type PaywallOverlayProps = {
  campaignId: string;
  price?: string;
  className?: string;
  onUnlock?: () => void;
};

export default function PaywallOverlay({ campaignId, price = '$9', className = '', onUnlock }: PaywallOverlayProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const win = window.open(RAZORPAY_LINK, '_blank', 'noopener,noreferrer');
    const poll = setInterval(() => {
      if (!win || win.closed) {
        clearInterval(poll);
        setIsProcessing(false);
        // Mark this campaign as paid in localStorage
        localStorage.setItem(`pdf_paid_${campaignId}`, 'true');
        toast.success('Payment successful! PDF unlocked for this campaign.', {
          duration: 6000,
          style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
        });
        if (onUnlock) onUnlock();
      }
    }, 700);
  };

  return (
    <div className={`absolute inset-0 z-40 bg-white/80 backdrop-blur flex flex-col items-center justify-center rounded-lg border-2 border-blue-200 ${className}`}>
      <Lock className="w-12 h-12 text-blue-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Unlock PDF Export ($9)</h2>
      <ul className="mb-4 text-gray-700 text-sm space-y-1">
        <li>✅ Download this campaign's PDF</li>
        <li>✅ Campaign is always saved</li>
        <li>✅ Pay only when you want the PDF</li>
      </ul>
      <div className="mb-4 font-semibold text-lg">One-time payment of <span className="text-blue-600">$9</span></div>
      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center font-bold text-base shadow transition"
      >
        {isProcessing ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
        Pay via Razorpay
      </button>
      <p className="mt-4 text-xs text-gray-500 text-center">
        After payment, your account will be upgraded within a few hours.<br />
        You'll get an email once it's active.
      </p>
    </div>
  );
}

