import { motion } from "motion/react";
import { Menu, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DigitalClock from "./DigitalClock";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "#" },
    { name: "Program", href: "#programs" },
    { name: "Gallery", href: "#gallery" },
    { name: "Fasilitas", href: "#facilities" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-2' : 'py-6'}`}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <motion.div 
          className={`flex justify-between items-center px-10 transition-all duration-700 overflow-hidden ${
            isScrolled 
              ? 'h-20 bg-white/80 backdrop-blur-xl shadow-prestige border border-pesantren-gold/10 rounded-[1.5rem]' 
              : 'h-24 bg-transparent border-b border-white/5 rounded-none'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700 ${isScrolled ? 'bg-pesantren-dark text-pesantren-gold' : 'bg-pesantren-gold text-pesantren-dark'}`}>
              <span className="font-serif text-2xl font-black">S</span>
            </div>
            <div className={`leading-none transition-all duration-700 ${isScrolled ? 'translate-x-0' : 'translate-x-1'}`}>
              <h1 className={`text-lg font-serif font-bold tracking-tight uppercase transition-colors duration-700 ${isScrolled ? 'text-pesantren-dark' : 'text-white'}`}>Pesantren Semar</h1>
              <p className={`text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-700 ${isScrolled ? 'text-pesantren-gold' : 'text-pesantren-gold/60'}`}>Pamekasan • Madura</p>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 justify-center origin-center">
            <div className={`transition-all duration-700 ${isScrolled ? 'scale-90 opacity-40 grayscale' : 'scale-100 opacity-100'}`}>
              <DigitalClock showDate className={isScrolled ? 'text-pesantren-dark' : 'text-white'} />
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-10 text-[10px] font-black uppercase tracking-[0.2em]">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`transition-all duration-300 hover:text-pesantren-gold relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-px after:bg-pesantren-gold after:transition-all hover:after:w-full ${
                  isScrolled ? 'text-pesantren-dark/60' : 'text-white/80'
                }`}
              >
                {link.name}
              </a>
            ))}
            
            <div className="flex items-center gap-3">
              <Link to="/daftar">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-3 rounded-xl shadow-lg transition-all duration-500 font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                    isScrolled 
                      ? 'bg-pesantren-gold text-pesantren-dark shadow-pesantren-gold/10' 
                      : 'bg-white text-pesantren-dark'
                  }`}
                >
                  <Plus size={14} />
                  Daftar Santri
                </motion.button>
              </Link>

              <Link to="/admin">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-3 rounded-xl shadow-lg transition-all duration-500 font-black uppercase tracking-[0.2em] ${
                    isScrolled 
                      ? 'bg-pesantren-dark text-white shadow-black/10' 
                      : 'bg-pesantren-gold text-pesantren-dark shadow-pesantren-gold/10'
                  }`}
                >
                  Login Pengurus
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-pesantren-green p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-pesantren-cream border-t border-pesantren-border pb-8 px-6 pt-4"
        >
          <div className="flex flex-col space-y-6 text-[11px] font-bold uppercase tracking-widest">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-pesantren-dark/70"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/daftar"
              className="bg-pesantren-green text-white px-7 py-4 rounded-xl text-[10px] font-black tracking-widest text-center shadow-lg shadow-pesantren-green/20"
              onClick={() => setIsOpen(false)}
            >
              DAFTAR SANTRI BARU
            </Link>
            <Link
              to="/admin"
              className="bg-pesantren-gold text-pesantren-dark px-7 py-4 rounded-xl text-[10px] font-black tracking-widest text-center shadow-lg shadow-pesantren-gold/20"
              onClick={() => setIsOpen(false)}
            >
              LOGIN PENGURUS
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
