import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { X, Hash, Activity, History, ChevronRight } from 'lucide-react';

const KarmaLedger = React.lazy(() => import('./KarmaLedger').then(m => ({ default: m.KarmaLedger })));
const ChakraScene = React.lazy(() => import('./ChakraScene'));
const GematriaHUD = React.lazy(() => import('./GematriaHUD').then(m => ({ default: m.GematriaHUD })));
const GematriaCalculatorSection = React.lazy(() => import('./GematriaCalculatorSection').then(m => ({ default: m.GematriaCalculatorSection })));

export const HoloSideDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: any;
  activeTool: 'gematria' | 'chakra' | 'karma';
  setActiveTool: (tool: 'gematria' | 'chakra' | 'karma') => void;
}> = ({ isOpen, onClose, data, activeTool, setActiveTool }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 50; 
    const y = (e.clientY / window.innerHeight - 0.5) * 50;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    if (!isOpen) {
      mouseX.set(0);
      mouseY.set(0);
    }
  }, [isOpen, mouseX, mouseY]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-[2px] pointer-events-auto"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseMove={handleMouseMove}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] z-[160] bg-zinc-950/90 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto"
            style={{ perspective: 1000 }}
          >
            {/* Holographic glowing edge */}
            <motion.div 
              style={{ x: useTransform(smoothX, x => x * -0.1), y: useTransform(smoothY, y => y * -0.1) }}
              className={`absolute left-0 top-0 bottom-0 w-px ${
              activeTool === 'gematria' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' :
              activeTool === 'chakra' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' :
              'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]'
            }`} />

            {/* Header */}
            <motion.div 
              style={{ x: useTransform(smoothX, x => x * 0.1), y: useTransform(smoothY, y => y * 0.1) }}
              className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 relative z-10"
            >
              <div className="flex items-center gap-2">
                <ChevronRight size={16} className="text-stone-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="text-blue-400">HOLO</span>
                  <span className="text-stone-500">///</span>
                  <span className="text-stone-300">UTILITIES</span>
                </span>
              </div>
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-rose-400 transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                <X size={16} />
              </button>
            </motion.div>

            {/* Tool Selection */}
            <motion.div 
              style={{ x: useTransform(smoothX, x => x * 0.2), y: useTransform(smoothY, y => y * 0.15) }}
              className="flex p-4 gap-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar relative z-10"
            >
              <button
                onClick={() => setActiveTool('gematria')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTool === 'gematria' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' 
                  : 'bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Hash size={14} /> Gematria
              </button>
              <button
                onClick={() => setActiveTool('chakra')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTool === 'chakra' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                  : 'bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Activity size={14} /> Prana & Chakras
              </button>
              <button
                onClick={() => setActiveTool('karma')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                  activeTool === 'karma' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                  : 'bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200'
                }`}
              >
                <History size={14} /> Karma Ledger
              </button>
            </motion.div>

            {/* Content Area */}
            <motion.div 
              style={{ x: useTransform(smoothX, x => x * -0.05), y: useTransform(smoothY, y => y * -0.05) }}
              className="flex-1 overflow-y-auto custom-scrollbar relative bg-gradient-to-b from-black/40 to-transparent p-4 z-10"
            >
              <React.Suspense fallback={<div className="h-full flex items-center justify-center text-stone-500 font-mono text-xs uppercase tracking-widest">Loading Module...</div>}>
                {activeTool === 'gematria' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                    {/* We can use GematriaCalculatorSection which is robust */}
                    <GematriaCalculatorSection />
                  </motion.div>
                )}
                
                {activeTool === 'chakra' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[600px] min-h-full">
                    <ChakraScene data={data} />
                  </motion.div>
                )}
                
                {activeTool === 'karma' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                    <KarmaLedger />
                  </motion.div>
                )}
              </React.Suspense>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
