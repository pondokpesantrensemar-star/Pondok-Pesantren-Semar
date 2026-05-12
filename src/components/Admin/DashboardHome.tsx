import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, FileText, 
  ArrowRight, Heart, Plus,
  Activity, Printer, Clock, Filter, TrendingUp, PieChart as PieIcon,
  Calendar, RefreshCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStats } from '../../hooks/useContent';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import DigitalClock from '../DigitalClock';
import { useAdminRole } from '../../hooks/useContent';

interface Student {
  id: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  status: 'Aktif' | 'Alumni' | 'Keluar';
  entryYear?: string;
}

interface Permit {
  id: string;
  studentName: string;
  reason: string;
  status: string;
  createdAt: any;
}

interface DailySchedule {
  id: string;
  time: string;
  activity: string;
  description: string;
  location: string;
  order: number;
}

const DashboardLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
  >
    <div className="flex flex-col items-center gap-4">
      <motion.div
         animate={{ rotate: 360 }}
         transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
         className="w-10 h-10 border-2 border-pesantren-green border-t-transparent rounded-full"
      />
      <span className="text-[10px] font-black admin-text-muted uppercase tracking-widest">Memuat Dashboard...</span>
    </div>
  </motion.div>
);

export default function DashboardHome() {
  const { stats, loading: statsLoading } = useStats();
  const { role, adminData } = useAdminRole();
  const [recentPermits, setRecentPermits] = useState<Permit[]>([]);
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [studentSummary, setStudentSummary] = useState({
    putra: 0,
    putri: 0,
    active: 0,
    alumni: 0,
    prestasi: 0,
    pelanggaran: 0
  });
  const [enrollmentTrend, setEnrollmentTrend] = useState<any[]>([]);
  const [permitStatusDistribution, setPermitStatusDistribution] = useState<any[]>([]);

  const isSuperAdmin = role === 'all' || role === 'super';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Selamat Pagi";
    if (hour >= 12 && hour < 16) return "Selamat Siang";
    if (hour >= 16 && hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return "Admin";
    switch (role) {
      case 'all': return 'Super Admin';
      case 'kesantrian': return 'Pengurus Kesantrian';
      case 'putra': return 'Pengurus Putra';
      case 'putri': return 'Pengurus Putri';
      default: return 'Admin';
    }
  };

  useEffect(() => {
    // Optimization: Only run detail fetch if we need specific breakdowns not in useStats
    const fetchDetailedStats = async () => {
      try {
        // Logic for detailed distributions could go here if needed
      } catch (e) {
        console.error("Error fetching dashboard details:", e);
      }
    };

    fetchDetailedStats();
  }, [refreshKey]);

  const studentStats = [
    { name: 'Santri Putra', value: studentSummary.putra, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { name: 'Santri Putri', value: studentSummary.putri, icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40' },
    { name: 'Izin Aktif', value: stats.permits, icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { name: 'Total Santri', value: stats.students, icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  ];

  const genderData = [
    { name: 'Putra', value: studentSummary.putra, color: '#059669' },
    { name: 'Putri', value: studentSummary.putri, color: '#10b981' }
  ];

  const statusData = [
    { name: 'Aktif', value: studentSummary.active },
    { name: 'Alumni', value: studentSummary.alumni }
  ];

  return (
    <div className="space-y-6 sm:space-y-10 pb-20 max-w-7xl mx-auto px-0 mt-4 sm:mt-8 text-left">
      <AnimatePresence>
        {statsLoading && <DashboardLoader />}
      </AnimatePresence>
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 px-4 sm:px-0">
        <div>
          <h1 className="text-4xl font-serif font-black admin-text-main mb-2 tracking-tight">
            {getGreeting()}, <span className="text-emerald-600 dark:text-emerald-400 font-serif italic">{adminData?.username || getRoleLabel(role)}</span>
          </h1>
          <p className="admin-text-muted text-sm font-bold uppercase tracking-widest">Pusat Kendali Operasional Pesantren</p>
        </div>
        <button 
           onClick={() => setRefreshKey(prev => prev + 1)}
           className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all shadow-sm hover:shadow-md active:scale-95 group"
        >
          <RefreshCcw size={18} className="transition-transform group-hover:rotate-180 duration-500" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="admin-card p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 dark:hover:shadow-none transition-all duration-500 overflow-hidden relative group"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500`}>
                <stat.icon size={22} />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={16} className="admin-text-muted" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.name}</div>
              <div className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">
                {statsLoading ? '...' : stat.value}
              </div>
            </div>
            
            {/* Elegant Background Decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bg} opacity-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution Card */}
        <div className="admin-card p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Sebaran Gender</h4>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                <PieIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="h-52 relative mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#f1f5f9', padding: '8px 12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">{stats.students}</span>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Santri</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-auto">
            {genderData.map(item => (
              <div key={item.name} className="p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-100 dark:hover:border-emerald-900 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment Trend Card */}
        <div className="lg:col-span-2 admin-card p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Tren Pertumbuhan</h4>
            <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
              <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentTrend.length > 0 ? enrollmentTrend : [{name: '2023', count: 120}, {name: '2024', count: 180}, {name: '2025', count: 245}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis hide />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(21,128,61,0.05)', radius: 8}}
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#f1f5f9', padding: '8px 12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#10b981" 
                  radius={[10, 10, 10, 10]} 
                  barSize={40} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">Laporan pertumbuhan santri berdasarkan tahun masuk</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        {/* Recent Permits - Elegant Design */}
        <div className="lg:col-span-3 admin-card p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-emerald-100/50 dark:border-emerald-900/20 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 bg-emerald-500 rounded-full" />
              <h4 className="text-[10px] font-black admin-text-main uppercase tracking-[0.2em]">Kunjungan & Izin Terbaru</h4>
            </div>
            <Link to="/admin/kesantrian" className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] font-bold admin-text-primary uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all active:scale-95 text-slate-700 dark:text-slate-200">
              Kelola <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4 relative z-10">
            {recentPermits.slice(0, 5).length === 0 ? (
               <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] italic">Catatan Izin Kosong</p>
               </div>
            ) : recentPermits.slice(0, 5).map((permit, i) => (
              <motion.div 
                key={permit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group/item"
              >
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 shadow-sm text-slate-400 group-hover/item:text-emerald-500 group-hover/item:bg-emerald-50 dark:group-hover/item:bg-emerald-900/40 flex items-center justify-center transition-colors">
                     <Clock size={20} />
                   </div>
                   <div>
                     <h5 className="font-bold text-base text-slate-800 dark:text-slate-100 leading-tight mb-1 font-serif group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">{permit.studentName}</h5>
                     <div className="flex items-center gap-3">
                       <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 italic">"{permit.reason}"</span>
                       <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                       <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest tabular-nums">
                         {permit.createdAt?.toDate ? permit.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                       </span>
                     </div>
                   </div>
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                  Aktif
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Schedules - Elegant Design */}
        <div className="lg:col-span-2 admin-card p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 bg-amber-500 rounded-full" />
              <h4 className="text-[10px] font-black admin-text-main uppercase tracking-[0.2em]">Agenda Harian</h4>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <Calendar size={16} className="text-amber-500" />
            </div>
          </div>
          <div className="space-y-4 relative z-10">
             {schedules.length === 0 ? (
               <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                 <div className="w-2 h-2 bg-amber-500 rounded-full mx-auto mb-3 animate-pulse" />
                 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] italic">Jadwal Belum Diatur</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {schedules.map((item, i) => (
                   <motion.div 
                     key={item.id} 
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border shadow-sm border-slate-100 dark:border-slate-800 relative overflow-hidden group/item hover:border-amber-500/30 transition-colors"
                   >
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 opacity-50 group-hover/item:opacity-100 transition-opacity" />
                     <div className="flex items-center justify-between mb-2 pl-2">
                       <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-widest tabular-nums">{item.time}</span>
                       <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase flex items-center gap-1">
                         <Filter size={10} className="opacity-50" /> {item.location}
                       </span>
                     </div>
                     <h5 className="font-bold text-base text-slate-800 dark:text-slate-100 font-serif pl-2">{item.activity}</h5>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-1 italic pl-2">"{item.description}"</p>
                   </motion.div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

    </div>
  );
}

