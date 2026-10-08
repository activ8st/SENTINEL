import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Flame,
  Car,
  HeartPulse,
  Eye,
  Navigation,
  CloudRain,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const LUCIDE_ICON_MAP = {
  crime: ShieldAlert,
  fire: Flame,
  accident: Car,
  medical: HeartPulse,
  suspicious: Eye,
  traffic: Navigation,
  weather: CloudRain,
  other: Info,
};

const CATEGORY_COLORS = {
  crime: { text: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10' },
  fire: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  accident: { text: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10' },
  medical: { text: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10' },
  suspicious: { text: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10' },
  traffic: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  weather: { text: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10' },
  other: { text: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10' },
};

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffMinutes < 1) return 'Adesso';
  if (diffMinutes < 60) return `${diffMinutes}m fa`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h fa`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return `${diffDays}gg fa`;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export default function NotificationCard({ incident, isRead, onMarkRead, typeConfig }) {
  const IconComponent = LUCIDE_ICON_MAP[incident.type] || Info;
  const categoryStyle = CATEGORY_COLORS[incident.type] || CATEGORY_COLORS.other;
  const label = typeConfig?.label || incident.type || 'Allerta';
  const relativeTime = formatRelativeTime(incident.created_date || incident.published_at);

  const locationText = incident.city || incident.address || 'Area locale';
  const distanceText = Number.isFinite(incident.distance) && incident.distance > 0
    ? `${incident.distance < 1 ? '<1' : incident.distance.toFixed(1)} km`
    : null;

  const sourceText = incident.source_label || incident.source || null;
  const isVerified = Boolean(incident.official_verified || incident.verification_status === 'official');

  return (
    <Link
      to={`/IncidentDetail?id=${incident.id}`}
      onClick={() => onMarkRead?.(incident.id)}
      className="block text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] rounded-2xl"
    >
      <div
        className={`relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-colors min-h-[72px] ${
          isRead
            ? 'bg-white/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            : 'bg-white dark:bg-[#0c0c0c] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xs hover:border-[#10b981]/50 dark:hover:border-[#10b981]/50'
        }`}
      >
        {/* Unread indicator dot */}
        {!isRead && (
          <span
            className="absolute top-3.5 left-2.5 w-2 h-2 rounded-full bg-[#10b981]"
            title="Non letta"
          />
        )}

        {/* Lucide Icon Badge */}
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${categoryStyle.bg} ${categoryStyle.text}`}
        >
          <IconComponent className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Top metadata line: Category + Location/Distance + Verification */}
          <div className="flex items-center flex-wrap gap-1.5 mb-1 text-[11px] font-semibold">
            <span className={`uppercase tracking-wider font-bold ${categoryStyle.text}`}>
              {label}
            </span>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <span className="text-slate-500 dark:text-white/50 truncate max-w-[140px] sm:max-w-[200px]">
              {locationText}
            </span>
            {distanceText && (
              <>
                <span className="text-slate-300 dark:text-white/20">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {distanceText}
                </span>
              </>
            )}
            {isVerified && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ml-auto sm:ml-0">
                <ShieldCheck className="w-3 h-3" /> Verificato
              </span>
            )}
          </div>

          {/* Title: 2 lines max */}
          <h4
            className={`text-sm sm:text-[15px] leading-snug line-clamp-2 ${
              isRead
                ? 'font-medium text-slate-700 dark:text-white/70'
                : 'font-bold text-slate-900 dark:text-white'
            }`}
          >
            {incident.title}
          </h4>

          {/* Bottom metadata line: Relative time & source */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-white/40">
            {relativeTime && <span>{relativeTime}</span>}
            {relativeTime && sourceText && <span>•</span>}
            {sourceText && <span className="truncate max-w-[150px]">{sourceText}</span>}
          </div>
        </div>

        {/* Right arrow */}
        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-white/30 shrink-0 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}
