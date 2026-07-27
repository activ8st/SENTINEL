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
      ? "opacity-100 font-bold transition-opacity text-[#10b981]" 
      : "opacity-75 hover:opacity-100 transition-opacity hover:text-[#10b981]";
  };

  const handleDownloadClick = () => {
    trackEvent('cta_click', { location: 'navbar_download' });
    if (onOpenWaitlist) onOpenWaitlist();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-2xl text-gray-900 dark:text-white transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/LandingPage" 
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          onClick={() => trackEvent('nav_click', { destination: 'home' })}
        >
          <img src="/logo.svg" alt="Sentinel Logo" className="w-9 h-9 rounded-xl object-cover shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
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
          
          {/* Language Toggle */}
          <button
            onClick={() => changeLang(lang === 'it' ? 'en' : 'it')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 hover:border-[#10b981] text-xs font-semibold transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#10b981]" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:border-[#10b981] transition-colors"
            title={theme === 'dark' ? "Passa a Modalità Chiara" : "Passa a Modalità Scura"}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          <button 
            onClick={handleDownloadClick}
            className="bg-[#10b981] hover:bg-[#059669] text-black font-bold px-5 py-2.5 rounded-full flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>{t('nav_download')}</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
