import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import React, { lazy, Suspense } from 'react';
import { LanguageThemeProvider } from '@/context/LanguageThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

import ErrorBoundary from '@/components/common/ErrorBoundary';

const { Pages, Layout } = pagesConfig;
const GlobalIncidentMonitor = lazy(() => import('@/components/incidents/GlobalIncidentMonitor'));
const OPERATIONAL_ROUTES = new Set([
  '/',
  '/home',
  '/mapview',
  '/notifications',
  '/profile',
  '/report',
  '/incidentdetail',
]);

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#05070a]" role="status" aria-label="Caricamento pagina">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#10b981]" />
  </div>
);

const LayoutWrapper = ({ children, currentPageName }) => {
  const marketingPages = ['LandingPage', 'Platform', 'Manifesto', 'Contact', 'Auth'];
  if (marketingPages.includes(currentPageName)) return <>{children}</>;
  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

const AuthenticatedApp = () => {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  const shouldMonitorIncidents = OPERATIONAL_ROUTES.has(normalizedPath);

  return (
    <>
      {shouldMonitorIncidents && (
        <Suspense fallback={null}>
          <GlobalIncidentMonitor />
        </Suspense>
      )}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
      {/* DIRECT OPEN PUBLIC APP & MARKETING ROUTES */}
      <Route path="/" element={<LayoutWrapper currentPageName="Home"><Pages.Home /></LayoutWrapper>} />
      <Route path="/Home" element={<LayoutWrapper currentPageName="Home"><Pages.Home /></LayoutWrapper>} />
      <Route path="/MapView" element={<LayoutWrapper currentPageName="MapView"><Pages.MapView /></LayoutWrapper>} />
      <Route path="/Notifications" element={<LayoutWrapper currentPageName="Notifications"><Pages.Notifications /></LayoutWrapper>} />
      <Route path="/Profile" element={<LayoutWrapper currentPageName="Profile"><Pages.Profile /></LayoutWrapper>} />
      <Route path="/Report" element={<LayoutWrapper currentPageName="Report"><Pages.Report /></LayoutWrapper>} />
      <Route path="/IncidentDetail" element={<LayoutWrapper currentPageName="IncidentDetail"><Pages.IncidentDetail /></LayoutWrapper>} />

      {/* MARKETING & AUTH ROUTES */}
      <Route path="/LandingPage" element={<LayoutWrapper currentPageName="LandingPage"><Pages.LandingPage /></LayoutWrapper>} />
      <Route path="/Platform" element={<LayoutWrapper currentPageName="Platform"><Pages.Platform /></LayoutWrapper>} />
      <Route path="/Manifesto" element={<LayoutWrapper currentPageName="Manifesto"><Pages.Manifesto /></LayoutWrapper>} />
      <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Pages.Contact /></LayoutWrapper>} />
      <Route path="/Auth" element={<LayoutWrapper currentPageName="Auth"><Pages.Auth /></LayoutWrapper>} />

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
      </Suspense>
    </>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <LanguageThemeProvider>
          <ErrorBoundary>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AuthenticatedApp />
            </Router>
          </ErrorBoundary>
          <Toaster />
          <SonnerToaster position="top-right" theme="dark" offset="72px" />
          <SpeedInsights />
          <Analytics />
        </LanguageThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
