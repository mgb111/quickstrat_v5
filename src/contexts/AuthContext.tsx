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
    // Handle OAuth hash parameters
    if (typeof window !== 'undefined' && window.location.hash) {
      const handleOAuthCallback = async () => {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const expiresIn = hashParams.get('expires_in');
          const refreshToken = hashParams.get('refresh_token');
          const tokenType = hashParams.get('token_type');
          
          if (!accessToken) {
            console.error('No access token found in URL');
            window.location.replace('/');
            return;
          }

          // Set the session manually first
          const { data: { session: newSession }, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (setSessionError) {
            throw setSessionError;
          }

          if (newSession) {
            // Get user details after setting session
            const { data: { user: newUser }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              throw userError;
            }

            if (newUser) {
              setSession(newSession);
              setUser(newUser);
              setLoading(false);

              // Clear the hash and redirect
              window.history.replaceState({}, document.title, window.location.pathname);
              window.location.replace('/dashboard');
              return;
            }
          }

          throw new Error('Failed to establish session');
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          // Clear any partial auth state
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          window.location.replace('/');
        }
      };
      
      handleOAuthCallback();
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      window.location.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
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