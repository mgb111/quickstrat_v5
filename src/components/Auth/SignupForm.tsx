import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Starting signup process...');
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      console.log('📧 Signup response:', { data, error: signUpError });

      if (signUpError) {
        console.error('❌ Signup error:', signUpError);
        throw signUpError;
      }

      console.log('✅ Account created successfully!');
      console.log('👤 User data:', data.user);
      
      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 Email confirmation required');
        setSuccess('Account created successfully! Please check your email and click the verification link to complete your signup.');
        setShowResendButton(true);
        return;
      }
      
      // If email is already confirmed, try auto sign-in
      console.log('🔄 Attempting auto sign-in...');
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('❌ Auto sign-in error:', signInError);
        setError(`Account created successfully! Please sign in manually. Error: ${signInError.message}`);
      } else {
        console.log('✅ Auto sign-in successful!');
        if (onSuccess) {
          onSuccess();
        }
      }
      
    } catch (err) {
      console.error('❌ Signup error:', err);
      
      // Provide specific error messages
      if (err instanceof Error) {
        if (err.message.includes('User already registered')) {
          setError('An account with this email already exists. Please try signing in instead.');
        } else if (err.message.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.');
        } else if (err.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(`Signup failed: ${err.message}`);
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (googleError) {
        throw googleError;
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError('Failed to sign up with Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        setError(`Failed to resend verification email: ${error.message}`);
      } else {
        setSuccess('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">Join majorbeam today</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{success}</p>
          {showResendButton && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isLoading}
              className="mt-2 text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your full name"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password"
              required
              disabled={isLoading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
      </div>

      {/* Google Sign Up */}
      <button
        onClick={handleGoogleSignup}
        disabled={isGoogleLoading}
        className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </>
        )}
      </button>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm; 