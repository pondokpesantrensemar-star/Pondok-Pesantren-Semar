import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { internalAuth } from '../../lib/internalAuth';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { Trash2, Calendar, User, FileText, X, Printer, Plus, Save, ShieldAlert, Heart, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReactToPrint } from 'react-to-print';
import { useAdminRole } from '../../hooks/useContent';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  gender: string;
}

interface Permit {
  id: string;
  studentName: string;
  gender: string;
  type: 'Izin Pulang' | 'Sakit' | 'Kunjungan';
  reason: string;
  startDate: string;
  endDate?: string;
  status: string;
  createdAt: any;
  authorizedBy: string;
}

const SinglePermitLayout = ({ permit }: { permit: Permit }) => {
  const dateStr = permit.createdAt?.toDate ? permit.createdAt.toDate().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : new Date().toLocaleDateString('id-ID');

  return (
    <div className="h-[148.5mm] p-8 flex flex-col bg-white overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-4 border-b-2 border-pesantren-dark pb-3 mb-4">
        <div className="w-16 h-16 bg-pesantren-dark rounded-full flex items-center justify-center p-1 shrink-0">
            <span className="text-white font-serif font-black text-lg text-center leading-none">PS</span>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-black uppercase tracking-tighter text-pesantren-dark leading-tight">Pondok Pesantren Semar</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-pesantren-green">Lembaga Pendidikan & Dakwah Islamiyyah</p>
          <p className="text-[8px] italic text-gray-500">Jl. Raya Pesantren No. 01, Kec. Semar, Kab. Jawa Tengah</p>
        </div>
      </div>

      {/* Content */}
      <div className="text-center mb-4">
        <h2 className="text-sm font-bold uppercase underline decoration-1 underline-offset-2">SURAT IZIN SANTRI</h2>
        <p className="text-[10px] mt-0.5 font-mono">Nomor: {permit.id.slice(0, 8).toUpperCase()}/P-SM/{new Date().getFullYear()}</p>
      </div>

      <div className="space-y-3 text-[11px] leading-snug flex-1">
        <p>Pengurus Kesantrian Pondok Pesantren Semar memberikan izin kepada:</p>
        
        <div className="grid grid-cols-[100px_10px_1fr] gap-y-1.5 px-4 font-medium">
          <div>Nama Santri</div>
          <div>:</div>
          <div className="uppercase font-bold">{permit.studentName}</div>
          
          <div>Jenis Izin</div>
          <div>:</div>
          <div className="font-bold text-pesantren-green">{permit.type}</div>
          
          <div>Keperluan</div>
          <div>:</div>
          <div className="italic">"{permit.reason}"</div>
          
          <div>Waktu</div>
          <div>:</div>
          <div>
            {new Date(permit.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            {permit.endDate && ` s/d ${new Date(permit.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </div>
        </div>

        <p className="mt-4 text-[10px]">
          Harap surat ini dipergunakan dengan sebaik-baiknya dan kembali tepat waktu. Kembali ke pondok wajib melapor ke pengurus.
        </p>
      </div>

      {/* Footer / Signatures */}
      <div className="mt-4 grid grid-cols-2 text-center text-[10px]">
        <div>
          <p className="mb-10">Wali Santri,</p>
          <div className="w-24 border-b border-black mx-auto"></div>
        </div>
        <div>
          <p className="mb-1">Semar, {dateStr}</p>
          <p className="mb-10">Pengurus Kesantrian,</p>
          <p className="font-bold underline uppercase">{permit.authorizedBy || 'Pengurus Pondok'}</p>
        </div>
      </div>

      {/* Mini Note */}
      <div className="absolute bottom-2 right-8 text-[8px] font-mono text-gray-300 uppercase letter-spacing-1">
        PP. SEMAR - DIGITAL SYSTEM
      </div>
    </div>
  );
};

const PrintablePermit = React.forwardRef<HTMLDivElement, { permit: Permit }>((props, ref) => {
  const { permit } = props;
  
  return (
    <div ref={ref} className="text-black font-serif bg-white w-[210mm] relative">
      <SinglePermitLayout permit={permit} />
      
      {/* Cut Line */}
      <div className="absolute top-[148.5mm] left-0 w-full flex items-center justify-center z-10">
        <div className="w-full border-t border-dashed border-gray-300"></div>
        <div className="absolute bg-white px-2 flex items-center gap-2">
           <div className="w-3 h-3 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
           </div>
           <span className="text-[8px] font-mono text-gray-300 uppercase tracking-widest whitespace-nowrap">Potong Di Sini</span>
           <div className="w-3 h-3 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
           </div>
        </div>
      </div>

      <SinglePermitLayout permit={permit} />
    </div>
  );
});
PrintablePermit.displayName = 'PrintablePermit';

const PermitForm = ({ onComplete, onCancel, forceGender }: { onComplete: () => void, onCancel: () => void, forceGender?: string }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    gender: forceGender === 'putra' ? 'Laki-laki' : (forceGender === 'putri' ? 'Perempuan' : 'Laki-laki'),
    type: 'Izin Pulang' as Permit['type'],
    reason: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'students'), orderBy('name', 'asc')));
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
      } catch (e) {
        console.error(e);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesGender = forceGender === 'all' || 
                         (forceGender === 'putra' && s.gender === 'Laki-laki') || 
                         (forceGender === 'putri' && s.gender === 'Perempuan');
    return matchesSearch && matchesGender;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.endDate && formData.endDate < formData.startDate) {
      toast.error('Tanggal akhir tidak boleh sebelum tanggal mulai izin');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'permits'), {
        ...formData,
        status: 'Approved',
        createdAt: Timestamp.now(),
        authorizedBy: internalAuth.getUser()?.username || 'Admin'
      });
      toast.success('Surat izin berhasil diterbitkan');
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'permits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-pesantren-gold/20 dark:border-white/5 rounded-[2rem] p-8 shadow-xl shadow-pesantren-gold/5 mb-8 transition-colors"
    >
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pesantren-gold text-pesantren-dark rounded-xl flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-pesantren-dark dark:text-white leading-tight transition-colors">Buat Surat Izin</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Surat Jalan / Keterangan</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-gray-400 dark:text-gray-600 hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        <div className="space-y-1 relative">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nama Santri</label>
          <div className="relative">
            <input 
              type="text" 
              required 
              placeholder="Cari nama santri..."
              autoComplete="off"
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none text-pesantren-dark dark:text-white transition-colors"
              value={search || formData.studentName}
              onFocus={() => setShowDropdown(true)}
              onChange={e => {
                setSearch(e.target.value);
                setFormData({...formData, studentName: e.target.value});
                setShowDropdown(true);
              }}
            />
            {showDropdown && filteredStudents.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                 {filteredStudents.map(s => (
                   <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setFormData({...formData, studentName: s.name, gender: s.gender});
                      setSearch(s.name);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 text-pesantren-dark dark:text-white transition-colors border-b border-gray-50 dark:border-white/5 flex justify-between items-center"
                   >
                     <span>{s.name}</span>
                     <span className="text-[8px] font-black uppercase text-gray-400">{s.gender}</span>
                   </button>
                 ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Jenis Kelamin</label>
          <select 
            disabled={true}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none disabled:opacity-70 text-pesantren-dark dark:text-white transition-colors"
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option value="Laki-laki">Laki-laki (Putra)</option>
            <option value="Perempuan">Perempuan (Putri)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Jenis Izin</label>
          <select 
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none text-pesantren-dark dark:text-white transition-colors"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as any})}
          >
            <option value="Izin Pulang">Izin Pulang</option>
            <option value="Sakit">Sakit</option>
            <option value="Kunjungan">Kunjungan</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Tanggal Mulai</label>
          <input 
            type="date" 
            required 
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none text-pesantren-dark dark:text-white transition-colors"
            value={formData.startDate}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Tanggal Akhir (Opsional)</label>
          <input 
            type="date" 
            min={formData.startDate}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none text-pesantren-dark dark:text-white transition-colors"
            value={formData.endDate}
            onChange={e => setFormData({...formData, endDate: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 space-y-1">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Alasan / Keterangan</label>
          <textarea 
            required 
            rows={2}
            placeholder="Jelaskan alasan izin secara detail..."
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none resize-none text-pesantren-dark dark:text-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 pt-4 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-pesantren-gold text-pesantren-dark px-8 py-3 rounded-xl text-xs font-bold shadow-lg shadow-pesantren-gold/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? 'Menyimpan...' : 'Terbitkan Surat Izin'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default function PermitManager() {
  const { role, loading: roleLoading } = useAdminRole();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Surat_Izin_Santri_${selectedPermit?.studentName || ''}`,
  });

  const path = 'permits';

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Permit));
      
      if (role === 'putra') {
        data = data.filter(r => r.gender === 'Laki-laki');
      } else if (role === 'putri') {
        data = data.filter(r => r.gender === 'Perempuan');
      }

      setPermits(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!roleLoading) {
      fetchPermits(); 
    }
  }, [role, roleLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data surat izin ini?')) return;
    try {
      await deleteDoc(doc(db, path, id));
      toast.success('Data surat izin dihapus');
      fetchPermits();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (roleLoading || loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-pesantren-gold border-t-transparent rounded-full" />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Menghubungkan ke Server...</p>
    </div>
  );

  return (
    <div className="pb-10 space-y-6">
      {/* Header Section - Streamlined */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pesantren-gold/10 text-pesantren-gold rounded-xl flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-pesantren-dark dark:text-white transition-colors">Surat Izin Santri</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black transition-colors">
              Data Perizinan & Kunjungan
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Buat Izin Baru
        </button>
      </div>

      {/* Permit Form - Streamlined */}
      <AnimatePresence>
        {showForm && (
          <PermitForm 
            forceGender={role || 'all'}
            onComplete={() => {
              setShowForm(false);
              fetchPermits();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Grid of Permits - Highly Streamlined */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {permits.length === 0 ? (
          <div className="md:col-span-full py-16 text-center bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-100 dark:border-white/5">
             <FileText className="w-10 h-10 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
             <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Belum ada data</p>
          </div>
        ) : permits.map((permit) => (
          <motion.div 
            key={permit.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-gray-100 dark:border-white/5 p-5 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${
              permit.type === 'Sakit' ? 'bg-rose-500' : 
              permit.type === 'Kunjungan' ? 'bg-blue-500' : 'bg-pesantren-gold'
            }`} />

            <div className="flex items-center justify-between mb-3 pl-2">
              <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                permit.type === 'Sakit' ? 'bg-rose-50 text-rose-500' : 
                permit.type === 'Kunjungan' ? 'bg-blue-50 text-blue-500' : 'bg-pesantren-gold/10 text-pesantren-gold'
              }`}>
                {permit.type}
              </span>
              <span className="text-[7px] font-black text-gray-300 dark:text-gray-700">#{permit.id.slice(-4).toUpperCase()}</span>
            </div>

            <div className="pl-2">
              <h4 className="text-sm font-bold text-pesantren-dark dark:text-white truncate">{permit.studentName}</h4>
              <p className="text-[9px] text-gray-400 font-medium italic mt-0.5 mb-3 truncate">"{permit.reason}"</p>
              
              <div className="grid grid-cols-1 gap-1.5 mb-4">
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 dark:text-gray-400">
                  <Calendar size={10} className="text-pesantren-gold" />
                  <span>
                    {new Date(permit.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    {permit.endDate && ` - ${new Date(permit.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-white/5">
                <button 
                  onClick={() => {
                    setSelectedPermit(permit);
                    setTimeout(() => handlePrint(), 100);
                  }}
                  className="flex-1 py-2 bg-gray-50 dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-pesantren-dark dark:hover:text-pesantren-gold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer size={12} />
                  Cetak
                </button>
                <button 
                  onClick={() => handleDelete(permit.id)}
                  className="px-2.5 py-2 bg-gray-50 dark:bg-slate-800 text-gray-300 hover:text-rose-500 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>


      {/* Hidden Printable Component */}
      <div className="hidden">
        {selectedPermit && <PrintablePermit ref={componentRef} permit={selectedPermit} />}
      </div>
    </div>
  );
}
