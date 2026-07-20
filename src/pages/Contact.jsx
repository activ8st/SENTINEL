import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, MapPin, Phone } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import IncidentMap from '@/components/incidents/IncidentMap';
import MarketingNavbar from '@/components/ui/MarketingNavbar';

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#050505] text-[#f5f5f5] min-h-screen font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar />

      {/* Hero Contact */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-[80px] font-bold tracking-tight mb-6">
              Entra nel <span className="text-[#10b981]">Network.</span>
            </h1>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">Investitori, partner tecnologici o pionieri urbani. Il futuro della sicurezza si costruisce insieme.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* Contact Form */}
            <div className="bg-[#111] border border-white/10 p-10 md:p-14 rounded-[2rem]">
              <h2 className="text-3xl font-bold mb-8 text-white">Inizia la conversazione</h2>
              <form className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/70">Nome Completo</label>
                  <input type="text" className="bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#10b981] transition-colors" placeholder="Il tuo nome" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/70">Indirizzo Email</label>
                  <input type="email" className="bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#10b981] transition-colors" placeholder="la.tua@email.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white/70">Messaggio</label>
                  <textarea rows="5" className="bg-[#050505] border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#10b981] transition-colors" placeholder="Come possiamo aiutarti?"></textarea>
                </div>
                <button type="button" className="bg-[#10b981] hover:bg-[#059669] text-black font-bold text-lg py-4 rounded-xl mt-4 transition-colors">
                  Invia Messaggio
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-center gap-12">
              <div>
                <h3 className="text-2xl font-bold text-white mb-8">Accesso Diretto</h3>
                <div className="flex flex-col gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Email</h4>
                      <p className="text-white/50">partnership@sentinel.it</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Telefono</h4>
                      <p className="text-white/50">+39 02 1234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">Headquarters</h4>
                      <p className="text-white/50">Piazza Gae Aulenti, Milano, Italia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Milan Map Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="w-full h-[500px] rounded-[2rem] overflow-hidden bg-gray-900 border border-white/10 relative">
            <IncidentMap 
              incidents={[]}
              center={[45.4839, 9.1899]} // Piazza Gae Aulenti, Milan
              zoom={14}
              height="100%"
            />
            {/* Fake HQ pin overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
              <div className="w-12 h-12 bg-[#10b981] rounded-full border-4 border-[#050505] flex items-center justify-center shadow-2xl mb-2 animate-bounce">
                <ShieldAlert className="w-5 h-5 text-black" />
              </div>
              <div className="bg-[#050505] text-white px-4 py-2 rounded-lg font-bold text-sm border border-white/10 shadow-xl">
                Sentinel HQ
              </div>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
