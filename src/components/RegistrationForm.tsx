import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { User, Phone, MapPin, Calendar, BookOpen, Send, CheckCircle2, Printer, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';

interface RegistrationData extends RegistrationFields {
  id: string;
  status: string;
}

interface RegistrationFields {
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
}

const PrintableRegistration = React.forwardRef<HTMLDivElement, { reg: RegistrationData }>((props, ref) => {
  const { reg } = props;
  return (
    <div ref={ref} className="p-16 bg-white text-pesantren-dark font-serif min-h-[1000px] relative">
      <div className="flex items-center gap-8 border-b-4 border-pesantren-dark pb-8 mb-12">
        <div className="w-24 h-24 bg-pesantren-green rounded-3xl flex items-center justify-center text-white shrink-0">
          <User size={48} />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-black uppercase tracking-tight text-pesantren-green">Pondok Pesantren Semar</h1>
          <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">Lembaga Pendidikan Kader Qur'ani & Enterpreneur</p>
          <p className="text-xs mt-2 italic">Jl. Darussalam Dsn Dulat Ragang Waru Pamekasan 69353. Jawa Timur</p>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold uppercase underline tracking-widest decoration-pesantren-gold underline-offset-8">Bukti Pendaftaran Santri Baru</h2>
        <p className="text-sm mt-4 font-bold text-pesantren-green italic">SIMPAN BUKTI INI UNTUK PROSES SELEKSI</p>
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

            <div className="text-[10px] uppercase font-bold text-gray-400">Jenis Kelamin</div>
            <div className="text-xs font-bold">: {reg.gender}</div>
            
            <div className="text-[10px] uppercase font-bold text-gray-400">Program</div>
            <div className="text-xs font-bold text-pesantren-green">: {reg.program}</div>

            <div className="text-[10px] uppercase font-bold text-gray-400 mt-4">Orang Tua (Ayah)</div>
            <div className="text-xs font-bold mt-4 uppercase">: {reg.fatherName}</div>
            
            <div className="text-[10px] uppercase font-bold text-gray-400">Pekerjaan</div>
            <div className="text-xs font-bold">: {reg.parentOccupation}</div>

            <div className="text-[10px] uppercase font-bold text-gray-400">No. WhatsApp</div>
            <div className="text-xs font-bold">: {reg.phoneNumber}</div>

            <div className="text-[10px] uppercase font-bold text-pesantren-green mt-4">Estimasi Biaya</div>
            <div className="text-xs font-bold mt-4">: Registrasi: Rp {reg.registrationFee || '0'} | Kost: Rp {reg.dormitoryFee || '0'} | Syahriyah: Rp {reg.monthlyTuition || '0'}</div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col items-center">
          <div className="w-full aspect-[3/4] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden bg-gray-50">
             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center px-4">Tempel Foto<br/>3 x 4</span>
          </div>
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <QRCodeSVG value={reg.id} size={80} level="H" />
          </div>
        </div>
      </div>
      
      <div className="mt-20 p-8 border-2 border-dashed border-gray-100 rounded-3xl text-sm italic text-gray-500">
        Silakan bawa bukti cetak ini saat melakukan tes seleksi di Pondok Pesantren Semar. Informasi waktu seleksi akan dikirimkan melalui WhatsApp ke nomor yang terdaftar.
      </div>

      <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end pt-8 border-t border-gray-100">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dicetak Pada:</p>
          <p className="text-xs font-bold">{new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
});

PrintableRegistration.displayName = 'PrintableRegistration';

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedData, setSubmittedData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegistrationFields>({
    fullName: '',
    gender: 'Laki-laki',
    nik: '',
    nisn: '',
    birthPlace: '',
    birthDate: '',
    bloodType: '-',
    height: '',
    weight: '',
    previousSchool: '',
    schoolAddress: '',
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
    program: 'Tahfidz',
    motivation: '',
    registrationFee: '',
    dormitoryFee: '',
    monthlyTuition: '',
  });

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Bukti_Daftar_${submittedData?.fullName || 'Santri'}`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    const path = 'registrations';
    
    // Standard basic validation
    if (!formData.fullName || !formData.phoneNumber || !formData.address || !formData.birthDate) {
      alert("Mohon lengkapi data wajib (Nama, No HP, Alamat, Tgl Lahir).");
      setLoading(false);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, path), {
        ...formData,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      
      setSubmittedData({
        id: docRef.id,
        status: 'Pending',
        ...formData
      });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, path);
      setErrorMessage("Gagal mengirim data. Silakan coba lagi.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-pesantren-cream flex items-center justify-center p-6">
        <div className="hidden">
          <PrintableRegistration ref={componentRef} reg={submittedData} />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 lg:p-14 rounded-[3rem] shadow-2xl text-center max-w-xl w-full border border-pesantren-border overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-pesantren-green" />
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="text-pesantren-green" size={56} />
          </div>
          <h2 className="text-4xl font-serif font-bold text-pesantren-dark mb-6">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 mb-10 italic text-sm leading-relaxed">
            Terima kasih, <strong>{submittedData.fullName}</strong>. Data Anda telah kami terima dengan ID: <span className="font-mono font-bold text-pesantren-green bg-pesantren-cream px-2 py-1 rounded">{submittedData.id}</span>. <br/><br/>
            Tim admin akan segera menghubungi Anda melalui nomor WhatsApp <strong>{submittedData.phoneNumber}</strong> untuk proses seleksi selanjutnya.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => handlePrint()}
              className="w-full bg-pesantren-dark text-white py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
            >
              <Printer size={20} /> Cetak Bukti Daftar
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-pesantren-cream text-pesantren-green py-5 rounded-2xl font-bold border border-pesantren-border hover:bg-white transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
          
          <div className="mt-10 flex flex-col items-center gap-2">
             <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                <QRCodeSVG 
                  value={submittedData.id} 
                  size={48}
                  level="M"
                />
             </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Pondok Pesantren Semar</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pesantren-cream py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-pesantren-green italic mb-2">Form Pendaftaran.</h2>
            <p className="text-gray-500 font-serif italic text-sm">Silakan lengkapi formulir di bawah ini dengan data yang sebenar-benarnya.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-pesantren-dark font-bold border-2 border-pesantren-dark/10 px-6 py-3 rounded-full hover:bg-pesantren-dark hover:text-white transition-all text-xs uppercase tracking-widest"
          >
            <CheckCircle2 size={16} className="rotate-180" /> Kembali ke Web
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-pesantren-border relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pesantren-gold/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="flex justify-between items-center mb-10 px-2 overflow-x-auto">
             {[
               { step: 1, title: 'Data Diri' },
               { step: 2, title: 'Orang Tua' },
               { step: 3, title: 'Program' }
             ].map((s) => (
               <div key={s.step} className="flex flex-col items-center gap-2 min-w-[80px]">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                   currentStep >= s.step ? 'bg-pesantren-green text-white shadow-lg shadow-pesantren-green/20' : 'bg-gray-100 text-gray-400'
                 }`}>
                   {s.step}
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${
                   currentStep >= s.step ? 'text-pesantren-green' : 'text-gray-300'
                 }`}>{s.title}</span>
               </div>
             ))}
             <div className="absolute top-[52px] left-8 right-8 h-[1px] bg-gray-100 -z-10 hidden md:block">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(currentStep - 1) * 50}%` }}
                 className="h-full bg-pesantren-green"
               />
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl text-sm font-bold italic mb-6"
                >
                  {errorMessage}
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div 
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <h3 className="text-pesantren-green font-serif font-bold text-xl border-l-4 border-pesantren-gold pl-4 italic">Identitas Calon Santri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nama Lengkap</label>
                        <input type="text" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Jenis Kelamin</label>
                        <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                          <option>Laki-laki</option>
                          <option>Perempuan</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">NIK (Sesuai KK)</label>
                        <input type="text" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">NISN (Jika Ada)</label>
                        <input type="text" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.nisn} onChange={e => setFormData({ ...formData, nisn: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tempat Lahir</label>
                        <input type="text" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.birthPlace} onChange={e => setFormData({ ...formData, birthPlace: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tanggal Lahir</label>
                        <input type="date" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-3 gap-4 md:col-span-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Gol. Darah</label>
                          <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })}>
                            <option>-</option><option>A</option><option>B</option><option>AB</option><option>O</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">TB (cm)</label>
                          <input type="number" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">BB (kg)</label>
                          <input type="number" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Asal Sekolah</label>
                        <input type="text" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.previousSchool} onChange={e => setFormData({ ...formData, previousSchool: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => setCurrentStep(2)} className="bg-pesantren-dark text-white px-10 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                      Selanjutnya <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div 
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <h3 className="text-pesantren-green font-serif font-bold text-xl border-l-4 border-pesantren-gold pl-4 italic">Data Orang Tua / Wali</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nama Lengkap Ayah</label>
                        <input type="text" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pendidikan Ayah</label>
                        <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.fatherEducation} onChange={e => setFormData({ ...formData, fatherEducation: e.target.value })}>
                          <option>Tidak Sekolah</option><option>SD/MI</option><option>SMP/MTs</option><option>SMA/MA</option><option>S1</option><option>S2/S3</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nama Lengkap Ibu</label>
                        <input type="text" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pendidikan Ibu</label>
                        <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.motherEducation} onChange={e => setFormData({ ...formData, motherEducation: e.target.value })}>
                          <option>Tidak Sekolah</option><option>SD/MI</option><option>SMP/MTs</option><option>SMA/MA</option><option>S1</option><option>S2/S3</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pekerjaan Wali</label>
                        <input type="text" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.parentOccupation} onChange={e => setFormData({ ...formData, parentOccupation: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Penghasilan Rata-rata</label>
                        <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.monthlyIncome} onChange={e => setFormData({ ...formData, monthlyIncome: e.target.value })}>
                          <option>&lt; Rp 1.000.000</option><option>Rp 1.000.000 - Rp 3.000.000</option><option>Rp 3.000.000 - Rp 5.000.000</option><option>&gt; Rp 5.000.000</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nomor WhatsApp Aktif</label>
                        <input type="tel" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Alamat Lengkap Sesuai KK</label>
                        <textarea required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none h-32 resize-none" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-gray-400 font-bold px-6 py-4 hover:text-pesantren-dark transition-all">
                      Kembali
                    </button>
                    <button type="button" onClick={() => setCurrentStep(3)} className="bg-pesantren-dark text-white px-10 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                      Selanjutnya <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div 
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <h3 className="text-pesantren-green font-serif font-bold text-xl border-l-4 border-pesantren-gold pl-4 italic">Program & Motivasi</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Program yang Diminati</label>
                        <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })}>
                          <option>Tahfidz</option>
                          <option>Kitab Kuning</option>
                          <option>Iktisyaf</option>
                          <option>Bahasa Arab</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Motivasi Masuk Pesantren</label>
                        <textarea placeholder="Ceritakan tujuan Anda mondok..." className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none h-40 resize-none" value={formData.motivation} onChange={e => setFormData({ ...formData, motivation: e.target.value })} />
                      </div>

                      <div className="bg-pesantren-cream p-8 rounded-3xl space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-pesantren-green border-b border-pesantren-border pb-3 flex items-center gap-2">
                          <CheckCircle2 size={16} /> Rencana Pembiayaan
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Biaya Daftar (Rp)</label>
                            <input type="text" placeholder="0" className="w-full bg-white border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.registrationFee} onChange={e => setFormData({ ...formData, registrationFee: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Biaya Kost (Rp)</label>
                            <input type="text" placeholder="0" className="w-full bg-white border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.dormitoryFee} onChange={e => setFormData({ ...formData, dormitoryFee: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syahriyah (Rp)</label>
                            <input type="text" placeholder="0" className="w-full bg-white border border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none" value={formData.monthlyTuition} onChange={e => setFormData({ ...formData, monthlyTuition: e.target.value })} />
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-400 italic">Isi dengan besaran biaya yang direncanakan atau biarkan kosong jika belum tahu.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <button type="button" onClick={() => setCurrentStep(2)} className="text-gray-400 font-bold px-6 py-4 hover:text-pesantren-dark transition-all">
                      Kembali
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-pesantren-green text-white px-12 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <> <Send size={20} /> Kirim Pendaftaran </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        <p className="text-center text-gray-400 mt-8 text-sm italic font-serif">
          * Data pendaftaran akan dijaga kerahasiaannya dan hanya digunakan untuk kepentingan internal pesantren.
        </p>
      </div>
    </div>
  );
}
