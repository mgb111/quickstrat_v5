import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailCaptureProps {
  onEmailSubmitted: () => void;
  campaignId?: string;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ onEmailSubmitted, campaignId }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Store email in Supabase for future use
      const { error: insertError } = await supabase
        .from('emails')
        .insert({
          email,
          campaign_id: campaignId || null,
          pdf_downloaded: false
        });

      if (insertError) throw insertError;

      setIsSubmitted(true);
      onEmailSubmitted();
      
      // Note: In a real implementation, you would integrate with an email service here
      // For now, we just store the email and provide immediate PDF access
      
    } catch (err: any) {
      console.error('Email capture error:', err);
      setError('Failed to save email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-2">Email submitted successfully!</h3>
        <p className="text-green-800 mb-4">Your PDF guide is now available for download below.</p>
        <p className="text-sm text-green-700">We'll also send you future updates and resources.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Get Your PDF Guide</h3>
        <p className="text-gray-600">Enter your email to download your complete lead magnet PDF guide.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Get My PDF Guide
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-3">
        We'll never spam you. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default EmailCapture;