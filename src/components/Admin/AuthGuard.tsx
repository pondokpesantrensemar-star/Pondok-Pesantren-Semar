import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { internalAuth, InternalUser } from '../../lib/internalAuth';
import { doc, getDoc, getDocs, collection, query, setDoc, getCountFromServer } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LogIn, User as UserIcon, Key, ArrowRight, ShieldCheck, Home, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<InternalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check if ANY admin exists in DB to trigger setup mode
      try {
        const q = query(collection(db, 'admins'));
        const allSnap = await getCountFromServer(q);
        setAdminCount(allSnap.data().count);
        if (allSnap.data().count === 0) {
          setIsSetupMode(true);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'admins');
      }

      // 2. Check local session
      const localUser = internalAuth.getUser();
      setUser(localUser);
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setLoginLoading(true);
    setError(null);
    try {
      const loggedUser = await internalAuth.login(username, password);
      setUser(loggedUser);
      toast.success("Berhasil masuk!");
    } catch (err: any) {
      setError(err.message || 'Gagal login.');
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
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const docId = `${cleanUsername}@pesantren.local`;

      await setDoc(doc(db, 'admins', docId), {
        username: username,
        password: password, // Simple password storage for "no-firebase-auth" mode
        addedBy: 'SYSTEM_SETUP',
        addedAt: new Date().toISOString(),
        type: 'credential',
        access: 'all'
      }, { merge: true });

      setError(null);
      toast.success("SETUP BERHASIL! Silakan LOGIN sekarang.");
      setIsSetupMode(false);
      
      const q = query(collection(db, 'admins'));
      let allSnap;
      try {
        allSnap = await getCountFromServer(q);
        setAdminCount(allSnap.data().count);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'admins');
      }
      
      setUsername('');
      setPassword('');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'admins/new');
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 font-sans relative overflow-hidden">
        {/* Artistic Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pesantren-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pesantren-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
        
        <div className="w-full max-w-sm relative z-10 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden"
          >
            <div className="p-10 md:p-14 text-center">
              <div className="w-20 h-20 bg-pesantren-dark text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-pesantren-dark/20 relative">
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-pesantren-gold rounded-full flex items-center justify-center border-4 border-white">
                  <ShieldCheck size={14} className="text-pesantren-dark" />
                </div>
                {isSetupMode ? <Sparkles size={32} /> : <LogIn size={32} />}
              </div>
              
              <h1 className="text-2xl font-serif font-black text-pesantren-dark mb-2 tracking-tight">
                {isSetupMode ? 'Setup Akses' : 'Panel Pengurus'}
              </h1>
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black mb-10">Pondok Pesantren Semar</p>

              <form onSubmit={isSetupMode ? handleInitialSetup : handleUsernameLogin} className="space-y-6 text-left">
                {isSetupMode && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-2">
                    <p className="text-[10px] text-blue-600 font-bold leading-relaxed italic text-center">
                      Selamat datang! Sistem login dialihkan ke Mode Internal (Tanpa Firebase Auth). Silakan buat akun Super Admin pertama.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pesantren-green transition-colors" size={18} />
                    <input 
                      type="text"
                      placeholder={isSetupMode ? "Username Admin (misal: superadmin)" : "Nama Pengguna"}
                      className="w-full bg-gray-50 border border-gray-100 text-pesantren-dark pl-14 pr-6 py-5 rounded-[1.5rem] focus:ring-4 focus:ring-pesantren-green/5 outline-none transition-all placeholder:text-gray-300 text-sm font-bold"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pesantren-green transition-colors" size={18} />
                    <input 
                      type="password"
                      placeholder="Kata Sandi"
                      className="w-full bg-gray-50 border border-gray-100 text-pesantren-dark pl-14 pr-6 py-5 rounded-[1.5rem] focus:ring-4 focus:ring-pesantren-green/5 outline-none transition-all placeholder:text-gray-300 text-sm font-bold"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-pesantren-gold text-white py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:text-pesantren-dark transition-all shadow-2xl shadow-pesantren-gold/30 active:scale-95 disabled:opacity-50 mt-4"
                >
                  {loginLoading ? <Loader2 className="animate-spin" size={20} /> : (isSetupMode ? 'Selesaikan Setup' : 'Masuk Panel Admin')}
                  {!loginLoading && <ArrowRight size={18} />}
                </button>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100 mt-4"
                  >
                    {error}
                  </motion.div>
                )}
                
                {(!isSetupMode && adminCount === 0) && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setIsSetupMode(true)}
                      className="w-full bg-pesantren-gold/10 text-pesantren-gold border border-pesantren-gold/20 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-pesantren-gold hover:text-white transition-all shadow-sm"
                    >
                      <Sparkles size={16} /> Setup Admin Pertama
                    </button>
                  </div>
                )}

                {isSetupMode && adminCount !== 0 && (
                  <button 
                    type="button"
                    onClick={() => setIsSetupMode(false)}
                    className="w-full text-gray-400 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-pesantren-green transition-all mt-2 text-center"
                  >
                    Kembali Ke Login
                  </button>
                )}
              </form>
            </div>
            
            <div className="bg-gray-50/50 p-6 flex items-center justify-center gap-4 border-t border-gray-100">
              <Link to="/" className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-pesantren-green transition-all flex items-center gap-2">
                <Home size={14} /> Beranda
              </Link>
            </div>
          </motion.div>

          <p className="mt-10 text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] italic">
            Panel Internal Tanpa Cloud Auth
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
