import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Marquee from "./Marquee";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
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

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "#hero" },
    { name: "Program", href: "#programs" },
    { name: "Galeri", href: "#gallery" },
    { name: "Fasilitas", href: "#facilities" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500`}>
      <motion.div
        initial={false}
        animate={{ height: isScrolled ? 0 : 'auto', opacity: isScrolled ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden hidden md:block"
      >
        <Marquee />
      </motion.div>
      
      <div className={`max-w-7xl mx-auto px-4 md:px-8 transition-all duration-500 ${isScrolled ? 'py-2' : 'py-4 md:py-6'}`}>
        <motion.div 
          className={`flex justify-between items-center transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden ${
            isScrolled 
              ? 'h-16 md:h-20 bg-white/90 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-emerald-500/10 px-4 md:px-10' 
              : 'h-20 md:h-24 bg-pesantren-dark/20 backdrop-blur-sm md:bg-transparent border border-white/10 md:border-b md:border-white/5 px-4 md:px-10'
          }`}
        >
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 overflow-hidden ${isScrolled ? 'bg-pesantren-green text-white' : 'bg-pesantren-gold text-pesantren-dark'}`}>
              {settings?.schoolLogo ? (
                <img src={settings.schoolLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-xl md:text-2xl font-black">S</span>
              )}
            </div>
            <div className="leading-tight">
              <div className={`text-lg md:text-2xl font-serif font-bold tracking-tight uppercase transition-colors duration-500 ${isScrolled ? 'text-pesantren-dark' : 'text-white'}`}>LPI NURUL ISLAM</div>
              <p className={`text-[9px] md:text-[11px] font-black tracking-[0.3em] uppercase transition-colors duration-500 ${isScrolled ? 'text-pesantren-gold' : 'text-pesantren-gold/80'}`}>Pondok Pesantren Semar</p>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8 text-[10px] font-black uppercase tracking-[0.2em]">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`transition-all duration-300 hover:text-pesantren-gold relative group ${
                  isScrolled ? 'text-slate-600' : 'text-white/80'
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pesantren-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            
            <Link to="/admin">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl shadow-lg transition-all duration-500 font-black text-[9px] uppercase tracking-[0.2em] ${
                  isScrolled 
                    ? 'bg-pesantren-green text-white shadow-emerald-500/10' 
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-pesantren-gold hover:text-pesantren-dark hover:border-transparent'
                }`}
              >
                Login Pengurus
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors ${isScrolled ? 'text-pesantren-green bg-emerald-50' : 'text-white bg-white/10'}`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col space-y-2 p-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-4 py-4 text-[11px] font-black text-slate-600 uppercase tracking-widest hover:bg-emerald-50 hover:text-pesantren-green rounded-xl transition-all"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/admin"
                className="mt-4 bg-pesantren-green text-white px-7 py-5 rounded-2xl text-[10px] font-black tracking-[0.2em] text-center shadow-xl shadow-emerald-500/20"
                onClick={() => setIsOpen(false)}
              >
                LOGIN PENGURUS
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
