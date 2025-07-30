import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import AdminUserCampaigns from './AdminUserCampaigns';
import DemoPage from './DemoPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/admin/users" element={<AdminUserCampaigns />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 