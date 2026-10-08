import React, { useState, useEffect } from 'react';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MapPin, Sun, Moon, Heart, Shield, Sparkles, UserCheck, Lock
} from 'lucide-react';
import HistorySection from '@/components/profile/HistorySection';
import IncidentCard from '@/components/incidents/IncidentCard';
import { getReliabilityLevel, getNextTier } from '@/components/data/reliability';

const getLikedIncidentsFromStorage = () => {
  try {
    const raw = localStorage.getItem('sentinel_liked_incidents');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export default function Profile() {
  const { user, isAuthenticated, token, logout } = useAuth();
  const [likedIncidents, setLikedIncidents] = useState(getLikedIncidentsFromStorage);
  const [settings, setSettings] = useState(() => {
    const defaults = { notification_radius: 20 };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem('sentinel_notify_settings') || '{}') };
    } catch {
      return defaults;
    }
  });

  const isAnonymous = !token || user?.is_anonymous;

  const updateSetting = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  useEffect(() => {
    localStorage.setItem('sentinel_notify_settings', JSON.stringify(settings));
  }, [settings]);

  // Synchronize liked items dynamically across app
  useEffect(() => {
    const handleLikesUpdated = () => {
      setLikedIncidents(getLikedIncidentsFromStorage());
    };

    window.addEventListener('sentinel_likes_updated', handleLikesUpdated);
    window.addEventListener('storage', handleLikesUpdated);

    return () => {
      window.removeEventListener('sentinel_likes_updated', handleLikesUpdated);
      window.removeEventListener('storage', handleLikesUpdated);
    };
  }, []);

  const { theme, toggleTheme } = useLanguageTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white pb-28 transition-colors duration-300 font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/LandingPage" className="hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Sentinel Logo" className="w-8 h-8 rounded-xl object-cover" />
            </Link>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isAnonymous ? 'Modalità Preview' : 'Profilo Operatore'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Preview Banner if Anonymous */}
        {isAnonymous && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Preview anonima — l'autenticazione personale sarà disponibile in una fase successiva
              </p>
            </div>
            <Link to="/Auth">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shrink-0">
                Accedi / OTP
              </Button>
            </Link>
          </div>
        )}

        {/* User Card */}
        <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-[#10b981] shadow-lg shadow-emerald-950/20">
              <AvatarFallback className="bg-[#10b981] text-white text-xl font-extrabold">
                {isAnonymous ? 'A' : (user?.name?.[0] || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {isAnonymous ? 'Utente anonimo' : (user?.name || user?.email || 'Operatore Sentinel')}
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50 truncate">
                {isAnonymous ? 'Navigazione pubblica locale' : (user?.email || user?.phone || 'Account registrato')}
              </p>
              <Badge variant="outline" className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 ${isAnonymous ? 'border-amber-500/40 text-amber-500 bg-amber-500/10' : 'border-[#10b981]/40 text-[#10b981] bg-[#10b981]/10'}`}>
                {isAnonymous ? 'Modalità Preview Anonima' : 'Verificato Network Sentinel'}
              </Badge>
            </div>

            {!isAnonymous && (
              <Button variant="outline" size="sm" onClick={logout} className="text-xs text-slate-500 dark:text-white/60">
                Esci
              </Button>
            )}
          </div>
        </div>

        {/* Karma Reliability Level */}
        {(() => {
          const karma = isAnonymous ? 0 : (user?.karma ?? 100);
          const tier = getReliabilityLevel(karma);
          const next = getNextTier(karma);
          const progress = next ? Math.round(((karma - tier.min) / (next.min - tier.min)) * 100) : 100;
          return (
            <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#10b981]" aria-hidden="true" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">Affidabilità & Karma</span>
                <span className={`ml-auto inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}>
                  <span aria-hidden="true">{tier.icon}</span>
                  {isAnonymous ? 'Preview Anonima' : tier.label}
                </span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{karma}</span>
                <span className="text-xs text-slate-500 dark:text-white/50 mb-0.5 font-medium">
                  {isAnonymous ? 'punti karma (anteprima)' : 'punti karma'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#10b981] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-slate-500 dark:text-white/60">
                {isAnonymous
                  ? 'Il punteggio karma personale viene attivato con l\'accesso al tuo account personale.'
                  : next
                    ? <>Mancano <span className="text-slate-900 dark:text-white font-bold">{next.min - karma}</span> punti per sbloccare il badge <span className="text-[#10b981] font-bold">{next.label}</span></>
                    : <>Livello massimo di affidabilità raggiunto. Segnalazioni con precedenza assoluta. 🛡️</>}
              </p>
            </div>
          );
        })()}

        {/* 🌟 ALLERTE PREFERITE & SALVATE RECAP SECTION */}
        <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base">Allerte Salvate in Locale</h2>
            </div>
            <Badge variant="outline" className="bg-red-5 text-red-500 border-red-500/30 text-xs font-black">
              {likedIncidents.length} salvati
            </Badge>
          </div>

          {likedIncidents.length > 0 ? (
            <div className="space-y-4 pt-2">
              {likedIncidents.map((incident) => {
                const item = typeof incident === 'string' ? { id: incident, title: 'Allerta Salvata', description: 'Allerta salvata nel dispositivo.' } : incident;
                return (
                  <IncidentCard
                    key={item.id}
                    incident={item}
                    distance={item.distance}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 dark:bg-[#08090d] rounded-xl border border-dashed border-slate-300 dark:border-white/10 p-6">
              <Sparkles className="w-8 h-8 text-slate-400 dark:text-white/30 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-white/80">Nessuna allerta salvata nei preferiti</p>
              <p className="text-[11px] text-slate-500 dark:text-white/50 mt-1 max-w-xs mx-auto">
                Clicca sull'icona a forma di cuore 🤍 su qualsiasi notizia nel Feed o in Mappa per salvarla.
              </p>
            </div>
          )}
        </div>

        {/* Notification Radius Slider */}
        <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#10b981]" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">Raggio Notifiche Personale</span>
            <Badge variant="outline" className="ml-auto text-[#10b981] border-[#10b981]/40 bg-[#10b981]/10 font-bold">
              {settings.notification_radius} km
            </Badge>
          </div>
          <Slider
            value={[settings.notification_radius]}
            onValueChange={([v]) => updateSetting('notification_radius', v)}
            min={1}
            max={100}
            step={1}
            className="my-3"
          />
          <p className="text-xs text-slate-500 dark:text-white/50 mt-2">
            Filtra le notifiche per gli incidenti entro {settings.notification_radius} km dalla tua posizione attuale.
          </p>
        </div>

        {/* History Section */}
        <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-xs">
          <HistorySection />
        </div>

      </div>

    </div>
  );
}
