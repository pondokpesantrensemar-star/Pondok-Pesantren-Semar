import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare, User, AtSign, HelpCircle } from 'lucide-react';
import { useSettings } from '../hooks/useContent';

export default function ContactSection() {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pesantren-gold/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pesantren-green/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Left Side: Info */}
          <div className="lg:w-1/3 space-y-12">
            <div>
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-pesantren-gold font-serif italic text-xl mb-4 block"
              >
                Silaturahmi Khidmah
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl lg:text-6xl font-serif text-pesantren-green leading-tight italic"
              >
                Hubungi Kami.
              </motion.h2>
              <p className="text-gray-500 mt-6 font-serif italic leading-relaxed">
                Pintu kami selalu terbuka untuk diskusi, pertanyaan, atau kunjungan silaturahmi. Jangan ragu untuk menghubungi kami melalui media manapun.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-pesantren-cream rounded-2xl flex items-center justify-center text-pesantren-green group-hover:bg-pesantren-green group-hover:text-white transition-all duration-500 shadow-sm">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Lokasi Kami</h4>
                  <p className="text-sm font-bold text-pesantren-dark leading-relaxed">
                    {settings?.address || "Jl. Darussalam Dsn Dulat Ragang Waru Pamekasan 69353. Jawa Timur"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-pesantren-cream rounded-2xl flex items-center justify-center text-pesantren-green group-hover:bg-pesantren-green group-hover:text-white transition-all duration-500 shadow-sm">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">WhatsApp Center</h4>
                  <p className="text-sm font-bold text-pesantren-dark">
                    {settings?.contactPhone || "085195301987"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-pesantren-cream rounded-2xl flex items-center justify-center text-pesantren-green group-hover:bg-pesantren-green group-hover:text-white transition-all duration-500 shadow-sm">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Email Resmi</h4>
                  <p className="text-sm font-bold text-pesantren-dark">
                    {settings?.contactEmail || "pondokpesantrensemar@gmail.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-2/3">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-pesantren-cream/50 backdrop-blur-sm p-8 lg:p-12 rounded-[3rem] border border-pesantren-border shadow-xl hover:shadow-2xl transition-all duration-700"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2 px-1">
                      <User size={12} /> Nama Lengkap
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masukkan nama Anda"
                      className="w-full bg-white border border-gray-100 p-4 lg:p-5 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2 px-1">
                      <AtSign size={12} /> Alamat Email
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="email@contoh.com"
                      className="w-full bg-white border border-gray-100 p-4 lg:p-5 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2 px-1">
                      <HelpCircle size={12} /> Subjek / Keperluan
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Apa yang bisa kami bantu?"
                      className="w-full bg-white border border-gray-100 p-4 lg:p-5 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2 px-1">
                      <MessageSquare size={12} /> Pesan Anda
                    </label>
                    <textarea 
                      required
                      placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                      className="w-full bg-white border border-gray-100 p-4 lg:p-5 rounded-2xl focus:ring-2 focus:ring-pesantren-green outline-none h-40 resize-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                  <p className="text-[10px] text-gray-400 font-serif italic max-w-[200px]">
                    * Kami akan merespon pesan Anda dalam waktu maksimal 1x24 jam kerja.
                  </p>
                  <button 
                    disabled={loading || sent}
                    className="w-full sm:w-auto bg-pesantren-green text-white px-12 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-pesantren-dark transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : sent ? (
                      <span className="flex items-center gap-2">Terkirim <Send size={16} /></span>
                    ) : (
                      <>Kirim Pesan <Send size={16} /></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
