import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Layers, Infinity as InfinityIcon, Eye, Heart, Orbit, Network, Zap, Waves, Sparkles, CircleDot, ArrowDown } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sphere, Box, Torus, Octahedron, Icosahedron, Dodecahedron, Cylinder, Ring, MeshDistortMaterial, MeshWobbleMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const DIMENSIONS = [
  {
    level: "1D",
    title: "The Iron Core",
    subtitle: "Gravity & Primal Grounding",
    icon: <CircleDot className="w-6 h-6 text-stone-500" />,
    color: "from-stone-900 to-stone-800",
    ringColor: "border-stone-500/30",
    stage: "Foundation",
    description: "The very center of Earth. The dense core of gravity and physical reality. It represents pure stillness, the ultimate grounding force, and the raw manifestation of survival and structure.",
    practice: "Grounding meditations, connecting deeply with the physical vessel, acknowledging the Earth's magnetic core."
  },
  {
    level: "2D",
    title: "The Telluric Realm",
    subtitle: "Elemental Forces & Nature",
    icon: <Waves className="w-6 h-6 text-emerald-600" />,
    color: "from-emerald-950 to-stone-900",
    ringColor: "border-emerald-600/30",
    stage: "Connection",
    description: "The layer of elements, bacteria, and plant life. The raw, intelligent forces of nature beneath the surface. It governs bodily functions, instincts, and the chemical codes of life.",
    practice: "Earthing, immersing in nature, balancing mineral and hydration intake."
  },
  {
    level: "3D",
    title: "Linear Reality",
    subtitle: "Duality & Time",
    icon: <BoxIcon className="w-6 h-6 text-blue-500" />,
    color: "from-blue-950 to-stone-900",
    ringColor: "border-blue-500/30",
    stage: "To Me",
    description: "The realm of space and time. Where duality (good/bad, past/future) exists. This is where the 'To Me' consciousness operates—often marked by survival, victimhood, and linear constraint.",
    practice: "Observing triggers, shadow work, taking radical responsibility for one's physical actions."
  },
  {
    level: "4D",
    title: "The Astral Plane",
    subtitle: "Archetypes & Collective Mind",
    icon: <Network className="w-6 h-6 text-indigo-500" />,
    color: "from-indigo-950 to-stone-900",
    ringColor: "border-indigo-500/30",
    stage: "By Me",
    description: "The domain of thoughts, beliefs, and archetypes. The bridge between the physical and spiritual. Here, manifestation begins ('By Me'). It is the realm of dreams, the collective unconscious, and mental constructs.",
    practice: "Intentional manifestation, lucid dreaming, rewriting limiting beliefs."
  },
  {
    level: "5D",
    title: "Unity Consciousness",
    subtitle: "The Heart & Synchronicity",
    icon: <Heart className="w-6 h-6 text-rose-500" />,
    color: "from-rose-950 to-stone-900",
    ringColor: "border-rose-500/30",
    stage: "Through Me",
    description: "The frequency of unconditional love and unity. Where linear time collapses into the 'Eternal Now'. Operating at 'Through Me', where life happens automatically through divine flow and deep synchronicity.",
    practice: "Heart-coherence meditations, practicing deep forgiveness and compassion."
  },
  {
    level: "6D",
    title: "Sacred Geometry",
    subtitle: "Morphic Fields & Blueprints",
    icon: <Layers className="w-6 h-6 text-amber-500" />,
    color: "from-amber-950 to-stone-900",
    ringColor: "border-amber-500/30",
    stage: "Design",
    description: "The architectural blueprints of creation. Platonic solids and light languages. It is the geometric matrix that structures light and sound into matter before it descends into lower dimensions.",
    practice: "Studying sacred geometry, visualizing light grids, working with platonic solids."
  },
  {
    level: "7D",
    title: "Galactic Sound",
    subtitle: "Spheres of Light",
    icon: <Zap className="w-6 h-6 text-cyan-400" />,
    color: "from-cyan-950 to-stone-900",
    ringColor: "border-cyan-400/30",
    stage: "Transmission",
    description: "The realm of cosmic sound and angelic frequencies. Pure light transmission and celestial intelligence. The vibrational origin of creation.",
    practice: "Sound healing, toning, tuning into celestial music and frequencies."
  },
  {
    level: "8D",
    title: "The Divine Mind",
    subtitle: "The Void & Infinite Potential",
    icon: <Eye className="w-6 h-6 text-purple-500" />,
    color: "from-purple-950 to-stone-900",
    ringColor: "border-purple-500/30",
    stage: "Observation",
    description: "The infinite void out of which all creation springs. Pure awareness before manifestation. The quantum field of all possibilities where intention is born.",
    practice: "Deep void meditation, resting in the 'I AM' presence."
  },
  {
    level: "9D",
    title: "Source / Absolute",
    subtitle: "Pure Unity",
    icon: <InfinityIcon className="w-6 h-6 text-white" />,
    color: "from-slate-900 to-black",
    ringColor: "border-white/40",
    stage: "As Me",
    description: "The Galactic Center. The absolute singularity where everything is ONE. Total integration of all layers. Operating from 'As Me'—knowing that there is no separation between creator and created.",
    practice: "Embodying complete surrender and realization of non-duality."
  }
];

function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
    )
}

function DimensionalGeometry({ activeIndex }: { activeIndex: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();
        
        // Dynamic rotation based on dimension
        groupRef.current.rotation.x = Math.sin(time / 3) * (0.1 * activeIndex);
        groupRef.current.rotation.y += 0.005 + (activeIndex * 0.002);

        // Interpolate material properties
        if (materialRef.current) {
            const targetRoughness = Math.max(0.1, 1 - (activeIndex * 0.1));
            const targetMetalness = Math.min(1, activeIndex * 0.1);
            
            materialRef.current.roughness = THREE.MathUtils.lerp(materialRef.current.roughness, targetRoughness, 0.05);
            materialRef.current.metalness = THREE.MathUtils.lerp(materialRef.current.metalness, targetMetalness, 0.05);
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                {activeIndex === 0 && (
                    <Sphere args={[1.5, 64, 64]}>
                        <meshPhysicalMaterial ref={materialRef} color="#57534e" roughness={0.9} metalness={0.1} />
                    </Sphere>
                )}
                {activeIndex === 1 && (
                    <Torus args={[1.2, 0.4, 32, 64]}>
                        <MeshDistortMaterial ref={materialRef} color="#059669" distort={0.4} speed={2} roughness={0.6} metalness={0.2} />
                    </Torus>
                )}
                {activeIndex === 2 && (
                    <Box args={[1.8, 1.8, 1.8]}>
                        <meshPhysicalMaterial ref={materialRef} color="#3b82f6" roughness={0.2} metalness={0.5} wireframe={false} transmission={0.5} thickness={1} />
                    </Box>
                )}
                {activeIndex === 3 && (
                    <Icosahedron args={[1.8, 1]}>
                        <meshPhysicalMaterial ref={materialRef} color="#6366f1" wireframe={true} roughness={0.1} metalness={0.8} emissive="#3730a3" emissiveIntensity={0.5} />
                    </Icosahedron>
                )}
                {activeIndex === 4 && (
                    <Torus args={[1.5, 0.6, 64, 128]}>
                        <meshPhysicalMaterial ref={materialRef} color="#f43f5e" transmission={0.9} thickness={2} roughness={0} metalness={0.1} ior={1.5} />
                    </Torus>
                )}
                {activeIndex === 5 && (
                    <group>
                        <Dodecahedron args={[1.4]}>
                            <meshPhysicalMaterial ref={materialRef} color="#f59e0b" wireframe thickness={2} roughness={0.2} metalness={0.8} />
                        </Dodecahedron>
                        <Octahedron args={[1]}>
                            <meshPhysicalMaterial color="#fcd34d" transmission={0.8} thickness={1} roughness={0} />
                        </Octahedron>
                    </group>
                )}
                {activeIndex === 6 && (
                    <group>
                        {[0, 1, 2].map((i) => (
                            <Ring key={i} args={[1 + i * 0.3, 1.05 + i * 0.3, 64]} rotation-x={Math.PI / 2} rotation-y={i * Math.PI / 4}>
                                <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} transparent opacity={0.6 - (i * 0.1)} />
                            </Ring>
                        ))}
                    </group>
                )}
                {activeIndex === 7 && (
                    <Sphere args={[2, 64, 64]}>
                        <meshPhysicalMaterial ref={materialRef} color="#a855f7" transmission={1} thickness={5} roughness={0.1} metalness={0.1} ior={1.1} emissive="#7e22ce" emissiveIntensity={0.2} />
                    </Sphere>
                )}
                {activeIndex === 8 && (
                    <Sphere args={[1.5, 64, 64]}>
                        <meshBasicMaterial color="#ffffff" />
                        <pointLight color="#ffffff" intensity={5} distance={10} />
                    </Sphere>
                )}
            </Float>
        </group>
    );
}

const DimensionCard = ({ dim, index, onInView }: { dim: any, index: number, onInView: (idx: number) => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0 1", "1 1"]
    });
    
    // Parallax or opacity effects
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onInView(index);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [index, onInView]);

    return (
        <motion.div 
            ref={ref}
            style={{ scale, opacity }}
            className={`min-h-[80vh] snap-center flex flex-col justify-center relative my-12 md:pl-[40vw]`}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-900/40 to-transparent -z-10 pointer-events-none" />
            <div className={`absolute -right-20 -top-20 w-[500px] h-[500px] bg-gradient-to-br ${dim.color} opacity-10 rounded-full blur-[120px] pointer-events-none`} />
            
            <div className="bg-stone-900/60 border border-white/5 p-8 md:p-12 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-700 hover:bg-stone-900/80">
                <div className="flex flex-col gap-8 items-start relative z-10">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center bg-black/50 ${dim.ringColor}`}>
                                {React.cloneElement(dim.icon, { className: "w-8 h-8 text-white" })}
                            </div>
                            <div>
                                <h1 className="text-5xl md:text-7xl font-light text-white flex items-center gap-4">
                                    <span className="font-mono font-bold text-stone-500 drop-shadow-md">{dim.level}</span>
                                </h1>
                            </div>
                        </div>
                        <h2 className="text-3xl font-light text-white mb-2">{dim.title}</h2>
                        <h3 className="text-xl text-stone-400 font-serif italic mb-6">{dim.subtitle}</h3>
                        
                        <div className="inline-block p-3 bg-black/40 border border-white/10 rounded-xl mb-6 shadow-inner">
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-1">State of Awareness</span>
                            <span className="text-lg text-amber-400 font-mono tracking-tight">{dim.stage}</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-6 w-full">
                        <div className="bg-black/30 border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-colors">
                            <h4 className="text-sm font-mono text-stone-400 mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" /> Defining the Reality
                            </h4>
                            <p className="text-lg text-stone-200 leading-relaxed font-light">
                                {dim.description}
                            </p>
                        </div>

                        <div className="bg-black/30 border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-colors">
                            <h4 className="text-sm font-mono text-stone-400 mb-3 flex items-center gap-2">
                                <Orbit className="w-4 h-4 text-purple-400" /> Dimensional Integration Practice
                            </h4>
                            <p className="text-stone-300 leading-relaxed">
                                {dim.practice}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Perspective Timeline */}
                <div className="mt-12 pt-8 border-t border-white/10 relative z-10 w-full overflow-x-auto custom-scrollbar">
                    <div className="grid grid-cols-4 gap-2 md:gap-4 text-center min-w-[400px]">
                        {['TO ME', 'BY ME', 'THROUGH ME', 'AS ME'].map((perspective, pIdx) => {
                            let isActive = false;
                            if (pIdx === 0 && index < 3) isActive = true; // 1D, 2D, 3D
                            if (pIdx === 1 && index === 3) isActive = true; // 4D
                            if (pIdx === 2 && index >= 4 && index <= 6) isActive = true; // 5D, 6D, 7D
                            if (pIdx === 3 && index >= 7) isActive = true; // 8D, 9D

                            return (
                                <div key={perspective} className={`p-3 rounded-xl transition-all duration-500 ${isActive ? 'bg-white/10 border border-white/30 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-black/20 border border-white/5 opacity-40'}`}>
                                    <div className={`font-bold text-xs md:text-sm mb-1 ${isActive ? 'text-white' : 'text-stone-400'}`}>{perspective}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const NineDimensionsSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="h-[85vh] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-none scroll-smooth bg-stone-950 rounded-3xl relative">
            
            {/* Sticky 3D Background */}
            <div className="md:w-[40vw] w-full h-[30vh] md:h-[85vh] absolute md:fixed top-0 left-0 pointer-events-none z-0">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            <pointLight position={[-10, -10, -10]} intensity={0.5} />
                            <Stars radius={50} depth={50} count={activeIndex * 1000 + 500} factor={4} saturation={0} fade speed={1} />
                            <DimensionalGeometry activeIndex={activeIndex} />
                            <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
                        </Canvas>
                    </motion.div>
                </AnimatePresence>
                {/* Visual fading gradient to blend with content on mobile */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950 to-transparent block md:hidden" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-stone-950 to-transparent hidden md:block" />
            </div>

            <div className="relative pt-[30vh] md:pt-0">
                {/* Header Hero Section */}
                <div className="min-h-[80vh] flex flex-col items-center justify-center snap-center text-center px-4 relative z-10 md:pl-[40vw]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <Layers className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-80" />
                        <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight mb-6 drop-shadow-lg">The 9 Dimensions</h1>
                        <p className="text-xl text-stone-400 max-w-2xl mx-auto font-light mb-12">
                            A cosmic curriculum of ascending consciousness. From the dense gravity of survival to the absolute singularity of Source.
                        </p>
                    </motion.div>

                    <motion.div 
                        animate={{ y: [0, 10, 0] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-stone-500 mt-12 cursor-pointer z-20 pointer-events-auto"
                        onClick={() => {
                            const firstCard = document.getElementById('dim-0');
                            firstCard?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        <ArrowDown className="w-8 h-8 mx-auto hover:text-amber-500 transition-colors" />
                        <span className="text-xs uppercase tracking-widest mt-2 block">Scroll to Ascend</span>
                    </motion.div>
                </div>
                
                {/* Scrollable Dimensions List */}
                <div className="max-w-7xl mx-auto px-4 pb-32 relative z-10">
                    <div className="absolute left-[40vw] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -z-20 hidden md:block" />
                    {DIMENSIONS.map((dim, idx) => (
                        <div key={dim.level} id={`dim-${idx}`}>
                            <DimensionCard 
                                dim={dim} 
                                index={idx} 
                                onInView={setActiveIndex} 
                            />
                        </div>
                    ))}
                    
                    {/* Integration Final Section */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="min-h-[60vh] snap-center flex flex-col items-center justify-center relative mt-32 text-center md:pl-[40vw]"
                    >
                        <InfinityIcon className="w-16 h-16 text-white mb-6" />
                        <h2 className="text-4xl text-white font-light mb-4">You Are the Multidimensional Self</h2>
                        <p className="text-lg text-stone-400 max-w-xl mx-auto font-light mb-8">
                            The mastery of conscious creation is not abandoning the lower dimensions to live only in the higher ones. Real mastery is holding all 9 dimensions simultaneously—embodying spirit within matter.
                        </p>
                        <div className="px-6 py-3 bg-white/10 border border-white/20 rounded-full font-mono text-sm text-white shadow-lg backdrop-blur-md">
                            From 3D Reality to 5D Awareness and Beyond.
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
