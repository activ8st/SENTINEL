import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiFetch } from '@/lib/sentinelApi';
import { IS_DEMO_MODE } from '@/lib/db';

const AuthContext = createContext();

const DEFAULT_PIONEER_USER = {
  id: 'usr-pioniere-1',
  name: 'Pioniere Sentinel',
  first_name: 'Pioniere',
  last_name: 'Sentinel',
  role: 'user',
  karma: 100
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved user session:', e);
    }
    return DEFAULT_PIONEER_USER;
  });
  
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('sentinel_auth_token') || null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;
    const validateSession = async () => {
      const storedToken = localStorage.getItem('sentinel_auth_token');
      if (!storedToken) {
        if (isMounted) {
          setIsAuthenticated(true);
          if (!user) setUser(DEFAULT_PIONEER_USER);
        }
        return;
      }

      try {
        const response = await apiFetch('/api/users/me', { timeoutMs: 5000 });
        if (response.ok) {
          const userData = await response.json();
          if (isMounted) {
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('sentinel_user', JSON.stringify(userData));
          }
        }
      } catch (err) {
        console.warn('Backend auth check skipped:', err);
        if (isMounted) {
          setIsAuthenticated(true);
        }
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
