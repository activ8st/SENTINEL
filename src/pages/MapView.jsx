import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import IncidentCard from '@/components/incidents/IncidentCard';
import { calcDistance, TYPE_CONFIG, normalizeIncidentType } from '@/components/data/mockData';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, Navigation, RefreshCw, X, CheckSquare, Square } from 'lucide-react';
import ReportIncidentModal from '@/components/incidents/ReportIncidentModal';
import IncidentMap from '@/components/incidents/IncidentMap';
import { syncSentinelFeedsPermanently, getPersistentIncidents } from '@/lib/liveSyncEngine';
import { AREA_RADIUS_PRESETS, loadAreaFilter, saveAreaFilter } from '@/lib/areaFilter';

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };

const TIME_WINDOWS = [
  ...Array.from({ length: 8 }, (_, index) => ({
    hours: (index + 1) * 3,
    label: `Ultime ${(index + 1) * 3} ore`,
  })),
  ...Array.from({ length: 29 }, (_, index) => ({
    hours: (index + 2) * 24,
    label: `Ultimi ${index + 2} giorni`,
  })),
];

export default function MapView() {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [userGpsActive, setUserGpsActive] = useState(false);
  const [mapCenter, setMapCenter] = useState([42.5, 12.5]);
  const [activeTypes, setActiveTypes] = useState(Object.keys(TYPE_CONFIG));
  const [selectedHours, setSelectedHours] = useState(() => {
    const saved = Number(localStorage.getItem('sentinelMapTimeHoursV6'));
    return TIME_WINDOWS.some(window => window.hours === saved) ? saved : 720;
  });
  const [radius, setRadius] = useState(() => loadAreaFilter().radius);
  const [useRadius, setUseRadius] = useState(() => loadAreaFilter().enabled);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    saveAreaFilter(useRadius, radius);
  }, [useRadius, radius]);

  useEffect(() => {
    localStorage.setItem('sentinelMapTimeHoursV6', String(selectedHours));
  }, [selectedHours]);

  // 1. Instant High-Accuracy GPS Triangulation
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(userLoc);
        setUserGpsActive(true);
        setMapCenter([userLoc.lat, userLoc.lng]);
      },
      (err) => {
        console.warn("GPS Location error fallback:", err);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Live Query from TanStack Query
  const { data: rawLiveIncidents = [], refetch, isFetching } = useQuery({
    queryKey: ['incidents-map-v12'],
    queryFn: async () => {
      return await syncSentinelFeedsPermanently();
    },
    refetchInterval: 15000,
  });

  const baseIncidents = useMemo(() => {
    if (Array.isArray(rawLiveIncidents) && rawLiveIncidents.length > 0) {
      return rawLiveIncidents;
    }
    return getPersistentIncidents();
  }, [rawLiveIncidents]);

  const incidentsWithDistance = useMemo(() => {
    return baseIncidents.map(inc => ({
      ...inc,
      distance: calcDistance(location.lat, location.lng, inc.latitude, inc.longitude)
    }));
  }, [baseIncidents, location]);

  const filteredIncidents = useMemo(() => {
    const cutoffTime = Date.now() - selectedHours * 3600 * 1000;
    return incidentsWithDistance
      .filter(i => activeTypes.includes(normalizeIncidentType(i.type)))
      .filter(i => !useRadius || !userGpsActive || (i.distance ?? 999999) <= radius)
      .filter(i => {
        if (!i.created_date) return true;
        return new Date(i.created_date).getTime() >= cutoffTime;
      });
  }, [incidentsWithDistance, activeTypes, useRadius, userGpsActive, radius, selectedHours]);

  const handleRefresh = async () => {
    setRefreshingNews(true);
    await refetch();
    setRefreshingNews(false);
  };

  const handleRecenterUser = () => {
    if (userGpsActive && location) {
      setMapCenter([location.lat, location.lng]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(userLoc);
        setUserGpsActive(true);
        setMapCenter([userLoc.lat, userLoc.lng]);
      });
    }
  };

  const categoryFiltersCount = Object.keys(TYPE_CONFIG).length - activeTypes.length;
  const mapZoom = userGpsActive && useRadius
    ? (radius <= 1 ? 14.5 : radius <= 3 ? 13.5 : radius <= 5 ? 12.5 : radius <= 10 ? 11.5 : 10.5)
    : 6;

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', minHeight: '500px' }} className="bg-[#05070a] overflow-hidden">
      
      {/* 1. Top Floating Controls Bar */}
      <div className="absolute top-4 inset-x-4 z-20 max-w-xl mx-auto flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: GPS & Time Selector */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#0d1017]/90 backdrop-blur-md p-1.5 px-3 rounded-full border border-white/15 shadow-2xl">
          <button
            onClick={handleRecenterUser}
            className="flex items-center gap-1.5 text-xs font-bold text-[#10b981] hover:text-emerald-300 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>{userGpsActive ? 'La tua Posizione' : 'GPS Italia'}</span>
          </button>
          
          <span className="text-white/20">•</span>

          <select
            value={selectedHours}
            onChange={(e) => setSelectedHours(Number(e.target.value))}
            className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
          >
            {TIME_WINDOWS.map(tw => (
              <option key={tw.hours} value={tw.hours} className="bg-black text-white">
                {tw.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Button
            size="icon"
            onClick={() => setShowFilters(true)}
            aria-label={`Filtri${categoryFiltersCount > 0 ? `, ${categoryFiltersCount} attivi` : ''}`}
            className={`relative border rounded-full w-8 h-8 shadow-2xl ${categoryFiltersCount > 0 ? 'bg-[#10b981] hover:bg-emerald-400 text-black border-[#10b981]' : 'bg-[#0d1017]/90 hover:bg-[#141721] text-white border-white/15'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {categoryFiltersCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-black">
                {categoryFiltersCount}
              </span>
            )}
          </Button>

          <Button
            size="icon"
            onClick={handleRefresh}
            disabled={refreshingNews || isFetching}
            className="bg-[#0d1017]/90 hover:bg-[#141721] text-white border border-white/15 rounded-full w-8 h-8 shadow-2xl"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingNews || isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

      </div>

      {/* 2. Full-Screen 3D Map View Container */}
      <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
        <IncidentMap
          incidents={filteredIncidents}
          center={mapCenter}
          userLocation={userGpsActive ? location : null}
          zoom={mapZoom}
          showRadius={useRadius && userGpsActive}
          radiusKm={radius}
          height="100%"
          onIncidentClick={(inc) => {
            setSelectedIncident(inc);
            setMapCenter([inc.latitude, inc.longitude]);
          }}
        />
      </div>

      {/* 3. Responsive Incident Card Popup Panel (Desktop: Bottom-Right Floating Panel / Mobile: Bottom Drawer) */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="absolute z-30 md:bottom-6 md:right-6 md:left-auto md:max-w-md w-full bottom-0 inset-x-0 p-3 md:p-0"
          >
            <div className="relative shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="absolute -top-3 right-3 w-8 h-8 rounded-full bg-black border border-white/20 text-white flex items-center justify-center shadow-2xl z-40 hover:bg-slate-900 transition-transform hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
              <IncidentCard incident={selectedIncident} distance={selectedIncident.distance} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-[#0b0e14] border-white/10 text-white max-h-[80vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-white/10">
            <SheetTitle className="text-white text-base font-bold flex items-center justify-between">
              <span>Filtri Mappa 3D</span>
              <button
                onClick={() => {
                  setActiveTypes(Object.keys(TYPE_CONFIG));
                  setUseRadius(true);
                  setRadius(1);
                }}
                className="text-xs text-[#10b981] font-normal hover:underline"
              >
                Resetta
              </button>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-6">
            <div>
              <button
                type="button"
                onClick={() => setUseRadius(prev => !prev)}
                className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-xs font-semibold text-white/70">Filtro area GPS</span>
                <span className={`flex items-center gap-2 text-xs font-bold ${useRadius ? 'text-[#10b981]' : 'text-white/40'}`}>
                  {useRadius ? `Entro ${radius} km` : 'Disattivato'}
                  {useRadius ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                </span>
              </button>
              {useRadius && !userGpsActive && (
                <p className="mb-2 text-[11px] text-amber-300/80">Il filtro si applica appena il browser rileva la tua posizione.</p>
              )}
              {useRadius && (
                <div className="pt-2 px-1">
                  <div className="mb-3 grid grid-cols-5 gap-2">
                    {AREA_RADIUS_PRESETS.map(km => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => { setRadius(km); setUseRadius(true); }}
                        className={`min-h-9 rounded-lg border px-2 text-xs font-bold ${radius === km ? 'border-[#10b981] bg-[#10b981] text-black' : 'border-white/15 bg-white/5 text-white/70'}`}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                  <Slider
                    value={[radius]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={([val]) => setRadius(val)}
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-2">
                    <span>1 km</span>
                    <span className="text-[#10b981] font-bold">{radius} km</span>
                    <span>100 km</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70">Tipo incidente</span>
                <button
                  type="button"
                  onClick={() => setActiveTypes(activeTypes.length === Object.keys(TYPE_CONFIG).length ? [] : Object.keys(TYPE_CONFIG))}
                  className="text-xs font-bold text-[#10b981]"
                >
                  {activeTypes.length === Object.keys(TYPE_CONFIG).length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                  const active = activeTypes.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTypes(current => current.includes(key) ? current.filter(type => type !== key) : [...current, key])}
                      className={`flex min-h-12 items-center gap-2 rounded-lg border px-3 text-left text-xs font-bold ${active ? 'border-[#10b981]/50 bg-[#10b981]/10 text-white' : 'border-white/10 bg-white/[0.03] text-white/40'}`}
                    >
                      <span className="text-base">{config.emoji}</span>
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ReportIncidentModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        userLocation={userGpsActive ? location : null}
      />
    </div>
  );
}
