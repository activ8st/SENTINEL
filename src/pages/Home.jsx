import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IncidentCard from '@/components/incidents/IncidentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { calcDistance, TYPE_CONFIG } from '@/components/data/mockData';
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

// Default center: Rome
const DEFAULT_LOC = { lat: 41.9028, lng: 12.4964 };

export default function Home() {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [locLabel, setLocLabel] = useState('Roma, Italia');
  const { data: liveIncidents = [], refetch, isLoading: isApiLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/incidents');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    refetchInterval: 10000, // auto-refresh every 10s
  });
  const readStatuses = useLiveQuery(() => db.readStatus.toArray(), []) || [];
  const readIncidentIds = new Set(readStatuses.map(rs => rs.incidentId));
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('distance');
  const [activeTypes, setActiveTypes] = useState(Object.keys(TYPE_CONFIG));
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const loadData = useCallback((loc) => {
    const withDistance = liveIncidents.map(inc => ({
      ...inc,
      distance: calcDistance(loc.lat, loc.lng, inc.latitude, inc.longitude),
    }));
    setIncidents(withDistance);
    setLoading(false);
  }, [liveIncidents]);

  useEffect(() => {
    if (isApiLoading) return;
    if (liveIncidents.length === 0) {
      setLoading(false);
      return;
    }
    
    // Mostra subito i dati con la posizione di default
    loadData(location);

    // Poi prova ad aggiornarli con la posizione reale senza bloccare
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
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
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distance ?? 999) - (b.distance ?? 999);
      if (sortBy === 'time') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'severity') return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      return 0;
    });

  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status === 'active').length;
  const activeCount = incidents.filter(i => i.status === 'active').length;
  const activeFiltersCount = Object.keys(TYPE_CONFIG).length - activeTypes.length + (showOnlyActive ? 1 : 0);

  return (
    <div className="min-h-screen bg-transparent" role="main">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-white/5">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Sentinel Logo" className="w-9 h-9 rounded-xl object-cover" />
              <div>
                <h1 className="text-lg font-bold text-white leading-none">Sentinel</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Navigation className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-gray-400">{locLabel}</span>
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
                disabled={refreshing}
                aria-label={refreshing ? 'Aggiornamento in corso...' : 'Aggiorna feed'}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
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
                  ? 'bg-orange-500 text-white'
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
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <SlidersHorizontal className="w-3 h-3" aria-hidden="true" />
            Filtri {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 py-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 text-sm text-gray-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-300">
        <span><span className="font-semibold text-gray-900 dark:text-white">{activeCount}</span> attivi</span>
        <span className="text-gray-400 dark:text-gray-600">·</span>
        <span><span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> nel feed</span>
        {showOnlyActive && (
          <Badge variant="outline" className="ml-auto text-xs border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
            Solo attivi
          </Badge>
        )}
      </div>

      {/* Incidents list */}
      <div className="px-4 py-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 pb-28">
        {(loading || isApiLoading) ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-100 dark:bg-gray-800/60 rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <Filter className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-white font-semibold mb-1">Nessun incidente trovato</h3>
            <p className="text-sm text-gray-500">Prova a cambiare i filtri</p>
            <Button
              variant="outline"
              className="mt-4 border-gray-700 text-gray-300"
              onClick={() => { setActiveTypes(Object.keys(TYPE_CONFIG)); setShowOnlyActive(false); }}
            >
              Rimuovi filtri
            </Button>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((inc, i) => (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i < 6 ? i * 0.04 : 0 }}
              >
                <IncidentCard incident={inc} distance={inc.distance} unread={!readIncidentIds.has(inc.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Filters sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-3xl max-h-[80vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-gray-900 dark:text-white">Filtri</SheetTitle>
          </SheetHeader>

          {/* Active only toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowOnlyActive(!showOnlyActive)}
              aria-pressed={showOnlyActive}
              aria-label={showOnlyActive ? 'Mostra tutti gli incidenti' : 'Mostra solo incidenti attivi'}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              <span className="text-gray-900 dark:text-white font-medium">Solo incidenti attivi</span>
              {showOnlyActive
                ? <CheckSquare className="w-5 h-5 text-orange-500" aria-hidden="true" />
                : <Square className="w-5 h-5 text-gray-500" aria-hidden="true" />
              }
            </button>
          </div>

          {/* Type toggles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo di incidente</span>
              <button
                className="text-xs text-orange-400"
                aria-label={activeTypes.length === Object.keys(TYPE_CONFIG).length ? 'Deseleziona tutti i tipi' : 'Seleziona tutti i tipi'}
                onClick={() => setActiveTypes(
                  activeTypes.length === Object.keys(TYPE_CONFIG).length
                    ? []
                    : Object.keys(TYPE_CONFIG)
                )}
              >
                {activeTypes.length === Object.keys(TYPE_CONFIG).length ? 'Deseleziona tutti' : 'Seleziona tutti'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                const active = activeTypes.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleType(key)}
                    aria-pressed={active}
                    aria-label={`${active ? 'Disattiva' : 'Attiva'} filtro: ${cfg.label}`}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                      active ? `${cfg.bg} border-current/30 ${cfg.text}` : 'bg-gray-800 border-gray-700 text-gray-500'
                    }`}
                  >
                    <span className="text-lg" aria-hidden="true">{cfg.emoji}</span>
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
            Applica filtri
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}