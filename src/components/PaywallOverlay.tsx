import React from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

type PaywallOverlayProps = {
  campaignId: string;
  className?: string;
  onUnlock?: () => void;
  onDownloadPDF?: () => void;
};

// Explicitly use React to prevent build process from stripping it out.
console.log('Using React version:', React.version);

export default function PaywallOverlay({ 
  className = '', 
  onDownloadPDF 
}: PaywallOverlayProps) {
  const handleDownloadPDF = () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    } else {
      toast.error('PDF download handler not configured');
    }
  };

  return (
    <div className={`absolute inset-0 z-40 bg-white/80 backdrop-blur flex flex-col items-center justify-center rounded-lg border-2 border-green-200 ${className}`}>
      <div className="text-green-500 mb-4 text-4xl">✓</div>
      <h2 className="text-xl font-bold mb-4">PDF Export</h2>
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

