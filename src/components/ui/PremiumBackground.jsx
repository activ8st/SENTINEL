import React from 'react';

export default function PremiumBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#010314]">
      
      {/* Dynamic CSS Orbs (No Canvas needed, ultra smooth) */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#0B2E59] opacity-40 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#B5DCE9] opacity-20 blur-[120px] animate-[pulse_12s_ease-in-out_infinite_alternate_reverse]" />
      
      {/* Subtle Geometric Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Deep Space Vignette (Darkens edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#010314_100%)] opacity-80" />

      {/* Extreme Grain / Noise filter overlay (Topmost background layer) */}
      <div 
        className="absolute inset-0 mix-blend-overlay pointer-events-none opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
