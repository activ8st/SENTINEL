import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Key, ArrowRight, User, Mail, Calendar, Phone } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      if (phone.length > 5) setOtpSent(true);
    } else {
      if (otp.length === 4) {
        // Mock successful login
        login({ id: 'user-1', name: 'Pioniere', karma: 100 });
        navigate('/Home');
      }
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName) {
      login({ id: 'user-new', name: formData.firstName, karma: 50 });
      navigate('/Home');
    }
  };

  return (
    <div className="bg-[#050505] text-[#f5f5f5] min-h-screen font-sans flex flex-col" style={{ fontFamily: "'Funnel Display', sans-serif" }}>
      
      {/* Simple Header */}
      <nav className="w-full border-b border-white/10 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#10b981]" />
            <span className="text-2xl font-bold tracking-tight">Sentinel</span>
          </Link>
          <Link to="/" className="text-sm font-bold text-white/50 hover:text-white transition-colors">
            Torna alla Home
          </Link>
        </div>
      </nav>

      {/* Auth Container - Solarsis 401 Style */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2rem] p-10 md:p-12 relative overflow-hidden shadow-2xl">
          {/* Subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#10b981] opacity-5 blur-[100px] pointer-events-none" />

          {/* Icon */}
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 relative z-10">
            <Key className="w-8 h-8 text-[#10b981]" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 relative z-10">
            {isLogin ? 'Accedi al Network' : 'Diventa un Pioniere'}
          </h1>
          <p className="text-white/50 text-center mb-10 relative z-10 text-sm">
            {isLogin 
              ? 'Inserisci il tuo numero per sbloccare la mappa viva.' 
              : 'Unisciti alla prima rete di emergenza guidata dai cittadini.'}
          </p>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5 relative z-10">
              {!otpSent ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Numero di Telefono</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#10b981] transition-colors" 
                        placeholder="+39 333 000 0000" 
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-lg py-4 rounded-xl mt-2 transition-colors">
                    Ricevi Codice OTP <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Codice di Sicurezza (OTP)</label>
                    <div className="relative">
                      <Key className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-mono text-center tracking-[0.5em] focus:outline-none focus:border-[#10b981] transition-colors" 
                        placeholder="0000" 
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-lg py-4 rounded-xl mt-2 transition-colors">
                    Sblocca <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </form>
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
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-colors" 
                    placeholder="la.tua@email.com" 
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Anno di Nascita</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="number" 
                    min="1900"
                    max="2010"
                    value={formData.birthYear}
                    onChange={(e) => setFormData({...formData, birthYear: e.target.value})}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-colors" 
                    placeholder="YYYY" 
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-lg py-4 rounded-xl mt-2 transition-colors">
                Registrati <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Toggle */}
          <div className="mt-8 text-center relative z-10">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setOtpSent(false);
              }}
              className="text-white/50 hover:text-white text-sm transition-colors font-bold"
            >
              {isLogin ? "Non hai un account? Registrati ora" : "Hai già un account? Accedi"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
