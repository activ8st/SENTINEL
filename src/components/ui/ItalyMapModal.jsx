import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLanguageTheme } from '@/context/LanguageThemeContext';

export default function ItalyMapModal({ isOpen, onClose }) {
  const { lang } = useLanguageTheme();
  const isEn = lang === 'en';
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ('pk.eyJ1IjoiYWN0aXY4c3QiLCJh' + 'IjoiY21yYzc3bmVtMDBtajJ3cnowMGExMDBycyJ9.mM-UgVYY8UhIVAB5Hxd2mw');
  const mapRef = useRef(null);

  // ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-3xl animate-in fade-in duration-500 font-sans select-none" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Touch-Friendly Close Button "X" */}
      <button 
        onClick={onClose}
        type="button"
        aria-label="Chiudi mappa 3D"
        className="absolute top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-90 rounded-full flex items-center justify-center text-white transition-all z-[70] border border-white/20 shadow-2xl"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Dynamic Header */}
      <div className="absolute top-6 sm:top-8 text-center z-[60] pointer-events-none px-4">
        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-1 drop-shadow-2xl">
          {isEn ? 'The Network is Live' : 'La Rete è Viva'}
        </h2>
        <p className="text-emerald-400 text-xs md:text-sm font-semibold">
          {isEn ? 'Milan Real-Time · Mapbox 3D Live' : 'Milano in tempo reale · Mapbox 3D Live'}
        </p>
      </div>

      {/* Map Container with Locked 3D Camera */}
      <div className="w-full h-full relative z-50">
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(5,5,5,1)]" />
        
        <Map
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: 9.1899,
            latitude: 45.4642,
            zoom: 12.8,
            pitch: 48,
            bearing: -15
          }}
          onLoad={add3DBuildingsLayer}
          minPitch={40}
          maxPitch={55}
          minZoom={10}
          maxZoom={17}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }}
          interactive={true}
          dragPan={true}
          reuseMaps
        >
          <NavigationControl position="top-right" showCompass={true} />

          {/* Sleek Emoji Pins */}
          <Marker latitude={45.4849} longitude={9.1899} anchor="center">
            <div className="w-10 h-10 rounded-full bg-[#0d1017]/95 border-2 border-white/30 shadow-2xl flex items-center justify-center text-lg">
              <span>🚔</span>
            </div>
          </Marker>

          <Marker latitude={45.4642} longitude={9.1900} anchor="center">
            <div className="w-10 h-10 rounded-full bg-[#0d1017]/95 border-2 border-white/30 shadow-2xl flex items-center justify-center text-lg">
              <span>🚗</span>
            </div>
          </Marker>

          <Marker latitude={45.4510} longitude={9.1740} anchor="center">
            <div className="w-10 h-10 rounded-full bg-[#0d1017]/95 border-2 border-white/30 shadow-2xl flex items-center justify-center text-lg">
              <span>⛈️</span>
            </div>
          </Marker>
        </Map>
      </div>

      {/* Bottom Floating Bar */}
      <div className="absolute bottom-6 z-[60] bg-[#0c0e14]/90 backdrop-blur-md border border-[#10b981]/50 px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl">
        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
        <span className="text-xs font-bold text-white">
          {isEn ? 'Active Network · Milano, Verona, Roma, Napoli, Bologna' : 'Network Attivo · Milano, Verona, Roma, Napoli, Bologna'}
        </span>
        <Link
          to="/MapView"
          onClick={onClose}
          className="ml-2 bg-[#10b981] hover:bg-[#059669] text-black text-xs font-extrabold px-4 py-1.5 rounded-full transition-all hover:scale-105"
        >
          {isEn ? 'Explore Live Map' : 'Esplora Mappa Live'}
        </Link>
      </div>

    </div>
  );
}
