import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const AUTH_BASE = `${API_URL}/api/auth`;

function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return JSON.parse(atob(token));
    }
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function openOAuthPopup(url, title) {
  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  return window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top}`
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in by calling /api/auth/me
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${AUTH_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Backend returns { success: true, data: { _id, name, email, avatar, skills, ... } }
          const u = data.data;
          setUser({
            id: u._id,
            name: u.name,
            email: u.email,
            avatar: u.avatar || null,
            skills: u.skills || [],
          });
        } else {
          // Token invalid or expired
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } catch {
        // Backend offline — fall back to local JWT decode for offline mode
        try {
          const payload = decodeToken(token);
          if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
            setUser({ id: payload.id, name: null, email: null, avatar: null, offline: true });
          } else {
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } catch {
          setUser(null);
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
      const popup = openOAuthPopup(`${AUTH_BASE}/github`, 'GitHub Login');
      if (!popup) {
        setError('Popup was blocked. Please allow popups and try again.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('GitHub login failed:', error);
      setError('Failed to initiate GitHub login');
      return false;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const popup = openOAuthPopup(`${AUTH_BASE}/google`, 'Google Login');
      if (!popup) {
        setError('Popup was blocked. Please allow popups and try again.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Failed to initiate Google login');
      return false;
    }
  };

  // Handle auth success (called from OAuth callback page)
  // Saves token then hydrates full user from GET /api/auth/me
  const handleAuthSuccess = async (token) => {
    try {
      if (!token) {
        setError('Authentication token is missing');
        return false;
      }

      localStorage.setItem('authToken', token);

      const res = await fetch(`${AUTH_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const u = data.data;
        setUser({
          id: u._id,
          name: u.name,
          email: u.email,
          avatar: u.avatar || null,
          skills: u.skills || [],
        });
        return true;
      } else {
        // Fallback: decode token locally (works for offline/dev)
        const payload = decodeToken(token);
        if (payload) {
          setUser({ id: payload.id, name: null, email: null, avatar: null, offline: true });
          return true;
        }
        throw new Error('Could not hydrate user');
      }
    } catch (err) {
      console.error('Auth success handler failed:', err);
      setError('Authentication failed');
      return false;
    }
  };

  // Logout — JWT is stateless, just clear localStorage
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
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
