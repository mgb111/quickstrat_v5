import React, { useState } from 'react';
import { Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { CampaignOutput } from '../types/index';
import PDFGenerator from './PDFGenerator';
import EmailCapture from './EmailCapture';

interface ResultsDisplayProps {
  results: CampaignOutput;
  brandName: string;
  onCampaignCreated?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, brandName, onCampaignCreated }) => {
  const [showPDFDownload, setShowPDFDownload] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleEmailSubmitted = () => {
    console.log('Email submitted, showing PDF download');
    console.log('PDF content preview:', results.pdf_content?.substring(0, 200));
    setShowPDFDownload(true);
  };

  console.log('ResultsDisplay render:', { 
    showPDFDownload, 
    hasPdfContent: !!results.pdf_content,
    pdfContentLength: results.pdf_content?.length,
    brandName 
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

      {/* Email Capture Section */}
      <div className="max-w-2xl mx-auto">
        <EmailCapture onEmailSubmitted={handleEmailSubmitted} />
      </div>

      {/* PDF Download - Only show after email is submitted */}
      {showPDFDownload && (
        <div className="max-w-2xl mx-auto">
          <PDFGenerator content={results.pdf_content} brandName={brandName} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Landing Page Copy */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Landing Page Copy</h3>
            <button
              onClick={() => copyToClipboard(
                `${results.landing_page.headline}\n\n${results.landing_page.subheadline}\n\n${results.landing_page.benefit_bullets.join('\n')}\n\nCTA: ${results.landing_page.cta_button_text}`
              )}
              className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Headline</h4>
              <p className="text-blue-800">{results.landing_page.headline}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Subheadline</h4>
              <p className="text-purple-800">{results.landing_page.subheadline}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Benefit Bullets</h4>
              <ul className="text-green-800 space-y-1">
                {results.landing_page.benefit_bullets.map((bullet, index) => (
                  <li key={index}>• {bullet}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">CTA Button</h4>
              <p className="text-orange-800">{results.landing_page.cta_button_text}</p>
            </div>
          </div>
        </div>

        {/* Social Media Posts */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Social Media Posts</h3>

          <div className="space-y-6">
            {/* LinkedIn */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
                    <ExternalLink className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 ml-2">LinkedIn</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(results.social_posts.linkedin)}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{results.social_posts.linkedin}</p>
              </div>
            </div>

            {/* Twitter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 ml-2">X (Twitter)</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(results.social_posts.twitter)}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{results.social_posts.twitter}</p>
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <h4 className="font-semibold text-gray-900 ml-2">Instagram</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(results.social_posts.instagram)}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{results.social_posts.instagram}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;