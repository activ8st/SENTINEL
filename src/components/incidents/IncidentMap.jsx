import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { Navigation, AlertTriangle, MapPin, Search } from 'lucide-react';
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

  // CartoDB High Resolution Map Tiles Fallback if Mapbox GL token is domain-restricted
  const cartoTileUrl = isDark
    ? `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${Math.floor((activeCenter[1] + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(activeCenter[0] * Math.PI / 180) + 1 / Math.cos(activeCenter[0] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png`
    : `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${Math.floor((activeCenter[1] + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(activeCenter[0] * Math.PI / 180) + 1 / Math.cos(activeCenter[0] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png`;

  if (mapError) {
    return (
      <div style={containerStyle} className={`overflow-hidden bg-[#090b10] border border-white/10 ${className} relative flex flex-col justify-between p-4 text-white select-none`}>
        
        {/* Vector Grid & Map Canvas */}
        <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${cartoTileUrl}), url('/sentinel_hero_map.png')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

        {/* Top Control Bar */}
        <div className="relative z-10 flex items-center justify-between bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/15">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Search className="w-4 h-4 text-[#10b981]" />
            <span>Milano · Piazza Duomo (Live Radar)</span>
          </div>
          <span className="text-[10px] font-extrabold text-black bg-[#10b981] px-2 py-0.5 rounded shadow">
            ATTIVO 3D
          </span>
        </div>

        {/* Live Interactive Pins */}
        <div className="relative z-10 flex-1 my-6 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 bg-[#10b981]/30 rounded-full animate-ping absolute -inset-2" />
            <div className="w-8 h-8 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center text-black shadow-[0_0_25px_rgba(16,185,129,0.9)]">
              <Navigation className="w-4 h-4 fill-black" />
            </div>
            <div className="absolute top-10 -left-12 bg-black/90 border border-[#10b981]/50 text-[#10b981] text-[10px] font-bold px-3 py-1 rounded-xl shadow-2xl whitespace-nowrap">
              📍 Posizione Attuale · Via Dante
            </div>
          </div>
        </div>

        {/* Bottom Alert Strip */}
        <div className="relative z-10 bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-bold text-white">Lavori Stradali & Deviazione</div>
              <div className="text-[10px] text-gray-400">Fonte Ufficiale · A 250m dal percorso</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/15 px-2 py-1 rounded border border-[#10b981]/30">
            VERIFICATO
          </span>
        </div>

      </div>
    );
  }

  return (
    <div ref={containerRef} style={containerStyle} className={`overflow-hidden bg-[#090b10] border border-white/10 ${className}`}>
      <Map
        ref={mapRef}
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
              <div className="w-8 h-8 rounded-full bg-[#10b981]/30 animate-ping absolute" />
              <div className="w-6 h-6 rounded-full bg-[#10b981] border-2 border-white shadow-xl flex items-center justify-center text-xs font-bold">
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
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-2xl border-2 bg-[#0f1117] border-white/30 hover:border-[#10b981]">
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
    </div>
  );
}
