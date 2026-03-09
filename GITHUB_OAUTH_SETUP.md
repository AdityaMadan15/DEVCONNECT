# GitHub OAuth Setup Guide

## Step 1: Create a GitHub OAuth App

1. Go to GitHub Settings: https://github.com/settings/developers
2. Click on **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button
4. Fill in the application details:
   - **Application name**: `DevConnect Local` (or any name you prefer)
   - **Homepage URL**: `http://localhost:5174`
   - **Application description**: `DevConnect developer platform` (optional)
   - **Authorization callback URL**: `http://localhost:3001/auth/github/callback`
5. Click **"Register application"**
6. You'll see your **Client ID** on the next page
7. Click **"Generate a new client secret"** button
8. Copy both the **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholders with your actual GitHub OAuth credentials:

```env
GITHUB_CLIENT_ID=your_actual_client_id_here
GITHUB_CLIENT_SECRET=your_actual_client_secret_here
```

⚠️ **Important**: Never commit your `.env` file to Git! It's already in `.gitignore`.

## Step 3: Install Dependencies

Run the following command to install all required server dependencies:

```bash
npm install
```

This will install:
- `express` - Backend server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `concurrently` - Run multiple commands simultaneously

## Step 4: Start the Application

You have three options to run the application:

### Option 1: Run both frontend and backend together (Recommended)
```bash
npm run dev:all
```

### Option 2: Run them separately

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run server
```

## Testing the OAuth Flow

1. Open http://localhost:5174 in your browser
2. Navigate to the Login or Register page
3. Click the **"GitHub"** button
4. You'll be redirected to GitHub for authorization
5. After authorizing, you'll be redirected back and logged in automatically
6. Your user data will be saved in `server/users.json`

## File Structure

```
DEVCONNECT/
├── .env                           # Environment variables (DO NOT COMMIT)
├── server/
│   ├── index.js                   # Express server with GitHub OAuth
│   └── users.json                 # Persisted user data
├── src/
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication state management
│   ├── pages/
│   │   ├── LoginPage.jsx          # Updated with real GitHub OAuth
│   │   ├── RegisterPage.jsx       # Updated with real GitHub OAuth
│   │   └── AuthSuccessPage.jsx    # OAuth callback handler
│   └── main.jsx                   # Wrapped with AuthProvider
└── package.json                   # Updated with server scripts
```

## How It Works

1. **User clicks "Sign in with GitHub"**
   - Frontend calls `loginWithGithub()` from AuthContext
   - Opens a popup window to GitHub OAuth authorization

2. **User autorizes on GitHub**
   - GitHub redirects to `http://localhost:3001/auth/github/callback`
   - Backend exchanges authorization code for access token
   - Backend fetches user info from GitHub API

3. **Backend creates/updates user**
   - User data is saved to `server/users.json`
   - Session token is generated and sent back to frontend

4. **Frontend receives authentication**
   - Token is stored in localStorage
   - User is redirected to dashboard
   - User data is available via `useAuth()` hook

## User Data Persistence

All registered users are stored in `server/users.json` with the following structure:

```json
{
  "users": [
    {
      "id": 1,
      "githubId": 123456,
      "username": "octocat",
      "name": "The Octocat",
      "email": "octocat@github.com",
      "avatar": "https://avatars.githubusercontent.com/u/...",
      "bio": "Developer from GitHub",
      "location": "San Francisco",
      "company": "@github",
      "githubUrl": "https://github.com/octocat",
      "createdAt": "2026-03-07T...",
      "lastLogin": "2026-03-07T..."
    }
  ]
}
```

## Troubleshooting

### "Failed to initiate GitHub login"
- Make sure the backend server is running on port 3001
- Check that your `.env` file has the correct credentials

### "Authentication failed"
- Verify your GitHub OAuth app callback URL is exactly: `http://localhost:3001/auth/github/callback`
- Make sure you copied the entire Client Secret (it's long!)

### "Port already in use"
- Backend: Change PORT in `server/index.js` (default: 3001)
- Frontend: Vite will prompt you to use a different port

### Users not persisting
- Check that `server/users.json` exists and is writable
- Verify the server has permission to write to the directory

## Security Notes

- **Never share your Client Secret publicly**
- **Never commit `.env` to Git**
- Session tokens expire after 24 hours
- Access tokens are stored but redacted from API responses
- In production, use proper JWT tokens and HTTPS

## Next Steps

- [ ] Implement logout functionality in UI
- [ ] Add profile editing
- [ ] Implement Google and Apple OAuth
- [ ] Add email/password authentication as alternative
- [ ] Deploy to production with proper HTTPS
- [ ] Implement refresh tokens for longer sessions

---

**Need help?** Check the GitHub OAuth documentation: https://docs.github.com/en/apps/oauth-apps
##