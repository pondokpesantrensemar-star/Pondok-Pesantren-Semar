import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Plus, Trash2, Calendar, Type, FileText, Image as ImageIcon, Settings2, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageUploadInput from './ImageUploadInput';

interface KesantrianStep {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  schedule: string;
}

export default function KesantrianManager() {
  const [activities, setActivities] = useState<KesantrianStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', schedule: '' });

  const path = 'kesantrian';

  const fetchActivities = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, path)));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as KesantrianStep));
      setActivities(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { id, ...data } = activities.find(a => a.id === editingId) || { id: editingId };
        await updateDoc(doc(db, path, editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, path), formData);
        setIsAdding(false);
      }
      setFormData({ title: '', description: '', imageUrl: '', schedule: '' });
      fetchActivities();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const startEdit = (act: KesantrianStep) => {
    setEditingId(act.id);
    setFormData({ title: act.title, description: act.description, imageUrl: act.imageUrl, schedule: act.schedule });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kegiatan ini?')) return;
    try {
      await deleteDoc(doc(db, path, id));
      fetchActivities();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return <div>Memuat data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-pesantren-dark">Kelola Kesantrian</h3>
          <p className="text-xs text-gray-400">Atur ekstrakurikuler dan kegiatan harian santri</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          className={`${isAdding ? 'bg-gray-100 text-gray-600' : 'bg-pesantren-green text-white'} px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold active:scale-95 transition-all`}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Tutup' : 'Tambah Kegiatan'}
        </button>
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white border-2 p-8 rounded-3xl shadow-xl ${editingId ? 'border-pesantren-gold/20' : 'border-pesantren-border'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              {editingId ? <Settings2 className="text-pesantren-gold" /> : <Plus className="text-pesantren-green" />}
              <h4 className="font-bold text-lg">{editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h4>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Type size={14} /> Nama Kegiatan
                  </label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Calendar size={14} /> Jadwal
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Setiap Sabtu Sore"
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none"
                    value={formData.schedule}
                    onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <ImageUploadInput 
                    label="Foto Kegiatan (Upload / URL)"
                    value={formData.imageUrl}
                    onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                    placeholder="Atau tempel Link Gambar..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <FileText size={14} /> Deskripsi
                  </label>
                  <textarea 
                    required
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none h-32"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }} 
                  className="px-6 py-3 font-bold text-gray-400"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={`${editingId ? 'bg-pesantren-dark' : 'bg-pesantren-green'} text-white px-10 py-3 rounded-2xl font-bold shadow-lg`}
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Sekarang'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activities.map((act) => (
          <div key={act.id} className="group relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              {act.imageUrl ? (
                <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-pesantren-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(act)}
                    className="bg-white text-pesantren-dark p-3 rounded-2xl hover:bg-pesantren-gold transition-all hover:scale-110"
                    title="Edit"
                  >
                    <Settings2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(act.id)}
                    className="bg-red-500 text-white p-3 rounded-2xl hover:bg-red-600 transition-all hover:scale-110"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 text-[10px] text-pesantren-green font-black uppercase tracking-widest mb-2">
                <Calendar size={10} />
                {act.schedule || 'Jadwal Fleksibel'}
              </div>
              <h4 className="text-xl font-bold text-pesantren-dark mb-3 leading-tight">{act.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 italic">"{act.description}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
