import React, { useState, useEffect } from 'react';
import { 
  Save, AlertCircle, ImageIcon, Plus, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageUploadInput from './ImageUploadInput';

export default function SettingManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    runningText: 'Pendaftaran Santri Baru Tahun Ajaran 2024/2025 Telah Dibuka! Segera Daftarkan Putra-Putri Anda.',
    heroTitle: 'Pondok Pesantren Semar',
    heroSubtitle: 'Membangun Generasi Rabbani di Jantung Nusantara',
    aboutText: 'Pondok Pesantren Semar adalah lembaga pendidikan Islam yang berkomitmen mencetak generasi yang tidak hanya mahir dalam ilmu agama (Tafaqquh Fiddin), tetapi juga memiliki kemandirian dan integritas moral yang tinggi.',
    vision: 'Menjadi pusat keunggulan pendidikan Islam yang integratif, mencetak kader ulama dan umara yang berakhlaqul karimah.',
    mission: 'Menyelenggarakan pendidikan tahfidz dan kitab kuning berkualitas. Membangun softskill dan jiwa kewirausahaan santri. Menanamkan nilai-nilai Islam moderat.',
    contactEmail: 'kontak@pesantren.local',
    contactPhone: '085xxxxxxxxx',
    address: 'Alamat Pesantren...',
    totalSantri: '1.000+',
    totalAsatidz: '50',
    yearsOfService: '10',
    heroImage: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200&h=800',
    schoolLogo: '',
    slideshowImages: [
      'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200&h=800',
      'https://images.unsplash.com/photo-1577100078279-b3445dee627a?auto=format&fit=crop&q=80&w=1200&h=800'
    ],
    aboutImage: 'https://images.unsplash.com/photo-1577100078279-b3445dee627a?auto=format&fit=crop&q=80&w=1200&h=800'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            const data = await response.json();
            setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Server error response:', errData);
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }
      
      // Update local cache
      localStorage.setItem('pesantren_settings', JSON.stringify(settings));
      
      toast.success('Pengaturan berhasil disimpan!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Memuat pengaturan...</div>;
  
  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="max-w-4xl space-y-6 sm:space-y-8">
        <div className="admin-card border border-pesantren-green/10 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex items-start gap-3 sm:gap-4 transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm text-pesantren-green shrink-0 transition-colors">
            <AlertCircle size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h4 className="admin-heading admin-text-main text-base sm:text-lg mb-0.5 sm:mb-1 transition-colors">Konfigurasi Konten Publik</h4>
            <p className="text-[11px] sm:text-xs admin-text-muted font-medium transition-colors">Konten di bawah ini akan memperbarui landing page publik secara instan.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-3 sm:space-y-4 md:col-span-2">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Teks Berjalan (Marquee Top Bar)</label>
            <textarea 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm h-24 text-sm admin-text-main"
              value={settings.runningText || ''}
              onChange={e => setSettings({ ...settings, runningText: e.target.value })}
              placeholder="Contoh: Pendaftaran Santri Baru Tahun Ajaran 2024/2025 Telah Dibuka!"
            />
          </div>
   
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Judul Utama (Hero)</label>
            <textarea 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-sm admin-text-main h-24"
              value={settings.heroTitle}
              onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
              placeholder="Baris 1&#10;Baris 2 (Miring)"
            />
            <p className="text-[10px] admin-text-muted ml-1 italic transition-colors">* Gunakan enter untuk memisahkan baris pertama dan baris kedua (miring)</p>
          </div>
   
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Email Kontak</label>
            <input 
              type="email" 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-sm admin-text-main"
              value={settings.contactEmail}
              onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <ImageUploadInput 
              label="Logo Pesantren"
              value={settings.schoolLogo}
              onChange={(val) => setSettings({ ...settings, schoolLogo: val })}
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

          <div className="space-y-6 md:col-span-2 admin-card p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors text-left">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm sm:text-lg font-serif font-bold admin-text-main flex items-center gap-3 transition-colors">
                  <ImageIcon size={20} className="text-pesantren-gold" /> Slideshow Foto Hero
                </h4>
                <p className="text-[10px] sm:text-[11px] admin-text-muted mt-1 uppercase tracking-widest transition-colors">Slider Otomatis Halaman Depan</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
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
                    className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-xl opacity-0 group-hover/slide:opacity-100 transition-all hover:bg-rose-600 shadow-xl z-20"
                  >
                    <X size={14} />
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
                className="border-4 border-dashed border-gray-50 dark:border-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-8 sm:p-12 flex flex-col items-center justify-center gap-3 hover:border-pesantren-gold hover:bg-pesantren-gold/[0.02] transition-all text-gray-300 dark:text-slate-700 hover:text-pesantren-gold group h-full min-h-[200px] sm:min-h-[300px]"
              >
                <Plus size={24} className="group-hover:scale-110 transition-transform sm:w-8 sm:h-8" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Tambah Foto</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Deskripsi Hero</label>
            <textarea 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-32 admin-text-main"
              value={settings.heroSubtitle}
              onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Tentang Pesantren (About Us)</label>
            <textarea 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-48 admin-text-main"
              value={settings.aboutText}
              onChange={e => setSettings({ ...settings, aboutText: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Visi</label>
            <textarea 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-32 admin-text-main"
              value={settings.vision}
              onChange={e => setSettings({ ...settings, vision: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Misi</label>
            <textarea 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-32 admin-text-main"
              value={settings.mission}
              onChange={e => setSettings({ ...settings, mission: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Telepon / WhatsApp</label>
            <input 
              type="text" 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm admin-text-main"
              value={settings.contactPhone}
              onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Total Santri</label>
            <input 
              type="text" 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm admin-text-main"
              value={settings.totalSantri}
              onChange={e => setSettings({ ...settings, totalSantri: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Total Asatidz</label>
            <input 
              type="text" 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm admin-text-main"
              value={settings.totalAsatidz}
              onChange={e => setSettings({ ...settings, totalAsatidz: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Tahun Mengabdi</label>
            <input 
              type="text" 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm admin-text-main"
              value={settings.yearsOfService}
              onChange={e => setSettings({ ...settings, yearsOfService: e.target.value })}
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="block text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Alamat Lengkap (di Footer)</label>
            <textarea 
              className="w-full admin-card border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem] focus:ring-4 focus:ring-pesantren-gold/10 outline-none transition-all shadow-sm h-32 admin-text-main"
              value={settings.address}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end pt-8 sm:pt-12 pb-12 sm:pb-20">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto admin-btn-primary text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 sm:gap-4 shadow-2xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? 'Memproses...' : <><Save size={18} className="sm:w-[20px] sm:h-[20px]" /> Update Website</>}
          </button>
        </div>
      </div>
    </div>
  );
}
