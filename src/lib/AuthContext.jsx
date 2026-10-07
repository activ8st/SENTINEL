import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiFetch } from '@/lib/sentinelApi';
import { IS_DEMO_MODE } from '@/lib/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved user session:', e);
    }
    return null;
  });
  
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('sentinel_auth_token') || null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;
    const validateSession = async () => {
      const storedToken = localStorage.getItem('sentinel_auth_token');
      if (!storedToken) {
        if (IS_DEMO_MODE) {
          try {
            const saved = localStorage.getItem('sentinel_user');
            if (saved && isMounted) {
              setUser(JSON.parse(saved));
              setIsAuthenticated(true);
            }
          } catch (e) {}
        } else {
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('sentinel_user');
          }
        }
        if (isMounted) setIsLoadingAuth(false);
        return;
      }

      try {
        const response = await apiFetch('/api/users/me', { timeoutMs: 8000 });
        if (response.ok) {
          const userData = await response.json();
          if (isMounted) {
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('sentinel_user', JSON.stringify(userData));
          }
        } else {
          // Token invalid or expired
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
            setToken(null);
            localStorage.removeItem('sentinel_auth_token');
            localStorage.removeItem('sentinel_user');
          }
        }
      } catch (err) {
        console.warn('Backend auth check skipped or offline:', err);
        const saved = localStorage.getItem('sentinel_user');
        if (saved && isMounted) {
          setUser(JSON.parse(saved));
          setIsAuthenticated(true);
        }
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    };

    validateSession();
    return () => { isMounted = false; };
  }, []);

  const login = (userData, authToken = null) => {
    setUser(userData);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('sentinel_user', JSON.stringify(userData));
      if (authToken) {
        setToken(authToken);
        localStorage.setItem('sentinel_auth_token', authToken);
      }
    } catch (e) {
      console.warn('Error persisting user session:', e);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/Auth';
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('sentinel_user');
      localStorage.removeItem('sentinel_auth_token');
    } catch (e) {
      console.warn('Error clearing user session:', e);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoadingAuth,
    login,
    navigateToLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
