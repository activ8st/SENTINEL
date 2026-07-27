import React from 'react';
import { AlertTriangle, MapPin, Search, Navigation, ShieldCheck, CheckCircle2, Radio, Compass } from 'lucide-react';

export default function DualIPhoneHeroMockup() {
  return (
    <div className="relative w-full flex items-center justify-center p-2 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/30 via-emerald-500/10 to-amber-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Proportional Container */}
      <div className="relative w-full max-w-[380px] sm:max-w-[460px] aspect-[4/4.5] flex items-center justify-center py-4">
        
        {/* PHONE 2 (BACKGROUND, LEFT) - iPhone 17 Pro Feed Screen */}
        <div className="absolute left-[0%] top-[4%] w-[52%] aspect-[9/19.5] rounded-[2.4rem] sm:rounded-[2.8rem] bg-[#18181b] p-[3px] border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)] transform -rotate-6 translate-y-2 transition-transform duration-500 z-10">
          
          {/* Integrated Titanium Edge Ring */}
          <div className="w-full h-full rounded-[2.2rem] sm:rounded-[2.6rem] bg-[#090a0f] ring-1 ring-white/20 overflow-hidden flex flex-col relative text-white">
            
            {/* Authentic Apple Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4.5 bg-black rounded-full z-30 flex items-center justify-between px-2 shadow-[0_2px_8px_rgba(0,0,0,0.9)] border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0d] border border-white/20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#111116]" />
            </div>

            {/* Status Bar */}
            <div className="pt-2.5 px-4 flex items-center justify-between text-[9px] sm:text-[10px] font-bold opacity-80 shrink-0 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-1 text-[8px] sm:text-[9px]">
                <span className="font-extrabold text-[#10b981]">5G</span>
                <div className="w-4 h-2 border border-white/60 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* Feed Header */}
            <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-white/15 shrink-0 bg-[#0d0e14]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span className="font-extrabold text-[10px] sm:text-[11px] tracking-tight">Sentinel Feed</span>
              </div>
              <span className="text-[8px] sm:text-[9px] bg-[#10b981] text-black px-1.5 py-0.5 rounded font-black tracking-wide">
                LIVE
              </span>
            </div>

            {/* Feed UI Cards - High Contrast 4K Detail */}
            <div className="flex-1 p-2 sm:p-2.5 space-y-2 overflow-hidden text-left bg-[#07080c]">
              <div className="p-2 rounded-xl bg-[#12141c] border border-[#10b981]/40 shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-extrabold text-black bg-[#f59e0b] px-1.5 py-0.5 rounded">
                    LAVORI STRADALI
                  </span>
                  <span className="text-[7px] text-white/60 font-bold">2m fa</span>
                </div>
                <div className="text-[9px] sm:text-[10px] font-black text-white mb-0.5">Deviazione Via Dante</div>
                <div className="text-[7.5px] sm:text-[8.5px] text-[#10b981] font-semibold flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#10b981]" />
                  A 250m · 2 corsie chiuse
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#12141c] border border-white/15 shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-extrabold text-black bg-[#10b981] px-1.5 py-0.5 rounded">
                    FONTE UFFICIALE
                  </span>
                  <span className="text-[7px] text-white/60 font-bold">10m fa</span>
                </div>
                <div className="text-[9px] sm:text-[10px] font-black text-white mb-0.5">Protezione Civile</div>
                <div className="text-[7.5px] sm:text-[8.5px] text-gray-300 font-medium">Bollettino Meteo Milano</div>
              </div>

              <div className="p-2 rounded-xl bg-[#12141c] border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-extrabold text-white bg-blue-600 px-1.5 py-0.5 rounded">
                    COMMUNITY
                  </span>
                  <span className="text-[7px] text-white/60 font-bold">15m fa</span>
                </div>
                <div className="text-[9px] sm:text-[10px] font-black text-white mb-0.5">Segnalazione Verificata</div>
                <div className="text-[7.5px] text-emerald-400 font-bold">✓ 42 Conferme Karma</div>
              </div>
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-1 pt-0.5 shrink-0 flex justify-center bg-[#07080c]">
              <div className="w-14 sm:w-18 h-1 bg-white/60 rounded-full" />
            </div>

          </div>
        </div>

        {/* PHONE 1 (FOREGROUND, RIGHT) - iPhone 17 Pro Map Screen */}
        <div className="absolute right-[0%] top-[0%] w-[58%] aspect-[9/19.5] rounded-[2.6rem] sm:rounded-[3rem] bg-[#222328] p-[4px] border border-white/30 shadow-[0_35px_90px_rgba(0,0,0,0.98)] transform rotate-2 transition-transform duration-500 z-20">
          
          {/* Inner OLED Glass & Titanium Rim */}
          <div className="w-full h-full rounded-[2.3rem] sm:rounded-[2.7rem] bg-[#05070c] ring-1 ring-white/30 overflow-hidden flex flex-col relative text-white">
            
            {/* Authentic Apple Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-22 sm:w-26 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.9)] border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0d] border border-white/20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#10b981]" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#111116]" />
            </div>

            {/* Status Bar */}
            <div className="pt-2.5 px-4 flex items-center justify-between text-[9px] sm:text-[11px] font-extrabold opacity-90 shrink-0 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px]">
                <span className="text-[#10b981] font-black">5G</span>
                <div className="w-4 sm:w-4.5 h-2 border border-white/70 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* High Contrast 4K Vector Map UI */}
            <div className="flex-1 relative bg-[#0a0d14] overflow-hidden">
              
              {/* Grid Roads & Vector Map Canvas */}
              <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                <path d="M-10 60 Q 90 100, 220 70 T 350 150" stroke="#10b981" strokeWidth="4" fill="none" />
                <path d="M40 -10 L 160 300" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.5" fill="none" />
                <path d="M-10 160 L 260 190" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.4" fill="none" />
                <circle cx="130" cy="110" r="40" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" fill="none" strokeDasharray="3 3" />
              </svg>

              {/* Top Search Pill */}
              <div className="absolute top-2.5 left-2.5 right-2.5 bg-[#11141d]/95 backdrop-blur-md border border-[#10b981]/40 p-1.5 rounded-xl flex items-center justify-between shadow-2xl z-10">
                <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold text-white">
                  <Search className="w-3 h-3 text-[#10b981]" />
                  <span>Milano · Piazza Duomo</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              </div>

              {/* Pulsing Pin 1 (Green Safe Nav) */}
              <div className="absolute top-[32%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute -inset-3 bg-[#10b981]/40 rounded-full animate-ping" />
                  <div className="w-7 sm:w-8 h-7 sm:h-8 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.9)] text-black">
                    <Navigation className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-black" />
                  </div>
                </div>
              </div>

              {/* Pulsing Pin 2 (Amber Alert) */}
              <div className="absolute top-[52%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute -inset-3 bg-[#f59e0b]/40 rounded-full animate-ping delay-500" />
                  <div className="w-6 sm:w-7 h-6 sm:h-7 bg-[#f59e0b] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.9)] text-black">
                    <AlertTriangle className="w-3.5 h-3.5 fill-black" />
                  </div>
                </div>
              </div>

              {/* Street Label */}
              <div className="absolute top-[22%] left-[10%] bg-[#10b981]/20 border border-[#10b981]/40 px-2 py-0.5 rounded text-[7.5px] font-black text-emerald-400 backdrop-blur-md">
                Via Montenapoleone
              </div>

              {/* 3D Map Control */}
              <div className="absolute bottom-3 right-2.5 flex flex-col gap-1 z-10">
                <div className="w-6 sm:w-7 h-6 sm:h-7 bg-black/90 border border-[#10b981]/50 rounded-lg flex items-center justify-center text-[8px] sm:text-[10px] font-black text-[#10b981] shadow-xl">
                  3D
                </div>
              </div>

            </div>

            {/* Bottom App Nav */}
            <div className="h-9 sm:h-10 border-t border-white/15 bg-[#090b10] flex items-center justify-around px-3 shrink-0">
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#10b981] font-black">
                <Compass className="w-3 h-3 text-[#10b981]" />
                <span>Mappa</span>
              </div>
              <div className="text-[9px] text-white/60 font-bold">Feed</div>
              <div className="text-[9px] text-white/60 font-bold">Profilo</div>
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="pb-1 pt-0.5 shrink-0 flex justify-center bg-[#090b10]">
              <div className="w-16 sm:w-22 h-1 bg-white/70 rounded-full" />
            </div>

          </div>
        </div>

        {/* Floating Alert Card Overlay (Bottom Right) - 4K High Contrast */}
        <div className="absolute -bottom-2 right-[0%] bg-[#0e1017]/98 border border-[#10b981]/50 p-3 sm:p-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.98)] backdrop-blur-2xl flex items-center justify-between gap-3 z-30 max-w-[240px] sm:max-w-[290px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 sm:w-9 h-8 sm:h-9 bg-[#f59e0b]/25 rounded-xl flex items-center justify-center border border-[#f59e0b]/50 shrink-0 text-[#f59e0b]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] sm:text-[12px] font-black text-white leading-tight">Lavori & Deviazione</div>
              <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold mt-0.5">Fonte Ufficiale · A 250m</div>
            </div>
          </div>
          <span className="text-[8px] sm:text-[9px] font-black text-black bg-[#10b981] px-2 py-1 rounded shadow shrink-0">
            VERIFICATO
          </span>
        </div>

      </div>
    </div>
  );
}
