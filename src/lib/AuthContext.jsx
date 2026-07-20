import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const isDev = import.meta.env.DEV;
  const [user, setUser] = useState(isDev ? { name: 'Dev User', role: 'admin' } : null);
  const [isAuthenticated, setIsAuthenticated] = useState(isDev);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);

  const checkUserAuth = () => {
    // Non facciamo nulla, gestiamo lo stato manualmente via login() per ora.
    setAuthChecked(true);
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const navigateToLogin = () => {
    window.location.href = '/Auth';
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
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
