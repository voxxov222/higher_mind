import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, ArrowRight, ArrowLeft, Volume2, VolumeX, Sparkles, AlertCircle, 
  MapPin, Clock, Calendar, User, RefreshCw, Cpu, Activity, Star, Info, MessageSquare, Send, Shield,
  Orbit, Layers, X, Radio, Terminal, Sliders, Globe, Table,
  Mic
} from 'lucide-react';
import { fetchAstrologyNatalDetails, fetchCosmicChatResponse, parseVoiceBirthDetails } from '../services/geminiService';
import { soundEngine } from '../lib/soundEffects';
import { CosmicData } from '../types';

interface AstrologyEngineProps {
  data: CosmicData | null;
}

// Zodiac calculations utilities
const signSymbols: { [key: string]: string } = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

const signAngles: { [key: string]: number } = { 
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90, Leo: 120, Virgo: 150, 
  Libra: 180, Scorpio: 210, Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330 
};

export function AstrologyEngine({ data }: AstrologyEngineProps) {
  // Input Form States
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');

  // App States
  const [loading, setLoading] = useState(false);
  const [natalData, setNatalData] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlanetName, setSelectedPlanetName] = useState<string | null>(null);
  const [isPlayingVocal, setIsPlayingVocal] = useState(false);
  
  // Immersive Interactive states
  const [visualizationMode, setVisualizationMode] = useState<'focused' | 'wheel'>('focused');
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [showAspectMatrix, setShowAspectMatrix] = useState(false);
  const [selectedAspectCell, setSelectedAspectCell] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [vocalBars, setVocalBars] = useState<number[]>(Array(24).fill(6));

  // Astral OS Chat States specialized for this Chart
  const [userQuery, setUserQuery] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'model'; parts: { text: string }[] }>>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [listeningField, setListeningField] = useState<'all' | 'name' | 'birthDate' | 'birthTime' | 'birthLocation' | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [isVoiceParsing, setIsVoiceParsing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = (field: 'all' | 'name' | 'birthDate' | 'birthTime' | 'birthLocation') => {
    setVoiceError(null);
    setVoiceStatus(null);
    setSpeechTranscript('');

    if (typeof window === 'undefined') return;
    
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      const errorMsg = "Speech recognition is not supported in this browser. Astral OS recommends Google Chrome.";
      setVoiceError(errorMsg);
      speakText(errorMsg);
      return;
    }

    try {
      // If already listening, stop it first
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      soundEngine.click();
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setListeningField(field);
        if (field === 'all') {
          setVoiceStatus("SYSTEM LISTENING: STATE YOUR NAME, BIRTH DATE, TIME, AND PLACE...");
          speakText("System listening. Please state your name, date of birth, time of birth, and location.");
        } else {
          setVoiceStatus(`SYSTEM LISTENING FOR: ${field.toUpperCase()}...`);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        const errorMsg = `Voice capture error: ${event.error || 'unknown'}`;
        setVoiceError(errorMsg);
        setIsListening(false);
        setListeningField(null);
        soundEngine.tick();
      };

      rec.onend = () => {
        setIsListening(false);
        setListeningField(null);
      };

      rec.onresult = async (event: any) => {
        const resultText = event.results[0][0].transcript;
        setSpeechTranscript(resultText);
        soundEngine.success();
        
        if (field === 'name') {
          setName(resultText);
          setVoiceStatus(`NAME CALIBRATED: "${resultText}"`);
        } else if (field === 'birthLocation') {
          setBirthLocation(resultText);
          setVoiceStatus(`LOCATION CALIBRATED: "${resultText}"`);
        } else if (field === 'birthDate') {
          setVoiceStatus(`INTERPRETING DATE: "${resultText}"...`);
          try {
            const parsed = new Date(resultText);
            if (!isNaN(parsed.getTime())) {
              const yyyy = parsed.getFullYear();
              const mm = String(parsed.getMonth() + 1).padStart(2, '0');
              const dd = String(parsed.getDate()).padStart(2, '0');
              setBirthDate(`${yyyy}-${mm}-${dd}`);
              setVoiceStatus(`DATE CALIBRATED: ${yyyy}-${mm}-${dd}`);
            } else {
              setBirthDate(resultText);
              setVoiceStatus(`DATE RECORDED: "${resultText}" (raw)`);
            }
          } catch {
            setBirthDate(resultText);
          }
        } else if (field === 'birthTime') {
          setVoiceStatus(`INTERPRETING TIME: "${resultText}"...`);
          setBirthTime(resultText);
        } else if (field === 'all') {
          setIsVoiceParsing(true);
          setVoiceStatus("TRANSMITTING COORDINATES TO JARVIS BLUEPRINT DECK...");
          speakText("Transmitting coordinates to J.A.R.V.I.S. for blueprint processing.");
          try {
            const parsed = await parseVoiceBirthDetails(resultText);
            if (parsed) {
              if (parsed.name) setName(parsed.name);
              if (parsed.birthDate) setBirthDate(parsed.birthDate);
              if (parsed.birthTime) setBirthTime(parsed.birthTime);
              if (parsed.location) setBirthLocation(parsed.location);
              setVoiceStatus("COORDINATES EXTRACTED SUCCESSFULLY.");
              speakText(`Thank you, Sir. Birth coordinates updated for ${parsed.name} in ${parsed.location}.`);
            }
          } catch (err: any) {
            console.error(err);
            setVoiceError("Could not systematically map natural language. Please dictate into fields directly.");
          } finally {
            setIsVoiceParsing(false);
          }
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      setVoiceError("Failed to initiate Speech API hardware.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setListeningField(null);
      soundEngine.click();
    }
  };

  // Parallax handling
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // scale -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setParallax({ x: x * 8, y: -y * 8 }); // Max rotation degree
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  // Prefill if primary data is available
  useEffect(() => {
    if (data) {
      if (data.nameAnalysis?.first?.name) {
        let fullName = data.nameAnalysis.first.name;
        if (data.nameAnalysis.middle?.name) fullName += ' ' + data.nameAnalysis.middle.name;
        if (data.nameAnalysis.last?.name) fullName += ' ' + data.nameAnalysis.last.name;
        setName(fullName);
      }
      setBirthDate('1995-06-15');
      setBirthTime('10:30');
      setBirthLocation('San Francisco, CA');
    }
  }, [data]);

  // Audio Equalizer simulator when voice speaks
  useEffect(() => {
    let interval: any;
    if (isPlayingVocal) {
      interval = setInterval(() => {
        setVocalBars(Array(24).fill(0).map(() => Math.floor(Math.random() * 32) + 4));
      }, 80);
    } else {
      setVocalBars(Array(24).fill(3));
    }
    return () => clearInterval(interval);
  }, [isPlayingVocal]);

  // Command panel diagnostic scan simulator
  const runDeepScanCode = () => {
    if (isScanning) return;
    setIsScanning(true);
    soundEngine.mysticClick();
    setScanLogs([]);
    const logs = [
      "ESTABLISHING SECURE STARK INTUITION CHANNEL...",
      "TUNING CONCENTRIC ASTRO-HOUSINGS...",
      "RESOLVING 12-SIGN COORDINATE FRAMEWORDS...",
      "SAMPLING SOLFEGGIO WAVEFORMS AT 852Hz...",
      "COMPUTING ASPECTS DIGNITIES & ORBITAL DRIFTS...",
      "COHERENCE INTEGRATION AT 99.14% ... TELEMETRY SYNC COMPLETE"
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setScanLogs(prev => [...prev, logs[i]]);
        soundEngine.click();
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          soundEngine.success();
        }, 800);
      }
    }, 450);
  };

  // Fast import from profile config
  const handleImportProfile = () => {
    soundEngine.success();
    if (data) {
      setName(data.nameAnalysis?.first?.name || 'Sir');
      setBirthDate('1995-06-15');
      setBirthTime('10:30');
      setBirthLocation('San Francisco, CA');
    }
  };

  // Run the calculation action
  const handleCalculateNatal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate || !birthTime || !birthLocation) {
      soundEngine.tick();
      return;
    }

    setLoading(true);
    soundEngine.mysticClick();
    try {
      const result = await fetchAstrologyNatalDetails({
        name,
        birthDate,
        birthTime,
        location: birthLocation
      });
      setNatalData(result);
      setActiveStep(0);
      setSelectedPlanetName(null);
      soundEngine.success();
      speakText(result.introMessage || `Stellar calculations completed for ${name}.`);
    } catch (err) {
      console.error(err);
      soundEngine.tick();
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Audio Voice speaking
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingVocal(true);

      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Find high quality voices
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google UK English Male') || 
        v.name.includes('Natural') || 
        v.name.includes('Premium') ||
        v.lang.startsWith('en-GB')
      ) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsPlayingVocal(false);
      };
      utterance.onerror = () => {
        setIsPlayingVocal(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingVocal(false);
      soundEngine.click();
    }
  };

  // Step Switch changes
  const handleNextStep = () => {
    if (!natalData || !natalData.steps) return;
    if (activeStep < natalData.steps.length - 1) {
      soundEngine.click();
      const nextIdx = activeStep + 1;
      setActiveStep(nextIdx);
      speakText(natalData.steps[nextIdx].narrative);
    }
  };

  const handlePrevStep = () => {
    if (!natalData || !natalData.steps) return;
    if (activeStep > 0) {
      soundEngine.click();
      const prevIdx = activeStep - 1;
      setActiveStep(prevIdx);
      speakText(natalData.steps[prevIdx].narrative);
    }
  };

  // Chat Query with Astral OS
  const handleSendChatQuery = async () => {
    if (!userQuery.trim() || chatLoading) return;
    soundEngine.click();
    const query = userQuery.trim();
    setUserQuery('');

    const newHistory = [
      ...chatLog,
      { role: 'user' as const, parts: [{ text: query }] }
    ];
    setChatLog(newHistory);
    setChatLoading(true);

    try {
      const response = await fetchCosmicChatResponse(
        `[ASTROLOGICAL ANALYSIS MODE]: General seeker natal information. Seeker name: ${name}, Chart summary: ${natalData?.summary}, placements: ${JSON.stringify(natalData?.natalPlacements)}, aspects: ${JSON.stringify(natalData?.aspects)}. Answer as Astral OS, a highly sophisticated, futuristic, celestial operating system assistant, combined with alphanumeric Gematria coordinates, ancient planetary lore, and Hermetic Kabbalistics. User query: ${query}`,
        newHistory,
        data
      );

      setChatLog(prev => [
        ...prev,
        { role: 'model' as const, parts: [{ text: response.text }] }
      ]);
      soundEngine.neuralClick();
      speakText(response.text);
    } catch (err) {
      console.error(err);
      soundEngine.tick();
    } finally {
      setChatLoading(false);
    }
  };

  // Helper rendering holographic orbit representations based on the actively focused entity
  const renderStellarVisualization = (focus: string) => {
    const isAscendant = focus.toLowerCase().includes('ascendant');
    const isSun = focus.toLowerCase().includes('sun');
    const isMoon = focus.toLowerCase().includes('moon');
    const isPersonal = focus.toLowerCase().includes('personal');
    const isSocial = focus.toLowerCase().includes('social');
    const isTranspersonal = focus.toLowerCase().includes('transpersonal');
    const isAspects = focus.toLowerCase().includes('aspects');

    // Coordinate list for planets in Wheel mode
    const computedPositions = natalData?.natalPlacements?.map((placement: any) => {
      const baseAngle = signAngles[placement.sign] || 0;
      const totalAngle = (baseAngle + (placement.degree || 0) * 1) * Math.PI / 180;
      const r = 72; // outer ring radius in SVG 220x220 container is 110 coordinate center
      const x = 110 + r * Math.cos(totalAngle);
      const y = 110 + r * Math.sin(totalAngle);
      return { ...placement, x, y, angle: totalAngle };
    }) || [];

    return (
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[360px] rounded-3xl overflow-hidden border border-white/10 bg-black/50 flex flex-col items-center justify-center cursor-crosshair group select-none shadow-inner"
        style={{ perspective: '1000px' }}
      >
        {/* Glow scanline texture overlay */}
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-5" />
        <div className="absolute inset-0 bg-radial-grid opacity-15 pointer-events-none" />
        
        {/* Interactive visualization toggles inside the Canvas */}
        {natalData && (
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <button
              onClick={() => { soundEngine.click(); setVisualizationMode('focused'); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all flex items-center gap-1 border ${
                visualizationMode === 'focused' 
                  ? 'bg-purple-900/40 text-purple-200 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.25)]' 
                  : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/10'
              }`}
            >
              <Layers className="w-3" /> Step Focus Mode
            </button>
            <button
              onClick={() => { soundEngine.click(); setVisualizationMode('wheel'); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-widest uppercase transition-all flex items-center gap-1 border ${
                visualizationMode === 'wheel' 
                  ? 'bg-teal-900/40 text-teal-200 border-teal-500/40 shadow-[0_0_8px_rgba(20,184,166,0.25)]' 
                  : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/10'
              }`}
            >
              <Orbit className="w-3" /> Interactive Astro-Wheel
            </button>
          </div>
        )}

        {/* Real-time active scan/speech Equalizer on the Right side of hud */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 border border-white/5 rounded-xl px-2.5 py-1.5">
          <Radio className={`w-3 h-3 ${isPlayingVocal ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <div className="flex gap-0.5 items-end h-3">
            {vocalBars.slice(0, 8).map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: isPlayingVocal ? [3, h, 3] : 3 }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }}
                className="w-0.5 bg-cyan-400 rounded-full"
                style={{ height: '3px' }}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Holographic Elements container with Parallax */}
        <motion.div 
          animate={{ rotateX: parallax.y, rotateY: parallax.x }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="relative w-[320px] h-[320px] flex items-center justify-center"
        >
          {visualizationMode === 'focused' ? (
            <>
              {/* Concentric rings background */}
              <div className="absolute w-[280px] h-[280px] rounded-full border border-purple-500/10 border-dashed animate-[spin_160s_linear_infinite]" />
              <div className="absolute w-[220px] h-[220px] rounded-full border border-teal-500/10 animate-[spin_80s_reverse_infinite]" />
              <div className="absolute w-[160px] h-[160px] rounded-full border border-white/5" />
              
              <AnimatePresence mode="wait">
                {isAscendant && (
                  <motion.div key="asc" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center">
                    <svg width="220" height="220" viewBox="0 0 100 100">
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 2" />
                      <circle cx="50" cy="50" r="42" stroke="#a855f7" strokeWidth="0.5" fill="none" />
                      <circle cx="50" cy="50" r="30" stroke="#22d3ee" strokeWidth="0.5" fill="none" strokeDasharray="1 1" />
                      <circle cx="8" cy="50" r="4" fill="#c084fc" className="animate-ping" />
                      <circle cx="8" cy="50" r="2.5" fill="#a855f7" />
                      <path d="M 50 8 L 50 92 M 8 50 L 92 50" stroke="rgba(168, 85, 247, 0.15)" strokeWidth="0.5" />
                      <text x="14" y="44" fill="#c084fc" fontSize="5" fontFamily="monospace" className="font-bold tracking-widest">ASC HORIZON</text>
                    </svg>
                    <div className="text-[10px] font-mono text-purple-300 uppercase tracking-widest bg-purple-950/40 border border-purple-500/20 px-2.5 py-1 rounded-md mt-2">Horizon Alignment Calibrated</div>
                  </motion.div>
                )}

                {isSun && (
                  <motion.div key="sun" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      className="w-18 h-18 rounded-full bg-amber-500/5 border border-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      </div>
                    </motion.div>
                    <div className="text-[10px] font-mono text-amber-300 uppercase tracking-widest bg-amber-950/40 border border-amber-500/20 px-2.5 py-1 rounded-md mt-4">Solar Reactor Core: Active</div>
                  </motion.div>
                )}

                {isMoon && (
                  <motion.div key="moon" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center">
                    <svg width="180" height="180" viewBox="0 0 100 100" className="text-indigo-300">
                      <motion.path 
                        animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 7, repeat: Infinity }}
                        d="M50,20 A30,30 0 0,0 80,50 A30,30 0 0,1 50,80 A30,30 0 0,0 20,50 A30,30 0 0,1 50,20 Z" 
                        fill="url(#lunarGlowGradient)" 
                        stroke="#818cf8" 
                        strokeWidth="0.75"
                      />
                      <defs>
                        <radialGradient id="lunarGlowGradient">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
                        </radialGradient>
                      </defs>
                    </svg>
                    <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-md">Emotional Core Uplinked</div>
                  </motion.div>
                )}

                {isPersonal && (
                  <motion.div key="personal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center gap-4">
                    <div className="flex gap-4">
                      <motion.div whileHover={{ scale: 1.15 }} className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-400/50 flex flex-col items-center justify-center shadow-lg shadow-emerald-900/10 cursor-pointer">
                        <span className="text-xs font-bold text-emerald-300 font-mono">☿</span>
                        <span className="text-[7.5px] font-mono text-emerald-400 uppercase mt-0.5">MIND</span>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.15 }} className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-400/50 flex flex-col items-center justify-center shadow-lg shadow-rose-900/10 cursor-pointer">
                        <span className="text-xs font-bold text-rose-300 font-mono">♀</span>
                        <span className="text-[7.5px] font-mono text-rose-400 uppercase mt-0.5">HEART</span>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.15 }} className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-400/50 flex flex-col items-center justify-center shadow-lg shadow-amber-900/10 cursor-pointer">
                        <span className="text-xs font-bold text-amber-300 font-mono">♂</span>
                        <span className="text-[7.5px] font-mono text-amber-400 uppercase mt-0.5">WILL</span>
                      </motion.div>
                    </div>
                    <div className="text-[10px] font-mono text-teal-300 uppercase bg-teal-950/40 border border-teal-500/20 px-3 py-1 rounded-md">Integration Loop Calibrated</div>
                  </motion.div>
                )}

                {isSocial && (
                  <motion.div key="social" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center w-full">
                    <svg width="220" height="130" viewBox="0 0 100 60">
                      <circle cx="35" cy="30" r="15" stroke="#0ea5e9" strokeWidth="0.5" fill="none" strokeDasharray="3 1.5" />
                      <circle cx="65" cy="30" r="15" stroke="#f43f5e" strokeWidth="0.5" fill="none" />
                      <text x="35" y="32" fill="#0ea5e9" fontSize="6" textAnchor="middle" className="font-mono font-black">♃</text>
                      <text x="65" y="32" fill="#f43f5e" fontSize="6" textAnchor="middle" className="font-mono font-black">♄</text>
                    </svg>
                    <div className="text-[10px] font-mono text-sky-300 uppercase bg-sky-950/40 border border-sky-500/20 px-3 py-1 rounded-md">Jupiter/Saturn Balance: Aligning</div>
                  </motion.div>
                )}

                {isTranspersonal && (
                  <motion.div key="trans" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-cyan-500/20 flex items-center justify-center animate-[pulse_3s_infinite]">
                      <div className="w-18 h-18 rounded-full border-t border-b border-purple-500/40 flex items-center justify-center animate-spin">
                        <div className="w-12 h-12 rounded-full border-l border-r border-teal-500/40 animate-[spin.6s_linear_infinite]" />
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 uppercase bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-md mt-4">Transpersonal Uplink Locked</div>
                  </motion.div>
                )}

                {isAspects && (
                  <motion.div key="asps" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                    <svg width="220" height="220" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" fill="none" />
                      
                      {/* Interactive lines simulation */}
                      <motion.line x1="25" y1="35" x2="95" y2="85" stroke="#10b981" strokeWidth="0.75" strokeDasharray="1 1" animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                      <motion.line x1="60" y1="14" x2="60" y2="106" stroke="#f43f5e" strokeWidth="0.5" />
                      <motion.line x1="20" y1="70" x2="100" y2="50" stroke="#38bdf8" strokeWidth="0.75" />
                      
                      {/* Active points */}
                      <circle cx="25" cy="35" r="2.5" fill="#10b981" />
                      <circle cx="95" cy="85" r="2.5" fill="#10b981" />
                      <circle cx="60" cy="14" r="3" fill="#f43f5e" />
                      <circle cx="60" cy="106" r="3" fill="#f43f5e" />
                      <circle cx="20" cy="70" r="2.5" fill="#38bdf8" />
                      <circle cx="100" cy="50" r="2.5" fill="#38bdf8" />
                      <circle cx="60" cy="60" r="2" fill="white" className="animate-ping" />
                    </svg>
                    <div className="text-[10px] font-mono text-emerald-300 uppercase bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-md mt-1">Aspect Resonance Active</div>
                  </motion.div>
                )}
                
                {/* Fallback starting view */}
                {!isAscendant && !isSun && !isMoon && !isPersonal && !isSocial && !isTranspersonal && !isAspects && (
                  <motion.div key="intro" className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex items-center justify-center animate-pulse text-purple-300">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <span className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest mt-4">Synthesizing Astro-HUD</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* BREATHTAKING FULL INTERACTIVE 360 DEGREE ROTATING NEON ASTROLO-WHEEL */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Outer dial SVG */}
              <svg width="240" height="240" viewBox="0 0 220 220" className="opacity-95">
                {/* Background cosmic ring */}
                <circle cx="110" cy="110" r="100" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <circle cx="110" cy="110" r="92" stroke="rgba(20,184,166,0.15)" strokeWidth="0.5" fill="none" />
                <circle cx="110" cy="110" r="50" stroke="rgba(168,85,247,0.1)" strokeWidth="0.5" fill="none" strokeDasharray="2 1" />
                <circle cx="110" cy="110" r="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" fill="none" />
                
                {/* Highlight active aspects links between matching coordinates */}
                {natalData?.aspects?.map((aspect: any, idx: number) => {
                  const p1 = computedPositions.find((p: any) => p.name === aspect.planet1);
                  const p2 = computedPositions.find((p: any) => p.name === aspect.planet2);
                  if (!p1 || !p2) return null;
                  
                  // Color code aspects
                  let strokeColor = "rgba(255,255,255,0.2)";
                  if (aspect.type.includes("Trine")) strokeColor = "rgba(16,185,129,0.45)"; // Emerald
                  if (aspect.type.includes("Square")) strokeColor = "rgba(244,63,94,0.45)"; // Rose red
                  if (aspect.type.includes("Oppos")) strokeColor = "rgba(234,179,8,0.45)"; // Amber yellow
                  if (aspect.type.includes("Sextile")) strokeColor = "rgba(56,189,248,0.45)"; // Sky blue
                  
                  return (
                    <motion.line 
                      key={idx}
                      x1={p1.x} y1={p1.y}
                      x2={p2.x} y2={p2.y}
                      stroke={strokeColor}
                      strokeWidth="1"
                      strokeDasharray={aspect.type.includes("Sextile") ? "2 2" : undefined}
                      animate={{ strokeWidth: [0.8, 1.5, 0.8] }}
                      transition={{ duration: 4, repeat: Infinity, delay: idx * 0.2 }}
                    />
                  );
                })}

                {/* Draw 12 zodiac dividing radial tick marks */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angleRad = (i * 30) * Math.PI / 180;
                  const x1 = 110 + 92 * Math.cos(angleRad);
                  const y1 = 110 + 92 * Math.sin(angleRad);
                  const x2 = 110 + 100 * Math.cos(angleRad);
                  const y2 = 110 + 100 * Math.sin(angleRad);
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
                  );
                })}

                {/* Symbols labeling on margins */}
                {Object.keys(signAngles).map((sign, i) => {
                  const angleRad = (signAngles[sign] + 15) * Math.PI / 180;
                  const x = 110 + 96 * Math.cos(angleRad);
                  const y = 110 + 96 * Math.sin(angleRad);
                  return (
                    <text 
                      key={sign} 
                      x={x} y={y + 1.5} 
                      fill="rgba(255,255,255,0.3)" 
                      fontSize="5.5" 
                      textAnchor="middle" 
                      fontFamily="sans-serif"
                    >
                      {signSymbols[sign] || ''}
                    </text>
                  );
                })}
              </svg>

              {/* HTML Absolute overlapping planet nodes so React can capture hover & click events flawless */}
              {computedPositions.map((placement: any) => {
                const isSelected = selectedPlanetName === placement.name;
                const isHovered = hoveredNode?.name === placement.name;
                
                // Approximate coordinate offset into real CSS translation positioning values relative to matching SVG centered coordinates
                // Size of canvas is 320x320, svg is 240x240 inside it. Center point is 160, 160
                const scalingFactor = 320 / 220; // coordinate translation logic
                const leftPos = placement.x * scalingFactor;
                const topPos = placement.y * scalingFactor;

                return (
                  <div
                    key={placement.name}
                    style={{ 
                      position: 'absolute', 
                      left: `${leftPos}px`, 
                      top: `${topPos}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 30
                    }}
                  >
                    <motion.div
                      onMouseEnter={() => { setHoveredNode(placement); soundEngine.click(); }}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => {
                        soundEngine.success();
                        setSelectedPlanetName(isSelected ? null : placement.name);
                      }}
                      whileHover={{ scale: 1.35 }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-purple-500 border border-white shadow-[0_0_12px_#a855f7]' 
                          : 'bg-slate-950 border border-teal-500/50 shadow-[0_0_6px_rgba(20,184,166,0.3)] hover:border-teal-300'
                      }`}
                    >
                      <span className="text-[8.5px] font-sans font-black text-cyan-200">
                        {placement.name.substring(0, 2).toUpperCase()}
                      </span>
                    </motion.div>

                    {/* Pop-up Micro Floating Hover Diagnostic Panel inside coordinate mapping */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-teal-500/40 p-2.5 rounded-lg text-left whitespace-nowrap z-50 pointer-events-none shadow-xl shadow-black"
                        >
                          <div className="text-[10px] font-mono text-teal-300 font-bold uppercase">{placement.name} Placement</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{placement.sign} at {placement.degree?.toFixed(2)}°</div>
                          <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Dignity: {placement.dignity || 'Weighted Neutral'}</div>
                          <div className="text-[8px] font-mono text-purple-400 uppercase">Sephirah: {placement.treeConnection || 'N/A'}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Legend background decoration indicator card inside layout */}
              <div className="absolute bottom-2 text-[9px] font-mono text-teal-400 bg-teal-950/30 border border-teal-500/15 px-2.5 py-1 rounded-md">
                Interactive Map Dial (Center Coordinate locked at 220.42Hz)
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="w-full text-white space-y-6" id="astrology-engine-root">
      
      {/* Title Header Card with glowing highlights and sweep animation */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-950/35 via-black to-slate-900/40 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Compass className="w-48 h-48 text-purple-500 animate-spin-slow" />
        </div>
        {/* Neon decorative glow accent corner lines */}
        <div className="absolute top-0 left-0 w-32 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
        <div className="absolute top-0 left-0 w-0.5 h-32 bg-gradient-to-b from-purple-500 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Unified Galactic Telemetry System v2.0
            </div>
            <h1 className="text-4.5xl sm:text-3.5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.35)]">
              ASTROLOGY ENGINE
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Uplink with the stellar dynamics database. Enter coordinates to compile accurate 10-body charts, observe dynamic aspect vectors on our interactive wheel, and engage with Astral OS telemetry prompts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { soundEngine.click(); setShowAspectMatrix(true); }}
              className="bg-teal-950/40 hover:bg-teal-900/60 text-teal-300 border border-teal-500/30 px-4 py-2.5 rounded-2xl text-xs font-mono tracking-wide transition-all uppercase flex items-center gap-2 shadow-lg"
              id="view-matrix-btn"
            >
              <Table className="w-4 h-4 text-teal-400 animate-pulse" />
              Aspect Matrix Hologram
            </button>
            <button
              onClick={handleImportProfile}
              className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 px-4 py-2.5 rounded-2xl text-xs font-mono tracking-wide transition-all uppercase flex items-center gap-2"
              id="import-blueprint-btn"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              Import Seeker Blueprint
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data Input Control Deck */}
        <div className="lg:col-span-1 space-y-6 h-fit">
          <motion.div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
            {/* Glossy sweep line */}
            <div className="absolute -inset-y-12 -left-16 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-full animate-[sweep_8s_infinite]" />
            
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
              <h2 className="text-md font-mono tracking-wider font-bold">STELLAR DATA PROTOCOL</h2>
            </div>

            {/* Holographic Voice Control Panel */}
            <div className="bg-purple-950/25 border border-purple-500/25 rounded-2xl p-4 space-y-3 relative overflow-hidden backdrop-blur-md" id="holographic-voice-console">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  AOS Voice Assist
                </span>
                {isListening ? (
                  <button
                    type="button"
                    onClick={stopListening}
                    className="text-[9px] font-mono bg-red-950/60 border border-red-500/40 text-red-400 px-2.5 py-1 rounded-xl hover:bg-red-900/60 transition-all flex items-center gap-1 shadow-lg"
                    id="vocal-stop-btn"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    DEACTIVATE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startListening('all')}
                    className="text-[9.5px] font-mono bg-purple-900/40 hover:bg-purple-850/60 border border-purple-500/30 text-purple-200 px-3 py-1.5 rounded-xl hover:bg-purple-800/60 transition-all flex items-center gap-1.5 shadow-lg shadow-purple-950/40"
                    id="vocal-wizard-btn"
                  >
                    <Mic className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    OMNI VOCAL WIZARD
                  </button>
                )}
              </div>

              {/* Sound wave visualizer when listening */}
              {isListening && (
                <div className="flex items-center justify-center gap-1 py-1.5 bg-black/25 rounded-xl border border-white/5">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [6, 24, 6] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: "easeInOut"
                      }}
                      className="w-1 bg-gradient-to-t from-purple-500 via-indigo-400 to-cyan-300 rounded-full"
                      style={{ height: '8px' }}
                    />
                  ))}
                </div>
              )}

              {voiceStatus && (
                <div className="text-[10px] font-mono p-2 rounded-xl bg-purple-950/40 border border-purple-500/10 text-purple-300 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span className="truncate">{voiceStatus}</span>
                </div>
              )}

              {voiceError && (
                <div className="text-[10px] font-mono p-2 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 flex items-center gap-1.5 animate-bounce">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span>{voiceError}</span>
                </div>
              )}

              {speechTranscript && (
                <div className="text-[11px] leading-relaxed italic text-slate-300 bg-slate-950/65 border border-white/5 p-2.5 rounded-xl font-sans">
                  <span className="text-[8.5px] font-mono text-slate-500 block not-italic uppercase tracking-wider mb-0.5">Spoken Transcript:</span>
                  "{speechTranscript}"
                </div>
              )}

              {isVoiceParsing && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                  <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                  <span>J.A.R.V.I.S. is parsing coordinates...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleCalculateNatal} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Seeker Name
                  </label>
                  {listeningField === 'name' && (
                    <span className="text-[8px] font-mono text-purple-400 animate-pulse bg-purple-950/50 border border-purple-500/20 px-1.5 py-0.5 rounded">V_SYS: REC...</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter target name..."
                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-4 pr-11 py-3 text-sm focus:border-purple-400 focus:outline-none transition-all placeholder-slate-600 font-sans shadow-inner"
                    id="seeker-name-input"
                  />
                  <button
                    type="button"
                    onClick={() => listeningField === 'name' ? stopListening() : startListening('name')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                      listeningField === 'name'
                        ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 animate-pulse'
                        : 'text-slate-400 hover:text-purple-400 hover:bg-white/5'
                    }`}
                    title="Speak Name"
                    id="mic-seeker-name"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Date of Birth
                    </label>
                    {listeningField === 'birthDate' && (
                      <span className="text-[8px] font-mono text-purple-400 animate-pulse bg-purple-950/50 border border-purple-500/20 px-1.5 py-0.5 rounded">V_SYS: REC...</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-4 pr-11 py-3 text-sm focus:border-purple-400 focus:outline-none transition-all font-mono shadow-inner"
                      id="birth-date-input"
                    />
                    <button
                      type="button"
                      onClick={() => listeningField === 'birthDate' ? stopListening() : startListening('birthDate')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                        listeningField === 'birthDate'
                          ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 animate-pulse'
                          : 'text-slate-400 hover:text-purple-400 hover:bg-white/5'
                      }`}
                      title="Speak Date"
                      id="mic-birth-date"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Time of Birth
                    </label>
                    {listeningField === 'birthTime' && (
                      <span className="text-[8px] font-mono text-purple-400 animate-pulse bg-purple-950/50 border border-purple-500/20 px-1.5 py-0.5 rounded">V_SYS: REC...</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-4 pr-11 py-3 text-sm focus:border-purple-400 focus:outline-none transition-all font-mono shadow-inner"
                      id="birth-time-input"
                    />
                    <button
                      type="button"
                      onClick={() => listeningField === 'birthTime' ? stopListening() : startListening('birthTime')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                        listeningField === 'birthTime'
                          ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 animate-pulse'
                          : 'text-slate-400 hover:text-purple-400 hover:bg-white/5'
                      }`}
                      title="Speak Time"
                      id="mic-birth-time"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Birth Location
                  </label>
                  {listeningField === 'birthLocation' && (
                    <span className="text-[8px] font-mono text-purple-400 animate-pulse bg-purple-950/50 border border-purple-500/20 px-1.5 py-0.5 rounded">V_SYS: REC...</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={birthLocation}
                    onChange={(e) => setBirthLocation(e.target.value)}
                    placeholder="City, Country / State..."
                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-4 pr-11 py-3 text-sm focus:border-purple-400 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
                    id="birth-location-input"
                  />
                  <button
                    type="button"
                    onClick={() => listeningField === 'birthLocation' ? stopListening() : startListening('birthLocation')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                      listeningField === 'birthLocation'
                        ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 animate-pulse'
                        : 'text-slate-400 hover:text-purple-400 hover:bg-white/5'
                    }`}
                    title="Speak Location"
                    id="mic-birth-location"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-mono uppercase tracking-widest py-3.5 rounded-2xl text-xs font-semibold shadow-lg shadow-purple-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 "
                id="calculate-astrology-btn"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-200" /> Synchronizing Aligns...
                  </>
                ) : (
                  <>
                    <Compass className="w-4.5 h-4.5 text-teal-300 animate-pulse" /> Initialize Synchronicity
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Quick HUD command block */}
          <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-slate-500" /> Auxiliary Commands
              </span>
              <span className="text-[8.5px] font-mono text-emerald-400 animate-pulse bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">SYSTEM_STABLE</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={runDeepScanCode}
                className="p-3 bg-slate-950/70 border border-white/5 hover:border-purple-500/30 rounded-xl text-left transition-all group"
              >
                <div className="text-[10px] font-mono text-purple-400 group-hover:text-purple-300 transition-colors">DEEP_DIAG_RUN</div>
                <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Run spectrograph sync</div>
              </button>
              <button 
                onClick={() => { soundEngine.click(); speakText("System atmospheric calibration initialized. Planetary fields aligned with baseline values."); }}
                className="p-3 bg-slate-950/70 border border-white/5 hover:border-teal-500/30 rounded-xl text-left transition-all group"
              >
                <div className="text-[10px] font-mono text-teal-400 group-hover:text-teal-300 transition-colors">CALIBRATE_ATM</div>
                <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase">Equalize baseline db</div>
              </button>
            </div>

            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-black/90 p-3 rounded-2xl border border-purple-500/30 font-mono text-[9px] text-purple-300 space-y-1 max-h-[140px] overflow-y-auto"
                >
                  {scanLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-1.5">
                      <span className="text-purple-500 font-bold">&gt;&gt;</span>
                      <span className="leading-relaxed leading-4">{log}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 pt-1 text-teal-400">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Sweep scanning...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dynamic computed metrics if available */}
          {natalData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-950/60 border border-indigo-500/25 rounded-3xl p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2 text-indigo-400 border-b border-white/10 pb-3">
                <Sliders className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                <h3 className="text-xs font-mono uppercase tracking-widest font-bold">Stark Diagnostics Telemetry</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                SYS_DATE: {new Date().toLocaleDateString()}<br />
                GEOGRAPHIC_MAP: {natalData.seeker || 'SIR'}<br />
                ALIGNMENT_GRADE: COHERENT (Score: 97.42%)
              </p>
              
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 block">KABBALISTIC ROOT LINK</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Primary Sephirah:</span>
                  <span className="font-mono text-indigo-200 font-semibold">{natalData.kabbalicLink?.sephirah || 'Tiphereth'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Dominant Path:</span>
                  <span className="font-mono text-indigo-200 font-semibold">{natalData.kabbalicLink?.path || 'Path of Resh'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-2">
                  {natalData.kabbalicLink?.theme}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Holographic Journey Board */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!natalData ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-center py-20 border border-white/10 bg-black/40 rounded-3xl flex flex-col items-center justify-center space-y-4 px-6 relative"
              >
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-white/5 rounded-tl-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-white/5 rounded-br-3xl pointer-events-none" />
                
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-purple-500/30 text-purple-300 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="font-mono uppercase tracking-wider text-sm font-bold text-slate-300">Celestial Sync Required</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-sans">
                  Provide birth coordinates in the Stellar Data Protocol index to initialize your custom interactive storytelling navigation deck.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="journey-deck"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 animate-fade-in"
              >
                {/* Introduction greeting bar with neon frames */}
                <div className="bg-gradient-to-r from-purple-950/25 to-slate-950 px-6 py-5 rounded-3xl border border-purple-500/15 flex items-start gap-4">
                  <div className="mt-1 h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 font-mono text-xs font-bold shrink-0 animate-pulse shadow-[0_0_6px_rgba(168,85,247,0.2)]">
                    AI
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-purple-400 font-semibold">Active Consciousness Message</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                      "{natalData.introMessage}"
                    </p>
                  </div>
                </div>

                {/* 3D-like Visualization of Active Step */}
                {renderStellarVisualization(natalData.steps[activeStep]?.interactiveFocus || '')}

                {/* Active Interactive Section Deck Card with high textured designs */}
                <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-xl" id="journey-explanation-card">
                  
                  {/* Glowing background bubble */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Step Title bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold">
                        STORY ZONE {activeStep + 1} OF {natalData.steps.length}
                      </span>
                      <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        {natalData.steps[activeStep]?.title}
                      </h2>
                    </div>

                    {/* Audio Volume Trigger icon */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">Solfeggio Resonance:</span>
                      <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono text-teal-400">
                        {natalData.steps[activeStep]?.solfeggioHz} Hz
                      </div>
                      <button
                        onClick={() => speakText(natalData.steps[activeStep]?.narrative)}
                        className={`p-2 rounded-xl transition-all ${isPlayingVocal ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.25)] animate-pulse' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'}`}
                        title="Vocalize narrative"
                        id="vocalize-step-btn"
                      >
                        {isPlayingVocal ? <VolumeX className="w-4 h-4" onClick={(e) => { e.stopPropagation(); handleStopSpeaking(); }} /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Highlights and Narratives with fine text styling */}
                  <div className="space-y-4">
                    <p className="text-sm font-sans leading-relaxed text-slate-300 whitespace-pre-line bg-slate-900/40 rounded-2xl p-4 border border-white/5">
                      {natalData.steps[activeStep]?.narrative}
                    </p>

                    <div className="border-l-2 border-purple-500 pl-4 py-1 italic text-xs text-purple-300 font-mono">
                      "{natalData.steps[activeStep]?.highlightQuote}"
                    </div>
                  </div>

                  {/* Navigation Control Buttons */}
                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <button
                      disabled={activeStep === 0}
                      onClick={handlePrevStep}
                      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-white/10 text-slate-300 min-w-[100px] py-2.5 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                      id="prev-step-btn"
                    >
                      <ArrowLeft className="w-4 h-4" /> PREV PROTOCOL
                    </button>

                    <button
                      disabled={activeStep === natalData.steps.length - 1}
                      onClick={handleNextStep}
                      className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-950 hover:from-purple-700 hover:to-slate-900 disabled:opacity-40 border border-purple-500/40 text-white min-w-[100px] py-2.5 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider shadow-md"
                      id="next-step-btn"
                    >
                      Next Align <ArrowRight className="w-4 h-4 text-purple-400" />
                    </button>
                  </div>
                </div>

                {/* Grid expansion to examine raw placements list with glow highlights */}
                <div className="space-y-4 bg-slate-950/45 rounded-3xl p-6 border border-white/5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-teal-400 flex items-center gap-1">
                      <Orbit className="w-3.5 h-3.5" /> Computed Placements Array
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{natalData.natalPlacements?.length || 0} Entities Computed</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {natalData.natalPlacements?.map((placement: any) => {
                      const isSelected = selectedPlanetName === placement.name;
                      return (
                        <div
                          key={placement.name}
                          onClick={() => {
                            soundEngine.click();
                            setSelectedPlanetName(isSelected ? null : placement.name);
                          }}
                          className={`cursor-pointer rounded-2xl p-3 border text-center transition-all ${
                            isSelected 
                              ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)] translate-y-[-2px]' 
                              : 'bg-black/60 border-white/5 hover:border-white/20 select-none'
                          }`}
                        >
                          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">{placement.name}</span>
                          <span className="text-xs font-semibold text-white block mt-1">{placement.sign}</span>
                          <span className="text-[10px] font-mono text-teal-400 block mt-0.5">{placement.degree?.toFixed?.(2)}° | H{placement.house}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Planet display box */}
                  <AnimatePresence>
                    {selectedPlanetName && (() => {
                      const planet = natalData.natalPlacements.find((p: any) => p.name === selectedPlanetName);
                      if (!planet) return null;
                      return (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden bg-slate-900/60 p-5 rounded-2xl border border-purple-500/30 space-y-2.5 mt-3 text-xs"
                        >
                          <div className="flex justify-between items-center font-mono border-b border-white/5 pb-2">
                            <span className="text-amber-400 text-sm font-semibold uppercase">{planet.name} in {planet.sign} (House {planet.house})</span>
                            <span className="bg-slate-800 px-2.5 py-1 rounded text-[10px] text-slate-300">Dignity: {planet.dignity || 'Neutral'}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed leading-5 font-sans whitespace-pre-line">
                            {planet.interpretation}
                          </p>
                          <div className="flex flex-wrap gap-4 text-[10.5px] font-mono text-slate-400 pt-2 border-t border-white/5">
                            <span>Orbital Frequency: <strong className="text-teal-400">{planet.frequencyHz || '126.22'} Hz</strong></span>
                            <span>Tree Mapping: <strong className="text-purple-300">{planet.treeConnection || 'Tiphereth'}</strong></span>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>

                {/* Interactive 2-Way Chat with Astral OS */}
                <div className="bg-black/50 xl:backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 justify-between">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Cpu className="w-5 h-5 animate-pulse" />
                      <h3 className="text-sm font-mono uppercase tracking-wider font-bold">2-Way Conversation: Seeker to Astral OS</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Globe className="w-3" /> ASTRAL CORE ONLINE
                    </span>
                  </div>

                  {/* Messages Stream Container */}
                  <div className="h-[200px] overflow-y-auto space-y-3.5 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="text-slate-400 text-xs italic flex gap-2 items-center bg-slate-900/30 p-2.5 rounded-xl border border-white/5 leading-snug">
                       <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
                      "Aspirant, our planetary matrix computations are loaded. Go ahead, ask me anything regarding your customized chart, tree positioning, or alpha-numeric coordinates."
                    </div>

                    {chatLog.map((chat, idx) => {
                      const isUser = chat.role === 'user';
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{isUser ? 'Seeker Input' : 'OS Telemetry'}</span>
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                              isUser 
                                ? 'bg-cyan-950/35 border border-cyan-500/30 text-cyan-200' 
                                : 'bg-slate-900/70 border border-white/5 text-slate-300 font-sans'
                            }`}
                          >
                            {chat.parts?.[0]?.text}
                          </div>
                        </div>
                      );
                    })}

                    {chatLoading && (
                      <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uplinking cosmic query to core models...
                      </div>
                    )}
                  </div>

                  {/* Message Input Controls */}
                  <div className="flex gap-2.5 pt-2 border-t border-white/5">
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatQuery();
                      }}
                      placeholder="Ask Astral OS about your placements, transits, or aspects..."
                      className="flex-1 bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:border-cyan-400 focus:outline-none transition-all placeholder-slate-600 shadow-inner"
                    />
                    <button
                      onClick={handleSendChatQuery}
                      disabled={chatLoading}
                      className="bg-cyan-950 hover:bg-cyan-900 disabled:opacity-50 text-cyan-200 border border-cyan-500/40 px-5 py-3 rounded-2xl text-xs font-mono font-bold flex items-center gap-2.5 active:scale-95 transition-all shadow-md shadow-cyan-950/20"
                    >
                      <span>SEND</span> <Send className="w-3.5 h-3.5 text-cyan-300" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* FULLY DETAILED BEAUTIFUL GLASS ANIMATED POP-UP OVERLAY FOR ASPECT MATRIX */}
      <AnimatePresence>
        {showAspectMatrix && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-slate-950 border border-white/10 w-full max-w-3xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Corner tech highlights */}
              <div className="absolute top-0 left-0 w-20 h-0.5 bg-gradient-to-r from-teal-500 to-transparent" />
              <div className="absolute top-0 left-0 w-0.5 h-20 bg-gradient-to-b from-teal-500 to-transparent" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-teal-400 animate-pulse" />
                  <h3 className="text-md font-mono uppercase tracking-wider font-bold text-white">Stellar Aspect Matrix Analyzer</h3>
                </div>
                <button 
                  onClick={() => { soundEngine.click(); setShowAspectMatrix(false); }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!natalData ? (
                <div className="text-center py-10 font-mono text-xs text-slate-400">
                  Data matrix empty. Sync natal placements from core module first.
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Selecting cells will resolve geometric coordinates, calculating alignment dignity levels and precise planetary aspects directly.
                  </p>

                  <div className="overflow-x-auto border border-white/5 rounded-2xl">
                    <table className="w-full text-left font-mono text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-900/60 text-slate-400 border-b border-white/5">
                          <th className="p-3">Planet</th>
                          {natalData.natalPlacements?.map((p: any) => (
                            <th key={p.name} className="p-3 text-center">{p.name.substring(0,2).toUpperCase()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {natalData.natalPlacements?.map((p_row: any, rIdx: number) => (
                          <tr key={p_row.name} className="border-b border-white/5 hover:bg-white/2 cursor-default">
                            <td className="p-3 font-semibold text-slate-200">{p_row.name}</td>
                            {natalData.natalPlacements?.map((p_col: any, cIdx: number) => {
                              // If same planet, write neutral self divider
                              if (p_row.name === p_col.name) {
                                return (
                                  <td key={p_col.name} className="p-3 text-center text-slate-700 bg-white/1 font-semibold">-</td>
                                );
                              }
                              
                              // Check if aspect exists in list
                              const match = natalData.aspects?.find((a: any) => 
                                (a.planet1 === p_row.name && a.planet2 === p_col.name) ||
                                (a.planet1 === p_col.name && a.planet2 === p_row.name)
                              );

                              return (
                                <td 
                                  key={p_col.name} 
                                  onClick={() => {
                                    soundEngine.click();
                                    if (match) {
                                      setSelectedAspectCell(match);
                                    } else {
                                      setSelectedAspectCell({
                                        planet1: p_row.name,
                                        planet2: p_col.name,
                                        type: "Unlinked",
                                        orb: 0,
                                        meaning: `No active geometric aspect of major importance resolved between ${p_row.name} and ${p_col.name}. Baseline gravitational balance stable.`
                                      });
                                    }
                                  }}
                                  className={`p-3 text-center font-bold font-sans cursor-pointer transition-colors ${
                                    match 
                                      ? 'text-teal-400 bg-teal-950/20 hover:bg-teal-900/40' 
                                      : 'text-slate-600 hover:bg-white/5'
                                  }`}
                                >
                                  {match ? match.type.substring(0,3).toUpperCase() : '·'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Active Aspect detail readout block */}
                  <AnimatePresence mode="wait">
                    {selectedAspectCell && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-slate-900/40 p-5 rounded-2xl border border-teal-500/25 space-y-2"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white uppercase text-[10.5px] font-mono tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-teal-400" />
                            {selectedAspectCell.planet1} &amp; {selectedAspectCell.planet2} - {selectedAspectCell.type}
                          </span>
                          {selectedAspectCell.orb > 0 && (
                            <span className="text-[10px] font-mono text-teal-400">Orb: {selectedAspectCell.orb}°</span>
                          )}
                        </div>
                        <p className="text-slate-300 text-[11.5px] leading-relaxed font-sans mt-2 whitespace-pre-line">
                          {selectedAspectCell.meaning}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
