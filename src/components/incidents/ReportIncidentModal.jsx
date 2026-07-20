import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TYPE_CONFIG } from '@/components/data/mockData';
import { Button } from '@/components/ui/button';
import { X, Send, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function ReportIncidentModal({ isOpen, onClose, userLocation }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!type) return;
    setIsSubmitting(true);
    setError(null);

    const targetLoc = userLocation || { lat: 41.9028, lng: 12.4964 };

    const payload = {
      id: "will-be-generated",
      type: type,
      title: "Segnalazione Utente",
      description: description || "Nessuna descrizione",
      severity: "medium",
      latitude: targetLoc.lat,
      longitude: targetLoc.lng,
      address: "Posizione attuale",
      city: "Sconosciuta",
      status: "active",
      media_urls: []
    };

    try {
      const res = await fetch('http://localhost:8000/api/incidents/user-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Errore durante la segnalazione');
      }

      // Success
      queryClient.invalidateQueries(['incidents']);
      onClose();
      // Reset form
      setTimeout(() => {
        setStep(1);
        setType(null);
        setDescription('');
      }, 300);
      
      // Optional: show a success toast here if you have a toast system
      alert("Segnalazione inviata con successo!");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur to prevent clicks on the map behind */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto border border-gray-200 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-4 text-center border-b border-gray-100 dark:border-white/5">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Segnala Emergenza
                </h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-500" />
                  La tua posizione verrà registrata
                </p>
              </div>

              {/* Body */}
              <div className="p-5">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-2 items-start text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {step === 1 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 text-center">
                      Cosa è successo?
                    </h3>
                    <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1 scrollbar-hide">
                      {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => { setType(key); setStep(2); }}
                          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all shadow-sm"
                        >
                          <span className="text-3xl mb-2">{cfg.emoji}</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{cfg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <span className="text-2xl">{TYPE_CONFIG[type]?.emoji}</span>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tipo selezionato</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{TYPE_CONFIG[type]?.label}</p>
                      </div>
                      <button 
                        onClick={() => setStep(1)}
                        className="ml-auto text-xs text-orange-500 hover:underline font-medium"
                      >
                        Cambia
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dettagli (Opzionale)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Aggiungi dettagli utili..."
                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                        rows={3}
                      />
                    </div>

                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-6 text-lg font-bold shadow-lg shadow-orange-500/30"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Invia Segnalazione
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
