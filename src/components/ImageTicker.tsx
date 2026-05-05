import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ImageTicker() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('order', 'asc'), limit(15));
        const snapshot = await getDocs(q);
        const urls = snapshot.docs.map(doc => doc.data().url);
        // Duplicate for seamless loop
        setImages([...urls, ...urls]);
      } catch (error) {
        console.error("Error fetching ticker images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  if (loading || images.length === 0) return null;

  return (
    <div className="bg-white border-b border-pesantren-border overflow-hidden h-16 flex items-center relative">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex gap-4 px-4 whitespace-nowrap"
      >
        {images.map((url, index) => (
          <div key={index} className="h-12 w-32 sm:w-40 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
            <img 
              src={url} 
              alt="Gallery Ticker" 
              loading="lazy"
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </motion.div>
      
      {/* Decorative Overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
    </div>
  );
}
