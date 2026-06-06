import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Maximize2, Trash2, Box, Cpu, HardDrive, Brain, Network, Radio, Camera, Video, MonitorPlay, Zap, Activity, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge, Node, Edge, Connection, NodeChange, EdgeChange, Handle, Position, NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimeVisualizer as AnimeVisualizerComponent } from './AnimeVisualizer';

type WidgetType = 'cpu' | 'memory' | 'mind_map' | 'radar_astral' | 'hologram' | 'bio_rhythm' | 'quantum_3d' | 'network_nodes' | 'matrix_stream' | 'activity_log' | 'energy_field' | 'entanglement' | 'image_upload' | 'video_upload' | 'gif_upload' | 'code_snippet' | 'custom_html' | 'live_stats' | 'ai_confidence' | 'cosmic_weather' | 'deep_learning' | 'frequency_monitor' | 'synaptic_coherence' | 'hud_crosshair' | 'global_vortex' | 'neural_plasticity' | 'quantum_entanglement' | 'holographic_storage' | 'astral_projection' | 'multiverse_gateway' | 'anime_visualizer';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: '1x1' | '1x2' | '2x1' | '2x2';
  data?: any;
}

const WIDGET_CATALOG: { type: WidgetType, title: string, icon: React.ReactNode, defaultSize: Widget['size'] }[] = [
  { type: 'cpu', title: 'Higher Mind CPU %', icon: <Cpu className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'memory', title: 'Memory Thresholds', icon: <HardDrive className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'mind_map', title: 'Neural Mind Map', icon: <Brain className="w-4 h-4" />, defaultSize: '2x2' },
  { type: 'radar_astral', title: 'Astral Resonance', icon: <Activity className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'hologram', title: 'Animated HUD', icon: <Box className="w-4 h-4" />, defaultSize: '2x2' },
  { type: 'bio_rhythm', title: 'Bio-Rhythm Stream', icon: <Activity className="w-4 h-4" />, defaultSize: '2x1' },
  { type: 'quantum_3d', title: 'Quantum State 3D', icon: <Box className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'network_nodes', title: 'Node Network', icon: <Network className="w-4 h-4" />, defaultSize: '2x1' },
  { type: 'matrix_stream', title: 'Matrix Data Stream', icon: <MonitorPlay className="w-4 h-4" />, defaultSize: '1x2' },
  { type: 'image_upload', title: 'Image Holo-Viewer', icon: <Camera className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'video_upload', title: 'Video Stream', icon: <Video className="w-4 h-4" />, defaultSize: '2x2' },
  { type: 'synaptic_coherence', title: 'Synaptic Coherence', icon: <Zap className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'energy_field', title: 'Energy Field', icon: <Radio className="w-4 h-4" />, defaultSize: '2x1' },
  { type: 'entanglement', title: 'Entanglement Index', icon: <Activity className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'hud_crosshair', title: 'Target HUD', icon: <MonitorPlay className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'global_vortex', title: 'Vortex Map', icon: <Activity className="w-4 h-4" />, defaultSize: '2x2' },
  { type: 'frequency_monitor', title: 'Frequency Monitor', icon: <Radio className="w-4 h-4" />, defaultSize: '2x1' },
  { type: 'ai_confidence', title: 'AI Confidence Gauge', icon: <Brain className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'cosmic_weather', title: 'Cosmic Weather', icon: <CloudLightning />, defaultSize: '1x1' },
  { type: 'deep_learning', title: 'Learning Progress', icon: <Cpu className="w-4 h-4" />, defaultSize: '2x1' },
  { type: 'neural_plasticity', title: 'Neural Plasticity', icon: <Brain className="w-4 h-4" />, defaultSize: '1x1' },
  { type: 'quantum_entanglement', title: 'Quantum Entanglement', icon: <Network className="w-4 h-4" />, defaultSize: '2x1' },
  { type: 'holographic_storage', title: 'Holographic Storage', icon: <HardDrive className="w-4 h-4" />, defaultSize: '1x2' },
  { type: 'astral_projection', title: 'Astral Projection', icon: <Video className="w-4 h-4" />, defaultSize: '2x2' },
  { type: 'multiverse_gateway', title: 'Multiverse Gateway', icon: <Box className="w-4 h-4" />, defaultSize: '2x2' },
  { type: 'anime_visualizer', title: 'Anime Engine', icon: <Zap className="w-4 h-4 text-cyan-400" />, defaultSize: '2x2' },
];

function CloudLightning() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>;
}

const SandboxSectionInner = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#10b981', strokeWidth: 2 } } as any, eds)),
        []
    );

    const removeWidget = useCallback((id: string) => {
        setNodes(nds => nds.filter(n => n.id !== id));
        setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    }, []);

    const toggleSize = useCallback((id: string) => {
        setNodes(nds => nds.map(n => {
            if (n.id === id) {
                const widget = n.data.widget as Widget;
                const order: Widget['size'][] = ['1x1', '2x1', '1x2', '2x2'];
                const i = order.indexOf(widget.size);
                return { ...n, data: { ...n.data, widget: { ...widget, size: order[(i + 1) % order.length] } } };
            }
            return n;
        }));
    }, []);

    const addWidget = (type: WidgetType) => {
        const catalogItem = WIDGET_CATALOG.find(w => w.type === type);
        if (!catalogItem) return;
        
        const widgetId = Math.random().toString(36).substring(7);
        const newWidget: Widget = {
            id: widgetId,
            type,
            title: catalogItem.title,
            size: catalogItem.defaultSize,
        };

        const newNode: Node = {
            id: widgetId,
            type: 'widgetNode',
            position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
            data: { 
                widget: newWidget,
                onRemove: removeWidget,
                onToggleSize: toggleSize
            },
            dragHandle: '.custom-drag-handle'
        };
        
        setNodes(prev => [...prev, newNode]);
        setIsMenuOpen(false);
    };

    const nodeTypes = useRef({ widgetNode: WidgetNode }).current;

    return (
        <div className="relative min-h-[600px] h-[80vh] w-full bg-black/40 border border-white/5 rounded-[2rem] p-6 lg:p-8 overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.03),_transparent_70%)] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <Box className="w-5 h-5 text-emerald-400" />
                        Creative Sandbox
                    </h2>
                    <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Deploy automated widgets, holographic panels, & data nodes.</p>
                </div>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Node
                </button>
            </div>

            <div className="flex-1 w-full relative z-0 border border-white/10 rounded-2xl overflow-hidden bg-black/50">
                 {/* 3D Background */}
                 <div className="absolute inset-0 z-0">
                     <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                         <ambientLight intensity={0.5} />
                         <pointLight position={[10, 10, 10]} intensity={1} />
                         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                         <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                             <Sphere args={[2, 64, 64]} position={[0, 0, -5]}>
                                 <MeshDistortMaterial
                                     color="#10B981"
                                     envMapIntensity={0.4}
                                     clearcoat={0.8}
                                     clearcoatRoughness={0}
                                     metalness={0.8}
                                     roughness={0.2}
                                     distort={0.4}
                                     speed={2}
                                 />
                             </Sphere>
                         </Float>
                         <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                     </Canvas>
                 </div>

                 {nodes.length === 0 && (
                     <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center text-center space-y-4">
                         <Box className="w-12 h-12 text-white/20" />
                         <p className="text-sm text-white/40 max-w-md">Space is empty. Add widgets to monitor brain activity, upload media into holograms, or stream dynamic data metrics.</p>
                     </div>
                 )}
                 <div className="absolute inset-0 z-10">
                     <ReactFlow
                         nodes={nodes}
                         edges={edges}
                         onNodesChange={onNodesChange}
                         onEdgesChange={onEdgesChange}
                         onConnect={onConnect}
                         nodeTypes={nodeTypes}
                         fitView
                     >
                         <Background color="rgba(255,255,255,0.05)" />
                         <Controls className="!bg-black/60 border border-white/10 !fill-white" />
                     </ReactFlow>
                 </div>
            </div>

            {/* Widget Picker Modal */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black border border-white/10 rounded-3xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-emerald-900/20"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white uppercase tracking-widest">Sandbox Widget Catalog</h3>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 scrollbar-thin scrollbar-thumb-white/10">
                                {WIDGET_CATALOG.map(item => (
                                    <button
                                        key={item.type}
                                        onClick={() => addWidget(item.type)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-start gap-3 transition-all group text-left"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-black border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white uppercase">{item.title}</div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Default Size: {item.defaultSize}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SandboxSection = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center bg-slate-950/40 rounded-[2rem] border border-white/5">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="text-xs text-white/40 font-mono">Initializing Quantum Sandbox...</span>
                </div>
            </div>
        );
    }

    return <SandboxSectionInner />;
};

function WidgetNode({ data, selected }: NodeProps<Node>) {
    const { widget, onRemove, onToggleSize } = data as { widget: Widget; onRemove: (id: string)=>void; onToggleSize: (id: string)=>void };
    
    let width = 250;
    let height = 250;
    if (widget.size === '2x1') { width = 500; height = 250; }
    if (widget.size === '1x2') { width = 250; height = 500; }
    if (widget.size === '2x2') { width = 500; height = 500; }

    return (
        <div style={{ width, height }} className={`relative bg-black/80 border ${selected ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-white/10'} rounded-2xl overflow-hidden group transition-all flex flex-col backdrop-blur-md`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-fuchsia-500 border-2 border-black" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-black" />
            <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-blue-500 border-2 border-black" />
            <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-amber-500 border-2 border-black" />

            <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-between px-3 z-20 custom-drag-handle cursor-grab active:cursor-grabbing">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest pointer-events-none">{widget.title}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={(e) => { e.stopPropagation(); onToggleSize(widget.id); }} className="p-1 hover:bg-white/20 rounded text-white/60 hover:text-white pointer-events-auto" title="Resize">
                        <Maximize2 className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(widget.id); }} className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 pointer-events-auto" title="Remove">
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
            <div className="flex-1 w-full h-full relative pt-8 p-4 nodrag">
                <WidgetContent widget={widget} />
            </div>
        </div>
    );
};

function WidgetContent({ widget }: { widget: Widget }) {
    switch (widget.type as string) {
        case 'cpu': return <CPUWidget />;
        case 'memory': return <MemoryWidget />;
        case 'radar_astral': return <RadarAstralWidget />;
        case 'quantum_3d': return <Quantum3DWidget />;
        case 'matrix_stream': return <MatrixWidget />;
        case 'bio_rhythm': return <BioRhythmWidget />;
        case 'hologram': return <HologramHUDWidget />;
        case 'mind_map': return <MindMapWidget />;
        case 'entanglement': return <EntanglementWidget />;
        case 'synaptic_coherence': return <SynapticCoherenceWidget />;
        case 'activity_log': return <ActivityLogWidget />;
        case 'network_nodes': return <NetworkNodesWidget />;
        case 'global_vortex': return <Quantum3DWidget />;
        case 'anime_visualizer': return <AnimeVisualizerComponent />;
        case 'frequency_monitor': return <BioRhythmWidget />;
        case 'ai_confidence': return <RadarAstralWidget />;
        case 'cosmic_weather': return <MatrixWidget />;
        case 'deep_learning': return <MemoryWidget />;
        case 'neural_plasticity': return <SynapticCoherenceWidget />;
        case 'quantum_entanglement': return <EntanglementWidget />;
        case 'holographic_storage': return <HologramHUDWidget />;
        case 'astral_projection': return <MindMapWidget />;
        case 'multiverse_gateway': return <Quantum3DWidget />;
        case 'media_upload':
        case 'image_upload':
        case 'video_upload':
            return <MediaUploadWidget type={widget.type} />;
        default:
            return (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-mono uppercase tracking-widest text-center">
                    {widget.title}<br/>Stream Active
                </div>
            );
    }
}

// --- Widget Implementations ---

function CPUWidget() {
    const [val, setVal] = useState(45);
    useEffect(() => {
        const i = setInterval(() => {
            setVal(v => Math.max(10, Math.min(100, v + (Math.random() * 20 - 10))));
        }, 1000);
        return () => clearInterval(i);
    }, []);
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray={`${val * 2.8} 300`} strokeLinecap="round" className="transition-all duration-500" transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold font-mono text-emerald-400">
                    {Math.round(val)}%
                </div>
            </div>
            <div className="text-[10px] text-white/40 uppercase mt-4">Load Threshold</div>
        </div>
    );
}

function MemoryWidget() {
    const data = Array.from({length: 10}).map((_, i) => ({ name: i, value: Math.random() * 100 }));
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMem)" isAnimationActive={false} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

function RadarAstralWidget() {
    const data = [
        { subject: 'Clarity', A: 120 },
        { subject: 'Vibe', A: 98 },
        { subject: 'Aura', A: 86 },
        { subject: 'Focus', A: 99 },
        { subject: 'Qi', A: 85 },
        { subject: 'Zen', A: 65 },
    ];
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)'}} />
                <Radar name="Astral" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
            </RadarChart>
        </ResponsiveContainer>
    );
}

function BioRhythmWidget() {
    const [data, setData] = useState<{t: number, v1: number, v2: number}[]>([]);
    useEffect(() => {
        let t = 0;
        const i = setInterval(() => {
            t++;
            setData(prev => {
                const updated = [...prev, { t, v1: Math.sin(t/5)*50 + 50, v2: Math.cos(t/3)*40 + 50 }];
                if(updated.length > 30) updated.shift();
                return updated;
            });
        }, 100);
        return () => clearInterval(i);
    }, []);
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <Line type="basis" dataKey="v1" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="basis" dataKey="v2" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}

function Quantum3DWidget() {
    return (
        <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas >
                 <ambientLight intensity={0.5} />
                 <directionalLight position={[10, 10, 5]} intensity={1} />
                 <Float speed={4} rotationIntensity={2} floatIntensity={2}>
                    <Sphere args={[1.5, 64, 64]}>
                        <MeshDistortMaterial color="#fcd34d" envMapIntensity={1} clearcoat={1} clearcoatRoughness={0.1} metalness={0.8} roughness={0.2} distort={0.4} speed={4} />
                    </Sphere>
                 </Float>
                 <OrbitControls enableZoom={false} autoRotate />
            </Canvas>
        </div>
    );
}

function HologramHUDWidget() {
    return (
        <div className="w-full h-full flex items-center justify-center relative font-mono">
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: 'linear' }} className="w-48 h-48 border border-emerald-500/30 rounded-full border-dashed" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 15, ease: 'linear' }} className="w-32 h-32 border-2 border-cyan-500/20 rounded-full border-x-cyan-500/60" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-8 h-8 bg-fuchsia-500/20 rounded-full border border-fuchsia-500/50 flex items-center justify-center">
                   <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-ping" />
               </div>
            </div>
            <div className="absolute top-4 left-4 text-[10px] text-emerald-400 uppercase tracking-widest">
                SYS_LK: ACTIVE<br/>
                LAT: 4ms
            </div>
        </div>
    );
}

function MatrixWidget() {
    const [lines, setLines] = useState<string[]>([]);
    useEffect(() => {
        const chars = '0123456789ABCDEF!@#$%^&*()_+-=~';
        const i = setInterval(() => {
            const line = Array.from({length: 20}).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            setLines(prev => {
                const next = [line, ...prev];
                if(next.length > 15) next.pop();
                return next;
            });
        }, 150);
        return () => clearInterval(i);
    }, []);
    return (
        <div className="w-full h-full overflow-hidden font-mono text-[10px] text-emerald-500 leading-tight select-none">
            {lines.map((l, i) => (
                <div key={i} style={{ opacity: 1 - i * 0.08 }}>{l}</div>
            ))}
        </div>
    );
}

function MediaUploadWidget({ type }: { type: string }) {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setMediaUrl(url);
        }
    };

    if (mediaUrl) {
         if (type === 'video_upload') {
             return <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover rounded-lg" />;
         }
         return <img src={mediaUrl} className="w-full h-full object-cover rounded-lg" />;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                <input type="file" className="hidden" accept={type === 'video_upload' ? 'video/*' : 'image/*'} onChange={handleUpload} />
                <UploadCloudIcon className="w-8 h-8 text-white/40 mb-2" />
                <span className="text-xs uppercase tracking-widest text-white/50">Upload Media</span>
            </label>
        </div>
    );
}

function UploadCloudIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>;
}

function MindMapWidget() {
    return (
        <div className="w-full h-full relative border border-fuchsia-500/20 rounded-xl overflow-hidden bg-gradient-to-br from-fuchsia-900/10 to-transparent p-4 flex flex-col justify-center">
            <h4 className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest absolute top-3 left-4 flex items-center gap-2"><Brain className="w-3 h-3"/> Neural Tree</h4>
            <div className="flex items-center justify-between mt-4">
                <div className="p-2 bg-fuchsia-500/20 border border-fuchsia-500/40 rounded-full text-[10px] text-fuchsia-300">Core OS</div>
                <div className="flex-1 h-px bg-fuchsia-500/30 mx-2 relative">
                    <motion.div animate={{ x: [0, 100], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-4 h-full bg-fuchsia-400 absolute top-0" />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="p-1 px-3 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-[9px] text-cyan-300">Logic Core</div>
                    <div className="p-1 px-3 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-[9px] text-emerald-300">Bio Data</div>
                    <div className="p-1 px-3 bg-amber-500/20 border border-amber-500/40 rounded-full text-[9px] text-amber-300">Memory</div>
                </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,70,239,0.05)_0%,transparent_70%)] pointer-events-none" />
        </div>
    );
}

function EntanglementWidget() {
    const data = [
        { name: 'Node Alpha', value: 400, color: '#06b6d4' },
        { name: 'Node Beta', value: 300, color: '#8b5cf6' },
        { name: 'Node Gamma', value: 300, color: '#f43f5e' },
        { name: 'Node Delta', value: 200, color: '#10b981' },
    ];
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                 <Pie data={data} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" isAnimationActive={false}>
                     {data.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                     ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px' }} itemStyle={{ color: '#fff' }} />
            </PieChart>
        </ResponsiveContainer>
    );
}

function SynapticCoherenceWidget() {
    const data = Array.from({length: 15}).map((_, i) => ({ name: i, value: Math.random() * 100 }));
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <Line type="stepAfter" dataKey="value" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}

function ActivityLogWidget() {
    return (
        <div className="w-full h-full overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 font-mono text-[10px]">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-2 text-white/50 border-b border-white/5 pb-2">
                    <span className="text-emerald-400">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
                    <span>System node {Math.floor(Math.random()*1000)} synchronized.</span>
                </div>
            ))}
        </div>
    );
}

function NetworkNodesWidget() {
    return (
        <div className="w-full h-full relative font-mono text-[10px] text-white/50 flex items-center justify-center">
             <div className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] animate-pulse" style={{ top: '20%', left: '20%' }} />
             <div className="absolute w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7] animate-pulse" style={{ top: '70%', left: '30%' }} />
             <div className="absolute w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" style={{ top: '40%', left: '80%' }} />
             <div className="absolute w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e] animate-pulse" style={{ top: '80%', left: '70%' }} />
             <svg className="absolute inset-0 w-full h-full pointer-events-none">
                 <path d="M 20% 20% L 30% 70% L 80% 40% L 70% 80% Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
             </svg>
             <span className="uppercase tracking-widest bg-black/50 px-2 rounded-lg backdrop-blur-sm z-10 border border-white/10">Active Neural Web</span>
        </div>
    );
}
