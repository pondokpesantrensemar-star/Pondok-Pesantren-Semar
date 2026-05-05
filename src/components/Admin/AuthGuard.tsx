import React, { useEffect, useState } from 'react';
import { auth, db, loginWithGoogle, loginWithGoogleRedirect, handleRedirectResult, loginWithUsername } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LogIn, ShieldAlert, User as UserIcon, Key, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'google' | 'username'>('google');
  
  // Username state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    // Detect if running in an iframe
    setIsIframe(window.self !== window.top);

    // Handle redirect result if user used redirect method
    const checkRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        if (result?.user) {
          console.log("✅ Logged in via Redirect:", result.user.email);
        }
      } catch (err: any) {
        console.error("Redirect Error:", err);
        setError(`Gagal login via redirect: ${err.message}`);
      }
    };
    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("🔥 Auth State Changed:", u?.email || 'Logged Out');
      setUser(u);
      
      const ALLOWED_EMAILS = [
        'pondokpesantrensemar@gmail.com',
        // Add other authorized staff emails here
      ].map(e => e.toLowerCase().trim());
      
      if (u && u.email) {
        const currentEmail = u.email.toLowerCase().trim();
        
        console.log("🔍 Checking access for:", currentEmail);
        
        if (ALLOWED_EMAILS.includes(currentEmail)) {
          console.log("✅ ACCESS GRANTED: Staff member detected");
          setIsAdmin(true);
        } else {
          console.log("🚫 ACCESS DENIED: Not in allowed list");
          setIsAdmin(false);
        }
      } else if (u) {
        console.log("⚠️ User found but no email available");
        setIsAdmin(false);
      } else {
        console.log("👋 No user session found");
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setLoginLoading(true);
    setError(null);
    try {
      await loginWithUsername(username, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Username atau password salah.');
      } else {
        setError('Terjadi kesalahan saat login.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pesantren-cream font-sans">
        <div className="w-10 h-10 border-2 border-pesantren-green/20 border-t-pesantren-green rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Securing Panel...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pesantren-cream p-4 font-sans relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pesantren-green/5 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pesantren-gold/5 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-pesantren-border max-w-sm w-full text-center relative z-10"
        >
          <div className="w-16 h-16 bg-pesantren-green text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pesantren-green/10">
            <LogIn size={32} />
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-pesantren-dark mb-1 tracking-tight">Admin Login</h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black mb-8">Pondok Pesantren Semar</p>

          <div className="flex bg-gray-50 p-1 rounded-2xl mb-8 border border-gray-100">
            <button 
              onClick={() => setLoginMethod('google')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'google' ? 'bg-white text-pesantren-green shadow-sm border border-gray-100' : 'text-gray-400'}`}
            >
              Google
            </button>
            <button 
              onClick={() => setLoginMethod('username')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'username' ? 'bg-white text-pesantren-green shadow-sm border border-gray-100' : 'text-gray-400'}`}
            >
              Staff
            </button>
          </div>

          {loginMethod === 'google' ? (
            <div className="space-y-4">
              <button 
                onClick={async () => {
                  try {
                    setError(null);
                    setLoginLoading(true);
                    await loginWithGoogle();
                  } catch (e: any) {
                    setLoginLoading(false);
                    if (e.code === 'auth/popup-closed-by-user') {
                      setError("Window login ditutup sebelum selesai.");
                    } else if (e.code === 'auth/network-request-failed') {
                      setError("Koneksi gagal.");
                    } else {
                      setError(e.message || "Gagal membuka jendela login.");
                    }
                  } finally {
                    setLoginLoading(false);
                  }
                }}
                disabled={loginLoading}
                className="w-full bg-pesantren-dark text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-pesantren-green transition-all shadow-lg shadow-pesantren-dark/10 disabled:opacity-50"
              >
                {loginLoading ? 'Loading...' : 'Sign in with Google'}
                <ArrowRight size={14} />
              </button>
              
              {!isIframe && (
                <button 
                  onClick={async () => {
                    try {
                      setError(null);
                      setLoginLoading(true);
                      await loginWithGoogleRedirect();
                    } catch (e: any) {
                      setLoginLoading(false);
                      setError(e.message);
                    }
                  }}
                  className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-pesantren-gold transition-colors"
                >
                  Metode Alternatif
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleUsernameLogin} className="space-y-4 text-left">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Username"
                  className="w-full bg-gray-50 border border-gray-100 text-pesantren-dark px-6 py-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <input 
                  type="password"
                  placeholder="Password"
                  className="w-full bg-gray-50 border border-gray-100 text-pesantren-dark px-6 py-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loginLoading}
                className="w-full bg-pesantren-green text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-pesantren-dark transition-all shadow-lg shadow-pesantren-green/10 disabled:opacity-50"
              >
                {loginLoading ? 'Authenticating...' : 'Submit Credentials'}
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-50 p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
        </motion.div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-red-500/20"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
            <ShieldAlert className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            Akun <span className="text-white font-bold">{user.email || user.uid}</span> tidak memiliki hak akses administrator.
          </p>
          
          {user.email?.toLowerCase().trim() === 'pondokpesantrensemar@gmail.com' && (
            <div className="mb-6 p-4 bg-pesantren-green/10 border border-pesantren-green/20 rounded-2xl text-left">
              <p className="text-xs text-pesantren-green font-bold flex items-center gap-2 mb-2">
                <ShieldCheck size={14} /> System Override Available
              </p>
              <p className="text-[10px] text-slate-400 mb-4">You are logged in as the Super Admin, but the internal state didn't synchronize. Click below to force access.</p>
              <button 
                onClick={() => {
                  console.log("🚀 Force bypass triggered by user UI");
                  setIsAdmin(true);
                }}
                className="w-full bg-pesantren-green text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pesantren-dark transition-all"
              >
                Force Admin Access
              </button>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => auth.signOut()}
              className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
            >
              Keluar & Ganti Akun
            </button>
            <Link 
              to="/" 
              className="w-full bg-white/5 text-slate-400 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Home size={16} />
              Kembali ke Website
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
