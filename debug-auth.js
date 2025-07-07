// Debug Authentication Issues
// Run with: node debug-auth.js

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuth(email, password) {
  console.log('🔍 Debugging authentication for:', email);
  
  try {
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Sign in error:', error.message);
      
      // Check if user exists by trying to sign up
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signupError) {
        console.error('❌ Sign up error:', signupError.message);
      } else {
        console.log('✅ User exists, but may need email confirmation');
        console.log('User data:', signupData.user);
      }
    } else {
      console.log('✅ Sign in successful!');
      console.log('User:', data.user);
    }
    
  } catch (err) {
    console.error('❌ Debug error:', err);
  }
}

// Test with your email
const testEmail = 'your-email@example.com'; // Replace with your email
const testPassword = 'your-password'; // Replace with your password

debugAuth(testEmail, testPassword); 