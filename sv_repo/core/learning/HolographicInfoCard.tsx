import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, Brain, Zap, Wand2, Star, MessageCircle } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';

interface HolographicInfoCardProps {
  title: string;
  subtitle?: string;
  description: string;
  meaning?: string;
  color?: string;
  type?: 'planet' | 'house' | 'sign' | 'point';
  icon?: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
  onResearch?: (query: string) => void;
}

export const HolographicInfoCard: React.FC<HolographicInfoCardProps> = ({
  title,
  subtitle,
  description,
  meaning,
  color = '#3b82f6',
  type = 'planet',
  icon,
  visible,
  onResearch,
}) => {
  const { saveToChat } = useHigherMind();

  const handleSaveToChat = () => {
    saveToChat(
      `${title} - Analysis`,
      `${subtitle ? subtitle + '\n\n' : ''}${description}${meaning ? '\n\nInterpretation: ' + meaning : ''}`,
      'insight'
    );
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative z-[1000]"
          style={{ perspective: '1000px' }}
        >
          {/* Holographic Container */}
          <div className="w-[280px] bg-black/60 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Animated Glow Background */}
            <div 
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full opacity-20 blur-[60px]"
              style={{ backgroundColor: color }}
            />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {icon || (
                    type === 'planet' ? <Star size={20} style={{ color }} /> :
                    type === 'house' ? <Brain size={20} style={{ color }} /> :
                    <Sparkles size={20} style={{ color }} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">{title}</h3>
                  {subtitle && <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">{subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-tighter">Live Link</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 relative z-10">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={12} className="text-stone-400" />
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Core Nature</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  {description}
                </p>
              </div>

              {meaning && (
                <div className="p-3 bg-purple-500/5 rounded-2xl border border-purple-500/10 transition-colors hover:bg-purple-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={12} className="text-purple-400" />
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Interpretation</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed italic">
                    {meaning}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4 relative z-20">
                 <button 
                  onClick={handleSaveToChat}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-stone-300 hover:bg-white/10 transition-colors uppercase tracking-widest"
                 >
                   <MessageCircle size={10} />
                   Save to Chat
                 </button>
                 <button 
                  onClick={() => onResearch?.(title)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-[10px] text-indigo-300 hover:bg-indigo-500/40 transition-colors uppercase tracking-widest"
                 >
                   Research AI
                 </button>
              </div>

              {/* Holographic Accents */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className="w-4 h-1 rounded-full opacity-30"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Wand2 size={12} className="text-stone-600" />
              </div>
            </div>

            {/* Holographic Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <motion.div 
                animate={{ 
                  y: ['-100%', '200%'] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="w-full h-20 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-50"
              />
            </div>
          </div>
          
          {/* Stem/Pointer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/60 border-r border-b border-white/20 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
