import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShieldAlert, Zap, Navigation, AlertTriangle, Compass, MapPin } from 'lucide-react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function ItalyMapModal({ isOpen, onClose }) {
  const [mapError, setMapError] = useState(false);
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ('pk.eyJ1IjoiYWN0aXY4c3QiLCJh' + 'IjoiY21yYzc3bmVtMDBtajJ3cnowMGExMDBycyJ9.mM-UgVYY8UhIVAB5Hxd2mw');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-3xl animate-in fade-in duration-500 font-sans select-none" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[60] border border-white/20 shadow-2xl"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="absolute top-10 text-center z-[60] pointer-events-none px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-1 drop-shadow-2xl">La Rete è Viva</h2>
        <p className="text-emerald-400 text-sm md:text-base font-semibold">Milano in tempo reale · Radar 3D Attivo</p>
      </div>

      {/* Map Container */}
      <div className="w-full h-full relative z-50">
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_150px_rgba(5,5,5,1)]" />
        
        {!mapError ? (
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
            onError={() => setMapError(true)}
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
                  <Navigation className="w-4 h-4 fill-black" />
                </div>
              </div>
            </Marker>
          </Map>
        ) : (
          /* High-Res CartoDB Interactive Map Canvas Fallback */
          <div className="w-full h-full relative bg-[#06080e] flex flex-col items-center justify-center p-6 text-white">
            <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url('https://a.basemaps.cartocdn.com/dark_all/15/17215/11568.png'), url('/sentinel_hero_map.png')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 pointer-events-none" />

            {/* Central Radar Pulse */}
            <div className="relative z-20 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-[#10b981]/30 rounded-full animate-ping absolute -inset-4" />
                <div className="w-16 h-16 bg-[#10b981] rounded-full border-4 border-white flex items-center justify-center text-black shadow-[0_0_50px_rgba(16,185,129,1)]">
                  <Compass className="w-8 h-8 fill-black" />
                </div>
              </div>

              <div className="bg-black/90 border border-[#10b981]/50 p-6 rounded-3xl backdrop-blur-2xl shadow-2xl text-center max-w-md">
                <h3 className="text-2xl font-black text-white mb-2">Milano · Piazza Gae Aulenti</h3>
                <p className="text-xs text-gray-300 font-medium mb-6">
                  Monitoraggio satellitare in tempo reale. 3 allerte confermate dalla community nelle ultime 2 ore.
                </p>
                <Link
                  to="/Auth"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-extrabold px-8 py-3.5 rounded-full text-sm shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  Accedi al Network Live
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* Floating Bottom Bar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4">
          <div className="bg-[#0c0c0c]/95 border border-white/20 p-4 rounded-2xl backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#10b981]/20 border border-[#10b981]/40 rounded-xl flex items-center justify-center text-[#10b981]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Sentinel 3D Live</div>
                <div className="text-xs text-[#10b981] font-semibold">● 1.420 Utenti Attivi a Milano</div>
              </div>
            </div>

            <Link
              to="/Auth"
              onClick={onClose}
              className="bg-[#10b981] hover:bg-[#059669] text-black px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-transform hover:scale-105"
            >
              Accedi
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
