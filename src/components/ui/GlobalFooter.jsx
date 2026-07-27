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
    <footer className="footer-container border-t border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-white pt-16 pb-12 w-full font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/LandingPage" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="Sentinel Logo" className="w-8 h-8 rounded-xl object-cover" />
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Sentinel</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-white/60 font-light max-w-sm leading-relaxed mb-6">
              {t('footer_desc')}
            </p>
            
            <div className="flex items-center gap-4 text-gray-500 dark:text-white/50 mb-6">
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
                  className="inline-flex items-center justify-between gap-2.5 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  <span className="text-base leading-none">{currentLanguageObj.flag}</span>
                  <span>{currentLanguageObj.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${langMenuOpen ? 'rotate-180 text-[#10b981]' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {langMenuOpen && (
                  <div className="absolute left-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/20 shadow-2xl p-1.5 z-30 animate-in fade-in duration-150">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          lang === l.code 
                            ? 'bg-[#10b981]/15 text-[#10b981]' 
                            : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
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

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>{t('theme_light')}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-emerald-600" />
                    <span>{t('theme_dark')}</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Col 2 - Platform Links */}
          <div>
            <h4 className="text-[#10b981] font-bold text-xs uppercase tracking-widest mb-4">{t('footer_col_platform')}</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-white/60 font-light">
              <li><Link to="/LandingPage" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('nav_home')}</Link></li>
              <li><Link to="/Platform" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('nav_features')}</Link></li>
              <li><Link to="/Manifesto" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('nav_manifesto')}</Link></li>
              <li><Link to="/Contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t('nav_contact')}</Link></li>
            </ul>
          </div>

          {/* Col 3 - Legal Links */}
          <div>
            <h4 className="text-[#10b981] font-bold text-xs uppercase tracking-widest mb-4">{t('footer_col_legal')}</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-white/60 font-light">
              <li>
                <button onClick={() => openLegal('privacy')} className="hover:text-gray-900 dark:hover:text-white transition-colors text-left">
                  {t('footer_privacy')}
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('terms')} className="hover:text-gray-900 dark:hover:text-white transition-colors text-left">
                  {t('footer_terms')}
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('moderation')} className="hover:text-gray-900 dark:hover:text-white transition-colors text-left">
                  {t('footer_moderation')}
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('sources')} className="hover:text-gray-900 dark:hover:text-white transition-colors text-left">
                  {t('footer_institutional')}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-white/40 font-light">
          <div>{t('footer_rights')}</div>
          <div className="flex items-center gap-4">
            <span className="bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/60 px-2.5 py-1 rounded-md">
              {t('footer_badge_1')}
            </span>
            <span className="bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/60 px-2.5 py-1 rounded-md">
              {t('footer_badge_2')}
            </span>
          </div>
        </div>

      </div>

      <LegalModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)} 
        initialTab={activeLegalTab} 
      />
    </footer>
  );
}
