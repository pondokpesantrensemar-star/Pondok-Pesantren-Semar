import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface NewsItem {
  id: string | number;
  title: string;
  date: string;
  excerpt: string;
  imageUrl?: string;
}

const defaultNewsItems: NewsItem[] = [
  {
    id: 1,
    title: "Pendaftaran Santri Baru Tahun Ajaran 2026/2027 Resmi Dibuka",
    date: "2026-05-10",
    excerpt: "Pesantren Semar membuka kesempatan bagi putra-putri terbaik bangsa untuk bergabung menuntut ilmu agama dan umum.",
  },
  {
    id: 2,
    title: "Prestasi Santri: Juara Umum MTQ Tingkat Kabupaten",
    date: "2026-05-05",
    excerpt: "Delegasi santri berhasil membawa pulang gelar Juara Umum pada ajang MTQ yang diadakan di lingkungan Kabupaten.",
  },
  {
    id: 3,
    title: "Agenda Kajian Kitab Kuning Bersama KH. Ahmad",
    date: "2026-05-01",
    excerpt: "Majelis kajian rutin yang diselenggarakan setiap awal bulan untuk memperdalam pemahaman kitab klasik.",
  }
];

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNewsItems);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Sort by date descending
            data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNewsItems(data.slice(0, 3)); // Show latest 3
          }
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Berita Terbaru</h2>
          <p className="text-slate-500">Ikuti informasi terkini seputar kegiatan dan prestasi di Pondok Pesantren Semar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col"
            >
              <div className="h-48 bg-slate-100 relative overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Pesantren Semar</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-pesantren-gold flex items-center gap-2 shadow-sm">
                    <Clock size={12} />
                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-pesantren-green transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-1">{item.excerpt}</p>
                <button className="inline-flex items-center text-xs font-black uppercase tracking-widest text-pesantren-green transition-all group-hover:gap-3 group-hover:text-pesantren-gold w-fit">
                  Selengkapnya <ArrowRight size={14} className="ml-2 transition-all" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
