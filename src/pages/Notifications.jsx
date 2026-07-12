import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { calcDistance, TYPE_CONFIG, SEVERITY_CONFIG } from '@/components/data/mockData';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Bell, BellOff, Trash2, MapPin, ChevronRight, Settings, CheckSquare, Square } from 'lucide-react';

const DEFAULT_LOC = { lat: 41.9028, lng: 12.4964 };

export default function Notifications() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [useRadius, setUseRadius] = useState(() => localStorage.getItem('sentinelUseRadius') === 'true');
  const [radius, setRadius] = useState(() => Number(localStorage.getItem('sentinelRadiusKm') || 200));
  const [readIds, setReadIdsState] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_read_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    localStorage.setItem('sentinelUseRadius', String(useRadius));
  }, [useRadius]);

  useEffect(() => {
    localStorage.setItem('sentinelRadiusKm', String(radius));
  }, [radius]);
  
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

  const { data: fetchedAlerts = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/incidents');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    refetchInterval: 10000,
  });

  const alerts = useMemo(() =>
    fetchedAlerts
      .filter(i => !dismissed.has(i.id))
      .map(i => ({
        ...i,
        distance: calcDistance(location.lat, location.lng, i.latitude, i.longitude),
      }))
      .filter(i => !useRadius || i.distance <= radius)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    [fetchedAlerts, dismissed, location, useRadius, radius]
  );

  const unreadCount = alerts.filter(i => !readIds.has(i.id)).length;

  const markRead = (id) => setReadIds(prev => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(alerts.map(i => i.id)));
  const clearAll = () => {
    setDismissed(new Set(fetchedAlerts.map(i => i.id)));
    setReadIds(new Set());
  };

  // Group by date
  const groups = useMemo(() => {
    return alerts.reduce((acc, inc) => {
      const d = new Date(inc.created_date);
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
    <div className="min-h-screen bg-transparent pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-white/6">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Sentinel Logo" className="w-9 h-9 rounded-xl object-cover" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Alerts</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{unreadCount > 0 ? `${unreadCount} non letti` : 'Tutto letto'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 text-xs" onClick={markAllRead}>
                Leggi tutti
              </Button>
            )}
            {alerts.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400 w-9 h-9">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-white">Cancella tutti gli alert?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                      Questa azione rimuoverà tutti gli alert dalla lista. Non potrai annullarla.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Annulla</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={clearAll}>
                      Cancella tutti
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Link to={createPageUrl('Profile')}>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 dark:hover:text-white w-9 h-9">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-gray-900">
          <button
            onClick={() => setUseRadius(!useRadius)}
            className="flex w-full items-center justify-between gap-3"
            aria-pressed={useRadius}
            aria-label={useRadius ? 'Disattiva filtro raggio alert' : 'Attiva filtro raggio alert'}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <MapPin className="h-4 w-4 text-orange-500" />
              Filtra alert per raggio
            </span>
            {useRadius
              ? <CheckSquare className="h-5 w-5 text-orange-500" aria-hidden="true" />
              : <Square className="h-5 w-5 text-gray-500" aria-hidden="true" />
            }
          </button>
          {useRadius && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Distanza massima</span>
                <Badge variant="outline" className="border-orange-500 text-orange-500">{radius} km</Badge>
              </div>
              <Slider value={[radius]} onValueChange={([v]) => setRadius(v)} min={5} max={500} step={5} />
            </div>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <BellOff className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nessun alert</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Quando ci saranno incidenti nella tua area, appariranno qui.
            </p>
          </div>
        ) : (
          Object.entries(groups).map(([date, items]) => (
            <div key={date} className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">{date}</p>
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((inc) => {
                    const type = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
                    const sev = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.medium;
                    const isRead = readIds.has(inc.id);

                    return (
                      <motion.div
                        key={inc.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16, height: 0 }}
                        layout
                      >
                        <Link
                          to={createPageUrl('IncidentDetail') + `?id=${inc.id}`}
                          onClick={() => markRead(inc.id)}
                        >
                          <div className={`relative flex gap-3 p-3.5 rounded-xl border border-l-4 ${sev.border}
                            ${isRead ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-white/6' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10'}
                            hover:bg-gray-100 dark:hover:bg-gray-800/80 shadow-sm dark:shadow-none transition-colors`}>

                            {/* Unread dot */}
                            {!isRead && (
                              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500" />
                            )}

                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center text-xl`}>
                              {type.emoji}
                            </div>

                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-semibold ${type.text}`}>{type.label}</span>
                                {inc.severity === 'critical' && (
                                  <Badge className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0">CRITICO</Badge>
                                )}
                              </div>
                              <p className={`text-sm leading-snug line-clamp-2 ${isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                                {inc.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{inc.address || inc.city}</span>
                                </span>
                                <span>
                                  {formatDistanceToNow(new Date(inc.created_date), { addSuffix: false, locale: it })} fa
                                </span>
                              </div>
                            </div>

                            <ChevronRight className="flex-shrink-0 self-center w-4 h-4 text-gray-600" />
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
