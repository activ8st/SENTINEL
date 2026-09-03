// Shared mock data — used by Feed, Map, Alerts, Incident Detail
import { ShieldAlert, Flame, Car, Activity, Eye, TrafficCone, CloudLightning, Info } from 'lucide-react';

const mins = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

export const MOCK_INCIDENTS = [
  // --- MILAN INCIDENTS (MATCHING THE MAP & MARKETING DEMO) ---
  {
    id: 'inc-m1',
    title: 'Lavori Stradali & Deviazione – Via Dante',
    description: 'Lavori stradali urgenti per ripristino rete fognaria. Deviazione attiva su 2 corsie. Rallentamenti in direzione Piazza Duomo.',
    type: 'traffic',
    severity: 'medium',
    status: 'active',
    latitude: 45.4665,
    longitude: 9.1865,
    address: 'Via Dante 14',
    city: 'Milano',
    is_live: true,
    viewers_count: 312,
    reports_count: 24,
    created_date: mins(5),
  },
  {
    id: 'inc-m2',
    title: 'Intervento Protezione Civile – Piazza Duomo',
    description: 'Bollettino meteo allerta gialla per forte vento. Squadre di Protezione Civile sul posto per monitoraggio strutture.',
    type: 'weather',
    severity: 'low',
    status: 'active',
    latitude: 45.4642,
    longitude: 9.1900,
    address: 'Piazza Duomo',
    city: 'Milano',
    is_live: true,
    viewers_count: 540,
    reports_count: 42,
    created_date: mins(12),
  },
  {
    id: 'inc-m3',
    title: 'Tamponamento – Corso Buenos Aires',
    description: 'Coinvolte due autovetture nei pressi di Porta Venezia. Corsia destra bloccata, polizia locale sul posto.',
    type: 'accident',
    severity: 'high',
    status: 'active',
    latitude: 45.4740,
    longitude: 9.2050,
    address: 'Corso Buenos Aires 45',
    city: 'Milano',
    is_live: false,
    viewers_count: 188,
    reports_count: 15,
    created_date: mins(18),
  },
  {
    id: 'inc-m4',
    title: 'Fumo sospetto – Zona Porta Nuova',
    description: 'Segnalata colonna di fumo dal cantiere nei pressi di Piazza Gae Aulenti. Vigili del Fuoco in arrivo.',
    type: 'fire',
    severity: 'critical',
    status: 'active',
    latitude: 45.4839,
    longitude: 9.1899,
    address: 'Piazza Gae Aulenti',
    city: 'Milano',
    is_live: true,
    viewers_count: 620,
    reports_count: 38,
    created_date: mins(8),
  },
  {
    id: 'inc-m5',
    title: 'Intervento Medico d\'Emergenza – Stazione Centrale',
    description: 'Ambulanza 118 sul posto di fronte all\'ingresso principale per malore di un passeggero. Nessun disagio alla circolazione dei treni.',
    type: 'medical',
    severity: 'medium',
    status: 'monitoring',
    latitude: 45.4850,
    longitude: 9.2040,
    address: 'Piazza Duca d\'Aosta',
    city: 'Milano',
    is_live: false,
    viewers_count: 95,
    reports_count: 9,
    created_date: mins(25),
  },
  {
    id: 'inc-m6',
    title: 'Borseggi Confermato – Metro Cordusio',
    description: 'Segnalato gruppo sospetto all\'ingresso della metropolitana. Presidio delle forze dell\'ordine in aumento.',
    type: 'crime',
    severity: 'high',
    status: 'active',
    latitude: 45.4655,
    longitude: 9.1860,
    address: 'Piazza Cordusio',
    city: 'Milano',
    is_live: false,
    viewers_count: 240,
    reports_count: 19,
    created_date: mins(30),
  },
  {
    id: 'inc-m7',
    title: 'Allagamento Temporaneo – Zona Navigli',
    description: 'Forte acquazzone causa accumulo d\'acqua in Via Ripa di Porta Ticinese. Sconsigliato il transito ai pedoni.',
    type: 'weather',
    severity: 'medium',
    status: 'active',
    latitude: 45.4515,
    longitude: 9.1760,
    address: 'Ripa di Porta Ticinese',
    city: 'Milano',
    is_live: false,
    viewers_count: 310,
    reports_count: 27,
    created_date: mins(40),
  },
  {
    id: 'inc-m8',
    title: 'Manovre di Sicurezza – Stadio San Siro',
    description: 'Controlli perimetrali in vista del match serale. Traffico rallentato lungo le vie d\'accesso.',
    type: 'traffic',
    severity: 'low',
    status: 'active',
    latitude: 45.4780,
    longitude: 9.1240,
    address: 'Piazzale Angelo Moratti',
    city: 'Milano',
    is_live: false,
    viewers_count: 480,
    reports_count: 51,
    created_date: mins(50),
  },

  // --- ROME INCIDENTS ---
  {
    id: 'inc-001',
    title: 'Incendio in appartamento – Via Tiburtina',
    description: 'Fiamme visibili al terzo piano di un edificio residenziale. I vigili del fuoco sono intervenuti, area circostante temporaneamente chiusa al traffico.',
    type: 'fire',
    severity: 'high',
    status: 'active',
    latitude: 41.9109,
    longitude: 12.5150,
    address: 'Via Tiburtina 234',
    city: 'Roma',
    is_live: true,
    viewers_count: 156,
    reports_count: 12,
    created_date: mins(8),
  },
  {
    id: 'inc-002',
    title: 'Rapina a mano armata – Farmacia Appia',
    description: 'Due individui con cappucci hanno rapinato la farmacia. Un passante ha chiamato il 112. Polizia arrivata sul posto in 4 minuti.',
    type: 'crime',
    severity: 'critical',
    status: 'active',
    latitude: 41.8919,
    longitude: 12.5113,
    address: 'Via Appia Nuova 89',
    city: 'Roma',
    is_live: false,
    viewers_count: 234,
    reports_count: 8,
    created_date: mins(15),
  },
  {
    id: 'inc-003',
    title: 'Tamponamento multiplo – Viale Aventino',
    description: 'Coinvolti 4 veicoli, traffico bloccato in direzione centro. Ambulanze sul posto, nessun ferito grave.',
    type: 'accident',
    severity: 'medium',
    status: 'active',
    latitude: 41.8842,
    longitude: 12.4944,
    address: 'Viale Aventino',
    city: 'Roma',
    is_live: false,
    viewers_count: 87,
    reports_count: 23,
    created_date: mins(22),
  },
  {
    id: 'inc-004',
    title: 'Malore grave – Stazione Termini',
    description: 'Uomo di circa 65 anni trovato a terra nei pressi del binario 5. Il 118 è intervenuto prontamente.',
    type: 'medical',
    severity: 'high',
    status: 'monitoring',
    latitude: 41.9001,
    longitude: 12.5028,
    address: 'Stazione Termini',
    city: 'Roma',
    is_live: false,
    viewers_count: 45,
    reports_count: 5,
    created_date: mins(35),
  }
];

export const TYPE_CONFIG = {
  crime:      { label: 'Crimini',              icon: '🚨', emoji: '🚨', bg: 'bg-red-500/10',    border: 'border-red-500',    text: 'text-red-500' },
  fire:       { label: 'Incendi',              icon: '🔥', emoji: '🔥', bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-500' },
  accident:   { label: 'Incidenti stradali',   icon: '🚗', emoji: '🚗', bg: 'bg-amber-500/10',  border: 'border-amber-500',  text: 'text-amber-500' },
  medical:    { label: 'Emergenze mediche',    icon: '🏥', emoji: '🏥', bg: 'bg-rose-500/10',   border: 'border-rose-500',   text: 'text-rose-500' },
  suspicious: { label: 'Attività sospette',    icon: '👁️', emoji: '👁️', bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-500' },
  traffic:    { label: 'Traffico & Blocchi',   icon: '🚦', emoji: '🚦', bg: 'bg-emerald-500/10',border: 'border-emerald-500',text: 'text-emerald-500' },
  weather:    { label: 'Allerta Meteo',        icon: '⛈️', emoji: '⛈️', bg: 'bg-blue-500/10',   border: 'border-blue-500',   text: 'text-blue-500' },
  other:      { label: 'Altro',                icon: '⚠️', emoji: '⚠️', bg: 'bg-slate-500/10',  border: 'border-slate-500',  text: 'text-slate-500' },
};

export const normalizeIncidentType = (type) => type === 'altro' ? 'other' : type;

export const SEVERITY_CONFIG = {
  critical: { label: 'Critico', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  high:     { label: 'Alto',    bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  medium:   { label: 'Medio',   bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
  low:      { label: 'Basso',   bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' },
};

export const STATUS_CONFIG = {
  active:     { label: 'Attivo',     bg: 'bg-red-500/15 text-red-500 border-red-500/30' },
  monitoring: { label: 'In Monitor', bg: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  resolved:   { label: 'Risolto',    bg: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
};

export const getIncidentById = (id) => {
  return MOCK_INCIDENTS.find(inc => String(inc.id) === String(id)) || MOCK_INCIDENTS[0];
};

export const calcDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
