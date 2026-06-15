import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, Pin, RefreshCw, Radio, PieChart, Layers, Moon, Compass, Activity, 
  Volume2, Play, Sparkles, Check, Flame, Award, HeartPulse, Zap, Search, ArrowRight, BookOpen, ScrollText
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { soundEngine } from '../lib/soundEffects';
import { DEITIES_DATABASE, Deity } from '../utils/deitydb';

const DeityDBWidget: React.FC<{ widget: any; triggerFrequencyAudio: (hz: string, label: string) => void }> = ({ widget, triggerFrequencyAudio }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPantheon, setSelectedPantheon] = useState('All');
  const [selectedDeityId, setSelectedDeityId] = useState<string | null>(null);

  const filteredDeities = DEITIES_DATABASE.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPantheon = selectedPantheon === 'All' || d.pantheon === selectedPantheon;
    return matchesSearch && matchesPantheon;
  });

  const selectedDeity = DEITIES_DATABASE.find(d => d.id === selectedDeityId);

  return (
    <div className="space-y-3 font-mono text-zinc-300">
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search size={11} className="absolute left-2 top-2.5 text-stone-500" />
          <input 
            type="text" 
            placeholder="Search deities..."
            value={searchTerm}
            className="w-full bg-stone-900 border border-white/5 pl-6 pr-2 py-1.5 rounded-lg text-[9px] focus:outline-none focus:border-cyan-500/40"
            onChange={(e) => {
              soundEngine.click();
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <select
          value={selectedPantheon}
          className="bg-stone-900 border border-white/5 text-stone-500 text-[9px] rounded-lg px-1 focus:outline-none"
          onChange={(e) => {
            soundEngine.click();
            setSelectedPantheon(e.target.value);
          }}
        >
          <option value="All">All</option>
          <option value="Egyptian">Egypt</option>
          <option value="Greek">Greece</option>
          <option value="Norse">Norse</option>
          <option value="Celtic">Celtic</option>
          <option value="Hindu">Hindu</option>
          <option value="Aztec">Aztec</option>
        </select>
      </div>

      {selectedDeity ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-2.5 bg-cyan-950/15 border border-cyan-500/20 rounded-xl space-y-2 max-h-48 overflow-y-auto"
        >
          <div className="flex justify-between items-start border-b border-white/5 pb-1">
            <div>
              <span className="text-[7px] text-cyan-400 font-bold uppercase tracking-wider block">{selectedDeity.pantheon} Pantheon</span>
              <h4 className="text-xs font-black text-white">{selectedDeity.name}</h4>
            </div>
            <button 
              onClick={() => {
                soundEngine.click();
                setSelectedDeityId(null);
              }}
              className="text-[6.5px] text-stone-500 hover:text-white uppercase font-bold border border-white/10 px-1 py-0.5 rounded ml-2"
            >
              Back
            </button>
          </div>
          
          <div className="space-y-0.5">
            <span className="text-[6.5px] uppercase text-zinc-500 block">Domain / Realm</span>
            <p className="text-[8.5px] text-zinc-300 font-semibold leading-snug">{selectedDeity.domain}</p>
          </div>

          <p className="text-[8.5px] text-zinc-400 leading-normal font-sans">{selectedDeity.description}</p>

          <div className="grid grid-cols-2 gap-1 text-[7.5px] bg-black/40 p-2 rounded-lg border border-white/5">
            <div>
              <span className="text-zinc-600 uppercase block text-[6px]">Planet</span>
              <span className="text-zinc-300 font-bold">{selectedDeity.rulingPlanet || 'Cosmic'}</span>
            </div>
            <div>
              <span className="text-zinc-600 uppercase block text-[6px]">Sephirah</span>
              <span className="text-zinc-350 truncate block">{selectedDeity.sephirah}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-white/5 mt-1">
            <span className="text-[8px] font-bold text-pink-400 font-mono">Hz: {selectedDeity.solfeggioHz}</span>
            <button
              onClick={() => triggerFrequencyAudio(`${selectedDeity.solfeggioHz} Hz`, selectedDeity.name)}
              className="px-1.5 py-0.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 rounded-md text-[7px] text-pink-300 flex items-center gap-0.5 transition-all uppercase font-bold"
            >
              <Volume2 size={9} /> Tune
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 text-[8.5px]">
          {filteredDeities.map(deity => (
            <div 
              key={deity.id}
              onClick={() => {
                soundEngine.select();
                setSelectedDeityId(deity.id);
              }}
              className="flex justify-between items-center p-1.5 rounded-lg bg-stone-900/60 hover:bg-stone-900/95 border border-white/5 cursor-pointer hover:border-cyan-500/25 transition-all group"
            >
              <div>
                <span className="text-[6px] text-stone-500 tracking-wider block uppercase">{deity.pantheon}</span>
                <span className="text-[9.5px] font-bold text-stone-200 group-hover:text-cyan-400 transition-colors">{deity.name}</span>
              </div>
              <div className="text-right flex items-center gap-1.5">
                <span className="text-[7.5px] text-zinc-500 max-w-[100px] truncate">{deity.domain}</span>
                <ArrowRight size={8} className="text-stone-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}

          {filteredDeities.length === 0 && (
            <div className="text-stone-600 italic text-center py-4 text-[8px]">No matching deity indexed.</div>
          )}
        </div>
      )}
    </div>
  );
};

interface WorkspaceWidget {
  id: string;
  type: string;
  componentName: string;
  data: any;
  position?: { x: number; y: number };
}

interface WorkspaceWidgetsProps {
  widgets: WorkspaceWidget[];
  onRemoveWidget: (id: string) => void;
  onPinToProfile: (id: string, type: string, componentName: string, data: any) => void;
  profileWidgets?: any[];
  onRemoveProfileWidget: (id: string) => void;
}

export const WorkspaceWidgets: React.FC<WorkspaceWidgetsProps> = ({
  widgets,
  onRemoveWidget,
  onPinToProfile,
  profileWidgets = [],
  onRemoveProfileWidget
}) => {
  
  if (!widgets || widgets.length === 0) return null;

  const ELEMENT_COLORS = {
    Fire: '#ef4444',  // red-500
    Earth: '#10b981', // emerald-500
    Air: '#38bdf8',   // sky-400
    Water: '#3b82f6'  // blue-500
  };

  const handleTogglePin = (widget: WorkspaceWidget) => {
    soundEngine.select();
    const isPinned = profileWidgets.some(w => w.id === widget.id);
    if (isPinned) {
      onRemoveProfileWidget(widget.id);
    } else {
      onPinToProfile(widget.id, widget.type, widget.componentName, widget.data);
    }
  };

  const triggerFrequencyAudio = (hz: string, label: string) => {
    soundEngine.charge();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sentence = `Synthesizing ${hz} Hertz vibrational frequency, aligned with your ${label}.`;
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.pitch = 0.95;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[110]">
      {widgets.map((widget) => {
        const isPinned = profileWidgets.some(w => w.id === widget.id);
        
        // Dynamic styling depending on widget properties
        let outerBorderGlow = "hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]";
        let titleColor = "text-purple-300";
        let HeaderIcon = Zap;

        if (widget.id.includes('elements')) {
          outerBorderGlow = "hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]";
          titleColor = "text-amber-300";
          HeaderIcon = PieChart;
        } else if (widget.id.includes('lunar')) {
          outerBorderGlow = "hover:border-sky-500/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)]";
          titleColor = "text-sky-300";
          HeaderIcon = Moon;
        } else if (widget.id.includes('solfeggio')) {
          outerBorderGlow = "hover:border-pink-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]";
          titleColor = "text-pink-300";
          HeaderIcon = Radio;
        } else if (widget.id.includes('transit')) {
          outerBorderGlow = "hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]";
          titleColor = "text-red-300";
          HeaderIcon = Activity;
        } else if (widget.id.includes('oracle')) {
          outerBorderGlow = "hover:border-fuchsia-500/40 hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]";
          titleColor = "text-fuchsia-300";
          HeaderIcon = Compass;
        } else if (widget.id.includes('soul')) {
          outerBorderGlow = "hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]";
          titleColor = "text-emerald-300";
          HeaderIcon = Layers;
        } else if (widget.id.includes('deity')) {
          outerBorderGlow = "hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]";
          titleColor = "text-cyan-300";
          HeaderIcon = ScrollText;
        }

        return (
          <motion.div
            key={widget.id}
            drag
            dragMomentum={false}
            dragElastic={0.05}
            initial={{ opacity: 0, scale: 0.9, x: widget.position?.x ?? 50, y: widget.position?.y ?? 50 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute pointer-events-auto w-80 bg-stone-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col z-[120] transition-colors focus-within:border-white/25 ${outerBorderGlow}`}
            style={{ x: widget.position?.x ?? 50, y: widget.position?.y ?? 50 }}
          >
            {/* Widget Header Strip */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2 cursor-grab active:cursor-grabbing font-sans shrink-0">
              <div className="flex items-center gap-2">
                <HeaderIcon size={14} className={`${titleColor} animate-pulse`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${titleColor}`}>
                  {widget.componentName}
                </span>
                <span className="text-[7px] text-stone-500 uppercase tracking-widest font-mono border border-white/5 px-1 py-0.25 bg-white/5 rounded">JARVIS-AUX</span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Pin Tool */}
                <button
                  onClick={() => handleTogglePin(widget)}
                  className={`p-1 rounded text-stone-500 hover:text-white transition-colors hover:bg-white/5 ${isPinned ? 'text-amber-400' : ''}`}
                  title={isPinned ? 'Synced' : 'Pin to Profile'}
                >
                  <Pin size={10} className={isPinned ? 'fill-amber-400 text-amber-400' : ''} />
                </button>
                {/* Close Tool */}
                <button
                  onClick={() => onRemoveWidget(widget.id)}
                  className="p-1 rounded text-stone-500 hover:text-white hover:bg-white/5 transition-colors"
                  title="Close Widget"
                >
                  <X size={10} />
                </button>
              </div>
            </div>

            {/* Widget Content Body */}
            <div className="flex-1 py-3 text-xs overflow-hidden select-none">
              
              {/* Tool 1: Planetary Power Radar */}
              {widget.id === 'radar-power' && (
                <div className="h-44 w-full flex items-center justify-center font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={widget.data}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis 
                        dataKey="name" 
                        tick={{ fill: '#a8a29e', fontSize: 8, fontWeight: 'bold' }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 10]} 
                        tick={{ fill: '#57534e', fontSize: 6 }}
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <Radar 
                        name="Strength" 
                        dataKey="strength" 
                        stroke="#a855f7" 
                        fill="#a855f7" 
                        fillOpacity={0.25} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tool 2: Elements Balance Chart */}
              {widget.id === 'pie-elements' && (
                <div className="h-44 w-full flex flex-col justify-between font-mono">
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={widget.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={45}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {widget.data.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={ELEMENT_COLORS[entry.name as keyof typeof ELEMENT_COLORS] || '#ffffff'} 
                            />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    {/* Centered overall power */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[12px] font-bold text-amber-400 animate-pulse">4D Spectrum</span>
                      <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-mono">Synthesized</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[8px] uppercase tracking-wider text-stone-400 font-semibold border-t border-white/5 pt-2">
                    {widget.data.map((entry: any, index: number) => (
                      <div key={entry.name} className="text-center">
                        <span className="block font-bold" style={{ color: ELEMENT_COLORS[entry.name as keyof typeof ELEMENT_COLORS] }}>
                          {entry.value}%
                        </span>
                        <span className="text-stone-500 font-mono text-[7px]">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tool 3: Soul Age Calculator */}
              {widget.id === 'soul-age' && (
                <div className="space-y-2 p-1 font-mono text-center">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 block">Alpha-Numeric Classification</span>
                  <div className="py-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                    <span className="text-xs text-emerald-400 font-bold tracking-widest block uppercase animate-pulse">ANCIENT INCAN SOUL</span>
                    <span className="text-[7px] text-emerald-500/80 uppercase tracking-widest mt-1 block font-mono">COGNITIVE LEVEL 9.3</span>
                  </div>
                  <p className="text-[8.5px] text-zinc-400 leading-relaxed text-left border-t border-white/5 pt-2 mt-1.5 font-sans font-light">
                    Your soul vibration contains highly structured geometric patterns signifying complete earthly cycles. Empathy and spatial intuition are dominant.
                  </p>
                </div>
              )}

              {/* Tool 4: Lunar Phase Compass */}
              {widget.id === 'daily-lunar-phase' && (
                <div className="space-y-3 p-1 font-mono text-center">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 block">Lunar Luminary Elevation</span>
                  <div className="flex justify-center my-1 relative">
                    <div className="w-16 h-16 rounded-full border border-sky-500/20 flex items-center justify-center bg-sky-950/20 relative">
                      <Moon size={32} className="text-sky-300 animate-pulse" />
                      <div className="absolute inset-2 border border-dashed border-sky-400/10 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-sky-200 font-bold block tracking-wider uppercase">Waning Gibbous Moon</span>
                    <div className="flex justify-center gap-3 text-[7px] uppercase text-zinc-500 mt-1">
                      <span>Luminosity: <strong className="text-white">82%</strong></span>
                      <span>Sign: <strong className="text-white">Aquarius</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tool 5: Vibrational Solfeggio Tuner */}
              {widget.id === 'daily-solfeggio' && (
                <div className="space-y-3 p-1 font-mono">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 block text-center">Solfeggio Frequencies</span>
                  <div className="grid grid-cols-2 gap-2 text-[8px] font-bold">
                    {[
                      { hz: '528 Hz', label: 'Cell Protection', details: 'DNA Repair' },
                      { hz: '432 Hz', label: 'Universal Harmony', details: 'Cosmic alignment' },
                      { hz: '639 Hz', label: 'Neural Connection', details: 'Integration' },
                      { hz: '852 Hz', label: 'Spiritual Order', details: 'Awakening' }
                    ].map(f => (
                      <button 
                        key={f.hz}
                        onClick={() => triggerFrequencyAudio(f.hz, f.label)}
                        className="flex flex-col items-center justify-center py-2 px-1 bg-pink-500/5 hover:bg-pink-500/15 border border-pink-500/20 rounded-xl text-pink-300 transition-all hover:border-pink-500/40 text-center uppercase"
                      >
                        <Volume2 size={11} className="text-pink-400 mb-0.5 animate-pulse" />
                        <span className="text-[9.5px] font-black">{f.hz}</span>
                        <span className="text-[6.5px] text-stone-500 mt-0.5 tracking-wide">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tool 6: Active Transit Tracker */}
              {widget.id === 'daily-transit-current' && (
                <div className="space-y-2.5 p-1 font-mono">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 block text-center">Live Ephemeris Pulse</span>
                  <div className="flex items-center gap-2 justify-center py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    <span className="text-xs text-red-400 font-bold tracking-widest uppercase">Mercury Retrograde</span>
                  </div>
                  <div className="p-3 bg-red-950/20 border border-red-500/15 rounded-xl text-[8.5px] text-zinc-400 leading-normal font-sans font-light">
                    Transiting Pluto semi-sextiles natal Sun. Expect deep analytical sparks paired with vivid sleep visions. Synchronize using <strong className="text-red-300 font-mono">528 Hz</strong> to bypass latency barriers.
                  </div>
                </div>
              )}

              {/* Tool 7: Oracle of Astraea */}
              {widget.id === 'oracle-wisdom' && (
                <div className="space-y-2.5 p-1 font-mono text-center">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 block">Goddess Astraea Guidance</span>
                  <div className="p-3 bg-fuchsia-950/20 border border-fuchsia-500/25 rounded-xl relative leading-relaxed">
                    <div className="text-stone-600 justify-center flex mb-1.5">
                      <Compass size={14} className="text-fuchsia-400/80 animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                    <span className="text-xl text-fuchsia-400 absolute left-3 top-1 font-serif opacity-30">“</span>
                    <p className="text-[9px] text-fuchsia-100 italic font-medium px-2 leading-relaxed font-sans">
                      Align your cellular antenna to the silent, golden ratio spectrum of solar movements. Wisdom is never loud.
                    </p>
                    <span className="text-[7px] text-fuchsia-400 block mt-2 font-mono uppercase tracking-widest font-black">[ VIBRATIONAL GNOSIS SYSTEM ]</span>
                  </div>
                </div>
              )}

              {/* Tool 8: DeityDB Portal */}
              {widget.id === 'deity-db' && (
                <DeityDBWidget widget={widget} triggerFrequencyAudio={triggerFrequencyAudio} />
              )}

            </div>

            {/* Drag helper footer */}
            <div className="shrink-0 text-center font-mono text-[7px] text-stone-600 border-t border-white/5 pt-1.5 uppercase tracking-widest flex justify-between items-center">
              <span>Holographic Link Active</span>
              <span className="animate-pulse">● SPUN WORKSPACE</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
