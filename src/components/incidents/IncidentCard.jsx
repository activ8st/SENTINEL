import React from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Clock, ChevronRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { TYPE_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '@/components/data/mockData';
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

export default function IncidentCard({ incident, distance, unread = false }) {
  if (!incident) return null;

  const typeKey = incident.type && TYPE_CONFIG[incident.type] ? incident.type : 'other';
  const type = TYPE_CONFIG[typeKey];

  const severityKey = incident.severity && SEVERITY_CONFIG[incident.severity] ? incident.severity : 'medium';
  const severity = SEVERITY_CONFIG[severityKey];

  const statusKey = incident.status && STATUS_CONFIG[incident.status] ? incident.status : 'active';
  const status = STATUS_CONFIG[statusKey];

  const formatDist = (km) => {
    if (km === null || km === undefined || isNaN(km)) return null;
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  const [showAerial, setShowAerial] = React.useState(false);
  const emojiIcon = type?.emoji || type?.icon || '⚠️';

  return (
    <div className={`relative flex flex-col p-5 rounded-2xl border transition-all duration-300
                    bg-[#0d1017] hover:bg-[#121622] 
                    border-white/10 shadow-xl hover:shadow-2xl hover:border-[#10b981]/50
                    border-l-4 ${severity.border} ${unread ? 'ring-2 ring-emerald-500/40' : ''}`}>
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl ${type.bg} border border-white/10 flex items-center justify-center text-lg shrink-0 shadow-inner`}>
            <span>{emojiIcon}</span>
          </div>
          <span className={`text-xs font-black uppercase tracking-wider ${type.text} truncate`}>
            {type.label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {incident.is_live && (
            <span className="flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow">
              🔴 LIVE
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            {incident.source || 'Ufficiale'}
          </span>
        </div>
      </div>

      {/* Card Title */}
      <Link to={createPageUrl('IncidentDetail') + `?id=${incident.id}`} className="block group">
        <h3 className="text-base font-bold text-white leading-snug line-clamp-2 mb-3 group-hover:text-[#10b981] transition-colors">
          {incident.title || 'Evento Rilevato'}
        </h3>
      </Link>

      {/* Clean Meta Row (Location, Distance, Time) - NO OVERLAP */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 min-w-0 max-w-[60%]">
          <MapPin className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          <span className="truncate font-semibold text-white/80">{incident.address || incident.city || 'Italia'}</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          {formatDist(distance) && (
            <span className="font-extrabold text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 px-2 py-0.5 rounded-md text-[11px]">
              {formatDist(distance)}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] font-semibold text-white/50">
            <Clock className="w-3 h-3 text-slate-400" />
            {safeFormatTimeAgo(incident.created_date)} fa
          </span>
        </div>
      </div>

      {/* Citizen Action Bar (Drone 3D + Official Article Source Link + Details) */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-dashed border-white/10 text-[11px] gap-2">
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
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/90 hover:text-[#10b981] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors border border-white/10"
              >
                🚁 Drone 3D
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 bg-black border-slate-800 text-white overflow-hidden rounded-2xl">
              <DialogTitle className="sr-only">Vista Drone 3D per {incident.title}</DialogTitle>
              <AerialView incident={incident} onClose={() => setShowAerial(false)} />
            </DialogContent>
          </Dialog>

          {/* Direct Link to Official News Source */}
          {incident.source_url && (
            <a
              href={incident.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Fonte
            </a>
          )}
        </div>

        <Link
          to={createPageUrl('IncidentDetail') + `?id=${incident.id}`}
          className="inline-flex items-center gap-1 text-white/50 hover:text-[#10b981] font-bold transition-colors ml-auto"
        >
          Dettagli <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}