import React from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MapPin, Clock, Users, ChevronRight, Radio, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TYPE_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '@/components/data/mockData';
import VoteButtons from '@/components/incidents/VoteButtons';
import AerialView from '@/components/incidents/AerialView';
import { ReliabilityBadge } from '@/components/data/reliability';
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

  return (
    <Link to={createPageUrl('IncidentDetail') + `?id=${incident.id}`}>
      <div className={`relative flex gap-3 p-4 rounded-2xl border border-gray-200 dark:border-white/8 
                      bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 active:scale-[0.99] transition-all 
                      border-l-4 ${severity.border} ${unread ? 'ring-1 ring-orange-500/30' : ''}`}>
        {/* Unread dot */}
        {unread && (
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500" />
        )}

        {/* Type icon */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${type.bg} flex items-center justify-center text-xl`}>
          {type.emoji}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-start gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wide ${type.text}`}>
              {type.label}
            </span>
            <span className={`ml-auto flex items-center gap-1 text-xs ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${incident.status === 'active' ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>
          </div>

          {/* Title */}
          <p className="text-gray-900 dark:text-white font-semibold leading-snug line-clamp-2 pr-4">
            {incident.title}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{incident.address || incident.city}</span>
            </span>
            {formatDist(distance) && (
              <span className="text-orange-400 font-medium">{formatDist(distance)}</span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(incident.created_date), { addSuffix: false, locale: it })} fa
            </span>
          </div>

          {/* Live badge & Aerial View */}
          <div className="mt-2 flex items-center gap-2">
            {incident.is_live && (
              <Badge className="bg-red-600 text-white text-xs animate-pulse px-2 py-0.5">
                🔴 LIVE
              </Badge>
            )}

            <Dialog open={showAerial} onOpenChange={setShowAerial}>
              <DialogTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAerial(true);
                  }}
                  className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  🚁 Vista Drone 3D
                </button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-md bg-gray-950 border-gray-800 p-0 overflow-hidden" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <DialogTitle className="sr-only">Vista Drone 3D</DialogTitle>
                <div className="h-[300px] w-full">
                  <AerialView address={incident.address || incident.city} />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Verifica community + affidabilità segnalatore */}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 dark:border-gray-800 pt-2">
            <div className="flex items-center gap-3">
              <VoteButtons incident={incident} />
              {incident.reported_by_id && (
                <button 
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      await fetch(`http://localhost:8000/api/incidents/${incident.id}/report-fake`, { method: 'POST' });
                      alert("Segnalazione Fake News registrata. Grazie!");
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  title="Segnala come Fake News"
                >
                  <AlertTriangle className="w-3 h-3" /> Fake?
                </button>
              )}
            </div>
            {incident.reported_by_id && (
              <ReliabilityBadge karma={incident.reporter_karma ?? 0} compact />
            )}
          </div>
        </div>

        <ChevronRight className="flex-shrink-0 self-center w-4 h-4 text-gray-600" />
      </div>
    </Link>
  );
}