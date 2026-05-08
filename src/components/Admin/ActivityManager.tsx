import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { 
  Plus, Trash2, Calendar, Settings2, X, Save, ArrowUpDown, ArrowUpAZ, ArrowDownZA
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import ImageUploadInput from './ImageUploadInput';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  schedule: string;
  date?: string; // ISO Date string for specific events
}

export default function ActivityManager() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', schedule: '', date: '' });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchActivities = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'kesantrian')));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActivityItem));
      setActivities(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'kesantrian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'kesantrian', editingId), formData);
        toast.success('Kegiatan diperbarui');
      } else {
        await addDoc(collection(db, 'kesantrian'), formData);
        toast.success('Kegiatan ditambahkan');
      }
      setEditingId(null);
      setIsAdding(false);
      setFormData({ title: '', description: '', imageUrl: '', schedule: '', date: '' });
      fetchActivities();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'kesantrian');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-pesantren-gold border-t-transparent rounded-full" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Menghubungkan Database...</p>
    </div>
  );

  const sortedActivities = [...activities].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.schedule.localeCompare(b.schedule);
    } else {
      return b.schedule.localeCompare(a.schedule);
    }
  });

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Header days
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Fill empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-slate-900/10" />);
    }

    // Fill days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayActivities = activities.filter(act => act.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      days.push(
        <div key={d} className={`h-32 border border-gray-100 dark:border-white/5 p-2 transition-colors hover:bg-pesantren-cream/20 dark:hover:bg-slate-800/30 group ${isToday ? 'bg-pesantren-gold/5' : 'bg-white dark:bg-slate-900'}`}>
          <div className="flex justify-between items-start mb-1">
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${isToday ? 'bg-pesantren-gold text-white shadow-lg' : 'text-gray-400 group-hover:text-pesantren-gold'}`}>
              {d}
            </span>
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
            {dayActivities.map(act => (
              <div 
                key={act.id} 
                onClick={() => {
                  setEditingId(act.id);
                  setFormData({ title: act.title, description: act.description, imageUrl: act.imageUrl, schedule: act.schedule, date: act.date || '' });
                }}
                className="px-2 py-1 bg-pesantren-dark/5 dark:bg-pesantren-gold/10 border-l-2 border-pesantren-gold rounded text-[8px] font-bold text-pesantren-dark dark:text-pesantren-gold truncate cursor-pointer hover:bg-pesantren-gold/20 transition-colors"
                title={act.title}
              >
                {act.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 bg-pesantren-dark dark:bg-slate-900 border-b border-gray-200 dark:border-white/10">
          {dayNames.map(d => (
            <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-white/50">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-0 mb-20 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-serif font-black text-pesantren-dark dark:text-white">Manajemen <span className="text-pesantren-gold italic">Kegiatan</span></h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-2">Atur rutinitas dan agenda harian santri</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex p-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark shadow-lg' : 'text-gray-400'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark shadow-lg' : 'text-gray-400'}`}
            >
              Kalender
            </button>
          </div>

          <AnimatePresence>
            {viewMode === 'grid' && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 text-pesantren-dark dark:text-pesantren-gold"
              >
                {sortOrder === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownZA size={16} />}
                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </motion.button>
            )}
            
            {viewMode === 'calendar' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-2 rounded-2xl shadow-sm"
              >
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-pesantren-gold">
                  <ArrowUpDown size={14} className="rotate-90" />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest px-4 dark:text-white">
                  {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-pesantren-gold">
                  <ArrowUpDown size={14} className="-rotate-90" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
            className="px-8 py-4 bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
          >
            {isAdding ? <X size={16} /> : <Plus size={16} />}
            {isAdding ? 'Batal' : 'Tambah Kegiatan'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 border-2 border-pesantren-gold/20 p-10 rounded-[2.5rem] shadow-2xl space-y-8 mb-12"
          >
             <div className="flex items-center gap-4 pb-6 border-b border-gray-50 dark:border-white/5">
              <div className="w-12 h-12 bg-pesantren-gold/10 text-pesantren-gold rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h4 className="text-xl font-serif font-bold text-pesantren-dark dark:text-white">{editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan Harian'}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lengkapi detail kegiatan santri</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Kegiatan</label>
                 <input 
                   type="text" required
                   className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jadwal (Contoh: Bada Maghrib)</label>
                 <input 
                   type="text" required
                   className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                   value={formData.schedule}
                   onChange={e => setFormData({...formData, schedule: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal (Opsional untuk Kalender)</label>
                 <input 
                   type="date"
                   className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                   value={formData.date}
                   onChange={e => setFormData({...formData, date: e.target.value})}
                 />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                 <ImageUploadInput 
                   label="Foto Utama Kegiatan"
                   value={formData.imageUrl}
                   onChange={val => setFormData({...formData, imageUrl: val})}
                 />
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Singkat</label>
                 <textarea 
                    required rows={3}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                 />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 border-t border-gray-50 dark:border-white/5">
               <button 
                type="button" 
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="group bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Save size={16} className="inline mr-2 group-hover:rotate-12 transition-transform" />
                Simpan Kegiatan
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sortedActivities.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-gray-100 dark:border-white/5">
                 <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                 <p className="text-gray-400 font-bold italic">Belum ada kegiatan terdaftar</p>
              </div>
            ) : sortedActivities.map((act) => (
              <div key={act.id} className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-slate-800">
                  <img src={act.imageUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dee6b?q=80&w=2070&auto=format&fit=crop'} alt={act.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button 
                      onClick={() => {
                        setEditingId(act.id);
                        setFormData({ title: act.title, description: act.description, imageUrl: act.imageUrl, schedule: act.schedule, date: act.date || '' });
                      }}
                      className="w-12 h-12 bg-white text-pesantren-dark rounded-xl flex items-center justify-center hover:bg-pesantren-gold transition-colors shadow-lg"
                    >
                      <Settings2 size={20} />
                    </button>
                    <button 
                      onClick={async () => {
                        if (!confirm(`Hapus kegiatan ${act.title}?`)) return;
                        try {
                          await deleteDoc(doc(db, 'kesantrian', act.id));
                          toast.success('Kegiatan dihapus');
                          fetchActivities();
                        } catch (e) { handleFirestoreError(e, OperationType.DELETE, 'kesantrian'); }
                      }}
                      className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-8 text-left">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-pesantren-gold mb-3">
                    <Calendar size={12} />
                    {act.schedule} {act.date && `• ${new Date(act.date).toLocaleDateString('id-ID')}`}
                  </div>
                  <h4 className="text-xl font-bold text-pesantren-dark dark:text-white mb-3 leading-tight">{act.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderCalendar()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
