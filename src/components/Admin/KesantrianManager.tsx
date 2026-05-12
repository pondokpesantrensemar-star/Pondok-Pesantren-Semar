import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, FileText, ClipboardList,
  Settings2, X, Users, Search, Filter, User,
  Save, Clock, MapPin, AlignLeft, Banknote,
  Calendar, Phone, Home, Mail, ChevronRight,
  ShieldCheck, AlertCircle, TrendingUp, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { useAdminRole } from '../../hooks/useContent';
import ImageUploadInput from './ImageUploadInput';

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

interface DailySchedule {
  id: string;
  time: string;
  activity: string;
  description: string;
  location: string;
  order: number;
}

export default function KesantrianManager() {
  const [activeTab, setActiveTab] = useState<'students' | 'schedules'>('students');
  const [loading, setLoading] = useState(true);
  
  // Students State
  const [students, setStudents] = useState<Student[]>([]);
  
  // Schedule State
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleFormData, setScheduleFormData] = useState<Omit<DailySchedule, 'id'>>({
    time: '',
    activity: '',
    description: '',
    location: '',
    order: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Alumni' | 'Keluar'>('Semua');
  const [roleFilter, setRoleFilter] = useState<'Semua' | 'Putra' | 'Putri' | 'Kesantrian'>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  
  // Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchStudentDetails = async (student: Student) => {
    setSelectedStudent(student);
  };

  const handlePrintStudent = (student: Student) => {
    let settings: any = {};
    try {
      const storedSettings = localStorage.getItem('pesantren_settings');
      if (storedSettings) {
        settings = JSON.parse(storedSettings);
      }
    } catch (e) {
      console.error('Error parsing settings for print:', e);
    }

    const schoolName = settings.heroTitle || 'Pondok Pesantren Semar';
    const schoolSubtitle = settings.heroSubtitle || 'Membangun Generasi Rabbani di Jantung Nusantara';
    const schoolAddress = settings.address || 'Jl. Raya Nusantara No. 99, Jawa Timur, Indonesia';
    const schoolEmail = settings.contactEmail || 'info@pesantrensemar.id';
    const schoolPhone = settings.contactPhone || '(021) 123-4567';
    const logoHtml = settings.schoolLogo 
      ? `<img src="${settings.schoolLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />` 
      : `S`;

    const printContent = `
      <html>
        <head>
          <title>Detail Santri - ${student.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
            h1 { color: #15803d; border-bottom: 2px solid #15803d; padding-bottom: 10px; margin-bottom: 30px; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            .content { display: flex; gap: 40px; }
            .photo { width: 150px; height: 150px; background-color: #f4f4f5; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #a1a1aa; border: 2px solid #e4e4e7; overflow: hidden; flex-shrink: 0; }
            .photo img { width: 100%; height: 100%; object-fit: cover; }
            .details { flex: 1; }
            .section { margin-bottom: 30px; }
            .section h2 { font-size: 14px; color: #15803d; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #e4e4e7; padding-bottom: 5px; margin-bottom: 15px; }
            .field { display: flex; margin-bottom: 8px; font-size: 14px; }
            .label { font-weight: bold; width: 150px; color: #52525b; flex-shrink: 0; }
            .value { color: #18181b; font-weight: 500; }
            .header { display: flex; align-items: center; border-bottom: 3px solid #18181b; padding-bottom: 20px; margin-bottom: 30px; }
            .header-logo { width: 80px; height: 80px; background-color: ${settings.schoolLogo ? 'transparent' : '#15803d'}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; margin-right: 20px; flex-shrink: 0; overflow: hidden; }
            .header-text { flex: 1; text-align: center; }
            .header-title { font-size: 28px; font-weight: 900; color: #15803d; margin: 0; letter-spacing: 1px; text-transform: uppercase; }
            .header-subtitle { font-size: 14px; font-weight: bold; color: #52525b; margin: 5px 0; text-transform: uppercase; letter-spacing: 2px; }
            .header-address { font-size: 12px; color: #71717a; margin: 0; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-logo">${logoHtml}</div>
            <div class="header-text">
              <h2 class="header-title">${schoolName}</h2>
              <p class="header-subtitle">${schoolSubtitle}</p>
              <p class="header-address">${schoolAddress}<br/>Telp: ${schoolPhone} | Email: ${schoolEmail}</p>
            </div>
            <div style="width: 80px; margin-left: 20px;"></div> <!-- Spacer to center the text -->
          </div>
          <h1>Profil Santri</h1>
          <div class="content">
            <div class="photo">
              ${student.photoUrl ? `<img src="${student.photoUrl}" alt="Photo" />` : student.name.charAt(0).toUpperCase()}
            </div>
            <div class="details">
              <div class="section">
                <h2>Informasi Pribadi & Akademik</h2>
                <div class="field"><div class="label">Nama Lengkap</div><div class="value">: ${student.name}</div></div>
                <div class="field"><div class="label">NIS</div><div class="value">: ${student.nis || '-'}</div></div>
                <div class="field"><div class="label">Jenis Kelamin</div><div class="value">: ${student.gender}</div></div>
                <div class="field"><div class="label">Kelas</div><div class="value">: ${student.class || '-'}</div></div>
                <div class="field"><div class="label">Kamar</div><div class="value">: ${student.room || '-'}</div></div>
                <div class="field"><div class="label">Status</div><div class="value">: ${student.status}</div></div>
                <div class="field"><div class="label">Tahun Masuk</div><div class="value">: ${student.entryYear}</div></div>
              </div>
              
              <div class="section">
                <h2>Data Orang Tua & Kontak</h2>
                <div class="field"><div class="label">Nama Wali</div><div class="value">: ${student.parentName || '-'}</div></div>
                <div class="field"><div class="label">No. HP Wali</div><div class="value">: ${student.parentPhone || '-'}</div></div>
                <div class="field"><div class="label">Alamat Lengkap</div><div class="value">: ${student.address || '-'}</div></div>
              </div>
            </div>
          </div>
          <script>
            setTimeout(function() {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=800,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      toast.error('Tidak dapat membuka jendela cetak. Mohon izinkan popup untuk situs ini.');
    }
  };

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

  const [studentFormErrors, setStudentFormErrors] = useState<Record<string, string>>({});

  const validateStudentForm = () => {
    const errors: Record<string, string> = {};
    let needsDetails = false;

    if (!studentFormData.name.trim()) errors.name = 'Nama Santri wajib diisi';
    if (!studentFormData.gender) errors.gender = 'Jenis Kelamin wajib diisi';
    
    if (!studentFormData.birthDate) {
      errors.birthDate = 'Tanggal Lahir wajib diisi';
      needsDetails = true;
    } else {
      const d = new Date(studentFormData.birthDate);
      if (isNaN(d.getTime())) {
        errors.birthDate = 'Format tanggal tidak valid';
        needsDetails = true;
      }
    }

    if (!studentFormData.parentName.trim()) errors.parentName = 'Nama Orang Tua/Wali wajib diisi';
    
    if (!studentFormData.parentPhone.trim()) {
      errors.parentPhone = 'No. Telepon Wali wajib diisi';
    } else if (!/^\d+$/.test(studentFormData.parentPhone.replace(/[\s\-\+]/g, ''))) {
      errors.parentPhone = 'No. Telepon hanya boleh berisi angka';
    }

    if (studentFormData.phone) {
      if (!/^\d+$/.test(studentFormData.phone.replace(/[\s\-\+]/g, ''))) {
        errors.phone = 'No. Telepon hanya boleh berisi angka';
      }
    }

    if (!studentFormData.status) errors.status = 'Status wajib diisi';
    if (!studentFormData.class.trim()) {
      errors.class = 'Kelas wajib diisi';
      needsDetails = true;
    }
    if (!studentFormData.room.trim()) {
      errors.room = 'Kamar wajib diisi';
      needsDetails = true;
    }

    setStudentFormErrors(errors);
    if (needsDetails && Object.keys(errors).length > 0) {
      setShowDetails(true);
    }
    return Object.keys(errors).length === 0;
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Gagal memuat santri');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal memuat list santri');
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/daily_schedules');
      if (!response.ok) throw new Error('Gagal memuat jadwal');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Gagal memuat jadwal');
    }
  };

  const handleScheduleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingScheduleId ? `/api/daily_schedules/${editingScheduleId}` : '/api/daily_schedules';
      const method = editingScheduleId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleFormData),
      });

      if (!response.ok) throw new Error('Gagal menyimpan jadwal');

      toast.success(editingScheduleId ? 'Jadwal diperbarui' : 'Jadwal baru ditambahkan');
      setEditingScheduleId(null);
      setIsAddingSchedule(false);
      setScheduleFormData({
        time: '',
        activity: '',
        description: '',
        location: '',
        order: schedules.length
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Gagal menyimpan jadwal');
    }
  };

  const handleStudentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStudentForm()) {
      toast.error('Mohon periksa kembali isian form Anda');
      return;
    }
    
    try {
      const url = editingStudentId ? `/api/students/${editingStudentId}` : '/api/students';
      const method = editingStudentId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentFormData),
      });
      if (!response.ok) throw new Error('Gagal menyimpan santri');

      toast.success(editingStudentId ? 'Data santri diperbarui' : 'Santri baru ditambahkan');
      setEditingStudentId(null);
      setIsAddingStudent(false);
      // Small delay then re-fetch
      setTimeout(fetchStudents, 500);
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Gagal menyimpan santri');
    }
  };

  const { role } = useAdminRole();

  useEffect(() => {
    Promise.all([fetchStudents(), fetchSchedules()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (role === 'putra') {
      setRoleFilter('Putra');
    } else if (role === 'putri') {
      setRoleFilter('Putri');
    }
  }, [role]);

  useEffect(() => {
    if (isAddingStudent && !editingStudentId) {
      if (role === 'putra') {
        setStudentFormData(prev => ({ ...prev, gender: 'Laki-laki' }));
      } else if (role === 'putri') {
        setStudentFormData(prev => ({ ...prev, gender: 'Perempuan' }));
      }
    }
  }, [isAddingStudent, editingStudentId, role]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 15 : 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, itemsPerPage]);

  const filteredStudents = React.useMemo(() => {
    return students.filter(s => {
      const matchesSearch = (s.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                           (s.nis && s.nis.includes(searchQuery));
      const matchesStatus = statusFilter === 'Semua' || s.status === statusFilter;
      
      // Role filter UI based on request
      let matchesRoleUI = true;
      if (roleFilter === 'Putra') matchesRoleUI = s.gender === 'Laki-laki';
      else if (roleFilter === 'Putri') matchesRoleUI = s.gender === 'Perempuan';
      
      return matchesSearch && matchesStatus && matchesRoleUI;
    });
  }, [students, searchQuery, statusFilter, roleFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const displayedStudents = React.useMemo(() => {
    return filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  // Pagination UI Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-10">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} Santri
        </p>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <AlignLeft size={14} className="rotate-90" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="w-9 h-9 rounded-lg border border-gray-100 text-gray-500 text-[10px] font-bold hover:bg-gray-50 transition-all"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-300">...</span>}
            </>
          )}

          {pages.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all ${
                currentPage === page 
                  ? 'admin-sidebar-active shadow-lg shadow-black/10' 
                  : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-300">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-9 h-9 rounded-lg border border-gray-100 text-gray-500 text-[10px] font-bold hover:bg-gray-50 transition-all"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <AlignLeft size={14} className="-rotate-90" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 transition-colors">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} 
        className="w-10 h-10 border-4 border-pesantren-gold border-t-transparent rounded-full shadow-[0_0_15px_rgba(197,160,89,0.3)]" 
      />
      <p className="text-[10px] font-black admin-text-muted uppercase tracking-[0.2em] animate-pulse">Menghubungkan Database...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0 mb-20 text-left">
      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-card w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
            >
              <div className="relative h-32 sm:h-48 bg-pesantren-dark/5 dark:bg-pesantren-dark/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pesantren-gold/20 to-transparent" />
                <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
                  <button 
                    onClick={() => handlePrintStudent(selectedStudent)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                    title="Cetak Detail Santri"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="px-6 sm:px-10 pb-10 flex-1 overflow-y-auto custom-scrollbar">
                <div className="relative -mt-16 sm:-mt-24 mb-10 flex flex-col sm:flex-row items-end gap-6">
                  <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[2.5rem] border-8 border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xl overflow-hidden shrink-0">
                    {selectedStudent.photoUrl ? (
                      <img src={selectedStudent.photoUrl} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-black text-pesantren-gold/20">
                        {selectedStudent.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pb-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                      <h2 className="text-2xl sm:text-3xl font-serif font-black admin-text-main">{selectedStudent.name}</h2>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        selectedStudent.status === 'Aktif' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                      }`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-black admin-text-muted uppercase tracking-[0.2em]">{selectedStudent.gender} • NIS: {selectedStudent.nis || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Info Card */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-3xl space-y-4">
                      <h4 className="text-[10px] font-black admin-text-muted uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={12} className="text-pesantren-gold" /> Informasi Akademik
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="admin-text-muted font-bold uppercase tracking-widest text-[9px]">Kelas</span>
                          <span className="font-black admin-text-main">{selectedStudent.class}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="admin-text-muted font-bold uppercase tracking-widest text-[9px]">Kamar</span>
                          <span className="font-black admin-text-main">{selectedStudent.room}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="admin-text-muted font-bold uppercase tracking-widest text-[9px]">Tahun Masuk</span>
                          <span className="font-black admin-text-main">{selectedStudent.entryYear}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-3xl space-y-4">
                      <h4 className="text-[10px] font-black admin-text-muted uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} className="text-pesantren-gold" /> Kontak & Alamat
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="admin-text-muted font-bold uppercase tracking-widest text-[9px]">Alamat</p>
                          <p className="text-xs font-black admin-text-main leading-relaxed">{selectedStudent.address}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="admin-text-muted font-bold uppercase tracking-widest text-[9px]">Nama Wali</p>
                          <p className="text-xs font-black admin-text-main">{selectedStudent.parentName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="admin-text-muted font-bold uppercase tracking-widest text-[9px]">No. HP Wali</p>
                          <a href={`tel:${selectedStudent.parentPhone}`} className="text-xs font-black text-pesantren-gold hover:underline flex items-center gap-2">
                            <Phone size={12} /> {selectedStudent.parentPhone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* History - Removed redundant sections */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="p-20 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-gray-100 dark:border-slate-800">
                      <div className="w-16 h-16 admin-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Users size={32} className="text-pesantren-gold/30" />
                      </div>
                      <p className="text-[11px] font-bold admin-text-muted uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                        Detail Riwayat Keuangan dan Izin dapat diakses melalui menu utama admin secara terpisah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-card p-4 md:p-10 rounded-[3rem] shadow-sm transition-all border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col gap-8 mb-8">
          <div>
            <h3 className="text-4xl admin-heading admin-text-main transition-colors mb-2">Modul Kesantrian</h3>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-12 bg-pesantren-gold rounded-full" />
              <p className="text-[10px] admin-text-muted font-black uppercase tracking-[0.25em]">Manajemen Santri & Aktivitas</p>
            </div>
          </div>
          
          <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-200 dark:border-slate-800/80 w-full mb-2">
            <button 
              onClick={() => setActiveTab('students')}
              className={`flex items-center whitespace-nowrap justify-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'students' ? 'border-pesantren-gold text-pesantren-gold' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Users size={16} /> Data Santri
            </button>
            <button 
              onClick={() => setActiveTab('schedules')}
              className={`flex items-center whitespace-nowrap justify-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'schedules' ? 'border-pesantren-gold text-pesantren-gold' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Clock size={16} /> Jadwal Harian
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
            <div className="flex flex-col lg:flex-row gap-6 items-center px-4 md:px-0">
              <div className="flex-1 relative group w-full">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-pesantren-gold transition-colors duration-300" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau NIS santri..."
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 py-4 pl-14 pr-12 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-pesantren-gold/5 outline-none transition-all shadow-sm admin-text-main placeholder:admin-text-muted transition-colors"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 admin-text-muted hover:admin-text-main transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto">
                <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm transition-colors">
                  {['Semua', 'Aktif', 'Alumni', 'Keluar'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        statusFilter === status 
                          ? 'bg-white dark:bg-slate-800 admin-text-primary shadow-lg shadow-black/5' 
                          : 'admin-text-muted hover:admin-text-main'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Gender Filter */}
                <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm transition-colors">
                  {['Semua', 'Putra', 'Putri'].map((gender) => (
                    <button
                      key={gender}
                      disabled={(role === 'putra' && gender === 'Putri') || (role === 'putri' && gender === 'Putra')}
                      onClick={() => setRoleFilter(gender as any)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        roleFilter === gender 
                          ? 'bg-white dark:bg-slate-800 admin-text-primary shadow-lg shadow-black/5' 
                          : 'admin-text-muted hover:admin-text-main disabled:opacity-20'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>

                <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm transition-colors">
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-pesantren-gold shadow-lg shadow-black/5' : 'admin-text-muted hover:admin-text-main'}`}
                    title="Table View"
                  >
                    <ClipboardList size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-pesantren-gold shadow-lg shadow-black/5' : 'admin-text-muted hover:admin-text-main'}`}
                    title="Grid View"
                  >
                    <Users size={18} />
                  </button>
                </div>

                <button 
                  onClick={() => setIsAddingStudent(!isAddingStudent)}
                  className="flex-1 lg:flex-none px-8 py-4 bg-pesantren-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-pesantren-dark/10 hover:translate-y-[-2px] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isAddingStudent ? <X size={16} /> : <Plus size={16} />}
                  {isAddingStudent ? 'Batal' : 'Tambah Santri'}
                </button>
              </div>
            </div>

            {/* Student Form Modal */}
            <AnimatePresence>
            {(isAddingStudent || editingStudentId) && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setIsAddingStudent(false);
                    setEditingStudentId(null);
                  }}
                  className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  className="relative w-full max-w-4xl admin-card rounded-[2rem] shadow-2xl overflow-hidden"
                >
                  <form 
                    onSubmit={handleStudentSave}
                    className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar space-y-6"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pesantren-gold/10 text-pesantren-gold rounded-xl flex items-center justify-center">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold admin-text-main leading-tight">{editingStudentId ? 'Edit Santri' : 'Santri Baru'}</h4>
                          <p className="text-[11px] admin-text-muted font-bold uppercase tracking-widest mt-0.5">Informasi Profil Santri</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => { setIsAddingStudent(false); setEditingStudentId(null); }}
                        className="p-2 admin-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          <div className="space-y-1.5 lg:col-span-2">
                            <label className="text-[11px] font-black admin-text-muted uppercase tracking-widest ml-1">Nama Lengkap</label>
                            <input 
                              type="text" required
                              className={`w-full bg-gray-50 dark:bg-slate-900/50 border ${studentFormErrors.name ? 'border-rose-500' : 'border-gray-100 dark:border-slate-800'} p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main`}
                              value={studentFormData.name}
                              onChange={e => { setStudentFormData({...studentFormData, name: e.target.value}); setStudentFormErrors({...studentFormErrors, name: ''}); }}
                            />
                            {studentFormErrors.name && <p className="text-[10px] text-rose-500 px-1 font-bold">{studentFormErrors.name}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black admin-text-muted uppercase tracking-widest ml-1">Jenis Kelamin</label>
                            <select 
                              className={`w-full bg-gray-50 dark:bg-slate-900/50 border ${studentFormErrors.gender ? 'border-rose-500' : 'border-gray-100 dark:border-slate-800'} p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main disabled:opacity-50`}
                              value={studentFormData.gender}
                              onChange={e => { setStudentFormData({...studentFormData, gender: e.target.value as any}); setStudentFormErrors({...studentFormErrors, gender: ''}); }}
                              disabled={role === 'putra' || role === 'putri'}
                            >
                              <option value="Laki-laki">Putra</option>
                              <option value="Perempuan">Putri</option>
                            </select>
                            {studentFormErrors.gender && <p className="text-[10px] text-rose-500 px-1 font-bold">{studentFormErrors.gender}</p>}
                          </div>
                          

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Masuk</label>
                            <input 
                              type="number" required
                              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main"
                              value={studentFormData.entryYear}
                              onChange={e => setStudentFormData({...studentFormData, entryYear: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Wali</label>
                            <input 
                              type="text" required
                              className={`w-full bg-gray-50 dark:bg-slate-900/50 border ${studentFormErrors.parentName ? 'border-rose-500' : 'border-gray-100 dark:border-slate-800'} p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main`}
                              value={studentFormData.parentName}
                              onChange={e => { setStudentFormData({...studentFormData, parentName: e.target.value}); setStudentFormErrors({...studentFormErrors, parentName: ''}); }}
                            />
                            {studentFormErrors.parentName && <p className="text-[10px] text-rose-500 px-1 font-bold">{studentFormErrors.parentName}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">No. HP Wali</label>
                            <input 
                              type="tel" required
                              className={`w-full bg-gray-50 dark:bg-slate-900/50 border ${studentFormErrors.parentPhone ? 'border-rose-500' : 'border-gray-100 dark:border-slate-800'} p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main`}
                              value={studentFormData.parentPhone}
                              onChange={e => { setStudentFormData({...studentFormData, parentPhone: e.target.value}); setStudentFormErrors({...studentFormErrors, parentPhone: ''}); }}
                            />
                            {studentFormErrors.parentPhone && <p className="text-[10px] text-rose-500 px-1 font-bold">{studentFormErrors.parentPhone}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                            <select 
                              className={`w-full bg-gray-50 dark:bg-slate-900/50 border ${studentFormErrors.status ? 'border-rose-500' : 'border-gray-100 dark:border-slate-800'} p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main`}
                              value={studentFormData.status}
                              onChange={e => { setStudentFormData({...studentFormData, status: e.target.value as any}); setStudentFormErrors({...studentFormErrors, status: ''}); }}
                            >
                              <option value="Aktif">Aktif</option>
                              <option value="Alumni">Alumni</option>
                              <option value="Keluar">Keluar</option>
                            </select>
                            {studentFormErrors.status && <p className="text-[10px] text-rose-500 px-1 font-bold">{studentFormErrors.status}</p>}
                          </div>
                      </div>

                      <button 
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-[10px] font-black text-pesantren-gold uppercase tracking-widest flex items-center gap-2 hover:underline"
                      >
                        {showDetails ? 'Sembunyikan Detail' : 'Tambah Detail (NIS, Alamat, dll)'}
                      </button>

                      {showDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4 border-t border-gray-100">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">NIS</label>
                                <input 
                                type="text"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main"
                                value={studentFormData.nis}
                                onChange={e => setStudentFormData({...studentFormData, nis: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
                                <input 
                                type="text"
                                className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main"
                                value={studentFormData.birthPlace}
                                onChange={e => setStudentFormData({...studentFormData, birthPlace: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                                <input 
                                type="date" required
                                className={`w-full bg-gray-50 dark:bg-slate-900/50 border ${studentFormErrors.birthDate ? 'border-rose-500' : 'border-gray-100 dark:border-slate-800'} p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main`}
                                value={studentFormData.birthDate}
                                onChange={e => { setStudentFormData({...studentFormData, birthDate: e.target.value}); setStudentFormErrors({...studentFormErrors, birthDate: ''}); }}
                                />
                                {studentFormErrors.birthDate && <p className="text-[10px] text-rose-500 px-1 font-bold">{studentFormErrors.birthDate}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kelas</label>
                                <input 
                                  type="text" required
                                  className={`w-full bg-gray-50 dark:bg-slate-900/50 border ${studentFormErrors.class ? 'border-rose-500' : 'border-gray-100 dark:border-slate-800'} p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main`}
                                  value={studentFormData.class}
                                  onChange={e => { setStudentFormData({...studentFormData, class: e.target.value}); setStudentFormErrors({...studentFormErrors, class: ''}); }}
                                />
                                {studentFormErrors.class && <p className="text-[10px] text-rose-500 px-1 font-bold">{studentFormErrors.class}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kamar</label>
                                <input 
                                  type="text" required
                                  className={`w-full bg-gray-50 dark:bg-slate-900/50 border ${studentFormErrors.room ? 'border-rose-500' : 'border-gray-100 dark:border-slate-800'} p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main`}
                                  value={studentFormData.room}
                                  onChange={e => { setStudentFormData({...studentFormData, room: e.target.value}); setStudentFormErrors({...studentFormErrors, room: ''}); }}
                                />
                                {studentFormErrors.room && <p className="text-[10px] text-rose-500 px-1 font-bold">{studentFormErrors.room}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat</label>
                                <input 
                                  type="text"
                                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm admin-text-main"
                                  value={studentFormData.address}
                                  onChange={e => setStudentFormData({...studentFormData, address: e.target.value})}
                                />
                            </div>
                            <div className="lg:col-span-3">
                                <ImageUploadInput 
                                label="Foto Profil Santri (Upload / URL)"
                                value={studentFormData.photoUrl || ''}
                                onChange={val => setStudentFormData({...studentFormData, photoUrl: val})}
                                />
                            </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                       <button 
                        type="button" 
                        onClick={() => { setIsAddingStudent(false); setEditingStudentId(null); }}
                        className="px-6 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit" 
                        className="admin-btn-primary px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all"
                      >
                        <Save size={14} className="inline mr-2" />
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
            </AnimatePresence>

            {viewMode === 'grid' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {displayedStudents.length === 0 ? (
                  <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-gray-100 dark:border-slate-800">
                      <Users className="w-10 h-10 admin-text-muted mx-auto mb-3" />
                      <p className="admin-text-muted text-xs font-bold italic">Tidak ada santri ditemukan</p>
                  </div>
                ) : displayedStudents.map((s) => (
                  <motion.div 
                    key={s.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => fetchStudentDetails(s)}
                    className="admin-card p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all group cursor-pointer border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 truncate mr-4">
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-black transition-colors ${s.gender === 'Laki-laki' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'}`}>
                         {s.name.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{s.name}</h4>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.status === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:inline-block ${s.status === 'Aktif' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {s.status}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
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
                        className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 md:translate-x-2 md:group-hover:translate-x-0"
                      >
                        <Settings2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <Pagination />
            </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm group/table">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="sticky left-0 z-20 bg-gray-50/95 backdrop-blur-sm px-4 md:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-[2px_0_8px_rgba(0,0,0,0.02)]">Santri</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">NIS</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kelas / Kamar</th>
                          <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Wali</th>
                          <th className="px-4 md:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                          <th className="sticky right-0 z-20 bg-gray-50/95 backdrop-blur-sm px-4 md:px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right shadow-[-2px_0_8px_rgba(0,0,0,0.02)]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {displayedStudents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold italic text-xs">
                              Belum ada data santri ditemukan
                            </td>
                          </tr>
                        ) : displayedStudents.map((s) => (
                          <tr 
                            key={s.id} 
                            onClick={() => fetchStudentDetails(s)}
                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                          >
                            <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-4 md:px-6 py-4 shadow-[2px_0_8px_rgba(0,0,0,0.02)] transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm font-black shrink-0 ${s.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                                  {s.name.charAt(0)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-sm text-pesantren-dark truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">{s.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[11px] font-bold text-gray-500 tabular-nums">{s.nis || '-'}</td>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-bold text-pesantren-dark block">{s.class}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">{s.room}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[11px] font-bold text-gray-500">{s.parentName}</td>
                            <td className="px-4 md:px-6 py-4 text-center">
                               <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                 s.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 
                                 s.status === 'Alumni' ? 'bg-blue-50 text-blue-600' :
                                 'bg-rose-50 text-rose-600'
                               }`}>
                                 {s.status}
                               </span>
                            </td>
                            <td className="sticky right-0 z-10 bg-white group-hover:bg-gray-50 px-4 md:px-6 py-4 text-right shadow-[-2px_0_8px_rgba(0,0,0,0.02)] transition-colors">
                              <button onClick={(e) => {
                                e.stopPropagation();
                                setEditingStudentId(s.id);
                                setStudentFormData({ ...s, nis: s.nis || '', photoUrl: s.photoUrl || '', birthPlace: s.birthPlace || '', birthDate: s.birthDate || '', phone: s.phone || '', parentPhone: s.parentPhone || '' });
                                setIsAddingStudent(true);
                              }} className="p-2 text-gray-400 hover:text-pesantren-gold transition-colors inline-block">
                                <Settings2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Pagination />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="schedules-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-lg font-bold text-pesantren-dark">Jadwal Harian Santri</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Atur kegiatan rutin dari bangun tidur hingga istirahat</p>
              </div>
              <button 
                onClick={() => setIsAddingSchedule(!isAddingSchedule)}
                className="px-6 py-3 admin-btn-primary rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                {isAddingSchedule ? <X size={14} /> : <Plus size={14} />}
                {isAddingSchedule ? 'Batal' : 'Tambah Jadwal'}
              </button>
            </div>

            {isAddingSchedule || editingScheduleId ? (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleScheduleSave}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl space-y-6 text-left"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Waktu (Contoh: 04:00 - 05:00)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                      <input 
                        type="text" required
                        placeholder="HH:mm - HH:mm"
                        className="w-full bg-gray-50 border border-gray-100 p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm"
                        value={scheduleFormData.time}
                        onChange={e => setScheduleFormData({...scheduleFormData, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Kegiatan</label>
                    <input 
                      type="text" required
                      placeholder="Nama Kegiatan"
                      className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm"
                      value={scheduleFormData.activity}
                      onChange={e => setScheduleFormData({...scheduleFormData, activity: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Lokasi</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                      <input 
                        type="text"
                        placeholder="Masjid, Aula, dsb"
                        className="w-full bg-gray-50 border border-gray-100 p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm"
                        value={scheduleFormData.location}
                        onChange={e => setScheduleFormData({...scheduleFormData, location: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Urutan</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm"
                      value={scheduleFormData.order}
                      onChange={e => setScheduleFormData({...scheduleFormData, order: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi Tambahan</label>
                    <div className="relative">
                      <AlignLeft className="absolute left-3 top-3 text-gray-300" size={14} />
                      <textarea 
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-100 p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-pesantren-gold/30 transition-all text-sm"
                        value={scheduleFormData.description}
                        onChange={e => setScheduleFormData({...scheduleFormData, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingSchedule(false); setEditingScheduleId(null); }}
                    className="px-6 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="bg-pesantren-dark text-white px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save size={14} />
                    Simpan Jadwal
                  </button>
                </div>
              </motion.form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-100">
                    <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm font-bold italic">Belum ada jadwal harian yang diatur</p>
                  </div>
                ) : schedules.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-pesantren-gold transition-all duration-500 group-hover:w-2" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-pesantren-gold uppercase tracking-[0.2em]">{item.time}</span>
                        <h5 className="text-lg font-bold text-pesantren-dark mt-1">{item.activity}</h5>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingScheduleId(item.id);
                            setScheduleFormData({
                              time: item.time,
                              activity: item.activity,
                              description: item.description || '',
                              location: item.location || '',
                              order: item.order || 0
                            });
                            setIsAddingSchedule(true);
                          }}
                          className="p-2 text-gray-400 hover:text-pesantren-gold transition-colors"
                        >
                          <Settings2 size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (!confirm(`Hapus jadwal ${item.activity}?`)) return;
                            try {
                                const response = await fetch(`/api/daily_schedules/${item.id}`, { method: 'DELETE' });
                                if (!response.ok) throw new Error('Gagal menghapus');
                              toast.success('Jadwal dihapus');
                              fetchSchedules();
                            } catch (e) { console.error(e); toast.error('Gagal menghapus jadwal'); }
                          }}
                          className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {item.location && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{item.location}</span>
                        </div>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-500 leading-relaxed italic">{item.description}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                       <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Urutan: {item.order}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
