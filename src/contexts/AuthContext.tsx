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
            throw error;
          }

          if (data.session) {
            console.log('✅ OAuth session established successfully');
            console.log('👤 User:', data.session.user.email);
            console.log('🆔 User ID:', data.session.user.id);
            setSession(data.session);
            setUser(data.session.user);
            
            // Clear the hash and redirect to root
            console.log('🔄 Redirecting to root...');
            window.history.replaceState(null, '', '/');
            window.location.href = '/';
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
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
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
        
        // Only redirect if we're not already on the root and not handling OAuth callback
        if (window.location.pathname !== '/' && !window.location.hash.includes('access_token')) {
          console.log('🔄 Redirecting to root...');
          window.location.href = '/';
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('�� User signed out');
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