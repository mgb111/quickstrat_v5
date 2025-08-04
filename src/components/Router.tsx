import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import AdminUserCampaigns from './AdminUserCampaigns';
import AdminLeadMagnetCreator from './AdminLeadMagnetCreator';
import PromotionGuide from './PromotionGuide';
import SaaSChecklist from './SaaSChecklist';

// Demo page components
const QuizDemo = () => (
  <iframe 
    src="/demo/quiz.html" 
    className="w-full h-screen border-0"
    title="Interactive Quiz Demo"
  />
);

const CalculatorDemo = () => (
  <iframe 
    src="/demo/calculator.html" 
    className="w-full h-screen border-0"
    title="ROI Calculator Demo"
  />
);

const ActionPlanDemo = () => (
  <iframe 
    src="/demo/action-plan.html" 
    className="w-full h-screen border-0"
    title="Action Plan Demo"
  />
);

const BenchmarkDemo = () => (
  <iframe 
    src="/demo/benchmark.html" 
    className="w-full h-screen border-0"
    title="Benchmark Report Demo"
  />
);

const OpportunityFinderDemo = () => (
  <iframe 
    src="/demo/opportunity-finder.html" 
    className="w-full h-screen border-0"
    title="Opportunity Finder Demo"
  />
);

const PdfDemo = () => (
  <iframe 
    src="/demo/pdf.html" 
    className="w-full h-screen border-0"
    title="PDF Guide Demo"
  />
);

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
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 