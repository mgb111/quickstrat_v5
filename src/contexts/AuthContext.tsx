import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null; // <-- add error to context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle initial session and OAuth callbacks
    const initializeAuth = async () => {
      console.log('🔐 Starting auth initialization...');
      console.log('📍 Current URL:', window.location.href);
      console.log('📍 Hash:', window.location.hash);
      
      try {
        // Check if we're handling an OAuth callback
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log('🔄 Detected OAuth callback, handling...');
          
          // Let Supabase handle the OAuth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ OAuth callback error:', error);
            setError(error.message || 'OAuth callback error');
            throw error;
          }

          if (data.session) {
            console.log('✅ OAuth session established successfully');
            console.log('👤 User:', data.session.user.email);
            console.log('🆔 User ID:', data.session.user.id);
            setSession(data.session);
            setUser(data.session.user);
            
            // Clear the hash and redirect to dashboard
            console.log('🔄 Redirecting to dashboard...');
            window.history.replaceState(null, '', '/dashboard');
            return;
          } else {
            console.log('⚠️ No session found after OAuth callback');
          }
        }

        // Get the current session
        console.log('🔍 Checking for existing session...');
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session check error:', sessionError);
          setError(sessionError.message || 'Session check error');
          throw sessionError;
        }

        if (currentSession) {
          console.log('✅ Existing session found');
          console.log('👤 User:', currentSession.user.email);
          console.log('🆔 User ID:', currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error: any) {
        console.error('❌ Auth initialization error:', error);
        setError(error?.message || 'Auth initialization error');
      } finally {
        console.log('🏁 Auth initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('🔄 Auth state changed:', event);
      console.log('👤 User:', newSession?.user?.email);
      console.log('🆔 User ID:', newSession?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('✅ User signed in or token refreshed');
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Only redirect if we're not already on the dashboard and not handling OAuth callback
        if (window.location.pathname !== '/dashboard' && !window.location.hash.includes('access_token')) {
          console.log('🔄 Redirecting to dashboard...');
          window.location.href = '/dashboard';
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setSession(null);
        setUser(null);
        window.location.href = '/';
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error?.message || 'Error signing out');
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: refreshedUser } } = await supabase.auth.getUser();
      setUser(refreshedUser);
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      setError(error?.message || 'Error refreshing user');
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshUser,
    error, // <-- add error to context value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 