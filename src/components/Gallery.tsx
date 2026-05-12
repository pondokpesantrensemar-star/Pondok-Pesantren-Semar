import { motion } from "motion/react";
import { useGallery } from "../hooks/useContent";
import { useState, useEffect } from "react";
import { internalAuth } from "../lib/internalAuth";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const defaultImages = [
  "https://images.unsplash.com/photo-1544161515-4af6b1d462c2?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-152305085306e-80e4918731b1?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=600&h=600",
  "https://images.unsplash.com/photo-1536337005238-94b997371b40?auto=format&fit=crop&q=80&w=600&h=600",
];

export default function Gallery() {
  const { images: dbImages, loading } = useGallery();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!internalAuth.getUser());
  }, []);
  
  const optimizeUnsplash = (url: string, width = 600, quality = 80) => {
    if (!url.includes('unsplash.com')) return url;
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format,compress&q=${quality}&w=${width}&fit=crop`;
  };

  const displayImages = dbImages.length > 0 
    ? dbImages.map(img => ({ ...img, url: optimizeUnsplash(img.url) }))
    : defaultImages.map((url, i) => ({
        url: optimizeUnsplash(url),
        title: `Gallery ${i+1}`,
        category: "Kegiatan",
        rotation: 0,
        brightness: 100,
        contrast: 100,
        grayscale: false
      }));

  if (!loading && displayImages.length === 0) return null;

  const getImgStyle = (image: any) => {
    const filters = [];
    if (image.brightness !== undefined) filters.push(`brightness(${image.brightness}%)`);
    if (image.contrast !== undefined) filters.push(`contrast(${image.contrast}%)`);
    if (image.grayscale) filters.push('grayscale(100%)');

    return {
      transform: `rotate(${image.rotation || 0}deg)`,
      filter: filters.join(' ')
    };
  };

  return (
    <section id="gallery" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative Background Patterns */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-5">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pesantren-gold blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 rounded-full bg-pesantren-green blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-pesantren-gold/10 border border-pesantren-gold/20 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-pesantren-gold animate-pulse" />
          <span className="text-[10px] font-black uppercase text-pesantren-gold tracking-[0.2em]">Dokumentasi Visual</span>
        </motion.div>
        
        <h2 className="text-5xl md:text-7xl font-serif font-bold text-pesantren-green italic leading-[1.1] tracking-tight">
          Lensa <span className="text-pesantren-gold">Pesantren</span>.
        </h2>
        <p className="text-gray-400 mt-6 max-w-xl mx-auto text-sm md:text-base font-medium leading-relaxed">
          Menangkap setiap detik perjalanan spiritual dan intelektual para santri dalam balutan dedikasi yang tak henti.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[180px] gap-4 sm:gap-5 md:gap-6 px-4 max-w-[1600px] mx-auto relative z-10">
        {displayImages.map((image, index) => {
          const getSpanClass = (i: number) => {
            const patterns = [
              "md:col-span-2 md:row-span-3", // Tall Featured
              "md:col-span-2 md:row-span-2", // Large Square
              "md:col-span-1 md:row-span-2", // Simple Tall
              "md:col-span-2 md:row-span-2", // Large Square
              "md:col-span-1 md:row-span-1", // Small Square
              "md:col-span-3 md:row-span-2", // Wide Featured
              "md:col-span-1 md:row-span-2", // Simple Tall
              "md:col-span-2 md:row-span-2", // Large Square
              "md:col-span-1 md:row-span-1", // Small Square
              "md:col-span-1 md:row-span-2", // Simple Tall
              "md:col-span-2 md:row-span-1", // Simple Wide
              "md:col-span-1 md:row-span-1", // Small Square
            ];
            return patterns[i % patterns.length];
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: (index % 8) * 0.05,
                ease: [0.21, 0.47, 0.32, 0.98] 
              }}
              whileHover={{ y: -10, scale: 1.01 }}
              className={`relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 bg-gray-50 border border-transparent hover:border-pesantren-gold/30 ${getSpanClass(index)}`}
            >
              <img
                src={image.url}
                alt={image.title}
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                style={getImgStyle(image)}
                referrerPolicy="no-referrer"
              />
              
              {/* Refined Overlay Decor */}
              <div className="absolute inset-x-4 bottom-4 z-20 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pesantren-green mb-1 block">
                    {image.category || "Dokumentasi"}
                  </span>
                  <h4 className="text-pesantren-dark font-serif font-bold text-sm md:text-base leading-tight">
                    {image.title}
                  </h4>
                </div>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-pesantren-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </motion.div>
          );
        })}
      </div>

      {/* See All Button - Conditional for User Session */}
      {isLoggedIn && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center relative z-10"
        >
          <Link 
            to="/admin/gallery"
            className="group relative inline-flex items-center gap-4 bg-pesantren-dark text-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:pr-14 hover:shadow-2xl hover:shadow-pesantren-dark/20"
          >
            <span className="relative z-10">Lihat Semua Galeri</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2 relative z-10" />
            <div className="absolute inset-0 bg-pesantren-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </Link>
        </motion.div>
      )}
    </section>
  );
}
