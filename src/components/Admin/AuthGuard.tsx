import React, { useEffect, useState } from 'react';
import { auth, db, loginWithGoogle, loginWithGoogleRedirect, handleRedirectResult, loginWithUsername, createStaffAccount } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, query, limit, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LogIn, ShieldAlert, User as UserIcon, Key, ArrowRight, ShieldCheck, Home, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'google' | 'username'>('username');
  const [adminCount, setAdminCount] = useState<number | null>(null);
  
  // Username state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);

    // Check if any admins exist to offer setup if empty
    const checkAdminExistence = async () => {
      try {
        const q = query(collection(db, 'admins'), limit(1));
        const snapshot = await getDocs(q);
        setAdminCount(snapshot.size);
      } catch (err) {
        // Silent fail
      }
    };
    checkAdminExistence();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (u) {
        const currentId = u.email?.toLowerCase().trim() || u.uid;
        const SUPER_ADMIN = 'pondokpesantrensemar@gmail.com';
        
        if (u.email?.toLowerCase().trim() === SUPER_ADMIN) {
          // Auto-persist super admin in Firestore if missing
          const ensureAdminRecord = async () => {
            try {
              const docRef = doc(db, 'admins', SUPER_ADMIN);
              const snap = await getDoc(docRef);
              if (!snap.exists()) {
                await setDoc(docRef, {
                  addedBy: 'SYSTEM_AUTO',
                  addedAt: new Date().toISOString(),
                  type: 'google',
                  access: 'all'
                });
              }
            } catch (err) {
              // Silent fail
            }
          };
          ensureAdminRecord();
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentId));
          if (adminDoc.exists()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          setIsAdmin(false);
        }
      } else {
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
      const cleanUser = username.includes('@') ? username.split('@')[0] : username;
      await loginWithUsername(cleanUser, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Username atau password salah. Pastikan Anda sudah didaftarkan.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Koneksi internet bermasalah.');
      } else {
        setError('Gagal login: ' + (err.message || 'Error tidak diketahui'));
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoginLoading(true);
    setError(null);
    try {
      // Use the email for the first admin
      const adminEmail = 'pondokpesantrensemar@gmail.com';
      // Create auth account
      await createStaffAccount(username, password);
      // Create firestore record
      const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, '_');
      const emailRecord = `${cleanUsername}@pesantren.local`;
      
      // We also link it to the superadmin email if they use the right username
      await Promise.all([
        // Record for username
        setDoc(doc(db, 'admins', emailRecord), {
          username: username,
          addedBy: 'SYSTEM_SETUP',
          addedAt: new Date().toISOString(),
          type: 'credential',
          access: 'all'
        }),
        // Ensure superadmin email is also recognized if they eventually fix Google login
        setDoc(doc(db, 'admins', adminEmail), {
          addedBy: 'SYSTEM_SETUP',
          addedAt: new Date().toISOString(),
          type: 'google',
          access: 'all'
        })
      ]);

      setError(null);
      alert("Akun Admin berhasil dibuat! Silakan login menggunakan username & password tersebut.");
      setIsSetupMode(false);
      setAdminCount(1);
    } catch (err: any) {
      setError("Gagal setup: " + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pesantren-cream font-sans">
        <Loader2 className="w-10 h-10 text-pesantren-green animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Menyiapkan Panel Keamanan...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pesantren-cream p-4 font-sans relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-pesantren-green/5 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pesantren-gold/5 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-pesantren-border max-w-sm w-full text-center relative z-10"
        >
          <div className="w-14 h-14 bg-pesantren-green text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pesantren-green/20">
            {isSetupMode ? <Sparkles size={26} /> : <LogIn size={26} />}
          </div>
          
          <h1 className="text-xl font-serif font-bold text-pesantren-dark mb-1 tracking-tight">
            {isSetupMode ? 'Setup Admin Pertama' : 'Panel Administrator'}
          </h1>
          <p className="text-gray-400 text-[9px] uppercase tracking-[0.2em] font-black mb-8">Pondok Pesantren Semar</p>

          {!isSetupMode && (
            <div className="flex bg-gray-50 p-1.5 rounded-[1.25rem] mb-8 border border-gray-100">
              <button 
                onClick={() => setLoginMethod('username')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'username' ? 'bg-white text-pesantren-green shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Login Manual
              </button>
              <button 
                onClick={() => setLoginMethod('google')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'google' ? 'bg-white text-pesantren-green shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Google (G-Auth)
              </button>
            </div>
          )}

          {isSetupMode ? (
            <form onSubmit={handleInitialSetup} className="space-y-4 text-left">
              <p className="text-[10px] text-gray-500 mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100 leading-relaxed italic">
                Sistem mendeteksi belum ada admin terdaftar. Silakan buat akun akses manual untuk admin utama.
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="text"
                    placeholder="Pilih Username (misal: admin)"
                    className="w-full bg-gray-50 border border-gray-100 text-pesantren-dark pl-12 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="password"
                    placeholder="Buat Password Baru"
                    className="w-full bg-gray-50 border border-gray-100 text-pesantren-dark pl-12 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loginLoading}
                className="w-full bg-pesantren-gold text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-pesantren-dark transition-all shadow-lg shadow-pesantren-gold/10 disabled:opacity-50 mt-4"
              >
                {loginLoading ? 'Menyimpan...' : 'Buat Akun Sekarang'}
                <Sparkles size={14} />
              </button>
              <button 
                type="button"
                onClick={() => setIsSetupMode(false)}
                className="w-full text-center py-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest"
              >
                Batalkan
              </button>
            </form>
          ) : (
            <>
              {loginMethod === 'username' ? (
                <form onSubmit={handleUsernameLogin} className="space-y-4 text-left">
                  <div className="space-y-4">
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input 
                        type="text"
                        placeholder="Username"
                        className="w-full bg-gray-50 border border-gray-100 text-pesantren-dark pl-12 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input 
                        type="password"
                        placeholder="Password"
                        className="w-full bg-gray-50 border border-gray-100 text-pesantren-dark pl-12 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-pesantren-green text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-pesantren-dark transition-all shadow-lg shadow-pesantren-green/10 disabled:opacity-50 mt-2"
                  >
                    {loginLoading ? 'Authenticating...' : 'Masuk ke Panel'}
                    <ArrowRight size={14} />
                  </button>
                  
                  {adminCount === 0 && (
                    <button 
                      type="button"
                      onClick={() => setIsSetupMode(true)}
                      className="w-full bg-pesantren-gold/10 text-pesantren-gold border border-pesantren-gold/20 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pesantren-gold hover:text-white transition-all mt-4"
                    >
                      <Sparkles size={14} /> Setup Akun Baru
                    </button>
                  )}
                </form>
              ) : (
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
                          setError("Jendela ditutup sebelum selesai.");
                        } else if (e.code === 'auth/unauthorized-domain') {
                          setError("auth/unauthorized-domain");
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
                      className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:text-pesantren-gold transition-colors"
                    >
                      Gunakan Metode Redirect
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {error && (
            <div className="mt-8 space-y-4">
              <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-50 p-4 rounded-2xl border border-red-100">
                {error === 'auth/unauthorized-domain' ? 'Domain Belum Terdaftar' : error}
              </div>
              
              {error.toLowerCase().includes('domain') && (
                <div className="bg-pesantren-green/5 border border-pesantren-green/20 p-5 rounded-3xl text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-pesantren-green text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                    <p className="text-[10px] text-pesantren-green font-bold uppercase tracking-wider">Solusi Mandiri</p>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed mb-4">
                    Salin domain ini dan tambahkan ke <b>Authorized Domains</b> di Firebase Console:
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <code className="flex-1 bg-white p-3 rounded-xl text-[10px] border border-pesantren-green/10 break-all font-mono text-pesantren-green font-bold">
                      {window.location.hostname}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.hostname);
                        alert('Domain disalin!');
                      }}
                      className="bg-pesantren-green text-white p-3 rounded-xl text-[10px] font-bold hover:bg-pesantren-green-dark transition-colors shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-3 bg-white/50 rounded-xl border border-gray-100">
                    <p className="text-[9px] text-gray-400 leading-relaxed italic">
                      <b>Tip:</b> Gunakan tab <b>"Login Manual"</b> di atas jika cara ini terlalu rumit. Hubungi pengembang untuk bantuan username.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-4">
            <Link to="/" className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:text-pesantren-green transition-all flex items-center gap-1">
              <Home size={10} /> Beranda
            </Link>
          </div>
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
                <ShieldCheck size={14} /> System Access
              </p>
              <p className="text-[10px] text-slate-400 mb-4">Anda login sebagai Super Admin. Jika akses belum terbuka, silakan klik tombol di bawah.</p>
              <button 
                onClick={async () => {
                  // Final attempt to persist if they click the bypass
                  try {
                    await setDoc(doc(db, 'admins', 'pondokpesantrensemar@gmail.com'), {
                      addedBy: 'SYSTEM_BYPASS',
                      addedAt: new Date().toISOString(),
                      type: 'google',
                      access: 'all'
                    });
                  } catch (e) {
                    // Silent fail
                  }
                  setIsAdmin(true);
                }}
                className="w-full bg-pesantren-green text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pesantren-dark transition-all"
              >
                Buka Panel Admin
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
