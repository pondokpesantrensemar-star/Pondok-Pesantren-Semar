import { motion } from "motion/react";
import { useKesantrian } from "../hooks/useContent";

const defaultActivites = [
  { id: '1', title: 'Beladiri Pagar Nusa', description: 'Olahraga fisik dan mental untuk kesehatan dan pertahanan diri santri.', imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800' },
  { id: '2', title: "Hadrah & Rebana", description: 'Seni islami untuk mengasah kreativitas dan kecintaan pada Rasulullah.', imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800' },
  { id: '3', title: 'Publik Speaking', description: 'Latihan muhadharah untuk melatih keberanian berdakwah di depan umum.', imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800' }
];

export default function Kesantrian() {
  const { activities: dbActivities, loading } = useKesantrian();
  const activities = dbActivities.length > 0 ? dbActivities : defaultActivites;

  return (
    <section id="kesantrian" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <span className="text-pesantren-green font-bold uppercase tracking-widest text-[10px] mb-2 block">Geliat Santri</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-pesantren-dark leading-tight italic">
              Kehidupan & <br />
              <span className="text-pesantren-gold">Kesantrian.</span>
            </h2>
          </div>
          <p className="text-gray-500 max-w-sm italic font-serif text-sm leading-relaxed">
            Membentuk pribadi yang aktif, kreatif, dan mandiri melalui berbagai kegiatan pengembangan diri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activities.map((act, index) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-6 shadow-lg shadow-black/5">
                <img 
                  src={act.imageUrl} 
                  alt={act.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pesantren-dark/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-8 left-8 right-8">
                   <h3 className="text-2xl font-serif font-bold text-white mb-2">{act.title}</h3>
                   <div className="w-12 h-1 bg-pesantren-gold rounded-full group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed font-serif italic px-2">
                {act.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
