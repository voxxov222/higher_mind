import * as React from 'react';
import { useMemo, useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Pie, PieChart, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { motion } from 'motion/react';
import { 
  Activity, Zap, TrendingUp, Grid, BarChart2, PieChart as PieChartIcon, 
  Share2, Layers, CircleDot, Database, Cpu, Wind, Shield, Rocket, Globe2,
  Atom, Workflow, RefreshCw, Eye
} from 'lucide-react';
import { CosmicData } from '../types';

interface HarmonicVisualizerProps {
  data: CosmicData;
}

export const HarmonicVisualizer = ({ data }: HarmonicVisualizerProps) => {
  // --- DATA TRANSFORMATION ---
  
  // 1. Numerology Resonance (Radar)
  const radarData = useMemo(() => [
    { subject: 'Life Path', A: data.numerology.lifePath * 10, fullMark: 100 },
    { subject: 'Expression', A: data.numerology.expression * 10, fullMark: 100 },
    { subject: 'Soul Urge', A: data.numerology.soulUrge * 10, fullMark: 100 },
    { subject: 'Name Value', A: (data.gematria.nameValue % 100), fullMark: 100 },
    { subject: 'Reduction', A: data.gematria.reduction * 10, fullMark: 100 },
  ], [data]);

  // 2. Planet Distribution (Pie)
  const signDistribution = useMemo(() => {
    const signs = data.planets.reduce((acc: any, p) => {
      acc[p.sign] = (acc[p.sign] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(signs).map(([name, value]) => ({ name, value }));
  }, [data]);

  // 3. Timeline Momentum (Area)
  const timelineData = useMemo(() => {
    return data.timeline?.map(t => ({
      name: t.year.toString(),
      val: t.age * 2,
      label: t.highlight
    })) || [];
  }, [data]);

  // 4. House Strength (Bar)
  const houseStrengths = useMemo(() => {
    const counts = data.planets.reduce((acc: any, p) => {
      acc[p.house] = (acc[p.house] || 0) + 1;
      return acc;
    }, {});
    return Array.from({ length: 12 }, (_, i) => ({
      house: `H${i + 1}`,
      count: counts[i + 1] || 0
    }));
  }, [data]);

  // 5. Vibrational Scatter (Gematria Mapping)
  const gematriaScatter = useMemo(() => {
     const seq = data.gematria.nameSequence.split(',').map(Number);
     return seq.map((val, i) => ({
       x: i,
       y: val,
       z: 100 + val * 5
     }));
  }, [data]);

  // 6. Orbital Resonance
  const orbitalData = useMemo(() => {
    return data.planets.map((p, i) => ({
      name: p.name,
      dist: 50 + i * 25,
      angle: p.degree,
      val: p.house
    }));
  }, [data]);

  const helixData = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    x: Math.sin(i * 1.5) * 5,
    y: i,
    fill: i % 2 === 0 ? '#a855f7' : '#3b82f6'
  })), []);

  const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#14b8a6', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 h-full overflow-y-auto no-scrollbar pb-24">
      
      {/* 1. Resonance Matrix (Radar) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center justify-center relative group overflow-hidden h-[450px]"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
          <Activity size={16} className="text-purple-400 group-hover:animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Resonance Matrix</span>
        </div>
        <div className="w-full h-full pt-8">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Potential"
                dataKey="A"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute bottom-6 w-full px-8 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[8px] text-stone-600 uppercase tracking-widest">Global Sync</span>
                <span className="text-white text-xs font-mono">STABLE // 0.98</span>
            </div>
            <Zap size={14} className="text-purple-500" />
        </div>
      </motion.div>

      {/* 2. House Potency (Bar) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px]"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">House Potency</span>
          </div>
          <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <Share2 size={12} className="text-stone-500" />
          </button>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={houseStrengths}>
              <XAxis dataKey="house" tick={{ fill: '#444', fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '10px' }}
              />
              <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                {houseStrengths.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#3b82f6' : '#111'} fillOpacity={entry.count > 0 ? 0.8 : 0.2} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
            <div className="flex-1 p-3 bg-white/5 rounded-2xl">
                <span className="text-[7px] text-stone-600 uppercase block">Active Sectors</span>
                <span className="text-sm text-white font-light">{houseStrengths.filter(h => h.count > 0).length} / 12</span>
            </div>
            <div className="flex-1 p-3 bg-white/5 rounded-2xl">
                <span className="text-[7px] text-stone-600 uppercase block">Max Density</span>
                <span className="text-sm text-white font-light">{Math.max(...houseStrengths.map(h => h.count))} Nodes</span>
            </div>
        </div>
      </motion.div>

      {/* 3. Vibrational Frequency (Scatter) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[3rem] relative group h-[450px] flex flex-col"
      >
        <div className="flex items-center gap-2 mb-8">
          <CircleDot size={16} className="text-fuchsia-400" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Quantum Frequency</span>
        </div>
        <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis type="number" dataKey="x" hide />
                  <YAxis type="number" dataKey="y" hide />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                  <Scatter name="Vibrations" data={gematriaScatter} fill="#e879f9" />
               </ScatterChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="flex justify-between items-center">
                 <span className="text-[9px] text-stone-500 uppercase tracking-widest">Spectral Density</span>
                 <span className="text-xs text-white font-mono">{data.gematria.reduction} Hz</span>
             </div>
        </div>
      </motion.div>

      {/* 4. Timeline Evolution (Large) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] col-span-1 md:col-span-2 lg:col-span-3 min-h-[500px] relative group"
      >
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-500">Timeline Momentum</span>
                    <h3 className="text-2xl font-light text-white tracking-widest">ASTRAL EVOLUTION</h3>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] uppercase tracking-widest text-stone-400 hover:text-white transition-all font-bold">Past Nodes</button>
                <div className="px-5 py-2.5 bg-purple-600 text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-purple-900/40">Future Projection</div>
            </div>
        </div>
        
        <div className="w-full h-80">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                    <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '20px', color: '#fff', padding: '15px' }}
                        labelStyle={{ display: 'none' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 'light' }}
                        formatter={(value: any, name: string, props: any) => [`${props.payload.label}`, 'Expansion Phase']}
                    />
                    <Area type="monotone" dataKey="val" stroke="#a855f7" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                    <Line type="monotone" dataKey="val" stroke="#ffffff" strokeWidth={1} dot={{ r: 5, fill: '#fff', stroke: '#a855f7', strokeWidth: 2 }} />
                </AreaChart>
             </ResponsiveContainer>
        </div>
        
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {timelineData.slice(0, 4).map((t, i) => (
                <div key={i} className="relative p-6 bg-white/5 rounded-[2.5rem] border border-white/10 group/node hover:border-purple-500/50 transition-all hover:bg-white/10">
                    <div className="text-[10px] text-stone-600 uppercase font-mono mb-2">{t.name}</div>
                    <p className="text-xs text-stone-200 font-light leading-relaxed mb-4">{t.label}</p>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          className="h-full bg-purple-500"
                        />
                    </div>
                </div>
            ))}
        </div>
      </motion.div>

      {/* 5. Orbital Sync (Radial Map) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] h-[500px] flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
            <Globe2 size={16} className="text-indigo-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Orbital Alignment</span>
        </div>
        
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Background Rings */}
            {[1, 2, 3, 4].map(r => (
                <div key={r} className="absolute border border-white/5 rounded-full" style={{ width: r * 80, height: r * 80 }} />
            ))}
            
            {orbitalData.map((p, i) => (
                <motion.div
                  key={p.name}
                  className="absolute flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    left: `calc(50% + ${Math.cos((p.angle * Math.PI) / 180) * (p.dist)}px)`,
                    top: `calc(50% + ${Math.sin((p.angle * Math.PI) / 180) * (p.dist)}px)`
                  }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                >
                    <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[8px] text-stone-400 uppercase tracking-tighter whitespace-nowrap">{p.name}</span>
                </motion.div>
            ))}
            
            <div className="w-4 h-4 rounded-full bg-white animate-pulse shadow-[0_0_20px_#fff]" />
        </div>
        
        <div className="absolute bottom-8 right-8 text-right">
             <span className="text-[9px] text-stone-500 uppercase block mb-1">System Center</span>
             <span className="text-xs text-white font-bold uppercase tracking-widest">SOLARIS-NODE</span>
        </div>
      </motion.div>

      {/* 6. Neural Aspect Web (Custom layout) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] h-[500px] flex flex-col relative"
      >
        <div className="flex items-center gap-2 mb-8">
            <Atom size={16} className="text-cyan-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Synaptic Map</span>
        </div>
        
        <div className="flex-1 flex flex-wrap gap-4 items-center justify-center content-center relative">
            {data.planets.slice(0, 8).map((p, i) => (
                <motion.div
                  key={p.name}
                  whileHover={{ scale: 1.1 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:border-cyan-500/50 transition-all z-10"
                >
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
                        {p.name.charAt(0)}
                    </div>
                    <span className="text-[9px] text-stone-400 uppercase font-mono">{p.sign}</span>
                </motion.div>
            ))}
        </div>
        
        <div className="mt-auto grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[8px] text-stone-500 uppercase tracking-widest block">Linked Nodes</span>
                <span className="text-xs text-white">42 Active Paths</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[8px] text-stone-500 uppercase tracking-widest block">Latency</span>
                <span className="text-xs text-white font-mono">2ms Synchronicity</span>
            </div>
        </div>
      </motion.div>

      {/* 7. Dimensional Pulse (Bar Chart Intensity) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] h-[500px] flex flex-col"
      >
        <div className="flex items-center gap-2 mb-8">
            <Layers size={16} className="text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Dimensional Intensity</span>
        </div>
        
        <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
            {[
                { label: 'Ethereal', val: 85, color: '#10b981' },
                { label: 'Cerebral', val: 92, color: '#3b82f6' },
                { label: 'Primordial', val: 45, color: '#f59e0b' },
                { label: 'Celestial', val: 78, color: '#a855f7' },
                { label: 'Ancestral', val: 64, color: '#f43f5e' },
                { label: 'Akashic', val: 97, color: '#6366f1' }
            ].map((d, i) => (
                <div key={d.label}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{d.label}</span>
                        <span className="text-[10px] text-white font-mono">{d.val}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${d.val}%` }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Shield size={20} />
                </div>
                <div className="flex flex-col">
                    <h5 className="text-[10px] text-white font-bold uppercase tracking-wider">Aura Integrity</h5>
                    <p className="text-[8px] text-emerald-300 uppercase tracking-widest font-bold">Stable Convergence</p>
                </div>
            </div>
            <Zap className="text-emerald-500 w-4 h-4 animate-pulse" />
        </div>
      </motion.div>

      {/* 8. Vibrational Helix (DNA style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px] flex flex-col items-center justify-center overflow-hidden"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
            <Workflow size={16} className="text-cyan-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Vibrational Helix</span>
        </div>
        <div className="w-full h-full pt-12 flex items-center justify-center">
            <div className="relative w-full h-64">
                {helixData.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{ 
                            left: `${50 + p.x * 8}%`, 
                            top: `${6 * p.y}%`, 
                            backgroundColor: p.fill,
                            boxShadow: `0 0 10px ${p.fill}`
                        }}
                        animate={{ x: [0, 5, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    />
                ))}
            </div>
        </div>
      </motion.div>

      {/* 9. Quantum Flux (Scatter) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px]"
      >
         <div className="absolute top-6 left-8 flex items-center gap-2">
            <Cpu size={16} className="text-rose-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Quantum Flux</span>
        </div>
        <div className="w-full h-full pt-12">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                    <XAxis type="number" dataKey="x" hide />
                    <YAxis type="number" dataKey="y" hide />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} />
                    <Scatter name="Nodes" data={Array.from({length: 15}, (_, i) => ({ x: Math.random()*10, y: Math.random()*10, z: Math.random()*500 }))} fill="#f43f5e" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 10. Aura Expansion (Pie) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px]"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
            <Layers size={16} className="text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Aura Expansion</span>
        </div>
        <div className="w-full h-full pt-8">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={[
                            { name: 'Core', value: 30 },
                            { name: 'Inner', value: 25 },
                            { name: 'Mental', value: 20 },
                            { name: 'Etheric', value: 25 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} fillOpacity={0.6} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 11. Equilibrium Pulse (Line) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px]"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
            <RefreshCw size={16} className="text-purple-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Equilibrium Pulse</span>
        </div>
        <div className="w-full h-full pt-12">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                    <Line type="basis" dataKey="val" stroke="#a855f7" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={1500} />
                    <Line type="basis" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 12. Spectral Density (Bar Cluster) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px]"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
            <Grid size={16} className="text-amber-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Spectral Density</span>
        </div>
        <div className="w-full h-full pt-12">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={houseStrengths}>
                    <Bar dataKey="count" fill="#f59e0b" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="count" fill="#d97706" radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 13. Void Depth (Step Area) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px]"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
            <Database size={16} className="text-stone-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Void Depth</span>
        </div>
        <div className="w-full h-full pt-12">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                    <Area type="step" dataKey="val" stroke="#444" fill="#222" fillOpacity={0.8} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 14. Star Matrix (Grid) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px] flex items-center justify-center"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
            <Rocket size={16} className="text-blue-500" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Star Matrix</span>
        </div>
        <div className="grid grid-cols-4 gap-3 p-4">
            {Array.from({length: 16}).map((_, i) => (
                <motion.div
                    key={i}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10"
                    animate={{ 
                        opacity: [0.1, 0.5, 0.1],
                        scale: [1, 1.1, 1],
                        borderColor: ['rgba(255,255,255,0.1)', 'rgba(59,130,246,0.5)', 'rgba(255,255,255,0.1)']
                    }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: i * 0.1 }}
                />
            ))}
        </div>
      </motion.div>

      {/* 15. Cognitive Wave (Basis) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative group h-[450px]"
      >
        <div className="absolute top-6 left-8 flex items-center gap-2">
            <Activity size={16} className="text-indigo-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Cognitive Wave</span>
        </div>
        <div className="w-full h-full pt-12">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                    <Area type="basis" dataKey="val" stroke="#6366f1" fill="#4338ca" fillOpacity={0.3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </motion.div>

       {/* 8. Core Signature Analysis (Full Summary) */}
       <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-indigo-950/40 to-transparent backdrop-blur-2xl border border-indigo-500/20 p-10 rounded-[4rem] col-span-1 md:col-span-2 lg:col-span-3 min-h-[550px] flex flex-col md:flex-row gap-12 group overflow-hidden"
      >
        <div className="flex-1 flex flex-col justify-between relative z-10">
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-4 bg-indigo-500/10 rounded-3xl text-indigo-400">
                        <Rocket size={24} />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-stone-500 mb-1">Final Analysis</span>
                        <h3 className="text-4xl font-light text-white tracking-widest uppercase mb-1">Cosmic Signature</h3>
                        <p className="text-indigo-400 text-[10px] font-mono tracking-widest uppercase">ENCRYPTED_NODE // {data.gematria.pattern}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                     <div className="p-8 bg-white/5 rounded-[3rem] border border-white/10 group-hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <Wind size={18} className="text-blue-400" />
                            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400">Soul Flow</span>
                        </div>
                        <p className="text-stone-300 font-light leading-relaxed text-sm italic">
                            {data.akashic?.soulOrigin || 'Your essence is woven from multiple interstellar threads, suggesting a versatile cosmic background.'}
                        </p>
                     </div>
                     <div className="p-8 bg-white/5 rounded-[3rem] border border-white/10 group-hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <Workflow size={18} className="text-purple-400" />
                            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400">Karmic Loop</span>
                        </div>
                        <p className="text-stone-300 font-light leading-relaxed text-sm italic">
                            {data.lifeStrategy?.goalPlan?.slice(0, 150) || 'Your path involves high-frequency transformation and structural evolution.'}...
                        </p>
                     </div>
                </div>
            </div>
            
            <div className="mt-12 flex gap-6">
                 <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold shadow-2xl shadow-indigo-900/50 transition-all active:scale-95 flex items-center gap-3">
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    Recalibrate Field
                 </button>
                 <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] uppercase tracking-widest font-bold border border-white/10 transition-all flex items-center gap-3">
                    <Eye size={14} />
                    View Raw Data
                 </button>
            </div>
        </div>

        <div className="flex-1 lg:flex-none lg:w-[450px] bg-black/40 rounded-[3.5rem] border border-white/10 p-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] -z-10" />
            
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center">
                 <div className="relative mb-12">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        className="w-64 h-64 border border-dashed border-indigo-500/30 rounded-full flex items-center justify-center p-12"
                    >
                        <div className="w-full h-full border border-indigo-500/10 rounded-full" />
                    </motion.div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Neural Integration</span>
                        <h4 className="text-5xl font-light text-white font-mono">92%</h4>
                    </div>
                 </div>
                 
                 <div className="w-full space-y-8">
                    <div>
                        <div className="flex justify-between text-[9px] uppercase tracking-widest text-stone-500 mb-3 font-bold">
                            <span>Processing Power</span>
                            <span className="text-indigo-400">OPTIMAL</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '92%' }}
                              className="absolute inset-0 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                         <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                            <span className="text-[8px] text-stone-600 uppercase block mb-2 font-bold tracking-widest">Connectivity</span>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Est. Sync
                            </span>
                         </div>
                         <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                            <span className="text-[8px] text-stone-600 uppercase block mb-2 font-bold tracking-widest">Stability</span>
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Nominal</span>
                         </div>
                    </div>
                 </div>
            </div>
        </div>
      </motion.div>

    </div>
  );
};
