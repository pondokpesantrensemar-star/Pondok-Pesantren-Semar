import React, { useState, useEffect } from 'react';
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
  const [sortAscending, setSortAscending] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', order: 0 });

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (!response.ok) throw new Error('Gagal memuat data');
      const data = await response.json();
      const sortedData = data.sort((a: Program, b: Program) => sortAscending ? a.order - b.order : b.order - a.order);
      setPrograms(sortedData);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, [sortAscending]);

  const handleSave = async (id?: string) => {
    try {
      const url = id ? `/api/programs/${id}` : '/api/programs';
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal menyimpan');

      if (id) {
        setEditingId(null);
        toast.success('Program diperbarui');
      } else {
        setIsAdding(false);
        toast.success('Program ditambahkan');
      }
      setFormData({ title: '', description: '', imageUrl: '', order: 0 });
      fetchPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Gagal menyimpan program');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus program ini?')) return;
    try {
      const response = await fetch(`/api/programs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus');
      toast.success('Program dihapus');
      fetchPrograms();
    } catch (error) {
        console.error('Error deleting program:', error);
        toast.error('Gagal menghapus program');
    }
  };

  const startEdit = (p: Program) => {
    setEditingId(p.id);
    setFormData({ title: p.title, description: p.description, imageUrl: p.imageUrl || '', order: p.order });
  };

  if (loading) return <div className="p-8 admin-text-muted">Memuat data...</div>;

  return (
    <div className="space-y-10 text-left transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-serif font-bold admin-text-main mb-1 transition-colors">Kurikulum & Program</h3>
          <p className="text-xs admin-text-muted font-bold uppercase tracking-widest transition-colors">Kelola pilar pendidikan utama</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSortAscending(!sortAscending)}
            className="bg-gray-100 dark:bg-slate-800 admin-text-main px-4 py-3 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            title={`Urutkan dari ${sortAscending ? 'terkecil ke terbesar' : 'terbesar ke terkecil'}`}
          >
            {sortAscending ? (
               <span className="text-sm font-bold truncate">Sortir: ▲ Asc</span>
            ) : (
               <span className="text-sm font-bold truncate">Sortir: ▼ Desc</span>
            )}
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="admin-btn-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={20} /> Tambah Program Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="admin-card border-2 border-pesantren-gold/20 p-10 rounded-[2.5rem] shadow-xl space-y-6 overflow-hidden relative transition-colors"
            >
              <div className="absolute top-0 right-0 p-8 text-pesantren-gold/5 pointer-events-none">
                <Plus size={120} />
              </div>
              
              <div className="relative z-10">
                <h4 className="text-lg font-serif font-bold admin-text-main mb-6 transition-colors">Formulir Program Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold admin-text-muted uppercase tracking-widest mb-2 block transition-colors">Judul Program</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none font-medium transition-all admin-text-main"
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
                    <label className="text-[10px] font-bold admin-text-muted uppercase tracking-widest mb-2 block transition-colors">Urutan Tampil</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none font-bold text-center tabular-nums transition-all admin-text-main"
                      value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-bold admin-text-muted uppercase tracking-widest mb-2 block transition-colors">Deskripsi Detail</label>
                    <textarea 
                      className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none h-32 transition-all leading-relaxed admin-text-main"
                      value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-50 dark:border-slate-800 transition-colors">
                  <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-sm font-bold admin-text-muted hover:admin-text-main transition-colors uppercase tracking-widest">Batal</button>
                  <button onClick={() => handleSave()} className="admin-btn-primary text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:opacity-90 transition-all uppercase tracking-widest">Simpan Data</button>
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
            className="admin-card border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-pesantren-gold/50 transition-all group overflow-hidden relative flex flex-col md:flex-row justify-between gap-8 transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-slate-900/50 rounded-full -mr-16 -mt-16 group-hover:bg-pesantren-gold/5 transition-colors duration-500 transition-colors"></div>

            {editingId === p.id ? (
              <div className="w-full space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <input 
                    type="text" className="md:col-span-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl font-bold admin-text-main transition-colors"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Judul Program"
                  />
                  <input 
                    type="number" className="bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl font-bold text-center admin-text-main transition-colors"
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
                    className="md:col-span-4 w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-xl h-28 leading-relaxed admin-text-main transition-colors"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setEditingId(null)} className="p-3 admin-text-muted hover:text-gray-600 bg-gray-50 dark:bg-slate-800 rounded-xl transition-colors transition-colors"><X size={20} /></button>
                  <button onClick={() => handleSave(p.id)} className="px-6 py-2 admin-btn-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all"><Save size={20} className="inline mr-2" /> Update</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-6 mb-4 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-pesantren-cream dark:bg-slate-800 border border-pesantren-border dark:border-slate-700 text-pesantren-gold font-serif font-bold text-2xl flex items-center justify-center italic shadow-sm group-hover:scale-110 group-hover:bg-pesantren-gold group-hover:text-white transition-all duration-500 transition-colors">
                      {p.order}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-2xl admin-text-main group-hover:text-pesantren-green transition-colors">{p.title}</h4>
                      <div className="h-1 w-12 bg-pesantren-gold/30 rounded-full mt-1 group-hover:w-24 transition-all duration-700 transition-colors"></div>
                    </div>
                  </div>
                  <p className="admin-text-muted text-sm leading-relaxed max-w-2xl italic transition-colors">"{p.description}"</p>
                </div>
                <div className="flex md:flex-col justify-end gap-3 shrink-0 relative z-10 transition-colors">
                  <button 
                    onClick={() => startEdit(p)} 
                    className="p-4 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
                    title="Edit Program"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)} 
                    className="p-4 text-red-600 bg-red-50/50 dark:bg-red-500/10 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center"
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
          <div className="py-24 text-center admin-card border-4 border-dashed border-gray-50 dark:border-slate-800 rounded-[2.5rem] transition-colors">
             <BookOpen className="mx-auto admin-text-muted mb-6 transition-colors" size={64} />
             <p className="admin-text-muted italic text-lg transition-colors">Belum ada program pendidikan yang ditambahkan.</p>
             <button onClick={() => setIsAdding(true)} className="mt-6 text-pesantren-green font-bold uppercase tracking-widest text-xs hover:underline outline-none">Tambah Sekarang</button>
          </div>
        )}
      </div>
    </div>
  );
}
