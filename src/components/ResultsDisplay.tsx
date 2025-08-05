import React, { useEffect, useState } from 'react';
import { Copy, ExternalLink, Mail } from 'lucide-react';
import { CampaignOutput, LeadMagnetFormat } from '../types/index';
import PDFGenerator from './PDFGenerator';
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
  selectedFormat?: LeadMagnetFormat; // New prop for format information
  onCampaignCreated?: () => void;
  requirePayment?: boolean; // New prop to control payment requirement
}

const subredditSuggestions: Record<string, string[]> = {
  'marketing': ['r/marketing', 'r/Entrepreneur', 'r/smallbusiness', 'r/leadgeneration'],
  'saas': ['r/SaaS', 'r/startups', 'r/Entrepreneur', 'r/IndieHackers'],
  'e-commerce': ['r/ecommerce', 'r/Shopify', 'r/Entrepreneur', 'r/smallbusiness'],
  'health': ['r/Health', 'r/HealthAndFitness', 'r/Entrepreneur', 'r/smallbusiness'],
  // Add more mappings as needed
};

function getSuggestedSubreddits(niche: string): string[] {
  if (!niche) return ['r/Entrepreneur', 'r/smallbusiness'];
  
  const subredditSuggestions: { [key: string]: string[] } = {
    'saas': ['r/SaaS', 'r/startups', 'r/Entrepreneur'],
    'ecommerce': ['r/ecommerce', 'r/shopify', 'r/dropshipping'],
    'marketing': ['r/marketing', 'r/digitalmarketing', 'r/socialmedia'],
    'fitness': ['r/fitness', 'r/bodybuilding', 'r/weightlifting'],
    'finance': ['r/personalfinance', 'r/investing', 'r/financialindependence'],
    'education': ['r/education', 'r/teaching', 'r/edtech'],
    'healthcare': ['r/healthcare', 'r/medicine', 'r/nursing'],
    'real estate': ['r/realestate', 'r/realestateinvesting', 'r/landlords'],
    'consulting': ['r/consulting', 'r/Entrepreneur', 'r/smallbusiness'],
    'coaching': ['r/lifecoaching', 'r/Entrepreneur', 'r/smallbusiness']
  };

  const key = Object.keys(subredditSuggestions).find(k => niche.toLowerCase().includes(k));
  return key ? subredditSuggestions[key] : ['r/Entrepreneur', 'r/smallbusiness'];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, brandName, userName, problemStatement, desiredOutcome, selectedFormat, onCampaignCreated, requirePayment = true }) => {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleEmailSubmitted = () => {
    setEmailSubmitted(true);
  };

  // Format-aware text and actions
  const getFormatDisplayInfo = () => {
    const format = selectedFormat || 'pdf';
    
    switch (format) {
      case 'interactive_quiz':
        return {
          title: 'Take Quiz',
          description: 'Enter your email to access your personalized interactive quiz',
          successMessage: '✅ Email submitted! Your quiz is ready below.',
          downloadText: 'Take Quiz Now',
          isInteractive: true
        };
      case 'roi_calculator':
        return {
          title: 'Use Calculator',
          description: 'Enter your email to access your personalized ROI calculator',
          successMessage: '✅ Email submitted! Your calculator is ready below.',
          downloadText: 'Use Calculator Now',
          isInteractive: true
        };
      case 'action_plan':
        return {
          title: 'Get Action Plan',
          description: 'Enter your email to access your personalized action plan',
          successMessage: '✅ Email submitted! Your action plan is ready below.',
          downloadText: 'Get Action Plan',
          isInteractive: true
        };
      case 'benchmark_report':
        return {
          title: 'View Report',
          description: 'Enter your email to access your personalized benchmark report',
          successMessage: '✅ Email submitted! Your report is ready below.',
          downloadText: 'View Report Now',
          isInteractive: true
        };
      case 'opportunity_finder':
        return {
          title: 'Find Opportunities',
          description: 'Enter your email to access your personalized opportunity finder',
          successMessage: '✅ Email submitted! Your opportunity finder is ready below.',
          downloadText: 'Find Opportunities',
          isInteractive: true
        };
      default: // pdf
        return {
          title: 'Download PDF',
          description: 'Enter your email to access your personalized PDF guide',
          successMessage: '✅ Email submitted! Your guide is ready below.',
          downloadText: 'Download as PDF',
          isInteractive: false
        };
    }
  };

  const formatInfo = getFormatDisplayInfo();

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
              
              // Determine type based on content analysis - add null checks
              const content = section.content ? String(section.content).toLowerCase() : '';
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
        const toolkit_sections = results.pdf_content.sections?.map(section => {
          let type: 'pros_and_cons_list' | 'checklist' | 'scripts' | undefined = undefined;
          
          // Determine type based on content analysis - add null checks
          const content = section.content ? String(section.content).toLowerCase() : '';
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
        }) || [];
        
        return {
          ...results.pdf_content,
          structured_content: {
            title_page: {
              title: results.pdf_content.title || `${brandName} Lead Magnet Guide`,
              subtitle: 'A step-by-step blueprint to help you achieve your goals'
            },
            introduction_page: {
              title: 'Introduction',
              content: results.pdf_content.introduction || ''
            },
            toolkit_sections: toolkit_sections,
            cta_page: {
              title: 'Get Started',
              content: results.pdf_content.cta || 'Ready to take action? Download your complete guide now.'
            }
          }
        };
      }

      // If pdf_content is a string, try to parse it
      if (typeof results.pdf_content === 'string') {
        try {
          const parsed = JSON.parse(results.pdf_content);
          return processPdfContent(); // Recursive call with parsed object
        } catch (parseError) {
          console.error('Failed to parse PDF content string:', parseError);
          setPdfError('Invalid PDF content format');
          return null;
        }
      }

      console.error('Unsupported PDF content format:', typeof results.pdf_content);
      setPdfError('Unsupported PDF content format');
      return null;
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
    desiredOutcome: desiredOutcome || '',
    founder_intro: (() => {
      if (typeof results.pdf_content === 'object' && results.pdf_content) {
        const content = results.pdf_content as any;
        if (content.founder_intro) {
          // If founder_intro is already an object, use it as is
          if (typeof content.founder_intro === 'object') {
            return content.founder_intro;
          }
          // If it's a string, use it as is
          if (typeof content.founder_intro === 'string') {
            return content.founder_intro;
          }
        }
      }
      return undefined;
    })()
  } : null;

  console.log('ResultsDisplay render:', { 
    hasPdfContent: !!results.pdf_content,
    pdfContentType: typeof results.pdf_content,
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

      {/* Email Capture Section */}
      {!emailSubmitted ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-center mb-4">
              <Mail className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Enter Your Email to Get Your Lead Magnet</h3>
              <p className="text-gray-600 text-sm">
                {formatInfo.description}
              </p>
            </div>
            <EmailCapture onEmailSubmitted={handleEmailSubmitted} />
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className={`border rounded-lg p-4 mb-6 ${pdfError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-center ${pdfError ? 'text-red-700' : 'text-green-700'}`}>
              {pdfError ? `⚠️ ${pdfError}` : formatInfo.successMessage}
            </p>
          </div>
          {pdfContent && <PDFGenerator data={pdfContent} campaignId={''} requirePayment={requirePayment} selectedFormat={selectedFormat} />}
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