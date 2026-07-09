const db = { auth:{ isAuthenticated: async()=>false, me: async()=>null, logout: async()=>{}, updateMe: async()=>({}), redirectToLogin: ()=>{} }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } }, appLogs:{ logUserInApp: async()=>{} } };

import React from 'react';

// Livelli di affidabilità (karma) — ordinati dal più alto al più basso
export const KARMA_TIERS = [
  { min: 500, level: 'guardiano',   label: 'Guardiano',   color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', bar: 'bg-yellow-400', icon: '🛡️' },
  { min: 150, level: 'veterano',   label: 'Veterano',    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/40', bar: 'bg-purple-400', icon: '⭐' },
  { min: 50,  level: 'esperto',     label: 'Esperto',     color: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/40',  bar: 'bg-green-400',  icon: '✓' },
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

// Aggiorna il karma del segnalatore (best-effort: richiede permessi admin sull'entità User).
// Il voto sull'incidento resta comunque persistito dal chiamante.
export async function applyKarmaDelta(reportedById, delta) {
  if (!reportedById || !delta) return;
  try {
    const users = await db.entities.User.filter({ id: reportedById });
    const reporter = users?.[0];
    if (!reporter) return;
    const newKarma = Math.max(0, (reporter.karma ?? 0) + delta);
    await db.entities.User.update(reportedById, {
      karma: newKarma,
      reliability_level: getReliabilityLevel(newKarma).level,
    });
  } catch {
    // best-effort: ignorato se l'utente corrente non ha permessi su User
  }
}
