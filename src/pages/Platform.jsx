import React, { useEffect, Component, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Zap, Server, Smartphone, Database, Compass, Radio, Search, Navigation, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalFooter from '@/components/ui/GlobalFooter';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import WaitlistModal from '@/components/ui/WaitlistModal';
import IncidentMap from '@/components/incidents/IncidentMap';
import IncidentCard from '@/components/incidents/IncidentCard';
import { getPersistentIncidents } from '@/lib/liveSyncEngine';
import { useLanguageTheme } from '@/context/LanguageThemeContext';

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Mapbox GL WebGL render error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[500px] relative bg-[#06080e] rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between p-6 text-white select-none shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 opacity-80" 
            style={{ 
              backgroundImage: `url('https://a.basemaps.cartocdn.com/dark_all/13/4207/2808@2x.png'), url('/sentinel_hero_map.png')`,
              filter: 'brightness(0.9) contrast(1.1)'
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70 pointer-events-none" />

          {/* Top Control Bar */}
          <div className="relative z-10 flex items-center justify-between bg-black/85 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2.5 text-xs font-bold text-white">
              <Search className="w-4 h-4 text-[#10b981]" />
              <span>Milano · Piazza Duomo (Radar 3D Live)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[10px] font-black text-black bg-[#10b981] px-2 py-0.5 rounded shadow">
                LIVE 3D RADAR
              </span>
            </div>
          </div>

          <div className="relative z-10 bg-black/85 backdrop-blur-xl p-4 rounded-2xl border border-white/15">
            <div className="flex items-center gap-3 text-xs text-white/70">
              <ShieldAlert className="w-4 h-4 text-[#10b981]" />
              <span>Simulazione interattiva radar perimetrale della viabilità in tempo reale.</span>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Platform() {
  const { t, lang } = useLanguageTheme();
  const isEn = lang === 'en';
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const incidents = useMemo(() => {
    return getPersistentIncidents();
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-[#f5f5f5] min-h-screen font-sans transition-colors duration-300 select-none" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar onOpenWaitlist={() => setIsWaitlistOpen(true)} />

      {/* Hero Header */}
      <section className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-xs font-bold text-[#10b981] mb-6 backdrop-blur-md">
            <Radio className="w-4 h-4 text-[#10b981] animate-pulse" />
            <span>{isEn ? 'Live Monitoring Platform' : 'Piattaforma di Monitoraggio Live'}</span>
          </div>

          <h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[0.95] mb-6 text-slate-900 dark:text-white">
            {t('platform_hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 max-w-3xl mb-12 font-normal">
            {t('platform_hero_sub')}
          </p>

          {/* 1. ULTRA PREMIUM 3D DASHBOARD PREVIEW IMAGE */}
          <div className="mb-12 rounded-[2.5rem] overflow-hidden bg-gray-950 border border-slate-200 dark:border-white/15 relative shadow-2xl group">
            <img 
              src="/sentinel_hero_map.png" 
              alt="Sentinel 3D Command Radar Dashboard" 
              className="w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-6 right-6 bg-[#090909]/90 border border-white/15 p-3.5 rounded-2xl backdrop-blur-xl flex items-center gap-3 shadow-xl text-white">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
              </span>
              <span className="text-xs font-bold tracking-wide uppercase">
                {isEn ? 'Active 3D Dashboard' : 'Dashboard 3D Attiva'}
              </span>
            </div>
          </div>

          {/* 2. LIVE INTERACTIVE MAP DISPLAY WITH CLICKABLE MARKERS */}
          <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2.2rem] overflow-hidden p-6 md:p-8 shadow-2xl transition-colors duration-300 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#10b981]" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('platform_map_title')}</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/50 mt-1">{t('platform_map_sub')}</p>
              </div>
              <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/15 px-4 py-1.5 rounded-full border border-[#10b981]/30">
                {t('platform_map_badge')}
              </span>
            </div>
            
            <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative shadow-2xl">
              <MapErrorBoundary>
                <IncidentMap 
                  incidents={incidents} 
                  userLocation={{ lat: 45.4642, lng: 9.1900 }} 
                  zoom={12.8}
                  onIncidentClick={(inc) => setSelectedIncident(inc)}
                />
              </MapErrorBoundary>

              {/* Clicked Marker Responsive Card Popup Panel */}
              <AnimatePresence>
                {selectedIncident && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                    className="absolute z-30 md:bottom-6 md:right-6 md:left-auto md:max-w-md w-full bottom-0 inset-x-0 p-3 md:p-0"
                  >
                    <div className="relative shadow-2xl">
                      <button
                        type="button"
                        onClick={() => setSelectedIncident(null)}
                        className="absolute -top-3 right-3 w-8 h-8 rounded-full bg-black border border-white/20 text-white flex items-center justify-center shadow-2xl z-40 hover:bg-slate-900 transition-transform hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <IncidentCard incident={selectedIncident} distance={selectedIncident.distance} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-slate-100 dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-lg">
              <Smartphone className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                {isEn ? 'Universal PWA' : 'PWA Universale'}
              </h3>
              <p className="text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                {isEn 
                  ? 'Bypassing app store delay times. Our Progressive Web App installs instantly for instant network access everywhere.'
                  : 'Abbiamo bypassato i tempi morti degli app store. La nostra Progressive Web App si installa all\'istante, garantendoti l\'accesso al network ovunque tu sia.'}
              </p>
            </div>
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-lg">
              <Server className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                {isEn ? 'Perimeter Edge Computing' : 'Calcolo Perimetrale'}
              </h3>
              <p className="text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                {isEn
                  ? 'Edge Computing allows us to process data within milliseconds. Receive critical alerts before they hit central databases.'
                  : 'L\'Edge Computing ci permette di elaborare i dati a un millisecondo da te. Ricevi le allerte critiche prima ancora che sfiorino i nostri database centrali.'}
              </p>
            </div>
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-lg">
              <Database className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                {isEn ? 'Zero Data Profiling' : 'Zero Profilazione'}
              </h3>
              <p className="text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                {isEn
                  ? 'Zero personal tracking. Location data is processed locally on your device to maintain strict European GDPR privacy.'
                  : 'Nessun tracciamento dell\'identità personale. I dati di posizione vengono elaborati localmente sul dispositivo per mantenere la tua privacy impenetrabile.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />

      <WaitlistModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
      />

    </div>
  );
}
