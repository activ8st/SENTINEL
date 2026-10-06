import React, { useEffect, useState } from 'react';
import { ShieldCheck, Map, BellRing, Users, ArrowRight, Lock, Eye, ChevronDown, Compass, Navigation, AlertTriangle, CheckCircle, Info, ShieldAlert, FileText, Layers, Ban } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import ItalyMapModal from '@/components/ui/ItalyMapModal';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import FeatureModal from '@/components/ui/FeatureModal';
import WaitlistModal from '@/components/ui/WaitlistModal';
import DualIPhoneHeroMockup from '@/components/ui/DualIPhoneHeroMockup';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
import { trackEvent, initScrollDepthTracking } from '@/lib/analytics';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const { t, lang } = useLanguageTheme();

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    document.title = lang === 'it' 
      ? "Sentinel — Informazioni locali trasparenti e verificate" 
      : "Sentinel — Transparent & Verified Local Information";

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
      question: t('faq_q1'),
      answer: t('faq_a1')
    },
    {
      question: t('faq_q2'),
      answer: t('faq_a2')
    },
    {
      question: t('faq_q3'),
      answer: t('faq_a3')
    },
    {
      question: t('faq_q4'),
      answer: t('faq_a4')
    },
    {
      question: t('faq_q5'),
      answer: t('faq_a5')
    }
  ];

  return (
    <div className="relative w-full max-w-full bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-[#f5f5f5] min-h-screen font-sans selection:bg-[#10b981] selection:text-black transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-[#10b981] opacity-10 blur-[180px] rounded-full" />
        <div className="absolute top-[35%] right-0 translate-x-1/3 w-[500px] h-[500px] bg-emerald-500/10 opacity-10 blur-[180px] rounded-full" />
      </div>

      {/* 1. NAVBAR */}
      <MarketingNavbar onOpenWaitlist={() => handleOpenWaitlist('navbar')} />

      <main className="pt-20">
        
        {/* 2. HERO SECTION */}
        <section className="relative z-10 pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden">
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
                <h1 className="text-4xl sm:text-5xl lg:text-[68px] leading-[1.05] font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
                  {t('hero_title_1')} <br className="hidden sm:inline" />
                  <span className="text-[#10b981]">{t('hero_title_2')}</span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 mb-8 max-w-xl leading-relaxed font-normal">
                  {t('hero_subtitle')}
                </p>
                
                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <Link 
                    to="/Platform"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-9 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  >
                    <Map className="w-5 h-5" />
                    {t('hero_cta_primary')}
                  </Link>

                  <a 
                    href="#funzionamento"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white px-8 py-4 rounded-full font-bold text-lg transition-colors border border-slate-300 dark:border-white/10 backdrop-blur-md"
                  >
                    {t('hero_cta_secondary')}
                  </a>
                </div>

                {/* Transparency Note Under CTAs */}
                <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-medium leading-relaxed max-w-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{t('hero_transparency_note')}</span>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 flex items-center gap-3 text-xs text-slate-500 dark:text-white/50 font-medium">
                  <Lock className="w-4 h-4 text-[#10b981]" />
                  <span>{t('hero_trust_badge')}</span>
                </div>
              </div>

              {/* Right Column: Dual iPhone App Mockup */}
              <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                <DualIPhoneHeroMockup />
              </div>

            </div>
          </div>
        </section>

        {/* 3. SEZIONE PROBLEMA */}
        <section className="py-20 border-y border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02]">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="inline-block text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">
              {t('problem_tag')}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
              {t('problem_title')}
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-white/70 font-normal leading-relaxed max-w-3xl mx-auto">
              {t('problem_text')}
            </p>
          </div>
        </section>

        {/* 4. SEZIONE DESTINATARI */}
        <section className="py-24 relative border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('dest_tag')}</div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                {t('dest_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Destinatario 1 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center mb-6">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('dest_1_title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                    {t('dest_1_text')}
                  </p>
                </div>
              </div>

              {/* Destinatario 2 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center mb-6">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('dest_2_title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                    {t('dest_2_text')}
                  </p>
                </div>
              </div>

              {/* Destinatario 3 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center mb-6">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('dest_3_title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                    {t('dest_3_text')}
                  </p>
                </div>
              </div>

              {/* Destinatario 4 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('dest_4_title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                    {t('dest_4_text')}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 5. SEZIONE COSA MOSTRA */}
        <section className="py-24 bg-slate-100 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="max-w-3xl mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('shows_tag')}</div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('shows_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-lg">
                <FileText className="w-10 h-10 text-[#10b981] mb-6" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('shows_card_1_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed font-normal">
                  {t('shows_card_1_text')}
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-lg">
                <Users className="w-10 h-10 text-[#10b981] mb-6" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('shows_card_2_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed font-normal">
                  {t('shows_card_2_text')}
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-lg">
                <CheckCircle className="w-10 h-10 text-[#10b981] mb-6" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('shows_card_3_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed font-normal">
                  {t('shows_card_3_text')}
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-lg">
                <Map className="w-10 h-10 text-[#10b981] mb-6" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('shows_card_4_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed font-normal">
                  {t('shows_card_4_text')}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 6. SEZIONE FUNZIONAMENTO (Tre Passaggi) */}
        <section id="funzionamento" className="py-24 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('how_tag')}</div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('how_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 relative shadow-lg text-slate-900 dark:text-white">
                <div className="text-5xl font-extrabold text-[#10b981] mb-4">01.</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('step_1_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('step_1_text')}
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 relative shadow-lg text-slate-900 dark:text-white">
                <div className="text-5xl font-extrabold text-[#10b981] mb-4">02.</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('step_2_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('step_2_text')}
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 relative shadow-lg text-slate-900 dark:text-white">
                <div className="text-5xl font-extrabold text-[#10b981] mb-4">03.</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('step_3_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  {t('step_3_text')}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 7. SEZIONE MODERAZIONE */}
        <section className="py-24 bg-slate-100 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/10">
          <div className="max-w-5xl mx-auto px-6">
            <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-xl">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('mod_tag')}</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
                {t('mod_title')}
              </h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-white/70 font-normal leading-relaxed mb-8">
                {t('mod_text')}
              </p>
              
              <div className="p-4 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 text-xs text-[#10b981] font-medium leading-relaxed flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{t('mod_tech_note')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 8. SEZIONE PRIVACY E RESPONSABILITÀ */}
        <section className="py-24 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('privacy_sec_tag')}</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('privacy_sec_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-[#10b981] shrink-0 mt-1" />
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed">{t('privacy_p1')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 flex items-start gap-4">
                <Eye className="w-6 h-6 text-[#10b981] shrink-0 mt-1" />
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed">{t('privacy_p2')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 flex items-start gap-4">
                <Ban className="w-6 h-6 text-[#10b981] shrink-0 mt-1" />
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed">{t('privacy_p3')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 flex items-start gap-4">
                <Compass className="w-6 h-6 text-[#10b981] shrink-0 mt-1" />
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed">{t('privacy_p4')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 flex items-start gap-4">
                <FileText className="w-6 h-6 text-[#10b981] shrink-0 mt-1" />
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed">{t('privacy_p5')}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 flex items-start gap-4 border-amber-500/30 bg-amber-500/5">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">{t('privacy_p6')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. SEZIONE TECNOLOGIA */}
        <section className="py-24 bg-slate-100 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('tech_tag')}</div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('tech_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-lg">
                <Map className="w-8 h-8 text-[#10b981] mb-6" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('tech_1_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">{t('tech_1_text')}</p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-lg">
                <BellRing className="w-8 h-8 text-[#10b981] mb-6" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('tech_2_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">{t('tech_2_text')}</p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-lg">
                <Layers className="w-8 h-8 text-[#10b981] mb-6" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('tech_3_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">{t('tech_3_text')}</p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 shadow-lg">
                <Users className="w-8 h-8 text-[#10b981] mb-6" />
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{t('tech_4_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">{t('tech_4_text')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. SEZIONE COSA SENTINEL NON È */}
        <section className="py-24 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-5xl mx-auto px-6">
            <div className="p-8 md:p-12 rounded-3xl bg-slate-900 text-white border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('isnot_tag')}</div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">
                {t('isnot_title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                  <span className="text-red-400 font-bold">✕</span> {t('isnot_p1')}
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                  <span className="text-red-400 font-bold">✕</span> {t('isnot_p2')}
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                  <span className="text-red-400 font-bold">✕</span> {t('isnot_p3')}
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                  <span className="text-red-400 font-bold">✕</span> {t('isnot_p4')}
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                  <span className="text-red-400 font-bold">✕</span> {t('isnot_p5')}
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
                  <span className="text-red-400 font-bold">✕</span> {t('isnot_p6')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. FAQ ESSENZIALI */}
        <section className="py-24 border-b border-slate-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto px-6">
            
            <div className="text-center mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">{t('faq_tag')}</div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
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

        {/* 12. FINAL CTA & DISCLAIMER */}
        <section className="py-24 bg-gradient-to-b from-slate-100 to-white dark:from-[#0a0a0a] dark:to-[#050505] border-t border-slate-200 dark:border-white/10 text-center relative overflow-hidden transition-colors">
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
              {t('final_title')}
            </h2>
            <p className="text-lg text-slate-600 dark:text-white/70 mb-10 max-w-xl mx-auto font-normal leading-relaxed">
              {t('final_sub')}
            </p>
            <Link 
              to="/Platform"
              className="inline-flex items-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-12 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
            >
              {t('final_cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="mt-12 p-4 rounded-2xl bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-white/50 text-xs font-normal leading-relaxed max-w-2xl mx-auto">
              {t('final_disclaimer')}
            </div>
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
              <div className="text-[10px] text-slate-500 dark:text-white/50">{t('sticky_verified_badge')}</div>
            </div>
          </div>

          <Link
            to="/Platform"
            className="flex items-center gap-2 bg-[#10b981] text-black px-5 py-2.5 rounded-full font-bold text-xs shadow-lg"
          >
            <Map className="w-3.5 h-3.5" />
            {t('hero_cta_primary')}
          </Link>
        </div>
      )}

      {/* MODALS */}
      <ItalyMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
      <FeatureModal featureId={activeFeature} onClose={() => setActiveFeature(null)} />
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />

    </div>
  );
}
