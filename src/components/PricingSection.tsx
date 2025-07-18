import React, { useState } from 'react';
import { Check, Crown, Star } from 'lucide-react';
import { SubscriptionService } from '../lib/subscriptionService';
import RazorpayPaymentButtons from './RazorpayPaymentButtons';

interface PricingSectionProps {
  onLogin: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  onLogin
}) => {
  const pricing = SubscriptionService.getPricing();

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
                ${pricing.premium.monthly.price}
                <span className="text-xl font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600 mb-2">Perfect for growing businesses</p>
              <div className="text-sm text-blue-700 font-semibold mb-2">
                Includes {pricing.premium.monthly.includedCampaigns} campaigns/month<br/>
                <span className="text-gray-700">$14 for each additional campaign</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {pricing.premium.monthly.features.map((feature: string, index: number) => (
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
            <div className="flex justify-center mt-6">
              <RazorpayPaymentButtons billingCycle="monthly" />
            </div>
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