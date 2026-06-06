import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Hexagon, Box, Info } from 'lucide-react';

// --- Flower of Life (2D Flat) ---
const FlowerOfLife2D = ({ radius = 1, rings = 3, opacity = 0.5, color = "#a855f7" }) => {
    const circles = useMemo(() => {
        const centers: THREE.Vector3[] = [];
        // Center circle
        centers.push(new THREE.Vector3(0, 0, 0));
        
        const r = radius;
        for (let ring = 1; ring <= rings; ring++) {
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const pos = new THREE.Vector3(
                    Math.cos(angle) * r * ring,
                    Math.sin(angle) * r * ring,
                    0
                );
                centers.push(pos);
                // Fill intermediate points for outer rings
                for (let j = 1; j < ring; j++) {
                    const nextAngle = ((i + 1) % 6 * Math.PI) / 3;
                    const nextPos = new THREE.Vector3(
                        Math.cos(nextAngle) * r * ring,
                        Math.sin(nextAngle) * r * ring,
                        0
                    );
                    centers.push(new THREE.Vector3().lerpVectors(pos, nextPos, j / ring));
                }
            }
        }
        return centers;
    }, [radius, rings]);

    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh position={[0, 0, -0.1]} rotation={[0, 0, 0]}>
                <planeGeometry args={[15, 15]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.4} />
            </mesh>
            {circles.map((center, i) => (
                <Line 
                    key={i}
                    points={new THREE.EllipseCurve(center.x, center.y, radius, radius, 0, 2 * Math.PI).getPoints(64).map(p => new THREE.Vector3(p.x, p.y, 0))}
                    color={color}
                    transparent
                    opacity={opacity}
                    lineWidth={1}
                />
            ))}
        </group>
    );
};

// --- 64 Tetrahedron Grid ---
const Tetrahedron64 = ({ animate = true }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame(({ clock }) => {
        if (animate && groupRef.current) {
            groupRef.current.rotation.y = clock.elapsedTime * 0.1;
            groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.05) * 0.2;
        }
    });

    // Create a stylized 64 tetrahedron grid (Isotropic Vector Matrix)
    // For performance and visual clarity in WebGL, we'll represent it using a node-and-strut model based on FCC lattice.
    const nodes = useMemo(() => {
        const pts: THREE.Vector3[] = [];
        const size = 2; // shell size
        for (let x = -size; x <= size; x++) {
            for (let y = -size; y <= size; y++) {
                for (let z = -size; z <= size; z++) {
                    if ((x + y + z) % 2 === 0 && (Math.abs(x) + Math.abs(y) + Math.abs(z) <= size * 2)) {
                         pts.push(new THREE.Vector3(x, y, z));
                    }
                }
            }
        }
        return pts;
    }, []);

    const lines = useMemo(() => {
        const l: [THREE.Vector3, THREE.Vector3][] = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = nodes[i].distanceTo(nodes[j]);
                // Close neighbors form the tetrahedrons/octahedrons
                if (dist > 1.3 && dist < 1.5) {
                    l.push([nodes[i], nodes[j]]);
                }
            }
        }
        return l;
    }, [nodes]);

    return (
        <group ref={groupRef} scale={[1.2, 1.2, 1.2]}>
            {/* The 2D Shadow Projection Plane */}
            <FlowerOfLife2D radius={0.8} rings={2} color="#4ade80" opacity={0.2} />
            
            <group position={[0, 4, 0]}>
                {lines.map((line, i) => (
                    <Line key={`l-${i}`} points={line} color="#fbbf24" transparent opacity={0.4} lineWidth={1} />
                ))}
                {nodes.map((node, i) => (
                    <Sphere key={`n-${i}`} args={[0.08, 8, 8]} position={node}>
                        <meshBasicMaterial color="#fcd34d" transparent opacity={0.8} />
                    </Sphere>
                ))}
                
                {/* Simulated Light Source Casting the Shadow */}
                <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
                <mesh position={[0, 8, 0]}>
                    <coneGeometry args={[4, 16, 32]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.02} blending={THREE.AdditiveBlending} depthWrite={false} rotation={[Math.PI, 0, 0]} />
                </mesh>
            </group>
        </group>
    );
};

// --- E8 Lattice / Quasi-Crystal Projection ---
const E8Lattice = ({ animate = true }) => {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.LineBasicMaterial>(null);

    // Generate a beautiful, complex quasi-crystalline structure
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    const vertices = useMemo(() => {
        const verts: THREE.Vector3[] = [];
        // Vertices of an icosidodecahedron and rhombic triacontahedron scaled
        const t = goldenRatio;
        const pts = [
            [0, 1, t], [0, -1, t], [0, 1, -t], [0, -1, -t],
            [1, t, 0], [-1, t, 0], [1, -t, 0], [-1, -t, 0],
            [t, 0, 1], [-t, 0, 1], [t, 0, -1], [-t, 0, -1]
        ];
        
        // Multiply layers
        [1, 1.618, 2.618].forEach(scale => {
             pts.forEach(p => {
                 verts.push(new THREE.Vector3(p[0] * scale, p[1] * scale, p[2] * scale));
             });
             // Add cubic vertices for deeper complexity
             [-1, 1].forEach(x => [-1, 1].forEach(y => [-1, 1].forEach(z => {
                  verts.push(new THREE.Vector3(x * scale, y * scale, z * scale));
             })));
        });
        return verts;
    }, [goldenRatio]);

    const edges = useMemo(() => {
        const l: [THREE.Vector3, THREE.Vector3][] = [];
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const dist = vertices[i].distanceTo(vertices[j]);
                // Connect specific resonant distances for 8D projection look
                if ((dist > 1.9 && dist < 2.1) || (dist > 3.1 && dist < 3.3)) {
                    l.push([vertices[i], vertices[j]]);
                }
            }
        }
        return l;
    }, [vertices]);

    useFrame(({ clock }) => {
        if (animate && groupRef.current) {
            groupRef.current.rotation.y = clock.elapsedTime * 0.15;
            groupRef.current.rotation.z = clock.elapsedTime * 0.08;
            groupRef.current.rotation.x = clock.elapsedTime * 0.05;
            
            if (materialRef.current) {
                // Color pulse
                const hue = (clock.elapsedTime * 0.1) % 1;
                materialRef.current.color.setHSL(hue, 0.8, 0.6);
            }
        }
    });

    return (
        <group scale={[0.8, 0.8, 0.8]}>
            {/* E8 Lattice Petrie Polygon Projection style */}
            <group ref={groupRef}>
                {edges.map((line, i) => (
                    <Line key={`e-${i}`} points={line} transparent opacity={0.25} lineWidth={1.5}>
                        <lineBasicMaterial ref={i === 0 ? materialRef : null} color="#06b6d4" />
                    </Line>
                ))}
                {vertices.map((v, i) => (
                    <mesh key={`v-${i}`} position={v}>
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

export const FlowerOfLifeSection = () => {
    const [view, setView] = useState<'flat'|'tetra64'|'e8'>('flat');
    const [isAnimating, setIsAnimating] = useState(true);

    return (
        <div className="h-[650px] w-full bg-black/95 rounded-3xl overflow-hidden border border-white/5 relative flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="md:w-80 bg-black/80 border-r border-white/10 flex flex-col p-5 z-10 shrink-0">
                <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-6 opacity-70 flex items-center gap-2">
                    <Hexagon className="w-4 h-4" /> Sacred Geometry Matrix
                </h3>
                
                <div className="flex flex-col gap-3">
                    <button onClick={() => setView('flat')} className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${view === 'flat' ? 'bg-purple-900/30 border-purple-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <Hexagon className={`w-6 h-6 shrink-0 ${view === 'flat' ? 'text-purple-400' : 'text-stone-500'}`} />
                        <div>
                            <div className={`font-mono text-[11px] uppercase font-bold ${view === 'flat' ? 'text-purple-300' : 'text-stone-400'}`}>The Flower of Life (2D)</div>
                            <div className="text-[10px] text-stone-500 mt-1 leading-tight">The pattern of creation printed on a flat surface.</div>
                        </div>
                    </button>
                    
                    <button onClick={() => setView('tetra64')} className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${view === 'tetra64' ? 'bg-amber-900/30 border-amber-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <Box className={`w-6 h-6 shrink-0 ${view === 'tetra64' ? 'text-amber-400' : 'text-stone-500'}`} />
                        <div>
                            <div className={`font-mono text-[11px] uppercase font-bold ${view === 'tetra64' ? 'text-amber-300' : 'text-stone-400'}`}>64 Tetrahedron Substructure</div>
                            <div className="text-[10px] text-stone-500 mt-1 leading-tight">The 3D/4D isotropic vector matrix casting the 2D shadow.</div>
                        </div>
                    </button>
                    
                    <button onClick={() => setView('e8')} className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${view === 'e8' ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <Network className={`w-6 h-6 shrink-0 ${view === 'e8' ? 'text-cyan-400' : 'text-stone-500'}`} />
                        <div>
                            <div className={`font-mono text-[11px] uppercase font-bold ${view === 'e8' ? 'text-cyan-300' : 'text-stone-400'}`}>E8 Lattice Quasi-Crystal</div>
                            <div className="text-[10px] text-stone-500 mt-1 leading-tight">8-dimensional root lattice projection of the unified field.</div>
                        </div>
                    </button>
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/10">
                     <button 
                        onClick={() => setIsAnimating(!isAnimating)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-stone-300 uppercase font-mono text-[10px] rounded-lg tracking-widest border border-white/10 transition-all"
                     >
                         {isAnimating ? 'Pause Matrix Engine' : 'Resume Matrix Engine'}
                     </button>
                </div>
            </div>

            {/* Main Interactive Canvas Area */}
            <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black">
                {/* Overlay Information HUD */}
                <div className="absolute top-6 left-6 z-10 max-w-md pointer-events-auto">
                     <AnimatePresence mode="wait">
                          {view === 'flat' && (
                              <motion.div key="flat" initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}} className="backdrop-blur-md bg-black/70 border border-purple-500/40 p-6 rounded-2xl">
                                  <h4 className="text-purple-300 font-mono text-sm uppercase font-bold tracking-widest mb-3">The Blueprint Illusion</h4>
                                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                                      The Flower of Life is often perceived as a flat, 2-dimensional pattern of intersecting circles. While beautiful, this flat geometry is merely the blueprint—the shadow cast upon the material plane by a higher-dimensional structure.
                                  </p>
                              </motion.div>
                          )}
                          
                          {view === 'tetra64' && (
                              <motion.div key="tetra64" initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}} className="backdrop-blur-md bg-black/70 border border-amber-500/40 p-6 rounded-2xl">
                                  <h4 className="text-amber-300 font-mono text-sm uppercase font-bold tracking-widest mb-3">Isotropic Vector Matrix</h4>
                                  <p className="text-xs text-stone-300 font-light leading-relaxed mb-4">
                                      When you observe the Flower of Life properly, it reveals the 64 Tetrahedron Grid (the Isotropic Vector Matrix). This structure is perfectly balanced—every vector is exactly the same length, representing the infinite structural equilibrium of the vacuum.
                                  </p>
                                  <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-xl">
                                      <p className="text-[10px] text-amber-200 italic">"The 2D circles are the shadows of 3D spheres, which house the intersecting geometric matrices of the 4D field."</p>
                                  </div>
                              </motion.div>
                          )}
                          
                          {view === 'e8' && (
                              <motion.div key="e8" initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}} className="backdrop-blur-md bg-black/70 border border-cyan-500/40 p-6 rounded-2xl">
                                  <h4 className="text-cyan-300 font-mono text-sm uppercase font-bold tracking-widest mb-3">E8 Root System Projection</h4>
                                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                                      The underlying structure of reality operates as a quasi-crystal lattice. The E8 lattice, an 8-dimensional exceptionally simple Lie algebra, projects down into 3D and 4D configurations as golden-ratio-mediated quasicrystals, uniting spacetime geometry and quantum mechanics into a singular cohesive geometry.
                                  </p>
                              </motion.div>
                          )}
                     </AnimatePresence>
                </div>

                <Canvas camera={{ position: [0, view === 'tetra64' ? 6 : 0, view === 'tetra64' ? 12 : 8] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    
                    <AnimatePresence>
                        {view === 'flat' && (
                            <group rotation={[Math.PI / 2, 0, 0]}>
                                <FlowerOfLife2D radius={1} rings={3} opacity={0.8} />
                            </group>
                        )}
                        {view === 'tetra64' && <Tetrahedron64 animate={isAnimating} />}
                        {view === 'e8' && <E8Lattice animate={isAnimating} />}
                    </AnimatePresence>
                    
                    <OrbitControls enablePan={true} enableZoom={true} />
                </Canvas>
            </div>
        </div>
    );
};
