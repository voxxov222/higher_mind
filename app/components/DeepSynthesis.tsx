// --- CORE IMPORTS ---
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Monitor, Share2, Download, BookOpen, Network, 
  CirclePlay, ChevronRight, DownloadCloud, Layers, Target, 
  Star, Activity, Globe, Fingerprint, Volume2,
  Trash2, Plus, Edit3, Save, X, Sparkles, RefreshCw, MousePointer2,
  Settings2, VolumeX
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
import { SynthesisCore3D } from './SynthesisCore3D';
import { InfographicExportMenu } from './InfographicExportMenu';

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
const DeepSynthesisInner = ({ data, onPresentationRequest }: { data: CosmicData | null, onPresentationRequest: () => void }) => {
  // --- COMPONENT STATE & VIEW REFS ---
  const [mode, setMode] = useState<SynthesisMode>('summary');
  const [infographicType, setInfographicType] = useState<'identity' | 'path' | 'karmic' | 'resonance'>('identity');
  const [videoStep, setVideoStep] = useState(0);
  const { saveToChat } = useHigherMind();
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  // Background Ambient soundscape logic
  useEffect(() => {
    if (isAudioEnabled && typeof window !== 'undefined') {
      const startAmbient = async () => {
        if (!ambientRef.current) {
          const audio = new Audio();
          // Using a subtle high-quality procedural-style noise/drone if possible or a silent placeholder for now
          // In a real app we'd have a specific file, here we use a generated oscillate
          ambientRef.current = audio;
        }
      };
      startAmbient();
    } else if (ambientRef.current) {
      ambientRef.current.pause();
    }
  }, [isAudioEnabled]);
  
  // UI Controls
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [vizOptions, setVizOptions] = useState({
    show3D: true,
    showBloom: true,
    showGrid: true,
    showLabels: true,
    interactive: true
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [selectedInsight, setSelectedInsight] = useState<{ title: string; content: string; } | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const handleInteractiveInsight = async (title: string, context: string) => {
    setIsGeneratingInsight(true);
    setSelectedInsight({ title, content: "Channeling Akashic wisdom..." });
    try {
      const res = await fetchGeneralDeepDive(title, context, data!);
      setSelectedInsight({ title, content: res.detailedAnalysis });
    } catch (e) {
      setSelectedInsight({ title, content: "Synthesis interference detected. Please try again." });
    } finally {
      setIsGeneratingInsight(false);
    }
  };

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

  // --- AUDIO ENGINE ---
  useEffect(() => {
    if (isAudioEnabled) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-space-trip-loop-149.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.2;
      }
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    } else {
      audioRef.current?.pause();
    }
    return () => audioRef.current?.pause();
  }, [isAudioEnabled]);

  const playSFX = useCallback((type: 'transition' | 'click' | 'alert') => {
    if (!isAudioEnabled) return;
    const urls = {
      transition: 'https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-appearing-interface-device-3200.mp3',
      click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3',
      alert: 'https://assets.mixkit.co/sfx/preview/mixkit-hologram-appearing-1499.mp3'
    };
    const sfx = new Audio(urls[type]);
    sfx.volume = 0.3;
    sfx.play().catch(() => {});
  }, [isAudioEnabled]);

  // --- NARRATIVE AUDIO ENGINE ---
  const handleReadOutLoud = useCallback((text: string, force = false) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isReading && !force) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      const voices = window.speechSynthesis.getVoices();
      // Prefer a deep/authoritative voice if possible
      const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural') || v.name.includes('Daniel')) && v.lang.startsWith('en')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.rate = 0.8; // Slower for divine effect
      utterance.pitch = 0.9; // Lower pitch for authority
      
      setIsReading(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [isReading]);

  // Handle section changes with narration
  useEffect(() => {
    if (isAudioEnabled && data) {
      let welcomeText = "";
      switch(mode) {
        case 'overview': welcomeText = "Deciphering your fundamental planetary configuration. Your core signature is being analyzed across the spectral grid."; break;
        case 'infographic': welcomeText = `Accessing your structural blueprints. Current focus: ${infographicType === 'identity' ? 'Identity Signature' : infographicType === 'path' ? 'Life Path Evolution' : infographicType === 'karmic' ? 'Ancestral Soul Ledger' : 'Resonant Torus Field'}.`; break;
        case 'mindmap': welcomeText = "Opening the Neural Matrix. These nodes represent active connections within your higher consciousness."; break;
        case '3d': welcomeText = "Initializing Spatial Immersion. Your data is being projected into the third dimension for holistic observation."; break;
        case 'summary': welcomeText = `Neural Synthesis complete. Welcome back to the integrated summary of your current temporal incarnation. ${data.synthesis.slice(0, 150)}`; break;
      }
      if (welcomeText) {
        handleReadOutLoud(welcomeText, true);
        playSFX('transition');
      }
    }
  }, [mode, infographicType, isAudioEnabled, data, handleReadOutLoud, playSFX]);

  // Trigger narration for video steps
  useEffect(() => {
    if (mode === 'video' && isAudioEnabled) {
      let text = "";
      switch(videoStep) {
        case 0: text = "Chapter One. Arrival. The cosmic grid aligns as your singular consciousness enters the matrix threshold. Your energy is being synthesized into a coherent data stream."; break;
        case 1: text = `Chapter Two. Celestial Origin. Planetary currents and celestial weights define your geometric blueprint. Your dominant energy flows from ${data.planets?.[0]?.name} in ${data.planets?.[0]?.sign}, providing the foundational weight of your existence.`; break;
        case 2: text = `Chapter Three. Harmonic Essence. Your life path frequency is ${data.numerology.lifePath}. This vibrational archetype represents your soul's primary trajectory through the temporal lattice.`; break;
        case 3: text = `Chapter Four. Total Synthesis. ${data.synthesis}. All streams of data converge into this singular point of truth.`; break;
        case 4: text = "Final Chapter. Transcendence. Neural analysis complete. The journey continues beyond the threshold. You are now stabilized within the Higher Mind ecosystem."; break;
      }
      if (text) handleReadOutLoud(text, true);
      playSFX('transition');
    }
  }, [videoStep, mode, isAudioEnabled, data, handleReadOutLoud, playSFX]);

  // --- ANIMATION & AUTO-PLAY LOGIC ---
  useEffect(() => {
    let interval: any;
    if (isAutoPlaying && mode === 'video') {
      interval = setInterval(() => {
        setVideoStep(prev => (prev + 1) % 5);
      }, 8000); // 8 seconds per chapter for better narration pacing
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
    <div className="h-full flex flex-col space-y-6 relative overflow-hidden">
      {/* Dynamic 3D Layer */}
      {vizOptions.show3D && (
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          <SynthesisCore3D 
            color={infographicType === 'identity' ? '#a855f7' : infographicType === 'path' ? '#0ea5e9' : infographicType === 'karmic' ? '#f59e0b' : '#10b981'} 
            isCinematic={mode === 'video' || mode === '3d'}
          />
        </div>
      )}

      {/* --- TOP NAVIGATION BAR --- */}
      <div className="flex bg-black/40 backdrop-blur-xl border border-white/5 p-2 rounded-2xl md:rounded-[2.5rem] items-center justify-between shrink-0 overflow-x-auto no-scrollbar relative z-30">
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
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 transition-all rounded-lg ${isSettingsOpen ? 'text-purple-400 bg-purple-500/10' : 'text-stone-500 hover:text-white'}`}
              title="Visualization Options"
            >
              <Settings2 size={18} />
            </button>
            {/* Audio & Narration */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-2 transition-all rounded-lg ${isAudioEnabled ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-stone-500 hover:text-white'}`}
                title={isAudioEnabled ? "Silence System" : "Activate Harmonic Frequencies"}
              >
                <Volume2 size={18} className={isAudioEnabled ? 'animate-pulse' : ''} />
              </button>
              {isAudioEnabled && (
                <button 
                  onClick={() => handleReadOutLoud(mode === 'overview' ? data.synthesis : mode === 'infographic' ? `Identity report for ${data.planets?.[0]?.name}. Master synthesis: ${data.synthesis}` : data.synthesis)}
                  className={`p-2 transition-all rounded-lg ${isReading ? 'text-purple-400 bg-purple-500/10 animate-pulse' : 'text-stone-500 hover:text-white'}`}
                  title="Trigger Neural Narration"
                >
                  <Activity size={18} />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 text-stone-500 hover:text-white transition-colors"
            >
              <Download size={18} />
            </button>
            <button className="p-2 text-stone-500 hover:text-white transition-colors"><Share2 size={18} /></button>
          </div>
      </div>

      {/* Global Menus */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-8 z-40 w-64 bg-zinc-900/90 border border-white/10 rounded-2xl p-4 backdrop-blur-2xl shadow-2xl"
          >
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Rendering Parameters</div>
            <div className="space-y-3">
              {Object.entries(vizOptions).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400 capitalize">{key.replace('show', '')}</span>
                  <button 
                    onClick={() => setVizOptions(v => ({ ...v, [key]: !v[key] }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${val ? 'bg-purple-600' : 'bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${val ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {showExportMenu && (
          <InfographicExportMenu 
            targetId="cosmic-infographic-root" 
            fileName={`Cosmic_${mode}_${Date.now()}`}
            onClose={() => setShowExportMenu(false)}
          />
        )}
      </AnimatePresence>

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
              id="cosmic-infographic-root"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full bg-zinc-950 rounded-[3rem] border border-white/10 p-6 md:p-10 overflow-y-auto scrollbar-thin overflow-x-hidden relative flex flex-col z-20"
            >
              {/* Infographic Options Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-10 shrink-0 relative z-30">
                <div className="flex gap-2 p-1.5 bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
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
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 rounded-2xl transition-all"
                  >
                    <DownloadCloud size={18} />
                  </button>
                </div>
              </div>

              {/* Infographic Content Wrapper */}
              <div className="flex-1 min-h-0 bg-transparent rounded-[2rem] border border-white/5 p-6 md:p-10 relative overflow-hidden backdrop-blur-sm">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 180, 270, 360],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03)_0%,transparent_70%)]"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {infographicType === 'identity' && (
                    <motion.div key="identity" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-20 max-w-4xl mx-auto h-full overflow-y-auto scrollbar-thin pr-4 pb-20">
                       <div className="text-center space-y-6">
                         <motion.div 
                           initial={{ opacity: 0, y: -20 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="text-fuchsia-500 text-xs font-bold uppercase tracking-[0.8em] animate-pulse"
                         >
                           Universal Hologram Map • Quantum Edition
                         </motion.div>
                         <h1 className="text-5xl md:text-9xl font-black text-white tracking-tighter leading-none">IDENTITY<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-600">SIGNATURE</span></h1>
                         <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto"></div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-16 items-start">
                         <div className="space-y-12">
                            <motion.section 
                              initial={{ x: -30, opacity: 0 }}
                              whileInView={{ x: 0, opacity: 1 }}
                              className="bg-zinc-900/40 p-8 rounded-[3rem] border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden"
                            >
                              <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 blur-[50px]" />
                              <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-8 font-black flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
                                ASTROLOGICAL CORE
                              </h3>
                              <div className="space-y-8">
                                {data.planets?.slice(0, 4).map((p, i) => (
                                  <div 
                                    key={i} 
                                    className="flex gap-8 group/item cursor-pointer hover:bg-white/5 p-4 -ml-4 rounded-3xl transition-all"
                                    onClick={() => handleInteractiveInsight(`Planet ${p.name} Synthesis`, `Provide a deep dive into the impact of ${p.name} in ${p.sign} in the ${p.house} house as part of the overall structural identity blueprint.`)}
                                  >
                                    <div className="text-4xl text-zinc-100 font-black w-14 shrink-0 group-hover/item:text-purple-400 transition-colors uppercase tracking-tighter">{p.sign?.slice(0, 2)}</div>
                                    <div className="border-l border-zinc-800 pl-8 space-y-1">
                                      <div className="text-sm text-zinc-200 font-bold tracking-tight uppercase tracking-widest">{p.name} • {p.sign}</div>
                                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">House {p.house || (i + 1)}</div>
                                      <p className="text-xs text-zinc-500 leading-relaxed font-light mt-2 italic opacity-70 group-hover/item:opacity-100 transition-opacity flex items-center justify-between gap-4">
                                        <span>"{p.interpretation?.split('.')[0]}."</span>
                                        <MousePointer2 className="w-4 h-4 text-purple-500/0 group-hover/item:text-purple-500/50 transition-colors" />
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.section>

                            <motion.section 
                              initial={{ x: -30, opacity: 0 }}
                              whileInView={{ x: 0, opacity: 1 }}
                              className="bg-zinc-900/40 p-8 rounded-[3rem] border border-white/5 hover:border-sky-500/30 transition-all group"
                            >
                              <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-8 font-black flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.6)]" />
                                VIBRATIONAL VALUES
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                 {data.numerology.coreNumbers?.slice(0, 4).map((n, i) => (
                                   <div 
                                     key={i} 
                                     className="p-6 bg-black/40 rounded-[2rem] border border-white/5 group hover:bg-white/5 transition-all hover:scale-[1.05] cursor-pointer relative"
                                     onClick={() => handleInteractiveInsight(`Numerology ${n.name}`, `Analyze the specific vibrational significance of having ${n.name} as number ${n.value}. What are the primary strengths and shadows?`)}
                                    >
                                      <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-black mb-2">{n.name}</div>
                                      <div className="text-4xl text-sky-400 font-black tracking-tighter flex items-center justify-between">
                                          {n.value}
                                          <Monitor className="w-5 h-5 text-sky-500/0 group-hover:text-sky-500/40 transition-colors" />
                                      </div>
                                   </div>
                                 ))}
                              </div>
                            </motion.section>
                         </div>

                         <div className="sticky top-0 space-y-8">
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              whileInView={{ scale: 1, opacity: 1 }}
                              className="bg-black/60 p-12 rounded-[4rem] border border-white/10 shadow-3xl relative overflow-hidden backdrop-blur-2xl group cursor-pointer hover:border-purple-500/50 transition-all"
                              onClick={() => handleInteractiveInsight('Attribute Radius Evaluation', 'Provide a synthesis of the radar chart containing intuition, emotion, logic, structure, consciousness, and cosmic edge. How do they balance each other out?')}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                              <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3 relative z-10 uppercase tracking-tighter">
                                 <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                 ATTRIBUTE RADIUS
                              </h3>
                              <div className="h-80 relative z-10">
                                 <ResponsiveContainer width="100%" height="100%">
                                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={infographicData}>
                                      <PolarGrid stroke="#222" />
                                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} />
                                      <Radar name="Value" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.5} />
                                   </RadarChart>
                                 </ResponsiveContainer>
                              </div>
                              <div className="mt-10 text-center relative z-10">
                                <div className="px-6 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full inline-block">
                                  <span className="text-[10px] text-purple-400 font-black tracking-[0.3em] uppercase">SYSTEM COHERENCE: HIGH</span>
                                </div>
                              </div>
                            </motion.div>

                            <motion.div 
                              initial={{ y: 30, opacity: 0 }}
                              whileInView={{ y: 0, opacity: 1 }}
                              className="bg-zinc-900/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden"
                            >
                               <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Gematria Signature</div>
                               <div className="flex items-center justify-between">
                                 <div className="text-4xl text-zinc-200 font-light tracking-widest">{data.gematria.nameValue}</div>
                                 <Fingerprint className="text-zinc-700" size={32} />
                               </div>
                               <p className="text-[10px] text-zinc-600 mt-4 italic">"Mathematical validation of identity frequency across alphanumeric grids."</p>
                            </motion.div>
                         </div>
                       </div>

                       <motion.div 
                         initial={{ y: 50, opacity: 0 }}
                         whileInView={{ y: 0, opacity: 1 }}
                         viewport={{ once: true }}
                         className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-16 rounded-[5rem] border border-white/10 text-center shadow-2xl relative overflow-hidden"
                       >
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.8em] mb-10">CORE ESSENCE SYNTHESIS</h3>
                          <p className="text-2xl md:text-4xl font-light text-zinc-200 leading-tight italic max-w-4xl mx-auto tracking-tight">"{data.synthesis}"</p>
                          <div className="mt-12 flex justify-center gap-2">
                             {[...Array(5)].map((_, i) => (
                               <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                             ))}
                          </div>
                        </motion.div>
                     </motion.div>
                  )}

                  {infographicType === 'path' && (
                    <motion.div key="path" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-16 max-w-5xl mx-auto h-full overflow-y-auto scrollbar-thin pr-4 pb-20">
                      <div className="text-center space-y-6">
                        <div className="text-sky-500 text-[10px] font-black uppercase tracking-[0.8em] animate-pulse">Destiny Arc & Quantum Trajectory</div>
                        <h1 className="text-5xl md:text-9xl font-black text-white tracking-tighter leading-none">LIFE PATH<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-600">EVOLUTION</span></h1>
                        <div className="h-px w-64 bg-gradient-to-r from-transparent via-sky-500 to-transparent mx-auto"></div>
                      </div>

                      <div className="grid lg:grid-cols-12 gap-12">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          className="lg:col-span-12 xl:col-span-4 bg-gradient-to-br from-sky-500/20 via-zinc-950 to-zinc-950 border border-sky-500/30 p-12 rounded-[4rem] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-sky-400/50 transition-all cursor-pointer"
                          onClick={() => handleInteractiveInsight(`Life Path Trajectory: ${data.numerology.lifePath}`, `Generate a detailed life path evolutionary journey focusing on archetype frequency, destiny resonance, and what the soul is attempting to master during this temporal incarnation for Life Path ${data.numerology.lifePath}.`)}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(14,165,233,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                          <div className="text-sky-400 text-[10px] uppercase tracking-[0.4em] font-black mb-8 relative z-10 flex items-center justify-center gap-2">
                             Primary Archetype Frequency
                             <MousePointer2 className="w-3 h-3 text-sky-400/50" />
                          </div>
                          <div className="text-[12rem] font-black text-white leading-none relative z-10 drop-shadow-[0_0_30px_rgba(14,165,233,0.4)] group-hover:scale-110 transition-transform duration-700">{data.numerology.lifePath}</div>
                          <div className="mt-8 relative z-10 space-y-4">
                             <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full inline-block backdrop-blur-md">
                                <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">Destiny Vibration: Master</span>
                             </div>
                             <p className="text-sm font-light text-zinc-400 italic leading-relaxed max-w-sm mx-auto">"{data.numerology.lifePathMeaning || 'A journey of profound inner transformation and cosmic alignment.'}"</p>
                          </div>
                        </motion.div>
                        
                        <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-8">
                          <div className="flex items-center justify-between px-4">
                            <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black flex items-center gap-3">
                               <Target className="w-5 h-5 text-sky-500" />
                               DESTINY TIMELINE ENCODING
                            </h3>
                            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest animate-pulse">Signal Strength: Optimal</div>
                          </div>

                          {data.timeline && data.timeline.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                              {data.timeline.slice(0, 4).map((t, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ x: 50, opacity: 0 }}
                                  whileInView={{ x: 0, opacity: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex gap-10 items-center p-10 bg-zinc-900/40 rounded-[3.5rem] border border-white/5 relative group hover:bg-zinc-800/60 transition-all hover:scale-[1.01] hover:border-sky-500/20"
                                >
                                   <div className="shrink-0 w-28 text-right space-y-1">
                                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest group-hover:text-sky-500 transition-colors">Phase {i + 1}</div>
                                      <div className="text-4xl font-black text-white group-hover:text-sky-400 transition-colors tracking-tighter">{t.year}</div>
                                      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">EPOCH {t.age}</div>
                                   </div>
                                   <div className="w-px h-20 bg-zinc-800 relative">
                                      <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.6)] group-hover:scale-150 transition-transform" />
                                   </div>
                                   <div className="flex-1 space-y-4">
                                      <div className="text-xl text-zinc-200 font-black leading-none tracking-tight group-hover:text-white transition-colors">{t.highlight}</div>
                                      <div className="flex flex-wrap gap-2">
                                        <div className="text-[9px] bg-sky-500/10 text-sky-400 px-4 py-1.5 rounded-full font-black tracking-widest uppercase border border-sky-500/20">{t.houseSignificance}</div>
                                        <div className="text-[9px] bg-white/5 text-zinc-500 px-4 py-1.5 rounded-full font-black tracking-widest uppercase border border-zinc-800">TEMPORAL NODES: ACTIVE</div>
                                      </div>
                                   </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-20 text-center bg-zinc-900/20 border border-white/5 border-dashed rounded-[4rem] text-zinc-600 italic text-sm font-light flex flex-col items-center gap-4">
                               <RefreshCw className="animate-spin text-zinc-700" size={32} />
                               <span>Synchronizing with temporal Akasha...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <motion.div 
                          initial={{ y: 30, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          className="bg-zinc-900/40 p-12 rounded-[4rem] border border-white/5 relative overflow-hidden group"
                        >
                           <div className="text-[10px] text-sky-500/60 font-black uppercase tracking-[0.4em] mb-8">Evolutionary Intent</div>
                           <p className="text-2xl font-light text-zinc-300 leading-tight italic line-clamp-3">
                              "{data.lifeStrategy?.goalPlan || data.patterns?.coreTheme || 'Aligning actions with cosmic intent creates frictionless manifestation and spiritual speed.'}"
                           </p>
                           <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                              <Network size={64} className="text-sky-400" />
                           </div>
                        </motion.div>

                        <motion.div 
                          initial={{ y: 30, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          className="bg-gradient-to-br from-indigo-900/20 to-zinc-950 p-12 rounded-[4rem] border border-indigo-500/20 relative overflow-hidden"
                        >
                           <h4 className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mb-8">Master Trajectory Map</h4>
                           <div className="h-32 flex items-end gap-2">
                              {[...Array(12)].map((_, i) => (
                                <motion.div 
                                  key={i} 
                                  initial={{ height: 0 }}
                                  whileInView={{ height: `${Math.random() * 100}%` }}
                                  className="flex-1 bg-indigo-500/20 rounded-t-lg border-t border-indigo-500/40"
                                />
                              ))}
                           </div>
                           <p className="text-[10px] text-zinc-600 mt-6 font-bold uppercase tracking-widest">Temporal Density over 120-year cycle</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {infographicType === 'karmic' && (
                    <motion.div key="karmic" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-16 max-w-5xl mx-auto h-full overflow-y-auto scrollbar-thin pr-4 pb-20">
                       <div className="text-center space-y-6">
                         <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.8em] animate-pulse">Soul Ledger & Akasha</div>
                         <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none italic uppercase">Ancestral<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-600 not-italic">Blueprints</span></h1>
                         <div className="h-0.5 w-64 bg-zinc-800 mx-auto relative overflow-hidden">
                           <motion.div className="absolute inset-0 bg-amber-500" initial={{ left: "-100%" }} animate={{ left: "100%" }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} />
                         </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-12">
                          <section className="bg-zinc-900/60 p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
                             <div className="absolute top-0 left-0 p-4 opacity-5"><Layers size={100} /></div>
                             <h3 className="text-amber-500 text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                               <Sparkles size={16} />
                               KARMA LOAD ANALYSIS
                             </h3>
                             <div className="space-y-8 relative z-10">
                               {(data as any).karma?.karmicDebts && (data as any).karma.karmicDebts.length > 0 ? (data as any).karma.karmicDebts.map((k: any, i: number) => (
                                 <div key={i} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-2">
                                       <div className="text-xl font-black text-zinc-100 group-hover:text-amber-400 transition-colors uppercase tracking-tighter">{k.title}</div>
                                       <div className="text-[10px] text-zinc-500 pb-1">INTENSITY: {Math.floor(Math.random() * 40) + 60}%</div>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                       <motion.div initial={{ width: 0 }} animate={{ width: `${60 + i * 15}%` }} className="h-full bg-amber-500" />
                                    </div>
                                    <p className="mt-4 text-sm text-zinc-400 font-light italic leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">"{k.remedy || 'Balance this energy through intentional detachment and compassion.'}"</p>
                                 </div>
                               )) : (
                                 <div className="p-8 text-center text-zinc-600 italic">No heavy karmic debts currently active. Mastery achieved.</div>
                               )}
                             </div>
                          </section>

                          <div className="space-y-8">
                             <motion.section 
                               initial={{ x: 30, opacity: 0 }}
                               whileInView={{ x: 0, opacity: 1 }}
                               className="bg-zinc-900/40 p-10 rounded-[3.5rem] border border-white/5 group hover:border-amber-500/30 transition-all"
                             >
                                <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">SOUL ORIGIN STATION</h3>
                                <div className="flex items-center gap-8">
                                   <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                      <Globe className="text-amber-400" size={32} />
                                   </div>
                                   <div>
                                      <div className="text-2xl font-black text-white tracking-tight uppercase leading-none">{(data as any).karma?.soulAge || 'Ancient'} SOUL</div>
                                      <div className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-2">{data.akashic?.soulOrigin || 'Nova Station'} ORIGIN</div>
                                   </div>
                                </div>
                             </motion.section>

                             <section className="grid grid-cols-2 gap-6">
                                <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  whileInView={{ y: 0, opacity: 1 }}
                                  className="bg-black/60 p-10 rounded-[3rem] border border-white/5 flex flex-col justify-center items-center gap-2"
                                >
                                   <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">DHARMA SCORE</div>
                                   <div className="text-5xl font-black text-white tracking-tighter italic">8.4</div>
                                </motion.div>
                                <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  whileInView={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                  className="bg-black/60 p-10 rounded-[3rem] border border-white/5 flex flex-col justify-center items-center gap-2"
                                >
                                   <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">SOUL MATURITY</div>
                                   <div className="text-5xl font-black text-amber-500 tracking-tighter italic">A+</div>
                                </motion.div>
                             </section>

                             <motion.section 
                               initial={{ x: 30, opacity: 0 }}
                               whileInView={{ x: 0, opacity: 1 }}
                               transition={{ delay: 0.2 }}
                               className="bg-zinc-950 p-10 rounded-[3.5rem] border border-white/10 relative overflow-hidden group"
                             >
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                                <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">INCARNATION NODE</h3>
                                <p className="text-sm font-light text-zinc-300 leading-relaxed italic pr-4">
                                   "Your presence in this timeline is a calculated choice for the resolution of {(data as any).karma?.karmicDebts?.[0]?.title?.toLowerCase() || 'ancestral growth'} cycles."
                                </p>
                             </motion.section>
                          </div>
                       </div>

                       <motion.div 
                         initial={{ y: 50, opacity: 0 }}
                         whileInView={{ y: 0, opacity: 1 }}
                         className="bg-zinc-950 p-16 rounded-[4rem] border border-white/5 text-center relative overflow-hidden mt-12"
                       >
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.05),transparent)]" />
                          <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.8em] mb-10">AKASHIC DECODING</h3>
                          <p className="text-2xl md:text-3xl font-light text-zinc-300 leading-tight italic max-w-4xl mx-auto tracking-tight">
                             "{(data.akashic as any)?.missionStatement || 'Healing the ancestral line through conscious embodiment of the current fractal identity.'}"
                          </p>
                       </motion.div>
                    </motion.div>
                  )}

                  {infographicType === 'resonance' && (
                    <motion.div key="resonance" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-16 max-w-5xl mx-auto h-full overflow-y-auto scrollbar-thin pr-4 pb-20">
                       <div className="text-center space-y-6">
                         <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.8em] animate-pulse">Spectral Geometry & Frequency State</div>
                         <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none italic uppercase">Torus<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-600 not-italic">Resonance</span></h1>
                         <div className="h-0.5 w-64 bg-zinc-800 mx-auto relative overflow-hidden">
                           <motion.div className="absolute inset-0 bg-emerald-500" initial={{ left: "-100%" }} animate={{ left: "100%" }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} />
                         </div>
                       </div>

                       <div className="grid lg:grid-cols-12 gap-12">
                          <section className="lg:col-span-12 bg-zinc-900/60 p-12 rounded-[5rem] border border-white/5 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={180} /></div>
                             <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                               <Sparkles size={18} className="text-emerald-400" />
                               VIBRATIONAL CENTER (CHAKRA SPECTROMETRY)
                             </h3>
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
                                {data.chakras?.slice(0, 6).map((c, i) => (
                                  <motion.div 
                                    key={i} 
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-8 rounded-[3.5rem] bg-black/40 border border-white/5 group/chakra hover:border-emerald-500/30 transition-all flex flex-col gap-6"
                                  >
                                     <div className="flex justify-between items-start">
                                        <div 
                                          className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl transition-transform group-hover/chakra:scale-110"
                                          style={{ backgroundColor: `${c.color}15`, color: c.color }}
                                        >
                                           <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_15px_white]" />
                                        </div>
                                        <div className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">NODE {i+1}</div>
                                     </div>
                                     <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                           <div className="text-xl font-black text-white italic uppercase tracking-tight">{c.name}</div>
                                           <div className="text-[10px] font-black text-emerald-500 font-mono">{c.score}%</div>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                           <motion.div 
                                             initial={{ width: 0 }}
                                             whileInView={{ width: `${c.score}%` }}
                                             className="h-full"
                                             style={{ backgroundColor: c.color }}
                                           />
                                        </div>
                                        <div className="text-[10px] text-zinc-500 font-medium leading-relaxed italic opacity-60 group-hover/chakra:opacity-100 transition-opacity">
                                           {c.description || 'Frequency aligning with universal geometric constants.'}
                                        </div>
                                     </div>
                                  </motion.div>
                                ))}
                             </div>
                          </section>

                          <div className="lg:col-span-12 grid md:grid-cols-2 gap-8">
                             <motion.section 
                               initial={{ y: 30, opacity: 0 }}
                               whileInView={{ y: 0, opacity: 1 }}
                               className="bg-zinc-900/40 p-10 rounded-[4rem] border border-white/5 relative overflow-hidden group"
                             >
                                <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                   <Globe size={16} />
                                   BODY & EARTH ANCHOR
                                </div>
                                <p className="text-xl font-light text-zinc-300 leading-tight italic">
                                   "{data.torusAnalysis?.bodyAndFlow || 'Strong grounding vectors detected, drawing current upwards from the core matrix.'}"
                                </p>
                             </motion.section>

                             <motion.section 
                               initial={{ y: 30, opacity: 0 }}
                               whileInView={{ y: 0, opacity: 1 }}
                               className="bg-zinc-900/40 p-10 rounded-[4rem] border border-white/5 relative overflow-hidden group"
                             >
                                <div className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                   <Sparkles size={16} />
                                   MIND & COSMIC RECEPTION
                                </div>
                                <p className="text-xl font-light text-zinc-300 leading-tight italic">
                                   "{data.torusAnalysis?.mindAndSpiritual || 'Expanded crown aperture receiving high levels of abstraction and universal signal.'}"
                                </p>
                             </motion.section>
                          </div>
                          
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            className="lg:col-span-12 bg-zinc-950 p-16 rounded-[6rem] border border-emerald-500/10 text-center relative overflow-hidden group shadow-2xl"
                          >
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
                             <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-20" />
                             <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.8em] mb-10">SPECTRAL SYNTHESIS SUMMARY</div>
                             <p className="text-3xl md:text-4xl font-extralight text-zinc-200 italic max-w-4xl mx-auto tracking-tight leading-tight">
                                "{data.torusAnalysis?.overallAnalogy || 'The energetic structure resembles a steady, balanced sphere with clear pathways for intuition and logic.'}"
                             </p>
                          </motion.div>
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
               className="h-full bg-black rounded-[4rem] border border-white/5 overflow-hidden relative group perspective-1000"
            >
               {/* Cinematic Layers */}
               <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent)] animate-pulse" />
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
                  <div className="absolute inset-0 bg-black/60" />
               </div>

               {/* Cinematic Content Layer */}
               <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={videoStep}
                      initial={{ opacity: 0, scale: 0.8, rotateX: 30, y: 50, filter: 'blur(15px)' }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 1.2, rotateX: -20, y: -50, filter: 'blur(15px)' }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-center space-y-12 max-w-4xl"
                    >
                       <motion.div 
                         initial={{ opacity: 0, letterSpacing: '0.2em' }}
                         animate={{ opacity: 1, letterSpacing: '0.8em' }}
                         transition={{ delay: 0.5, duration: 1.5 }}
                         className="text-zinc-500 text-[11px] uppercase font-black"
                       >
                         {videoStep === 0 && "CHAPTER ONE: INITIALIZATION"}
                         {videoStep === 1 && "CHAPTER TWO: CELESTIAL ORIGIN"}
                         {videoStep === 2 && "CHAPTER THREE: HARMONIC ESSENCE"}
                         {videoStep === 3 && "CHAPTER FOUR: TOTAL SYNTHESIS"}
                         {videoStep === 4 && "FINAL CHAPTER: TRANSCENDENCE"}
                       </motion.div>

                       <div className="relative">
                          <motion.h2 
                            className="text-7xl md:text-[10rem] font-black text-white tracking-tighter leading-none italic uppercase mix-blend-difference"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                          >
                            {videoStep === 0 && "ARRIVAL"}
                            {videoStep === 1 && "ORIGIN"}
                            {videoStep === 2 && "VIBRATION"}
                            {videoStep === 3 && "UNITY"}
                            {videoStep === 4 && "ASCEND"}
                          </motion.h2>
                          <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full opacity-20 animate-pulse pointer-events-none" />
                       </div>

                       <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.8 }}
                         className="space-y-8"
                       >
                         {videoStep === 0 && (
                           <p className="text-2xl md:text-4xl font-light text-zinc-300 italic tracking-tight leading-tight">
                              "The cosmic grid aligns as your singular consciousness enters the matrix threshold."
                           </p>
                         )}
                         {videoStep === 1 && (
                           <div className="space-y-8">
                             <div className="flex justify-center gap-12">
                                {data.planets?.slice(0, 3).map((p, i) => (
                                  <motion.div 
                                    key={i} 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 1 + i * 0.2 }}
                                    className="text-center group"
                                  >
                                    <div className="text-6xl text-purple-400 font-black tracking-tighter mb-4 group-hover:scale-110 transition-transform">{p.sign?.slice(0, 2)}</div>
                                    <div className="text-[10px] text-zinc-500 font-black tracking-widest">{p.name.toUpperCase()}</div>
                                  </motion.div>
                                ))}
                             </div>
                             <p className="text-xl text-zinc-400 font-light italic">Planetary currents and celestial weights define your geometric blueprint.</p>
                           </div>
                         )}
                         {videoStep === 2 && (
                           <div className="space-y-8">
                             <motion.div 
                               initial={{ scale: 0.5, rotateY: 180 }}
                               animate={{ scale: 1.5, rotateY: 0 }}
                               className="text-9xl text-sky-500 font-black italic tracking-tighter"
                             >
                                {data.numerology.lifePath}
                             </motion.div>
                             <p className="text-xl text-zinc-400 font-light italic mt-12">Your Life Path frequency: {data.numerology.lifePathMeaning?.slice(0, 100)}...</p>
                           </div>
                         )}
                         {videoStep === 3 && (
                           <p className="text-3xl md:text-5xl font-light text-white leading-tight italic max-w-3xl mx-auto border-l-4 border-purple-500 pl-12 py-4">
                              "{data.synthesis}"
                           </p>
                         )}
                         {videoStep === 4 && (
                           <div className="space-y-12">
                             <p className="text-2xl text-zinc-500 font-light italic">Node analysis complete. The journey continues beyond the observable threshold.</p>
                             <div className="flex justify-center gap-6">
                                <button onClick={() => setVideoStep(0)} className="px-10 py-5 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-[2rem] hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-white/10">Replay Sequence</button>
                                <button onClick={() => setMode('summary')} className="px-10 py-5 bg-zinc-900 text-white font-black uppercase text-[11px] tracking-[0.2em] border border-white/5 rounded-[2rem] hover:bg-zinc-800 transition-all">Exit Matrix</button>
                             </div>
                           </div>
                         )}
                       </motion.div>
                    </motion.div>
                  </AnimatePresence>
               </div>

               {/* Cinematic UI Overlays */}
               <div className="absolute top-12 left-12 z-20 pointer-events-none">
                  <div className="flex gap-4 items-center mb-6">
                     <div className="w-4 h-4 bg-rose-500/80 animate-ping rounded-full" />
                     <div className="text-[10px] text-zinc-400 font-black tracking-[0.5em] uppercase">REC LIVE // SYNTHESIS</div>
                  </div>
                  <div className="p-6 border border-white/5 bg-black/40 backdrop-blur-md rounded-3xl">
                     <div className="text-[9px] text-zinc-600 font-black tracking-widest mb-2">SIGNAL STRENGTH</div>
                     <div className="flex gap-1 h-1 w-24">
                        {[...Array(8)].map((_, i) => <div key={i} className={`flex-1 ${i < 6 ? 'bg-emerald-500' : 'bg-zinc-800'}`} />)}
                     </div>
                  </div>
               </div>

               {/* Playback Controls */}
               <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-40">
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
                       <button key={s} onClick={() => setVideoStep(s)} className={`h-1 rounded-full transition-all ${videoStep === s ? 'w-8 bg-purple-500' : 'w-2 bg-white/10'}`} />
                     ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedInsight && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-white/10 p-8 md:p-12 rounded-[3.5rem] w-full max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin relative shadow-2xl"
            >
              <button 
                onClick={() => setSelectedInsight(null)}
                className="absolute top-8 right-8 p-3 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-purple-500" size={24} />
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Interactive Deep Dive</h3>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-tight">{selectedInsight.title}</h2>
              
              {isGeneratingInsight ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-purple-400/60">
                   <RefreshCw className="animate-spin" size={32} />
                   <p className="text-[10px] uppercase tracking-widest font-mono">Synthesizing Akashic Records...</p>
                </div>
              ) : (
                <div className="space-y-6 text-zinc-300 font-light leading-relaxed prose prose-invert max-w-none">
                  {selectedInsight.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DeepSynthesis(props: { data: CosmicData | null; onPresentationRequest: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-stone-950/40 rounded-[2rem] border border-white/5">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span className="text-xs text-stone-400 font-mono">Initializing Deep Synthesis Matrix...</span>
        </div>
      </div>
    );
  }

  return <DeepSynthesisInner {...props} />;
};
