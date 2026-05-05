import React, { useState, useEffect } from 'react';

interface DigitalClockProps {
  className?: string;
  showDate?: boolean;
}

export default function DigitalClock({ className = '', showDate = false }: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const dateString = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center gap-1.5 p-1 bg-pesantren-dark/5 rounded-xl border border-pesantren-dark/5">
        {timeString.split(':').map((part, i) => (
          <React.Fragment key={i}>
            <div className="relative group">
              <span className="block bg-pesantren-dark text-white px-2 py-1 rounded-lg font-mono text-sm font-black tracking-widest shadow-inner overflow-hidden">
                <span className="relative z-10">{part}</span>
                <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
              </span>
            </div>
            {i < 2 && <span className="text-pesantren-gold font-bold scale-110 opacity-40 animate-pulse">:</span>}
          </React.Fragment>
        ))}
      </div>
      {showDate && (
        <div className="text-[9px] font-sans font-black text-pesantren-gold mt-2 uppercase tracking-[0.3em] flex items-center gap-3">
          <div className="w-1.5 h-px bg-pesantren-gold/30" />
          {dateString}
          <div className="w-1.5 h-px bg-pesantren-gold/30" />
        </div>
      )}
    </div>
  );
}
