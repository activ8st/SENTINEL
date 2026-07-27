import React, { useState, useEffect } from 'react';
import { useLanguageTheme } from '@/context/LanguageThemeContext';
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
  Lock, HelpCircle, Shield, Loader2, User as UserIcon
} from 'lucide-react';
import PrivacySheet from '@/components/common/PrivacySheet';
import HistorySection from '@/components/profile/HistorySection';
import { getReliabilityLevel, getNextTier } from '@/components/data/reliability';
import { toast } from 'sonner';

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
  const [user, setUser] = useState({ id: 'user-1', full_name: 'Nikolay V.', karma: 120, email: 'nikolay@sentinel.it' });
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [settings, setSettings] = useState(() => {
    const defaults = {
      notification_radius: 20,
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
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  ));

  const updateSetting = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  useEffect(() => {
    localStorage.setItem('sentinel_notify_settings', JSON.stringify(settings));
  }, [settings]);

  const requestBrowserNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
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

  const { theme, toggleTheme } = useLanguageTheme();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#10b981] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white pb-28 transition-colors duration-300 font-sans" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/LandingPage" className="hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Sentinel Logo" className="w-8 h-8 rounded-xl object-cover" />
            </Link>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Profilo Operatore</h1>
          </div>
          
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        
        {/* User Card */}
        <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-md">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-[#10b981] shadow-lg shadow-emerald-950/20">
              <AvatarFallback className="bg-[#10b981] text-white text-xl font-extrabold">
                {user?.full_name?.[0] || 'N'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{user?.full_name || 'Nikolay V.'}</p>
              <p className="text-xs text-slate-500 dark:text-white/50 truncate">{user?.email}</p>
              <Badge variant="outline" className="mt-1.5 text-[10px] font-bold border-[#10b981]/40 text-[#10b981] bg-[#10b981]/10 px-2 py-0.5">
                Verificato Network Sentinel
              </Badge>
            </div>
          </div>
        </div>

        {/* Karma Reliability Level */}
        {(() => {
          const karma = user?.karma ?? 120;
          const tier = getReliabilityLevel(karma);
          const next = getNextTier(karma);
          const progress = next ? Math.round(((karma - tier.min) / (next.min - tier.min)) * 100) : 100;
          return (
            <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#10b981]" aria-hidden="true" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">Affidabilità & Karma Community</span>
                <span className={`ml-auto inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}>
                  <span aria-hidden="true">{tier.icon}</span>
                  {tier.label}
                </span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{karma}</span>
                <span className="text-xs text-slate-500 dark:text-white/50 mb-0.5 font-medium">punti karma</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                <div className={`h-full bg-[#10b981] rounded-full transition-all`} style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-slate-500 dark:text-white/60">
                {next
                  ? <>Mancano <span className="text-slate-900 dark:text-white font-bold">{next.min - karma}</span> punti per sbloccare il badge <span className="text-[#10b981] font-bold">{next.label}</span></>
                  : <>Livello massimo di affidabilità raggiunto. Segnalazioni con precedenza assoluta. 🛡️</>}
              </p>
            </div>
          );
        })()}

        {/* Notification Radius Slider */}
        <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-md">
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
            Riceverai allerte istantanee in tempo reale per tutti gli incidenti entro {settings.notification_radius} km dalla tua posizione.
          </p>
        </div>

        {/* History Section */}
        <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-md">
          <HistorySection />
        </div>

      </div>

    </div>
  );
}
