import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Bell, MapPin, Crown, LogOut, ChevronRight, Sun, Moon,
  AlertTriangle, Flame, Car, Heart, Radio, CloudLightning,
  Lock, HelpCircle, Shield, Loader2
} from 'lucide-react';
import PrivacySheet from '@/components/common/PrivacySheet';
import HistorySection from '@/components/profile/HistorySection';
import { getReliabilityLevel, getNextTier } from '@/components/data/reliability';
import { toast } from 'sonner';
import { db } from '@/lib/db';

const NOTIFY_TYPES = [
  { key: 'notify_crime',    emoji: '🚨', label: 'Crimini' },
  { key: 'notify_fire',     emoji: '🔥', label: 'Incendi' },
  { key: 'notify_accident', emoji: '🚗', label: 'Incidenti stradali' },
  { key: 'notify_medical',  emoji: '🏥', label: 'Emergenze mediche' },
  { key: 'notify_traffic',  emoji: '🚦', label: 'Traffico' },
  { key: 'notify_weather',  emoji: '⛈️', label: 'Meteo' },
];

const COMING_SOON_ITEMS = [
  { emoji: '📍', label: 'Luoghi salvati', desc: 'Monitora zone specifiche', comingSoon: true },
  { emoji: '❓', label: 'Aiuto e supporto', desc: 'FAQ e contatti', comingSoon: true },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [settings, setSettings] = useState(() => {
    const defaults = {
      notification_radius: 5,
      notify_crime: true,
      notify_fire: true,
      notify_accident: true,
      notify_medical: true,
      notify_traffic: true,
      notify_weather: true,
    };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem('sentinel_notify_settings') || '{}') };
    } catch {
      return defaults;
    }
  });
  const [notificationPermission, setNotificationPermission] = useState(() => (
    'Notification' in window ? Notification.permission : 'unsupported'
  ));

  useEffect(() => {
    setUser({ id: 'user-1', full_name: 'User', karma: 100, email: 'user@example.com' });
    setLoading(false);
  }, []);

  const updateSetting = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  useEffect(() => {
    localStorage.setItem('sentinel_notify_settings', JSON.stringify(settings));
  }, [settings]);

  const requestBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Questo browser non supporta le notifiche di sistema');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      toast.success('Notifiche browser attivate');
    } else {
      toast.error('Notifiche browser non autorizzate');
    }
  };

  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-28">
      {/* Header */}
      <div className="bg-transparent px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Sentinel Logo" className="w-9 h-9 rounded-xl object-cover" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Profilo</h1>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* User card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-white/6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-orange-500">
              <AvatarFallback className="bg-orange-500 text-white text-xl font-bold">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.full_name || 'Utente'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <Badge variant="outline" className="mt-1.5 text-xs border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                Account Free
              </Badge>
            </div>
          </div>
        </div>

        {/* Affidabilità (karma) */}
        {(() => {
          const karma = user?.karma ?? 0;
          const tier = getReliabilityLevel(karma);
          const next = getNextTier(karma);
          const progress = next ? Math.round(((karma - tier.min) / (next.min - tier.min)) * 100) : 100;
          return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-white/6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-orange-500" aria-hidden="true" />
                <span className="font-semibold text-gray-900 dark:text-white">Affidabilità</span>
                <span className={`ml-auto inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}>
                  <span aria-hidden="true">{tier.icon}</span>
                  {tier.label}
                </span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{karma}</span>
                <span className="text-xs text-gray-500 mb-0.5">punti karma</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${tier.bar} rounded-full transition-all`} style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {next
                  ? <>Mancano <span className="text-gray-900 dark:text-white font-medium">{next.min - karma}</span> punti per <span className={next.color}>{next.label}</span></>
                  : <>Livello massimo raggiunto. La tua segnalazione è prioritaria. 🛡️</>}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-600 mt-2">
                Il karma cresce quando la community conferma le tue segnalazioni. Più sei affidabile, più le tue notifiche sono prioritarie.
              </p>
            </div>
          );
        })()}

        {/* Premium CTA */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 dark:from-orange-500/20 dark:to-red-600/20 rounded-2xl p-4 border border-orange-500/20 dark:border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Sentinel Protect</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">Assistenza 24/7 con agenti dedicati</p>
            </div>
            <Button
              disabled
              size="sm"
              className="bg-orange-500 text-white opacity-60 cursor-not-allowed"
              title="Coming soon"
            >
              Presto
            </Button>
          </div>
        </div>

        {/* Notification radius */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-white/6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Raggio notifiche</span>
            <Badge variant="outline" className="ml-auto text-orange-500 dark:text-orange-400 border-orange-500">
              {settings.notification_radius} km
            </Badge>
          </div>
          <Slider
            value={[settings.notification_radius]}
            onValueChange={([v]) => updateSetting('notification_radius', v)}
            min={1}
            max={20}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-gray-500">Ricevi alert per incidenti entro questo raggio</p>
        </div>

        {/* Notification toggles */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-200 dark:border-white/6">
            <Bell className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Tipi di notifiche</span>
          </div>
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/6">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={requestBrowserNotifications}
              disabled={notificationPermission === 'granted' || notificationPermission === 'unsupported'}
            >
              <Bell className="w-4 h-4 mr-2" />
              {notificationPermission === 'granted'
                ? 'Notifiche browser attive'
                : notificationPermission === 'unsupported'
                  ? 'Notifiche non supportate'
                  : 'Attiva notifiche browser'
              }
            </Button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-white/4">
            {NOTIFY_TYPES.map(({ key, emoji, label }) => (
              <div key={key} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm text-gray-900 dark:text-white">{label}</span>
                </div>
                <Switch
                  checked={settings[key]}
                  onCheckedChange={(v) => updateSetting(key, v)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Theme Toggle (Mobile) */}
        <button
          className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/6 flex items-center justify-between px-4 py-3 text-left shadow-sm dark:shadow-none md:hidden mb-4"
          onClick={toggleTheme}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <div>
              <p className="text-sm text-gray-900 dark:text-white">Tema visivo</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Passa alla modalità {theme === 'dark' ? 'chiara' : 'scura'}</p>
            </div>
          </div>
          {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
        </button>

        {/* Privacy — active */}
        <button
          className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/6 flex items-center justify-between px-4 py-3 text-left shadow-sm dark:shadow-none"
          onClick={() => setShowPrivacy(true)}
          aria-label="Apri impostazioni privacy e GDPR"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">🔒</span>
            <div>
              <p className="text-sm text-gray-900 dark:text-white">Privacy e GDPR</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestisci i tuoi dati</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-600" aria-hidden="true" />
        </button>

        {/* Other options — coming soon */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/6 divide-y divide-gray-200 dark:divide-white/4 shadow-sm dark:shadow-none">
          {COMING_SOON_ITEMS.map(item => (
            <div
              key={item.label}
              className="flex items-center justify-between px-4 py-3 opacity-50 cursor-not-allowed"
              aria-disabled="true"
              title="Prossimamente disponibile"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">{item.emoji}</span>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Presto</span>
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-600" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

        <PrivacySheet open={showPrivacy} onOpenChange={setShowPrivacy} />

        {/* Logout */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Esci dall'account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">Esci dall'account?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                Verrai reindirizzato alla schermata di login.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Annulla</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => {}}>
                Esci
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-center text-xs text-gray-500 dark:text-gray-700 pb-2">Sentinel v1.0.0 · La tua sicurezza, sempre</p>
        <p className="text-center text-xs text-gray-500 dark:text-gray-700 pb-4">
          Titolare del trattamento: Sentinel S.r.l. ·{' '}
          <a href="mailto:privacy@sentinel.app" className="text-gray-600 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-400 underline" aria-label="Contatta il responsabile privacy">privacy@sentinel.app</a>
        </p>
      </div>
    </div>
  );
}
