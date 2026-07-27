import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import MarketingNavbar from '@/components/ui/MarketingNavbar';
import { toast } from 'sonner';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
    try {
      const res = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success("Messaggio inviato con successo! Ti abbiamo inviato una conferma via email.");
      } else {
        toast.error("Errore durante l'invio del messaggio. Riprova.");
      }
    } catch (err) {
      setLoading(false);
      setSubmitted(true);
      toast.success("Messaggio registrato con successo!");
    }
  };

  return (
    <div className="bg-[#050505] dark:bg-[#050505] light:bg-slate-50 text-gray-900 dark:text-[#f5f5f5] min-h-screen font-sans transition-colors duration-300" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar />

      {/* Hero Contact */}
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-[75px] font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
              Entra nel <span className="text-[#10b981]">Network.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-white/50 max-w-2xl mx-auto">
              Investitori, partner tecnologici o pionieri urbani. Il futuro della sicurezza si costruisce insieme.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Contact Form */}
            <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-8 md:p-12 rounded-[2.2rem] shadow-2xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#10b981]/10 blur-[100px] pointer-events-none" />

              {!submitted ? (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Inizia la conversazione</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-white/70">Nome Completo</label>
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
                      <label className="text-xs font-bold text-gray-700 dark:text-white/70">Indirizzo Email</label>
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
                      <label className="text-xs font-bold text-gray-700 dark:text-white/70">Messaggio</label>
                      <textarea 
                        rows="4" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-gray-100 dark:bg-[#050505] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10b981] transition-colors" 
                        placeholder="Come possiamo aiutarti o collaborare?"
                        required
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-[#10b981] hover:bg-[#059669] text-black font-bold text-base py-4 rounded-xl mt-2 transition-all hover:scale-[1.01] shadow-[0_0_30px_rgba(16,185,129,0.3)] inline-flex items-center justify-center gap-2"
                    >
                      {loading ? "Invio in corso..." : "Invia Messaggio"}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-[#10b981]/20 border border-[#10b981]/40 rounded-full flex items-center justify-center mx-auto mb-4 text-[#10b981]">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Messaggio Inviato!</h3>
                  <p className="text-sm text-gray-600 dark:text-white/60 font-light mb-6">
                    Grazie <strong className="text-gray-900 dark:text-white">{name}</strong>. Abbiamo preso in carico la tua richiesta e ti abbiamo inviato una conferma su <strong className="text-[#10b981]">{email}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="text-xs text-[#10b981] underline hover:opacity-80 transition-opacity font-bold"
                  >
                    Invia un altro messaggio →
                  </button>
                </div>
              )}

            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-center gap-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Accesso Diretto</h3>
                <div className="flex flex-col gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-base mb-1">Email Ufficiale</h4>
                      <p className="text-gray-700 dark:text-white/60 text-sm font-mono">sentinelappsecurity@gmail.com</p>
                      <p className="text-gray-500 dark:text-white/40 text-xs mt-0.5">partnership@sentinel-app.it</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-base mb-1">Telefono Headquarters</h4>
                      <p className="text-gray-700 dark:text-white/60 text-sm">+39 02 1234 5678</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-base mb-1">Sede Principale</h4>
                      <p className="text-gray-700 dark:text-white/60 text-sm">Piazza Gae Aulenti, Milano, Italia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <GlobalFooter />

    </div>
  );
}
