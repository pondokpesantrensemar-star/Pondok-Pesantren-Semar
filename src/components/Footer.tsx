import { Instagram, Youtube, Facebook, Music } from "lucide-react";
import { useSettings } from "../hooks/useContent";

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-pesantren-cream border-t border-pesantren-border">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Address Info */}
        <div className="text-[13px] text-pesantren-dark tracking-wider text-center md:text-left max-w-md font-medium">
          {settings?.address || "Jl. Darussalam Dsn Dulat Ragang Waru Pamekasan 69353. Jawa Timur"}
        </div>

        {/* Brand Accent */}
        <div className="hidden lg:flex items-center space-x-2 opacity-60">
          <div className="w-6 h-6 bg-pesantren-green rounded-full shadow-sm"></div>
          <span className="text-[11px] font-bold tracking-widest text-pesantren-green uppercase">Semar Excellence</span>
        </div>

        {/* Social Links */}
        <div className="flex space-x-8 text-[12px] font-bold text-pesantren-green tracking-[0.2em]">
          <a href="#" className="hover:text-pesantren-gold transition-colors flex items-center gap-2 group">
            <Instagram size={14} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">INSTAGRAM</span>
          </a>
          <a href="#" className="hover:text-pesantren-gold transition-colors flex items-center gap-2 group">
            <Youtube size={14} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">YOUTUBE</span>
          </a>
          <a href="#" className="hover:text-pesantren-gold transition-colors flex items-center gap-2 group">
            <Music size={14} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">TIKTOK</span>
          </a>
          <a href="#" className="hover:text-pesantren-gold transition-colors flex items-center gap-2 group">
            <Facebook size={14} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">FACEBOOK</span>
          </a>
        </div>
      </div>
      
      {/* Absolute Bottom */}
      <div className="bg-pesantren-green text-white/70 text-[11px] text-center py-6 uppercase tracking-[0.4em] flex flex-col items-center gap-4 border-t border-white/5 font-bold">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12">
          <span className="opacity-90">© 2026 Pondok Pesantren Semar • Terakreditasi Unggul</span>
        </div>
      </div>
    </footer>
  );
}
