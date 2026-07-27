import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, Building, Scale, AlertTriangle, FileCode } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const normalizeTab = (tab) => (tab === 'sources' ? 'institutional' : tab);
  const [activeTab, setActiveTab] = useState(() => normalizeTab(initialTab));

  useEffect(() => {
    setActiveTab(normalizeTab(initialTab));
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      
      {/* Modal Outer Container */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#09090b] border border-white/20 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#111116] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] border border-[#10b981]/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Centro Legale & Trasparenza Sentinel
                <span className="text-[10px] font-mono bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/15">v2.4 — 2026</span>
              </h2>
              <p className="text-xs text-white/50">Condizioni Generali di Contratto, Privacy GDPR (UE 2016/679) & Politiche di Moderazione</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10 hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/10 bg-[#0c0c0f] overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
              activeTab === 'terms' 
                ? 'bg-[#10b981] text-black border-[#10b981] shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
                : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            Termini e Condizioni di Servizio (20 Articoli)
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
              activeTab === 'privacy' 
                ? 'bg-[#10b981] text-black border-[#10b981] shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
                : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-4 h-4" />
            Informativa Privacy GDPR (UE 2016/679)
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
              activeTab === 'moderation' 
                ? 'bg-[#10b981] text-black border-[#10b981] shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
                : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Scale className="w-4 h-4" />
            Politica di Moderazione Preventiva
          </button>

          <button
            onClick={() => setActiveTab('institutional')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
              activeTab === 'institutional' 
                ? 'bg-[#10b981] text-black border-[#10b981] shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
                : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-4 h-4" />
            Fonti Ufficiali & Attribuzioni
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 text-sm text-white/80 font-light leading-relaxed scrollbar-thin scrollbar-thumb-white/20">
          
          {/* TAB 1: TERMINI E CONDIZIONI COMPLETI (20 ARTICOLI) */}
          {activeTab === 'terms' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#10b981]">Documento Legale Vincolante /</span>
                  <h3 className="text-lg font-bold text-white mt-1">Condizioni Generali di Contratto e Licenza d'Uso Sentinel</h3>
                </div>
                <span className="text-xs text-white/40 font-mono">Ultimo aggiornamento: Luglio 2026</span>
              </div>

              <div className="space-y-6">
                
                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 1 — Inquadramento e Oggetto del Contratto</h4>
                  <p>
                    Il presente documento disciplina i "Termini e Condizioni Generali di Utilizzo e Abbonamento ai Servizi Informatici Sentinel" ("Accordo" o "Termini"), stipulati tra l'utente finale ("Utente") e <strong>Sentinel Inc. / Sentinel Italy S.r.l. Benefit Company</strong> (C.F. e P.IVA 16894320968, con sede legale in Milano, Via Manzoni 14 - "Sentinel" o "Fornitore").
                  </p>
                  <p className="mt-2">
                    Sentinel è un'applicazione informatica e web-app personalizzata che offre funzioni sociali, mappature vettoriali 3D e strumenti partecipati per la rappresentazione geografica temporale di allarmi di pubblica utilità, viabilità, Protezione Civile ed eventi territoriali derivati da fonti pubbliche istituzionali e segnalazioni verificate dalla community.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 2 — Requisiti di Idoneità ed Accettazione</h4>
                  <p>
                    Per accedere e utilizzare i Servizi Sentinel, l'Utente dichiara sotto propria responsabilità di:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-white/70">
                    <li>Avere raggiunto la maggiore età secondo la legge del proprio Stato di nazionalità;</li>
                    <li>Possedere la piena capacità giuridica di agire e di stipulare contratti vincolanti;</li>
                    <li>Fornire informazioni veritiere, accurate e complete al momento dell'iscrizione.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 3 — Variazione Unilaterale degli Accordi</h4>
                  <p>
                    Sentinel si riserva il diritto di apportare modifiche unilaterali ai presenti Termini per giustificati motivi, quali il miglioramento delle funzionalità tecniche, l'adeguamento normativo (GDPR / Cyber Resilience Act) o la garanzia della sicurezza della rete. Le variazioni saranno notificate con preavviso congruo all'Utente all'interno della piattaforma. L'utilizzo continuativo del Servizio costituisce accettazione espressa delle modifiche.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 4 — Licenza d'Uso Personale e Divieto di Commercializzazione</h4>
                  <p>
                    Con l'attivazione del Servizio (gratuito o in abbonamento), Sentinel concede all'Utente una licenza limitata, non esclusiva, personale, non trasferibile e revocabile di utilizzo dell'applicazione. È fatto espresso divieto all'Utente di cedere la licenza a terzi, effettuare il reverse engineering, decompilare, estrarre o commercializzare i dati o il codice di Sentinel senza la preventiva autorizzazione scritta del Fornitore.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 5 — Trattamento dei Dati sulle Allerte e Origine delle Fonti</h4>
                  <p>
                    Le allerte e le notizie rappresentate su Sentinel provengono da: (a) Fonti Pubbliche Istituzionali (INGV, Protezione Civile, Ministero delle Infrastrutture) di comprovata autorevolezza; (b) Segnalazioni partecipate degli Utenti sottoposte al filtro preventivo di moderazione a 2 livelli (Filtro algoritmico + Crowd-Karma).
                  </p>
                  <p className="mt-2 text-[#10b981]">
                    A differenza di piattaforme di scraping non controllato, Sentinel applica un rigido filtro di veridicità preventiva che esclude categoricamente opinioni, dettagli discriminatori e fake news prima che giungano sulla mappa.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 6 — Condizioni dei Pacchetti di Abbonamento e Recesso (Cooling-Off Period)</h4>
                  <p>
                    L'applicazione base di Sentinel è fornita a titolo gratuito. Qualora l'Utente acquisti pacchetti premium aziendali o B2B:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-white/70">
                    <li>Gli abbonamenti si rinnovano automaticamente alla scadenza del periodo prescelto;</li>
                    <li>L'Utente ha il diritto di recedere dal contratto entro 14 (quattordici) giorni dall'adesione (Periodo di Ripensamento - Cooling-Off Period) senza alcuna penale;</li>
                    <li>La disattivazione del rinnovo automatico ha effetto dal primo giorno successivo alla scadenza del periodo in corso.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 7 — Tracciamento in Locale e Garanzia Privacy</h4>
                  <p>
                    L'Utente autorizza l'utilizzo del sensore di geolocalizzazione del proprio dispositivo esclusivamente in locale ed in tempo reale per la delimitazione delle allerte pertinenti nel proprio perimetro di percorrenza. Sentinel non memorizza la cronologia degli spostamenti individuali su server remoti.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 8 — Obblighi dell'Utente e Divieto di Procurato Allarme</h4>
                  <p>
                    L'Utente si impegna a non utilizzare la piattaforma per l'invio di allerte dolosamente false, ingannevoli o diffamatorie. La violazione dell'obbligo comporta il ban immediato del dispositivo e, nei casi previsti dall'Art. 658 c.p. (procurato allarme presso l'Autorità), la segnalazione agli organi di Polizia Giudiziaria.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 9 — Limitazione di Responsabilità (Integrazione e Non Sostituzione 112)</h4>
                  <p>
                    Sentinel costituisce uno strumento informativo partecipato di supporto civico e non sostituisce in alcun caso i Numeri Unici di Emergenza Nazionali ed Europei (112, 113, 115, 118). Il Fornitore non risponde di eventuali danni derivanti da interruzioni di rete mobile, cause di forza maggiore o decisioni dell'Utente basate sulle informazioni consultate.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 10 — Account Aziendali ed Enti Istituzionali</h4>
                  <p>
                    Qualora un account sia creato in nome e per conto di un Ente, Comune o Società, il sottoscrittore dichiara di possedere i poteri di rappresentanza necessari ad impegnare l'organizzazione alle presenti Condizioni Generali.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 11 — Proprietà Intellettuale e Marchi Registrati</h4>
                  <p>
                    Il marchio registrato "Sentinel", i loghi, il design vettoriale 3D, gli algoritmi di moderazione e le interfacce utente sono di proprietà esclusiva di Sentinel Inc. È vietata qualsiasi riproduzione anche parziale senza autorizzazione.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 12 — Sospensione e Manutenzione Programmata</h4>
                  <p>
                    Sentinel si impegna a garantire una disponibilità del servizio pari al 99.8%. Per interventi di manutenzione straordinaria, il Fornitore darà comunicazione preventiva con avviso visibile sulla piattaforma.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 13 — Sistema Karma di Validazione Community</h4>
                  <p>
                    L'affidabilità di ciascun Utente è determinata dal punteggio dinamico "Karma". L'invio di segnalazioni confermate attribuisce punteggio; la smentita o il riscontro negativo comporta il declassamento e la perdita temporanea o definitiva della facoltà di segnalazione.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 14 — Esclusione di Diritti a Terzi</h4>
                  <p>
                    I presenti Accordi producono effetti esclusivamente tra l'Utente e Sentinel Inc. e non attribuiscono alcun diritto a soggetti terzi non aderenti.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 15 — Clausola di Salvaguardia e Nullità Parziale</h4>
                  <p>
                    L'eventuale invalidità o inefficacia di una o più clausole del presente contratto non pregiudica la validità dell'intero accordo, che continuerà ad avere pieno effetto per la parte non interessata dalla nullità.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 16 — Manleva dell'Utente</h4>
                  <p>
                    L'Utente si impegna a manlevare e tenere indenne Sentinel Inc., i suoi amministratori ed i suoi collaboratori da qualsiasi perdita, danno, responsabilità o spesa legale derivante dall'utilizzo illecito del Servizio o dalla violazione dei presenti Termini.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 17 — Durata e Recesso in Qualsiasi Momento</h4>
                  <p>
                    Il presente Contratto produce effetti a tempo indeterminato. L'Utente ha il diritto di recedere in qualsiasi momento eliminando l'applicazione o disattivando il proprio account.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 18 — Assistenza Clienti e Risoluzione Controversie</h4>
                  <p>
                    Per richieste di assistenza o chiarimenti contrattuali, l'Utente può fare riferimento alla sezione "Contatti" del sito ufficiale o scrivere a <span className="text-[#10b981] font-mono">support@sentinel-app.it</span>. Le controversie saranno sottoposte a un preventivo tentativo di conciliazione amichevole.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 19 — Legge Applicabile e Foro Competente Esclusivo</h4>
                  <p>
                    I presenti Termini sono regolati in via esclusiva dalla <strong>Legge Italiana</strong>. Per qualsiasi controversia inerente la validità, interpretazione ed esecuzione del presente Contratto, il Foro competente in via esclusiva è il <strong>Foro di Milano (Italia)</strong>.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">Art. 20 — Domicilio Legale ed Elegibile</h4>
                  <p>
                    Per ogni effetto di legge, Sentinel Inc. elegge domicilio presso la propria sede legale in Milano (MI), Via Manzoni 14, PEC: <span className="text-[#10b981] font-mono">sentinel@pec.it</span>.
                  </p>
                </section>

              </div>
            </div>
          )}

          {/* TAB 2: INFORMATIVA PRIVACY GDPR COMPLETA */}
          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-[#10b981] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Informativa sul Trattamento dei Dati Personali (Art. 13-14 GDPR UE 2016/679)</h3>
                  <p className="text-xs text-white/80">
                    Sentinel adotta un'architettura <strong>Zero-Tracking Profilante</strong>. La posizione GPS dell'Utente è elaborata in memoria volatile (RAM) a livello del singolo dispositivo e non viene mai archiviata nei server centrali per la creazione di profili commerciali.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                
                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">1. Titolare del Trattamento e DPO (Data Protection Officer)</h4>
                  <p>
                    Il Titolare del Trattamento è <strong>Sentinel Inc. / Sentinel Italy S.r.l.</strong>, con sede in Milano, Via Manzoni 14. Email di contatto: <span className="text-[#10b981] font-mono font-semibold">privacy@sentinel-app.it</span>. Il Responsabile della Protezione dei Dati (DPO) è contattabile direttamente alla PEC: <span className="text-[#10b981] font-mono font-semibold">dpo.sentinel@pec.it</span>.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">2. Tipologia di Dati Trattati e Specifiche Tecniche</h4>
                  <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li><strong>Dati di Posizione GPS Istantanea (Local-Only)</strong>: Utilizzati per calcolare i perimetri di rischio attorno all'Utente. La posizione non viene inviata a server esterni né salvata su database.</li>
                    <li><strong>Dati di Navigazione Tecnica</strong>: Indirizzi IP cifrati e salvati temporaneamente (massimo 7 giorni) al solo fine di difesa contro attacchi DDoS e minacce informatiche alla rete.</li>
                    <li><strong>Dati di Segnalazione Partecipata</strong>: Oggetto, luogo indicativo ed orario degli eventi di pubblica utilità inviati dall'Utente. Nessun dato identificativo dell'Utente è visibile sulla mappa pubblica.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">3. Finalità e Base Giuridica del Trattamento</h4>
                  <p>
                    I dati personali sono trattati esclusivamente per l'erogazione del servizio di allerta tempestiva e protezione civica (Art. 6, par. 1, lett. b GDPR) e per il legittimo interesse del Titolare a proteggere la sicurezza della rete da frodi o abusi (Art. 6, par. 1, lett. f GDPR).
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">4. Luogo di Trattamento e Trasferimento Extra-UE</h4>
                  <p>
                    Tutti i dati trattati da Sentinel risiedono esclusivamente all'interno dell'Unione Europea presso data center ubicati a Francoforte (Germania) e Milano (Italia). <strong>Nessun dato viene trasferito in Paesi Extra-UE o soggetti al Cloud Act statunitense.</strong>
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">5. Misure di Sicurezza Cifrata (AES-256 e TLS 1.3)</h4>
                  <p>
                    I dati gestiti sono protetti con cifratura <strong>AES-256 a riposo</strong> e canali di trasmissione protetti tramite <strong>TLS 1.3 con HSTS ed Encryption At Rest</strong>.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">6. Diritti dell'Interessato (Art. 15-22 del Regolamento UE 2016/679)</h4>
                  <p>
                    L'Utente ha il diritto di esercitare in qualsiasi momento i propri diritti previsti dal GDPR:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-white/70">
                    <li>Diritto di Accesso (Art. 15) e Rettifica (Art. 16);</li>
                    <li>Diritto alla Cancellazione / Diritto all'Oblio (Art. 17);</li>
                    <li>Diritto di Limitazione del Trattamento (Art. 18) e Portabilità (Art. 20);</li>
                    <li>Diritto di Opposizione (Art. 21) ed esonero da processi decisionali automatizzati.</li>
                  </ul>
                  <p className="mt-2">
                    Per esercitare tali diritti è sufficiente inviare una richiesta formale a <span className="text-[#10b981] font-mono">dpo@sentinel-app.it</span>. Risposta garantita entro 72 ore.
                  </p>
                </section>

              </div>
            </div>
          )}

          {/* TAB 3: POLITICA DI MODERAZIONE PREVENTIVA */}
          {activeTab === 'moderation' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-xs font-bold uppercase tracking-widest text-[#10b981]">Ethical Moderation Policy /</span>
                <h3 className="text-lg font-bold text-white mt-1">Manifesto e Regolamento di Moderazione Preventiva Sentinel</h3>
              </div>

              <div className="space-y-6">
                
                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">1. Architettura di Moderazione a Due Livelli (Tier-1 + Tier-2)</h4>
                  <p>
                    Sentinel non consente la pubblicazione diretta non filtrata di segnalazioni sulla mappa. Ogni evento segue una procedura a due fasi:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-2 text-white/70">
                    <li><strong>Tier-1 (Filtro Algoritmico Preventivo)</strong>: Analisi sintattica immediata che intercetta e rifiuta automaticamente testi contenenti espressioni d'odio, calunnie, nomi di persone fisiche non pubbliche, stereotipi di genere, etnici o religiosi.</li>
                    <li><strong>Tier-2 (Validazione Karma & Fonti Istituzionali)</strong>: Assegnazione di priorità in base al punteggio Karma degli Utenti presenti nella stessa area o riscontro incrociato con i bollettini ufficiali.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">2. Standard "Dati Oggettivi, Zero Pregiudizi"</h4>
                  <p>
                    Ogni allerta approvata su Sentinel contiene esclusivamente fatti verificabili delimitati dalla formula <strong>"Cosa, Dove, Quando"</strong> (es. *Cantiere Stradale in Via Manzoni, segnalato alle 10:15*). È categoricamente esclusa qualsiasi descrizione soggettiva o profilante dei soggetti coinvolti.
                  </p>
                </section>

                <section>
                  <h4 className="text-base font-bold text-white mb-2 text-[#10b981]">3. Sospensione Temporanea e Ban del Karma</h4>
                  <p>
                    Gli Utenti che inviano allarmi intenzionalmente falsi subiscono la decurtazione del punteggio Karma. In caso di recidiva, il dispositivo viene contrassegnato con Ban Permanente ed interdetto dall'invio di allarmi.
                  </p>
                </section>

              </div>
            </div>
          )}

          {/* TAB 4: FONTI UFFICIALI E ATTRIBUZIONI */}
          {activeTab === 'institutional' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              <p className="text-sm">
                Sentinel integra e sincronizza flussi di dati pubblici aperti ed API verificate rilasciate dalle principali istituzioni italiane per garantire certezza e tempestività alle allerte territoriali.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-bold text-[#10b981] uppercase tracking-wider mb-1">Rilevazione Sismica</div>
                  <h4 className="font-bold text-white text-base mb-1">INGV — Istituto Nazionale Geofisica</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Integrazione API diretta con il Centro Nazionale Terremoti dell'INGV per la segnalazione istantanea degli eventi sismici sul suolo italiano.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-bold text-[#10b981] uppercase tracking-wider mb-1">Protezione Civile</div>
                  <h4 className="font-bold text-white text-base mb-1">Dipartimento della Protezione Civile</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Mappatura automatica dei bollettini ufficiali di criticità idrogeologica, allerte meteo rosse/arancioni e calamità regionali.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-bold text-[#10b981] uppercase tracking-wider mb-1">Viabilità Nazionale</div>
                  <h4 className="font-bold text-white text-base mb-1">CCISS Viaggiare Informati / MIT</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Chiusure autostradali, cantieri di rilevanza nazionale e blocchi della viabilità certificati dal Ministero delle Infrastrutture.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="text-xs font-bold text-[#10b981] uppercase tracking-wider mb-1">Geografia & Confini</div>
                  <h4 className="font-bold text-white text-base mb-1">ISTAT Open Data</h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Indicatori demografici e confini amministrativi ufficiali per la suddivisione geografica delle aree di allarme.
                  </p>
                </div>
              </div>

              <div className="text-xs text-white/40 pt-4 border-t border-white/10">
                Nota di attribuzione: Tutti i marchi, i loghi e i nomi delle istituzioni citate appartengono ai rispettivi enti e vengono utilizzati nel rispetto delle licenze Open Data Istituzionali Nazionali (IODL v2.0 / CC-BY 4.0).
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#111116] flex items-center justify-between shrink-0">
          <div className="text-xs text-white/50">
            © 2026 Sentinel Inc. · Documentazione Legale Ufficiale Validata
          </div>
          <button 
            onClick={onClose}
            className="bg-[#10b981] hover:bg-[#059669] text-black px-7 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Preso Atto e Chiudi
          </button>
        </div>

      </div>
    </div>
  );
}
