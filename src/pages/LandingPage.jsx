import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Map, BellRing, Users, ArrowRight } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import ItalyMapModal from '@/components/ui/ItalyMapModal';
import MarketingNavbar from '@/components/ui/MarketingNavbar';

export default function LandingPage() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    // Import Funnel Display to match Solarsis exactly
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.title = "Sentinel - La tua città. In tempo reale.";
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="bg-[#050505] text-[#f5f5f5] min-h-screen overflow-x-hidden font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Solarsis Style: Gradient Ball Heroes */}
      <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-[#10b981] opacity-20 blur-[150px] rounded-full pointer-events-none" />

      {/* Navbar - */}
      <MarketingNavbar />

      {/* Hero Section - Exactly like Solarsis Home B */}
      <section className="relative z-10 pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Text */}
            <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-6xl md:text-7xl lg:text-[80px] leading-[0.95] font-bold tracking-tight mb-8">
                La città in tempo reale. <br/>
                <span className="text-[#10b981]">Prima che sia notizia.</span>
              </h1>
              
              <p className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed font-light">
                Non aspettare i telegiornali. Scopri incidenti, blocchi stradali e allerte nel momento esatto in cui accadono, grazie alla prima rete neurale di sicurezza guidata dai cittadini.
              </p>
              
              {/* Solarsis Style: Customer Reviews Layout */}
              <div className="flex items-center gap-6 mb-10">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-gray-600 overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="User" /></div>
                  <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-gray-500 overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="User" /></div>
                  <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-gray-400 overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="User" /></div>
                  <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-[#10b981] flex items-center justify-center text-black font-bold text-xs z-10">3K+</div>
                </div>
                <div className="text-sm font-medium">
                  <div className="flex items-center gap-1 text-[#10b981] mb-1">
                    ★★★★★
                  </div>
                  <div><strong className="text-white">4.9</strong> <span className="text-white/60">(3.2K recensioni)</span></div>
                </div>
              </div>

              <Link 
                to="/Home" 
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-full font-bold text-lg transition-colors"
              >
                Entra in Sentinel
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right Column: Large Image (Solarsis hero-image-home-b) */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-900 border border-white/10 relative">
                <img 
                  src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000&auto=format&fit=crop" 
                  alt="City Aerial" 
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
                />
                {/* Floating UI Element overlapping the image */}
                <div className="absolute bottom-8 left-[-2rem] bg-[#111] border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                    <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Incidente Segnalato</div>
                    <div className="text-xs text-white/50">Via Roma, a 300m da te</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Solarsis Style: Social Proof */}
      <section className="py-12 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="text-xl font-medium text-white/50 whitespace-nowrap">Comuni che si fidano di noi</h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
            <div className="text-2xl font-bold font-serif">Roma Capitale</div>
            <div className="text-2xl font-bold font-serif">Milano</div>
            <div className="text-2xl font-bold font-serif">Torino</div>
            <div className="text-2xl font-bold font-serif">Napoli</div>
          </div>
        </div>
      </section>

      {/* Solarsis Style: Value Proposition */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="rounded-[2rem] overflow-hidden aspect-square border border-white/10 relative">
              <img 
                src="/milan_skyscrapers.png" 
                alt="Milan Skyscrapers" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-70"
              />
            </div>
            
            <div>
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-sm mb-4">Features /</div>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
                Un potenziamento <br/>
                <span className="text-[#10b981]">alla sicurezza urbana</span>
              </h2>
              <p className="text-lg text-white/60 mb-10 leading-relaxed font-light">
                Dimentica i bollettini sul traffico ritardati o i filtri algoritmici. Trasformiamo gli smartphone dei cittadini in un ecosistema vivo che mappa il tessuto urbano istante per istante. L'invisibile diventa visibile.
              </p>
              <button 
                onClick={() => setIsMapModalOpen(true)} 
                className="inline-block bg-white text-black px-8 py-4 rounded-full font-bold transition-transform hover:scale-105"
              >
                Scopri la Mappa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Solarsis Style: Services */}
      <section className="py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-sm mb-4">Services /</div>
              <h2 className="text-5xl font-bold tracking-tight">
                Soluzioni Live <br/>
                <span className="text-[#10b981]">Costruite per te</span>
              </h2>
            </div>
            <Link to="/Home" className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors font-medium">
              Vedi tutte
            </Link>
          </div>

          <div className="w-full h-[1px] bg-white/10 mb-16 border-dashed" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Blurb 1 */}
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <Map className="w-12 h-12 text-[#10b981] mb-8" />
              <h3 className="text-2xl font-bold mb-4">La Mappa Viva</h3>
              <p className="text-white/60 font-light mb-8">
                Osserva il battito della tua città. Eventi, blocchi e pericoli appaiono istantaneamente. Zero latenza, nessuna censura editoriale.
              </p>
              <span className="text-[#10b981] font-bold">Read more</span>
            </div>

            {/* Blurb 2 */}
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <BellRing className="w-12 h-12 text-[#10b981] mb-8" />
              <h3 className="text-2xl font-bold mb-4">Allerte Preventive</h3>
              <p className="text-white/60 font-light mb-8">
                Un radar in tasca. Ricevi notifiche geolocalizzate esclusive solo per le minacce che intersecano il tuo raggio vitale.
              </p>
              <span className="text-[#10b981] font-bold">Read more</span>
            </div>

            {/* Blurb 3 */}
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <Users className="w-12 h-12 text-[#10b981] mb-8" />
              <h3 className="text-2xl font-bold mb-4">Karma & Immunità</h3>
              <p className="text-white/60 font-light mb-8">
                L'intelligenza collettiva batte le fake news. Un sistema di validazione incrociata auto-regolante isola e banna i troll prima che tu li veda.
              </p>
              <span className="text-[#10b981] font-bold">Read more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Solarsis Style: Steps */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="text-[#10b981] font-bold tracking-widest uppercase text-sm mb-4">Steps /</div>
            <h2 className="text-5xl font-bold tracking-tight">
              Il tuo viaggio verso <br/>
              <span className="text-[#10b981]">la Sicurezza</span>
            </h2>
          </div>

          <div className="w-full h-[1px] bg-white/10 mb-16 border-dashed" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-6xl font-bold text-white/10 mb-6">01.</div>
              <h3 className="text-xl font-bold mb-4">Zero Attrito</h3>
              <p className="text-white/60 font-light">Nessuna registrazione asfissiante. Entra e osserva subito la mappa pulsante della tua metropoli.</p>
            </div>
            <div>
              <div className="text-6xl font-bold text-white/10 mb-6">02.</div>
              <h3 className="text-xl font-bold mb-4">Intercetta</h3>
              <p className="text-white/60 font-light">Anticipa i blocchi stradali e le zone a rischio prima ancora di accendere il navigatore della tua auto.</p>
            </div>
            <div>
              <div className="text-6xl font-bold text-white/10 mb-6">03.</div>
              <h3 className="text-xl font-bold mb-4">Diventa Autore</h3>
              <p className="text-white/60 font-light">Hai visto qualcosa? In 3 tap la tua segnalazione è live su migliaia di schermi in città.</p>
            </div>
            <div>
              <div className="text-6xl font-bold text-white/10 mb-6">04.</div>
              <h3 className="text-xl font-bold mb-4">Domina la Rete</h3>
              <p className="text-white/60 font-light">Le tue segnalazioni corrette aumentano il tuo Status, dandoti privilegi e autorevolezza nel sistema.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter />

      {/* Italy 3D Modal */}
      <ItalyMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
    </div>
  );
}
