import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, FileText, 
  ArrowRight, Heart, Plus,
  Activity, Printer, Clock, Filter, TrendingUp, PieChart as PieIcon,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, getCountFromServer } from 'firebase/firestore';
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
  entryYear?: string;
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
    alumni: 0,
    prestasi: 0,
    pelanggaran: 0
  });
  const [enrollmentTrend, setEnrollmentTrend] = useState<any[]>([]);
  const [permitStatusDistribution, setPermitStatusDistribution] = useState<any[]>([]);

  const isSuperAdmin = role === 'all' || role === 'super';

  useEffect(() => {
    const fetchDetailedStats = async () => {
      try {
        // Fetch Students for summary and trend
        const studentSnap = await getDocs(collection(db, 'students'));
        const students = studentSnap.docs.map(d => d.data() as Student);
        
        // Fetch Achievements, Violations 
        const [achSnap, violSnap] = await Promise.all([
          getCountFromServer(collection(db, 'achievements')),
          getCountFromServer(collection(db, 'violations'))
        ]);

        const summary = {
          putra: students.filter(s => s.gender === 'Laki-laki').length,
          putri: students.filter(s => s.gender === 'Perempuan').length,
          active: students.filter(s => s.status === 'Aktif').length,
          alumni: students.filter(s => s.status === 'Alumni').length,
          prestasi: achSnap.data().count,
          pelanggaran: violSnap.data().count
        };
        setStudentSummary(summary);

        // Enrollment Trend
        const enrollmentCounts = students.reduce((acc, s) => {
          const year = s.entryYear || 'Unknown';
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setEnrollmentTrend(Object.entries(enrollmentCounts).map(([year, count]) => ({ name: year, count })).sort((a, b) => a.name.localeCompare(b.name)));

        // Fetch Permits
        const permitSnap = await getDocs(collection(db, 'permits'));
        const allPermits = permitSnap.docs.map(d => d.data() as Permit);

        // Recent Permits (limit 5)
        setRecentPermits(allPermits.sort((a,b) => b.createdAt.toDate() - a.createdAt.toDate()).slice(0, 5));

        // Permit Distribution
        const permitCounts = allPermits.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setPermitStatusDistribution(Object.entries(permitCounts).map(([status, count]) => ({ name: status, count })));

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
      
      {/* Header with Focused Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
        <div className="relative pl-6">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-pesantren-gold rounded-full" />
          <h2 className="text-3xl md:text-5xl font-serif font-black text-pesantren-dark dark:text-white mb-2 tracking-tighter">
            Ringkasan <span className="text-pesantren-gold italic">Data</span>
          </h2>
          <div className="flex items-center gap-4 text-gray-400">
             <DigitalClock className="scale-90 origin-left" showDate />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               Sistem Aktif
             </span>
          </div>
        </div>
        
        <Link to="/admin/kesantrian" className="px-6 py-4 bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-pesantren-gold/20 hover:scale-105 transition-all flex items-center gap-3 border border-white/10">
           <Plus size={16} /> Tambah Santri
        </Link>
      </div>

      {/* Tighter Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {studentStats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">{stat.name}</div>
                <div className="text-2xl font-black text-pesantren-dark dark:text-white tabular-nums tracking-tight">
                  {statsLoading ? '...' : stat.value}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution Card */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-pesantren-dark dark:text-white uppercase tracking-[0.2em]">Rasio Gender</h4>
            <PieIcon size={14} className="text-pesantren-gold" />
          </div>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', fontSize: '9px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-pesantren-dark dark:text-white">{stats.students}</span>
              <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {genderData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment Trend Card */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-pesantren-dark dark:text-white uppercase tracking-[0.2em]">Grafik Tahun Masuk</h4>
            <TrendingUp size={14} className="text-pesantren-gold" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', fontSize: '9px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">
            <span>Tahun Awal</span>
            <span>Tahun Saat Ini</span>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 flex flex-col">
          <h4 className="text-xs font-black text-pesantren-dark dark:text-white uppercase tracking-[0.2em] mb-6">Opsi Cepat</h4>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { label: 'Cetak', icon: Printer, path: '/admin/kesantrian', color: 'text-amber-500' },
              { label: 'Filter', icon: Filter, path: '/admin/kesantrian', color: 'text-indigo-500' },
              { label: 'Analisa', icon: Activity, path: '/admin/kesantrian', color: 'text-emerald-500' },
              { label: 'Unduh', icon: FileText, path: '/admin/kesantrian', color: 'text-rose-500' },
            ].map((action, i) => (
              <Link key={i} to={action.path} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-pesantren-gold/10 transition-colors group">
                <div className={`w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon size={14} />
                </div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Permits - Streamlined */}
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-pesantren-dark dark:text-white uppercase tracking-[0.2em]">Izin Santri Terbaru</h4>
            <Link to="/admin/kesantrian" className="text-[9px] font-black text-pesantren-gold uppercase tracking-[0.2em] hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {recentPermits.slice(0, 4).map((permit, i) => (
              <motion.div 
                key={permit.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-pesantren-gold/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-pesantren-gold shadow-xs">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-pesantren-dark dark:text-white tracking-tight">{permit.studentName}</h5>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{permit.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Disetujui</div>
                   <div className="text-[8px] text-gray-400 font-bold tabular-nums">
                    {permit.createdAt?.toDate ? permit.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Activities - Streamlined */}
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-pesantren-dark dark:text-white uppercase tracking-[0.2em]">Agenda Hari Ini</h4>
            <Clock size={14} className="text-pesantren-gold" />
          </div>
          <div className="space-y-3">
             {activities.slice(0, 3).map((activity, i) => (
               <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                 <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img src={activity.imageUrl} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div className="min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-pesantren-gold text-white text-[7px] font-black uppercase tracking-widest rounded-md">{activity.schedule}</span>
                      <h5 className="font-bold text-sm text-pesantren-dark dark:text-white truncate">{activity.title}</h5>
                   </div>
                   <p className="text-[9px] text-gray-400 line-clamp-1">{activity.description}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
}

