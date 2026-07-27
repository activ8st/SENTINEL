import React from 'react';

// Livelli di affidabilità (karma) — ordinati dal più alto al più basso
export const KARMA_TIERS = [
  { min: 500, level: 'guardiano',   label: 'Guardiano',   color: 'text-[#10b981]', bg: 'bg-[#10b981]/15', border: 'border-[#10b981]/40', bar: 'bg-[#10b981]', icon: '🛡️' },
  { min: 150, level: 'veterano',   label: 'Veterano',    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/40', bar: 'bg-purple-400', icon: '⭐' },
  { min: 50,  level: 'esperto',     label: 'Esperto',     color: 'text-[#10b981]',  bg: 'bg-[#10b981]/15',  border: 'border-[#10b981]/40',  bar: 'bg-[#10b981]',  icon: '✓' },
  { min: 10,  level: 'attendibile', label: 'Attendibile', color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/40',   bar: 'bg-blue-400',   icon: '👤' },
  { min: 0,   level: 'nuovo',       label: 'Nuovo',       color: 'text-gray-400',   bg: 'bg-gray-500/15',   border: 'border-gray-500/40',   bar: 'bg-gray-400',   icon: '○' },
];

export const getReliabilityLevel = (karma = 0) =>
  KARMA_TIERS.find((t) => (karma ?? 0) >= t.min) || KARMA_TIERS[KARMA_TIERS.length - 1];

export const getNextTier = (karma = 0) =>
  [...KARMA_TIERS].reverse().find((t) => (karma ?? 0) < t.min) || null;

// Badge compatto per mostrare l'affidabilità del segnalatore
export function ReliabilityBadge({ karma = 0, compact = false }) {
  const tier = getReliabilityLevel(karma);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}
      title={`Karma ${karma ?? 0} · ${tier.label}`}
    >
      <span aria-hidden="true">{tier.icon}</span>
      {tier.label}
      {!compact && (karma ?? 0) > 0 && <span className="opacity-70">· {karma}</span>}
    </span>
  );
}
