import React, { useEffect, useState } from 'react';
import { ShieldCheck, Map, BellRing, Users, ArrowRight, Lock, Eye, ChevronDown, Download, Compass, Moon, AlertTriangle, Radio } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import ItalyMapModal from '@/components/ui/ItalyMapModal';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import FeatureModal from '@/components/ui/FeatureModal';
import WaitlistModal from '@/components/ui/WaitlistModal';
import DualIPhoneHeroMockup from '@/components/ui/DualIPhoneHeroMockup';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
import { trackEvent, initScrollDepthTracking } from '@/lib/analytics';

export default function LandingPage() {
  const { t, lang } = useLanguageTheme();

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    // Import Google Font Funnel Display
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.title = lang === 'it' 
      ? "Sentinel — Sicurezza verificata, prima di uscire" 
      : "Sentinel — Verified Safety, Before Stepping Outside";

    // Track page view and scroll depth
    trackEvent('page_view', { page: 'LandingPage', lang });
    const cleanupScroll = initScrollDepthTracking();

    // Handle sticky mobile bar on scroll
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.head.removeChild(link);
      cleanupScroll();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lang]);

  const handleOpenWaitlist = (sourceLocation) => {
    trackEvent('cta_click', { location: sourceLocation });
    setIsWaitlistOpen(true);
  };

  const FAQS = [
    {
      question: "Sentinel sostituisce il 112 o i numeri di emergenza?",
      answer: "No. Sentinel è uno strumento di informazione preventiva e consapevolezza del territorio. In caso di emergenza immediata o pericolo imminente per la vita, devi sempre contattare tempestivamente il 112 o le forze dell'ordine."
    },
    {
      question: "Come viene garantito che non ci sia allarmismo o fake news?",
      answer: "Ogni segnalazione passa attraverso il nostro algoritmo di moderazione preventiva e viene incrociata con i dati ufficiali prima della pubblicazione sulla mappa globale. Inoltre, il Karma degli utenti limita l'impatto di segnalazioni isolate o non verificate."
    },
    {
      question: "La mia posizione viene tracciata o venduta a terzi?",
      answer: "Assolutamente no. Sentinel opera nel pieno rispetto del GDPR europeo. I dati di geolocalizzazione vengono elaborati in locale sul tuo dispositivo e servono esclusivamente a calcolare le allerte sul tuo raggio d'azione. Zero profilazione a fini pubblicitari."
    },
    {
      question: "L'applicazione è gratuita?",
      answer: "Sì, le funzionalità fondamentali di monitoraggio del territorio, ricezione delle allerte live e consultazione delle fonti ufficiali sono e rimarranno sempre gratuite per tutti i cittadini."
    },
    {
      question: "Funziona anche nelle zone più piccole o solo nei grandi centri?",
      answer: "Le allerte istituzionali (come INGV per i terremoti, allerte meteo della Protezione Civile e viabilità) coprono l'intero territorio nazionale. Nelle zone più frequentate si aggiunge la rete di segnalazione capillare degli utenti."
    },
    {
      question: "Le segnalazioni possono discriminare persone o quartieri?",
      answer: "No. Sentinel integra un filtro rigido anti-discriminazione che blocca all'origine qualsiasi generalizzazione su gruppi etnici, nazionalità o religioni. Pubblichiamo esclusivamente fatti oggettivi e verificabili: cosa, dove e quando."
    }
  ];

  return (
    <div className="relative w-full max-w-full bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-[#f5f5f5] min-h-screen overflow-x-hidden font-sans selection:bg-[#10b981] selection:text-black transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Ambient Glow Orbs */}
      <div className="absolute top-[-5%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-[#10b981] opacity-10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-[35%] right-0 translate-x-1/3 w-[500px] h-[500px] bg-amber-500/10 opacity-10 blur-[180px] rounded-full pointer-events-none" />

      {/* 1. NAVBAR */}
      <MarketingNavbar onOpenWaitlist={() => handleOpenWaitlist('navbar')} />

      <main className="pt-20">
        {/* 2. HERO SECTION */}
        <section className="relative z-10 pt-8 pb-24 md:pt-14 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Text & CTAs */}
              <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-6 duration-1000">
                
                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-xs font-bold text-[#10b981] mb-6 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  {t('hero_eyebrow')}
                </div>

                {/* H1 Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-[76px] leading-[0.98] font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
                  {t('hero_title_1')} <br className="hidden sm:inline" />
                  <span className="text-[#10b981]">{t('hero_title_2')}</span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 mb-10 max-w-xl leading-relaxed font-normal">
                  {t('hero_subtitle')}
                </p>
                
                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => handleOpenWaitlist('hero_primary')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-9 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  >
                    <Download className="w-5 h-5" />
                    {t('hero_cta_primary')}
                  </button>

                  <a 
                    href="#prova-prodotto"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white px-8 py-4 rounded-full font-bold text-lg transition-colors border border-slate-300 dark:border-white/10 backdrop-blur-md"
                  >
                    {t('hero_cta_secondary')}
                  </a>
                </div>

                {/* Trust Badge */}
                <div className="mt-10 flex items-center gap-3 text-xs text-slate-500 dark:text-white/50 font-medium">
                  <Lock className="w-4 h-4 text-[#10b981]" />
                  <span>{t('hero_trust_badge')}</span>
                </div>
              </div>

              {/* Right Column: Dual iPhone 17 Pro App Mockup */}
              <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                <DualIPhoneHeroMockup />
              </div>

            </div>
          </div>
        </section>

        {/* 3. STAT BAR */}
        <section className="py-10 border-y border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold mb-1 text-slate-900 dark:text-white">{t('stat_1_val')}</div>
              <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">{t('stat_1_lbl')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#10b981] mb-1">{t('stat_2_val')}</div>
              <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">{t('stat_2_lbl')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold mb-1 text-slate-900 dark:text-white">{t('stat_3_val')}</div>
              <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">{t('stat_3_lbl')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#10b981] mb-1">{t('stat_4_val')}</div>
              <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">{t('stat_4_lbl')}</div>
            </div>
          </div>
        </section>

        {/* 4. SEZIONE PERSONA */}
        <section className="py-28 relative border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('persona_tag')}</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                {t('persona_title')}
              </h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-white/60 font-normal">
                {t('persona_sub')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1 — Turista */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 md:p-10 hover:border-[#10b981]/40 transition-all group flex flex-col justify-between shadow-xl text-slate-900 dark:text-white">
                <div>
                  <div className="w-14 h-14 bg-[#10b981]/15 rounded-2xl flex items-center justify-center text-[#10b981] border border-[#10b981]/30 mb-6">
                    <Compass className="w-7 h-7" />
                  </div>
                  <div className="inline-block text-xs font-bold uppercase tracking-wider text-[#10b981] bg-[#10b981]/15 px-3 py-1 rounded-full mb-4">
                    {t('persona_1_badge')}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    {t('persona_1_title')}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 dark:text-white/60 font-normal leading-relaxed mb-6">
                    {t('persona_1_text')}
                  </p>
                </div>
                <button 
                  onClick={() => handleOpenWaitlist('persona_turista')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#10b981] group-hover:gap-3 transition-all text-left"
                >
                  {t('persona_1_cta')}
                </button>
              </div>

              {/* Card 2 — Chi si sposta la sera */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 md:p-10 hover:border-[#10b981]/40 transition-all group flex flex-col justify-between shadow-xl text-slate-900 dark:text-white">
                <div>
                  <div className="w-14 h-14 bg-[#f59e0b]/15 rounded-2xl flex items-center justify-center text-[#f59e0b] border border-[#f59e0b]/30 mb-6">
                    <Moon className="w-7 h-7" />
                  </div>
                  <div className="inline-block text-xs font-bold uppercase tracking-wider text-[#f59e0b] bg-[#f59e0b]/15 px-3 py-1 rounded-full mb-4">
                    {t('persona_2_badge')}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    {t('persona_2_title')}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 dark:text-white/60 font-normal leading-relaxed mb-6">
                    {t('persona_2_text')}
                  </p>
                </div>
                <button 
                  onClick={() => handleOpenWaitlist('persona_sera')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#10b981] group-hover:gap-3 transition-all text-left"
                >
                  {t('persona_2_cta')}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 5. SEZIONE DIFFERENZIAZIONE */}
        <section className="py-28 bg-slate-100 dark:bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="max-w-3xl mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('princ_tag')}</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
                {t('princ_title')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                {t('princ_sub')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-lg text-slate-900 dark:text-white">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('princ_1_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('princ_1_text')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-lg text-slate-900 dark:text-white">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('princ_2_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('princ_2_text')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-lg text-slate-900 dark:text-white">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('princ_3_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('princ_3_text')}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 6. PROVA PRODOTTO */}
        <section id="prova-prodotto" className="py-28 relative border-t border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
              <div>
                <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('demo_tag')}</div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {t('demo_title_1')} <br/>
                  <span className="text-[#10b981]">{t('demo_title_2')}</span>
                </h2>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(true)}
                className="inline-flex items-center gap-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-200 text-white dark:text-black px-7 py-3.5 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-md"
              >
                {t('demo_cta')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Shifted Command Radar Dashboard Visual */}
            <div className="mb-16 aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-gray-950 border border-slate-200 dark:border-white/15 relative shadow-2xl group">
              <img 
                src="/sentinel_hero_map.png" 
                alt="Sentinel 3D Command Radar Dashboard & Telemetry" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-6 right-6 bg-[#090909]/90 border border-white/15 p-3.5 rounded-2xl backdrop-blur-xl flex items-center gap-3 shadow-xl text-white">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
                </span>
                <span className="text-xs font-bold tracking-wide uppercase">{t('demo_infra_badge')}</span>
              </div>
            </div>

            {/* Feature Cards Grid (HIGH CONTRAST LIGHT / DARK) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                onClick={() => setActiveFeature('mappa')}
                className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl group cursor-pointer text-slate-900 dark:text-white"
              >
                <Map className="w-10 h-10 text-[#10b981] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('card_1_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal mb-6 leading-relaxed">
                  {t('card_1_text')}
                </p>
                <span className="text-[#10b981] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                  {t('card_learn_more')}
                </span>
              </div>

              <div 
                onClick={() => setActiveFeature('allerte')}
                className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl group cursor-pointer text-slate-900 dark:text-white"
              >
                <BellRing className="w-10 h-10 text-[#10b981] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('card_2_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal mb-6 leading-relaxed">
                  {t('card_2_text')}
                </p>
                <span className="text-[#10b981] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                  {t('card_learn_more')}
                </span>
              </div>

              <div 
                onClick={() => setActiveFeature('karma')}
                className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl group cursor-pointer text-slate-900 dark:text-white"
              >
                <Users className="w-10 h-10 text-[#10b981] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('card_3_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal mb-6 leading-relaxed">
                  {t('card_3_text')}
                </p>
                <span className="text-[#10b981] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                  {t('card_learn_more')}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* 7. COME FUNZIONA (3 Step) */}
        <section className="py-28 bg-slate-100 dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/10 transition-colors">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('how_tag')}</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('how_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 relative shadow-lg text-slate-900 dark:text-white">
                <div className="text-5xl font-extrabold text-[#10b981] mb-4">01.</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('step_1_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('step_1_text')}
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 relative shadow-lg text-slate-900 dark:text-white">
                <div className="text-5xl font-extrabold text-[#10b981] mb-4">02.</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('step_2_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('step_2_text')}
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 relative shadow-lg text-slate-900 dark:text-white">
                <div className="text-5xl font-extrabold text-[#10b981] mb-4">03.</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('step_3_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('step_3_text')}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 8. FAQ */}
        <section className="py-28 border-t border-slate-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-6">
            
            <div className="text-center mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('faq_tag')}</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                {t('faq_title')}
              </h2>
              <p className="text-base text-slate-600 dark:text-white/60 font-normal">
                {t('faq_sub')}
              </p>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-white/10 border-y border-slate-200 dark:border-white/10">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="py-6">
                  <button 
                    onClick={() => {
                      const next = openFaqIndex === idx ? null : idx;
                      setOpenFaqIndex(next);
                      trackEvent('faq_toggle', { question: faq.question, open: next !== null });
                    }}
                    className="w-full flex items-center justify-between text-left font-bold text-lg md:text-xl text-slate-900 dark:text-white hover:text-[#10b981] transition-colors gap-4"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-[#10b981]' : 'text-slate-400 dark:text-white/40'}`} />
                  </button>

                  {openFaqIndex === idx && (
                    <div className="mt-4 text-sm md:text-base text-slate-600 dark:text-white/70 font-normal leading-relaxed animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className="py-24 bg-gradient-to-b from-slate-100 to-white dark:from-[#0a0a0a] dark:to-[#050505] border-t border-slate-200 dark:border-white/10 text-center relative overflow-hidden transition-colors">
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
              {t('final_title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-white/60 mb-10 max-w-xl mx-auto font-normal leading-relaxed">
              {t('final_sub')}
            </p>
            <button 
              onClick={() => handleOpenWaitlist('final_cta')}
              className="inline-flex items-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-12 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              {t('final_cta')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <GlobalFooter />

      {/* STICKY MOBILE DOWNLOAD BAR */}
      {showStickyBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c0c0c]/95 border-t border-slate-200 dark:border-white/15 p-4 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex items-center justify-between gap-4 text-slate-900 dark:text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#10b981] flex items-center justify-center text-black font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Sentinel</div>
              <div className="text-[10px] text-slate-500 dark:text-white/50">Sicurezza Verificata</div>
            </div>
          </div>

          <button
            onClick={() => handleOpenWaitlist('sticky_mobile_bar')}
            className="flex items-center gap-2 bg-[#10b981] text-black px-5 py-2.5 rounded-full font-bold text-xs shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            {t('hero_cta_primary')}
          </button>
        </div>
      )}

      {/* MODALS */}
      <ItalyMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
      <FeatureModal featureId={activeFeature} onClose={() => setActiveFeature(null)} />
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />

    </div>
  );
}
