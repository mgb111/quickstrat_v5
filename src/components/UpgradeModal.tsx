import React, { useState } from 'react';
import RazorpayPaymentButtons from './RazorpayPaymentButtons';
import { supabase } from '../lib/supabase';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'pdf_unlock', billing: 'one_time') => void;
  onPaymentError?: (error: any) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [userId, setUserId] = useState<string | null>(null);
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col items-center justify-center p-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock PDF Export</h2>
        <p className="text-gray-600 mb-6">Export your campaign as a PDF for just <span className='font-bold text-blue-600'>$9</span>. One-time payment per campaign.</p>
        {userId && (
          <RazorpayPaymentButtons
            userId={userId}
            amount={9}
            purpose="pdf_unlock"
            endpoint={"https://uyjqtojxwpfndrmuscag.supabase.co/functions/v1/create-razorpay-order"}
            onPaymentSuccess={() => {
              onClose();
              if (onUpgrade) onUpgrade('pdf_unlock', 'one_time');
            }}
          />
        )}
        <button onClick={onClose} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Close</button>
      </div>
    </div>
  );
};

export default UpgradeModal; 