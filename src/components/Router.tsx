import React from 'react';
import App from '../App';
import LandingPage from './LandingPage';

const Router: React.FC = () => {
  const path = window.location.pathname;

  // Handle landing page routes
  if (path.startsWith('/landing/')) {
    const slug = path.replace('/landing/', '');
    return <LandingPage campaignSlug={slug} />;
  }

  // Default to main app
  return <App />;
};

export default Router; 