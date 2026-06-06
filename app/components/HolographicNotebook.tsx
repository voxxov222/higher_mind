import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html, Line, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Network, Plus, Play, Pause, X, GripHorizontal, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IdeaNode {
    id: string;
    text: string;
    type: 'gematria' | 'hermetic' | 'custom';
    position: [number, number, number];
    color: string;
}

interface IdeaLink {
    id: string;
    source: string;
    target: string;
}

const COLORS = {
    gematria: '#a855f7', // purple
    hermetic: '#eab308', // yellow
    custom: '#38bdf8'    // cyan
};

const NodeObject = ({ node, isPlaying, updatePosition, connectMode, onNodeClick, activeNodeId }: { node: IdeaNode, isPlaying: boolean, updatePosition: (id: string, pos: [number, number, number]) => void, connectMode: string | null, onNodeClick: (id: string) => void, activeNodeId: string | null }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const { camera, size, raycaster } = useThree();
    
    // Simple drag implementation
    const [isDragging, setIsDragging] = useState(false);
    const planeIntersectPoint = new THREE.Vector3();
    const planeNormal = new THREE.Vector3(0, 0, 1);
    const plane = new THREE.Plane(planeNormal, 0);

    // Dynamic floating effect when not dragging/playing
    useFrame((state) => {
        if (!isDragging && !isPlaying && meshRef.current) {
            meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + parseInt(node.id)) * 0.002;
        }
    });

    const isSelected = activeNodeId === node.id;
    const isConnectTarget = connectMode && connectMode !== node.id;

    return (
        <group position={node.position}>
            <mesh 
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    onNodeClick(node.id);
                }}
            >
                <sphereGeometry args={[isSelected ? 0.6 : 0.4, 32, 32]} />
                <meshStandardMaterial 
                    color={node.color} 
                    emissive={node.color}
                    emissiveIntensity={hovered || isSelected ? 2 : 0.5}
                    transparent
                    opacity={0.8}
                    wireframe={isConnectTarget}
                />
                <pointLight color={node.color} intensity={isSelected ? 2 : 1} distance={5} />
            </mesh>

            {!isPlaying && (
                <Html position={[0, -0.8, 0]} center zIndexRange={[100, 0]}>
                    <div className="flex flex-col items-center pointer-events-none w-48 font-mono">
                        <div className={`px-2 py-1 bg-black/80 border text-[10px] rounded text-center backdrop-blur-md transition-all ${
                            isSelected ? `border-[${node.color}] text-white scale-110 shadow-[0_0_10px_${node.color}]` : 
                            hovered ? 'border-white/50 text-white/90' : 'border-white/10 text-white/60'
                        }`}
                        style={{ borderColor: isSelected ? node.color : undefined, boxShadow: isSelected ? `0 0 10px ${node.color}40` : undefined }}>
                            {node.text}
                        </div>
                    </div>
                </Html>
            )}

            {/* Presentation Mode Giant Text */}
            {isPlaying && isSelected && (
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} position={[0, 1.5, 0]}>
                    <Text 
                        fontSize={0.8} 
                        color={node.color} 
                        anchorX="center" 
                        anchorY="bottom"
                        outlineWidth={0.05}
                        outlineColor="#000000"
                        maxWidth={5}
                        textAlign="center"
                    >
                        {node.text}
                    </Text>
                </Float>
            )}
        </group>
    );
};

const LinkObject = ({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) => {
    return (
        <Line 
            points={[start, end]} 
            color={color} 
            lineWidth={2} 
            transparent 
            opacity={0.4} 
        />
    );
};

const NotebookScene = ({ 
    nodes, 
    links, 
    activeNodeId, 
    onNodeClick, 
    connectMode, 
    updateNodePosition,
    isPlaying
}: any) => {
    const { camera } = useThree();

    useFrame((state, delta) => {
        if (isPlaying && activeNodeId) {
            const activeNode = nodes.find((n: IdeaNode) => n.id === activeNodeId);
            if (activeNode) {
                // Smoothly traverse camera to the active node
                const targetPos = new THREE.Vector3(activeNode.position[0], activeNode.position[1], activeNode.position[2] + 4);
                camera.position.lerp(targetPos, 2 * delta);
                
                const lookAtTarget = new THREE.Vector3(...activeNode.position);
                // We shouldn't use lookAt directly inside lerp loop seamlessly without Quaternions, 
                // but for simple presentation, pointing at the node is fine
                const currentLookAt = new THREE.Vector3(0, 0, 0).applyQuaternion(camera.quaternion);
                
                // Keep it simple: let OrbitControls handle rotation mostly, or just adjust position
            }
        }
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
            
            {/* Draw Links */}
            {links.map((link: IdeaLink) => {
                const source = nodes.find((n: IdeaNode) => n.id === link.source);
                const target = nodes.find((n: IdeaNode) => n.id === link.target);
                if (source && target) {
                    return <LinkObject key={link.id} start={source.position} end={target.position} color="#ffffff" />;
                }
                return null;
            })}

            {/* Draw Nodes */}
            {nodes.map((node: IdeaNode) => (
                <NodeObject 
                    key={node.id} 
                    node={node} 
                    isPlaying={isPlaying}
                    updatePosition={updateNodePosition}
                    connectMode={connectMode}
                    onNodeClick={onNodeClick}
                    activeNodeId={activeNodeId}
                />
            ))}

            {!isPlaying && (
                <OrbitControls 
                    enableDamping 
                    dampingFactor={0.05} 
                    maxDistance={30} 
                    minDistance={2} 
                />
            )}
        </>
    );
};

export const HolographicNotebook = () => {
    const [nodes, setNodes] = useState<IdeaNode[]>([
        { id: '1', text: 'All is Mind; The Universe is Mental.', type: 'hermetic', position: [0, 2, 0], color: COLORS.hermetic },
        { id: '2', text: 'Gematria: LOVE (54) resonating with 528Hz', type: 'gematria', position: [-3, -1, 0], color: COLORS.gematria },
        { id: '3', text: 'My Soul Path number is 7.', type: 'custom', position: [3, -1, 0], color: COLORS.custom }
    ]);
    const [links, setLinks] = useState<IdeaLink[]>([
        { id: 'l1', source: '1', target: '2' },
        { id: 'l2', source: '2', target: '3' }
    ]);
    
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [connectMode, setConnectMode] = useState<string | null>(null); // Stores ID of node initiating connection
    const [isPlaying, setIsPlaying] = useState(false);
    
    const [inputText, setInputText] = useState('');
    const [inputType, setInputType] = useState<'custom'|'gematria'|'hermetic'>('custom');
    
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Presentation logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && nodes.length > 0) {
            let currentIndex = activeNodeId ? nodes.findIndex(n => n.id === activeNodeId) : 0;
            if (currentIndex === -1) currentIndex = 0;
            setActiveNodeId(nodes[currentIndex].id);
            
            interval = setInterval(() => {
                currentIndex = (currentIndex + 1) % nodes.length;
                setActiveNodeId(nodes[currentIndex].id);
            }, 4000); // switch every 4 seconds
        }
        return () => clearInterval(interval);
    }, [isPlaying, nodes, activeNodeId]);

    const addNode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        
        const newNode: IdeaNode = {
            id: Date.now().toString(),
            text: inputText,
            type: inputType,
            position: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4],
            color: COLORS[inputType]
        };
        
        setNodes([...nodes, newNode]);
        setInputText('');
    };

    const handleNodeClick = (id: string) => {
        if (connectMode) {
            if (connectMode !== id) {
                // Create link
                const existingLink = links.find(l => 
                    (l.source === connectMode && l.target === id) || 
                    (l.target === connectMode && l.source === id)
                );
                if (!existingLink) {
                    setLinks([...links, { id: Date.now().toString(), source: connectMode, target: id }]);
                }
            }
            setConnectMode(null);
        } else {
            setActiveNodeId(id);
        }
    };

    const updateNodePosition = (id: string, newPos: [number, number, number]) => {
        setNodes(nodes.map(n => n.id === id ? { ...n, position: newPos } : n));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const text = e.dataTransfer.getData('text/plain');
        if (text) {
            const newNode: IdeaNode = {
                id: Date.now().toString(),
                text: text,
                type: 'custom',
                position: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 0],
                color: COLORS.custom
            };
            setNodes([...nodes, newNode]);
        }
    };

    return (
        <div 
            className={`flex flex-col bg-zinc-950 border border-indigo-900/30 overflow-hidden relative font-sans transition-all duration-500
                ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full min-h-[700px] rounded-3xl '}
            `}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-black pointer-events-none" />

            {/* Header HUD */}
            <div className="absolute top-0 inset-x-0 p-4 md:p-6 flex justify-between items-start z-20 pointer-events-none">
                <div>
                    <h2 className="text-xl font-mono text-indigo-400 tracking-widest uppercase flex items-center gap-2">
                        <Network size={20} />
                        Holographic Notebook
                    </h2>
                    <p className="text-xs font-mono text-zinc-500 mt-2 max-w-md bg-black/40 p-2 rounded backdrop-blur border border-white/5">
                        Drag & Drop text anywhere on the canvas to create nodes. Select a node to focus. Use Link Mode to connect ideas into constellations. Play presentation to journey through your knowledge graph.
                    </p>
                </div>
                
                <div className="flex gap-2 pointer-events-auto">
                     <button 
                         onClick={() => setIsFullscreen(!isFullscreen)}
                         className="p-2 bg-black/60 border border-white/10 rounded text-zinc-400 hover:text-white transition-colors backdrop-blur-md"
                     >
                         {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                     </button>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`px-4 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest border rounded transition-all backdrop-blur-md ${
                            isPlaying 
                                ? 'bg-indigo-900/40 text-indigo-300 border-indigo-500/50' 
                                : 'bg-black/60 text-zinc-300 border-white/10 hover:bg-white/5'
                        }`}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        {isPlaying ? 'Pause Journey' : 'Present Graph'}
                    </button>
                </div>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 w-full relative z-10">
                <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                    <NotebookScene 
                        nodes={nodes} 
                        links={links}
                        activeNodeId={activeNodeId}
                        onNodeClick={handleNodeClick}
                        connectMode={connectMode}
                        updateNodePosition={updateNodePosition}
                        isPlaying={isPlaying}
                    />
                </Canvas>
            </div>

            {/* Bottom Controls HUD */}
            {!isPlaying && (
                <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 z-20 pointer-events-none">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        
                        {/* Node Properties Panel */}
                        <AnimatePresence>
                            {activeNodeId && !connectMode && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="bg-black/80 backdrop-blur-md border border-indigo-900/50 p-4 rounded-xl max-w-sm pointer-events-auto"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Active Node</h3>
                                        <button onClick={() => setActiveNodeId(null)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                                    </div>
                                    <p className="text-sm text-zinc-300 font-sans mb-4">
                                        {nodes.find(n => n.id === activeNodeId)?.text}
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setConnectMode(activeNodeId)}
                                            className="flex-1 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded text-xs font-mono uppercase tracking-wider transition-colors"
                                        >
                                            Link Node
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setNodes(nodes.filter(n => n.id !== activeNodeId));
                                                setLinks(links.filter(l => l.source !== activeNodeId && l.target !== activeNodeId));
                                                setActiveNodeId(null);
                                            }}
                                            className="py-2 px-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded transition-colors"
                                            title="Delete Node"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            
                            {connectMode && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-indigo-900/80 backdrop-blur-md border border-indigo-400 p-4 rounded-xl max-w-sm pointer-events-auto flex items-center justify-between"
                                >
                                    <span className="text-xs font-mono text-indigo-200 uppercase tracking-widest animate-pulse">Select target node to link...</span>
                                    <button onClick={() => setConnectMode(null)} className="text-indigo-200 hover:text-white p-1 bg-black/20 rounded"><X size={16} /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Add Node Form */}
                        <form onSubmit={addNode} className="flex gap-2 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 pointer-events-auto w-full md:w-auto">
                            <select 
                                value={inputType} 
                                onChange={(e) => setInputType(e.target.value as any)}
                                className="bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-mono rounded px-2 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="custom">Custom Insight</option>
                                <option value="gematria">Gematria Log</option>
                                <option value="hermetic">Hermetic Axiom</option>
                            </select>
                            <input 
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Add a new thought or drop text here..."
                                className="bg-zinc-900 border border-white/5 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-indigo-500 min-w-[200px] md:min-w-[300px]"
                            />
                            <button 
                                type="submit"
                                disabled={!inputText.trim()}
                                className="px-3 bg-indigo-600/30 hover:bg-indigo-600/50 disabled:opacity-50 text-indigo-300 border border-indigo-500/30 rounded flex items-center justify-center transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};
