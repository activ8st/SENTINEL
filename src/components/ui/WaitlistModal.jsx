import React, { useState } from 'react';
import { X, ShieldCheck, Mail, ArrowRight, CheckCircle2, MapPin, Share2, Copy, Sparkles, Trophy } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import { useLanguageTheme } from '@/context/LanguageThemeContext';

export default function WaitlistModal({ isOpen, onClose }) {
  const { lang } = useLanguageTheme();
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Milano');
  const [customCity, setCustomCity] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const PRIORITY_CITIES = [
    { name: "Milano", current: 2310, target: 2500, percent: 92, badge: "Fase 1 · Imminente" },
    { name: "Roma", current: 2180, target: 2500, percent: 87, badge: "Fase 1 · Imminente" },
    { name: "Verona", current: 1560, target: 2000, percent: 78, badge: "Fase 1 · Imminente" },
    { name: "Altra Città...", custom: true, badge: "Sblocca con gli amici" }
  ];

  const activeCityObj = PRIORITY_CITIES.find(c => c.name === city) || PRIORITY_CITIES[0];
  const selectedCityName = city === 'Altra Città...' ? (customCity || 'la tua città') : city;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      trackEvent('waitlist_submit_city', { email_domain: email.split('@')[1], city: selectedCityName });
      setSubmitted(true);
      toast.success(`Sei in lista per sbloccare ${selectedCityName}!`);
    } else {
      toast.error("Inserisci un indirizzo email valido.");
    }
  };

  const shareUrl = `https://sentinel-app.it/waitlist?ref=${encodeURIComponent(email.split('@')[0] || 'founder')}&city=${encodeURIComponent(selectedCityName)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link personale copiato negli appunti!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Ho appena iscritto ${selectedCityName} su Sentinel per sbloccare l'app prima delle altre città! Iscriviti da questo link così scaliamo la lista d'attesa insieme: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300 font-sans"
      style={{ fontFamily: "'Funnel Display', sans-serif" }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0c0c0c] border border-white/15 rounded-[2.2rem] p-6 sm:p-8 shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#10b981]/15 blur-[120px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            {/* Header Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[11px] font-semibold text-[#10b981] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Revolut-Style City Unlock Waitlist' : 'Sblocca la tua Città in Priorità'}
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              {lang === 'en' ? 'Where do you want Sentinel first?' : 'Dove vuoi attivare Sentinel prima?'}
            </h3>
            <p className="text-xs sm:text-sm text-white/60 font-light mb-6 leading-relaxed">
              Sentinel attiva la copertura prioritario delle segnalazioni nelle città che raggiungono prima la quota di iscritti. **Milano, Roma e Verona** hanno priorità assoluta di lancio!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* City Selection Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold opacity-70 block">
                  {lang === 'en' ? 'Select your City:' : 'Seleziona la tua Città:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_CITIES.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCity(c.name)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        city === c.name 
                          ? 'bg-[#10b981]/15 border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-xs flex items-center gap-1">
                          <MapPin className={`w-3 h-3 ${city === c.name ? 'text-[#10b981]' : 'opacity-40'}`} />
                          {c.name}
                        </span>
                        <span className="text-[9px] opacity-60 font-mono">{c.badge}</span>
                      </div>
                      
                      {!c.custom && (
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-[#10b981] h-full rounded-full" 
                            style={{ width: `${c.percent}%` }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom City Input if selected */}
              {city === 'Altra Città...' && (
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#10b981] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full bg-[#050505] border border-[#10b981]/50 rounded-xl pl-11 pr-4 py-3 text-white text-xs focus:outline-none focus:border-[#10b981]"
                    placeholder="Scrivi il nome della tua città (es. Firenze, Bologna...)"
                    required
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-white/15 rounded-xl pl-11 pr-4 py-3.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#10b981] transition-colors"
                  placeholder="Inserisci la tua email..."
                  required
                />
              </div>

              {/* Submit CTA */}
              <button 
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-sm sm:text-base py-4 rounded-xl transition-all hover:scale-[1.01] shadow-[0_0_25px_rgba(16,185,129,0.35)]"
              >
                Sblocca {selectedCityName} & Riserva Founder Badge
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
              <span> iOS TestFlight & Android Beta</span>
              <span>100% Gratuito · No Spam</span>
            </div>
          </div>
        ) : (
          /* REVOLUT-STYLE SUCCESS & VIRAL SHARE SCREEN */
          <div className="text-center py-2 animate-in zoom-in-95 duration-300">
            
            <div className="w-16 h-16 bg-[#10b981]/20 border border-[#10b981]/40 rounded-full flex items-center justify-center mx-auto mb-4 text-[#10b981]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Sei Ufficialmente in Lista!
            </h3>
            <p className="text-xs sm:text-sm text-white/70 font-light mb-6">
              Hai riservato la tua priorità per <strong className="text-[#10b981]">{selectedCityName}</strong> e sbloccato il **Founder Badge (+100 Karma)**!
            </p>

            {/* VIRAL SHARE BOX */}
            <div className="bg-[#050505] border border-[#10b981]/30 p-5 rounded-2xl mb-6 text-left relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-[#10b981] uppercase tracking-wider mb-2">
                <Trophy className="w-4 h-4 text-[#10b981]" />
                Fai Scalare la Tua Città (+5 Posizioni)
              </div>
              <p className="text-xs text-white/60 font-light mb-4 leading-relaxed">
                Condividi il tuo link personale con i tuoi amici di {selectedCityName}. Per ogni amico che si iscrive col tuo link, fai scalare la tua città nella classifica di lancio ed accumuli 100 Punti Karma aggiuntivi.
              </p>

              {/* Share Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  Condividi su WhatsApp con i tuoi Amici
                </button>

                <button
                  onClick={handleCopy}
                  className="w-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#10b981]" />
                  {copied ? 'Link Copiato!' : 'Copia Link Personale'}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-white/50 hover:text-white underline transition-colors"
            >
              Chiudi e torna alla Landing Page
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
