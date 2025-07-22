import React, { useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: new (options: any) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

interface RazorpayPaymentButtonsProps {
  userId: string;
  amount: number; // in INR
  purpose?: string;
  endpoint?: string;
}

interface RazorpayPaymentButtonsProps {
  userId: string;
  amount: number;
  purpose?: string;
  endpoint?: string;
  onPaymentUpgradeSuccess?: (user: any) => void;
}

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({ userId, amount, purpose, endpoint, onPaymentUpgradeSuccess }) => {
  // Robust error state for UI/diagnostics
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve, reject) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
          setErrorMsg('Failed to load Razorpay script. Please check your network or adblocker settings and try again.');
          reject(new Error('Failed to load Razorpay script.'));
        };
        document.body.appendChild(script);
      });
    };
    loadRazorpay().catch(() => {});
  }, []);

  const handlePay = async () => {
    setErrorMsg(null);
    setLoading(true);
    let retries = 0;
    const maxRetries = 2;
    let lastError: any = null;
    while (retries <= maxRetries) {
      try {
        // 1. Call backend to create Razorpay order
        const apiUrl = endpoint || 'https://uyjqtojxwpfndrmuscag.supabase.co/functions/v1/create-razorpay-order';
        console.log('Calling Razorpay endpoint:', apiUrl);
        let response: Response;
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, amount, purpose }),
            credentials: 'include'
          });
        } catch (err) {
          // Network/CORS error
          lastError = err;
          if (retries < maxRetries) {
            retries++;
            await new Promise(res => setTimeout(res, 1000 * retries));
            continue;
          }
          setErrorMsg('Network error or CORS issue while connecting to payment server. Please check your connection, disable adblockers, and try again. If the problem persists, contact support.');
          setLoading(false);
          return;
        }
        let responseData: any = {};
        try {
          responseData = await response.json();
        } catch (e) {
          responseData = {};
        }
        console.log('Razorpay order response:', responseData);
        if (!response.ok) {
          throw new Error(responseData?.error || 'Failed to create payment order');
        }
        const { orderId, error: orderError } = responseData;
        if (!orderId) {
          throw new Error(orderError || 'Failed to get orderId from backend');
        }
        if (!window.Razorpay) {
          throw new Error('Razorpay SDK not loaded. Please try again.');
        }
        // 2. Open Razorpay Checkout with real orderId and live key
        const options = {
        key: 'rzp_test_6DK6qaeZ98ZTxA', // Using provided test key for Razorpay
        amount: amount * 100,
        currency: 'INR',
        name: 'Majorbeam',
        description: purpose || 'Premium Plan',
        order_id: orderId,
        handler: async function (response: any) {
          console.log('Payment successful:', response);
          // Call backend to upgrade user after payment
          try {
            const upgradeRes = await fetch('https://uyjqtojxwpfndrmuscag.supabase.co/functions/v1/upgrade-user-after-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id
              })
            });
            const upgradeData = await upgradeRes.json();
            if (!upgradeRes.ok || !upgradeData.success) {
              alert('Payment succeeded, but failed to upgrade your account. Please contact support.');
              return;
            }
            // Notify parent to refresh subscription state and close modal
            if (typeof onPaymentUpgradeSuccess === 'function') {
              onPaymentUpgradeSuccess(upgradeData.user);
            }
          } catch (e) {
            alert('Payment succeeded, but backend upgrade failed. Please contact support.');
            return;
          }
        },
        prefill: {
          name: 'Customer Name', // You can prefill these from user data
          email: 'customer@example.com',
          contact: '+919999999999'
        },
        notes: { userId, purpose },
        theme: { color: '#3b82f6' }
      };
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        setErrorMsg(`Payment failed: ${response.error?.description || 'Unknown error'}`);
        alert(`Payment failed: ${response.error?.description || 'Unknown error'}`);
      });
      rzp.open();
      setLoading(false);
      return;
      } catch (error: any) {
        lastError = error;
        if (retries < maxRetries) {
          retries++;
          await new Promise(res => setTimeout(res, 1000 * retries));
          continue;
        }
        // Final error after retries
        let msg = 'Payment error: ';
        if (error?.name === 'TypeError' && /fetch/i.test(error.message)) {
          msg += 'Network or CORS error. Please check your connection, disable adblockers, and try again.';
        } else {
          msg += error?.message || 'An unknown error occurred.';
        }
        setErrorMsg(msg);
        alert(msg);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded p-2 text-sm">
          {errorMsg}
        </div>
      )}
      <button
        onClick={handlePay}
        className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay with Razorpay'}
      </button>
    </div>
  );
};

export default RazorpayPaymentButtons; 