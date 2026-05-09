import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { internalAuth } from '../../lib/internalAuth';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { 
  UserPlus, Trash2, Shield, Mail, Key, ShieldCheck, 
  X, Save, Loader2, UserCog, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface AdminUser {
  id: string;
  username: string;
  access: 'all' | 'putra' | 'putri' | 'kesantrian';
  type: 'credential';
  password?: string;
  addedAt: string;
}

export default function StaffManager() {
  const [staffs, setStaffs] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const currentUser = internalAuth.getUser();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    access: 'kesantrian' as AdminUser['access']
  });

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'admins'), orderBy('addedAt', 'desc'));
      const snap = await getDocs(q);
      setStaffs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser)));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleEdit = (staff: AdminUser) => {
    setEditingId(staff.id);
    setFormData({
      username: staff.username,
      password: staff.password || '',
      access: staff.access
    });
    setShowAddForm(true);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setSaving(true);
    try {
      let docId = editingId;
      
      if (!docId) {
        const cleanUsername = formData.username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        docId = `${cleanUsername}@pesantren.local`;
      }

      // Add or Update to Firestore (Internal Mode)
      await setDoc(doc(db, 'admins', docId), {
        username: formData.username,
        password: formData.password,
        access: formData.access,
        type: 'credential',
        addedAt: editingId ? (staffs.find(s => s.id === editingId)?.addedAt || new Date().toISOString()) : new Date().toISOString(),
        addedBy: currentUser?.username || 'Admin'
      });

      toast.success(editingId ? "Data pengurus diperbarui!" : "Staff berhasil ditambahkan!");
      setShowAddForm(false);
      setEditingId(null);
      setFormData({ username: '', password: '', access: 'kesantrian' });
      fetchStaffs();
    } catch (e: any) {
      toast.error("Gagal menyimpan data: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (staff: AdminUser) => {
    if (staff.id === currentUser?.id) {
      toast.error("Anda tidak bisa menghapus akun Anda sendiri!");
      return;
    }

    if (!confirm(`Hapus akses untuk ${staff.username}?`)) return;

    try {
      await deleteDoc(doc(db, 'admins', staff.id));
      toast.success("Akses dicabut");
      fetchStaffs();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'admins');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="w-10 h-10 text-pesantren-gold animate-spin" />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Memuat Data Pengurus...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-serif font-black text-pesantren-dark dark:text-white transition-colors">Manajemen Pengurus</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Kelola Akun & Hak Akses Panel Administrasi</p>
        </div>
        <button 
          onClick={() => {
            if (showAddForm) {
              setEditingId(null);
              setFormData({ username: '', password: '', access: 'kesantrian' });
            }
            setShowAddForm(!showAddForm);
          }}
          className="bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
          {showAddForm ? 'Batal' : 'Tambah Pengurus'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-pesantren-gold/20 p-8 rounded-[2.5rem] shadow-2xl shadow-pesantren-gold/5"
          >
            <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <UserCog size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: ustadz_ahmad"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 pl-12 pr-4 py-4 rounded-xl text-sm focus:ring-2 focus:ring-pesantren-gold outline-none text-pesantren-dark dark:text-white"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="Min. 6 karakter"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 pl-12 pr-12 py-4 rounded-xl text-sm focus:ring-2 focus:ring-pesantren-gold outline-none text-pesantren-dark dark:text-white"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pesantren-gold transition-colors"
                  >
                    {showPassword ? <X size={16} /> : <Shield size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hak Akses</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 px-4 py-4 rounded-xl text-sm focus:ring-2 focus:ring-pesantren-gold outline-none text-pesantren-dark dark:text-white"
                  value={formData.access}
                  onChange={e => setFormData({ ...formData, access: e.target.value as any })}
                >
                  <option value="all">Super Admin (Semua Akses)</option>
                  <option value="kesantrian">Pengurus Kesantrian (Full Kesantrian)</option>
                  <option value="putra">Pengurus Putra Only</option>
                  <option value="putri">Pengurus Putri Only</option>
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-pesantren-green text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pesantren-green/20 hover:scale-105 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingId ? 'Perbarui Data Pengurus' : 'Simpan Akun Pengurus'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staffs.map((staff) => (
          <motion.div 
            key={staff.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-black/50 transition-all"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                staff.access === 'all' ? 'bg-pesantren-gold/10 text-pesantren-gold' : 'bg-pesantren-green/10 text-pesantren-green'
              }`}>
                {staff.access === 'all' ? <ShieldCheck size={28} /> : <Shield size={28} />}
              </div>
              <div>
                <h4 className="font-bold text-pesantren-dark dark:text-white transition-colors">{staff.username}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    staff.access === 'all' ? 'bg-pesantren-gold text-pesantren-dark' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                  }`}>
                    {staff.access === 'all' ? 'Super Admin' : (staff.access === 'kesantrian' ? 'Kesantrian' : staff.access)}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-mono text-slate-500">
                    <Key size={10} />
                    <span>{staff.password}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleEdit(staff)}
                className="p-3 text-gray-300 hover:text-pesantren-gold hover:bg-pesantren-gold/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title="Edit Pengurus"
              >
                <UserCog size={18} />
              </button>
              <button 
                onClick={() => handleDelete(staff)}
                className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title="Cabut Akses"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {staffs.length === 0 && (
        <div className="py-20 text-center bg-gray-50 dark:bg-slate-800/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/5">
          <ShieldAlert className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500 font-bold">Belum ada pengurus tambahan</p>
        </div>
      )}
    </div>
  );
}
