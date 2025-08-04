import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import AdminUserCampaigns from './AdminUserCampaigns';
import AdminLeadMagnetCreator from './AdminLeadMagnetCreator';
import PromotionGuide from './PromotionGuide';
import SaaSChecklist from './SaaSChecklist';

// Demo page components with consistent styling
const QuizDemo = () => (
  <div className="min-h-screen bg-gray-50 font-inter">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center relative">
          <a href="/" className="absolute top-4 left-4 text-white hover:text-blue-200 transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Interactive Quiz Demo</h1>
          <p className="text-lg opacity-90">See how Majorbeam generates personalized diagnostic quizzes</p>
        </div>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">"Why Aren't You Getting More Customers?" Quiz</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Quiz Flow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>User answers 5-10 targeted questions</li>
                <li>AI analyzes responses and identifies key issues</li>
                <li>User receives personalized diagnosis</li>
                <li>Specific next steps and action plan provided</li>
              </ol>
            </div>
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Sample Questions Generated:</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Question 1: Customer Acquisition</h4>
                <p className="text-gray-700 mb-4">How do you currently find new customers?</p>
                <div className="space-y-2">
                  <label className="flex items-center"><input type="radio" name="q1" className="mr-3" /><span>Social media advertising</span></label>
                  <label className="flex items-center"><input type="radio" name="q1" className="mr-3" /><span>Word of mouth referrals</span></label>
                  <label className="flex items-center"><input type="radio" name="q1" className="mr-3" /><span>Cold outreach</span></label>
                  <label className="flex items-center"><input type="radio" name="q1" className="mr-3" /><span>I don't have a system</span></label>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Sample Diagnosis Result:</h3>
              <div className="space-y-3 text-green-800">
                <p><strong>Primary Issue:</strong> Lead Quality Problem</p>
                <p><strong>Root Cause:</strong> You're attracting the wrong audience through broad social media ads</p>
                <p><strong>Impact:</strong> Low conversion rates despite high traffic</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CalculatorDemo = () => (
  <div className="min-h-screen bg-gray-50 font-inter">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center relative">
          <a href="/" className="absolute top-4 left-4 text-white hover:text-blue-200 transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">ROI Calculator Demo</h1>
          <p className="text-lg opacity-90">See how Majorbeam generates instant ROI and cost-savings calculators</p>
        </div>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">"Restaurant Revenue Optimization" Calculator</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Calculator Flow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>User inputs current business metrics</li>
                <li>Calculator processes data with industry formulas</li>
                <li>Shows potential gains from specific improvements</li>
                <li>Provides actionable insights and next steps</li>
              </ol>
            </div>
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Sample Input Fields Generated:</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Current Business Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Monthly Revenue</label><input type="number" value="25000" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Average Order Value</label><input type="number" value="45" className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Sample Calculation Results:</h3>
              <div className="space-y-4 text-green-800">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Total Potential Monthly Increase:</h4>
                  <p className="text-2xl font-bold text-green-600">$10,140</p>
                  <p className="text-sm text-gray-600">Annual impact: $121,680</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ActionPlanDemo = () => (
  <div className="min-h-screen bg-gray-50 font-inter">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center relative">
          <a href="/" className="absolute top-4 left-4 text-white hover:text-blue-200 transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Action Plan Demo</h1>
          <p className="text-lg opacity-90">See how Majorbeam generates personalized quick wins action plans</p>
        </div>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">"Get 50 More Leads in 30 Days" Action Plan</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Action Plan Flow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>User answers niche, goal, and timeframe questions</li>
                <li>AI creates personalized 3-5 step action plan</li>
                <li>Each step includes specific tasks and timeline</li>
                <li>Plan is tailored to user's specific situation</li>
              </ol>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Sample Personalized Action Plan:</h3>
              <div className="space-y-6 text-green-800">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Step 1: Optimize Your LinkedIn Profile (Week 1)</h4>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Tasks:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Update headline with specific value proposition</li>
                      <li>Add 3-5 relevant keywords to your summary</li>
                      <li>Include a clear call-to-action in your bio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BenchmarkDemo = () => (
  <div className="min-h-screen bg-gray-50 font-inter">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center relative">
          <a href="/" className="absolute top-4 left-4 text-white hover:text-blue-200 transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Benchmark Report Demo</h1>
          <p className="text-lg opacity-90">See how Majorbeam generates industry benchmark reports</p>
        </div>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">"Email Marketing Performance" Benchmark Report</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Benchmark Flow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>User inputs their current metrics</li>
                <li>Tool compares to industry averages</li>
                <li>Identifies performance gaps</li>
                <li>Provides improvement strategies</li>
              </ol>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Sample Benchmark Results:</h3>
              <div className="space-y-4 text-green-800">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Your Performance vs Industry Average:</h4>
                  <p className="text-lg"><strong>Email Open Rate:</strong> 15% (Industry: 22%)</p>
                  <p className="text-lg"><strong>Click Rate:</strong> 2.1% (Industry: 3.2%)</p>
                  <p className="text-lg"><strong>Conversion Rate:</strong> 1.8% (Industry: 2.5%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OpportunityFinderDemo = () => (
  <div className="min-h-screen bg-gray-50 font-inter">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center relative">
          <a href="/" className="absolute top-4 left-4 text-white hover:text-blue-200 transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Opportunity Finder Demo</h1>
          <p className="text-lg opacity-90">See how Majorbeam identifies missed opportunities</p>
        </div>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">"E-commerce Growth" Opportunity Finder</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Opportunity Finder Flow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>User answers questions or uploads link</li>
                <li>Tool analyzes current strategy</li>
                <li>Identifies missed opportunities</li>
                <li>Provides specific action steps</li>
              </ol>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Sample Opportunities Found:</h3>
              <div className="space-y-4 text-green-800">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Missed Opportunities:</h4>
                  <ul className="space-y-2">
                    <li>• <strong>Instagram Reels:</strong> Competitors see 40% more engagement</li>
                    <li>• <strong>Email Segmentation:</strong> Could increase revenue by 25%</li>
                    <li>• <strong>Mobile Optimization:</strong> 60% of traffic is mobile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PdfDemo = () => (
  <div className="min-h-screen bg-gray-50 font-inter">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center relative">
          <a href="/" className="absolute top-4 left-4 text-white hover:text-blue-200 transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">PDF Guide Demo</h1>
          <p className="text-lg opacity-90">See how Majorbeam generates comprehensive PDF guides</p>
        </div>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">"How to Generate More Leads from LinkedIn" PDF Guide</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">PDF Guide Flow:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>AI generates comprehensive educational content</li>
                <li>Includes actionable insights and templates</li>
                <li>Step-by-step instructions and resources</li>
                <li>Professional formatting and branding</li>
              </ol>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Sample PDF Content:</h3>
              <div className="space-y-4 text-green-800">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Table of Contents:</h4>
                  <ul className="space-y-1">
                    <li>• Chapter 1: Optimizing Your LinkedIn Profile</li>
                    <li>• Chapter 2: Content Strategy That Converts</li>
                    <li>• Chapter 3: Networking and Relationship Building</li>
                    <li>• Chapter 4: Lead Generation Tactics</li>
                    <li>• Chapter 5: Templates and Scripts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Wrapper component that prevents App from rendering on demo routes
const AppWrapper: React.FC = () => {
  const path = window.location.pathname;
  console.log('🔍 AppWrapper path check:', path);
  
  // If we're on a demo route, don't render the App component
  if (path.startsWith('/demo/')) {
    console.log('✅ AppWrapper: On demo route, not rendering App');
    console.log('✅ AppWrapper: Demo route detected, returning null to prevent App rendering');
    return null;
  }
  
  console.log('❌ AppWrapper: Not on demo route, rendering App');
  return <App />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Demo Routes - Must come before catch-all route */}
        <Route path="/demo/quiz" element={<QuizDemo />} />
        <Route path="/demo/calculator" element={<CalculatorDemo />} />
        <Route path="/demo/action-plan" element={<ActionPlanDemo />} />
        <Route path="/demo/benchmark" element={<BenchmarkDemo />} />
        <Route path="/demo/opportunity-finder" element={<OpportunityFinderDemo />} />
        <Route path="/demo/pdf" element={<PdfDemo />} />
        
        {/* Other specific routes */}
        <Route path="/admin/users" element={<AdminUserCampaigns />} />
        <Route path="/admin/creator" element={<AdminLeadMagnetCreator />} />
        <Route path="/promotion-guide" element={<PromotionGuide />} />
        <Route path="/saas-checklist" element={<SaaSChecklist />} />
        
        {/* Catch-all route - Must be last */}
        <Route path="/*" element={<AppWrapper />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 