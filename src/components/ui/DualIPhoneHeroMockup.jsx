import React from 'react';
import { AlertTriangle, MapPin, Search, Navigation, ShieldCheck, Compass } from 'lucide-react';
import { useLanguageTheme } from '@/context/LanguageThemeContext';

export default function DualIPhoneHeroMockup() {
  const { lang } = useLanguageTheme();
  const isEn = lang === 'en';

  return (
    <div className="relative w-full flex items-center justify-center py-4 px-2 sm:py-8 select-none">
      
      {/* Hyper-Depth Ambient Glow Layers */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/30 via-emerald-600/15 to-amber-500/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute w-[340px] h-[340px] bg-[#10b981]/25 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Uncropped 3D Phone Display Wrapper - Fully Fluid */}
      <div className="relative w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[460px] md:max-w-[500px] h-[490px] xs:h-[550px] sm:h-[630px] md:h-[670px] flex items-center justify-center">
        
        {/* ========================================================================= */}
        {/* PHONE 2 (BACKGROUND, LEFT) - Apple Keynote Citizen-Style Feed */}
        {/* ========================================================================= */}
        <div className="absolute left-[0%] top-[8%] w-[52%] h-[85%] rounded-[2.6rem] sm:rounded-[3.2rem] bg-gradient-to-b from-slate-700 via-slate-900 to-black p-[3.5px] border border-white/25 shadow-[0_25px_70px_rgba(0,0,0,0.95)] transform -rotate-6 translate-y-2 transition-all duration-500 z-10">
          
          {/* Titanium Outer Frame & Inner OLED Display */}
          <div className="w-full h-full rounded-[2.4rem] sm:rounded-[3.0rem] bg-[#07090e] ring-1 ring-white/20 overflow-hidden flex flex-col relative text-white shadow-inner">
            
            {/* Specular Glass Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-30" />

            {/* Apple Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-18 sm:w-24 h-4 sm:h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.95)] border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0d] border border-white/20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#111116]" />
            </div>

            {/* iOS Status Bar */}
            <div className="pt-2.5 px-3.5 flex items-center justify-between text-[8px] sm:text-[10px] font-black opacity-90 shrink-0 z-30">
              <span className="tracking-tight">09:41</span>
              <div className="flex items-center gap-1.5 text-[7.5px] sm:text-[9px]">
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
              
              {/* Card 1 - Crime Alert */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-[#0e111a] border border-red-500/50 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500" />
                <div className="flex items-center justify-between mb-1 pl-1">
                  <span className="text-[7.5px] font-black text-red-400 bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-md tracking-wider">
                    {isEn ? '🚨 CRIME' : '🚨 CRIMINI'}
                  </span>
                  <span className="text-[7.5px] text-white/50 font-bold">{isEn ? '14m ago' : '14m fa'}</span>
                </div>
                <div className="text-[8.5px] sm:text-[10px] font-extrabold text-white leading-snug mb-1 pl-1">
                  {isEn ? 'Confirmed Pickpocketing — Metro Cordusio' : 'Borseggi Confermato — Metro Cordusio'}
                </div>
                <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] text-white/70 pl-1 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1 font-semibold truncate max-w-[65%]">
                    <MapPin className="w-2.5 h-2.5 text-[#10b981] shrink-0" /> Cordusio, Milan
                  </span>
                  <span className="text-[#10b981] font-black bg-[#10b981]/20 border border-[#10b981]/40 px-1.5 py-0.5 rounded-md">
                    344m
                  </span>
                </div>
              </div>

              {/* Card 2 - Official Weather */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-[#0e111a] border border-emerald-500/40 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#10b981]" />
                <div className="flex items-center justify-between mb-1 pl-1">
                  <span className="text-[7.5px] font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-md tracking-wider">
                    {isEn ? '⛈️ OFFICIAL WEATHER' : '⛈️ METEO UFFICIALE'}
                  </span>
                  <span className="text-[7.5px] text-white/50 font-bold">{isEn ? '11m ago' : '11m fa'}</span>
                </div>
                <div className="text-[8.5px] sm:text-[10px] font-extrabold text-white leading-snug mb-1 pl-1">
                  {isEn ? 'Civil Protection Alert — Yellow Warning' : 'Bollettino Protezione Civile — Allerta Gialla'}
                </div>
                <div className="flex items-center justify-between text-[7.5px] sm:text-[8.5px] text-white/70 pl-1 pt-1 border-t border-white/5">
                  <span className="font-semibold text-gray-300">Milan & Veneto</span>
                  <span className="text-[#10b981] font-black bg-[#10b981]/20 border border-[#10b981]/40 px-1.5 py-0.5 rounded-md">
                    0m
                  </span>
                </div>
              </div>

              {/* Card 3 - Roadworks & Traffic */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-[#0e111a] border border-amber-500/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                <div className="flex items-center justify-between mb-1 pl-1">
                  <span className="text-[7.5px] font-black text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md tracking-wider">
                    {isEn ? '🚦 ROADWORKS & TRAFFIC' : '🚦 VIABILITÀ'}
                  </span>
                  <span className="text-[7.5px] text-white/50 font-bold">{isEn ? '4m ago' : '4m fa'}</span>
                </div>
                <div className="text-[8.5px] sm:text-[10px] font-extrabold text-white leading-snug mb-1 pl-1">
                  {isEn ? 'Roadworks & Traffic Detour' : 'Lavori Stradali & Deviazione'}
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
        {/* PHONE 1 (FOREGROUND, RIGHT) - iPhone 17 Pro Mapbox 3D Map */}
        {/* ========================================================================= */}
        <div className="absolute right-[0%] top-[0%] w-[58%] h-[95%] rounded-[2.8rem] sm:rounded-[3.4rem] bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 p-[4px] border border-white/35 shadow-[0_35px_90px_rgba(0,0,0,0.98)] transform rotate-2 transition-all duration-500 z-20">
          
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

            {/* 3D Map Viewport Area with Photorealistic Mapbox Texture */}
            <div className="flex-1 relative bg-[#070910] overflow-hidden">
              
              <img 
                src="/sentinel_mapbox_3d.jpg" 
                alt="Sentinel Mapbox 3D Dark Mode Map" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105"
              />

              {/* Glassmorphic Search Header */}
              <div className="absolute top-2.5 left-2.5 right-2.5 bg-[#080b14]/95 backdrop-blur-xl border border-[#10b981]/50 p-2 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.9)] z-30">
                <div className="flex items-center gap-2 text-[8.5px] sm:text-[10px] font-black text-white truncate">
                  <Search className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  <span className="truncate">Milan · Piazza Duomo</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[7.5px] font-black text-[#10b981]">RADAR</span>
                </div>
              </div>

              {/* 3D Pin 1 */}
              <div className="absolute top-[38%] left-[42%] -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="relative">
                  <div className="absolute -inset-3.5 bg-[#10b981]/40 rounded-full animate-ping" />
                  <div className="w-7 sm:w-9 h-7 sm:h-9 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,1)] text-black">
                    <Navigation className="w-3.5 sm:w-4.5 h-3.5 sm:h-4.5 fill-black" />
                  </div>
                </div>
              </div>

              {/* 3D Pin 2 */}
              <div className="absolute top-[54%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="relative">
                  <div className="absolute -inset-3.5 bg-red-500/50 rounded-full animate-ping delay-300" />
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

              {/* Sleek Citizen Alert Card */}
              <div className="absolute bottom-3 left-2.5 right-2.5 bg-[#070a12]/98 border border-[#10b981]/60 p-2.5 sm:p-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex items-center justify-between gap-2 z-30">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 bg-amber-500/25 rounded-xl flex items-center justify-center border border-amber-500/50 shrink-0 text-amber-400 shadow">
                    <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[10.5px] font-black text-white truncate leading-tight">
                      {isEn ? 'Roadworks & Detour' : 'Lavori & Deviazione'}
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-[#10b981] font-extrabold truncate mt-0.5">
                      {isEn ? 'Official Source · 250m' : 'Fonte Ufficiale · 250m'}
                    </div>
                  </div>
                </div>
                <span className="text-[7.5px] sm:text-[8.5px] font-black text-black bg-[#10b981] px-2 py-1 rounded-lg shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  {isEn ? 'VERIFIED' : 'VERIFICATO'}
                </span>
              </div>

            </div>

            {/* iOS Bottom Navigation Bar */}
            <div className="h-9 sm:h-10 border-t border-white/10 bg-[#07090e] flex items-center justify-around px-3 shrink-0 z-30">
              <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#10b981] font-black">
                <Compass className="w-3.5 h-3.5 text-[#10b981]" />
                <span>{isEn ? 'Map' : 'Mappa'}</span>
              </div>
              <div className="text-[9px] text-white/50 font-bold">Feed</div>
              <div className="text-[9px] text-white/50 font-bold">{isEn ? 'Profile' : 'Profilo'}</div>
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
