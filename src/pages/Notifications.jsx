import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { calcDistance, TYPE_CONFIG } from '@/components/data/mockData';
import { getPersistentIncidents, syncSentinelFeedsPermanently } from '@/lib/liveSyncEngine';
import { loadAreaFilter, saveAreaFilter } from '@/lib/areaFilter';
import { hasPreciseIncidentLocation } from '@/lib/incidentLocation';
import { useQuery } from '@tanstack/react-query';
import {
  Trash2, MapPin, Settings, ShieldCheck, SlidersHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';
import NotificationCard from '@/components/notifications/NotificationCard';

const DEFAULT_LOC = { lat: 44.1391, lng: 12.2432 }; // Cesena pilot area default

export default function Notifications() {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [useRadius, setUseRadius] = useState(() => loadAreaFilter().enabled);
  const [radius, setRadius] = useState(() => loadAreaFilter().radius);
  const [isGeofenceExpanded, setIsGeofenceExpanded] = useState(false);

  const [readIds, setReadIdsState] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_read_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [dismissed, setDismissedState] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_dismissed_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setHasUserLocation(true);
      },
      () => {},
      { timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    saveAreaFilter(useRadius, radius);
  }, [useRadius, radius]);

  const setReadIds = (newSet) => {
    const updatedSet = typeof newSet === 'function' ? newSet(readIds) : newSet;
    setReadIdsState(updatedSet);
    localStorage.setItem('sentinel_read_ids', JSON.stringify([...updatedSet]));
  };

  const setDismissed = (newSet) => {
    const updatedSet = typeof newSet === 'function' ? newSet(dismissed) : newSet;
    setDismissedState(updatedSet);
    localStorage.setItem('sentinel_dismissed_ids', JSON.stringify([...updatedSet]));
  };

  // Query for incidents with persistent storage fallback
  const { data: fetchedAlerts = getPersistentIncidents() } = useQuery({
    queryKey: ['incidents-live'],
    queryFn: async () => {
      return syncSentinelFeedsPermanently();
    },
    initialData: () => getPersistentIncidents(),
  });

  // Calculate distance & filter valid alerts
  const processedAlerts = useMemo(() => {
    if (!Array.isArray(fetchedAlerts)) return [];

    const titleMap = new Map();
    const result = [];

    const enriched = fetchedAlerts
      .filter(i => i && i.id && !dismissed.has(i.id))
      .filter(hasPreciseIncidentLocation)
      .map(i => ({
        ...i,
        distance: calcDistance(location.lat, location.lng, i.latitude, i.longitude),
      }))
      .filter(i => !useRadius || !hasUserLocation || i.distance <= radius)
      .sort((a, b) => new Date(b.created_date || Date.now()) - new Date(a.created_date || Date.now()));

    // Prudential deduplication by normalized title to prevent identical duplicate alerts
    for (const item of enriched) {
      const normTitle = (item.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (normTitle && !titleMap.has(normTitle)) {
        titleMap.set(normTitle, true);
        result.push(item);
      }
    }

    return result;
  }, [fetchedAlerts, dismissed, location, useRadius, hasUserLocation, radius]);

  const unreadCount = useMemo(() =>
    processedAlerts.filter(i => !readIds.has(i.id)).length,
    [processedAlerts, readIds]
  );

  const markRead = (id) => setReadIds(prev => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(processedAlerts.map(i => i.id)));
  const clearAll = () => {
    setDismissed(new Set(fetchedAlerts.map(i => i.id)));
    setReadIds(new Set());
  };

  // Group alerts into Vicino a Te vs Altri Aggiornamenti (or Date groups)
  const { nearAlerts, dateGroups } = useMemo(() => {
    const near = [];
    const other = [];

    processedAlerts.forEach(inc => {
      const isNear = hasUserLocation && Number.isFinite(inc.distance) && inc.distance <= radius;
      if (isNear) {
        near.push(inc);
      } else {
        other.push(inc);
      }
    });

    // Group general alerts by date
    const dGroups = (useRadius && hasUserLocation ? other : processedAlerts).reduce((acc, inc) => {
      const d = inc.created_date ? new Date(inc.created_date) : new Date();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      let key = d.toDateString() === today.toDateString() ? 'Oggi'
              : d.toDateString() === yesterday.toDateString() ? 'Ieri'
              : d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(inc);
      return acc;
    }, {});

    return { nearAlerts: near, dateGroups: dGroups };
  }, [processedAlerts, hasUserLocation, radius, useRadius]);

  const nearCount = nearAlerts.length;
  const feedCount = processedAlerts.length;

  const headerSubtitleText = hasUserLocation && nearCount > 0
    ? `${nearCount} vicino a te · ${feedCount} nel feed`
    : `${feedCount} aggiornamenti nel feed`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white pb-28 font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Header compatto */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/LandingPage" className="hover:opacity-80 transition-opacity shrink-0">
              <img src="/logo.svg" alt="Sentinel Logo" className="w-8 h-8 rounded-xl object-cover" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Allerte
              </h1>
              <p className="text-xs text-slate-500 dark:text-white/50 font-medium">
                {headerSubtitleText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#10b981] hover:bg-[#10b981]/10 text-xs font-semibold h-8 px-2.5 rounded-lg"
                onClick={markAllRead}
              >
                Segna come lette
              </Button>
            )}
            {processedAlerts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 w-8 h-8 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-white font-bold">Cancella tutte le allerte?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600 dark:text-white/60 text-xs">
                      Questa azione rimuoverà temporaneamente le notifiche visualizzate. Potrai ripristinarle ricaricando l'app.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-white">Annulla</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={clearAll}>
                      Cancella tutte
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Link to="/Profile">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 dark:hover:text-white w-8 h-8 rounded-lg">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">
        
        {/* Controllo geofencing compatto */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0c0c] p-3 sm:p-3.5 shadow-xs transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${useRadius ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Vicino a te
                  <span className="text-xs font-semibold text-slate-500 dark:text-white/50">
                    • {useRadius ? `${radius} km` : 'Disattivo'}
                  </span>
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsGeofenceExpanded(prev => !prev)}
              className="text-xs font-semibold text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 h-8 px-2.5 rounded-lg flex items-center gap-1 shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Modifica
              {isGeofenceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {isGeofenceExpanded && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/10 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-white/80">Filtra per raggio geografico</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={useRadius}
                  onClick={() => setUseRadius(prev => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] ${useRadius ? 'bg-[#10b981]' : 'bg-slate-300 dark:bg-white/20'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${useRadius ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {useRadius && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 dark:text-white/60 font-medium">Raggio di notifica</span>
                    <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/15 px-2.5 py-0.5 rounded-full border border-[#10b981]/30">
                      {radius} km da te
                    </span>
                  </div>
                  <Slider value={[radius]} onValueChange={([v]) => setRadius(v)} min={1} max={100} step={1} className="my-2" />
                </div>
              )}

              {!hasUserLocation && useRadius && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  Posizione GPS non rilevata. Verranno mostrati gli aggiornamenti generali.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Feed Contenuti */}
        {processedAlerts.length === 0 ? (
          /* Empty state neutrale */
          <div className="text-center py-16 px-4 bg-white dark:bg-[#0c0c0c] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Nessun aggiornamento rilevante nel filtro attuale
            </h3>
            <p className="text-xs text-slate-500 dark:text-white/50 max-w-sm mx-auto mb-4">
              {useRadius
                ? `Nessuna segnalazione attiva nel raggio di ${radius} km. Prova ad ampliare il raggio di notifica o disattivare il filtro locale.`
                : 'Nessuna allerta disponibile al momento nel feed.'}
            </p>
            {useRadius && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseRadius(false)}
                className="text-xs font-semibold border-slate-200 dark:border-white/10 text-slate-700 dark:text-white"
              >
                Mostra tutto il feed
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sezione Prioritaria Locale: VICINO A TE */}
            {hasUserLocation && useRadius && nearAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <h2 className="text-xs font-extrabold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                    Vicino a te ({nearAlerts.length})
                  </h2>
                </div>

                <div className="space-y-2.5">
                  <AnimatePresence>
                    {nearAlerts.map(inc => (
                      <motion.div
                        key={inc.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <NotificationCard
                          incident={inc}
                          isRead={readIds.has(inc.id)}
                          onMarkRead={markRead}
                          typeConfig={TYPE_CONFIG[inc.type]}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Feed Generale o Altri Aggiornamenti */}
            {Object.entries(dateGroups).map(([dateLabel, items]) => {
              // Avoid duplicate rendering if items were already shown in "Vicino a te"
              const displayItems = (hasUserLocation && useRadius && nearAlerts.length > 0)
                ? items.filter(inc => !nearAlerts.some(n => n.id === inc.id))
                : items;

              if (displayItems.length === 0) return null;

              return (
                <div key={dateLabel}>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-white/40" />
                    <h2 className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                      {hasUserLocation && useRadius && nearAlerts.length > 0 ? `ALTRI AGGIORNAMENTI • ${dateLabel}` : dateLabel}
                    </h2>
                  </div>

                  <div className="space-y-2.5">
                    <AnimatePresence>
                      {displayItems.map(inc => (
                        <motion.div
                          key={inc.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <NotificationCard
                            incident={inc}
                            isRead={readIds.has(inc.id)}
                            onMarkRead={markRead}
                            typeConfig={TYPE_CONFIG[inc.type]}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
