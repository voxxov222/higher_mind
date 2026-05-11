import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HolographicPanelProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  title?: string;
  icon?: React.ReactNode;
}

const HolographicPanel: React.FC<HolographicPanelProps> = ({ 
  children, 
  className, 
  glowColor = 'rgba(168, 85, 247, 0.2)',
  title,
  icon
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ 
        boxShadow: `0 0 30px ${glowColor}`,
        borderColor: glowColor.replace('0.2', '0.4')
      }}
      className={cn(
        "relative overflow-hidden p-6 rounded-3xl border border-white/10",
        "bg-white/5 backdrop-blur-xl transition-all duration-500",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent",
        "group cursor-default",
        className
      )}
    >
      {/* Holographic Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      {title && (
        <div className="flex items-center gap-3 mb-4 relative z-10" style={{ transform: 'translateZ(20px)' }}>
          {icon && <div className="p-2 rounded-lg bg-white/10 text-white/70 group-hover:text-white transition-colors">{icon}</div>}
          <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/50 group-hover:text-white/90 transition-colors">
            {title}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>
      )}

      <div className="relative z-10" style={{ transform: 'translateZ(40px)' }}>
        {children}
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 rounded-br-lg" />
    </motion.div>
  );
};

export default HolographicPanel;
