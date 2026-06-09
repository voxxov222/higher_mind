import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html, Line, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Network, Plus, Play, Pause, X, GripHorizontal, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IdeaNode {
    id: string;
    text: string;
    type: 'gematria' | 'hermetic' | 'custom' | 'agent' | 'image' | 'file';
    position: [number, number, number];
    color: string;
    animationType: string;
    fileUrl?: string;
}

interface IdeaLink {
    id: string;
    source: string;
    target: string;
}

const COLORS = {
    gematria: '#a855f7', // purple
    hermetic: '#eab308', // yellow
    custom: '#38bdf8',   // cyan
    agent: '#ef4444',    // red
    image: '#10b981',    // emerald
    file: '#6366f1'      // indigo
};

const ANIMATIONS = [
    'float', 'spin-y', 'spin-x', 'spin-z', 'orbit', 'shake', 'zig-zag', 'pulse-scale', 
    'pop-in-out', 'zoom', 'flash', 'explosion', 'lighting', 'fall', 'bounce', 'pendulum', 
    'heartbeat', 'spiral-up', 'spiral-down', 'figure-eight', 'breathe', 'jitter', 'glitch', 
    'wave-y', 'wave-x', 'wave-z', 'twister', 'vortex', 'jelly', 'wobble', 'flip', 'elastic', 
    'hover-fast', 'sway', 'nod', 'roll', 'teleport', 'shiver', 'dance', 'tremor', 'whirlwind', 
    'magnet', 'pulsing-star', 'orbit-fast', 'drunk', 'levitate', 'drop', 'hyper-spin', 'orbit-z', 'orbit-x'
];

const applyAnimation = (ref: THREE.Mesh | null, state: any, type: string, initialPos: [number, number, number], id: string) => {
    if (!ref) return;
    const t = state.clock.elapsedTime;
    const offset = parseInt(id) || 0;
    
    // Reset defaults
    ref.position.set(...initialPos);
    ref.rotation.set(0, 0, 0);
    ref.scale.set(1, 1, 1);
    const material = ref.material as THREE.MeshStandardMaterial;
    if (material) {
        material.emissiveIntensity = 0.5;
        material.opacity = 0.8;
    }

    switch(type) {
        case 'float': ref.position.y += Math.sin(t * 2 + offset) * 0.2; break;
        case 'spin-y': ref.rotation.y = t; break;
        case 'spin-x': ref.rotation.x = t; break;
        case 'spin-z': ref.rotation.z = t; break;
        case 'orbit': 
            ref.position.x = initialPos[0] + Math.cos(t + offset);
            ref.position.z = initialPos[2] + Math.sin(t + offset);
            break;
        case 'shake': ref.position.x += (Math.random() - 0.5) * 0.1; break;
        case 'zig-zag': ref.position.x += Math.sin(t * 5) * 0.5; ref.position.y += Math.cos(t * 5) * 0.5; break;
        case 'pulse-scale': { const s = 1 + Math.sin(t * 3) * 0.5; ref.scale.set(s,s,s); break; }
        case 'pop-in-out': { const s = Math.abs(Math.sin(t)); ref.scale.set(s,s,s); break; }
        case 'zoom': { const s = 1 + Math.sin(t * 2) * 1; ref.scale.set(s,s,s); break; }
        case 'flash': if(material) material.emissiveIntensity = Math.random() > 0.5 ? 5 : 0; break;
        case 'explosion': { const s = Math.exp(-((t*2)%2)); ref.scale.set(s*3,s*3,s*3); if(material) material.opacity = s; break; }
        case 'lighting': if(material) material.emissiveIntensity = Math.random() * 3; break;
        case 'fall': ref.position.y = initialPos[1] + 2 - ((t * 4) % 4); break;
        case 'bounce': ref.position.y += Math.abs(Math.sin(t * 3)); break;
        case 'pendulum': ref.rotation.z = Math.sin(t * 2) * 0.5; ref.position.x += Math.sin(t * 2) * 0.5; break;
        case 'heartbeat': { const s = 1 + Math.pow(Math.sin(t * 4), 6) * 0.4; ref.scale.set(s,s,s); break; }
        case 'spiral-up': ref.position.x += Math.cos(t*3); ref.position.z += Math.sin(t*3); ref.position.y += (t % 2); break;
        case 'spiral-down': ref.position.x += Math.cos(t*3); ref.position.z += Math.sin(t*3); ref.position.y -= (t % 2); break;
        case 'figure-eight': ref.position.x += Math.sin(t)*2; ref.position.y += Math.sin(t*2); break;
        case 'breathe': { const s = 1 + Math.sin(t) * 0.2; ref.scale.set(s,s,s); if(material) material.emissiveIntensity = s; break; }
        case 'jitter': ref.position.set(initialPos[0]+(Math.random()-0.5)*0.2, initialPos[1]+(Math.random()-0.5)*0.2, initialPos[2]+(Math.random()-0.5)*0.2); break;
        case 'glitch': if(Math.random() < 0.1) ref.position.set(initialPos[0]+(Math.random()-0.5), initialPos[1]+(Math.random()-0.5), initialPos[2]); break;
        case 'wave-y': ref.position.y += Math.sin(t * 4 + initialPos[0]) * 0.5; break;
        case 'wave-x': ref.position.x += Math.sin(t * 4 + initialPos[1]) * 0.5; break;
        case 'wave-z': ref.position.z += Math.sin(t * 4 + initialPos[0]) * 0.5; break;
        case 'twister': ref.rotation.y = t * 5; ref.scale.x = 0.5 + Math.abs(Math.sin(t)); break;
        case 'vortex': ref.position.x += Math.cos(t*5)*(1+Math.sin(t)); ref.position.z += Math.sin(t*5)*(1+Math.sin(t)); break;
        case 'jelly': ref.scale.set(1+Math.sin(t*5)*0.2, 1-Math.sin(t*5)*0.2, 1+Math.sin(t*5)*0.2); break;
        case 'wobble': ref.rotation.set(Math.sin(t*2)*0.2, Math.cos(t*3)*0.2, Math.sin(t*4)*0.2); break;
        case 'flip': ref.rotation.x = Math.floor(t % 2) * Math.PI; break;
        case 'elastic': ref.position.y += Math.sin(t * 10) * Math.exp(-((t*2)%2)); break;
        case 'hover-fast': ref.position.y += Math.sin(t * 10) * 0.1; break;
        case 'sway': ref.rotation.z = Math.sin(t) * 0.3; break;
        case 'nod': ref.rotation.x = Math.sin(t*3) * 0.3; break;
        case 'roll': ref.rotation.x = t; ref.position.z += Math.sin(t); break;
        case 'teleport': if (Math.floor(t*2) % 2 === 0) ref.position.x += 1; else ref.position.x -= 1; break;
        case 'shiver': ref.rotation.z = (Math.random()-0.5)*0.2; break;
        case 'dance': ref.position.y += Math.abs(Math.sin(t*5)); ref.rotation.y += Math.sin(t*2); break;
        case 'tremor': ref.position.y += (Math.random()-0.5)*0.1; ref.position.x += (Math.random()-0.5)*0.1; break;
        case 'whirlwind': ref.position.x += Math.cos(t*10)*0.5; ref.position.y += t%2; ref.position.z += Math.sin(t*10)*0.5; break;
        case 'magnet': ref.position.x += Math.sin(t)*0.5; ref.position.y += Math.cos(t)*0.5; break;
        case 'pulsing-star': { const s = 1 + Math.sin(t*10)*0.1; ref.scale.set(s,s,s); if(material) material.emissiveIntensity = Math.random() > 0.5 ? 2 : 0.5; break; }
        case 'orbit-fast': ref.position.x = initialPos[0] + Math.cos(t*4 + offset)*2; ref.position.y = initialPos[1] + Math.sin(t*4 + offset)*2; break;
        case 'drunk': ref.position.x += Math.sin(t)*0.5; ref.position.y += Math.sin(t*0.5)*0.5; ref.rotation.z = Math.sin(t*0.2)*0.2; break;
        case 'levitate': ref.position.y = initialPos[1] + Math.min(t%4, 2); break;
        case 'drop': ref.position.y = initialPos[1] + 2 - Math.min(t%2 * 4, 2); break;
        case 'hyper-spin': ref.rotation.y = t * 20; ref.rotation.x = t * 10; break;
        case 'orbit-z': ref.position.y = initialPos[1] + Math.max(Math.cos(t), 0); ref.position.x = initialPos[0] + Math.sin(t); break;
        case 'orbit-x': ref.position.y = initialPos[1] + Math.sin(t); ref.position.z = initialPos[2] + Math.cos(t); break;
        default: ref.position.y += Math.sin(t * 2 + offset) * 0.05; break;
    }
};

const NodeObject = ({ node, isPlaying, updatePosition, connectMode, onNodeClick, activeNodeId, updateNodeAnimation }: { node: IdeaNode, isPlaying: boolean, updatePosition: (id: string, pos: [number, number, number]) => void, connectMode: string | null, onNodeClick: (id: string) => void, activeNodeId: string | null, updateNodeAnimation: (id: string, ani: string) => void }) => {
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
            applyAnimation(meshRef.current, state, node.animationType, node.position, node.id);
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
                {node.type === 'image' && node.fileUrl ? (
                   <planeGeometry args={[1, 1]} />
                ) : node.type === 'file' ? (
                   <boxGeometry args={[0.5, 0.6, 0.1]} />
                ) : node.type === 'agent' ? (
                   <octahedronGeometry args={[isSelected ? 0.6 : 0.4]} />
                ) : (
                   <sphereGeometry args={[isSelected ? 0.6 : 0.4, 32, 32]} />
                )}
                
                <meshStandardMaterial 
                    color={node.color} 
                    emissive={node.color}
                    emissiveIntensity={hovered || isSelected ? 2 : 0.5}
                    transparent
                    opacity={0.8}
                    wireframe={isConnectTarget || node.type === 'agent'}
                />
                
                <pointLight color={node.color} intensity={isSelected ? 2 : 1} distance={5} />
            </mesh>

            {node.type === 'image' && node.fileUrl && !isPlaying && (
                <Html position={[0, 0, 0]} transform>
                    <div className="w-16 h-16 pointer-events-none rounded overflow-hidden opacity-80 border border-emerald-400">
                        <img src={node.fileUrl} alt={node.text} className="w-full h-full object-cover" />
                    </div>
                </Html>
            )}

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
    isPlaying,
    updateNodeAnimation
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
                    updateNodeAnimation={updateNodeAnimation}
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
        { id: '1', text: 'All is Mind; The Universe is Mental.', type: 'hermetic', position: [0, 2, 0], color: COLORS.hermetic, animationType: 'float' },
        { id: '2', text: 'Gematria: LOVE (54) resonating with 528Hz', type: 'gematria', position: [-3, -1, 0], color: COLORS.gematria, animationType: 'float' },
        { id: '3', text: 'My Soul Path number is 7.', type: 'custom', position: [3, -1, 0], color: COLORS.custom, animationType: 'float' },
        { id: '4', text: 'Seraphim Agent Protocol', type: 'agent', position: [0, -3, 0], color: COLORS.agent, animationType: 'shiver' }
    ]);
    const [links, setLinks] = useState<IdeaLink[]>([
        { id: 'l1', source: '1', target: '2' },
        { id: 'l2', source: '2', target: '3' },
        { id: 'l3', source: '3', target: '4' }
    ]);
    
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [connectMode, setConnectMode] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const [inputText, setInputText] = useState('');
    const [inputType, setInputType] = useState<IdeaNode['type']>('custom');
    
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            color: COLORS[inputType],
            animationType: inputType === 'agent' ? 'orbit-fast' : 'spin-y'
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

    const updateNodeAnimation = (id: string, animation: string) => {
        setNodes(nodes.map(n => n.id === id ? { ...n, animationType: animation } : n));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newNodes = Array.from(e.target.files).map((file, idx) => {
                const isImage = file.type.startsWith('image/');
                const url = URL.createObjectURL(file);
                
                return {
                    id: Date.now().toString() + idx,
                    text: file.name,
                    type: (isImage ? 'image' : 'file') as IdeaNode['type'],
                    position: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4] as [number, number, number],
                    color: isImage ? COLORS.image : COLORS.file,
                    animationType: isImage ? 'hover-fast' : 'spin-y',
                    fileUrl: url
                };
            });
            setNodes(prev => [...prev, ...newNodes]);
            if (activeNodeId) {
                // Link new files to active node automatically if selected
                const newLinks = newNodes.map(n => ({
                    id: `l_${Date.now()}_${Math.random()}`,
                    source: activeNodeId,
                    target: n.id
                }));
                setLinks(prev => [...prev, ...newLinks]);
            }
        }
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
                color: COLORS.custom,
                animationType: 'pop-in-out'
            };
            setNodes([...nodes, newNode]);
        } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Re-use file upload logic by mocking event
            handleFileUpload({ target: { files: e.dataTransfer.files } } as any);
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
                        updateNodeAnimation={updateNodeAnimation}
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
                                    <div className="mb-4">
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 block">Animation</label>
                                        <select 
                                            value={nodes.find(n => n.id === activeNodeId)?.animationType || 'float'}
                                            onChange={(e) => updateNodeAnimation(activeNodeId, e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                                        >
                                            {ANIMATIONS.map(anim => (
                                                <option key={anim} value={anim}>{anim}</option>
                                            ))}
                                        </select>
                                    </div>
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
                        <div className="flex gap-2 items-center pointer-events-auto">
                            <form onSubmit={addNode} className="flex gap-2 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 w-full md:w-auto">
                                <select 
                                    value={inputType} 
                                    onChange={(e) => setInputType(e.target.value as any)}
                                    className="bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-mono rounded px-2 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="custom">Custom Insight</option>
                                    <option value="gematria">Gematria Log</option>
                                    <option value="hermetic">Hermetic Axiom</option>
                                    <option value="agent">AI Node Agent</option>
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
                                    title="Add Node"
                                >
                                    <Plus size={16} />
                                </button>
                            </form>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*,.txt,.pdf,.csv,.json,.glb,.gltf,.obj" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileUpload} 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/40 text-emerald-400 rounded-xl transition-colors backdrop-blur-md"
                                title="Upload File/Image"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
