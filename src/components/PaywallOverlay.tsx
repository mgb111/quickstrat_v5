import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Lock, Loader2 } from 'lucide-react';

const RAZORPAY_LINK = 'https://rzp.io/r/your-link-here'; // <-- Replace with your actual link

export default function PaywallOverlay({ price = '$49', className = '' }: { price?: string; className?: string }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const win = window.open(RAZORPAY_LINK, '_blank', 'noopener,noreferrer');
    const poll = setInterval(() => {
      if (!win || win.closed) {
        clearInterval(poll);
        setIsProcessing(false);
        toast.success("Thanks! Your account will be upgraded within a few hours. You'll get an email once it's active.", {
          duration: 8000,
          style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
        });
      }
    }, 700);
  };

  return (
    <div className={`absolute inset-0 z-40 bg-white/80 backdrop-blur flex flex-col items-center justify-center rounded-lg border-2 border-blue-200 ${className}`}>
      <Lock className="w-12 h-12 text-blue-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Unlock Full Campaign Access</h2>
      <ul className="mb-4 text-gray-700 text-sm space-y-1">
        <li>✅ Download full PDF</li>
        <li>✅ Get emails & social assets</li>
        <li>✅ Unlock 4 more campaigns</li>
      </ul>
      <div className="mb-4 font-semibold text-lg">One-time payment of <span className="text-blue-600">{price}</span></div>
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
