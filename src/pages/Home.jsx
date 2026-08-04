import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IncidentCard from '@/components/incidents/IncidentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useQuery } from '@tanstack/react-query';
import { calcDistance, TYPE_CONFIG } from '@/components/data/mockData';
import { syncSentinelFeedsPermanently, getPersistentIncidents, startPermanentBackgroundSync } from '@/lib/liveSyncEngine';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  Navigation, RefreshCw, Filter, SlidersHorizontal,
  AlertTriangle, Flame, Car, Heart, Eye, Radio, CloudLightning, HelpCircle,
  CheckSquare, Square, Shield
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Distanza' },
  { value: 'time', label: 'Più recenti' },
  { value: 'severity', label: 'Gravità' },
];

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const TYPE_ICONS = {
  crime: AlertTriangle, fire: Flame, accident: Car, medical: Heart,
  suspicious: Eye, traffic: Radio, weather: CloudLightning, other: HelpCircle,
};

// Default location center fallback
const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };

export default function Home() {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [locLabel, setLocLabel] = useState('Inizializzazione GPS...');

  // Start background sync loop on boot
  useEffect(() => {
    startPermanentBackgroundSync();
  }, []);

  // High-accuracy real-time GPS triangulation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocLabel('Milano, Italia (Default)');
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
        setLocLabel('La tua Posizione (GPS)');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Live Query from TanStack Query + Dexie
  const { data: rawLiveIncidents = [], refetch, isFetching } = useQuery({
    queryKey: ['incidents-production-v4'],
    queryFn: async () => {
      return await syncSentinelFeedsPermanently();
    },
    refetchInterval: 15000,
  });

  const readStatuses = useLiveQuery(() => db.readStatus.toArray(), []) || [];
  const readIncidentIds = new Set(readStatuses.map(rs => rs.incidentId));

  const [sortBy, setSortBy] = useState('distance');
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

  // Calculate dynamic distance to exact user GPS coordinates (Instant 0ms render)
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
    return incidentsWithDistance
      .filter(i => activeTypes.includes(i.type))
      .filter(i => !showOnlyActive || i.status === 'active')
      .filter(i => !useRadius || (i.distance ?? 999999) <= radius)
      .sort((a, b) => {
        if (sortBy === 'distance') return (a.distance ?? 99999) - (b.distance ?? 99999);
        if (sortBy === 'time') return new Date(b.created_date || 0) - new Date(a.created_date || 0);
        if (sortBy === 'severity') return (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
        return 0;
      });
  }, [incidentsWithDistance, activeTypes, showOnlyActive, useRadius, radius, sortBy]);

  const criticalCount = incidentsWithDistance.filter(i => i.severity === 'critical' && i.status === 'active').length;
  const activeCount = incidentsWithDistance.filter(i => i.status === 'active').length;
  const activeFiltersCount = Object.keys(TYPE_CONFIG).length - activeTypes.length + (showOnlyActive ? 1 : 0) + (useRadius ? 1 : 0);

  return (
    <div className="min-h-screen bg-transparent" role="main">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-white/5">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Sentinel Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Sentinel</h1>
                  <span className="text-[10px] font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    LIVE 30s
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Navigation className="w-3 h-3 text-[#10b981]" />
                  <span className="text-xs text-gray-400 font-medium">{locLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs animate-pulse">
                  {criticalCount} critico
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white w-9 h-9"
                onClick={handleRefresh}
                disabled={refreshing || isFetching}
                aria-label={refreshing ? 'Aggiornamento in corso...' : 'Aggiorna feed'}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing || isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sort bar */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              aria-pressed={sortBy === opt.value}
              aria-label={`Ordina per ${opt.label}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${sortBy === opt.value
                  ? 'bg-[#10b981] text-black font-bold'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(true)}
            aria-label={`Apri filtri${activeFiltersCount > 0 ? `, ${activeFiltersCount} attivi` : ''}`}
            aria-expanded={showFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ml-auto
              ${activeFiltersCount > 0
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Filtri</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 font-medium">
            <strong className="text-gray-900 dark:text-white">{activeCount}</strong> attivi ·{' '}
            <strong className="text-gray-900 dark:text-white">{filtered.length}</strong> nel feed
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Shield className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-400 font-bold mb-1">Nessun evento rilevato nelle vicinanze</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              La tua area è attualmente tranquilla. Lo scraper Sentinel monitora le fonti istituzionali 24/7.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setActiveTypes(Object.keys(TYPE_CONFIG));
                setShowOnlyActive(false);
                setUseRadius(false);
              }}
              className="text-xs border-gray-700 text-gray-300"
            >
              Resetta tutti i filtri
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map(inc => (
                <motion.div
                  key={inc.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
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
        <SheetContent side="bottom" className="rounded-t-3xl bg-gray-950 border-gray-800 text-white max-h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-gray-800">
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
              <label className="text-xs font-semibold text-gray-400 block mb-2">Stato Evento</label>
              <button
                onClick={() => setShowOnlyActive(prev => !prev)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all
                  ${showOnlyActive
                    ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                    : 'bg-gray-900 border-gray-800 text-gray-300'}`}
              >
                <span>Solo Eventi Attivi</span>
                {showOnlyActive ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-600" />}
              </button>
            </div>

            {/* Filter by Radius */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-400">Raggio di azione GPS</label>
                <button
                  onClick={() => setUseRadius(prev => !prev)}
                  className={`text-xs font-bold ${useRadius ? 'text-[#10b981]' : 'text-gray-500'}`}
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
                  <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                    <span>5 km</span>
                    <span className="text-[#10b981] font-bold">{radius} km</span>
                    <span>500 km</span>
                  </div>
                </div>
              )}
            </div>

            {/* Filter by Categories */}
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-2">Tipologie di Evento</label>
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
                          : 'bg-gray-900 border-gray-800 text-gray-500 opacity-60'}`}
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
