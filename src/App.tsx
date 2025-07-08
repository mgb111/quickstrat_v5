import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, BarChart3, Plus, User } from 'lucide-react';
import CampaignForm from './components/CampaignForm';
import ConceptSelection from './components/ConceptSelection';
import OutlineReview from './components/OutlineReview';
import ResultsDisplay from './components/ResultsDisplay';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth/Auth';
import UserProfile from './components/UserProfile';
import { useAuth } from './contexts/AuthContext';
import { WizardState, CampaignInput, LeadMagnetConcept, ContentOutline } from './types/index';
import { generateLeadMagnetConcepts, generateContentOutline, generateFinalCampaign } from './lib/openai';
import { CampaignService } from './lib/campaignService';
import { EmailService } from './lib/emailService';
import LoadingSpinner from './components/LoadingSpinner';

type AppMode = 'auth' | 'wizard' | 'dashboard' | 'landing' | 'profile';

function App() {
  const { user, loading } = useAuth();
  console.log('App user:', user, 'loading:', loading);
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AppMode>('auth');
  const [wizardState, setWizardState] = useState<WizardState>({
    stage: 'input',
    input: null,
    concepts: null,
    selectedConcept: null,
    outline: null,
    finalOutput: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle initial routing
  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/landing/')) {
      setMode('landing');
    } else if (path === '/dashboard' && user) {
      setMode('dashboard');
    } else if (!user && !loading && path !== '/') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, user, loading, navigate]);

  // Handle authentication state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (location.pathname === '/' || location.pathname === '/auth') {
          navigate('/dashboard', { replace: true });
        }
      } else {
        if (!location.pathname.startsWith('/landing/') && location.pathname !== '/') {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, loading, location.pathname, navigate]);

  // Extract campaign slug from URL
  const getCampaignSlug = () => {
    const path = location.pathname;
    if (path.startsWith('/landing/')) {
      return path.replace('/landing/', '');
    }
    return '';
  };

  const handleAuthSuccess = () => {
    setMode('dashboard');
  };

  const handleInputSubmit = async (input: CampaignInput) => {
    console.log('🔄 Starting concept generation...');
    setIsLoading(true);
    setError(null);

    try {
      const concepts = await generateLeadMagnetConcepts(input);
      console.log('✅ Concepts generated:', concepts);
      setWizardState({
        stage: 'concept-selection',
        input,
        concepts,
        selectedConcept: null,
        outline: null,
        finalOutput: null
      });
      console.log('🎯 Moved to concept-selection stage');
    } catch (err) {
      console.error('❌ Error generating concepts:', err);
      setError('Failed to generate lead magnet concepts. Please check your API keys and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConceptSelected = async (selectedConcept: LeadMagnetConcept) => {
    console.log('🔄 Starting outline generation...');
    setIsLoading(true);
    setError(null);

    try {
      const outline = await generateContentOutline(wizardState.input!, selectedConcept);
      console.log('✅ Outline generated:', outline);
      setWizardState(prev => ({
        ...prev,
        stage: 'outline-review',
        selectedConcept,
        outline
      }));
      console.log('🎯 Moved to outline-review stage');
    } catch (err) {
      console.error('❌ Error generating outline:', err);
      setError('Failed to generate content outline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutlineApproved = async (finalOutline: ContentOutline) => {
    console.log('🔄 Starting final campaign generation...');
    setIsLoading(true);
    setError(null);

    try {
      const finalOutput = await generateFinalCampaign(wizardState.input!, finalOutline);
      console.log('✅ Final campaign generated:', finalOutput);
      // Automatically save campaign to Supabase
      await CampaignService.createCampaign(wizardState.input!, finalOutput);
      setWizardState(prev => ({
        ...prev,
        stage: 'complete',
        outline: finalOutline,
        finalOutput
      }));
      console.log('🎯 Moved to complete stage and campaign saved');
    } catch (err) {
      console.error('❌ Error generating final campaign:', err);
      setError('Failed to generate final campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignCreated = async () => {
    // Just switch to dashboard and reset wizard state
    setMode('dashboard');
    setWizardState({
      stage: 'input',
      input: null,
      concepts: null,
      selectedConcept: null,
      outline: null,
      finalOutput: null
    });
  };

  const handleStartOver = () => {
    setWizardState({
      stage: 'input',
      input: null,
      concepts: null,
      selectedConcept: null,
      outline: null,
      finalOutput: null
    });
    setError(null);
  };

  const handleNewCampaign = () => {
    console.log('🎯 New Campaign button clicked');
    setMode('wizard');
    handleStartOver();
    console.log('🎯 New campaign setup complete');
  };

  const renderStageIndicator = () => {
    const stages = [
      { id: 'input', label: 'Input', number: 1 },
      { id: 'concept-selection', label: 'Focus', number: 2 },
      { id: 'outline-review', label: 'Review', number: 3 },
      { id: 'complete', label: 'Complete', number: 4 }
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {stages.map((stage, index) => {
            const isActive = wizardState.stage === stage.id;
            const isCompleted = stages.findIndex(s => s.id === wizardState.stage) > index;
            
            return (
              <React.Fragment key={stage.id}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {stage.number}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stage.label}
                </span>
                {index < stages.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Render the appropriate component based on the current route
  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Auth onAuthSuccess={handleAuthSuccess} />
      } />
      <Route path="/dashboard" element={
        user ? (
          <div className="container mx-auto px-4 py-8">
            <Dashboard onNewCampaign={handleNewCampaign} />
          </div>
        ) : (
          <Navigate to="/" replace />
        )
      } />
      <Route path="/landing/*" element={<LandingPage campaignSlug={getCampaignSlug()} />} />
      <Route path="/profile" element={
        user ? <UserProfile /> : <Navigate to="/" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;