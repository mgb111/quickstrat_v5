import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  onLogin: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  onLogin
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const monthlyPrice = 19;
  const yearlyPrice = 199; // $199 yearly

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free with unlimited outlines. Unlock complete campaigns with PDF, landing page, and email export.
          </p>
        </div>



        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                $0
                <span className="text-xl font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Unlimited content outlines</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">AI content ideas</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Concept generation</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Basic templates</span>
              </li>
            </ul>

            <button 
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              onClick={onLogin}
            >
              Get Started Free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-700 p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gray-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                ${monthlyPrice}
                <span className="text-xl font-normal text-gray-500">
                  /month
                </span>
              </div>
              <p className="text-gray-600">for 3 campaigns</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Everything in Free</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">3 campaigns per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">PDF download & unlock</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Landing page generation</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Email capture & export</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Advanced customization</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gray-700 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>

            <button 
              className="w-full bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              onClick={onLogin}
            >
              Start Premium
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-gray-700" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-gray-700" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-gray-700" />
              Secure payments
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 