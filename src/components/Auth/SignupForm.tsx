import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FcGoogle } from 'react-icons/fc';

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
      console.log('🔐 Starting Google OAuth signup...');
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (googleError) {
        console.error('❌ Google OAuth error:', googleError);
        throw googleError;
      }
      
      console.log('✅ Google OAuth signup initiated successfully');
    } catch (err) {
      console.error('❌ Google signup error:', err);
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
        <p className="text-gray-600">Join Majorbeam today</p>
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
        className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition-colors font-semibold text-gray-700"
      >
        {isGoogleLoading ? (
          <span className="loader mr-2"></span>
        ) : (
          <FcGoogle className="w-5 h-5 mr-2" />
        )}
        Sign up with Google
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