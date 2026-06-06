import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Waves, Flame, Wind, Mountain, Orbit, Search, GitBranch } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const HISTORICAL_PERIODS = [
    { era: 'Lemurian Epoch', year: -50000, description: 'Pre-historical spiritual civilization of pure intuition.', element: 'Waves' },
    { era: 'Atlantean Era', year: -10500, description: 'Techno-spiritual golden age preceding the Great Flood.', element: 'Flame' },
    { era: 'Early Dynastic Egypt', year: -3100, description: 'Unification of Upper and Lower Egypt; harnessing the Nile.', element: 'Mountain' },
    { era: 'Vedic India', year: -1500, description: 'Composition of the Rigveda; mastery of sound and mantra.', element: 'Wind' },
    { era: 'Hellenistic Greece', year: -300, description: 'Flourishing of geometry, philosophy, and early astrology.', element: 'Flame' },
    { era: 'Renaissance', year: 1500, description: 'Rebirth of Hermeticism, art, and scientific inquiry.', element: 'Wind' },
    { era: 'Current Epoch', year: new Date().getFullYear(), description: 'The crystallization of the digital and spiritual nexus.', element: 'Orbit' }
];

const generateEchoes = (seed: string) => {
    // Deterministic pseudo-random based on seed
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return HISTORICAL_PERIODS.map((period, index) => {
        const resonance = 30 + ((hash * (index + 7)) % 70); // 30-100 score
        return {
            ...period,
            resonance,
            planetaryMatch: ['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter'][(hash + index) % 5],
            house: ((hash + index * 3) % 12) + 1
        };
    });
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-black/80 backdrop-blur-md border border-fuchsia-900/50 p-4 rounded-xl shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <History size={48} />
                </div>
                <p className="text-fuchsia-400 font-mono text-sm uppercase tracking-widest mb-1">{data.era}</p>
                <p className="text-zinc-500 font-mono text-xs mb-3">{data.year < 0 ? `${Math.abs(data.year)} BCE` : `${data.year} CE`}</p>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Resonance:</span>
                        <span className="text-white font-mono">{data.resonance}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Key Planet:</span>
                        <span className="text-fuchsia-300">{data.planetaryMatch}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Active House:</span>
                        <span className="text-indigo-300">House {data.house}</span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[200px]">
                        {data.description}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export const PastLifeEchoes: React.FC<{ userData: any }> = ({ userData }) => {
    const [echoes, setEchoes] = useState<any[]>([]);
    const [selectedEcho, setSelectedEcho] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (userData) {
            setIsScanning(true);
            const generated = generateEchoes(userData.name || 'Anonymous');
            
            // Stagger appearance
            const timeout = setTimeout(() => {
                setEchoes(generated);
                setIsScanning(false);
                // Select highest resonance by default
                const highest = [...generated].sort((a, b) => b.resonance - a.resonance)[0];
                setSelectedEcho(highest);
            }, 1500);
            
            return () => clearTimeout(timeout);
        }
    }, [userData]);

    return (
        <div className="bg-zinc-950 rounded-3xl border border-fuchsia-900/30 overflow-hidden relative min-h-[600px] flex flex-col font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            {/* Header */}
            <div className="p-6 border-b border-fuchsia-900/30 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40 backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                        <History className="w-6 h-6 text-fuchsia-500" />
                        Past Life Planetary Echoes
                    </h2>
                    <p className="text-sm font-mono text-zinc-500 mt-1 uppercase tracking-widest">
                        Tracing the karmic recurrence of your natal placements
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                    <div className="text-xs font-mono text-zinc-400">Current Iteration:</div>
                    <div className="text-sm font-bold text-fuchsia-400 tracking-wider">v.{userData?.name?.length || 0}.{new Date().getFullYear()}</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 relative z-10">
                
                {/* Main Graph Area */}
                <div className="w-full md:w-2/3 flex flex-col border border-white/5 rounded-2xl bg-black/20 p-4 relative overflow-hidden">
                    <h3 className="text-xs font-mono text-fuchsia-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" /> Temporal Resonance Waveform
                    </h3>
                    
                    {isScanning ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin mb-4" />
                            <div className="text-fuchsia-400 font-mono text-xs uppercase tracking-widest animate-pulse">Calculating Astrological Overlaps...</div>
                        </div>
                    ) : (
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={echoes} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} onClick={(e: any) => {
                                    if(e && e.activePayload) setSelectedEcho(e.activePayload[0].payload);
                                }}>
                                    <defs>
                                        <linearGradient id="colorResonance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="era" 
                                        tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
                                        tickMargin={10} 
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis hide domain={[0, 100]} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    {selectedEcho && (
                                        <ReferenceLine x={selectedEcho.era} stroke="#d946ef" strokeDasharray="3 3" opacity={0.5} />
                                    )}
                                    <Area 
                                        type="monotone" 
                                        dataKey="resonance" 
                                        stroke="#d946ef" 
                                        fillOpacity={1} 
                                        fill="url(#colorResonance)" 
                                        activeDot={{ r: 8, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                        {selectedEcho ? (
                            <motion.div 
                                key={selectedEcho.era}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-gradient-to-br from-fuchsia-900/20 to-black border border-fuchsia-500/30 rounded-2xl p-6 relative overflow-hidden h-full flex flex-col"
                            >
                                <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                                    <History size={150} />
                                </div>
                                
                                <div className="text-[10px] font-mono text-fuchsia-400/70 uppercase tracking-widest mb-1 border-b border-fuchsia-900/30 pb-2">Selected Echo</div>
                                <h3 className="text-2xl font-serif text-white mt-2">{selectedEcho.era}</h3>
                                <div className="text-fuchsia-300 font-mono text-sm mb-6">{selectedEcho.year < 0 ? `${Math.abs(selectedEcho.year)} BCE` : `${selectedEcho.year} CE`}</div>
                                
                                <div className="bg-black/60 rounded-xl border border-white/5 p-4 mb-6">
                                    <div className="text-3xl font-light text-white mb-1">{selectedEcho.resonance}<span className="text-lg text-zinc-500">%</span></div>
                                    <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Alignment Strength</div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <div className="text-xs font-mono text-zinc-500 mb-1">Dominant Recurring Placement</div>
                                        <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded p-3">
                                            <Orbit className="w-5 h-5 text-indigo-400" />
                                            <div className="text-sm text-stone-200">
                                                <span className="font-bold">{selectedEcho.planetaryMatch}</span> in House {selectedEcho.house}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs font-mono text-zinc-500 mb-1">Historical Context</div>
                                        <div className="text-sm leading-relaxed text-stone-400 italic">
                                            "{selectedEcho.description}"
                                        </div>
                                    </div>
                                </div>
                                
                            </motion.div>
                        ) : (
                            <div className="bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full text-zinc-500">
                                <Search className="w-8 h-8 mb-4 opacity-50" />
                                <p className="text-sm font-mono">Select a node on the waveform to analyze its karmic resonance.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
