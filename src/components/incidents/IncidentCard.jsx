import React from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Clock, ChevronRight, ExternalLink, Video } from 'lucide-react';
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

  return (
    <div className={`relative flex flex-col p-5 rounded-[22px] border transition-all duration-300
                    bg-[#141721] hover:bg-[#191d2a] 
                    border-white/10 shadow-2xl hover:border-[#10b981]/50
                    border-l-4 ${severity.border} ${unread ? 'ring-2 ring-emerald-500/40' : ''}`}>
      
      {/* Top Header Line: Citizen Accent Time Ago + Distance */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Aggiornato {safeFormatTimeAgo(incident.created_date)} fa</span>
          {formatDist(distance) && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-[#10b981] font-black">{formatDist(distance)}</span>
            </>
          )}
        </div>

        {incident.is_live && (
          <span className="flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow">
            🔴 LIVE
          </span>
        )}
      </div>

      {/* Main Bold Event Headline */}
      <Link to={createPageUrl('IncidentDetail') + `?id=${incident.id}`} className="block group mb-1.5">
        <h3 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-[#10b981] transition-colors">
          {incident.title || 'Segnalazione in Tempo Reale'}
        </h3>
      </Link>

      {/* Sub-headline: Address / Neighborhood */}
      <div className="flex items-center gap-1.5 text-xs text-white/60 mb-4">
        <MapPin className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
        <span className="truncate font-semibold text-white/70">{incident.address || incident.city || 'Italia'}</span>
      </div>

      {/* Citizen Bottom Action Row */}
      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
        {/* Source Attribution Badge & Link */}
        {incident.source_url ? (
          <a
            href={incident.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {incident.source || 'Fonte Ufficiale'}
          </a>
        ) : (
          <span className="text-[11px] font-bold text-white/40">
            {incident.source || 'Fonte Ufficiale'}
          </span>
        )}

        {/* Right Action Cluster: Floating Red Drone Circle + Details */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Drone 3D Red Floating Button */}
          <Dialog open={showAerial} onOpenChange={setShowAerial}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAerial(true);
                }}
                title="Vista Drone 3D"
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-900/40 hover:scale-105 transition-all"
              >
                <Video className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 bg-black border-slate-800 text-white overflow-hidden rounded-2xl">
              <DialogTitle className="sr-only">Vista Drone 3D per {incident.title}</DialogTitle>
              <AerialView incident={incident} onClose={() => setShowAerial(false)} />
            </DialogContent>
          </Dialog>

          <Link
            to={createPageUrl('IncidentDetail') + `?id=${incident.id}`}
            className="inline-flex items-center gap-0.5 text-white/50 hover:text-[#10b981] font-bold transition-colors text-[11px] ml-1"
          >
            Dettagli <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}