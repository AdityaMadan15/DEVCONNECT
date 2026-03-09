# Google OAuth Setup Guide

## Step 1: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `DevConnect`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"** through the remaining steps
6. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: `DevConnect Local`
   - **Authorized JavaScript origins**:
     - `http://localhost:5174`
   - **Authorized redirect URIs**:
     - `http://localhost:3001/auth/google/callback`
7. Click **"CREATE"**
8. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

Open your `.env` file and add your Google OAuth credentials:

```env
GITHUB_CLIENT_ID=Ov23lisP8t2p0MeSBUcN
GITHUB_CLIENT_SECRET=4da34dab275c7f241d95b37bdf63f9d120c16af3

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step 3: Enable Required APIs

In Google Cloud Console:
1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google+ API** (for user profile)
   - **Google OAuth2 API**

## Step 4: Restart the Server

Stop and restart your backend server to load the new credentials:

```powershell
# Stop existing servers
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Start server
npm run server
```

## Step 5: Test Google OAuth

1. Open http://localhost:5174/login
2. Click the **"Google"** button (middle button in OAuth section)
3. Sign in with your Google account
4. Authorize DevConnect
5. You'll be automatically logged in and redirected to dashboard

## What Gets Saved

When you sign in with Google, the following data is saved to `server/users.json`:

```json
{
  "id": 2,
  "googleId": "123456789012345678901",
  "username": "youremail",
  "name": "Your Name",
  "email": "your.email@gmail.com",
  "avatar": "https://lh3.googleusercontent.com/...",
  "bio": null,
  "location": null,
  "company": null,
  "googleUrl": "https://mail.google.com/mail/u/your.email@gmail.com",
  "createdAt": "2026-03-07T...",
  "lastLogin": "2026-03-07T..."
}
```

## OAuth Flow Comparison

| Feature | GitHub OAuth | Google OAuth |
|---------|-------------|--------------|
| User ID | `githubId` | `googleId` |
| Avatar | GitHub avatar | Google profile picture |
| Username | GitHub username | Email prefix |
| Profile URL | GitHub profile | Gmail link |
| Scopes | `user:email` | `openid profile email` |

## Troubleshooting

### "OAuth is not yet implemented" error
- Make sure you've added Google credentials to `.env`
- Restart the backend server after updating `.env`
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

### "redirect_uri_mismatch" error
- Verify the callback URL in Google Cloud Console is exactly:
  `http://localhost:3001/auth/google/callback`
- Make sure there are no trailing slashes
- Check both "Authorized redirect URIs" and "Authorized JavaScript origins"

### "Access blocked: This app's request is invalid" error
- Complete the OAuth consent screen configuration
- Add your email to test users if using External user type
- Make sure required APIs are enabled (Google+ API, OAuth2 API)

### CORS errors
- Verify `http://localhost:5174` is in "Authorized JavaScript origins"
- Check server CORS configuration allows the frontend origin

## Security Notes

- **Never commit** `.env` file to Git
- Rotate secrets if accidentally exposed
- In production:
  - Use JWT tokens instead of Base64 encoding
  - Store secrets in environment variables or secret managers
  - Use HTTPS for all OAuth callbacks
  - Implement CSRF protection
  - Add rate limiting

## Multiple OAuth Providers

Your app now supports both GitHub and Google OAuth:
- Users can sign in with either provider
- Each provider creates a separate user account
- Accounts are identified by `githubId` or `googleId`
- Same email address can have accounts on both providers

To link accounts by email in the future, modify `saveUser()` in `server/index.js`.

---

**After setting up Google OAuth credentials, restart your server and try signing in with Google!**
