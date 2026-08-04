import React from 'react';
import { AlertTriangle, MapPin, Search, Navigation, ShieldCheck, CheckCircle2, Radio, Compass, Flame, Car, CloudLightning } from 'lucide-react';

export default function DualIPhoneHeroMockup() {
  return (
    <div className="relative w-full flex items-center justify-center p-2 select-none overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/25 via-emerald-500/10 to-amber-500/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Proportional Container - Fully Responsive for Mobile & Desktop */}
      <div className="relative w-full max-w-[360px] xs:max-w-[420px] sm:max-w-[480px] aspect-[4/4.5] flex items-center justify-center py-4">
        
        {/* PHONE 2 (BACKGROUND, LEFT) - Citizen Style Sentinel Feed */}
        <div className="absolute left-[2%] top-[6%] w-[50%] aspect-[9/19.5] rounded-[2.2rem] sm:rounded-[2.8rem] bg-[#18181b] p-[3px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transform -rotate-6 translate-y-2 transition-all duration-500 z-10">
          
          {/* Integrated Titanium Edge Ring */}
          <div className="w-full h-full rounded-[2.0rem] sm:rounded-[2.6rem] bg-[#07080c] ring-1 ring-white/15 overflow-hidden flex flex-col relative text-white">
            
            {/* Authentic Apple Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-18 sm:w-24 h-4 sm:h-4.5 bg-black rounded-full z-30 flex items-center justify-between px-2 shadow-[0_2px_8px_rgba(0,0,0,0.9)] border border-white/15">
              <div className="w-2 h-2 rounded-full bg-[#0a0a0d] border border-white/20 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-[#10b981]" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#111116]" />
            </div>

            {/* Status Bar */}
            <div className="pt-2 px-3 flex items-center justify-between text-[8px] sm:text-[9.5px] font-bold opacity-80 shrink-0 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-1 text-[7.5px] sm:text-[8.5px]">
                <span className="font-extrabold text-[#10b981]">5G</span>
                <div className="w-3.5 h-1.5 border border-white/60 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* Feed Header */}
            <div className="px-2.5 pt-2 pb-1.5 flex items-center justify-between border-b border-white/10 shrink-0 bg-[#0c0d12]">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="font-extrabold text-[9px] sm:text-[10px] tracking-tight">Sentinel Feed</span>
              </div>
              <span className="text-[7px] sm:text-[8px] bg-[#10b981] text-black px-1.5 py-0.5 rounded font-black tracking-wide">
                LIVE
              </span>
            </div>

            {/* Feed UI Cards - Sleek Citizen-Style (Strictly inside Phone) */}
            <div className="flex-1 p-2 space-y-2 overflow-hidden text-left bg-[#050609]">
              
              {/* Card 1 - Crime Alert */}
              <div className="p-2 rounded-xl bg-[#0d1017] border border-red-500/40 shadow-lg relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7.5px] font-black text-red-400 bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 rounded">
                    🚨 CRIMINI
                  </span>
                  <span className="text-[7px] text-white/50 font-bold">14m fa</span>
                </div>
                <div className="text-[8.5px] sm:text-[9.5px] font-black text-white leading-tight mb-1">
                  Borseggi Confermato — Metro Cordusio
                </div>
                <div className="flex items-center justify-between text-[7px] sm:text-[8px] text-white/60">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-2.5 h-2.5 text-[#10b981]" /> Cordusio
                  </span>
                  <span className="text-[#10b981] font-extrabold bg-[#10b981]/15 px-1 py-0.2 rounded">
                    344m
                  </span>
                </div>
              </div>

              {/* Card 2 - Protezione Civile */}
              <div className="p-2 rounded-xl bg-[#0d1017] border border-emerald-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7.5px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    ⛈️ ALLERTA METEO
                  </span>
                  <span className="text-[7px] text-white/50 font-bold">11m fa</span>
                </div>
                <div className="text-[8.5px] sm:text-[9.5px] font-black text-white leading-tight mb-1">
                  Bollettino Protezione Civile
                </div>
                <div className="flex items-center justify-between text-[7px] sm:text-[8px] text-white/60">
                  <span className="font-semibold text-gray-300">Milano & Veneto</span>
                  <span className="text-[#10b981] font-extrabold bg-[#10b981]/15 px-1 py-0.2 rounded">
                    0m
                  </span>
                </div>
              </div>

              {/* Card 3 - Traffic */}
              <div className="p-2 rounded-xl bg-[#0d1017] border border-amber-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7.5px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    🚦 VIABILITÀ
                  </span>
                  <span className="text-[7px] text-white/50 font-bold">4m fa</span>
                </div>
                <div className="text-[8.5px] sm:text-[9.5px] font-black text-white leading-tight mb-1">
                  Lavori Stradali & Deviazione
                </div>
                <div className="text-[7px] text-emerald-400 font-bold">Via Dante · 374m</div>
              </div>

            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-1 pt-0.5 shrink-0 flex justify-center bg-[#050609]">
              <div className="w-12 sm:w-16 h-0.5 bg-white/50 rounded-full" />
            </div>

          </div>
        </div>

        {/* PHONE 1 (FOREGROUND, RIGHT) - iPhone 17 Pro 3D Map Screen */}
        <div className="absolute right-[2%] top-[0%] w-[56%] aspect-[9/19.5] rounded-[2.4rem] sm:rounded-[3rem] bg-[#222328] p-[4px] border border-white/30 shadow-[0_30px_80px_rgba(0,0,0,0.95)] transform rotate-2 transition-all duration-500 z-20">
          
          {/* Inner OLED Glass & Titanium Rim */}
          <div className="w-full h-full rounded-[2.1rem] sm:rounded-[2.7rem] bg-[#05070c] ring-1 ring-white/30 overflow-hidden flex flex-col relative text-white">
            
            {/* Authentic Apple Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 sm:w-26 h-4.5 sm:h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.9)] border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0d] border border-white/20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#111116]" />
            </div>

            {/* Status Bar */}
            <div className="pt-2 px-3.5 flex items-center justify-between text-[8.5px] sm:text-[10px] font-extrabold opacity-90 shrink-0 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-1 text-[7.5px] sm:text-[9px]">
                <span className="text-[#10b981] font-black">5G</span>
                <div className="w-4 h-2 border border-white/70 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* 3D Vector Map UI Canvas */}
            <div className="flex-1 relative bg-[#090c12] overflow-hidden">
              
              {/* Grid Roads & Vector Map Canvas */}
              <svg className="absolute inset-0 w-full h-full opacity-65" xmlns="http://www.w3.org/2000/svg">
                <path d="M-10 60 Q 90 100, 220 70 T 350 150" stroke="#10b981" strokeWidth="4" fill="none" />
                <path d="M40 -10 L 160 300" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.5" fill="none" />
                <path d="M-10 160 L 260 190" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.4" fill="none" />
                <circle cx="130" cy="110" r="40" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" fill="none" strokeDasharray="3 3" />
              </svg>

              {/* Top Search Pill (Inside Phone) */}
              <div className="absolute top-2 left-2 right-2 bg-[#0e111a]/95 backdrop-blur-md border border-[#10b981]/40 p-1.5 rounded-xl flex items-center justify-between shadow-2xl z-10">
                <div className="flex items-center gap-1 text-[8px] sm:text-[9.5px] font-bold text-white truncate">
                  <Search className="w-3 h-3 text-[#10b981] shrink-0" />
                  <span className="truncate">Milano · Network Attivo</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shrink-0" />
              </div>

              {/* Pulsing Pin 1 (Green Safe Nav) */}
              <div className="absolute top-[32%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute -inset-2.5 bg-[#10b981]/40 rounded-full animate-ping" />
                  <div className="w-6 sm:w-7.5 h-6 sm:h-7.5 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.9)] text-black">
                    <Navigation className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-black" />
                  </div>
                </div>
              </div>

              {/* Pulsing Pin 2 (Red Crime Alert) */}
              <div className="absolute top-[50%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute -inset-2.5 bg-red-500/40 rounded-full animate-ping delay-500" />
                  <div className="w-6 sm:w-7 h-6 sm:h-7 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.9)] text-white">
                    <AlertTriangle className="w-3 h-3 fill-white" />
                  </div>
                </div>
              </div>

              {/* Street Label */}
              <div className="absolute top-[20%] left-[8%] bg-[#10b981]/20 border border-[#10b981]/40 px-1.5 py-0.5 rounded text-[7px] font-black text-emerald-400 backdrop-blur-md">
                Via Montenapoleone
              </div>

              {/* 3D Map Control */}
              <div className="absolute top-[36%] right-2 flex flex-col gap-1 z-10">
                <div className="w-5 sm:w-6 h-5 sm:h-6 bg-black/90 border border-[#10b981]/50 rounded-md flex items-center justify-center text-[7.5px] sm:text-[9px] font-black text-[#10b981] shadow-xl">
                  3D
                </div>
              </div>

              {/* 100% CONTAINED Sleek Citizen-Style Live Alert Card (STRICTLY INSIDE PHONE) */}
              <div className="absolute bottom-2 left-2 right-2 bg-[#0c0f17]/95 border border-[#10b981]/50 p-2 rounded-xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-1.5 z-20">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/40 shrink-0 text-amber-400">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8.5px] sm:text-[9.5px] font-black text-white truncate leading-tight">
                      Lavori & Deviazione
                    </div>
                    <div className="text-[7.5px] sm:text-[8px] text-emerald-400 font-bold truncate">
                      Fonte Ufficiale · 250m
                    </div>
                  </div>
                </div>
                <span className="text-[7px] font-black text-black bg-[#10b981] px-1.5 py-0.5 rounded shrink-0">
                  VERIFICATO
                </span>
              </div>

            </div>

            {/* Bottom App Nav */}
            <div className="h-8 sm:h-9 border-t border-white/10 bg-[#080a0f] flex items-center justify-around px-2 shrink-0">
              <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] text-[#10b981] font-black">
                <Compass className="w-3 h-3 text-[#10b981]" />
                <span>Mappa</span>
              </div>
              <div className="text-[8.5px] text-white/50 font-bold">Feed</div>
              <div className="text-[8.5px] text-white/50 font-bold">Profilo</div>
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-1 pt-0.5 shrink-0 flex justify-center bg-[#080a0f]">
              <div className="w-14 sm:w-20 h-0.5 bg-white/60 rounded-full" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
