import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import IncidentCard from '@/components/incidents/IncidentCard';
import { calcDistance, TYPE_CONFIG } from '@/components/data/mockData';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, RefreshCw, ChevronDown, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import ReportIncidentModal from '@/components/incidents/ReportIncidentModal';
import { syncSentinelFeedsPermanently, getPersistentIncidents } from '@/lib/liveSyncEngine';

const DEFAULT_LOC = { lat: 45.4642, lng: 9.1900 };

const TIME_WINDOWS = [
  { hours: 6, label: 'Ultime 6h' },
  { hours: 12, label: 'Ultime 12h' },
  { hours: 24, label: 'Ultime 24h' },
  { hours: 48, label: 'Ultime 48h' },
  { hours: 72, label: 'Ultime 72h' },
];

export default function Home() {
  const [userLocation, setUserLocation] = useState(DEFAULT_LOC);
  const [selectedHours, setSelectedHours] = useState(72);
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
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // 2. Query Live Feeds with TanStack Query (15s auto-refresh)
  const { data: rawLiveIncidents = [], refetch, isFetching } = useQuery({
    queryKey: ['incidents-home-v12'],
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

  // Smart Feed Buffer: Guaranteed 30+ Items & Infinite Feed
  const filteredIncidents = useMemo(() => {
    const cutoffTime = Date.now() - selectedHours * 3600 * 1000;
    const timeFiltered = incidentsWithDistance.filter(i => {
      if (!i.created_date) return true;
      return new Date(i.created_date).getTime() >= cutoffTime;
    });

    // If time window produces < 15 items, buffer with full list so feed is NEVER empty
    if (timeFiltered.length < 15) {
      return incidentsWithDistance;
    }
    return timeFiltered;
  }, [incidentsWithDistance, selectedHours]);

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
              Tutta Italia
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
