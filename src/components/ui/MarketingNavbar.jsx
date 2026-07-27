import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Download } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function MarketingNavbar({ onOpenWaitlist }) {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path 
      ? "text-white font-bold transition-colors" 
      : "text-white/60 hover:text-white transition-colors";
  };

  const handleDownloadClick = () => {
    trackEvent('cta_click', { location: 'navbar_download' });
    if (onOpenWaitlist) onOpenWaitlist();
  };

  return (
    <header className="relative z-30 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/LandingPage" 
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          onClick={() => trackEvent('nav_click', { destination: 'home' })}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-emerald-700 flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <ShieldAlert className="w-5 h-5 text-black" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Sentinel</span>
        </Link>
        
        {/* Navigation links & CTA */}
        <div className="flex items-center gap-8 text-sm font-medium">
          <div className="hidden md:flex items-center gap-8">
            <Link to="/LandingPage" className={getLinkClass('/LandingPage')}>Home</Link>
            <Link to="/Platform" className={getLinkClass('/Platform')}>Piattaforma</Link>
            <Link to="/Manifesto" className={getLinkClass('/Manifesto')}>Manifesto</Link>
            <Link to="/Contact" className={getLinkClass('/Contact')}>Contatti</Link>
          </div>
          
          <button
            onClick={handleDownloadClick}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          >
            <Download className="w-4 h-4" />
            Scarica Sentinel
          </button>
        </div>
      </nav>
    </header>
  );
}
