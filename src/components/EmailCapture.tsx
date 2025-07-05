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
      // Store email in Supabase
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
      
      // Optional: Here you could integrate with Resend or another email service
      // await sendEmailWithAssets(email, campaignData);
      
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
        <h3 className="text-xl font-bold text-green-900 mb-2">Your campaign was sent to your inbox!</h3>
        <p className="text-green-800 mb-4">Check your email for the complete lead magnet package.</p>
        <p className="text-sm text-green-700">Don't see it? Check your spam folder or try downloading below.</p>
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">Want to download your full PDF?</h3>
        <p className="text-gray-600">Get it via email along with bonus templates and resources.</p>
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
              Sending Assets...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Send My Assets
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