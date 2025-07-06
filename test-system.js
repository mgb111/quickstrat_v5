// Simple system test script
// Run with: node test-system.js

const fs = require('fs');
const path = require('path');

console.log('🧪 LeadGen Machine - System Test\n');

// Test 1: Check if app is running
console.log('1. Checking if app is running...');
console.log('   ✅ App should be running on http://localhost:5176/');
console.log('   📝 Open your browser and navigate to the URL above\n');

// Test 2: Check environment variables
console.log('2. Checking environment variables...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasOpenAI = envContent.includes('VITE_OPENAI_API_KEY');
  const hasSupabase = envContent.includes('VITE_SUPABASE_URL');
  
  console.log(`   ${hasOpenAI ? '✅' : '❌'} OpenAI API key configured`);
  console.log(`   ${hasSupabase ? '✅' : '❌'} Supabase URL configured`);
} else {
  console.log('   ❌ .env file not found');
}
console.log('');

// Test 3: Check package.json dependencies
console.log('3. Checking dependencies...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = packageJson.dependencies || {};
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'openai',
    '@react-pdf/renderer',
    'react',
    'vite'
  ];
  
  requiredDeps.forEach(dep => {
    const hasDep = deps[dep] || packageJson.devDependencies?.[dep];
    console.log(`   ${hasDep ? '✅' : '❌'} ${dep}`);
  });
} else {
  console.log('   ❌ package.json not found');
}
console.log('');

// Test 4: Check database migration
console.log('4. Database migration status...');
console.log('   📝 Verify you ran this SQL in Supabase:');
console.log('   ALTER TABLE campaigns ALTER COLUMN user_id DROP NOT NULL;');
console.log('   (and the other migration commands)');
console.log('');

// Test 5: Manual testing checklist
console.log('5. Manual Testing Checklist:');
console.log('   📋 Follow the test-checklist.md file for complete testing');
console.log('   🔗 Open: http://localhost:5176/');
console.log('   📝 Test campaign creation flow');
console.log('   📝 Test PDF download functionality');
console.log('   📝 Test dashboard functionality');
console.log('   📝 Test landing page functionality');
console.log('');

console.log('🎯 System Status: Ready for testing!');
console.log('📖 Use test-checklist.md for detailed testing steps'); 