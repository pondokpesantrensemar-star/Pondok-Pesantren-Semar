import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';
import { 
  Plus, Trash2, FileText, 
  Settings2, X, Users, Search, Filter, User,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { useAdminRole } from '../../hooks/useContent';
import PermitManager from './PermitManager';

interface Student {
  id: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  nis?: string;
  photoUrl?: string;
  birthPlace: string;
  birthDate: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  status: 'Aktif' | 'Alumni' | 'Keluar';
  entryYear: string;
  class: string;
  room: string;
}

export default function KesantrianManager() {
  const [activeTab, setActiveTab] = useState<'students' | 'permits'>('students');
  const [loading, setLoading] = useState(true);
  
  // Students State
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Alumni' | 'Keluar'>('Semua');
  const [roleFilter, setRoleFilter] = useState<'Semua' | 'Putra' | 'Putri' | 'Kesantrian'>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentFormData, setStudentFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    gender: 'Laki-laki',
    nis: '',
    photoUrl: '',
    birthPlace: '',
    birthDate: '',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    status: 'Aktif',
    entryYear: new Date().getFullYear().toString(),
    class: '',
    room: ''
  });

  const fetchStudents = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'students'), orderBy('name', 'asc')));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
      setStudents(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'students');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStudents();
      setLoading(false);
    };
    init();
  }, []);

  const handleStudentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudentId) {
        await updateDoc(doc(db, 'students', editingStudentId), studentFormData);
        toast.success('Data santri diperbarui');
      } else {
        await addDoc(collection(db, 'students'), studentFormData);
        toast.success('Santri baru ditambahkan');
      }
      setEditingStudentId(null);
      setIsAddingStudent(false);
      setStudentFormData({
        name: '', 
        gender: 'Laki-laki', 
        nis: '', 
        photoUrl: '',
        birthPlace: '',
        birthDate: '',
        phone: '',
        address: '', 
        parentName: '', 
        parentPhone: '',
        status: 'Aktif', 
        entryYear: new Date().getFullYear().toString(),
        class: '',
        room: ''
      });
      fetchStudents();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'students');
    }
  };

  const { role } = useAdminRole();

  useEffect(() => {
    if (isAddingStudent && !editingStudentId) {
      if (role === 'putra') {
        setStudentFormData(prev => ({ ...prev, gender: 'Laki-laki' }));
      } else if (role === 'putri') {
        setStudentFormData(prev => ({ ...prev, gender: 'Perempuan' }));
      }
    }
  }, [isAddingStudent, editingStudentId, role]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (s.nis && s.nis.includes(searchQuery));
    const matchesStatus = statusFilter === 'Semua' || s.status === statusFilter;
    
    // Role filter UI based on request
    let matchesRoleUI = true;
    if (roleFilter === 'Putra') matchesRoleUI = s.gender === 'Laki-laki';
    else if (roleFilter === 'Putri') matchesRoleUI = s.gender === 'Perempuan';
    // 'Kesantrian' or 'All' shows all for now as per current schema
    
    return matchesSearch && matchesStatus && matchesRoleUI;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-pesantren-gold border-t-transparent rounded-full" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Menghubungkan Database...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0 mb-20 text-left">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900/50 p-4 md:p-8 rounded-[2.5rem] border border-gray-50 dark:border-white/5 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-pesantren-dark dark:text-white transition-colors">Modul Kesantrian</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Sistem Informasi Santri & Aktivitas Terpadu</p>
          </div>
          
          <div className="flex p-1 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <button 
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-white dark:bg-slate-800 text-pesantren-dark dark:text-pesantren-gold shadow-sm' : 'text-gray-400'}`}
            >
              <Users size={14} /> Data Santri
            </button>
            <button 
              onClick={() => setActiveTab('permits')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'permits' ? 'bg-white dark:bg-slate-800 text-pesantren-dark dark:text-pesantren-gold shadow-sm' : 'text-gray-400'}`}
            >
              <FileText size={14} /> Surat Izin
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'students' ? (
          <motion.div 
            key="students-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 relative group w-full">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pesantren-gold transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cari santri..."
                  className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 py-3 pl-12 pr-6 rounded-xl text-xs focus:ring-2 focus:ring-pesantren-gold/20 outline-none dark:text-white transition-all shadow-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:w-auto">
                <div className="flex p-1 bg-gray-100/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  {['Semua', 'Aktif', 'Alumni'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        statusFilter === status 
                          ? 'bg-white dark:bg-slate-800 text-pesantren-dark dark:text-pesantren-gold shadow-sm' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="flex p-1 bg-gray-100/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-pesantren-gold shadow-sm' : 'text-gray-400'}`}
                  >
                    <Filter size={14} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-pesantren-gold shadow-sm' : 'text-gray-400'}`}
                  >
                    <Users size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => setIsAddingStudent(!isAddingStudent)}
                  className="flex-1 lg:flex-none px-6 py-3 bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isAddingStudent ? <X size={14} /> : <Plus size={14} />}
                  {isAddingStudent ? 'Batal' : 'Tambah'}
                </button>
              </div>
            </div>

            {/* Student Form */}
            {isAddingStudent || editingStudentId ? (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleStudentSave}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pesantren-gold/10 text-pesantren-gold rounded-xl flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-pesantren-dark dark:text-white leading-tight">{editingStudentId ? 'Edit Santri' : 'Santri Baru'}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Informasi Profil Santri</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                  <div className="space-y-1.5 lg:col-span-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.name}
                      onChange={e => setStudentFormData({...studentFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm disabled:opacity-50"
                      value={studentFormData.gender}
                      onChange={e => setStudentFormData({...studentFormData, gender: e.target.value as any})}
                      disabled={role === 'putra' || role === 'putri'}
                    >
                      <option value="Laki-laki">Putra</option>
                      <option value="Perempuan">Putri</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">NIS</label>
                    <input 
                      type="text"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.nis}
                      onChange={e => setStudentFormData({...studentFormData, nis: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5 lg:col-span-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">URL Foto Profil</label>
                    <input 
                      type="url"
                      placeholder="https://..."
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.photoUrl}
                      onChange={e => setStudentFormData({...studentFormData, photoUrl: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.birthPlace}
                      onChange={e => setStudentFormData({...studentFormData, birthPlace: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                    <input 
                      type="date" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.birthDate}
                      onChange={e => setStudentFormData({...studentFormData, birthDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Masuk</label>
                    <input 
                      type="number" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.entryYear}
                      onChange={e => setStudentFormData({...studentFormData, entryYear: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Wali</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.parentName}
                      onChange={e => setStudentFormData({...studentFormData, parentName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">No. HP Wali</label>
                    <input 
                      type="tel" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.parentPhone}
                      onChange={e => setStudentFormData({...studentFormData, parentPhone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.status}
                      onChange={e => setStudentFormData({...studentFormData, status: e.target.value as any})}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Keluar">Keluar</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kelas</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.class}
                      onChange={e => setStudentFormData({...studentFormData, class: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kamar</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.room}
                      onChange={e => setStudentFormData({...studentFormData, room: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Singkat</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 dark:text-white transition-all text-sm"
                      value={studentFormData.address}
                      onChange={e => setStudentFormData({...studentFormData, address: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
                   <button 
                    type="button" 
                    onClick={() => { setIsAddingStudent(false); setEditingStudentId(null); }}
                    className="px-6 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Save size={14} className="inline mr-2" />
                    Simpan Perubahan
                  </button>
                </div>
              </motion.form>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {filteredStudents.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-100 dark:border-white/5">
                    <Users className="w-10 h-10 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
                    <p className="text-gray-400 text-xs font-bold italic">Tidak ada santri ditemukan</p>
                </div>
              ) : filteredStudents.map((s) => (
                <motion.div 
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
                >
                  <div className="relative aspect-square bg-gray-50 dark:bg-slate-800 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {s.photoUrl ? (
                      <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-4xl font-black ${s.gender === 'Laki-laki' ? 'text-blue-100 dark:text-blue-900/30' : 'text-pink-100 dark:text-pink-900/30'}`}>
                         {s.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Compact Status Indicator */}
                    <div className="absolute top-3 left-3 flex gap-2">
                       <span className={`w-2 h-2 rounded-full ${s.status === 'Aktif' ? 'bg-emerald-500' : 'bg-gray-400'} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                      <h4 className="font-bold text-white text-sm leading-tight mb-0.5 truncate">{s.name}</h4>
                      <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">{s.class}</p>
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => {
                          setEditingStudentId(s.id);
                          setStudentFormData({
                            name: s.name, 
                            gender: s.gender, 
                            nis: s.nis || '', 
                            photoUrl: s.photoUrl || '',
                            birthPlace: s.birthPlace || '',
                            birthDate: s.birthDate || '',
                            phone: s.phone || '',
                            address: s.address, 
                            parentName: s.parentName, 
                            parentPhone: s.parentPhone || '',
                            status: s.status, 
                            entryYear: s.entryYear,
                            class: s.class || '',
                            room: s.room || ''
                          });
                          setIsAddingStudent(true);
                        }}
                        className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-pesantren-gold hover:text-pesantren-dark transition-all flex items-center justify-center shadow-lg"
                      >
                        <Settings2 size={14} />
                      </button>
                      <button 
                        onClick={async () => {
                          if (!confirm(`Hapus data ${s.name}?`)) return;
                          try {
                            await deleteDoc(doc(db, 'students', s.id));
                            toast.success('Data dihapus');
                            fetchStudents();
                          } catch (e) { handleFirestoreError(e, OperationType.DELETE, 'students'); }
                        }}
                        className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-rose-500 transition-all flex items-center justify-center shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Santri</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">NIS</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kelas / Kamar</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Wali</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold italic">
                            Belum ada data santri ditemukan
                          </td>
                        </tr>
                      ) : filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${s.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                                {s.name.charAt(0)}
                              </div>
                              <span className="font-bold text-sm text-pesantren-dark dark:text-white truncate max-w-[200px]">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[11px] font-bold text-gray-500 tabular-nums">{s.nis || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-bold text-pesantren-dark dark:text-white block">{s.class}</span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">{s.room}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-bold text-gray-500 block">{s.parentName}</span>
                              <span className="text-[9px] text-gray-400 font-bold tabular-nums block">{s.parentPhone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                               s.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                             }`}>
                               {s.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingStudentId(s.id);
                                  setStudentFormData({
                                    name: s.name, 
                                    gender: s.gender, 
                                    nis: s.nis || '', 
                                    photoUrl: s.photoUrl || '',
                                    birthPlace: s.birthPlace || '',
                                    birthDate: s.birthDate || '',
                                    phone: s.phone || '',
                                    address: s.address, 
                                    parentName: s.parentName, 
                                    parentPhone: s.parentPhone || '',
                                    status: s.status, 
                                    entryYear: s.entryYear,
                                    class: s.class || '',
                                    room: s.room || ''
                                  });
                                  setIsAddingStudent(true);
                                }}
                                className="p-2 text-gray-400 hover:text-pesantren-gold transition-colors"
                              >
                                <Settings2 size={16} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (!confirm(`Hapus data ${s.name}?`)) return;
                                  try {
                                    await deleteDoc(doc(db, 'students', s.id));
                                    toast.success('Data santri dihapus');
                                    fetchStudents();
                                  } catch (e) { handleFirestoreError(e, OperationType.DELETE, 'students'); }
                                }}
                                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            )}
          </motion.div>
        ) : (
          <motion.div 
            key="permits-tab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <PermitManager />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
