import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  useEffect(() => {
    // Handle initial session and OAuth callbacks
    const initializeAuth = async () => {
      try {
        // Check if we're handling an OAuth callback
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log('Handling OAuth callback...');
          
          // Let Supabase handle the OAuth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('OAuth callback error:', error);
            throw error;
          }

          if (data.session) {
            console.log('OAuth session established:', data.session.user.email);
            setSession(data.session);
            setUser(data.session.user);
            
            // Clear the hash and redirect to dashboard
            window.history.replaceState(null, '', '/dashboard');
            return;
          }
        }

        // Get the current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (currentSession) {
          console.log('Existing session found:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Only redirect if we're not already on the dashboard and not handling OAuth callback
        if (window.location.pathname !== '/dashboard' && !window.location.hash.includes('access_token')) {
          window.location.href = '/dashboard';
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        window.location.href = '/';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: refreshedUser } } = await supabase.auth.getUser();
      setUser(refreshedUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 