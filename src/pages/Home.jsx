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
import { apiUrl } from '@/lib/api';
import {
  Navigation, RefreshCw, SlidersHorizontal,
  AlertTriangle, Flame, Car, Heart, Eye, Radio, CloudLightning, HelpCircle,
  CheckSquare, Square, Shield, MapPin
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
  { hours: 72, label: 'Ultime 72h (3 Giorni)' },
];

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const AREA_PRESETS = [3, 5, 10, 25, 50];

const loadSharedRadius = () => {
  const saved = Number(localStorage.getItem('sentinelRadiusKm'));
  return Number.isFinite(saved) && saved >= 3 ? Math.min(saved, 100) : 3;
};

const TYPE_ICONS = {
  crime: AlertTriangle, fire: Flame, accident: Car, medical: Heart,
  suspicious: Eye, traffic: Radio, weather: CloudLightning, other: HelpCircle,
};

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };

export default function Home() {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [locLabel, setLocLabel] = useState('Roma, Italia');
  const { data: liveIncidents = [], refetch, isLoading: isApiLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/incidents?limit=2000'));
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
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
  const [radius, setRadius] = useState(loadSharedRadius);

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

    // Poi prova ad aggiornarli con la posizione reale senza bloccare
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setHasUserLocation(true);
        setLocLabel('La tua posizione');
        loadData(loc);
      },
      () => console.warn("Geolocalizzazione fallita o negata"),
      { timeout: 5000, maximumAge: 60000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveIncidents, isApiLoading]);

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

  const filtered = incidents
    .filter(i => activeTypes.includes(i.type))
    .filter(i => !showOnlyActive || i.status === 'active')
    .filter(i => !useRadius || !hasUserLocation || (i.distance ?? 999999) <= radius)
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distance ?? 999) - (b.distance ?? 999);
      if (sortBy === 'time') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'severity') return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      return 0;
    });

  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status === 'active').length;
  const activeCount = incidents.filter(i => i.status === 'active').length;
  const categoryFiltersCount = Object.keys(TYPE_CONFIG).length - activeTypes.length;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white" role="main">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0b0e14]/95 backdrop-blur border-b border-white/10">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Sentinel Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white leading-none">Sentinel</h1>
                  <span className="text-[10px] font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    LIVE BROADCAST
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Navigation className="w-3 h-3 text-[#10b981]" />
                  <span className="text-xs text-white/60 font-medium">{locLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge className="bg-red-600 text-white text-xs animate-pulse font-bold px-2.5 py-1">
                  {criticalCount} critico
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white hover:bg-white/10 w-9 h-9"
                onClick={handleRefresh}
                disabled={refreshing || isFetching}
                aria-label={refreshing ? 'Aggiornamento in corso...' : 'Aggiorna feed'}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing || isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Time Window & Sort Bar */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Hours Filter Pills */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 shrink-0">
            {TIME_WINDOWS.map(tw => (
              <button
                key={tw.hours}
                onClick={() => setSelectedHours(tw.hours)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  selectedHours === tw.hours
                    ? 'bg-[#10b981] text-black shadow'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tw.label}
              </button>
            ))}
          </div>

          {/* Sort bar */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                aria-pressed={sortBy === opt.value}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors
                  ${sortBy === opt.value
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => setShowFilters(true)}
              aria-label={`Apri filtri${activeFiltersCount > 0 ? `, ${activeFiltersCount} attivi` : ''}`}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors
                ${activeFiltersCount > 0
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Filtri</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            aria-label={useRadius ? `Modifica filtro area, ${radius} chilometri` : 'Attiva filtro area'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              useRadius
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {useRadius ? `Area ${radius} km` : 'Area'}
          </button>
          <button
            onClick={() => setShowFilters(true)}
            aria-label={`Apri filtri${categoryFiltersCount > 0 ? `, ${categoryFiltersCount} attivi` : ''}`}
            aria-expanded={showFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ml-auto
              ${categoryFiltersCount > 0
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <SlidersHorizontal className="w-3 h-3" aria-hidden="true" />
            Filtri {categoryFiltersCount > 0 ? `(${categoryFiltersCount})` : ''}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-white/60 font-medium">
            <strong className="text-white font-bold">{activeCount}</strong> attivi ·{' '}
            <strong className="text-[#10b981] font-bold">{filtered.length}</strong> eventi live nelle {selectedHours}h
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 text-white/40">
              <Shield className="w-6 h-6" />
            </div>
            <p className="text-sm text-white/80 font-bold mb-1">Nessun evento rilevato nelle ultime {selectedHours} ore</p>
            <p className="text-xs text-white/50 max-w-sm mx-auto mb-4">
              La tua area è tranquilla. Aumenta la finestra temporale fino a 72h o resetta i filtri.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedHours(72);
                setActiveTypes(Object.keys(TYPE_CONFIG));
                setShowOnlyActive(false);
                setUseRadius(false);
              }}
              className="text-xs border-white/20 text-white hover:bg-white/10"
            >
              Mostra eventi fino a 72h
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

          {/* Active only toggle */}
          <div className="mb-6">
            <label className="relative flex min-h-14 w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={(event) => setShowOnlyActive(event.target.checked)}
                aria-label="Mostra solo incidenti attivi"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <span className="text-gray-900 dark:text-white font-medium">Solo incidenti attivi</span>
              <span className="pointer-events-none flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden="true">
                {showOnlyActive
                  ? <CheckSquare className="h-5 w-5 text-orange-500" />
                  : <Square className="h-5 w-5 text-gray-500" />
                }
              </span>
            </label>
          </div>

          <div className="mb-6">
            <label className="relative mb-3 flex min-h-14 w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
              <input
                type="checkbox"
                checked={useRadius}
                onChange={(event) => setUseRadius(event.target.checked)}
                aria-label="Filtra gli incidenti per raggio"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <span className="text-gray-900 dark:text-white font-medium">Filtra per raggio</span>
              <span className="pointer-events-none flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden="true">
                {useRadius
                  ? <CheckSquare className="h-5 w-5 text-orange-500" />
                  : <Square className="h-5 w-5 text-gray-500" />
                }
              </span>
            </label>
            {useRadius && (
              <>
                {!hasUserLocation && (
                  <p className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-300">
                    Il raggio si applica appena il browser rileva la tua posizione.
                  </p>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Distanza massima</span>
                  <Badge variant="outline" className="text-orange-500 border-orange-500">{radius} km</Badge>
                </div>
                <div className="mb-3 grid grid-cols-5 gap-2">
                  {AREA_PRESETS.map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setRadius(km)}
                      className={`min-h-9 rounded-lg border px-1 text-xs font-semibold transition-colors ${
                        radius === km
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
                <Slider value={[radius]} onValueChange={([v]) => setRadius(v)} min={3} max={100} step={1} />
              </>
            )}
          </div>

          {/* Type toggles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo di incidente</span>
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
