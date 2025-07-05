import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailCaptureProps {
  onEmailSubmitted: () => void;
  campaignData?: {
    brandName: string;
    pdfContent: any;
    landingPage: any;
    socialPosts: any;
  };
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ onEmailSubmitted, campaignData }) => {
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
          campaign_id: null, // You can add campaign tracking later
          pdf_downloaded: false
        });

      if (insertError) {
        console.error('Database error:', insertError);
        throw new Error('Failed to save email to database');
      }

      // Send email via Supabase Edge Function
      if (campaignData) {
        try {
          const { data, error: functionError } = await supabase.functions.invoke('send-email', {
            body: {
              email,
              campaignData
            }
          });

          if (functionError) {
            console.error('Email function error:', functionError);
            // Don't throw here - we still want to show success since email was saved
            console.warn('Email sending failed, but email was saved to database');
          } else {
            console.log('Email sent successfully:', data);
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // Don't throw here - we still want to show success since email was saved
          console.warn('Email sending failed, but email was saved to database');
        }
      }

      setIsSubmitted(true);
      onEmailSubmitted();
      
    } catch (err: any) {
      console.error('Email capture error:', err);
      setError('Failed to process your request. Please try again or download the PDF directly below.');
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
        <h3 className="text-xl font-bold text-green-900 mb-2">Email Submitted Successfully!</h3>
        <p className="text-green-800 mb-4">
          Your email has been saved and we're working on sending your campaign materials.
        </p>
        <p className="text-sm text-green-700">
          You can also download your PDF directly below while we process your email.
        </p>
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">Get Your Complete Campaign Package</h3>
        <p className="text-gray-600">Enter your email to receive your lead magnet and bonus resources.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm text-center">{error}</p>
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
              Send My Campaign
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-3">
        We respect your privacy. No spam, unsubscribe anytime.
      </p>
    </div>
  );
};

export default EmailCapture;