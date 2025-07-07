import React, { useState } from 'react';
import { Copy, ExternalLink, MessageCircle, Download, Mail } from 'lucide-react';
import { CampaignOutput } from '../types/index';
import PDFGenerator from './PDFGenerator';
import EmailCapture from './EmailCapture';

interface ResultsDisplayProps {
  results: CampaignOutput;
  brandName: string;
  onCampaignCreated?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, brandName, onCampaignCreated }) => {
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleEmailSubmitted = () => {
    console.log('Email submitted successfully');
    setEmailSubmitted(true);
  };

  console.log('ResultsDisplay render:', { 
    hasPdfContent: !!results.pdf_content,
    pdfContentLength: results.pdf_content?.length,
    brandName,
    emailSubmitted
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Campaign is Ready!</h2>
        <p className="text-gray-600">Here's your complete lead magnet campaign</p>
        
        {onCampaignCreated && (
          <div className="mt-6">
            <button
              onClick={onCampaignCreated}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Create Campaign & Go to Dashboard
            </button>
            <p className="text-sm text-gray-500 mt-2">
              This will create your landing page and set up lead capture
            </p>
          </div>
        )}
      </div>

      {/* Email Capture Section - Required for PDF access */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <Mail className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">Enter Your Email to Get Your Lead Magnet</h3>
            <p className="text-gray-600 text-sm">
              Please enter your email to access your personalized PDF guide
            </p>
          </div>
          
          {!emailSubmitted ? (
            <EmailCapture onEmailSubmitted={handleEmailSubmitted} />
          ) : (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">
                  ✅ Email submitted! Your download is ready below.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Download - Only show after email is submitted */}
      {emailSubmitted && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Download className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-900">Download Your Lead Magnet</h3>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Your professional PDF guide is ready for download
            </p>
          </div>
          <PDFGenerator 
            content={(() => {
              const pdfContent: any = results.pdf_content;
              // If results.pdf_content is already structured, use as is
              if (pdfContent && typeof pdfContent === 'object' && (pdfContent as any).structured_content) {
                return pdfContent;
              }
              // If results.pdf_content is a structured object (has title_page, etc.)
              if (pdfContent && typeof pdfContent === 'object' && ((pdfContent as any).title_page || (pdfContent as any).sections)) {
                return { structured_content: pdfContent };
              }
              // If results.pdf_content is a string, wrap as structured_content
              if (typeof pdfContent === 'string') {
                return {
                  structured_content: {
                    title_page: { title: brandName + ' Lead Magnet Guide', subtitle: 'A step-by-step blueprint to help you achieve your goals' },
                    introduction_page: { title: 'Main Content', content: pdfContent },
                    cta_page: { title: 'Take the Next Step', content: `Ready to put these strategies into action? Schedule a free strategy session with our team or reach out to ${brandName || 'our experts'} for personalized support. Your success starts now!` }
                  }
                };
              }
              // Fallback: pass as is
              return pdfContent;
            })()}
            brandName={brandName} 
          />
        </div>
      )}

      {/* Campaign Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Magnet Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg mr-3">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Lead Magnet Content</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">PDF Content</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {typeof results.pdf_content === 'string'
                    ? `${results.pdf_content.substring(0, 300)}...`
                    : results.pdf_content && typeof results.pdf_content === 'object'
                      ? JSON.stringify(results.pdf_content).substring(0, 300) + '...'
                      : 'PDF content is being generated...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Landing Page Copy */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-3">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Landing Page Copy</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Headline</h4>
              <div className="flex items-center space-x-2">
                <p className="text-gray-700 flex-1">{results.landing_page.headline}</p>
                <button
                  onClick={() => copyToClipboard(results.landing_page.headline)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Subheadline</h4>
              <div className="flex items-center space-x-2">
                <p className="text-gray-700 flex-1">{results.landing_page.subheadline}</p>
                <button
                  onClick={() => copyToClipboard(results.landing_page.subheadline)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Benefit Bullets</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="text-gray-700 text-sm space-y-1">
                  {results.landing_page.benefit_bullets.map((bullet, index) => (
                    <li key={index}>• {bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Posts */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Social Media Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LinkedIn */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">LinkedIn</span>
              <button
                onClick={() => copyToClipboard(results.social_posts.linkedin)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{results.social_posts.linkedin}</p>
          </div>
          
          {/* Twitter */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Twitter</span>
              <button
                onClick={() => copyToClipboard(results.social_posts.twitter)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{results.social_posts.twitter}</p>
          </div>
          
          {/* Instagram */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Instagram</span>
              <button
                onClick={() => copyToClipboard(results.social_posts.instagram)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{results.social_posts.instagram}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;