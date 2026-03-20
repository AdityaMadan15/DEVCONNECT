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

// Projects data file path
const PROJECTS_FILE = path.join(__dirname, 'projects.json');

// Helper function to read projects from JSON file
async function readProjects() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { projects: [] };
  }
}

// Helper function to write projects to JSON file
async function writeProjects(data) {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(data, null, 2));
}

// Requests data file path
const REQUESTS_FILE = path.join(__dirname, 'requests.json');

// Helper function to read requests from JSON file
async function readRequests() {
  try {
    const data = await fs.readFile(REQUESTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { requests: [] };
  }
}

// Helper function to write requests to JSON file
async function writeRequests(data) {
  await fs.writeFile(REQUESTS_FILE, JSON.stringify(data, null, 2));
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

// ─── Users CRUD ─────────────────────────────────────────────────────────────

// GET /users/:id  — get a single user by numeric ID
app.get('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

    const data = await readUsers();
    const user = data.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { accessToken, ...safe } = user;
    res.json({ user: safe });
  } catch (err) {
    console.error('GET /users/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /users/:id  — update a user's profile fields
// Allowed fields: name, bio, location, company, skills, githubUrl, googleUrl, avatar
// Protected fields that cannot be changed: id, githubId, googleId, email, accessToken, createdAt
app.put('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

    const ALLOWED = ['name', 'bio', 'location', 'company', 'skills', 'githubUrl', 'googleUrl', 'avatar'];

    const updates = {};
    for (const key of ALLOWED) {
      if (key in req.body) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const data = await readUsers();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    data.users[idx] = { ...data.users[idx], ...updates };
    await writeUsers(data);

    const { accessToken, ...safe } = data.users[idx];
    res.json({ user: safe });
  } catch (err) {
    console.error('PUT /users/:id error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /users/:id  — remove a user account
app.delete('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });

    const data = await readUsers();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    data.users.splice(idx, 1);
    await writeUsers(data);

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /users/:id error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ─── Projects CRUD ───────────────────────────────────────────────────────────

// POST /projects  — create a new project
// Required body fields: id, title, owner (username)
app.post('/projects', async (req, res) => {
  try {
    const {
      id, title, description, techStack, category,
      visibility, openCollab, collaborators, status,
      createdAt, owner
    } = req.body;

    if (!id || !title || !owner) {
      return res.status(400).json({ error: 'id, title, and owner are required' });
    }

    const data = await readProjects();

    // Prevent duplicate ids
    if (data.projects.find(p => p.id === id)) {
      return res.status(409).json({ error: 'A project with this id already exists' });
    }

    const newProject = {
      id,
      title,
      description:   description   ?? '',
      techStack:     techStack     ?? [],
      category:      category      ?? '',
      visibility:    visibility    ?? 'public',
      openCollab:    openCollab    ?? false,
      collaborators: collaborators ?? [],
      status:        status        ?? 'active',
      createdAt:     createdAt     ?? new Date().toISOString(),
      owner,
      stars:         0,
      messages:      [],
      resources:     [],
      activity:      [],
    };

    data.projects.unshift(newProject);
    await writeProjects(data);
    res.status(201).json({ project: newProject });
  } catch (err) {
    console.error('POST /projects error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /projects  — list projects (optional ?owner=username or ?visibility=public)
app.get('/projects', async (req, res) => {
  try {
    const data = await readProjects();
    let result = data.projects;

    if (req.query.owner) {
      result = result.filter(p => p.owner === req.query.owner);
    }
    if (req.query.visibility) {
      result = result.filter(p => p.visibility === req.query.visibility);
    }

    res.json({ projects: result });
  } catch (err) {
    console.error('GET /projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /projects/:id  — get a single project by id
app.get('/projects/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid project id' });

    const data = await readProjects();
    const project = data.projects.find(p => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json({ project });
  } catch (err) {
    console.error('GET /projects/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PUT /projects/:id  — update a project
// Allowed fields: title, description, techStack, category, visibility, openCollab,
//                 collaborators, status, stars, messages, resources, activity
app.put('/projects/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid project id' });

    const ALLOWED = [
      'title', 'description', 'techStack', 'category', 'visibility',
      'openCollab', 'collaborators', 'status', 'stars',
      'messages', 'resources', 'activity'
    ];

    const updates = {};
    for (const key of ALLOWED) {
      if (key in req.body) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const data = await readProjects();
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Project not found' });

    data.projects[idx] = { ...data.projects[idx], ...updates };
    await writeProjects(data);
    res.json({ project: data.projects[idx] });
  } catch (err) {
    console.error('PUT /projects/:id error:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /projects/:id  — delete a project
app.delete('/projects/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid project id' });

    const data = await readProjects();
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Project not found' });

    data.projects.splice(idx, 1);
    await writeProjects(data);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /projects/:id error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ─── Collaboration Requests CRUD ─────────────────────────────────────────────

// POST /requests  — create a new collaboration request / invite
// Required body: id, from, to, projectId
app.post('/requests', async (req, res) => {
  try {
    const { id, from, to, projectId, message, projectTitle, createdAt } = req.body;

    if (!id || !from || !to || !projectId) {
      return res.status(400).json({ error: 'id, from, to, and projectId are required' });
    }

    const data = await readRequests();

    if (data.requests.find(r => r.id === id)) {
      return res.status(409).json({ error: 'A request with this id already exists' });
    }

    const newRequest = {
      id,
      from,
      to,
      projectId,
      projectTitle: projectTitle ?? '',
      message:      message      ?? '',
      status:       'pending',
      createdAt:    createdAt    ?? new Date().toISOString(),
    };

    data.requests.unshift(newRequest);
    await writeRequests(data);
    res.status(201).json({ request: newRequest });
  } catch (err) {
    console.error('POST /requests error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// GET /requests  — list requests (optional ?to=username, ?from=username, ?projectId=id, ?status=pending)
app.get('/requests', async (req, res) => {
  try {
    const data = await readRequests();
    let result = data.requests;

    if (req.query.to)        result = result.filter(r => r.to        === req.query.to);
    if (req.query.from)      result = result.filter(r => r.from      === req.query.from);
    if (req.query.projectId) result = result.filter(r => String(r.projectId) === String(req.query.projectId));
    if (req.query.status)    result = result.filter(r => r.status    === req.query.status);

    res.json({ requests: result });
  } catch (err) {
    console.error('GET /requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /requests/:id  — get a single request by id
app.get('/requests/:id', async (req, res) => {
  try {
    const data = await readRequests();
    const request = data.requests.find(r => String(r.id) === req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ request });
  } catch (err) {
    console.error('GET /requests/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// PUT /requests/:id  — update a request (mainly status: 'accepted' | 'declined')
app.put('/requests/:id', async (req, res) => {
  try {
    const ALLOWED = ['status', 'message', 'projectTitle'];

    const updates = {};
    for (const key of ALLOWED) {
      if (key in req.body) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const data = await readRequests();
    const idx = data.requests.findIndex(r => String(r.id) === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Request not found' });

    data.requests[idx] = { ...data.requests[idx], ...updates };
    await writeRequests(data);
    res.json({ request: data.requests[idx] });
  } catch (err) {
    console.error('PUT /requests/:id error:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// DELETE /requests/:id  — delete a request
app.delete('/requests/:id', async (req, res) => {
  try {
    const data = await readRequests();
    const idx = data.requests.findIndex(r => String(r.id) === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Request not found' });

    data.requests.splice(idx, 1);
    await writeRequests(data);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /requests/:id error:', err);
    res.status(500).json({ error: 'Failed to delete request' });
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
