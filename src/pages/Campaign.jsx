import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, Users, Sparkles, Trophy, MapPin, CheckCircle2, Award, Zap } from 'lucide-react';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import GlobalFooter from '@/components/ui/GlobalFooter';
import WaitlistModal from '@/components/ui/WaitlistModal';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
import { trackEvent } from '@/lib/analytics';

export default function Campaign() {
  const { t, lang } = useLanguageTheme();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const handleOpenWaitlist = (source) => {
    trackEvent('cta_click', { button: 'campaign_founder_badge', source });
    setIsWaitlistOpen(true);
  };

  const ROLLOUT_CITIES = [
    { city: "Roma", status: "Pronto", date: "Fase 1 · Q1 2026", active: true },
    { city: "Milano", status: "Pronto", date: "Fase 1 · Q1 2026", active: true },
    { city: "Torino & Bologna", status: "In Arrivo", date: "Fase 2 · Q2 2026", active: false },
    { city: "Napoli & Firenze", status: "In Arrivo", date: "Fase 2 · Q2 2026", active: false },
    { city: "Palermo & Genova", status: "Pianificato", date: "Fase 3 · Q3 2026", active: false },
  ];

  return (
    <div className="relative w-full max-w-full bg-[#050505] text-[#f5f5f5] min-h-screen overflow-x-hidden font-sans selection:bg-[#10b981] selection:text-black transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#10b981] opacity-10 blur-[180px] rounded-full pointer-events-none" />

      {/* NAVBAR */}
      <MarketingNavbar onOpenWaitlist={() => handleOpenWaitlist('campaign_nav')} />

      <main className="pt-24 pb-20">
        
        {/* HERO CAMPAIGN SECTION */}
        <section className="relative z-10 pt-8 pb-16 md:pt-14 md:pb-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-xs font-semibold text-[#10b981] mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              {lang === 'en' ? 'Official 2026 Launch Campaign' : 'Campagna Ufficiale di Pre-Lancio 2026'}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              {lang === 'en' ? (
                <>The Participatory Safety <br /><span className="text-[#10b981]">Revolution in Italy</span></>
              ) : (
                <>La Rivoluzione della Sicurezza <br /><span className="text-[#10b981]">Partecipata in Italia</span></>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl opacity-70 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              {lang === 'en' 
                ? "Join over 8,400 founding members across Italy. Reserve your priority access and unlock the exclusive Sentinel Founder Badge."
                : "Unisciti ad oltre 8.400 membri fondatori in tutta Italia. Riserva il tuo accesso prioritario e sblocca il badge esclusivo Sentinel Founder."
              }
            </p>

            {/* CAMPAIGN GOAL PROGRESS BAR CARD */}
            <div className="max-w-xl mx-auto bg-[#0c0c0c] border border-white/15 p-6 md:p-8 rounded-3xl shadow-2xl mb-10 text-left relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#10b981] flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#10b981]" />
                  {lang === 'en' ? 'Founders Goal Progress' : 'Obiettivo Membri Fondatori'}
                </span>
                <span className="text-xs font-bold text-white/70">8,420 / 10,000</span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4 p-0.5 border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#10b981] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-1000"
                  style={{ width: '84.2%' }}
                />
              </div>

              <div className="flex items-center justify-between text-xs opacity-60 font-light">
                <span>{lang === 'en' ? '84% Goal Reached' : '84% Raggiunto'}</span>
                <span>{lang === 'en' ? '1,580 Founder Badges Left' : '1.580 Badge Founder Rimasti'}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleOpenWaitlist('campaign_hero_cta')}
                className="inline-flex items-center justify-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-10 py-4.5 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_35px_rgba(16,185,129,0.4)]"
              >
                {lang === 'en' ? 'Reserve Founder Access' : 'Riserva Accesso Founder'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Trust badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs opacity-50 font-light">
              <Lock className="w-3.5 h-3.5 text-[#10b981]" />
              <span>{lang === 'en' ? 'Free · Zero Data Profiling · Verified Sources Only' : 'Gratuito · Zero profilazione dati · Solo fonti verificate'}</span>
            </div>

          </div>
        </section>

        {/* REWARDS & PILLARS GRID */}
        <section className="py-20 bg-[#0a0a0a] border-y border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">
                {lang === 'en' ? 'Founder Privileges /' : 'Vantaggi Founder /'}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                {lang === 'en' ? 'What you get as an Early Adopter' : 'Cosa sblocchi come Early Adopter'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {lang === 'en' ? 'Exclusive Founder Badge' : 'Badge Founder Permanente'}
                  </h3>
                  <p className="text-sm opacity-60 font-light leading-relaxed mb-6">
                    {lang === 'en' 
                      ? "A permanent green Founder badge on your profile and contributions, recognizing you as a pioneer of urban safety."
                      : "Un badge verde Founder permanente sul tuo profilo e sulle tue segnalazioni, a testimonianza del tuo ruolo di pioniere."
                    }
                  </p>
                </div>
                <div className="text-xs text-[#10b981] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'en' ? 'Included for first 10,000' : 'Incluso per i primi 10.000'}
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {lang === 'en' ? 'Priority App Rollout' : 'Accesso Anticipato App'}
                  </h3>
                  <p className="text-sm opacity-60 font-light leading-relaxed mb-6">
                    {lang === 'en'
                      ? "Download link sent via TestFlight (iOS) and APK (Android) 2 weeks before the public App Store debut."
                      : "Link di download inviato via TestFlight (iOS) ed APK (Android) 2 settimane prima del debutto pubblico sugli store."
                    }
                  </p>
                </div>
                <div className="text-xs text-[#10b981] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'en' ? 'Beta Access Included' : 'Accesso Beta Incluso'}
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {lang === 'en' ? 'Karma Booster Points' : 'Bonus Karma Iniziale'}
                  </h3>
                  <p className="text-sm opacity-60 font-light leading-relaxed mb-6">
                    {lang === 'en'
                      ? "Start with 100 extra Karma points on day 1 to instantly establish your reputation as an authoritative contributor."
                      : "Inizia con 100 punti Karma extra dal primo giorno per posizionarti subito tra i segnalatori più autorevoli."
                    }
                  </p>
                </div>
                <div className="text-xs text-[#10b981] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'en' ? '+100 Karma Granted' : '+100 Karma Assegnati'}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* CITY ROLLOUT TIMELINE */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            
            <div className="text-center mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">
                {lang === 'en' ? 'National Expansion Plan /' : 'Piano di Espansione Nazionale /'}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                {lang === 'en' ? 'City Rollout Schedule' : 'Calendario di Attivazione Città'}
              </h2>
            </div>

            <div className="space-y-4">
              {ROLLOUT_CITIES.map((c, idx) => (
                <div 
                  key={idx}
                  className={`p-6 rounded-2xl border flex items-center justify-between transition-all ${
                    c.active 
                      ? 'bg-[#0c0c0c] border-[#10b981]/40 shadow-lg' 
                      : 'bg-white/[0.02] border-white/10 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      c.active ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-white/5 text-white/40'
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{c.city}</h4>
                      <p className="text-xs opacity-50 font-light">{c.date}</p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    c.active 
                      ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30' 
                      : 'bg-white/5 text-white/50 border-white/10'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* FINAL CAMPAIGN CTA */}
        <section className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border-t border-white/10 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {lang === 'en' ? 'Ready to make your city safer?' : 'Pronto a rendere la tua città più sicura?'}
            </h2>
            <p className="text-base md:text-lg opacity-60 mb-8 max-w-xl mx-auto font-light">
              {lang === 'en'
                ? "Don't miss out on your Founder Badge and early access."
                : "Non farti sfuggire il tuo Badge Founder e l'accesso prioritario."
              }
            </p>
            <button
              onClick={() => handleOpenWaitlist('campaign_final')}
              className="inline-flex items-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-10 py-4.5 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              {lang === 'en' ? 'Join Launch Campaign' : 'Partecipa alla Campagna'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <GlobalFooter />

      {/* WAITLIST MODAL */}
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />

    </div>
  );
}
