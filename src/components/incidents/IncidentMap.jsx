import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
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

  for (let index = 0; index <= points; index += 1) {
    const bearing = (index / points) * Math.PI * 2;
    const pointLat = Math.asin(
      Math.sin(lat) * Math.cos(distance)
      + Math.cos(lat) * Math.sin(distance) * Math.cos(bearing)
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
  zoom = 12.8,
  userLocation,
  showRadius = false,
  radiusKm = 1,
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
    zoom: zoom || 12.8,
    pitch: 48,
    bearing: -15
  });

  // Automatically fly map camera with fixed 3D tilt
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom,
        pitch: 48,
        bearing: -15,
        duration: 1800,
        essential: true
      });
    }
  }, [userLocation, zoom]);

  useEffect(() => {
    if (center && mapRef.current) {
      const targetLat = center[0] - 0.003;
      mapRef.current.flyTo({
        center: [center[1], targetLat],
        zoom,
        pitch: 48,
        bearing: -15,
        duration: 1200,
        essential: true
      });
    }
  }, [center, zoom]);

  const add3DBuildingsLayer = () => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    if (!map) return;

    if (map.getLayer('3d-buildings')) return;

    const layers = map.getStyle().layers;
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    try {
      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 11,
          paint: {
            'fill-extrusion-color': '#111622',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              11,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              11,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.75
          }
        },
        labelLayerId
      );
    } catch (e) {
      console.warn("3D buildings layer add warning:", e);
    }
  };

  const visibleMarkers = useMemo(() => spreadOverlappingIncidents(incidents), [incidents]);
  const radiusCircleGeoJSON = useMemo(
    () => showRadius ? createRadiusCircle(userLocation, radiusKm) : null,
    [showRadius, userLocation, radiusKm]
  );

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', height: height === '100%' ? 'calc(100vh - 64px)' : height, minHeight: '480px' }} 
      className={`overflow-hidden bg-[#05070a] border border-white/10 ${className} relative text-white select-none`}
    >
      <style>{`
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
        onLoad={add3DBuildingsLayer}
        minPitch={40}
        maxPitch={55}
        minZoom={9}
        maxZoom={17}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%', minHeight: '480px' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={true} />

        {radiusCircleGeoJSON && (
          <Source id="user-radius-area" type="geojson" data={radiusCircleGeoJSON}>
            <Layer id="user-radius-fill" type="fill" paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.08 }} />
            <Layer id="user-radius-line" type="line" paint={{ 'line-color': '#2563eb', 'line-width': 2, 'line-opacity': 0.7 }} />
          </Source>
        )}

        {/* 1. User Physical GPS Location Marker */}
        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
            <div className="relative h-[42px] w-[42px]" title="La tua posizione">
              {[0, 1, 2].map(ring => (
                <span
                  key={ring}
                  className="absolute left-1/2 top-1/2 rounded-full border-2 border-blue-500/70 bg-blue-500/10"
                  style={{
                    width: `${26 + ring * 9}px`,
                    height: `${26 + ring * 9}px`,
                    animation: `user-ring-grow ${2.2 + ring * 0.45}s ease-out infinite`,
                    animationDelay: `${ring * 0.35}s`,
                  }}
                />
              ))}
              <span className="absolute left-1/2 top-1/2 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.22),0_0_22px_rgba(59,130,246,0.6)]" />
            </div>
          </Marker>
        )}

        {/* 2. Sleek Citizen Emoji-Only Map Markers */}
        {visibleMarkers.map(({ incident, markerLatitude, markerLongitude }) => {
          const cfg = TYPE_CONFIG[incident.type] || TYPE_CONFIG.other;

          return (
            <Marker
              key={incident.id}
              latitude={markerLatitude}
              longitude={markerLongitude}
              anchor="center"
              onClick={e => {
                e.originalEvent.stopPropagation();
                if (onIncidentClick) onIncidentClick(incident);
              }}
            >
              <div 
                title={`${incident.title} - ${incident.address || incident.city}`} 
                className="cursor-pointer group flex items-center justify-center"
              >
                <div className="w-9.5 h-9.5 rounded-full bg-[#0d1017]/95 border-2 border-white/30 shadow-2xl flex items-center justify-center text-base transition-all duration-300 transform group-hover:scale-130 group-hover:border-[#10b981] group-hover:shadow-emerald-500/50">
                  <span>{cfg.emoji || '⚠️'}</span>
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
