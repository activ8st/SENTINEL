import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IncidentCard from '@/components/incidents/IncidentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useQuery } from '@tanstack/react-query';
import { calcDistance, TYPE_CONFIG } from '@/components/data/mockData';
import { syncSentinelFeedsPermanently, getPersistentIncidents, startPermanentBackgroundSync } from '@/lib/liveSyncEngine';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  Globe, Navigation, RefreshCw, SlidersHorizontal, ChevronDown,
  AlertTriangle, Flame, Car, Heart, Eye, Radio, CloudLightning, HelpCircle,
  CheckSquare, Square, Shield
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Distanza' },
  { value: 'time', label: 'Più recenti' },
  { value: 'severity', label: 'Gravità' },
];

const TIME_WINDOWS = [
  { hours: 6, label: 'Ultime 6h' },
  { hours: 12, label: 'Ultime 12h' },
  { hours: 24, label: 'Ultime 24h' },
  { hours: 48, label: 'Ultime 48h' },
  { hours: 72, label: 'Ultime 72h' },
];

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const TYPE_ICONS = {
  crime: AlertTriangle, fire: Flame, accident: Car, medical: Heart,
  suspicious: Eye, traffic: Radio, weather: CloudLightning, other: HelpCircle,
};

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };

export default function Home() {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [locLabel, setLocLabel] = useState('Tutta Italia');
  const [selectedHours, setSelectedHours] = useState(24);

  // Start background sync loop on boot
  useEffect(() => {
    startPermanentBackgroundSync();
  }, []);

  // High-accuracy real-time GPS triangulation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocLabel('Tutta Italia');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(userLoc);
        setLocLabel(`GPS Attivo (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
      },
      (err) => {
        console.warn("GPS High Accuracy Error fallback:", err);
        setLocLabel('Tutta Italia');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Live Query from TanStack Query + Dexie
  const { data: rawLiveIncidents = [], refetch, isFetching } = useQuery({
    queryKey: ['incidents-production-v10'],
    queryFn: async () => {
      return await syncSentinelFeedsPermanently();
    },
    refetchInterval: 15000,
  });

  const readStatuses = useLiveQuery(() => db.readStatus.toArray(), []) || [];
  const readIncidentIds = new Set(readStatuses.map(rs => rs.incidentId));

  const [sortBy, setSortBy] = useState('time');
  const [activeTypes, setActiveTypes] = useState(Object.keys(TYPE_CONFIG));
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [useRadius, setUseRadius] = useState(() => localStorage.getItem('sentinelUseRadius') === 'true');
  const [radius, setRadius] = useState(() => Number(localStorage.getItem('sentinelRadiusKm') || 200));

  useEffect(() => {
    localStorage.setItem('sentinelUseRadius', String(useRadius));
  }, [useRadius]);

  useEffect(() => {
    localStorage.setItem('sentinelRadiusKm', String(radius));
  }, [radius]);

  // Combine live query data with persistent storage fallback
  const baseIncidents = useMemo(() => {
    if (Array.isArray(rawLiveIncidents) && rawLiveIncidents.length > 0) {
      return rawLiveIncidents;
    }
    return getPersistentIncidents();
  }, [rawLiveIncidents]);

  // Calculate dynamic distance to exact user GPS coordinates
  const incidentsWithDistance = useMemo(() => {
    return baseIncidents.map(inc => ({
      ...inc,
      distance: calcDistance(location.lat, location.lng, inc.latitude, inc.longitude)
    }));
  }, [baseIncidents, location]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleType = (type) => {
    setActiveTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filtered = useMemo(() => {
    const cutoffTime = Date.now() - selectedHours * 3600 * 1000;

    return incidentsWithDistance
      .filter(i => activeTypes.includes(i.type))
      .filter(i => !showOnlyActive || i.status === 'active')
      .filter(i => !useRadius || (i.distance ?? 999999) <= radius)
      .filter(i => {
        if (!i.created_date) return true;
        return new Date(i.created_date).getTime() >= cutoffTime;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return (a.distance ?? 99999) - (b.distance ?? 99999);
        if (sortBy === 'time') return new Date(b.created_date || 0) - new Date(a.created_date || 0);
        if (sortBy === 'severity') return (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
        return 0;
      });
  }, [incidentsWithDistance, activeTypes, showOnlyActive, useRadius, radius, sortBy, selectedHours]);

  const criticalCount = incidentsWithDistance.filter(i => i.severity === 'critical' && i.status === 'active').length;
  const activeCount = incidentsWithDistance.filter(i => i.status === 'active').length;
  const activeFiltersCount = Object.keys(TYPE_CONFIG).length - activeTypes.length + (showOnlyActive ? 1 : 0) + (useRadius ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#000000] text-white pb-24" role="main">
      
      {/* 1. Citizen Header Row: Globe / Area Selector Left + Time Filter Right */}
      <div className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          
          {/* Left: Globe Nationwide Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-white/90" />
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-1.5 text-base font-extrabold text-white hover:text-[#10b981] transition-colors"
            >
              <span>{locLabel}</span>
              <ChevronDown className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Right: Time Window Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/15 text-xs font-bold text-white/90">
              <span className="text-white/60">Ultime</span>
              <select
                value={selectedHours}
                onChange={(e) => setSelectedHours(Number(e.target.value))}
                className="bg-transparent text-white font-black cursor-pointer outline-none"
              >
                {TIME_WINDOWS.map(tw => (
                  <option key={tw.hours} value={tw.hours} className="bg-black text-white">
                    {tw.hours}h
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full"
              onClick={handleRefresh}
              disabled={refreshing || isFetching}
              aria-label="Aggiorna feed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing || isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>

        </div>
      </div>

      {/* 2. Single-Column Citizen Social Feed Container */}
      <div className="px-3 pt-4 max-w-xl mx-auto space-y-5">
        
        {/* Active Stats Header */}
        <div className="flex items-center justify-between px-1 text-xs text-white/50 font-semibold">
          <span>
            <strong className="text-white font-bold">{activeCount}</strong> eventi attivi nel radar
          </span>
          <span className="text-[#10b981] font-bold">
            {filtered.length} in evidenza
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#0d1017] rounded-3xl border border-white/10 p-6">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-white/40">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1">Nessun evento nelle ultime {selectedHours}h</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto mb-5">
              Il radar Sentinel monitora le fonti ufficali in tempo reale. Espandi la finestra temporale a 72h.
            </p>
            <Button
              size="sm"
              onClick={() => setSelectedHours(72)}
              className="bg-[#10b981] text-black font-extrabold text-xs rounded-xl px-5 py-2 hover:bg-[#10b981]/90"
            >
              Mostra Allerte a 72h
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filtered.map(inc => (
                <motion.div
                  key={inc.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <IncidentCard
                    incident={inc}
                    distance={inc.distance}
                    unread={!readIncidentIds.has(inc.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="rounded-t-3xl bg-[#0b0e14] border-white/10 text-white max-h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-white/10">
            <SheetTitle className="text-white text-base font-bold flex items-center justify-between">
              <span>Filtra Segnalazioni Live</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setActiveTypes(Object.keys(TYPE_CONFIG));
                    setShowOnlyActive(false);
                    setUseRadius(false);
                  }}
                  className="text-xs text-[#10b981] font-normal hover:underline"
                >
                  Resetta filtri
                </button>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-6">
            {/* Filter by Status */}
            <div>
              <label className="text-xs font-semibold text-white/50 block mb-2">Stato Evento</label>
              <button
                onClick={() => setShowOnlyActive(prev => !prev)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all
                  ${showOnlyActive
                    ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                    : 'bg-white/5 border-white/10 text-white/70'}`}
              >
                <span>Solo Eventi Attivi</span>
                {showOnlyActive ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-white/30" />}
              </button>
            </div>

            {/* Filter by Radius */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-white/50">Raggio di azione GPS</label>
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

            {/* Filter by Categories */}
            <div>
              <label className="text-xs font-semibold text-white/50 block mb-2">Tipologie di Evento</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                  const IconComp = TYPE_ICONS[key] || TYPE_ICONS.other;
                  const isActive = activeTypes.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleType(key)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left
                        ${isActive
                          ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                          : 'bg-white/5 border-white/10 text-white/40 opacity-60'}`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
