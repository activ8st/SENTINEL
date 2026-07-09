import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';

const STORAGE_KEY = 'sentinel_gdpr_consent';

export default function GdprBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Informativa sulla privacy e cookie"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 max-w-[430px] mx-auto"
        >
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white leading-snug">Privacy e dati personali</h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Sentinel usa la tua <strong className="text-gray-300">posizione GPS</strong> per mostrarti gli incidenti vicini. 
                  I dati vengono trattati secondo il <strong className="text-gray-300">GDPR (Reg. EU 2016/679)</strong> e non vengono condivisi con terze parti senza il tuo consenso.
                </p>
              </div>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-3"
                >
                  <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400 space-y-2">
                    <p><span className="text-white font-medium">📍 Geolocalizzazione:</span> usata solo per calcolare le distanze dagli incidenti. Non viene salvata sui nostri server senza tuo consenso esplicito.</p>
                    <p><span className="text-white font-medium">🖼️ Foto caricate:</span> i media allegati alle segnalazioni vengono archiviati in modo sicuro e visibili pubblicamente nel contesto dell'incidente.</p>
                    <p><span className="text-white font-medium">💬 Commenti:</span> i contenuti pubblicati sono associati al tuo account e visibili agli altri utenti dell'app.</p>
                    <p><span className="text-white font-medium">🗑️ Diritto alla cancellazione:</span> puoi richiedere la cancellazione dei tuoi dati in qualsiasi momento scrivendo a <span className="text-orange-400">privacy@sentinel.app</span></p>
                    <p><span className="text-white font-medium">🔒 Base giuridica:</span> trattamento basato sul consenso (Art. 6.1.a GDPR) e legittimo interesse per la sicurezza pubblica (Art. 6.1.f GDPR).</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowDetails(s => !s)}
              className="text-xs text-orange-400 hover:text-orange-300 mb-3 block"
              aria-expanded={showDetails}
              aria-controls="gdpr-details"
            >
              {showDetails ? 'Nascondi dettagli ↑' : 'Leggi l\'informativa completa ↓'}
            </button>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm h-10"
                onClick={accept}
                aria-label="Accetta e continua"
              >
                Accetta e continua
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:text-white text-sm h-10"
                onClick={reject}
                aria-label="Rifiuta il consenso"
              >
                Solo essenziali
              </Button>
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-2">
              Puoi modificare le tue preferenze in qualsiasi momento dal profilo.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}