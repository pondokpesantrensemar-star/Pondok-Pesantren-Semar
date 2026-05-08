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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Aktif' | 'Alumni' | 'Keluar'>('All');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentFormData, setStudentFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    gender: 'Laki-laki',
    nis: '',
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
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    
    // Role filter
    let matchesRole = true;
    if (role === 'putra') matchesRole = s.gender === 'Laki-laki';
    if (role === 'putri') matchesRole = s.gender === 'Perempuan';
    
    return matchesSearch && matchesStatus && matchesRole;
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
            {/* Search & Action Bar */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pesantren-gold transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Cari nama santri atau NIS..."
                    className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 py-4 pl-14 pr-6 rounded-2xl text-sm focus:ring-2 focus:ring-pesantren-gold/20 outline-none dark:text-white transition-all shadow-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => {
                    setIsAddingStudent(!isAddingStudent);
                    setEditingStudentId(null);
                  }}
                  className="px-8 py-4 bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isAddingStudent ? <X size={16} /> : <Plus size={16} />}
                  {isAddingStudent ? 'Batal' : 'Tambah Santri'}
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Filter size={12} /> Filter Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Aktif', 'Alumni', 'Keluar'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        statusFilter === status 
                          ? 'bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark shadow-md' 
                          : 'bg-white dark:bg-slate-900/50 text-gray-400 border border-gray-100 dark:border-white/5 hover:border-pesantren-gold/50'
                      }`}
                    >
                      {status === 'All' ? 'Semua Santri' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Form */}
            {isAddingStudent || editingStudentId ? (
              <motion.form 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleStudentSave}
                className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-pesantren-gold/20 shadow-2xl space-y-8"
              >
                <div className="flex items-center gap-4 pb-6 border-b border-gray-50 dark:border-white/5">
                  <div className="w-12 h-12 bg-pesantren-gold/10 text-pesantren-gold rounded-2xl flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-pesantren-dark dark:text-white">{editingStudentId ? 'Edit Data Santri' : 'Input Santri Baru'}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lengkapi data primer santri</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.name}
                      onChange={e => setStudentFormData({...studentFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm disabled:opacity-50"
                      value={studentFormData.gender}
                      onChange={e => setStudentFormData({...studentFormData, gender: e.target.value as any})}
                      disabled={role === 'putra' || role === 'putri'}
                    >
                      <option value="Laki-laki">Putra (Laki-laki)</option>
                      <option value="Perempuan">Putri (Perempuan)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIS (Opsional)</label>
                    <input 
                      type="text"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.nis}
                      onChange={e => setStudentFormData({...studentFormData, nis: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.birthPlace}
                      onChange={e => setStudentFormData({...studentFormData, birthPlace: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                    <input 
                      type="date" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.birthDate}
                      onChange={e => setStudentFormData({...studentFormData, birthDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. HP Santri</label>
                    <input 
                      type="tel"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.phone}
                      onChange={e => setStudentFormData({...studentFormData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Masuk</label>
                    <input 
                      type="number" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.entryYear}
                      onChange={e => setStudentFormData({...studentFormData, entryYear: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kelas</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.class}
                      onChange={e => setStudentFormData({...studentFormData, class: e.target.value})}
                      placeholder="Contoh: 10 Madrasah Aliyah"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kamar / Asrama</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.room}
                      onChange={e => setStudentFormData({...studentFormData, room: e.target.value})}
                      placeholder="Contoh: Abu Bakar - 04"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Wali</label>
                    <input 
                      type="text" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.parentName}
                      onChange={e => setStudentFormData({...studentFormData, parentName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. HP Wali</label>
                    <input 
                      type="tel" required
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.parentPhone}
                      onChange={e => setStudentFormData({...studentFormData, parentPhone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm"
                      value={studentFormData.status}
                      onChange={e => setStudentFormData({...studentFormData, status: e.target.value as any})}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Keluar">Keluar</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-4 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                    <textarea 
                       required rows={2}
                       className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-4 rounded-xl outline-none focus:ring-2 focus:ring-pesantren-gold/50 dark:text-white transition-all text-sm resize-none"
                       value={studentFormData.address}
                       onChange={e => setStudentFormData({...studentFormData, address: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-8 border-t border-gray-50 dark:border-white/5">
                   <button 
                    type="button" 
                    onClick={() => { setIsAddingStudent(false); setEditingStudentId(null); }}
                    className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Save size={16} className="inline mr-2" />
                    Simpan Data Santri
                  </button>
                </div>
              </motion.form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStudents.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-gray-100 dark:border-white/5">
                        <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-gray-300 font-bold italic">Belum ada data santri ditemukan</p>
                    </div>
                  ) : filteredStudents.map((s) => (
                    <motion.div 
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 relative group"
                    >
                      {/* Profile Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black shrink-0 ${s.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                          {s.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-pesantren-dark dark:text-white truncate">{s.name}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${s.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                              {s.status}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                        <p><span className="font-bold text-gray-400">NIS:</span> {s.nis || '-'}</p>
                        <p><span className="font-bold text-gray-400">Kelas:</span> {s.class}</p>
                        <p><span className="font-bold text-gray-400">Kamar:</span> {s.room}</p>
                        <p><span className="font-bold text-gray-400">Wali:</span> {s.parentName} ({s.parentPhone})</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingStudentId(s.id);
                            setStudentFormData({
                              name: s.name, 
                              gender: s.gender, 
                              nis: s.nis || '', 
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
                          }}
                          className="p-2 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-pesantren-gold transition-colors flex items-center justify-center"
                        >
                          <Settings2 size={14} />
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
                          className="p-2 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
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
