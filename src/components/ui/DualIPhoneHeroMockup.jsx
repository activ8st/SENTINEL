import React from 'react';
import { ShieldAlert, AlertTriangle, MapPin, CheckCircle2, Flame, Search, Bell, Navigation, Zap, ShieldCheck } from 'lucide-react';

export default function DualIPhoneHeroMockup() {
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-[4/5] flex items-center justify-center p-2 sm:p-4">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/15 via-transparent to-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative w-full h-full max-w-[540px] flex items-center justify-center">
        
        {/* PHONE 2 (BACKGROUND, LEFT) - iPhone 17 Pro Feed Screen */}
        <div className="absolute left-[2%] top-[6%] w-[56%] sm:w-[54%] aspect-[9/19.5] rounded-[2.8rem] bg-[#050505] p-2.5 sm:p-3 border-[3px] border-[#333336] shadow-[0_25px_60px_rgba(0,0,0,0.8)] transform -rotate-6 translate-y-2 hover:-rotate-3 transition-transform duration-500 z-10 overflow-hidden">
          
          {/* Titanium Outer Frame Ring */}
          <div className="w-full h-full rounded-[2.2rem] bg-[#0a0a0c] border border-white/10 overflow-hidden flex flex-col relative text-white">
            
            {/* iPhone 17 Pro Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-between px-2">
              <div className="w-2 h-2 rounded-full bg-[#10b981]/80 animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            </div>

            {/* iOS Status Bar */}
            <div className="pt-3 px-5 flex items-center justify-between text-[10px] font-semibold text-white/60 shrink-0 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-[9px]">
                <span>5G</span>
                <div className="w-4 h-2 border border-white/40 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* App Header (Feed View) */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#10b981] flex items-center justify-center text-black font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-black" />
                </div>
                <span className="font-bold text-xs tracking-tight">Sentinel Feed</span>
              </div>
              <span className="text-[9px] bg-[#10b981]/15 text-[#10b981] px-2 py-0.5 rounded-full font-bold border border-[#10b981]/30">
                LIVE
              </span>
            </div>

            {/* App Content (Feed UI Cards) */}
            <div className="flex-1 p-3 space-y-2.5 overflow-hidden text-left bg-gradient-to-b from-[#0a0a0c] to-[#050505]">
              
              {/* Feed Card 1 */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-[#f59e0b] bg-[#f59e0b]/15 px-1.5 py-0.5 rounded">
                    LAVORI STRADALI
                  </span>
                  <span className="text-[8px] text-white/40">2 min fa</span>
                </div>
                <div className="text-[11px] font-bold text-white mb-0.5">Deviazione Corsia Est</div>
                <div className="text-[9px] text-white/60 font-light flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#10b981]" />
                  A 300m dal tuo percorso
                </div>
              </div>

              {/* Feed Card 2 */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-[#10b981] bg-[#10b981]/15 px-1.5 py-0.5 rounded">
                    FONTE UFFICIALE
                  </span>
                  <span className="text-[8px] text-white/40">12 min fa</span>
                </div>
                <div className="text-[11px] font-bold text-white mb-0.5">Bollettino Meteo Protezione Civile</div>
                <div className="text-[9px] text-white/60 font-light">Segnalazione di pioggia intensa</div>
              </div>

              {/* Feed Card 3 */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded">
                    VIABILITÀ
                  </span>
                  <span className="text-[8px] text-white/40">25 min fa</span>
                </div>
                <div className="text-[11px] font-bold text-white mb-0.5">Rallentamenti Svincolo Nord</div>
              </div>

            </div>

            {/* Bottom App Nav */}
            <div className="h-10 border-t border-white/10 bg-[#09090b] flex items-center justify-around px-4 shrink-0">
              <div className="w-4 h-4 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <ShieldCheck className="w-2.5 h-2.5" />
              </div>
              <div className="w-4 h-4 text-white/30"><Bell className="w-3 h-3" /></div>
              <div className="w-4 h-4 text-white/30"><Search className="w-3 h-3" /></div>
            </div>

          </div>
        </div>

        {/* PHONE 1 (FOREGROUND, RIGHT) - iPhone 17 Pro Map Screen */}
        <div className="absolute right-[2%] top-[2%] w-[62%] sm:w-[58%] aspect-[9/19.5] rounded-[3rem] bg-[#050505] p-3 sm:p-3.5 border-[3.5px] border-[#444448] shadow-[0_30px_80px_rgba(0,0,0,0.95)] transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20 overflow-hidden">
          
          {/* Titanium Outer Frame Ring */}
          <div className="w-full h-full rounded-[2.4rem] bg-[#08080a] border border-white/15 overflow-hidden flex flex-col relative text-white">
            
            {/* iPhone 17 Pro Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-22 h-4.5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            </div>

            {/* iOS Status Bar */}
            <div className="pt-3.5 px-6 flex items-center justify-between text-[11px] font-semibold text-white/80 shrink-0 z-20">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <div className="w-4.5 h-2.5 border border-white/60 rounded-sm p-0.5">
                  <div className="w-full h-full bg-[#10b981]" />
                </div>
              </div>
            </div>

            {/* Map Canvas UI (Simulated Vector Dark Mapbox Screen) */}
            <div className="flex-1 relative bg-[#090b10] overflow-hidden">
              
              {/* Grid Roads & Vectors */}
              <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <path d="M-10 80 Q 100 120, 250 90 T 400 180" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="4 2" />
                <path d="M50 -10 L 180 350" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.3" fill="none" />
                <path d="M-20 200 L 300 240" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.2" fill="none" />
                <circle cx="160" cy="140" r="45" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" fill="none" />
              </svg>

              {/* Search Floating Bar */}
              <div className="absolute top-3 left-3 right-3 bg-[#111115]/90 backdrop-blur-md border border-white/15 p-2 rounded-xl flex items-center justify-between shadow-lg z-10">
                <div className="flex items-center gap-2 text-[10px] text-white/60">
                  <Search className="w-3 h-3 text-[#10b981]" />
                  <span>Cerca sulla tua rotta...</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
              </div>

              {/* Pulsing Pin 1 (Green Safe Zone) */}
              <div className="absolute top-[32%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute -inset-3 bg-[#10b981]/30 rounded-full animate-ping" />
                  <div className="w-7 h-7 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.8)]">
                    <Navigation className="w-3.5 h-3.5 text-black" />
                  </div>
                </div>
              </div>

              {/* Pulsing Pin 2 (Amber Alert) */}
              <div className="absolute top-[52%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute -inset-3 bg-[#f59e0b]/30 rounded-full animate-ping delay-500" />
                  <div className="w-6 h-6 bg-[#f59e0b] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.8)]">
                    <AlertTriangle className="w-3 h-3 text-black" />
                  </div>
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute bottom-4 right-3 flex flex-col gap-1.5 z-10">
                <div className="w-7 h-7 bg-black/80 border border-white/20 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow">
                  3D
                </div>
                <div className="w-7 h-7 bg-[#10b981] rounded-lg flex items-center justify-center text-black shadow">
                  <Navigation className="w-3.5 h-3.5 fill-black" />
                </div>
              </div>

            </div>

            {/* Bottom App Bar */}
            <div className="h-11 border-t border-white/10 bg-[#09090b] flex items-center justify-around px-4 shrink-0">
              <div className="flex items-center gap-1 text-[10px] text-[#10b981] font-bold">
                <Navigation className="w-3 h-3" />
                <span>Mappa</span>
              </div>
              <div className="text-[10px] text-white/40 font-medium">Feed</div>
              <div className="text-[10px] text-white/40 font-medium">Profilo</div>
            </div>

          </div>
        </div>

        {/* Overlapping Verified Alert Card (Floating Overlay Bottom Right) */}
        <div className="absolute -bottom-2 right-[-2%] sm:right-[0%] bg-[#0d0d0d]/95 border border-white/20 p-3.5 sm:p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex items-center justify-between gap-3 z-30 max-w-[280px] sm:max-w-[310px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f59e0b]/20 rounded-xl flex items-center justify-center border border-[#f59e0b]/40 shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Lavori in Corso & Deviazione</div>
              <div className="text-[10px] text-white/60">Fonte Ufficiale · A 250m dal tuo percorso</div>
            </div>
          </div>
          <span className="text-[9px] font-bold text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-full border border-[#10b981]/30 shrink-0">
            VERIFICATO
          </span>
        </div>

      </div>
    </div>
  );
}
