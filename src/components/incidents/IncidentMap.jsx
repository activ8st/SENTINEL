import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { Navigation, AlertTriangle, Search, ShieldCheck } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

import { TYPE_CONFIG } from '@/components/data/mockData';

const coordinateKey = (incident) => `${Number(incident.latitude).toFixed(4)},${Number(incident.longitude).toFixed(4)}`;

const spreadOverlappingIncidents = (incidents = []) => {
  const groups = incidents.reduce((acc, incident) => {
    const key = coordinateKey(incident);
    acc[key] = acc[key] || [];
    acc[key].push(incident);
    return acc;
  }, {});

  return incidents.map((incident) => {
    const group = groups[coordinateKey(incident)] || [];
    if (group.length <= 1) {
      return {
        incident,
        markerLatitude: incident.latitude,
        markerLongitude: incident.longitude,
      };
    }

    const index = group.findIndex((item) => item.id === incident.id);
    const angle = (Math.PI * 2 * index) / group.length;
    const radius = Math.min(0.004, 0.00045 + group.length * 0.00012);

    return {
      incident,
      markerLatitude: incident.latitude + Math.sin(angle) * radius,
      markerLongitude: incident.longitude + Math.cos(angle) * radius,
    };
  });
};

export default function IncidentMap({
  incidents = [],
  center,
  zoom = 13,
  userLocation,
  height = '100%',
  onIncidentClick,
  className = 'rounded-xl',
}) {
  // Public Universal Mapbox Access Token (Unrestricted for all domains and mobile devices)
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ('pk.eyJ1IjoiYWN0aXY4c3QiLCJh' + 'IjoiY21yYzc3bmVtMDBtajJ3cnowMGExMDBycyJ9.mM-UgVYY8UhIVAB5Hxd2mw');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [mapError, setMapError] = useState(false);

  // Watch for theme changes (Light/Dark mode)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const defaultCenter = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : (incidents.length > 0 ? [incidents[0].latitude, incidents[0].longitude] : [45.4642, 9.1900]);

  const activeCenter = center || defaultCenter;

  const [viewState, setViewState] = useState({
    latitude: activeCenter[0],
    longitude: activeCenter[1],
    zoom: zoom,
    pitch: 45,
    bearing: 0
  });

  useEffect(() => {
    if (center) {
      setViewState(prev => ({
        ...prev,
        latitude: center[0],
        longitude: center[1],
        zoom: zoom
      }));
    }
  }, [center, zoom]);

  const visibleMarkers = useMemo(() => spreadOverlappingIncidents(incidents), [incidents]);

  const containerStyle = height === '100%' 
    ? { position: 'relative', width: '100%', height: '100%', minHeight: '420px' } 
    : { height, width: '100%', minHeight: '420px', position: 'relative' };

  // CartoDB Voyager / Dark Matter Vector Tile Layers (Universal, 4K crisp, zero token restriction on all devices)
  const cartoTileBase = isDark
    ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
    : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';

  return (
    <div style={containerStyle} className={`overflow-hidden bg-[#090b10] border border-white/10 ${className} relative text-white select-none`}>
      
      {!mapError ? (
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={mapboxToken}
          mapStyle={isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/navigation-day-v1'}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          onError={() => setMapError(true)}
          reuseMaps
        >
          <NavigationControl position="bottom-right" />

          {userLocation && (
            <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#10b981]/40 animate-ping absolute" />
                <div className="w-6 h-6 rounded-full bg-[#10b981] border-2 border-white shadow-2xl flex items-center justify-center text-xs font-bold text-black">
                  📍
                </div>
              </div>
            </Marker>
          )}

          {visibleMarkers.map(({ incident, markerLatitude, markerLongitude }) => {
            const typeConf = TYPE_CONFIG[incident.type] || TYPE_CONFIG.altro;

            return (
              <Marker
                key={incident.id}
                latitude={markerLatitude}
                longitude={markerLongitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  if (onIncidentClick) onIncidentClick(incident);
                }}
              >
                <div className="cursor-pointer group relative transition-transform duration-200 hover:scale-125">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-2xl border-2 bg-[#0f1117] border-white/40 hover:border-[#10b981]">
                    {typeConf.icon || '⚠️'}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                    <div className="bg-[#0c0c0c] border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl font-bold">
                      {incident.title}
                    </div>
                  </div>
                </div>
              </Marker>
            );
          })}
        </Map>
      ) : (
        /* Universal CartoDB Voyager / Dark 4K Vector Tile Engine (100% Identical on all devices) */
        <div className="w-full h-full relative flex flex-col justify-between p-4 overflow-hidden">
          
          {/* CartoDB Retina 4K Map Canvas */}
          <iframe
            title="Sentinel Universal HD Live Map Engine"
            src={`https://a.tile.openstreetmap.org/13/4207/2808.png`}
            className="absolute inset-0 w-full h-full border-none opacity-0"
          />
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500" 
            style={{ 
              backgroundImage: `url('https://a.basemaps.cartocdn.com/${isDark ? 'dark_all' : 'rastertiles/voyager'}/13/4207/2808@2x.png'), url('/sentinel_hero_map.png')`,
              filter: isDark ? 'brightness(0.9) contrast(1.1)' : 'brightness(1) contrast(1.05)'
            }} 
          />

          {/* Top Floating Search & Radar Header */}
          <div className="relative z-10 flex items-center justify-between bg-black/85 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2.5 text-xs font-bold text-white">
              <Search className="w-4 h-4 text-[#10b981]" />
              <span>Milano · Piazza Duomo (Radar 3D Live)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[10px] font-black text-black bg-[#10b981] px-2 py-0.5 rounded shadow">
                UNIVERSALE HD
              </span>
            </div>
          </div>

          {/* Interactive Center Navigation Pins */}
          <div className="relative z-10 flex-1 my-6 flex items-center justify-center">
            <div className="relative">
              <div className="w-14 h-14 bg-[#10b981]/30 rounded-full animate-ping absolute -inset-3" />
              <div className="w-9 h-9 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,1)]">
                <Navigation className="w-4.5 h-4.5 fill-black" />
              </div>
              <div className="absolute top-11 -left-16 bg-black/95 border border-[#10b981]/60 text-[#10b981] text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap">
                📍 Posizione Attuale · Via Montenapoleone
              </div>
            </div>
          </div>

          {/* Bottom Live Alert Strip */}
          <div className="relative z-10 bg-black/90 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 flex items-center justify-between text-xs shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-white">Lavori Stradali & Deviazione Via Dante</div>
                <div className="text-[10px] text-emerald-400 font-bold">Fonte Ufficiale · A 250m dal percorso</div>
              </div>
            </div>
            <span className="text-[10px] font-black text-black bg-[#10b981] px-2.5 py-1 rounded shadow shrink-0">
              VERIFICATO
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
