import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Zap, Server, Smartphone, Database, MapPin, Compass } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import IncidentMap from '@/components/incidents/IncidentMap';
import { MOCK_INCIDENTS } from '@/components/data/mockData';
import { useLanguageTheme } from '@/context/LanguageThemeContext';

export default function Platform() {
  const { t } = useLanguageTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-[#f5f5f5] min-h-screen font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar />

      {/* Hero */}
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl md:text-[80px] font-bold tracking-tight leading-[0.95] mb-8 text-gray-900 dark:text-white">
            {t('platform_hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-white/60 max-w-2xl mb-12">
            {t('platform_hero_sub')}
          </p>

          {/* ULTRA PREMIUM 3D MAPBOX DISPLAY */}
          <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-[2.2rem] overflow-hidden p-6 md:p-8 shadow-2xl transition-colors duration-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#10b981]" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('platform_map_title')}</h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{t('platform_map_sub')}</p>
              </div>
              <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/15 px-4 py-1.5 rounded-full border border-[#10b981]/30">
                {t('platform_map_badge')}
              </span>
            </div>
            
            <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 relative shadow-2xl">
              <IncidentMap 
                incidents={MOCK_INCIDENTS} 
                userLocation={{ lat: 45.4642, lng: 9.1900 }} 
                zoom={13} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="border-t border-gray-200 dark:border-white/10 pt-8">
              <Smartphone className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">PWA Universale</h3>
              <p className="text-gray-600 dark:text-white/60">Abbiamo bypassato i tempi morti degli app store. La nostra Progressive Web App si installa all'istante, garantendoti l'accesso al network ovunque tu sia.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-white/10 pt-8">
              <Server className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Calcolo Perimetrale</h3>
              <p className="text-gray-600 dark:text-white/60">L'Edge Computing ci permette di elaborare i dati a un millisecondo da te. Ricevi le allerte critiche prima ancora che sfiorino i nostri database centrali.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-white/10 pt-8">
              <Database className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Zero Profilazione</h3>
              <p className="text-gray-600 dark:text-white/60">Nessun tracciamento dell'identità personale. I dati di posizione vengono elaborati localmente sul dispositivo per mantenere la tua privacy impenetrabile.</p>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />

    </div>
  );
}
