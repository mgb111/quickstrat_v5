import React, { useState, useEffect } from 'react';
import { Check, Download, ArrowRight } from 'lucide-react';
import { Campaign, LeadMagnetFormat } from '../types';
import { CampaignService } from '../lib/campaignService';
import InteractiveDisplay from './InteractiveDisplay';
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

  // Function to detect format from content structure
  const detectFormatFromContent = (content: any): LeadMagnetFormat => {
    if (!content || typeof content === 'string') {
      try {
        content = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        return 'pdf'; // Default fallback
      }
    }

    // Check for interactive format indicators
    if (content.calculator_content) return 'roi_calculator';
    if (content.quiz_content) return 'interactive_quiz';
    if (content.action_plan_content) return 'action_plan';
    if (content.benchmark_content) return 'benchmark_report';
    if (content.opportunity_content) return 'opportunity_finder';
    
    // Check title for format indicators
    const title = content.title_page?.title || content.title || '';
    if (title.includes('Calculator') || title.includes('ROI Calculator')) return 'roi_calculator';
    if (title.includes('Quiz') || title.includes('Interactive Quiz')) return 'interactive_quiz';
    if (title.includes('Action Plan')) return 'action_plan';
    if (title.includes('Benchmark Report')) return 'benchmark_report';
    if (title.includes('Opportunity Finder')) return 'opportunity_finder';

    return 'pdf'; // Default fallback
  };
  
  

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
    setError(null);
    
    setLocalSubmitting(true);
    setIsSubmitting(true);
    try {
      await CampaignService.captureLead(campaign.id, email.trim());
      setIsSubmitted(true);
      setShowPDF(true);
      // Reload the dashboard if open, or just reload the window to update counters
      setTimeout(() => {
        if (window.opener && !window.opener.closed) {
          window.opener.location.reload();
        }
        // Optionally, close the landing page window after reload
        // window.close();
      }, 500);
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center text-lg"
              >
                {landingPageCopy?.cta_button_text || 'Get Your Free Guide'}
                <ArrowRight className="ml-2 h-5 w-5" />
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
        ) : null}
        {/* Content Display - Interactive or PDF based on detected format */}
        {isSubmitted && showPDF && campaign.lead_magnet_content && (() => {
          const detectedFormat = detectFormatFromContent(campaign.lead_magnet_content);
          const brandName = campaign.name?.split(' - ')[0] || '';
          
          console.log('🎯 LandingPage: detectedFormat =', detectedFormat);
          console.log('🎯 LandingPage: campaign.lead_magnet_content =', campaign.lead_magnet_content);
          
          // Show InteractiveDisplay for interactive formats
          if (detectedFormat !== 'pdf') {
            return (
              <InteractiveDisplay 
                results={{
                  pdf_content: campaign.lead_magnet_content,
                  landing_page: campaign.landing_page_copy || { headline: '', subheadline: '', benefit_bullets: [], cta_button_text: '' },
                  social_posts: { linkedin: '', twitter: '', instagram: '', reddit: '' }
                }}
                selectedFormat={detectedFormat}
                brandName={brandName}
                requirePayment={false}
              />
            );
          }
          
          // Show PDFGenerator for PDF format
          return (
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Free Guide</h3>
              <PDFGenerator
                data={(() => {
                  const parsedContent = typeof campaign.lead_magnet_content === 'string'
                    ? JSON.parse(campaign.lead_magnet_content)
                    : campaign.lead_magnet_content;
                  if (parsedContent.structured_content && parsedContent.structured_content.toolkit_sections) {
                    const hasProperTypes = parsedContent.structured_content.toolkit_sections.some((section: any) => section.type);
                    if (!hasProperTypes) {
                      console.log('Fixing missing types in LandingPage...');
                      const fixedStructuredContent = {
                        ...parsedContent.structured_content,
                        toolkit_sections: parsedContent.structured_content.toolkit_sections.map((section: any) => ({
                          ...section,
                          type: section.title?.toLowerCase().includes('script') ? 'scripts' : 
                                section.title?.toLowerCase().includes('checklist') ? 'checklist' : 'pros_and_cons_list'
                        }))
                      };
                      parsedContent.structured_content = fixedStructuredContent;
                    }
                  }
                  
                  // Extract founder information for old campaigns
                  const founderName = campaign.customer_profile?.split(' ')[0] || '';
                  
                  return {
                    ...parsedContent,
                    founderName: parsedContent.founderName || founderName,
                    brandName: parsedContent.brandName || brandName,
                    problemStatement: parsedContent.problemStatement || campaign.problem_statement || '',
                    desiredOutcome: parsedContent.desiredOutcome || campaign.desired_outcome || '',
                    // Add customization fields with defaults for old campaigns
                    ctaText: parsedContent.ctaText || 'Ready to take your business to the next level?',
                    mainAction: parsedContent.mainAction || 'Book a Free Strategy Call',
                    bookingLink: parsedContent.bookingLink || '',
                    website: parsedContent.website || '',
                    supportEmail: parsedContent.supportEmail || '',
                    logo: parsedContent.logo || '',
                    primaryColor: parsedContent.primaryColor || '#1a365d',
                    secondaryColor: parsedContent.secondaryColor || '#4a90e2',
                    font: parsedContent.font || 'Inter'
                  };
                })()}
                campaignId={campaign.id}
                requirePayment={false}
                selectedFormat={detectedFormat}
              />
            </div>
          );
        })()}
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