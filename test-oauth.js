// Test GitHub OAuth Configuration
// Run with: node test-oauth.js

import 'dotenv/config';

console.log('\n🔍 GitHub OAuth Configuration Check\n');
console.log('=====================================\n');

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!clientId || clientId === 'your_github_client_id') {
  console.log('❌ GITHUB_CLIENT_ID is not set or is using default value');
  console.log('   Please update .env file with your actual Client ID\n');
} else {
  console.log('✅ Client ID found:', clientId);
}

if (!clientSecret || clientSecret === 'your_github_client_secret') {
  console.log('❌ GITHUB_CLIENT_SECRET is not set or is using default value');
  console.log('   Please update .env file with your actual Client Secret\n');
} else {
  console.log('✅ Client Secret found:', clientSecret.substring(0, 10) + '...');
}

const callbackUrl = 'http://localhost:3001/auth/github/callback';
const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=user:email`;

console.log('\n📋 Configuration Summary');
console.log('=====================================');
console.log('Homepage URL:      http://localhost:5174');
console.log('Callback URL:      ' + callbackUrl);
console.log('\n🔗 Test Authorization URL:');
console.log(authUrl);
console.log('\n💡 Copy the URL above and paste it in your browser to test');
console.log('   If you get a 404, your OAuth app is not properly configured\n');
