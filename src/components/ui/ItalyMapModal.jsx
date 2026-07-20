import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShieldAlert, Zap } from 'lucide-react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function ItalyMapModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-3xl animate-in fade-in duration-500 font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[60] border border-white/20"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="absolute top-10 text-center z-[60] pointer-events-none">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 drop-shadow-2xl">La Rete è Viva</h2>
        <p className="text-white/60 text-lg">Milano in tempo reale, sorvegliata dai cittadini.</p>
      </div>

      {/* Map Container */}
      <div className="w-full h-full relative z-50">
        {/* Vignette effect so edges fade into the dark modal */}
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(5,5,5,1)]" />
        
        <Map
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: 9.1899,
            latitude: 45.4839, // Piazza Gae Aulenti
            zoom: 16.5,
            pitch: 65,
            bearing: -20
          }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }}
          interactive={false} // Make it more like a background showcase
          onLoad={(e) => {
            // Enable 3D buildings if available in the dark-v11 style
            const map = e.target;
            if (!map.getLayer('3d-buildings')) {
              map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                  'fill-extrusion-color': '#2a2a2a',
                  'fill-extrusion-height': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    15.05, ['get', 'height']
                  ],
                  'fill-extrusion-base': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    15.05, ['get', 'min_height']
                  ],
                  'fill-extrusion-opacity': 0.8
                }
              });
            }
          }}
        >
          {/* Animated Pins */}
          <Marker latitude={45.4849} longitude={9.1899} anchor="bottom">
            <div className="relative pointer-events-auto">
              <div className="absolute -inset-4 bg-red-500/30 rounded-full animate-ping" />
              <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
            </div>
          </Marker>

          <Marker latitude={45.4820} longitude={9.1880} anchor="bottom">
            <div className="relative pointer-events-auto">
              <div className="absolute -inset-3 bg-[#10b981]/30 rounded-full animate-ping delay-300" />
              <div className="w-8 h-8 bg-[#10b981] rounded-full border-2 border-white shadow-[0_0_30px_rgba(16,185,129,0.8)]" />
            </div>
          </Marker>

          <Marker latitude={45.4830} longitude={9.1920} anchor="bottom">
            <div className="relative pointer-events-auto">
              <div className="absolute -inset-5 bg-orange-500/20 rounded-full animate-ping delay-700" />
              <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.8)]">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>
          </Marker>

        </Map>
      </div>

      {/* Action Button */}
      <div className="absolute bottom-12 z-[60] animate-in slide-in-from-bottom-4 delay-500">
        <Link 
          to="/Auth"
          className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black px-12 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.5)]"
        >
          Accedi al Network
        </Link>
      </div>

    </div>
  );
}
