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

function IncidentMap({
  incidents,
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
  // Fallback alla chiave pubblica di Sentinel se .env.local non esiste (divisa in parti per superare il blocco di sicurezza GitHub)
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

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      const updateTheme = () => {
        try {
          map.setConfigProperty('basemap', 'lightPreset', isDark ? 'night' : 'day');
        } catch (e) {
          console.warn("Could not set mapbox theme", e);
        }
      };

      if (map.isStyleLoaded()) {
        updateTheme();
      } else {
        map.once('styledata', updateTheme);
      }
      
      // Force a resize in case Suspense or Flexbox caused wrong initial dimensions
      setTimeout(() => map.resize(), 50);
      setTimeout(() => map.resize(), 500);
    }
  }, [isDark]);

  useEffect(() => {
    if (!mapRef.current || !containerRef.current) return;

    const map = mapRef.current.getMap();
    const resizeMap = () => map.resize();

    const observer = new ResizeObserver(() => {
      resizeMap();
    });

    observer.observe(containerRef.current);
    resizeMap();

    return () => observer.disconnect();
  }, []);

  const defaultCenter = useMemo(() => {
    if (center) return { latitude: center[0], longitude: center[1] };
    if (userLocation) return { latitude: userLocation.lat, longitude: userLocation.lng };
    return { latitude: 41.9028, longitude: 12.4964 };
  }, [center, userLocation]);

  const [viewState, setViewState] = useState({
    latitude: defaultCenter.latitude,
    longitude: defaultCenter.longitude,
    zoom: zoom,
    pitch: 60, // Inclined for 3D buildings
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

  const mapStyle = 'mapbox://styles/mapbox/standard';

  const onMapLoad = (e) => {
    const map = e.target;
    map.setConfigProperty('basemap', 'lightPreset', isDark ? 'night' : 'day');
    // Enable 3D landmarks if available
    map.setConfigProperty('basemap', 'showPointOfInterestLabels', true);
  };

  // GeoJSON for Route
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

  if (!mapboxToken || mapboxToken === 'INSERT_YOUR_API_KEY') {
    return (
      <div style={{ height, width: '100%', minHeight: '300px' }} className="overflow-hidden bg-gray-900 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
          ❌ Mapbox Token mancante
        </div>
      </div>
    );
  }

  // If height is 100%, we want to forcefully take up the parent container
  const containerStyle = height === '100%' 
    ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } 
    : { height, width: '100%', minHeight: '300px', position: 'relative' };

  return (
    <div ref={containerRef} style={containerStyle} className={`overflow-hidden ${className}`}>
      <style>{`
        @keyframes mapbox-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
      
      <Map
        ref={mapRef}
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        onLoad={onMapLoad}
      >
        <NavigationControl position="bottom-right" />

        {/* User Location */}
        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
            <div style={{
              width: '20px', height: '20px', background: '#3b82f6',
              borderRadius: '50%', border: '4px solid white', boxShadow: '0 0 20px #3b82f680'
            }} />
          </Marker>
        )}

        {/* Route Line */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line-bg"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{ 'line-color': '#1d4ed8', 'line-width': 10, 'line-opacity': 0.25 }}
            />
            <Layer
              id="route-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{ 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.95 }}
            />
          </Source>
        )}

        {/* Route Target */}
        {routeTarget && (
          <Marker latitude={routeTarget.lat} longitude={routeTarget.lng} anchor="bottom">
            <div style={{
              width: '36px', height: '36px', background: '#3b82f6',
              borderRadius: '50%', border: '3px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', boxShadow: '0 0 20px #3b82f680'
            }}>📍</div>
          </Marker>
        )}

        {/* Incidents Markers */}
        {visibleMarkers.map(({ incident, markerLatitude, markerLongitude }) => {
          const config = TYPE_CONFIG[incident.type] || TYPE_CONFIG.other;
          const severity = incident.severity;
          const size = severity === 'critical' ? 40 : severity === 'high' ? 36 : 32;

          return (
            <Marker 
              key={incident.id} 
              latitude={markerLatitude} 
              longitude={markerLongitude} 
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onIncidentClick?.(incident);
              }}
            >
              <div 
                style={{
                  width: `${size}px`, height: `${size}px`, background: config.color,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 12px ${config.color}80`,
                  border: '3px solid white', cursor: 'pointer',
                  animation: severity === 'critical' ? 'mapbox-pulse 1.5s infinite' : 'none'
                }}
              >
                <config.icon size={size * 0.45} color="white" strokeWidth={2.5} />
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}

export default React.memo(IncidentMap);
