import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Download, Sun, Moon, Globe } from 'lucide-react';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
import { trackEvent } from '@/lib/analytics';

export default function MarketingNavbar({ onOpenWaitlist }) {
  const location = useLocation();
  const { lang, changeLang, theme, toggleTheme, t } = useLanguageTheme();

  const getLinkClass = (path) => {
    return location.pathname === path 
      ? "opacity-100 font-bold transition-opacity" 
      : "opacity-60 hover:opacity-100 transition-opacity";
  };

  const handleDownloadClick = () => {
    trackEvent('cta_click', { location: 'navbar_download' });
    if (onOpenWaitlist) onOpenWaitlist();
  };

  return (
    <header className="relative z-30 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 transition-colors duration-300">
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
          <span className="text-2xl font-bold tracking-tight">Sentinel</span>
        </Link>
        
        {/* Navigation links & CTA */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <div className="hidden md:flex items-center gap-8">
            <Link to="/LandingPage" className={getLinkClass('/LandingPage')}>{t('nav_home')}</Link>
            <Link to="/Platform" className={getLinkClass('/Platform')}>{t('nav_features')}</Link>
            <Link to="/Manifesto" className={getLinkClass('/Manifesto')}>{t('nav_manifesto')}</Link>
            <Link to="/Contact" className={getLinkClass('/Contact')}>{t('nav_contact')}</Link>
          </div>
          
          {/* Quick Header Language Toggle */}
          <button
            onClick={() => {
              const nextLang = lang === 'it' ? 'en' : 'it';
              changeLang(nextLang);
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
            title="Switch Language / Cambia Lingua"
          >
            <Globe className="w-3.5 h-3.5 opacity-70" />
            <span>{lang === 'it' ? 'IT' : 'EN'}</span>
          </button>

          {/* Quick Header Theme Toggle */}
          <button
            onClick={() => {
              const nextTheme = theme === 'dark' ? 'light' : 'dark';
              toggleTheme(nextTheme);
            }}
            className="p-2 rounded-full bg-white/5 border border-white/15 text-xs font-semibold flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-[#10b981]" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          <button
            onClick={handleDownloadClick}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black px-5 py-2 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav_download')}</span>
            <span className="sm:hidden">App</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
