import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Radio, 
  Volume2, 
  VolumeX, 
  Zap, 
  Activity, 
  Fingerprint, 
  Sparkles,
  Info
} from 'lucide-react';
import { GematriaCipher, reduceNumber } from '../utils/gematria';

interface GematriaVisualizerD3Props {
  phrase: string;
  activeCiphers: GematriaCipher[];
}

// Alchemical/Esoteric correspondences
interface Correspondence {
  name: string;
  system: string;
  value: number;
  description: string;
  color: string;
}

export const GematriaVisualizerD3: React.FC<GematriaVisualizerD3Props> = ({ phrase, activeCiphers }) => {
  const [activeSubTab, setActiveSubTab] = useState<'sigil' | 'vibration' | 'resonance'>('sigil');
  const [sigilType, setSigilType] = useState<'radial' | 'spiral' | 'matrix'>('radial');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlayingChord, setIsPlayingChord] = useState<boolean>(false);
  const [resonanceMod, setResonanceMod] = useState<number>(9);
  
  // Clean alphabet
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<any[]>([]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  const stopAllSounds = () => {
    activeOscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch (err) { console.debug(err); }
      try { osc.disconnect(); } catch (err) { console.debug(err); }
    });
    activeOscillatorsRef.current = [];
    setIsPlayingChord(false);
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Convert character to standard numerical indices and vibrations
  const characters = useMemo(() => {
    const text = (phrase || 'HIGHER MIND').toUpperCase();
    return text.split('').map((char, index) => {
      const isLetter = char >= 'A' && char <= 'Z';
      const ord = isLetter ? char.charCodeAt(0) - 64 : (char >= '0' && char <= '9' ? char.charCodeAt(0) - 48 : 0);
      const reduced = isLetter ? ((ord - 1) % 9) + 1 : 0;
      
      // Map ordinal to a beautiful color and frequency (Solfeggio or Pythagorean derived)
      // Base freq: Ordinal * 12 + 100 Hz
      const baseFreq = ord > 0 ? (ord * 14.4) + 120 : 0;

      return {
        char,
        index,
        ordinal: ord,
        reduced,
        frequency: Math.round(baseFreq * 10) / 10,
        isLetter,
        color: isLetter ? `hsla(${(ord / 26) * 310 + 200}, 90%, 65%, 0.85)` : 'rgba(120, 120, 120, 0.4)'
      };
    });
  }, [phrase]);

  // Compute total values for current selection
  const cipherValues = useMemo(() => {
    const text = phrase || 'HIGHER MIND';
    const cleanText = text.toLowerCase();
    
    // Calculate simple common ones
    let ordinalSum = 0;
    let reductionSum = 0;
    let reverseSum = 0;

    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const idx = ALPHABET.indexOf(char);
        if (idx !== -1) {
            ordinalSum += (idx + 1);
            reductionSum += ((idx % 9) + 1);
            reverseSum += (26 - idx);
        }
    }

    return {
        Ordinal: ordinalSum || 135,
        Reduction: reductionSum || 36,
        Reverse: reverseSum || 140,
        ReducedOfOrdinal: reduceNumber(ordinalSum || 135)
      };
  }, [phrase]);

  // Sacred resonances based on the summed ordinal value
  const esotericCorrespondences = useMemo<Correspondence[]>(() => {
    const val = cipherValues.Ordinal;
    const reduced = cipherValues.ReducedOfOrdinal;

    return [
      {
        name: 'Solfeggio Frequency',
        system: 'Vibrational Therapy',
        value: reduced === 1 ? 174 : reduced === 2 ? 285 : reduced === 3 ? 396 : reduced === 4 ? 417 : reduced === 5 ? 528 : reduced === 6 ? 639 : reduced === 7 ? 741 : reduced === 8 ? 852 : 963,
        description: `Your blueprint reduced root is ${reduced}, aligning with the ${
          reduced === 1 ? '174 Hz Foundation' :
          reduced === 2 ? '285 Hz Cellular Regeneration' :
          reduced === 3 ? '396 Hz Release & Security' :
          reduced === 4 ? '417 Hz Transformation & Change' :
          reduced === 5 ? '528 Hz Healing Matrix (Transformation)' :
          reduced === 6 ? '639 Hz Harmonic Connection' :
          reduced === 7 ? '741 Hz Intuitive Expression' :
          reduced === 8 ? '852 Hz Sacred Spiritual Order' :
          '963 Hz Crown Transcendence'
        } Solfeggio frequency.`,
        color: 'from-amber-400 to-yellow-600'
      },
      {
        name: 'Tree of Life Path',
        system: 'Hermetic Kabbalah',
        value: (val % 22) + 1,
        description: `Maps to Path ${(val % 22) + 1} on the Sephiric Tree, carrying distinct planetary/elemental channels.`,
        color: 'from-purple-500 to-fuchsia-600'
      },
      {
        name: 'Zodiac Degree Resonance',
        system: 'Astrological Geometry',
        value: val % 360,
        description: `Corresponds to a spatial alignment at ${val % 360}° in the natal wheel sphere.`,
        color: 'from-blue-500 to-indigo-600'
      },
      {
        name: 'Chakra Center Resonance',
        system: 'Pranic Anatomy',
        value: (reduced % 7) || 7,
        description: `Resonates primarily with Chakra ${(reduced % 7) || 7} (${
          ((reduced % 7) || 7) === 1 ? 'Muladhara/Root' :
          ((reduced % 7) || 7) === 2 ? 'Svadhisthana/Sacral' :
          ((reduced % 7) || 7) === 3 ? 'Manipura/Solar Plexus' :
          ((reduced % 7) || 7) === 4 ? 'Anahata/Heart' :
          ((reduced % 7) || 7) === 5 ? 'Vishuddha/Throat' :
          ((reduced % 7) || 7) === 6 ? 'Ajna/Third-Eye' :
          'Sahasrara/Crown'
        }).`,
        color: 'from-rose-500 to-red-600'
      }
    ];
  }, [cipherValues]);

  // Plays a single character's frequency
  const playFrequency = (freq: number, duration: number = 0.6) => {
    if (isMuted || freq === 0) return;
    try {
      initAudio();
      if (!audioCtxRef.current) return;

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);

      // Simple envelope
      gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, audioCtxRef.current.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);

      activeOscillatorsRef.current.push(osc);
      
      // Clean finished osc reference after a while
      setTimeout(() => {
        activeOscillatorsRef.current = activeOscillatorsRef.current.filter(o => o !== osc);
      }, duration * 1000 + 100);
    } catch (e) {
      console.warn('Audio Context exception:', e);
    }
  };

  // Plays the collective chord
  const playHarmonicChord = () => {
    if (isMuted) {
      setIsMuted(false);
      // Wait for state to change and activate
      setTimeout(() => triggerChordSequence(), 50);
    } else {
        triggerChordSequence();
    }
  };

  const triggerChordSequence = () => {
    if (isPlayingChord) {
        stopAllSounds();
        return;
    }

    try {
      initAudio();
      if (!audioCtxRef.current) return;
      
      setIsPlayingChord(true);
      const now = audioCtxRef.current.currentTime;
      
      // We will play an arpeggio sequence of the letters
      const validLetters = characters.filter(c => c.ordinal > 0);
      if (validLetters.length === 0) {
        setIsPlayingChord(false);
        return;
      }

      validLetters.forEach((c, idx) => {
        const osc = audioCtxRef.current!.createOscillator();
        const gain = audioCtxRef.current!.createGain();
        
        // Harmonize to soft triangle wave
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(c.frequency, now + (idx * 0.15));
        
        gain.gain.setValueAtTime(0, now + (idx * 0.15));
        gain.gain.linearRampToValueAtTime(0.12, now + (idx * 0.15) + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.15) + 1.2);
        
        osc.connect(gain);
        gain.connect(audioCtxRef.current!.destination);
        
        osc.start(now + (idx * 0.15));
        osc.stop(now + (idx * 0.15) + 1.2);
        
        activeOscillatorsRef.current.push(osc);
      });

      setTimeout(() => {
        setIsPlayingChord(false);
      }, (validLetters.length * 150) + 1200);

    } catch (e) {
      console.warn('Playback of chord failed:', e);
      setIsPlayingChord(false);
    }
  };

  // Sigil geometry computations (SVGs)
  const renderSigilSVG = () => {
    const size = 320;
    const center = size / 2;
    const r = size * 0.4;
    const validChars = characters.filter(c => c.ordinal > 0);

    // Points for polygon
    const points = validChars.map((c, i) => {
      // Divide circle by the number of letters or use alphabet coordinates
      const angle = (i / Math.max(1, validChars.length)) * Math.PI * 2 - Math.PI / 2;
      
      // Radius scaled slightly based on ordinal value for visual depth
      const letterRadius = r * (0.4 + (c.ordinal / 26) * 0.6);
      
      return {
        x: center + Math.cos(angle) * letterRadius,
        y: center + Math.sin(angle) * letterRadius,
        c
      };
    });

    // Outer circle labels
    const circleLabels = Array.from({ length: resonanceMod }).map((_, i) => {
      const angle = (i / resonanceMod) * Math.PI * 2 - Math.PI / 2;
      return {
        x: center + Math.cos(angle) * (r + 14),
        y: center + Math.sin(angle) * (r + 14),
        val: i + 1
      };
    });

    // Generate path
    let pathD = '';
    if (points.length > 1) {
      if (sigilType === 'radial') {
        pathD = points.reduce((acc, p, i) => {
          return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
        }, '') + ' Z';
      } else if (sigilType === 'spiral') {
        // Spiral wraps coordinates outwards
        pathD = points.reduce((acc, p, i) => {
          const ratio = (i + 1) / points.length;
          const a = i * 0.8;
          const radiusScale = r * ratio;
          const x = center + Math.cos(a) * radiusScale;
          const y = center + Math.sin(a) * radiusScale;
          return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
        }, '');
      } else {
        // Matrix grid connecting everything to everything
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block">
            {/* Ambient gold rings */}
            <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="1" />
            <circle cx={center} cy={center} r={r * 0.6} fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" strokeDasharray="3,3" />

            {/* Matrix cords */}
            {points.map((p1, i) => 
              points.map((p2, j) => {
                if (i >= j) return null;
                return (
                  <line 
                    key={`mat-${i}-${j}`}
                    x1={p1.x} y1={p1.y}
                    x2={p2.x} y2={p2.y}
                    stroke={p1.c.color}
                    strokeWidth="0.4"
                    opacity="0.25"
                  />
                );
              })
            )}

            {/* Nodes */}
            {points.map((p, i) => (
              <g key={`gn-${i}`}>
                <circle 
                  cx={p.x} cy={p.y} r="5" 
                  fill={p.c.color} 
                  className="cursor-pointer"
                  onClick={() => playFrequency(p.c.frequency)}
                />
                <text 
                  x={p.x} y={p.y - 10} 
                  fill="#ffffff" 
                  fontSize="9" 
                  textAnchor="middle" 
                  className="font-mono opacity-80"
                >
                  {p.c.char}
                </text>
              </g>
            ))}
          </svg>
        );
      }
    }

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block relative">
        <defs>
          <radialGradient id="sigilGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        {/* Ambient Back Glow */}
        <circle cx={center} cy={center} r={r + 30} fill="url(#sigilGlow)" />

        {/* Dynamic Sacred Ring of Resonance */}
        <circle 
          cx={center} 
          cy={center} 
          r={r} 
          fill="none" 
          stroke="rgba(251, 191, 36, 0.25)" 
          strokeWidth="1.5" 
          strokeDasharray={sigilType === 'spiral' ? '4, 4' : undefined}
        />
        <circle cx={center} cy={center} r={r - 30} fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
        <circle cx={center} cy={center} r={r * 0.4} fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" strokeDasharray="6, 3" />

        {/* Numeric Rim Anchors */}
        {circleLabels.map((lbl, idx) => (
          <g key={`rim-${idx}`} className="opacity-40">
            <line 
                x1={center + Math.cos((idx / resonanceMod) * Math.PI * 2 - Math.PI / 2) * r}
                y1={center + Math.sin((idx / resonanceMod) * Math.PI * 2 - Math.PI / 2) * r}
                x2={center + Math.cos((idx / resonanceMod) * Math.PI * 2 - Math.PI / 2) * (r + 5)}
                y2={center + Math.sin((idx / resonanceMod) * Math.PI * 2 - Math.PI / 2) * (r + 5)}
                stroke="#fbbf24"
                strokeWidth="1"
            />
            <text 
              x={lbl.x} 
              y={lbl.y + 3} 
              fill="#fbbf24" 
              fontSize="7" 
              textAnchor="middle" 
              className="font-mono font-bold"
            >
              {lbl.val}
            </text>
          </g>
        ))}

        {/* Polyline Path representing structural vibrational chord */}
        {pathD && (
          <motion.path 
            d={pathD}
            fill="none"
            stroke="url(#sigilGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        )}

        {/* Connecting geometric rays to center */}
        {points.map((p, i) => (
          <line 
            key={`ray-${i}`}
            x1={center} y1={center}
            x2={p.x} y2={p.y}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="0.8"
          />
        ))}

        {/* Character Nodes plotted over the seal */}
        {points.map((p, i) => (
          <g key={`node-${i}`} className="group/node">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="6.5" 
              fill="#0c0a09" 
              stroke={p.c.color} 
              strokeWidth="2" 
              className="cursor-pointer hover:scale-125 transition-transform"
              onClick={() => playFrequency(p.c.frequency)}
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="15" 
              fill="transparent" 
              className="cursor-pointer"
              onMouseEnter={() => playFrequency(p.c.frequency, 0.3)}
            />
            <text 
              x={p.x} 
              y={p.y - 12} 
              fill="#ffffff" 
              fontSize="10" 
              textAnchor="middle" 
              className="font-mono font-bold pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              {p.c.char}
            </text>
            <text 
              x={p.x} 
              y={p.y + 3.5} 
              fill={p.c.color} 
              fontSize="7" 
              textAnchor="middle" 
              className="font-mono pointer-events-none"
            >
              {p.c.ordinal}
            </text>
          </g>
        ))}

        {/* Center Point */}
        <circle cx={center} cy={center} r="3" fill="#fbbf24" opacity="0.8" />

        {/* Custom gradient along the stroke */}
        <defs>
          <linearGradient id="sigilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Soundwave visualization of active frequencies
  const renderWaveSVG = () => {
    const width = 500;
    const height = 140;
    const padding = 10;
    const validChars = characters.filter(c => c.ordinal > 0);

    if (validChars.length === 0) return (
        <div className="h-full flex items-center justify-center text-stone-600 text-xs uppercase tracking-widest">
            Input phrase above to calculate waves
        </div>
    );

    // Compute synthetic compound wave path by summing sinusoids
    const pathPoints = [];
    const steps = 240;
    for (let x = 0; x <= steps; x++) {
      const t = x / steps;
      let ySum = 0;
      validChars.forEach(c => {
         // Sum curves with slightly offset phases representing character indices
         const frequencyWeight = (c.ordinal / 26) * 12; 
         ySum += Math.sin((t * frequencyWeight * Math.PI * 2) + c.index) * 20;
      });
      // Normalize middle height
      const y = height / 2 + ySum;
      pathPoints.push(`${x * (width / steps)},${y}`);
    }

    const pathD = `M ${pathPoints.join(' L ')}`;

    return (
      <div className="space-y-4">
        <div className="bg-black/60 border border-white/5 rounded-2xl p-4 overflow-hidden relative">
          <div className="absolute top-2 right-4 text-[8px] text-stone-500 uppercase tracking-widest font-mono">
            Vibration Amplitude Envelope
          </div>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block">
            {/* Centerline */}
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

            {/* Glowing composite wave */}
            <motion.path 
              d={pathD}
              fill="none"
              stroke="url(#waveGradient)"
              strokeWidth="2"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.6, 0.9, 0.6] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            />

            {/* Individual letter sub-harmonic waves */}
            {validChars.slice(0, 8).map((c, idx) => {
              const subPoints = [];
              for (let x = 0; x <= steps; x++) {
                const t = x / steps;
                const y = height / 2 + Math.sin((t * (c.ordinal / 10) * Math.PI * 2) + c.index) * 8;
                subPoints.push(`${x * (width / steps)},${y}`);
              }
              return (
                <path 
                  key={`sub-${idx}`}
                  d={`M ${subPoints.join(' L ')}`}
                  fill="none"
                  stroke={c.color}
                  strokeWidth="0.5"
                  opacity="0.18"
                />
              );
            })}

            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Character keys to play sounds */}
        <div className="flex flex-wrap gap-2 justify-center">
            {characters.map((c, idx) => {
               if (c.ordinal === 0) return null;
               return (
                 <button
                    key={`kbd-${idx}`}
                    onClick={() => playFrequency(c.frequency, 0.8)}
                    style={{ borderColor: c.color }}
                    className="px-4 py-3 bg-stone-900 hover:bg-stone-800 border-b-2 text-stone-200 rounded-xl font-mono text-center flex flex-col items-center justify-center min-w-[50px] transition-all hover:-translate-y-0.5 group active:translate-y-0 shadow-lg"
                 >
                    <span className="text-xl font-light text-white group-hover:scale-110 transition-transform">{c.char}</span>
                    <span className="text-[8px] text-stone-500 font-bold mt-1 leading-none">{c.frequency}Hz</span>
                 </button>
               );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-stone-900/40 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl space-y-6 relative overflow-hidden">
      
      {/* Visualizer header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <Activity className="text-amber-400 w-4 h-4 animate-pulse" />
             <span className="text-[10px] text-amber-400 uppercase tracking-[0.3em] font-bold">Interactive Synthesis</span>
           </div>
           <h3 className="text-2xl text-white font-light uppercase tracking-widest flex items-center gap-2">
              VIBRATIONAL CIPHER TOOL
           </h3>
        </div>

        {/* Interactive subtabs */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-2xl">
           <button
             onClick={() => setActiveSubTab('sigil')}
             className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all ${activeSubTab === 'sigil' ? 'bg-amber-400/20 text-amber-400' : 'text-stone-400 hover:text-stone-200'}`}
           >
              Geometry Seal
           </button>
           <button
             onClick={() => setActiveSubTab('vibration')}
             className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all ${activeSubTab === 'vibration' ? 'bg-amber-400/20 text-amber-400' : 'text-stone-400 hover:text-stone-200'}`}
           >
              Audio Waves
           </button>
           <button
             onClick={() => setActiveSubTab('resonance')}
             className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all ${activeSubTab === 'resonance' ? 'bg-amber-400/20 text-amber-400' : 'text-stone-400 hover:text-stone-200'}`}
           >
              Cosmic Keys
           </button>
        </div>
      </div>

      {/* Main interactive display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
         
         {/* LEFT VISUAL SPACE (8 cols) */}
         <div className="md:col-span-7 flex flex-col justify-center min-h-[340px]">
            <AnimatePresence mode="wait">
               {activeSubTab === 'sigil' && (
                 <motion.div 
                   key="sigil" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="space-y-4"
                 >
                    {renderSigilSVG()}

                    {/* Geometric Controls */}
                    <div className="flex flex-wrap items-center justify-between bg-black/20 border border-white/5 rounded-2xl p-4 gap-4">
                       <div className="flex gap-2">
                          {(['radial', 'spiral', 'matrix'] as const).map(type => (
                             <button
                                key={type}
                                onClick={() => setSigilType(type)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest transition-all ${sigilType === type ? 'bg-white/10 text-white font-bold border border-white/10' : 'text-stone-500 hover:text-stone-300'}`}
                             >
                               {type}
                             </button>
                          ))}
                       </div>

                       <div className="flex items-center gap-3">
                          <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Modulus Anchor</span>
                          <select 
                            value={resonanceMod}
                            onChange={(e) => setResonanceMod(Number(e.target.value))}
                            className="bg-stone-900 border border-white/10 text-[10px] text-stone-300 rounded px-2 py-1 font-mono outline-none cursor-pointer focus:border-amber-400"
                          >
                             {[7, 9, 12, 22, 26, 33].map(mod => (
                               <option key={mod} value={mod}>{mod} Nodes</option>
                             ))}
                          </select>
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeSubTab === 'vibration' && (
                 <motion.div 
                   key="wave" 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   exit={{ opacity: 0, y: -10 }}
                 >
                    {renderWaveSVG()}
                 </motion.div>
               )}

               {activeSubTab === 'resonance' && (
                 <motion.div 
                   key="resonance" 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                 >
                    {esotericCorrespondences.map((node, i) => (
                      <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-amber-400/30 transition-all flex flex-col justify-between space-y-4">
                         <div>
                            <div className="flex items-center justify-between mb-1">
                               <span className="text-[8px] text-stone-500 uppercase tracking-widest font-mono">{node.system}</span>
                               <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            </div>
                            <h4 className="text-white text-sm font-semibold tracking-wider">{node.name}</h4>
                            <p className="text-stone-400 text-xs tracking-wide leading-relaxed mt-2">{node.description}</p>
                         </div>
                         <div className="flex items-end justify-between pt-2 border-t border-white/5">
                            <span className="text-[9px] text-stone-500 uppercase tracking-widest">Resonance Key</span>
                            <span className={`text-xl font-mono font-bold bg-gradient-to-r ${node.color} bg-clip-text text-transparent`}>
                               {node.value}
                            </span>
                         </div>
                      </div>
                    ))}
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* RIGHT INFORMATION PANEL (5 cols) */}
         <div className="md:col-span-5 space-y-6">
            
            {/* Sonic controls */}
            <div className="bg-black/30 border border-white/5 rounded-3xl p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-black flex items-center gap-1">
                     <Volume2 className="w-3.5 h-3.5" /> SONIC TUNER
                  </span>
                  
                  {/* Mute toggler */}
                  <button 
                     onClick={() => {
                        stopAllSounds();
                        setIsMuted(!isMuted);
                     }}
                     className={`p-2 rounded-xl transition-all ${!isMuted ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30' : 'text-stone-500 bg-white/5 border border-white/5 hover:text-white'}`}
                  >
                     {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
               </div>

               <p className="text-[11px] text-stone-400 leading-relaxed">
                  Toggle audio and trigger a synthesized harmonic arpeggio mapped to the frequency matrix or tap individual letters on the seal to hear their celestial pitch.
               </p>

               <button 
                  onClick={playHarmonicChord}
                  className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all font-mono uppercase text-xs tracking-widest font-bold ${isPlayingChord ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse' : 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black hover:brightness-110 active:scale-95 shadow-lg'}`}
               >
                  {isPlayingChord ? <Activity className="w-4 h-4" /> : <Radio className="w-4 h-4 animate-pulse" />}
                  {isPlayingChord ? 'HALT WAVE' : 'PLAY BLUEPRINT'}
               </button>
            </div>

            {/* Quick Profile Summary Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/15 rounded-3xl p-6 space-y-4">
               <div className="flex items-center gap-2">
                  <Fingerprint className="text-indigo-400 w-4 h-4" />
                  <span className="text-[9px] text-indigo-300 uppercase tracking-[0.2em] font-black">Blueprint Signatures</span>
               </div>
               
               <div className="space-y-3 font-mono text-[10px] tracking-widest uppercase">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="text-stone-400">Total Ordinal Weight</span>
                     <span className="text-white font-bold">{cipherValues.Ordinal}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="text-stone-400">Matrix Reduction Index</span>
                     <span className="text-amber-400 font-bold">{cipherValues.Reduction}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-stone-400">Harmonizing Solfeggio</span>
                     <span className="text-emerald-400 font-bold">
                        {esotericCorrespondences[0].value} Hz
                     </span>
                  </div>
               </div>

               <p className="text-[9px] text-stone-500 leading-normal italic">
                  *Vibrational frequencies are derived directly from the numerical indices using Pythagoras scale ratios.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
