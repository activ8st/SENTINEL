import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';
import { calcDistance } from '@/components/data/mockData';
import React, { useState, useEffect, useRef } from 'react';
import { initializeDB } from '@/lib/db';
import { LanguageThemeProvider } from '@/context/LanguageThemeContext';

const { Pages, Layout, mainPage } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => {
  const marketingPages = ['LandingPage', 'Platform', 'Manifesto', 'Contact', 'Auth'];
  if (marketingPages.includes(currentPageName)) return <>{children}</>;
  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };

const notifyKeyForType = (type) => `notify_${type}`;

const loadNotifySettings = () => {
  try {
    return JSON.parse(localStorage.getItem('sentinel_notify_settings') || '{}');
  } catch {
    return {};
  }
};

const AuthenticatedApp = () => {
  const { user } = useAuth();
  const notifySettings = loadNotifySettings();
  const prevIncidentIdsRef = useRef(new Set());
  const isFirstFetchRef = useRef(true);

  // Poll backend for incidents every 30s
  const { data: dbIncidents = [] } = useQuery({
    queryKey: ['incidents-alerts'],
    queryFn: async () => {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') return [];
      try {
        const res = await fetch('http://localhost:8000/api/incidents');
        if (!res.ok) return [];
        return await res.json();
      } catch (e) {
        return [];
      }
    },
    refetchInterval: 30000,
  });

  // User location for radar alerts
  const userLat = user?.location?.lat ?? DEFAULT_LOC.lat;
  const userLng = user?.location?.lng ?? DEFAULT_LOC.lng;

  useEffect(() => {
    if (!dbIncidents.length) return;

    if (isFirstFetchRef.current) {
      dbIncidents.forEach((inc) => prevIncidentIdsRef.current.add(inc.id));
      isFirstFetchRef.current = false;
      return;
    }

    dbIncidents.forEach((inc) => {
      if (!prevIncidentIdsRef.current.has(inc.id)) {
        prevIncidentIdsRef.current.add(inc.id);

        const isEnabled = notifySettings[notifyKeyForType(inc.type)] !== false;
        if (!isEnabled) return;

        const dist = calcDistance(userLat, userLng, inc.latitude, inc.longitude);
        if (dist <= 5) {
          toast.warning(`ALLERTA IN ZONA: ${inc.title}`, {
            description: `${inc.address} (${dist.toFixed(1)} km da te)`,
            duration: 8000,
          });
        }
      }
    });
  }, [dbIncidents, userLat, userLng, notifySettings]);

  return (
    <Routes>
      {/* PUBLIC MARKETING ROUTES */}
      <Route path="/" element={<LayoutWrapper currentPageName="LandingPage"><Pages.LandingPage /></LayoutWrapper>} />
      <Route path="/LandingPage" element={<LayoutWrapper currentPageName="LandingPage"><Pages.LandingPage /></LayoutWrapper>} />
      <Route path="/Platform" element={<LayoutWrapper currentPageName="Platform"><Pages.Platform /></LayoutWrapper>} />
      <Route path="/Manifesto" element={<LayoutWrapper currentPageName="Manifesto"><Pages.Manifesto /></LayoutWrapper>} />
      <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Pages.Contact /></LayoutWrapper>} />
      <Route path="/Auth" element={<LayoutWrapper currentPageName="Auth"><Pages.Auth /></LayoutWrapper>} />

      {/* APP FUNCTIONAL ROUTES */}
      <Route path="/Home" element={<LayoutWrapper currentPageName="Home"><Pages.Home /></LayoutWrapper>} />

      {/* ALL APP ROUTES PUBLIC & DIRECTLY ACCESSIBLE */}
      <Route path="/Notifications" element={<LayoutWrapper currentPageName="Notifications"><Pages.Notifications /></LayoutWrapper>} />
      <Route path="/Profile" element={<LayoutWrapper currentPageName="Profile"><Pages.Profile /></LayoutWrapper>} />
      <Route path="/Report" element={<LayoutWrapper currentPageName="Report"><Pages.Report /></LayoutWrapper>} />
      <Route path="/MapView" element={<LayoutWrapper currentPageName="MapView"><Pages.MapView /></LayoutWrapper>} />
      <Route path="/IncidentDetail" element={<LayoutWrapper currentPageName="IncidentDetail"><Pages.IncidentDetail /></LayoutWrapper>} />

      {Object.entries(Pages).map(([pageName, PageComponent]) => {
        const publicPages = ['LandingPage', 'Platform', 'Manifesto', 'Contact', 'Auth', 'Home', 'Notifications', 'Profile', 'Report', 'MapView', 'IncidentDetail'];
        if (publicPages.includes(pageName)) return null;

        return (
          <Route
            key={pageName}
            path={`/${pageName}`}
            element={
              <LayoutWrapper currentPageName={pageName}>
                <PageComponent />
              </LayoutWrapper>
            }
          />
        );
      })}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    initializeDB();
  }, []);

  return (
    <LanguageThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageThemeProvider>
  )
}

export default App
