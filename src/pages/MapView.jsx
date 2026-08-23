import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import IncidentCard from '@/components/incidents/IncidentCard';
import { calcDistance, TYPE_CONFIG, MOCK_INCIDENTS } from '@/components/data/mockData';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '@/lib/api';
import { Locate, Layers, X, List, ChevronDown, Navigation, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

import IncidentMap from '@/components/incidents/IncidentMap';

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };
const INITIAL_MAP_ZOOM = 15.8;

const TIME_WINDOWS = [
  { key: 'h-1', maxHours: 1, label: '1 ora' },
  ...Array.from({ length: 8 }, (_, i) => ({
    key: `h-${(i + 1) * 3}`,
    maxHours: (i + 1) * 3,
    label: `${(i + 1) * 3} ore`,
  })),
  ...Array.from({ length: 29 }, (_, i) => ({
    key: `d-${i + 2}`,
    maxHours: 24 * (i + 2),
    label: `${i + 2} giorni`,
  })),
];

const HOURLY_TIME_WINDOW_COUNT = 9;
const DEFAULT_TIME_WINDOW_INDEX = TIME_WINDOWS.length - 1; // Ultimi 30 giorni
const formatTimeWindowLabel = (window) => {
  if (window.maxHours === 1) return 'Ultima ora';
  return window.maxHours <= 24 ? `Ultime ${window.label}` : `Ultimi ${window.label}`;
};
const AREA_PRESETS = [3, 5, 10, 25, 50];
const loadSharedRadius = () => {
  const saved = Number(localStorage.getItem('sentinelRadiusKm') || localStorage.getItem('sentinelRadiusKmV3'));
  return Number.isFinite(saved) && saved >= 3 ? Math.min(saved, 100) : 3;
};
const loadSharedRadiusEnabled = () => {
  const saved = localStorage.getItem('sentinelUseRadius');
  if (saved !== null) return saved === 'true';
  return localStorage.getItem('sentinelUseRadiusV3') !== 'false';
};
const getIncidentDate = (incident) => new Date(incident.created_date || incident.last_seen_at || Date.now());

const isInTimeWindow = (incident, windowIndex) => {
  const selected = TIME_WINDOWS[windowIndex] || TIME_WINDOWS[0];
  const ageHours = (Date.now() - getIncidentDate(incident).getTime()) / 36e5;
  return Math.max(0, ageHours) <= (selected ? selected.maxHours : 720);
};

export default function MapView() {
  const [mapReady, setMapReady] = useState(false);
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [activeFilters, setActiveFilters] = useState(Object.keys(TYPE_CONFIG));
  const [radius, setRadius] = useState(loadSharedRadius);
  const [useRadius, setUseRadius] = useState(loadSharedRadiusEnabled);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [followUser, setFollowUser] = useState(false);
  const [showList, setShowList] = useState(false);
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeTarget, setRouteTarget] = useState(null);
  const [routeIncident, setRouteIncident] = useState(null);
  const [timeWindowIndex, setTimeWindowIndex] = useState(() => {
    const savedHours = Number(localStorage.getItem('sentinelMapTimeWindowHoursV4'));
    const savedHoursIndex = TIME_WINDOWS.findIndex(window => window.maxHours === savedHours);
    if (savedHoursIndex >= 0) return savedHoursIndex;

    // Migra la vecchia selezione basata sull'indice senza spostare il periodo scelto.
    const legacyIndex = Number(localStorage.getItem('sentinelMapTimeWindowIndexV3'));
    if (Number.isInteger(legacyIndex) && legacyIndex >= 0 && legacyIndex <= 36) {
      const legacyHours = legacyIndex < 8 ? (legacyIndex + 1) * 3 : (legacyIndex - 6) * 24;
      const migratedIndex = TIME_WINDOWS.findIndex(window => window.maxHours === legacyHours);
      if (migratedIndex >= 0) return migratedIndex;
    }

    return DEFAULT_TIME_WINDOW_INDEX;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const timePickerRef = useRef(null);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sentinelMapTimeWindowHoursV4', String(TIME_WINDOWS[timeWindowIndex].maxHours));
  }, [timeWindowIndex]);

  useEffect(() => {
    if (!showTimePicker) return undefined;

    const closeTimePicker = (event) => {
      if (!timePickerRef.current?.contains(event.target)) setShowTimePicker(false);
    };

    document.addEventListener('pointerdown', closeTimePicker);
    return () => document.removeEventListener('pointerdown', closeTimePicker);
  }, [showTimePicker]);

  useEffect(() => {
    localStorage.setItem('sentinelUseRadius', String(useRadius));
  }, [useRadius]);

  useEffect(() => {
    localStorage.setItem('sentinelRadiusKm', String(radius));
  }, [radius]);

  useEffect(() => {
    setMapReady(true);

    // Parse URL params for routing
    const params = new URLSearchParams(window.location.search);
    const routeTo = params.get('routeTo');
    const incidentId = params.get('incidentId');

    if (routeTo) {
      const [destLat, destLng] = routeTo.split(',').map(Number);
      setRouteTarget({ lat: destLat, lng: destLng });
      if (incidentId) {
        fetch(apiUrl(`/api/incidents/${incidentId}`))
          .then(r => r.json())
          .then(inc => setRouteIncident(inc))
          .catch(() => {});
      }

      const fetchRoute = async (startLat, startLng) => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            // GeoJSON coords are [lng, lat] — convert to [lat, lng] for Leaflet
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            setRouteCoords(coords);
          } else {
            // fallback straight line
            setRouteCoords([[startLat, startLng], [destLat, destLng]]);
          }
        } catch {
          setRouteCoords([[startLat, startLng], [destLat, destLng]]);
        }
      };

      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setLocation({ lat: userLat, lng: userLng });
          setHasUserLocation(true);
          setFollowUser(true);
          fetchRoute(userLat, userLng);
        },
        () => {
          fetchRoute(DEFAULT_LOC.lat, DEFAULT_LOC.lng);
        }
      );
    } else {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setHasUserLocation(true);
          setFollowUser(true);
        },
        () => {}
      );
    }
  }, []);

  const { data: apiIncidents = getPersistentIncidents(), refetch, isFetching } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/incidents?limit=2000'));
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000,
  });

  const incidents = useMemo(() => apiIncidents
    .filter(i => activeFilters.includes(i.type))
    .filter(i => isInTimeWindow(i, timeWindowIndex))
    .filter(i => {
      if (!useRadius || !hasUserLocation) return true;
      return calcDistance(location.lat, location.lng, i.latitude, i.longitude) <= radius;
    })
    .map(i => ({
      ...i,
      distance: calcDistance(location.lat, location.lng, i.latitude, i.longitude),
    }))
    .sort((a, b) => a.distance - b.distance), [apiIncidents, activeFilters, timeWindowIndex, useRadius, hasUserLocation, radius, location]);

  const moveTimeWindow = (direction) => {
    setTimeWindowIndex(current => {
      const next = current + direction;
      return Math.min(Math.max(next, 0), TIME_WINDOWS.length - 1);
    });
  };

  const refreshLiveNews = async () => {
    setRefreshingNews(true);
    try {
      await fetch(apiUrl('/api/incidents/refresh'), { method: 'POST' });
      await refetch();
    } finally {
      setRefreshingNews(false);
    }
  };

  const toggleFilter = (key) => {
    setActiveFilters(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const locateUser = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setHasUserLocation(true);
        setFollowUser(true);
      },
      () => {}
    );
  };

  const categoryFiltersCount = Object.keys(TYPE_CONFIG).length - activeFilters.length;

  // Memoizzati per evitare re-render inutili della mappa → niente lag
  const mapCenter = useMemo(() => {
    if (routeTarget) return [(location.lat + routeTarget.lat) / 2, (location.lng + routeTarget.lng) / 2];
    if (followUser || (useRadius && hasUserLocation)) return [location.lat, location.lng];
    return [DEFAULT_LOC.lat, DEFAULT_LOC.lng];
  }, [routeTarget, location, followUser, hasUserLocation, useRadius]);

  const mapZoom = routeTarget
    ? 8
    : INITIAL_MAP_ZOOM;

  const handleIncidentClick = useCallback((inc) => {
    setSelectedIncident({ ...inc, distance: calcDistance(location.lat, location.lng, inc.latitude, inc.longitude) });
    setShowList(false);
  }, [location]);

  return (
    <div className="flex h-[calc(100dvh-72px)] flex-col bg-transparent overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-white/6 z-20 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-900 dark:text-white font-semibold text-sm flex-shrink-0">Mappa</span>
          {routeTarget ? (
            <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs truncate max-w-[140px]">
              <Navigation className="w-3 h-3 mr-1 inline" />
              {routeIncident ? routeIncident.city : 'Percorso attivo'}
            </Badge>
          ) : (
            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs border-0">
              {incidents.length} eventi
            </Badge>
          )}
          {routeTarget && (
            <button
              onClick={() => { setRouteTarget(null); setRouteCoords(null); setRouteIncident(null); }}
              className="text-xs text-red-400 hover:text-red-300 flex-shrink-0"
            >
              ✕ Annulla
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowList(s => !s)}
            className={`flex min-h-10 items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              showList ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lista
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className={`flex min-h-10 items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categoryFiltersCount > 0 ? 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Filtri {categoryFiltersCount > 0 ? `(${categoryFiltersCount})` : ''}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 relative overflow-hidden">
        {!mapReady ? (
          <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Caricamento mappa...</p>
            </div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <div className="absolute inset-0">
              <IncidentMap
                incidents={incidents}
                userLocation={location}
                center={mapCenter}
                zoom={mapZoom}
                height="100%"
                showRadius={useRadius && hasUserLocation}
                radiusKm={radius}
                routeCoords={routeCoords}
                routeTarget={routeTarget}
                onIncidentClick={handleIncidentClick}
                className="rounded-none"
              />
            </div>
          </Suspense>
        )}

        {/* Locate button */}
        <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between gap-2 pointer-events-none">
          <div
            ref={timePickerRef}
            className="relative flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 px-2 py-1 shadow pointer-events-auto"
          >
            <button
              onClick={() => moveTimeWindow(-1)}
              disabled={timeWindowIndex <= 0}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-35"
              aria-label="Riduci il periodo mostrato"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowTimePicker(open => !open)}
              className="flex h-8 min-w-[132px] max-w-[170px] items-center justify-center gap-1.5 rounded-full px-2 text-center text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
              aria-haspopup="dialog"
              aria-expanded={showTimePicker}
              aria-label={`Seleziona periodo. Attualmente ${formatTimeWindowLabel(TIME_WINDOWS[timeWindowIndex])}`}
            >
              <span className="truncate">{formatTimeWindowLabel(TIME_WINDOWS[timeWindowIndex])}</span>
              <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${showTimePicker ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => moveTimeWindow(1)}
              disabled={timeWindowIndex >= TIME_WINDOWS.length - 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-35"
              aria-label="Aumenta il periodo mostrato"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showTimePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 top-12 z-50 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-white/15 bg-gray-950 text-white shadow-2xl"
                  role="dialog"
                  aria-label="Seleziona il periodo degli eventi"
                >
                  <div className="border-b border-white/10 px-3 py-2.5">
                    <p className="text-sm font-semibold">Periodo eventi</p>
                    <p className="mt-0.5 text-xs text-gray-400">Mostra gli eventi da oggi fino al periodo scelto</p>
                  </div>

                  <div className="max-h-[310px] overflow-y-auto p-3">
                    <p className="mb-2 text-xs font-medium text-gray-400">Ultime 24 ore</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {TIME_WINDOWS.slice(0, HOURLY_TIME_WINDOW_COUNT).map((window, index) => (
                        <button
                          key={window.key}
                          type="button"
                          onClick={() => {
                            setTimeWindowIndex(index);
                            setShowTimePicker(false);
                          }}
                          className={`h-9 rounded-md text-xs font-semibold transition-colors ${
                            timeWindowIndex === index
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/[0.07] text-gray-200 hover:bg-white/15'
                          }`}
                        >
                          {window.maxHours}h
                        </button>
                      ))}
                    </div>

                    <p className="mb-2 mt-4 text-xs font-medium text-gray-400">Da 2 a 30 giorni</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {TIME_WINDOWS.slice(HOURLY_TIME_WINDOW_COUNT).map((window, offset) => {
                        const index = offset + HOURLY_TIME_WINDOW_COUNT;
                        return (
                          <button
                            key={window.key}
                            type="button"
                            onClick={() => {
                              setTimeWindowIndex(index);
                              setShowTimePicker(false);
                            }}
                            className={`h-9 rounded-md text-xs font-semibold transition-colors ${
                              timeWindowIndex === index
                                ? 'bg-orange-500 text-white'
                                : 'bg-white/[0.07] text-gray-200 hover:bg-white/15'
                            }`}
                            aria-label={`Ultimi ${window.label}`}
                          >
                            {offset + 2}g
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <Button
              size="icon"
              className="bg-white dark:bg-gray-900/95 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow"
              onClick={refreshLiveNews}
              disabled={refreshingNews || isFetching}
              aria-label="Aggiorna notizie online"
            >
              <RefreshCw className={`w-5 h-5 ${refreshingNews || isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="absolute top-16 right-4 z-30">
          <Button
            size="icon"
            className={`${followUser ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white dark:bg-gray-900/95 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'} border border-gray-200 dark:border-white/10 shadow`}
            onClick={locateUser}
          >
            <Locate className="w-5 h-5" />
          </Button>
        </div>

        {/* Report FAB */}
        <div className="absolute bottom-6 right-4 z-30">
          <Button
            className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-[0_8px_30px_rgb(249,115,22,0.4)] transition-transform hover:scale-105 active:scale-95"
            onClick={() => setIsReportModalOpen(true)}
            aria-label="Segnala Emergenza"
          >
            <Plus className="w-7 h-7" />
          </Button>
        </div>

        {/* Selected incident preview */}
        <AnimatePresence>
          {selectedIncident && !showList && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 z-30"
            >
              <div className="relative">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center shadow"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <IncidentCard incident={selectedIncident} distance={selectedIncident.distance} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide-up list */}
        <AnimatePresence>
          {showList && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 z-30 bg-white dark:bg-gray-950 rounded-t-2xl border-t border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl"
              style={{ maxHeight: '65%' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/6">
                <span className="text-gray-900 dark:text-white font-semibold text-sm">{incidents.length} eventi in Italia</span>
                <button onClick={() => setShowList(false)}>
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 'calc(65vh - 56px)' }}>
                {incidents.map(inc => (
                  <div key={inc.id} onClick={() => { setSelectedIncident(inc); setShowList(false); }}>
                    <IncidentCard incident={inc} distance={inc.distance} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-3xl max-h-[75vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-gray-900 dark:text-white">Filtri mappa</SheetTitle>
          </SheetHeader>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => setUseRadius(r => !r)}
              className="flex min-h-14 cursor-pointer items-center justify-between w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-3 active:scale-[0.99]"
            >
              <span className="text-gray-900 dark:text-white font-medium text-sm">Filtro area</span>
              <div className={`pointer-events-none w-12 h-6 rounded-full transition-colors ${useRadius ? 'bg-orange-500' : 'bg-gray-600'} relative`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useRadius ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </button>
            {useRadius && (
              <>
                {!hasUserLocation && (
                  <p className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-300">
                    Il raggio si applica appena il browser rileva la tua posizione.
                  </p>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Raggio</span>
                  <Badge variant="outline" className="text-orange-500 dark:text-orange-400 border-orange-500">{radius} km</Badge>
                </div>
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {AREA_PRESETS.map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => { setRadius(km); setUseRadius(true); }}
                      className={`min-h-9 rounded-lg border px-2 text-xs font-semibold transition-colors ${radius === km ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
                <Slider value={[radius]} onValueChange={([v]) => setRadius(v)} min={3} max={100} step={1} />
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tipo incidente</span>
              <button
                type="button"
                className="min-h-9 px-2 text-xs text-orange-500 dark:text-orange-400 font-medium"
                onClick={() => setActiveFilters(
                  activeFilters.length === Object.keys(TYPE_CONFIG).length ? [] : Object.keys(TYPE_CONFIG)
                )}
              >
                {activeFilters.length === Object.keys(TYPE_CONFIG).length ? 'Deseleziona tutti' : 'Seleziona tutti'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const active = activeFilters.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFilter(key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      active ? `${cfg.bg} ${cfg.text} border-current/30` : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <span className="text-lg">{cfg.emoji}</span>
                    <span className="text-sm font-medium">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => setShowFilters(false)}
          >
            Applica
          </Button>
        </SheetContent>
      </Sheet>

      <ReportIncidentModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        userLocation={location} 
      />
    </div>
  );
}
