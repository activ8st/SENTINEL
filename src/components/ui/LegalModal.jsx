import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, Building, CheckCircle2, Server, Scale, AlertOctagon } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0c0c0e] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#111115]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] border border-[#10b981]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Centro Legale & Trasparenza Sentinel</h2>
              <p className="text-xs text-white/50">Documentazione ufficiale conforme al Regolamento UE 2016/679 (GDPR)</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-1 border-b border-white/10 bg-[#09090b] overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'privacy' 
                ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Privacy Policy (GDPR)
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'terms' 
                ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Termini di Servizio
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'moderation' 
                ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Politica di Moderazione
          </button>

          <button
            onClick={() => setActiveTab('institutional')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'institutional' 
                ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Dati Istituzionali & Fonti
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-white/80 font-light leading-relaxed">
          
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                <div className="text-xs text-white/90 leading-relaxed">
                  <strong className="text-white font-bold block mb-1">Garante della Privacy & Architettura Privacy-First</strong>
                  Sentinel garantisce che la geolocalizzazione dell'utente viene processata esclusivamente sul dispositivo locale e non viene mai archiviata nei server centrali per scopi di tracciamento o profilazione commerciale.
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Titolare del Trattamento dei Dati</h3>
                <p>
                  Il Titolare del trattamento dei dati è <strong>Sentinel Inc. / Sentinel Italy Team</strong>. Per qualsiasi chiarimento relativo alla presente Informativa o all'esercizio dei diritti previsti dal GDPR, è possibile contattare il Responsabile della Protezione dei Dati (DPO) all'indirizzo email dedicato: <span className="text-[#10b981] font-mono">dpo@sentinel-app.it</span>.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Tipologia di Dati Trattati e Finalità</h3>
                <ul className="list-disc pl-5 space-y-2 text-white/70">
                  <li><strong>Dati di Posizione GPS (Local Processing)</strong>: La posizione dell'utente viene letta in locale per calcolare gli alert pertinenti nel raggio di percorrenza. Nessuna cronologia degli spostamenti viene memorizzata o ceduta a terzi.</li>
                  <li><strong>Dati di Navigazione Tecnica</strong>: Indirizzi IP anonimizzati e log di sistema conservati temporaneamente al solo fine di garantire la sicurezza dell'infrastruttura contro attacchi informatici (DDoS).</li>
                  <li><strong>Segnalazioni Volontarie</strong>: Fatti ed eventi inviati dagli utenti (senza dati identificativi di terzi) per la condivisione di notizie di utilità pubblica.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Base Giuridica del Trattamento</h3>
                <p>
                  Il trattamento dei dati si fonda sull'esecuzione del contratto di servizio di cui l'utente è parte (Art. 6, par. 1, lett. b GDPR) e sul legittimo interesse del Titolare a garantire la sicurezza tecnica della rete e l'integrità dei contenuti informativi (Art. 6, par. 1, lett. f GDPR).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Conservazione e Sicurezza dei Dati (Server in UE)</h3>
                <p>
                  Tutti i server di Sentinel sono ospitati esclusivamente all'interno del territorio dell'Unione Europea (Regioni di Francoforte e Milano) con cifratura a riposo <strong>AES-256</strong> e comunicazioni protette tramite protocollo <strong>TLS 1.3</strong>.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">5. Diritti dell'Interessato (Art. 15-22 GDPR)</h3>
                <p>
                  In quanto utente, hai il diritto in qualsiasi momento di richiedere l'accesso, la rettifica, la cancellazione (diritto all'oblio), la limitazione del trattamento e la portabilità dei tuoi dati scrivendo a <span className="text-[#10b981] font-mono">privacy@sentinel-app.it</span>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TERMINI DI SERVIZIO */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Oggetto del Servizio</h3>
                <p>
                  Sentinel è una piattaforma partecipata di informazione e allerta di sicurezza urbana e protezione civile. Il servizio viene fornito a titolo gratuito per consentire la consultazione di eventi verificati ed allerte ufficiali.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Regole di Condotta dell'Utente</h3>
                <p className="mb-2">L'utente si impegna a utilizzare la piattaforma nel rispetto delle leggi vigenti. È severamente vietato:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-white/70">
                  <li>Inviare segnalazioni intenzionalmente false, ingannevoli o procurare allarmi infondati.</li>
                  <li>Inserire contenuti diffamatori, discriminatori o lesivi della dignità altrui.</li>
                  <li>Effettuare attacchi informatici o tentare lo scraping automatizzato della rete.</li>
                </ul>
                <p className="mt-2 text-xs text-amber-400">
                  ⚠️ L'invio reiterato di fake news o tentativi di abuso comportano il ban permanente del dispositivo e la segnalazione alle autorità preposte.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Limite di Responsabilità (Servizio Integrativo)</h3>
                <p>
                  Sentinel costituisce uno strumento informativo di supporto alla cittadinanza e non sostituisce in alcun modo i numeri unici di emergenza nazionali (112, 113, 115, 118). In caso di pericolo immediato, l'utente deve contattare tempestivamente le autorità di soccorso.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">4. Proprietà Intellettuale</h3>
                <p>
                  Il marchio Sentinel, il codice sorgente, l'algoritmo di moderazione preventiva e la grafica dell'applicazione sono di proprietà esclusiva di Sentinel Inc. Ogni riproduzione non autorizzata è vietata.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: POLITICA DI MODERAZIONE */}
          {activeTab === 'moderation' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <h4 className="font-bold text-[#10b981] mb-1">Principio Etico Fondamentale /</h4>
                <p className="text-xs text-white/70">
                  Sentinel elimina la disinformazione e il sensazionalismo. Ogni segnalazione sulla mappa risponde a criteri oggettivi e rigorosi prima di diventare pubblica.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">1. Filtro Preventivo Algoritmico (Tier-1)</h3>
                <p>
                  Tutti i testi inviati vengono vagliati da un motore sintattico preventivo che blocca istantaneamente parole chiave discriminatorie, insulti, nomi propri di persone non pubbliche ed espressioni di incitamento all'odio o stereotipi etnici.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">2. Validazione Incrociata della Community & Karma (Tier-2)</h3>
                <p>
                  Ogni utente possiede un punteggio di reputazione (Karma) calcolato in base alla precisione dello storico delle sue segnalazioni. Gli utenti con alto Karma sul posto possono verificare o smentire una segnalazione in tempo reale.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">3. Criterio di Pubblicazione "Cosa, Dove, Quando"</h3>
                <p>
                  Sentinel pubblica esclusivamente informazioni relative ai fatti: la natura dell'ostacolo o del pericolo, la via/zona e l'orario. Nessun dettaglio personale, somatico o profilante dei soggetti coinvolti viene ammesso.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DATI ISTITUZIONALI & FONTI */}
          {activeTab === 'institutional' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <p>
                Sentinel integra direttamente feed di dati aperti e API istituzionali per garantire che le allerte sulla mappa abbiano una valenza ufficiale e certificata.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-bold text-[#10b981] uppercase mb-1">Sismologia & Terremoti</div>
                  <div className="font-bold text-white mb-1">INGV (Istituto Naz. Geofisica)</div>
                  <p className="text-xs text-white/60">Flusso dati in tempo reale sugli eventi sismici in Italia con magnitudo ed epicentro.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-bold text-[#10b981] uppercase mb-1">Meteo & Calamità</div>
                  <div className="font-bold text-white mb-1">Protezione Civile Italiana</div>
                  <p className="text-xs text-white/60">Bollettini di criticità idrogeologica ed allerte meteo ufficiali su scala nazionale.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-bold text-[#10b981] uppercase mb-1">Viabilità & Cantieri</div>
                  <div className="font-bold text-white mb-1">CCISS / Min. Infrastrutture</div>
                  <p className="text-xs text-white/60">Allerte viabilità, blocchi stradali e chiusure autostradali certificate.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-bold text-[#10b981] uppercase mb-1">Territorio & Statistica</div>
                  <div className="font-bold text-white mb-1">ISTAT Open Data</div>
                  <p className="text-xs text-white/60">Indicatori demografici e territoriali per la perimetrazione delle macro-aree.</p>
                </div>
              </div>

              <div className="text-xs text-white/40 pt-4 border-t border-white/10">
                Tutti i marchi ed i loghi delle istituzioni citate appartengono ai rispettivi enti e vengono utilizzati nel rispetto delle licenze Open Data nazionali.
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#111115] flex items-center justify-between">
          <div className="text-xs text-white/50">
            © 2026 Sentinel Inc. · Documentazione Legale Verificata
          </div>
          <button 
            onClick={onClose}
            className="bg-[#10b981] text-black px-6 py-2 rounded-xl font-bold text-xs hover:bg-[#059669] transition-colors"
          >
            Chiudi e Accetta
          </button>
        </div>

      </div>
    </div>
  );
}
