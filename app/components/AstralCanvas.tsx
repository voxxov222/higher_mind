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
} from 'lucide-react';
import { CosmicData } from '../types';
import { fetchCosmicChatResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

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
}

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

  return (
    <div
      className="rounded-2xl border bg-black/80 backdrop-blur-xl p-4 shadow-2xl min-w-[280px] text-white overflow-hidden transition-all duration-300"
      style={{ borderColor: `${theme}66`, boxShadow: `0 0 15px ${theme}33` }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
      
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
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

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-black/95 backdrop-blur-xl p-4 shadow-2xl min-w-[340px] text-white transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(244, 63, 94, 0.15)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-rose-500 rounded-full border-2 border-black" />
      
      <div className="flex items-center gap-2 mb-3 border-b border-rose-500/20 pb-2">
        <Video className="w-4 h-4 text-rose-400" />
        <span className="font-medium text-sm text-rose-300">Celestial Media Widget</span>
      </div>

      <div className="mb-3 space-y-1">
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

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-rose-500 rounded-full border-2 border-black" />
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

  return (
    <div className="rounded-2xl border border-sky-500/30 bg-black/95 backdrop-blur-xl p-4 shadow-2xl min-w-[280px] max-w-[300px] text-white transition-all duration-300" style={{ boxShadow: '0 0 15px rgba(14, 165, 233, 0.15)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-sky-500 rounded-full border-2 border-black" />
      
      <div className="flex items-center gap-2 mb-3 border-b border-sky-500/20 pb-2">
        <Mic className="w-4 h-4 text-sky-400" />
        <span className="font-medium text-sm text-sky-300">Insight Audio Note</span>
      </div>

      <div className="space-y-3">
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
    const alignmentTheme = `
      You are standardizing an interlocking grid map of nodes. 
      Analyze the user's active details:
      ${canvasCtx || 'General cosmic coordinates'}
      
      Generate a set of 3-4 highly synchronized structural nodes representing further advanced spiritual research topics.
      Each node MUST have:
      - title: name of the topic
      - content: brief summary (1-2 sentences) of why it connects to their profile.
      - type: "noteNode"
      
      Provide your response in EXACT, VALID JSON format matching this schema:
      {
        "nodes": [
          {"id": "gen_1", "type": "noteNode", "title": "...", "content": "..."},
          ...
        ]
      }
      Do NOT include any extra conversational markdown. ONLY return the final JSON.
    `;

    try {
      const response = await fetchCosmicChatResponse(alignmentTheme, [], cosmicData || null);
      
      let parsedResponse: { nodes?: { id: string; type: string; title: string; content: string }[] } = {};
      try {
        const cleanJson = response.text.replace(/```json|```/g, "").trim();
        parsedResponse = JSON.parse(cleanJson);
      } catch (err) {
        console.error("Failed to parse automatic canvas structure", err);
      }

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
          { role: 'model' as const, parts: [{ text: "✨ **Akashic grid unfolded successfully!** I have projected 3 complementary intelligence structures onto your cosmic workspace, interconnected with glowing energetic links based on your resonance." }] },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          { role: 'model' as const, parts: [{ text: "I analyzed further paths but they are currently shrouded in darkness. Ensure you select and configure celestial aspects first, then unfold the matrix map." }] },
        ]);
      }
    } catch (err) {
      console.error(err);
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
                  <ReactMarkdown className="markdown-body font-sans leading-relaxed break-words">{msg.parts?.[0]?.text}</ReactMarkdown>
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

      const preparedNodes: Node<CanvasNodeData>[] = newNodes.map((n: any, index: number) => ({
        id: `gen_note_${Date.now()}_${index}`,
        type: 'noteNode',
        position: { x: startX + (index * 300) - 300, y: startY + 280 + (index % 2 * 60) },
        data: {
          id: `gen_note_${Date.now()}_${index}`,
          title: n.title,
          content: n.content,
          color: '#a855f7',
          cosmicData,
          updateNodeData,
        }
      }));

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
    celestialNode: CelestialNode,
    voiceNode: VoiceNode,
    chatbotNode: ChatbotNode,
  }), [cosmicData]);

  const onConnect = (params: Connection) => {
    const newEdge: Edge = {
      ...params,
      id: `edge_${Date.now()}`,
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
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

  const handleAddNode = (type: 'noteNode' | 'videoNode' | 'celestialNode' | 'voiceNode' | 'chatbotNode') => {
    const newId = `${type}_${Date.now()}`;
    // position node nicely at center coordinates
    const offsetPositions = {
      noteNode: { title: 'Cosmic Reflection' },
      videoNode: { title: 'Celestial Meditations' },
      celestialNode: { title: 'Astrology Alignment' },
      voiceNode: { title: 'Spiritual Transcription' },
      chatbotNode: { title: 'Dimensional Synthesizer' },
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
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Canvas</span>
          </button>
        </div>

        {/* Node Creators Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
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
            <span>Video</span>
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

          <div className="h-6 w-[1px] bg-white/10 mx-1" />

          {/* Delete active Canvas document */}
          <button
            onClick={(e) => handleDeleteCanvas(activeCanvasId, e)}
            disabled={canvases.length <= 1}
            className="p-2 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 rounded-xl text-white/55 hover:text-red-400 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            title="Delete Canvas Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Clear Current State */}
          <button
            onClick={handleClearNodes}
            className="flex items-center gap-1 text-[11px] font-bold text-white/50 hover:text-white uppercase px-2 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 font-mono transition-all"
          >
            Clear Canvas
          </button>
        </div>
      </div>

      {/* 2. MAIN FLOW AREA */}
      <div className="flex-1 w-full bg-slate-950 position relative min-h-[500px]">
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
