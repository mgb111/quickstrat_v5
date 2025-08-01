import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import AdminUserCampaigns from './AdminUserCampaigns';
import DemoPage from './DemoPage';
import AdminLeadMagnetCreator from './AdminLeadMagnetCreator';
import PromotionGuide from './PromotionGuide';
import SaaSChecklist from './SaaSChecklist';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/admin/users" element={<AdminUserCampaigns />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/admin/creator" element={<AdminLeadMagnetCreator />} />
        <Route path="/promotion-guide" element={<PromotionGuide />} />
        <Route path="/saas-checklist" element={<SaaSChecklist />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 