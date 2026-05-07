import React from 'react';
import { auth } from '../../lib/firebase';
import { motion } from 'motion/react';
import { 
  Users, BookOpen, Settings, 
  Image as ImageIcon, Building, ClipboardList, 
  ArrowRight, Heart, Star, TrendingUp, User, FileText, Plus, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStats, useRecentRegistrations } from '../../hooks/useContent';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import DigitalClock from '../DigitalClock';

export default function DashboardHome() {
  const { stats, loading: statsLoading } = useStats();
  const { registrations, loading: regLoading } = useRecentRegistrations();

  const quickTools = [
    { name: 'Kelola Galeri Foto', desc: 'Tambah/Edit & Filter Foto', icon: ImageIcon, path: '/admin/gallery', color: 'text-pink-600', bg: 'bg-pink-100/50', action: 'Edit Foto' },
    { name: 'Pengaturan Website', desc: 'Logo, Kontak & Alamat', icon: Settings, path: '/admin/settings', color: 'text-purple-600', bg: 'bg-purple-100/50', action: 'Update Identitas' },
    { name: 'Program Pendidikan', desc: 'Kurikulum & Jadwal', icon: BookOpen, path: '/admin/programs', color: 'text-blue-600', bg: 'bg-blue-100/50', action: 'Edit Program' },
    { name: 'Fasilitas Santri', desc: 'Asrama, Gedung & Lab', icon: Building, path: '/admin/facilities', color: 'text-amber-600', bg: 'bg-amber-100/50', action: 'Kelola Sarana' },
    { name: 'Kesantrian', desc: 'Eskul & Kegiatan', icon: Users, path: '/admin/kesantrian', color: 'text-pesantren-green', bg: 'bg-emerald-100/50', action: 'Update Kegiatan' },
    { name: 'Surat Izin Santri', desc: 'Pulang, Sakit, Kunjungan', icon: FileText, path: '/admin/permits', color: 'text-indigo-600', bg: 'bg-indigo-100/50', action: 'Buat Surat' },
    { name: 'Pendaftar Baru', desc: 'Approval Calon Santri', icon: ClipboardList, path: '/admin/registrations', color: 'text-emerald-600', bg: 'bg-emerald-100/50', action: 'Data Santri' },
  ];

  const statCards = [
    { name: 'Santri Putra', value: stats.putra, icon: User, color: 'text-blue-600', trend: 'Laki-laki', description: 'Total santri putra' },
    { name: 'Santri Putri', value: stats.putri, icon: Heart, color: 'text-pink-600', trend: 'Perempuan', description: 'Total santri putri' },
    { name: 'Data Santri', value: stats.registrations, icon: ClipboardList, color: 'text-emerald-600', trend: 'Santri Baru', description: 'Jumlah calon santri masuk' },
    { name: 'Surat Izin', value: stats.permits, icon: FileText, color: 'text-indigo-600', trend: 'Kesantrian', description: 'Surat izin diterbitkan' },
    { name: 'Galeri', value: stats.gallery, icon: ImageIcon, color: 'text-orange-600', trend: 'Dokumentasi', description: 'Foto & Momen' },
  ];

  const chartData = [
    { name: 'Sen', val: 0 },
    { name: 'Sel', val: 0 },
    { name: 'Rab', val: 0 },
    { name: 'Kam', val: 0 },
    { name: 'Jum', val: 0 },
    { name: 'Sab', val: stats.registrations },
    { name: 'Min', val: stats.registrations },
  ];

  const isSuperAdmin = auth.currentUser?.email?.toLowerCase().trim() === 'pondokpesantrensemar@gmail.com';

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Streamlined Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-50 text-pesantren-green text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-pesantren-green animate-pulse" />
               System Live
            </span>
          </div>
          <h2 className="text-2xl md:text-5xl font-serif font-bold text-pesantren-dark tracking-tight leading-none mb-4">
            Ahlan wa Sahlan, <span className="engraved-text italic px-2">{auth.currentUser?.displayName?.split(' ')[0] || 'Admin'}</span>
          </h2>
          <div className="flex items-center gap-6 text-gray-400">
             <DigitalClock className="scale-90 origin-left" showDate />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 relative z-10 w-full md:w-auto">
          <Link to="/admin/registrations" className="flex-1 md:flex-none px-6 py-4 md:px-10 md:py-5 bg-pesantren-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
             <ClipboardList size={18} />
             Data Santri
          </Link>
          <Link to="/admin/gallery?action=add" className="flex-1 md:flex-none px-6 py-4 md:px-10 md:py-5 border-2 border-pesantren-gold text-pesantren-gold rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-pesantren-gold hover:text-white transition-all flex items-center justify-center gap-3">
             <Plus size={18} />
             Tambah Foto
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-pesantren-gold/5 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-gray-50 to-transparent" />
      </div>

      {/* Main Grid: Stats & Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Stats Column */}
        <div className="xl:col-span-4 space-y-4">
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 flex items-center gap-3 px-2">
             Key Metrics
             <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all group flex items-center gap-6"
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.color.replace('text', 'bg').replace('-600', '-50')} ${stat.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.name}</h4>
                  <div className="text-2xl font-black text-pesantren-dark leading-none tabular-nums flex items-baseline gap-2">
                    {statsLoading ? '...' : stat.value}
                    <span className="text-[9px] font-bold text-pesantren-green bg-green-50 px-2 py-0.5 rounded-full uppercase scale-75 origin-left">Live</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-200 group-hover:text-pesantren-gold group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Analytics & Quick Access Column */}
        <div className="xl:col-span-8 space-y-8">
           {/* Chart */}
           <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-gray-50 shadow-sm relative overflow-hidden h-[300px] md:h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-lg md:text-xl font-serif font-bold text-pesantren-dark">Tren Pendaftaran</h3>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">Mingguan • Real-time Data</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-pesantren-gold" />
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Santri Baru</span>
                </div>
              </div>
              
              <div className="flex-1 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c5a059" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#c5a059" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600, letterSpacing: '0.1em' }} 
                      dy={15} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold', padding: '12px 20px' }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="val" 
                      stroke="#c5a059" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorVal)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Chart Decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50/30 to-transparent pointer-events-none" />
           </div>

           {/* Quick Access */}
           <div className="bg-pesantren-dark p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <h3 className="text-xl font-serif font-bold text-white">Modul Operasional</h3>
                 <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-pesantren-gold">
                    <TrendingUp size={20} />
                 </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {quickTools.slice(0, 4).map((tool, i) => (
                  <Link key={tool.name} to={tool.path}>
                    <motion.div 
                      whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                      className="bg-white/5 p-6 rounded-2xl border border-white/5 transition-all text-center flex flex-col items-center gap-4 group/item"
                    >
                      <div className={`w-14 h-14 rounded-full ${tool.bg} ${tool.color} flex items-center justify-center shrink-0 shadow-lg group-hover/item:rotate-12 transition-transform`}>
                        <tool.icon size={24} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover/item:text-pesantren-gold transition-colors">{tool.name.split(' ').pop()}</div>
                        <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] mt-1">Open Module</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
              
              {/* Background Glow */}
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pesantren-gold/5 rounded-full blur-[100px]" />
           </div>
        </div>
      </div>

      {/* Bottom Row: Recent Data & Staff Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Table */}
        <div className="lg:col-span-8 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-6 md:px-10 py-6 md:py-8 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-pesantren-dark">Status Pendaftaran</h3>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">Entri terbaru santri baru</p>
            </div>
            <Link to="/admin/registrations" className="flex items-center gap-2 group">
               <span className="text-[10px] font-black uppercase tracking-widest text-pesantren-gold group-hover:text-pesantren-green transition-colors">Semua</span>
               <ArrowRight size={14} className="text-pesantren-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/20">
                  <th className="text-left px-6 md:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identitas</th>
                  <th className="text-left px-4 md:px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Program</th>
                  <th className="text-right px-6 md:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {regLoading ? (
                  <tr><td colSpan={3} className="text-center py-20 text-xs font-bold text-gray-300 italic">Sinkronisasi...</td></tr>
                ) : registrations.length > 0 ? (
                  registrations.slice(0, 6).map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 md:px-10 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-black">
                              {reg.fullName.charAt(0)}
                           </div>
                           <div>
                              <div className="text-xs font-black text-pesantren-dark group-hover:text-pesantren-gold transition-colors">{reg.fullName}</div>
                              <div className="text-[9px] text-gray-400 font-mono tracking-tighter mt-0.5">{new Date(reg.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-pesantren-dark uppercase tracking-tight">{reg.program}</span>
                           <span className="text-[9px] text-gray-400 uppercase tracking-widest">{reg.gender === 'Laki-laki' ? 'Putra' : 'Putri'}</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-10 py-4 text-right">
                        <span className={`px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${
                          reg.status === 'Verified' ? 'bg-green-500 text-white' : 'bg-pesantren-gold text-white'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-20">
                       <div className="flex flex-col items-center gap-3 opacity-20">
                          <ClipboardList size={40} />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Basis Data Kosong</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Management Column */}
        <div className="lg:col-span-4 space-y-6">
           {isSuperAdmin && (
             <Link 
               to="/admin/settings" 
               className="prestige-card p-10 flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group hover:scale-[1.02] transition-all"
             >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-pesantren-dark text-pesantren-gold rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                    <ShieldCheck size={24} className="text-pesantren-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-pesantren-dark leading-none">Manajemen Pengurus</h3>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1">Satu Akses Terpadu</p>
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
                   <p className="text-xs text-gray-400 font-medium leading-relaxed">
                     Pengaturan akun administrator kini telah disatukan di menu <strong>Pengaturan Web</strong> untuk akses yang lebih rapi dan aman.
                   </p>
                   
                   <div className="p-6 bg-pesantren-gold/10 rounded-2xl border border-pesantren-gold/20">
                      <div className="flex items-center gap-3 text-pesantren-dark font-black text-[10px] uppercase tracking-widest">
                         <Star size={16} className="text-pesantren-gold" />
                         Fitur Multi-Akses
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">Kelola pendaftaran santri khusus unit Putra atau Putri dengan hak akses terbatas.</p>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between group-hover:text-pesantren-gold transition-colors">
                   <span className="text-[10px] font-black uppercase tracking-widest font-bold">Buka Menu Pengaturan</span>
                   <ArrowRight size={16} />
                </div>
             </Link>
           )}

           {!isSuperAdmin && (
             <div className="bg-pesantren-green p-10 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                   <Star size={32} className="text-pesantren-gold" />
                </div>
                <h4 className="text-xl font-serif font-bold italic">Khidmat Terbaik</h4>
                <p className="text-xs text-white/60 leading-relaxed font-light">Gunakan portal ini dengan bijak untuk memajukan pendidikan umat.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
