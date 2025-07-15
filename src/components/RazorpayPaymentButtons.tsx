import React, { useEffect, useRef } from 'react';

const BUTTON_IDS = {
  monthly: 'pl_QtIGO5QujXNyrB',
  yearly: 'pl_QtILq0eW8eEBIs'
};

interface RazorpayPaymentButtonsProps {
  billingCycle: 'monthly' | 'yearly';
}

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({ billingCycle }) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!formRef.current) return;
    formRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://cdn.razorpay.com/static/widget/payment-button.js';
    script.setAttribute('data-payment_button_id', BUTTON_IDS[billingCycle]);
    script.async = true;
    formRef.current.appendChild(script);
    return () => {
      if (formRef.current) formRef.current.innerHTML = '';
    };
  }, [billingCycle]);

  return (
    <form ref={formRef} style={{ width: '100%', maxWidth: 400, margin: '0 auto' }} />
  );
};

export default RazorpayPaymentButtons; 