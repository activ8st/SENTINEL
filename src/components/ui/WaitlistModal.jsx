import React, { useState } from 'react';
import { X, ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';

export default function WaitlistModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      trackEvent('waitlist_submit', { email_domain: email.split('@')[1] });
      setSubmitted(true);
      toast.success("Sei in lista! Ti avviseremo appena Sentinel sarà disponibile nello store.");
    } else {
      toast.error("Inserisci un indirizzo email valido.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 font-sans"
      style={{ fontFamily: "'Funnel Display', sans-serif" }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#0c0c0c] border border-white/15 rounded-[2rem] p-8 shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#10b981]/15 blur-[100px] pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="w-14 h-14 bg-[#10b981]/10 border border-[#10b981]/30 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-[#10b981]" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">In Arrivo Sugli Store</h3>
            <p className="text-sm text-white/60 font-light mb-6 leading-relaxed">
              Sentinel è in fase di roll-out progressivo nelle città italiane. Lascia la tua email per ricevere l'invito prioritario al lancio su iOS e Android.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-white/15 rounded-xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-[#10b981] transition-colors"
                  placeholder="inserisci la tua email..."
                  required
                  autoFocus
                />
              </div>

              <button 
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-base py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                Unisciti alla Lista d'Attesa
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-4 opacity-60 text-xs text-white/60">
              <span className="flex items-center gap-1.5 font-medium">
                 In arrivo su App Store
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                🤖 Google Play
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-[#10b981]/20 rounded-full flex items-center justify-center text-[#10b981] mx-auto mb-4 border border-[#10b981]/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Sei Ufficialmente in Lista!</h3>
            <p className="text-sm text-white/60 font-light mb-6">
              Ti invieremo un'allerta esclusiva non appena l'applicazione sarà scaricabile nella tua zona. Zero spam, garantito.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-colors border border-white/15"
            >
              Chiudi
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
