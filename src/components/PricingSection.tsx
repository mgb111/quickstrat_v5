import React, { useState } from 'react';
import { Check, Crown, Star } from 'lucide-react';
import { SubscriptionService } from '../lib/subscriptionService';
import RazorpayPaymentButtons from './RazorpayPaymentButtons';

interface PricingSectionProps {
  onPaymentSuccess?: (paymentId: string, plan: string, billing: string) => void;
  onPaymentError?: (error: any) => void;
  onLogin: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  onPaymentSuccess,
  onPaymentError,
  onLogin
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showPaymentButtons, setShowPaymentButtons] = useState(false);
  const pricing = SubscriptionService.getPricing();

  const handlePaymentSuccess = (paymentId: string, plan: string, billing: string) => {
    console.log('Payment successful:', { paymentId, plan, billing });
    onPaymentSuccess?.(paymentId, plan, billing);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    onPaymentError?.(error);
  };

  const handleUpgradeClick = () => {
    setShowPaymentButtons(true);
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free, upgrade when you're ready to scale your lead generation
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 flex items-center shadow-sm border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-md font-medium transition-colors relative ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
              {billingCycle === 'monthly' && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </span>
              )}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              {billingCycle === 'yearly' && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 32%
                </span>
              )}
            </button>
          </div>
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
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">3 campaigns per month</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Concept generation</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Content outlines</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
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
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <Crown className="h-4 w-4 mr-2" />
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-blue-600 mb-1">
                ${pricing.premium[billingCycle].price}
                <span className="text-xl font-normal text-gray-500">/{pricing.premium[billingCycle].period}</span>
              </div>
              {billingCycle === 'yearly' && (
                <div className="text-sm text-green-600 font-medium mb-2">
                  Save ${pricing.premium.yearly.savings} per year
                </div>
              )}
              <p className="text-gray-600">Perfect for growing businesses</p>
            </div>

            <ul className="space-y-4 mb-8">
              {pricing.premium[billingCycle].features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    {feature.includes('5 campaigns') ? (
                      <strong className="text-blue-600">{feature}</strong>
                    ) : (
                      feature
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {/* Always show Razorpay payment button for the selected billing cycle */}
            <RazorpayPaymentButtons billingCycle={billingCycle} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include 24/7 support and a 30-day money-back guarantee
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Secure payments
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 