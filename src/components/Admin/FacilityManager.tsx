import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Plus, Trash2, Home, Type, FileText, Image as ImageIcon, Settings2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageUploadInput from './ImageUploadInput';

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
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Facility));
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
      fetchFacilities();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus fasilitas ini?')) return;
    try {
      await deleteDoc(doc(db, path, id));
      fetchFacilities();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return <div>Memuat data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-pesantren-dark">Kelola Fasilitas</h3>
          <p className="text-xs text-gray-400">Atur sarana prasarana pesantren</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingFacility(null);
          }}
          className={`${isAdding ? 'bg-gray-100 text-gray-600' : 'bg-pesantren-green text-white'} px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold active:scale-95 transition-all`}
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
            className={`bg-white border p-8 rounded-3xl shadow-xl ${editingFacility ? 'border-pesantren-gold/30' : 'border-pesantren-border'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              {editingFacility ? <Settings2 className="text-pesantren-gold" /> : <Plus className="text-pesantren-green" />}
              <h4 className="font-bold text-lg">{editingFacility ? `Edit: ${editingFacility.title}` : 'Tambah Fasilitas Baru'}</h4>
            </div>

            <form onSubmit={editingFacility ? handleUpdate : handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Type size={14} /> Nama Fasilitas
                  </label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none"
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
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <FileText size={14} /> Deskripsi
                  </label>
                  <textarea 
                    required
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none h-32"
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
                  className="px-6 py-3 font-bold text-gray-500"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={`${editingFacility ? 'bg-pesantren-dark' : 'bg-pesantren-green'} text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg`}
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
          <div key={fac.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button 
                onClick={() => {
                  setEditingFacility(fac);
                  setIsAdding(false);
                }}
                className="bg-white text-pesantren-gold p-2 rounded-lg shadow-md border border-pesantren-gold/20 hover:bg-pesantren-gold hover:text-white transition-colors"
                title="Edit"
              >
                <Settings2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(fac.id)}
                className="bg-white text-red-500 p-2 rounded-lg shadow-md border border-red-100 hover:bg-red-500 hover:text-white transition-colors"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {fac.imageUrl && (
              <div className="aspect-video w-full mb-4 rounded-xl overflow-hidden bg-gray-50">
                <img src={fac.imageUrl} alt={fac.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`w-10 h-10 ${fac.imageUrl ? 'bg-pesantren-green/10' : 'bg-pesantren-cream'} rounded-lg flex items-center justify-center text-pesantren-green mb-4`}>
              <Home size={20} />
            </div>
            <h4 className="font-bold text-pesantren-dark mb-2">{fac.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{fac.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

