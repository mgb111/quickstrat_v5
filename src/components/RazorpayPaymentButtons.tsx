

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
  amount?: number; // in INR, defaults to 9 for PDF unlock
  purpose?: string;
  endpoint?: string;
  onPaymentSuccess?: (response: any) => void;
}

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({
  userId,
  amount = 9, // Default to $9 for PDF unlock
  purpose = 'pdf_unlock',
  endpoint,
  onPaymentSuccess
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    
    loadRazorpay().catch(console.error);
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
        const apiUrl = endpoint || 
          import.meta.env.VITE_RAZORPAY_ORDER_ENDPOINT || 
          'https://uyjqtojxwpfndrmuscag.supabase.co/functions/v1/create-razorpay-order';
        
        console.log('Calling Razorpay endpoint:', apiUrl);
        
        let response: Response;
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ 
              userId, 
              amount, 
              purpose,
              currency: 'USD' // Ensure backend knows we're using USD
            }),
            credentials: 'include',
            mode: 'cors'
          });
        } catch (err) {
          lastError = err;
          console.error('Network error during fetch:', err);
          throw new Error('Network request failed. Please check your internet connection and try again.');
        }

        // Log response status and headers for debugging
        console.log('Response status:', response.status, response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        let responseData: any = {};
        try {
          const responseText = await response.text();
          console.log('Raw response:', responseText);
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          console.error('Failed to parse response JSON:', e);
          throw new Error('Invalid response from server. Please try again later.');
        }

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication or permission error. Please log out and log in again.');
          }
          throw new Error(responseData?.error || `Failed to create payment order (status ${response.status})`);
        }

        const { orderId } = responseData;
        if (!orderId) {
          throw new Error('Payment server did not return a valid order ID');
        }

        if (!window.Razorpay) {
          throw new Error('Payment processor not available. Please try again.');
        }

        // 2. Open Razorpay Checkout
        // Ensure amount is in the smallest currency unit (cents for USD)
        const amountInCents = Math.round(amount * 100);
        
        const rzp = new window.Razorpay({
          key: 'rzp_test_6DK6qaeZ98ZTxA', // Using test key
          amount: amountInCents,
          currency: 'USD',
          name: 'Majorbeam',
          description: purpose,
          order_id: orderId,
          handler: (response: any) => {
            console.log('Payment successful:', response);
            if (onPaymentSuccess) onPaymentSuccess(response);
          },
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '+919999999999'
          },
          notes: { userId, purpose },
          theme: { color: '#3b82f6' }
        });

        rzp.on('payment.failed', (response: any) => {
          const errorMsg = `Payment failed: ${response.error?.description || 'Unknown error'}`;
          console.error('Payment failed:', response.error);
          setErrorMsg(errorMsg);
          alert(errorMsg);
        });

        rzp.open();
        setLoading(false);
        return;

      } catch (error: any) {
        console.error('Payment error:', error);
        
        if (retries < maxRetries) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }
        
        // Final error after retries
        let message = 'Payment error: ';
        if (error?.name === 'TypeError' && /fetch/i.test(error.message)) {
          message = 'Network error. Please check your connection, disable ad-blockers, and ensure you have a stable internet connection. If the problem persists, try again later or contact support.';
        } else {
          message += error?.message || 'An unknown error occurred.';
        }
        
        setErrorMsg(message);
        alert(message);
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
        disabled={loading}
        className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition ${
          loading ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Processing...' : `Unlock PDF Export ($${amount})`}
      </button>
    </div>
  );
};

export default RazorpayPaymentButtons; 