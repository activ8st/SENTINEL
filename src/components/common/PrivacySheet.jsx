import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Lock, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function PrivacySheet({ open, onOpenChange }) {
  const resetConsent = () => {
    localStorage.removeItem('sentinel_gdpr_consent');
    toast.success('Preferenze privacy reimpostate. Ricarica l\'app.');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-gray-900 border-t border-gray-700 rounded-t-3xl max-h-[85vh] overflow-y-auto"
        aria-label="Impostazioni privacy"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-500" aria-hidden="true" />
            Privacy e GDPR
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
          <section aria-labelledby="data-collected">
            <h3 id="data-collected" className="text-white font-semibold mb-2">Dati che raccogliamo</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><strong className="text-gray-300">Posizione GPS</strong> — solo durante l'uso dell'app, mai in background</li>
              <li><strong className="text-gray-300">Email e nome</strong> — per il tuo account</li>
              <li><strong className="text-gray-300">Contenuti generati</strong> — segnalazioni, foto, commenti</li>
              <li><strong className="text-gray-300">Preferenze notifiche</strong> — salvate localmente e sul server</li>
            </ul>
          </section>

          <section aria-labelledby="data-use">
            <h3 id="data-use" className="text-white font-semibold mb-2">Come usiamo i tuoi dati</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Mostrare incidenti nella tua zona</li>
              <li>Inviare notifiche di sicurezza personalizzate</li>
              <li>Migliorare la qualità delle segnalazioni</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">Non vendiamo né condividiamo i tuoi dati con terze parti a fini commerciali.</p>
          </section>

          <section aria-labelledby="user-rights">
            <h3 id="user-rights" className="text-white font-semibold mb-2">I tuoi diritti (GDPR Art. 15-22)</h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>✅ Diritto di <strong className="text-gray-300">accesso</strong> ai tuoi dati</li>
              <li>✅ Diritto di <strong className="text-gray-300">rettifica</strong> dei dati errati</li>
              <li>✅ Diritto alla <strong className="text-gray-300">cancellazione</strong> ("diritto all'oblio")</li>
              <li>✅ Diritto alla <strong className="text-gray-300">portabilità</strong> dei dati</li>
              <li>✅ Diritto di <strong className="text-gray-300">opposizione</strong> al trattamento</li>
            </ul>
          </section>

          <section aria-labelledby="retention">
            <h3 id="retention" className="text-white font-semibold mb-2">Conservazione dei dati</h3>
            <p>I dati delle segnalazioni vengono conservati per <strong className="text-gray-300">90 giorni</strong> dopo la risoluzione dell'incidente, poi anonimizzati. I dati del profilo vengono cancellati entro 30 giorni dalla richiesta.</p>
          </section>

          <section aria-labelledby="contact">
            <h3 id="contact" className="text-white font-semibold mb-2">Contatto DPO</h3>
            <p>Per esercitare i tuoi diritti o per richieste privacy:</p>
            <a
              href="mailto:privacy@sentinel.app"
              className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 mt-1"
              aria-label="Invia email al DPO per richieste privacy"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              privacy@sentinel.app
            </a>
          </section>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={resetConsent}
            aria-label="Reimposta preferenze privacy e consenso"
          >
            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Reimposta preferenze privacy
          </Button>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => onOpenChange(false)}
          >
            Chiudi
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}