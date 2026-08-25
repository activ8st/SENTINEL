import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import IncidentCard from '@/components/incidents/IncidentCard';
import { calcDistance, TYPE_CONFIG } from '@/components/data/mockData';
import { useQuery } from '@tanstack/react-query';
import { Locate, SlidersHorizontal, ChevronDown, Globe, Navigation, RefreshCw, X, Shield } from 'lucide-react';
import ReportIncidentModal from '@/components/incidents/ReportIncidentModal';
import IncidentMap from '@/components/incidents/IncidentMap';
import { syncSentinelFeedsPermanently, getPersistentIncidents } from '@/lib/liveSyncEngine';

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };

const TIME_WINDOWS = [
  { hours: 6, label: 'Ultime 6h' },
  { hours: 12, label: 'Ultime 12h' },
  { hours: 24, label: 'Ultime 24h' },
  { hours: 48, label: 'Ultime 48h' },
  { hours: 72, label: 'Ultime 72h' },
];

export default function MapView() {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [userGpsActive, setUserGpsActive] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [activeTypes, setActiveTypes] = useState(Object.keys(TYPE_CONFIG));
  const [selectedHours, setSelectedHours] = useState(72);
  const [radius, setRadius] = useState(() => Number(localStorage.getItem('sentinelRadiusKm') || 200));
  const [useRadius, setUseRadius] = useState(() => localStorage.getItem('sentinelUseRadius') === 'true');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showList, setShowList] = useState(false);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // 1. Instant High-Accuracy GPS Triangulation (Google Maps Style)
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
    queryKey: ['incidents-map-v10'],
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
      .filter(i => activeTypes.includes(i.type))
      .filter(i => !useRadius || (i.distance ?? 999999) <= radius)
      .filter(i => {
        if (!i.created_date) return true;
        return new Date(i.created_date).getTime() >= cutoffTime;
      });
  }, [incidentsWithDistance, activeTypes, useRadius, radius, selectedHours]);

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

  const handleRecenterNation = () => {
    setMapCenter([42.5, 12.5]);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-[#05070a] overflow-hidden">
      
      {/* 1. Top Floating Controls Bar */}
      <div className="absolute top-4 inset-x-4 z-20 max-w-xl mx-auto flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Time Window & GPS Badge */}
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

        {/* Right: Quick Action Floating Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRecenterNation}
            className="bg-[#0d1017]/90 hover:bg-[#141721] text-white border border-white/15 rounded-full text-xs font-bold shadow-2xl h-8 px-3"
          >
            <Globe className="w-3.5 h-3.5 mr-1" />
            Italia
          </Button>

          <Button
            size="icon"
            onClick={() => setShowFilters(true)}
            className="bg-[#0d1017]/90 hover:bg-[#141721] text-white border border-white/15 rounded-full w-8 h-8 shadow-2xl"
          >
            <SlidersHorizontal className="w-4 h-4" />
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
      <div className="w-full h-full">
        <IncidentMap
          incidents={filteredIncidents}
          center={mapCenter}
          userLocation={userGpsActive ? location : null}
          zoom={userGpsActive ? 13.5 : 6}
          onIncidentClick={(inc) => {
            setSelectedIncident(inc);
            setMapCenter([inc.latitude, inc.longitude]);
          }}
        />
      </div>

      {/* 3. Bottom Drawer Card Popup when Pin Selected */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="absolute inset-x-3 bottom-3 z-30 max-w-xl mx-auto"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="absolute -top-3 right-3 w-8 h-8 rounded-full bg-black border border-white/20 text-white flex items-center justify-center shadow-2xl z-40 hover:bg-slate-900"
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
                  setUseRadius(false);
                }}
                className="text-xs text-[#10b981] font-normal hover:underline"
              >
                Resetta
              </button>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-white/50">Raggio GPS dal tuo dispositivo</label>
                <button
                  onClick={() => setUseRadius(prev => !prev)}
                  className={`text-xs font-bold ${useRadius ? 'text-[#10b981]' : 'text-white/40'}`}
                >
                  {useRadius ? `Attivo: entro ${radius} km` : 'Disattivato (Tutta Italia)'}
                </button>
              </div>
              {useRadius && (
                <div className="pt-2 px-1">
                  <Slider
                    value={[radius]}
                    min={5}
                    max={500}
                    step={5}
                    onValueChange={([val]) => setRadius(val)}
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-2">
                    <span>5 km</span>
                    <span className="text-[#10b981] font-bold">{radius} km</span>
                    <span>500 km</span>
                  </div>
                </div>
              )}
            </div>
          </div>
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
