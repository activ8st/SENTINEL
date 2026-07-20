import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Come viene garantita l'affidabilità delle segnalazioni?",
    answer: "Sentinel utilizza un sistema di Crowd-Verification. Ogni utente ha un 'Karma' basato sull'accuratezza delle sue segnalazioni precedenti. Se una segnalazione viene smentita da altri utenti sul posto, chi l'ha generata perde Karma e viene temporaneamente sospeso in caso di fake news reiterate."
  },
  {
    question: "Il servizio è gratuito?",
    answer: "Assolutamente sì. La sicurezza dei cittadini non deve avere un prezzo. L'app base con mappa live e segnalazioni sarà sempre gratuita per gli utenti."
  },
  {
    question: "Posso usare Sentinel fuori dall'Italia?",
    answer: "Attualmente la rete attiva principale è in Italia, con focus sulle grandi metropoli come Milano e Roma. Tuttavia, l'infrastruttura globale permette l'utilizzo ovunque ci sia una community attiva."
  },
  {
    question: "I miei dati di posizione sono tracciati?",
    answer: "No. Sentinel utilizza la tua posizione solo localmente sul tuo dispositivo per mostrarti gli alert pertinenti. Non salviamo il tuo storico degli spostamenti nei nostri server."
  }
];

export default function GlobalFooter() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <footer className="bg-[#050505] border-t border-white/10 text-white pt-24 pb-12 w-full font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* FAQ Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Domande Frequenti</h2>
            <p className="text-white/50 text-lg">Tutto ciò che devi sapere su Sentinel.</p>
          </div>
          <div className="max-w-3xl mx-auto divide-y divide-white/10">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-6">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-xl hover:text-[#10b981] transition-colors"
                >
                  {faq.question}
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-180 text-[#10b981]' : 'text-white/30'}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-48 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-white/60 font-light leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/10 mb-12" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Sentinel</span>
            <span className="text-white/40 text-sm">© 2026. Tutti i diritti riservati.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-[#10b981] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/40 hover:text-[#10b981] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/40 hover:text-[#10b981] transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/40 hover:text-[#10b981] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
