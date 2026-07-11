import { db } from '@/lib/db';
import React, { useState, useEffect, lazy, Suspense } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getIncidentById, TYPE_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '@/components/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Share2, MapPin, Clock, Users, Send,
  Navigation, Phone, CheckCircle2, Bell, BellOff, ChevronDown, ChevronUp,
  ShieldCheck, ExternalLink
} from 'lucide-react';
import VoteButtons from '@/components/incidents/VoteButtons';
import { ReliabilityBadge } from '@/components/data/reliability';

const IncidentMap = lazy(() => import('@/components/incidents/IncidentMap'));

// Mock timeline updates
const generateTimeline = (incident) => [
  { time: incident.created_date, text: 'Incidente segnalato per la prima volta.', official: false },
  ...(incident.reports_count > 3 ? [{ time: new Date(new Date(incident.created_date).getTime() + 5 * 60000).toISOString(), text: `${incident.reports_count} utenti hanno confermato l'incidente.`, official: true }] : []),
  ...(incident.status === 'monitoring' ? [{ time: new Date(new Date(incident.created_date).getTime() + 15 * 60000).toISOString(), text: 'Le autorità competenti sono state allertate e stanno monitorando la situazione.', official: true }] : []),
  ...(incident.status === 'resolved' ? [{ time: new Date(new Date(incident.created_date).getTime() + 30 * 60000).toISOString(), text: 'Situazione risolta. Non ci sono più pericoli per la cittadinanza.', official: true }] : []),
];

export default function IncidentDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get('id');

  const [newComment, setNewComment] = useState('');
  const [isSafe, setIsSafe] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/api/incidents/${incidentId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!incidentId
  });

  useEffect(() => {
    if (incidentId) {
      db.readStatus.put({ incidentId, timestamp: Date.now() });
    }
  }, [incidentId]);

  // isLoading is provided by useQuery

  const comments = useLiveQuery(
    () => db.comments.where({ incident_id: incidentId }).reverse().sortBy('created_date'),
    [incidentId]
  ) || [];

  const addCommentMutation = {
    mutate: async (content) => {
      try {
        await db.comments.add({
          incident_id: incidentId,
          content,
          created_date: new Date().toISOString()
        });
        setNewComment('');
      } catch (err) {
        toast.error('Errore nell\'invio del commento');
      }
    },
    isPending: false
  };

  const handleShare = async () => {
    const text = `🚨 ${incident.title}\n📍 ${incident.address}\n\nVia Sentinel App`;
    if (navigator.share) {
      await navigator.share({ title: incident.title, text, url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => toast.success('Copiato negli appunti!'));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Copiato negli appunti!');
      } catch (err) {
        toast.error('Impossibile copiare il link');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSafe = () => {
    setIsSafe(true);
    toast.success('Segnalato come "Sono al sicuro" ✓', { duration: 3000 });
  };

  const handleFollow = () => {
    setFollowing(f => !f);
    toast(following ? 'Non stai più seguendo questo incidente' : 'Seguirai gli aggiornamenti di questo incidente');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Caricamento incidente...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-900 dark:text-white font-semibold">Incidente non trovato</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna indietro
        </Button>
      </div>
    );
  }

  const type = TYPE_CONFIG[incident.type] || TYPE_CONFIG.other;
  const severity = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.medium;
  const status = STATUS_CONFIG[incident.status] || STATUS_CONFIG.active;
  const timeline = generateTimeline(incident);
  const sectionCard = 'rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 shadow-sm';
  const sourceLinks = Array.isArray(incident.media_urls) ? incident.media_urls.filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-transparent pb-8" role="main" aria-labelledby="incident-title">
      {/* Topbar — fuori dalla mappa, sempre visibile sopra tutto */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <button
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white rounded-full px-4 py-2 text-sm font-semibold shadow active:scale-95 transition-transform"
          onClick={() => navigate(-1)}
          aria-label="Torna alla pagina precedente"
        >
          <ArrowLeft className="w-4 h-4" />
          Indietro
        </button>
        <div className="flex items-center gap-2">
          {incident.is_live && (
            <Badge className="bg-red-600 text-white animate-pulse">🔴 LIVE</Badge>
          )}
          <button
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white rounded-full px-4 py-2 text-sm font-semibold shadow active:scale-95 transition-transform"
            onClick={handleShare}
            aria-label="Condividi incidente"
          >
            <Share2 className="w-4 h-4" />
            Condividi
          </button>
        </div>
      </div>

      {/* Map area */}
      <div className="relative h-48 overflow-hidden bg-gray-800">
        <Suspense fallback={<div className="w-full h-full bg-gray-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <IncidentMap
            incidents={[incident]}
            center={[incident.latitude, incident.longitude]}
            zoom={15}
            height="100%"
            onIncidentClick={() => {}}
          />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-4 rounded-t-[28px] bg-white dark:bg-gray-950 px-4 pt-5 shadow-[0_-12px_30px_rgba(0,0,0,0.35)]">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${type.bg} ${type.text}`}>
            {type.emoji} {type.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${status.text}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot} ${incident.status === 'active' ? 'animate-pulse' : ''}`} />
            {status.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 ${severity.text}`}>
            {severity.label}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight" id="incident-title">{incident.title}</h1>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{incident.address || incident.city}</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatDistanceToNow(new Date(incident.created_date), { addSuffix: true, locale: it })}
          </span>
          {incident.reports_count > 1 && (
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />{incident.reports_count} segnalazioni
            </span>
          )}
        </div>

        {incident.description && (
          <div className={`${sectionCard} p-4 mb-4`}>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{incident.description}</p>
          </div>
        )}

        {sourceLinks.length > 0 && (
          <div className={`${sectionCard} p-4 mb-4`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Fonte e documenti</span>
              {incident.source && (
                <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                  {incident.source}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {sourceLinks.map((url, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:border-orange-500/50"
                >
                  <span className="truncate">{index === 0 ? 'Apri notizia originale' : `Documento ${index + 1}`}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 text-orange-500" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons — all functional */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            className={`${isSafe ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
            onClick={handleSafe}
            disabled={isSafe}
            aria-label={isSafe ? 'Hai già segnalato di essere al sicuro' : 'Segnala che sei al sicuro'}
            aria-pressed={isSafe}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
            {isSafe ? 'Al sicuro ✓' : 'Sono al sicuro'}
          </Button>
          <Button
            variant={following ? 'default' : 'outline'}
            className={following
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'border-gray-700 text-gray-300 hover:text-white'
            }
            onClick={handleFollow}
            aria-label={following ? 'Smetti di seguire questo incidente' : 'Segui questo incidente per ricevere aggiornamenti'}
            aria-pressed={following}
          >
            {following ? <BellOff className="w-4 h-4 mr-2" aria-hidden="true" /> : <Bell className="w-4 h-4 mr-2" aria-hidden="true" />}
            {following ? 'Non seguire' : 'Segui'}
          </Button>
          <Link
            to={createPageUrl('MapView') + `?routeTo=${incident.latitude},${incident.longitude}&incidentId=${incident.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-700 text-gray-300 hover:text-white text-sm font-medium h-9 px-4 py-2 transition-colors"
            aria-label={`Ottieni indicazioni stradali per ${incident.address || incident.city}`}
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            Indicazioni
          </Link>
          <Button
            variant="outline"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            onClick={() => window.open('tel:112')}
            aria-label="Chiama il numero di emergenza 112"
          >
            <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
            Chiama 112
          </Button>
        </div>

        {/* Verifica community — upvote/downvote */}
        <div className={`${sectionCard} p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-orange-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Verifica community</span>
            {incident.reported_by_id && (
              <span className="ml-auto">
                <ReliabilityBadge karma={incident.reporter_karma ?? 0} compact />
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Sei nelle vicinanze? Conferma se lo vedi anche tu o segnala un falso allarme.
          </p>
          <VoteButtons incident={incident} />
        </div>

        {/* Timeline */}
        <div className={`${sectionCard} p-4`}>
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => setShowTimeline(s => !s)}
            aria-expanded={showTimeline}
            aria-controls="timeline-content"
            aria-label={showTimeline ? 'Comprimi timeline aggiornamenti' : 'Espandi timeline aggiornamenti'}
          >
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Timeline aggiornamenti</span>
            {showTimeline ? <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />}
          </button>
          <AnimatePresence>
            {showTimeline && (
              <motion.div
                id="timeline-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pl-4 border-l-2 border-gray-700">
                  {timeline.map((item, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-900 top-0.5" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        {formatDistanceToNow(new Date(item.time), { addSuffix: true, locale: it })}
                        {item.official && <span className="ml-2 text-orange-400 font-medium">• Ufficiale</span>}
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comments */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4" id="comments-section">Commenti ({comments.length})</h2>

          <div className={`${sectionCard} p-4 mb-3`} role="form" aria-label="Aggiungi un commento">
            <div className="flex gap-3">
              <Avatar className="w-9 h-9 flex-shrink-0" aria-hidden="true">
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">Tu</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="Aggiungi un aggiornamento..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white resize-none text-sm"
                  rows={2}
                  aria-label="Testo del commento"
                />
                <Button
                  size="icon"
                  className="bg-orange-500 hover:bg-orange-600 self-end flex-shrink-0"
                  onClick={() => { if (newComment.trim()) addCommentMutation.mutate(newComment); }}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  aria-label="Invia commento"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mb-4">I commenti sono pubblici e associati al tuo account in conformità al GDPR.</p>

          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-4"
              >
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className={c.is_official ? 'bg-orange-500 text-white text-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs'}>
                    {c.is_official ? '✓' : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{c.is_official ? 'Sentinel' : 'Utente'}</span>
                    {c.is_official && <Badge className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0">Uff.</Badge>}
                    <span className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(c.created_date), { addSuffix: true, locale: it })}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {comments.length === 0 && (
            <p className="text-center text-sm text-gray-600 py-6">Nessun commento ancora. Sii il primo!</p>
          )}
        </div>
      </div>
    </div>
  );
}
