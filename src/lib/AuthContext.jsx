import React, { createContext, useState, useContext } from 'react';

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
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('sentinel_user');
    } catch (e) {
      return false;
    }
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);

  const checkUserAuth = () => {
    setAuthChecked(true);
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('sentinel_user', JSON.stringify(userData));
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
    try {
      localStorage.removeItem('sentinel_user');
    } catch (e) {
      console.warn('Error clearing user session:', e);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    authChecked,
    checkUserAuth,
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
