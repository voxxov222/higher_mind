import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Waves, Flame, Wind, Mountain, Orbit, Search, GitBranch, Shield, Zap, Target, BookOpen, Star, View, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, Text, Float, Line, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

const HISTORICAL_PERIODS = [
    { era: 'Lemurian Epoch', year: -50000, description: 'Pre-historical spiritual civilization of pure intuition.', element: 'Waves', karmicDebt: 'Emotional detachment', soulLesson: 'Deep feeling' },
    { era: 'Atlantean Era', year: -10500, description: 'Techno-spiritual golden age preceding the Great Flood.', element: 'Flame', karmicDebt: 'Hubris and power', soulLesson: 'Humility in creation' },
    { era: 'Early Dynastic Egypt', year: -3100, description: 'Unification of Upper and Lower Egypt; harnessing the Nile.', element: 'Mountain', karmicDebt: 'Authoritarian control', soulLesson: 'Servant leadership' },
    { era: 'Vedic India', year: -1500, description: 'Composition of the Rigveda; mastery of sound and mantra.', element: 'Wind', karmicDebt: 'Spiritual bypass', soulLesson: 'Grounding the divine' },
    { era: 'Hellenistic Greece', year: -300, description: 'Flourishing of geometry, philosophy, and early astrology.', element: 'Flame', karmicDebt: 'Intellectual arrogance', soulLesson: 'Wisdom of the heart' },
    { era: 'Renaissance', year: 1500, description: 'Rebirth of Hermeticism, art, and scientific inquiry.', element: 'Wind', karmicDebt: 'Material distraction', soulLesson: 'Sacred art' },
    { era: 'Current Epoch', year: new Date().getFullYear(), description: 'The crystallization of the digital and spiritual nexus.', element: 'Orbit', karmicDebt: 'Technological isolation', soulLesson: 'Unity consciousness' }
];

const generateEchoes = (seed: string) => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return HISTORICAL_PERIODS.map((period, index) => {
        const resonance = 30 + ((hash * (index + 7)) % 70); 
        return {
            ...period,
            resonance,
            planetaryMatch: ['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter', 'Mars', 'Venus'][(hash + index) % 7],
            house: ((hash + index * 3) % 12) + 1,
            stats: [
                { subject: 'Wisdom', A: 40 + ((hash * 13 + index) % 60) },
                { subject: 'Power', A: 40 + ((hash * 7 + index) % 60) },
                { subject: 'Love', A: 40 + ((hash * 11 + index) % 60) },
                { subject: 'Intuition', A: 40 + ((hash * 17 + index) % 60) },
                { subject: 'Action', A: 40 + ((hash * 19 + index) % 60) },
                { subject: 'Creation', A: 40 + ((hash * 23 + index) % 60) }
            ]
        };
    });
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/90 backdrop-blur-md border border-fuchsia-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(217,70,239,0.3)] overflow-hidden relative z-50 min-w-[250px]"
            >
                <div className="absolute -top-4 -right-4 p-2 opacity-5">
                    <History size={64} />
                </div>
                <p className="text-fuchsia-400 font-serif text-lg tracking-wider mb-1">{data.era}</p>
                <p className="text-zinc-500 font-mono text-xs mb-3">{data.year < 0 ? `${Math.abs(data.year)} BCE` : `${data.year} CE`}</p>
                
                <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                        <span className="text-zinc-400">Resonance Level</span>
                        <span className="text-fuchsia-400 font-mono font-bold">{data.resonance}%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1">
                        <span className="text-zinc-400">Key Planet</span>
                        <span className="text-indigo-300">{data.planetaryMatch}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-1">
                        <span className="text-zinc-400">Active House</span>
                        <span className="text-pink-300">House {data.house}</span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-fuchsia-900/30">
                    <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[220px] italic">
                        {data.description}
                    </p>
                </div>
            </motion.div>
        );
    }
    return null;
};

// --- 3D Timeline Components ---
interface Pin {
    id: string;
    position: [number, number, number];
    text: string;
}

const EchoNode = ({ echo, index, isSelected, onClick }: any) => {
    const z = - (index * 15);
    const x = Math.sin(index * 1.5) * 5;
    const y = Math.cos(index * 1.2) * 2;
    
    return (
        <group position={[x, y, z]}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <mesh 
                    onClick={(e) => { e.stopPropagation(); onClick(echo); }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                    <octahedronGeometry args={[isSelected ? 1.5 : 1]} />
                    <meshStandardMaterial 
                        color={isSelected ? "#d946ef" : "#8b5cf6"} 
                        wireframe={!isSelected}
                        emissive={isSelected ? "#d946ef" : "#8b5cf6"}
                        emissiveIntensity={isSelected ? 0.8 : 0.2}
                    />
                </mesh>
                <Text position={[0, -2, 0]} fontSize={0.6} color={isSelected ? "#fdf4ff" : "#a1a1aa"} anchorY="top" maxWidth={5} textAlign="center" font="/fonts/Inter-Regular.woff">
                    {echo.era}
                </Text>
            </Float>
        </group>
    );
};

const TimelineScene = ({ echoes, selectedEcho, setSelectedEcho, pins, setPins, draftPin, setDraftPin }: any) => {
    const scroll = useScroll();
    const { camera } = useThree();
    
    useFrame(() => {
        if (scroll) {
            // Echoes exist from z=0 to roughly z=-90
            camera.position.z = 10 - (scroll.offset * 120);
        }
    });

    const curvePoints = useMemo(() => {
        return echoes.map((_: any, i: number) => new THREE.Vector3(
            Math.sin(i * 1.5) * 5,
            Math.cos(i * 1.2) * 2,
            -(i * 15)
        ));
    }, [echoes]);

    const handleBackgroundDoubleClick = (e: any) => {
        // Drop pin at a fixed distance from camera
        const vec = new THREE.Vector3(e.pointer.x, e.pointer.y, 0.5);
        vec.unproject(camera);
        vec.sub(camera.position).normalize();
        const distance = 10; // distance from camera
        const pos = new THREE.Vector3().copy(camera.position).add(vec.multiplyScalar(distance));
        
        setDraftPin({ position: [pos.x, pos.y, pos.z] });
    };

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 10]} intensity={1} color="#d946ef" />
            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            
            {/* Background receiver for double clicks */}
            <mesh position={[0, 0, -50]} onDoubleClick={handleBackgroundDoubleClick} visible={false}>
                <boxGeometry args={[200, 200, 300]} />
            </mesh>
            
            {curvePoints.length > 0 && (
                <Line points={curvePoints} color="#d946ef" lineWidth={2} opacity={0.3} transparent dashed dashScale={5} />
            )}
            
            {echoes.map((echo: any, i: number) => (
                <EchoNode 
                    key={echo.era} 
                    echo={echo} 
                    index={i} 
                    isSelected={selectedEcho?.era === echo.era}
                    onClick={setSelectedEcho}
                />
            ))}
            
            {pins.map((pin: Pin) => (
                <group key={pin.id} position={pin.position}>
                    <Float speed={4} floatIntensity={2}>
                        <mesh>
                            <tetrahedronGeometry args={[0.5]} />
                            <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} wireframe />
                        </mesh>
                        <Html center position={[0, -1, 0]} className="pointer-events-none">
                            <div className="bg-emerald-900/60 backdrop-blur-md text-emerald-300 px-3 py-1 rounded text-xs border border-emerald-500/50 whitespace-nowrap shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                {pin.text}
                            </div>
                        </Html>
                    </Float>
                </group>
            ))}

            {draftPin && (
                <Html position={draftPin.position} center zIndexRange={[100, 0]}>
                    <div className="bg-black/90 backdrop-blur-md p-3 rounded-xl border border-fuchsia-500/50 shadow-2xl flex flex-col gap-2 pointer-events-auto">
                        <div className="text-xs text-fuchsia-400 font-mono">Pin Insight</div>
                        <input 
                            autoFocus
                            type="text"
                            placeholder="Type & press Enter"
                            className="bg-transparent border-b border-fuchsia-500/30 text-white outline-none text-sm w-48 focus:border-fuchsia-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    setPins([...pins, { id: Math.random().toString(), position: draftPin.position, text: e.currentTarget.value.trim() }]);
                                    setDraftPin(null);
                                }
                                if (e.key === 'Escape') setDraftPin(null);
                            }}
                        />
                        <div className="text-[10px] text-zinc-500">Esc to cancel</div>
                    </div>
                </Html>
            )}
        </>
    );
};
// ------------------------------

export const PastLifeEchoes: React.FC<{ userData: any }> = ({ userData }) => {
    const [echoes, setEchoes] = useState<any[]>([]);
    const [selectedEcho, setSelectedEcho] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'lessons'>('overview');
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
    const [pins, setPins] = useState<Pin[]>([]);
    const [draftPin, setDraftPin] = useState<{position: [number, number, number]} | null>(null);

    useEffect(() => {
        if (userData) {
            setIsScanning(true);
            const generated = generateEchoes(userData.name || 'Anonymous');
            
            const timeout = setTimeout(() => {
                setEchoes(generated);
                setIsScanning(false);
                const highest = [...generated].sort((a, b) => b.resonance - a.resonance)[0];
                setSelectedEcho(highest);
            }, 2000);
            
            return () => clearTimeout(timeout);
        }
    }, [userData]);

    return (
        <div className="bg-zinc-950 rounded-3xl border border-fuchsia-900/40 overflow-hidden relative min-h-[700px] flex flex-col font-sans shadow-[0_0_50px_rgba(217,70,239,0.05)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay" />
            
            {/* Header */}
            <div className="p-6 border-b border-fuchsia-900/30 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/60 backdrop-blur-xl shadow-xl">
                <div>
                    <h2 className="text-2xl font-serif text-white flex items-center gap-3 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                            <History className="w-7 h-7 text-fuchsia-500" />
                        </motion.div>
                        Akashic Timeline & Past Life Echoes
                    </h2>
                    <p className="text-sm font-mono text-fuchsia-300/70 mt-1 uppercase tracking-widest flex items-center gap-2">
                        <SparkleIcon /> Tracing karmic recurrence across the space-time continuum
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-black/50 border border-fuchsia-500/20 rounded-xl p-1 backdrop-blur-md">
                        <button 
                            onClick={() => setViewMode('2d')} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === '2d' ? 'bg-fuchsia-500/20 text-fuchsia-300 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Activity className="w-3 h-3" /> Waveform
                        </button>
                        <button 
                            onClick={() => setViewMode('3d')} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === '3d' ? 'bg-fuchsia-500/20 text-fuchsia-300 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <View className="w-3 h-3" /> 3D Timeline
                        </button>
                    </div>
                    
                    <div className="bg-fuchsia-900/10 border border-fuchsia-500/20 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-md">
                        <div className="text-xs font-mono text-fuchsia-300/50">Soul Identity:</div>
                        <div className="text-sm font-bold text-fuchsia-400 tracking-wider glow-text">{userData?.name || 'Wanderer'}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col xl:flex-row p-6 gap-6 relative z-10">
                
                {/* Main Graph / 3D Area */}
                <div className="w-full xl:w-7/12 flex flex-col border border-white/5 rounded-2xl bg-black/40 p-5 relative overflow-hidden backdrop-blur-sm shadow-inner shadow-fuchsia-900/10 min-h-[400px]">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-xs font-mono text-fuchsia-500 uppercase tracking-widest flex items-center gap-2">
                            <GitBranch className="w-4 h-4" /> 
                            {viewMode === '3d' ? 'Scrollable Akashic Path' : 'Chronological Resonance Waveform'}
                        </h3>
                        {viewMode === '3d' ? (
                             <div className="text-[10px] font-mono text-fuchsia-300/50 uppercase tracking-widest bg-black/50 px-2 py-1 rounded border border-white/5">
                                 Scroll to navigate • Dbl-Click to Pin Insight
                             </div>
                        ) : (
                            <div className="flex gap-2">
                                {['Waves', 'Flame', 'Wind', 'Mountain'].map((el) => (
                                    <div key={el} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center bg-black/50" title={el}>
                                        {el === 'Waves' && <Waves size={10} className="text-blue-400" />}
                                        {el === 'Flame' && <Flame size={10} className="text-red-400" />}
                                        {el === 'Wind' && <Wind size={10} className="text-emerald-400" />}
                                        {el === 'Mountain' && <Mountain size={10} className="text-amber-700" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {isScanning ? (
                        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="relative mb-6">
                                <div className="absolute inset-0 bg-fuchsia-500/20 rounded-full blur-xl animate-pulse" />
                                <Orbit className="w-16 h-16 text-fuchsia-500 relative z-10" />
                            </motion.div>
                            <div className="text-fuchsia-400 font-mono text-xs uppercase tracking-widest animate-pulse tracking-[0.3em]">Accessing Akashic Records...</div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 pt-16">
                            {viewMode === '3d' ? (
                                <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                                    <ScrollControls pages={3} damping={0.2}>
                                        <TimelineScene 
                                            echoes={echoes} 
                                            selectedEcho={selectedEcho} 
                                            setSelectedEcho={setSelectedEcho}
                                            pins={pins}
                                            setPins={setPins}
                                            draftPin={draftPin}
                                            setDraftPin={setDraftPin}
                                        />
                                    </ScrollControls>
                                </Canvas>
                            ) : (
                                <div className="w-full h-full p-6 pb-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={echoes} margin={{ top: 20, right: 30, left: 10, bottom: 20 }} onClick={(e: any) => {
                                            if(e && e.activePayload) setSelectedEcho(e.activePayload[0].payload);
                                        }}>
                                            <defs>
                                                <linearGradient id="colorResonance" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.6}/>
                                                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                                <filter id="glowChart" x="-20%" y="-20%" width="140%" height="140%">
                                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                </filter>
                                            </defs>
                                            <XAxis 
                                                dataKey="era" 
                                                tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }} 
                                                tickMargin={15} 
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis hide domain={[0, 110]} />
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(217,70,239,0.4)', strokeWidth: 2, strokeDasharray: '5 5' }} />
                                            
                                            {selectedEcho && (
                                                <ReferenceLine x={selectedEcho.era} stroke="#d946ef" strokeDasharray="3 3" strokeWidth={2} opacity={0.8} />
                                            )}
                                            
                                            <Area 
                                                type="monotone" 
                                                dataKey="resonance" 
                                                stroke="#d946ef" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorResonance)" 
                                                activeDot={{ r: 8, fill: '#fdf4ff', stroke: '#d946ef', strokeWidth: 4, style: { filter: 'url(#glowChart)' } }}
                                                animationDuration={1500}
                                                animationEasing="ease-out"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                <div className="w-full xl:w-5/12 flex flex-col gap-4 h-[500px] xl:h-auto">
                    <AnimatePresence mode="wait">
                        {selectedEcho ? (
                            <motion.div 
                                key={selectedEcho.era}
                                initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="bg-gradient-to-br from-fuchsia-950/40 via-black to-indigo-950/30 border border-fuchsia-500/20 rounded-2xl p-6 relative overflow-hidden h-full flex flex-col shadow-2xl"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
                                
                                <div className="text-[10px] font-mono text-fuchsia-400/80 uppercase tracking-widest mb-1 border-b border-fuchsia-900/50 pb-3 flex justify-between items-center relative z-10">
                                    <span>Incarnation Analysis</span>
                                    <span className="text-zinc-500">{selectedEcho.year < 0 ? `${Math.abs(selectedEcho.year)} BCE` : `${selectedEcho.year} CE`}</span>
                                </div>
                                
                                <h3 className="text-3xl font-serif text-white mt-4 mb-6 drop-shadow-md relative z-10">{selectedEcho.era}</h3>
                                
                                {/* Custom Tabs */}
                                <div className="flex gap-2 mb-6 bg-black/50 p-1 rounded-xl border border-white/5 relative z-10">
                                    <button onClick={() => setActiveTab('overview')} className={`flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}>Overview</button>
                                    <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}>Soul Stats</button>
                                    <button onClick={() => setActiveTab('lessons')} className={`flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${activeTab === 'lessons' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}>Karmic Path</button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                                    {activeTab === 'overview' && (
                                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                                            <div className="flex items-center gap-6 bg-black/40 rounded-2xl border border-white/5 p-5 backdrop-blur-sm">
                                                <div className="relative">
                                                    <svg className="w-20 h-20 transform -rotate-90">
                                                        <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                                                        <motion.circle 
                                                            initial={{ strokeDashoffset: 226 }}
                                                            animate={{ strokeDashoffset: 226 - (226 * selectedEcho.resonance) / 100 }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            cx="40" cy="40" r="36" 
                                                            stroke="url(#grad1)" strokeWidth="4" fill="none" 
                                                            strokeDasharray="226"
                                                            strokeLinecap="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                <stop offset="0%" stopColor="#d946ef" />
                                                                <stop offset="100%" stopColor="#8b5cf6" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                        <span className="text-xl font-light text-white">{selectedEcho.resonance}</span>
                                                        <span className="text-[9px] text-fuchsia-400 font-mono uppercase">Sync</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Dominant Force</div>
                                                        <div className="flex items-center gap-2">
                                                            <Orbit className="w-4 h-4 text-indigo-400" />
                                                            <span className="text-sm text-stone-200 font-medium">{selectedEcho.planetaryMatch}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Celestial House</div>
                                                        <div className="flex items-center gap-2">
                                                            <Target className="w-4 h-4 text-emerald-400" />
                                                            <span className="text-sm text-stone-200 font-medium">House {selectedEcho.house}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-fuchsia-900/10 border border-fuchsia-500/20 p-5 rounded-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500 group-hover:w-full transition-all duration-700 opacity-20" />
                                                <BookOpen className="w-5 h-5 text-fuchsia-400 mb-3 relative z-10" />
                                                <div className="text-[11px] font-mono text-fuchsia-300 uppercase tracking-widest mb-2 relative z-10">Historical Akashic Record</div>
                                                <p className="text-sm leading-relaxed text-stone-300 font-serif italic relative z-10">
                                                    "{selectedEcho.description}"
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'stats' && (
                                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="h-full flex flex-col items-center justify-center bg-black/30 rounded-2xl border border-white/5 p-4">
                                            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Soul Attribute Distribution</div>
                                            <div className="w-full h-[250px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={selectedEcho.stats}>
                                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#d946ef', fontSize: 10, fontFamily: 'monospace' }} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                        <Radar name="Soul" dataKey="A" stroke="#d946ef" fill="#d946ef" fillOpacity={0.4} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'lessons' && (
                                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
                                            <div className="bg-black/40 border border-red-500/20 rounded-2xl p-5 relative overflow-hidden">
                                                <div className="absolute -right-4 -bottom-4 opacity-10"><Flame size={100} className="text-red-500" /></div>
                                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                                        <Zap className="w-4 h-4 text-red-400" />
                                                    </div>
                                                    <div className="text-sm font-mono text-red-300 uppercase tracking-widest">Karmic Debt Carried</div>
                                                </div>
                                                <p className="text-white text-lg font-light relative z-10">{selectedEcho.karmicDebt}</p>
                                                <p className="text-xs text-stone-400 mt-2 relative z-10 font-mono">This energetic pattern requires balancing in the current incarnation.</p>
                                            </div>
                                            
                                            <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
                                                <div className="absolute -right-4 -bottom-4 opacity-10"><Star size={100} className="text-emerald-500" /></div>
                                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                                        <Shield className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <div className="text-sm font-mono text-emerald-300 uppercase tracking-widest">Mastered Soul Lesson</div>
                                                </div>
                                                <p className="text-white text-lg font-light relative z-10">{selectedEcho.soulLesson}</p>
                                                <p className="text-xs text-stone-400 mt-2 relative z-10 font-mono">A profound strength encoded in your celestial DNA.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                
                            </motion.div>
                        ) : (
                            <div className="bg-black/30 border border-fuchsia-900/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center h-full text-zinc-500 shadow-inner">
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }} 
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Search className="w-12 h-12 mb-6 opacity-20 text-fuchsia-400" />
                                </motion.div>
                                <p className="text-sm font-mono uppercase tracking-widest max-w-[200px] leading-relaxed">Select a temporal node to decode its karmic resonance.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const SparkleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-fuchsia-400">
        <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" fill="currentColor" />
    </svg>
);


