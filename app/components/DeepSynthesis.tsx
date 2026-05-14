// --- CORE IMPORTS ---
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Monitor, Share2, Download, BookOpen, PieChart, Network, 
  CirclePlay, Eye, ChevronRight, DownloadCloud, Layers, Target, 
  Star, Activity, Moon, Sun, Globe, User, Fingerprint, Volume2,
  Trash2, Plus, Edit3, Save, X, Sparkles, RefreshCw, MousePointer2
} from 'lucide-react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  MarkerType,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  BaseEdge,
  getBezierPath
} from '@xyflow/react';

// --- VISUALIZATION LIBRARIES ---
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { CosmicData, MindMapNode } from '../types';
import { fetchGeneralDeepDive } from '../services/geminiService';
import { useProfileStore } from '../services/profileService';
import { useHigherMind } from './HigherMindProvider';

import { CosmicSummary } from './CosmicSummary';

const colorMap: Record<string, { main: string, text: string, bg: string, border: string, glow: string }> = {
  emerald: { main: 'emerald', text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' },
  sky: { main: 'sky', text: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/30', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]' },
  rose: { main: 'rose', text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]' },
  amber: { main: 'amber', text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' },
  fuchsia: { main: 'fuchsia', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/30', glow: 'shadow-[0_0_20px_rgba(217,70,239,0.2)]' },
  indigo: { main: 'indigo', text: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', glow: 'shadow-[0_0_30px_rgba(99,102,241,0.3)]' },
  purple: { main: 'purple', text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]' },
  stone: { main: 'stone', text: 'text-stone-400', bg: 'bg-stone-500/20', border: 'border-stone-500/30', glow: 'shadow-[0_0_20px_rgba(120,113,108,0.1)]' },
};

/**
 * Custom Cosmic Node Component for React Flow
 */
const CosmicNode = ({ data, selected }: NodeProps) => {
  const color = data.color as string || 'stone';
  const colors = colorMap[color];
  const type = data.type as string;

  return (
    <div className={`group relative w-48 transition-all duration-500 ${selected ? 'scale-105' : 'hover:scale-102'}`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className={`w-full p-4 rounded-[2rem] border backdrop-blur-xl flex flex-col items-center text-center space-y-2 relative overflow-hidden transition-all duration-500
        ${selected ? 'border-white bg-white/20' : 'border-white/10 bg-black/40'} 
        ${selected ? colors.glow : ''}
      `}>
        {/* Type indicator */}
        <div className={`text-[8px] uppercase tracking-widest font-bold ${colors.text} opacity-80 uppercase`}>
          {data.label as React.ReactNode}
        </div>
        
        {/* Accent line */}
        <div className={`h-0.5 w-8 rounded-full ${colors.bg}`} />
        
        {/* Description */}
        <div className="text-[10px] text-stone-400 font-light leading-relaxed italic line-clamp-3">
          "{data.description as React.ReactNode}"
        </div>

        {selected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-2 -right-2 bg-purple-600 rounded-full p-1.5 shadow-xl shadow-purple-900/40 z-20"
          >
            <Sparkles size={10} className="text-white" />
          </motion.div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  cosmic: CosmicNode,
};

/**
 * Available Synthesis View Modes
 */
type SynthesisMode = 'overview' | 'infographic' | 'mindmap' | '3d' | 'video' | 'summary';

/**
 * DeepSynthesis Component
 * High-fidelity data visualization module offering multiple perspectives on cosmic data.
 */
export const DeepSynthesis = ({ data, onPresentationRequest }: { data: CosmicData | null, onPresentationRequest: () => void }) => {
  // --- COMPONENT STATE & VIEW REFS ---
  const [mode, setMode] = useState<SynthesisMode>('summary');
  const [infographicType, setInfographicType] = useState<'identity' | 'path' | 'karmic' | 'resonance'>('identity');
  const [videoStep, setVideoStep] = useState(0);
  const { saveToChat } = useHigherMind();
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // --- MIND MAP (REACT FLOW) STATE ---
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const updateMindMap = useProfileStore(state => state.updateMindMap);
  const saveProfile = useProfileStore(state => state.saveProfile);

  // Initialize React Flow from data
  useEffect(() => {
    if (data && nodes.length === 0) {
      const initialNodes: Node[] = [
        { id: 'astrology', type: 'cosmic', position: { x: 100, y: 100 }, data: { label: 'ASTROLOGY', color: 'emerald', description: `Celestial alignments for ${data.planets?.[0]?.sign}`, type: 'category' } },
        { id: 'numerology', type: 'cosmic', position: { x: 600, y: 150 }, data: { label: 'NUMEROLOGY', color: 'sky', description: `Vibrational resonance: Life Path ${data.numerology.lifePath}`, type: 'category' } },
        { id: 'gematria', type: 'cosmic', position: { x: 150, y: 600 }, data: { label: 'GEMATRIA', color: 'rose', description: `Mathematical signature: ${data.gematria.nameValue}`, type: 'category' } },
        { id: 'akashic', type: 'cosmic', position: { x: 650, y: 600 }, data: { label: 'AKASHIC', color: 'amber', description: `Soul origin: ${data.akashic?.soulOrigin}`, type: 'category' } },
        { id: 'patterns', type: 'cosmic', position: { x: 800, y: 350 }, data: { label: 'PATTERNS', color: 'fuchsia', description: `Core theme: ${data.patterns?.coreTheme}`, type: 'category' } },
        { id: 'center', type: 'cosmic', position: { x: 400, y: 400 }, data: { label: 'IDENTITY HUB', color: 'indigo', description: data.synthesis, type: 'core' } },
      ];

      const initialEdges: Edge[] = [
        { id: 'e-astrology-center', source: 'astrology', target: 'center', markerEnd: { type: MarkerType.ArrowClosed, color: '#333' }, style: { stroke: '#444' } },
        { id: 'e-numerology-center', source: 'numerology', target: 'center', markerEnd: { type: MarkerType.ArrowClosed, color: '#333' }, style: { stroke: '#444' } },
        { id: 'e-gematria-center', source: 'gematria', target: 'center', markerEnd: { type: MarkerType.ArrowClosed, color: '#333' }, style: { stroke: '#444' } },
        { id: 'e-akashic-center', source: 'akashic', target: 'center', markerEnd: { type: MarkerType.ArrowClosed, color: '#333' }, style: { stroke: '#444' } },
        { id: 'e-patterns-center', source: 'patterns', target: 'center', markerEnd: { type: MarkerType.ArrowClosed, color: '#333' }, style: { stroke: '#444' } },
      ];

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [data]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleUpdateNode = (nodeId: string, updates: any) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, ...updates } };
      }
      return node;
    }));
  };

  const handleAddNode = useCallback((event: any) => {
    const id = `custom-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'cosmic',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        label: 'NEW INSIGHT',
        description: 'Define your cosmic connection...',
        color: 'stone',
        type: 'custom'
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
    setIsEditingNode(true);
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (nodeId === 'center') return;
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const handleExpandNode = async (node: Node) => {
    if (!data || isExpanding) return;
    setIsExpanding(true);
    try {
      const result = await fetchGeneralDeepDive(node.data.label as string, node.data.description as string, data);
      
      const id = `insight-${Date.now()}`;
      const newNode: Node = {
        id,
        type: 'cosmic',
        position: { x: node.position.x + 200, y: node.position.y + 100 },
        data: {
          label: result.followUpOptions[0].toUpperCase(),
          description: result.detailedAnalysis.slice(0, 150) + '...',
          color: 'purple',
          type: 'insight'
        },
      };
      
      const newEdge: Edge = {
        id: `e-${node.id}-${id}`,
        source: node.id,
        target: id,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
        style: { stroke: '#444' }
      };

      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) => eds.concat(newEdge));
      setSelectedNodeId(id);
    } catch (error) {
      console.error("Failed to expand node:", error);
    } finally {
      setIsExpanding(false);
    }
  };

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const handleDownloadMindMap = () => {
    if (nodes.length === 0) return;
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'cosmic-mindmap.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const colorOptions = [
    { id: 'emerald', label: 'Emerald' },
    { id: 'sky', label: 'Sky' },
    { id: 'rose', label: 'Rose' },
    { id: 'amber', label: 'Amber' },
    { id: 'fuchsia', label: 'Fuchsia' },
    { id: 'indigo', label: 'Indigo' },
    { id: 'purple', label: 'Purple' },
    { id: 'stone', label: 'Stone' },
  ];

  // --- NARRATIVE AUDIO ENGINE ---
  const handleReadOutLoud = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.95;
      utterance.pitch = 1.1; // Slightly higher for "synthesis" vibe
      
      setIsReading(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis is not supported in this browser.");
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // --- ANIMATION & AUTO-PLAY LOGIC ---
  useEffect(() => {
    let interval: any;
    if (isAutoPlaying && mode === 'video') {
      interval = setInterval(() => {
        setVideoStep(prev => (prev + 1) % 5);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, mode]);

  if (!data) return null;

  // --- STATIC CONFIG DATA ---
  const infographicData = [
    { subject: 'Consciousness', A: 85, fullMark: 100 },
    { subject: 'Intuition', A: 92, fullMark: 100 },
    { subject: 'Structure', A: 68, fullMark: 100 },
    { subject: 'Emotion', A: 75, fullMark: 100 },
    { subject: 'Logic', A: 80, fullMark: 100 },
    { subject: 'Cosmic Edge', A: 90, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* --- TOP NAVIGATION BAR --- */}
      <div className="flex bg-black/40 border border-white/5 p-2 rounded-2xl md:rounded-[2.5rem] items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 p-1">
          {[
            { id: 'summary', label: 'Summary', icon: BookOpen },
            { id: 'overview', label: 'Overview', icon: Zap },
            { id: 'infographic', label: 'Infographic', icon: Monitor },
            { id: 'mindmap', label: 'Mind Map', icon: Network },
            { id: '3d', label: '3D Journey', icon: Layers },
            { id: 'video', label: 'Cinematic', icon: CirclePlay }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as SynthesisMode); setVideoStep(0); setIsAutoPlaying(m.id === 'video'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${mode === m.id ? 'bg-white/10 text-white border border-white/20' : 'text-stone-500 hover:text-stone-300'}`}
            >
              <m.icon size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">{m.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 pr-4">
           <button 
             onClick={() => handleReadOutLoud(mode === 'overview' ? data.synthesis : mode === 'infographic' ? `Identity report for ${data.planets?.[0]?.name}. Master synthesis: ${data.synthesis}` : 'Cosmic deep synthesis data')}
             className={`p-2 transition-all rounded-lg ${isReading ? 'text-purple-400 bg-purple-500/10 animate-pulse' : 'text-stone-500 hover:text-white'}`}
             title="Read Out Loud (AI)"
           >
             <Volume2 size={18} />
           </button>
           <button className="p-2 text-stone-500 hover:text-white transition-colors"><Download size={18} /></button>
           <button className="p-2 text-stone-500 hover:text-white transition-colors"><Share2 size={18} /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {mode === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="h-full"
            >
              <CosmicSummary data={data} />
            </motion.div>
          )}

          {mode === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black p-8 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(168,85,247,0.1),transparent)] group-hover:scale-110 transition-transform duration-1000"></div>
                  <h2 className="text-3xl font-light text-white mb-4 relative z-10">The Harmonic Signature</h2>
                  <p className="text-lg font-light text-stone-300 leading-relaxed italic relative z-10">"{data.synthesis}"</p>
                  <div className="mt-8 flex gap-4 relative z-10">
                     <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] uppercase tracking-widest font-bold">Node Stabilized</div>
                     <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-[10px] uppercase tracking-widest font-bold">Master Vector Detected</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {data.patterns?.timeDateDiscovery && (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="col-span-2 bg-gradient-to-r from-amber-900/30 to-amber-600/10 border border-amber-500/30 rounded-3xl p-6 relative group overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Star className="w-20 h-20 text-amber-400" />
                      </div>
                      <div className="text-amber-500 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Essential Pattern Recognition
                      </div>
                      <div className="text-xl text-white font-light mb-1">{data.patterns.timeDateDiscovery.title}</div>
                      <div className="text-[10px] font-mono text-amber-200/60 mb-2">{data.patterns.timeDateDiscovery.mathematicalPattern}</div>
                      <p className="text-xs text-stone-300 italic leading-relaxed">"{data.patterns.timeDateDiscovery.description}"</p>
                    </motion.div>
                  )}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all">
                     <div className="text-stone-500 text-[10px] uppercase tracking-widest mb-2">Primary Destiny Arc</div>
                     <div className="text-xl text-white font-light">{data.planets?.[0]?.sign} {data.planets?.[0]?.name}</div>
                     <p className="text-xs text-stone-400 mt-2 italic">"{data.planets?.[0]?.interpretation?.split('.')[0] || 'Celestial alignment in progress'}."</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all">
                     <div className="text-stone-500 text-[10px] uppercase tracking-widest mb-2">Soul Resonance Number</div>
                     <div className="text-3xl text-sky-400 font-light">{data.numerology.coreNumbers?.[0]?.value || '0'}</div>
                     <p className="text-xs text-stone-400 mt-2 font-bold uppercase tracking-widest">{data.numerology.coreNumbers?.[0]?.name || 'Value'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-900/40 rounded-[3rem] border border-white/5 p-6 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-48 h-48 relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={infographicData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8 }} />
                        <Radar name="You" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
                <div>
                   <h4 className="text-white font-light text-xl">Cosmic Balance Index</h4>
                   <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1 italic leading-relaxed">Evaluation of metaphysical attributes across the gathered research datasets.</p>
                </div>
                <button onClick={() => setMode('infographic')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 transition-all">View Full Infographic</button>
              </div>
            </motion.div>
          )}

          {mode === 'infographic' && (
            <motion.div 
              key="infographic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full bg-white/5 rounded-[3rem] border border-white/10 p-6 md:p-10 overflow-y-auto scrollbar-thin overflow-x-hidden relative flex flex-col"
            >
              {/* Infographic Options Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-10 shrink-0">
                <div className="flex gap-2 p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'identity', label: 'Identity Blueprint' },
                    { id: 'path', label: 'Life Path Journey' },
                    { id: 'karmic', label: 'Karmic & Akashic' },
                    { id: 'resonance', label: 'Torus Resonance' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setInfographicType(opt.id as any)}
                      className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${infographicType === opt.id ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'text-stone-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => saveToChat(`Cosmic Infographic: ${infographicType}`, `Infographic breakdown of ${infographicType} for cosmic profile synthesis.`, 'Infographic')}
                    className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                  >
                    <Save size={14} />
                    Save result to Chat
                  </button>
                  <button className="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 rounded-2xl transition-all">
                    <DownloadCloud size={18} />
                  </button>
                </div>
              </div>

              {/* Infographic Content Wrapper */}
              <div className="flex-1 min-h-0 bg-stone-900/40 rounded-[2rem] border border-white/5 p-6 md:p-10 relative overflow-hidden backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  {infographicType === 'identity' && (
                    <motion.div key="identity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 max-w-4xl mx-auto h-full overflow-y-auto scrollbar-thin pr-2">
                       <div className="text-center space-y-4">
                         <div className="text-fuchsia-500 text-xs font-bold uppercase tracking-[0.4em]">Universal Hologram Map</div>
                         <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight">Identity Report</h1>
                         <div className="h-px w-32 bg-gradient-to-r from-transparent via-stone-500 to-transparent mx-auto"></div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-12 items-center">
                         <div className="space-y-8">
                            <section>
                              <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4 font-bold border-b border-white/5 pb-2">Astrological Landscape</h3>
                              <div className="space-y-4">
                                {data.planets?.slice(0, 3).map((p, i) => (
                                  <div key={i} className="flex gap-4">
                                    <div className="text-2xl text-white font-light w-12">{p.sign?.slice(0, 2)}</div>
                                    <div>
                                      <div className="text-sm text-stone-200 font-medium">{p.name} in {p.sign}</div>
                                      <p className="text-xs text-stone-500 leading-relaxed font-light">{p.interpretation?.slice(0, 100)}...</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                            <section>
                              <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4 font-bold border-b border-white/5 pb-2">Vibrational Values</h3>
                              <div className="grid grid-cols-2 gap-4">
                                 {data.numerology.coreNumbers?.slice(0, 4).map((n, i) => (
                                   <div key={i} className="p-3 bg-black/20 rounded-xl border border-white/5">
                                      <div className="text-[10px] text-stone-600 uppercase tracking-widest">{n.name}</div>
                                      <div className="text-2xl text-sky-400 font-light">{n.value}</div>
                                   </div>
                                 ))}
                              </div>
                            </section>
                         </div>
                         <div className="bg-black/40 p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                           <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 blur-[80px]"></div>
                           <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
                              <PieChart className="w-5 h-5 text-purple-400" />
                              Attribute Mapping
                           </h3>
                           <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={infographicData}>
                                   <PolarGrid stroke="#444" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                   <Radar name="Value" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                </RadarChart>
                              </ResponsiveContainer>
                           </div>
                         </div>
                       </div>

                       <div className="bg-black/40 p-10 rounded-[3rem] border border-white/10 text-center">
                          <h3 className="text-2xl font-light text-white mb-4">Master Synthesis Statement</h3>
                          <p className="text-xl font-light text-stone-400 leading-relaxed italic max-w-2xl mx-auto">"{data.synthesis}"</p>
                       </div>
                    </motion.div>
                  )}

                  {infographicType === 'path' && (
                    <motion.div key="path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 max-w-4xl mx-auto h-full overflow-y-auto scrollbar-thin pr-2">
                      <div className="text-center space-y-4">
                        <div className="text-sky-500 text-xs font-bold uppercase tracking-[0.4em]">Destiny Arc & Trajectory</div>
                        <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight">Life Path Evolution</h1>
                        <div className="h-px w-32 bg-gradient-to-r from-transparent via-sky-500 to-transparent mx-auto"></div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 bg-sky-900/20 border border-sky-500/30 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
                          <div className="text-sky-400 text-xs uppercase tracking-widest font-bold mb-4">Core Path</div>
                          <div className="text-8xl font-light text-white mb-4">{data.numerology.lifePath}</div>
                          <p className="text-sm font-light text-sky-200/80 italic">{data.numerology.lifePathMeaning?.slice(0, 150) || 'A journey of profound inner transformation.'}...</p>
                        </div>
                        
                        <div className="md:col-span-2 space-y-4">
                          <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4 font-bold border-b border-white/5 pb-2">Destiny Timeline Points</h3>
                          {data.timeline && data.timeline.length > 0 ? data.timeline.slice(0, 3).map((t, i) => (
                            <div key={i} className="flex gap-6 items-center p-6 bg-black/40 rounded-2xl border border-white/5 relative">
                               <div className="shrink-0 w-16 text-right">
                                  <div className="text-xl font-light text-white">{t.year}</div>
                                  <div className="text-[10px] text-stone-500 uppercase tracking-widest">Age {t.age}</div>
                               </div>
                               <div className="w-px h-12 bg-white/10 relative">
                                  <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 rounded-full bg-sky-500/50 border-2 border-white/20"></div>
                               </div>
                               <div>
                                  <div className="text-sm text-stone-200">{t.highlight}</div>
                                  <div className="text-[10px] text-sky-400/80 uppercase tracking-wider mt-1">{t.houseSignificance}</div>
                               </div>
                            </div>
                          )) : (
                            <div className="p-8 text-center text-stone-500 italic text-sm">Timeline data synchronizing...</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-sky-900/20 to-black p-8 rounded-[2rem] border border-sky-500/20 mt-8">
                        <h3 className="text-sky-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">Life Strategy & Forward Momentum</h3>
                        <p className="text-sm text-stone-300 leading-relaxed font-light text-center max-w-3xl mx-auto italic">
                          "{data.lifeStrategy?.goalPlan || data.patterns?.coreTheme || 'Aligning actions with cosmic intent creates frictionless manifestation.'}"
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {infographicType === 'karmic' && (
                    <motion.div key="karmic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 max-w-4xl mx-auto h-full overflow-y-auto scrollbar-thin pr-2">
                       <div className="text-center space-y-4">
                         <div className="text-amber-500 text-xs font-bold uppercase tracking-[0.4em]">Soul Ledger & Incarnation</div>
                         <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight">Akashic Blueprint</h1>
                         <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
                       </div>

                       <div className="relative p-10 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05),transparent_70%)] border border-amber-900/30 rounded-[3rem]">
                         <div className="grid md:grid-cols-2 gap-12 relative z-10">
                           <div className="space-y-8">
                              <div className="space-y-2">
                                <div className="text-[10px] text-amber-500/80 uppercase font-bold tracking-[0.3em]">Soul Origin</div>
                                <div className="text-2xl font-light text-white">{data.akashic?.soulOrigin || 'Earth / Lyran Ascendant'}</div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-[0.3em] border-b border-white/5 pb-2">Past Life Themes</div>
                                <p className="text-sm font-light text-stone-300 italic leading-relaxed">
                                  "{data.akashic?.pastLifeThemes || data.torusAnalysis?.karmicTheme || 'Echoes of ancient wisdom resolving in the present.'}"
                                </p>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="text-[10px] text-stone-500 uppercase font-bold tracking-[0.3em] border-b border-white/5 pb-2">Karmic Debts & Lessons</div>
                                <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-2xl">
                                  <p className="text-xs font-light text-red-200/80 leading-relaxed">{data.akashic?.karmicDebts || 'No significant outstanding debts. Focus is on mastery and service.'}</p>
                                </div>
                              </div>
                           </div>
                           
                           <div className="flex flex-col items-center justify-center space-y-8 relative">
                              <div className="w-48 h-48 rounded-full border border-amber-500/30 flex items-center justify-center relative shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                                 <div className="w-32 h-32 rounded-full border border-amber-500/50 flex items-center justify-center animate-[spin_60s_linear_infinite]">
                                   <div className="w-20 h-20 rounded-full bg-amber-500/20 blur-md"></div>
                                 </div>
                                 <Fingerprint className="w-12 h-12 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
                              </div>
                              
                              <div className="text-center">
                                <div className="text-[10px] text-amber-500/80 uppercase font-bold tracking-[0.3em] mb-2">Soul Gifts</div>
                                <p className="text-xs text-stone-400 italic max-w-xs">{data.akashic?.soulGifts || 'Innate healing, structural manifestation, intuitive leadership.'}</p>
                              </div>
                           </div>
                         </div>
                       </div>
                    </motion.div>
                  )}

                  {infographicType === 'resonance' && (
                    <motion.div key="resonance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 max-w-4xl mx-auto h-full overflow-y-auto scrollbar-thin pr-2">
                       <div className="text-center space-y-4">
                         <div className="text-emerald-500 text-xs font-bold uppercase tracking-[0.4em]">Energy Flow & Geometry</div>
                         <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight">Torus Resonance</h1>
                         <div className="h-px w-32 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto"></div>
                       </div>

                       <div className="space-y-8">
                         <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-[2rem] p-8 space-y-6">
                              <h3 className="text-xs uppercase font-bold tracking-widest text-emerald-400 text-center">Energy Centers (Chakras)</h3>
                              <div className="space-y-4">
                                {data.chakras?.slice(0, 5).map((c, i) => (
                                  <div key={i} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-80 shrink-0 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: c.color, color: c.color }}>
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold text-stone-200 uppercase tracking-widest">{c.name}</span>
                                        <span className="text-[10px] text-emerald-400">{c.score}%</span>
                                      </div>
                                      <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${c.score}%` }}></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {(!data.chakras || data.chakras.length === 0) && (
                                  <div className="text-stone-500 text-sm text-center italic py-4">Chakra data aligning...</div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
                                <div className="text-[10px] text-emerald-500 uppercase font-bold tracking-[0.3em] mb-2">Body & Earth Flow</div>
                                <p className="text-sm font-light text-stone-300 italic leading-relaxed">"{data.torusAnalysis?.bodyAndFlow || 'Strong grounding vectors drawing current upwards from the core.'}"</p>
                              </div>
                              <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
                                <div className="text-[10px] text-purple-500 uppercase font-bold tracking-[0.3em] mb-2">Mind & Cosmic Flow</div>
                                <p className="text-sm font-light text-stone-300 italic leading-relaxed">"{data.torusAnalysis?.mindAndSpiritual || 'Expanded crown aperture receiving high levels of abstraction.'}"</p>
                              </div>
                            </div>
                         </div>
                         
                         <div className="bg-black/40 p-8 rounded-[2rem] border border-emerald-500/20 text-center">
                           <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Overall Biometric Geometry</div>
                           <p className="text-lg font-light text-white italic max-w-2xl mx-auto">"{data.torusAnalysis?.overallAnalogy || 'The energetic structure resembles a steady, balanced sphere with clear pathways for intuition and logic.'}"</p>
                         </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {mode === 'mindmap' && (
            <motion.div 
              key="mindmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full bg-black/40 rounded-[3rem] border border-white/10 overflow-hidden relative"
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                onPaneClick={() => { setSelectedNodeId(null); setIsEditingNode(false); }}
                fitView
                className="cosmic-flow"
              >
                <Background color="#333" gap={20} />
                <Controls className="bg-stone-900 border border-white/10 p-1 fill-white" />
                
                <Panel position="top-right" className="flex gap-2">
                  <button 
                    onClick={handleAddNode}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[9px] uppercase tracking-widest font-bold shadow-lg shadow-purple-900/40 transition-all active:scale-95"
                  >
                    <Plus size={14} /> Add Cosmic Node
                  </button>
                </Panel>

                <Panel position="bottom-left" className="p-4">
                  <div className="px-6 py-3 bg-black/60 rounded-full border border-white/10 text-[9px] uppercase tracking-widest text-stone-400 font-bold backdrop-blur-md flex items-center gap-4">
                     <span>V.03 Neural Flow • {nodes.length} Active Nodes</span>
                     <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                     </div>
                  </div>
                </Panel>
              </ReactFlow>

              {/* Node Sidebar / Modal */}
              <AnimatePresence>
                {selectedNodeId && selectedNode && (
                  <motion.div 
                    initial={{ x: 400 }}
                    animate={{ x: 0 }}
                    exit={{ x: 400 }}
                    className="absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-xl border-l border-white/10 p-8 z-20 flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-8">
                       <div className="flex items-center gap-2">
                         <Network size={16} className="text-purple-400" />
                         <h3 className="text-white text-xs font-bold uppercase tracking-[0.3em]">Node Metadata</h3>
                       </div>
                       <button onClick={() => setSelectedNodeId(null)} className="p-2 text-stone-500 hover:text-white"><X size={18} /></button>
                    </div>

                    {isEditingNode ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] text-stone-500 uppercase font-bold">Resonance Label</label>
                           <input 
                             type="text" 
                             value={selectedNode.data.label as string || ''}
                             onChange={(e) => handleUpdateNode(selectedNodeId, { label: e.target.value })}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] text-stone-500 uppercase font-bold">Vibrational Shade</label>
                           <div className="grid grid-cols-4 gap-2">
                              {colorOptions.map(opt => (
                                <button
                                  key={opt.id}
                                  onClick={() => handleUpdateNode(selectedNodeId, { color: opt.id })}
                                  className={`w-full aspect-square rounded-lg border transition-all ${selectedNode.data.color === opt.id ? 'border-white scale-110' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                                  style={{ backgroundColor: colorMap[opt.id]?.main === 'emerald' ? '#10b981' : colorMap[opt.id]?.main === 'sky' ? '#0ea5e9' : colorMap[opt.id]?.main === 'rose' ? '#f43f5e' : colorMap[opt.id]?.main === 'amber' ? '#f59e0b' : colorMap[opt.id]?.main === 'fuchsia' ? '#c026d3' : colorMap[opt.id]?.main === 'indigo' ? '#4f46e5' : colorMap[opt.id]?.main === 'purple' ? '#9333ea' : '#78716c' }}
                                  title={opt.label}
                                />
                              ))}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] text-stone-500 uppercase font-bold">Insight Transmission</label>
                           <textarea 
                             rows={5}
                             value={selectedNode.data.description as string || ''}
                             onChange={(e) => handleUpdateNode(selectedNodeId, { description: e.target.value })}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none resize-none text-sm font-light italic"
                           />
                        </div>
                        <button 
                          onClick={() => setIsEditingNode(false)}
                          className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase text-white tracking-widest transition-all border border-white/5"
                        >
                          Stabilize Selection
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div>
                           <div className={`text-[10px] uppercase tracking-widest mb-2 font-bold ${colorMap[selectedNode.data.color as string]?.text || 'text-stone-500'}`}>
                             {selectedNode.data.type as string === 'core' ? 'Primary Core' : 'Knowledge Node'}
                           </div>
                           <h2 className="text-3xl text-white font-light tracking-tight">{selectedNode.data.label as string}</h2>
                        </div>
                        <p className="text-stone-400 font-light italic leading-relaxed text-sm">
                          "{selectedNode.data.description as string}"
                        </p>
                        
                        <div className="space-y-3">
                           <button onClick={() => setIsEditingNode(true)} className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                              <div className="flex items-center gap-3">
                                <Edit3 size={14} className="text-stone-500 group-hover:text-purple-400" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-300">Edit Frequency</span>
                              </div>
                           </button>
                           {selectedNode.id !== 'center' && (
                             <>
                               <button 
                                 onClick={() => handleExpandNode(selectedNode)} 
                                 disabled={isExpanding}
                                 className="w-full flex items-center justify-between px-6 py-4 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 rounded-2xl transition-all group"
                               >
                                  <div className="flex items-center gap-3">
                                    <Sparkles size={14} className={isExpanding ? 'animate-spin text-purple-400' : 'text-purple-400'} />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-purple-300">Trigger AI Synthesis</span>
                                  </div>
                               </button>
                               <button 
                                 onClick={() => handleDeleteNode(selectedNode.id)}
                                 className="w-full flex items-center justify-between px-6 py-4 bg-rose-900/10 hover:bg-rose-900/20 border border-rose-500/20 rounded-2xl transition-all group"
                               >
                                  <div className="flex items-center gap-3">
                                    <Trash2 size={14} className="text-rose-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-rose-400 opacity-60">Prune Connection</span>
                                  </div>
                               </button>
                             </>
                           )}
                        </div>
                        
                        <div className="pt-8 border-t border-white/5">
                           <div className="flex items-center gap-2 mb-4">
                              <MousePointer2 size={12} className="text-stone-600" />
                              <span className="text-[8px] uppercase tracking-[0.2em] text-stone-600 font-bold">Interface Tip</span>
                           </div>
                           <p className="text-[10px] text-stone-500 italic leading-relaxed">
                             Click and drag to reposition nodes. Connect handles to form new associations. Use the mouse wheel to navigate dimensions.
                           </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-8 right-8 flex items-center justify-end gap-4 pointer-events-auto">
                <button 
                  onClick={handleDownloadMindMap}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-stone-400 hover:text-white transition-all shadow-xl"
                  title="Export Neural Map (JSON)"
                >
                  <DownloadCloud size={16} />
                </button>
                <button 
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-[10px] uppercase tracking-widest text-white font-bold backdrop-blur-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-95"
                  onClick={async () => {
                    if (nodes.length > 0) {
                      // Map back to MindMapNode structure if needed for store
                      const mappedMindMap = {
                        nodes: nodes.map(n => ({
                          id: n.id,
                          label: n.data.label as string,
                          description: n.data.description as string,
                          x: n.position.x,
                          y: n.position.y,
                          color: n.data.color as string,
                          connections: edges.filter(e => e.source === n.id).map(e => e.target),
                          type: n.data.type as any
                        })),
                        centerNode: nodes.find(n => n.id === 'center') ? {
                           id: 'center',
                           label: nodes.find(n => n.id === 'center')!.data.label as string,
                           description: nodes.find(n => n.id === 'center')!.data.description as string,
                           x: nodes.find(n => n.id === 'center')!.position.x,
                           y: nodes.find(n => n.id === 'center')!.position.y,
                           color: nodes.find(n => n.id === 'center')!.data.color as string,
                           connections: [],
                           type: 'core'
                        } as any : null
                      };
                      updateMindMap(mappedMindMap);
                      await saveProfile();
                      alert('Neural Matrix stabilized and saved to your Research Vault.');
                    }
                  }}
                >
                   Stabilize Connection
                </button>
              </div>
            </motion.div>
          )}

          {mode === '3d' && (
            <motion.div 
               key="3d"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="h-full bg-black/40 rounded-[3rem] border border-white/10 flex flex-col items-center justify-center text-center p-10 relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent)]"></div>
               <div className="relative z-10 space-y-6 max-w-md">
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto animate-pulse">
                    <Layers className="w-12 h-12 text-stone-700" />
                 </div>
                 <h2 className="text-3xl font-light text-white">Spatial Immersion</h2>
                 <p className="text-sm text-stone-400 font-light leading-relaxed italic">
                   "Launch into a 3D cinematic presentation of your data. The central hologram will transform into a narrative experience."
                 </p>
                 <button 
                  onClick={onPresentationRequest}
                  className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] text-white transition-all shadow-xl"
                 >
                   Launch 3D Presentation
                 </button>
               </div>
            </motion.div>
          )}

          {mode === 'video' && (
            <motion.div 
               key="video"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="h-full bg-black rounded-[3rem] border border-white/10 overflow-hidden relative group"
            >
               <div className="absolute inset-0 overflow-hidden opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 animate-pulse"></div>
               </div>

               <div className="absolute inset-0 flex items-center justify-center p-10">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={videoStep}
                      initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                      transition={{ duration: 1 }}
                      className="text-center space-y-6 max-w-2xl"
                    >
                      {videoStep === 0 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Chapter One: The Awakening</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Arrival</h2>
                          <p className="text-2xl font-light text-stone-400 italic">"The cosmic grid aligns as your singular consciousness enters the matrix."</p>
                        </>
                      )}
                      {videoStep === 1 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Chapter Two: The Alignment</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Origin</h2>
                          <div className="flex justify-center gap-6">
                             {data.planets?.slice(0, 3).map((p, i) => (
                               <div key={i} className="text-center">
                                 <div className="text-4xl text-purple-400 font-light">{p.sign?.slice(0, 2)}</div>
                                 <div className="text-[10px] text-stone-600 mt-2">{p.name}</div>
                               </div>
                             ))}
                          </div>
                          <p className="text-xl font-light text-stone-400">Planetary currents and celestial weights define the initial geometry.</p>
                        </>
                      )}
                      {videoStep === 2 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Chapter Three: The Vibration</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Essence</h2>
                          <div className="text-8xl text-sky-500 font-light">{data.numerology.lifePath}</div>
                          <p className="text-xl font-light text-stone-400">Your Life Path frequency: {data.numerology.lifePathMeaning?.slice(0, 100) || 'Universal calibration...'}...</p>
                        </>
                      )}
                      {videoStep === 3 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Chapter Four: The Synthesis</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Unity</h2>
                          <p className="text-2xl font-light text-stone-200 leading-relaxed italic">"{data.synthesis}"</p>
                        </>
                      )}
                      {videoStep === 4 && (
                        <>
                          <div className="text-stone-500 text-[10px] uppercase tracking-[0.6em] font-bold">Final Chapter: The Future</div>
                          <h2 className="text-6xl font-light text-white tracking-widest uppercase">Ascend</h2>
                          <p className="text-xl font-light text-stone-500">Node analysis complete. The journey continues beyond the threshold.</p>
                           <button onClick={() => setVideoStep(0)} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all">Replay Experience</button>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
               </div>

               {/* Video Controls Overlay */}
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setVideoStep(prev => (prev - 1 + 5) % 5)} className="text-stone-500 hover:text-white transition-colors"><ChevronRight className="rotate-180" /></button>
                  <button 
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)} 
                    className="p-3 bg-purple-600 rounded-full text-white shadow-lg shadow-purple-900/40"
                  >
                    {isAutoPlaying ? <Monitor size={20} /> : <CirclePlay size={20} />}
                  </button>
                  <button onClick={() => setVideoStep(prev => (prev + 1) % 5)} className="text-stone-500 hover:text-white transition-colors"><ChevronRight /></button>
                  <div className="flex gap-1 ml-4">
                     {[0, 1, 2, 3, 4].map(s => (
                       <div key={s} className={`h-1 rounded-full transition-all ${videoStep === s ? 'w-8 bg-purple-500' : 'w-2 bg-white/10'}`}></div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
