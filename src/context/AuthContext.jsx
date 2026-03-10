import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:3001';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401 || response.status === 403) {
          // Server explicitly says token is invalid — remove it
          localStorage.removeItem('authToken');
        }
        // Any other status (5xx, etc.) — keep token and retry next time
      } catch (error) {
        // Network error (server down) — decode token locally so we can still load
        // the right per-user localStorage key and show their data offline
        console.error('Auth check failed (server may be offline):', error);
        try {
          // Try JWT format first (header.payload.signature)
          let sessionData = null
          const parts = token.split('.')
          if (parts.length === 3) {
            try {
              const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
              const padded = b64 + '='.repeat((4 - b64.length % 4) % 4)
              sessionData = JSON.parse(atob(padded))
            } catch { /* not a JWT */ }
          }
          // Fallback: try whole token as plain base64 JSON
          if (!sessionData) {
            sessionData = JSON.parse(atob(token))
          }
          if (sessionData && (sessionData.githubId || sessionData.googleId)) {
            setUser({
              githubId: sessionData.githubId || null,
              googleId: sessionData.googleId || null,
              username: sessionData.username || null,
              offline: true,
            });
          }
        } catch {
          // Token not decodable — leave user as null
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login with GitHub
  const loginWithGithub = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/auth/github`);
      const data = await response.json();
      
      // Open GitHub OAuth in a popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        data.url,
        'GitHub Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('GitHub login failed:', error);
      setError('Failed to initiate GitHub login');
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/auth/google`);
      const data = await response.json();
      
      // Open Google OAuth in a popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        data.url,
        'Google Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Failed to initiate Google login');
    }
  };

  // Handle auth success (called from callback page)
  const handleAuthSuccess = async (token) => {
    try {
      localStorage.setItem('authToken', token);
      
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        throw new Error('Failed to verify token');
      }
    } catch (error) {
      console.error('Auth success handler failed:', error);
      setError('Authentication failed');
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    loginWithGithub,
    loginWithGoogle,
    handleAuthSuccess,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
