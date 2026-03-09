import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'your_github_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret';

// URLs — set BACKEND_URL and FRONTEND_URL in .env for production
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';
const GITHUB_CALLBACK_URL = `${BACKEND_URL}/auth/github/callback`;
const GOOGLE_CALLBACK_URL = `${BACKEND_URL}/auth/google/callback`;

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// ─── Real-time invite delivery (SSE) ────────────────────────────────────────
// { [username]: ExpressResponse }
const sseClients = {}
// { [username]: invite[] }  – queued for offline users
const pendingInvites = {}

// Client subscribes to their invite stream
app.get('/invites/stream/:username', (req, res) => {
  const { username } = req.params
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  sseClients[username] = res

  // Keep connection alive
  const keepalive = setInterval(() => res.write(': keepalive\n\n'), 20000)

  // Flush any queued invites accumulated while user was offline
  if (pendingInvites[username]?.length) {
    for (const invite of pendingInvites[username]) {
      res.write(`data: ${JSON.stringify(invite)}\n\n`)
    }
    delete pendingInvites[username]
  }

  req.on('close', () => {
    clearInterval(keepalive)
    delete sseClients[username]
  })
})

// Sender POSTs an invite; server routes it to the recipient
app.post('/invites/send', (req, res) => {
  const invite = req.body
  const { to } = invite
  if (!to) return res.status(400).json({ error: 'Missing recipient username' })

  if (sseClients[to]) {
    // Recipient is online – push immediately
    sseClients[to].write(`data: ${JSON.stringify(invite)}\n\n`)
  } else {
    // Recipient offline – queue for next connection
    if (!pendingInvites[to]) pendingInvites[to] = []
    pendingInvites[to].push(invite)
  }

  res.json({ ok: true })
})

// User data file path
const USERS_FILE = path.join(__dirname, 'users.json');

// Helper function to read users from JSON file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty object
    return { users: [] };
  }
}

// Helper function to write users to JSON file
async function writeUsers(data) {
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

// Helper function to find user by GitHub ID
async function findUserByGithubId(githubId) {
  const data = await readUsers();
  return data.users.find(user => user.githubId === githubId);
}

// Helper function to find user by Google ID
async function findUserByGoogleId(googleId) {
  const data = await readUsers();
  return data.users.find(user => user.googleId === googleId);
}

// Helper function to find user by email
async function findUserByEmail(email) {
  const data = await readUsers();
  return data.users.find(user => user.email === email);
}

// Helper function to create or update user
async function saveUser(userData) {
  const data = await readUsers();
  
  // Find existing user by GitHub ID or Google ID
  const existingUserIndex = data.users.findIndex(
    user => (userData.githubId && user.githubId === userData.githubId) ||
            (userData.googleId && user.googleId === userData.googleId)
  );

  if (existingUserIndex !== -1) {
    // Update existing user
    data.users[existingUserIndex] = {
      ...data.users[existingUserIndex],
      ...userData,
      lastLogin: new Date().toISOString()
    };
  } else {
    // Create new user
    data.users.push({
      ...userData,
      id: data.users.length + 1,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
  }

  await writeUsers(data);
  return data.users[existingUserIndex] || data.users[data.users.length - 1];
}

// GitHub OAuth flow - Step 1: Redirect to GitHub
app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}&scope=user:email`;
  res.json({ url: githubAuthUrl });
});

// GitHub OAuth flow - Step 2: Handle callback from GitHub
app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: GITHUB_CALLBACK_URL
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.redirect(`${FRONTEND_URL}/login?error=${tokenData.error}`);
    }

    const accessToken = tokenData.access_token;

    // Get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const githubUser = await userResponse.json();

    // Get user emails
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const emails = await emailResponse.json();
    const primaryEmail = emails.find(email => email.primary)?.email || githubUser.email;

    // Save user to JSON file
    const user = await saveUser({
      githubId: githubUser.id,
      username: githubUser.login,
      name: githubUser.name || githubUser.login,
      email: primaryEmail,
      avatar: githubUser.avatar_url,
      bio: githubUser.bio,
      location: githubUser.location,
      company: githubUser.company,
      githubUrl: githubUser.html_url,
      accessToken: accessToken // Store for API calls
    });

    // Create a simple session token (in production, use JWT)
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      githubId: user.githubId,
      timestamp: Date.now()
    })).toString('base64');

    // Redirect back to frontend with session token
    res.redirect(`${FRONTEND_URL}/auth/success?token=${sessionToken}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
  }
});

// Google OAuth flow - Step 1: Redirect to Google
app.get('/auth/google', (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&response_type=code&scope=openid%20profile%20email&access_type=offline`;
  res.json({ url: googleAuthUrl });
});

// Google OAuth flow - Step 2: Handle callback from Google
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.redirect(`${FRONTEND_URL}/login?error=${tokenData.error}`);
    }

    const accessToken = tokenData.access_token;

    // Get user data from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const googleUser = await userResponse.json();

    // Save user to JSON file
    const user = await saveUser({
      googleId: googleUser.id,
      username: googleUser.email.split('@')[0], // Use email prefix as username
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.picture,
      bio: null,
      location: null,
      company: null,
      googleUrl: `https://mail.google.com/mail/u/${googleUser.email}`,
      accessToken: accessToken // Store for API calls
    });

    // Create a simple session token (in production, use JWT)
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      googleId: user.googleId,
      timestamp: Date.now()
    })).toString('base64');

    // Redirect back to frontend with session token
    res.redirect(`${FRONTEND_URL}/auth/success?token=${sessionToken}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
  }
});

// Verify session token and get user data
app.post('/auth/verify', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Decode session token
    const sessionData = JSON.parse(Buffer.from(token, 'base64').toString());

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - sessionData.timestamp;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(401).json({ error: 'Token expired' });
    }

    // Get user from database (check both GitHub and Google)
    let user;
    if (sessionData.githubId) {
      user = await findUserByGithubId(sessionData.githubId);
    } else if (sessionData.googleId) {
      user = await findUserByGoogleId(sessionData.googleId);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data (without sensitive info)
    const { accessToken, ...userWithoutToken } = user;
    res.json({ user: userWithoutToken });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get all registered users (for admin purposes)
app.get('/users', async (req, res) => {
  try {
    const data = await readUsers();
    // Remove access tokens from response
    const users = data.users.map(({ accessToken, ...user }) => user);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Logout endpoint
app.post('/auth/logout', async (req, res) => {
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 GitHub OAuth callback: ${GITHUB_CALLBACK_URL}`);
  console.log(`💾 Users stored in: ${USERS_FILE}`);
});
