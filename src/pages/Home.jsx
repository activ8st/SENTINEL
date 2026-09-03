import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import IncidentCard from '@/components/incidents/IncidentCard';
import { calcDistance } from '@/components/data/mockData';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ChevronDown, Radio, ShieldCheck, Sparkles, Clock3, MapPin } from 'lucide-react';
import ReportIncidentModal from '@/components/incidents/ReportIncidentModal';
import { syncSentinelFeedsPermanently, getPersistentIncidents } from '@/lib/liveSyncEngine';
import { loadAreaFilter, saveAreaFilter } from '@/lib/areaFilter';

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };

const TIME_WINDOWS = [
  ...Array.from({ length: 8 }, (_, index) => ({ hours: (index + 1) * 3, label: `Ultime ${(index + 1) * 3} ore` })),
  ...Array.from({ length: 29 }, (_, index) => ({ hours: (index + 2) * 24, label: `Ultimi ${index + 2} giorni` })),
];

const incidentTimestamp = (incident) => {
  const rawDate = incident.created_date || incident.published_at || incident.last_seen_at;
  if (!rawDate) return 0;

  const italianDate = String(rawDate).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (italianDate) {
    const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = italianDate;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds)).getTime();
  }

  const parsed = new Date(rawDate).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Home() {
  const [userLocation, setUserLocation] = useState(DEFAULT_LOC);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [selectedHours, setSelectedHours] = useState(720);
  const [sortMode, setSortMode] = useState(() => localStorage.getItem('sentinelFeedSort') === 'distance' ? 'distance' : 'recent');
  const [radius] = useState(() => loadAreaFilter().radius);
  const [useRadius] = useState(() => loadAreaFilter().enabled);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Instagram / X Infinite Scroll Limit State
  const [displayLimit, setDisplayLimit] = useState(15);
  const loaderRef = useRef(null);

  // 1. Instant GPS Position Triangulation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setHasUserLocation(true);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    saveAreaFilter(useRadius, radius);
  }, [useRadius, radius]);

  useEffect(() => {
    localStorage.setItem('sentinelFeedSort', sortMode);
    setDisplayLimit(15);
  }, [sortMode]);

  // 2. Query Live Feeds with TanStack Query (15s auto-refresh)
  const { data: rawLiveIncidents = [], refetch, isFetching } = useQuery({
    queryKey: ['incidents-live'],
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
      distance: calcDistance(userLocation.lat, userLocation.lng, inc.latitude, inc.longitude)
    }));
  }, [baseIncidents, userLocation]);

  const filteredIncidents = useMemo(() => {
    const cutoffTime = Date.now() - selectedHours * 3600 * 1000;
    const filtered = incidentsWithDistance
      .filter(i => !useRadius || !hasUserLocation || (i.distance ?? 999999) <= radius)
      .filter(i => {
        const timestamp = incidentTimestamp(i);
        return timestamp === 0 || timestamp >= cutoffTime;
      });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'distance' && hasUserLocation) {
        return (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY);
      }
      return incidentTimestamp(b) - incidentTimestamp(a);
    });
  }, [incidentsWithDistance, selectedHours, useRadius, hasUserLocation, radius, sortMode]);

  // Visible items limited by displayLimit for infinite scroll
  const visibleIncidents = useMemo(() => {
    return filteredIncidents.slice(0, displayLimit);
  }, [filteredIncidents, displayLimit]);

  const hasMoreItems = displayLimit < filteredIncidents.length;

  // Instagram / X IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreItems) {
          setDisplayLimit(prev => Math.min(prev + 15, filteredIncidents.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMoreItems, filteredIncidents.length]);

  const handleRefresh = async () => {
    setRefreshingNews(true);
    const freshData = await refetch();
    setRefreshingNews(false);
    const count = freshData.data ? freshData.data.length : filteredIncidents.length;
    
    setToastMessage(`Radar Sincronizzato in Tempo Reale! ${count} allarmi attivi.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white pb-24 select-none">
      
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="fixed top-20 inset-x-4 z-50 max-w-md mx-auto bg-[#10b981] text-black font-extrabold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Floating Header Controls */}
      <header className="sticky top-0 z-40 bg-[#05070a]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-full">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              {useRadius && hasUserLocation ? `Entro ${radius} km` : 'Tutta Italia'}
            </span>

            <span className="text-white/20 text-xs">•</span>

            <div className="relative">
              <select
                value={selectedHours}
                onChange={(e) => {
                  setSelectedHours(Number(e.target.value));
                  setDisplayLimit(15);
                }}
                className="bg-[#0d1017] text-white font-bold text-xs px-3 py-1.5 pr-7 rounded-full border border-white/15 outline-none cursor-pointer appearance-none hover:border-[#10b981]"
              >
                {TIME_WINDOWS.map(tw => (
                  <option key={tw.hours} value={tw.hours} className="bg-black text-white">
                    {tw.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              onClick={handleRefresh}
              disabled={refreshingNews || isFetching}
              className="bg-[#0d1017] hover:bg-[#141721] text-white border border-white/15 rounded-full w-9 h-9 shadow-lg"
              title="Aggiorna Live Feed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingNews || isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>

        </div>
      </header>

      {/* Main Single Column Live Feed Stream */}
      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Active Counter Header */}
        <div className="flex items-center justify-between text-xs font-bold text-white/50 px-1">
          <span>{filteredIncidents.length} eventi attivi nel radar</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            5 Hubs Coperti
          </span>
        </div>

        <div
          role="group"
          aria-label="Ordina eventi"
          className="grid h-11 grid-cols-2 gap-1 rounded-lg border border-white/10 bg-[#0d1017] p-1"
        >
          <button
            type="button"
            aria-pressed={sortMode === 'recent'}
            onClick={() => setSortMode('recent')}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-3 text-xs font-bold transition-colors ${sortMode === 'recent' ? 'bg-[#10b981] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <Clock3 className="h-4 w-4 shrink-0" />
            <span>Più recenti</span>
          </button>
          <button
            type="button"
            aria-pressed={sortMode === 'distance'}
            disabled={!hasUserLocation}
            title={hasUserLocation ? 'Ordina per distanza dalla tua posizione' : 'Attiva la posizione per ordinare per distanza'}
            onClick={() => setSortMode('distance')}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-3 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${sortMode === 'distance' ? 'bg-[#10b981] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <MapPin className="h-4 w-4 shrink-0" />
            <span>Più vicini</span>
          </button>
        </div>

        {/* Incident Cards Stream */}
        {visibleIncidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            distance={incident.distance}
          />
        ))}

        {/* Infinite Scroll Bottom Loader Anchor */}
        <div ref={loaderRef} className="py-6 text-center">
          {hasMoreItems ? (
            <button
              onClick={() => setDisplayLimit(prev => Math.min(prev + 15, filteredIncidents.length))}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 px-6 py-2.5 rounded-full hover:bg-[#10b981]/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Carica Altri Eventi Live...
            </button>
          ) : (
            <p className="text-xs text-white/40 font-semibold">
              ✓ Hai raggiunto la fine del radar live per gli hub attivi.
            </p>
          )}
        </div>

      </main>

      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userLocation={userLocation}
      />
    </div>
  );
}
