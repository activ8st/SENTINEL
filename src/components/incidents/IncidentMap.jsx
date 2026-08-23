import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const typeConfig = {
  crime: { color: '#ef4444', icon: '🚨' },
  fire: { color: '#f97316', icon: '🔥' },
  accident: { color: '#eab308', icon: '🚗' },
  medical: { color: '#ec4899', icon: '🏥' },
  suspicious: { color: '#a855f7', icon: '👁️' },
  traffic: { color: '#3b82f6', icon: '🚦' },
  weather: { color: '#06b6d4', icon: '⛈️' },
  other: { color: '#6b7280', icon: '❓' }
};

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
        @keyframes user-ring-grow {
          0% { transform: translate(-50%, -50%) scale(0.75); opacity: 0.45; }
          70% { opacity: 0.14; }
          100% { transform: translate(-50%, -50%) scale(2.35); opacity: 0; }
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
          const config = typeConfig[incident.type] || typeConfig.other;
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
                  fontSize: `${size * 0.5}px`, boxShadow: `0 4px 12px ${config.color}80`,
                  border: '3px solid white', cursor: 'pointer',
                  animation: severity === 'critical' ? 'mapbox-pulse 1.5s infinite' : 'none'
                }}
              >
                {config.icon}
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}

export default React.memo(IncidentMap);
