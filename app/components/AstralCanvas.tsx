import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeProps,
  Handle,
  Position,
  ReactFlowProvider,
  MarkerType,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Video,
  Mic,
  Square,
  Play,
  Pause,
  MessageSquare,
  Compass,
  Trash2,
  Zap,
  Save,
  RefreshCw,
  FileText,
  Sparkles,
  Layers,
  Activity,
  Flame,
  Sun,
  Moon,
  Workflow,
  Download,
  Info,
  X,
  Music,
  Upload,
  Image,
  Link,
  Volume2,
  VolumeX,
  Headphones,
  BookOpen,
  Settings,
  HelpCircle,
  Sparkle,
  Lock,
  Unlock,
  Copy,
  Maximize2,
  Shapes,
  Palette
} from 'lucide-react';
import { CosmicData } from '../types';
import { fetchCosmicChatResponse, fetchUnfoldedNodes } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

// --- CUSTOM NODE TYPES AND CORRESPONDING COMPONENT REGISTRATION ---

interface CanvasNodeData {
  id: string;
  title: string;
  color?: string;
  content?: string;
  url?: string;
  category?: 'planets' | 'gematria' | 'chakras' | 'patterns' | 'daily';
  selectedItemId?: string;
  audioUrl?: string;
  audioDuration?: number;
  transcript?: string;
  chatHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[];
  cosmicData?: CosmicData | null;
  updateNodeData?: (id: string, data: Partial<CanvasNodeData>) => void;
  // Dynamic media & 3D widgets components properties
  mediaType?: 'image' | 'video' | 'audio' | 'gif';
  shapeType?: 'merkaba' | 'icosahedron' | 'torus' | 'frequency';
  solfeggioHz?: number;
  notepadResponse?: string;
  notepadStatus?: 'idle' | 'synthesizing' | 'calculating' | 'translated' | 'shadowing';
  // Cosmic Customizations
  shape?: 'rounded' | 'sharp' | 'bevel' | 'hex' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  texture?: 'glass' | 'grid' | 'noise' | 'plasma' | 'scanlines';
  customAnimation?: 'none' | 'bobbing' | 'pulse' | 'glow';
  locked?: boolean;
}

// Helper to extract custom styling modifiers (Shape, Size, Texture, Animation, Lock)
const getNodeStyles = (data: CanvasNodeData) => {
  // Shape Border styles
  let shapeClass = "rounded-2xl";
  if (data.shape === 'sharp') {
    shapeClass = "rounded-none";
  } else if (data.shape === 'bevel') {
    shapeClass = "rounded-xl border-dashed";
  } else if (data.shape === 'hex') {
    shapeClass = "rounded-sm border-l-4 border-r-4";
  } else if (data.shape === 'pill') {
    shapeClass = "rounded-[36px]";
  }

  // Size transforms
  let sizeStyle: React.CSSProperties = {};
  if (data.size === 'sm') {
    sizeStyle = { transform: 'scale(0.85)', transformOrigin: 'center' };
  } else if (data.size === 'lg') {
    sizeStyle = { transform: 'scale(1.1)', transformOrigin: 'center' };
  } else if (data.size === 'xl') {
    sizeStyle = { transform: 'scale(1.2)', transformOrigin: 'center' };
  }

  // Textures overlays
  let textureClass = "bg-black/80 backdrop-blur-xl border border-white/10";
  if (data.texture === 'grid') {
    textureClass = "bg-[#070b19] border border-cyan-500/30 bg-[linear-gradient(rgba(103,232,249,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.04)_1px,transparent_1px)] bg-[size:16px_16px] backdrop-blur-xl";
  } else if (data.texture === 'noise') {
    textureClass = "bg-[#0b0c14] border border-purple-500/30 bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] bg-[size:10px_10px] backdrop-blur-xl shadow-inner";
  } else if (data.texture === 'plasma') {
    textureClass = "bg-gradient-to-tr from-purple-950/90 via-slate-950 to-indigo-950/80 border border-fuchsia-500/40 shadow-[0_0_25px_rgba(217,70,239,0.25)] backdrop-blur-lg";
  } else if (data.texture === 'scanlines') {
    textureClass = "bg-[#00050c] border border-emerald-500/30 bg-[linear-gradient(rgba(16,185,129,0.03)_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] shadow-lg shadow-emerald-950/20";
  }

  // Animation flow
  let animateClass = "";
  if (data.customAnimation === 'bobbing') {
    animateClass = "animate-bobbing";
  } else if (data.customAnimation === 'pulse') {
    animateClass = "animate-pulse border-white/40";
  } else if (data.customAnimation === 'glow') {
    animateClass = "shadow-[0_0_20px_rgba(168,85,247,0.45)] border-purple-400 animate-pulse";
  }

  const isLocked = !!data.locked;

  return { shapeClass, sizeStyle, textureClass, animateClass, isLocked };
};

// 0. CUSTOM RESONANCE EDGE WITH PULSING GRADIENT EFFECT
const ResonanceEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const strokeColor = style.stroke || '#a855f7';
  const strokeWidth = style.strokeWidth || 2.5;

  return (
    <>
      {/* 1. Underlying think track / glow shadow animation pass */}
      <path
        id={`${id}-glow`}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={Number(strokeWidth) + 4}
        className="opacity-20 blur-[4px] pointer-events-none transition-all duration-300 animate-resonance-pulse"
      />
      
      {/* 2. Base High-contrast Connection Line */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className="opacity-50 pointer-events-none transition-all duration-300"
      />

      {/* 3. The Pulsing flowing white gradient overlay */}
      <path
        d={edgePath}
        fill="none"
        stroke="#ffffff"
        strokeWidth={Number(strokeWidth) + 0.5}
        className="animate-resonance-flow opacity-80 pointer-events-none"
        style={{
          strokeDasharray: '12 24',
          filter: `drop-shadow(0 0 3px ${strokeColor})`,
        }}
        markerEnd={markerEnd}
      />

      {/* 4. High-velocity light sphere traversing along the path */}
      <circle r={3.5} fill="#ffffff" className="pointer-events-none filter drop-shadow-[0_0_5px_#ffffff]">
        <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
};

// 1. NOTE NODE (A Custom note taking widget with themes)
const NoteNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [title, setTitle] = useState(data.title || 'Astral Note');
  const [content, setContent] = useState(data.content || '');
  const [theme, setTheme] = useState(data.color || '#a855f7'); // amethyst purple

  useEffect(() => {
    if (data.updateNodeData) {
      data.updateNodeData(id, { title, content, color: theme });
    }
  }, [title, content, theme]);

  const themes = [
    { label: 'Deep Cobalt', value: '#3b82f6' },
    { label: 'Amethyst Purple', value: '#a855f7' },
    { label: 'Magnetic Ruby', value: '#ef4444' },
    { label: 'Jade Green', value: '#10b981' },
    { label: 'Sunburst Gold', value: '#f59e0b' },
  ];

  const { shapeClass, sizeStyle, textureClass, animateClass, isLocked } = getNodeStyles(data);

  return (
    <div
      className={`p-4 shadow-2xl min-w-[280px] text-white overflow-hidden transition-all duration-300 border ${shapeClass} ${textureClass} ${animateClass}`}
      style={{ borderColor: `${theme}66`, boxShadow: `0 0 15px ${theme}33`, ...sizeStyle }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
      
      {isLocked && (
        <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 p-0.5 rounded-full border border-red-500/30 z-10">
          <Lock className="w-3 h-3" />
        </div>
      )}
      
      <div className={`space-y-3 ${isLocked ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: theme }} />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent font-medium text-sm focus:outline-none focus:border-b focus:border-white/20 w-40"
              placeholder="Title"
            />
          </div>
          <div className="flex gap-1">
            {themes.map((th) => (
              <button
                key={th.value}
                onClick={() => setTheme(th.value)}
                className="w-3.5 h-3.5 rounded-full border border-white/25 transition-all hover:scale-125"
                style={{ backgroundColor: th.value }}
                title={th.label}
              />
            ))}
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none text-white/90"
          placeholder="Write down your cosmic discoveries..."
        />
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
    </div>
  );
};

// 2. VIDEO NODE (Fully embedded YouTube/media visualizer node)
const VideoNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [url, setUrl] = useState(data.url || '');
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    if (data.updateNodeData) {
      data.updateNodeData(id, { url });
    }
    // Parse youtube url
    if (url) {
      let videoId = '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
      } else {
        setEmbedUrl('');
      }
    } else {
      setEmbedUrl('');
    }
  }, [url]);

  const { shapeClass, sizeStyle, textureClass, animateClass, isLocked } = getNodeStyles(data);

  return (
    <div
      className={`p-4 shadow-2xl min-w-[340px] text-white transition-all duration-300 border ${shapeClass} ${textureClass} ${animateClass}`}
      style={{ borderColor: 'rgba(244, 63, 94, 0.3)', boxShadow: '0 0 15px rgba(244, 63, 94, 0.15)', ...sizeStyle }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-rose-500 rounded-full border-2 border-black" />
      
      {isLocked && (
        <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 p-0.5 rounded-full border border-red-500/30 z-10">
          <Lock className="w-3 h-3" />
        </div>
      )}
      
      <div className={`space-y-3 ${isLocked ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="flex items-center gap-2 mb-3 border-b border-rose-500/20 pb-2">
          <Video className="w-4 h-4 text-rose-400" />
          <span className="font-medium text-sm text-rose-300">Celestial Media Widget</span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold">YouTube / Video URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/90 focus:outline-none focus:border-rose-500/50"
            placeholder="Paste connection URL..."
          />
        </div>

        <div className="bg-black/40 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-white/5 relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Cosmic Stream Player"
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-white/30 text-center p-4">
              <Video className="w-6 h-6 animate-pulse" />
              <span className="text-[11px]">Enter valid video connection above</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-rose-500 rounded-full border-2 border-black" />
    </div>
  );
};

// 2b. UNIVERSAL MEDIA NODE (Supports Image, Video, Gif, Audio uploading and URL loading)
const MediaNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [url, setUrl] = useState(data.url || '');
  const [type, setType] = useState<'image' | 'video' | 'audio' | 'gif'>(data.mediaType || 'image');
  const [title, setTitle] = useState(data.title || 'Celestial Media Canvas');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    let detected: 'image' | 'video' | 'audio' | 'gif' = 'image';
    if (fileType.includes('gif')) detected = 'gif';
    else if (fileType.includes('video')) detected = 'video';
    else if (fileType.includes('audio')) detected = 'audio';
    else if (fileType.includes('image')) detected = 'image';

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    setType(detected);
    setTitle(file.name);

    if (data.updateNodeData) {
      data.updateNodeData(id, { url: objectUrl, mediaType: detected, title: file.name });
    }
  };

  useEffect(() => {
    if (data.updateNodeData) {
      data.updateNodeData(id, { url, mediaType: type, title });
    }
  }, [url, type, title]);

  const { shapeClass, sizeStyle, textureClass, animateClass, isLocked } = getNodeStyles(data);

  return (
    <div
      className={`p-4 shadow-2xl min-w-[320px] max-w-[340px] text-white transition-all duration-300 border ${shapeClass} ${textureClass} ${animateClass}`}
      style={{ borderColor: 'rgba(16, 185, 129, 0.3)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)', ...sizeStyle }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
      
      {isLocked && (
        <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 p-0.5 rounded-full border border-red-500/30 z-10">
          <Lock className="w-3 h-3" />
        </div>
      )}
      
      <div className={`space-y-3 ${isLocked ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
          <div className="flex items-center gap-2">
            {type === 'image' && <Image className="w-4 h-4 text-emerald-400" />}
            {type === 'gif' && <Sparkle className="w-4 h-4 text-emerald-400" />}
            {type === 'video' && <Video className="w-4 h-4 text-emerald-400" />}
            {type === 'audio' && <Music className="w-4 h-4 text-emerald-400" />}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent font-medium text-xs text-emerald-300 focus:outline-none w-44"
            />
          </div>
          <span className="text-[9px] uppercase tracking-wider font-semibold border border-emerald-500/25 px-1.5 py-0.5 rounded-full text-emerald-400 bg-emerald-500/5">Asset</span>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
            {(['image', 'gif', 'video', 'audio'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all ${type === t ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/40 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={url.startsWith('blob:') ? '' : url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (data.updateNodeData) data.updateNodeData(id, { url: e.target.value });
              }}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white/90 focus:outline-none focus:border-emerald-500/50"
              placeholder="Paste URL or links..."
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/35 hover:scale-105 rounded-xl px-2.5 flex items-center justify-center text-emerald-300 transition-all font-bold text-xs"
              title="Upload local media asset"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*,.gif"
              className="hidden"
            />
          </div>
        </div>

        <div className="bg-black/40 rounded-xl overflow-hidden min-h-[140px] max-h-[180px] flex items-center justify-center border border-white/5 relative">
          {url ? (
            <>
              {(type === 'image' || type === 'gif') && (
                <img src={url} alt={title} className="w-full h-full object-contain max-h-[160px] rounded-lg" />
              )}
              {type === 'video' && (
                <video src={url} controls className="w-full h-full object-contain max-h-[160px] rounded-lg" />
              )}
              {type === 'audio' && (
                <div className="flex flex-col items-center justify-center p-3 w-full gap-2">
                  <div className="flex items-center gap-1.5 justify-center py-2">
                    <span className="w-1.5 h-6 rounded bg-emerald-500 animate-pulse" />
                    <span className="w-1.5 h-8 rounded bg-emerald-400 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1.5 h-10 rounded bg-emerald-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-7 rounded bg-emerald-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <span className="w-1.5 h-5 rounded bg-emerald-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <audio src={url} controls className="w-full h-8 px-1" />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-white/30 text-center p-4">
              <Upload className="w-5 h-5 text-emerald-500/60 animate-bounce" />
              <span className="text-[11px] font-mono">Upload content above</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
    </div>
  );
};

// 2c. 3D SACRED GEOMETRY INTERACTIVE WIDGET NODE (Three.js WebGL Interactive Objects)
const ThreeWidgetNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [shape, setShape] = useState<'merkaba' | 'icosahedron' | 'torus' | 'frequency'>(data.shapeType || 'merkaba');
  const [color, setColor] = useState(data.color || '#3b82f6'); 
  const [speed, setSpeed] = useState(2);
  const [activeFrequencyHz, setActiveFrequencyHz] = useState<number | null>(null);
  const [isResonating, setIsResonating] = useState(false);

  useEffect(() => {
    const handleSolfeggioActive = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.isPlaying) {
        setActiveFrequencyHz(detail.hz);
        setIsResonating(true);
      } else {
        setIsResonating(false);
      }
    };
    window.addEventListener('solfeggio-sound-active', handleSolfeggioActive);
    return () => window.removeEventListener('solfeggio-sound-active', handleSolfeggioActive);
  }, []);

  useEffect(() => {
    if (data.updateNodeData) {
      data.updateNodeData(id, { shapeType: shape, color });
    }
  }, [shape, color]);

  const shapes = [
    { value: 'merkaba', label: 'Merkaba Star' },
    { value: 'icosahedron', label: 'Platonic Crystal' },
    { value: 'torus', label: 'Harmonic Portal' },
    { value: 'frequency', label: 'Resonance Aura' }
  ];

  const colors = [
    { hex: '#3b82f6', label: 'Cobalt' },
    { hex: '#a855f7', label: 'Amethyst' },
    { hex: '#ef4444', label: 'Ruby' },
    { hex: '#10b981', label: 'Jade' },
    { hex: '#f59e0b', label: 'Amber' }
  ];

  const { shapeClass, sizeStyle, textureClass, animateClass, isLocked } = getNodeStyles(data);

  return (
    <div
      className={`p-4 shadow-2xl min-w-[280px] max-w-[300px] text-white transition-all duration-300 border ${shapeClass} ${textureClass} ${animateClass}`}
      style={{ borderColor: 'rgba(59, 130, 246, 0.3)', boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)', ...sizeStyle }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-sky-500 rounded-full border-2 border-black" />
      
      {isLocked && (
        <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 p-0.5 rounded-full border border-red-500/30 z-10">
          <Lock className="w-3 h-3" />
        </div>
      )}
      
      <div className={`space-y-3 ${isLocked ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="font-medium text-xs text-sky-300">Aetheric 3D Generator</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-semibold border border-sky-500/25 px-1.5 py-0.5 rounded-full text-sky-400 bg-sky-500/5">3D WebGL</span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5 bg-white/5 p-1 rounded-xl">
            {shapes.map((sh) => (
              <button
                key={sh.value}
                onClick={() => setShape(sh.value as any)}
                className={`py-1 rounded text-[9px] font-bold uppercase transition-all ${shape === sh.value ? 'bg-sky-500/20 text-sky-300' : 'text-white/40 hover:text-white'}`}
              >
                {sh.label}
              </button>
            ))}
          </div>

          <div className="h-[180px] w-full bg-slate-950/80 rounded-xl relative overflow-hidden border border-white/5 shadow-inner">
            <Canvas camera={{ position: [0, 0, 3], fov: 45 }} style={{ width: '100%', height: '100%' }}>
              <ambientLight intensity={1.5} />
              <pointLight position={[5, 5, 5]} intensity={2} />
              <Float speed={isResonating ? speed * 3.5 : speed * 1.5} rotationIntensity={isResonating ? 3.5 : 1.5} floatIntensity={isResonating ? 2.5 : 1}>
                {shape === 'icosahedron' && (
                  <mesh rotation={[Math.PI / 4, 0, 0]} scale={isResonating ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
                    <icosahedronGeometry args={[0.8, 1]} />
                    <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={isResonating ? 1.0 : 0.25} />
                  </mesh>
                )}
                {shape === 'torus' && (
                  <mesh scale={isResonating ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
                    <torusKnotGeometry args={[0.5, 0.2, 100, 16]} />
                    <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} emissive={color} emissiveIntensity={isResonating ? 0.8 : 0.1} />
                  </mesh>
                )}
                {shape === 'frequency' && (
                  <mesh scale={isResonating ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
                    <sphereGeometry args={[0.7, 32, 32]} />
                    <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={isResonating ? 1.2 : 0.4} />
                  </mesh>
                )}
                {shape === 'merkaba' && (
                  <group scale={isResonating ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
                    <mesh>
                      <coneGeometry args={[0.65, 1.2, 3]} />
                      <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={isResonating ? 1.0 : 0.3} />
                    </mesh>
                    <mesh rotation={[Math.PI, 0, 0]} position={[0, 0, 0]}>
                      <coneGeometry args={[0.65, 1.2, 3]} />
                      <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={isResonating ? 1.0 : 0.3} />
                    </mesh>
                  </group>
                )}
              </Float>
              <OrbitControls enableZoom={false} />
            </Canvas>

            {isResonating && (
              <div className="absolute top-2 right-2 z-10 bg-sky-500/25 border border-sky-500/40 px-2 py-0.5 rounded text-[8px] font-mono text-sky-300 font-bold tracking-widest animate-pulse">
                RESONATING {activeFrequencyHz}HZ
              </div>
            )}

            <div className="absolute bottom-2 left-2 z-10 bg-black/75 px-2 py-1 rounded text-[8px] font-mono text-white/50 pointer-events-none">
              DRAG TO ROTATE
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <div className="flex gap-1.5">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-4.5 h-4.5 rounded-full border border-white/20 transition-all hover:scale-125 ${color === c.hex ? 'ring-2 ring-sky-400' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-white/40 uppercase">Speed</span>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-16 accent-sky-400 cursor-pointer h-1 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-sky-500 rounded-full border-2 border-black" />
    </div>
  );
};

// 2d. INTERACTIVE DYNAMIC NOTEPAD (AI prompt interactions triggers inside note)
const DynamicNotepadNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [content, setContent] = useState(data.content || '');
  const [title, setTitle] = useState(data.title || 'Dynamic Manifest Notepad');
  const [aiResponse, setAiResponse] = useState(data.notepadResponse || '');
  const [status, setStatus] = useState<'idle' | 'synthesizing' | 'calculating' | 'translated' | 'shadowing'>(data.notepadStatus || 'idle');

  const cosmicData = data.cosmicData;

  const triggerAIAction = async (action: 'astrology' | 'gematria' | 'shadow') => {
    if (!content.trim()) return;
    setStatus(action === 'astrology' ? 'synthesizing' : action === 'gematria' ? 'calculating' : 'shadowing');
    
    let promptText = '';
    if (action === 'astrology') {
      promptText = `
        You are the Astral Mind Guide. Analyze this note typed by the Seeker:
        "${content}"
        
        Synthesize this content with their astrological profile. Highlight exactly 2 key psychospiritual planetary influences or transits that coordinate with this thought. Deliver in deep cosmic style.
      `;
    } else if (action === 'gematria') {
      promptText = `
        You are the Astral Mind Guide. Interpret this note typed by the Seeker:
        "${content}"
        
        Calculate or extract important gematria keys and alphanumeric terms. Highlight the kabbalistic resonance and corresponding Sephirot paths. Limit to 3 bullets in deep esoteric style.
      `;
    } else if (action === 'shadow') {
      promptText = `
        You are the Astral Mind Guide. Analyze this note typed by the Seeker:
        "${content}"
        
        Tailor a standard psychospiritual Shadow Work integration prompt designed to release blocking anchors or repressions related to this thought. Write in deep, intimate mystic mentoring tone.
      `;
    }

    try {
      const response = await fetchCosmicChatResponse(promptText, [], cosmicData || null);
      setAiResponse(response.text);
      if (data.updateNodeData) {
        data.updateNodeData(id, { notepadResponse: response.text, notepadStatus: 'idle' });
      }
    } catch (err) {
      console.error(err);
      setAiResponse("A shadow portal obstructed the stream. Re-align and retry.");
    } finally {
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (data.updateNodeData) {
      data.updateNodeData(id, { content, title, notepadResponse: aiResponse, notepadStatus: status });
    }
  }, [content, title, aiResponse, status]);

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-black/95 backdrop-blur-xl p-4 shadow-2xl min-w-[320px] max-w-[350px] text-white transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
      
      <div className="flex items-center justify-between mb-3 border-b border-purple-500/20 pb-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent font-medium text-xs text-purple-300 focus:outline-none w-44"
          />
        </div>
        <span className="text-[9px] uppercase tracking-wider font-semibold border border-purple-500/25 px-1.5 py-0.5 rounded-full text-purple-400 bg-purple-500/5">Notepad</span>
      </div>

      <div className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white/95 focus:outline-none focus:border-purple-500/50 resize-none font-mono"
          placeholder="Capture your channelings or dreams here..."
        />

        <div className="flex items-center justify-between gap-1.5 bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => triggerAIAction('astrology')}
            disabled={status !== 'idle' || !content.trim()}
            className="flex-1 py-1 px-1 rounded text-[8px] font-bold uppercase transition-all bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/10 disabled:opacity-35"
          >
            {status === 'synthesizing' ? 'Reading...' : 'Astrology'}
          </button>
          <button
            onClick={() => triggerAIAction('gematria')}
            disabled={status !== 'idle' || !content.trim()}
            className="flex-1 py-1 px-1 rounded text-[8px] font-bold uppercase transition-all bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/10 disabled:opacity-35"
          >
            {status === 'calculating' ? 'Math...' : 'Gematria'}
          </button>
          <button
            onClick={() => triggerAIAction('shadow')}
            disabled={status !== 'idle' || !content.trim()}
            className="flex-1 py-1 px-1 rounded text-[8px] font-bold uppercase transition-all bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/10 disabled:opacity-35"
          >
            {status === 'shadowing' ? 'Oracle...' : 'Shadow Oracle'}
          </button>
        </div>

        {aiResponse && (
          <div className="p-3 bg-purple-950/20 border border-purple-500/25 rounded-xl text-[11px] space-y-1 relative">
            <div className="flex items-center justify-between border-b border-purple-500/10 pb-1 mb-1">
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-purple-300">Resonant Transmission</span>
              <button
                onClick={() => setAiResponse('')}
                className="text-white/40 hover:text-white transition-all text-[9.5px] font-mono uppercase"
              >
                Clear
              </button>
            </div>
            <div className="text-white/95 leading-relaxed font-sans max-h-36 overflow-y-auto scrollbar-thin">
              <ReactMarkdown>{aiResponse}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
    </div>
  );
};

// 2e. SOLFEGGIO SOUND GENERATOR NODE (Real Sound Synthesizer Node using Web Audio API)
const SolfeggioNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hz, setHz] = useState(data.solfeggioHz || 528);
  const [volume, setVolume] = useState(0.2);
  const [binaural, setBinaural] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const frequencies = [
    { value: 174, label: '174 Hz', desc: 'Grounding Energy' },
    { value: 396, label: '396 Hz', desc: 'Liberating Fear & Guilt' },
    { value: 417, label: '417 Hz', desc: 'Facilitating Change' },
    { value: 528, label: '528 Hz', desc: 'DNA Transformation' },
    { value: 639, label: '639 Hz', desc: 'Relate & Connection' },
    { value: 741, label: '741 Hz', desc: 'Awaking Intuition' },
    { value: 852, label: '852 Hz', desc: 'Spiritual Order' },
    { value: 963, label: '963 Hz', desc: 'Divine Consciousness' },
  ];

  const stopSound = () => {
    if (osc1Ref.current) {
      try { osc1Ref.current.stop(); } catch (e) { console.debug('Sound stop suppressed', e); }
      osc1Ref.current = null;
    }
    if (osc2Ref.current) {
      try { osc2Ref.current.stop(); } catch (e) { console.debug('Sound stop suppressed', e); }
      osc2Ref.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) { console.debug('Audio close suppressed', e); }
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const playSound = () => {
    try {
      stopSound();

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(volume, ctx.currentTime);
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      // Left Channel
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(hz, ctx.currentTime);

      const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner1) {
        panner1.pan.setValueAtTime(-1, ctx.currentTime);
        osc1.connect(panner1);
        panner1.connect(mainGain);
      } else {
        osc1.connect(mainGain);
      }
      osc1.start();
      osc1Ref.current = osc1;

      // Right Channel (binaural detune delta -4Hz for meditative state)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      const detuneHz = binaural ? hz + 4.5 : hz;
      osc2.frequency.setValueAtTime(detuneHz, ctx.currentTime);

      const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner2) {
        panner2.pan.setValueAtTime(1, ctx.currentTime);
        osc2.connect(panner2);
        panner2.connect(mainGain);
      } else {
        osc2.connect(mainGain);
      }
      osc2.start();
      osc2Ref.current = osc2;

      setIsPlaying(true);
    } catch (e) {
      console.warn("Failed to initiate Web Audio Synthesizer:", e);
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound();
    }
  };

  useEffect(() => {
    if (isPlaying && gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      playSound();
    }
    if (data.updateNodeData) {
      data.updateNodeData(id, { solfeggioHz: hz });
    }
  }, [hz, binaural]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        window.dispatchEvent(new CustomEvent('solfeggio-sound-active', {
          detail: { hz, isPlaying: true, timestamp: Date.now() }
        }));
      }, 100);
    } else {
      window.dispatchEvent(new CustomEvent('solfeggio-sound-active', {
        detail: { hz, isPlaying: false, timestamp: Date.now() }
      }));
    }
    return () => {
      clearInterval(interval);
      window.dispatchEvent(new CustomEvent('solfeggio-sound-active', {
        detail: { hz, isPlaying: false, timestamp: Date.now() }
      }));
    };
  }, [isPlaying, hz]);

  useEffect(() => {
    return () => stopSound();
  }, []);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-black/95 backdrop-blur-xl p-4 shadow-2xl min-w-[280px] max-w-[300px] text-white transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500 rounded-full border-2 border-black" />
      
      <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
        <div className="flex items-center gap-1.5">
          <Headphones className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-xs text-amber-300">Solfeggio Sound Matrix</span>
        </div>
        <span className="text-[9px] uppercase tracking-wider font-semibold border border-amber-500/25 px-1.5 py-0.5 rounded-full text-amber-400 bg-amber-500/5">Acoustics</span>
      </div>

      <div className="space-y-3">
        <select
          value={hz}
          onChange={(e) => setHz(parseInt(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/90 focus:outline-none focus:border-amber-500/40"
        >
          {frequencies.map((f) => (
            <option key={f.value} value={f.value} className="text-black font-sans">
              {f.label} • {f.desc}
            </option>
          ))}
        </select>

        <div className="h-20 bg-slate-950/80 rounded-xl flex items-center justify-center border border-white/5 overflow-hidden relative">
          {isPlaying ? (
            <div className="flex items-center justify-center gap-1.5 h-12 w-full px-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded bg-amber-500 animate-pulse"
                  style={{
                    height: `${Math.max(15, Math.random() * 50 + 10)}%`,
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: `${0.4 + (hz / 1000)}s`
                  }}
                />
              ))}
            </div>
          ) : (
            <span className="text-[10px] font-mono text-white/30 tracking-widest animate-pulse">SOUND SILENT • RESONATE MATRIX</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-2">
          <button
            onClick={toggleSound}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${isPlaying ? 'bg-amber-600 animate-pulse hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            {isPlaying ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white animate-bounce" />}
          </button>

          <div className="flex flex-col flex-1 gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase">Aura Volume</span>
              <span className="text-[9px] font-mono text-amber-300">{(volume * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1 rounded bg-white/10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-white/60 border-t border-white/5 pt-2">
          <span>Theta Brainwave Binaural (-4.5Hz)</span>
          <button
            onClick={() => setBinaural(!binaural)}
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${binaural ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse' : 'bg-white/5 text-white/40'}`}
          >
            {binaural ? 'Active' : 'Binaural Off'}
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-amber-500 rounded-full border-2 border-black" />
    </div>
  );
};

// 3. CELESTIAL NODE (Aligns and reads values directly from CosmicData)
const CelestialNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [category, setCategory] = useState<'planets' | 'gematria' | 'chakras' | 'patterns' | 'daily'>(data.category || 'planets');
  const [selectedItemId, setSelectedItemId] = useState(data.selectedItemId || '');
  const cosmicData = data.cosmicData;

  useEffect(() => {
    if (data.updateNodeData) {
      data.updateNodeData(id, { category, selectedItemId });
    }
  }, [category, selectedItemId]);

  // Handle category shift
  const handleCategoryChange = (cat: 'planets' | 'gematria' | 'chakras' | 'patterns' | 'daily') => {
    setCategory(cat);
    setSelectedItemId('');
  };

  // Get options based on category
  const dropdownOptions = useMemo(() => {
    if (!cosmicData) return [];
    switch (category) {
      case 'planets':
        return cosmicData.planets?.map((p) => ({ value: p.name, label: `${p.name} in ${p.sign}` })) || [];
      case 'gematria':
        return [
          { value: 'nameValue', label: `Gematria Number (${cosmicData.gematria?.nameValue || 0})` },
          { value: 'reduction', label: `Reduction Number (${cosmicData.gematria?.reduction || 0})` },
        ];
      case 'chakras':
        return cosmicData.chakras?.map((ch) => ({ value: ch.name, label: `${ch.name} Chakra` })) || [];
      case 'patterns':
        return cosmicData.patterns?.synchronicities?.map((s, idx) => ({ value: String(idx), label: s.title })) || [];
      case 'daily':
        return [
          { value: 'horoscope', label: 'Daily Horoscope' },
          { value: 'affirmation', label: 'Daily Affirmation' },
          { value: 'caution', label: 'Cautionary Guidance' },
        ];
      default:
        return [];
    }
  }, [category, cosmicData]);

  // Extract selected item rendering data
  const selectedInfo = useMemo(() => {
    if (!cosmicData || !selectedItemId) return null;
    try {
      switch (category) {
        case 'planets': {
          const body = cosmicData.planets?.find((p) => p.name === selectedItemId);
          if (!body) return null;
          return {
            title: body.name,
            sub: `${body.sign} • ${body.degree.toFixed(1)}° • House ${body.house}`,
            body: body.meaning || body.interpretation || "Astrological coordinate linked to consciousness path.",
            badgeColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
          };
        }
        case 'gematria': {
          const isReduction = selectedItemId === 'reduction';
          return {
            title: isReduction ? "Reduction Grid" : "Mystical Alphanumerics",
            sub: isReduction ? `Reduction Base: ${cosmicData.gematria?.reduction}` : `Standard Absolute: ${cosmicData.gematria?.nameValue}`,
            body: cosmicData.gematria?.numberProperties || `The letters resonate directly to numerical grid sequence ${cosmicData.gematria?.nameSequence || ''}. Correlation: ${cosmicData.gematria?.dobSequence || 'None'}.`,
            badgeColor: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
          };
        }
        case 'chakras': {
          const ch = cosmicData.chakras?.find((c) => c.name === selectedItemId);
          if (!ch) return null;
          return {
            title: `${ch.name} Center`,
            sub: `Status: ${ch.status?.toUpperCase()} • Score: ${ch.score}%`,
            body: ch.description,
            badgeColor: `text-emerald-400 border-emerald-500/20 bg-emerald-500/5`,
          };
        }
        case 'patterns': {
          const idx = parseInt(selectedItemId);
          const sync = cosmicData.patterns?.synchronicities?.[idx];
          if (!sync) return null;
          return {
            title: sync.title,
            sub: 'Cosmic Synchronicity Pattern',
            body: sync.description,
            badgeColor: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
          };
        }
        case 'daily': {
          const daily = cosmicData.dailyInsight;
          if (!daily) return null;
          const map = {
            horoscope: { t: 'Astrological Alignment', b: daily.horoscope, s: daily.keyInterest },
            affirmation: { t: 'Core Affirmation', b: daily.affirmation, s: 'Consciousness Anchor' },
            caution: { t: 'Shadow Matrix warning', b: daily.caution, s: 'Integration Alert' },
          };
          const selected = map[selectedItemId as keyof typeof map];
          if (!selected) return null;
          return {
            title: selected.t,
            sub: selected.s,
            body: selected.b,
            badgeColor: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
          };
        }
      }
    } catch (e) {
      return null;
    }
  }, [category, selectedItemId, cosmicData]);

  // Feed context for chatbot mapping
  useEffect(() => {
    if (data.updateNodeData && selectedInfo) {
      data.updateNodeData(id, { content: `${selectedInfo.title} (${selectedInfo.sub}): ${selectedInfo.body}` });
    }
  }, [selectedInfo]);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-black/95 backdrop-blur-xl p-4 shadow-2xl min-w-[300px] max-w-[320px] text-white transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500 rounded-full border-2 border-black" />
      
      <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
        <div className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-sm text-amber-300">Aligned Cosmic Value</span>
        </div>
      </div>

      {!cosmicData ? (
        <div className="text-center p-3 text-white/40 text-xs">
          Generate a Cosmic Profile first to extract celestial metrics.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Categories */}
          <div className="flex text-[10px] gap-1 bg-white/5 p-1 rounded-lg">
            {(['planets', 'gematria', 'chakras', 'patterns', 'daily'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex-1 py-1 rounded text-center font-semibold transition-all capitalize ${category === cat ? 'bg-amber-500/20 text-amber-300' : 'text-white/60 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub Items */}
          <div>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/95 focus:outline-none focus:border-amber-500/40"
            >
              <option value="" disabled className="text-black">-- Select Aligned Metric --</option>
              {dropdownOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-black">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Display Details */}
          {selectedInfo ? (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-200">{selectedInfo.title}</span>
                <span className={`text-[9px] border px-1.5 py-0.5 rounded-full font-bold uppercase ${selectedInfo.badgeColor}`}>{category}</span>
              </div>
              <span className="text-[10px] text-white/50 block font-mono">{selectedInfo.sub}</span>
              <p className="text-xs text-white/80 line-clamp-4 leading-relaxed font-sans">{selectedInfo.body}</p>
            </div>
          ) : (
            <div className="text-center py-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-white/30 text-xs">
              Select coordinate item to bind matrix content
            </div>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-amber-500 rounded-full border-2 border-black" />
    </div>
  );
};

// 4. VOICE NOTE NODE (Implements browser audio recording or interactive waveform simulations)
const VoiceNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(data.audioUrl || '');
  const [transcript, setTranscript] = useState(data.transcript || '');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasAnimRef = useRef<number | null>(null);

  useEffect(() => {
    if (data.updateNodeData) {
      data.updateNodeData(id, { audioUrl, transcript, content: `Voice Memo Transcript: ${transcript}` });
    }
  }, [audioUrl, transcript]);

  // Simulated Waveform Visualization inside node
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = Array.from({ length: 24 }, () => Math.random() * 5 + 3);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isRecording ? '#ef4444' : isPlaying ? '#10b981' : '#4b5563';

      const barWidth = canvas.width / bars.length - 2;
      for (let i = 0; i < bars.length; i++) {
        // compute dynamic wave heights
        if (isRecording || isPlaying) {
          bars[i] = Math.max(3, bars[i] + (Math.random() - 0.5) * 8);
          if (bars[i] > canvas.height - 4) bars[i] = canvas.height - 4;
        } else {
          bars[i] = Math.max(3, bars[i] - 1);
        }

        const x = i * (barWidth + 2);
        const y = (canvas.height - bars[i]) / 2;
        ctx.fillRect(x, y, barWidth, bars[i]);
      }
      canvasAnimRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (canvasAnimRef.current) cancelAnimationFrame(canvasAnimRef.current);
    };
  }, [isRecording, isPlaying]);

  // Real or Simulated Recording Logic
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          // Generate automated helpful placeholder transcripts based on recording
          if (!transcript) {
            setTranscript("Astral insights logged. User synthesized astrological coordinates with life matrix...");
          }
          // Turn off stream tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordTime(0);
        timerRef.current = setInterval(() => {
          setRecordTime((t) => t + 1);
        }, 1000);
      } else {
        // Fallback for browsers / sandbox environments
        setIsRecording(true);
        setRecordTime(0);
        timerRef.current = setInterval(() => {
          setRecordTime((t) => t + 1);
        }, 1000);
      }
    } catch (err) {
      console.warn("Microphone access obstructed, executing simulated audio recording...", err);
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // simulated stop
      const base64FakeWav = 'DATA_PLACEHOLDER';
      setAudioUrl(''); // play simulated state
      if (!transcript) {
        setTranscript("Astral frequency patterns captured: Resonance at 528 Hz. Consciousness anchor: Transformation and spiritual order.");
      }
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePlayback = () => {
    if (audioUrl) {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    } else {
      // simulated play
      setIsPlaying(!isPlaying);
      setTimeout(() => setIsPlaying(false), 5000);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const { shapeClass, sizeStyle, textureClass, animateClass, isLocked } = getNodeStyles(data);

  return (
    <div
      className={`p-4 shadow-2xl min-w-[280px] max-w-[300px] text-white transition-all duration-300 border ${shapeClass} ${textureClass} ${animateClass}`}
      style={{ borderColor: 'rgba(14, 165, 233, 0.3)', boxShadow: '0 0 15px rgba(14, 165, 233, 0.15)', ...sizeStyle }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-sky-500 rounded-full border-2 border-black" />
      
      {isLocked && (
        <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 p-0.5 rounded-full border border-red-500/30 z-10">
          <Lock className="w-3 h-3" />
        </div>
      )}
      
      <div className={`space-y-3 ${isLocked ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="flex items-center gap-2 mb-3 border-b border-sky-500/20 pb-2">
          <Mic className="w-4 h-4 text-sky-400" />
          <span className="font-medium text-sm text-sky-300">Insight Audio Note</span>
        </div>

        {/* Waveform Canvas */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-2 relative">
          <canvas ref={canvasRef} width={240} height={40} className="w-full h-10 block" />
          {isRecording && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </div>

        {/* Audio controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg active:scale-95"
                title="Start Recording"
              >
                <div className="w-4.5 h-4.5 rounded bg-white" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all shadow-lg active:scale-95 animate-pulse"
                title="Stop Recording"
              >
                <Square className="w-4.5 h-4.5 text-white fill-white" />
              </button>
            )}

            {(audioUrl || transcript) && (
              <button
                onClick={togglePlayback}
                disabled={isRecording}
                className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center transition-all shadow-lg active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                )}
              </button>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-white/60 block uppercase tracking-wider">
              {isRecording ? 'Recording' : 'Elapsed'}
            </span>
            <span className="text-sm font-mono font-bold">
              {formatTime(recordTime)}
            </span>
          </div>
        </div>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Text Transcript */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold block">Transcript & Reflections</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-2 text-xs focus:outline-none focus:border-sky-500/50 resize-none text-white/80"
            placeholder="Type speech-to-text transcriptions or reflection indices..."
          />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-sky-500 rounded-full border-2 border-black" />
    </div>
  );
};

// 5. CHATBOT NODE (The direct in-canvas AI interface which can read other nodes and create/link structures)
interface ChatbotNodeProps extends NodeProps<Node<CanvasNodeData>> {
  id: string;
}

const ChatbotNode = ({ id, data }: NodeProps<Node<CanvasNodeData>>) => {
  const [inp, setInp] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>(data.chatHistory || []);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLabel, setActionLabel] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const cosmicData = data.cosmicData;
  const updateNodeData = data.updateNodeData;

  useEffect(() => {
    if (updateNodeData) {
      updateNodeData(id, { chatHistory: history });
    }
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Read all surrounding Canvas Node Contexts
  const gatherCanvasContext = () => {
    // In React Flow, we can capture values from data inputs parsed by other nodes
    const elements: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        // Traverse DOM or use state to describe current active coordinates added to canvas
        const notes = document.querySelectorAll('textarea');
        notes.forEach((el, index) => {
          const val = (el as HTMLTextAreaElement).value;
          if (val) {
            elements.push(`Element Node ${index + 1}: "${val}"`);
          }
        });
      } catch (err) {
        console.warn("DOM traversal limit reached:", err);
      }
    }
    return elements.join('\n');
  };

  const handleAsk = async () => {
    if (!inp.trim() || isLoading) return;
    const userMsg = inp;
    setInp('');
    setIsLoading(true);
    setActionLabel('Aligning astral frequencies...');

    const canvasCtx = gatherCanvasContext();
    const systemAugmentPrompt = `
      [SPECIALIZED CANVAS STUDY CONTEXT]
      The user has highlighted specific aspects inside their astral flow canvas.
      Active Canvas Elements Map:
      ${canvasCtx || 'No nodes typed yet.'}

      Guide the user deeper into integrating these nodes. Provide exact, structured mystical or geometrical connections between their nodes.
      Always structure responses elegantly with headers, bullets and deep explanations. Keep your analysis relevant to the specific data being explored.
    `;

    const updatedHistory = [
      ...history,
      { role: 'user' as const, parts: [{ text: userMsg }] },
    ];
    setHistory(updatedHistory);

    try {
      const response = await fetchCosmicChatResponse(
        `${systemAugmentPrompt}\n\nUser Question: ${userMsg}`,
        history,
        cosmicData || null
      );
      setHistory([
        ...updatedHistory,
        { role: 'model' as const, parts: [{ text: response.text }] },
      ]);
    } catch (err) {
      console.error(err);
      setHistory([
        ...updatedHistory,
        { role: 'model' as const, parts: [{ text: "The cosmic stream encountered a spatial rift. Please try aligning again." }] },
      ]);
    } finally {
      setIsLoading(false);
      setActionLabel('');
    }
  };

  // ADVANCED: Proceed with AI Unfold Canvas Node Graph Generation
  const handleAIUnfold = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setActionLabel('Unfolding akashic geometry...');

    const canvasCtx = gatherCanvasContext();

    try {
      const parsedResponse = await fetchUnfoldedNodes(canvasCtx, cosmicData || null);

      if (parsedResponse.nodes && parsedResponse.nodes.length > 0) {
        // Dispatch callback event or update parent nodes state by sending custom data through window event or direct update hook
        const unfoldEvent = new CustomEvent('canvas-nodes-unfolded', {
          detail: {
            chatbotNodeId: id,
            newNodes: parsedResponse.nodes,
          }
        });
        window.dispatchEvent(unfoldEvent);

        setHistory((prev) => [
          ...prev,
          { role: 'model' as const, parts: [{ text: "✨ **Akashic grid unfolded successfully!** I have projected complementary intelligence structures onto your cosmic workspace, interconnected with glowing energetic links based on your resonance." }] },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          { role: 'model' as const, parts: [{ text: "I analyzed further paths but they are currently shrouded in darkness. Ensure you select and configure celestial aspects first, then unfold the matrix map." }] },
        ]);
      }
    } catch (err) {
      console.error(err);
      setHistory((prev) => [
        ...prev,
        { role: 'model' as const, parts: [{ text: "The cosmic alignment was disrupted while unfolding the grid. Please re-align and try again." }] },
      ]);
    } finally {
      setIsLoading(false);
      setActionLabel('');
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-black/95 backdrop-blur-xl p-4 shadow-2xl min-w-[340px] max-w-[360px] text-white transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
      
      <div className="flex items-center justify-between mb-3 border-b border-purple-500/20 pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
          <span className="font-medium text-sm text-purple-300">Canvas AI Synthesizer</span>
        </div>
        <button
          onClick={handleAIUnfold}
          disabled={isLoading}
          className="flex items-center gap-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] px-2 py-1 rounded-lg transition-all border border-purple-500/30 disabled:opacity-50"
          title="Procedurally compile mindmap nodes based on current alignment"
        >
          <Sparkles className="w-3 h-3" />
          <span>AI Unfold</span>
        </button>
      </div>

      <div className="flex flex-col h-64 bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-3">
        {/* Chat Log */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-white/30 space-y-2">
              <MessageSquare className="w-6 h-6 animate-pulse" />
              <p className="text-xs">Ask the Higher Mind Guide to analyze your canvas coordinates to bridge spiritual matrices.</p>
            </div>
          ) : (
            history.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-white/35 font-mono mb-0.5 capitalize">{msg.role === 'user' ? 'Seeker' : 'Higher Mind'}</span>
                <div className={`p-2.5 rounded-xl max-w-[85%] text-xs ${msg.role === 'user' ? 'bg-purple-500/20 border border-purple-500/30 text-white' : 'bg-white/5 border border-white/5 text-white/90'}`}>
                  <div className="markdown-body font-sans leading-relaxed break-words">
                    <ReactMarkdown>{msg.parts?.[0]?.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="bg-black/60 backdrop-blur-sm p-2 flex items-center justify-center gap-2 border-t border-white/10">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span className="text-[10px] font-mono tracking-wider uppercase text-purple-200 animate-pulse">
              {actionLabel || 'Processing...'}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50"
          placeholder="Ask about your discoveries..."
          disabled={isLoading}
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !inp.trim()}
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shrink-0 disabled:opacity-50 active:scale-95"
        >
          Send
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
    </div>
  );
};

// --- CORE INTERCOUPLED CANVAS CANVAS CONTAINER ---

interface AstralCanvasProps {
  cosmicData: CosmicData | null;
}

interface CanvasDocument {
  id: string;
  name: string;
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
}

const AstralCanvasInner = ({ cosmicData }: AstralCanvasProps) => {
  const [canvases, setCanvases] = useState<CanvasDocument[]>([]);
  const [activeCanvasId, setActiveCanvasId] = useState<string>('');
  
  // React Flow hooks for managing localized nodes & edges
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Prevent SSR failures natively
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hydrate stored canvases on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('astral_research_canvases');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setCanvases(parsed);
          setActiveCanvasId(parsed[0].id);
          setNodes(parsed[0].nodes);
          setEdges(parsed[0].edges);
        } else {
          createInitCanvas();
        }
      } catch (e) {
        createInitCanvas();
      }
    } else {
      createInitCanvas();
    }
  }, []);

  // Listen back to AI Unfold event which dispatch procedural nodes placement on Active canvas
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUnfoldEvent = (e: Event) => {
      const { chatbotNodeId, newNodes } = (e as CustomEvent).detail;
      
      // Select position relative to where Chattanooga chat node is
      const chatNode = nodes.find((n) => n.id === chatbotNodeId);
      const startX = chatNode ? chatNode.position.x + 380 : 200;
      const startY = chatNode ? chatNode.position.y : 150;

      const preparedNodes: Node<CanvasNodeData>[] = newNodes.map((n: any, index: number) => {
        const type = n.type || 'noteNode';
        const nodeId = `gen_${type}_${Date.now()}_${index}`;
        return {
          id: nodeId,
          type: type,
          position: { x: startX + (index * 320) - 320, y: startY + 280 + ((index % 2) * 60) },
          data: {
            id: nodeId,
            title: n.title,
            content: n.content || '',
            color: n.color || '#a855f7',
            shapeType: n.shapeType || 'merkaba',
            solfeggioHz: n.solfeggioHz || 528,
            mediaType: n.mediaType || 'image',
            url: n.url || '',
            cosmicData,
            updateNodeData,
          }
        };
      });

      const preparedEdges: Edge[] = preparedNodes.map((pn) => ({
        id: `${chatbotNodeId}-to-${pn.id}`,
        source: chatbotNodeId,
        target: pn.id,
        style: { stroke: '#a855f7', strokeWidth: 2, filter: 'drop-shadow(0 0 5px #a855f7)' },
        animated: true,
      }));

      setNodes((nds) => [...nds, ...preparedNodes]);
      setEdges((egs) => [...egs, ...preparedEdges]);
    };

    window.addEventListener('canvas-nodes-unfolded', handleUnfoldEvent);
    return () => window.removeEventListener('canvas-nodes-unfolded', handleUnfoldEvent);
  }, [nodes, edges]);

  // Sync active canvas back state to canvas list list
  useEffect(() => {
    if (!activeCanvasId || canvases.length === 0) return;
    setCanvases((prev) =>
      prev.map((c) => {
        if (c.id === activeCanvasId) {
          return { ...c, nodes, edges };
        }
        return c;
      })
    );
  }, [nodes, edges]);

  // Persist modifications to Local Storage
  useEffect(() => {
    if (canvases.length > 0) {
      localStorage.setItem('astral_research_canvases', JSON.stringify(canvases));
    }
  }, [canvases]);

  const createInitCanvas = () => {
    const defaultId = `canvas_${Date.now()}`;
    const initNode: Node<CanvasNodeData> = {
      id: 'chatbot_root',
      type: 'chatbotNode',
      position: { x: 320, y: 150 },
      data: {
        id: 'chatbot_root',
        title: 'Higher Guidance Node',
        cosmicData,
        updateNodeData,
      }
    };
    const defaultCanvas: CanvasDocument = {
      id: defaultId,
      name: 'Primary Ascension Matrix',
      nodes: [initNode],
      edges: [],
    };
    setCanvases([defaultCanvas]);
    setActiveCanvasId(defaultId);
    setNodes([initNode]);
    setEdges([]);
  };

  // Node customization updates hook
  const updateNodeData = (nodeId: string, updatedFields: Partial<CanvasNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: { ...n.data, ...updatedFields }
          };
        }
        return n;
      })
    );
  };

  // Register state-bound nodes
  const nodeTypes = useMemo(() => ({
    noteNode: NoteNode,
    videoNode: VideoNode,
    mediaNode: MediaNode,
    celestialNode: CelestialNode,
    voiceNode: VoiceNode,
    chatbotNode: ChatbotNode,
    threeWidgetNode: ThreeWidgetNode,
    dynamicNotepadNode: DynamicNotepadNode,
    solfeggioNode: SolfeggioNode,
  }), [cosmicData]);

  const onConnect = (params: Connection) => {
    let strokeColor = '#a855f7'; // amethyst
    let strokeWidth = 2.5;
    const animated = true;

    const src = params.source || '';
    const tgt = params.target || '';
    
    if (src.includes('solfeggio') || tgt.includes('solfeggio')) {
      strokeColor = '#f59e0b'; // amber gold
      strokeWidth = 3;
    } else if (src.includes('chatbot') || tgt.includes('chatbot')) {
      strokeColor = '#ec4899'; // starry pink
      strokeWidth = 3;
    } else if (src.includes('three') || tgt.includes('three') || src.includes('widget') || tgt.includes('widget')) {
      strokeColor = '#06b6d4'; // neon cyan
      strokeWidth = 2.5;
    } else if (src.includes('media') || tgt.includes('media')) {
      strokeColor = '#10b981'; // emerald green
    }

    const newEdge: Edge = {
      ...params,
      id: `edge_${Date.now()}`,
      animated,
      style: {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        filter: `drop-shadow(0px 0px 4px ${strokeColor})`,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 15,
        height: 15,
      }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  };

  const handleCreateNewCanvas = (blankName = '') => {
    const newId = `canvas_${Date.now()}`;
    const cleanNode: Node<CanvasNodeData> = {
      id: `chatbot_${Date.now()}`,
      type: 'chatbotNode',
      position: { x: 300, y: 150 },
      data: {
        id: `chatbot_${Date.now()}`,
        title: 'Ascension Synthesizer',
        cosmicData,
        updateNodeData,
      }
    };
    const newDoc: CanvasDocument = {
      id: newId,
      name: blankName || `Astral Pattern Mapping ${canvases.length + 1}`,
      nodes: [cleanNode],
      edges: [],
    };
    setCanvases((prev) => [...prev, newDoc]);
    setActiveCanvasId(newId);
    setNodes([cleanNode]);
    setEdges([]);
  };

  const handleDeleteCanvas = (cId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvases.length <= 1) return;
    const filtered = canvases.filter((c) => c.id !== cId);
    setCanvases(filtered);
    if (activeCanvasId === cId) {
      setActiveCanvasId(filtered[0].id);
      setNodes(filtered[0].nodes);
      setEdges(filtered[0].edges);
    }
  };

  const handleSwitchCanvas = (cId: string) => {
    const selected = canvases.find((c) => c.id === cId);
    if (selected) {
      setActiveCanvasId(cId);
      // Ensure node update functions are re-bound in React-Flow state
      const boundNodes = selected.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          cosmicData,
          updateNodeData,
        }
      }));
      setNodes(boundNodes);
      setEdges(selected.edges);
    }
  };

  const handleCopyNode = (node: Node<any>) => {
    const newId = `${node.type}_clone_${Date.now()}`;
    const clonedNode: Node<any> = {
      ...node,
      id: newId,
      selected: false,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: {
        ...node.data,
        id: newId,
        updateNodeData, // rebind update ref
      },
    };
    setNodes((nds) => [...nds, clonedNode]);
  };

  const handleDeleteSelectedNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  };

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.selected);
  }, [nodes]);

  const handleAddNode = (type: 'noteNode' | 'videoNode' | 'mediaNode' | 'celestialNode' | 'voiceNode' | 'chatbotNode' | 'threeWidgetNode' | 'dynamicNotepadNode' | 'solfeggioNode') => {
    const newId = `${type}_${Date.now()}`;
    // position node nicely at center coordinates
    const offsetPositions = {
      noteNode: { title: 'Cosmic Reflection' },
      videoNode: { title: 'Celestial Meditations' },
      mediaNode: { title: 'Celestial Media Canvas' },
      celestialNode: { title: 'Astrology Alignment' },
      voiceNode: { title: 'Spiritual Transcription' },
      chatbotNode: { title: 'Dimensional Synthesizer' },
      threeWidgetNode: { title: 'Aetheric 3D Object' },
      dynamicNotepadNode: { title: 'Dynamic Notepad' },
      solfeggioNode: { title: 'Solfeggio Frequencies' },
    };

    const newNode: Node<CanvasNodeData> = {
      id: newId,
      type,
      position: { x: Math.random() * 200 + 150, y: Math.random() * 200 + 120 },
      data: {
        id: newId,
        title: offsetPositions[type].title,
        cosmicData,
        updateNodeData,
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleClearNodes = () => {
    if (window.confirm("Are you sure you want to align and clear the current research matrix?")) {
      setNodes([]);
      setEdges([]);
    }
  };

  const handleResetActiveCanvas = () => {
    if (window.confirm("ARE YOU SURE? THIS WILL DISSOLVE THE CURRENT QUANTUM MAPPING AND RETURN TO ROOT SOURCE.")) {
      const initNode: Node<CanvasNodeData> = {
        id: `chatbot_${Date.now()}`,
        type: 'chatbotNode',
        position: { x: 300, y: 150 },
        data: {
          id: `chatbot_${Date.now()}`,
          title: 'Ascension Synthesizer',
          cosmicData,
          updateNodeData,
        }
      };
      setNodes([initNode]);
      setEdges([]);
    }
  };

  if (!isClient) return null;

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col bg-slate-950/40 relative rounded-3xl border border-white/5 overflow-hidden">
      
      {/* 1. TOP UTILITY BAR (Toolbar, Node buttons and Canvas control) */}
      <div className="z-10 p-4 border-b border-white/10 bg-black/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Canvas Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 text-purple-300">
            <Workflow className="w-4 h-4 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider">Research Matrix Space</span>
          </div>

          <div className="relative group">
            <select
              value={activeCanvasId}
              onChange={(e) => handleSwitchCanvas(e.target.value)}
              className="bg-white/5 border border-white/10 text-white font-medium rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500/40 cursor-pointer"
            >
              {canvases.map((c) => (
                <option key={c.id} value={c.id} className="text-black font-sans">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleCreateNewCanvas()}
            className="flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Matrix</span>
          </button>
        </div>

        {/* Node Creators Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Advanced Operations */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-white/10 mr-1">
            <button
              onClick={handleResetActiveCanvas}
              className="group flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
              title="Reset current canvas to root state"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Reset Flux</span>
            </button>
            <button
              onClick={handleClearNodes}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              title="Wipe all nodes from current view"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Wipe grid</span>
            </button>
          </div>
          <button
            onClick={() => handleAddNode('noteNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-purple-500/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Create down ideas"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Note</span>
          </button>

          <button
            onClick={() => handleAddNode('videoNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-rose-500/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Add Youtube players"
          >
            <Video className="w-4 h-4 text-rose-400" />
            <span>Video URL</span>
          </button>

          <button
            onClick={() => handleAddNode('mediaNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-emerald-500/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Upload raw assets (images, gifs, video, audio)"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload Media</span>
          </button>

          <button
            onClick={() => handleAddNode('celestialNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-500/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Map metrics from your profile"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Celestial</span>
          </button>

          <button
            onClick={() => handleAddNode('voiceNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-sky-500/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Record insights"
          >
            <Mic className="w-4 h-4 text-sky-400" />
            <span>Voice Memo</span>
          </button>

          <button
            onClick={() => handleAddNode('chatbotNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-purple-500/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Synthesize ideas with AI"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>AI Chat</span>
          </button>

          <button
            onClick={() => handleAddNode('dynamicNotepadNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-purple-400/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Create interactive notes and prompt tools"
          >
            <BookOpen className="w-4 h-4 text-purple-300" />
            <span>Interactive Notepad</span>
          </button>

          <button
            onClick={() => handleAddNode('threeWidgetNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-sky-400/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Open immersive 3D generative objects"
          >
            <Layers className="w-4 h-4 text-sky-300" />
            <span>3D Object</span>
          </button>

          <button
            onClick={() => handleAddNode('solfeggioNode')}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-400/30 text-white text-xs px-3 py-2 rounded-xl transition-all"
            title="Synthesize real meditative soundscapes"
          >
            <Headphones className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Solfeggio Sound</span>
          </button>

          <div className="h-6 w-[1px] bg-white/10 mx-1" />
        </div>
      </div>

      {/* 2. MAIN FLOW AREA */}
      <div className="flex-1 w-full bg-slate-950 relative min-h-[500px]">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            className="text-black bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950"
            fitView
          >
            <Controls className="!bg-black/90 !border-white/10 !text-white rounded-xl" />
            <Background color="#a855f7" gap={16} size={0.7} style={{ opacity: 0.15 }} />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'chatbotNode') return '#a855f7';
                if (node.type === 'noteNode') return node.data?.color || '#3b82f6';
                if (node.type === 'videoNode') return '#ef4444';
                if (node.type === 'celestialNode') return '#f59e0b';
                if (node.type === 'voiceNode') return '#0ea5e9';
                return '#ccc';
              }}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}
              className="hidden sm:block"
            />
          </ReactFlow>

          {/* Majestic Floating Node Menu */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
              >
                <div className="flex flex-wrap items-center gap-2 bg-black/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-purple-500/40 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)] max-w-[95vw] overflow-x-auto scrollbar-none shrink-0">
                  {/* Title Info */}
                  <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-white/90 truncate max-w-[100px]">Customizer</span>
                  </div>

                  {/* Lock/Unlock Switcher */}
                  <button
                    onClick={() => updateNodeData(selectedNode.id, { locked: !selectedNode.data.locked })}
                    className={`p-1.5 rounded-xl border transition-all ${selectedNode.data.locked ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 hover:border-white/20 text-white/60 hover:text-white'}`}
                    title={selectedNode.data.locked ? "Unlock Node Content" : "Lock Node Content"}
                  >
                    {selectedNode.data.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Shape customized selector */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 shrink-0">
                    <Shapes className="w-3.5 h-3.5 text-sky-400" />
                    <select
                      value={selectedNode.data.shape || 'rounded'}
                      onChange={(e) => updateNodeData(selectedNode.id, { shape: e.target.value as any })}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-wider border-0 focus:ring-0 text-white cursor-pointer py-0.5 outline-none font-mono"
                    >
                      <option value="rounded" className="bg-slate-950 text-white">Round</option>
                      <option value="sharp" className="bg-slate-950 text-white">Sharp Edge</option>
                      <option value="bevel" className="bg-slate-950 text-white">Bevel Border</option>
                      <option value="hex" className="bg-slate-950 text-white">Hexagon Style</option>
                      <option value="pill" className="bg-slate-950 text-white">Pill Shape</option>
                    </select>
                  </div>

                  {/* Size customized selector */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 shrink-0">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <select
                      value={selectedNode.data.size || 'md'}
                      onChange={(e) => updateNodeData(selectedNode.id, { size: e.target.value as any })}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-wider border-0 focus:ring-0 text-white cursor-pointer py-0.5 outline-none font-mono"
                    >
                      <option value="sm" className="bg-slate-950 text-white">Small</option>
                      <option value="md" className="bg-slate-950 text-white">Medium</option>
                      <option value="lg" className="bg-slate-950 text-white">Large</option>
                      <option value="xl" className="bg-slate-950 text-white">Scale Up</option>
                    </select>
                  </div>

                  {/* Texture customized selector */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 shrink-0">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    <select
                      value={selectedNode.data.texture || 'glass'}
                      onChange={(e) => updateNodeData(selectedNode.id, { texture: e.target.value as any })}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-wider border-0 focus:ring-0 text-white cursor-pointer py-0.5 outline-none font-mono"
                    >
                      <option value="glass" className="bg-slate-950 text-white">Glow Glass</option>
                      <option value="grid" className="bg-slate-950 text-white">Matrix Grid</option>
                      <option value="noise" className="bg-slate-950 text-white">Fine Noise</option>
                      <option value="plasma" className="bg-slate-950 text-white">Nebula Plasma</option>
                      <option value="scanlines" className="bg-slate-950 text-white">Phosphor Line</option>
                    </select>
                  </div>

                  {/* Animation customized selector */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 shrink-0">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <select
                      value={selectedNode.data.customAnimation || 'none'}
                      onChange={(e) => updateNodeData(selectedNode.id, { customAnimation: e.target.value as any })}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-wider border-0 focus:ring-0 text-white cursor-pointer py-0.5 outline-none font-mono"
                    >
                      <option value="none" className="bg-slate-950 text-white">Static</option>
                      <option value="bobbing" className="bg-slate-950 text-white">Pendulum Bob</option>
                      <option value="pulse" className="bg-slate-950 text-white">Emanating Pulse</option>
                      <option value="glow" className="bg-slate-950 text-white">Radiance Glow</option>
                    </select>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopyNode(selectedNode)}
                    className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white"
                    title="Duplicate selected Node"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteSelectedNode(selectedNode.id)}
                    className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all hover:scale-105"
                    title="Delete selected Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ReactFlowProvider>

        {/* Dynamic Instructional Helper Badge */}
        <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 text-white/60 pointer-events-none text-xs flex items-center gap-2.5 max-w-[340px]">
          <Info className="w-4 h-4 text-purple-400 shrink-0" />
          <div>
            <p className="font-bold text-white/80">Infinite Research Canvas Active</p>
            <p className="text-[10px] leading-relaxed text-white/50">Drag connection ports to map causal links between cosmic coordinates, notes, media, and voice records.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AstralCanvas = (props: AstralCanvasProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-slate-950/40 rounded-[2rem] border border-white/5">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span className="text-xs text-white/40 font-mono">Initializing Astral Canvas Matrix...</span>
        </div>
      </div>
    );
  }

  return <AstralCanvasInner {...props} />;
};
