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
import { ThemeProvider } from 'next-themes';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => {
  const marketingPages = ['LandingPage', 'Platform', 'Manifesto', 'Contact', 'Auth'];
  if (marketingPages.includes(currentPageName)) return <>{children}</>;
  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

const DEFAULT_LOC = { lat: 41.9028, lng: 12.4964 };

const notifyKeyForType = (type) => `notify_${type}`;

const loadNotifySettings = () => {
  try {
    return JSON.parse(localStorage.getItem('sentinel_notify_settings') || '{}');
  } catch {
    return {};
  }
};

const shouldNotifyIncident = (incident, location) => {
  const settings = loadNotifySettings();
  const enabled = settings[notifyKeyForType(incident.type)] ?? true;
  if (!enabled) return false;

  const useRadius = localStorage.getItem('sentinelUseRadius') === 'true';
  if (!useRadius) return true;

  const radius = Number(localStorage.getItem('sentinelRadiusKm') || settings.notification_radius || 200);
  const distance = calcDistance(location.lat, location.lng, incident.latitude, incident.longitude);
  return distance <= radius;
};

const AlertWatcher = ({ children }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(DEFAULT_LOC);
  const initializedRef = useRef(false);
  const knownIdsRef = useRef(new Set());

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/incidents');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!incidents.length) return;

    if (!initializedRef.current) {
      knownIdsRef.current = new Set(incidents.map((incident) => incident.id));
      initializedRef.current = true;
      return;
    }

    const newIncidents = incidents
      .filter((incident) => !knownIdsRef.current.has(incident.id))
      .filter((incident) => shouldNotifyIncident(incident, location))
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    incidents.forEach((incident) => knownIdsRef.current.add(incident.id));

    if (newIncidents.length === 0) return;

    const incident = newIncidents[0];
    const title = incident.severity === 'critical' ? 'Alert critico Sentinel' : 'Nuovo alert Sentinel';
    const description = `${incident.title} - ${incident.city || incident.address || 'Italia'}`;

    toast(title, {
      description,
      action: {
        label: 'Apri',
        onClick: () => navigate(`/IncidentDetail?id=${incident.id}`),
      },
    });

    if ('Notification' in window) {
      const showNotification = () => {
        const notification = new Notification(title, {
          body: description,
          tag: incident.id,
        });
        notification.onclick = () => {
          window.focus();
          navigate(`/IncidentDetail?id=${incident.id}`);
          notification.close();
        };
      };

      if (Notification.permission === 'granted') {
        showNotification();
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') showNotification();
        });
      }
    }
  }, [incidents, location, navigate]);

  return children || null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {Object.entries(Pages).map(([pageName, PageComponent]) => {
        const marketingPages = ['LandingPage', 'Platform', 'Manifesto', 'Contact', 'Auth'];
        const isMarketing = marketingPages.includes(pageName);
        const path = pageName === mainPageKey ? "/" : `/${pageName}`;

        if (isMarketing) {
          return (
            <Route
              key={pageName}
              path={path}
              element={
                <LayoutWrapper currentPageName={pageName}>
                  <PageComponent />
                </LayoutWrapper>
              }
            />
          );
        }

        return (
          <Route key={pageName} element={<ProtectedRoute unauthenticatedElement={<Navigate to="/Auth" replace />} />}>
            <Route
              path={path}
              element={
                <AlertWatcher>
                  <LayoutWrapper currentPageName={pageName}>
                    <PageComponent />
                  </LayoutWrapper>
                </AlertWatcher>
              }
            />
          </Route>
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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
