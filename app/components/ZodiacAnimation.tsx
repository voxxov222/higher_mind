import React from 'react';
import { motion } from 'motion/react';
import { PlanetData } from '../types';

interface ZodiacAnimationProps {
  planets: PlanetData[];
}

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

const SIGN_COLORS: Record<string, string> = {
  Aries: '#ff4d4d', Taurus: '#4dff4d', Gemini: '#ffff4d', Cancer: '#d9d9d9',
  Leo: '#ffcc00', Virgo: '#b366ff', Libra: '#ffb3ff', Scorpio: '#8c1aff',
  Sagittarius: '#ff6600', Capricorn: '#8c8c8c', Aquarius: '#4dffff', Pisces: '#4d4dff'
};

export const ZodiacAnimation: React.FC<ZodiacAnimationProps> = ({ planets }) => {
  if (!planets || planets.length === 0) return null;

  return (
    <div className="p-4 h-full flex flex-col justify-center items-center relative overflow-hidden pointer-events-auto cursor-default">
      <div className="grid grid-cols-3 gap-8 relative z-10">
        {planets.slice(0, 6).map((p, i) => {
          const symbol = SIGN_SYMBOLS[p.sign] || '✨';
          const color = SIGN_COLORS[p.sign] || '#ffffff';
          const degree = p.degree || 0;
          
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                opacity: { duration: 0.5, delay: i * 0.1 },
                scale: { duration: 3 + (i % 2), repeat: Infinity, ease: "easeInOut" }
              }}
              whileHover={{ scale: 1.2, zIndex: 20 }}
              className="flex flex-col items-center justify-center group/zodiac relative"
            >
              <motion.div 
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg bg-black/40 backdrop-blur-sm"
                style={{ borderColor: color, color: color, boxShadow: `0 0 15px ${color}40` }}
                animate={{
                   boxShadow: [`0 0 10px ${color}40`, `0 0 25px ${color}80`, `0 0 10px ${color}40`],
                   rotate: [0, degree, 0]
                }}
                transition={{ 
                    boxShadow: { duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 10 + (degree % 5), repeat: Infinity, ease: "linear" }
                }}
              >
                <span className="text-2xl font-bold font-sans leading-none">{symbol}</span>
              </motion.div>
              
              <div className="absolute top-14 flex flex-col items-center opacity-0 group-hover/zodiac:opacity-100 transition-opacity bg-black/90 px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                <span className="text-[11px] font-mono text-white font-bold uppercase tracking-wider">{p.name}</span>
                <span className="text-[9px] text-stone-300 font-mono mt-0.5" style={{ color }}>{p.sign} • {Math.round(degree)}°</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Background decorative elements */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-white/5 rounded-full scale-[2] opacity-30 pointer-events-none"
        style={{ borderStyle: 'dashed', borderWidth: '1px' }}
      />
      <motion.div 
        animate={{ rotate: -360 }} 
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-white/10 rounded-full scale-[1.5] opacity-20 pointer-events-none"
        style={{ borderStyle: 'dotted', borderWidth: '2px' }}
      />
    </div>
  );
};
