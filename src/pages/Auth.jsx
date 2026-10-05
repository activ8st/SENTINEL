import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Key, ArrowRight, Phone, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/sentinelApi';
import { IS_DEMO_MODE } from '@/lib/db';

const COUNTRY_CODES = [
  { flag: '🇮🇹', name: 'Italia', code: '+39' },
  { flag: '🇺🇸', name: 'Stati Uniti', code: '+1' },
  { flag: '🇬🇧', name: 'Regno Unito', code: '+44' },
  { flag: '🇫🇷', name: 'Francia', code: '+33' },
  { flag: '🇩🇪', name: 'Germania', code: '+49' },
  { flag: '🇪🇸', name: 'Spagna', code: '+34' },
  { flag: '🇨🇭', name: 'Svizzera', code: '+41' },
  { flag: '🇦🇹', name: 'Austria', code: '+43' },
  { flag: '🇧🇪', name: 'Belgio', code: '+32' },
  { flag: '🇳🇱', name: 'Olanda', code: '+31' },
  { flag: '🇷🇺', name: 'Russia', code: '+7' },
  { flag: '🇨🇳', name: 'Cina', code: '+86' },
  { flag: '🇯🇵', name: 'Giappone', code: '+81' },
  { flag: '🇧🇷', name: 'Brasile', code: '+55' },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Register state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthYear: '',
    email: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fullPhone = `${selectedCountry.code}${phone.replace(/\s+/g, '')}`;
  const targetIdentifier = authMethod === 'email' ? email.trim() : fullPhone;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (authMethod === 'email') {
      if (!email.trim() || !email.includes('@')) {
        toast.error('Inserisci un indirizzo email valido.');
        return;
      }
    } else {
      if (phone.trim().length < 6) {
        toast.error('Inserisci un numero di telefono valido.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = authMethod === 'email' ? { email: email.trim() } : { phone: fullPhone };
      const response = await apiFetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeoutMs: 20000
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Impossibile inviare il codice OTP.');
      }

      const data = await response.json();
      setOtpSent(true);

      if (IS_DEMO_MODE && data.demo_code) {
        setDemoCode(data.demo_code);
        toast.success(`[DEMO MODE] Codice generato per ${targetIdentifier}: ${data.demo_code}`, { duration: 10000 });
      } else {
        const destinationLabel = authMethod === 'email' ? `all'email ${email}` : `via SMS a ${fullPhone}`;
        toast.success(`Codice di verifica inviato ${destinationLabel}`);
      }
    } catch (err) {
      if (IS_DEMO_MODE) {
        const mockCode = '1234';
        setDemoCode(mockCode);
        setOtpSent(true);
        toast.success(`[DEMO MODE OFFLINE] Codice OTP: ${mockCode}`, { duration: 10000 });
      } else {
        toast.error(err.message || 'Errore nella connessione al servizio OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Inserisci il codice OTP ricevuto.');
      return;
    }

    setLoading(true);
    try {
      const payload = authMethod === 'email' 
        ? { email: email.trim(), code: otp } 
        : { phone: fullPhone, code: otp };

      const response = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeoutMs: 20000
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Codice OTP errato o scaduto.');
      }

      const data = await response.json();
      toast.success('Accesso effettuato con successo!');
      login(data.user || { id: 'user-1', name: 'Pioniere', karma: 100 });
      navigate('/');
    } catch (err) {
      if (IS_DEMO_MODE && (otp === demoCode || otp === '1234')) {
        toast.success('Accesso effettuato (Modalità DEMO)!');
        login({ id: 'demo-user', name: 'Pioniere Demo', karma: 100 });
        navigate('/');
      } else {
        toast.error(err.message || 'Codice OTP non valido.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName) {
      toast.success('Registrazione completata!');
      login({ id: 'user-new', name: formData.firstName, karma: 50 });
      navigate('/');
    }
  };

  return (
    <div className="bg-[#050505] text-[#f5f5f5] min-h-screen font-sans flex flex-col selection:bg-[#10b981] selection:text-black" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Header - Strictly links to /LandingPage */}
      <nav className="w-full border-b border-white/10 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/LandingPage" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ShieldAlert className="w-6 h-6 text-[#10b981]" />
            <span className="text-2xl font-bold tracking-tight">Sentinel</span>
          </Link>
          <Link to="/LandingPage" className="text-sm font-bold text-white/50 hover:text-white transition-colors">
            Torna alla Home
          </Link>
        </div>
      </nav>

      {/* Auth Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
          {/* Subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#10b981] opacity-10 blur-[100px] pointer-events-none" />

          {/* Icon */}
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
            <Key className="w-8 h-8 text-[#10b981]" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 relative z-10">
            {isLogin ? 'Accedi al Network' : 'Diventa un Pioniere'}
          </h1>
          <p className="text-white/50 text-center mb-6 relative z-10 text-sm">
            {isLogin 
              ? 'Inserisci la tua email o numero per sbloccare la mappa viva.' 
              : 'Unisciti alla prima rete di emergenza guidata dai cittadini.'}
          </p>

          {isLogin ? (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-5 relative z-10">
                  {/* Selector Tabs: Email / Phone */}
                  <div className="flex bg-[#050505] p-1 rounded-xl border border-white/10 mb-1">
                    <button
                      type="button"
                      onClick={() => setAuthMethod('email')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        authMethod === 'email' 
                          ? 'bg-[#10b981] text-black shadow-md' 
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" /> Email OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('phone')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        authMethod === 'phone' 
                          ? 'bg-[#10b981] text-black shadow-md' 
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" /> Telefono
                    </button>
                  </div>

                  {authMethod === 'email' ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Indirizzo Email</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#10b981] transition-colors" 
                          placeholder="nome@esempio.com" 
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Numero di Telefono</label>
                      <div className="flex gap-2">
                        {/* Country Code Dropdown */}
                        <select 
                          value={selectedCountry.code}
                          onChange={(e) => {
                            const country = COUNTRY_CODES.find(c => c.code === e.target.value);
                            if (country) setSelectedCountry(country);
                          }}
                          className="bg-[#050505] border border-white/10 rounded-xl px-3 py-4 text-white font-medium text-sm focus:outline-none focus:border-[#10b981] transition-colors cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code + c.name} value={c.code} className="bg-[#111] text-white">
                              {c.flag} {c.code} ({c.name})
                            </option>
                          ))}
                        </select>

                        <div className="relative flex-1">
                          <Phone className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#10b981] transition-colors font-mono" 
                            placeholder="333 000 0000" 
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-black font-bold text-lg py-4 rounded-xl mt-2 transition-all hover:scale-[1.02]"
                  >
                    {loading ? 'Invio in corso...' : 'Ricevi Codice OTP'} <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5 relative z-10">
                  <div className="bg-[#10b981]/10 border border-[#10b981]/30 p-4 rounded-xl flex items-center justify-between text-xs text-[#10b981] animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#10b981]" />
                      <span>Codice inviato a <b>{targetIdentifier}</b></span>
                    </div>
                    {IS_DEMO_MODE && demoCode && (
                      <span className="font-mono font-bold bg-[#10b981]/20 px-2 py-1 rounded text-sm text-white">{demoCode}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Codice di Sicurezza (OTP)</label>
                    <div className="relative">
                      <Key className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono text-center tracking-[0.5em] focus:outline-none focus:border-[#10b981] transition-colors text-lg" 
                        placeholder="0000" 
                        maxLength={6}
                        required
                        autoFocus
                      />
                    </div>
                    {IS_DEMO_MODE && demoCode && (
                      <button 
                        type="button" 
                        onClick={() => setOtp(demoCode)} 
                        className="text-xs text-[#10b981] underline hover:opacity-80 text-right mt-1"
                      >
                        Inserisci {demoCode} automaticamente
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-black font-bold text-lg py-4 rounded-xl mt-2 transition-all hover:scale-[1.02]"
                  >
                    {loading ? 'Verifica in corso...' : 'Sblocca & Entra'} <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Nome</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-colors" 
                    placeholder="Nome" 
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Cognome</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-colors" 
                    placeholder="Cognome" 
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Anno di Nascita</label>
                <input 
                  type="number" 
                  value={formData.birthYear}
                  onChange={(e) => setFormData({...formData, birthYear: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-colors font-mono" 
                  placeholder="Es. 1995" 
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-colors" 
                  placeholder="nome@email.com" 
                  required
                />
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-lg py-4 rounded-xl mt-2 transition-all hover:scale-[1.02]">
                Registrati & Entra <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Toggle Login / Register */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
            <button 
              onClick={() => { setIsLogin(!isLogin); setOtpSent(false); }}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              {isLogin ? 'Non hai un account? ' : 'Hai già un account? '}
              <span className="text-[#10b981] font-bold underline">
                {isLogin ? 'Registrati qui' : 'Accedi qui'}
              </span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
