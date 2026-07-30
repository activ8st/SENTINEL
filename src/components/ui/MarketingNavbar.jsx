import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download, Sun, Moon, Globe, Menu, X, ArrowRight } from 'lucide-react';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
import { trackEvent } from '@/lib/analytics';

export default function MarketingNavbar({ onOpenWaitlist }) {
  const location = useLocation();
  const { lang, changeLang, theme, toggleTheme, t } = useLanguageTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getLinkClass = (path) => {
    return location.pathname === path 
      ? "text-[#10b981] font-bold" 
      : "text-gray-700 dark:text-gray-300 hover:text-[#10b981] dark:hover:text-[#10b981] transition-colors";
  };

  const handleDownloadClick = () => {
    trackEvent('cta_click', { location: 'navbar_download' });
    setMobileMenuOpen(false);
    if (onOpenWaitlist) onOpenWaitlist();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#050505]/95 backdrop-blur-2xl text-gray-900 dark:text-white transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-5 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link 
          to="/LandingPage" 
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          onClick={() => {
            setMobileMenuOpen(false);
            trackEvent('nav_click', { destination: 'home' });
          }}
        >
          <img src="/logo.svg" alt="Sentinel Logo" className="w-9 h-9 rounded-xl object-cover shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
          <span className="text-2xl font-bold tracking-tight">Sentinel</span>
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/LandingPage" className={getLinkClass('/LandingPage')}>{t('nav_home')}</Link>
          <Link to="/Platform" className={getLinkClass('/Platform')}>{t('nav_features')}</Link>
          <Link to="/Manifesto" className={getLinkClass('/Manifesto')}>{t('nav_manifesto')}</Link>
          <Link to="/Contact" className={getLinkClass('/Contact')}>{t('nav_contact')}</Link>
        </div>

        {/* Desktop Controls (Language, Theme, CTA) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => changeLang(lang === 'it' ? 'en' : 'it')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 hover:border-[#10b981] text-xs font-semibold transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#10b981]" />
            <span>{lang.toUpperCase()}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:border-[#10b981] transition-colors"
            title={theme === 'dark' ? "Passa a Modalità Chiara" : "Passa a Modalità Scura"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
          </button>

          <button 
            onClick={handleDownloadClick}
            className="bg-[#10b981] hover:bg-[#059669] text-black font-bold px-5 py-2.5 rounded-full flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>{t('nav_download')}</span>
          </button>
        </div>

        {/* Mobile Controls & Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <button 
            onClick={handleDownloadClick}
            className="bg-[#10b981] text-black font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>App</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:border-[#10b981] bg-slate-100 dark:bg-white/5 text-gray-900 dark:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#10b981]" /> : <Menu className="w-6 h-6 text-gray-900 dark:text-white" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#080c0a]/98 backdrop-blur-3xl px-6 py-6 space-y-5 animate-in slide-in-from-top duration-300 shadow-2xl">
          <div className="flex flex-col space-y-4 text-base font-semibold">
            <Link 
              to="/LandingPage" 
              className={`flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 ${getLinkClass('/LandingPage')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>{t('nav_home')}</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </Link>

            <Link 
              to="/Platform" 
              className={`flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 ${getLinkClass('/Platform')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>{t('nav_features')}</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </Link>

            <Link 
              to="/Manifesto" 
              className={`flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 ${getLinkClass('/Manifesto')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>{t('nav_manifesto')}</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </Link>

            <Link 
              to="/Contact" 
              className={`flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 ${getLinkClass('/Contact')}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>{t('nav_contact')}</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-black/10 dark:border-white/10">
            <button
              onClick={() => changeLang(lang === 'it' ? 'en' : 'it')}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 dark:border-white/10 hover:border-[#10b981] text-xs font-semibold transition-colors"
            >
              <Globe className="w-4 h-4 text-[#10b981]" />
              <span>Lingua: {lang.toUpperCase()}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 dark:border-white/10 hover:border-[#10b981] text-xs font-semibold transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Tema Chiaro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-emerald-600" />
                  <span>Tema Scuro</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
