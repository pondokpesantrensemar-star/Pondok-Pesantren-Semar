import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Plus, Trash2, Home, Type, FileText, Settings2, Check, X, Building2, Book, Coffee, Wifi, Shield, Users, School, Library, Music, Zap, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import ImageUploadInput from './ImageUploadInput';

const AVAILABLE_ICONS = {
  Home, Building2, Book, Coffee, Wifi, Shield, Users, School, Library, Music, Zap, Heart, Star
};

interface Facility {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
}

export default function FacilityManager() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', icon: 'Home', imageUrl: '' });

  const path = 'facilities';

  const fetchFacilities = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, path)));
      const data = snapshot.docs.map(d => {
        const item = d.data();
        return { 
          id: d.id, 
          ...item,
          icon: item.icon || 'Home' 
        } as Facility;
      });
      setFacilities(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFacilities(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, path), formData);
      setFormData({ title: '', description: '', icon: 'Home', imageUrl: '' });
      setIsAdding(false);
      toast.success('Fasilitas berhasil ditambahkan');
      fetchFacilities();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;
    try {
      const { id, ...data } = editingFacility;
      await updateDoc(doc(db, path, id), data);
      setEditingFacility(null);
      toast.success('Fasilitas berhasil diperbarui');
      fetchFacilities();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus fasilitas ini?')) return;
    try {
      await deleteDoc(doc(db, path, id));
      toast.success('Fasilitas dihapus');
      fetchFacilities();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return <div>Memuat data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 transition-colors">
        <div>
          <h3 className="text-xl font-bold text-pesantren-dark dark:text-white">Kelola Fasilitas</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Atur sarana prasarana pesantren</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingFacility(null);
          }}
          className={`${isAdding ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400' : 'bg-pesantren-green text-white'} px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold active:scale-95 transition-all`}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />} {isAdding ? 'Tutup' : 'Tambah Fasilitas'}
        </button>
      </div>

      <AnimatePresence>
        {(isAdding || editingFacility) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white dark:bg-slate-900 border p-8 rounded-3xl shadow-xl transition-colors ${editingFacility ? 'border-pesantren-gold/30' : 'border-pesantren-border dark:border-white/5'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              {editingFacility ? <Settings2 className="text-pesantren-gold" /> : <Plus className="text-pesantren-green" />}
              <h4 className="font-bold text-lg text-pesantren-dark dark:text-white">{editingFacility ? `Edit: ${editingFacility.title}` : 'Tambah Fasilitas Baru'}</h4>
            </div>

            <form onSubmit={editingFacility ? handleUpdate : handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <Type size={14} /> Nama Fasilitas
                  </label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none text-pesantren-dark dark:text-white transition-colors"
                    value={editingFacility ? editingFacility.title : formData.title}
                    onChange={e => editingFacility ? setEditingFacility({ ...editingFacility, title: e.target.value }) : setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <ImageUploadInput 
                    label="Foto Fasilitas (Upload / URL)"
                    value={editingFacility ? editingFacility.imageUrl : formData.imageUrl}
                    onChange={(val) => editingFacility ? setEditingFacility({ ...editingFacility, imageUrl: val }) : setFormData({ ...formData, imageUrl: val })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <Star size={14} /> Pilih Ikon
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-xl max-h-32 overflow-y-auto transition-colors">
                    {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                      const Icon = AVAILABLE_ICONS[iconName as keyof typeof AVAILABLE_ICONS];
                      const isSelected = editingFacility ? editingFacility.icon === iconName : formData.icon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => editingFacility ? setEditingFacility({ ...editingFacility, icon: iconName }) : setFormData({ ...formData, icon: iconName })}
                          className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                            isSelected ? 'bg-pesantren-green text-white scale-110 shadow-md' : 'bg-white dark:bg-slate-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600'
                          }`}
                          title={iconName}
                        >
                          <Icon size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <FileText size={14} /> Deskripsi
                  </label>
                  <textarea 
                    required
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none h-32 text-pesantren-dark dark:text-white transition-colors"
                    value={editingFacility ? editingFacility.description : formData.description}
                    onChange={e => editingFacility ? setEditingFacility({ ...editingFacility, description: e.target.value }) : setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingFacility(null);
                  }} 
                  className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={`${editingFacility ? 'bg-pesantren-dark dark:bg-slate-700' : 'bg-pesantren-green'} text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg`}
                >
                  {editingFacility ? <Check size={18} /> : null}
                  {editingFacility ? 'Simpan Perubahan' : 'Tambah Fasilitas'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac) => (
          <div key={fac.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm relative group overflow-hidden transition-colors">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button 
                onClick={() => {
                  setEditingFacility(fac);
                  setIsAdding(false);
                }}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-pesantren-gold p-2 rounded-lg shadow-md border border-pesantren-gold/20 hover:bg-pesantren-gold hover:text-white transition-all active:scale-90"
                title="Edit"
              >
                <Settings2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(fac.id)}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-red-500 p-2 rounded-lg shadow-md border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {fac.imageUrl && (
              <div className="aspect-video w-full mb-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800">
                <img src={fac.imageUrl} alt={fac.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`w-10 h-10 ${fac.imageUrl ? 'bg-pesantren-green/10' : 'bg-pesantren-cream dark:bg-white/5'} rounded-lg flex items-center justify-center text-pesantren-green mb-4 transition-colors`}>
              {(() => {
                const Icon = AVAILABLE_ICONS[fac.icon as keyof typeof AVAILABLE_ICONS] || Home;
                return <Icon size={20} />;
              })()}
            </div>
            <h4 className="font-bold text-pesantren-dark dark:text-white mb-2">{fac.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{fac.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

