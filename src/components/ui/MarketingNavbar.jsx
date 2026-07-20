import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function MarketingNavbar() {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path 
      ? "text-white font-bold transition-colors" 
      : "text-white/50 hover:text-white transition-colors";
  };

  return (
    <nav className="relative z-10 w-full border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo (points to Landing Page) */}
        <Link to="/LandingPage" className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#10b981]" />
          <span className="text-2xl font-bold tracking-tight text-white">Sentinel</span>
        </Link>
        
        {/* Right side menus and Accedi button */}
        <div className="flex items-center gap-8 text-sm font-medium">
          <div className="hidden md:flex items-center gap-8">
            <Link to="/LandingPage" className={getLinkClass('/LandingPage')}>Home</Link>
            <Link to="/Platform" className={getLinkClass('/Platform')}>Platform</Link>
            <Link to="/Manifesto" className={getLinkClass('/Manifesto')}>Manifesto</Link>
            <Link to="/Contact" className={getLinkClass('/Contact')}>Contact</Link>
          </div>
          <Link 
            to="/Auth" 
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black px-6 py-2.5 rounded-full font-bold text-sm transition-colors"
          >
            Accedi
          </Link>
        </div>
      </div>
    </nav>
  );
}
