import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { usePrograms } from "../hooks/useContent";

const defaultPrograms = [
  {
    id: "01",
    title: "Tahfidz",
    description: "Program akselerasi hafalan Al-Qur'an dengan bimbingan intensif dan mutqin.",
  },
  {
    id: "02",
    title: "Kitab Kuning",
    description: "Pendalaman khazanah kitab turats nusantara untuk mencetak kader ulama yang handal.",
  },
  {
    id: "03",
    title: "Iktisyaf",
    description: "Metode inovatif percepatan pemahaman literasi kitab klasik secara komprehensif.",
  },
  {
    id: "04",
    title: "Bahasa Arab",
    description: "Penguasaan komunikasi bahasa Arab aktif dan pasif melalui lingkungan bahasa modern.",
  },
];

export default function Programs() {
  const { programs: dbPrograms, loading } = usePrograms();
  const programs = (dbPrograms.length > 0 ? dbPrograms : defaultPrograms).filter(p => 
    !p.title.toLowerCase().includes('paud') && 
    !p.title.toLowerCase().includes('ibtidaiyah')
  );

  if (!loading && programs.length === 0) return null;

  return (
    <section id="programs" className="py-24 bg-pesantren-cream overflow-hidden border-y border-pesantren-gold/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-20 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pesantren-gold mb-4">Pilar Pendidikan</p>
           <h2 className="text-4xl md:text-6xl font-serif font-bold text-pesantren-dark tracking-tight leading-none">
             Program Unggulan <span className="block italic engraved-text mt-2">Semar Academy.</span>
           </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-pesantren-gold/10 rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-pesantren-gold/5">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-12 relative group transition-all duration-700 hover:bg-pesantren-dark border-pesantren-gold/10 ${
                index < 3 ? 'lg:border-r' : ''
              } ${index < 2 ? 'md:border-b lg:border-b-0' : ''}`}
            >
              <div className="absolute top-8 right-8 text-6xl font-serif font-black text-pesantren-gold/5 group-hover:text-pesantren-gold/10 transition-colors pointer-events-none tabular-nums italic">
                {String(index + 1).padStart(2, '0')}
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="w-px h-12 bg-pesantren-gold group-hover:h-16 transition-all duration-500" />
                
                <h3 className="text-2xl font-serif font-bold text-pesantren-dark group-hover:text-white transition-colors">
                  {program.title}
                </h3>
                
                <p className="text-sm text-gray-500 leading-relaxed font-serif italic group-hover:text-white/60 transition-colors">
                  {program.description}
                </p>
                
                <div className="pt-4 overflow-hidden">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-pesantren-gold translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                      Selengkapnya <ArrowRight size={14} />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
