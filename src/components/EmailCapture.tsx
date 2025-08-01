import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { AnalyticsService, AnalyticsEvents } from '../lib/analyticsService';

interface EmailCaptureProps {
  onEmailSubmitted: () => void;
  campaignId?: string;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ onEmailSubmitted, campaignId }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting || localSubmitting) return;
    setLocalSubmitting(true);
    setIsSubmitting(true);
    setError(null);
    
    // Track email capture attempt
    await AnalyticsService.trackConversion(AnalyticsEvents.EMAIL_CAPTURE, {
      email_provided: true,
      campaign_id: campaignId
    });
    
    try {
      await onEmailSubmitted();
      setEmail('');
      
      // Track successful email capture
      await AnalyticsService.trackConversion('email_capture_success', {
        email_provided: true,
        campaign_id: campaignId
      });
    } catch (err: any) {
      // Track email capture error
      await AnalyticsService.trackError('email_capture_failed', err.message || 'Unknown error', 'email_capture', {
        campaign_id: campaignId
      });
      
      setError('Failed to submit email. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLocalSubmitting(false);
    }
  };

  if (false) { // isSubmitted is removed, so this block will always be false
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">Email Submitted Successfully!</h3>
        <p className="text-green-700">Your lead magnet is ready for download below.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Your Free Lead Magnet</h3>
        <p className="text-gray-600">Enter your email to download your personalized lead magnet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
            required
            disabled={isSubmitting || localSubmitting}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || localSubmitting || !email.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Get My Lead Magnet
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        We respect your privacy. Your email will only be used to send you the lead magnet.
      </p>
    </div>
  );
};

export default EmailCapture;