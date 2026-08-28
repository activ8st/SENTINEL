import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Map, BellRing, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useLanguageTheme } from '@/context/LanguageThemeContext';

export default function FeatureModal({ featureId, onClose }) {
  const { lang } = useLanguageTheme();
  const isEn = lang === 'en';

  const FEATURE_DETAILS = {
    mappa: {
      id: 'mappa',
      icon: Map,
      badge: '3D Spatial Mapping Engine',
      title: isEn ? 'The Live 3D Map' : 'La Mappa Viva 3D',
      subtitle: isEn ? 'Ultra-high fidelity vector 3D urban map for total situational awareness.' : 'La prima vista 3D urbana vettoriale ad altissima fedeltà per dominare il territorio.',
      description: isEn 
        ? 'Sentinel\'s Live Map renders urban architecture in Milano, Verona, Roma, Napoli, and Bologna in a zero-latency 3D vector model.'
        : 'Sentinel trasforma il tessuto urbano delle principali metropoli in un modello vettoriale 3D ad altissimo dettaglio.',
      bullets: [
        {
          title: isEn ? 'Extruded 3D Building Rendering' : 'Rendering Vettoriale Extruso 3D',
          desc: isEn ? 'Real 3D elevation perspective for buildings and urban obstacles to navigate with instant clarity.' : 'Visualizzazione tridimensionale di palazzi e vie con prospettiva reale per orientarsi all\'istante.'
        },
        {
          title: isEn ? 'Zero-Latency Live Feed Updates' : 'Aggiornamento Live a Zero Latenza',
          desc: isEn ? 'Institutional AI and crowd-verified incident reports stream onto your screen within seconds.' : 'Gli incidenti elaborati dalle fonti ufficiali appaiono sul tuo schermo entro pochi secondi.'
        },
        {
          title: isEn ? 'Differential Precision Geofencing' : 'Geolocalizzazione Differenziale',
          desc: isEn ? 'Millimeter-precise calculation of your distance from active threats and safety perimeters.' : 'Calcolo preciso della tua distanza dagli allarmi attivi con raggio di sicurezza visivo.'
        }
      ],
      ctaText: isEn ? 'Explore Live Map' : 'Esplora Mappa Live',
      ctaLink: '/MapView'
    },
    allerte: {
      id: 'allerte',
      icon: BellRing,
      badge: 'Proactive Geofencing System',
      title: isEn ? 'Preventive Precision Radar' : 'Allerte Preventive',
      subtitle: isEn ? 'A personal safety radar intercepting hazards before they disrupt your day.' : 'Un radar personale in tasca che intercetta i pericoli prima che intacchino la tua routine.',
      description: isEn
        ? 'Sentinel uses smart geofencing algorithms that monitor active threats along your personal daily route.'
        : 'Sentinel utilizza un sistema proprietario di Geofencing intelligente che valuta la tua posizione ed il tuo raggio di percorrenza.',
      bullets: [
        {
          title: isEn ? 'Targeted Geofenced Notifications' : 'Notifiche Chirurgiche Geolocalizzate',
          desc: isEn ? 'Receive priority alerts only when an incident or hazard directly crosses your travel path.' : 'Ricevi allarmi prioritari solo se un incidente o blocco stradale interseca il tuo percorso.'
        },
        {
          title: isEn ? 'Traffic & Roadblock Anticipation' : 'Anticipo dei Blocchi & Traffico',
          desc: isEn ? 'Plan routes avoiding traffic jams, police detours, and critical urban bottlenecks in advance.' : 'Pianifica le tue uscite evitando deviazioni delle forze dell\'ordine ed incidenti in anticipo.'
        },
        {
          title: isEn ? '1-Tap Safety Reassurance' : 'Safety Check in 1-Tap',
          desc: isEn ? 'Instantly reassure loved ones and your network during major urban emergencies.' : 'In caso di grandi emergenze, rassicura istantaneamente i tuoi cari e la rete.'
        }
      ],
      ctaText: isEn ? 'Open Safety Feed' : 'Apri Feed Sicurezza',
      ctaLink: '/Home'
    },
    community: {
      id: 'community',
      icon: Users,
      badge: 'Verified Crowd-Verification Network',
      title: isEn ? 'Karma & Founder Reputation' : 'Rete Partecipata & Karma',
      subtitle: isEn ? 'Neighborhood watch power combined with preventive moderation algorithms.' : 'La forza del vicinato unita ad algoritmi di moderazione etica e prevenzione allarmismi.',
      description: isEn
        ? 'Sentinel pairs crowd-verified citizen reporting with an automated ethics moderation engine.'
        : 'Sentinel combina le segnalazioni verificate dei cittadini sul campo con un motore di validazione etica in tempo reale.',
      bullets: [
        {
          title: isEn ? 'Karma Contributor Score' : 'Karma & Punteggio di Affidabilità',
          desc: isEn ? 'Contributors build trust scores through accurate reports. Unverified rumors are filtered out.' : 'Ogni utente guadagna reputazione inviando informazioni precise. I falsi allarmi vengono neutralizzati.'
        },
        {
          title: isEn ? 'Zero Profiling or Bias' : 'Zero Profilazione o Discriminazione',
          desc: isEn ? 'Strict automated filters remove generalizations. Objective, verified facts only: what, where, and when.' : 'Filtri automatici rigidi rimuovono qualsiasi riferimento discriminatorio. Solo fatti verificabili.'
        },
        {
          title: isEn ? 'Official Institutional Synergy' : 'Sinergia Istituzionale',
          desc: isEn ? 'Community reports stream alongside INGV earthquake data, Civil Protection, and verified news feeds.' : 'Le segnalazioni si integrano fluidamente con le notizie ufficiali INGV e Protezione Civile.'
        }
      ],
      ctaText: isEn ? 'Join Community Network' : 'Partecipa alla Community',
      ctaLink: '/Home'
    }
  };

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

          {/* Close Button "X" */}
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
              🔒 {isEn ? 'Instant network access.' : 'Accesso immediato al network.'}
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
