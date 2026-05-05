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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 px-4 max-w-[1400px] mx-auto">
        {displayImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`aspect-square relative group overflow-hidden rounded-xl md:rounded-3xl cursor-pointer ${index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
          >
            <img
              src={image.url}
              alt={image.title}
              loading="lazy"
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              style={getImgStyle(image)}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-pesantren-green/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-pesantren-gold font-serif italic text-sm mb-2">{image.category}</span>
              <h4 className="text-white font-serif font-bold text-lg md:text-xl">{image.title}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
