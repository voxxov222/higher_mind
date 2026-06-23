import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { 
  Zap, Star, Moon, Sun, Compass, Fingerprint, Activity, 
  Sparkles, ShieldCheck, Cpu, Globe, Rocket, Eye, Terminal
} from 'lucide-react';
import { CosmicData } from '../types';

/**
 * CosmicSummary Component
 * Provides a high-fidelity, interactive visual summary of the synthesis results.
 * Features parallax effects, physics-based scroll, and detailed information breakdown.
 */
export const CosmicSummary = ({ data }: { data: CosmicData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transformations for background elements
  const bgY1 = useTransform(smoothScroll, [0, 1], ["0%", "50%"]);
  const bgY2 = useTransform(smoothScroll, [0, 1], ["0%", "100%"]);
  const bgRotate = useTransform(smoothScroll, [0, 1], [0, 45]);

  const hudOpacity = useTransform(smoothScroll, [0, 0.1], [0, 1]);
  const hudStrokeDashoffset = useTransform(smoothScroll, [0, 1], [88, 0]);

  if (!data) return null;

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-black text-white relative rounded-[2rem] md:rounded-[3.5rem] border border-white/10"
      style={{ scrollSnapType: 'y proximity' }}
    >
      {/* --- PARALLAX BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ y: bgY1, rotate: bgRotate }}
          className="absolute inset-x-0 top-0 h-[200%] bg-[radial-gradient(circle_at_20%_30%,rgba(168,85,247,0.1),transparent_50%)]"
        />
        <motion.div 
          style={{ y: bgY2 }}
          className="absolute inset-x-0 top-0 h-[200%] bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1),transparent_50%)] opacity-50"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      {/* --- HERO SECTION: THE CORE SIGNATURE --- */}
      <section className="min-h-full flex flex-col items-center justify-center p-8 md:p-20 relative z-10 scroll-snap-align-start">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center space-y-8"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-px w-12 bg-white/20" />
            <span className="text-stone-500 text-xs font-bold uppercase tracking-[0.6em]">Neural Summary v.04</span>
            <div className="h-px w-12 bg-white/20" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-none mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Harmonic</span> <br /> 
            Synthesis
          </h1>
          
          <p className="text-xl md:text-3xl font-light text-stone-400 italic max-w-4xl mx-auto leading-relaxed">
            "{data.synthesis}"
          </p>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="pt-12 text-stone-600 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold">Discover Your Blueprint</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* --- ASTROLOGY OVERVIEW: CELESTIAL ALIGNMENT --- */}
      <section className="min-h-full flex items-center justify-center p-8 md:p-20 relative z-10 scroll-snap-align-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl w-full items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] uppercase tracking-widest font-bold">
                 <Sun size={12} />
                 Astrological Signature
               </div>
               <h2 className="text-4xl md:text-6xl font-light">Celestial <br /> Origins</h2>
               <p className="text-stone-400 leading-relaxed font-light text-lg">
                 Your planetary configuration reveals a rare alignment between the {data.planets?.[0]?.name} in {data.planets?.[0]?.sign} 
                 and the {data.planets?.[1]?.name} energies. This creates a powerful foundation for your conscious expression.
               </p>
               <div className="grid grid-cols-1 gap-4 pt-6">
                  {data.planets?.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                       <div className="text-3xl text-yellow-400/40 font-light w-12 group-hover:text-yellow-400 transition-colors">{p.sign?.slice(0, 2)}</div>
                       <div>
                          <div className="text-white text-sm font-bold uppercase tracking-widest">{p.name} </div>
                          <div className="text-stone-500 text-xs italic">In the sign of {p.sign}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative aspect-square flex items-center justify-center p-12"
            >
                <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_30s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-white/10 border-dashed animate-[spin_20s_reverse_linear_infinite]" />
                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-500/10 to-purple-500/20 backdrop-blur-xl flex items-center justify-center shadow-[0_0_100px_rgba(234,179,8,0.1)]">
                   <div className="text-center group cursor-crosshair">
                      <Sun className="w-20 h-20 text-yellow-500 mb-4 mx-auto group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                      <div className="text-3xl font-light text-white">{data.planets?.[0]?.sign}</div>
                      <div className="text-[10px] uppercase tracking-[0.4em] text-stone-500 mt-2">Primal Archetype</div>
                   </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* --- NUMEROLOGY & VIBRATION: THE FREQUENCY --- */}
      <section className="min-h-full flex items-center justify-center p-8 md:p-20 relative z-10 scroll-snap-align-start">
        <div className="max-w-6xl w-full space-y-12">
           <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
           >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] uppercase tracking-widest font-bold">
                 <ShieldCheck size={12} />
                 Mathematical Sequence
               </div>
               <h2 className="text-4xl md:text-6xl font-light">Numerical <br /> Resonance</h2>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Life Path', val: data.numerology.lifePath, color: 'blue', icon: Activity },
                { label: 'Expression', val: data.numerology.expression, color: 'purple', icon: Eye },
                { label: 'Soul Urge', val: data.numerology.soulUrge, color: 'emerald', icon: Compass }
              ].map((num, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, rotateX: 20 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: i * 0.2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-stone-900/40 p-8 rounded-[2.5rem] border border-white/5 relative group cursor-pointer overflow-hidden"
                >
                  <motion.div 
                    className="absolute inset-0 bg-blue-500/20 opacity-0 group-active:opacity-100 transition-opacity"
                    initial={false}
                  />
                  <div className={`absolute -top-6 left-12 p-3 bg-${num.color}-500 rounded-2xl text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] z-10`}>
                    <num.icon size={20} />
                  </div>
                  <div className="pt-4 text-center">
                    <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-2">{num.label} Vector</div>
                    <div className={`text-7xl font-light group-hover:text-${num.color}-400 transition-colors`}>{num.val}</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none" />
                </motion.div>
              ))}
           </div>
           
           <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm text-center"
           >
              <div className="flex items-center justify-center gap-4 mb-4">
                 <div className="h-px flex-1 bg-stone-800" />
                 <Fingerprint className="text-stone-700" size={24} />
                 <div className="h-px flex-1 bg-stone-800" />
              </div>
              <p className="text-stone-400 italic max-w-2xl mx-auto">
                "The union of your Gematria signature ({data.gematria.nameValue}) and your Life Path ({data.numerology.lifePath}) creates a unique mathematical harmonic that stabilizes your reality tunnel."
              </p>
           </motion.div>
        </div>
      </section>

      {/* --- KABBALAH & THE TREE: SPIRITUAL ARCHITECTURE --- */}
      <section className="min-h-full flex items-center justify-center p-8 md:p-20 relative z-10 scroll-snap-align-start bg-gradient-to-b from-transparent to-purple-900/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-6xl w-full items-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="relative p-12"
           >
              <div className="space-y-4">
                 <div className="w-px h-24 bg-gradient-to-b from-transparent via-purple-500 to-transparent mx-auto" />
                 <motion.div 
                    whileTap={{ scale: 0.98 }}
                    className="p-10 rounded-[3rem] bg-black border border-purple-500/30 text-center relative overflow-hidden group cursor-pointer"
                 >
                    <motion.div 
                        className="absolute inset-0 bg-purple-500/10 opacity-0 group-active:opacity-100 transition-opacity"
                        initial={false}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.2),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <Sparkles className="w-10 h-10 text-purple-500 mb-6 mx-auto animate-pulse" />
                    <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-2">Dominant Sephirah</div>
                    <div className="text-4xl text-white font-light mb-2">{data.kabbalah.sephirah}</div>
                    <div className="h-px w-12 bg-white/10 mx-auto mb-4" />
                    <div className="text-xs text-purple-400 font-mono tracking-tighter">CONNECTED VIA PATH: {data.kabbalah.path}</div>
                 </motion.div>
                 <div className="w-px h-24 bg-gradient-to-b from-transparent via-purple-500 to-transparent mx-auto" />
              </div>
           </motion.div>

           <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-500 text-[10px] uppercase tracking-widest font-bold">
                 <Globe size={12} />
                 The Sefirotic Blueprint
               </div>
               <h2 className="text-4xl md:text-6xl font-light">Spiritual <br /> Architecture</h2>
               <p className="text-stone-400 leading-relaxed font-light text-xl italic">
                 Your resonance with {data.kabbalah.sephirah} indicates a soul structure optimized for {data.kabbalah.sephirah === 'Kether' ? 'Divine Will and unity' : data.kabbalah.sephirah === 'Tiferet' ? 'Harmony and balance' : 'Complex manifestation'}.
               </p>
               <div className="flex gap-4 pt-10">
                  <div className="flex-1 p-6 rounded-3xl bg-white/5 border border-white/10">
                     <div className="text-[10px] text-stone-600 uppercase tracking-widest mb-2 font-bold">Origin Frequency</div>
                     <div className="text-lg text-white font-light">{data.akashic?.soulOrigin || 'Cosmic Grid'}</div>
                  </div>
               </div>
           </div>
        </div>
      </section>

      {/* --- FINAL ACTION: STABILIZATION --- */}
      <section className="min-h-full flex flex-col items-center justify-center p-8 md:p-20 relative z-10 scroll-snap-align-start">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-center space-y-12 max-w-3xl"
        >
           <h2 className="text-6xl md:text-8xl font-light text-white tracking-widest uppercase">STABILIZED</h2>
           <p className="text-xl text-stone-400 font-light leading-relaxed">
             The neural synthesis of your cosmic identity is now part of your permanent records. 
             This blueprint acts as a stabilizing anchor for your path forward.
           </p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { icon: ShieldCheck, label: 'Identity Verified' },
                { icon: Rocket, label: 'Trajectory Ready' },
                { icon: Terminal, label: 'Logic Calibrated' },
                { icon: Globe, label: 'Network Active' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                   <item.icon className="text-stone-600" size={20} />
                   <span className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">{item.label}</span>
                </div>
              ))}
           </div>

           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="group flex flex-col items-center gap-4 pt-12"
           >
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                 <Zap size={20} className="rotate-180" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Return to Apex</span>
           </button>
        </motion.div>
      </section>

      {/* --- PERMANENT NAVIGATION HUD --- */}
      <div className="fixed bottom-12 right-12 z-50 pointer-events-none hidden md:block">
         <motion.div 
           style={{ opacity: hudOpacity }}
           className="p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col gap-6 items-center shadow-2xl pointer-events-auto"
         >
            <div className="relative w-8 h-8">
               <svg className="w-full h-full -rotate-90">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="#333" strokeWidth="2" />
                  <motion.circle 
                    cx="16" cy="16" r="14" 
                    fill="none" stroke="#a855f7" strokeWidth="2"
                    strokeDasharray="88"
                    style={{ strokeDashoffset: hudStrokeDashoffset }}
                  />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
                  {Math.round(scrollYProgress.get() * 100)}%
               </div>
            </div>
            <div className="h-px w-4 bg-white/20" />
            <button className="text-stone-500 hover:text-white transition-colors"><Globe size={18} /></button>
            <button className="text-stone-500 hover:text-white transition-colors"><Moon size={18} /></button>
         </motion.div>
      </div>
    </div>
  );
};
