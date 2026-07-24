import React from 'react';
import { Link } from 'react-router-dom';
import { X, Map, BellRing, Users, ShieldCheck, ArrowRight, Zap, CheckCircle2, Lock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
        <div 
          className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/15 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#10b981]/15 blur-[120px] rounded-full pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10 z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-xs font-bold text-[#10b981] mb-6">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            {data.badge}
          </div>

          {/* Header */}
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/25 flex items-center justify-center text-[#10b981] flex-shrink-0">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">{data.title}</h2>
              <p className="text-sm text-white/70 font-light leading-relaxed">{data.subtitle}</p>
            </div>
          </div>

          <p className="text-sm text-white/60 font-light leading-relaxed mb-8 border-b border-white/10 pb-6">
            {data.description}
          </p>

          {/* Bullet Points */}
          <div className="space-y-5 mb-10">
            {data.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{bullet.title}</h4>
                  <p className="text-xs text-white/60 font-light leading-relaxed">{bullet.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Area */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="text-xs text-white/40 font-light text-center sm:text-left">
              🔒 Accesso istantaneo alla rete di emergenza.
            </div>
            <Link
              to={data.ctaLink}
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
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
