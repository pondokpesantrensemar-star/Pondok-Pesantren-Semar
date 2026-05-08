import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, Settings, LogOut, 
  Image as ImageIcon, Building, Users, Calendar,
  ClipboardList, X, Sun, Moon
} from 'lucide-react';
import { internalAuth } from '../../lib/internalAuth';
import { Link, useLocation } from 'react-router-dom';
import { useAdminRole } from '../../hooks/useContent';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const { adminData, role } = useAdminRole();
  const isSuperAdmin = role === 'all' || role === 'super';

  const menuItems = [
    { name: 'Ringkasan', icon: LayoutDashboard, path: '/admin' },
    { name: 'Kesantrian', icon: Users, path: '/admin/kesantrian' },
    { name: 'Kegiatan Harian', icon: Calendar, path: '/admin/activities' },
    { name: 'Program Pendidikan', icon: BookOpen, path: '/admin/programs' },
    { name: 'Fasilitas', icon: Building, path: '/admin/facilities' },
    { name: 'Galeri Foto', icon: ImageIcon, path: '/admin/gallery' },
    ...(isSuperAdmin ? [{ name: 'Kelola Staff', icon: ClipboardList, path: '/admin/staff' }] : []),
    { name: 'Pengaturan Web', icon: Settings, path: '/admin/settings' },
  ].filter(item => {
    // If Super Admin, see everything
    if (isSuperAdmin) return true;
    
    // If Kesantrian role, see dashboard, and kesantrian stuff
    if (role === 'kesantrian') {
      return ['Ringkasan', 'Kesantrian', 'Pengaturan Web'].includes(item.name);
    }
    
    // If Putra/Putri role, see dashboard and kesantrian stuff (filtered inside components)
    if (role === 'putra' || role === 'putri') {
      return ['Ringkasan', 'Kesantrian'].includes(item.name);
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 flex font-sans overflow-hidden">
      {/* Sidebar - Desktop & Tablet */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 flex flex-col transition-all duration-500 border-r border-gray-100 dark:border-white/5 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-gray-50 dark:border-white/5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pesantren-gold rounded-xl flex items-center justify-center text-pesantren-dark font-black text-xl shadow-sm">
                S
              </div>
              <h1 className="text-lg font-serif font-black text-pesantren-dark dark:text-white tracking-tight">Semar <span className="text-pesantren-gold">Hub</span></h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-300 hover:text-pesantren-dark transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar text-left">
          {menuItems.map((item) => (
            <div key={item.path} onClick={() => setSidebarOpen(false)}>
              <MenuItem item={item} active={location.pathname === item.path} />
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-black/10">
          <button 
            onClick={() => internalAuth.logout()}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-white/5 text-gray-400 dark:text-white/40 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-gray-100 dark:border-white/10 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 dark:hover:bg-red-500 dark:hover:text-white transition-all shadow-sm"
          >
            <LogOut size={14} />
            Sign Out
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
      <main className="flex-1 h-screen overflow-y-auto bg-white dark:bg-slate-950 transition-colors">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-8 lg:px-10 py-5 sticky top-0 z-30 flex justify-between items-center text-left">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-pesantren-dark dark:hover:text-white rounded-xl transition-all"
            >
              <LayoutDashboard size={20} />
            </button>
            <div className="flex items-center gap-3">
               <h2 className="text-xl font-serif font-bold text-pesantren-dark dark:text-white">
                  {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
               </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-gray-400 hover:text-pesantren-dark dark:hover:text-white rounded-xl transition-all"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="h-8 w-px bg-gray-100 dark:bg-white/5 mx-1 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end text-right">
                <div className="text-[10px] font-black text-pesantren-dark dark:text-white uppercase tracking-widest">
                  {adminData?.username || 'Admin'}
                </div>
                <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest opacity-60">
                  {role === 'all' ? 'Super Admin' : (role === 'kesantrian' ? 'Kesantrian' : role)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pesantren-gold/10 flex items-center justify-center text-pesantren-gold border border-pesantren-gold/20">
                <Users size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto text-left">
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
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-pesantren-dark dark:bg-pesantren-gold text-white dark:text-pesantren-dark shadow-lg shadow-pesantren-dark/10' 
          : 'text-gray-400 dark:text-gray-500 hover:text-pesantren-dark dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'opacity-100' : 'opacity-80'}`}>
        {item.name}
      </span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-pesantren-gold dark:bg-pesantren-dark"
        />
      )}
    </Link>
  );
}
