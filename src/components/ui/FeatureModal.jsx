import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Map, BellRing, Users, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const FEATURE_DETAILS = {
  mappa: {
    id: 'mappa',
    icon: Map,
    badge: '3D Spatial Mapping Engine',
    title: 'La Mappa Viva',
    subtitle: 'La prima vista 3D urbana vettoriale ad altissima fedeltà per dominare il territorio.',
    description: `Dimentica le mappe statiche bidimensionali e i bollettini radiofonici obsoleti. La Mappa Viva di Sentinel trasforma il tessuto urbano di Milano e delle principali metropoli in un modello vettoriale 3D ad altissimo dettaglio.`,
    bullets: [
      {
        title: 'Rendering Vettoriale Extruso 3D',
        desc: 'Visualizzazione tridimensionale di palazzi, vie e ostacoli urbani con prospettiva reale per orientarsi all\'istante anche di notte.'
      },
      {
        title: 'Aggiornamento Live a Zero Latenza',
        desc: 'Gli incidenti elaborati dall\'IA istituzionale e confermati dai cittadini appaiono sul tuo schermo entro 15 secondi dall\'evento.'
      },
      {
        title: 'Geolocalizzazione Differenziale',
        desc: 'Calcolo millimetrico della tua distanza dagli allarmi attivi con raggio di sicurezza visivo e vettori di pericolo.'
      }
    ],
    ctaText: 'Entra e Sblocca la Mappa',
    ctaLink: '/Auth'
  },
  allerte: {
    id: 'allerte',
    icon: BellRing,
    badge: 'Proactive Geofencing System',
    title: 'Allerte Preventive',
    subtitle: 'Un radar personale in tasca che intercetta i pericoli prima che intacchino la tua routine.',
    description: `Non vogliamo sommergerti di notifiche inutili dall'altra parte della città. Sentinel utilizza un sistema proprietario di Geofencing intelligente che valuta la tua posizione ed il tuo raggio di percorrenza.`,
    bullets: [
      {
        title: 'Notifiche Chirurgiche Geolocalizzate',
        desc: 'Ricevi allarmi sonori e visivi prioritari solo se un incidente, un blocco stradale o una minaccia interseca il tuo percorso.'
      },
      {
        title: 'Anticipo dei Blocchi & Traffico Critico',
        desc: 'Pianifica le tue uscite evitando cortei, deviazioni delle forze dell\'ordine, incidenti e zone di tensione con largo anticipo.'
      },
      {
        title: 'Safety Check in 1-Tap',
        desc: 'In caso di calamità o grandi emergenze, rassicura istantaneamente i tuoi cari e la rete con la modalità "Sono al Sicuro".'
      }
    ],
    ctaText: 'Attiva Notifiche Live',
    ctaLink: '/Auth'
  },
  community: {
    id: 'community',
    icon: Users,
    badge: 'Verified Crowd-Verification Network',
    title: 'Rete Partecipata',
    subtitle: 'La forza del vicinato unita ad algoritmi di moderazione etica e prevenzione allarmismi.',
    description: `La sicurezza collettiva non si costruisce sulle voci di corridoio o sui social network. Sentinel combina le segnalazioni verificate dei cittadini sul campo con un motore di validazione etica in tempo reale.`,
    bullets: [
      {
        title: 'Karma & Punteggio di Affidabilità',
        desc: 'Ogni utente guadagna reputazione inviando informazioni precise. Le fake news ed i falsi allarmi vengono neutralizzati all\'origine.'
      },
      {
        title: 'Zero Profilazione o Discriminazione',
        desc: 'Filtri automatici rigidi rimuovono qualsiasi riferimento etnico o discriminatorio. Solo fatti oggettivi e verificabili: cosa, dove e quando.'
      },
      {
        title: 'Sinergia Istituzionale & Notizie Locali',
        desc: 'Le segnalazioni dei cittadini si integrano fluidamente con le notizie giornaliere TG Verona, INGV e bollettini della Protezione Civile.'
      }
    ],
    ctaText: 'Partecipa alla Community',
    ctaLink: '/Auth'
  }
};

export default function FeatureModal({ featureId, onClose }) {
  // ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && featureId) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [featureId, onClose]);

  if (!featureId || !FEATURE_DETAILS[featureId]) return null;

  const data = FEATURE_DETAILS[featureId];
  const IconComponent = data.icon;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center pt-20 pb-6 px-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 font-sans select-none"
        style={{ fontFamily: "'Funnel Display', sans-serif" }}
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-xl max-h-[82vh] my-auto overflow-y-auto bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-white/15 rounded-[2.2rem] p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#10b981]/15 blur-[100px] pointer-events-none" />

          {/* Clear, Visible, Touch-Friendly Close Button "X" (Top-Right) */}
          <button
            onClick={onClose}
            type="button"
            aria-label="Chiudi dettagli funzionalità"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-full flex items-center justify-center border border-slate-300 dark:border-white/20 shadow-md transition-all active:scale-90 z-30"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-4 pr-10">
            <div className="w-12 h-12 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shrink-0 shadow-lg">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#10b981] bg-[#10b981]/10 px-2.5 py-0.5 rounded-full border border-[#10b981]/20 inline-block mb-1">
                {data.badge}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{data.title}</h2>
              <p className="text-xs text-slate-500 dark:text-white/60 font-normal leading-snug">{data.subtitle}</p>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-4 text-xs font-normal text-slate-600 dark:text-white/70">
            <p className="leading-relaxed border-b border-slate-200 dark:border-white/10 pb-4">
              {data.description}
            </p>

            <div className="space-y-3 pt-1">
              {data.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white">
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{bullet.title}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-white/60 leading-relaxed font-normal">{bullet.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed Footer CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10 mt-2">
            <div className="text-[11px] text-slate-500 dark:text-white/40 font-normal text-center sm:text-left">
              🔒 Accesso immediato al network.
            </div>
            <Link
              to={data.ctaLink}
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black px-6 py-3 rounded-full font-bold text-xs transition-all hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
            >
              {data.ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
}
