import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, Settings, LogOut, Home, 
  Image as ImageIcon, Building, Users, 
  ClipboardList, ArrowRight, X, FileText
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { Link, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menuItems = [
    { name: 'Ringkasan', icon: LayoutDashboard, path: '/admin' },
    { name: 'Kesantrian', icon: Users, path: '/admin/kesantrian' },
    { name: 'Kelola Santri', icon: ClipboardList, path: '/admin/registrations' },
    { name: 'Surat Izin', icon: FileText, path: '/admin/permits' },
    { name: 'Program Pendidikan', icon: BookOpen, path: '/admin/programs' },
    { name: 'Fasilitas', icon: Building, path: '/admin/facilities' },
    { name: 'Galeri Foto', icon: ImageIcon, path: '/admin/gallery' },
    { name: 'Pengaturan Web', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFCFD] flex font-sans overflow-hidden">
      {/* Sidebar - Desktop & Tablet */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-pesantren-dark text-white flex flex-col transition-all duration-700 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pesantren-gold/5 rounded-full translate-x-16 -translate-y-16 blur-3xl" />
        
        <div className="p-10 border-b border-white/5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-pesantren-gold rounded-2xl flex items-center justify-center text-pesantren-dark font-black text-2xl shadow-[0_10px_30px_-5px_rgba(197,160,89,0.4)] rotate-3 hover:rotate-0 transition-transform duration-500">
                S
              </div>
              <div className="leading-tight">
                <h1 className="text-xl font-serif font-bold text-white tracking-tight">Semar Admin</h1>
                <p className="text-[9px] text-pesantren-gold font-black uppercase tracking-[0.3em] mt-1">Management Hub</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white transition-colors">
              <X size={28} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-5 py-10 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
          <div className="px-5 mb-6">
             <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-4">
                Main Console
                <div className="flex-1 h-px bg-white/5" />
             </div>
          </div>
          
          {menuItems.slice(0, 3).map((item) => (
            <div key={item.path} onClick={() => setSidebarOpen(false)}>
              <MenuItem item={item} active={location.pathname === item.path} />
            </div>
          ))}
          
          <div className="px-5 mt-12 mb-6">
             <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-4">
                Operational
                <div className="flex-1 h-px bg-white/5" />
             </div>
          </div>
          
          {menuItems.slice(3).map((item) => (
            <div key={item.path} onClick={() => setSidebarOpen(false)}>
              <MenuItem item={item} active={location.pathname === item.path} />
            </div>
          ))}
        </nav>

        <div className="p-8 bg-black/20 border-t border-white/5">
           <div className="flex items-center gap-4 mb-6 px-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-pesantren-gold">
                 <Settings size={20} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Status Server</p>
                 <p className="text-[11px] font-bold text-pesantren-green flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pesantren-green animate-pulse" />
                    Operational
                 </p>
              </div>
           </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 text-white/60 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 group shadow-lg"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out Securely
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-pesantren-dark/80 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#FBFCFD] relative">
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 px-8 lg:px-12 py-6 sticky top-0 z-30 flex justify-between items-center transition-all">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 text-pesantren-dark bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
            >
              <LayoutDashboard size={24} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-1 h-6 bg-pesantren-gold rounded-full" />
                 <h2 className="text-2xl font-serif font-bold text-pesantren-dark leading-none">
                    {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard Overview'}
                 </h2>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-4">
                <span>Central Management</span>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <span className="text-pesantren-gold">{menuItems.find(i => i.path === location.pathname)?.name || 'Summary'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <div className="text-xs font-black text-pesantren-dark uppercase tracking-widest">{auth.currentUser?.displayName || 'Chief Admin'}</div>
              <div className="text-[9px] text-pesantren-gold font-black uppercase tracking-widest mt-1 opacity-70 tabular-nums">ID: {auth.currentUser?.uid.slice(0, 8)}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <div className="p-1.5 rounded-2xl bg-gradient-to-br from-pesantren-gold/30 to-pesantren-green/30">
                  <img src={auth.currentUser?.photoURL || 'https://ui-avatars.com/api/?name=Admin&background=1a2e26&color=c5a059'} className="w-12 h-12 rounded-[0.8rem] shadow-xl object-cover" alt="Avatar" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-pesantren-green border-4 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface MenuItemProps {
  item: any;
  active: boolean;
}

function MenuItem({ item, active }: MenuItemProps) {
  return (
    <Link
      key={item.path}
      to={item.path}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
        active 
          ? 'bg-pesantren-gold text-pesantren-dark shadow-[0_10px_30px_-5px_rgba(197,160,89,0.3)] scale-[1.03] translate-x-2' 
          : 'text-white/30 hover:bg-white/5 hover:text-white/80 hover:translate-x-1'
      }`}
    >
      <div className={`transition-all duration-500 ${active ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:-rotate-3'}`}>
        <item.icon size={22} className={active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
      </div>
      <span className={`font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
        {item.name}
      </span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="ml-auto w-2 h-2 rounded-full bg-pesantren-dark shadow-[0_0_15px_rgba(26,46,38,0.5)]"
        />
      )}
      
      {/* Hover effect highlight */}
      {!active && (
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity" />
      )}
    </Link>
  );
}
