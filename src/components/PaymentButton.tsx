import React from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RAZORPAY_LINK = 'https://rzp.io/rzp/mtrC39q';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const onFocus = () => {
      onClose();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Unlock PDF Export</h2>
        <p className="mb-6 text-gray-700 text-center">To download your PDF, please complete a one-time payment.</p>
        <form>
          <script src="https://checkout.razorpay.com/v1/payment-button.js" data-payment_button_id="pl_QxAh72HwZ2uWn5" async></script>
        </form>
        <button
          className="text-blue-600 hover:underline text-sm mt-4"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
