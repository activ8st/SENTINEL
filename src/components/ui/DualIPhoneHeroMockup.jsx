import React from 'react';
import { AlertTriangle, MapPin, Search, Navigation, ShieldCheck, CheckCircle2, Radio, Compass, Flame, Car, CloudLightning } from 'lucide-react';

export default function DualIPhoneHeroMockup() {
  return (
    <div className="relative w-full flex items-center justify-center p-1 sm:p-4 select-none overflow-hidden">
      
      {/* Hyper-Depth Ambient Glow Layers */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/30 via-emerald-600/15 to-amber-500/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-[#10b981]/20 blur-[90px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Proportional Container - Fully Fluid for Mobile & Desktop */}
      <div className="relative w-full max-w-[360px] xs:max-w-[430px] sm:max-w-[500px] md:max-w-[540px] aspect-[4/4.4] flex items-center justify-center py-2 sm:py-6">
        
        {/* ========================================================================= */}
        {/* PHONE 2 (BACKGROUND, LEFT) - Apple Keynote Citizen-Style Feed */}
        {/* ========================================================================= */}
        <div className="absolute left-[0%] top-[4%] w-[52%] aspect-[9/19.5] rounded-[2.6rem] sm:rounded-[3.2rem] bg-gradient-to-b from-slate-700 via-slate-900 to-black p-[3.5px] border border-white/25 shadow-[0_25px_70px_rgba(0,0,0,0.95)] transform -rotate-6 translate-y-2 transition-all duration-500 z-10">
          
          {/* Titanium Outer Frame & Inner OLED Display */}
          <div className="w-full h-full rounded-[2.4rem] sm:rounded-[3.0rem] bg-[#07090e] ring-1 ring-white/20 overflow-hidden flex flex-col relative text-white shadow-inner">
            
            {/* Specular Glass Diagonal Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-30" />

            {/* Apple Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 sm:w-26 h-4.5 sm:h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.95)] border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0d] border border-white/20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#111116]" />
            </div>

            {/* iOS Status Bar */}
            <div className="pt-2.5 px-3.5 flex items-center justify-between text-[8.5px] sm:text-[10px] font-black opacity-90 shrink-0 z-30">
              <span className="tracking-tight">09:41</span>
              <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px]">
                <span className="font-black text-[#10b981]">5G</span>
                <div className="w-4 h-2 border border-white/70 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* Feed Top Navigation Bar */}
            <div className="px-3 pt-2 pb-2 flex items-center justify-between border-b border-white/10 shrink-0 bg-[#0a0c12]/95 backdrop-blur-md z-30">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span className="font-extrabold text-[9.5px] sm:text-[11px] tracking-tight">Sentinel Feed</span>
              </div>
              <span className="text-[7.5px] sm:text-[8.5px] bg-[#10b981] text-black px-2 py-0.5 rounded-full font-black tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                LIVE 24/7
              </span>
            </div>

            {/* Feed Cards - Sleek Citizen-Style High-Contrast Render */}
            <div className="flex-1 p-2 sm:p-2.5 space-y-2 overflow-hidden text-left bg-[#05070b]">
              
              {/* Card 1 - Borseggio Metro Cordusio */}
              <div className="p-2.5 rounded-2xl bg-[#0e111a] border border-red-500/50 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500" />
                <div className="flex items-center justify-between mb-1.5 pl-1">
                  <span className="text-[8px] font-black text-red-400 bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-md tracking-wider">
                    🚨 CRIMINI
                  </span>
                  <span className="text-[7.5px] text-white/50 font-bold">14m fa</span>
                </div>
                <div className="text-[9px] sm:text-[10.5px] font-extrabold text-white leading-snug mb-1 pl-1">
                  Borseggi Confermato — Metro Cordusio
                </div>
                <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] text-white/70 pl-1 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1 font-semibold truncate max-w-[65%]">
                    <MapPin className="w-2.5 h-2.5 text-[#10b981] shrink-0" /> Cordusio, Milano
                  </span>
                  <span className="text-[#10b981] font-black bg-[#10b981]/20 border border-[#10b981]/40 px-1.5 py-0.5 rounded-md">
                    344m
                  </span>
                </div>
              </div>

              {/* Card 2 - Protezione Civile */}
              <div className="p-2.5 rounded-2xl bg-[#0e111a] border border-emerald-500/40 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#10b981]" />
                <div className="flex items-center justify-between mb-1.5 pl-1">
                  <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-md tracking-wider">
                    ⛈️ METEO UFFICIALE
                  </span>
                  <span className="text-[7.5px] text-white/50 font-bold">11m fa</span>
                </div>
                <div className="text-[9px] sm:text-[10.5px] font-extrabold text-white leading-snug mb-1 pl-1">
                  Bollettino Protezione Civile — Allerta Gialla
                </div>
                <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] text-white/70 pl-1 pt-1 border-t border-white/5">
                  <span className="font-semibold text-gray-300">Milano & Veneto</span>
                  <span className="text-[#10b981] font-black bg-[#10b981]/20 border border-[#10b981]/40 px-1.5 py-0.5 rounded-md">
                    0m
                  </span>
                </div>
              </div>

              {/* Card 3 - Viabilità */}
              <div className="p-2.5 rounded-2xl bg-[#0e111a] border border-amber-500/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                <div className="flex items-center justify-between mb-1.5 pl-1">
                  <span className="text-[8px] font-black text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md tracking-wider">
                    🚦 VIABILITÀ
                  </span>
                  <span className="text-[7.5px] text-white/50 font-bold">4m fa</span>
                </div>
                <div className="text-[9px] sm:text-[10.5px] font-extrabold text-white leading-snug mb-1 pl-1">
                  Lavori Stradali & Deviazione
                </div>
                <div className="text-[7.5px] text-emerald-400 font-bold pl-1">Via Dante · 374m</div>
              </div>

            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-1.5 pt-0.5 shrink-0 flex justify-center bg-[#05070b]">
              <div className="w-14 sm:w-20 h-1 bg-white/60 rounded-full" />
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHONE 1 (FOREGROUND, RIGHT) - iPhone 17 Pro 3D Map Citizen Interface */}
        {/* ========================================================================= */}
        <div className="absolute right-[0%] top-[0%] w-[58%] aspect-[9/19.5] rounded-[2.8rem] sm:rounded-[3.4rem] bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 p-[4px] border border-white/35 shadow-[0_35px_90px_rgba(0,0,0,0.98)] transform rotate-2 transition-all duration-500 z-20">
          
          {/* Inner OLED Glass & Metallic Rim */}
          <div className="w-full h-full rounded-[2.5rem] sm:rounded-[3.1rem] bg-[#04060a] ring-1 ring-white/30 overflow-hidden flex flex-col relative text-white shadow-2xl">
            
            {/* Specular Glass Diagonal Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent pointer-events-none z-40" />

            {/* Apple Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-22 sm:w-28 h-5 sm:h-5.5 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-[0_3px_12px_rgba(0,0,0,0.98)] border border-white/20">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0d] border border-white/20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#111116]" />
            </div>

            {/* iOS Status Bar */}
            <div className="pt-2.5 px-4 flex items-center justify-between text-[9px] sm:text-[10.5px] font-black opacity-95 shrink-0 z-40">
              <span className="tracking-tight">09:41</span>
              <div className="flex items-center gap-1.5 text-[8px] sm:text-[9.5px]">
                <span className="text-[#10b981] font-black">5G</span>
                <div className="w-4.5 h-2 border border-white/80 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* 3D Map Viewport Area */}
            <div className="flex-1 relative bg-[#070910] overflow-hidden">
              
              {/* Rich 3D Dark Map Vector Rendering */}
              <div className="absolute inset-0 opacity-80">
                {/* City Block Extrusions Background */}
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="streetGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* City Blocks (3D Extruded Buildings) */}
                  <rect x="20" y="30" width="60" height="50" rx="6" fill="#111622" stroke="#1f293d" strokeWidth="1.5" />
                  <rect x="95" y="20" width="70" height="40" rx="6" fill="#111622" stroke="#1f293d" strokeWidth="1.5" />
                  <rect x="180" y="45" width="55" height="65" rx="6" fill="#111622" stroke="#1f293d" strokeWidth="1.5" />

                  <rect x="15" y="110" width="75" height="60" rx="6" fill="#111622" stroke="#1f293d" strokeWidth="1.5" />
                  <rect x="105" y="140" width="65" height="55" rx="6" fill="#111622" stroke="#1f293d" strokeWidth="1.5" />

                  {/* Main Glowing Arteries */}
                  <path d="M-10 95 L 260 95" stroke="url(#streetGlow)" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <path d="M90 -10 L 90 280" stroke="url(#streetGlow)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                  <path d="M175 -10 L 175 280" stroke="#334155" strokeWidth="2.5" strokeDasharray="4 3" fill="none" />

                  {/* Radar Sonar Waves */}
                  <circle cx="90" cy="95" r="48" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" fill="#10b981" fillOpacity="0.05" strokeDasharray="3 3" />
                  <circle cx="90" cy="95" r="75" stroke="#10b981" strokeWidth="1" strokeOpacity="0.25" fill="none" />
                </svg>
              </div>

              {/* Glassmorphic Search Header (Inside Screen) */}
              <div className="absolute top-2.5 left-2.5 right-2.5 bg-[#0b0e17]/95 backdrop-blur-xl border border-[#10b981]/50 p-2 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-30">
                <div className="flex items-center gap-2 text-[8.5px] sm:text-[10px] font-black text-white truncate">
                  <Search className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  <span className="truncate">Milano · Piazza Duomo</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[7.5px] font-black text-[#10b981]">RADAR</span>
                </div>
              </div>

              {/* 3D Pin 1 (Green Navigation & Safe Corridor) */}
              <div className="absolute top-[34%] left-[36%] -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="relative">
                  <div className="absolute -inset-3 bg-[#10b981]/40 rounded-full animate-ping" />
                  <div className="w-7 sm:w-9 h-7 sm:h-9 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,1)] text-black">
                    <Navigation className="w-3.5 sm:w-4.5 h-3.5 sm:h-4.5 fill-black" />
                  </div>
                </div>
              </div>

              {/* 3D Pin 2 (Red Crime Alert - Cordusio) */}
              <div className="absolute top-[52%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="relative">
                  <div className="absolute -inset-3 bg-red-500/50 rounded-full animate-ping delay-300" />
                  <div className="w-7 sm:w-8.5 h-7 sm:h-8.5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,1)] text-white">
                    <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-white" />
                  </div>
                </div>
              </div>

              {/* Street Name Badge */}
              <div className="absolute top-[22%] left-[8%] bg-[#10b981]/25 border border-[#10b981]/50 px-2 py-0.5 rounded-lg text-[7.5px] font-black text-emerald-300 backdrop-blur-md shadow-md z-20">
                Via Montenapoleone
              </div>

              {/* 3D Map Layer Selector Pill */}
              <div className="absolute top-[35%] right-2.5 flex flex-col gap-1 z-30">
                <div className="w-6 sm:w-7 h-6 sm:h-7 bg-[#0b0e17]/95 border border-[#10b981]/60 rounded-xl flex items-center justify-center text-[8px] sm:text-[9.5px] font-black text-[#10b981] shadow-2xl backdrop-blur-md">
                  3D
                </div>
              </div>

              {/* ========================================================================= */}
              {/* 100% CONTAINED SLEEK CITIZEN ALERT CARD (STRICTLY INSIDE PHONE BEZEL) */}
              {/* ========================================================================= */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-[#0b0e17]/98 border border-[#10b981]/60 p-2.5 sm:p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex items-center justify-between gap-2 z-30">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 bg-amber-500/25 rounded-xl flex items-center justify-center border border-amber-500/50 shrink-0 text-amber-400 shadow">
                    <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[10.5px] font-black text-white truncate leading-tight">
                      Lavori & Deviazione
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-[#10b981] font-extrabold truncate mt-0.5">
                      Fonte Ufficiale · 250m
                    </div>
                  </div>
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] font-black text-black bg-[#10b981] px-2 py-1 rounded-lg shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  VERIFICATO
                </span>
              </div>

            </div>

            {/* iOS Bottom Navigation Bar */}
            <div className="h-9 sm:h-10 border-t border-white/10 bg-[#07090e] flex items-center justify-around px-3 shrink-0 z-30">
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#10b981] font-black">
                <Compass className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Mappa</span>
              </div>
              <div className="text-[9px] text-white/50 font-bold">Feed</div>
              <div className="text-[9px] text-white/50 font-bold">Profilo</div>
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-1.5 pt-0.5 shrink-0 flex justify-center bg-[#07090e] z-30">
              <div className="w-16 sm:w-22 h-1 bg-white/70 rounded-full" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
