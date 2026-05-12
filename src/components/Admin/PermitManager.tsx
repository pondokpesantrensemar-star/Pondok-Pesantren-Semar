import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Calendar, User, FileText, X, Printer, Plus, Save, Clock, ShieldAlert, Heart, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReactToPrint } from 'react-to-print';
import { useAdminRole } from '../../hooks/useContent';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  gender: string;
  class?: string;
  room?: string;
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
  createdAt: string;
  authorizedBy: string;
}

const SinglePermitLayout = ({ permit }: { permit: Permit }) => {
  const dateStr = permit.createdAt ? new Date(permit.createdAt).toLocaleDateString('id-ID', {
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
    <div ref={ref} className="text-black font-serif bg-white w-[210mm] relative" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 0; }
        `}
      </style>
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
  const [classFilter, setClassFilter] = useState('Semua');
  const [roomFilter, setRoomFilter] = useState('Semua');
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
    const fetchStudentsFunc = async () => {
      try {
        const response = await fetch('/api/students');
        if (!response.ok) throw new Error('Gagal memuat santri');
        const data = await response.json();
        setStudents(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStudentsFunc();
  }, []);

  const classes = ['Semua', ...new Set(students.map(s => s.class).filter(Boolean) as string[])].sort();
  const rooms = ['Semua', ...new Set(students.map(s => s.room).filter(Boolean) as string[])].sort();

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.name?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesGender = forceGender === 'all' || 
                         (forceGender === 'putra' && s.gender === 'Laki-laki') || 
                         (forceGender === 'putri' && s.gender === 'Perempuan');
    const matchesClass = classFilter === 'Semua' || s.class === classFilter;
    const matchesRoom = roomFilter === 'Semua' || s.room === roomFilter;
    return matchesSearch && matchesGender && matchesClass && matchesRoom;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.endDate && formData.endDate < formData.startDate) {
      toast.error('Tanggal akhir tidak boleh sebelum tanggal mulai izin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Gagal menerbitkan izin');
      toast.success('Surat izin berhasil diterbitkan');
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menerbitkan izin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-card border border-pesantren-gold/20 rounded-[2rem] p-8 shadow-xl shadow-pesantren-gold/5 mb-8 transition-colors"
    >
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pesantren-gold text-pesantren-dark rounded-xl flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold admin-text-main leading-tight transition-colors">Buat Surat Izin</h3>
            <p className="text-[10px] admin-text-muted font-bold uppercase tracking-widest mt-0.5">Surat Jalan / Keterangan</p>
          </div>
        </div>
        <button onClick={onCancel} className="admin-text-muted hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Filter Kelas</label>
            <select 
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-pesantren-gold outline-none admin-text-main transition-colors cursor-pointer"
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            >
              {classes.map(c => <option key={c} value={c} className="admin-text-main">{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Filter Kamar</label>
            <select 
              className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-pesantren-gold outline-none admin-text-main transition-colors cursor-pointer"
              value={roomFilter}
              onChange={e => setRoomFilter(e.target.value)}
            >
              {rooms.map(r => <option key={r} value={r} className="admin-text-main">{r}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 relative">
            <label className="text-[9px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Nama Santri</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                placeholder="Ketik nama untuk mencari..."
                autoComplete="off"
                className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-pesantren-gold outline-none admin-text-main transition-colors"
                value={search || formData.studentName}
                onFocus={() => setShowDropdown(true)}
                onChange={e => {
                  setSearch(e.target.value);
                  setFormData({...formData, studentName: e.target.value});
                  setShowDropdown(true);
                }}
              />
              {showDropdown && filteredStudents.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 admin-card border border-gray-100 dark:border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                   {filteredStudents.map(s => (
                     <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, studentName: s.name, gender: s.gender});
                        setSearch(s.name);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-xs hover:bg-gray-50 dark:hover:bg-slate-800 admin-text-main transition-colors border-b border-gray-50 dark:border-slate-800 flex justify-between items-center"
                     >
                       <div className="flex flex-col">
                         <span className="font-bold">{s.name}</span>
                         <span className="text-[7px] font-black uppercase admin-text-muted">{s.class} • Room {s.room}</span>
                       </div>
                       <span className="text-[8px] font-black uppercase admin-text-muted">{s.gender}</span>
                     </button>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Jenis Kelamin</label>
          <select 
            disabled={true}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none disabled:opacity-70 admin-text-main transition-colors"
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option value="Laki-laki" className="admin-text-main">Laki-laki (Putra)</option>
            <option value="Perempuan" className="admin-text-main">Perempuan (Putri)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Jenis Izin</label>
          <select 
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none admin-text-main transition-colors"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as any})}
          >
            <option value="Izin Pulang" className="admin-text-main">Izin Pulang</option>
            <option value="Sakit" className="admin-text-main">Sakit</option>
            <option value="Kunjungan" className="admin-text-main">Kunjungan</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Tanggal Mulai</label>
          <input 
            type="date" 
            required 
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none admin-text-main transition-colors"
            value={formData.startDate}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">
            Tanggal Akhir {formData.type === 'Kunjungan' ? '(Opsional)' : '(Wajib)'}
          </label>
          <input 
            type="date" 
            required={formData.type !== 'Kunjungan'}
            min={formData.startDate}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none admin-text-main transition-colors"
            value={formData.endDate}
            onChange={e => setFormData({...formData, endDate: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 space-y-1">
          <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Alasan / Keterangan</label>
          <textarea 
            required 
            rows={2}
            placeholder="Jelaskan alasan izin secara detail..."
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pesantren-gold outline-none resize-none admin-text-main transition-colors placeholder:admin-text-muted transition-all"
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 pt-4 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-xs font-bold admin-text-muted hover:admin-text-main transition-colors"
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
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [permitToExtend, setPermitToExtend] = useState<Permit | null>(null);
  const [extendEndDate, setExtendEndDate] = useState('');
  
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setShowPrintConfirm(false),
    documentTitle: () => `Surat_Izin_Santri_${selectedPermit?.studentName || ''}`,
  });

  const confirmPrint = (permit: Permit) => {
    setSelectedPermit(permit);
    setShowPrintConfirm(true);
  };

  const fetchPermits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/permits');
      if (!response.ok) throw new Error('Gagal memuat izin');
      let data = await response.json();
      
      if (role === 'putra') {
        data = data.filter((r: any) => r.gender === 'Laki-laki');
      } else if (role === 'putri') {
        data = data.filter((r: any) => r.gender === 'Perempuan');
      }

      setPermits(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data izin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!roleLoading) {
      fetchPermits(); 
    }
  }, [role, roleLoading]);

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitToExtend || !extendEndDate) return;
    
    try {
      const response = await fetch(`/api/permits/${permitToExtend.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endDate: extendEndDate,
        })
      });
      if (!response.ok) throw new Error('Gagal memperpanjang izin');
      toast.success(`Waktu izin berhasil diperpanjang hingga ${new Date(extendEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`);
      setShowExtendModal(false);
      setPermitToExtend(null);
      setExtendEndDate('');
      fetchPermits();
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperpanjang izin');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data surat izin ini?')) return;
    try {
      const response = await fetch(`/api/permits/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus izin');
      toast.success('Data surat izin dihapus');
      fetchPermits();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus izin');
    }
  };

  if (roleLoading || loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 transition-colors">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} 
        className="w-10 h-10 border-4 border-pesantren-gold border-t-transparent rounded-full shadow-[0_0_15px_rgba(197,160,89,0.3)]" 
      />
      <p className="text-[10px] font-black admin-text-muted uppercase tracking-[0.2em] animate-pulse">Menghubungkan ke Server...</p>
    </div>
  );

  return (
    <div className="pb-10 space-y-8 max-w-7xl mx-auto">
      {/* Header Section - Streamlined & Professional */}
      <div className="admin-card p-4 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
          <div>
            <h3 className="text-4xl admin-heading admin-text-main transition-colors mb-2">Perizinan Santri</h3>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-12 bg-pesantren-gold rounded-full" />
              <p className="text-[10px] admin-text-muted font-black uppercase tracking-[0.25em]">Sistem Digital Surat Izin & Kunjungan</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-pesantren-dark text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-pesantren-dark/10 hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={16} />
            Buat Izin Baru
          </button>
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-0">
        {permits.length === 0 ? (
          <div className="col-span-full py-24 text-center admin-card rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 transition-colors">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 admin-text-muted opacity-30" />
             </div>
             <p className="admin-text-muted text-sm font-bold italic tracking-wide">Belum ada data perizinan ditemukan</p>
          </div>
        ) : permits.map((permit) => (
          <motion.div 
            key={permit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="admin-card rounded-[2.2rem] border border-slate-100 dark:border-slate-800 p-7 shadow-sm hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-none transition-all duration-500 group relative overflow-hidden text-left"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-opacity group-hover:opacity-40 opacity-20 ${
              permit.type === 'Sakit' ? 'bg-rose-500' : 
              permit.type === 'Kunjungan' ? 'bg-blue-500' : 'bg-pesantren-gold'
            }`} />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] transition-colors border ${
                permit.type === 'Sakit' ? 'bg-rose-50/50 dark:bg-rose-900/20 text-rose-500 border-rose-100 dark:border-rose-900/50' : 
                permit.type === 'Kunjungan' ? 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-500 border-blue-100 dark:border-blue-900/50' : 'bg-pesantren-gold/5 dark:bg-pesantren-gold/20 text-pesantren-gold border-pesantren-gold/20'
              }`}>
                {permit.type}
              </span>
              <span className="text-[8px] font-black admin-text-muted bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors tabular-nums">#{permit.id.slice(-6).toUpperCase()}</span>
            </div>

            <div className="relative z-10 mb-8">
              <h4 className="text-lg font-black admin-text-main truncate transition-colors group-hover:text-pesantren-gold duration-500">{permit.studentName}</h4>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <p className="text-[10px] admin-text-muted font-bold uppercase tracking-widest">{permit.gender === 'Laki-laki' ? 'Putra' : 'Putri'}</p>
              </div>
              <div className="mt-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 italic transition-colors">
                 <p className="text-[11px] admin-text-muted font-medium line-clamp-2">"{permit.reason}"</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 mb-8 relative z-10">
              <div className="flex items-center gap-3 text-[10px] font-black admin-text-main transition-colors bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <Calendar size={14} className="text-pesantren-gold" />
                <span className="tabular-nums">
                  {new Date(permit.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  {permit.endDate && ` s/d ${new Date(permit.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50 dark:border-slate-800 transition-colors relative z-10">
              <button 
                onClick={() => confirmPrint(permit)}
                className="flex-1 py-3.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-95"
              >
                <Printer size={14} /> Cetak
              </button>
              
              <div className="flex gap-2">
                {permit.type === 'Sakit' && (
                  <button 
                    onClick={() => {
                      setPermitToExtend(permit);
                      if (permit.endDate) setExtendEndDate(permit.endDate);
                      setShowExtendModal(true);
                    }}
                    className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-blue-500/5 active:scale-95"
                    title="Perpanjang"
                  >
                    <Clock size={16} />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(permit.id)}
                  className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-rose-500/5 active:scale-95"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>


      {/* Confirmation Dialog for Printing */}
      <AnimatePresence>
        {showPrintConfirm && selectedPermit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrintConfirm(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative admin-card w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-pesantren-gold/10 text-pesantren-gold rounded-2xl flex items-center justify-center mb-6">
                  <Printer size={32} />
                </div>
                
                <h3 className="text-xl font-bold admin-text-main mb-2 transition-colors">Konfirmasi Cetak</h3>
                <p className="text-sm admin-text-muted mb-6 leading-relaxed transition-colors">
                  Apakah Anda yakin ingin mencetak surat izin untuk santri <span className="font-bold admin-text-main underline decoration-pesantren-gold/30 uppercase">{selectedPermit.studentName}</span>?
                </p>

                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-8 border border-gray-100 dark:border-slate-800 transition-colors space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest admin-text-muted">
                    <span>Jenis Izin</span>
                    <span className="admin-text-main">{selectedPermit.type}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest admin-text-muted">
                    <span>Masa Izin</span>
                    <span className="admin-text-main">
                      {new Date(selectedPermit.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      {selectedPermit.endDate && ` s/d ${new Date(selectedPermit.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowPrintConfirm(false)}
                    className="py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                       handlePrint();
                    }}
                    className="py-4 bg-pesantren-gold text-pesantren-dark rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-pesantren-gold/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Printer size={16} />
                    Cetak Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Extend Modal */}
      <AnimatePresence>
        {showExtendModal && permitToExtend && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowExtendModal(false);
                setPermitToExtend(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-md admin-card rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                  <Clock size={32} />
                </div>
                
                <h3 className="text-xl font-bold admin-text-main mb-2 transition-colors">Perpanjang Izin</h3>
                <p className="text-sm admin-text-muted mb-6 leading-relaxed transition-colors">
                  Perpanjang batas waktu izin sakit untuk santri <span className="font-bold admin-text-main underline decoration-pesantren-gold/30 uppercase">{permitToExtend.studentName}</span>.
                </p>

                <form onSubmit={handleExtend}>
                  <div className="space-y-4 mb-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Masa Izin Saat Ini</label>
                      <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-xl text-sm font-medium admin-text-main transition-colors">
                        {new Date(permitToExtend.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {permitToExtend.endDate ? ` s/d ${new Date(permitToExtend.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black admin-text-muted uppercase tracking-widest ml-1 transition-colors">Sampai Tanggal Baru</label>
                      <input
                        type="date"
                        required
                        value={extendEndDate}
                        onChange={(e) => setExtendEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-pesantren-gold focus:border-pesantren-gold admin-card admin-text-main transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowExtendModal(false);
                        setPermitToExtend(null);
                      }}
                      className="py-4 rounded-xl text-[11px] font-black uppercase tracking-widest admin-text-muted hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={!extendEndDate}
                      className="py-4 bg-blue-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Printable Component */}
      <div className="hidden">
        {selectedPermit && <PrintablePermit ref={componentRef} permit={selectedPermit} />}
      </div>
    </div>
  );
}
