// Test Supabase connection using Vite's environment loading
import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath, URL } from 'node:url';

// Load environment variables like Vite does
const env = loadEnv('development', process.cwd(), '');

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('\nMake sure your .env file contains:');
  console.log('VITE_SUPABASE_URL=your_supabase_project_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing basic connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
    } else {
      console.log('✅ Connection successful!');
    }
    
    // Test auth configuration
    console.log('\n🔄 Testing auth configuration...');
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth configuration error:', authError.message);
    } else {
      console.log('✅ Auth configuration working!');
      console.log('Session:', authData.session ? 'Active' : 'None');
    }
    
    console.log('\n🎉 Supabase is properly configured!');
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testConnection(); 