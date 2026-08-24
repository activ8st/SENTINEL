import React, { useState, useEffect } from 'react';
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

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const PRIORITY_CITIES = [
    { name: "Milano", current: 2310, target: 2500, percent: 92, badge: "Fase 1 · Imminente" },
    { name: "Roma", current: 2180, target: 2500, percent: 87, badge: "Fase 1 · Imminente" },
    { name: "Verona", current: 1560, target: 2000, percent: 78, badge: "Fase 1 · Imminente" },
    { name: "Altra Città...", custom: true, badge: "Sblocca con gli amici" }
  ];

  const selectedCityName = city === 'Altra Città...' ? (customCity || 'la tua città') : city;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      trackEvent('waitlist_submit_city', { email_domain: email.split('@')[1], city: selectedCityName });
      setSubmitted(true);
      toast.success(`Sei in lista per sbloccare ${selectedCityName}! Abbiamo inviato la mail di conferma.`);

      // 1. Local Storage Backup
      try {
        const existing = JSON.parse(localStorage.getItem('sentinel_waitlist_signups') || '[]');
        existing.push({ email, city: selectedCityName, date: new Date().toISOString() });
        localStorage.setItem('sentinel_waitlist_signups', JSON.stringify(existing));
      } catch (err) {
        console.warn("Storage warning:", err);
      }

      // 2. EmailJS Autoresponder + Admin Dispatch
      const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_fhdunxy';
      const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_3prh5wo';
      const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'F3RgrouhOMbNT81Zi';

      if (emailjsPublicKey) {
        try {
          await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: emailjsServiceId,
              template_id: emailjsTemplateId,
              user_id: emailjsPublicKey,
              template_params: {
                user_name: email.split('@')[0],
                name: email.split('@')[0],
                user_email: email,
                email: email,
                to_email: email,
                message: `Iscrizione prioritaria alla lista d'attesa per la città di ${selectedCityName}.`,
                admin_email: 'sentinelappsecurity@gmail.com',
              }
            })
          });
        } catch (ejsErr) {
          console.warn("Waitlist EmailJS error:", ejsErr);
        }
      }

      // 3. Web3Forms Backup Logging
      const w3Key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '3893fec3-2608-4ec9-9214-a2bcb2d83b1f';
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: w3Key,
            email,
            message: `Iscrizione Lista d'Attesa per ${selectedCityName}`,
            from_name: 'Sentinel Waitlist',
            subject: `[Sentinel Waitlist] ${selectedCityName} - ${email}`,
          })
        });
      } catch (wErr) {
        console.warn("Web3Forms waitlist error:", wErr);
      }
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
      className="fixed inset-0 z-50 flex items-center justify-center pt-20 pb-6 px-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 font-sans"
      style={{ fontFamily: "'Funnel Display', sans-serif" }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[82vh] my-auto overflow-y-auto bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-white/15 rounded-[2.2rem] p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#10b981]/15 blur-[120px] pointer-events-none" />

        {/* Clear, Visible, Touch-Friendly Close Button "X" (Top-Right) */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Chiudi finestra"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-full flex items-center justify-center border border-slate-300 dark:border-white/20 shadow-md transition-all active:scale-90 z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            {/* Header Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[11px] font-bold text-[#10b981] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Revolut-Style City Unlock Waitlist' : 'Sblocca la tua Città in Priorità'}
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight pr-8">
              {lang === 'en' ? 'Where do you want Sentinel first?' : 'Dove vuoi attivare Sentinel prima?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 font-normal mb-6 leading-relaxed">
              Sentinel attiva la copertura prioritaria nelle città che raggiungono prima la quota di iscritti. Milano, Roma e Verona hanno priorità di lancio!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* City Selection Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-white/70 block">
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
                          : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/[0.06] text-slate-900 dark:text-white'
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
                        <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
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

              {/* Custom City Input */}
              {city === 'Altra Città...' && (
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#10b981] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#050505] border border-[#10b981]/50 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#10b981]"
                    placeholder="Scrivi il nome della tua città (es. Firenze, Bologna...)"
                    required
                  />
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-white/70 block mb-1">
                  {lang === 'en' ? 'Your Email Address:' : 'La tua Email per la Notifica:'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#050505] border border-slate-300 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#10b981]"
                    placeholder="nome@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#10b981] hover:bg-[#059669] text-black font-bold py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-2"
              >
                <span>{lang === 'en' ? `Join Waitlist for ${selectedCityName}` : `Richiedi Accesso per ${selectedCityName}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* SUCCESS / REVOLUT REFERRAL SCREEN */
          <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#10b981]/20 rounded-full flex items-center justify-center text-[#10b981] mx-auto mb-4 border border-[#10b981]/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Sei in Posizione Prioritaria! 🚀
            </h3>
            <p className="text-xs text-slate-600 dark:text-white/70 mb-6 max-w-sm mx-auto">
              Hai registrato la tua richiesta per <strong className="text-[#10b981]">{selectedCityName}</strong>. Invita altri cittadini della tua zona per sbloccare la copertura prima!
            </p>

            {/* Referral Link Box */}
            <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-white/80 mb-2">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-[#10b981]" /> Il tuo Link di Invito Personale:
                </span>
                <span className="text-[10px] text-[#10b981] font-mono">+5 Punti Priorità</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[10px] text-slate-600 dark:text-white/70 font-mono truncate"
                />
                <button
                  onClick={handleCopy}
                  className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copiato!' : 'Copia'}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWhatsAppShare}
                className="flex-1 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <Share2 className="w-4 h-4" />
                Condividi su WhatsApp
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold rounded-xl text-xs transition"
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
