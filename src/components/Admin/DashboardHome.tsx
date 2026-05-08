import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, FileText, 
  ArrowRight, Heart, User, Plus, ShieldCheck,
  Activity, Printer, Clock, Filter, TrendingUp, PieChart as PieIcon,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
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
}

interface Permit {
  id: string;
  studentName: string;
  reason: string;
  status: string;
  createdAt: any;
}

interface ActivityItem {
  id: string;
  title: string;
  schedule: string;
  imageUrl: string;
  description: string;
}

const DashboardLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm"
  >
    <motion.div
       animate={{ 
         scale: [1, 1.2, 1], 
         rotate: [0, 180, 0],
         borderRadius: ["20%", "50%", "20%"]
       }}
       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
       className="w-16 h-16 border-4 border-pesantren-gold border-t-transparent"
    />
  </motion.div>
);

export default function DashboardHome() {
  const { stats, loading: statsLoading } = useStats();
  const { role, adminData } = useAdminRole();
  const [recentPermits, setRecentPermits] = useState<Permit[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [studentSummary, setStudentSummary] = useState({
    putra: 0,
    putri: 0,
    active: 0,
    alumni: 0
  });

  const isSuperAdmin = role === 'all' || role === 'super';

  useEffect(() => {
    const fetchDetailedStats = async () => {
      try {
        // Fetch Students for summary
        const studentSnap = await getDocs(collection(db, 'students'));
        const students = studentSnap.docs.map(d => d.data() as Student);
        
        setStudentSummary({
          putra: students.filter(s => s.gender === 'Laki-laki').length,
          putri: students.filter(s => s.gender === 'Perempuan').length,
          active: students.filter(s => s.status === 'Aktif').length,
          alumni: students.filter(s => s.status === 'Alumni').length
        });

        // Fetch Recent Permits
        const permitSnap = await getDocs(query(
          collection(db, 'permits'), 
          orderBy('createdAt', 'desc'), 
          limit(5)
        ));
        setRecentPermits(permitSnap.docs.map(d => ({ 
          id: d.id, 
          ...d.data() 
        } as Permit)));

        // Fetch Activities
        const activitySnap = await getDocs(query(collection(db, 'kesantrian'), limit(3)));
        setActivities(activitySnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as ActivityItem)));
      } catch (e) {
        console.error("Error fetching dashboard details:", e);
      }
    };

    fetchDetailedStats();
  }, []);

  const studentStats = [
    { name: 'Total Santri', value: stats.students, icon: Users, color: 'text-pesantren-dark', bg: 'bg-pesantren-dark/5' },
    { name: 'Santri Putra', value: studentSummary.putra, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Santri Putri', value: studentSummary.putri, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'Izin Aktif', value: stats.permits, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const genderData = [
    { name: 'Putra', value: studentSummary.putra, color: '#2563eb' },
    { name: 'Putri', value: studentSummary.putri, color: '#e11d48' }
  ];

  const statusData = [
    { name: 'Aktif', value: studentSummary.active },
    { name: 'Alumni', value: studentSummary.alumni }
  ];

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0 mt-8 text-left">
      <AnimatePresence>
        {statsLoading && <DashboardLoader />}
      </AnimatePresence>
      
      {/* Header with Glassmorphism touch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-4">
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-20 bg-pesantren-gold rounded-full opacity-50" />
          <h2 className="text-4xl md:text-6xl font-serif font-black text-pesantren-dark dark:text-white mb-3 tracking-tight">
            Dashboard <span className="text-pesantren-gold italic">Santri</span>
          </h2>
          <div className="flex items-center gap-6 text-gray-400 dark:text-gray-500">
             <DigitalClock className="scale-110 origin-left" showDate />
             <div className="w-1.5 h-1.5 rounded-full bg-pesantren-gold/30" />
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2.5">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               Live Monitoring
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link to="/admin/kesantrian" className="flex-1 md:flex-none px-10 py-5 bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl hover:shadow-pesantren-gold/20 hover:scale-105 transition-all flex items-center justify-center gap-3 border border-white/10">
             <Plus size={18} /> Registrasi Santri
          </Link>
        </div>
      </div>

      {/* Stats Cards - Upgraded to Prestige */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {studentStats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`prestige-card p-10 hover:scale-[1.02] transition-all group cursor-default`}
          >
            <div className="flex flex-col gap-8">
              <div className={`w-16 h-16 rounded-[1.5rem] ${stat.bg} ${stat.color} flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm`}>
                <stat.icon size={28} />
              </div>
              <div>
                <div className="text-[11px] font-black text-pesantren-muted uppercase tracking-[0.25em] mb-2">{stat.name}</div>
                <div className="text-5xl font-black text-pesantren-dark dark:text-white tabular-nums tracking-tighter">
                  {statsLoading ? '...' : stat.value}
                </div>
              </div>
              <div className="pt-2 border-t border-pesantren-gold/10 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Database Terkoneksi</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="prestige-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-lg font-serif font-black text-pesantren-dark dark:text-white uppercase tracking-wider">Rasio Gender</h4>
                <PieIcon size={18} className="text-pesantren-gold" />
              </div>
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-pesantren-dark dark:text-white">{stats.students}</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                </div>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                {genderData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="prestige-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-lg font-serif font-black text-pesantren-dark dark:text-white uppercase tracking-wider">Distribusi Status</h4>
                <Activity size={18} className="text-pesantren-gold" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                    />
                    <YAxis hide />
                    <RechartsTooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', fontSize: '10px' }}
                    />
                    <Bar dataKey="value" fill="#c5a059" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="prestige-card p-10 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-serif font-black text-pesantren-dark dark:text-white">Izin Santri Terbaru</h3>
                <p className="text-[10px] text-pesantren-muted uppercase tracking-[0.2em] font-bold mt-1.5">Arsip Perizinan Real-Time</p>
              </div>
              <Link to="/admin/kesantrian" className="px-6 py-3 border border-pesantren-gold/30 text-[10px] font-black text-pesantren-gold uppercase tracking-[0.2em] rounded-full hover:bg-pesantren-gold hover:text-white transition-all">Lihat Selengkapnya</Link>
            </div>

            <div className="space-y-4">
              {recentPermits.length > 0 ? recentPermits.map((permit, i) => (
                <motion.div 
                  key={permit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-8 bg-pesantren-cream dark:bg-slate-800/30 rounded-[2rem] border border-transparent hover:border-pesantren-gold/30 hover:shadow-xl hover:shadow-pesantren-gold/5 transition-all group"
                >
                  <div className="flex items-center gap-8">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-pesantren-gold shadow-sm group-hover:scale-110 transition-transform">
                      <Clock size={22} />
                    </div>
                    <div>
                      <h4 className="font-black text-pesantren-dark dark:text-white text-lg tracking-tight">{permit.studentName}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-pesantren-muted font-black uppercase tracking-widest bg-white dark:bg-slate-700 px-3 py-1 rounded-full border border-pesantren-gold/10">{permit.reason}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 text-right">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Disetujui</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {permit.createdAt?.toDate ? permit.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : 'Hari Ini'}
                    </span>
                  </div>
                </motion.div>
              )) : (
                <div className="py-24 text-center opacity-30">
                  <FileText size={64} className="mx-auto mb-6 text-pesantren-gold" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Arsip Kosong</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Activities Section */}
          {isSuperAdmin && (
            <div className="prestige-card p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-serif font-black text-pesantren-dark dark:text-white">Kegiatan Harian</h3>
                  <p className="text-[10px] text-pesantren-muted uppercase tracking-[0.2em] font-bold mt-1.5">Agenda & Rutinitas Santri</p>
                </div>
                <Link to="/admin/activities" className="px-6 py-3 border border-pesantren-gold/30 text-[10px] font-black text-pesantren-gold uppercase tracking-[0.2em] rounded-full hover:bg-pesantren-gold hover:text-white transition-all">Manajemen</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activities.length > 0 ? activities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-pesantren-cream dark:bg-slate-800/30 rounded-[2rem] overflow-hidden border border-transparent hover:border-pesantren-gold/30 transition-all shadow-sm flex flex-col"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={activity.imageUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dee6b?q=80&w=2070&auto=format&fit=crop'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={activity.title}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-pesantren-dark shadow-lg">
                          {activity.schedule}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h4 className="font-serif font-bold text-lg text-pesantren-dark dark:text-white mb-2 line-clamp-1">{activity.title}</h4>
                      <p className="text-[10px] text-pesantren-muted line-clamp-2 leading-relaxed">{activity.description}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-full py-12 text-center opacity-30">
                    <Calendar size={48} className="mx-auto mb-4 text-pesantren-gold" />
                    <p className="text-xs font-black uppercase tracking-widest">Belum ada kegiatan</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="lg:col-span-4 space-y-10">
          <div className="prestige-card p-10">
            <h4 className="text-lg font-serif font-black text-pesantren-dark dark:text-white uppercase tracking-wider mb-8">Akses Cepat</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Cetak', icon: Printer, path: '/admin/kesantrian', color: 'bg-amber-500' },
                { label: 'Saring', icon: Filter, path: '/admin/kesantrian', color: 'bg-indigo-500' },
                { label: 'Analisis', icon: TrendingUp, path: '/admin/kesantrian', color: 'bg-emerald-500' },
                { label: 'Export', icon: FileText, path: '/admin/kesantrian', color: 'bg-rose-500' },
              ].map((action, i) => (
                <Link key={i} to={action.path} className="group">
                  <div className="bg-pesantren-cream dark:bg-slate-800/50 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all hover:bg-pesantren-dark dark:hover:bg-pesantren-gold group-hover:-translate-y-1">
                    <div className={`w-10 h-10 rounded-xl ${action.color} text-white flex items-center justify-center group-hover:bg-white group-hover:text-pesantren-dark transition-colors shadow-lg`}>
                      <action.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-pesantren-muted group-hover:text-white dark:group-hover:text-pesantren-dark transition-colors">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

