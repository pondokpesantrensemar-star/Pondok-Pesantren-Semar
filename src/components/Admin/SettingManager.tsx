import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Save, AlertCircle, ImageIcon, Plus, X, Monitor, ShieldCheck } from 'lucide-react';
import ImageUploadInput from './ImageUploadInput';
import AdminManager from './AdminManager';

export default function SettingManager() {
  const [activeTab, setActiveTab] = useState<'website' | 'admins'>('website');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    runningText: 'Pendaftaran Santri Baru Tahun Ajaran 2024/2025 Telah Dibuka! Segera Daftarkan Putra-Putri Anda.',
    heroTitle: 'Pondok Pesantren Semar',
    heroSubtitle: 'Membangun Generasi Rabbani di Jantung Nusantara',
    aboutText: 'Pondok Pesantren Semar adalah lembaga pendidikan Islam yang berkomitmen mencetak generasi yang tidak hanya mahir dalam ilmu agama (Tafaqquh Fiddin), tetapi juga memiliki kemandirian dan integritas moral yang tinggi.',
    vision: 'Menjadi pusat keunggulan pendidikan Islam yang integratif, mencetak kader ulama dan umara yang berakhlaqul karimah.',
    mission: 'Menyelenggarakan pendidikan tahfidz dan kitab kuning berkualitas. Membangun softskill dan jiwa kewirausahaan santri. Menanamkan nilai-nilai Islam moderat.',
    contactEmail: 'pondokpesantrensemar@gmail.com',
    contactPhone: '085195301987',
    address: 'Jl. Darussalam Dsn Dulat Ragang Waru Pamekasan 69353. Jawa Timur',
    totalSantri: '1.200+',
    totalAsatidz: '85',
    yearsOfService: '24',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200&h=800',
    slideshowImages: [
      'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200&h=800',
      'https://images.unsplash.com/photo-1577100078279-b3445dee627a?auto=format&fit=crop&q=80&w=1200&h=800'
    ],
    aboutImage: 'https://images.unsplash.com/photo-1577100078279-b3445dee627a?auto=format&fit=crop&q=80&w=1200&h=800'
  });

  const docPath = 'settings/website';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snapshot = await getDoc(doc(db, docPath));
        if (snapshot.exists()) {
          setSettings({ ...settings, ...snapshot.data() });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, docPath);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, docPath), settings);
      alert('Pengaturan berhasil disimpan!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Memuat pengaturan...</div>;
  
  return (
    <div className="space-y-10">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-gray-100 pb-1">
        <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('website')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === 'website' 
                ? 'bg-white text-pesantren-dark shadow-xl scale-[1.02]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Monitor size={18} className={activeTab === 'website' ? 'text-pesantren-gold' : ''} />
            Pengaturan Website
          </button>
          <button 
            onClick={() => setActiveTab('admins')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === 'admins' 
                ? 'bg-white text-pesantren-dark shadow-xl scale-[1.02]' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShieldCheck size={18} className={activeTab === 'admins' ? 'text-pesantren-gold' : ''} />
            Akses Pengurus
          </button>
        </div>
      </div>

      {activeTab === 'website' ? (
        <div className="max-w-4xl space-y-8">
          <div className="bg-pesantren-green/5 border border-pesantren-green/10 p-6 rounded-[2rem] flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-pesantren-green">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-pesantren-dark text-sm mb-1 uppercase tracking-widest">Informasi Utama</h4>
              <p className="text-xs text-gray-500">Konten di bawah ini akan memperbarui landing page publik secara instan.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Teks Berjalan (Marquee Top Bar)</label>
              <textarea 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-24"
                value={settings.runningText || ''}
                onChange={e => setSettings({ ...settings, runningText: e.target.value })}
                placeholder="Contoh: Pendaftaran Santri Baru Tahun Ajaran 2024/2025 Telah Dibuka!"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Utama (Hero)</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm"
                value={settings.heroTitle}
                onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Kontak</label>
              <input 
                type="email" 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm"
                value={settings.contactEmail}
                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <ImageUploadInput 
                label="Gambar Hero (Utama)"
                value={settings.heroImage}
                onChange={(val) => setSettings({ ...settings, heroImage: val })}
              />
            </div>

            <div className="space-y-4">
              <ImageUploadInput 
                label="Gambar Tentang Kami"
                value={settings.aboutImage}
                onChange={(val) => setSettings({ ...settings, aboutImage: val })}
              />
            </div>

            <div className="space-y-6 md:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-serif font-bold text-pesantren-dark flex items-center gap-3">
                    <ImageIcon size={22} className="text-pesantren-gold" /> Slideshow Foto Hero
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-widest">Slider Otomatis Halaman Depan</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(settings.slideshowImages || []).map((img, index) => (
                  <div key={index} className="relative group/slide">
                    <ImageUploadInput 
                      value={img}
                      onChange={(val) => {
                        const newImages = [...(settings.slideshowImages || [])];
                        newImages[index] = val;
                        setSettings({ ...settings, slideshowImages: newImages });
                      }}
                      label={`Foto Slideshow #${index + 1}`}
                    />
                    <button 
                      onClick={() => {
                        const newImages = (settings.slideshowImages || []).filter((_, i) => i !== index);
                        setSettings({ ...settings, slideshowImages: newImages });
                      }}
                      className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover/slide:opacity-100 transition-all hover:bg-red-600 shadow-xl z-20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    setSettings({ 
                      ...settings, 
                      slideshowImages: [...(settings.slideshowImages || []), ''] 
                    });
                  }}
                  className="border-4 border-dashed border-gray-50 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-3 hover:border-pesantren-gold hover:bg-pesantren-gold/[0.02] transition-all text-gray-300 hover:text-pesantren-gold group h-full min-h-[300px]"
                >
                  <Plus size={32} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tambah Foto</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Hero</label>
              <textarea 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-32"
                value={settings.heroSubtitle}
                onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tentang Pesantren (About Us)</label>
              <textarea 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-48"
                value={settings.aboutText}
                onChange={e => setSettings({ ...settings, aboutText: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visi</label>
              <textarea 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-32"
                value={settings.vision}
                onChange={e => setSettings({ ...settings, vision: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Misi</label>
              <textarea 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-32"
                value={settings.mission}
                onChange={e => setSettings({ ...settings, mission: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telepon / WhatsApp</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm"
                value={settings.contactPhone}
                onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Santri</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm"
                value={settings.totalSantri}
                onChange={e => setSettings({ ...settings, totalSantri: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Asatidz</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm"
                value={settings.totalAsatidz}
                onChange={e => setSettings({ ...settings, totalAsatidz: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Mengabdi</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm"
                value={settings.yearsOfService}
                onChange={e => setSettings({ ...settings, yearsOfService: e.target.value })}
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap (di Footer)</label>
              <textarea 
                className="w-full bg-white border border-gray-100 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-32"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-12 pb-20">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-pesantren-green text-white px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl shadow-pesantren-green/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? 'Memproses...' : <><Save size={20} /> Update Website</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AdminManager />
        </div>
      )}
    </div>
  );
}
