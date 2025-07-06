import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import { CampaignService } from '../lib/campaignService';

interface RouterProps {
  children: React.ReactNode;
}

const Router: React.FC<RouterProps> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>('');
  const [campaignSlug, setCampaignSlug] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    setCurrentRoute(path);

    // Extract campaign slug from landing page route
    if (path.startsWith('/landing/')) {
      const slug = path.replace('/landing/', '');
      setCampaignSlug(slug);
    }
  }, []);

  // Handle landing page routes
  if (currentRoute.startsWith('/landing/')) {
    return <LandingPage campaignSlug={campaignSlug} />;
  }

  // Handle other routes
  return <>{children}</>;
};

export default Router; 