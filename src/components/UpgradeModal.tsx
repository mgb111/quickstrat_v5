import React, { useState } from 'react';
import { X, Crown, Check, Star } from 'lucide-react';
import { SubscriptionService } from '../lib/subscriptionService';
import RazorpayPaymentButtons from './RazorpayPaymentButtons';
import { supabase } from '../lib/supabase';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'premium', billing: 'monthly') => void;
  onPaymentSuccess?: (paymentId: string, plan: string, billing: string) => void;
  onPaymentError?: (error: any) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, onPaymentSuccess, onPaymentError }) => {
  const [userId, setUserId] = useState<string | null>(null);
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);
  const plan = SubscriptionService.getPricing().premium['monthly'];
  
  if (!isOpen) return null;

  const handlePaymentSuccess = (paymentId: string, plan: string, billing: string) => {
    console.log('Payment successful:', { paymentId, plan, billing });
    onUpgrade('premium', 'monthly'); // Only 'monthly' supported here
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    // You can add error handling here, like showing a toast notification
  };

  if (!plan) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col items-center justify-center p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing not available</h2>
          <p className="text-gray-600 mb-6">Please contact support or try again later.</p>
          <button onClick={onClose} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Crown className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Upgrade to Premium</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Unlock Your Full Lead Magnet Potential
            </h3>
            <p className="text-gray-600">
              Get unlimited PDF downloads, <strong>5 campaigns per month</strong>, landing page generation, lead capture, and complete end-to-end campaigns
            </p>
          </div>

          {/* Premium Plan Card */}
          <div className="max-w-md mx-auto">
            <div className="border-2 border-blue-200 rounded-xl p-8 hover:border-blue-300 transition-colors relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  ${plan.price}
                  <span className="text-xl font-normal text-gray-500">/{plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm">Perfect for growing businesses</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-blue-800 font-semibold text-sm">
                    📊 <strong>5 campaigns per month</strong> included
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features && plan.features.map((feature: string, index: number) => (
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

              {userId && (
                <RazorpayPaymentButtons
                  userId={userId}
                  amount={plan.price}
                  purpose="Premium Plan"
                  endpoint="/functions/v1/create-razorpay-order" // TODO: Ensure this is correct for your deployment
                />
              )}
            </div>
          </div>

          {/* Free Plan Comparison */}
          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Free Plan Includes:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700">3 campaigns per month</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Concept generation</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Content outlines</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <X className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-gray-500">PDF downloads</span>
                </div>
                <div className="flex items-center">
                  <X className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-gray-500">Advanced customization</span>
                </div>
                <div className="flex items-center">
                  <X className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-gray-500">Priority support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal; 