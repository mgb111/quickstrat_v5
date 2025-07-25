import React, { useRef, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen || !formRef.current) return;
    // Remove any previous script
    formRef.current.innerHTML = '';
    // Create script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    script.setAttribute('data-payment_button_id', 'pl_QxAh72HwZ2uWn5');
    formRef.current.appendChild(script);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onFocus = () => {
      // Ask user if payment was completed
      if (window.confirm('Did you complete the payment successfully?')) {
        onClose(true);
      } else {
        onClose(false);
      }
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
        <form ref={formRef}></form>
        <button
          className="text-blue-600 hover:underline text-sm mt-4"
          onClick={() => onClose(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
