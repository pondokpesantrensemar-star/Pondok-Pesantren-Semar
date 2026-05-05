import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { db, auth, createStaffAccount } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { ShieldCheck, UserPlus, Trash2, Mail, Star, Key, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminAccount {
  email: string;
  username?: string;
  addedBy?: string;
  addedAt?: string;
  type: 'google' | 'credential';
  access?: 'all' | 'putra' | 'putri';
}

export default function AdminManager() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'all' | 'putra' | 'putri'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [method, setMethod] = useState<'google' | 'username'>('google');

  const path = 'admins';

  const fetchAdmins = async () => {
    try {
      const snapshot = await getDocs(collection(db, path));
      const data = snapshot.docs.map(d => ({ 
        email: d.id, 
        ...d.data(),
        type: d.data().type || (d.id.includes('@pesantren.local') ? 'credential' : 'google'),
        access: d.data().access || 'all'
      } as AdminAccount & { access: string }));
      setAdmins(data as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleInviteGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) return;
    
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, path, newEmail.toLowerCase().trim()), {
        addedBy: auth.currentUser?.email,
        addedAt: new Date().toISOString(),
        type: 'google',
        access: newRole
      });
      setNewEmail('');
      setNewRole('all');
      fetchAdmins();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || newPassword.length < 6) {
      alert('Username wajib diisi dan password minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create in Auth (via secondary app)
      await createStaffAccount(newUsername, newPassword);
      
      // 2. Register in Firestore
      const cleanUsername = newUsername.toLowerCase().trim().replace(/\s+/g, '_');
      const emailRecord = `${cleanUsername}@pesantren.local`;
      
      await setDoc(doc(db, path, emailRecord), {
        username: newUsername,
        addedBy: auth.currentUser?.email,
        addedAt: new Date().toISOString(),
        type: 'credential',
        access: newRole
      });

      setNewUsername('');
      setNewPassword('');
      setNewRole('all');
      alert('Akun admin baru berhasil dibuat. Silakan informasikan username & password kepada rekan Anda.');
      fetchAdmins();
    } catch (error: any) {
      console.error("Manual Creation Error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        alert('Eror: Metode login Email/Password belum diaktifkan di Firebase Console.');
      } else if (error.code === 'auth/email-already-in-use') {
        alert('Username ini sudah terdaftar.');
      } else {
        alert(`Gagal membuat akun: ${error.message || 'Kesalahan sistem'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (admin: AdminAccount) => {
    if (admin.email === 'pondokpesantrensemar@gmail.com') {
      alert('Email administrator utama tidak dapat dihapus.');
      return;
    }
    if (admin.email === auth.currentUser?.email) {
      alert('Anda tidak dapat menghapus akses Anda sendiri.');
      return;
    }
    const displayName = admin.type === 'credential' ? admin.username : admin.email;
    if (!confirm(`Cabut akses administrator untuk ${displayName}?`)) return;

    try {
      await deleteDoc(doc(db, path, admin.email));
      fetchAdmins();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return <div className="p-8">Memuat data administrator...</div>;

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-pesantren-dark mb-1">Manajemen Administrator</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Kontrol akses panel editor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-fit">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-pesantren-gold/10 rounded-2xl flex items-center justify-center text-pesantren-gold">
              <UserPlus size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-pesantren-dark">Tambah Admin</h3>
          </div>

          <div className="flex p-1 bg-gray-50 rounded-xl mb-6">
            <button 
              onClick={() => setMethod('google')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${method === 'google' ? 'bg-white shadow text-pesantren-dark' : 'text-gray-400'}`}
            >
              Email Google
            </button>
            <button 
              onClick={() => setMethod('username')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${method === 'username' ? 'bg-white shadow text-pesantren-dark' : 'text-gray-400'}`}
            >
              Username
            </button>
          </div>
          
          {method === 'google' ? (
            <form onSubmit={handleInviteGoogle} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email Google</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email"
                    placeholder="admin@gmail.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all text-sm font-medium"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Hak Akses Unit</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-pesantren-green outline-none transition-all text-sm font-medium"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                >
                  <option value="all">Semua Unit (Super Admin)</option>
                  <option value="putra">Khusus Unit Putra</option>
                  <option value="putri">Khusus Unit Putri</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pesantren-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-black/10 tabular-nums uppercase tracking-widest text-xs"
              >
                {isSubmitting ? 'Memproses...' : 'Tambah Akses'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateUsername} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="contoh: admin_staff"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all text-sm font-medium"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Password Baru</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password"
                      placeholder="Min. 6 karakter"
                      required
                      minLength={6}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all text-sm font-medium"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Hak Akses Unit</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-pesantren-green outline-none transition-all text-sm font-medium"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as any)}
                  >
                    <option value="all">Semua Unit (Super Admin)</option>
                    <option value="putra">Khusus Unit Putra</option>
                    <option value="putri">Khusus Unit Putri</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pesantren-green text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pesantren-dark transition-all disabled:opacity-50 shadow-lg shadow-pesantren-green/10 tabular-nums uppercase tracking-widest text-xs"
              >
                {isSubmitting ? 'Membuat Akun...' : 'Simpan Akun'}
              </button>
            </form>
          )}

          <div className="mt-8 p-6 bg-pesantren-gold/5 rounded-[2rem] border border-pesantren-gold/10 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-sm font-serif font-bold text-pesantren-dark mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-pesantren-gold" />
                Quick Setup: Admin Santri
              </h4>
              <p className="text-[11px] text-gray-500 mb-6 leading-relaxed italic">
                Klik tombol di bawah untuk membuat akun standar "Admin Santri" dengan password otomatis.
              </p>
              <button 
                onClick={() => {
                  setNewUsername('adminsantri');
                  setNewPassword('santrisemar2026');
                  setNewRole('all');
                  setMethod('username');
                }}
                className="w-full bg-white text-pesantren-gold border border-pesantren-gold/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pesantren-gold hover:text-white transition-all shadow-sm"
              >
                Gunakan Template Admin Santri
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-pesantren-cream rounded-xl border border-pesantren-gold/10">
            <p className="text-[10px] text-pesantren-muted leading-relaxed font-medium">
              <span className="text-pesantren-gold font-bold">INFO:</span> 
              {method === 'google' 
                ? ' Gunakan Email jika admin memiliki Gmail. Sistem akan menggunakan login Google.' 
                : ' Gunakan Username jika tidak ingin pakai Gmail. Anda yang menentukan passwordnya.'}
            </p>
          </div>
        </div>

        {/* Admin List */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-serif font-bold text-xl text-pesantren-dark">Admin Aktif</h3>
            <div className="flex items-center gap-2 text-[10px] bg-pesantren-green text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-pesantren-green/20">
              <ShieldCheck size={12} /> {admins.length} Total
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            <AnimatePresence>
              {admins.map((admin, idx) => (
                <motion.div 
                  key={admin.email}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-gray-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-pesantren-green shadow-sm group-hover:scale-110 transition-transform">
                      {admin.email === 'pondokpesantrensemar@gmail.com' ? (
                        <Star size={24} className="text-pesantren-gold fill-pesantren-gold" />
                      ) : admin.type === 'credential' ? (
                        <Key size={24} className="text-pesantren-gold group-hover:rotate-12 transition-transform" />
                      ) : (
                        <Mail size={24} className="text-gray-300 group-hover:text-pesantren-green transition-colors" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-pesantren-dark text-lg mb-0.5">
                        {admin.type === 'credential' ? admin.username : admin.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter tabular-nums flex items-center gap-1">
                          {admin.type === 'credential' ? '(Via Username)' : '(Via Google Login)'}
                          <span className="mx-1">•</span>
                          Unit: {admin.access === 'putra' ? 'Putra' : (admin.access === 'putri' ? 'Putri' : 'Semua')}
                          <span className="mx-1">•</span>
                          Daftar: {admin.addedAt ? new Date(admin.addedAt).toLocaleDateString() : 'System'}
                        </span>
                        {admin.email === auth.currentUser?.email && (
                          <span className="text-[9px] bg-pesantren-green/10 text-pesantren-green px-2 py-0.5 rounded font-black uppercase">Anda</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {admin.email === 'pondokpesantrensemar@gmail.com' ? (
                      <div className="px-5 py-2 bg-pesantren-gold text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-pesantren-gold/20 italic">
                        OWNER ROLE
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleRevoke(admin)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-100"
                      >
                        <Trash2 size={14} /> Cabut Akses
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {admins.length === 0 && !loading && (
            <div className="p-20 text-center text-gray-400 italic">
              Tidak ada administrator tambahan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
