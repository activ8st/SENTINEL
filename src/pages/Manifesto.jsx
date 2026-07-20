import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, CloudLightning, Activity } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import MarketingNavbar from '@/components/ui/MarketingNavbar';

export default function Manifesto() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#050505] text-[#f5f5f5] min-h-screen font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar />

      {/* Hero Banner Style */}
      <section className="pt-24 pb-16 bg-[#111] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-[80px] font-bold tracking-tight mb-6">
            La Verità, <span className="text-[#10b981]">Senza Filtri.</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">I media arrivano quando è già successo. Noi ci siamo mentre accade.</p>
        </div>
      </section>

      {/* Main Content - Split Layout (Service Style) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar FOMO Stats */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-[#111] border border-red-500/20 p-8 rounded-[2rem]">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                <h3 className="text-4xl font-bold mb-2 text-white">+24%</h3>
                <p className="text-white/60 font-medium">Aumento della criminalità urbana non documentata dai canali ufficiali nell'ultimo anno.</p>
              </div>
              <div className="bg-[#111] border border-orange-500/20 p-8 rounded-[2rem]">
                <Activity className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-4xl font-bold mb-2 text-white">4.2 Min</h3>
                <p className="text-white/60 font-medium">Tempo medio di risposta di Sentinel rispetto ai 15 minuti dei bollettini tradizionali sugli incidenti.</p>
              </div>
              <div className="bg-[#111] border border-blue-500/20 p-8 rounded-[2rem]">
                <CloudLightning className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-4xl font-bold mb-2 text-white">Imprevedibile</h3>
                <p className="text-white/60 font-medium">Eventi climatici estremi locali sfuggono ai radar nazionali. Solo chi è sul posto sa cosa sta succedendo.</p>
              </div>
            </div>

            {/* Right Rich Text Content */}
            <div className="lg:col-span-8 prose prose-invert prose-lg max-w-none">
              <h2 className="text-4xl font-bold text-white mb-6">"Perché non me l'ha detto nessuno?"</h2>
              <p className="text-white/70 text-xl leading-relaxed mb-8">
                È la frase che pronunciamo ogni volta che restiamo bloccati nel traffico di un incidente di cui nessuno aveva parlato. Viviamo nell'era dell'informazione istantanea, eppure siamo ciechi su ciò che accade nell'isolato accanto al nostro.
              </p>
              
              <h3 className="text-2xl font-bold text-white mb-4 mt-12">L'Illusione del Controllo</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                I canali ufficiali sono lenti. Hanno procedure, verifiche infinite, burocrazia. Quando un bollettino viene diramato, il danno è già fatto. I social media, d'altra parte, sono ostaggio degli algoritmi: seppelliscono le emergenze reali sotto valanghe di contenuti virali.
              </p>

              <h3 className="text-2xl font-bold text-white mb-4 mt-12">Il Ribaltamento del Potere</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                Abbiamo creato Sentinel per disintermediare l'emergenza. Migliaia di occhi, migliaia di smartphone connessi in un'unica rete neurale. Nessun editore decide cosa è importante per te. Se c'è un pericolo nella tua zona, il tuo telefono vibra. Punto.
              </p>

              <div className="bg-[#10b981]/10 border-l-4 border-[#10b981] p-6 rounded-r-2xl my-10">
                <p className="text-[#10b981] font-bold text-xl m-0 italic">"La sicurezza non è uno scudo concesso dall'alto. È una rete tessuta dal basso."</p>
              </div>
              
              <p className="text-white/70 leading-relaxed">
                Non essere l'ultimo a sapere. Unisciti alla rete e riprendi il controllo della tua città. L'invisibile è appena diventato visibile.
              </p>
            </div>

          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
