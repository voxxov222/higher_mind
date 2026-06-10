import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Moon, Star, Heart, Flower2, Zap, Activity } from 'lucide-react';
import { ProjectableWidget } from './ProjectableWidget';

interface OracleMessage {
  id: number;
  text: string;
  energy: string;
  frequency: string;
  archetype: string;
}

const ORACLES: OracleMessage[] = [
  { id: 1, text: "The velvet dark of the Void is where your next creation begins.", energy: "Receptive", frequency: "210.42 Hz", archetype: "The High Priestess" },
  { id: 2, text: "Let the lunar tides pull your intuition into the light of awareness.", energy: "Intuitive", frequency: "432 Hz", archetype: "The Moon" },
  { id: 3, text: "Your heart is a portal. Open it to receive the nectar of the stars.", energy: "Radiant", frequency: "528 Hz", archetype: "The Empress" },
  { id: 4, text: "Softness is your greatest power in a world of jagged edges.", energy: "Gentle", frequency: "396 Hz", archetype: "The Venusian" },
  { id: 5, text: "The Flower of Life blooms within your cellular memory.", energy: "Sacred", frequency: "639 Hz", archetype: "The Sacred Mother" },
  { id: 6, text: "Surrender to the flow of the cosmic river; it knows the way.", energy: "Fluid", frequency: "417 Hz", archetype: "The Star" },
];

export const AstraeaOracle: React.FC = () => {
  const [currentOracle, setCurrentOracle] = useState<OracleMessage | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('rest');
  const [meditationMode, setMeditationMode] = useState(false);

  const drawOracle = () => {
    setIsDrawing(true);
    setCurrentOracle(null);
    setTimeout(() => {
      const random = ORACLES[Math.floor(Math.random() * ORACLES.length)];
      setCurrentOracle(random);
      setIsDrawing(false);
    }, 2500);
  };

  useEffect(() => {
    let timer: any;
    if (meditationMode) {
      const runBreathCycle = () => {
        setBreathPhase('inhale');
        timer = setTimeout(() => {
          setBreathPhase('hold');
          timer = setTimeout(() => {
            setBreathPhase('exhale');
            timer = setTimeout(() => {
              setBreathPhase('rest');
              timer = setTimeout(runBreathCycle, 2000);
            }, 4000);
          }, 4000);
        }, 4000);
      };
      runBreathCycle();
    } else {
      setBreathPhase('rest');
    }
    return () => clearTimeout(timer);
  }, [meditationMode]);

  return (
    <div className="w-full h-full min-h-[650px] bg-slate-950/40 rounded-[3rem] border border-pink-500/20 backdrop-blur-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_0_50px_rgba(236,72,153,0.1)]">
      
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08),transparent_70%)]" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      
      {/* Esoteric Geometry Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-pink-500/30 stroke-[0.1] fill-none">
          <circle cx="50" cy="50" r="45" />
          <polygon points="50,5 95,80 5,80" className="animate-spin-slow origin-center" />
          <polygon points="50,95 5,20 95,20" className="animate-spin-slow-reverse origin-center" />
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-2xl w-full">
        <header className="mb-8 space-y-4">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/10 rounded-full flex items-center justify-center border border-pink-500/40 mx-auto shadow-[0_0_30px_rgba(236,72,153,0.2)] cursor-pointer"
          >
            <Flower2 className="text-pink-400 w-12 h-12" />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-4xl font-light text-white tracking-[0.4em] uppercase font-serif mt-6">Astraea Oracle</h2>
            <p className="text-[10px] text-pink-300/50 uppercase tracking-[0.5em] font-mono">Resonance of the Divine Feminine Matrix</p>
          </div>
        </header>

        {/* Meditation Ring */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-10">
          <AnimatePresence>
            {meditationMode && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: breathPhase === 'inhale' ? 1.2 : breathPhase === 'hold' ? 1.2 : breathPhase === 'exhale' ? 0.9 : 0.9,
                  opacity: 1
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-pink-500/10 blur-xl border-2 border-pink-500/20"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isDrawing ? (
              <motion.div 
                key="drawing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 border-2 border-dashed border-pink-500/40 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border border-purple-500/20 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-pink-500 animate-pulse w-10 h-10" />
                  </div>
                </div>
                <span className="text-xs text-pink-400 font-mono tracking-[0.3em] uppercase animate-pulse">Scanning Akashic Patterns...</span>
              </motion.div>
            ) : currentOracle ? (
              <ProjectableWidget id="oracle-wisdom" type="widget" componentName="Astraea Wisdom" data={currentOracle}>
                <motion.div 
                  key="message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8 px-6 pb-4"
                >
                  <div>
                    <span className="text-[10px] text-pink-500/60 uppercase tracking-[0.4em] mb-4 block font-mono">Archetype: {currentOracle.archetype}</span>
                    <p className="text-3xl font-serif text-white leading-tight italic decoration-pink-500/20 underline underline-offset-8">
                      "{currentOracle.text}"
                    </p>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <motion.div 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="px-4 py-2 bg-pink-500/5 border border-pink-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-md"
                    >
                      <Heart size={14} className="text-pink-500" />
                      <div className="text-left">
                        <span className="text-[8px] text-pink-300/40 uppercase block">Essence</span>
                        <span className="text-[10px] text-white font-mono uppercase tracking-widest">{currentOracle.energy}</span>
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="px-4 py-2 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-md"
                    >
                      <Zap size={14} className="text-amber-400" />
                      <div className="text-left">
                        <span className="text-[8px] text-purple-300/40 uppercase block">Tone</span>
                        <span className="text-[10px] text-white font-mono uppercase tracking-widest">{currentOracle.frequency}</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </ProjectableWidget>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                <div className="space-y-2">
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] italic">Presence your intention</p>
                  <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">The stars are receptive to your pulse</p>
                </div>
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={drawOracle}
            disabled={isDrawing}
            className="flex-1 relative group overflow-hidden px-8 py-5 bg-transparent border border-pink-500/30 text-pink-400 rounded-3xl text-[12px] uppercase font-bold tracking-[0.3em] hover:text-white transition-all shadow-[0_0_30px_rgba(236,72,153,0.15)] active:scale-95 disabled:opacity-40"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              Draw Oracle
              <Moon size={16} className="group-hover:rotate-45 transition-transform duration-700" />
            </span>
          </button>

          <button 
            onClick={() => setMeditationMode(!meditationMode)}
            className={`flex-1 relative group overflow-hidden px-8 py-5 rounded-3xl text-[12px] uppercase font-bold tracking-[0.3em] transition-all active:scale-95 border ${meditationMode ? 'bg-pink-600/20 border-pink-500 text-pink-300' : 'bg-transparent border-purple-500/30 text-purple-400 hover:text-white'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 transition-transform duration-500 ${meditationMode ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`} />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {meditationMode ? 'Exit Presence' : 'Celestial Breath'}
              <Activity size={16} className={meditationMode ? 'animate-pulse' : ''} />
            </span>
          </button>
        </div>

        <AnimatePresence>
          {meditationMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 text-pink-400/60 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse"
            >
              {breathPhase === 'inhale' && 'Inhale the Light...'}
              {breathPhase === 'hold' && 'Suspend in the Void...'}
              {breathPhase === 'exhale' && 'Release to the Stars...'}
              {breathPhase === 'rest' && 'Abide in Presence...'}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 text-[10px] text-zinc-600 font-mono uppercase tracking-[0.5em] flex items-center gap-4">
          <div className="w-12 h-px bg-zinc-800/50" />
          Transmission of the Eternal Receptive
          <div className="w-12 h-px bg-zinc-800/50" />
        </footer>
      </div>

    </div>
  );
};
