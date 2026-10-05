import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';
import { calcDistance } from '@/components/data/mockData';
import React, { useState, useEffect, useRef } from 'react';
import { initializeDB } from '@/lib/db';
import { getPersistentIncidents, syncSentinelFeedsPermanently } from '@/lib/liveSyncEngine';
import { LanguageThemeProvider } from '@/context/LanguageThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

const { Pages, Layout } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => {
  const marketingPages = ['LandingPage', 'Platform', 'Manifesto', 'Contact', 'Auth'];
  if (marketingPages.includes(currentPageName)) return <>{children}</>;
  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

const notifyKeyForType = (type) => `notify_${type}`;

const loadNotifySettings = () => {
  try {
    return JSON.parse(localStorage.getItem('sentinel_notify_settings') || '{}');
  } catch {
    return {};
  }
};

const AuthenticatedApp = () => {
  const notifySettings = loadNotifySettings();
  const prevIncidentIdsRef = useRef(new Set());
  const isFirstFetchRef = useRef(true);
  const [userRealGps, setUserRealGps] = useState(null);

  // 1. Instant High-Accuracy Physical GPS Triangulation at App Boot
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserRealGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn("Global GPS radar location error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Poll incidents for radar alerts
  const { data: dbIncidents = [] } = useQuery({
    queryKey: ['incidents-live'],
    queryFn: async () => {
      return syncSentinelFeedsPermanently();
    },
    initialData: () => getPersistentIncidents(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!dbIncidents.length) return;

    if (isFirstFetchRef.current) {
      dbIncidents.forEach((inc) => prevIncidentIdsRef.current.add(inc.id));
      isFirstFetchRef.current = false;
      return;
    }

    // Only fire "ALLERTA IN ZONA" toasts if user's real physical GPS location is active
    if (!userRealGps) return;

    dbIncidents.forEach((inc) => {
      if (!prevIncidentIdsRef.current.has(inc.id)) {
        prevIncidentIdsRef.current.add(inc.id);

        const isEnabled = notifySettings[notifyKeyForType(inc.type)] !== false;
        if (!isEnabled) return;

        const dist = calcDistance(userRealGps.lat, userRealGps.lng, inc.latitude, inc.longitude);
        // Only trigger toast for real incidents within 15 km of the user's actual physical location
        if (dist <= 15) {
          toast.warning(`ALLERTA IN ZONA: ${inc.title}`, {
            description: `${inc.address || inc.city} (${dist.toFixed(1)} km da te)`,
            duration: 8000,
          });
        }
      }
    });
  }, [dbIncidents, userRealGps, notifySettings]);

  return (
    <Routes>
      {/* PUBLIC MARKETING & AUTH ROUTES */}
      <Route path="/" element={<LayoutWrapper currentPageName="LandingPage"><Pages.LandingPage /></LayoutWrapper>} />
      <Route path="/LandingPage" element={<LayoutWrapper currentPageName="LandingPage"><Pages.LandingPage /></LayoutWrapper>} />
      <Route path="/Platform" element={<LayoutWrapper currentPageName="Platform"><Pages.Platform /></LayoutWrapper>} />
      <Route path="/Manifesto" element={<LayoutWrapper currentPageName="Manifesto"><Pages.Manifesto /></LayoutWrapper>} />
      <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Pages.Contact /></LayoutWrapper>} />
      <Route path="/Auth" element={<LayoutWrapper currentPageName="Auth"><Pages.Auth /></LayoutWrapper>} />

      {/* PROTECTED APP FUNCTIONAL ROUTES */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/Auth" replace />} />}>
        <Route path="/Home" element={<LayoutWrapper currentPageName="Home"><Pages.Home /></LayoutWrapper>} />
        <Route path="/Notifications" element={<LayoutWrapper currentPageName="Notifications"><Pages.Notifications /></LayoutWrapper>} />
        <Route path="/Profile" element={<LayoutWrapper currentPageName="Profile"><Pages.Profile /></LayoutWrapper>} />
        <Route path="/Report" element={<LayoutWrapper currentPageName="Report"><Pages.Report /></LayoutWrapper>} />
        <Route path="/MapView" element={<LayoutWrapper currentPageName="MapView"><Pages.MapView /></LayoutWrapper>} />
        <Route path="/IncidentDetail" element={<LayoutWrapper currentPageName="IncidentDetail"><Pages.IncidentDetail /></LayoutWrapper>} />
      </Route>

      {Object.entries(Pages).map(([pageName, PageComponent]) => {
        const knownPages = ['LandingPage', 'Platform', 'Manifesto', 'Contact', 'Auth', 'Home', 'Notifications', 'Profile', 'Report', 'MapView', 'IncidentDetail'];
        if (knownPages.includes(pageName)) return null;

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

export default function App() {
  useEffect(() => {
    initializeDB().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <LanguageThemeProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster position="top-right" theme="dark" />
          <SpeedInsights />
          <Analytics />
        </LanguageThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
