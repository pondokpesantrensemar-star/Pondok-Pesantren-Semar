import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useSettings } from "../hooks/useContent";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const { settings, loading } = useSettings();
  const [currentIndex, setCurrentIndex] = useState(0);

  const optimizeUnsplash = (url: string, width = 1200, quality = 80) => {
    if (!url.includes('unsplash.com')) return url;
    // Remove existing w, h, q params to avoid conflicts
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format,compress&q=${quality}&w=${width}&fit=crop`;
  };

  const images = settings?.slideshowImages?.length > 0 
    ? settings.slideshowImages.map((img: string) => optimizeUnsplash(img))
    : [optimizeUnsplash(settings?.heroImage || "https://images.unsplash.com/photo-1548013146-72479768bbaa", 1200, 70)];

  const bgImages = images.map((img: string) => optimizeUnsplash(img, 1200, 40)); // Background can be lower quality due to brightness filter

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-pesantren-green">
      {/* Background Slideshow Layer */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img
              src={bgImages[currentIndex]}
              alt={`Suasana Pondok Pesantren Semar - Slide ${currentIndex + 1}`}
              className="w-full h-full object-cover brightness-[0.3] contrast-[1.1]"
              referrerPolicy="no-referrer"
              fetchPriority={currentIndex === 0 ? "high" : "auto"}
              loading={currentIndex === 0 ? "eager" : "lazy"}
            />
          </motion.div>
        </AnimatePresence>
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-pesantren-dark/80 via-transparent to-pesantren-dark" />
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full pt-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="lg:col-span-8 space-y-10 text-left"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-pesantren-gold/5 border border-pesantren-gold/20 backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-pesantren-gold animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pesantren-gold">
                PONDOK PESANTREN SEMAR
              </span>
            </motion.div>

            <h1 className="text-7xl md:text-[10rem] xl:text-[13rem] font-serif leading-[0.8] text-white tracking-[-0.06em]">
              {loading ? "PONDOK SEMAR" : settings?.heroTitle?.split('\n')[0] || "PONDOK SEMAR"}
              <span className="block italic engraved-text opacity-90 mt-8 font-normal tracking-[-0.02em]">
                {settings?.heroTitle?.split('\n')[1] || "Ilmu & Taqwa."}
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-white/50 max-w-2xl leading-relaxed font-light">
              {settings?.heroSubtitle || "Mewujudkan generasi Rabbani yang unggul dalam Imtaq dan terdepan dalam Iptek di era transformasi digital."}
            </p>

            <div className="pt-6 flex flex-wrap items-center gap-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const el = document.getElementById('programs');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-pesantren-green text-white px-14 py-6 rounded-2xl text-[11px] font-black tracking-[0.3em] uppercase transition-all shadow-2xl shadow-black/20 group flex items-center gap-4"
              >
                Jelajahi Program
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="lg:col-span-4 hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-10 bg-pesantren-gold/10 blur-[100px] rounded-full" />
              <div className="relative z-10 w-full aspect-[4/5] rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl rotate-2">
                 <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    fetchPriority={currentIndex === 0 ? "high" : "auto"}
                    loading={currentIndex === 0 ? "eager" : "lazy"}
                  />
                 </AnimatePresence>
                 <div className="absolute inset-0 bg-gradient-to-t from-pesantren-dark/60 to-transparent" />
                 <div className="absolute bottom-10 left-10 text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Terakreditasi A</p>
                    <p className="text-xl font-serif">Kualitas Terjamin</p>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Vertical Statistics - Recipe 11 style */}
        <div className="absolute left-12 bottom-20 hidden xl:flex flex-col gap-12 text-white/30 font-black uppercase tracking-[0.4em] text-[10px]">
           <div className="transform -rotate-90 origin-left translate-y-12 flex items-center gap-4">
              <span>{settings?.totalAsatidz || "85"} Pengajar</span>
              <div className="w-12 h-px bg-white/20" />
           </div>
           <div className="transform -rotate-90 origin-left translate-y-24 flex items-center gap-4">
              <span>{settings?.yearsOfService || "24"} Tahun Khidmat</span>
              <div className="w-12 h-px bg-white/20" />
           </div>
        </div>
      </div>

      {/* Slider Progress Indicator */}
      {images.length > 1 && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1 transition-all duration-500 rounded-full ${i === currentIndex ? 'h-12 bg-pesantren-gold' : 'h-3 bg-white/20'}`}
            />
          ))}
        </div>
      )}

      {/* Bottom Scroll Decor */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/20"
      >
        <div className="w-6 h-10 border-2 border-white/10 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-pesantren-gold rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
