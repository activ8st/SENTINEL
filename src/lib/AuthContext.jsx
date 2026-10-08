import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiFetch } from '@/lib/sentinelApi';

const AuthContext = createContext();

export const DEFAULT_ANONYMOUS_USER = {
  id: 'usr-anonymous',
  name: 'Utente anonimo',
  first_name: 'Utente',
  last_name: 'anonimo',
  role: 'anonymous',
  karma: 0,
  is_anonymous: true
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('sentinel_auth_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_user');
      if (saved && token) {
        const parsed = JSON.parse(saved);
        return { ...parsed, is_anonymous: false };
      }
    } catch (e) {
      console.warn('Error reading saved user session:', e);
    }
    return DEFAULT_ANONYMOUS_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Validate session on mount if token exists
  useEffect(() => {
    let isMounted = true;
    const validateSession = async () => {
      const storedToken = localStorage.getItem('sentinel_auth_token');
      if (!storedToken) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(DEFAULT_ANONYMOUS_USER);
        }
        return;
      }

      setIsLoadingAuth(true);
      try {
        const response = await apiFetch('/api/users/me', { timeoutMs: 5000 });
        if (response.ok) {
          const userData = await response.json();
          if (isMounted) {
            const fullUser = { ...userData, is_anonymous: false };
            setUser(fullUser);
            setIsAuthenticated(true);
            localStorage.setItem('sentinel_user', JSON.stringify(fullUser));
          }
        } else {
          if (isMounted) {
            setIsAuthenticated(false);
            setUser(DEFAULT_ANONYMOUS_USER);
          }
        }
      } catch (err) {
        console.warn('Backend auth check skipped:', err);
        if (isMounted) {
          // Keep stored user session if available, otherwise anonymous
          setIsAuthenticated(Boolean(storedToken));
        }
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    };

    validateSession();
    return () => { isMounted = false; };
  }, []);

  const login = (userData, authToken = null) => {
    const fullUser = { ...userData, is_anonymous: false };
    setUser(fullUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('sentinel_user', JSON.stringify(fullUser));
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
    setUser(DEFAULT_ANONYMOUS_USER);
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
