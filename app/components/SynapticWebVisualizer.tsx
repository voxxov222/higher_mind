import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Brain, Network, Upload, FileText, Sparkles, Activity, File, Compass, Code, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SynapticNode {
    id: string;
    label: string;
    type: 'profile' | 'echo' | 'file' | 'note';
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    color: string;
}

interface SynapticLink {
    source: string;
    target: string;
    strength: number; // 0 to 1
    theme: string;
}

const COLORS = {
    profile: '#38bdf8', // cyan
    echo: '#d946ef',    // fuchsia
    file: '#10b981',    // emerald
    note: '#f59e0b',    // amber
};

const generateMockNodes = (userData: any): { nodes: SynapticNode[], links: SynapticLink[] } => {
    const nodes: SynapticNode[] = [];
    const links: SynapticLink[] = [];

    // Core Profile Nodes
    nodes.push({ id: 'core', label: userData?.name || 'User Core', type: 'profile', pos: new THREE.Vector3(0, 0, 0), vel: new THREE.Vector3(0,0,0), color: COLORS.profile });
    nodes.push({ id: 'sun', label: userData?.astrology?.sun ? `Sun: ${userData.astrology.sun.sign}` : 'Sun Sign', type: 'profile', pos: new THREE.Vector3(2, 2, 0), vel: new THREE.Vector3(), color: COLORS.profile });
    nodes.push({ id: 'moon', label: userData?.astrology?.moon ? `Moon: ${userData.astrology.moon.sign}` : 'Moon Sign', type: 'profile', pos: new THREE.Vector3(-2, 2, 0), vel: new THREE.Vector3(), color: COLORS.profile });

    // Mock Echoes
    nodes.push({ id: 'echo1', label: 'Lemurian Resonance', type: 'echo', pos: new THREE.Vector3(-3, -2, -2), vel: new THREE.Vector3(), color: COLORS.echo });
    nodes.push({ id: 'echo2', label: 'Atlantean Era', type: 'echo', pos: new THREE.Vector3(3, -2, -2), vel: new THREE.Vector3(), color: COLORS.echo });

    // Mock Uploaded Files
    nodes.push({ id: 'file1', label: 'Birth_Certificate.pdf', type: 'file', pos: new THREE.Vector3(0, 4, 2), vel: new THREE.Vector3(), color: COLORS.file });
    nodes.push({ id: 'file2', label: 'Dream_Journal.txt', type: 'file', pos: new THREE.Vector3(4, 0, 2), vel: new THREE.Vector3(), color: COLORS.file });
    nodes.push({ id: 'file3', label: 'Aura_Scan.png', type: 'file', pos: new THREE.Vector3(-4, 0, 2), vel: new THREE.Vector3(), color: COLORS.file });

    // Notes
    nodes.push({ id: 'note1', label: '11:11 Synchronicities', type: 'note', pos: new THREE.Vector3(0, -4, 0), vel: new THREE.Vector3(), color: COLORS.note });
    nodes.push({ id: 'note2', label: 'Gematria: LOVE', type: 'note', pos: new THREE.Vector3(0, -2, 4), vel: new THREE.Vector3(), color: COLORS.note });

    // Links (Source -> Target)
    const addLink = (source: string, target: string, strength: number, theme: string) => {
        links.push({ source, target, strength, theme });
    };

    addLink('core', 'sun', 0.9, 'Identity');
    addLink('core', 'moon', 0.9, 'Emotional Base');
    addLink('sun', 'echo2', 0.6, 'Solar Recall');
    addLink('moon', 'echo1', 0.7, 'Lunar Tides');
    addLink('core', 'file1', 0.8, 'Verification');
    addLink('echo1', 'file2', 0.5, 'Subconscious Link');
    addLink('note1', 'core', 0.6, 'Observation');
    addLink('note2', 'file3', 0.4, 'Frequency Match');
    addLink('file3', 'core', 0.7, 'Biometric');

    return { nodes, links };
};

const ForceDirectedGraph = ({ nodes, links, activeNode, setActiveNode }: { nodes: SynapticNode[], links: SynapticLink[], activeNode: string|null, setActiveNode: (id: string|null) => void }) => {
    const groupRef = useRef<THREE.Group>(null);
    const lineRefs = useRef<THREE.Line[]>([]);

    useFrame((state, delta) => {
        // Simple 3D Force-Directed Layout Simulation
        const repulsiveForce = 0.5;
        const springForce = 0.05;
        const damping = 0.9;
        
        // 1. Repulsion
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];
                const dx = n1.pos.x - n2.pos.x;
                const dy = n1.pos.y - n2.pos.y;
                const dz = n1.pos.z - n2.pos.z;
                const distSq = dx*dx + dy*dy + dz*dz || 0.1;
                const f = repulsiveForce / distSq;
                
                const vx = (dx / Math.sqrt(distSq)) * f;
                const vy = (dy / Math.sqrt(distSq)) * f;
                const vz = (dz / Math.sqrt(distSq)) * f;
                
                n1.vel.x += vx; n1.vel.y += vy; n1.vel.z += vz;
                n2.vel.x -= vx; n2.vel.y -= vy; n2.vel.z -= vz;
            }
        }

        // 2. Attraction (Spring)
        links.forEach(link => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (source && target) {
                const dx = target.pos.x - source.pos.x;
                const dy = target.pos.y - source.pos.y;
                const dz = target.pos.z - source.pos.z;
                // ideal distance is heavily related to strength (stronger = closer)
                const idealDist = 2 + (1 - link.strength) * 5;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.1;
                
                const diff = dist - idealDist;
                const f = (diff * springForce) * link.strength;

                const vx = (dx / dist) * f;
                const vy = (dy / dist) * f;
                const vz = (dz / dist) * f;
                
                source.vel.x += vx; source.vel.y += vy; source.vel.z += vz;
                target.vel.x -= vx; target.vel.y -= vy; target.vel.z -= vz;
            }
        });

        // 3. Center Gravity
        nodes.forEach(n => {
            n.vel.x += -n.pos.x * 0.01;
            n.vel.y += -n.pos.y * 0.01;
            n.vel.z += -n.pos.z * 0.01;
            
            // Limit bounds
            n.vel.clampLength(0, 1);
            
            n.pos.add(n.vel.clone().multiplyScalar(delta * 20));
            n.vel.multiplyScalar(damping);
        });

        // Update group rotation for passive viewing
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.1;
        }

    });

    return (
        <group ref={groupRef}>
            {/* Draw Links */}
            {links.map((link, i) => {
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);
                if (!sourceNode || !targetNode) return null;
                
                const isActive = activeNode === link.source || activeNode === link.target;
                
                return (
                    <DynamicLink 
                        key={i} 
                        source={sourceNode} 
                        target={targetNode} 
                        strength={link.strength} 
                        isActive={isActive}
                        theme={link.theme} 
                    />
                );
            })}

            {/* Draw Nodes */}
            {nodes.map(node => (
                <NodeMesh 
                    key={node.id} 
                    node={node} 
                    isActive={activeNode === node.id}
                    onClick={() => setActiveNode(node.id === activeNode ? null : node.id)} 
                />
            ))}
        </group>
    );
};

const DynamicLink = ({ source, target, strength, isActive, theme }: any) => {
    const lineRef = useRef<THREE.Line>(null);
    const pointsArray = React.useMemo(() => new Float32Array(6), []);

    useFrame(() => {
        if (lineRef.current) {
            pointsArray[0] = source.pos.x;
            pointsArray[1] = source.pos.y;
            pointsArray[2] = source.pos.z;
            pointsArray[3] = target.pos.x;
            pointsArray[4] = target.pos.y;
            pointsArray[5] = target.pos.z;
            lineRef.current.geometry.attributes.position.needsUpdate = true;
            lineRef.current.geometry.computeBoundingBox();
            lineRef.current.geometry.computeBoundingSphere();
        }
    });

    return (
        <group>
            <line ref={lineRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[pointsArray, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial 
                    color={isActive ? '#ffffff' : '#4b5563'} 
                    linewidth={1}
                    transparent
                    opacity={isActive ? 0.8 : 0.3}
                />
            </line>
            {isActive && (
                <ParticleFlow source={source} target={target} color="#ffffff" />
            )}
        </group>
    );
};

const ParticleFlow = ({ source, target, color }: { source: SynapticNode, target: SynapticNode, color: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (meshRef.current) {
            const t = (state.clock.elapsedTime * 2) % 1; // 0 to 1
            meshRef.current.position.lerpVectors(source.pos, target.pos, t);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={color} />
        </mesh>
    );
}

const NodeMesh = ({ node, isActive, onClick }: { node: SynapticNode, isActive: boolean, onClick: () => void }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.copy(node.pos);
            meshRef.current.rotation.y += 0.05;
            if (isActive) {
                meshRef.current.scale.setScalar(1 + Math.sin(Date.now() / 200) * 0.1);
            } else {
                meshRef.current.scale.setScalar(1);
            }
        }
    });

    const getGeometry = () => {
        switch(node.type) {
            case 'profile': return <sphereGeometry args={[0.5, 32, 32]} />;
            case 'echo': return <octahedronGeometry args={[0.5, 0]} />;
            case 'file': return <boxGeometry args={[0.6, 0.6, 0.6]} />;
            case 'note': return <tetrahedronGeometry args={[0.5, 0]} />;
            default: return <sphereGeometry args={[0.5, 16, 16]} />;
        }
    };

    return (
        <mesh
            ref={meshRef}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
        >
            {getGeometry()}
            <meshStandardMaterial 
                color={node.color} 
                emissive={node.color} 
                emissiveIntensity={isActive ? 1.5 : (hovered ? 0.8 : 0.4)} 
                wireframe={node.type !== 'profile'}
                transparent
                opacity={0.9}
            />
            {isActive || hovered ? (
                <Html position={[0, -0.8, 0]} center zIndexRange={[100, 0]}>
                    <div className="bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-center whitespace-nowrap">
                        <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{node.type}</div>
                        <div className="text-sm text-white font-mono">{node.label}</div>
                    </div>
                </Html>
            ) : null}
            {(isActive || hovered) && (
                <pointLight color={node.color} intensity={2} distance={3} />
            )}
        </mesh>
    );
};


export const SynapticWebVisualizer = ({ userData }: { userData?: any }) => {
    const { nodes, links } = useMemo(() => generateMockNodes(userData), [userData]);
    const [activeNode, setActiveNode] = useState<string|null>(null);

    const activeNodeData = useMemo(() => nodes.find(n => n.id === activeNode), [activeNode, nodes]);
    const activeLinks = useMemo(() => links.filter(l => l.source === activeNode || l.target === activeNode), [activeNode, links]);

    return (
        <div className="bg-zinc-950 rounded-3xl border border-indigo-500/20 overflow-hidden relative min-h-[700px] flex flex-col font-sans">
            
            {/* 3D View */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                    <color attach="background" args={['#000000']} />
                    <ambientLight intensity={0.2} />
                    <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                    <ForceDirectedGraph nodes={nodes} links={links} activeNode={activeNode} setActiveNode={setActiveNode} />
                    <OrbitControls maxDistance={30} minDistance={5} />
                </Canvas>
            </div>

            {/* Header Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                    <Network className="w-6 h-6 text-indigo-400 animate-pulse" />
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Synaptic Data Web</h2>
                        <p className="text-[10px] text-zinc-400 tracking-widest uppercase">Thematic correlation matrix</p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 z-10 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col gap-3 pointer-events-auto">
                <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Info size={12} /> Node Types
                </h3>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#38bdf8]" /><span className="text-xs font-mono text-zinc-300">Profile Data</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#d946ef]" /><span className="text-xs font-mono text-zinc-300">Past Echoes</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#10b981]" /><span className="text-xs font-mono text-zinc-300">Uploaded Files</span></div>
                    <div className="flex items-center gap-2"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#f59e0b]" /><span className="text-xs font-mono text-zinc-300">Notes / Axioms</span></div>
                </div>
            </div>

            {/* Details Panel */}
            <AnimatePresence>
                {activeNodeData && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-6 right-6 bottom-6 w-80 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 z-10 flex flex-col"
                    >
                        <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1">Selected Node</div>
                        <h3 className="text-xl font-mono text-white mb-4" style={{ color: activeNodeData.color }}>{activeNodeData.label}</h3>
                        
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-6">
                            <div className="text-xs text-zinc-400 font-mono flex items-center justify-between mb-2">
                                <span>Type:</span> <span className="uppercase tracking-widest text-white">{activeNodeData.type}</span>
                            </div>
                            <div className="text-xs text-zinc-400 font-mono flex items-center justify-between">
                                <span>Coordinates:</span> <span className="text-emerald-400">[{activeNodeData.pos.x.toFixed(1)}, {activeNodeData.pos.y.toFixed(1)}, {activeNodeData.pos.z.toFixed(1)}]</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <h4 className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <Activity size={12} /> Synaptic Links ({activeLinks.length})
                            </h4>
                            <div className="space-y-3">
                                {activeLinks.map((link, idx) => {
                                    const isSource = link.source === activeNode;
                                    const otherId = isSource ? link.target : link.source;
                                    const otherNode = nodes.find(n => n.id === otherId);
                                    if (!otherNode) return null;

                                    return (
                                        <div key={idx} className="bg-black/50 border border-white/5 p-3 rounded-xl hover:border-white/20 transition-colors cursor-pointer" onClick={() => setActiveNode(otherId)}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                                    {isSource ? 'Outbound To' : 'Inbound From'}
                                                </span>
                                                <span className="text-xs font-mono" style={{color: otherNode.color}}>
                                                    {otherNode.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs text-white font-mono italic">Theme: {link.theme}</span>
                                                <span className="text-[10px] text-emerald-400 font-mono">Str: {(link.strength * 100).toFixed(0)}%</span>
                                            </div>
                                            
                                            {/* Strength Bar */}
                                            <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                                                <div className="h-full bg-emerald-400" style={{ width: `${link.strength * 100}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setActiveNode(null)}
                            className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-mono text-zinc-400 uppercase tracking-widest transition-colors"
                        >
                            Close Selection
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
