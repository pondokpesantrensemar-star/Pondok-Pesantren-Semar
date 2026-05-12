import React, { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({ title: '', description: '', icon: 'Building2', imageUrl: '' });

  const path = 'facilities';

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      if (!response.ok) throw new Error('Gagal memuat data');
      const data = await response.json();
      setFacilities(data.map((item: any) => ({ ...item, title: item.name })));
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, title: formData.title }), // API uses 'title' now
      });
      if (!response.ok) throw new Error('Gagal menambah fasilitas');
      
      setFormData({ title: '', description: '', icon: 'Building2', imageUrl: '' });
      setIsAdding(false);
      toast.success('Fasilitas berhasil ditambahkan');
      fetchFacilities();
    } catch (error) {
      console.error('Error adding facility:', error);
      toast.error('Gagal menambah fasilitas');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;
    try {
        const response = await fetch(`/api/facilities/${editingFacility.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingFacility),
        });
        if (!response.ok) throw new Error('Gagal memperbarui');
      setEditingFacility(null);
      toast.success('Fasilitas berhasil diperbarui');
      fetchFacilities();
    } catch (error) {
      console.error('Error updating facility:', error);
      toast.error('Gagal memperbarui fasilitas');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus fasilitas ini?')) return;
    try {
      const response = await fetch(`/api/facilities/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus');
      toast.success('Fasilitas dihapus');
      fetchFacilities();
    } catch (error) {
      console.error('Error deleting facility:', error);
      toast.error('Gagal menghapus fasilitas');
    }
  };

  if (loading) return <div className="p-8 admin-text-muted">Memuat data...</div>;

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center admin-card p-6 rounded-3xl border border-gray-100 dark:border-slate-800 transition-colors">
        <div>
          <h3 className="text-xl font-bold admin-text-main transition-colors">Kelola Fasilitas</h3>
          <p className="text-xs admin-text-muted transition-colors">Atur sarana prasarana pesantren</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingFacility(null);
          }}
          className={`${isAdding ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300' : 'admin-btn-primary'} px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold active:scale-95 transition-all text-white`}
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
            className={`admin-card border p-8 rounded-3xl shadow-xl transition-colors ${editingFacility ? 'border-pesantren-gold/30' : 'border-gray-100 dark:border-slate-800'}`}
          >
            <div className="flex items-center gap-3 mb-6 transition-colors">
              {editingFacility ? <Settings2 className="text-pesantren-gold" /> : <Plus className="text-pesantren-green" />}
              <h4 className="font-bold text-lg admin-text-main transition-colors">{editingFacility ? `Edit: ${editingFacility.title}` : 'Tambah Fasilitas Baru'}</h4>
            </div>

            <form onSubmit={editingFacility ? handleUpdate : handleAdd} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest admin-text-muted flex items-center gap-2 transition-colors">
                    <Type size={14} /> Nama Fasilitas
                  </label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none admin-text-main transition-colors"
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
                  <label className="text-xs font-bold uppercase tracking-widest admin-text-muted flex items-center gap-2 transition-colors">
                    <Star size={14} /> Pilih Ikon
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 p-4 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl max-h-32 overflow-y-auto transition-colors">
                    {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                      const Icon = AVAILABLE_ICONS[iconName as keyof typeof AVAILABLE_ICONS];
                      const isSelected = editingFacility ? editingFacility.icon === iconName : formData.icon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => editingFacility ? setEditingFacility({ ...editingFacility, icon: iconName }) : setFormData({ ...formData, icon: iconName })}
                          className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                            isSelected ? 'admin-btn-primary scale-110 shadow-md text-white' : 'bg-white dark:bg-slate-800 admin-text-muted hover:bg-gray-100 dark:hover:bg-slate-700'
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
                  <label className="text-xs font-bold uppercase tracking-widest admin-text-muted flex items-center gap-2 transition-colors">
                    <FileText size={14} /> Deskripsi
                  </label>
                  <textarea 
                    required
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 p-4 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none h-32 admin-text-main transition-colors"
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
                  className="px-6 py-3 font-bold admin-text-muted hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="admin-btn-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg text-white transition-colors"
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
          <div key={fac.id} className="admin-card p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative group overflow-hidden transition-colors">
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
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-red-500 p-2 rounded-lg shadow-md border border-red-100 dark:border-red-900/20 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {fac.imageUrl && (
              <div className="aspect-video w-full mb-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 transition-colors">
                <img src={fac.imageUrl} alt={fac.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`w-10 h-10 ${fac.imageUrl ? 'bg-pesantren-green/10' : 'bg-pesantren-cream dark:bg-pesantren-green/10'} rounded-lg flex items-center justify-center text-pesantren-green mb-4 transition-colors`}>
              {(() => {
                const Icon = AVAILABLE_ICONS[fac.icon as keyof typeof AVAILABLE_ICONS] || Building2;
                return <Icon size={20} />;
              })()}
            </div>
            <h4 className="font-bold admin-text-main mb-2 transition-colors">{fac.title}</h4>
            <p className="text-xs admin-text-muted leading-relaxed line-clamp-3 transition-colors">{fac.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

