import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Clock, ExternalLink, Share2, Heart, Volume2, VolumeX, ShieldCheck, ChevronRight } from 'lucide-react';
import { TYPE_CONFIG, SEVERITY_CONFIG } from '@/components/data/mockData';
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

// Sleek inline SVG fallback image data URI so Chrome NEVER renders a broken image icon
const SVG_EMERGENCY_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='100%' height='100%' fill='%230f172a'/><circle cx='400' cy='225' r='180' fill='none' stroke='%2310b981' stroke-width='2' opacity='0.25'/><circle cx='400' cy='225' r='120' fill='none' stroke='%2310b981' stroke-width='2' opacity='0.35'/><circle cx='400' cy='225' r='60' fill='none' stroke='%2310b981' stroke-width='2' opacity='0.45'/><circle cx='400' cy='225' r='8' fill='%2310b981'/><path d='M400 45 L400 405 M225 225 L575 225' stroke='%2310b981' stroke-width='1.5' opacity='0.2'/><text x='50%' y='85%' text-anchor='middle' fill='%2310b981' font-family='sans-serif' font-size='20' font-weight='bold' letter-spacing='4'>SENTINEL MONITORING HUB</text></svg>";

// Guaranteed HD Unsplash Hero Images per Category
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

  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Initial hero image setup
  const categoryHdImage = HERO_IMAGES_BY_TYPE[typeKey] || HERO_IMAGES_BY_TYPE.other;
  const [imgSrc, setImgSrc] = useState(categoryHdImage);

  useEffect(() => {
    const freshImage = HERO_IMAGES_BY_TYPE[typeKey] || HERO_IMAGES_BY_TYPE.other;
    setImgSrc(freshImage);
  }, [incident, typeKey]);

  const handleImageError = (e) => {
    if (imgSrc !== SVG_EMERGENCY_FALLBACK) {
      setImgSrc(SVG_EMERGENCY_FALLBACK);
    }
  };

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
      alert('Link dell\'allerta copiato negli appunti!');
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
      
      {/* 1. Full-Bleed 16:9 Media Hero Banner with Guaranteed Inline SVG Radar Fallback */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 group">
        <img
          src={imgSrc}
          alt=""
          onError={handleImageError}
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
      </div>

      {/* 2. Content Body (Citizen Style) */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Source Pill */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            {incident.source || 'Fonte Ufficiale'}
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

        {/* 3. Action Bar (Direct Source Link + Share + Details) */}
        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          
          <div className="flex items-center gap-2">
            {incident.source_url ? (
              <a
                href={incident.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Fonte Ufficiale
              </a>
            ) : (
              <span className="text-[11px] font-bold text-white/40">
                Fonte Verificata
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors border border-white/15"
            >
              <Share2 className="w-3.5 h-3.5" />
              Condividi
            </button>

            <Link
              to={createPageUrl('IncidentDetail') + `?id=${incident.id}`}
              className="inline-flex items-center gap-0.5 text-white/60 hover:text-[#10b981] font-bold transition-colors text-[11px] ml-1"
            >
              Dettagli <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}