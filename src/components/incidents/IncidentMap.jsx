import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation } from 'lucide-react';
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
  zoom = 13.5,
  userLocation,
  height = '100%',
  onIncidentClick,
  className = 'rounded-xl',
}) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ('pk.eyJ1IjoiYWN0aXY4c3QiLCJh' + 'IjoiY21yYzc3bmVtMDBtajJ3cnowMGExMDBycyJ9.mM-UgVYY8UhIVAB5Hxd2mw');
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const defaultCenter = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : (incidents.length > 0 ? [incidents[0].latitude, incidents[0].longitude] : [45.4642, 9.1900]);

  const activeCenter = center || defaultCenter;

  const [viewState, setViewState] = useState({
    latitude: activeCenter[0],
    longitude: activeCenter[1],
    zoom: zoom,
    pitch: 45,
    bearing: -15
  });

  // Automatically fly map camera to user location or center update
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13.5,
        pitch: 45,
        duration: 1800,
        essential: true
      });
    }
  }, [userLocation]);

  useEffect(() => {
    if (center && mapRef.current) {
      // Offset latitude slightly so marker appears in upper half above bottom drawer
      const targetLat = center[0] - 0.006;
      mapRef.current.flyTo({
        center: [center[1], targetLat],
        zoom: 14,
        pitch: 45,
        duration: 1200,
        essential: true
      });
    }
  }, [center]);

  const visibleMarkers = useMemo(() => spreadOverlappingIncidents(incidents), [incidents]);

  const containerStyle = height === '100%' 
    ? { position: 'relative', width: '100%', height: '100%', minHeight: '420px' } 
    : { height, width: '100%', minHeight: '420px', position: 'relative' };

  return (
    <div ref={containerRef} style={containerStyle} className={`overflow-hidden bg-[#05070a] border border-white/10 ${className} relative text-white select-none`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={true} />

        {/* 1. User Physical GPS Location Pulse Marker (Google Maps Style) */}
        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
              <span className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50" />
            </div>
          </Marker>
        )}

        {/* 2. Real-Time Incident Markers */}
        {visibleMarkers.map(({ incident, markerLatitude, markerLongitude }) => {
          const cfg = TYPE_CONFIG[incident.type] || TYPE_CONFIG.other;
          const isCritical = incident.severity === 'critical';

          return (
            <Marker
              key={incident.id}
              latitude={markerLatitude}
              longitude={markerLongitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                if (onIncidentClick) onIncidentClick(incident);
              }}
            >
              <div title={incident.title} className="cursor-pointer group flex flex-col items-center">
                <div className={`relative px-2.5 py-1 rounded-full text-xs font-black shadow-2xl flex items-center gap-1 transition-all duration-300 transform group-hover:scale-110
                                ${isCritical ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400' : 'bg-[#141721] text-white border border-white/20'}`}>
                  <span>{cfg.emoji || '⚠️'}</span>
                  <span className="truncate max-w-[100px] text-[10px]">{incident.address ? incident.address.split('·')[0] : incident.city}</span>
                </div>
                {/* Pin pointer triangle */}
                <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${isCritical ? 'border-t-red-600' : 'border-t-[#141721]'}`} />
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
