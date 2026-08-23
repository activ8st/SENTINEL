import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { TYPE_CONFIG } from '@/components/data/mockData';

const coordinateKey = (incident) => `${Number(incident.latitude).toFixed(4)},${Number(incident.longitude).toFixed(4)}`;

const createRadiusCircle = (center, radiusKm, points = 96) => {
  if (!center || !radiusKm) return null;
  const coords = [];
  const earthRadiusKm = 6371;
  const lat = center.lat * Math.PI / 180;
  const lng = center.lng * Math.PI / 180;
  const distance = radiusKm / earthRadiusKm;

  for (let i = 0; i <= points; i += 1) {
    const bearing = (i / points) * Math.PI * 2;
    const pointLat = Math.asin(
      Math.sin(lat) * Math.cos(distance) + Math.cos(lat) * Math.sin(distance) * Math.cos(bearing)
    );
    const pointLng = lng + Math.atan2(
      Math.sin(bearing) * Math.sin(distance) * Math.cos(lat),
      Math.cos(distance) - Math.sin(lat) * Math.sin(pointLat)
    );
    coords.push([pointLng * 180 / Math.PI, pointLat * 180 / Math.PI]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
};

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
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const angle = index * goldenAngle;
    const ring = Math.floor(Math.sqrt(index));
    const radius = Math.min(0.018, 0.0011 + ring * 0.00125 + group.length * 0.00008);
    const latScale = Math.cos(Number(incident.latitude) * Math.PI / 180) || 1;

    return {
      incident,
      markerLatitude: Number(incident.latitude) + Math.sin(angle) * radius,
      markerLongitude: Number(incident.longitude) + (Math.cos(angle) * radius) / latScale,
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
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

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

  const mapStyle = 'mapbox://styles/mapbox/standard';

  const onMapLoad = (e) => {
    const map = e.target;
    map.setConfigProperty('basemap', 'lightPreset', isDark ? 'night' : 'day');
    // Enable 3D landmarks if available
    map.setConfigProperty('basemap', 'showPointOfInterestLabels', true);
  };

  // GeoJSON for Route
  const radiusCircleGeoJSON = useMemo(
    () => showRadius ? createRadiusCircle(userLocation, radiusKm) : null,
    [showRadius, userLocation, radiusKm]
  );

  const routeGeoJSON = useMemo(() => {
    if (!routeCoords || routeCoords.length < 2) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeCoords.map(c => [c[1], c[0]]) // Mapbox expects [lng, lat]
      }
    };
  }, [routeCoords]);

  const visibleMarkers = useMemo(() => spreadOverlappingIncidents(incidents), [incidents]);

  const containerStyle = height === '100%' 
    ? { position: 'relative', width: '100%', height: '100%', minHeight: '420px' } 
    : { height, width: '100%', minHeight: '420px', position: 'relative' };

  return (
    <div ref={containerRef} style={containerStyle} className={`overflow-hidden ${className}`}>
      <style>{`
        @keyframes mapbox-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes user-ring-grow {
          0% { transform: translate(-50%, -50%) scale(0.75); opacity: 0.45; }
          70% { opacity: 0.14; }
          100% { transform: translate(-50%, -50%) scale(2.35); opacity: 0; }
        }
      `}</style>
      
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle={isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/navigation-day-v1'}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="bottom-right" />

        {radiusCircleGeoJSON && (
          <Source id="user-radius-area" type="geojson" data={radiusCircleGeoJSON}>
            <Layer
              id="user-radius-fill"
              type="fill"
              paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.08 }}
            />
            <Layer
              id="user-radius-line"
              type="line"
              paint={{ 'line-color': '#2563eb', 'line-width': 2, 'line-opacity': 0.55 }}
            />
          </Source>
        )}

        {/* User Location */}
        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
            <div style={{ position: 'relative', width: '42px', height: '42px' }}>
              {[0, 1, 2].map((ring) => (
                <span
                  key={ring}
                  style={{
                    position: 'absolute', left: '50%', top: '50%', width: `${26 + ring * 9}px`, height: `${26 + ring * 9}px`,
                    borderRadius: '999px', border: '2px solid rgba(37, 99, 235, 0.65)',
                    background: 'rgba(59, 130, 246, 0.10)', transform: 'translate(-50%, -50%)',
                    animation: `user-ring-grow ${2.2 + ring * 0.45}s ease-out infinite`, animationDelay: `${ring * 0.35}s`,
                  }}
                />
              ))}
              <div style={{
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                width: '22px', height: '22px', background: '#2563eb',
                borderRadius: '50%', border: '4px solid white', boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.22), 0 0 22px #3b82f699'
              }} />
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
    </div>
  );
}
