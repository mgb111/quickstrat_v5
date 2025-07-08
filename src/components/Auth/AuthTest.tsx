import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const AuthTest: React.FC = () => {
  const { user, session, loading, signOut } = useAuth();
  const [testResults, setTestResults] = useState<{
    [key: string]: { status: 'pending' | 'success' | 'error'; message: string };
  }>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { status: 'pending', message: 'Running...' }
    }));

    try {
      await testFn();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'success', message: 'Passed' }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    // Test 1: Supabase Connection
    await runTest('Supabase Connection', async () => {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
    });

    // Test 2: Authentication State
    await runTest('Authentication State', async () => {
      if (loading) throw new Error('Still loading');
      if (!user && !session) throw new Error('No user or session');
    });

    // Test 3: User Profile
    if (user) {
      await runTest('User Profile', async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        if (!data) throw new Error('User profile not found');
      });
    }

    // Test 4: Campaign Access
    if (user) {
      await runTest('Campaign Access', async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        if (error) throw error;
      });
    }

    // Test 5: RLS Policies
    if (user) {
      await runTest('RLS Policies', async () => {
        // Try to access another user's data (should fail)
        const { data, error } = await supabase
          .from('campaigns')
          .select('id')
          .neq('user_id', user.id)
          .limit(1);
        
        // This should return empty data due to RLS
        if (data && data.length > 0) {
          throw new Error('RLS policies not working - able to access other user data');
        }
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication Test Suite</h2>
      
      {/* Current Auth State */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current State</h3>
        <div className="space-y-2 text-sm">
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>User: {user ? user.email : 'None'}</div>
          <div>Session: {session ? 'Active' : 'None'}</div>
          <div>User ID: {user?.id || 'None'}</div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        {Object.entries(testResults).map(([testName, result]) => (
          <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(result.status)}
              <span className="font-medium">{testName}</span>
            </div>
            <span className={`text-sm ${
              result.status === 'success' ? 'text-green-600' :
              result.status === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {result.message}
            </span>
          </div>
        ))}
      </div>

      {/* Manual Tests */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Manual Tests</h3>
        <div className="space-y-2">
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Test Sign Out
          </button>
          <a
            href="/dashboard"
            className="block w-full text-left px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Test Dashboard Access
          </a>
          <a
            href="/profile"
            className="block w-full text-left px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Test Profile Access
          </a>
        </div>
      </div>

      {/* Environment Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Environment</h3>
        <div className="text-sm space-y-1">
          <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</div>
          <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</div>
          <div>Mode: {import.meta.env.MODE}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthTest; 