import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Settings2, X, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import ImageUploadInput from './ImageUploadInput';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
}

export default function NewsManager() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', excerpt: '', content: '', imageUrl: '', date: '' });

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('Gagal memuat berita');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Gagal memuat berita');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.excerpt) {
      toast.error('Gunakan minimal judul, ringkasan, dan tanggal!');
      return;
    }

    try {
      const url = editingId ? `/api/news/${editingId}` : '/api/news';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal menyimpan berita');
      
      toast.success(editingId ? 'Berita diperbarui' : 'Berita ditambahkan');
      setEditingId(null);
      setIsAdding(false);
      setFormData({ title: '', excerpt: '', content: '', imageUrl: '', date: '' });
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('Gagal menyimpan berita');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return;
    try {
      const response = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus berita');
      toast.success('Berita dihapus');
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Gagal menghapus berita');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 transition-colors">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} 
        className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
      />
      <p className="text-[10px] font-black admin-text-muted uppercase tracking-[0.2em] animate-pulse">Memuat Berita...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-0 mb-20 text-left">
      <div className="admin-card p-4 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h3 className="text-4xl admin-heading admin-text-main transition-colors mb-2">Manajemen Berita</h3>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-12 bg-emerald-500 rounded-full" />
              <p className="text-[10px] admin-text-muted font-black uppercase tracking-[0.25em]">Kelola Publikasi & Informasi</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              if (!isAdding) setFormData({ title: '', excerpt: '', content: '', imageUrl: '', date: new Date().toISOString().split('T')[0] });
            }}
            className={`w-full md:w-auto px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-3 ${
              isAdding 
                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 border border-rose-100 dark:border-rose-900 shadow-rose-500/5' 
                : 'bg-emerald-600 text-white shadow-emerald-500/20'
            }`}
          >
            {isAdding ? <X size={16} /> : <Plus size={16} />}
            {isAdding ? 'Batal' : 'Tambah Berita'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="admin-card p-6 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-black/5 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 pointer-events-none" />
            <h4 className="text-xl font-bold admin-text-main mb-8 flex items-center gap-3 relative z-10 font-serif">
              <Settings2 className="text-emerald-500" />
              {editingId ? 'Edit Berita' : 'Buat Berita Baru'}
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 mb-2 block transition-colors">Judul Berita</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan judul..." 
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium admin-text-main"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 mb-2 block transition-colors">Tanggal</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium admin-text-main"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 mb-2 block transition-colors">Ringkasan (Excerpt)</label>
                  <textarea 
                    placeholder="Tulis ringkasan singkat (1-2 kalimat)..." 
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium min-h-[100px] resize-none admin-text-main"
                    value={formData.excerpt}
                    onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <ImageUploadInput 
                    label="Gambar Utama (Opsional)"
                    value={formData.imageUrl}
                    onChange={(val) => setFormData({...formData, imageUrl: val})}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 mb-2 block transition-colors">Isi Konten Berita (Markdown/Teks)</label>
                  <textarea 
                    placeholder="Tulis isi berita yang lebih detail..." 
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium min-h-[220px] resize-none admin-text-main"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <button 
                onClick={handleSave}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-emerald-500/20 hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Save size={16} />
                Simpan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length === 0 && !loading ? (
          <div className="col-span-full py-24 text-center admin-card rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 transition-colors">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 admin-text-muted opacity-30" />
            </div>
            <p className="text-sm font-bold admin-text-muted italic tracking-wide">Belum ada berita yang diterbitkan</p>
          </div>
        ) : news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group admin-card p-6 flex flex-col rounded-[2.2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-none transition-all duration-500 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm">
                 <Calendar size={12} className="text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest admin-text-muted tabular-nums">
                   {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric'})}
                 </span>
               </div>
               
               <div className="flex items-center gap-2">
                 <button 
                  onClick={() => {
                    setEditingId(item.id);
                    setFormData({ title: item.title, excerpt: item.excerpt, content: item.content || '', imageUrl: item.imageUrl || '', date: item.date });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-10 h-10 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl flex items-center justify-center transition-all bg-opacity-80"
                  title="Edit Berita"
                 >
                   <Settings2 size={16} />
                 </button>
                 <button 
                  onClick={() => handleDelete(item.id)}
                  className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl flex items-center justify-center transition-all"
                  title="Hapus Berita"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>

            <div className="mb-6 relative z-10 flex-1">
              {item.imageUrl ? (
                <div className="w-full h-40 rounded-2xl overflow-hidden mb-5">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              ) : (
                <div className="w-full h-40 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-5">
                  <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                </div>
              )}
              <h4 className="font-bold text-xl admin-text-main font-serif leading-snug line-clamp-2 transition-colors mb-3 group-hover:text-emerald-600">
                {item.title}
              </h4>
              <p className="text-xs admin-text-muted leading-relaxed line-clamp-3 italic">"{item.excerpt}"</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
