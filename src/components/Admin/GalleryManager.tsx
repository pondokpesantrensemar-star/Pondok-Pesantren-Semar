import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Plus, Trash2, Image as ImageIcon, Type, RotateCw, Settings2, Check, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { updateDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import ImageUploadInput from './ImageUploadInput';

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
  order: number;
  rotation?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: boolean;
}

export default function GalleryManager() {
  const location = useLocation();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({ url: '', title: '', category: 'Kegiatan', order: 0 });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setIsAdding(true);
    }
  }, [location.search]);

  const path = 'gallery';

  const fetchImages = async () => {
    try {
      const q = query(collection(db, path), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
      setImages(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url || !formData.title) return;

    try {
      await addDoc(collection(db, path), {
        ...formData,
        order: images.length + 1
      });
      setFormData({ url: '', title: '', category: 'Kegiatan', order: 0 });
      setIsAdding(false);
      toast.success('Foto berhasil ditambahkan');
      fetchImages();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus foto ini dari galeri?')) return;
    try {
      await deleteDoc(doc(db, path, id));
      toast.success('Foto dihapus dari galeri');
      fetchImages();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      const { id, ...data } = editingImage;
      await updateDoc(doc(db, path, id), data);
      setEditingImage(null);
      toast.success('Foto berhasil diperbarui');
      fetchImages();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const applyTransformation = (img: GalleryItem) => {
    const filters = [];
    if (img.brightness !== undefined) filters.push(`brightness(${img.brightness}%)`);
    if (img.contrast !== undefined) filters.push(`contrast(${img.contrast}%)`);
    if (img.grayscale) filters.push('grayscale(100%)');

    return {
      transform: `rotate(${img.rotation || 0}deg)`,
      filter: filters.join(' ')
    };
  };

  if (loading) return <div>Memuat galeri...</div>;

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm transition-colors">
        <div>
          <h3 className="text-xl font-serif font-bold text-pesantren-dark dark:text-white">Kelola Galeri Foto</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Atur dokumentasi momen pesantren secara real-time</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (editingImage) setEditingImage(null);
          }}
          className={`${isAdding ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400' : 'bg-pesantren-green text-white'} px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold active:scale-95 transition-all shadow-lg ${!isAdding && 'shadow-pesantren-green/20'}`}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Tutup Panel' : 'Tambah Foto'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-pesantren-border dark:border-white/5 p-8 rounded-3xl shadow-xl mb-8 transition-colors"
          >
            <div className="flex items-center gap-3 mb-6">
              <Plus className="text-pesantren-green" />
              <h4 className="font-bold text-lg text-pesantren-dark dark:text-white">Tambah Foto Baru</h4>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <ImageUploadInput 
                    label="Pilih / Upload Foto"
                    value={formData.url}
                    onChange={(val) => setFormData({ ...formData, url: val })}
                    placeholder="Atau tempel Link URL..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <Type size={14} /> Judul / Keterangan
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Shalat Berjamaah"
                    required
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none text-pesantren-dark dark:text-white transition-colors"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Kategori</label>
                  <select 
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none text-pesantren-dark dark:text-white transition-colors"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Kegiatan</option>
                    <option>Fasilitas</option>
                    <option>Lingkungan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Urutan Tampil</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none text-pesantren-dark dark:text-white transition-colors"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 font-bold text-gray-500 dark:text-gray-400">Batal</button>
                <button type="submit" className="bg-pesantren-green text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pesantren-green/20">Simpan Foto</button>
              </div>
            </form>
          </motion.div>
        )}

        {editingImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-pesantren-gold/30 p-8 rounded-3xl shadow-xl mb-8 ring-1 ring-pesantren-gold/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Settings2 className="text-pesantren-gold" />
                <h4 className="font-bold text-lg text-pesantren-dark dark:text-white">Edit Foto: {editingImage.title}</h4>
              </div>
              <button 
                onClick={() => setEditingImage(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Preview */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pratinjau Hasil</label>
                  <button 
                    onClick={() => setEditingImage({ 
                      ...editingImage, 
                      rotation: 0, 
                      brightness: 100, 
                      contrast: 100, 
                      grayscale: false 
                    })}
                    className="text-[10px] font-black text-pesantren-gold uppercase tracking-widest hover:underline"
                  >
                    Reset Filter
                  </button>
                </div>
                <div 
                  className="aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center relative border-4 border-gray-100 dark:border-white/5 cursor-pointer group/preview"
                  onClick={() => {
                    const nextRot = ((editingImage.rotation || 0) + 90) % 360;
                    setEditingImage({ ...editingImage, rotation: nextRot });
                  }}
                >
                  <img 
                    src={editingImage.url} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain"
                    style={{
                      ...applyTransformation(editingImage),
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.05s linear'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold border border-white/20 flex items-center gap-2">
                      <RotateCw size={14} />
                      Klik untuk Rotasi
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold">
                    PREVIEW
                  </div>
                </div>
                <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 italic">Tip: Klik pada gambar untuk merotasi 90° cepat</p>
              </div>

              {/* Controls */}
              <div className="space-y-8">
                {/* Meta Data Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <ImageUploadInput 
                      label="Update Foto"
                      value={editingImage.url}
                      onChange={(val) => setEditingImage({ ...editingImage, url: val })}
                      placeholder="Ganti Link URL"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Type size={14} /> Judul Gambar
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-xl focus:ring-2 focus:ring-pesantren-gold outline-none text-xs font-medium text-pesantren-dark dark:text-white transition-colors"
                        value={editingImage.title}
                        onChange={e => setEditingImage({ ...editingImage, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Kategori</label>
                        <select 
                          className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-xl focus:ring-2 focus:ring-pesantren-gold outline-none text-xs font-medium appearance-none text-pesantren-dark dark:text-white transition-colors"
                          value={editingImage.category}
                          onChange={e => setEditingImage({ ...editingImage, category: e.target.value })}
                        >
                          <option>Kegiatan</option>
                          <option>Fasilitas</option>
                          <option>Lingkungan</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Urutan</label>
                        <input 
                          type="number" 
                          className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-xl focus:ring-2 focus:ring-pesantren-gold outline-none text-xs font-medium text-pesantren-dark dark:text-white transition-colors"
                          value={editingImage.order}
                          onChange={e => setEditingImage({ ...editingImage, order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <RotateCw size={14} /> Rotasi Gambar
                  </label>
                  <div className="flex gap-2">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setEditingImage({ ...editingImage, rotation: deg })}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border ${editingImage.rotation === deg ? 'bg-pesantren-dark dark:bg-slate-700 text-white border-pesantren-dark dark:border-white/20 shadow-lg' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <SlidersHorizontal size={14} /> Penyesuaian Visual
                  </label>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-500 dark:text-gray-400">Kecerahan (Brightness)</span>
                        <span className="text-pesantren-gold">{editingImage.brightness || 100}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="150" step="1"
                        className="w-full accent-pesantren-gold h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        value={editingImage.brightness || 100}
                        onChange={e => setEditingImage({ ...editingImage, brightness: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-500 dark:text-gray-400">Kontras (Contrast)</span>
                        <span className="text-pesantren-gold">{editingImage.contrast || 100}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="150" step="1"
                        className="w-full accent-pesantren-gold h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        value={editingImage.contrast || 100}
                        onChange={e => setEditingImage({ ...editingImage, contrast: parseInt(e.target.value) })}
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => setEditingImage({ ...editingImage, grayscale: !editingImage.grayscale })}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${editingImage.grayscale ? 'bg-pesantren-green' : 'bg-gray-200 dark:bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 bg-white dark:bg-slate-400 rounded-full transition-transform ${editingImage.grayscale ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-pesantren-dark dark:group-hover:text-white transition-colors">Efek Hitam Putih (Grayscale)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-white/5">
                  <button 
                    onClick={handleUpdate}
                    className="flex-1 bg-pesantren-dark dark:bg-slate-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-600 transition-all shadow-xl shadow-black/10"
                  >
                    <Check size={18} /> Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((img) => (
          <div key={img.id} className="group relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-slate-800">
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-all duration-700" 
                style={applyTransformation(img)}
              />
              <div className="absolute inset-0 bg-pesantren-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                 <div className="flex gap-2">
                   <button 
                    onClick={() => setEditingImage(img)}
                    className="bg-white dark:bg-slate-800 text-pesantren-dark dark:text-white p-3 rounded-2xl hover:bg-pesantren-gold transition-all hover:scale-110 shadow-lg"
                    title="Edit Gambar"
                  >
                    <Settings2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(img.id)}
                    className="bg-red-500 text-white p-3 rounded-2xl hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
                    title="Hapus"
                  >
                    <Trash2 size={20} />
                  </button>
                 </div>
                 <span className="text-white text-[10px] font-black uppercase tracking-widest opacity-80">Opsi Pengelolaan</span>
              </div>
              {img.rotation || img.brightness || img.grayscale ? (
                <div className="absolute top-4 left-4 bg-pesantren-gold/90 text-pesantren-dark p-1.5 rounded-lg shadow-lg">
                  <RotateCw size={14} className="animate-spin-slow" />
                </div>
              ) : null}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-pesantren-dark dark:text-white leading-tight">{img.title}</h4>
                  <p className="text-[10px] text-pesantren-green font-bold uppercase tracking-widest mt-1">{img.category}</p>
                </div>
                <span className="text-xs font-serif italic text-pesantren-gold font-bold">#{img.order}</span>
              </div>
            </div>
          </div>
        ))}

        {images.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
            <ImageIcon className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
            <p className="text-gray-400 dark:text-gray-500">Belum ada foto. Klik "Tambah Foto" untuk memulai.</p>
          </div>
        )}
      </div>
    </div>
  );
}
