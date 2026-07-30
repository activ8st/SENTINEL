import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Map, BellRing, Users, ArrowRight, Lock, Download, Compass, 
  Moon, Globe, Building2, ShieldAlert, Filter, CheckCircle2, Hand, Navigation, HeartHandshake
} from 'lucide-react';
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
      ? "Sentinel — Sicurezza partecipata e controllo del vicinato in tempo reale" 
      : "Sentinel — Real-Time Neighborhood Control & Verified Safety";

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
                  <span>SICUREZZA PARTECIPATA & CONTROLLO DEL VICINATO</span>
                </div>

                {/* H1 Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-[66px] leading-[1.05] font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
                  La prima piattaforma italiana di <br className="hidden sm:inline" />
                  <span className="text-[#10b981]">sicurezza partecipata e controllo del vicinato in tempo reale.</span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 mb-10 max-w-xl leading-relaxed font-normal">
                  Non vendiamo "sicurezza generica". Sentinel offre <strong className="text-slate-900 dark:text-white">controllo urbano real-time, iper-localizzazione ed azione comunitaria strutturata</strong> prima che tu debba chiederlo.
                </p>
                
                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => handleOpenWaitlist('hero_primary')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-9 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  >
                    <Download className="w-5 h-5" />
                    <span>Unisciti alla Lista d'Attesa</span>
                  </button>

                  <a 
                    href="#dimostrazione-prodotto"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white px-8 py-4 rounded-full font-bold text-lg transition-colors border border-slate-300 dark:border-white/10 backdrop-blur-md"
                  >
                    <span>Scopri il Prodotto</span>
                  </a>
                </div>

                {/* Trust Badge */}
                <div className="mt-10 flex items-center gap-3 text-xs text-slate-500 dark:text-white/50 font-medium">
                  <Lock className="w-4 h-4 text-[#10b981]" />
                  <span>100% Conforme GDPR UE · Dati Cifrati · Nessuna Profilazione</span>
                </div>

              </div>

              {/* Right Column: Dual iPhone Hero Mockup */}
              <div className="w-full flex justify-center lg:justify-end">
                <DualIPhoneHeroMockup onOpenWaitlist={() => handleOpenWaitlist('hero_mockup')} />
              </div>

            </div>
          </div>
        </section>

        {/* 3. STAT BAR */}
        <section className="py-10 border-y border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold mb-1 text-slate-900 dark:text-white">100%</div>
              <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">Verificato GDPR</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#10b981] mb-1">&lt; 3 Sec</div>
              <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">Notifiche Geofenced</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold mb-1 text-slate-900 dark:text-white">24/7</div>
              <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">Monitoraggio Fonti Ufficiali</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#10b981] mb-1">0%</div>
              <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest font-bold">Generalizzazioni o Fake News</div>
            </div>
          </div>
        </section>

        {/* 4. DIMOSTRAZIONE PRODOTTO & PILASTRI DI AFFIDABILITÀ (6 GRID CARDS) */}
        <section id="dimostrazione-prodotto" className="py-28 relative border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">TECNOLOGIA & AFFIDABILITÀ</div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Perché fidarsi di Sentinel <br/>
                  <span className="text-[#10b981]">L'alternativa etica e controllata</span>
                </h2>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(true)}
                className="inline-flex items-center gap-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-gray-200 text-white dark:text-black px-7 py-3.5 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-md"
              >
                <span>Mappa Interattiva Italia</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 6 High-Impact Trust & Product Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div 
                onClick={() => setActiveFeature('mappa')}
                className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl group cursor-pointer text-slate-900 dark:text-white"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6 group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Mappe 3D & Radar Iper-Locale</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed mb-4">
                  Visualizza istantaneamente gli eventi verificati attorno alla tua posizione con raggio d'azione regolabile in tempo reale.
                </p>
              </div>

              {/* Feature 2 */}
              <div 
                onClick={() => setActiveFeature('allerte')}
                className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl group cursor-pointer text-slate-900 dark:text-white"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6 group-hover:scale-110 transition-transform">
                  <BellRing className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Allerte Preventive Geofenced</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed mb-4">
                  Ricevi notifiche istantanee quando entri o ti avvicini ad una zona con eventi critici o viabilità bloccata.
                </p>
              </div>

              {/* Feature 3 */}
              <div 
                onClick={() => setActiveFeature('karma')}
                className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl group cursor-pointer text-slate-900 dark:text-white"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Controllo Vicinato & Karma</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed mb-4">
                  La community partecipa alla verifica degli allarmi tramite un sistema di reputazione (Karma) che isola i falsi allarmi.
                </p>
              </div>

              {/* Feature 4 — Anti-Discriminazione */}
              <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl text-slate-900 dark:text-white">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-[#10b981] mb-6">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Filtro Anti-Discriminazione</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  Ogni segnalazione passa un controllo prima di diventare pubblica. Zero generalizzazioni su zone o persone — solo fatti verificabili.
                </p>
              </div>

              {/* Feature 5 — Fonti Ufficiali Reali */}
              <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl text-slate-900 dark:text-white">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-500 mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Dati Istituzionali Reali</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  Terremoti, allerte meteo, viabilità integrati direttamente da INGV, Protezione Civile ed enti ufficiali, non inventati da un bot.
                </p>
              </div>

              {/* Feature 6 — Zero Vigilantismo (vs Citizen) */}
              <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-[#10b981]/50 transition-all shadow-xl text-slate-900 dark:text-white">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 mb-6">
                  <Hand className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Mai Caccia All'Uomo</h3>
                <p className="text-sm text-slate-600 dark:text-white/60 font-normal leading-relaxed">
                  Nessuna taglia, nessuna identificazione pubblica di sospetti, nessun video streaming non moderato. Informazione, non giustizia fai-da-te.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* 5. SEZIONE CASI D'USO: STACKING CARDS ANIMATE (4 STACKS) */}
        <section className="py-28 bg-slate-100 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">CASI D'USO & DESTINATARI</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                A chi serve davvero Sentinel
              </h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-white/60 font-normal">
                Protezione mirata, iper-localizzata ed adatta ad ogni stile di vita urbano.
              </p>
            </div>

            {/* Stacking Cards Container */}
            <div className="stacking-cards-container">
              <ul className="cards-list">
                
                {/* STACK 1 — Genitori & Famiglie */}
                <li className="card-item bg-white dark:bg-[#111613] border border-slate-300 dark:border-[#10b981]/30 text-slate-900 dark:text-white" style={{ '--index': 1 }}>
                  <div className="card-content flex flex-col md:flex-row items-start md:items-center justify-between p-8 md:p-12 gap-8">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-full mb-4">
                        <Users className="w-4 h-4" />
                        <span>1. GENITORI & FAMIGLIE</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 dark:text-white">
                        Tranquillità sui percorsi scolastici e sul rientro dei figli.
                      </h3>
                      <p className="text-base md:text-lg text-slate-600 dark:text-white/70 font-normal leading-relaxed mb-6">
                        Monitora il perimetro del quartiere e ricevi allerte immediate in caso di disservizi nei trasporti, percorsi stradali bloccati o situazioni critiche nei pressi di scuole ed aree frequentate dai tuoi figli.
                      </p>
                      <button 
                        onClick={() => handleOpenWaitlist('stack_famiglie')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#10b981] hover:gap-3 transition-all"
                      >
                        <span>Proteggi la tua famiglia →</span>
                      </button>
                    </div>
                    <div className="w-full md:w-auto flex-shrink-0 bg-purple-500/10 border border-purple-500/20 p-8 rounded-3xl flex items-center justify-center">
                      <HeartHandshake className="w-24 h-24 text-purple-500" />
                    </div>
                  </div>
                </li>

                {/* STACK 2 — Studenti, Pendolari & Lavoratori Urbani */}
                <li className="card-item bg-white dark:bg-[#0d1418] border border-slate-300 dark:border-blue-500/30 text-slate-900 dark:text-white" style={{ '--index': 2 }}>
                  <div className="card-content flex flex-col md:flex-row items-start md:items-center justify-between p-8 md:p-12 gap-8">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full mb-4">
                        <Navigation className="w-4 h-4" />
                        <span>2. STUDENTI, PENDOLARI & LAVORATORI URBANI</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 dark:text-white">
                        Spostamenti quotidiani veloci tra stazioni e mezzi pubblici.
                      </h3>
                      <p className="text-base md:text-lg text-slate-600 dark:text-white/70 font-normal leading-relaxed mb-6">
                        Evita i nodi ferroviari bloccati, gli hub di scambio congestionati o gli scioperi non preavvisati. Sentinel ti mostra in anticipo le vie alternative più sicure per raggiungere l'università o l'ufficio.
                      </p>
                      <button 
                        onClick={() => handleOpenWaitlist('stack_pendolari')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#10b981] hover:gap-3 transition-all"
                      >
                        <span>Ottimizza i tuoi spostamenti →</span>
                      </button>
                    </div>
                    <div className="w-full md:w-auto flex-shrink-0 bg-blue-500/10 border border-blue-500/20 p-8 rounded-3xl flex items-center justify-center">
                      <Compass className="w-24 h-24 text-blue-500" />
                    </div>
                  </div>
                </li>

                {/* STACK 3 — Chi si sposta la sera / Lavoratori Notturni */}
                <li className="card-item bg-white dark:bg-[#16120b] border border-slate-300 dark:border-amber-500/30 text-slate-900 dark:text-white" style={{ '--index': 3 }}>
                  <div className="card-content flex flex-col md:flex-row items-start md:items-center justify-between p-8 md:p-12 gap-8">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full mb-4">
                        <Moon className="w-4 h-4" />
                        <span>3. CHI SI SPOSTA LA SERA / LAVORATORI NOTTURNI</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 dark:text-white">
                        Rientri serali ed orari notturni in completa tranquillità.
                      </h3>
                      <p className="text-base md:text-lg text-slate-600 dark:text-white/70 font-normal leading-relaxed mb-6">
                        Mappa le strade illuminate ed attive ed evita i tratti stradali isolati o temporaneamente chiusi durante i tuoi rientri a tarda notte o la fine dei turni di lavoro.
                      </p>
                      <button 
                        onClick={() => handleOpenWaitlist('stack_sera')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#10b981] hover:gap-3 transition-all"
                      >
                        <span>Rientra a casa sicuro →</span>
                      </button>
                    </div>
                    <div className="w-full md:w-auto flex-shrink-0 bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl flex items-center justify-center">
                      <Moon className="w-24 h-24 text-amber-500" />
                    </div>
                  </div>
                </li>

                {/* STACK 4 — Turisti & Residenti Temporanei */}
                <li className="card-item bg-white dark:bg-[#0a1812] border border-slate-300 dark:border-[#10b981]/50 text-slate-900 dark:text-white" style={{ '--index': 4 }}>
                  <div className="card-content flex flex-col md:flex-row items-start md:items-center justify-between p-8 md:p-12 gap-8">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 px-3.5 py-1.5 rounded-full mb-4">
                        <Globe className="w-4 h-4" />
                        <span>4. TURISTI & RESIDENTI TEMPORANEI</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 dark:text-white">
                        Esplorare nuove città senza zone d'ombra.
                      </h3>
                      <p className="text-base md:text-lg text-slate-600 dark:text-white/70 font-normal leading-relaxed mb-6">
                        Muoviti in città che non conosci con la stessa padronanza di un residente locale. Ricevi traduzioni automatiche delle allerte ufficiali ed evita le zone con disordini o viabilità critica.
                      </p>
                      <button 
                        onClick={() => handleOpenWaitlist('stack_turisti')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#10b981] hover:gap-3 transition-all"
                      >
                        <span>Esplora con Sentinel →</span>
                      </button>
                    </div>
                    <div className="w-full md:w-auto flex-shrink-0 bg-[#10b981]/10 border border-[#10b981]/20 p-8 rounded-3xl flex items-center justify-center">
                      <Globe className="w-24 h-24 text-[#10b981]" />
                    </div>
                  </div>
                </li>

              </ul>
            </div>

          </div>
        </section>

        {/* 6. SEZIONE FAQ */}
        <section className="py-28 relative">
          <div className="max-w-4xl mx-auto px-6">
            
            <div className="text-center mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">DOMANDE FREQUENTI</div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Tutto quello che c'è da sapere
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index}
                    className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => {
                        setOpenFaqIndex(isOpen ? null : index);
                        trackEvent('faq_toggle', { index, question: faq.question });
                      }}
                      className="w-full text-left p-6 flex items-center justify-between font-bold text-lg text-slate-900 dark:text-white hover:text-[#10b981] dark:hover:text-[#10b981] transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ArrowRight className={`w-5 h-5 text-[#10b981] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 text-slate-600 dark:text-white/70 text-sm leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 7. CTA BANNER FINALE */}
        <section className="py-24 bg-[#10b981] text-black text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Pronto a riprendere il controllo della tua città?
            </h2>
            <p className="text-lg md:text-xl text-black/80 font-medium mb-10 max-w-2xl mx-auto">
              Unisciti alla prima rete italiana di sicurezza partecipata ed iper-localizzata. 
            </p>
            <button 
              onClick={() => handleOpenWaitlist('footer_cta')}
              className="bg-black hover:bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl transition-transform hover:scale-105 inline-flex items-center gap-3"
            >
              <Download className="w-5 h-5 text-[#10b981]" />
              <span>Iscriviti Ora alla Lista d'Attesa</span>
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <GlobalFooter />

      {/* MODALS */}
      {isMapModalOpen && <ItalyMapModal onClose={() => setIsMapModalOpen(false)} />}
      {isWaitlistOpen && <WaitlistModal onClose={() => setIsWaitlistOpen(false)} />}
      {activeFeature && <FeatureModal featureKey={activeFeature} onClose={() => setActiveFeature(null)} />}

    </div>
  );
}
