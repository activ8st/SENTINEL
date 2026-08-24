import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShieldAlert, Zap } from 'lucide-react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function ItalyMapModal({ isOpen, onClose }) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ('pk.eyJ1IjoiYWN0aXY4c3QiLCJh' + 'IjoiY21yYzc3bmVtMDBtajJ3cnowMGExMDBycyJ9.mM-UgVYY8UhIVAB5Hxd2mw');

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-3xl animate-in fade-in duration-500 font-sans select-none" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Clear, Visible, Touch-Friendly Close Button "X" (Top-Right) */}
      <button 
        onClick={onClose}
        type="button"
        aria-label="Chiudi mappa 3D"
        className="absolute top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-90 rounded-full flex items-center justify-center text-white transition-all z-[70] border border-white/20 shadow-2xl"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="absolute top-6 sm:top-8 text-center z-[60] pointer-events-none px-4">
        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-1 drop-shadow-2xl">La Rete è Viva</h2>
        <p className="text-emerald-400 text-xs md:text-sm font-semibold">Milano in tempo reale · Mapbox 3D Live</p>
      </div>

      {/* Map Container */}
      <div className="w-full h-full relative z-50">
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(5,5,5,1)]" />
        
        <Map
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: 9.1899,
            latitude: 45.4839,
            zoom: 16,
            pitch: 60,
            bearing: -20
          }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }}
          interactive={true}
          dragPan={true}
          reuseMaps
        >
          <Marker latitude={45.4849} longitude={9.1899} anchor="bottom">
            <div className="relative pointer-events-auto">
              <div className="absolute -inset-4 bg-red-500/40 rounded-full animate-ping" />
              <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.9)]">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
            </div>
          </Marker>

          <Marker latitude={45.4820} longitude={9.1880} anchor="bottom">
            <div className="relative pointer-events-auto">
              <div className="absolute -inset-3 bg-[#10b981]/40 rounded-full animate-ping delay-300" />
              <div className="w-9 h-9 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.9)] text-black">
                <Zap className="w-4 h-4 fill-black" />
              </div>
            </div>
          </Marker>
        </Map>
      </div>

      {/* Bottom Floating Bar */}
      <div className="absolute bottom-6 z-[60] bg-[#0c0e14]/90 backdrop-blur-md border border-[#10b981]/50 px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl">
        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
        <span className="text-xs font-bold text-white">Network Attivo · Milano & Verona</span>
        <Link
          to="/Auth"
          onClick={onClose}
          className="ml-2 bg-[#10b981] hover:bg-[#059669] text-black text-xs font-extrabold px-4 py-1.5 rounded-full transition-all hover:scale-105"
        >
          Accedi Ora
        </Link>
      </div>

    </div>
  );
}
