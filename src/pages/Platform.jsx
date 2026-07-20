import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Zap, Server, Smartphone, Database } from 'lucide-react';
import GlobalFooter from '@/components/ui/GlobalFooter';
import MarketingNavbar from '@/components/ui/MarketingNavbar';

export default function Platform() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#050505] text-[#f5f5f5] min-h-screen font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      <MarketingNavbar />

      {/* Hero "About A" Style */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-6xl md:text-[80px] font-bold tracking-tight leading-[0.95] mb-8">
            Ingegnerizzata per <br/><span className="text-[#10b981]">l'emergenza.</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mb-16">
            Un'architettura serverless progettata per latenza zero. Quando i secondi contano, la nostra infrastruttura distribuita non cede mai.
          </p>
          <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden bg-gray-900 border border-white/10 relative">
             <img 
               src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop" 
               alt="Server Room" 
               className="w-full h-full object-cover mix-blend-luminosity opacity-70"
             />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="border-t border-white/10 pt-8">
              <Smartphone className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4">PWA Universale</h3>
              <p className="text-white/60">Abbiamo bypassato i tempi morti degli app store. La nostra Progressive Web App si installa all'istante, garantendoti l'accesso al network ovunque tu sia.</p>
            </div>
            <div className="border-t border-white/10 pt-8">
              <Server className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Calcolo Perimetrale</h3>
              <p className="text-white/60">L'Edge Computing ci permette di elaborare i dati a un millisecondo da te. Ricevi le allerte critiche prima ancora che sfiorino i nostri database centrali.</p>
            </div>
            <div className="border-t border-white/10 pt-8">
              <Database className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Scalabilità NoSQL</h3>
              <p className="text-white/60">Un cluster di database distribuito addestrato per queries spaziali iper-veloci. Identifichiamo minacce nel tuo raggio d'azione alla velocità della luce.</p>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
