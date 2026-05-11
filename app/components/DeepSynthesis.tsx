// --- CORE IMPORTS ---
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Monitor, Share2, Download, BookOpen, PieChart, Network, 
  PlayCircle, Eye, ChevronRight, DownloadCloud, Layers, Target, 
  Star, Activity, Moon, Sun, Globe, User, Fingerprint, Volume2
} from 'lucide-react';
// --- VISUALIZATION LIBRARIES ---
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { CosmicData } from '../types';

/**
 * Available Synthesis View Modes
 */
type SynthesisMode = 'overview' | 'infographic' | 'mindmap' | '3d' | 'video';

/**
 * DeepSynthesis Component
 * High-fidelity data visualization module offering multiple perspectives on cosmic data.
 */
export const DeepSynthesis = ({ data, onPresentationRequest }: { data: CosmicData | null, onPresentationRequest: () => void }) => {
  // --- COMPONENT STATE & VIEW REFS ---
  const [mode, setMode] = useState<SynthesisMode>('overview');
  const [videoStep, setVideoStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // --- NARRATIVE AUDIO ENGINE ---
  const handleReadOutLoud = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.95;
      utterance.pitch = 1.1; // Slightly higher for "synthesis" vibe
      
      setIsReading(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported in this browser.");
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // --- ANIMATION & AUTO-PLAY LOGIC ---
  useEffect(() => {
    let interval: any;
    if (isAutoPlaying && mode === 'video') {
      interval = setInterval(() => {
        setVideoStep(prev => (prev + 1) % 5);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, mode]);

  if (!data) return null;

  // --- STATIC CONFIG DATA ---
  const infographicData = [
    { subject: 'Consciousness', A: 85, fullMark: 100 },
    { subject: 'Intuition', A: 92, fullMark: 100 },
    { subject: 'Structure', A: 68, fullMark: 100 },
    { subject: 'Emotion', A: 75, fullMark: 100 },
    { subject: 'Logic', A: 80, fullMark: 100 },
    { subject: 'Cosmic Edge', A: 90, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* --- TOP NAVIGATION BAR --- */}
      <div className="flex bg-black/40 border border-white/5 p-2 rounded-2xl md:rounded-[2.5rem] items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Zap },
            { id: 'infographic', label: 'Infographic', icon: Monitor },
            { id: 'mindmap', label: 'Mind Map', icon: Network },
            { id: '3d', label: '3D Journey', icon: Layers },
            { id: 'video', label: 'Cinematic', icon: PlayCircle }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as SynthesisMode); setVideoStep(0); setIsAutoPlaying(m.id === 'video'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${mode === m.id ? 'bg-white/10 text-white border border-white/20' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <m.icon size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">{m.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 pr-4">
           <button 
             onClick={() => handleReadOutLoud(mode === 'overview' ? data.synthesis : mode === 'infographic' ? `Identity report for ${data.planets?.[0]?.name}. Master synthesis: ${data.synthesis}` : 'Cosmic deep synthesis data')}
             className={`p-2 transition-all rounded-lg ${isReading ? 'text-purple-400 bg-purple-500/10 animate-pulse' : 'text-stone-500 hover:text-white'}`}
             title="Read Out Loud (AI)"
           >
             <Volume2 size={18} />
           </button>
           <button className="p-2 text-stone-500 hover:text-white transition-colors"><Download size={18} /></button>
           <button className="p-2 text-stone-500 hover:text-white transition-colors"><Share2 size={18} /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {mode === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black p-8 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(168,85,247,0.1),transparent)] group-hover:scale-110 transition-transform duration-1000"></div>
                  <h2 className="text-3xl font-light text-white mb-4 relative z-10">The Harmonic Signature</h2>
                  <p className="text-lg font-light text-stone-300 leading-relaxed italic relative z-10">"{data.synthesis}"</p>
                  <div className="mt-8 flex gap-4 relative z-10">
                     <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] uppercase tracking-widest font-bold">Node Stabilized</div>
                     <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-[10px] uppercase tracking-widest font-bold">Master Vector Detected</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {data.patterns?.timeDateDiscovery && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="col-span-2 bg-gradient-to-r from-amber-900/30 to-amber-600/10 border border-amber-500/30 rounded-3xl p-6 relative group overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Star className="w-20 h-20 text-amber-400" />
                      </div>
                      <div className="text-amber-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Essential Pattern Recognition
                      </div>
                      <div className="text-xl text-white font-light mb-1">{data.patterns.timeDateDiscovery.title}</div>
                      <div className="text-[10px] font-mono text-amber-200/60 mb-2">{data.patterns.timeDateDiscovery.mathematicalPattern}</div>
                      <p className="text-xs text-stone-300 italic leading-relaxed">"{data.patterns.timeDateDiscovery.description}"</p>
                    </motion.div>
                  )}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all">
                     <div className="text-stone-500 text-[10px] uppercase tracking-widest mb-2">Primary Destiny Arc</div>
                     <div className="text-xl text-white font-light">{data.planets?.[0]?.sign} {data.planets?.[0]?.name}</div>
                     <p className="text-xs text-stone-400 mt-2 italic">"{data.planets?.[0]?.interpretation?.split('.')[0] || 'Celestial alignment in progress'}."</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all">
                     <div className="text-stone-500 text-[10px] uppercase tracking-widest mb-2">Soul Resonance Number</div>
                     <div className="text-3xl text-sky-400 font-light">{data.numerology.coreNumbers?.[0]?.value || '0'}</div>
                     <p className="text-xs text-stone-400 mt-2 font-bold uppercase tracking-widest">{data.numerology.coreNumbers?.[0]?.name || 'Value'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-900/40 rounded-[3rem] border border-white/5 p-6 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-48 h-48 relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={infographicData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8 }} />
                        <Radar name="You" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
                <div>
                   <h4 className="text-white font-light text-xl">Cosmic Balance Index</h4>
                   <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1 italic leading-relaxed">Evaluation of metaphysical attributes across the gathered research datasets.</p>
                </div>
                <button onClick={() => setMode('infographic')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 transition-all">View Full Infographic</button>
              </div>
            </motion.div>
          )}

          {mode === 'infographic' && (
            <motion.div 
              key="infographic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full bg-white/5 rounded-[3rem] border border-white/10 p-10 overflow-y-auto scrollbar-thin overflow-x-hidden relative"
            >
              <div className="max-w-4xl mx-auto space-y-16 py-10">
                <div className="text-center space-y-4">
                  <div className="text-fuchsia-500 text-xs font-bold uppercase tracking-[0.4em]">Universal Hologram Map</div>
                  <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight">Identity Report</h1>
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-stone-500 to-transparent mx-auto"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                     <section>
                       <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4 font-bold border-b border-white/5 pb-2">Astrological Landscape</h3>
                       <div className="space-y-4">
                         {data.planets?.slice(0, 3).map((p, i) => (
                           <div key={i} className="flex gap-4">
                             <div className="text-2xl text-white font-light w-12">{p.sign?.slice(0, 2)}</div>
                             <div>
                               <div className="text-sm text-stone-200 font-medium">{p.name} in {p.sign}</div>
                               <p className="text-xs text-stone-500 leading-relaxed font-light">{p.interpretation?.slice(0, 100)}...</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </section>
                     <section>
                       <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4 font-bold border-b border-white/5 pb-2">Vibrational Values</h3>
                       <div className="grid grid-cols-2 gap-4">
                          {data.numerology.coreNumbers?.slice(0, 4).map((n, i) => (
                            <div key={i} className="p-3 bg-black/20 rounded-xl border border-white/5">
                               <div className="text-[10px] text-stone-600 uppercase tracking-widest">{n.name}</div>
                               <div className="text-2xl text-sky-400 font-light">{n.value}</div>
                            </div>
                          ))}
                       </div>
                     </section>
                  </div>
                  <div className="bg-black/40 p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 blur-[80px]"></div>
                    <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
                       <PieChart className="w-5 h-5 text-purple-400" />
                       Attribute Mapping
                    </h3>
                    <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={infographicData}>
                            <PolarGrid stroke="#444" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                            <Radar name="Value" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                         </RadarChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-900/50 p-10 rounded-[3rem] border border-white/10 text-center">
                   <h3 className="text-2xl font-light text-white mb-4">Master Synthesis Statement</h3>
                   <p className="text-xl font-light text-stone-400 leading-relaxed italic max-w-2xl mx-auto">"{data.synthesis}"</p>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'mindmap' && (
            <motion.div 
              key="mindmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full bg-black/40 rounded-[3rem] border border-white/10 overflow-hidden relative cursor-grab active:cursor-grabbing"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,50,0.2),transparent)]"></div>
              {/* Fake Interactive Mind Map */}
              <div className="absolute inset-0 flex items-center justify-center p-10">
                 <div className="relative w-full h-full">
                    {/* Center Node */}
                    <motion.div 
                      drag
                      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-center shadow-[0_0_50px_rgba(139,92,246,0.3)] z-10"
                    >
                      <div className="text-white">
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-60">Identity</div>
                        <div className="text-sm font-light tracking-widest">CENTRAL HUB</div>
                      </div>
                    </motion.div>

                    {/* Orbiting Nodes */}
                    {[
                      { label: 'ASTROLOGY', pos: { top: '10%', left: '20%' }, color: 'emerald' },
                      { label: 'NUMEROLOGY', pos: { top: '15%', left: '75%' }, color: 'sky' },
                      { label: 'GEMATRIA', pos: { bottom: '15%', left: '25%' }, color: 'rose' },
                      { label: 'MYSTICISM', pos: { bottom: '20%', left: '80%' }, color: 'amber' },
                      { label: 'RECORDS', pos: { top: '50%', right: '10%' }, color: 'fuchsia' },
                    ].map((node, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, 15, 0], x: [0, 5, 0] }}
                        transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
                        style={node.pos as any}
                        className="absolute w-32 h-32"
                      >
                         <div className={`w-full h-full rounded-[2rem] border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-4 hover:border-white/40 transition-colors backdrop-blur-md`}>
                            <div className={`text-[8px] uppercase tracking-widest font-bold mb-2 text-${node.color}-400`}>{node.label}</div>
                            <div className="h-1 w-8 bg-white/10 rounded-full mb-2"></div>
                            <div className="text-[10px] text-stone-500 font-light leading-tight">Click to expand node research</div>
                         </div>
                      </motion.div>
                    ))}

                    {/* Background Lines (SVG) */}
                    <svg className="absolute inset-0 pointer-events-none opacity-20">
                       <line x1="50%" y1="50%" x2="20%" y2="10%" stroke="white" strokeWidth="1" />
                       <line x1="50%" y1="50%" x2="75%" y2="15%" stroke="white" strokeWidth="1" />
                       <line x1="50%" y1="50%" x2="25%" y2="85%" stroke="white" strokeWidth="1" />
                       <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="white" strokeWidth="1" />
                       <line x1="50%" y1="50%" x2="90%" y2="50%" stroke="white" strokeWidth="1" />
                    </svg>
                 </div>
              </div>
              <div className="absolute bottom-8 left-8 p-4 bg-black/40 rounded-2xl border border-white/10 text-[10px] uppercase tracking-widest text-stone-500">
                 Interactive Map Integration • Node Vector Analysis Ready
              </div>
            </motion.div>
          )}

          {mode === '3d' && (
            <motion.div 
               key="3d"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="h-full bg-black/40 rounded-[3rem] border border-white/10 flex flex-col items-center justify-center text-center p-10 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent)]"></div>
               <div className="relative z-10 space-y-6 max-w-md">
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto animate-pulse">
                    <Layers className="w-12 h-12 text-stone-700" />
                 </div>
                 <h2 className="text-3xl font-light text-white">Spatial Immersion</h2>
                 <p className="text-sm text-stone-400 font-light leading-relaxed italic">
                   "Launch into a 3D cinematic presentation of your data. The central hologram will transform into a narrative experience."
                 </p>
                 <button 
                  onClick={onPresentationRequest}
                  className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] text-white transition-all shadow-xl"
                 >
                   Launch 3D Presentation
                 </button>
               </div>
            </motion.div>
          )}

          {mode === 'video' && (
            <motion.div 
               key="video"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="h-full bg-black rounded-[3rem] border border-white/10 overflow-hidden relative group"
            >
               <div className="absolute inset-0 overflow-hidden opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 animate-pulse"></div>
               </div>

               <div className="absolute inset-0 flex items-center justify-center p-10">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={videoStep}
                      initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                      transition={{ duration: 1 }}
                      className="text-center space-y-6 max-w-2xl"
                    >
                      {videoStep === 0 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Chapter One: The Awakening</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Arrival</h2>
                          <p className="text-2xl font-light text-stone-400 italic">"The cosmic grid aligns as your singular consciousness enters the matrix."</p>
                        </>
                      )}
                      {videoStep === 1 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Chapter Two: The Alignment</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Origin</h2>
                          <div className="flex justify-center gap-6">
                             {data.planets?.slice(0, 3).map((p, i) => (
                               <div key={i} className="text-center">
                                 <div className="text-4xl text-purple-400 font-light">{p.sign?.slice(0, 2)}</div>
                                 <div className="text-[10px] text-stone-600 mt-2">{p.name}</div>
                               </div>
                             ))}
                          </div>
                          <p className="text-xl font-light text-stone-400">Planetary currents and celestial weights define the initial geometry.</p>
                        </>
                      )}
                      {videoStep === 2 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Chapter Three: The Vibration</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Essence</h2>
                          <div className="text-8xl text-sky-500 font-light">{data.numerology.lifePath}</div>
                          <p className="text-xl font-light text-stone-400">Your Life Path frequency: {data.numerology.lifePathMeaning?.slice(0, 100) || 'Universal calibration...'}...</p>
                        </>
                      )}
                      {videoStep === 3 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Chapter Four: The Synthesis</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Unity</h2>
                          <p className="text-2xl font-light text-stone-200 leading-relaxed italic">"{data.synthesis}"</p>
                        </>
                      )}
                      {videoStep === 4 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Final Chapter: The Future</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Ascend</h2>
                          <p className="text-xl font-light text-stone-500">Node analysis complete. The journey continues beyond the threshold.</p>
                           <button onClick={() => setVideoStep(0)} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all">Replay Experience</button>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
               </div>

               {/* Video Controls Overlay */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setVideoStep(prev => (prev - 1 + 5) % 5)} className="text-stone-500 hover:text-white transition-colors"><ChevronRight className="rotate-180" /></button>
                  <button 
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)} 
                    className="p-3 bg-purple-600 rounded-full text-white shadow-lg shadow-purple-900/40"
                  >
                    {isAutoPlaying ? <Monitor size={20} /> : <PlayCircle size={20} />}
                  </button>
                  <button onClick={() => setVideoStep(prev => (prev + 1) % 5)} className="text-stone-500 hover:text-white transition-colors"><ChevronRight /></button>
                  <div className="flex gap-1 ml-4">
                     {[0, 1, 2, 3, 4].map(s => (
                       <div key={s} className={`h-1 rounded-full transition-all ${videoStep === s ? 'w-8 bg-purple-500' : 'w-2 bg-white/10'}`}></div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
