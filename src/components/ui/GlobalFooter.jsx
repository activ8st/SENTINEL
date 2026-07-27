import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import LegalModal from '@/components/ui/LegalModal';
import { trackEvent } from '@/lib/analytics';

export default function GlobalFooter() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState('privacy');

  const openLegal = (tabName) => {
    setActiveLegalTab(tabName);
    setLegalModalOpen(true);
    trackEvent('footer_legal_click', { tab: tabName });
  };

  return (
    <footer className="bg-[#050505] border-t border-white/10 text-white pt-16 pb-12 w-full font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/LandingPage" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-black font-bold">
                <ShieldAlert className="w-4 h-4 text-black" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Sentinel</span>
            </Link>
            <p className="text-sm text-white/50 font-light max-w-sm leading-relaxed mb-6">
              La prima rete partecipata di sicurezza urbana in Italia. Dati ufficiali verificati, moderazione preventiva e zero pregiudizi.
            </p>
            <div className="flex items-center gap-4 text-white/40">
              <a href="#" onClick={() => trackEvent('social_click', { network: 'twitter' })} className="hover:text-[#10b981] transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" onClick={() => trackEvent('social_click', { network: 'instagram' })} className="hover:text-[#10b981] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" onClick={() => trackEvent('social_click', { network: 'linkedin' })} className="hover:text-[#10b981] transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" onClick={() => trackEvent('social_click', { network: 'facebook' })} className="hover:text-[#10b981] transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Navigation Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-4">Piattaforma</h4>
            <ul className="space-y-2.5 text-sm text-white/50 font-light">
              <li><Link to="/LandingPage" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/Platform" className="hover:text-white transition-colors">Funzionalità</Link></li>
              <li><Link to="/Manifesto" className="hover:text-white transition-colors">Manifesto Etico</Link></li>
              <li><Link to="/Contact" className="hover:text-white transition-colors">Contatti</Link></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-4">Note Legali & Privacy</h4>
            <ul className="space-y-2.5 text-sm text-white/50 font-light">
              <li>
                <button onClick={() => openLegal('privacy')} className="hover:text-[#10b981] transition-colors text-left">
                  Privacy Policy (GDPR)
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('terms')} className="hover:text-[#10b981] transition-colors text-left">
                  Termini di Servizio
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('moderation')} className="hover:text-[#10b981] transition-colors text-left">
                  Politica di Moderazione
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('institutional')} className="hover:text-[#10b981] transition-colors text-left">
                  Dati Istituzionali & Fonti
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-light">
          <div>© 2026 Sentinel Inc. Tutti i diritti riservati. Made with integrity in Italy.</div>
          <div className="flex items-center gap-6">
            <span>Server Sicuri in UE</span>
            <span>•</span>
            <span>Zero Tracking Profilante</span>
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
