import React, { useState, useEffect } from 'react';
import { Check, Download, ArrowRight } from 'lucide-react';
import { Campaign } from '../types';
import { CampaignService } from '../lib/campaignService';
import PDFGenerator from './PDFGenerator';

interface LandingPageProps {
  campaignSlug: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ campaignSlug }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPDF, setShowPDF] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  useEffect(() => {
    setError(null); // Clear error when slug changes or fetch starts
    const loadCampaign = async () => {
      try {
        console.log('LandingPage: campaignSlug:', campaignSlug);
        const campaignData = await CampaignService.getCampaignBySlug(campaignSlug);
        console.log('LandingPage: fetched campaignData:', campaignData);
        setCampaign(campaignData);
        setError(null); // Clear error if campaign is found
      } catch (err) {
        console.error('LandingPage: error fetching campaign by slug:', err);
        setError('Campaign not found');
        setCampaign(null);
      }
    };
    loadCampaign();
  }, [campaignSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !email.trim() || isSubmitting || localSubmitting) return;
    setLocalSubmitting(true);
    setIsSubmitting(true);
    setError(null);

    try {
      await CampaignService.captureLead(campaign.id, email.trim());
      setIsSubmitted(true);
      setShowPDF(true);
    } catch (err: any) {
      console.error('Failed to submit email:', err);
      if (err && err.message) {
        setError('Failed to submit email: ' + err.message);
      } else if (err && err.error_description) {
        setError('Failed to submit email: ' + err.error_description);
      } else {
        setError('Failed to submit email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setLocalSubmitting(false);
    }
  };

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Campaign Not Found</h1>
          <p className="text-red-600">The campaign you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  const landingPageCopy = campaign.landing_page_copy as {
    headline?: string;
    subheadline?: string;
    benefit_bullets?: string[];
    cta_button_text?: string;
  } | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <Download className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Majorbeam</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight mx-auto">
            {landingPageCopy?.headline || campaign.lead_magnet_title || 'Get Your Free Guide'}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {landingPageCopy?.subheadline || 'Transform your business with this comprehensive guide'}
          </p>

          {/* Benefit Bullets */}
          {landingPageCopy?.benefit_bullets && (
            <div className="max-w-2xl mx-auto mb-8">
              <ul className="space-y-3 text-center">
                {landingPageCopy.benefit_bullets.map((bullet: string, index: number) => (
                  <li key={index} className="flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Email Capture Form */}
        {!isSubmitted ? (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email to get instant access
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || localSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center text-lg"
              >
                {isSubmitting || localSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {landingPageCopy?.cta_button_text || 'Get Your Free Guide'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        ) : (
          /* Success State */
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 rounded-full p-2">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h2>
              <p className="text-green-700">
                Your guide is ready for download. Use the button below to get instant access.
              </p>
            </div>

            {/* PDF Download */}
            {showPDF && campaign.lead_magnet_content && (
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Free Guide</h3>
                <PDFGenerator 
                  data={(() => {
                    // Parse the lead magnet content
                    const parsedContent = typeof campaign.lead_magnet_content === 'string'
                      ? JSON.parse(campaign.lead_magnet_content)
                      : campaign.lead_magnet_content;
                    
                    // Check if structured_content exists and has proper types
                    if (parsedContent.structured_content && parsedContent.structured_content.toolkit_sections) {
                      const hasProperTypes = parsedContent.structured_content.toolkit_sections.some((section: any) => section.type);
                      
                      if (!hasProperTypes) {
                        console.log('Fixing missing types in LandingPage...');
                        // Fix the types in the existing structured_content
                        const fixedStructuredContent = {
                          ...parsedContent.structured_content,
                          toolkit_sections: parsedContent.structured_content.toolkit_sections.map((section: any) => {
                            let type: 'pros_and_cons_list' | 'checklist' | 'scripts' | undefined = undefined;
                            
                            // Determine type based on content analysis
                            const content = section.content.toLowerCase();
                            if (content.includes('pros:') && content.includes('cons:')) {
                              type = 'pros_and_cons_list';
                            } else if (content.includes('phase') && content.includes('1.') && content.includes('2.')) {
                              type = 'checklist';
                            } else if (content.includes('scenario') && content.includes('when they say:') && content.includes('you say:')) {
                              type = 'scripts';
                            }
                            
                            return {
                              ...section,
                              type: type
                            };
                          })
                        };
                        
                        return {
                          ...parsedContent,
                          structured_content: fixedStructuredContent
                        };
                      }
                    }
                    
                    return parsedContent;
                  })()}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 Majorbeam. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 