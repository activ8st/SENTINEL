import React, { useEffect, Component } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Zap, Server, Smartphone, Database, MapPin, Compass, Radio, Search, Navigation, AlertTriangle } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import IncidentMap from '@/components/incidents/IncidentMap';
import { MOCK_INCIDENTS } from '@/components/data/mockData';
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

          {/* Interactive Center Navigation Pins */}
          <div className="relative z-10 flex-1 my-8 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-[#10b981]/30 rounded-full animate-ping absolute -inset-4" />
              <div className="w-10 h-10 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center text-black shadow-[0_0_35px_rgba(16,185,129,1)]">
                <Navigation className="w-5 h-5 fill-black" />
              </div>
              <div className="absolute top-12 -left-20 bg-black/95 border border-[#10b981]/60 text-[#10b981] text-[11px] font-black px-4 py-1.5 rounded-xl shadow-2xl whitespace-nowrap">
                📍 Posizione Attuale · Via Montenapoleone
              </div>
            </div>
          </div>

          {/* Bottom Live Alert Strip */}
          <div className="relative z-10 bg-black/90 backdrop-blur-xl p-4 rounded-2xl border border-white/20 flex items-center justify-between text-xs shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="font-extrabold text-white">Lavori Stradali & Deviazione Via Dante</div>
                <div className="text-[10px] text-emerald-400 font-bold">Fonte Ufficiale · A 250m dal percorso</div>
              </div>
            </div>
            <span className="text-[10px] font-black text-black bg-[#10b981] px-3 py-1 rounded shadow shrink-0">
              VERIFICATO
            </span>
          </div>

        </div>
      );
    }
    return this.props.children;
  }
}

export default function Platform() {
  const { t } = useLanguageTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-[#f5f5f5] min-h-screen font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar />

      {/* Hero Header */}
      <section className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-xs font-bold text-[#10b981] mb-6 backdrop-blur-md">
            <Radio className="w-4 h-4 text-[#10b981] animate-pulse" />
            <span>Piattaforma di Monitoraggio Live</span>
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
              <span className="text-xs font-bold tracking-wide uppercase">Dashboard 3D Attiva</span>
            </div>
          </div>

          {/* 2. LIVE INTERACTIVE MAP DISPLAY WITH SAFETY ERROR BOUNDARY */}
          <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2.2rem] overflow-hidden p-6 md:p-8 shadow-2xl transition-colors duration-300">
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
                  incidents={MOCK_INCIDENTS} 
                  userLocation={{ lat: 45.4642, lng: 9.1900 }} 
                  zoom={13} 
                />
              </MapErrorBoundary>
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
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">PWA Universale</h3>
              <p className="text-slate-600 dark:text-white/60 font-normal leading-relaxed">Abbiamo bypassato i tempi morti degli app store. La nostra Progressive Web App si installa all'istante, garantendoti l'accesso al network ovunque tu sia.</p>
            </div>
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-lg">
              <Server className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Calcolo Perimetrale</h3>
              <p className="text-slate-600 dark:text-white/60 font-normal leading-relaxed">L'Edge Computing ci permette di elaborare i dati a un millisecondo da te. Ricevi le allerte critiche prima ancora che sfiorino i nostri database centrali.</p>
            </div>
            <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-lg">
              <Database className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Zero Profilazione</h3>
              <p className="text-slate-600 dark:text-white/60 font-normal leading-relaxed">Nessun tracciamento dell'identità personale. I dati di posizione vengono elaborati localmente sul dispositivo per mantenere la tua privacy impenetrabile.</p>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />

    </div>
  );
}
