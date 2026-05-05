import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell } from 'lucide-react';

export default function RunningText() {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings/website'), (snapshot) => {
      if (snapshot.exists()) {
        setText(snapshot.data().runningText || '');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (!text || loading) return null;

  return (
    <div className="bg-pesantren-green text-white py-2 overflow-hidden relative z-[70] border-b border-white/10 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center gap-4">
        <div className="bg-pesantren-gold text-pesantren-dark px-2 py-0.5 rounded flex items-center gap-1.5 shrink-0 z-10 animate-pulse">
          <Bell size={12} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-widest">Penting</span>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <motion.div
            animate={{ x: [1000, -2000] }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="inline-block"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
              {text} &nbsp;&nbsp;&nbsp;&nbsp;&bullet;&nbsp;&nbsp;&nbsp;&nbsp; {text} &nbsp;&nbsp;&nbsp;&nbsp;&bullet;&nbsp;&nbsp;&nbsp;&nbsp; {text}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
