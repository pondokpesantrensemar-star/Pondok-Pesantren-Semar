import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Plus, Pencil, Trash2, Save, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import ImageUploadInput from './ImageUploadInput';

interface Program {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

export default function ProgramManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', order: 0 });

  const path = 'programs';

  const fetchPrograms = async () => {
    try {
      const q = query(collection(db, path), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Program));
      setPrograms(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleSave = async (id?: string) => {
    try {
      if (id) {
        await updateDoc(doc(db, path, id), formData);
        setEditingId(null);
        toast.success('Program diperbarui');
      } else {
        await addDoc(collection(db, path), { ...formData, order: programs.length + 1 });
        setIsAdding(false);
        toast.success('Program ditambahkan');
      }
      setFormData({ title: '', description: '', imageUrl: '', order: 0 });
      fetchPrograms();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus program ini?')) return;
    try {
      await deleteDoc(doc(db, path, id));
      toast.success('Program dihapus');
      fetchPrograms();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const startEdit = (p: Program) => {
    setEditingId(p.id);
    setFormData({ title: p.title, description: p.description, imageUrl: p.imageUrl || '', order: p.order });
  };

  if (loading) return <div>Memuat data...</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-pesantren-dark dark:text-white mb-1">Kurikulum & Program</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Kelola pilar pendidikan utama</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-pesantren-green text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-xl shadow-pesantren-green/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} /> Tambah Program Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-900 border-2 border-pesantren-gold/20 p-10 rounded-[2.5rem] shadow-xl space-y-6 overflow-hidden relative transition-colors"
            >
              <div className="absolute top-0 right-0 p-8 text-pesantren-gold/5">
                <Plus size={120} />
              </div>
              
              <div className="relative z-10">
                <h4 className="text-lg font-serif font-bold text-pesantren-dark dark:text-white mb-6">Formulir Program Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">Judul Program</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none font-medium transition-all text-pesantren-dark dark:text-white"
                      value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <ImageUploadInput 
                      label="Foto Program (Upload / URL)"
                      value={formData.imageUrl}
                      onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                      placeholder="Atau tempel Link Gambar..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">Urutan Tampil</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none font-bold text-center tabular-nums transition-all text-pesantren-dark dark:text-white"
                      value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">Deskripsi Detail</label>
                    <textarea 
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none h-32 transition-all leading-relaxed text-pesantren-dark dark:text-white"
                      value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-50 dark:border-white/5">
                  <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-pesantren-dark dark:hover:text-white transition-colors uppercase tracking-widest">Batal</button>
                  <button onClick={() => handleSave()} className="bg-pesantren-dark dark:bg-slate-700 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:bg-black transition-all uppercase tracking-widest">Simpan Data</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {programs.map((p, idx) => (
          <motion.div 
            key={p.id} 
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-8 rounded-3xl shadow-sm hover:shadow-xl dark:shadow-none hover:border-pesantren-gold/50 transition-all group overflow-hidden relative flex flex-col md:flex-row justify-between gap-8"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-pesantren-gold/5 transition-colors duration-500"></div>

            {editingId === p.id ? (
              <div className="w-full space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <input 
                    type="text" className="md:col-span-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-xl font-bold text-pesantren-dark dark:text-white transition-colors"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Judul Program"
                  />
                  <input 
                    type="number" className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-xl font-bold text-center text-pesantren-dark dark:text-white transition-colors"
                    value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    placeholder="Urutan"
                  />
                  <div className="md:col-span-4">
                    <ImageUploadInput 
                      value={formData.imageUrl}
                      onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                      placeholder="Link URL Gambar"
                    />
                  </div>
                  <textarea 
                    className="md:col-span-4 w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-xl h-28 leading-relaxed text-pesantren-dark dark:text-white transition-colors"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setEditingId(null)} className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-xl transition-colors"><X size={20} /></button>
                  <button onClick={() => handleSave(p.id)} className="px-6 py-2 bg-pesantren-green text-white font-bold rounded-xl shadow-lg shadow-pesantren-green/20"><Save size={20} className="inline mr-2" /> Update</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-pesantren-cream dark:bg-white/5 border border-pesantren-border dark:border-white/10 text-pesantren-gold font-serif font-bold text-2xl flex items-center justify-center italic shadow-sm group-hover:scale-110 group-hover:bg-pesantren-gold group-hover:text-white transition-all duration-500">
                      {p.order}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-2xl text-pesantren-dark dark:text-white group-hover:text-pesantren-green transition-colors">{p.title}</h4>
                      <div className="h-1 w-12 bg-pesantren-gold/30 rounded-full mt-1 group-hover:w-24 transition-all duration-700"></div>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-2xl italic">"{p.description}"</p>
                </div>
                <div className="flex md:flex-col justify-end gap-3 shrink-0 relative z-10">
                  <button 
                    onClick={() => startEdit(p)} 
                    className="p-4 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
                    title="Edit Program"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)} 
                    className="p-4 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
                    title="Hapus Program"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}

        {programs.length === 0 && (
          <div className="py-24 text-center bg-white dark:bg-slate-900 border-4 border-dashed border-gray-50 dark:border-white/5 rounded-[2.5rem] transition-colors">
             <BookOpen className="mx-auto text-gray-200 dark:text-gray-700 mb-6" size={64} />
             <p className="text-gray-400 italic text-lg">Belum ada program pendidikan yang ditambahkan.</p>
             <button onClick={() => setIsAdding(true)} className="mt-6 text-pesantren-green font-bold uppercase tracking-widest text-xs hover:underline">Tambah Sekarang</button>
          </div>
        )}
      </div>
    </div>
  );
}
