import { db } from '@/lib/db';
import React, { useState, useEffect } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { TYPE_CONFIG } from '@/components/data/mockData';
import {
  ChevronLeft, ChevronRight, MapPin, Loader2, Check, Shield, Upload, X
} from 'lucide-react';
import { toast } from 'sonner';

const TYPES = [
  { value: 'crime',      emoji: '🚨', label: 'Crimine',          desc: 'Furto, aggressione, vandalismo' },
  { value: 'fire',       emoji: '🔥', label: 'Incendio',         desc: 'Incendio, fumo sospetto' },
  { value: 'accident',   emoji: '🚗', label: 'Incidente',        desc: 'Incidente stradale, moto' },
  { value: 'medical',    emoji: '🏥', label: 'Emergenza Medica', desc: 'Persona a terra, malore' },
  { value: 'suspicious', emoji: '👁️', label: 'Att. Sospetta',   desc: 'Comportamento sospetto' },
  { value: 'traffic',    emoji: '🚦', label: 'Traffico',         desc: 'Blocco, deviazione' },
  { value: 'weather',    emoji: '⛈️', label: 'Meteo',            desc: 'Allerta, allagamento' },
  { value: 'other',      emoji: '❗', label: 'Altro',            desc: 'Altro tipo' },
];

const SEVERITIES = [
  { value: 'low',      dot: 'bg-green-500',  label: 'Basso',   desc: 'Non urgente' },
  { value: 'medium',   dot: 'bg-yellow-500', label: 'Medio',   desc: 'Attenzione' },
  { value: 'high',     dot: 'bg-orange-500', label: 'Alto',    desc: 'Situazione seria' },
  { value: 'critical', dot: 'bg-red-500',    label: 'Critico', desc: 'Emergenza immediata' },
];

const DEFAULT_LOC = { lat: 41.9028, lng: 12.4964 };

export default function Report() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=type, 2=details, 3=confirm
  const [successId, setSuccessId] = useState(null);
  const [form, setForm] = useState({
    type: '', title: '', description: '', severity: 'medium',
    latitude: null, longitude: null, address: '', city: '',
    media_urls: [],
  });
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { fetchLocation(); setUser({ id: 'user-1', name: 'User', karma: 100 }); }, []);

  const fetchLocation = () => {
    setLocError(null);
    setLocLoading(true);
    if (!navigator.geolocation) {
      setLocError('Geolocalizzazione non supportata su questo dispositivo');
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setForm(f => ({ ...f, latitude: coords.latitude, longitude: coords.longitude }));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
          const data = await res.json();
          setForm(f => ({
            ...f,
            address: data.display_name?.split(',').slice(0, 3).join(', ') || '',
            city: data.address?.city || data.address?.town || '',
          }));
        } catch {}
        setLocLoading(false);
      },
      (err) => {
        setLocError(err?.message || 'Posizione non disponibile. Attiva il GPS per segnalare.');
        setForm(f => ({ ...f, latitude: null, longitude: null, address: '', city: '' }));
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const hasRealGps = form.latitude !== null && form.longitude !== null;

  const handleSubmit = () => {
    if (!hasRealGps) {
      toast.error('Posizione GPS necessaria per inviare la segnalazione');
      return;
    }
    submitMutation.mutate({
      ...form,
      reported_by_id: user?.id,
      reporter_karma: user?.karma ?? 0,
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      urls.push(URL.createObjectURL(file));
    }
    setForm(f => ({ ...f, media_urls: [...f.media_urls, ...urls] }));
    setUploading(false);
  };

  const submitMutation = {
    mutate: async (data) => {
      try {
        const incidentId = 'inc-' + Date.now();
        const payload = {
          id: incidentId,
          ...data,
          status: 'active'
        };
        const res = await fetch('http://localhost:8000/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('API error');
        setSuccessId(incidentId);
      } catch (e) {
        toast.error('Errore nella segnalazione. Riprova.');
      }
    },
    isPending: false
  };

  const canGoNext = () => {
    if (step === 1) return !!form.type;
    if (step === 2) return form.title.trim().length >= 3;
    return true;
  };

  // Success screen
  if (successId) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Segnalazione inviata!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Grazie. La tua segnalazione aiuta la comunità a restare al sicuro.</p>
          <div className="flex flex-col gap-3">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate(createPageUrl('IncidentDetail') + `?id=${successId}`)}
            >
              Visualizza incidente
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300"
              onClick={() => { setSuccessId(null); setStep(1); setForm({ type:'',title:'',description:'',severity:'medium',latitude:null,longitude:null,address:'',city:'',media_urls:[] }); }}
            >
              Nuova segnalazione
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-white/6 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white w-9 h-9"
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            aria-label={step > 1 ? 'Torna al passo precedente' : 'Torna indietro'}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Segnala incidente</h1>
            <p className="text-xs text-gray-500">Passo {step} di 3</p>
          </div>
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Sentinel Logo" className="w-9 h-9 rounded-xl object-cover" />
          </Link>
        </div>
        <Progress value={(step / 3) * 100} className="h-1.5 bg-gray-100 dark:bg-gray-800" />
      </div>

      <div className="px-4 py-5">
        <AnimatePresence mode="wait">
          {/* Step 1 — Type */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Tipo di incidente</h2>
              <p className="text-sm text-gray-500 mb-5">Seleziona la categoria più appropriata</p>
              <div className="grid grid-cols-2 gap-3">
                {TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, type: t.value }))}
                    className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-98
                      ${form.type === t.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm dark:shadow-none'}`}
                  >
                    <span className="text-3xl">{t.emoji}</span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
              <Button
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white h-12"
                disabled={!form.type}
                onClick={() => setStep(2)}
              >
                Continua <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Descrivi l'incidente</h2>
              <p className="text-sm text-gray-500 mb-5">Più dettagli aiutano la comunità</p>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 text-sm mb-1 block">Titolo breve *</Label>
                  <Input
                    placeholder="Es: Auto in fiamme sul GRA"
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white h-11"
                    maxLength={80}
                  />
                  {form.title.length > 0 && form.title.trim().length < 3 && (
                    <p className="text-xs text-red-400 mt-1">Almeno 3 caratteri</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300 text-sm mb-1 block">Descrizione</Label>
                  <Textarea
                    placeholder="Cosa sta succedendo? Dai più dettagli possibili..."
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300 text-sm mb-2 block">Livello di gravità</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {SEVERITIES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setForm(f => ({ ...f, severity: s.value }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          form.severity === s.value
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${s.dot} mx-auto mb-1.5`} />
                        <span className="text-xs text-gray-900 dark:text-white font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 text-sm mb-1 block">Posizione</Label>
                  <div className={`bg-white dark:bg-gray-900 border rounded-xl p-3 shadow-sm dark:shadow-none ${locError ? 'border-emergency/50' : 'border-gray-200 dark:border-gray-700'}`}>
                    {locLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" /> Rilevamento GPS...
                      </div>
                    ) : locError ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emergency mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-emergency text-sm font-medium">Posizione richiesta</p>
                          <p className="text-xs text-gray-500 mt-0.5">{locError}</p>
                        </div>
                        <button onClick={fetchLocation} className="text-xs text-orange-400 hover:text-orange-300 font-medium">Riprova</button>
                      </div>
                    ) : form.address ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-900 dark:text-white text-sm">{form.address}</p>
                          {form.latitude && <p className="text-xs text-gray-500">{form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</p>}
                        </div>
                        <button onClick={fetchLocation} className="ml-auto text-xs text-orange-400 hover:text-orange-300">Aggiorna</button>
                      </div>
                    ) : (
                      <Button variant="ghost" className="w-full text-gray-400" onClick={fetchLocation}>
                        <MapPin className="w-4 h-4 mr-2" /> Rileva posizione
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    La geolocalizzazione è obbligatoria per evitare segnalazioni false.
                  </p>
                </div>

                {/* Photo upload */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 text-sm mb-1 block">Foto (opzionale)</Label>
                  <label htmlFor="photo-upload" className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors shadow-sm dark:shadow-none">
                    {uploading
                      ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      : <Upload className="w-5 h-5 text-gray-400" />
                    }
                    <span className="text-sm text-gray-400">{uploading ? 'Caricamento...' : 'Tocca per aggiungere foto'}</span>
                    <input id="photo-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                  {form.media_urls.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {form.media_urls.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setForm(f => ({ ...f, media_urls: f.media_urls.filter((_, idx) => idx !== i) }))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white h-12"
                disabled={!canGoNext()}
                onClick={() => setStep(3)}
              >
                Continua <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Conferma segnalazione</h2>
              <p className="text-sm text-gray-500 mb-5">Controlla i dettagli prima di inviare</p>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/6 p-4 space-y-3 mb-6 shadow-sm dark:shadow-none">
                {[
                  { label: 'Tipo', value: TYPES.find(t => t.value === form.type)?.label },
                  { label: 'Titolo', value: form.title },
                  { label: 'Gravità', value: SEVERITIES.find(s => s.value === form.severity)?.label },
                  { label: 'Posizione', value: form.address || '—' },
                  { label: 'Foto', value: form.media_urls.length > 0 ? `${form.media_urls.length} foto` : 'Nessuna' },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-4">
                    <span className="text-xs text-gray-500 min-w-[70px]">{row.label}</span>
                    <span className="text-sm text-gray-900 dark:text-white text-right">{row.value}</span>
                  </div>
                ))}
                {form.description && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Descrizione</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{form.description}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center mb-5">
                Inviando confermo che le informazioni siano veritiere e accetto che i dati vengano pubblicati in conformità al{' '}
                <span className="text-orange-400">GDPR</span>.
                La tua posizione e il contenuto saranno visibili agli altri utenti.
              </p>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 disabled:opacity-40"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !hasRealGps}
              >
                {submitMutation.isPending
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Invio in corso...</>
                  : !hasRealGps
                    ? <><MapPin className="w-4 h-4 mr-2" /> Posizione GPS richiesta</>
                    : <><Check className="w-4 h-4 mr-2" /> Invia segnalazione</>
                }
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
