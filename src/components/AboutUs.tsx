import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useSettings } from "../hooks/useContent";

export default function AboutUs() {
  const { settings } = useSettings();
  
  const aboutText = settings?.aboutText || "Pondok Pesantren Semar didirikan dengan visi melahirkan generasi Rabbani yang mampu menjawab tantangan zaman tanpa meninggalkan akar tradisi Islam yang luhur. Kami percaya setiap santri memiliki potensi unik yang harus diasah.";
  const vision = settings?.vision || "Menjadi pusat keunggulan pendidikan Islam yang integratif, mencetak kader ulama dan umara yang berakhlaqul karimah.";
  const mission = settings?.mission || "Menyelenggarakan pendidikan tahfidz dan kitab kuning berkualitas. Membangun softskill dan jiwa kewirausahaan santri. Menanamkan nilai-nilai Islam moderat.";

  const highlights = [
    "Kurikulum Terintegrasi Modern-Tradisional",
    "Lingkungan Belajar yang Asri & Nyaman",
    "Pengajar dari Universitas Ternama",
    "Pembinaan Karakter 24 Jam",
  ];

  return (
    <section id="about" className="py-16 bg-white border-b border-pesantren-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 relative p-4 border border-pesantren-border rounded-xl"
          >
            <div className="relative z-10 rounded-lg overflow-hidden shadow-sm">
              <img
                src={settings?.aboutImage || "https://images.unsplash.com/photo-1511974648231-939e1a99520c?auto=format&fit=crop&q=80&w=800&h=1000"}
                alt="Activities at Pesantren"
                className="w-full h-auto grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Minimal Stat Card */}
            <div className="absolute bottom-4 right-4 lg:-bottom-6 lg:-right-6 bg-pesantren-green p-5 md:p-6 text-white rounded-lg shadow-xl border border-white/10 z-20">
              <div className="text-xl md:text-2xl font-serif font-bold mb-1 italic">Visi Rabbani</div>
              <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/60">Mencetak Pemimpin Masa Depan</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <span className="text-pesantren-muted font-bold uppercase tracking-[0.2em] text-[10px] mb-2 block">Manifesto Pesantren</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-pesantren-green mb-6 leading-tight">
              Mendidik dengan Hati, <br />
              <span className="italic text-pesantren-dark">Menempa dengan Ilmu.</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8 text-sm">
              {aboutText}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-pesantren-cream p-5 rounded-2xl">
                <h4 className="font-bold text-pesantren-green mb-1 text-sm">Visi</h4>
                <p className="text-[12px] text-gray-500 italic leading-relaxed">{vision}</p>
              </div>
              <div className="bg-pesantren-green p-5 rounded-2xl text-white">
                <h4 className="font-bold mb-1 text-sm">Misi</h4>
                <p className="text-[11px] text-white/80 whitespace-pre-line leading-relaxed">{mission}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 mb-10">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full border border-pesantren-gold flex items-center justify-center group-hover:bg-pesantren-gold transition-colors">
                    <CheckCircle2 className="text-pesantren-gold group-hover:text-white transition-colors" size={14} />
                  </div>
                  <span className="text-sm font-bold text-pesantren-dark/80 tracking-wide uppercase transition-colors group-hover:text-pesantren-green">{item}</span>
                </div>
              ))}
            </div>

            <div className="inline-flex items-center space-x-4 border-b border-pesantren-green pb-2 cursor-pointer group">
              <span className="text-xs font-bold uppercase tracking-widest text-pesantren-green">Pelajari Sejarah Kami</span>
              <div className="w-8 h-px bg-pesantren-green group-hover:w-12 transition-all"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
