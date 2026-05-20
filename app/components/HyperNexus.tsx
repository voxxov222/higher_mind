import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Center, Html, PerspectiveCamera, OrbitControls, Line, Sphere, Points, PointMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Box, Hexagon, Network, Sparkles, Zap, ChevronRight, ChevronLeft, Layers, Activity } from 'lucide-react';
import { CosmicData } from '../types';

// --------------------------------------------------------------------------------
// ROOT SYSTEM GENERATION (E8 Lattice Projection)
// --------------------------------------------------------------------------------

const generateE8Roots = () => {
    const roots: number[][] = [];
    
    // 1. (±1, ±1, 0, 0, 0, 0, 0, 0) and permutations
    for (let i = 0; i < 8; i++) {
        for (let j = i + 1; j < 8; j++) {
            for (const s1 of [-1, 1]) {
                for (const s2 of [-1, 1]) {
                    const root = new Array(8).fill(0);
                    root[i] = s1;
                    root[j] = s2;
                    roots.push(root);
                }
            }
        }
    }
    
    // 2. (±1/2, ±1/2, ..., ±1/2) with an even number of minus signs
    for (let i = 0; i < 256; i++) {
        const root = [];
        let minusCount = 0;
        for (let j = 0; j < 8; j++) {
            const sign = (i >> j) & 1;
            if (sign === 1) minusCount++;
            root.push(sign === 1 ? -0.5 : 0.5);
        }
        if (minusCount % 2 === 0) {
            roots.push(root);
        }
    }
    
    return roots;
};

// Project 8D to 3D using a simple orthogonal projection or a specific matrix
const project8Dto3D = (v8: number[], time: number) => {
    // We'll use a dynamic projection matrix that rotates in hyper-space
    const s = Math.sin(time * 0.2);
    const c = Math.cos(time * 0.2);
    
    // Just a few planes of rotation for visual interest
    const x = v8[0] * c - v8[7] * s;
    const y = v8[1] * c - v8[6] * s;
    const z = v8[2] * c - v8[5] * s;
    const w = v8[3] * c - v8[4] * s; // 4th dim can affect scale or color
    
    return new THREE.Vector3(x * 3, y * 3, z * 3).multiplyScalar(1 + w * 0.2);
};

// --------------------------------------------------------------------------------
// COMPONENTS
// --------------------------------------------------------------------------------

const E8Lattice = ({ time, data, showLifePath }: { time: number, data?: CosmicData, showLifePath?: boolean }) => {
    const roots = useMemo(() => generateE8Roots(), []);
    const points = useMemo(() => {
        return roots.map(r => project8Dto3D(r, time));
    }, [roots, time]);

    const lifePathPoints = useMemo(() => {
        if (!showLifePath || !data) return [];
        // Map the user's life path sequence through the roots
        const lp = data.numerology?.lifePath || 1;
        const sequence = [lp, (lp * 2) % 240, (lp * 3) % 240, (lp * 5) % 240, (lp * 8) % 240];
        return sequence.map(idx => project8Dto3D(roots[idx % roots.length], time));
    }, [roots, data, time, showLifePath]);

    const lifePath = data?.numerology?.lifePath || 1;
    const color = data?.kabbalah?.sephirah === 'Kether' ? '#fff' : '#a855f7';

    return (
        <group>
            {/* Vertices */}
            <Points positions={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}>
                <PointMaterial 
                    transparent 
                    color={color} 
                    size={0.15} 
                    sizeAttenuation 
                    depthWrite={false} 
                    blending={THREE.AdditiveBlending}
                />
            </Points>
            
            {/* Life Path Visualization */}
            {showLifePath && lifePathPoints.length > 1 && (
                <Line 
                    points={lifePathPoints}
                    color="#facc15"
                    lineWidth={3}
                    transparent
                    opacity={0.8}
                />
            )}

            {/* Connections - Only connect close roots for performance and aesthetics */}
            {roots.slice(0, 120).map((r1, i) => {
                const r2 = roots[i + 1];
                if (!r2) return null;
                const p1 = project8Dto3D(r1, time);
                const p2 = project8Dto3D(r2, time);
                return (
                    <Line 
                        key={i}
                        points={[p1, p2]}
                        color={color}
                        lineWidth={0.5}
                        transparent
                        opacity={0.1}
                    />
                );
            })}
        </group>
    );
};

const Tesseract = ({ time }: { time: number }) => {
    const vertices = useMemo(() => {
        const v = [];
        for (let i = 0; i < 16; i++) {
            v.push([
                (i & 1) ? 1 : -1,
                (i & 2) ? 1 : -1,
                (i & 4) ? 1 : -1,
                (i & 8) ? 1 : -1
            ]);
        }
        return v;
    }, []);

    const projected = vertices.map(v => {
        const s = Math.sin(time);
        const c = Math.cos(time);
        // Rotate in XW plane
        const x = v[0] * c - v[3] * s;
        const w = v[0] * s + v[3] * c;
        // Perspective projection from 4D to 3D
        const factor = 1 / (3 - w);
        return new THREE.Vector3(x * factor * 4, v[1] * factor * 4, v[2] * factor * 4);
    });

    const edges = [
        [0,1],[1,3],[3,2],[2,0],
        [4,5],[5,7],[7,6],[6,4],
        [0,4],[1,5],[3,7],[2,6],
        [8,9],[9,11],[11,10],[10,8],
        [12,13],[13,15],[15,14],[14,12],
        [8,12],[9,13],[11,15],[10,14],
        [0,8],[1,9],[3,11],[2,10],
        [4,12],[5,13],[7,15],[6,14]
    ];

    return (
        <group>
            {projected.map((p, i) => (
                <Sphere key={i} position={p} args={[0.08, 16, 16]}>
                    <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} />
                </Sphere>
            ))}
            {edges.map((e, i) => (
                <Line 
                    key={i} 
                    points={[projected[e[0]], projected[e[1]]]} 
                    color="#60a5fa" 
                    lineWidth={1.5} 
                    transparent 
                    opacity={0.6} 
                />
            ))}
        </group>
    );
};

const DimensionalObject = ({ dim, time, data, showLifePath }: { dim: number, time: number, data?: CosmicData, showLifePath?: boolean }) => {
    switch (dim) {
        case 0: return <Sphere args={[0.2, 32, 32]}><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></Sphere>;
        case 1: return <Line points={[new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0)]} color="#fff" lineWidth={3} />;
        case 2: return (
            <mesh rotation={[time, time, 0]}>
                <planeGeometry args={[3, 3]} />
                <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.5} transparent opacity={0.4} side={THREE.DoubleSide} wireframe />
            </mesh>
        );
        case 3: return (
            <mesh rotation={[time, time * 0.5, 0]}>
                <boxGeometry args={[2.5, 2.5, 2.5]} />
                <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.5} transparent opacity={0.3} wireframe />
            </mesh>
        );
        case 4: return <Tesseract time={time} />;
        case 8: return <E8Lattice time={time} data={data} showLifePath={showLifePath} />;
        default: return null;
    }
};

const HyperNexusScene = ({ activeDim, data, showLifePath }: { activeDim: number, data?: CosmicData, showLifePath?: boolean }) => {
    const [time, setTime] = useState(0);
    
    useFrame((state, delta) => {
        setTime(prev => prev + delta * 0.5);
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <OrbitControls enableZoom={false} makeDefault />
            <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#fff" />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <DimensionalObject dim={activeDim} time={time} data={data} showLifePath={showLifePath} />
            </Float>

            <EffectComposer disableNormalPass>
                <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
                <Noise opacity={0.05} />
                <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
            </EffectComposer>
        </>
    );
};

// --------------------------------------------------------------------------------
// MAIN COMPONENT EXPORT
// --------------------------------------------------------------------------------

export const HyperNexus = ({ data }: { data?: CosmicData }) => {
    const [activeDim, setActiveDim] = useState(4);
    const [isClimbing, setIsClimbing] = useState(false);
    const [showLifePath, setShowLifePath] = useState(false);
    
    const dimensions = [0, 1, 2, 3, 4, 8];
    const dimLabels: Record<number, string> = {
        0: 'Point (Singularity)',
        1: 'Line (Vector)',
        2: 'Plane (Surface)',
        3: 'Volume (Core)',
        4: 'Tesseract (Hypercube)',
        8: 'E8 Lattice (Crystal of Reality)'
    };

    const climbLadder = () => {
        setIsClimbing(true);
        let current = 0;
        const interval = setInterval(() => {
            setActiveDim(dimensions[current]);
            current++;
            if (current >= dimensions.length) {
                clearInterval(interval);
                setIsClimbing(false);
            }
        }, 1500);
    };

    return (
        <div className="relative w-full h-full bg-[#050510] rounded-3xl overflow-hidden border border-white/5 group shadow-2xl">
            {/* 3D Canvas */}
            <div className="absolute inset-0">
                <Canvas gl={{ alpha: true }}>
                    <HyperNexusScene activeDim={activeDim} data={data} showLifePath={showLifePath} />
                </Canvas>
            </div>

            {/* HUD Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 z-10 pointer-events-none">
                 <div className="flex items-end justify-between">
                    <div className="space-y-2 pointer-events-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 backdrop-blur-md">
                                <Sparkles className="text-purple-400 w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase tracking-[0.2em] text-lg">HyperNexus</h3>
                                <p className="text-purple-300/60 text-[10px] font-mono uppercase tracking-widest leading-none">Dimensional Singularity Interface</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-1 mt-4">
                            {dimensions.map(d => (
                                <button 
                                    key={d}
                                    onClick={() => setActiveDim(d)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                                        activeDim === d 
                                        ? 'bg-purple-500/40 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                                        : 'bg-black/40 border-white/10 text-stone-500 hover:border-white/30'
                                    }`}
                                >
                                    <span className="font-mono text-sm">{d}D</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-right pointer-events-auto">
                        <div className="mb-4">
                            <span className="text-[10px] text-stone-500 uppercase font-black block tracking-widest">Active Vibration</span>
                            <span className="text-2xl text-white font-light tracking-tighter uppercase">{dimLabels[activeDim]}</span>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                            <button 
                                onClick={climbLadder}
                                disabled={isClimbing}
                                className={`px-6 py-3 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${isClimbing ? 'animate-pulse' : ''}`}
                            >
                                <Zap className="w-4 h-4 fill-black" />
                                {isClimbing ? 'Resonating...' : 'Climb Ladder'}
                            </button>

                            {activeDim === 8 && (
                                <button 
                                    onClick={() => setShowLifePath(!showLifePath)}
                                    className={`px-6 py-3 rounded-2xl border font-black uppercase text-xs tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ${showLifePath ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/20' : 'bg-black/40 border-white/10 text-white hover:border-white/30'}`}
                                >
                                    <Activity className="w-4 h-4" />
                                    {showLifePath ? 'Life Path Active' : 'Watch Life Path'}
                                </button>
                            )}
                        </div>
                    </div>
                 </div>
            </div>

            {/* Sidebar Stats */}
            <div className="absolute top-8 left-8 space-y-6 z-10 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl w-48 pointer-events-auto hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Lattice Stats</span>
                    </div>
                    <div className="space-y-3">
                        <div>
                             <span className="block text-[9px] text-stone-500 uppercase tracking-widest">Projection Coherence</span>
                             <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                <motion.div 
                                    className="h-full bg-emerald-400" 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${(data?.numerology?.lifePath || 5) * 10}%` }}
                                />
                             </div>
                        </div>
                        <div>
                             <span className="block text-[9px] text-stone-500 uppercase tracking-widest">Root Symmetry</span>
                             <span className="text-sm font-mono text-white">240-FOLD</span>
                        </div>
                        <div>
                             <span className="block text-[9px] text-stone-500 uppercase tracking-widest">Soul Resonance</span>
                             <span className="text-sm font-mono text-purple-400">{(data?.numerology?.lifePath || 1) * 333} Hz</span>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <p className="text-[10px] text-stone-500 leading-relaxed max-w-[200px] border-l border-white/10 pl-4">
                        Dimensional states are determined by your <span className="text-white">Life Path {data?.numerology?.lifePath}</span> and the kabbalistic weight of your signature.
                    </p>
                </div>
            </div>

            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
    );
};
