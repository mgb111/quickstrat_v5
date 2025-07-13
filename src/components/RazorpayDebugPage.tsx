import React, { useEffect } from 'react';

const RazorpayDebugPage: React.FC = () => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Razorpay Payment Button Debug</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Monthly Premium</h2>
          <p className="text-gray-600 mb-4">Button ID: pl_QsXORcrhWghFgg</p>
          <form>
            <script 
              src="https://checkout.razorpay.com/v1/payment-button.js" 
              data-payment_button_id="pl_QsXORcrhWghFgg" 
              async
            />
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Annual Premium</h2>
          <p className="text-gray-600 mb-4">Button ID: pl_QsXQiWLwBcQ8x5</p>
          <form>
            <script 
              src="https://checkout.razorpay.com/v1/payment-button.js" 
              data-payment_button_id="pl_QsXQiWLwBcQ8x5" 
              async
            />
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Debug Information</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Check browser console for any errors</li>
            <li>• Verify button IDs are correct in Razorpay dashboard</li>
            <li>• Ensure buttons are active and not deleted</li>
            <li>• Check if you're using the correct environment (test/live)</li>
            <li>• Verify domain restrictions in button settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RazorpayDebugPage; 