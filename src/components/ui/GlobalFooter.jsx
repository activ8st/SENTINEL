import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Twitter, Instagram, Linkedin, Facebook, ChevronDown, Check, Sun, Moon } from 'lucide-react';
import LegalModal from '@/components/ui/LegalModal';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
import { trackEvent } from '@/lib/analytics';

export default function GlobalFooter() {
  const { lang, changeLang, theme, toggleTheme, t } = useLanguageTheme();
  
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('privacy');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLanguageObj = languages.find(l => l.code === lang) || languages[0];

  const handleSelectLanguage = (langCode) => {
    changeLang(langCode);
    setLangMenuOpen(false);
    trackEvent('language_change', { language: langCode });
  };

  const openLegal = (tabName) => {
    setActiveLegalTab(tabName);
    setLegalModalOpen(true);
    trackEvent('footer_legal_click', { tab: tabName });
  };

  return (
    <footer className="footer-container border-t border-white/10 text-white pt-16 pb-12 w-full font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/LandingPage" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="Sentinel Logo" className="w-8 h-8 rounded-xl object-cover" />
              <span className="text-2xl font-bold tracking-tight">Sentinel</span>
            </Link>
            <p className="text-sm opacity-60 font-light max-w-sm leading-relaxed mb-6">
              {t('footer_desc')}
            </p>
            
            <div className="flex items-center gap-4 opacity-50 mb-6">
              <a href="#" onClick={() => trackEvent('social_click', { network: 'twitter' })} className="hover:text-[#10b981] transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" onClick={() => trackEvent('social_click', { network: 'instagram' })} className="hover:text-[#10b981] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" onClick={() => trackEvent('social_click', { network: 'linkedin' })} className="hover:text-[#10b981] transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" onClick={() => trackEvent('social_click', { network: 'facebook' })} className="hover:text-[#10b981] transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>

            {/* Language & Theme Controls Row */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Language Selector Dropdown */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="inline-flex items-center justify-between gap-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/40 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md"
                >
                  <span className="text-base leading-none">{currentLanguageObj.flag}</span>
                  <span>{currentLanguageObj.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${langMenuOpen ? 'rotate-180 text-[#10b981]' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {langMenuOpen && (
                  <div className="absolute left-0 mt-2 w-44 rounded-2xl bg-[#111116] border border-white/20 shadow-2xl p-1.5 z-30 animate-in fade-in duration-150">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          lang === l.code 
                            ? 'bg-[#10b981]/15 text-[#10b981]' 
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{l.flag}</span>
                          <span>{l.name}</span>
                        </div>
                        {lang === l.code && (
                          <Check className="w-3.5 h-3.5 text-[#10b981]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle Button (Dark / Clear Light Mode) */}
              <button
                type="button"
                onClick={() => {
                  const nextTheme = theme === 'dark' ? 'light' : 'dark';
                  toggleTheme(nextTheme);
                  trackEvent('theme_change', { theme: nextTheme });
                }}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/40 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>{t('theme_dark')}</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('theme_light')}</span>
                  </>
                )}
              </button>

            </div>

          </div>

          {/* Navigation Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-80 mb-4">{t('footer_col_platform')}</h4>
            <ul className="space-y-2.5 text-sm opacity-60 font-light">
              <li><Link to="/LandingPage" className="hover:opacity-100 transition-opacity">{t('nav_home')}</Link></li>
              <li><Link to="/Platform" className="hover:opacity-100 transition-opacity">{t('nav_features')}</Link></li>
              <li><Link to="/Manifesto" className="hover:opacity-100 transition-opacity">{t('nav_manifesto')}</Link></li>
              <li><Link to="/Contact" className="hover:opacity-100 transition-opacity">{t('nav_contact')}</Link></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-80 mb-4">{t('footer_col_legal')}</h4>
            <ul className="space-y-2.5 text-sm opacity-60 font-light">
              <li>
                <button onClick={() => openLegal('privacy')} className="hover:text-[#10b981] transition-colors text-left">
                  {t('footer_privacy')}
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('terms')} className="hover:text-[#10b981] transition-colors text-left">
                  {t('footer_terms')}
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('moderation')} className="hover:text-[#10b981] transition-colors text-left">
                  {t('footer_moderation')}
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('institutional')} className="hover:text-[#10b981] transition-colors text-left">
                  {t('footer_institutional')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-50 font-light">
          <div>{t('footer_rights')}</div>
          <div className="flex items-center gap-6">
            <span>{t('footer_badge_1')}</span>
            <span>•</span>
            <span>{t('footer_badge_2')}</span>
          </div>
        </div>

      </div>

      {/* LEGAL MODAL */}
      <LegalModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)} 
        initialTab={activeLegalTab} 
      />
    </footer>
  );
}
