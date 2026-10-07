import React, { useEffect } from 'react';
import { AlertTriangle, CloudLightning, Activity } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import { useLanguageTheme } from '@/context/LanguageThemeContext';

export default function Manifesto() {
  const { t } = useLanguageTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-[#f5f5f5] min-h-screen font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar />

      {/* Hero Banner */}
      <section className="pt-28 pb-16 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-[80px] font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
            {t('manifesto_hero_title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-white/50 max-w-2xl mx-auto">{t('manifesto_hero_sub')}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar FOMO Stats */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-white dark:bg-[#111] border border-red-500/30 dark:border-red-500/20 p-8 rounded-[2rem] shadow-xl transition-colors duration-300">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                <h3 className="text-4xl font-bold mb-2 text-red-600 dark:text-red-400">{t('manifesto_stat_1_val')}</h3>
                <p className="text-gray-700 dark:text-white/60 font-medium">{t('manifesto_stat_1_txt')}</p>
              </div>
              <div className="bg-white dark:bg-[#111] border border-orange-500/30 dark:border-orange-500/20 p-8 rounded-[2rem] shadow-xl transition-colors duration-300">
                <Activity className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-4xl font-bold mb-2 text-orange-600 dark:text-orange-400">{t('manifesto_stat_2_val')}</h3>
                <p className="text-gray-700 dark:text-white/60 font-medium">{t('manifesto_stat_2_txt')}</p>
              </div>
              <div className="bg-white dark:bg-[#111] border border-blue-500/30 dark:border-blue-500/20 p-8 rounded-[2rem] shadow-xl transition-colors duration-300">
                <CloudLightning className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">{t('manifesto_stat_3_val')}</h3>
                <p className="text-gray-700 dark:text-white/60 font-medium">{t('manifesto_stat_3_txt')}</p>
              </div>
            </div>

            {/* Right Rich Text Content */}
            <div className="lg:col-span-8 space-y-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">"Perché non me l'ha detto nessuno?"</h2>
              <p className="text-gray-700 dark:text-white/70 text-xl leading-relaxed">
                È la frase che pronunciamo ogni volta che restiamo bloccati nel traffico di un incidente di cui nessuno aveva parlato. Viviamo nell'era dell'informazione istantanea, eppure siamo ciechi su ciò che accade nell'isolato accanto al nostro.
              </p>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white pt-4">L'Illusione del Controllo</h3>
              <p className="text-gray-700 dark:text-white/70 leading-relaxed text-lg">
                I canali ufficiali sono lenti. Hanno procedure, verifiche infinite, burocrazia. Quando un bollettino viene diramato, il danno è già fatto. I social media, d'altra parte, sono ostaggio degli algoritmi: seppelliscono le emergenze reali sotto valanghe di contenuti virali.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white pt-4">L'Informazione locale diffusa</h3>
              <p className="text-gray-700 dark:text-white/70 leading-relaxed text-lg">
                Abbiamo creato Sentinel per offrire un punto d'accesso chiaro alle informazioni locali. Notizie, bollettini pubblici e segnalazioni della community consultabili in un'unica mappa trasparente. Nessun sensazionalismo: se c'è un aggiornamento verificato nella tua area, lo puoi consultare direttamente con il proprio stato di verifica.
              </p>

              {/* Data & Perceived Anxiety Section */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-xl my-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
                  Dati, Trasparenza & La Realtà Locale
                </h3>
                <p className="text-gray-600 dark:text-white/70 text-base leading-relaxed mb-6">
                  Nelle aree urbane e nei territori locali (come il pilota Forlì-Cesena e l'Emilia-Romagna), pendolari e cittadini affrontano ogni giorno spostamenti senza avere una visione unificata degli eventi di viabilità, trasporti e segnalazioni territoriali.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <span className="text-3xl font-black text-[#10b981]">100%</span>
                    <p className="text-xs text-gray-600 dark:text-white/60 mt-1">Fonti dichiarate e stato di verifica trasparente</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <span className="text-3xl font-black text-blue-500">Cesena</span>
                    <p className="text-xs text-gray-600 dark:text-white/60 mt-1">Primo ambito pilota territoriale per la validazione MVP</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <span className="text-3xl font-black text-emerald-500">0</span>
                    <p className="text-xs text-gray-600 dark:text-white/60 mt-1">Sostituzione ai numeri di emergenza (112 sempre prioritario)</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Sentinel risponde con dati consultabili e stato di verifica esplicito.</p>
                  <Link 
                    to="/Platform"
                    className="bg-[#10b981] hover:bg-[#059669] text-black font-bold px-6 py-3 rounded-full text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)] inline-block text-center"
                  >
                    Apri la Mappa
                  </Link>
                </div>
              </div>

              <div className="bg-[#10b981]/15 border-l-4 border-[#10b981] p-6 rounded-r-2xl my-8">
                <p className="text-emerald-700 dark:text-[#10b981] font-bold text-xl m-0 italic">{t('manifesto_quote')}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <GlobalFooter />

    </div>
  );
}
