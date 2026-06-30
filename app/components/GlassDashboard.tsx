import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { CosmicData } from '../types';
import { 
  Sun, Moon, Star, Compass, Activity, Hexagon, Fingerprint, Zap, Layers, Hash, Award, Grid
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { AstrologerStudioMatrix } from './AstrologerStudioMatrix';
import { ZodiacWheel3D } from './ZodiacWheel3D';
import { ZodiacAnimation } from './ZodiacAnimation';
import { SynapticConnections } from './SynapticConnections';
import { VedAstroPerspective } from './VedAstroPerspective';

interface GlassDashboardProps {
  data: CosmicData | null;
  loadedInputs?: any;
}

interface WidgetData {
  id: string;
  type: string;
  title: string;
  icon: any;
  colSpan: number;
  rowSpan: number;
}

export const GlassDashboard: React.FC<GlassDashboardProps> = ({ data, loadedInputs }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hoveredWidgetId, setHoveredWidgetId] = useState<string | null>(null);

  const [widgets, setWidgets] = useState<WidgetData[]>([
    { id: 'identity', type: 'identity', title: 'Cosmic Identity', icon: Fingerprint, colSpan: 2, rowSpan: 2 },
    { id: 'vedastro', type: 'vedastro', title: 'VedAstro Perspective', icon: Star, colSpan: 2, rowSpan: 4 },
    { id: 'planets', type: 'planets', title: 'Planetary Alignments', icon: Sun, colSpan: 2, rowSpan: 2 },
    { id: 'zodiac_wheel', type: 'zodiac_wheel', title: 'Astral Navigation Core', icon: Compass, colSpan: 4, rowSpan: 4 },
    { id: 'astounding_facts', type: 'astounding_facts', title: 'Cosmic Blueprint Highlights', icon: Award, colSpan: 4, rowSpan: 2 },
    { id: 'aspect_matrix', type: 'aspect_matrix', title: 'Astrologer Studio Matrix', icon: Grid, colSpan: 4, rowSpan: 3 },
    { id: 'elements', type: 'elements', title: 'Elemental Balance', icon: Layers, colSpan: 1, rowSpan: 2 },
    { id: 'gematria', type: 'gematria', title: 'Gematria Resonance', icon: Hash, colSpan: 1, rowSpan: 1 },
    { id: 'torus', type: 'torus', title: 'Torus Field', icon: Hexagon, colSpan: 1, rowSpan: 1 },
    { id: 'chakras', type: 'chakras', title: 'Chakra Alignments', icon: Activity, colSpan: 3, rowSpan: 2 },
  ]);

  const ELEMENT_COLORS = {
    Fire: '#ef4444',
    Earth: '#10b981',
    Air: '#38bdf8',
    Water: '#3b82f6'
  };

  const getElementData = () => {
    if (!data?.planets) return [];
    const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    data.planets.forEach(p => {
      if (['Aries', 'Leo', 'Sagittarius'].includes(p.sign)) counts.Fire++;
      if (['Taurus', 'Virgo', 'Capricorn'].includes(p.sign)) counts.Earth++;
      if (['Gemini', 'Libra', 'Aquarius'].includes(p.sign)) counts.Air++;
      if (['Cancer', 'Scorpio', 'Pisces'].includes(p.sign)) counts.Water++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  };

  const renderWidgetContent = (widget: WidgetData) => {
    if (!data) return <div className="p-4 text-stone-500 font-mono text-xs text-center w-full mt-4 flex items-center justify-center h-full"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Hexagon size={24} className="text-white/20" /></motion.div></div>;

    switch (widget.type) {
      case 'identity':
        return (
          <div className="p-4 flex flex-col justify-center h-full relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
            <motion.div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
              animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
               <Fingerprint size={120} />
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-2 font-serif drop-shadow-lg">{loadedInputs?.name || data.gematria?.pattern || 'Seeker'}</h3>
            <p className="text-sm text-cyan-300 font-light mb-4 flex items-center gap-2">
              <Star size={12} className="animate-pulse" />
              Born {loadedInputs?.date || 'Unknown'}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-200 font-mono shadow-[0_0_10px_rgba(168,85,247,0.2)]">Sun in {data.planets?.[0]?.sign || 'Aries'}</span>
              <span className="px-3 py-1 bg-gradient-to-r from-sky-500/20 to-sky-500/10 border border-sky-500/30 rounded-full text-xs text-sky-200 font-mono shadow-[0_0_10px_rgba(14,165,233,0.2)]">Moon in {data.planets?.[1]?.sign || 'Taurus'}</span>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-200 font-mono shadow-[0_0_10px_rgba(245,158,11,0.2)]">Asc {data.houses?.[0]?.sign || 'Gemini'}</span>
            </div>
          </div>
        );
      case 'planets':
        return (
          <div className="p-4 h-full relative cursor-text">
            {data.planets && <ZodiacAnimation planets={data.planets} />}
          </div>
        );
      case 'elements': {
        const elData = getElementData();
        return (
          <div className="p-4 h-full flex flex-col items-center justify-center relative cursor-text group-hover:scale-105 transition-transform duration-500">
            <ResponsiveContainer width="100%" height="80%">
              <RechartsPieChart>
                <Pie data={elData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none">
                  {elData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ELEMENT_COLORS[entry.name as keyof typeof ELEMENT_COLORS] || '#ffffff'} className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-4 flex justify-center gap-3 text-[9px] font-mono uppercase w-full">
               {elData.map(e => (
                 <motion.span 
                    key={e.name} 
                    style={{ color: ELEMENT_COLORS[e.name as keyof typeof ELEMENT_COLORS] }}
                    whileHover={{ scale: 1.2, y: -2 }}
                    className="cursor-pointer"
                 >
                   {e.name}
                 </motion.span>
               ))}
            </div>
          </div>
        );
      }
      case 'gematria':
        return (
          <div className="p-4 flex flex-col items-center justify-center h-full text-center relative overflow-hidden">
             <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
             />
             <motion.span 
               className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-600 mb-2 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]"
               animate={{ scale: [1, 1.05, 1], filter: ["hue-rotate(0deg)", "hue-rotate(15deg)", "hue-rotate(0deg)"] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             >
              {data.gematria?.nameValue || '33'}
            </motion.span>
            <span className="text-[10px] text-pink-300 uppercase tracking-widest font-mono font-bold">Resonance Code</span>
          </div>
        );
      case 'torus':
        return (
          <div className="p-4 flex flex-col items-center justify-center h-full text-center relative">
             <motion.div
               animate={{ rotateZ: 360, rotateX: [0, 20, 0], rotateY: [0, 20, 0] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="mb-4 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
             >
               <Hexagon size={48} strokeWidth={1} />
             </motion.div>
             <span className="text-xs text-cyan-200 font-bold tracking-widest uppercase">{data.torusAnalysis?.soulAge || 'Wanderer'}</span>
          </div>
        );
      case 'chakras':
        return (
          <div className="p-4 h-full flex flex-col justify-center cursor-text">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.chakras?.slice(0, 4).map((c, i) => (
                <motion.div 
                  key={c.name} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex flex-col items-center text-center p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all pointer-events-auto cursor-pointer"
                >
                  <motion.div 
                    className="w-8 h-8 rounded-full mb-2 border-2 shadow-[0_0_10px_currentColor]" 
                    style={{ borderColor: c.color, backgroundColor: `${c.color}30`, color: c.color }} 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">{c.name}</span>
                  <span className="text-[8px] text-stone-400 font-mono mt-1 h-8 overflow-hidden opacity-80">{c.state}</span>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'astounding_facts': {
        const highlightCards = [
          { title: "Dominant Frequency", value: data.gematria?.pattern || "Master Builder", desc: "A rare numerical resonance indicating profound systemic influence.", color: "from-purple-500 to-indigo-600" },
          { title: "Celestial Signature", value: `${data.planets?.[0]?.sign} Sun, ${data.planets?.[1]?.sign} Moon`, desc: "An alignment found in less than 4% of charts, showing intense creative potential.", color: "from-amber-400 to-orange-600" },
          { title: "Karmic Axis", value: data.torusAnalysis?.soulAge || "Old Soul", desc: "Multiple lifetimes synthesized into a single point of highly accelerated evolution.", color: "from-cyan-400 to-blue-600" }
        ];
        return (
          <div className="p-4 h-full flex flex-col justify-center overflow-hidden cursor-text [perspective:1000px]">
             <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-4 px-2">
                {highlightCards.map((card, i) => (
                  <motion.div 
                     key={i}
                     initial={{ rotateY: 30, opacity: 0, x: 50 }}
                     animate={{ rotateY: 0, opacity: 1, x: 0 }}
                     transition={{ duration: 0.8, delay: i * 0.2, type: "spring" }}
                     whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5, zIndex: 20 }}
                     className="snap-center shrink-0 w-[260px] md:w-[300px] h-[200px] rounded-2xl p-5 relative flex flex-col justify-between overflow-hidden group/card pointer-events-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md"
                     style={{ transformStyle: 'preserve-3d' }}
                  >
                     <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-20 group-hover/card:opacity-40 transition-opacity duration-500`} />
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                     
                     <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
                        <h4 className="text-[10px] text-stone-300 uppercase tracking-widest font-mono font-bold mb-1">{card.title}</h4>
                        <div className="text-2xl font-bold text-white leading-tight font-serif drop-shadow-md">{card.value}</div>
                     </div>
                     <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
                        <p className="text-xs text-stone-300 font-light leading-relaxed">{card.desc}</p>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>
        );
      }
      case 'aspect_matrix':
        return (
          <div className="p-2 h-full w-full relative z-10 pointer-events-auto">
             <AstrologerStudioMatrix data={data} />
          </div>
        );
      case 'vedastro':
        return (
          <div className="p-2 h-full w-full relative z-10 pointer-events-auto">
             <VedAstroPerspective data={data} loadedInputs={loadedInputs} />
          </div>
        );
      case 'zodiac_wheel':
        return (
          <div className="h-full w-full relative z-10 pointer-events-auto rounded-xl overflow-hidden">
             <ZodiacWheel3D />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full p-4 md:p-8 bg-[#030014] overflow-y-auto no-scrollbar relative overflow-hidden">
      {/* Deep Space & Neon Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        {/* Animated Neon Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] bg-cyan-600/20 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" 
        />
        
        {/* Holographic Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />
      </div>

      <SynapticConnections containerRef={containerRef} hoveredWidgetId={hoveredWidgetId} />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col space-y-6">
        <header className="flex justify-between items-end border-b border-cyan-500/30 pb-4 shadow-[0_4px_30px_rgba(34,211,238,0.1)]">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600 tracking-wider drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]">NEO-ASTRAL <span className="font-light text-white">DASHBOARD</span></h1>
            <p className="text-xs text-cyan-400/80 font-mono uppercase tracking-widest mt-2 flex items-center gap-2">
              <Zap size={12} className="animate-pulse" /> Holographic Quantum Interface (Drag to Reorder)
            </p>
          </div>
        </header>

        {/* Bento Grid Layout using Reorder */}
        <Reorder.Group 
           values={widgets} 
           onReorder={setWidgets} 
           className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[160px] gap-6 perspective-[2000px]"
        >
          <AnimatePresence>
            {widgets.map(widget => {
              const colSpanClass = widget.colSpan === 4 ? 'md:col-span-4' : widget.colSpan === 3 ? 'md:col-span-3' : widget.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1';
              const rowSpanClass = widget.rowSpan === 4 ? 'row-span-4' : widget.rowSpan === 3 ? 'row-span-3' : widget.rowSpan === 2 ? 'row-span-2' : 'row-span-1';

              return (
                <Reorder.Item
                  key={widget.id}
                  value={widget}
                  layout
                  data-widget-id={widget.id}
                  onMouseEnter={() => setHoveredWidgetId(widget.id)}
                  onMouseLeave={() => setHoveredWidgetId(null)}
                  initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                  whileHover={{ scale: 1.02, zIndex: 10, y: -5, boxShadow: "0 0 30px rgba(34, 211, 238, 0.4)" }}
                  whileDrag={{ scale: 1.05, zIndex: 50, cursor: "grabbing", rotateZ: 2, boxShadow: "0 0 50px rgba(217, 70, 239, 0.6)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`bg-[#0a0a16]/80 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden flex flex-col relative group cursor-grab active:cursor-grabbing ${colSpanClass} ${rowSpanClass} transform-gpu`}
                >
                  {/* Neon Glow Borders */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-clip-border [background:linear-gradient(45deg,transparent,rgba(34,211,238,0.3),transparent)_border-box] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <motion.div 
                    className="absolute -inset-[100%] opacity-20 pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ background: 'conic-gradient(from 0deg, transparent 0 340deg, rgba(217,70,239,0.8) 360deg)' }}
                  />
                  
                  {/* Glass Highlights */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none mix-blend-overlay" />
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                  
                  {/* Header */}
                  <div className="px-5 py-3 border-b border-cyan-500/20 flex items-center gap-2 bg-[#05050f]/80 shrink-0 relative z-10 backdrop-blur-md">
                    <widget.icon size={14} className="text-fuchsia-400 drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]" />
                    <span className="text-[10px] font-mono text-cyan-200 uppercase tracking-widest font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{widget.title}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 relative z-10 pointer-events-auto cursor-default">
                    {renderWidgetContent(widget)}
                  </div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
};
