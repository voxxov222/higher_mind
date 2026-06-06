import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Triangle, Eye, Sparkles, Map, Compass, Type, Activity, ScrollText, Save, Droplets, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

const EGYPTIAN_DEITIES = [
  { sign: 'aries', name: 'Amun-Ra', role: 'Creation & Solar Power', color: '#ef4444', desc: 'The hidden one, champion of cosmic order and pure solar fire.', principle: 'Vibration' },
  { sign: 'taurus', name: 'Hathor', role: 'Love, Music & Earthly Joy', color: '#10b981', desc: 'Embodiment of beauty, abundance, and the sustaining power of nature.', principle: 'Rhythm' },
  { sign: 'gemini', name: 'Thoth', role: 'Wisdom, Magic & Writing', color: '#eab308', desc: 'The cosmic scribe, maintaining the universe through mathematics and language.', principle: 'Mentalism' },
  { sign: 'cancer', name: 'Isis', role: 'Divine Mother & Magic', color: '#cbd5e1', desc: 'The throne of creation, fiercely protective and deeply intuitive.', principle: 'Rhythm' },
  { sign: 'leo', name: 'Ra', role: 'Sun God & Supreme Ruler', color: '#facc15', desc: 'The radiant source of life, traversing the sky in the solar barque.', principle: 'Vibration' },
  { sign: 'virgo', name: "Ma'at", role: 'Truth & Cosmic Balance', color: '#6ee7b7', desc: 'The personification of truth, justice, and the cosmic order.', principle: 'Correspondence' },
  { sign: 'libra', name: "Ma'at", role: 'Truth & Cosmic Balance', color: '#6ee7b7', desc: 'The personification of truth, justice, and the cosmic order.', principle: 'Correspondence' },
  { sign: 'scorpio', name: 'Anubis', role: 'Guide of Souls & Underworld', color: '#a855f7', desc: 'Master of secrets, guiding transformation across the threshold.', principle: 'Polarity' },
  { sign: 'sagittarius', name: 'Horus', role: 'Sky God & Divine Victory', color: '#38bdf8', desc: 'The soaring falcon, represents vision, conquest, and divine kingship.', principle: 'Cause and Effect' },
  { sign: 'capricorn', name: 'Sobek', role: 'Power, Protection & Fertility', color: '#14b8a6', desc: 'The primal force, ancient endurance and mastery over the physical realm.', principle: 'Cause and Effect' },
  { sign: 'aquarius', name: 'Nut', role: 'Goddess of the Night Sky', color: '#818cf8', desc: 'The starry canopy, representing infinite possibility and the cosmic waters.', principle: 'Mentalism' },
  { sign: 'pisces', name: 'Osiris', role: 'Resurrection & Eternity', color: '#2dd4bf', desc: 'Lord of the eternal kingdom, signifying death and profound spiritual rebirth.', principle: 'Polarity' }
];

const HERMETIC_PRINCIPLES: Record<string, string> = {
  'Mentalism': 'THE ALL IS MIND; THE UNIVERSE IS MENTAL.',
  'Correspondence': 'AS ABOVE, SO BELOW; AS BELOW, SO ABOVE.',
  'Vibration': 'NOTHING RESTS; EVERYTHING MOVES; EVERYTHING VIBRATES.',
  'Polarity': 'EVERYTHING IS DUAL; EVERYTHING HAS POLES.',
  'Rhythm': 'EVERYTHING FLOWS, OUT AND IN; EVERYTHING HAS ITS TIDES.',
  'Cause and Effect': 'EVERY CAUSE HAS ITS EFFECT; EVERY EFFECT HAS ITS CAUSE.',
  'Gender': 'GENDER IS IN EVERYTHING; EVERYTHING HAS ITS MASCULINE AND FEMININE PRINCIPLES.'
};

const HIEROGLYPHS: Record<string, string> = {
  a: '𓄿', b: '𓃀', c: '𓎡', d: '𓂧', e: '𓇋', f: '𓆑', g: '𓎼', h: '𓉔', i: '𓇋', j: '𓆓', k: '𓎡', l: '𓃭', m: '𓅓', n: '𓈖', o: '𓍯', p: '𓊪', q: '𓈎', r: '𓂋', s: '𓋴', t: '𓏏', u: '𓅱', v: '𓆑', w: '𓅱', x: '𓎡𓋴', y: '𓇌', z: '𓊃', ' ': '  '
};

const textToHieroglyphs = (text: string) => {
    return text.toLowerCase().split('').map(char => HIEROGLYPHS[char] || char).join(' ');
};

const ORION_STARS = [
    { name: 'Alnitak', pos: [-2, 8, -5], alignment: 'Great Pyramid of Khufu' },
    { name: 'Alnilam', pos: [0, 9, -5.5], alignment: 'Pyramid of Khafre' },
    { name: 'Mintaka', pos: [2, 10, -4.5], alignment: 'Pyramid of Menkaure' }
];

const PyramidGeometry: React.FC<{ position: [number, number, number], scale: number, label: string }> = ({ position, scale, label }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const edges = useMemo(() => new THREE.ConeGeometry(scale, scale * 1.5, 4), [scale]);
    
    useFrame((state) => {
        // Slight mystical hover
        if(meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <coneGeometry args={[scale, scale * 1.5, 4]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} transparent opacity={0.6} wireframe />
                <pointLight color="#fbbf24" intensity={2} distance={10} />
            </mesh>
            <Float speed={2} rotationIntensity={0} floatIntensity={1}>
                <Text 
                    position={[0, scale + 1.5, 0]} 
                    fontSize={0.4} 
                    color="#fcd34d" 
                    anchorX="center" 
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                >
                    {label}
                </Text>
            </Float>
        </group>
    );
};

const CelestialAlignmentNetwork = ({ chronosSync }: { chronosSync: 'current' | 'ancient' }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Simulate precession of the equinoxes: 
            // In ancient epoch, rotation is 0 for perfect alignment. 
            // In current epoch, Orion has shifted significantly.
            const targetRotationZ = chronosSync === 'ancient' ? 0 : 0.8;
            const targetRotationY = chronosSync === 'ancient' ? 0 : 0.4;
            
            groupRef.current.rotation.z += (targetRotationZ - groupRef.current.rotation.z) * 2 * delta;
            groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 2 * delta;
        }
    });

    return (
        <group>
            {/* Draw lines from Orion's Belt to Pyramids */}
            {ORION_STARS.map((star, i) => {
                const pyX = (i - 1) * 4;
                const pyZ = (i - 1) * -1;
                return (
                    <group key={i}>
                        {/* Star Group that rotates with Precession */}
                        <group ref={groupRef}>
                            <mesh position={star.pos as [number, number, number]}>
                                <sphereGeometry args={[0.15, 16, 16]} />
                                <meshBasicMaterial color="#ffffff" />
                                <pointLight color="#ffffff" intensity={2} distance={20} />
                            </mesh>
                            <Text position={[star.pos[0], star.pos[1] + 0.5, star.pos[2]]} fontSize={0.3} color="#93c5fd">
                                {star.name}
                            </Text>
                        </group>
                        
                        {/* Connecting Line (dynamic) */}
                        <DynamicLine starPos={star.pos as [number, number, number]} pyPos={[pyX, 1, pyZ]} groupRef={groupRef} />

                        {/* Pyramid */}
                        <PyramidGeometry position={[pyX, 0, pyZ]} scale={i === 0 ? 2 : i === 1 ? 1.8 : 1.2} label={star.alignment} />
                    </group>
                );
            })}
        </group>
    );
};

const DynamicLine = ({ starPos, pyPos, groupRef }: { starPos: [number, number, number], pyPos: [number, number, number], groupRef: React.RefObject<THREE.Group> }) => {
    const lineRef = useRef<any>();
    
    useFrame(() => {
        if (groupRef.current && lineRef.current) {
            const worldStarPos = new THREE.Vector3(...starPos).applyMatrix4(groupRef.current.matrixWorld);
            lineRef.current.setPoints([worldStarPos, pyPos]);
        }
    });

    return (
        <Line 
            ref={lineRef}
            points={[starPos, pyPos]} 
            color="#38bdf8" 
            lineWidth={1} 
            transparent 
            opacity={0.3} 
            dashed 
            dashSize={0.2} 
            gapSize={0.1}
        />
    );
};

const GlowingHieroglyphs: React.FC<{ text: string, color: string }> = ({ text, color }) => {
    const hieroglyphs = useMemo(() => textToHieroglyphs(text), [text]);
    
    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[0, -0.5, 4]}>
            <Text 
                fontSize={1.2} 
                color={color} 
                anchorX="center" 
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                font="/Inter.ttf" // Fallback, hieroglyphs will use system fonts that support it a bit
            >
                {hieroglyphs}
            </Text>
            <pointLight color={color} intensity={1} distance={5} />
        </Float>
    );
}

export const EgyptianPyramidAlignment: React.FC = () => {
    const [selectedSign, setSelectedSign] = useState(EGYPTIAN_DEITIES[0]);
    const [gematriaInput, setGematriaInput] = useState('');
    const [alignmentAngles, setAlignmentAngles] = useState({ azimuth: 0, altitude: 0, variance: 0 });
    const [savedAlignments, setSavedAlignments] = useState<Array<{id: string, date: Date, archetype: string, input: string, phrase: string, angles: any}>>([]);
    const [activeView, setActiveView] = useState<'3d' | 'papyrus' | 'map'>('3d');
    const [chronosSync, setChronosSync] = useState<'current' | 'ancient'>('current');

    useEffect(() => {
        // Simulate dynamic cosmic alignment angles based on signs and time
        const interval = setInterval(() => {
            const time = Date.now() / 10000;
            const seed = EGYPTIAN_DEITIES.indexOf(selectedSign) * 2.5;
            const varianceShift = chronosSync === 'ancient' ? 0 : Math.abs(Math.sin(time * 2 + seed) * 0.5);
            setAlignmentAngles({
                azimuth: (180 + Math.sin(time + seed) * 15),
                altitude: (45 + Math.cos(time + seed * 1.5) * 5),
                variance: varianceShift
            });
        }, 100);
        return () => clearInterval(interval);
    }, [selectedSign, chronosSync]);

    const handleSaveAlignment = () => {
        setSavedAlignments(prev => [{
            id: Math.random().toString(36).substring(7),
            date: new Date(),
            archetype: selectedSign.name,
            input: gematriaInput,
            phrase: HERMETIC_PRINCIPLES[selectedSign.principle],
            angles: { ...alignmentAngles }
        }, ...prev]);
    };

    return (
        <div className="flex flex-col md:flex-row h-full min-h-[700px] bg-zinc-950 rounded-3xl border border-yellow-900/30 overflow-hidden relative font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            {/* Left Content Area (Canvas, Papyrus, Map) */}
            <div className="w-full md:w-2/3 relative border-b md:border-b-0 md:border-r border-yellow-900/20">
                {/* Navigation Tools */}
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button 
                        onClick={() => setActiveView('3d')}
                        className={`p-2 rounded border transition-all ${activeView === '3d' ? 'bg-yellow-900/40 text-yellow-500 border-yellow-600/50' : 'bg-black/40 text-zinc-500 border-white/10 hover:text-yellow-400'}`}
                        title="3D alignment"
                    >
                        <Triangle className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveView('papyrus')}
                        className={`p-2 rounded border transition-all ${activeView === 'papyrus' ? 'bg-yellow-900/40 text-yellow-500 border-yellow-600/50' : 'bg-black/40 text-zinc-500 border-white/10 hover:text-yellow-400'}`}
                        title="Ancient Papyrus (History)"
                    >
                        <ScrollText className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setActiveView('map')}
                        className={`p-2 rounded border transition-all ${activeView === 'map' ? 'bg-yellow-900/40 text-yellow-500 border-yellow-600/50' : 'bg-black/40 text-zinc-500 border-white/10 hover:text-yellow-400'}`}
                        title="Nile Geographic Overlay"
                    >
                        <Droplets className="w-4 h-4" />
                    </button>
                </div>

                {activeView === '3d' && (
                    <Canvas camera={{ position: [0, 5, 20], fov: 45 }}>
                        <ambientLight intensity={0.2} />
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
                        
                        {/* Sand floor */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
                            <planeGeometry args={[100, 100]} />
                            <meshStandardMaterial color="#451a03" metalness={0.1} roughness={0.9} transparent opacity={0.6} />
                        </mesh>
    
                        <CelestialAlignmentNetwork chronosSync={chronosSync} />
                        
                        {/* Central Energy Pillar for Selected Deity */}
                        <mesh position={[0, -2, 5]}>
                            <cylinderGeometry args={[0.1, 0.1, 20, 16]} />
                            <meshBasicMaterial color={selectedSign.color} transparent opacity={0.3} />
                        </mesh>
                        <Float position={[0, 2, 5]} speed={3}>
                            <Text fontSize={0.8} color={selectedSign.color} outlineWidth={0.02} outlineColor="#000">
                                {selectedSign.name} Alignment
                            </Text>
                        </Float>
    
                        {gematriaInput && <GlowingHieroglyphs text={gematriaInput} color={selectedSign.color} />}
    
                        <OrbitControls autoRotate autoRotateSpeed={0.5} maxDistance={40} minDistance={5} maxPolarAngle={Math.PI / 2 + 0.1} />
                    </Canvas>
                )}

                {activeView === 'papyrus' && (
                    <div className="absolute inset-0 bg-[#e6d5b8] bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')] overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-2xl mx-auto py-8">
                            <h2 className="text-3xl font-serif text-[#4a3b2c] border-b-2 border-[#8b7355] pb-4 mb-8 text-center flex items-center justify-center gap-3 shadow-none">
                                <ScrollText className="w-8 h-8 text-[#8b7355]" />
                                The Book of Alignments
                            </h2>
                            {savedAlignments.length === 0 ? (
                                <div className="text-center text-[#8b7355] font-serif italic py-12">
                                    No records have been inscribed upon the papyrus yet.
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {savedAlignments.map(record => (
                                        <div key={record.id} className="bg-[#f4ebd8] p-6 border border-[#c4a981] shadow-md relative before:content-[''] before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] before:opacity-30 before:pointer-events-none">
                                            <div className="flex justify-between items-start mb-4 border-b border-[#c4a981] pb-2">
                                                <div className="text-[#8b7355] font-serif font-bold text-lg">{record.archetype} Alignment</div>
                                                <div className="text-[#a68e68] text-sm font-mono">{format(record.date, 'MMM do, yyyy HH:mm')}</div>
                                            </div>
                                            <p className="text-[#5c4a3d] font-serif italic text-lg leading-relaxed mb-4">
                                                "{record.phrase}"
                                            </p>
                                            <div className="flex gap-4 items-end justify-between mt-4 border-t border-[#c4a981]/50 pt-4">
                                                <div className="text-[#8b7355] text-xs font-mono uppercase tracking-widest">
                                                    Azimuth: {record.angles.azimuth.toFixed(1)}° | Altitude: {record.angles.altitude.toFixed(1)}°
                                                </div>
                                                {record.input && (
                                                    <div className="text-right">
                                                        <div className="text-[#4a3b2c] tracking-widest text-xl mb-1">{textToHieroglyphs(record.input)}</div>
                                                        <div className="text-[10px] text-[#a68e68] font-mono uppercase">{record.input}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'map' && (
                    <div className="absolute inset-0 bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] overflow-hidden flex flex-col items-center justify-center relative p-8">
                        <div className="absolute right-0 bottom-0 w-[400px] h-[600px] border-l border-t border-cyan-900/30 rounded-tl-full opacity-20 pointer-events-none"></div>
                        <div className="absolute left-0 top-0 w-[300px] h-[500px] border-r border-b border-yellow-900/20 rounded-br-full opacity-10 pointer-events-none"></div>

                        <div className="max-w-md w-full relative z-10 border-[1px] border-cyan-900/50 rounded-2xl bg-black/40 backdrop-blur-md p-6 overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,_rgba(0,255,255,0.02)_100%)] pointer-events-none" />
                            <div className="flex items-center gap-3 mb-6 border-b border-cyan-900/50 pb-4">
                                <Droplets className="w-6 h-6 text-cyan-400" />
                                <h2 className="text-xl font-mono text-cyan-400 tracking-widest uppercase">The Celestial Nile</h2>
                            </div>
                            <div className="relative h-64 border border-white/5 rounded-lg mb-4 bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                                 {/* Abstract River Flow */}
                                 <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M 50,0 Q 40,25 55,50 T 45,100" fill="none" stroke="#22d3ee" strokeWidth="2" className="animate-pulse" />
                                    <path d="M 50,0 Q 40,25 55,50 T 45,100" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2 2" className="animate-[dash_10s_linear_infinite]" />
                                 </svg>
                                 
                                 {/* Constellation Correlation Points */}
                                 <div className="absolute top-[20%] left-[45%] flex items-center gap-2 group cursor-pointer text-yellow-500">
                                     <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" />
                                     <span className="text-[10px] font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Sirius (Sothis)</span>
                                 </div>
                                 <div className="absolute top-[50%] left-[55%] flex items-center gap-2 group cursor-pointer text-cyan-400">
                                     <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                                     <span className="text-[10px] font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Orion Belt</span>
                                 </div>
                                 <div className="absolute top-[80%] left-[45%] flex items-center gap-2 group cursor-pointer text-emerald-400">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                                     <span className="text-[10px] font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Cygnus</span>
                                 </div>
                            </div>
                            <p className="text-xs font-mono text-cyan-100/60 leading-relaxed">
                                The Milky Way was seen as a celestial twin to the Nile River. Your primary astrological aspects cast energetic shadows across terrestrial ley lines mapped by the ancients.
                            </p>
                        </div>
                    </div>
                )}
                
                {/* HUD specifically for 3D View */}
                {activeView === '3d' && (
                    <>
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                            <div className="flex items-center gap-2 text-yellow-500 font-mono text-xs tracking-widest uppercase bg-black/60 px-3 py-1.5 rounded border border-yellow-900/30 backdrop-blur-sm">
                                <Eye className="w-4 h-4" /> 
                                <span>Orion Protocol Active</span>
                            </div>
                            {/* Hermetic Principle Overlay (Stone Aesthetic) */}
                            <div className="bg-stone-900/80 backdrop-blur-md border-[2px] border-stone-800 rounded shadow-2xl p-4 mt-2 max-w-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-20 mix-blend-overlay"></div>
                                <h4 className="text-[10px] font-mono text-yellow-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                                    <span>Hermetic Principle</span>
                                    <span className="opacity-50 border border-yellow-600/30 px-1 text-[8px] rounded">[{selectedSign.principle}]</span>
                                </h4>
                                <p className="text-sm font-serif text-stone-300 leading-relaxed uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                                    "{HERMETIC_PRINCIPLES[selectedSign.principle]}"
                                </p>
                            </div>
                        </div>
        
                        {/* Alignment Telemetry Overlay */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-10">
                            <div className="bg-black/60 border border-cyan-900/30 p-3 rounded backdrop-blur-sm font-mono text-[10px] text-cyan-500 tracking-widest uppercase flex flex-col gap-1 w-48 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
                                <div className="flex items-center gap-2 mb-1 text-cyan-400">
                                    <Compass className="w-3 h-3" />
                                    <span>Celestial Vector</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Azimuth:</span>
                                    <span className="text-white">{alignmentAngles.azimuth.toFixed(2)}°</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Altitude:</span>
                                    <span className="text-white">{alignmentAngles.altitude.toFixed(2)}°</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Variance:</span>
                                    <span className="text-white">{alignmentAngles.variance.toFixed(4)} ∆</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Information Panel */}
            <div className="w-full md:w-1/3 p-6 flex flex-col relative z-10 bg-black/40 backdrop-blur-sm overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-6 border-b border-yellow-900/30 pb-4">
                    <Triangle className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-xl font-mono text-yellow-500 tracking-widest uppercase">Ancient Wisdom</h2>
                </div>

                <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-6">
                    The Giza Pyramids align with the belt of Orion (Osiris), reflecting the hermetic axiom "As above, so below." Connect your astrological signature to its ancient Egyptian archetype.
                </p>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-mono text-yellow-700 uppercase tracking-widest mb-3 block">Your Astrological Resonance</label>
                        <div className="grid grid-cols-3 gap-2">
                            {EGYPTIAN_DEITIES.map(deity => (
                                <button
                                    key={deity.sign}
                                    onClick={() => setSelectedSign(deity)}
                                    className={`py-2 px-1 rounded text-[10px] font-mono tracking-wider uppercase border transition-all ${
                                        selectedSign.sign === deity.sign 
                                            ? 'bg-yellow-900/40 text-yellow-500 border-yellow-600/50' 
                                            : 'bg-white/5 text-zinc-500 border-white/5 hover:text-yellow-700 hover:border-yellow-900/30'
                                    }`}
                                >
                                    {deity.sign}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-900/30 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Sparkles className="w-24 h-24 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-serif text-white mb-1" style={{ color: selectedSign.color }}>{selectedSign.name}</h3>
                        <p className="text-xs font-mono text-yellow-600 uppercase tracking-widest mb-4 pb-4 border-b border-yellow-900/30">{selectedSign.role}</p>
                        <p className="text-sm font-sans text-emerald-100/70 leading-relaxed font-light mb-4">
                            {selectedSign.desc}
                        </p>
                    </div>

                    {/* Gematria Phonics Input */}
                    <div className="bg-black/60 border border-white/5 rounded-xl p-4 space-y-3">
                         <h4 className="flex items-center justify-between text-xs font-mono text-purple-400 uppercase tracking-widest mb-2 border-b border-purple-900/30 pb-2">
                            <span className="flex items-center gap-2">
                                <Type className="w-4 h-4" /> 
                                Egyptian Phonetics
                            </span>
                        </h4>
                        <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                            Encode a name or birthdate into ancient spiritual equivalents. Watch it manifest in the holographic projection above the central pillar.
                        </p>
                        <input 
                            type="text" 
                            placeholder="Enter a word or name..."
                            value={gematriaInput}
                            onChange={(e) => setGematriaInput(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 font-mono text-sm text-yellow-500 placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50"
                        />
                        {gematriaInput && (
                            <div className="p-3 bg-white/5 rounded text-center border border-white/5">
                                <div className="text-2xl mt-1 tracking-widest text-stone-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                    {textToHieroglyphs(gematriaInput)}
                                </div>
                                <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mt-2">
                                    Phonetic Translation Active
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chronos-Sync Toggle */}
                    <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                        <h4 className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest mb-3">
                            <Clock className="w-4 h-4" /> 
                            Chronos-Sync
                        </h4>
                        <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-4">
                            Toggle between the current epoch and the ancient building of the Great Pyramid (10,500 BCE) to visualize the precession of the equinoxes.
                        </p>
                        <div className="flex rounded-lg overflow-hidden border border-white/10">
                            <button 
                                onClick={() => setChronosSync('current')}
                                className={`flex-1 py-2 text-xs font-mono tracking-widest uppercase transition-colors ${
                                    chronosSync === 'current' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-black hover:bg-white/5 text-zinc-500'
                                }`}
                            >
                                Current Epoch
                            </button>
                            <button 
                                onClick={() => setChronosSync('ancient')}
                                className={`flex-1 py-2 text-xs font-mono tracking-widest uppercase transition-colors ${
                                    chronosSync === 'ancient' ? 'bg-yellow-900/50 text-yellow-500' : 'bg-black hover:bg-white/5 text-zinc-500'
                                }`}
                            >
                                10,500 BCE
                            </button>
                        </div>
                    </div>

                    <div className="bg-black/60 border border-white/5 rounded-xl p-4">
                         <h4 className="flex items-center gap-2 text-xs font-mono text-cyan-500 uppercase tracking-widest mb-3">
                            <Activity className="w-4 h-4" /> 
                            Alignment Telemetry
                        </h4>
                        <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-4">
                            The 3D viewer calculates angular differentials between your astrological archetype's coordinate frequency and the Khufu, Khafre, and Menkaure pyramid complexes.
                        </p>
                        <button 
                            onClick={handleSaveAlignment}
                            className="w-full py-3 bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-600/30 rounded flex justify-center items-center gap-2 text-yellow-500 font-mono text-xs uppercase tracking-widest transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Record Alignment on Papyrus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
