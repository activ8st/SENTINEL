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
    ctaText: 'Attiva le Allerte sulla tua Zona',
    ctaLink: '/Auth'
  },
  karma: {
    id: 'karma',
    icon: Users,
    badge: 'Crowdsourced Trust & Integrity',
    title: 'Karma & Affidabilità',
    subtitle: 'L\'intelligenza collettiva schermata da una moderazione automatica a 2 livelli.',
    description: `Il crowdsourcing funziona solo se protetto dalla verità. Sentinel combina un motore di moderazione algoritmica preventiva con un sistema di reputazione (Karma) distribuito tra i cittadini.`,
    bullets: [
      {
        title: 'Filtro Anti-Discrimine & Moderazione 2-Step',
        desc: 'L\'algoritmo intercetta e blocca all\'origine tentativi di spamm, fake news o generalizzazioni discriminatorie prima che raggiungano la mappa.'
      },
      {
        title: 'Reputazione Evolutiva (Tiers Karma)',
        desc: 'Da "Nuovo" fino a "Guardiano della Città". Ogni segnalazione corretta e confermata dalla community ti fa salire di grado regalando maggior peso ai tuoi allarmi.'
      },
      {
        title: 'Autoprotezione della Community',
        desc: 'Sistema di upvote e downvote incrociato che isola e neutralizza i falsi allarmi in tempo reale senza bisogno di censura manuale.'
      }
    ],
    ctaText: 'Diventa un Guardiano della Città',
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
          className="relative w-full max-w-xl max-h-[85vh] my-auto bg-[#0d0d0d] border border-white/15 rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-hidden text-white flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/15 blur-[100px] rounded-full pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10 z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Area */}
          <div className="shrink-0 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[11px] font-bold text-[#10b981] mb-4">
              <Activity className="w-3 h-3 animate-pulse" />
              {data.badge}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 border border-[#10b981]/25 flex items-center justify-center text-[#10b981] flex-shrink-0">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{data.title}</h2>
                <p className="text-xs text-white/60 font-light leading-snug">{data.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-4 text-xs font-light text-white/70">
            <p className="leading-relaxed border-b border-white/10 pb-4">
              {data.description}
            </p>

            <div className="space-y-3 pt-1">
              {data.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">{bullet.title}</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-light">{bullet.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed Footer CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 mt-2">
            <div className="text-[11px] text-white/40 font-light text-center sm:text-left">
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
