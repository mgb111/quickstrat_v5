// Test Supabase Email Configuration
// Run this with: node test-supabase-email.js

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailSignup() {
  try {
    console.log('Testing Supabase email signup...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });

    if (error) {
      console.error('Error:', error.message);
      return;
    }

    console.log('Signup successful!');
    console.log('User:', data.user?.email);
    console.log('Check if verification email was sent to:', data.user?.email);
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testEmailSignup(); 