import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { 
  User, BookOpen, MapPin, 
  CheckCircle, Plus, Save, 
  ShieldAlert, Activity, ArrowLeft,
  Sparkles,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

export default function PublicRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Laki-laki',
    nik: '',
    nisn: '',
    birthPlace: '',
    birthDate: '',
    bloodType: '-',
    height: '',
    weight: '',
    fatherName: '',
    fatherNIK: '',
    fatherEducation: 'SMA',
    motherName: '',
    motherNIK: '',
    motherEducation: 'SMA',
    parentOccupation: '',
    monthlyIncome: 'Rp 1.000.000 - Rp 3.000.000',
    phoneNumber: '',
    address: '',
    previousSchool: '',
    program: 'Tahfidz',
    motivation: '',
    registrationFee: '',
    dormitoryFee: '',
    monthlyTuition: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        ...formData,
        status: 'Pending', // Public registrations start as Pending
        createdAt: Timestamp.now()
      });
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-pesantren-cream flex items-center justify-center p-6 pb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl text-center max-w-2xl border border-pesantren-gold/10"
        >
          <div className="w-24 h-24 bg-pesantren-green text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-pesantren-green/20">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-4xl font-serif font-black text-pesantren-dark mb-6 tracking-tight">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 font-medium leading-relaxed mb-10 italic">
            Alhamdulillah, data pendaftaran ananda <span className="text-pesantren-green font-bold">{formData.fullName}</span> telah kami terima. Silakan tunggu konfirmasi selanjutnya dari panitia melalui WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="px-10 py-5 bg-pesantren-dark text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pesantren-cream font-sans">
      {/* Header Section */}
      <div className="bg-pesantren-dark text-white pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pesantren-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-pesantren-gold text-[10px] font-black uppercase tracking-widest mb-8 hover:gap-4 transition-all">
            <ArrowLeft size={16} /> Kembali
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-pesantren-gold text-pesantren-dark text-[9px] font-black uppercase tracking-widest rounded-full">Tahun Ajaran 2026/2027</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 leading-none">
            Pendaftaran <br/>
            <span className="text-pesantren-gold italic engraved-text">Santri Baru.</span>
          </h1>
          <p className="text-white/40 max-w-xl text-lg font-light leading-relaxed">
            Silakan lengkapi formulir di bawah ini dengan data yang sebenar-benarnya untuk proses seleksi administrasi.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 pb-32">
        <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 border border-gray-100 space-y-16">
          
          {/* SECTION 1: DATA PRIBADI */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pesantren-green/10 text-pesantren-green rounded-2xl flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-pesantren-dark">Identitas Santri</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Data Sesuai Akta Kelahiran / Ijazah</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input 
                  type="text" required placeholder="Ahmad Fauzi" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-pesantren-green/5 outline-none transition-all font-bold" 
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-pesantren-green/5 outline-none font-bold" 
                  value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="Laki-laki">Laki-laki (Putra)</option>
                  <option value="Perempuan">Perempuan (Putri)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIK (16 Digit)</label>
                <input 
                  type="text" placeholder="3526..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-pesantren-green/5 outline-none font-bold" 
                  value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NISN</label>
                <input 
                  type="text" placeholder="00..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-pesantren-green/5 outline-none font-bold" 
                  value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
                <input 
                  type="text" required placeholder="Kab. Pamekasan"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-pesantren-green/5 outline-none font-bold" 
                  value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                <input 
                  type="date" required 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-pesantren-green/5 outline-none font-bold" 
                  value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: KONTAK & ALAMAT */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pesantren-gold/10 text-pesantren-gold rounded-2xl flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-pesantren-dark">Kontak & Domisili</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Alamat Sekarang & No. Aktif</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. WhatsApp (Wali/Santri)</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="tel" required placeholder="0812..." 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm focus:ring-4 focus:ring-pesantren-gold/5 outline-none transition-all font-bold" 
                    value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                <textarea 
                  required rows={3} placeholder="Dusun..., Desa..., Kecamatan..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 text-sm focus:ring-4 focus:ring-pesantren-gold/5 outline-none font-bold resize-none" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PROGRAM & ASAL SEKOLAH */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-pesantren-dark">Akademik</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Program yang dipilih</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Program Pilihan</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/5 outline-none font-bold" 
                  value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})}
                >
                  <option value="Tahfidz">Tahfidz Qur'an</option>
                  <option value="Kitab Kuning">Kitab Kuning (Turats)</option>
                  <option value="Iktisyaf">Iktisyaf (B. Arab & Inggris)</option>
                  <option value="Enterpreneur">Enterpreneurship</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Sekolah Sebelumnya</label>
                <input 
                  type="text" placeholder="SDN / SMPN / Ponpes..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/5 outline-none font-bold" 
                  value={formData.previousSchool} onChange={e => setFormData({...formData, previousSchool: e.target.value})} 
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivasi Nyantri</label>
                <textarea 
                  rows={2} placeholder="Sampaikan alasan bergabung..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/5 outline-none font-bold resize-none" 
                  value={formData.motivation} onChange={e => setFormData({...formData, motivation: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-50 space-y-8">
            <div className="bg-pesantren-gold/5 p-8 rounded-[2.5rem] border border-pesantren-gold/10 flex items-start gap-4">
              <ShieldAlert className="text-pesantren-gold shrink-0 mt-1" size={20} />
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                Pernyataan: Dengan menekan tombol daftar, saya menyatakan bahwa data yang diisi adalah benar. Saya bersedia mengikuti aturan dan ketentuan yang berlaku di Pondok Pesantren Semar.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-pesantren-green text-white py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-pesantren-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? 'Sedang Memproses...' : <><Save size={20} /> Kirim Pendaftaran Sekarang</>}
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Butuh Bantuan?</p>
        <div className="flex flex-wrap justify-center gap-4">
           <a href="https://wa.me/6285195301987" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-pesantren-dark hover:shadow-lg transition-all">
              <Phone size={18} className="text-pesantren-green" /> Hubungi Panitia
           </a>
        </div>
      </div>
    </div>
  );
}
