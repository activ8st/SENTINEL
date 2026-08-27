import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
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
    const radius = Math.min(0.005, 0.0006 + group.length * 0.00015);

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
  zoom = 12.8,
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
    zoom: zoom || 12.8,
    pitch: 48,
    bearing: -15
  });

  // Automatically fly map camera with fixed 3D tilt
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 12.8,
        pitch: 48,
        bearing: -15,
        duration: 1800,
        essential: true
      });
    }
  }, [userLocation]);

  useEffect(() => {
    if (center && mapRef.current) {
      const targetLat = center[0] - 0.003;
      mapRef.current.flyTo({
        center: [center[1], targetLat],
        zoom: 13.5,
        pitch: 48,
        bearing: -15,
        duration: 1200,
        essential: true
      });
    }
  }, [center]);

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

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', height: height === '100%' ? 'calc(100vh - 64px)' : height, minHeight: '480px' }} 
      className={`overflow-hidden bg-[#05070a] border border-white/10 ${className} relative text-white select-none`}
    >
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

        {/* 1. User Physical GPS Location Marker */}
        {userLocation && (
          <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
            <div className="relative flex items-center justify-center" title="La tua Posizione">
              <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
              <span className="w-4.5 h-4.5 rounded-full bg-[#10b981] border-2 border-white shadow-lg shadow-emerald-500/50" />
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
