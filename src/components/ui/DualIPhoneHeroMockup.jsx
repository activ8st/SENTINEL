import React from 'react';
import { ShieldAlert, AlertTriangle, MapPin, Search, Bell, Navigation, ShieldCheck } from 'lucide-react';

export default function DualIPhoneHeroMockup() {
  return (
    <div className="relative w-full flex items-center justify-center p-2 sm:p-4">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/20 via-transparent to-amber-500/15 blur-[80px] rounded-full pointer-events-none" />

      {/* Scaled Proportional Phone Container */}
      <div className="relative w-full max-w-[420px] aspect-[4/4.5] flex items-center justify-center py-4">
        
        {/* PHONE 2 (BACKGROUND, LEFT) - iPhone 17 Pro Feed Screen */}
        <div className="absolute left-[0%] top-[4%] w-[52%] aspect-[9/19.5] rounded-[2.6rem] bg-[#1c1c1e] p-[3px] border border-slate-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transform -rotate-8 translate-y-3 transition-transform duration-500 z-10">
          
          {/* Physical Side Buttons (Left iPhone) */}
          <div className="absolute -left-[5px] top-14 w-[3px] h-6 bg-slate-400 rounded-l-sm" /> {/* Action button */}
          <div className="absolute -left-[5px] top-24 w-[3px] h-10 bg-slate-400 rounded-l-sm" /> {/* Vol Up */}
          <div className="absolute -left-[5px] top-36 w-[3px] h-10 bg-slate-400 rounded-l-sm" /> {/* Vol Down */}
          <div className="absolute -right-[5px] top-28 w-[3px] h-14 bg-slate-400 rounded-r-sm" /> {/* Power */}

          {/* Inner OLED Glass & Titanium Rim */}
          <div className="w-full h-full rounded-[2.4rem] bg-[#050507] ring-1 ring-white/20 overflow-hidden flex flex-col relative text-white">
            
            {/* Dynamic Island Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 flex items-center justify-between px-2 shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>

            {/* Status Bar */}
            <div className="pt-2.5 px-4 flex items-center justify-between text-[9px] font-semibold text-white/50 shrink-0 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-1 text-[8px]">
                <span>5G</span>
                <div className="w-3.5 h-1.5 border border-white/40 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* Feed Header */}
            <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-[#10b981] flex items-center justify-center">
                  <ShieldAlert className="w-3 h-3 text-black" />
                </div>
                <span className="font-bold text-[10px] tracking-tight">Sentinel Feed</span>
              </div>
              <span className="text-[8px] bg-[#10b981]/15 text-[#10b981] px-1.5 py-0.5 rounded font-bold border border-[#10b981]/30">
                LIVE
              </span>
            </div>

            {/* Feed UI Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-hidden text-left bg-[#050507]">
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-bold text-[#f59e0b] bg-[#f59e0b]/15 px-1 py-0.5 rounded">
                    LAVORI STRADALI
                  </span>
                  <span className="text-[7px] text-white/40">2 min</span>
                </div>
                <div className="text-[9px] font-bold text-white mb-0.5">Deviazione Corsia Est</div>
                <div className="text-[8px] text-white/60 font-light flex items-center gap-1">
                  <MapPin className="w-2 h-2 text-[#10b981]" />
                  A 250m dalla rotta
                </div>
              </div>

              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8px] font-bold text-[#10b981] bg-[#10b981]/15 px-1 py-0.5 rounded">
                    FONTE UFFICIALE
                  </span>
                  <span className="text-[7px] text-white/40">10 min</span>
                </div>
                <div className="text-[9px] font-bold text-white mb-0.5">Protezione Civile</div>
                <div className="text-[8px] text-white/60 font-light">Allerta Meteo Locale</div>
              </div>
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-1 pt-0.5 shrink-0 flex justify-center">
              <div className="w-16 h-0.5 bg-white/40 rounded-full" />
            </div>

          </div>
        </div>

        {/* PHONE 1 (FOREGROUND, RIGHT) - iPhone 17 Pro Map Screen */}
        <div className="absolute right-[0%] top-[0%] w-[58%] aspect-[9/19.5] rounded-[2.8rem] bg-[#2a2a2d] p-[3.5px] border border-slate-400/60 shadow-[0_30px_70px_rgba(0,0,0,0.95)] transform rotate-4 transition-transform duration-500 z-20">
          
          {/* Physical Side Buttons (Right iPhone) */}
          <div className="absolute -left-[5px] top-14 w-[3.5px] h-6 bg-slate-300 rounded-l-sm" /> {/* Action */}
          <div className="absolute -left-[5px] top-24 w-[3.5px] h-10 bg-slate-300 rounded-l-sm" /> {/* Vol Up */}
          <div className="absolute -left-[5px] top-36 w-[3.5px] h-10 bg-slate-300 rounded-l-sm" /> {/* Vol Down */}
          <div className="absolute -right-[5px] top-28 w-[3.5px] h-14 bg-slate-300 rounded-r-sm" /> {/* Power */}

          {/* Inner OLED Glass & Titanium Rim */}
          <div className="w-full h-full rounded-[2.5rem] bg-[#07090e] ring-1 ring-white/20 overflow-hidden flex flex-col relative text-white">
            
            {/* Dynamic Island Notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-18 h-4 bg-black rounded-full z-30 flex items-center justify-between px-2 shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>

            {/* Status Bar */}
            <div className="pt-3 px-4 flex items-center justify-between text-[10px] font-semibold text-white/70 shrink-0 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-[9px]">
                <span>5G</span>
                <div className="w-4 h-2 border border-white/50 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* Real Dark Vector Map UI */}
            <div className="flex-1 relative bg-[#090b10] overflow-hidden">
              
              {/* Grid Roads & Vector Map Canvas */}
              <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                <path d="M-10 60 Q 90 100, 220 70 T 350 150" stroke="#10b981" strokeWidth="2.5" fill="none" strokeDasharray="3 2" />
                <path d="M40 -10 L 160 300" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <path d="M-10 160 L 260 190" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
                <circle cx="130" cy="110" r="35" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" fill="none" />
              </svg>

              {/* Top Search Pill */}
              <div className="absolute top-2 left-2.5 right-2.5 bg-[#111116]/90 backdrop-blur-md border border-white/15 p-1.5 rounded-xl flex items-center justify-between shadow z-10">
                <div className="flex items-center gap-1.5 text-[9px] text-white/60">
                  <Search className="w-2.5 h-2.5 text-[#10b981]" />
                  <span>Cerca sulla tua rotta...</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              </div>

              {/* Pulsing Pin 1 (Green Safe Nav) */}
              <div className="absolute top-[30%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute -inset-2 bg-[#10b981]/30 rounded-full animate-ping" />
                  <div className="w-6 h-6 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                    <Navigation className="w-3 h-3 text-black" />
                  </div>
                </div>
              </div>

              {/* Pulsing Pin 2 (Amber Alert) */}
              <div className="absolute top-[52%] left-[65%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute -inset-2 bg-[#f59e0b]/30 rounded-full animate-ping delay-500" />
                  <div className="w-5 h-5 bg-[#f59e0b] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.8)]">
                    <AlertTriangle className="w-2.5 h-2.5 text-black" />
                  </div>
                </div>
              </div>

              {/* 3D Map Control */}
              <div className="absolute bottom-3 right-2.5 flex flex-col gap-1 z-10">
                <div className="w-6 h-6 bg-black/80 border border-white/20 rounded-md flex items-center justify-center text-[9px] font-bold text-white shadow">
                  3D
                </div>
              </div>

            </div>

            {/* Bottom App Nav */}
            <div className="h-9 border-t border-white/10 bg-[#09090b] flex items-center justify-around px-3 shrink-0">
              <div className="flex items-center gap-1 text-[9px] text-[#10b981] font-bold">
                <Navigation className="w-2.5 h-2.5" />
                <span>Mappa</span>
              </div>
              <div className="text-[9px] text-white/40 font-medium">Feed</div>
              <div className="text-[9px] text-white/40 font-medium">Profilo</div>
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-1 pt-0.5 shrink-0 flex justify-center bg-[#09090b]">
              <div className="w-20 h-0.5 bg-white/40 rounded-full" />
            </div>

          </div>
        </div>

        {/* Floating Alert Card Overlay (Bottom Right) */}
        <div className="absolute -bottom-1 right-[-2%] bg-[#0d0d0d]/95 border border-white/20 p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95)] backdrop-blur-xl flex items-center justify-between gap-2.5 z-30 max-w-[250px] sm:max-w-[270px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#f59e0b]/20 rounded-lg flex items-center justify-center border border-[#f59e0b]/40 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white leading-tight">Lavori & Deviazione</div>
              <div className="text-[9px] text-white/60">Fonte Ufficiale · A 250m dal percorso</div>
            </div>
          </div>
          <span className="text-[8px] font-bold text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#10b981]/30 shrink-0">
            VERIFICATO
          </span>
        </div>

      </div>
    </div>
  );
}
