import React from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { TYPE_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '@/components/data/mockData';
import AerialView from '@/components/incidents/AerialView';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export default function IncidentCard({ incident, distance, unread = false }) {
  const type = TYPE_CONFIG[incident.type] || TYPE_CONFIG.other;
  const severity = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.medium;
  const status = STATUS_CONFIG[incident.status] || STATUS_CONFIG.active;

  const formatDist = (km) => {
    if (km === null || km === undefined) return null;
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  const [showAerial, setShowAerial] = React.useState(false);

  const emojiIcon = type.emoji || type.icon || '⚠️';

  return (
    <Link to={createPageUrl('IncidentDetail') + `?id=${incident.id}`} className="block group">
      <div className={`relative flex flex-col p-5 rounded-2xl border transition-all duration-300
                      bg-white dark:bg-[#0d1017] hover:bg-slate-50 dark:hover:bg-[#121622] 
                      border-slate-200 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-[#10b981]/40
                      border-l-4 ${severity.border} ${unread ? 'ring-2 ring-emerald-500/40' : ''}`}>
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Category Icon Box */}
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
            <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${status.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-current ${incident.status === 'active' ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Card Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-3 group-hover:text-[#10b981] transition-colors">
          {incident.title}
        </h3>

        {/* Clean Meta Row (Location, Distance, Time) - NO OVERLAP */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-white/60 pt-3 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1.5 min-w-0 max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span className="truncate font-medium">{incident.address || incident.city}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 ml-auto">
            {formatDist(distance) && (
              <span className="font-extrabold text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 px-2 py-0.5 rounded-md text-[11px]">
                {formatDist(distance)}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-white/50">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatDistanceToNow(new Date(incident.created_date), { addSuffix: false, locale: it })} fa
            </span>
          </div>
        </div>

        {/* Action Strip */}
        <div className="mt-3 pt-2 flex items-center justify-between text-xs">
          <Dialog open={showAerial} onOpenChange={setShowAerial}>
            <DialogTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAerial(true);
                }}
                className="text-[11px] font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition"
              >
                <span>🚁 Vista Drone 3D</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-slate-900 border-white/10 text-white">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <span>🚁 Vista Perimetrale 3D</span>
                <span className="text-xs text-[#10b981] font-mono">({incident.title})</span>
              </DialogTitle>
              <AerialView incident={incident} />
            </DialogContent>
          </Dialog>

          <span className="text-slate-400 dark:text-white/40 group-hover:text-[#10b981] transition-colors flex items-center gap-1 text-[11px] font-bold">
            Dettagli <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

      </div>
    </Link>
  );
}