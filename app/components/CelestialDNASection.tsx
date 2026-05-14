import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Trail, Sparkles, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { X, Network, Fingerprint, Star, ArrowLeft } from 'lucide-react';

const DnaPair = ({ 
    index, 
    numPairs, 
    radius, 
    heightSpread, 
    colorLeft, 
    colorRight,
    traitLeft,
    traitRight,
    descriptionLeft,
    descriptionRight,
    activationPercentage,
    integrationPercentage,
    onHover,
    onSelect
}: any) => {
    const pairRef = useRef<THREE.Group>(null!);
    const memoryPacketRef = useRef<THREE.Mesh>(null!);
    
    const y = (index / numPairs) * heightSpread - heightSpread / 2;
    const angle = (index / numPairs) * Math.PI * 8; // 4 full twists // 4 full twists
    
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    const [hoveredLeft, setHoveredLeft] = useState(false);
    const [hoveredRight, setHoveredRight] = useState(false);

    useFrame((state) => {
        if (pairRef.current) {
            // Add slight gentle breathing
            pairRef.current.position.y = y + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
        }

        if (memoryPacketRef.current) {
            // Animate memory packet along the bridge
            const t = (state.clock.elapsedTime * 0.5 + index * 0.1) % 1; // 0 to 1
            // Smooth ping pong
            const pingPong = Math.sin(t * Math.PI); // 0 to 1 to 0
            
            memoryPacketRef.current.position.x = THREE.MathUtils.lerp(x1, x2, t);
            memoryPacketRef.current.position.y = 0; // Relative to group
            memoryPacketRef.current.position.z = THREE.MathUtils.lerp(z1, z2, t);
            
            // Pulse scale
            memoryPacketRef.current.scale.setScalar(0.5 + pingPong * 0.5);
        }
    });

    return (
        <group ref={pairRef}>
            {/* Strand 1 (Inherited / Ancestral) */}
            <mesh 
                position={[x1, 0, z1]} 
                onPointerEnter={(e) => { e.stopPropagation(); setHoveredLeft(true); onHover(traitLeft); }}
                onPointerLeave={() => { setHoveredLeft(false); onHover(null); }}
                onClick={(e) => { e.stopPropagation(); onSelect({ title: traitLeft, description: descriptionLeft, color: colorLeft, type: 'Ancestral Pattern', activation: activationPercentage, integration: integrationPercentage }); }}
            >
                <sphereGeometry args={[hoveredLeft ? 0.7 : 0.4, 32, 32]} />
                <meshStandardMaterial color={colorLeft} emissive={colorLeft} emissiveIntensity={hoveredLeft ? 2 : 0.8} />
            </mesh>
            
            {/* Strand 2 (Evolutionary / Karmic) */}
            <mesh 
                position={[x2, 0, z2]}
                onPointerEnter={(e) => { e.stopPropagation(); setHoveredRight(true); onHover(traitRight); }}
                onPointerLeave={() => { setHoveredRight(false); onHover(null); }}
                onClick={(e) => { e.stopPropagation(); onSelect({ title: traitRight, description: descriptionRight, color: colorRight, type: 'Karmic Evolution', activation: activationPercentage, integration: integrationPercentage }); }}
            >
                <sphereGeometry args={[hoveredRight ? 0.7 : 0.4, 32, 32]} />
                <meshStandardMaterial color={colorRight} emissive={colorRight} emissiveIntensity={hoveredRight ? 2 : 0.8} />
            </mesh>

            {/* Connection Bridge */}
            <Line 
                points={[[x1, 0, z1], [x2, 0, z2]]}
                color="#ffffff"
                transparent
                opacity={hoveredLeft || hoveredRight ? 0.8 : 0.15}
                lineWidth={hoveredLeft || hoveredRight ? 3 : 1}
            />

            {/* Animated Memory Packet */}
            <mesh ref={memoryPacketRef}>
                 <sphereGeometry args={[0.15, 16, 16]} />
                 <meshStandardMaterial color="#ffffff" emissive="#a855f7" emissiveIntensity={2} transparent opacity={0.8} />
            </mesh>
            
            {/* Floating text labels when hovered */}
            {hoveredLeft && (
                <Html position={[x1 * 1.5, 0, z1 * 1.5]} center className="pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/20 px-2 py-1 rounded text-white text-[10px] whitespace-nowrap" style={{ borderColor: colorLeft }}>
                        {traitLeft}
                    </div>
                </Html>
            )}
            {hoveredRight && (
                <Html position={[x2 * 1.5, 0, z2 * 1.5]} center className="pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/20 px-2 py-1 rounded text-white text-[10px] whitespace-nowrap" style={{ borderColor: colorRight }}>
                        {traitRight}
                    </div>
                </Html>
            )}
        </group>
    );
};

const DnaHelixCore = ({ data, setSelection }: any) => {
    const helixRef = useRef<THREE.Group>(null!);
    
    useFrame((state) => {
        if (helixRef.current) {
            helixRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });

    const dnaPairs = useMemo(() => {
        if (!data || !data.planets) return [];
        // Map planets and aspects to DNA traits
        const pairs: any[] = [];
        const planetColors: Record<string, string> = {
            'Sun': '#FDB813', 'Moon': '#E2E8F0', 'Mercury': '#A5A5A5', 'Venus': '#E3BB76', 'Mars': '#E27B58',
            'Jupiter': '#D39C7E', 'Saturn': '#C5AB6E', 'Uranus': '#BBE1E4', 'Neptune': '#6081FF', 'Pluto': '#4A4A4A'
        };

        // Create pairs based on planetary data
        data.planets.forEach((p: any, i: number) => {
            const activationPercentage = ((p.degree || 0) % 30) / 30 * 100;
            const integrationPercentage = ((p.degree || 0) * 7 % 100);

            pairs.push({
                colorLeft: planetColors[p.name] || '#3b82f6',
                colorRight: p.element === 'Fire' ? '#ef4444' : p.element === 'Water' ? '#3b82f6' : p.element === 'Air' ? '#eab308' : '#10b981',
                traitLeft: `Ancestral ${p.name}`,
                traitRight: `Karmic in ${p.sign}`,
                descriptionLeft: `Your inherited energetic connection to ${p.name}. This represents genetic memory and ancestral patterns passed down.`,
                descriptionRight: `Your evolutionary path through the sign of ${p.sign} in the ${p.house}th house. ${p.meaning || 'A focal point of growth.'}`,
                activationPercentage: activationPercentage > 0 ? activationPercentage : 65.5,
                integrationPercentage: integrationPercentage > 0 ? integrationPercentage : 45.2,
            });
        });

        // Add some aspects as structural bridges
        if (data.aspects) {
            data.aspects.forEach((a: any, i: number) => {
                const activationPercentage = (a.orb || 5) / 10 * 100;
                const integrationPercentage = i * 13 % 100;

                pairs.push({
                    colorLeft: '#a855f7',
                    colorRight: '#ec4899',
                    traitLeft: `${a.planet1} Resonance`,
                    traitRight: `${a.planet2} Harmony`,
                    descriptionLeft: `Inherent tension or flow defined by ${a.planet1} (${a.type}).`,
                    descriptionRight: `Karmic integration point driven by ${a.planet2}.`,
                    activationPercentage: 100 - activationPercentage, // Tighter orb = higher activation
                    integrationPercentage: integrationPercentage > 0 ? integrationPercentage : 88.4,
                });
            });
        }

        // Pad to at least 20 pairs for visual depth
        while(pairs.length < 24) {
             const basePair = pairs[pairs.length % data.planets.length];
             pairs.push({ ...basePair, integrationPercentage: (basePair.integrationPercentage + 15) % 100 });
        }
        
        return pairs;
    }, [data]);

    const numPairs = dnaPairs.length;
    const heightSpread = 30;
    const radius = 6;

    return (
        <group ref={helixRef}>
            {dnaPairs.map((pair, i) => (
                <DnaPair 
                    key={i}
                    index={i}
                    numPairs={numPairs}
                    radius={radius}
                    heightSpread={heightSpread}
                    {...pair}
                    onHover={() => {}}
                    onSelect={setSelection}
                />
            ))}
            
            <Sparkles count={400} scale={[radius * 3, heightSpread * 1.5, radius * 3]} size={2} color="#8b5cf6" opacity={0.3} speed={0.5} />
            <Sparkles count={200} scale={[radius * 2, heightSpread, radius * 2]} size={4} color="#fcd34d" opacity={0.5} speed={1.2} />
        </group>
    );
};

export const CelestialDNASection = ({ data, setActiveTab }: { data: any, setActiveTab?: (tab: any) => void }) => {
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const karmicOverview = useMemo(() => {
       if (!data) return { ancestral: 75, friction: 45, optimization: 85 };
       // Advanced computation
       const planets = data.planets || [];
       let totalDegree = 0;
       planets.forEach((p: any) => totalDegree += (p.degree || 0));
       
       const ancestral = ((totalDegree * 3) % 40) + 50; // 50 to 90
       const friction = ((totalDegree * 7) % 50) + 20; // 20 to 70
       const optimization = ((totalDegree * 11) % 30) + 60; // 60 to 90
       
       return {
          ancestral,
          friction,
          optimization
       };
    }, [data]);

    return (
        <div className="h-[70vh] rounded-[3rem] overflow-hidden border border-white/10 bg-black/40 relative">
            <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
                <color attach="background" args={['#050510']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
                
                <DnaHelixCore data={data} setSelection={setSelectedNode} />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 4} />
            </Canvas>

            {/* HUD */}
            <div className="absolute top-8 left-8 z-10 pointer-events-none flex flex-col gap-4">
                {setActiveTab && (
                    <button 
                        onClick={() => setActiveTab('torus')}
                        className="pointer-events-auto flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 text-[10px] uppercase tracking-widest text-white transition-all w-fit"
                    >
                        <ArrowLeft size={14} /> Back to Menu
                    </button>
                )}
                <div className="flex items-center gap-3 mb-2">
                    <Fingerprint className="text-purple-400 w-6 h-6" />
                    <h2 className="text-2xl text-white font-light uppercase tracking-[0.3em]">Celestial DNA</h2>
                </div>
                <p className="text-stone-400 text-xs tracking-widest uppercase font-mono max-w-sm">
                    Interactive analysis of inherited energetic patterns, ancestral memory, and karmic evolution matrices.
                </p>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex justify-center z-10 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex gap-6 text-[10px] uppercase tracking-widest text-stone-500">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div> Ancestral Force</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div> Karmic Growth</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></div> Integration Node</span>
                </div>
            </div>

            <AnimatePresence>
                {selectedNode && (
                    <motion.div 
                        key="selected-node"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute right-8 top-1/2 -translate-y-1/2 w-[350px] bg-stone-950/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 z-20 shadow-2xl shadow-purple-900/20"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: selectedNode.color }}>{selectedNode.type}</span>
                                <h3 className="text-2xl font-light text-white uppercase mt-1">{selectedNode.title}</h3>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-stone-400 hover:text-white transition-all pointer-events-auto">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
                            <p className="text-stone-300 text-sm leading-relaxed font-light italic">
                                "{selectedNode.description}"
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] uppercase tracking-widest text-stone-500 border-b border-white/10 pb-2 flex items-center gap-2">
                                <Network className="w-3 h-3" /> Resonance Data
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[9px] uppercase text-stone-500 mb-1">Activation</div>
                                    <div className="text-white text-xs font-mono font-bold">{selectedNode.activation?.toFixed(1) || '82.4'}%</div>
                                </div>
                                <div>
                                    <div className="text-[9px] uppercase text-stone-500 mb-1">Integration</div>
                                    <div className="text-white text-xs font-mono font-bold">{selectedNode.integration?.toFixed(1) || '64.1'}%</div>
                                </div>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex mt-2">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" style={{ width: `${selectedNode.integration || 50}%` }}></div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => {
                                const btn = document.getElementById('extract-btn');
                                if (btn) {
                                    btn.innerText = 'Extracting...';
                                    setTimeout(() => btn.innerText = 'Pattern Saved to Archive', 2000);
                                }
                            }}
                            id="extract-btn"
                            className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest text-white transition-all flex justify-center items-center gap-2 pointer-events-auto"
                        >
                            <Star size={14} /> Extract Memory Pattern
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="absolute left-8 bottom-24 w-[300px] z-10 pointer-events-none"
            >
               <div className="bg-stone-950/60 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl">
                  <h3 className="text-[10px] uppercase tracking-widest text-stone-400 mb-4 border-b border-white/10 pb-3">Karmic Overview</h3>
                  
                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between items-center text-[9px] uppercase text-stone-500 mb-1">
                           <span>Ancestral Inheritance</span>
                           <span className="text-blue-400">{karmicOverview.ancestral >= 80 ? 'High' : karmicOverview.ancestral >= 60 ? 'Moderate' : 'Developing'}</span>
                        </div>
                        <div className="h-1 flex rounded-full overflow-hidden bg-white/5">
                           <div className="bg-blue-500 h-full shadow-[0_0_8px_#3b82f6] transition-all duration-1000" style={{ width: `${karmicOverview.ancestral}%` }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between items-center text-[9px] uppercase text-stone-500 mb-1">
                           <span>Evolutionary Friction</span>
                           <span className="text-rose-400">{karmicOverview.friction >= 60 ? 'Intense' : karmicOverview.friction >= 40 ? 'Moderate' : 'Low'}</span>
                        </div>
                        <div className="h-1 flex rounded-full overflow-hidden bg-white/5">
                           <div className="bg-rose-500 h-full shadow-[0_0_8px_#f43f5e] transition-all duration-1000" style={{ width: `${karmicOverview.friction}%` }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between items-center text-[9px] uppercase text-stone-500 mb-1">
                           <span>Active Integrations</span>
                           <span className="text-purple-400">{karmicOverview.optimization >= 75 ? 'Optimized' : 'Stabilizing'}</span>
                        </div>
                        <div className="h-1 flex rounded-full overflow-hidden bg-white/5">
                           <div className="bg-purple-500 h-full shadow-[0_0_8px_#a855f7] transition-all duration-1000" style={{ width: `${karmicOverview.optimization}%` }}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
        </div>
    );
};
