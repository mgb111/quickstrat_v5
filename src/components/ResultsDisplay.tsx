import React, { useEffect, useState } from 'react';
import { Copy, ExternalLink, MessageCircle, Download, Mail } from 'lucide-react';
import { CampaignOutput } from '../types/index';
import PDFGenerator from './PDFGenerator';
import { SubscriptionService, SubscriptionStatus } from '../lib/subscriptionService';
import EmailCapture from './EmailCapture';
import { createClient } from '@supabase/supabase-js';
import Modal from 'react-modal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ResultsDisplayProps {
  results: CampaignOutput;
  brandName: string;
  userName?: string;
  problemStatement?: string;
  desiredOutcome?: string;
  onCampaignCreated?: () => void;
}

const subredditSuggestions: Record<string, string[]> = {
  'marketing': ['r/marketing', 'r/Entrepreneur', 'r/smallbusiness', 'r/leadgeneration'],
  'saas': ['r/SaaS', 'r/startups', 'r/Entrepreneur', 'r/IndieHackers'],
  'e-commerce': ['r/ecommerce', 'r/Shopify', 'r/Entrepreneur', 'r/smallbusiness'],
  'health': ['r/Health', 'r/HealthAndFitness', 'r/Entrepreneur', 'r/smallbusiness'],
  // Add more mappings as needed
};

function getSuggestedSubreddits(niche: string): string[] {
  const key = Object.keys(subredditSuggestions).find(k => niche.toLowerCase().includes(k));
  return key ? subredditSuggestions[key] : ['r/Entrepreneur', 'r/smallbusiness'];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, brandName, userName, problemStatement, desiredOutcome, onCampaignCreated }) => {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    // Get user ID on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
      if (user?.id) fetchSubscription(user.id);
    });
  }, []);

  const fetchSubscription = async (uid: string) => {
    setLoadingSub(true);
    const sub = await SubscriptionService.getUserSubscription(uid);
    setSubscription(sub);
    setLoadingSub(false);
  };

  const handleUpgrade = async () => {
    if (userId) await fetchSubscription(userId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleEmailSubmitted = () => {
    setEmailSubmitted(true);
  };

  // Compute canGeneratePDF
  const canGeneratePDF = subscription
    ? subscription.plan === 'premium' || subscription.usedCampaigns < subscription.monthlyCampaignLimit
    : false;

  // Process PDF content
  const processPdfContent = () => {
    console.log('Processing PDF content:', results);
    console.log('PDF content type:', typeof results.pdf_content);
    console.log('PDF content:', results.pdf_content);
    console.log('PDF content structured_content:', typeof results.pdf_content === 'object' ? results.pdf_content?.structured_content : 'N/A');
    
    if (!results || !results.pdf_content) {
      console.error('No PDF content available:', results);
      setPdfError('PDF content is missing');
      return null;
    }

    try {
      // If pdf_content is already a PDFContent object with structured_content, use it directly
      if (typeof results.pdf_content === 'object' && results.pdf_content.structured_content) {
        console.log('Using existing structured_content:', results.pdf_content.structured_content);
        console.log('Existing toolkit sections:', results.pdf_content.structured_content.toolkit_sections);
        
        // Check if the existing structured_content has proper types
        const hasProperTypes = results.pdf_content.structured_content.toolkit_sections?.some((section: any) => section.type);
        console.log('Has proper types:', hasProperTypes);
        
        if (!hasProperTypes) {
          console.log('Existing structured_content missing types, fixing...');
          // Fix the types in the existing structured_content
          const fixedStructuredContent = {
            ...results.pdf_content.structured_content,
            toolkit_sections: results.pdf_content.structured_content.toolkit_sections.map((section: any) => {
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
            ...results.pdf_content,
            structured_content: fixedStructuredContent
          };
        }
        
        return results.pdf_content;
      }

      // If pdf_content is a PDFContent object without structured_content, create it
      if (typeof results.pdf_content === 'object') {
        console.log('Creating structured_content from pdf_content object');
        
        // Analyze sections to determine their types
        const toolkit_sections = results.pdf_content.sections.map(section => {
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
            title: section.title,
            type: type,
            content: section.content
          };
        });
        
        return {
          ...results.pdf_content,
          structured_content: {
            title_page: {
              title: results.pdf_content.title || `${brandName} Lead Magnet Guide`,
              subtitle: 'A step-by-step blueprint to help you achieve your goals'
            },
            introduction_page: {
              title: 'Introduction',
              content: results.pdf_content.introduction
            },
            toolkit_sections: toolkit_sections,
            cta_page: {
              title: 'Next Steps',
              content: results.pdf_content.cta
            }
          }
        };
      }

      // Otherwise, create a new PDFContent object from the string content
      const content = typeof results.pdf_content === 'string' 
        ? results.pdf_content 
        : JSON.stringify(results.pdf_content);

      console.log('Creating new PDFContent from string content');
      return {
        title: `${brandName} Lead Magnet Guide`,
        introduction: content,
        sections: [
          {
            title: 'Implementation Guide',
            content: content
          }
        ],
        cta: `Ready to put these strategies into action? Schedule a free strategy session with our team or reach out to ${brandName} for personalized support. Your success starts now!`,
        structured_content: {
          title_page: {
            title: `${brandName} Lead Magnet Guide`,
            subtitle: 'A step-by-step blueprint to help you achieve your goals'
          },
          introduction_page: {
            title: 'Introduction',
            content: content
          },
          toolkit_sections: [
            {
              title: 'Implementation Guide',
              content: content
            }
          ],
          cta_page: {
            title: 'Next Steps',
            content: `Ready to put these strategies into action? Schedule a free strategy session with our team or reach out to ${brandName} for personalized support. Your success starts now!`
          }
        }
      };
    } catch (error) {
      console.error('Error processing PDF content:', error);
      setPdfError('Error processing PDF content');
      return null;
    }
  };

  // Get the processed content
  const pdfContentRaw = emailSubmitted ? processPdfContent() : null;
  // Provide required PDFContent fields, using props for founder intro
  const pdfContent = pdfContentRaw ? {
    ...pdfContentRaw,
    founderName: userName || '',
    brandName: brandName || '',
    problemStatement: problemStatement || '',
    desiredOutcome: desiredOutcome || ''
  } : null;

  console.log('ResultsDisplay render:', { 
    hasPdfContent: !!results.pdf_content,
    pdfContentType: typeof results.pdf_content,
    brandName,
    emailSubmitted
  });

  // Reddit Copy Section
  const [redditCopy, setRedditCopy] = useState('');
  const [showReddit, setShowReddit] = useState(false);
  const subreddits = getSuggestedSubreddits('');

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
      {!emailSubmitted ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-center mb-4">
              <Mail className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Enter Your Email to Get Your Lead Magnet</h3>
              <p className="text-gray-600 text-sm">
                Please enter your email to access your personalized PDF guide
              </p>
            </div>
            <EmailCapture onEmailSubmitted={handleEmailSubmitted} />
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className={`border rounded-lg p-4 mb-6 ${pdfError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-center ${pdfError ? 'text-red-700' : 'text-green-700'}`}>
              {pdfError ? `⚠️ ${pdfError}` : '✅ Email submitted! Your guide is ready below.'}
            </p>
          </div>
          {/* Paywall enforcement: Only show PDF if eligible */}
          {(!canGeneratePDF || loadingSub) ? (
            <div className="text-center">
              <p className="mb-4 text-lg text-gray-700 font-semibold">
                {loadingSub ? 'Checking your subscription...' : 'You have reached your free campaign limit or need to upgrade to premium to download the PDF.'}
              </p>
              {/* PDFGenerator will handle showing the UpgradeModal and paywall */}
              {pdfContent && (
                <PDFGenerator
                  data={pdfContent}
                  canGeneratePDF={canGeneratePDF}
                  onUpgrade={handleUpgrade}
                />
              )}
            </div>
          ) : (
            pdfContent && <PDFGenerator data={pdfContent} canGeneratePDF={canGeneratePDF} onUpgrade={handleUpgrade} />
          )}
        </div>
      )}

      {/* Payment Verification Modal */}
      <Modal isOpen={false} ariaHideApp={false}>
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Verifying payment...</h2>
          <p className="mb-4">Please wait while we confirm your payment. This may take a few seconds.</p>
        </div>
      </Modal>

      {/* Campaign Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full place-items-center">
        {/* Landing Page Copy */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col items-center justify-center text-center h-full w-full">
          <div className="flex items-center mb-4 justify-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-3">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Landing Page Copy</h3>
          </div>
          <div className="space-y-4 w-full">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Headline</h4>
              <div className="flex items-center space-x-2 justify-center">
                <p className="text-gray-700 flex-1 text-center">{results.landing_page.headline}</p>
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
              <div className="flex items-center space-x-2 justify-center">
                <p className="text-gray-700 flex-1 text-center">{results.landing_page.subheadline}</p>
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
                <ul className="text-gray-700 text-sm space-y-1 text-center">
                  {results.landing_page.benefit_bullets.map((bullet, index) => (
                    <li key={index} className="text-center">• {bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Empty cell for grid symmetry if needed */}
        <div className="hidden lg:block"></div>
      </div>

      {/* Social Media Posts */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Social Media Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full place-items-center">
          {/* LinkedIn */}
          <div className="bg-gray-50 rounded-lg p-4 w-full h-full flex flex-col justify-center">
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
          <div className="bg-gray-50 rounded-lg p-4 w-full h-full flex flex-col justify-center">
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
          <div className="bg-gray-50 rounded-lg p-4 w-full h-full flex flex-col justify-center">
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
          {/* Reddit */}
          <div className="bg-gray-50 rounded-lg p-4 w-full h-full flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Reddit</span>
              <button
                onClick={() => copyToClipboard(results.social_posts.reddit || results.social_posts.linkedin)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{results.social_posts.reddit || results.social_posts.linkedin}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;