import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
import { useQuery } from '@tanstack/react-query';
import { Trash2, MapPin, ChevronRight, Settings, Check, ShieldCheck } from 'lucide-react';

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 }; // Milan center default

export default function Notifications() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [useRadius, setUseRadius] = useState(() => loadAreaFilter().enabled);
  const [radius, setRadius] = useState(() => loadAreaFilter().radius);
  const [readIds, setReadIdsState] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_read_ids');
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
  
  const [dismissed, setDismissedState] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_dismissed_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

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

  // Safe Query for incidents with persistent storage fallback
  const { data: fetchedAlerts = getPersistentIncidents() } = useQuery({
    queryKey: ['incidents-live'],
    queryFn: async () => {
      return syncSentinelFeedsPermanently();
    },
    initialData: () => getPersistentIncidents(),
  });

  const alerts = useMemo(() =>
    fetchedAlerts
      .filter(i => !dismissed.has(i.id))
      .map(i => ({
        ...i,
        distance: calcDistance(location.lat, location.lng, i.latitude, i.longitude),
      }))
      .filter(i => !useRadius || !hasUserLocation || i.distance <= radius)
      .sort((a, b) => new Date(b.created_date || Date.now()) - new Date(a.created_date || Date.now())),
    [fetchedAlerts, dismissed, location, useRadius, hasUserLocation, radius]
  );

  const unreadCount = alerts.filter(i => !readIds.has(i.id)).length;

  const markRead = (id) => setReadIds(prev => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(alerts.map(i => i.id)));
  const clearAll = () => {
    setDismissed(new Set(fetchedAlerts.map(i => i.id)));
    setReadIds(new Set());
  };

  const groups = useMemo(() => {
    return alerts.reduce((acc, inc) => {
      const d = inc.created_date ? new Date(inc.created_date) : new Date();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      let key = d.toDateString() === today.toDateString() ? 'Oggi'
              : d.toDateString() === yesterday.toDateString() ? 'Ieri'
              : d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!acc[key]) acc[key] = [];
      acc[key].push(inc);
      return acc;
    }, {});
  }, [alerts]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white pb-28 font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/LandingPage" className="hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Sentinel Logo" className="w-8 h-8 rounded-xl object-cover" />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Allerte Live
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-white/50">{unreadCount > 0 ? `${unreadCount} nuove segnalazioni` : 'Tutto aggiornato'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-[#10b981] hover:bg-[#10b981]/10 text-xs font-bold" onClick={markAllRead}>
                Segna come letti
              </Button>
            )}
            {alerts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 w-9 h-9">
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
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 dark:hover:text-white w-9 h-9">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Geofence Filter Control Box */}
        <div className="mb-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0c0c] p-4 shadow-lg transition-colors">
          <button
            type="button"
            onClick={() => setUseRadius(prev => !prev)}
            role="switch"
            aria-checked={useRadius}
            className={`relative z-10 flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 text-left transition-colors ${useRadius ? 'border-[#10b981]/40 bg-[#10b981]/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'}`}
          >
            <span className="flex items-center gap-2.5 text-sm font-bold text-slate-900 dark:text-white">
              <MapPin className="h-4.5 w-4.5 text-[#10b981]" />
              Filtro Geofencing Intelligente
            </span>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${useRadius ? 'border-[#10b981] bg-[#10b981] text-black' : 'border-slate-400 bg-white text-transparent dark:border-white/35 dark:bg-black/20'}`}>
              <Check className="h-5 w-5" />
            </span>
          </button>

          {useRadius && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-white/60 font-medium">Raggio di notifica personale</span>
                <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/15 px-3 py-1 rounded-full border border-[#10b981]/30">
                  {radius} km da te
                </span>
              </div>
              {!hasUserLocation && (
                <p className="mb-3 text-xs text-amber-600 dark:text-amber-300">Il filtro si applica appena il browser rileva la tua posizione.</p>
              )}
              <Slider value={[radius]} onValueChange={([v]) => setRadius(v)} min={1} max={100} step={1} className="my-2" />
            </div>
          )}
        </div>

        {/* Alerts List Grouped by Date */}
        {alerts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0c0c0c] rounded-3xl border border-slate-200 dark:border-white/10 p-8 shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Nessuna allerta attiva</h3>
            <p className="text-xs text-slate-500 dark:text-white/50 max-w-xs mx-auto">
              La tua area nel raggio di {radius} km è al sicuro. Le prossime segnalazioni verificate compariranno qui.
            </p>
          </div>
        ) : (
          Object.entries(groups).map(([date, items]) => (
            <div key={date} className="mb-8">
              <div className="flex items-center gap-2 mb-4 px-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <p className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">{date}</p>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((inc) => {
                    const typeConf = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
                    const isRead = readIds.has(inc.id);

                    return (
                      <motion.div
                        key={inc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        layout
                      >
                        <Link
                          to={`/IncidentDetail?id=${inc.id}`}
                          onClick={() => markRead(inc.id)}
                          className="block"
                        >
                          <div className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-md ${
                            isRead 
                              ? 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-white/70' 
                              : 'bg-white dark:bg-[#0c0c0c] border-[#10b981]/40 text-slate-900 dark:text-white shadow-emerald-950/10'
                          } hover:border-[#10b981] hover:scale-[1.01]`}>

                            {/* Unread indicator */}
                            {!isRead && (
                              <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
                            )}

                            {/* Type Icon Badge */}
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-2xl shrink-0">
                              {typeConf.icon || '⚠️'}
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0 pr-6">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider">
                                  {typeConf.label || inc.type}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-white/40">
                                  ● {inc.distance ? `${inc.distance.toFixed(1)} km da te` : 'Milano'}
                                </span>
                              </div>

                              <h4 className={`text-sm sm:text-base font-bold leading-snug truncate ${isRead ? 'text-slate-600 dark:text-white/70 font-normal' : 'text-slate-900 dark:text-white font-extrabold'}`}>
                                {inc.title}
                              </h4>

                              <p className="text-xs text-slate-500 dark:text-white/50 line-clamp-1 mt-0.5">
                                {inc.description || inc.address || 'Segnalazione verificata dalla community'}
                              </p>
                            </div>

                            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-white/40 shrink-0" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
