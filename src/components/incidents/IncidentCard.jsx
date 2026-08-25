import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Clock, ExternalLink, Video, Eye, MessageSquare, Share2, Heart, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';
import { TYPE_CONFIG, SEVERITY_CONFIG } from '@/components/data/mockData';
import AerialView from '@/components/incidents/AerialView';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const safeFormatTimeAgo = (dateStr) => {
  try {
    if (!dateStr) return 'poco fa';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'poco fa';
    return formatDistanceToNow(d, { addSuffix: false, locale: it });
  } catch (e) {
    return 'poco fa';
  }
};

// Fallback high quality emergency hero images for cards
const HERO_IMAGES_BY_TYPE = {
  crime: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
  accident: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
  fire: 'https://images.unsplash.com/photo-1599827553209-6f17e9e2009d?auto=format&fit=crop&w=1000&q=80',
  traffic: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80',
  weather: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=1000&q=80',
  suspicious: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1000&q=80',
  other: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80'
};

export default function IncidentCard({ incident, distance, unread = false }) {
  if (!incident) return null;

  const typeKey = incident.type && TYPE_CONFIG[incident.type] ? incident.type : 'other';
  const type = TYPE_CONFIG[typeKey];
  const severityKey = incident.severity && SEVERITY_CONFIG[incident.severity] ? incident.severity : 'medium';
  const severity = SEVERITY_CONFIG[severityKey];

  const [showAerial, setShowAerial] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const heroImage = incident.hero_image || HERO_IMAGES_BY_TYPE[typeKey] || HERO_IMAGES_BY_TYPE.other;

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: incident.title,
        text: `${incident.title} - ${incident.address || incident.city}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiato negli appunti!');
    }
  };

  const formatDist = (km) => {
    if (km === null || km === undefined || isNaN(km)) return null;
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  return (
    <div className={`relative flex flex-col rounded-[24px] border overflow-hidden transition-all duration-300
                    bg-[#0d1017] hover:bg-[#121622] 
                    border-white/10 shadow-2xl hover:border-[#10b981]/50
                    border-l-4 ${severity.border} ${unread ? 'ring-2 ring-emerald-500/40' : ''}`}>
      
      {/* 1. Full-Bleed 16:9 Media Hero Banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 group">
        <img
          src={heroImage}
          alt={incident.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-black/20 to-transparent" />

        {/* Mute/Sound Toggle Top Right */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all z-10"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white/80" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Floating Heart Like Button Bottom Right */}
        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all z-10
            ${isLiked ? 'bg-red-600 text-white scale-110' : 'bg-white text-black hover:bg-slate-200'}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Live Pulse Badge Top Left */}
        {incident.is_live && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/95 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg tracking-wider">
            🔴 LIVE BROADCAST
          </span>
        )}
      </div>

      {/* 2. Content Body (Citizen Style) */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Source Pill */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[11px] font-black bg-white/10 text-white/90 border border-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
            🛡️ {incident.source || 'ANSA Ufficiale'}
          </span>
        </div>

        {/* Big Bold Headline */}
        <Link to={createPageUrl('IncidentDetail') + `?id=${incident.id}`} className="block group mb-2">
          <h2 className="text-xl font-extrabold text-white leading-tight group-hover:text-[#10b981] transition-colors">
            {incident.title}
          </h2>
        </Link>

        {/* Time Ago & Location Sub-headline */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/60 mb-3">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-amber-400 font-bold">{safeFormatTimeAgo(incident.created_date)} fa</span>
          <span className="text-white/30">•</span>
          <MapPin className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          <span className="truncate text-white/80 font-bold">{incident.address || incident.city || 'Italia'}</span>
          {formatDist(distance) && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-[#10b981] font-black bg-[#10b981]/15 px-2 py-0.5 rounded text-[11px]">
                {formatDist(distance)}
              </span>
            </>
          )}
        </div>

        {/* Short Description Snippet */}
        <p className="text-xs text-white/70 leading-relaxed line-clamp-3 mb-4">
          {incident.description || 'Monitoraggio perimetrale attivo ed in aggiornamento continuo dalle fonti ufficiali.'}
        </p>

        {/* 3. Social Stats Bar (Views, Media, Comments, Share) */}
        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px] font-bold text-white/70">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {(12.4 + (incident.id ? incident.id.length * 1.5 : 5)).toFixed(1)}K
            </span>

            <span className="flex items-center gap-1 text-[11px] font-bold text-white/70">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              {4 + (incident.reports_count || 1)}
            </span>

            <span className="flex items-center gap-1 text-[11px] font-bold text-white/70">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              {18 + (incident.viewers_count || 12)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Drone 3D Trigger */}
            <Dialog open={showAerial} onOpenChange={setShowAerial}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAerial(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Video className="w-3 h-3 text-red-500" />
                  Drone 3D
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 bg-black border-slate-800 text-white overflow-hidden rounded-2xl">
                <DialogTitle className="sr-only">Vista Drone 3D per {incident.title}</DialogTitle>
                <AerialView incident={incident} onClose={() => setShowAerial(false)} />
              </DialogContent>
            </Dialog>

            {/* Direct Official Link */}
            {incident.source_url && (
              <a
                href={incident.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Fonte
              </a>
            )}

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-white/90 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors border border-white/10"
            >
              <Share2 className="w-3 h-3" />
              Condividi
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}