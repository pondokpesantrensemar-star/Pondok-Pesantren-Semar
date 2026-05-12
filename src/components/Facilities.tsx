import { motion } from "motion/react";
import { Building2, Home, Book, Coffee, Wifi, Shield, Users, School, Library, Music, Zap, Heart, Star } from "lucide-react";
import { useFacilities } from "../hooks/useContent";

const AVAILABLE_ICONS: Record<string, any> = {
  Building2, Home, Book, Coffee, Wifi, Shield, Users, School, Library, Music, Zap, Heart, Star
};

const defaultFacilities = [
  { id: '1', title: 'Asrama Modern', description: 'Kamar santri yang bersih, berventilasi baik, dan nyaman untuk istirahat.', icon: 'Home' },
  { id: '2', title: 'Perpustakaan', description: 'Koleksi kitab klasik dan buku modern yang lengkap bagi penelitian santri.', icon: 'Book' },
  { id: '3', title: 'Kantin Sehat', description: 'Penyediaan makanan bergizi seimbang untuk menunjang kesehatan santri.', icon: 'Coffee' },
  { id: '4', title: 'Laboratorium', description: 'Fasilitas komputer dan sains untuk menunjang skill digital santri.', icon: 'Building2' },
];

export default function Facilities() {
  const { facilities: dbFacilities, loading } = useFacilities();
  const facilities = dbFacilities.length > 0 ? dbFacilities : defaultFacilities;

  if (!loading && facilities.length === 0) return null;

  return (
    <section id="facilities" className="py-24 bg-pesantren-cream/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <span className="text-pesantren-gold font-serif text-xl italic mb-4 block">Kenyamanan & Sarana</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-pesantren-green italic">Fasilitas Unggulan.</h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto italic font-serif">Mendukung kenyamanan dan kelancaran proses menuntut ilmu para santri.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {facilities.map((fac, index) => {
            const IconComponent = AVAILABLE_ICONS[fac.icon || 'Home'] || AVAILABLE_ICONS.Building2;
            
            return (
              <motion.div
                key={fac.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ 
                  y: -12,
                  scale: 1.02,
                  borderColor: "rgba(5, 150, 105, 0.3)",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="bg-white p-10 rounded-[2.5rem] border border-pesantren-border shadow-[0_8px_30px_rgb(0,0,0,0.02)] group relative overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-pesantren-gold/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="w-16 h-16 bg-pesantren-green/5 rounded-2xl flex items-center justify-center text-pesantren-green mb-8 group-hover:bg-pesantren-green group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                   <IconComponent size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-pesantren-dark mb-4 font-serif relative z-10">{fac.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-serif italic relative z-10">{fac.description}</p>
                
                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-[10px] font-black uppercase tracking-widest text-pesantren-gold">Lihat Detail</span>
                  <div className="w-6 h-px bg-pesantren-gold/30" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
