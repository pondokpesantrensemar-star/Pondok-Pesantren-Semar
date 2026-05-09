import { motion } from "motion/react";
import { useSettings } from "../hooks/useContent";

export default function Marquee() {
  const { settings } = useSettings();
  
  if (!settings?.runningText) return null;

  return (
    <div className="bg-pesantren-dark py-3 overflow-hidden border-b border-pesantren-gold/20 relative z-10">
      <div className="flex w-max">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex whitespace-nowrap"
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              <span className="text-white/90 text-[11px] font-black uppercase tracking-[0.3em]">
                {settings.runningText}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-pesantren-gold" />
            </div>
          ))}
          
          {/* Mirror for seamless loop */}
          {[...Array(6)].map((_, i) => (
            <div key={`mirror-${i}`} className="flex items-center gap-12 px-6">
              <span className="text-white/90 text-[11px] font-black uppercase tracking-[0.3em]">
                {settings.runningText}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-pesantren-gold" />
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Decorative gradient edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-pesantren-dark to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-pesantren-dark to-transparent z-10" />
    </div>
  );
}
