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

  useEffect(() => {
    if (loading) return;
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

  if (mode === 'wizard') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <CampaignForm
            onComplete={() => setMode('dashboard')}
            onCancel={() => setMode('dashboard')}
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