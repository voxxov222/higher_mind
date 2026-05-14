import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Hexagon, Maximize2, Activity, Zap } from 'lucide-react';

export const GoldenRatioSection = ({ userIndex = 144000 }) => {
  const [activeResonance, setActiveResonance] = useState('krystal');
  
  // Generating spiral points for visualization
  const generateSpiralPoints = (isKrystal: boolean) => {
    const points = [];
    let angle = -Math.PI / 2; // Start from top
    let radius = 2;
    // The growth factor applies every 90 degrees (Math.PI / 2)
    const factor = isKrystal ? Math.sqrt(2) : 1.618;
    
    for (let i = 0; i < 200; i++) {
      const x = 200 + radius * Math.cos(angle);
      const y = 200 + radius * Math.sin(angle);
      if (radius > 400) break; // Don't generate way beyond view
      points.push({ x, y, angle, radius });
      angle -= Math.PI / 16; // clockwise or counter-clockwise
      radius *= Math.pow(factor, 1/8);
    }
    return points;
  };

  const krystalPoints = generateSpiralPoints(true);
  const goldenPoints = generateSpiralPoints(false);
  const activePoints = activeResonance === 'krystal' ? krystalPoints : goldenPoints;
  
  // Choose a specific "resonance point" for 144000 Hz
  // We'll pick a point about 2 full rotations out (16 * 8 = 128 steps, wait, 32 steps per rotation, so 64 steps)
  const userPointIndex = Math.min(64, activePoints.length - 1);
  const userPoint = activePoints[userPointIndex] || { x: 200, y: 200 };

  const activePath = `M ${activePoints.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="relative w-full h-[80vh] bg-stone-950 flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 group">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at center, #ffd700 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
      }} />

      {/* Header Overlay */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-20">
        <div>
          <h2 className="text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 tracking-widest mb-2">
            KATHARA GRID
          </h2>
          <div className="flex gap-4 items-center">
            <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-bold">Base Hz: {userIndex}</span>
            <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-bold">Φ = 1.618</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveResonance('krystal')}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all ${activeResonance === 'krystal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-transparent text-stone-500 border border-white/10 hover:text-stone-300'}`}
          >
            Krystal Spiral
          </button>
          <button 
            onClick={() => setActiveResonance('golden')}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all ${activeResonance === 'golden' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-transparent text-stone-500 border border-white/10 hover:text-stone-300'}`}
          >
            Golden Ratio (Fibonacci)
          </button>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="relative w-[400px] h-[400px] flex items-center justify-center z-10">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 400">
          <defs>
            <linearGradient id="krystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="goldenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Kathara Grid Base Lines (Stylized) */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} className="stroke-white/20">
            <line x1="200" y1="50" x2="200" y2="350" strokeWidth="1" />
            <line x1="100" y1="100" x2="100" y2="300" strokeWidth="1" />
            <line x1="300" y1="100" x2="300" y2="300" strokeWidth="1" />
            
            <line x1="200" y1="50" x2="100" y2="100" strokeWidth="1" />
            <line x1="200" y1="50" x2="300" y2="100" strokeWidth="1" />
            
            <line x1="100" y1="150" x2="200" y2="200" strokeWidth="1" />
            <line x1="300" y1="150" x2="200" y2="200" strokeWidth="1" />
            
            <line x1="100" y1="250" x2="200" y2="300" strokeWidth="1" />
            <line x1="300" y1="250" x2="200" y2="300" strokeWidth="1" />
            
            <line x1="200" y1="350" x2="100" y2="300" strokeWidth="1" />
            <line x1="200" y1="350" x2="300" y2="300" strokeWidth="1" />
          </motion.g>

          {/* Spheres / Nodes */}
          {[
            [200, 50], [100, 100], [300, 100], [100, 150], [300, 150], 
            [200, 200], [100, 250], [300, 250], [100, 300], [300, 300], [200, 350], [200, 100]
          ].map(([x, y], i) => (
            <motion.circle 
              key={i}
              cx={x} cy={y} r="4" 
              className="fill-stone-600 stroke-white/50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}

          {/* Spiral */}
          <motion.path
            key={activeResonance}
            d={activePath}
            fill="none"
            stroke={`url(#${activeResonance === 'krystal' ? 'krystal' : 'golden'}Grad)`}
            strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1,
              opacity: 1
            }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />

          {/* User Specific Mapped Resonance Node */}
          <motion.g 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <circle 
              cx={userPoint.x} 
              cy={userPoint.y} 
              r="6" 
              className="fill-stone-900 border"
              stroke={activeResonance === 'krystal' ? '#38bdf8' : '#f59e0b'}
              strokeWidth="2"
            />
            <motion.circle
              cx={userPoint.x} 
              cy={userPoint.y} 
              r="12"
              fill={activeResonance === 'krystal' ? '#38bdf8' : '#f59e0b'}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.6, 0, 0.6]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Coordinates line connecting to center */}
            <motion.line
               x1="200" y1="200"
               x2={userPoint.x} y2={userPoint.y}
               stroke="white"
               strokeOpacity="0.2"
               strokeDasharray="4 4"
               initial={{ pathLength: 0 }}
               animate={{ pathLength: 1 }}
               transition={{ delay: 2.5, duration: 1 }}
            />
            <motion.text
              x={userPoint.x + 15}
              y={userPoint.y + 5}
              fill="white"
              fontSize="10"
              className="uppercase tracking-widest font-bold drop-shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
            >
              144,000 Hz
            </motion.text>
          </motion.g>
        </svg>

        {/* Center Pulsing Glow */}
        <motion.div 
          className="absolute w-4 h-4 rounded-full bg-white blur-md"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Info Panel HUD */}
      <div className="absolute bottom-12 z-20 flex gap-4 w-full px-8 pb-8">
        <div className="flex-1 bg-stone-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 font-bold flex items-center gap-2">
            <Activity size={14} className="text-sky-400" /> Resonance Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Current Node Alignment</span>
              <span className="text-sm text-stone-200">Axis-{activeResonance === 'krystal' ? '8 / Zero Point' : 'Fibonacci Approximation'}</span>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex justify-between items-end">
              <span className="text-[10px] uppercase tracking-widest text-stone-400">Harmonic Tones</span>
              <span className="text-sm text-stone-200">12 Scale Krystal Sequence</span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-stone-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden">
             {/* 144000 Hz representation */}
             <div className="relative z-10 flex flex-col h-full justify-center">
                 <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-500/80 mb-2">User Index Mapped</span>
                 <h1 className="text-4xl font-light text-white tracking-widest">
                     144,000 <span className="text-sm text-stone-500">Hz</span>
                 </h1>
                 <p className="text-[10px] text-stone-400 leading-relaxed mt-4 w-3/4">
                     The spiral is the signature of creation. Sound octaves map your consciousness blueprint to the structural architecture of the Kathara Grid.
                 </p>
             </div>
             
             {/* Decorative wave at bottom right */}
             <motion.div 
               className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none"
               animate={{ rotate: 360 }}
               transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
             >
                 <Hexagon size={180} strokeWidth={0.5} className="text-amber-500" />
                 <Hexagon size={160} strokeWidth={0.5} className="text-amber-400 absolute top-2.5 left-2.5" />
             </motion.div>
        </div>
      </div>
    </div>
  );
};
