import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, writeBatch, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Trash2, Phone, Calendar, User, Users, BookOpen, MapPin, CheckCircle, Clock, CheckCheck, X, Activity, Info, Printer, QrCode, Plus, Save, ShieldAlert, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import { useAdminRole } from '../../hooks/useContent';

interface Registration {
  id: string;
  fullName: string;
  gender: string;
  nik: string;
  nisn: string;
  birthPlace: string;
  birthDate: string;
  bloodType: string;
  height: string;
  weight: string;
  previousSchool: string;
  schoolAddress: string;
  fatherName: string;
  fatherNIK: string;
  fatherEducation: string;
  motherName: string;
  motherNIK: string;
  motherEducation: string;
  parentOccupation: string;
  monthlyIncome: string;
  phoneNumber: string;
  address: string;
  program: string;
  motivation: string;
  registrationFee: string;
  dormitoryFee: string;
  monthlyTuition: string;
  status: string;
  createdAt: any;
}

const EditRegistrationForm = ({ 
  registration, 
  onComplete, 
  onCancel 
}: { 
  registration: Registration, 
  onComplete: () => void, 
  onCancel: () => void 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: registration.fullName || '',
    gender: registration.gender || 'Laki-laki',
    nik: registration.nik || '',
    nisn: registration.nisn || '',
    birthPlace: registration.birthPlace || '',
    birthDate: registration.birthDate || '',
    bloodType: registration.bloodType || '-',
    height: registration.height || '',
    weight: registration.weight || '',
    fatherName: registration.fatherName || '',
    fatherNIK: registration.fatherNIK || '',
    fatherEducation: registration.fatherEducation || 'SMA',
    motherName: registration.motherName || '',
    motherNIK: registration.motherNIK || '',
    motherEducation: registration.motherEducation || 'SMA',
    parentOccupation: registration.parentOccupation || '',
    monthlyIncome: registration.monthlyIncome || 'Rp 1.000.000 - Rp 3.000.000',
    phoneNumber: registration.phoneNumber || '',
    address: registration.address || '',
    previousSchool: registration.previousSchool || '',
    program: registration.program || 'Tahfidz',
    motivation: registration.motivation || '',
    registrationFee: registration.registrationFee || '',
    dormitoryFee: registration.dormitoryFee || '',
    monthlyTuition: registration.monthlyTuition || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'registrations', registration.id), {
        ...formData,
        updatedAt: Timestamp.now()
      });
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'registrations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-pesantren-gold/10 rounded-[2.5rem] p-10 shadow-2xl shadow-pesantren-gold/5 mb-12"
    >
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pesantren-gold text-pesantren-dark rounded-2xl flex items-center justify-center shadow-lg shadow-pesantren-gold/20">
            <Settings size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-pesantren-dark leading-tight">Edit Data Santri</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Perbaharui Informasi Terdaftar</p>
          </div>
        </div>
        <button onClick={onCancel} className="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
         {/* SECTION 1: DATA PRIBADI */}
         <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <User size={18} className="text-pesantren-gold" />
            <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-dark">Data Pribadi Santri</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIK</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NISN</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Laki-laki">Laki-laki (Putra)</option>
                <option value="Perempuan">Perempuan (Putri)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
              <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 2: DATA FISIK & KESEHATAN */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <Activity size={18} className="text-pesantren-gold" />
            <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-dark">Kesehatan & Fisik</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Golongan Darah</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})}>
                <option value="-">- Pilih -</option>
                <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tinggi Badan (cm)</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Berat Badan (kg)</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 3: DATA ORANG TUA */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <ShieldAlert size={18} className="text-blue-500" />
            <h4 className="text-sm font-black uppercase tracking-widest text-blue-500">Data Orang Tua / Wali</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/30 p-6 rounded-3xl space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-2">Informasi Ayah</h5>
              <div className="space-y-4">
                <input type="text" placeholder="Nama Ayah" className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                <input type="text" placeholder="NIK Ayah" className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm" value={formData.fatherNIK} onChange={e => setFormData({...formData, fatherNIK: e.target.value})} />
                <select className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm" value={formData.fatherEducation} onChange={e => setFormData({...formData, fatherEducation: e.target.value})}>
                  <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option><option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option>
                </select>
              </div>
            </div>
            <div className="bg-rose-50/30 p-6 rounded-3xl space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-600 border-b border-rose-100 pb-2">Informasi Ibu</h5>
              <div className="space-y-4">
                <input type="text" placeholder="Nama Ibu" className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-sm" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                <input type="text" placeholder="NIK Ibu" className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-sm" value={formData.motherNIK} onChange={e => setFormData({...formData, motherNIK: e.target.value})} />
                <select className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-sm" value={formData.motherEducation} onChange={e => setFormData({...formData, motherEducation: e.target.value})}>
                  <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option><option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pekerjaan Wali</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.parentOccupation} onChange={e => setFormData({...formData, parentOccupation: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Penghasilan Bulanan</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: e.target.value})}>
                <option value="< Rp 1.000.000">&lt; Rp 1.000.000</option>
                <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
                <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                <option value="> Rp 5.000.000">&gt; Rp 5.000.000</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. WhatsApp</label>
              <input type="tel" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 4: AKADEMIK & PROGRAM */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <BookOpen size={18} className="text-pesantren-dark" />
            <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-dark">Akademik & Program</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Program</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})}>
                <option value="Tahfidz">Tahfidz</option>
                <option value="Kitab Kuning">Kitab Kuning</option>
                <option value="Iktisyaf">Iktisyaf</option>
                <option value="Bahasa Arab">Bahasa Arab</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asal Sekolah</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.previousSchool} onChange={e => setFormData({...formData, previousSchool: e.target.value})} />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
              <textarea rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 5: INFORMASI KEUANGAN */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <Activity size={18} className="text-pesantren-green" />
            <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-green">Rincian Biaya</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biaya Pendaftaran (Rp)</label>
              <input type="text" placeholder="Contoh: 500.000" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.registrationFee} onChange={e => setFormData({...formData, registrationFee: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biaya Kost/Inap (Rp)</label>
              <input type="text" placeholder="Contoh: 300.000" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.dormitoryFee} onChange={e => setFormData({...formData, dormitoryFee: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Syahriyah Bulanan (Rp)</label>
              <input type="text" placeholder="Contoh: 200.000" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.monthlyTuition} onChange={e => setFormData({...formData, monthlyTuition: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-end gap-3 border-t border-gray-100 pt-10">
          <button type="button" onClick={onCancel} className="px-8 py-3 rounded-2xl text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Batal</button>
          <button type="submit" disabled={loading} className="bg-pesantren-dark text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
            <Save size={16} />
            {loading ? 'Menyimpan...' : 'Perbaharui Data'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const ManualRegistrationForm = ({ onComplete, onCancel, forceGender }: { onComplete: () => void, onCancel: () => void, forceGender?: string }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: forceGender === 'putra' ? 'Laki-laki' : (forceGender === 'putri' ? 'Perempuan' : 'Laki-laki'),
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
    schoolAddress: '',
    program: 'Tahfidz',
    motivation: 'Pendaftaran Langsung / Manual',
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
        status: 'Verified',
        createdAt: Timestamp.now()
      });
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-pesantren-green/10 rounded-[2.5rem] p-10 shadow-2xl shadow-pesantren-green/5 mb-12"
    >
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pesantren-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pesantren-green/20">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-pesantren-dark leading-tight">Input Santri Baru</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Standar Input Data Manual Kesantrian</p>
          </div>
        </div>
        <button onClick={onCancel} className="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* SECTION 1: DATA PRIBADI */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <User size={18} className="text-pesantren-green" />
            <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-green">Data Pribadi Santri</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap (Sesuai Ijazah)</label>
              <input type="text" required placeholder="Ahmad Fauzi" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIK (Nomor Induk Kependudukan)</label>
              <input type="text" placeholder="16 Digit" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NISN</label>
              <input type="text" placeholder="Nomor Induk Siswa Nasional" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
              <select disabled={!!forceGender && forceGender !== 'all'} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none disabled:opacity-70" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="Laki-laki">Laki-laki (Putra)</option>
                <option value="Perempuan">Perempuan (Putri)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
              <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
              <input type="date" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 2: DATA FISIK & KESEHATAN */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <Activity size={18} className="text-pesantren-gold" />
            <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-gold">Kesehatan & Fisik</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Golongan Darah</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})}>
                <option value="-">- Pilih -</option>
                <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tinggi Badan (cm)</label>
              <input type="number" placeholder="cm" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Berat Badan (kg)</label>
              <input type="number" placeholder="kg" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 3: DATA ORANG TUA */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <ShieldAlert size={18} className="text-blue-500" />
            <h4 className="text-sm font-black uppercase tracking-widest text-blue-500">Data Orang Tua / Wali</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/30 p-6 rounded-3xl space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-2">Informasi Ayah</h5>
              <div className="space-y-4">
                <input type="text" placeholder="Nama Ayah" className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                <input type="text" placeholder="NIK Ayah" className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm" value={formData.fatherNIK} onChange={e => setFormData({...formData, fatherNIK: e.target.value})} />
                <select className="w-full bg-white border border-blue-100 rounded-xl px-4 py-3 text-sm" value={formData.fatherEducation} onChange={e => setFormData({...formData, fatherEducation: e.target.value})}>
                  <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option><option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option>
                </select>
              </div>
            </div>
            <div className="bg-rose-50/30 p-6 rounded-3xl space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-600 border-b border-rose-100 pb-2">Informasi Ibu</h5>
              <div className="space-y-4">
                <input type="text" placeholder="Nama Ibu" className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-sm" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                <input type="text" placeholder="NIK Ibu" className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-sm" value={formData.motherNIK} onChange={e => setFormData({...formData, motherNIK: e.target.value})} />
                <select className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-sm" value={formData.motherEducation} onChange={e => setFormData({...formData, motherEducation: e.target.value})}>
                  <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option><option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pekerjaan Wali</label>
              <input type="text" placeholder="Contoh: Petani / Guru" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.parentOccupation} onChange={e => setFormData({...formData, parentOccupation: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Penghasilan Bulanan</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: e.target.value})}>
                <option value="< Rp 1.000.000">&lt; Rp 1.000.000</option>
                <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
                <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                <option value="> Rp 5.000.000">&gt; Rp 5.000.000</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. WhatsApp Wali</label>
              <input type="tel" placeholder="08123456789" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 4: AKADEMIK & PROGRAM */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <BookOpen size={18} className="text-pesantren-dark" />
            <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-dark">Akademik & Program</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Program Pilihan</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})}>
                <option value="Tahfidz">Tahfidz</option>
                <option value="Kitab Kuning">Kitab Kuning</option>
                <option value="Iktisyaf">Iktisyaf</option>
                <option value="Bahasa Arab">Bahasa Arab</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asal Sekolah</label>
              <input type="text" placeholder="Nama Sekolah Sebelumnya" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.previousSchool} onChange={e => setFormData({...formData, previousSchool: e.target.value})} />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Domisili Sekarang</label>
              <textarea required rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SECTION 5: INFORMASI KEUANGAN */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <Activity size={18} className="text-pesantren-green" />
            <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-green">Informasi Keuangan</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biaya Daftar (Rp)</label>
              <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.registrationFee} onChange={e => setFormData({...formData, registrationFee: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biaya Kost (Rp)</label>
              <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.dormitoryFee} onChange={e => setFormData({...formData, dormitoryFee: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Syahriyah (Rp)</label>
              <input type="text" placeholder="0" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.monthlyTuition} onChange={e => setFormData({...formData, monthlyTuition: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-end gap-3 border-t border-gray-100 pt-10">
          <button type="button" onClick={onCancel} className="px-8 py-3 rounded-2xl text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Batal</button>
          <button type="submit" disabled={loading} className="bg-pesantren-green text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-pesantren-green/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
            <Save size={16} />
            {loading ? 'Memproses...' : 'Simpan Data Santri'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const PrintableRegistration = React.forwardRef<HTMLDivElement, { reg: Registration }>((props, ref) => {
  const { reg } = props;
  return (
    <div ref={ref} className="p-16 bg-white text-pesantren-dark font-serif min-h-[1000px] relative">
      {/* Header Kop Surat */}
      <div className="flex items-center gap-8 border-b-4 border-pesantren-dark pb-8 mb-12">
        <div className="w-24 h-24 bg-pesantren-green rounded-3xl flex items-center justify-center text-white shrink-0">
          <User size={48} />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-black uppercase tracking-tight text-pesantren-green">Pondok Pesantren Semar</h1>
          <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">Lembaga Pendidikan Kader Qur'ani & Enterpreneur</p>
          <p className="text-xs mt-2 italic">Jl. Darussalam Dsn Dulat Ragang Waru Pamekasan 69353. Jawa Timur</p>
          <p className="text-xs">WA: 085195301987 | Email: pondokpesantrensemar@gmail.com</p>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold uppercase underline tracking-widest decoration-pesantren-gold underline-offset-8">Formulir Pendaftaran Santri Baru</h2>
        <p className="text-sm mt-4 font-bold text-pesantren-green italic">KARTU DATA PENDAFTARAN SANTRI</p>
      </div>

      <div className="grid grid-cols-12 gap-8 mb-16">
        <div className="col-span-8 space-y-6">
          <div className="grid grid-cols-[150px_20px_1fr] gap-y-2 border-l-2 border-pesantren-gold pl-6">
            <div className="text-[10px] uppercase font-bold text-gray-400">ID Pendaftaran</div>
            <div className="text-xs font-bold">: {reg.id}</div>
            
            <div className="text-[10px] uppercase font-bold text-gray-400">Nama Lengkap</div>
            <div className="text-xs font-bold uppercase">: {reg.fullName}</div>
            
            <div className="text-[10px] uppercase font-bold text-gray-400">NIK / NISN</div>
            <div className="text-xs font-bold">: {reg.nik || '-'} / {reg.nisn || '-'}</div>
            
            <div className="text-[10px] uppercase font-bold text-gray-400">TTL</div>
            <div className="text-xs font-bold">: {reg.birthPlace}, {reg.birthDate}</div>

            <div className="text-[10px] uppercase font-bold text-gray-400">Gol. Darah / Berat / Tinggi</div>
            <div className="text-xs font-bold">: {reg.bloodType || '-'} / {reg.weight || '-'} kg / {reg.height || '-'} cm</div>

            <div className="text-[10px] uppercase font-bold text-gray-400">Jenis Kelamin</div>
            <div className="text-xs font-bold">: {reg.gender}</div>
            
            <div className="text-[10px] uppercase font-bold text-gray-400">Program</div>
            <div className="text-xs font-bold text-pesantren-green">: {reg.program}</div>

            <div className="text-[10px] uppercase font-bold text-gray-400 mt-4">Nama Ayah</div>
            <div className="text-xs font-bold mt-4 uppercase">: {reg.fatherName}</div>

            <div className="text-[10px] uppercase font-bold text-gray-400">Nama Ibu</div>
            <div className="text-xs font-bold uppercase">: {reg.motherName}</div>
            
            <div className="text-[10px] uppercase font-bold text-gray-400">Pekerjaan / Penghasilan</div>
            <div className="text-xs font-bold text-neutral-600">: {reg.parentOccupation} ({reg.monthlyIncome})</div>

            <div className="text-[10px] uppercase font-bold text-gray-400 mt-4">Alamat Domisili</div>
            <div className="text-[11px] font-bold mt-4 leading-relaxed">: {reg.address}</div>

            <div className="text-[10px] uppercase font-bold text-gray-400">No. WhatsApp</div>
            <div className="text-xs font-bold">: {reg.phoneNumber}</div>

            <div className="text-[10px] uppercase font-bold text-pesantren-green mt-4">Pendaftaran</div>
            <div className="text-xs font-bold mt-4">: Rp {reg.registrationFee || '0'}</div>

            <div className="text-[10px] uppercase font-bold text-pesantren-green">Biaya Kost</div>
            <div className="text-xs font-bold">: Rp {reg.dormitoryFee || '0'}</div>

            <div className="text-[10px] uppercase font-bold text-pesantren-green">Syahriyah</div>
            <div className="text-xs font-bold">: Rp {reg.monthlyTuition || '0'}</div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col items-center">
          <div className="w-full aspect-[3/4] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden bg-gray-50">
             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center px-4">Tempel Foto<br/>3 x 4</span>
          </div>
          
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
            <QRCodeSVG value={reg.id} size={80} level="H" />
          </div>

          <div className="border border-pesantren-border p-4 rounded-3xl text-center w-full space-y-4">
            <div className="w-10 h-10 bg-pesantren-green/10 text-pesantren-green rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <div className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${reg.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {reg.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end pt-8 border-t border-gray-100">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dicetak Pada:</p>
          <p className="text-xs font-bold">{new Date().toLocaleString('id-ID')}</p>
        </div>
        <div className="text-center space-y-20">
          <p className="text-xs font-bold uppercase tracking-widest">Petugas Pendaftaran</p>
          <div className="w-48 h-px bg-pesantren-dark" />
          <p className="text-[10px] italic text-gray-400">(Tanda tangan & Stempel Basah)</p>
        </div>
      </div>
    </div>
  );
});

PrintableRegistration.displayName = 'PrintableRegistration';

const StudentIDCard = React.forwardRef<HTMLDivElement, { reg: Registration }>((props, ref) => {
  const { reg } = props;
  return (
    <div ref={ref} className="p-8 bg-white flex justify-center items-center">
      {/* Front of ID Card */}
      <div className="w-[85.6mm] h-[53.98mm] border-2 border-pesantren-dark rounded-[1rem] overflow-hidden relative shadow-lg bg-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
        {/* Top Header */}
        <div className="bg-pesantren-dark text-white p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-pesantren-gold rounded-lg flex items-center justify-center shrink-0">
            <User size={16} className="text-pesantren-dark" />
          </div>
          <div className="leading-none">
            <h5 className="text-[10px] font-black uppercase tracking-tight">Kartu Santri</h5>
            <p className="text-[6px] font-bold text-pesantren-gold uppercase tracking-widest mt-1">PP. SEMAR PAMEKASAN</p>
          </div>
        </div>

        <div className="p-3 flex gap-4 h-[calc(100%-48px)]">
          {/* Photo area */}
          <div className="w-20 bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shrink-0">
             <User size={40} className="text-gray-300" />
             <div className="absolute inset-x-0 bottom-0 bg-pesantren-dark/10 h-1" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-black uppercase tracking-tight text-pesantren-dark truncate">{reg.fullName}</h4>
            <p className="text-[7px] font-bold text-pesantren-green uppercase tracking-widest border-b border-gray-100 pb-1 mb-2">{reg.program}</p>
            
            <div className="grid grid-cols-[30px_1fr] gap-x-1 gap-y-0.5 text-[7px]">
              <span className="font-bold text-gray-400">ID</span>
              <span className="font-black text-pesantren-dark truncate">: {reg.id}</span>
              
              <span className="font-bold text-gray-400">TTL</span>
              <span className="font-bold text-pesantren-dark truncate">: {reg.birthPlace}, {reg.birthDate}</span>
              
              <span className="font-bold text-gray-400">JK</span>
              <span className="font-bold text-pesantren-dark">: {reg.gender}</span>

              <span className="font-bold text-gray-400">WALI</span>
              <span className="font-bold text-pesantren-dark truncate">: {reg.fatherName || reg.motherName}</span>
            </div>
            
            {/* Barcode area */}
            <div className="mt-2 scale-[0.6] origin-left -ml-2">
              <Barcode 
                value={reg.id} 
                width={1.5} 
                height={20} 
                fontSize={8}
                background="transparent"
                lineColor="#1D1D1D"
              />
            </div>
          </div>
        </div>

        {/* Vertical text on right */}
        <div className="absolute top-12 right-1 flex items-center gap-1 origin-right rotate-90 translate-y-8">
           <div className="h-1 w-8 bg-pesantren-gold rounded-full" />
           <p className="text-[5px] font-black uppercase tracking-[0.3em] text-gray-300">Identity Card</p>
        </div>
      </div>
    </div>
  );
});

StudentIDCard.displayName = 'StudentIDCard';

export default function RegistrationManager() {
  const { role, loading: roleLoading } = useAdminRole();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [filterGender, setFilterGender] = useState<string>('all');
  
  const componentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Pendaftaran_${selectedReg?.fullName || 'Santri'}`,
  });

  const handlePrintCard = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `KARTU_SANTRI_${selectedReg?.fullName || 'Santri'}`,
  });

  const path = 'registrations';

  const fetchRegistrations = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Registration));
      
      // Role based filtering from Firestore results
      if (role === 'putra') {
        data = data.filter(r => r.gender === 'Laki-laki');
      } else if (role === 'putri') {
        data = data.filter(r => r.gender === 'Perempuan');
      }

      setRegistrations(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    if (!roleLoading) {
      if (role === 'putra') setFilterGender('Laki-laki');
      else if (role === 'putri') setFilterGender('Perempuan');
      fetchRegistrations(); 
    }
  }, [role, roleLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data pendaftaran ini?')) return;
    try {
      await deleteDoc(doc(db, path, id));
      fetchRegistrations();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, path, id), { status: newStatus });
      fetchRegistrations();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleVerifyAll = async () => {
    const pending = registrations.filter(r => r.status !== 'Verified');
    if (pending.length === 0) {
      alert('Tidak ada pendaftar pending untuk diverifikasi.');
      return;
    }

    if (!confirm(`Verifikasi ${pending.length} pendaftar sekaligus?`)) return;

    setBatchLoading(true);
    try {
      const batch = writeBatch(db);
      pending.forEach(reg => {
        const docRef = doc(db, path, reg.id);
        batch.update(docRef, { status: 'Verified' });
      });
      await batch.commit();
      fetchRegistrations();
      alert('Semua pendaftar berhasil diverifikasi!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setBatchLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-pesantren-green/20 border-t-pesantren-green rounded-full animate-spin"></div>
      <p className="text-gray-400 italic">Memuat data pendaftaran...</p>
    </div>
  );

  const countPutra = registrations.filter(r => r.gender === 'Laki-laki').length;
  const countPutri = registrations.filter(r => r.gender === 'Perempuan').length;

  return (
    <div className="space-y-10">
      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-pesantren-dark text-pesantren-gold rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
             <Users size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Terdaftar</p>
            <p className="text-4xl font-serif font-black text-pesantren-dark leading-none">{registrations.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border-b-8 border-b-blue-600 border border-gray-50 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
             <User size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 font-bold">Unit Putra</p>
            <p className="text-4xl font-serif font-black text-pesantren-dark leading-none">{countPutra}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border-b-8 border-b-rose-500 border border-gray-50 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
             <User size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1 font-bold">Unit Putri</p>
            <p className="text-4xl font-serif font-black text-pesantren-dark leading-none">{countPutri}</p>
          </div>
        </div>
      </div>

      {/* Hidden Printable Component */}
      <div className="hidden">
        {selectedReg && <PrintableRegistration ref={componentRef} reg={selectedReg} />}
        {selectedReg && <StudentIDCard ref={cardRef} reg={selectedReg} />}
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex flex-wrap p-1.5 gap-2">
          {[
            { id: 'all', label: 'Semua Santri', color: 'bg-pesantren-dark', text: 'text-white' },
            { id: 'Laki-laki', label: 'Unit Putra', color: 'bg-blue-600', text: 'text-white' },
            { id: 'Perempuan', label: 'Unit Putri', color: 'bg-rose-600', text: 'text-white' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterGender(tab.id)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterGender === tab.id 
                  ? `${tab.color} ${tab.text} shadow-xl scale-105` 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto px-4 pb-4 xl:pb-0">
          <button
            onClick={() => setShowManualForm(true)}
            className="flex-1 xl:flex-none bg-pesantren-green text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-pesantren-green/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18} />
            Input Data Manual
          </button>

          <button
            onClick={() => fetchRegistrations(true)}
            disabled={refreshing}
            className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-pesantren-green hover:bg-white border border-transparent hover:border-gray-100 transition-all disabled:opacity-50"
          >
            <Clock size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      {registrations.some(r => r.status !== 'Verified' && (filterGender === 'all' || r.gender === filterGender)) && (
        <div className="flex justify-end px-4">
          <button
            onClick={handleVerifyAll}
            disabled={batchLoading}
            className="bg-pesantren-green text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-pesantren-green/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            <CheckCheck size={18} />
            {batchLoading ? 'Memproses...' : 'Verifikasi Semua Terpilih'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {showManualForm && (
          <ManualRegistrationForm 
            forceGender={role || 'all'}
            onComplete={() => {
              setShowManualForm(false);
              fetchRegistrations();
            }}
            onCancel={() => setShowManualForm(false)}
          />
        )}
        {editingReg && (
          <EditRegistrationForm 
            registration={editingReg}
            onComplete={() => {
              setEditingReg(null);
              fetchRegistrations();
            }}
            onCancel={() => setEditingReg(null)}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {registrations
          .filter(reg => filterGender === 'all' || reg.gender === filterGender)
          .map((reg) => {
          const isVerified = reg.status === 'Verified';
          return (
            <motion.div 
              key={reg.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white border rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${
                reg.gender === 'Laki-laki' 
                  ? 'border-blue-100 border-l-[12px] border-l-blue-600' 
                  : 'border-rose-100 border-l-[12px] border-l-rose-500'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-24 h-24 rounded-3xl shrink-0 flex items-center justify-center text-3xl font-serif font-black shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform">
                   <div className={`absolute inset-0 opacity-10 ${reg.gender === 'Laki-laki' ? 'bg-blue-600' : 'bg-rose-500'}`} />
                   <span className={`${reg.gender === 'Laki-laki' ? 'text-blue-600' : 'text-rose-500'}`}>{reg.fullName.charAt(0)}</span>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          reg.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-500'
                        }`}>
                          {reg.gender === 'Laki-laki' ? 'Unit Putra' : 'Unit Putri'}
                        </span>
                        <span className="text-[10px] text-gray-300 font-mono">ID: {reg.id}</span>
                      </div>
                      <h4 className="text-3xl font-serif font-bold text-pesantren-dark group-hover:text-pesantren-gold transition-colors">{reg.fullName}</h4>
                      <p className="text-sm font-serif italic text-pesantren-green flex items-center gap-2 mt-1">
                        <BookOpen size={14} /> {reg.program}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => setEditingReg(reg)}
                        className="bg-gray-50 text-gray-400 p-3 rounded-2xl hover:bg-pesantren-gold hover:text-pesantren-dark transition-all"
                        title="Edit Data"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedReg(reg);
                          setTimeout(() => handlePrintCard(), 100);
                        }}
                        className="bg-gray-50 text-gray-400 p-3 rounded-2xl hover:bg-pesantren-green hover:text-white transition-all"
                        title="Print Kartu Santri"
                      >
                        <QrCode size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedReg(reg);
                          setTimeout(() => handlePrint(), 100);
                        }}
                        className="bg-gray-50 text-gray-400 p-3 rounded-2xl hover:bg-pesantren-dark hover:text-white transition-all"
                        title="Print Form"
                      >
                        <Printer size={18} />
                      </button>
                      {isVerified ? (
                        <span className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle size={14} /> Terverifikasi
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <Clock size={14} /> Menunggu
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2 text-gray-500">
                      <p className="flex items-center gap-3"><User size={16} className="text-gray-300" /> Wali: <strong>{reg.parentName || reg.fatherName}</strong></p>
                      <p className="flex items-center gap-3">
                        <Phone size={16} className="text-gray-300" /> 
                        <a href={`https://wa.me/${reg.phoneNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-pesantren-green underline font-bold">
                          {reg.phoneNumber}
                        </a>
                      </p>
                    </div>
                    <div className="space-y-2 text-gray-500">
                      <p className="flex items-center gap-3"><Calendar size={16} className="text-gray-300" /> Tgl Lahir: {reg.birthDate}</p>
                      <p className="flex items-center gap-3 truncate w-full"><MapPin size={16} className="text-gray-300 flex-shrink-0" /> {reg.address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col justify-end gap-3 pt-4 lg:pt-0 lg:border-l lg:pl-8 border-gray-100">
                  <button 
                    onClick={() => {
                      setSelectedReg(reg);
                      setShowModal(true);
                    }}
                    className="flex-1 lg:flex-none border border-pesantren-green/20 text-pesantren-green px-4 py-2 rounded-xl text-xs font-bold hover:bg-pesantren-green hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Info size={14} />
                    Lihat Detail
                  </button>
                  {reg.status !== 'Verified' && (
                    <button 
                      onClick={() => handleUpdateStatus(reg.id, 'Verified')}
                      className="flex-1 lg:flex-none bg-pesantren-green text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-pesantren-green/90 transition-colors"
                    >
                      Verifikasi
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(reg.id)}
                    className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {registrations.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
             <p className="text-gray-400 italic">Belum ada data pendaftaran.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && selectedReg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-pesantren-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-pesantren-dark text-white p-10 relative">
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-pesantren-gold rounded-2xl flex items-center justify-center text-pesantren-dark">
                    <User size={24} strokeWidth={2.5} />
                  </div>
                  {selectedReg.status === 'Verified' ? (
                    <span className="bg-pesantren-green text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Terverifikasi</span>
                  ) : (
                    <span className="bg-pesantren-gold text-pesantren-dark px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending</span>
                  )}
                </div>
                <h3 className="text-3xl font-serif font-bold leading-tight">{selectedReg.fullName}</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">ID Pendaftaran: {selectedReg.id}</p>
                <div className="mt-6 bg-white p-4 rounded-2xl inline-block shadow-xl">
                   <QRCodeSVG 
                    value={selectedReg.id} 
                    size={64}
                    level="M"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-10 space-y-10 custom-scrollbar max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Biodata Section */}
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Identitas Santri</p>
                        <p className="text-sm font-bold text-pesantren-dark uppercase">{selectedReg.fullName}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-tighter">NIK: {selectedReg.nik || "-"}</p>
                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter">NISN: {selectedReg.nisn || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">TTL & Gender</p>
                        <p className="text-sm font-bold text-pesantren-dark">
                          {selectedReg.birthPlace}, {selectedReg.birthDate} ({selectedReg.gender})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 shrink-0">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Fisik & Kesehatan</p>
                        <div className="grid grid-cols-3 gap-4 mt-1">
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase">Gol. Darah</p>
                            <p className="text-xs font-bold">{selectedReg.bloodType || "-"}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase">Tinggi</p>
                            <p className="text-xs font-bold">{selectedReg.height || "-"} cm</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase">Berat</p>
                            <p className="text-xs font-bold">{selectedReg.weight || "-"} kg</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Program & Sekolah Asal</p>
                        <p className="text-sm font-bold text-pesantren-green">{selectedReg.program}</p>
                        <p className="text-xs text-gray-500 font-medium">{selectedReg.previousSchool || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 shrink-0">
                        <ShieldAlert size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Data Orang Tua / Wali</p>
                        <div className="space-y-3 mt-1">
                          <div className="bg-blue-50/50 p-3 rounded-xl">
                            <p className="text-[9px] font-bold text-blue-400 uppercase">Ayah</p>
                            <p className="text-xs font-black text-blue-900">{selectedReg.fatherName || "-"}</p>
                            <p className="text-[10px] text-blue-700/50">Pendidikan: {selectedReg.fatherEducation || "-"}</p>
                          </div>
                          <div className="bg-rose-50/50 p-3 rounded-xl">
                            <p className="text-[9px] font-bold text-rose-400 uppercase">Ibu</p>
                            <p className="text-xs font-black text-rose-900">{selectedReg.motherName || "-"}</p>
                            <p className="text-[10px] text-rose-700/50">Pendidikan: {selectedReg.motherEducation || "-"}</p>
                          </div>
                          <div className="pt-1">
                            <p className="text-[9px] text-gray-400 uppercase">Pekerjaan & Penghasilan</p>
                            <p className="text-xs font-bold text-gray-700">{selectedReg.parentOccupation || "-"} ({selectedReg.monthlyIncome || "-"})</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Kontak Wali</p>
                        <a 
                          href={`https://wa.me/${selectedReg.phoneNumber.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm font-bold text-pesantren-green hover:underline flex items-center gap-2"
                        >
                          {selectedReg.phoneNumber}
                          <Activity size={14} />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400 shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Alamat Domisili</p>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic">"{selectedReg.address}"</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedReg.motivation && (
                  <div className="bg-pesantren-cream p-6 rounded-2xl border border-pesantren-border">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Motivasi</p>
                    <p className="text-xs italic text-gray-600 leading-relaxed">"{selectedReg.motivation}"</p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {selectedReg.status !== 'Verified' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedReg.id, 'Verified');
                          setShowModal(false);
                        }}
                        className="bg-pesantren-green text-white px-8 py-4 rounded-2xl text-xs font-bold hover:scale-105 transition-all shadow-xl shadow-pesantren-green/20"
                      >
                        Verifikasi Santri
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingReg(selectedReg);
                        setShowModal(false);
                      }}
                      className="bg-pesantren-gold text-pesantren-dark px-8 py-4 rounded-2xl text-xs font-bold hover:scale-105 transition-all shadow-xl shadow-pesantren-gold/20 flex items-center gap-2"
                    >
                      <Settings size={16} /> Edit Data
                    </button>
                    <button
                      onClick={() => handlePrint()}
                      className="bg-pesantren-dark text-white px-8 py-4 rounded-2xl text-xs font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                    >
                      <Printer size={16} /> Form
                    </button>
                    <button
                      onClick={() => handlePrintCard()}
                      className="bg-pesantren-green text-white px-8 py-4 rounded-2xl text-xs font-bold hover:scale-105 transition-all shadow-xl shadow-pesantren-green/20 flex items-center gap-2"
                    >
                      <QrCode size={16} /> Kartu Santri
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedReg.id);
                        setShowModal(false);
                      }}
                      className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
