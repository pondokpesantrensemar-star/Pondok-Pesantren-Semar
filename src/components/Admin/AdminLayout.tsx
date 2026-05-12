import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, BookOpen, Settings, LogOut, 
  ImageIcon, Building, Users, Calendar,
  ClipboardList, X, ExternalLink, CreditCard, FileText,
  Menu, ChevronLeft, ChevronRight, Banknote, ChevronDown
} from 'lucide-react';
import { internalAuth } from '../../lib/internalAuth';
import { Link, useLocation } from 'react-router-dom';
import { useAdminRole } from '../../hooks/useContent';
import BackToTop from '../BackToTop';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const mainRef = React.useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('admin_theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [settings, setSettings] = React.useState<any>({});

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('admin_theme', next);
      return next;
    });
  };

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('admin_sidebar_expanded');
    return saved ? JSON.parse(saved) : {
      'Utama': true,
      'Konten & Fasilitas': true,
      'Administrasi': true
    };
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => {
      const newState = {
        ...prev,
        [title]: !prev[title]
      };
      localStorage.setItem('admin_sidebar_expanded', JSON.stringify(newState));
      return newState;
    });
  };

  React.useEffect(() => {
    // Load Settings
    const savedSettings = localStorage.getItem('pesantren_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data);
      localStorage.setItem('pesantren_settings', JSON.stringify(data));
    }).catch(console.error);

    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { adminData, role } = useAdminRole();
  const isSuperAdmin = role === 'all' || role === 'super';

  const menuItems = [
    { name: 'Ringkasan', icon: LayoutDashboard, path: '/admin' },
    { name: 'Kesantrian', icon: Users, path: '/admin/kesantrian' },
    { name: 'Izin Santri', icon: FileText, path: '/admin/permits' },
    { name: 'Keuangan', icon: CreditCard, path: '/admin/financial' },
    { name: 'Pelanggaran', icon: ClipboardList, path: '/admin/prayer' },
    { name: 'Kegiatan Harian', icon: Calendar, path: '/admin/activities' },
    { name: 'Program Pendidikan', icon: BookOpen, path: '/admin/programs' },
    { name: 'Berita', icon: FileText, path: '/admin/news' },
    { name: 'Fasilitas', icon: Building, path: '/admin/facilities' },
    { name: 'Galeri Foto', icon: ImageIcon, path: '/admin/gallery' },
    ...(isSuperAdmin ? [{ name: 'Kelola Staff', icon: ClipboardList, path: '/admin/staff' }] : []),
    { name: 'Pengaturan Web', icon: Settings, path: '/admin/settings' },
  ].filter(item => {
    // If Super Admin, see everything
    if (isSuperAdmin) return true;
    
    // If Kesantrian role, see dashboard, and kesantrian stuff
    if (role === 'kesantrian') {
      return ['Ringkasan', 'Kesantrian', 'Izin Santri', 'Keuangan', 'Pelanggaran', 'Pengaturan Web'].includes(item.name);
    }
    
    // If Putra/Putri role, see dashboard and kesantrian stuff (filtered inside components)
    if (role === 'putra' || role === 'putri') {
      return ['Ringkasan', 'Kesantrian', 'Izin Santri', 'Keuangan', 'Pelanggaran'].includes(item.name);
    }

    return true;
  });

  const menuGroups = [
    {
      title: 'Utama',
      items: menuItems.filter(i => ['Ringkasan', 'Kesantrian', 'Izin Santri', 'Keuangan', 'Pelanggaran', 'Kegiatan Harian'].includes(i.name))
    },
    {
      title: 'Konten & Fasilitas',
      items: menuItems.filter(i => ['Program Pendidikan', 'Berita', 'Fasilitas', 'Galeri Foto'].includes(i.name))
    },
    {
      title: 'Administrasi',
      items: menuItems.filter(i => ['Kelola Staff', 'Pengaturan Web'].includes(i.name))
    }
  ].filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-white flex font-sans overflow-hidden">
      <style>{`
        :root {
          --admin-primary: #15803d; /* pesantren-green intensified */
          --admin-primary-dark: #064e3b; /* pesantren-dark */
          --admin-primary-soft: #fcfbf7; /* matching cream */
          --admin-primary-border: #f1f5f9;
          --admin-gold: #c5a059; /* refined gold */
          --admin-sidebar-bg: #ffffff;
          --admin-sidebar-border: #f1f5f9;
          --admin-sidebar-text: #475569;
          --admin-sidebar-hover-bg: #f8fafc;
          --admin-sidebar-hover-text: #15803d;
          --admin-bg-page: #f8fafc;
          --admin-card-bg: #ffffff;
          --admin-card-border: #f1f5f9;
          --admin-text-main: #0f172a;
          --admin-text-muted: #64748b;
        }
        .dark {
          --admin-sidebar-bg: #0f172a;
          --admin-sidebar-border: #1e293b;
          --admin-sidebar-text: #94a3b8;
          --admin-sidebar-hover-bg: #1e293b;
          --admin-sidebar-hover-text: #34d399;
          --admin-primary-soft: #064e3b;
          --admin-primary-border: #065f46;
          --admin-bg-page: #020617;
          --admin-card-bg: #0f172a;
          --admin-card-border: #1e293b;
          --admin-text-main: #f1f5f9;
          --admin-text-muted: #94a3b8;
        }
        .admin-sidebar {
          background-color: var(--admin-sidebar-bg) !important;
          border-right: 1px solid var(--admin-sidebar-border);
        }
        .admin-sidebar-item {
          color: var(--admin-sidebar-text) !important;
          font-size: 14px !important;
        }
        .admin-sidebar-item:hover {
          color: var(--admin-sidebar-hover-text) !important;
          background-color: var(--admin-sidebar-hover-bg) !important;
        }
        .admin-sidebar-active {
          background: linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-primary-dark) 100%) !important;
          color: white !important;
          box-shadow: 0 10px 20px -3px rgba(21, 128, 61, 0.4);
        }
        .admin-sidebar-active svg {
          color: white !important;
        }
        .admin-header {
          background-color: var(--admin-sidebar-bg) !important;
          border-bottom: 1px solid var(--admin-sidebar-border);
        }
        .admin-main {
          background-color: var(--admin-bg-page) !important;
        }
        .admin-card {
          background-color: var(--admin-card-bg) !important;
          border-color: var(--admin-card-border) !important;
        }
        .admin-btn-primary {
          background-color: var(--admin-primary) !important;
          color: white !important;
        }
        .admin-btn-soft {
          background-color: var(--admin-primary-soft) !important;
          color: var(--admin-primary-dark) !important;
          border-color: var(--admin-primary-border) !important;
        }
        .admin-text-primary {
          color: var(--admin-primary) !important;
        }
        .admin-bg-primary {
          background-color: var(--admin-primary) !important;
        }
        .admin-focus-ring-primary:focus {
          ring-color: var(--admin-primary) !important;
        }
        .admin-heading {
          font-family: "Cormorant Garamond", serif !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
          border-radius: 10px;
        }
      `}</style>
      
      <motion.aside
        initial={false}
        animate={{ 
          x: isMobile ? (sidebarOpen ? 0 : -280) : 0,
          width: isMobile ? 280 : (isCollapsed ? 80 : 280)
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 admin-sidebar flex flex-col shadow-xl lg:shadow-none transition-colors"
      >
        <div className={`p-6 border-b border-gray-100 relative admin-sidebar sticky top-0 z-20 transition-all ${isCollapsed && !isMobile ? 'px-4' : 'px-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 admin-bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0 overflow-hidden">
                {settings?.schoolLogo ? (
                  <img src={settings.schoolLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  "S"
                )}
              </div>
              <AnimatePresence mode="wait">
                {(!isCollapsed || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap"
                  >
                    <h1 className="text-base font-black admin-text-main tracking-tight leading-none mb-0.5">Semar <span className="admin-text-primary">Hub</span></h1>
                    <p className="text-[9px] font-bold admin-text-muted uppercase tracking-[0.2em]">Pesantren OS</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {isMobile ? (
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} />
              </button>
            ) : (
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className="text-slate-300 hover:text-slate-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg border border-gray-100"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar text-left">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups[group.title];
            
            return (
              <div key={group.title} className="pb-2">
                <AnimatePresence mode="wait">
                  {(!isCollapsed || isMobile) ? (
                    <button 
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between px-4 mb-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] hover:text-emerald-600 transition-all py-2 rounded-lg hover:bg-slate-50 group"
                    >
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group-hover:translate-x-1 transition-transform"
                      >
                        {group.title}
                      </motion.span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 0 : -90 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="text-slate-300 group-hover:text-emerald-600 transition-colors"
                      >
                        <ChevronDown size={12} />
                      </motion.div>
                    </button>
                  ) : (
                    <div className="h-px bg-gray-100 my-4 mx-2" />
                  )}
                </AnimatePresence>
                
                <motion.div 
                  initial={false}
                  animate={{ 
                    height: (!isCollapsed || isMobile) ? (isExpanded ? 'auto' : 0) : 'auto',
                    opacity: (!isCollapsed || isMobile) ? (isExpanded ? 1 : 0) : 1
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="space-y-1 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-xl text-[13px] font-bold transition-all group relative ${
                          isCollapsed && !isMobile ? 'px-0 justify-center h-11' : 'px-4 py-2.5'
                        } ${
                          isActive
                            ? 'admin-sidebar-active'
                            : 'admin-sidebar-item'
                        }`}
                        title={isCollapsed ? item.name : ""}
                      >
                        <item.icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                        <AnimatePresence mode="wait">
                          {(!isCollapsed || isMobile) && (
                            <motion.span
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -5 }}
                              className="whitespace-nowrap"
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        
                        {/* Tooltip for collapsed mode */}
                        {isCollapsed && !isMobile && (
                          <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl border border-slate-700">
                            {item.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Bottom Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 space-y-1 bg-white dark:bg-slate-900">
           <button
            onClick={() => internalAuth.logout()}
            className={`w-full flex items-center gap-3 rounded-xl text-[13px] font-bold transition-all group relative text-slate-400 hover:text-rose-500 hover:bg-rose-50 ${
              isCollapsed && !isMobile ? 'px-0 justify-center h-11' : 'px-4 py-3'
            }`}
            title="Keluar Panel"
          >
            <LogOut size={18} className="shrink-0 group-hover:rotate-12 transition-transform" />
            {(!isCollapsed || isMobile) && (
              <span className="whitespace-nowrap">Keluar Panel</span>
            )}
            {isCollapsed && !isMobile && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-rose-600 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl">
                Keluar Panel
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main 
        ref={mainRef} 
        animate={{ 
          marginLeft: isMobile ? 0 : (isCollapsed ? 80 : 280)
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex-1 h-screen overflow-y-auto admin-main transition-colors pb-32 lg:pb-8"
      >
        <header className="admin-header backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 flex justify-between items-center text-left">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 admin-text-muted hover:text-emerald-600 rounded-xl transition-all bg-gray-100 dark:bg-slate-800 shadow-inner"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-4">
               <div className="hidden sm:block w-1.5 h-6 admin-bg-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <h3 className="text-sm sm:text-base font-black admin-text-main tracking-tight">
                 {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
               </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <button
               onClick={toggleTheme}
               className="p-2.5 admin-btn-soft rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
               title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
            >
              {theme === 'light' ? (
                <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                </motion.div>
              ) : (
                <motion.div initial={{ rotate: 90 }} animate={{ rotate: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M22 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                </motion.div>
              )}
            </button>

            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 admin-btn-soft rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <ExternalLink size={14} />
              <span className="hidden md:inline">Website</span>
            </Link>

            <div className="flex items-center gap-3 group/user relative pl-4 border-l border-gray-100 dark:border-slate-800">
              <div className="md:flex flex-col items-end text-right hidden">
                <div className="text-[11px] font-black admin-text-main uppercase tracking-wider">
                  {adminData?.username || 'Admin'}
                </div>
                <div className="text-[9px] admin-text-primary font-bold uppercase tracking-widest">
                  {role === 'all' ? 'Super Admin' : (role === 'kesantrian' ? 'HOD Kesantrian' : `Officer ${role}`)}
                </div>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center admin-text-primary border border-gray-200 dark:border-slate-700 shadow-sm group-hover/user:scale-110 transition-transform">
                  <Users size={18} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto text-left">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>

        <BackToTop scrollContainer={mainRef} />
      </motion.main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav menuItems={menuItems} activePath={location.pathname} />
    </div>
  );
}

function BottomNav({ menuItems, activePath }: { menuItems: any[], activePath: string }) {
  // Select key items for bottom nav
  const bottomItems = [
    { name: 'Utama', icon: LayoutDashboard, path: '/admin' },
    { name: 'Santri', icon: Users, path: '/admin/kesantrian' },
    { name: 'Izin', icon: FileText, path: '/admin/permits' },
    { name: 'Uang', icon: Banknote, path: '/admin/financial' },
    { name: 'Keluar', icon: LogOut, path: 'logout' },
  ].filter(item => {
    if (item.path === 'logout') return true;
    return menuItems.some(mi => mi.path === item.path) || item.name === 'Utama';
  });

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-4">
      <div className="max-w-md mx-auto flex items-center justify-around p-2">
        {bottomItems.map((item) => {
          const isActive = activePath === item.path;
          
          if (item.path === 'logout') {
            return (
              <button 
                key="logout"
                onClick={() => internalAuth.logout()}
                className="relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 text-rose-400 hover:text-rose-600"
              >
                <item.icon size={20} strokeWidth={2} className="relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-[0.1em] relative z-10">
                  {item.name}
                </span>
              </button>
            );
          }

          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'admin-text-primary scale-110' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="bottomNavActive"
                  className="absolute inset-0 admin-btn-soft rounded-xl z-0"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
              <span className={`text-[9px] font-black uppercase tracking-[0.1em] relative z-10 transition-all ${isActive ? 'opacity-100' : 'opacity-0 h-0 w-0 scale-0'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
