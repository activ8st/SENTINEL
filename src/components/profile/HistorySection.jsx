import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MOCK_INCIDENTS, calcDistance, TYPE_CONFIG } from '@/components/data/mockData';
import { Clock, MapPin, TrendingUp, History, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const DEFAULT_LOC = { lat: 41.9028, lng: 12.4964 };

export default function HistorySection() {
  const [location, setLocation] = useState(DEFAULT_LOC);
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = false;
    const finish = () => { if (!done) { done = true; setLoading(false); } };
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); finish(); },
      finish,
      { timeout: 4000 }
    );
    const t = setTimeout(finish, 3500);
    return () => clearTimeout(t);
  }, []);

  const nearbyIncidents = useMemo(() => {
    return MOCK_INCIDENTS
      .map(i => ({ ...i, distance: calcDistance(location.lat, location.lng, i.latitude, i.longitude) }))
      .filter(i => i.distance <= radius)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [location, radius]);

  const chartData = useMemo(() => {
    const days = 14;
    const total = Math.max(nearbyIncidents.length, 1);
    const data = [];
    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(Date.now() - d * 86400000);
      const label = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
      const seed = (Math.sin(d * 7.31 + 3.7) + 1) / 2;
      const count = Math.max(0, Math.round(seed * Math.min(total, 7) + (d === 0 ? nearbyIncidents.length : 0)));
      data.push({ label, count });
    }
    return data;
  }, [nearbyIncidents.length]);

  const resolvedCount = nearbyIncidents.filter(i => i.status === 'resolved').length;
  const activeCount = nearbyIncidents.filter(i => i.status === 'active').length;

  const typeBreakdown = useMemo(() => {
    const counts = {};
    nearbyIncidents.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [nearbyIncidents]);

  const pastIncidents = nearbyIncidents.slice(0, 6);

  return (
    <div className="bg-gray-900 rounded-2xl border border-white/6 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-white/6">
        <History className="w-5 h-5 text-orange-500" />
        <span className="font-semibold text-white">Cronologia zona</span>
        <span className="ml-auto text-xs text-gray-500">{nearbyIncidents.length} eventi</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        <div className="text-center">
          <p className="text-xl font-bold text-white">{nearbyIncidents.length}</p>
          <p className="text-[10px] text-gray-500">Totali</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-green-400">{resolvedCount}</p>
          <p className="text-[10px] text-gray-500">Risolti</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-red-400">{activeCount}</p>
          <p className="text-[10px] text-gray-500">Attivi</p>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-3">
        <div className="flex items-center gap-1.5 mb-1 px-2">
          <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-400">Andamento (14 giorni)</span>
        </div>
        <div style={{ width: '100%', height: 110 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 8, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 9 }} interval={1} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e5e7eb' }}
                cursor={{ fill: '#37415133' }}
              />
              <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Type breakdown */}
      {typeBreakdown.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {typeBreakdown.map(([type, count]) => {
            const cfg = TYPE_CONFIG[type];
            return (
              <span key={type} className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                {cfg.emoji} {count}
              </span>
            );
          })}
        </div>
      )}

      {/* Radius control */}
      <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-500 mr-1">Raggio:</span>
        {[5, 10, 25, 50].map(r => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            aria-pressed={radius === r}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              radius === r ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {r}km
          </button>
        ))}
      </div>

      {/* Past incidents list */}
      <div className="border-t border-white/6">
        <div className="px-4 py-2 text-xs font-medium text-gray-400">Incidenti recenti</div>
        {loading ? (
          <div className="px-4 py-6 flex justify-center">
            <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
          </div>
        ) : pastIncidents.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-600">Nessun incidente in questa zona</p>
        ) : (
          <div className="divide-y divide-white/4">
            {pastIncidents.map(inc => {
              const cfg = TYPE_CONFIG[inc.type];
              return (
                <Link
                  key={inc.id}
                  to={createPageUrl('IncidentDetail') + `?id=${inc.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{inc.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{inc.city}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{formatDistanceToNow(new Date(inc.created_date), { locale: it })} fa</span>
                    </div>
                  </div>
                  {inc.status === 'resolved' && (
                    <span className="text-[10px] text-green-500 flex-shrink-0">Risolto</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}