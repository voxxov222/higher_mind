import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Shield, Compass, BookOpen, Volume2, VolumeX, AlertCircle, 
  Lightbulb, RefreshCw, Key, Award, Heart, Eye, ArrowUpRight, Zap
} from 'lucide-react';
import { CosmicData } from '../types';
import { fetchCosmicChatResponse } from '../services/geminiService';

interface ChristSophiaSectionProps {
  data: CosmicData | null;
}

// 7 Gnostic Celestial Gates & their Archons (illusions) + Virtues (solutions)
const ARCHON_GATES = [
  {
    level: 1,
    name: "Malkuth Gate / Horos (The Boundary)",
    archon: "Yaldabaoth (Ignorance & Blind Force)",
    virtue: "Faith & Spiritual Recall (Mnemosis)",
    frequency: 396,
    color: "#EF4444", // Red
    description: "The gateway of earthly attachment and physical limitation. Transcending requires remembering your divine source.",
    keynote: "Release earthly fear and recall your cosmic spark."
  },
  {
    level: 2,
    name: "Yesod Gate / Elaios (The Mercury Wave)",
    archon: "Iao (Emotional Entrapment & Desire)",
    virtue: "Purity & Silencing the Astral Storm",
    frequency: 417,
    color: "#F97316", // Orange
    description: "The sub-lunar portal of fantasy and fluctuating moods. To unlock, stabilize the imaginative mind into steady wisdom.",
    keynote: "Transform sensory impulse into creative clarity."
  },
  {
    level: 3,
    name: "Hod Gate / Sabaoth (The Mars Forge)",
    archon: "Sabaoth (Pride & Intellectual Authority)",
    virtue: "Humility & Gnosis (Inner Direct-Knowing)",
    frequency: 528,
    color: "#EAB308", // Yellow
    description: "The sphere of mental structures, dogmas, and critical pride. Shift from rigid knowledge to direct celestial experiencing.",
    keynote: "Let go of dogma to experience direct light."
  },
  {
    level: 4,
    name: "Netzach Gate / Adonaeos (The Solar Radiance)",
    archon: "Adonai (Attachment to Fame & Power)",
    virtue: "Surrender & Celestial Unity (Zoe)",
    frequency: 639,
    color: "#10B981", // Green
    description: "The gate of personal identity and solar ego. Transcending means harmonizing individual will with the cosmic syzygy.",
    keynote: "Unify the heart with all living structures."
  },
  {
    level: 5,
    name: "Tiphereth Gate / Astaphanos (The Venusian Shell)",
    archon: "Astaphanos (Lust, Illusion & Vanity)",
    virtue: "Divine Love (Charis) & Celestial Union",
    frequency: 741,
    color: "#06B6D4", // Cyan
    description: "The palace of desire and outward mirror-reflections. Shift focus to internal spiritual beauty and Christ-Sophia synthesis.",
    keynote: "Awaken your latent spiritual intuition."
  },
  {
    level: 6,
    name: "Geburah Gate / Thouth (The Mercury Mind)",
    archon: "Thouth (Deceptive Logic & False Light)",
    virtue: "Silence (Sige) & Deep Stillness",
    frequency: 852,
    color: "#6366F1", // Indigo
    description: "The gate of intellectual systems and sophistry. Real clarity comes through inner silence and the stillness of the Nous.",
    keynote: "Return to the silence of the divine order."
  },
  {
    level: 7,
    name: "Binah Gate / Keter Realm / Sige (The Abyss)",
    archon: "Yaldabaoth's Outer Ring (The Void/Chaos)",
    virtue: "Divine Wisdom (Sophia) & Unified Logos (Christos)",
    frequency: 963,
    color: "#A855F7", // Purple
    description: "The final threshold of the material universe. Dissolves all duality back into the unified light of the Pleroma.",
    keynote: "Re-enter the fullness (Pleroma) of absolute eternity."
  }
];

export const ChristSophiaSection: React.FC<ChristSophiaSectionProps> = ({ data }) => {
  // Input sliders for Christ-Sophia balancing
  const [logosScale, setLogosScale] = useState(50); // Christos: Order, structure, logic, ascent
  const [sophiaScale, setSophiaScale] = useState(50); // Wisdom: Intuition, experience, descent
  const [unlockedGates, setUnlockedGates] = useState<number[]>([1]); // Malkuth is active
  const [currentGateIdx, setCurrentGateIdx] = useState(0);
  const [consciousnessLevel, setConsciousnessLevel] = useState(432); // initial standard sacred hertz
  const [promptInput, setPromptInput] = useState('');
  
  // AI Reading State
  const [isGeneratingReading, setIsGeneratingReading] = useState(false);
  const [gnosticReading, setGnosticReading] = useState<string | null>(null);
  const [readingError, setReadingError] = useState<string | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('last_gnostic_reading');
      if (saved) {
        setGnosticReading(saved);
      }
    }
  }, []);

  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.2);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Canvas waves animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Save reading to localStorage
  useEffect(() => {
    if (gnosticReading) {
      localStorage.setItem('last_gnostic_reading', gnosticReading);
    }
  }, [gnosticReading]);

  // Handle local state based on user's cosmic profile data if available
  useEffect(() => {
    if (data) {
      // Guide user sliders based on their actual numerology or birth factors
      const lifePath = data.numerology?.lifePath || 5;
      const expression = data.numerology?.expression || 4;
      
      // Seed values based on profile
      const seededLogos = Math.min(100, Math.max(10, (lifePath * 7) + 20));
      const seededSophia = Math.min(100, Math.max(10, (expression * 8) + 15));
      setLogosScale(seededLogos);
      setSophiaScale(seededSophia);
    }
  }, [data]);

  // Audio system initializer & update
  const startSoundBath = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create main gain
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(audioVolume, ctx.currentTime + 1.5);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      // Base Christos Frequency
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(consciousnessLevel, ctx.currentTime);
      osc1.connect(gainNode);
      osc1.start();
      osc1Ref.current = osc1;

      // Sophia harmonic offset frequency
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      // Create a nice fifth interval or drone depending on Sophia scale
      const sophiaFreq = consciousnessLevel * (sophiaScale / logosScale || 1.2);
      osc2.frequency.setValueAtTime(sophiaFreq, ctx.currentTime);
      
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.04, ctx.currentTime); // keep soft
      osc2Gain.connect(gainNode);

      osc2.connect(osc2Gain);
      osc2.start();
      osc2Ref.current = osc2;

      setIsAudioPlaying(true);
    } catch (e) {
      console.error("Audio Engine launch failed", e);
    }
  };

  const stopSoundBath = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, audioCtxRef.current.currentTime);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.8);
      setTimeout(() => {
        osc1Ref.current?.stop();
        osc2Ref.current?.stop();
        osc1Ref.current = null;
        osc2Ref.current = null;
        gainNodeRef.current = null;
        setIsAudioPlaying(false);
      }, 900);
    } else {
      setIsAudioPlaying(false);
    }
  };

  // Update sound pitches dynamically as values change
  useEffect(() => {
    if (osc1Ref.current && audioCtxRef.current) {
      osc1Ref.current.frequency.exponentialRampToValueAtTime(consciousnessLevel, audioCtxRef.current.currentTime + 0.5);
    }
    if (osc2Ref.current && audioCtxRef.current) {
      const sophiaFreq = consciousnessLevel * (sophiaScale / logosScale || 1.1);
      osc2Ref.current.frequency.exponentialRampToValueAtTime(sophiaFreq, audioCtxRef.current.currentTime + 0.5);
    }
  }, [consciousnessLevel, logosScale, sophiaScale]);

  // Sync volume node
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(audioVolume, audioCtxRef.current.currentTime + 0.2);
    }
  }, [audioVolume]);

  // Clean up audio
  useEffect(() => {
    return () => {
      osc1Ref.current?.stop();
      osc2Ref.current?.stop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Draw Gnostic Sacred Harmony Waves (Canvas visualizer)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 200);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      height = canvas.height = 200;
    };
    window.addEventListener('resize', handleResize);

    let offset = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Gradient background
      ctx.fillStyle = 'rgba(10, 10, 15, 0.4)';
      ctx.fillRect(0, 0, width, height);

      const lines = 3;
      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        ctx.lineWidth = i === 1 ? 2.5 : 1.2;
        
        // Blend colors representing Christos (yellow) and Sophia (cyan/blue)
        const primaryColorStr = i === 1 ? 'rgba(251, 191, 36, 0.75)' : 'rgba(6, 182, 212, 0.4)';
        ctx.strokeStyle = primaryColorStr;

        // Amplitude modulated by scales
        const modifier = (logosScale + sophiaScale) / 100;
        const amplitude = (15 + i * 12) * modifier;
        const frequency = (0.005 + i * 0.003) * (consciousnessLevel / 432);

        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin(x * frequency + offset + i) * amplitude +
            Math.cos(x * 0.002 + offset * 0.5) * (amplitude / 3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Render pulsing node in center representing the Syzygy Synthesis
      const centerX = width / 2;
      const centerY = height / 2;
      const pulseSize = 10 + Math.sin(offset * 2) * 3;
      
      // Outer glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, pulseSize * 4);
      glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.8)'); // Amethyst center (combines logic/intuition)
      glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core anchor
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      offset += 0.03 + (consciousnessLevel / 20000);
      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [logosScale, sophiaScale, consciousnessLevel]);

  // Syzygy Synthesis Rating text
  const getSyzygyRating = () => {
    const diff = Math.abs(logosScale - sophiaScale);
    if (diff < 10) {
      return {
        title: "Syzygy Re-Aligned (Divine Balance)",
        text: "Your active solar logic (Christos) and deep lunar wisdom (Sophia) are in perfect harmonic equilibrium. You walk the narrow pathway back to the Pleroma.",
        advice: "Maintain this balance. Frame every logical scheme with loving empathy, and ground every intuition in structured reason.",
        status: "Balanced"
      };
    } else if (logosScale > sophiaScale) {
      return {
        title: "Logos-Dominant (Ascending Structure)",
        text: "Your cosmic matrix leans heavily into analytical order, systems, and active spiritual ascent (Christos). You seek clarity but might ignore the felt experiential wisdom.",
        advice: "Surrender your ego occasionally. Allow silence (Sige) and spontaneous intuitive creation (Sophia) to filter into your rigid structures.",
        status: "Logic Proactive"
      };
    } else {
      return {
        title: "Sophia-Dominant (Experiential Dreamer)",
        text: "Your spiritual container is overflowing with emotional depth, mystic insights, and psychic empathy (Sophia). Yet you lack the structural core (Logos) to translate it into physical action.",
        advice: "Build sacred structures. Dedicate your insights into daily disciplines, books, codes, and logical frameworks to ground your cosmic gnosis.",
        status: "Intuition Overflow"
      };
    }
  };

  const syzygyDetails = getSyzygyRating();

  // Try unlocking the next gate in the ascent ritual
  const handleUnlockGate = (gateLevel: number) => {
    if (!unlockedGates.includes(gateLevel)) {
      // Must unlock step by step
      if (unlockedGates.includes(gateLevel - 1)) {
        const nextGates = [...unlockedGates, gateLevel];
        setUnlockedGates(nextGates);
        // Play the gate frequency
        const gate = ARCHON_GATES.find(g => g.level === gateLevel);
        if (gate) {
          setConsciousnessLevel(gate.frequency);
        }
      }
    }
    setCurrentGateIdx(gateLevel - 1);
  };

  // Reset the pathworking ascent
  const handleResetAscent = () => {
    setUnlockedGates([1]);
    setCurrentGateIdx(0);
    setConsciousnessLevel(396);
  };

  // Generate Personalized Gnostic Reading using Gemini
  const handleGenerateGnosticReading = async () => {
    setIsGeneratingReading(true);
    setReadingError(null);
    try {
      const activeGate = ARCHON_GATES[unlockedGates.length - 1] || ARCHON_GATES[0];
      const customPrompt = `
      Perform an elite, high-dimensional personal Gnostic Reading. 
      The seeker is investigating the divine syzygy of Christos (Structural Order, Logic, Ascending Logos - score ${logosScale}/100) 
      and Sophia (Mystic Experiential Surrender, Descending Divine Wisdom - score ${sophiaScale}/100).
      Their current pathworking is at Level ${unlockedGates.length}: ${activeGate.name}, confronting the Archon ${activeGate.archon} with the virtue of ${activeGate.virtue}.
      
      Make the reading highly personalized, poetic, esoterically dense, and practical. Divide it into:
      1. THE SACRED SYZYGY PROFILE: Analyze their score of (${logosScale} logos vs ${sophiaScale} Sophia) in relationship to their astrological aura (Current planetary alignments: ${JSON.stringify(data?.planets || [])}).
      2. THE FALL AND RERISE: Explain how their inner Sophia has fallen into minor worldly traps/shadows and how they can pull her back up.
      3. ARCHON CONFRONTATION: Provide a targeted mental ritual or meditation exercise to dissolve the influence of ${activeGate.archon}.
      4. CEL_DNA ASCENT FREQUENCY: Explain the resonance of their recommended Solfeggio frequency: ${consciousnessLevel} Hz and a practical homework practice to heighten their level of consciousness.
      `;

      // Call Gemini proxy
      const result = await fetchCosmicChatResponse(customPrompt, [], data);
      setGnosticReading(result.text);
    } catch (err: any) {
      console.error(err);
      setReadingError(err.message || "The celestial lines are currently congested. Try returning to stillness and attempting again.");
    } finally {
      setIsGeneratingReading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Hero Banner / Introductory Section */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-stone-950 via-purple-950/20 to-stone-950 p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE GNOSTIC SYZYGY OF WISDOM & LIGHT</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight">
              Christ-Sophia <span className="font-serif italic text-cyan-300">Gnosis</span>
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed">
              In Gnostic mysticism, ultimate enlightenment is achieved not by simple belief, but through 
              <span className="text-stone-200"> Gnosis</span>—direct, experiential knowledge of the divine. At the peak of the 
              Pleroma stands the unified pair (<span className="text-amber-300 font-medium">Christos</span>, the ordering Logos Principle, 
              and <span className="text-cyan-300 font-medium">Sophia</span>, the intuitive cosmic soul). Explore your internal syzygy balance 
              and ascend past the 7 Archontic Gates to return to absolute oneness.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-black/40 border border-white/10 p-4 rounded-3xl backdrop-blur-sm self-stretch md:self-auto justify-center min-w-[180px]">
            <span className="text-xs text-stone-500 font-mono">CONSCIOUSNESS</span>
            <span className="text-3xl font-light text-purple-400 font-mono tracking-wider">
              {consciousnessLevel}<span className="text-sm">Hz</span>
            </span>
            <div className="w-full flex justify-between px-2 text-[10px] text-stone-500 font-mono">
              <span>SOLFEGGIO RESONANCE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Workspace Integration (2-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Interactive Syzygy Balance Engine */}
        <div className="space-y-6 flex flex-col justify-between p-8 rounded-[2.5rem] border border-white/10 bg-stone-900/40 backdrop-blur-md relative overflow-hidden shadow-xl">
          <div className="space-y-4">
            <h2 className="text-xl font-light text-white">1. Syzygy Matrix Adjustment</h2>
            <p className="text-xs text-stone-400">
              Your spiritual signature dynamically recalibrates when adjusting active logical architecture (Logos/Christos) 
              against direct emotional/intuitive surrender (Wisdom/Sophia).
            </p>

            {/* Logos Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5" /> CHRISTOS (ORDER / LOGOS)
                </span>
                <span className="text-stone-300">{logosScale}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={logosScale}
                onChange={(e) => setLogosScale(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-stone-800"
              />
              <p className="text-[10px] text-stone-500 leading-snug">
                Represents your capacity for boundaries, analytical study, logic, structures, and cosmic order.
              </p>
            </div>

            {/* Sophia Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400 flex items-center gap-1.5 font-medium">
                  <Heart className="w-3.5 h-3.5" /> SOPHIA (WISDOM / GNOSIS)
                </span>
                <span className="text-stone-300">{sophiaScale}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={sophiaScale}
                onChange={(e) => setSophiaScale(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 rounded-lg bg-stone-800"
              />
              <p className="text-[10px] text-stone-500 leading-snug">
                Represents your capacity for mystic experience, unconditioned love, direct psychic receptivity, and emotional surrender.
              </p>
            </div>
          </div>

          {/* Interactive Core State Waves Display */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 mt-4 p-2 relative">
            <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 font-mono rounded-full uppercase z-10">
              Syzygy Resonance Waveform
            </div>
            <canvas ref={canvasRef} className="w-full block" />
          </div>

          {/* Alignment Insight Result Card */}
          <div className="p-5 mt-4 rounded-2xl border border-white/5 bg-black/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-400 font-mono tracking-wider uppercase font-medium">
                {syzygyDetails.title}
              </span>
              <span className="px-2 py-0.5 bg-stone-800 rounded text-[10px] text-stone-400 font-mono">
                {syzygyDetails.status}
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              {syzygyDetails.text}
            </p>
            <div className="pt-2 border-t border-white/5 grid grid-cols-12 gap-2 text-xs">
              <div className="col-span-12 font-mono text-[10px] text-stone-500 font-semibold uppercase">Paths to Alignment:</div>
              <div className="col-span-12 text-stone-400 italic">
                {syzygyDetails.advice}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pathworking Ascent through 7 Archon Gates */}
        <div className="space-y-6 p-8 rounded-[2.5rem] border border-white/10 bg-stone-900/40 backdrop-blur-md relative flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-light text-white">2. Celestial Archon Ascent</h2>
              <button 
                onClick={handleResetAscent}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-stone-400 hover:text-white transition-colors"
                title="Reset Ascent"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Ascend past the Archontic illusionary locks of the outer material heavens. Confront each planetary gatekeeper with the proper Sophia core virtue to unlock your higher frequency.
            </p>

            {/* Vertical Gate Alignment Board */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {ARCHON_GATES.map((gate) => {
                const isUnlocked = unlockedGates.includes(gate.level);
                const isCurrent = currentGateIdx === gate.level - 1;
                const isNextToUnlock = gate.level === unlockedGates.length + 1;
                
                return (
                  <button
                    key={gate.level}
                    disabled={!isUnlocked && !isNextToUnlock}
                    onClick={() => handleUnlockGate(gate.level)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      isCurrent 
                        ? 'bg-purple-950/20 border-purple-500/30' 
                        : isUnlocked 
                        ? 'bg-black/30 border-white/10 text-stone-300 hover:bg-black/40' 
                        : isNextToUnlock 
                        ? 'bg-stone-800/20 border-white/10 hover:border-purple-500/20 cursor-pointer animate-pulse rgb-glow-hover'
                        : 'bg-stone-950/40 border-stone-900 text-stone-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs" style={{ 
                        color: isUnlocked || isNextToUnlock ? gate.color : '#555',
                        backgroundColor: isUnlocked || isNextToUnlock ? `${gate.color}15` : '#1c1c1e'
                      }}>
                        {gate.level}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">{gate.name}</div>
                        <div className="text-[10px] text-stone-400">
                          {isUnlocked ? `Virtue: ${gate.virtue}` : `Archon Check: ${gate.archon}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isUnlocked ? (
                        <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                          <Award className="w-3 h-3" /> PASS
                        </div>
                      ) : isNextToUnlock ? (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                          <Key className="w-3 h-3" /> UNLOCK
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-stone-600">LOCKED</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Active Gate Description Shield */}
          <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-950/10 space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: ARCHON_GATES[currentGateIdx].color }} />
              <span className="text-xs font-semibold uppercase font-mono text-stone-200">
                Current Threshold: Level {ARCHON_GATES[currentGateIdx].level}
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              <strong className="text-stone-100 italic">Description: </strong>
              {ARCHON_GATES[currentGateIdx].description}
            </p>
            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="text-stone-400 font-mono text-[10px]">RESONANT KEY:</span>
              <span className="font-semibold text-white px-2 py-0.5 bg-black/40 rounded border border-white/5">
                {ARCHON_GATES[currentGateIdx].keynote}
              </span>
            </div>
          </div>

          {/* Audio Resonance Controls */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              {isAudioPlaying ? (
                <button
                  onClick={stopSoundBath}
                  className="p-3 bg-cyan-500 hover:bg-cyan-600 text-black rounded-full transition-colors flex items-center justify-center shadow-lg hover:scale-105"
                  title="Pause Gnostic Sound Bath"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={startSoundBath}
                  className="p-3 bg-amber-400 hover:bg-amber-500 text-black rounded-full transition-colors flex items-center justify-center shadow-lg hover:scale-105"
                  title="Play Gnostic Sound Bath"
                >
                  <Volume2 className="w-4 h-4 animate-bounce" />
                </button>
              )}
              <div>
                <div className="text-xs text-stone-200 font-medium">Esoteric Sound Bath</div>
                <div className="text-[10px] text-stone-400 font-mono">
                  {isAudioPlaying ? "Vibrating at current consciousness frequency" : "Synthesize Syzygy Resonance"}
                </div>
              </div>
            </div>

            {/* Micro Volume Slider */}
            {isAudioPlaying && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-500 font-mono">VOL</span>
                <input 
                  type="range" 
                  min="0.01" 
                  max="0.4" 
                  step="0.01"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(Number(e.target.value))}
                  className="w-16 accent-amber-400 cursor-pointer h-1 rounded-lg bg-stone-800"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: AI-Gnostic Custom Oracle & Reading Desk */}
      <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-stone-900/60 to-black/80 p-8 space-y-6 shadow-xl relative backdrop-blur-md">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-xl font-light text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            3. Live Christ-Sophia Gnostic Alignment Oracle
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            Channel Gnosis. Input a specific intention, life challenge, or focus statement. Our Gnostic oracle model 
            synthesizes your internal syzygy scale score, current astro-alignment, and active gate level to pull 
            a celestial reading out of the divine Pleroma.
          </p>
        </div>

        {/* Input Form Box */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Type your current spiritual inquiry, dream vision, or intention..."
            className="flex-1 px-5 py-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <button
            disabled={isGeneratingReading}
            onClick={handleGenerateGnosticReading}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-600 hover:to-cyan-600 text-white rounded-2xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg scale-hover hover:brightness-110 shrink-0"
          >
            {isGeneratingReading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Opening Pleroma Gate...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Request Custom Gnosis Reading</span>
              </>
            )}
          </button>
        </div>

        {readingError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="text-xs text-red-300 leading-relaxed">{readingError}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {gnosticReading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-6 p-6 rounded-3xl border border-white/10 bg-black/80 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 font-mono">
                    YOUR GNOSTIC SYNTHESIS BLUEPRINT
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">TRANSMITTED LIVE</span>
              </div>
              
              <div className="markdown-body text-xs text-stone-300 leading-relaxed font-light space-y-4 whitespace-pre-wrap">
                {gnosticReading}
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between text-[10px] text-stone-500">
                <span>RESONANCE STATE: {consciousnessLevel}Hz Core Harmony</span>
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Meditate on this response for 3 minutes while sounding {consciousnessLevel}Hz.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
