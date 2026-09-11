import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TYPE_CONFIG } from '@/components/data/mockData';
import { UserRound } from 'lucide-react';

const INCIDENT_SOURCE_ID = 'incident-points';
const CLUSTER_LAYER_ID = 'incident-clusters';
const CLUSTER_COUNT_LAYER_ID = 'incident-cluster-count';
const POINT_LAYER_ID = 'incident-point';
const POINT_ICON_LAYER_ID = 'incident-point-icon';
const NATIONAL_CLUSTER_MAX_ZOOM = 8;

const clusterLayer = {
  id: CLUSTER_LAYER_ID,
  type: 'circle',
  source: INCIDENT_SOURCE_ID,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': '#0d1017',
    'circle-stroke-color': '#10b981',
    'circle-stroke-width': 3,
    'circle-opacity': 0.96,
    'circle-radius': [
      'step', ['get', 'point_count'],
      20,
      10, 24,
      50, 30,
      200, 38,
      500, 46,
    ],
  },
};

const clusterCountLayer = {
  id: CLUSTER_COUNT_LAYER_ID,
  type: 'symbol',
  source: INCIDENT_SOURCE_ID,
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-size': 13,
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
  },
  paint: {
    'text-color': '#ffffff',
  },
};

const pointLayer = {
  id: POINT_LAYER_ID,
  type: 'circle',
  source: INCIDENT_SOURCE_ID,
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#0d1017',
    'circle-radius': 18,
    'circle-stroke-color': [
      'match', ['get', 'type'],
      'crime', '#ef4444',
      'fire', '#f97316',
      'accident', '#f59e0b',
      'medical', '#f43f5e',
      'suspicious', '#a855f7',
      'traffic', '#10b981',
      'weather', '#3b82f6',
      '#94a3b8',
    ],
    'circle-stroke-width': 2,
    'circle-opacity': 0.96,
  },
};

const pointIconLayer = {
  id: POINT_ICON_LAYER_ID,
  type: 'symbol',
  source: INCIDENT_SOURCE_ID,
  filter: ['!', ['has', 'point_count']],
  layout: {
    'icon-image': ['get', 'iconId'],
    'icon-size': 1,
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
  },
};

const visualCoordinatesFor = (incidents = []) => {
  const groups = new globalThis.Map();
  const coordinates = new globalThis.Map();

  incidents.forEach(incident => {
    const latitude = Number(incident.latitude);
    const longitude = Number(incident.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const key = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
    const group = groups.get(key) || [];
    group.push(incident);
    groups.set(key, group);
  });

  groups.forEach(group => {
    group
      .sort((left, right) => String(left.id).localeCompare(String(right.id)))
      .forEach((incident, index) => {
        const latitude = Number(incident.latitude);
        const longitude = Number(incident.longitude);
        if (index === 0) {
          coordinates.set(String(incident.id), [longitude, latitude]);
          return;
        }

        const angle = index * Math.PI * (3 - Math.sqrt(5));
        const radiusMeters = Math.min(190, 32 * Math.sqrt(index));
        const latitudeOffset = (radiusMeters / 111320) * Math.sin(angle);
        const longitudeScale = Math.max(0.2, Math.cos(latitude * Math.PI / 180));
        const longitudeOffset = (radiusMeters / (111320 * longitudeScale)) * Math.cos(angle);
        coordinates.set(
          String(incident.id),
          [longitude + longitudeOffset, latitude + latitudeOffset]
        );
      });
  });

  return coordinates;
};

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

export default function IncidentMap({
  incidents = [],
  center,
  zoom = 12.8,
  userLocation,
  showRadius = false,
  radiusKm = 1,
  frameUserRadius = false,
  height = '100%',
  onIncidentClick,
  className = 'rounded-xl',
}) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ('pk.eyJ1IjoiYWN0aXY4c3QiLCJh' + 'IjoiY21yYzc3bmVtMDBtajJ3cnowMGExMDBycyJ9.mM-UgVYY8UhIVAB5Hxd2mw');
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapCursor, setMapCursor] = useState('grab');

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
      const targetLat = center[0];
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

  useEffect(() => {
    if (!mapLoaded || !frameUserRadius || !userLocation || !mapRef.current) return;
    const circle = createRadiusCircle(userLocation, showRadius ? radiusKm : 1);
    const points = circle.geometry.coordinates[0];
    const lngs = points.map(point => point[0]);
    const lats = points.map(point => point[1]);
    mapRef.current.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 48, pitch: 0, bearing: 0, duration: 1000 }
    );
  }, [mapLoaded, frameUserRadius, userLocation, showRadius, radiusKm]);

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

  const addIncidentIcons = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    Object.entries(TYPE_CONFIG).forEach(([type, config]) => {
      const iconId = `incident-${type}`;
      if (map.hasImage(iconId)) return;

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, 64, 64);
      context.font = '38px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(config.emoji || '!', 32, 34);
      map.addImage(iconId, context.getImageData(0, 0, 64, 64), { pixelRatio: 2 });
    });
  };

  const incidentsById = useMemo(
    () => new globalThis.Map(incidents.map(incident => [String(incident.id), incident])),
    [incidents]
  );
  const visualCoordinates = useMemo(() => visualCoordinatesFor(incidents), [incidents]);
  const incidentGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: incidents
      .filter(incident => Number.isFinite(Number(incident.latitude)) && Number.isFinite(Number(incident.longitude)))
      .map(incident => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: visualCoordinates.get(String(incident.id)),
        },
        properties: {
          incidentId: String(incident.id),
          type: incident.type || 'other',
          iconId: `incident-${TYPE_CONFIG[incident.type] ? incident.type : 'other'}`,
        },
      })),
  }), [incidents, visualCoordinates]);
  const radiusCircleGeoJSON = useMemo(
    () => showRadius ? createRadiusCircle(userLocation, radiusKm) : null,
    [showRadius, userLocation, radiusKm]
  );

  const handleMapClick = event => {
    const feature = event.features?.[0];
    if (!feature) return;

    if (feature.layer.id === CLUSTER_LAYER_ID) {
      const source = mapRef.current?.getMap().getSource(INCIDENT_SOURCE_ID);
      if (!source) return;
      source.getClusterExpansionZoom(feature.properties.cluster_id, (error, expansionZoom) => {
        if (error || !mapRef.current) return;
        mapRef.current.easeTo({
          center: feature.geometry.coordinates,
          zoom: Math.min(expansionZoom, 17),
          duration: 700,
        });
      });
      return;
    }

    const incident = incidentsById.get(String(feature.properties.incidentId));
    if (incident && onIncidentClick) onIncidentClick(incident);
  };

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
        onClick={handleMapClick}
        onMouseEnter={() => setMapCursor('pointer')}
        onMouseLeave={() => setMapCursor('grab')}
        interactiveLayerIds={[CLUSTER_LAYER_ID, POINT_LAYER_ID, POINT_ICON_LAYER_ID]}
        cursor={mapCursor}
        onLoad={() => { addIncidentIcons(); add3DBuildingsLayer(); setMapLoaded(true); }}
        minPitch={0}
        maxPitch={55}
        minZoom={3}
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

        <Source
          id={INCIDENT_SOURCE_ID}
          type="geojson"
          data={incidentGeoJSON}
          cluster
          clusterMaxZoom={NATIONAL_CLUSTER_MAX_ZOOM}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...pointLayer} />
          <Layer {...pointIconLayer} />
        </Source>

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
              <span aria-label="La tua posizione" className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-lg"><UserRound size={20} /></span>
            </div>
          </Marker>
        )}

      </Map>
    </div>
  );
}
