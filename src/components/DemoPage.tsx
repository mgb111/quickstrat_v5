import React, { useState } from 'react';
import PDFGenerator from './PDFGenerator';
import { PDFContent } from '../types';

// Sample demo data
const demoData: PDFContent = {
  brandName: 'Demo Brand',
  founderName: 'John Doe',
  position: 'Founder & CEO',
  problemStatement: 'generating quality leads consistently',
  desiredOutcome: 'building a sustainable customer base',
  founder_intro: 'Hi, I\'m John Doe, founder of Demo Brand. I struggled for years to figure out what actually works for generating quality leads consistently. That\'s why I created this guide—to save you the time and frustration I went through.',
  logo: '',
  primaryColor: '#1a365d',
  secondaryColor: '#4a90e2',
  font: 'Inter',
  website: 'https://demobrand.com',
  supportEmail: 'support@demobrand.com',
  bookingLink: 'https://calendly.com/demobrand',
  ctaText: 'Ready to Scale Your Business?',
  mainAction: 'Book a Free Strategy Session',
  structured_content: {
    title_page: {
      title: 'The Ultimate Lead Generation Playbook',
      subtitle: 'Proven strategies to attract and convert your ideal customers',
      brand_name: 'Demo Brand'
    },
    toolkit_sections: [
      {
        type: 'pros_and_cons_list',
        title: 'Strategy Analysis',
        content: {
          items: [
            {
              method_name: 'Content Marketing',
              pros: 'Builds long-term authority and trust, attracts organic traffic',
              cons: 'Takes 6-12 months to see results, requires consistent effort',
              case_study: 'A SaaS company increased organic traffic by 300% in 8 months using content marketing.'
            },
            {
              method_name: 'Paid Advertising',
              pros: 'Immediate results, highly targeted, scalable',
              cons: 'Can be expensive, requires ongoing optimization',
              case_study: 'An e-commerce store achieved 5x ROI using Facebook ads with proper targeting.'
            },
            {
              method_name: 'Social Media',
              pros: 'Builds community, low cost, authentic engagement',
              cons: 'Algorithm changes can hurt reach, time-consuming',
              case_study: 'A B2B company generated 50 qualified leads per month through LinkedIn engagement.'
            }
          ]
        }
      },
      {
        type: 'checklist',
        title: 'Daily Action Checklist',
        content: {
          phases: [
            {
              phase_title: 'Phase 1: Foundation (Week 1-2)',
              items: [
                '1.1 Define your ideal customer profile',
                '1.2 Research competitor strategies',
                '1.3 Set up analytics tracking',
                '1.4 Create content calendar'
              ]
            },
            {
              phase_title: 'Phase 2: Content Creation (Week 3-4)',
              items: [
                '2.1 Write 3 blog posts per week',
                '2.2 Create 5 social media posts per day',
                '2.3 Record 2 video tutorials',
                '2.4 Design lead magnets'
              ]
            },
            {
              phase_title: 'Phase 3: Distribution (Week 5-6)',
              items: [
                '3.1 Share content on all platforms',
                '3.2 Engage with your audience daily',
                '3.3 Run paid ads to top content',
                '3.4 Monitor and optimize performance'
              ]
            }
          ],
          case_study: 'A startup followed this checklist and generated 200 leads in their first month.'
        }
      },
      {
        type: 'scripts',
        title: 'Conversation Scripts',
        content: {
          scenarios: [
            {
              trigger: 'I\'m interested but need to think about it',
              response: 'I completely understand. What specific concerns do you have about getting started?',
              explanation: 'This addresses their hesitation directly and shows you care about their concerns.'
            },
            {
              trigger: 'This seems expensive',
              response: 'What would it cost you to continue without this solution?',
              explanation: 'Helps them see the true cost of inaction versus the investment.'
            },
            {
              trigger: 'I need to check with my team',
              response: 'Great! What questions should I prepare answers for?',
              explanation: 'Shows you\'re prepared and makes the follow-up easier.'
            }
          ]
        }
      }
    ],
    cta_page: {
      title: 'Ready to Scale Your Business?',
      content: 'Book a free strategy session to get personalized recommendations for your specific situation.'
    }
  }
};

const DemoPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Majorbeam Demo</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Demo Mode
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Free PDF downloads for demonstration purposes
            </div>
          </div>
        </div>
      </div>

      {/* Demo Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎯 Demo: Lead Magnet Generator
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              This is a demonstration of Majorbeam's AI-powered lead magnet generator. 
              You can download the PDF below without any payment requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Strategy Analysis</h3>
              <p className="text-sm text-gray-600">AI analyzes what works in your niche</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-gray-900">Action Checklists</h3>
              <p className="text-sm text-gray-600">Step-by-step implementation guides</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-900">Conversation Scripts</h3>
              <p className="text-sm text-gray-600">Ready-to-use sales scripts</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">ℹ️</div>
              <div>
                <h4 className="font-semibold text-blue-900">Demo Features</h4>
                <p className="text-sm text-blue-700">
                  This demo shows a sample lead magnet for a SaaS business. 
                  In the full version, you can generate custom content for any industry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Generator */}
        <div className="bg-white rounded-lg shadow-lg">
          <PDFGenerator 
            data={demoData} 
            campaignId="demo-campaign" 
            requirePayment={false} // This bypasses payment
          />
        </div>

        {/* Demo Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ready to Try the Full Version?
            </h3>
            <p className="text-gray-600 mb-6">
              Generate custom lead magnets for your specific business and industry.
            </p>
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                <strong>Full Version Includes:</strong>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Custom content for your specific industry</li>
                <li>• Personalized strategy recommendations</li>
                <li>• Landing page copy generation</li>
                <li>• Social media post creation</li>
                <li>• Unlimited campaign generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage; 