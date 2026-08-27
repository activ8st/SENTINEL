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

// High resolution SVG Radar Fallback Data URI (100% local, zero network dependency)
const SVG_RADAR_FALLBACK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23090d16"/><circle cx="400" cy="225" r="160" fill="none" stroke="%2310b981" stroke-width="2" opacity="0.25"/><circle cx="400" cy="225" r="110" fill="none" stroke="%2310b981" stroke-width="2" opacity="0.4"/><circle cx="400" cy="225" r="60" fill="none" stroke="%2310b981" stroke-width="2" opacity="0.6"/><circle cx="400" cy="225" r="8" fill="%2310b981"/><line x1="240" y1="225" x2="560" y2="225" stroke="%2310b981" stroke-width="1.5" opacity="0.3"/><line x1="400" y1="65" x2="400" y2="385" stroke="%2310b981" stroke-width="1.5" opacity="0.3"/><text x="400" y="390" text-anchor="middle" fill="%2310b981" font-family="sans-serif" font-size="14" font-weight="bold" letter-spacing="3">SENTINEL MONITORING RADAR</text></svg>`;

const HERO_IMAGES_BY_TYPE = {
  crime: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
  accident: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
  fire: 'https://images.unsplash.com/photo-1599827553209-6f17e9e2009d?auto=format&fit=crop&w=1000&q=80',
  traffic: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80',
  weather: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=1000&q=80',
  suspicious: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1000&q=80',
  other: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80'
};

const resolveIncidentType = (incident) => {
  if (incident.type && TYPE_CONFIG[incident.type]) return incident.type;
  const text = (incident.title + ' ' + (incident.description || '')).toLowerCase();
  if (/incendio|fuoco|fiamme|rogo|fumo/i.test(text)) return 'fire';
  if (/incidente|scontro|investit|ribalt|tamponam|auto|moto|camion/i.test(text)) return 'accident';
  if (/arrest|furto|rapina|borsegg|aggression|coltell|spacci|omicid|polizia|carabin/i.test(text)) return 'crime';
  if (/traffico|lavori|deviazion|strada|chiusa|cantiere|code/i.test(text)) return 'traffic';
  if (/meteo|temporale|pioggia|allerta|vento|neve|terremoto/i.test(text)) return 'weather';
  return 'suspicious';
};

const getLikedIncidentsFromStorage = () => {
  try {
    const raw = localStorage.getItem('sentinel_liked_incidents');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLikedIncidentsToStorage = (likedArray) => {
  try {
    localStorage.setItem('sentinel_liked_incidents', JSON.stringify(likedArray));
    window.dispatchEvent(new Event('sentinel_likes_updated'));
  } catch (e) {
    console.warn('Liked storage error:', e);
  }
};

export default function IncidentCard({ incident, distance, unread = false }) {
  if (!incident) return null;

  const resolvedTypeKey = resolveIncidentType(incident);
  const type = TYPE_CONFIG[resolvedTypeKey] || TYPE_CONFIG.other;
  const severityKey = incident.severity && SEVERITY_CONFIG[incident.severity] ? incident.severity : 'medium';
  const severity = SEVERITY_CONFIG[severityKey];

  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Sync liked state with localStorage
  useEffect(() => {
    const currentLikes = getLikedIncidentsFromStorage();
    const exists = currentLikes.some(item => (typeof item === 'string' ? item === incident.id : item.id === incident.id));
    setIsLiked(exists);
  }, [incident]);

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentLikes = getLikedIncidentsFromStorage();
    let updatedLikes = [];

    const exists = currentLikes.some(item => (typeof item === 'string' ? item === incident.id : item.id === incident.id));
    if (exists) {
      updatedLikes = currentLikes.filter(item => (typeof item === 'string' ? item !== incident.id : item.id !== incident.id));
      setIsLiked(false);
    } else {
      updatedLikes = [incident, ...currentLikes];
      setIsLiked(true);
    }

    saveLikedIncidentsToStorage(updatedLikes);
  };

  const initialHeroSrc = HERO_IMAGES_BY_TYPE[resolvedTypeKey] || HERO_IMAGES_BY_TYPE.other;
  const [imageSrc, setImageSrc] = useState(initialHeroSrc);

  useEffect(() => {
    setImageSrc(HERO_IMAGES_BY_TYPE[resolvedTypeKey] || HERO_IMAGES_BY_TYPE.other);
  }, [resolvedTypeKey]);

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
      
      {/* 1. Full-Bleed 16:9 Media Hero Banner with Guaranteed Fallback */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#090d16] group">
        <img
          src={imageSrc}
          alt=""
          onError={() => {
            if (imageSrc !== SVG_RADAR_FALLBACK) {
              setImageSrc(SVG_RADAR_FALLBACK);
            }
          }}
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

        {/* Persistent Heart Like Button Bottom Right */}
        <button
          type="button"
          onClick={toggleLike}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all z-10
            ${isLiked ? 'bg-red-600 text-white scale-110' : 'bg-white/90 text-black hover:bg-white'}`}
          title={isLiked ? 'Rimuovi dai Preferiti' : 'Salva nei Preferiti'}
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

        {/* 3. Action Bar */}
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