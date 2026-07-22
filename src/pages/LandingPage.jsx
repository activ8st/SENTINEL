import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Map, BellRing, Users, ArrowRight, ShieldCheck, Lock, Eye, Zap, Activity } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import ItalyMapModal from '@/components/ui/ItalyMapModal';
import MarketingNavbar from '@/components/ui/MarketingNavbar';

export default function LandingPage() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    // Import Funnel Display font to match Solarsis aesthetic
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.title = "Sentinel - La tua città. In tempo reale.";
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="bg-[#050505] text-[#f5f5f5] min-h-screen overflow-x-hidden font-sans selection:bg-[#10b981] selection:text-black" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Solarsis Style: Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[900px] h-[900px] bg-[#10b981] opacity-15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-emerald-700 opacity-10 blur-[180px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <MarketingNavbar />

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Text Content */}
            <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#10b981] mb-6 backdrop-blur-md">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Rete di Sicurezza Urbana Attiva 24/7
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-[82px] leading-[0.95] font-bold tracking-tight mb-8">
                La città in tempo reale. <br/>
                <span className="text-[#10b981]">Prima che sia notizia.</span>
              </h1>
              
              <p className="text-lg text-white/70 mb-10 max-w-lg leading-relaxed font-light">
                Scopri incidenti, blocchi stradali ed emergenze nel momento esatto in cui accadono. Sentinel unisce l'IA preventiva alle segnalazioni verificate dei cittadini per renderti padrone delle tue strade.
              </p>
              
              {/* Customer Reviews & Social Proof */}
              <div className="flex items-center gap-6 mb-10">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-gray-600 overflow-hidden"><img src="https://i.pravatar.cc/100?img=33" alt="User" /></div>
                  <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-gray-500 overflow-hidden"><img src="https://i.pravatar.cc/100?img=12" alt="User" /></div>
                  <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-gray-400 overflow-hidden"><img src="https://i.pravatar.cc/100?img=47" alt="User" /></div>
                  <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-[#10b981] flex items-center justify-center text-black font-bold text-xs z-10">+4K</div>
                </div>
                <div className="text-sm font-medium">
                  <div className="flex items-center gap-1 text-[#10b981] mb-1">
                    ★★★★★
                  </div>
                  <div><strong className="text-white">4.9/5</strong> <span className="text-white/60">(Community Attiva in Italia)</span></div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  to="/Auth" 
                  className="inline-flex items-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-9 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  Accedi al Network
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => setIsMapModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors border border-white/10 backdrop-blur-md"
                >
                  Mappa 3D Live
                </button>
              </div>
            </div>

            {/* Right Column: Custom Generated 3D Map Visual */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-950 border border-white/15 relative shadow-2xl group">
                <img 
                  src="/sentinel_hero_map.png" 
                  alt="Sentinel 3D Map Radar" 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Floating UI Overlays */}
                <div className="absolute top-6 right-6 bg-[#090909]/90 border border-white/10 p-4 rounded-2xl backdrop-blur-xl flex items-center gap-3 shadow-xl">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
                  </span>
                  <span className="text-xs font-bold tracking-wide text-white uppercase">Radar Live Milano</span>
                </div>

                <div className="absolute bottom-8 left-6 right-6 bg-[#0d0d0d]/90 border border-white/15 p-5 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40">
                      <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Segnalazione in Tempo Reale</div>
                      <div className="text-xs text-white/60">Verificata dalla community · 300m da te</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-3 py-1.5 rounded-full border border-[#10b981]/30">
                    LIVE
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS TICKER BAR */}
      <section className="py-12 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-1">&lt; 15 sec</div>
            <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Tempo Medio Allerta</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-[#10b981] mb-1">100%</div>
            <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Moderazione Etica</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-white mb-1">30+</div>
            <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Fonti Ufficiali Citate</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-[#10b981] mb-1">2-Step</div>
            <div className="text-xs text-white/50 uppercase tracking-widest font-semibold">Filtro Anti-Discrimine</div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION & ETHICAL MODERATION SECTION */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            <div className="rounded-[2.5rem] overflow-hidden aspect-square border border-white/15 relative shadow-2xl">
              <img 
                src="/milan_skyscrapers.png" 
                alt="Milan Skyscrapers" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 text-[#10b981] font-bold text-sm mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  Garantiamo Protezione & Veridicità
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Ogni evento inviato viene sottoposto all'algoritmo di moderazione a 2 livelli prima che possa comparire sulla mappa.
                </p>
              </div>
            </div>

            <div>
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-sm mb-4">Etica & Tecnologia /</div>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
                Un potenziamento <br/>
                <span className="text-[#10b981]">alla sicurezza urbana</span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed font-light">
                Sentinel elimina i bollettini ritardati e i filtri sensazionalistici. Trasformiamo le segnalazioni in un ecosistema pulito, etico e privo di discriminazioni.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] border border-[#10b981]/20 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Moderazione Automatica a 2 Livelli</h3>
                    <p className="text-sm text-white/60 font-light">Blocco immediato delle generalizzazioni e revisione umana per ogni riferimento sensibile.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] border border-[#10b981]/20 flex-shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Protezione Totale dei Dati</h3>
                    <p className="text-sm text-white/60 font-light">Nessuna condivisione a terzi. I media allegati restano isolati e protetti fino ad approvazione.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsMapModalOpen(true)} 
                className="inline-flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-full font-bold transition-transform hover:scale-105 shadow-xl"
              >
                Esplora la Mappa 3D
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-32 bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <div className="text-[#10b981] font-bold tracking-widest uppercase text-sm mb-4">Soluzioni Live /</div>
              <h2 className="text-5xl font-bold tracking-tight">
                Funzionalità <br/>
                <span className="text-[#10b981]">progettate per te</span>
              </h2>
            </div>
            <Link to="/Auth" className="px-8 py-3.5 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-colors font-medium text-sm">
              Accedi alla Piattaforma
            </Link>
          </div>

          <div className="w-full h-[1px] bg-white/10 mb-16 border-dashed" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white/[0.03] p-10 rounded-3xl border border-white/10 hover:border-[#10b981]/50 transition-all hover:bg-white/[0.05] group">
              <Map className="w-12 h-12 text-[#10b981] mb-8 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4">La Mappa Viva</h3>
              <p className="text-white/60 font-light mb-8 leading-relaxed">
                Osserva il battito della tua città in tempo reale. Mappe 3D dettagliate a zero latenza con visualizzazione dei palazzi e dei punti critici.
              </p>
              <span className="text-[#10b981] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Scopri di più &rarr;
              </span>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white/[0.03] p-10 rounded-3xl border border-white/10 hover:border-[#10b981]/50 transition-all hover:bg-white/[0.05] group">
              <BellRing className="w-12 h-12 text-[#10b981] mb-8 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4">Allerte Preventive</h3>
              <p className="text-white/60 font-light mb-8 leading-relaxed">
                Un radar intelligente in tasca. Notifiche geolocalizzate esclusive solo per le minacce che intersecano il tuo raggio di percorrenza.
              </p>
              <span className="text-[#10b981] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Scopri di più &rarr;
              </span>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white/[0.03] p-10 rounded-3xl border border-white/10 hover:border-[#10b981]/50 transition-all hover:bg-white/[0.05] group">
              <Users className="w-12 h-12 text-[#10b981] mb-8 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4">Karma & Affidabilità</h3>
              <p className="text-white/60 font-light mb-8 leading-relaxed">
                Sistema di validazione incrociata. La community vota e attribuisce punti Karma ai segnalatori più autorevoli isolando i falsi allarmi.
              </p>
              <span className="text-[#10b981] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Scopri di più &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS SECTION */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="text-[#10b981] font-bold tracking-widest uppercase text-sm mb-4">Inizia in 4 Step /</div>
            <h2 className="text-5xl font-bold tracking-tight">
              Il tuo viaggio verso <br/>
              <span className="text-[#10b981]">la Sicurezza</span>
            </h2>
          </div>

          <div className="w-full h-[1px] bg-white/10 mb-16 border-dashed" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-6xl font-bold text-[#10b981]/30 mb-6">01.</div>
              <h3 className="text-xl font-bold mb-4">Zero Attrito</h3>
              <p className="text-white/60 font-light text-sm leading-relaxed">Accedi al network senza moduli infiniti. Entra e osserva la mappa pulsante della metropoli.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-6xl font-bold text-[#10b981]/30 mb-6">02.</div>
              <h3 className="text-xl font-bold mb-4">Intercetta</h3>
              <p className="text-white/60 font-light text-sm leading-relaxed">Anticipa i blocchi stradali e le zone a rischio prima di avviare il navigatore della tua auto.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-6xl font-bold text-[#10b981]/30 mb-6">03.</div>
              <h3 className="text-xl font-bold mb-4">Segnala</h3>
              <p className="text-white/60 font-light text-sm leading-relaxed">Hai notato un pericolo? In 3 tap la tua segnalazione viene moderata ed inviata alla community.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-6xl font-bold text-[#10b981]/30 mb-6">04.</div>
              <h3 className="text-xl font-bold mb-4">Guadagna Karma</h3>
              <p className="text-white/60 font-light text-sm leading-relaxed">Le tue segnalazioni verificate ti fanno salire di livello: da Nuovo fino a Guardiano della Città.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#050505] border-t border-white/10 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Pronto a proteggere la tua città?
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto font-light">
            Unisciti alla prima rete partecipata di sicurezza urbana in Italia.
          </p>
          <Link 
            to="/Auth" 
            className="inline-flex items-center gap-3 bg-[#10b981] hover:bg-[#059669] text-black px-12 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            Entra Ora in Sentinel
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Global Footer */}
      <GlobalFooter />

      {/* Italy 3D Modal */}
      <ItalyMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
    </div>
  );
}
