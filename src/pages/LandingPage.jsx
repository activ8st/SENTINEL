import React, { useEffect, useState } from 'react';
import { ShieldCheck, Map, BellRing, Users, ArrowRight, Lock, Eye, ChevronDown, Download, Compass, Moon, AlertTriangle, Radio } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import ItalyMapModal from '@/components/ui/ItalyMapModal';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import FeatureModal from '@/components/ui/FeatureModal';
import WaitlistModal from '@/components/ui/WaitlistModal';
import { trackEvent, initScrollDepthTracking } from '@/lib/analytics';

export default function LandingPage() {
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
    document.title = "Sentinel — Sicurezza verificata, prima di uscire";

    // Track page view and scroll depth
    trackEvent('page_view', { page: 'LandingPage' });
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
  }, []);

  const handleOpenWaitlist = (source) => {
    trackEvent('cta_click', { button: 'download_sentinel', source });
    setIsWaitlistOpen(true);
  };

  const FAQS = [
    {
      question: "I miei dati di localizzazione sono al sicuro?",
      answer: "Assolutamente sì. Sentinel utilizza la tua posizione esclusivamente in locale sul tuo dispositivo per calcolare quali allarmi intersecano il tuo raggio di percorrenza. Nessuno storico degli spostamenti viene memorizzato nei nostri server."
    },
    {
      question: "Chi modera le segnalazioni false o spammose?",
      answer: "Ogni segnalazione inviata passa attraverso il nostro motore di moderazione automatica in 2 livelli prima di diventare pubblica. Inoltre, la community attribuisce punti Karma ai segnalatori affidabili ed elimina immediatamente i falsi allarmi."
    },
    {
      question: "L'applicazione è gratuita?",
      answer: "Sì, Sentinel è e rimarrà sempre gratuita per i cittadini. La sicurezza personale e l'informazione verificata non devono mai essere un privilegio a pagamento."
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
    <div className="relative w-full max-w-full bg-[#050505] text-[#f5f5f5] min-h-screen overflow-x-hidden font-sans selection:bg-[#10b981] selection:text-black" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Ambient Glow Orbs */}
      <div className="absolute top-[-5%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-[#10b981] opacity-10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-[35%] right-0 translate-x-1/3 w-[500px] h-[500px] bg-amber-500/10 opacity-10 blur-[180px] rounded-full pointer-events-none" />

      {/* 1. NAVBAR */}
      <MarketingNavbar onOpenWaitlist={() => handleOpenWaitlist('navbar')} />

      <main>
        {/* 2. HERO SECTION — Persona-Centrica (Zero parole su "città") */}
        <section className="relative z-10 pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Text & CTAs */}
              <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-6 duration-1000">
                
                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-xs font-semibold text-[#10b981] mb-6 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  Sicurezza verificata, non allarmismo
                </div>

                {/* H1 Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-[76px] leading-[0.98] font-bold tracking-tight mb-6 text-white">
                  Sai se è sicuro, <br className="hidden sm:inline" />
                  <span className="text-[#10b981]">prima di uscirci.</span>
                </h1>
                
                {/* Subtitle - Personal & Non-Absolute */}
                <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed font-light">
                  Sentinel ti mostra esattamente cosa c'è sulla tua strada prima che tu esca di casa — dati ufficiali, segnalazioni verificate dalla community, mai stereotipi. Per farti muovere sempre con più serenità.
                </p>
                
                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => handleOpenWaitlist('hero_primary')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-9 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_35px_rgba(16,185,129,0.35)]"
                  >
                    Scarica Sentinel
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <a 
                    href="#prova-prodotto"
                    onClick={() => trackEvent('cta_click', { button: 'hero_secondary_scroll' })}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors border border-white/10 backdrop-blur-md"
                  >
                    Guarda come funziona
                  </a>
                </div>

                {/* Trust Badge */}
                <div className="mt-10 flex items-center gap-3 text-xs text-white/50 font-light">
                  <Lock className="w-4 h-4 text-[#10b981]" />
                  <span>Gratuito · Zero profilazione dati · Fonti ufficiali verificate</span>
                </div>
              </div>

              {/* Right Column: High Quality Product Graphic */}
              <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                <div className="aspect-[4/3] sm:aspect-[4/3] lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-950 border border-white/15 relative shadow-2xl group">
                  <img 
                    src="/sentinel_hero_map.png" 
                    alt="Mappa Sentinel con segnalazioni verificate sulla rotta" 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                    fetchpriority="high"
                  />
                  
                  {/* Floating Radar Live Tag */}
                  <div className="absolute top-6 right-6 bg-[#090909]/90 border border-white/15 p-3.5 rounded-2xl backdrop-blur-xl flex items-center gap-3 shadow-xl">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
                    </span>
                    <span className="text-xs font-bold tracking-wide text-white uppercase">Allerte Live Attive</span>
                  </div>

                  {/* Overlapping Alert Card */}
                  <div className="absolute bottom-6 left-6 right-6 bg-[#0d0d0d]/90 border border-white/15 p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-[#f59e0b]/20 rounded-xl flex items-center justify-center border border-[#f59e0b]/40 shrink-0">
                        <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Lavori in Corso & Deviazione</div>
                        <div className="text-xs text-white/60">Fonte Ufficiale · A 250m dal tuo percorso</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#10b981] bg-[#10b981]/15 px-3 py-1.5 rounded-full border border-[#10b981]/30 shrink-0">
                      VERIFICATO
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. STAT BAR — Prova Oggettiva Non-Assoluta */}
        <section className="py-10 border-y border-white/10 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">&lt; 15 sec</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Tempo Elaborazione Alert</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#10b981] mb-1">Attivo</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Filtro Anti-Discriminazione</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">Verificata</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Moderazione Preventiva</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#10b981] mb-1">30+</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Fonti Ufficiali Istituzionali</div>
            </div>
          </div>
        </section>

        {/* 4. SEZIONE PERSONA — "Pensato per la tua serenità quando ti sposti" */}
        <section className="py-28 relative border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">Casi d'Uso Reali /</div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                Pensato per la tua serenità quando ti sposti
              </h2>
              <p className="text-base md:text-lg text-white/60 font-light">
                Sentinel risolve il dubbio prima che si trasformi in preoccupazione.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1 — Turista */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-8 md:p-10 hover:border-[#10b981]/40 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-[#10b981]/10 rounded-2xl flex items-center justify-center text-[#10b981] border border-[#10b981]/20 mb-6">
                    <Compass className="w-7 h-7" />
                  </div>
                  <div className="inline-block text-xs font-semibold uppercase tracking-wider text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full mb-4">
                    In viaggio in Italia?
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Non conosci la zona e non sai di chi fidarti?
                  </h3>
                  <p className="text-sm md:text-base text-white/60 font-light leading-relaxed mb-6">
                    Sentinel ti mostra gli allarmi reali sul tuo percorso nella tua lingua: quali strade evitare, cosa sta succedendo intorno a te — dati verificati dalle autorità e dai cittadini, zero voci di corridoio.
                  </p>
                </div>
                <button 
                  onClick={() => handleOpenWaitlist('persona_turista')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#10b981] group-hover:gap-3 transition-all text-left"
                >
                  Scopri la protezione per chi viaggia &rarr;
                </button>
              </div>

              {/* Card 2 — Chi si sposta la sera */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-8 md:p-10 hover:border-[#10b981]/40 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-[#f59e0b]/10 rounded-2xl flex items-center justify-center text-[#f59e0b] border border-[#f59e0b]/20 mb-6">
                    <Moon className="w-7 h-7" />
                  </div>
                  <div className="inline-block text-xs font-semibold uppercase tracking-wider text-[#f59e0b] bg-[#f59e0b]/10 px-3 py-1 rounded-full mb-4">
                    Torni a casa tardi?
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Vuoi sapere com'è la situazione sulla tua strada prima di metterti in cammino?
                  </h3>
                  <p className="text-sm md:text-base text-white/60 font-light leading-relaxed mb-6">
                    Guarda cosa è accaduto davvero sulla tua rotta prima di uscire: orari, frequenza ed eventi reali per scegliere il percorso migliore senza ansia e senza basarti su supposizioni.
                  </p>
                </div>
                <button 
                  onClick={() => handleOpenWaitlist('persona_sera')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#10b981] group-hover:gap-3 transition-all text-left"
                >
                  Scopri la funzione Rientro Sicuro &rarr;
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 5. SEZIONE DIFFERENZIAZIONE — "La tua tranquillità, protetta da dati reali e zero allarmismo" */}
        <section className="py-28 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="max-w-3xl mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">I Nostri Principi /</div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                La tua tranquillità, protetta da dati reali e zero allarmismo
              </h2>
              <p className="text-lg text-white/60 font-light leading-relaxed">
                Abbiamo progettato Sentinel ponendo l'etica e la veridicità al primo posto per eliminare il sensazionalismo e l'odio in rete.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Moderazione prima, non dopo</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  Ogni segnalazione passa un controllo prima di diventare pubblica. Nessun contenuto non verificato finisce sulla tua mappa.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] mb-6">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Filtro anti-discriminazione</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  Nessuna generalizzazione su zone o gruppi. Pubblichiamo solo fatti verificabili: cosa, quando, dove — mai chi.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] mb-6">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Fonti ufficiali, sempre citate</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  Terremoti, allerte meteo, viabilità — direttamente dalle fonti istituzionali (INGV, Protezione Civile) sul tuo schermo.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 6. PROVA PRODOTTO — Dashboard & Radar 3D */}
        <section id="prova-prodotto" className="py-28 relative border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">Dimostrazione Prodotto /</div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                  La tecnologia al servizio <br/>
                  <span className="text-[#10b981]">dei tuoi spostamenti</span>
                </h2>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(true)}
                className="inline-flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-7 py-3.5 rounded-full font-bold text-sm transition-transform hover:scale-105"
              >
                Esplora la Mappa 3D Live
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                onClick={() => setActiveFeature('mappa')}
                className="bg-[#0c0c0c] p-8 rounded-3xl border border-white/10 hover:border-[#10b981]/50 transition-all hover:bg-white/[0.04] group cursor-pointer"
              >
                <Map className="w-10 h-10 text-[#10b981] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">La Mappa Viva 3D</h3>
                <p className="text-sm text-white/60 font-light mb-6 leading-relaxed">
                  Mappe 3D dettagliate a zero latenza con visualizzazione tridimensionale dei fabbricati sul tuo tragitto.
                </p>
                <span className="text-[#10b981] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                  Scopri di più &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveFeature('allerte')}
                className="bg-[#0c0c0c] p-8 rounded-3xl border border-white/10 hover:border-[#10b981]/50 transition-all hover:bg-white/[0.04] group cursor-pointer"
              >
                <BellRing className="w-10 h-10 text-[#10b981] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Allerte Preventive</h3>
                <p className="text-sm text-white/60 font-light mb-6 leading-relaxed">
                  Radar intelligente geolocalizzato. Ricevi notifiche esclusive solo per le minacce sui tuoi percorsi quotidiani.
                </p>
                <span className="text-[#10b981] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                  Scopri di più &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveFeature('karma')}
                className="bg-[#0c0c0c] p-8 rounded-3xl border border-white/10 hover:border-[#10b981]/50 transition-all hover:bg-white/[0.04] group cursor-pointer"
              >
                <Users className="w-10 h-10 text-[#10b981] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-3">Karma & Reputazione</h3>
                <p className="text-sm text-white/60 font-light mb-6 leading-relaxed">
                  Sistema di validazione incrociata. La community vota e attribuisce punti Karma ai segnalatori autorevoli.
                </p>
                <span className="text-[#10b981] font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                  Scopri di più &rarr;
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* 7. COME FUNZIONA (3 Step) */}
        <section className="py-28 bg-[#0a0a0a] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            
            <div className="mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">Semplicità d'Uso /</div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Come funziona Sentinel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative">
                <div className="text-5xl font-bold text-[#10b981]/30 mb-4">01.</div>
                <h3 className="text-xl font-bold text-white mb-3">Apri la Mappa</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  Apri l'app in un istante. Vedi subito gli allarmi reali sulla tua strada e controlla se il tuo percorso è libero da pericoli.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative">
                <div className="text-5xl font-bold text-[#10b981]/30 mb-4">02.</div>
                <h3 className="text-xl font-bold text-white mb-3">Ricevi Alert Chirurgici</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  Anticipa ingorghi, deviazioni o eventi critici solo quando un pericolo incrocia direttamente i tuoi spostamenti.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative">
                <div className="text-5xl font-bold text-[#10b981]/30 mb-4">03.</div>
                <h3 className="text-xl font-bold text-white mb-3">Segnala in 1-Tap</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  Vedi un ostacolo? Segnalalo o rassicura chi ti aspetta con un solo tap. Il filtro verificherà il contenuto prima della pubblicazione.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 8. FAQ & OBIEZIONI REALI */}
        <section className="py-28 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-6">
            
            <div className="text-center mb-16">
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-xs mb-3">Trasparenza Totale /</div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                Domande frequenti
              </h2>
              <p className="text-base text-white/60 font-light">
                Risposte chiare ed oneste a tutti i tuoi dubbi.
              </p>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="py-6">
                  <button 
                    onClick={() => {
                      const next = openFaqIndex === idx ? null : idx;
                      setOpenFaqIndex(next);
                      trackEvent('faq_toggle', { question: faq.question, open: next !== null });
                    }}
                    className="w-full flex items-center justify-between text-left font-bold text-lg md:text-xl text-white hover:text-[#10b981] transition-colors gap-4"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-[#10b981]' : 'text-white/40'}`} />
                  </button>

                  {openFaqIndex === idx && (
                    <div className="mt-4 text-sm md:text-base text-white/70 font-light leading-relaxed animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 9. FINAL CTA — Personal & Non-Absolute */}
        <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border-t border-white/10 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              Pronto a uscire di casa sapendo cosa ti aspetta?
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto font-light leading-relaxed">
              Unisciti alla prima rete partecipata di sicurezza e informazione verificata in Italia.
            </p>
            <button 
              onClick={() => handleOpenWaitlist('final_cta')}
              className="inline-flex items-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-12 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              Scarica Sentinel
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <GlobalFooter />

      {/* STICKY MOBILE DOWNLOAD BAR */}
      {showStickyBar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0c]/95 border-t border-white/15 p-4 backdrop-blur-xl animate-in slide-in-from-bottom duration-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#10b981] flex items-center justify-center text-black font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sentinel</div>
              <div className="text-[10px] text-white/50">Sicurezza Verificata</div>
            </div>
          </div>

          <button
            onClick={() => handleOpenWaitlist('sticky_mobile_bar')}
            className="flex items-center gap-2 bg-[#10b981] text-black px-5 py-2.5 rounded-full font-bold text-xs shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Scarica Ora
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
