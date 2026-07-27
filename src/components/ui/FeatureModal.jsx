import React from 'react';
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
  karma: {
    id: 'karma',
    icon: Users,
    badge: 'Proof of Reputation System',
    title: 'Karma & Reputazione Founder',
    subtitle: 'Il primo algoritmo meritocratico che premia la veridicità ed azzera l\'allarmismo.',
    description: `Sul web tradizionale, le notizie sensazionalistiche prendono il sopravvento. Su Sentinel vige la legge della veridicità. Ogni utente accumula un punteggio Karma pubblico basato sulla precisione delle sue segnalazioni.`,
    bullets: [
      {
        title: 'Validazione Prioritaria delle Segnalazioni',
        desc: 'Le segnalazioni effettuate dagli utenti ad alto Karma (come i membri Founder con +100 Punti) saltano la coda di moderazione.'
      },
      {
        title: 'Filtro Anti-Fake News & Odio',
        desc: 'Gli utenti che inviano informazioni false o sensazionalistiche perdono Karma fino al blocco permanente dell\'account.'
      },
      {
        title: 'Badge Founder Esclusivo',
        desc: 'I primi iscritti alla piattaforma ottengono lo status di Founder permanente e il diritto di voto sulla moderazione comunitaria.'
      }
    ],
    ctaText: 'Riserva il tuo Karma Founder',
    ctaLink: '/Auth'
  }
};

export default function FeatureModal({ featureId, onClose }) {
  if (!featureId || !FEATURE_DETAILS[featureId]) return null;

  const data = FEATURE_DETAILS[featureId];
  const IconComponent = data.icon;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 font-sans overflow-y-auto"
        style={{ fontFamily: "'Funnel Display', sans-serif" }}
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-xl max-h-[85vh] my-auto bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/15 rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/15 blur-[100px] rounded-full pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full flex items-center justify-center text-slate-900 dark:text-white transition-colors border border-slate-200 dark:border-white/10 z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Area */}
          <div className="shrink-0 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[11px] font-bold text-[#10b981] mb-4">
              <Activity className="w-3 h-3 animate-pulse" />
              {data.badge}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] flex-shrink-0">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{data.title}</h2>
                <p className="text-xs text-slate-500 dark:text-white/60 font-normal leading-snug">{data.subtitle}</p>
              </div>
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
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] flex-shrink-0 mt-0.5">
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
