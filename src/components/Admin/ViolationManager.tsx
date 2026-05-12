import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Clock, Search, Filter, User,
  Save, X, ClipboardList, AlertCircle, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  class: string;
}

interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  violationType: 'Tidak Sholat' | 'Tidak Ikut Kegiatan' | 'Terlambat' | 'Tata Tertib' | 'Tidak Patuh Prokes' | 'Lainnya';
  prayerName?: string;
  date: string;
  reason: string;
  actionTaken: string;
  recordedBy: string;
  createdAt: string;
  isNotified?: boolean;
}

export default function ViolationManager() {
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | 'Tidak Sholat' | 'Tidak Ikut Kegiatan' | 'Terlambat' | 'Tata Tertib' | 'Tidak Patuh Prokes' | 'Lainnya'>('Semua');
  
  const [formData, setFormData] = useState({
    studentId: '',
    violationType: 'Tidak Sholat' as Violation['violationType'],
    prayerName: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    actionTaken: '',
    isNotifyParent: false
  });

  const fetchViolations = async () => {
    try {
      const response = await fetch('/api/student_violations');
      if (!response.ok) throw new Error('Gagal memuat pelanggaran');
      const data = await response.json();
      setViolations(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data pelanggaran');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Gagal memuat santri');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchViolations(), fetchStudents()]);
      } catch (error) {
        console.error('Initial data fetch failed', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast.error('Pilih santri terlebih dahulu');
      return;
    }

    const selectedStudent = students.find(s => s.id === formData.studentId);
    if (!selectedStudent) return;

    try {
      const payload = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentClass: selectedStudent.class,
        violationType: formData.violationType,
        prayerName: formData.violationType === 'Tidak Sholat' ? formData.prayerName : undefined,
        date: formData.date,
        reason: formData.reason,
        actionTaken: formData.actionTaken,
        isNotified: formData.isNotifyParent
      };

      const response = await fetch('/api/student_violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Gagal menyimpan laporan');

      if (formData.isNotifyParent) {
        toast.success(`Notifikasi terkirim ke wali santri ${selectedStudent.name}`);
      }
      toast.success('Laporan pelanggaran berhasil disimpan');
      setIsAdding(false);
      setFormData({
        studentId: '',
        violationType: 'Tidak Sholat',
        prayerName: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        actionTaken: '',
        isNotifyParent: false
      });
      fetchViolations();
    } catch (error: any) {
      console.error(error);
      toast.error('Gagal menyimpan laporan: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus laporan ini?')) return;
    try {
      const response = await fetch(`/api/student_violations/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus laporan');
      toast.success('Laporan dihapus');
      fetchViolations();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus laporan');
    }
  };

  const filteredViolations = violations.filter(v => {
    const matchesSearch = v.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = categoryFilter === 'Semua' || v.violationType === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 transition-colors">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} 
        className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
      />
      <p className="text-[10px] font-black admin-text-muted uppercase tracking-[0.2em] animate-pulse">Menghubungkan Database...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-0 mb-20 text-left">
      <div className="admin-card p-4 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h3 className="text-4xl admin-heading admin-text-main transition-colors mb-2">Kedisiplinan Santri</h3>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-12 bg-rose-500 rounded-full" />
              <p className="text-[10px] admin-text-muted font-black uppercase tracking-[0.25em]">Catatan Pelanggaran & Tata Tertib</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-full md:w-auto px-8 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-rose-500/10 hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isAdding ? <X size={16} /> : <Plus size={16} />}
            {isAdding ? 'Batal' : 'Buat Laporan'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSave}
            className="admin-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Pilih Santri</label>
                <select 
                  required
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-sm admin-text-main"
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                >
                  <option value="" className="admin-text-main">-- Pilih Santri --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="admin-text-main">{s.name} ({s.class})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Kategori Pelanggaran</label>
                <select 
                  required
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-sm admin-text-main"
                  value={formData.violationType}
                  onChange={e => setFormData({...formData, violationType: e.target.value as any})}
                >
                  <option value="Tidak Sholat" className="admin-text-main">Tidak Sholat</option>
                  <option value="Tidak Ikut Kegiatan" className="admin-text-main">Tidak Ikut Kegiatan</option>
                  <option value="Terlambat" className="admin-text-main">Terlambat</option>
                  <option value="Tata Tertib" className="admin-text-main">Tata Tertib</option>
                  <option value="Tidak Patuh Prokes" className="admin-text-main">Tidak Patuh Prokes</option>
                  <option value="Lainnya" className="admin-text-main">Lainnya</option>
                </select>
              </div>

              {formData.violationType === 'Tidak Sholat' && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Nama Sholat</label>
                  <select 
                    required
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-sm admin-text-main"
                    value={formData.prayerName}
                    onChange={e => setFormData({...formData, prayerName: e.target.value})}
                  >
                    <option value="" className="admin-text-main">-- Pilih Sholat --</option>
                    <option value="Subuh" className="admin-text-main">Subuh</option>
                    <option value="Dzuhur" className="admin-text-main">Dzuhur</option>
                    <option value="Ashar" className="admin-text-main">Ashar</option>
                    <option value="Maghrib" className="admin-text-main">Maghrib</option>
                    <option value="Isya" className="admin-text-main">Isya</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Tanggal</label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-sm admin-text-main"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Keterangan / Alasan</label>
                <input 
                  type="text" 
                  placeholder="Kesiangan, Ngobrol, dll"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-sm admin-text-main transition-colors"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                />
              </div>

              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Tindakan / Takzir</label>
                <input 
                  type="text" 
                  placeholder="Teguran, Membersihkan Masjid, dll"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-sm admin-text-main transition-colors"
                  value={formData.actionTaken}
                  onChange={e => setFormData({...formData, actionTaken: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-2 lg:col-span-3">
                <input 
                  type="checkbox"
                  id="notifyParent"
                  className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-rose-600 focus:ring-rose-500 bg-white dark:bg-slate-900 transition-colors"
                  checked={formData.isNotifyParent}
                  onChange={e => setFormData({...formData, isNotifyParent: e.target.checked})}
                />
                <label htmlFor="notifyParent" className="text-[10px] font-black admin-text-main uppercase tracking-widest cursor-pointer transition-colors">
                  Kirim Notifikasi ke Orang Tua
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-slate-800">
              <button 
                type="submit" 
                className="bg-rose-500 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Save size={14} />
                Simpan Laporan
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-1 relative group w-full">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-rose-500 transition-colors duration-300" />
          <input 
            type="text" 
            placeholder="Cari nama santri..."
            className="w-full bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 py-4 pl-14 pr-6 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-rose-500/5 outline-none transition-all shadow-sm admin-text-main placeholder:admin-text-muted transition-colors"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm w-full lg:w-auto overflow-x-auto transition-colors">
          {['Semua', 'Tidak Sholat', 'Tidak Ikut Kegiatan', 'Terlambat', 'Tata Tertib', 'Tidak Patuh Prokes', 'Lainnya'].map((p) => (
            <button
              key={p}
              onClick={() => setCategoryFilter(p as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                categoryFilter === p 
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-lg shadow-black/5' 
                  : 'admin-text-muted hover:admin-text-main'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredViolations.length === 0 ? (
          <div className="col-span-full py-24 text-center admin-card rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 transition-colors">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="admin-text-muted opacity-30" size={40} />
            </div>
            <p className="text-sm font-bold admin-text-muted italic tracking-wide">Belum ada laporan pelanggaran</p>
          </div>
        ) : filteredViolations.map((v, index) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group admin-card p-7 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-none transition-all duration-500 relative overflow-hidden text-left"
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 rounded-full -mr-12 -mt-12 transition-opacity group-hover:opacity-10 opacity-5" />

            <div className="flex items-start gap-4 mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center text-xl font-black shrink-0 shadow-sm border border-rose-100/50 dark:border-rose-900/50 transition-colors">
                {v.studentName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 pr-10">
                <h4 className="font-bold text-lg admin-text-main truncate mb-0.5 transition-colors group-hover:text-rose-500 duration-500 font-serif">{v.studentName}</h4>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                   <p className="text-[10px] font-black admin-text-muted uppercase tracking-[0.15em] leading-none transition-colors">{v.studentClass}</p>
                </div>
              </div>

              <button 
                onClick={() => handleDelete(v.id)}
                className="absolute top-1 right-1 p-2 text-slate-200 dark:text-slate-800 hover:text-rose-500 transition-colors"
                title="Hapus Laporan"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black admin-text-muted uppercase tracking-[0.15em] transition-colors">Kategori</span>
                <span className="px-4 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border border-amber-100/50 dark:border-amber-900/50 transition-colors">
                  {v.violationType} {v.prayerName ? `(${v.prayerName})` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black admin-text-muted uppercase tracking-[0.15em] transition-colors">Tanggal</span>
                <div className="flex items-center gap-2 admin-text-main transition-colors bg-white dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-50 dark:border-slate-800 shadow-sm">
                  <Clock size={12} className="text-rose-500 transition-colors" />
                  <span className="text-[10px] font-bold tabular-nums">
                    {new Date(v.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-50 dark:border-slate-800 transition-colors">
                <div className="mb-4">
                  <span className="text-[10px] font-black admin-text-muted uppercase tracking-[0.15em] block mb-2 transition-colors">Keterangan</span>
                  <div className="text-[11px] font-medium admin-text-muted leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-50 dark:border-slate-800 italic transition-colors">
                    "{v.reason || 'Tidak ada keterangan spesifik'}"
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black admin-text-muted uppercase tracking-[0.15em] block mb-2 transition-colors">Tindakan / Takzir</span>
                  <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100/50 dark:border-emerald-900/50 transition-colors shadow-sm">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-tight transition-colors">
                      {v.actionTaken || 'Dalam Evaluasi'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors relative z-10">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <User size={10} className="admin-text-muted transition-colors" />
                  </div>
                  <span className="text-[8px] font-bold admin-text-muted uppercase tracking-widest transition-colors">Digital Recorded</span>
               </div>
               {v.isNotified && (
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100/50 dark:border-blue-900/50 transition-colors">
                    <AlertCircle size={10} className="text-blue-500" />
                    <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest transition-colors">
                      Parent Notified
                    </span>
                 </div>
               )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
