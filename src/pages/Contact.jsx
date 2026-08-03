import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, CheckCircle2, ArrowRight, Send, ShieldCheck } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import WaitlistModal from '@/components/ui/WaitlistModal';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { createAutoresponderHtml, createAdminNotificationHtml } from '@/lib/emailService';

export default function Contact() {
  const { t } = useLanguageTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Compila tutti i campi del modulo.");
      return;
    }

    setLoading(true);

    const formData = {
      name,
      email,
      message,
      submitted_at: new Date().toISOString(),
      source: 'Sentinel Contact Page'
    };

    // Save to local storage backup so no lead is ever lost
    try {
      const existing = JSON.parse(localStorage.getItem('sentinel_contact_messages') || '[]');
      existing.push(formData);
      localStorage.setItem('sentinel_contact_messages', JSON.stringify(existing));
    } catch (e) {
      console.warn("Storage warning:", e);
    }

    // 1. Dispatch via EmailJS (Universal Autoresponder to ANY client email + Admin notification)
    const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_fhdunxy';
    const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_3prh5wo';
    const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'F3RgrouhOMbNT81Zi';

    if (emailjsPublicKey) {
      try {
        await emailjs.send(
          emailjsServiceId,
          emailjsTemplateId,
          {
            user_name: name,
            name: name,
            user_email: email,
            email: email,
            to_email: email,
            message: message,
            admin_email: 'sentinelappsecurity@gmail.com',
            autoresponder_html: createAutoresponderHtml(name, message),
          },
          emailjsPublicKey
        );
      } catch (ejsErr) {
        console.warn("EmailJS dispatch warning:", ejsErr);
      }
    }

    // 2. Backup dispatch to Web3Forms for online submissions database logging
    const web3formsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '3893fec3-2608-4ec9-9214-a2bcb2d83b1f';
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3formsKey,
          name,
          email,
          message,
          replyto: email,
          from_name: 'Sentinel Network Security',
          subject: `[Sentinel Lead] ${name} (${email})`,
          botcheck: false,
        })
      });
    } catch (w3err) {
      console.warn("Web3Forms backup logging error:", w3err);
    }

    setLoading(false);
    setSubmitted(true);
    toast.success("Messaggio inviato con successo ed autoresponder spedito!");

    // Fallback: try localhost backend if available
    try {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        await fetch('http://localhost:8000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });
      }
    } catch (err) {
      console.log("Localhost fetch bypassed");
    }

    setLoading(false);
    setSubmitted(true);
    toast.success("Messaggio registrato con successo! Ti risponderemo a breve.");
  };

  return (
    <div className="bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-[#f5f5f5] min-h-screen font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar onOpenWaitlist={() => setIsWaitlistOpen(true)} />

      {/* Hero Contact */}
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-[75px] font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">
              {t('contact_hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-white/50 max-w-2xl mx-auto font-medium">
              {t('contact_hero_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Contact Form */}
            <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-8 md:p-12 rounded-[2.2rem] shadow-2xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#10b981]/10 blur-[100px] pointer-events-none" />

              {!submitted ? (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-gray-900 dark:text-white">{t('contact_form_title')}</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-white/70">{t('contact_label_name')}</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-gray-100 dark:bg-[#050505] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10b981] transition-colors" 
                        placeholder="Il tuo nome e cognome" 
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-white/70">{t('contact_label_email')}</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-100 dark:bg-[#050505] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10b981] transition-colors" 
                        placeholder="la.tua@email.com" 
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-white/70">Messaggio / Richiesta</label>
                      <textarea 
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-gray-100 dark:bg-[#050505] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10b981] transition-colors resize-none" 
                        placeholder="Come possiamo aiutarti? Scrivi qui i dettagli della tua richiesta..." 
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="mt-2 bg-[#10b981] hover:bg-[#10b981]/90 text-white font-extrabold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Invio in corso...</span>
                      ) : (
                        <>
                          <span>Invia Messaggio</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-8 flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#10b981]/15 text-[#10b981] rounded-full flex items-center justify-center mb-4 border border-[#10b981]/30">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Messaggio Ricevuto!</h3>
                  <p className="text-sm text-gray-600 dark:text-white/60 max-w-sm mb-6 leading-relaxed">
                    Grazie per aver contattato il team di Sentinel. Abbiamo preso in carico la tua richiesta e ti risponderemo all'indirizzo <span className="font-bold text-gray-900 dark:text-white">{email}</span> entro 24 ore.
                  </p>
                  <button 
                    onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMessage(''); }}
                    className="text-xs font-bold text-[#10b981] hover:underline"
                  >
                    Invia un altro messaggio ➔
                  </button>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Email Ufficiale</h4>
                  <p className="text-sm text-gray-600 dark:text-white/60 mt-1">supporto@sentinel-app.it</p>
                  <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">Risposta garantita entro 24h lavorative</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Sede Operativa Network</h4>
                  <p className="text-sm text-gray-600 dark:text-white/60 mt-1">Milano Innovation District (MIND), Italia</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 shadow-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Sei un Ente Pubblico o Giornalista?</h4>
                <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed">
                  Per partnership istituzionali, integrazioni API di monitoraggio o richieste stampa, specifica l'organizzazione nell'oggetto del messaggio.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <GlobalFooter />
      <WaitlistModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
      />
    </div>
  );
}
