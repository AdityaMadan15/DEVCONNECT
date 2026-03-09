import 'dotenv/config';

const clientId = process.env.GITHUB_CLIENT_ID;
const callbackUrl = 'http://localhost:3001/auth/github/callback';
const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=user:email`;

console.log('\n📋 OAuth Configuration Check');
console.log('='.repeat(80));
console.log('\nClient ID:', clientId);
console.log('Callback URL:', callbackUrl);
console.log('\n🔗 Authorization URL:');
console.log(authUrl);
console.log('\n📝 Test this URL in your browser:');
console.log('   1. Copy the URL above');
console.log('   2. Paste it in your browser');
console.log('   3. If you get 404, the GitHub OAuth app is NOT configured correctly\n');
console.log('⚠️  Make sure in GitHub OAuth settings:');
console.log('   - Application name: DEVCONNECT (or any name)');
console.log('   - Homepage URL: http://localhost:5174');
console.log('   - Callback URL: http://localhost:3001/auth/github/callback');
console.log('='.repeat(80) + '\n');
