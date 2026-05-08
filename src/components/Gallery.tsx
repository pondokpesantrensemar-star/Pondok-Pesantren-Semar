import { motion } from "motion/react";
import { useGallery } from "../hooks/useContent";

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
  
  const displayImages = dbImages.length > 0 ? dbImages : defaultImages.map((url, i) => ({
    url,
    title: `Gallery ${i+1}`,
    category: "Kegiatan",
    rotation: 0,
    brightness: 100,
    contrast: 100,
    grayscale: false
  }));

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
    <section id="gallery" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="text-pesantren-gold font-serif text-xl italic uppercase tracking-tighter mb-4 block">Dokumentasi</span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-pesantren-green mt-4 italic">Jejak Langkah Kami.</h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto italic font-serif">Momen Berharga dalam Proses Belajar Mengajar dan Pengabdian</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 grid-flow-dense gap-2 sm:gap-4 md:gap-6 px-4 max-w-[1600px] mx-auto">
        {displayImages.map((image, index) => {
          // Define a recurring bento pattern for variety
          const getSpanClass = (i: number) => {
            const mod = i % 12;
            if (mod === 0) return "md:col-span-2 md:row-span-2 aspect-square"; // Featured Large
            if (mod === 3) return "md:col-span-2 md:row-span-1 aspect-video md:aspect-auto"; // Wide
            if (mod === 7) return "md:col-span-1 md:row-span-2 aspect-[1/2] md:aspect-auto"; // Tall
            return "md:col-span-1 md:row-span-1 aspect-square"; // Standard
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: (index % 6) * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98] 
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative group overflow-hidden rounded-2xl md:rounded-[2.5rem] cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-gray-100 dark:bg-slate-800 ${getSpanClass(index)}`}
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
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pesantren-green dark:text-pesantren-gold mb-1 block">
                    {image.category || "Dokumentasi"}
                  </span>
                  <h4 className="text-pesantren-dark dark:text-white font-serif font-bold text-sm md:text-base leading-tight">
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
    </section>
  );
}
