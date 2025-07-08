import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CampaignForm from './components/CampaignForm';
import Auth from './components/Auth/Auth';
import { useAuth } from './contexts/AuthContext';

type AppMode = 'auth' | 'wizard' | 'dashboard';

function App() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AppMode>('auth');
  const [wizardLoading, setWizardLoading] = useState(false);

  useEffect(() => {
    if (loading) return; // Don't do anything until loading is false
    if (user) {
      setMode('dashboard');
      if (location.pathname === '/' || location.pathname === '/auth') {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setMode('auth');
      if (!location.pathname.startsWith('/landing/') && location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
    // eslint-disable-next-line
  }, [user, loading]);

  const Header = () => (
    <header className="w-full flex justify-end p-4">
      {user && (
        <button
          onClick={signOut}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Log Out
        </button>
      )}
    </header>
  );

  // Block all UI and redirects until loading is false
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (mode === 'wizard') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <CampaignForm
            onSubmit={() => {
              setWizardLoading(true);
              // After campaign is created, return to dashboard
              setMode('dashboard');
              setWizardLoading(false);
            }}
            isLoading={wizardLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <Auth onAuthSuccess={() => setMode('dashboard')} />
        } />
        <Route path="/dashboard" element={
          user ? (
            <Dashboard onNewCampaign={() => setMode('wizard')} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;