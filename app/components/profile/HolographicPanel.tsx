import * as React from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';

interface HolographicPanelProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  glowColor?: string;
  icon?: React.ReactNode;
  id?: string;
}

/**
 * HolographicPanel Component
 * A distinctive, futuristic container with glassmorphic effects and subtle glows.
 */
const HolographicPanel = ({ 
  title, 
  className, 
  children, 
  glowColor = 'rgba(168, 85, 247, 0.2)',
  icon,
  id
}: HolographicPanelProps) => {
  return (
    <motion.div 
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "relative rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden group",
        className
      )}
      style={{
        boxShadow: `0 0 50px -10px ${glowColor}`
      }}
    >
      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Inner sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      
      {title && (
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="text-white/60 group-hover:text-white transition-colors">{icon}</div>}
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50 group-hover:text-white/90 transition-colors">
              {title}
            </h3>
          </div>
          <div className="flex gap-1.5">
            <div className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-white/30 transition-colors" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors" />
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none border-t border-l border-white/10 rounded-tl-[3rem]" />
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-t border-r border-white/10 rounded-tr-[3rem]" />
      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-b border-l border-white/10 rounded-bl-[3rem]" />
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none border-b border-r border-white/10 rounded-br-[3rem]" />
    </motion.div>
  );
};

export default HolographicPanel;
