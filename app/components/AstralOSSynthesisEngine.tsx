import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Cpu, ScanLine } from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

const SYNTHESIS_DATA = [
  "INITIALIZING ASTRAL OS CORE...",
  "DATA STREAM: BIRTH_DATA_INPUT_ACCEPTED",
  "IDENTIFYING GEMINI DUALITY RESONANCE...",
  "CALCULATING GEMATRIA COORDINATES...",
  "SYNCHRONIZING BIRTH TIME: 3:14 PM | 03.14 (PI CONSTANT ALIGNMENT)",
  "DETECTING 202 INITIAL DUALITY PATTERN...",
  "LIFE PATH IDENTIFIED: 1 (THE FOX / SACRED ARCHETYPE)",
  "ANALYZING GOLDEN RATIO VECTOR: 1619 (Φ PROXIMITY ACTIVATED)",
  "CRAFTING COSMIC BLUEPRINT...",
  "STATUS: METICULOUSLY DESIGNED // NOT BORN // ACTIVATED"
];

export const AstralOSSynthesisEngine = () => {
  const [readout, setReadout] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];
    
    SYNTHESIS_DATA.forEach((line, index) => {
      const id = setTimeout(() => {
        setReadout((prev) => [...prev, line]);
        soundEngine.click();
        if (index === SYNTHESIS_DATA.length - 1) {
          setComplete(true);
          soundEngine.success();
        }
      }, index * 800);
      timeoutIds.push(id);
    });

    return () => timeoutIds.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-full bg-zinc-950 p-6 rounded-3xl border border-cyan-500/30 flex flex-col gap-6 shadow-[0_0_80px_rgba(6,182,212,0.15)]">
      <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4">
        <Cpu className="text-cyan-400 animate-pulse" />
        <h2 className="text-xl font-light text-white tracking-widest uppercase">Astral OS Synthesis Engine</h2>
      </div>

      <div className="flex-1 font-mono text-xs overflow-y-auto space-y-2 text-cyan-200 scrollbar-hide">
        <ScanLine className="absolute opacity-20 text-cyan-500 animate-pulse pointer-events-none" />
        {readout.map((line, i) => (
          <motion.p 
            key={i} 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="tracking-wider"
          >
            <span className="text-cyan-500 mr-2">{'>'}</span> {line}
          </motion.p>
        ))}
        {complete && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mt-6 p-4 border border-emerald-500/50 bg-emerald-950/20 rounded-xl text-emerald-300"
          >
            <Zap size={20} className="mb-2" />
            <p className="font-bold text-sm tracking-widest uppercase mb-2">SYNTHESIS COMPLETE</p>
            <p>YOU ARE NOT A COINCIDENCE. YOU ARE A DESIGNED ACTIVATOR.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
