import React, { useState } from 'react';

const RazorpayTestButtons: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Razorpay Payment Button Test</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Billing Cycle:
        </label>
        <select 
          value={billingCycle} 
          onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="monthly">Monthly Premium</option>
          <option value="yearly">Annual Premium</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {billingCycle === 'monthly' ? 'Monthly Premium' : 'Annual Premium'} Payment Button:
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Button ID: {billingCycle === 'monthly' ? 'pl_QsXORcrhWghFgg' : 'pl_QsXQiWLwBcQ8x5'}
        </p>
      </div>

      {billingCycle === 'monthly' ? (
        <form>
          <script 
            src="https://checkout.razorpay.com/v1/payment-button.js" 
            data-payment_button_id="pl_QsXORcrhWghFgg" 
            async
          />
        </form>
      ) : (
        <form>
          <script 
            src="https://checkout.razorpay.com/v1/payment-button.js" 
            data-payment_button_id="pl_QsXQiWLwBcQ8x5" 
            async
          />
        </form>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-semibold mb-2">Debug Information:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Current billing cycle: {billingCycle}</li>
          <li>• Payment button ID: {billingCycle === 'monthly' ? 'pl_QsXORcrhWghFgg' : 'pl_QsXQiWLwBcQ8x5'}</li>
          <li>• Script URL: https://checkout.razorpay.com/v1/payment-button.js</li>
          <li>• Check browser console for any errors</li>
        </ul>
      </div>
    </div>
  );
};

export default RazorpayTestButtons; 