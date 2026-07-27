import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
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
  showRadius = false,
  radiusKm = 5,
  height = '100%',
  onIncidentClick,
  routeCoords = null,
  routeTarget = null,
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

  // Pan to center when props change
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

  // Mapbox HD Vector Styles
  const mapStyle = isDark 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/navigation-day-v1';

  // GeoJSON for Route
  const routeGeoJSON = useMemo(() => {
    if (!routeCoords || routeCoords.length < 2) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeCoords.map(c => [c[1], c[0]])
      }
    };
  }, [routeCoords]);

  const visibleMarkers = useMemo(() => spreadOverlappingIncidents(incidents), [incidents]);

  const containerStyle = height === '100%' 
    ? { position: 'relative', width: '100%', height: '100%', minHeight: '380px' } 
    : { height, width: '100%', minHeight: '380px', position: 'relative' };

  return (
    <div ref={containerRef} style={containerStyle} className={`overflow-hidden bg-[#090b10] border border-white/10 ${className}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="bottom-right" />

        {/* User Location Marker */}
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

        {/* Route Line */}
        {routeGeoJSON && (
          <Source type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-layer"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#10b981',
                'line-width': 5,
                'line-opacity': 0.85
              }}
            />
          </Source>
        )}

        {/* Incident Markers */}
        {visibleMarkers.map(({ incident, markerLatitude, markerLongitude }) => {
          const typeConf = TYPE_CONFIG[incident.type] || TYPE_CONFIG.altro;
          const isTarget = routeTarget && routeTarget.id === incident.id;

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
              <div className={`cursor-pointer group relative transition-transform duration-200 hover:scale-125 ${isTarget ? 'scale-125 z-30' : 'z-10'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-2xl border-2 transition-all ${
                  isTarget ? 'bg-[#10b981] border-white ring-4 ring-[#10b981]/40' : 'bg-[#0f1117] border-white/30 hover:border-[#10b981]'
                }`}>
                  {typeConf.icon || '⚠️'}
                </div>
                
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                  <div className="bg-[#0c0c0c] border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl font-bold">
                    {incident.title}
                  </div>
                  <div className="w-2 h-2 bg-[#0c0c0c] rotate-45 -mt-1 border-r border-b border-white/20" />
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
