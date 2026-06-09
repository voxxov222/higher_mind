import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Zap, Lock, Shield, Moon, Sun, Star, Clock, Calendar, Compass, Hexagon, 
  Activity, Play, Pause, Square, Volume2, VolumeX, Sliders, Mic, Smartphone, Globe, 
  BookOpen, HelpCircle, Send, Radio, Info, ChevronRight, RotateCcw
} from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';
import { fetchCosmicChatResponse } from '../services/geminiService';
import { soundEngine } from '../lib/soundEffects';

interface ResourceItem {
  name: string;
  category: 'charts' | 'apps' | 'databases';
  desc: string;
  url: string;
  badges: string[];
  tips: string;
}

const CELESTIAL_RESOURCES: ResourceItem[] = [
  {
    name: "Astro.com (Astrodienst)",
    category: "charts",
    desc: "Unrivaled professional astrology atlas using precise Swiss Ephemeris calculations for birth charts, solar returns, and natal aspects.",
    url: "https://www.astro.com",
    badges: ["Gold Standard", "Swiss Ephemeris", "Free Charts"],
    tips: "Go to 'Extended Chart Selection' to map Asteroids and custom Greek Lots."
  },
  {
    name: "Astro-Seek",
    category: "charts",
    desc: "A powerful, community-driven database for planetary returns, solar eclipses, current transit maps, and traditional planetary age rulers.",
    url: "https://www.astro-seek.com",
    badges: ["Best Community", "Transit Maps", "Highly Accurate"],
    tips: "Utilize the 'Transits Search Engine' to find historical aspects matching your birth chart."
  },
  {
    name: "Cafe Astrology",
    category: "charts",
    desc: "An absolute treasure trove of fundamental educational content. Features detailed tables of signs, houses, planetary decans, and clear tutorials.",
    url: "https://cafeastrology.com",
    badges: ["Educational", "Beginner Friendly", "Comprehensive"],
    tips: "Excellent literal descriptions of natal Chiron and Saturn house dynamics."
  },
  {
    name: "TimePassages",
    category: "apps",
    desc: "Uncompromisingly accurate mobile application providing clean mathematical data and professional written horoscopes.",
    url: "https://virely.com/timepassages/",
    badges: ["Mobile App", "Professional Interpretations", "Natal Aspects"],
    tips: "Keep the 'Daily Transit Aspect' view open to understand minor planetary angles."
  },
  {
    name: "Chani App",
    category: "apps",
    desc: "Fusing ancient therapeutic wisdom with spiritual astrology. Incredible daily workshops, personalized mental exercises, and meditation loops.",
    url: "https://chani.com",
    badges: ["Therapeutic", "Premium Voice", "Guided Practice"],
    tips: "Excellent for regular lunar journaling and setting monthly intentional targets."
  },
  {
    name: "The Pattern",
    category: "apps",
    desc: "Translates complex mathematical geometry into straightforward behavioral patterns, emotional blueprints, and human relationships compatibility.",
    url: "https://thepattern.com",
    badges: ["Relationship Sync", "No Esoteric Jargon", "Actionable Psych"],
    tips: "Fabulous for mapping compatibility ties ('Synastry Bonding') with friends or family."
  },
  {
    name: "Gematrix Alphanumerics",
    category: "databases",
    desc: "Fully interactive master alphanumeric calculator supporting Hebrew, English Ordinal, reduction, and Chaldean systems.",
    url: "https://www.gematrix.org",
    badges: ["Gematria Decoder", "Searchable Database", "Spiritual Aliquots"],
    tips: "Enter your core name or date values to see high vibrational semantic keyword matches."
  },
  {
    name: "Sefaria Sacred Library",
    category: "databases",
    desc: "The largest open-source digital storage of historical Kabbalistic, traditional Jewish, and ancient philosophical manuscripts in dual translations.",
    url: "https://www.sefaria.org",
    badges: ["Tree of Life Study", "Dual Translation", "Historical Source"],
    tips: "Lookup 'Zohar' search terms to understand planetary connections of Gevurah and Binah."
  }
];

export const DailyCosmicPulse: React.FC = () => {
  const { cosmicData, activeTheme, cosmicContext } = useHigherMind();
  const [activeTab, setActiveTab] = useState<'transits' | 'solfeggio' | 'tarot'>('transits');
  const [resourceFilter, setResourceFilter] = useState<'all' | 'charts' | 'apps' | 'databases'>('all');
  const [isOracleUnlocked, setIsOracleUnlocked] = useState(false);

  // Time metrics
  const todayString = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  // Text-To-Speech (Vocal Synthesis) state parameters
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.05);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(-1);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

  // Sound hum oscillator variables
  const [activeHumFreq, setActiveHumFreq] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Tarot Deck States
  const [isTarotFlipped, setIsTarotFlipped] = useState(false);
  const [tarotSeed, setTarotSeed] = useState(0);

  // Conversational JARVIS state
  const [isListening, setIsListening] = useState(false);
  const [jarvisQuery, setJarvisQuery] = useState('');
  const [jarvisResponseText, setJarvisResponseText] = useState('Vocal Uplink online. Instruct your parameters, Aspirant.');
  const [isJarvisThinking, setIsJarvisThinking] = useState(false);

  // Fetch actual browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
      
      // Select standard pleasant English default
      const defaultVoice = allVoices.find(v => 
        v.name.includes('Google US English') || 
        v.name.includes('Natural') || 
        (v.lang === 'en-US' && v.name.includes('David')) ||
        v.lang.startsWith('en')
      );
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      } else if (allVoices.length > 0) {
        setSelectedVoice(allVoices[0].name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Shutdown speech synthesis and sound hum when unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
      }
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }
    };
  }, []);

  // Transits datasets
  const calculatedTransits = useMemo(() => {
    if (cosmicData?.aspects && cosmicData.aspects.length > 0) {
      return cosmicData.aspects.map((aspect: any) => ({
        title: `${aspect.planet1} ${aspect.type.charAt(0).toUpperCase() + aspect.type.slice(1)} ${aspect.planet2}`,
        desc: aspect.meaning,
        intensity: aspect.type === 'conjunction' || aspect.type === 'square' ? 9 : 7
      }));
    }
    // Deep fallback transits with highly detailed text
    return [
      { 
        title: "Moon Trine Jupiter Aspect", 
        desc: "An incredible harmonic synchronization activating emotional expansion, boundless optimism, and fortunate social opportunities.", 
        intensity: 8 
      },
      { 
        title: "Sun Quincunx Pluto Threshold", 
        desc: "Friction between the conscious ego expression and undercurrent spiritual desires demanding authentic evolutionary modifications.", 
        intensity: 7 
      },
      { 
        title: "Mercury Sextile Uranus Spark", 
        desc: "Electromagnetic cognitive trigger boosting rapid analytical focus, innovative technical deductions, and sudden esoteric insights.", 
        intensity: 6 
      }
    ];
  }, [cosmicData]);

  const activeTransitName = useMemo(() => {
    if (cosmicContext?.enabled && cosmicContext.type === 'transit') {
      const match: Record<string, string> = {
        mercury_retrograde: 'Mercury Retrograde',
        saturn_return: 'Saturn Return',
        venus_trine: 'Venus Trine Angle',
        jupiter_conjunction: 'Jupiter Conjunction Alignment'
      };
      return match[cosmicContext.transit] || 'Mercury Retrograde';
    }
    return 'Sun Square Saturn Threshold';
  }, [cosmicContext]);

  const currentLunarPhaseName = useMemo(() => {
    if (cosmicContext?.enabled && cosmicContext.type === 'lunar' && cosmicContext.effects?.cosmicDetails) {
      return cosmicContext.effects.cosmicDetails.name;
    }
    return "Waxing Gibbous Illuminator";
  }, [cosmicContext]);

  // Construct dynamic reading sentences (Astrology & Daily reading AI speaks it)
  const currentReadingSentences = useMemo(() => {
    const sunSign = cosmicData?.planets?.find((p: any) => p.name === 'Sun')?.sign || 'Leo';
    const moonSign = cosmicData?.planets?.find((p: any) => p.name === 'Moon')?.sign || 'Aries';
    const first = cosmicData?.nameAnalysis?.first?.name || 'Searcher';
    const valFreq = activeTab === 'solfeggio' ? '528Hz healing resonance' : '741Hz cognitive awakening';

    if (cosmicData) {
      return [
        `Greetings, ${first}. Operating model JARVIS active. Initializing direct diagnostic of your natal coordinates.`,
        `Your sun is grounded inside ${sunSign}, fueling your conscious operational ego, while your moon orbits in ${moonSign}, regulating your psychic body.`,
        `Current celestial transits emphasize the ${currentLunarPhaseName} as a dominant cosmic vector today, aligning with your spiritual blueprint.`,
        `At this threshold, we are currently navigating the active parameters of the ${activeTransitName} aspect, bringing key adjustments to your energetic layout.`,
        `I highly advise calibrating your physical field to the ${valFreq} parameter and referring immediately to the external Resource Hub for deeper ephemeris study.`
      ];
    }

    return [
      `Greetings. JARVIS operational system online. I am ready to decode today's general atmospheric celestial weather.`,
      `The sky is currently governed by a powerful ${currentLunarPhaseName} phase, establishing an optimal space for progressive intention and expansion.`,
      `Our dynamic sensors detect alignment with the active ${activeTransitName} transit, presenting a subtle cosmic tension requiring discipline.`,
      `To optimize your neural coherence, I recommend activating today's key vibrational resonance loop of 528Hz Solfeggio.`,
      `For tailored calculations, enter your personal birth details to let me map your personal birth chart, or chat with me below.`
    ];
  }, [cosmicData, activeTransitName, currentLunarPhaseName, activeTab]);

  // Read sentences sequentially using SpeechSynthesis with highlight tracking
  const handleVocalStart = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Voice synthesis is unfortunately not natively supported on this browser context.");
      return;
    }

    soundEngine.click();
    window.speechSynthesis.cancel();
    
    setIsSpeaking(true);
    setIsSpeechPaused(false);

    // Create browser SpeechSynthesisUtterance object array
    const utterances = currentReadingSentences.map((text, idx) => {
      const u = new SpeechSynthesisUtterance(text);
      const v = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice);
      if (v) u.voice = v;
      u.rate = speechRate;
      u.pitch = speechPitch;

      u.onstart = () => {
        setCurrentSentenceIndex(idx);
      };

      u.onend = () => {
        if (idx === currentReadingSentences.length - 1) {
          setIsSpeaking(false);
          setIsSpeechPaused(false);
          setCurrentSentenceIndex(-1);
          soundEngine.success();
        }
      };

      u.onerror = (e) => {
        console.error("Utterance speech error", e);
      };

      return u;
    });

    utterancesRef.current = utterances;
    
    // Launch voice queue
    utterances.forEach(u => window.speechSynthesis.speak(u));
  };

  const handleVocalPause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    soundEngine.click();
    window.speechSynthesis.pause();
    setIsSpeechPaused(true);
  };

  const handleVocalResume = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    soundEngine.click();
    window.speechSynthesis.resume();
    setIsSpeechPaused(false);
  };

  const handleVocalStop = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    soundEngine.click();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsSpeechPaused(false);
    setCurrentSentenceIndex(-1);
  };

  // Sound Frequency Generator (Web Audio API Solfeggio generator)
  const toggleSolfeggioHum = (freq: number) => {
    soundEngine.select();
    
    if (activeHumFreq === freq) {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch (_) {
          // Ignore
        }
        oscRef.current = null;
      }
      setActiveHumFreq(null);
      return;
    }

    if (oscRef.current) {
      try {
        oscRef.current.stop();
      } catch (_) {
        // Ignore
      }
      oscRef.current = null;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1); // Keep at a very comfortable soft volume

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
      setActiveHumFreq(freq);
    } catch (e) {
      console.warn("Could not start solfeggio audio stream context", e);
    }
  };

  // Audio wave rendering indicator points
  const waveBarsArr = Array.from({ length: 18 }, (_, k) => k);

  // Tarot configurations
  const tarotCards = [
    { name: "The High Priestess", element: "Subconscious & Whispering intuition", design: "border-cyan-500/30 text-cyan-400" },
    { name: "The Magician", element: "Intention focus & Active alchemy", design: "border-amber-400/30 text-amber-300" },
    { name: "The Hermit", element: "Solitary audit & Inner lantern", design: "border-indigo-400/30 text-indigo-300" },
    { name: "The Hierophant", element: "Esoteric systems & Master frameworks", design: "border-purple-500/30 text-purple-400" },
    { name: "The Chariot", element: "Harmonized momentum & Vector lock", design: "border-rose-500/30 text-rose-400" }
  ];

  const currentTarotCard = useMemo(() => {
    const cardIndex = Math.abs(tarotSeed) % tarotCards.length;
    return tarotCards[cardIndex];
  }, [tarotSeed]);

  const handleTarotFlip = () => {
    soundEngine.mysticClick();
    if (!isTarotFlipped) {
      // Pick random seed
      setTarotSeed(Math.floor(Math.random() * 100));
    }
    setIsTarotFlipped(!isTarotFlipped);
  };

  // Micro-speech recognition loop simulation & live
  const handleVoiceListeningInput = () => {
    soundEngine.click();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulator setup
      setIsListening(true);
      const simulatorOptions = [
        "Explain my natal aspects and daily vibration synergy.",
        "What are the best planetary apps in my resource list?",
        "Compare today's lunar weather to my life path meaning.",
        "Align JARVIS processor with Saturn return transits."
      ];
      const selectedOption = simulatorOptions[Math.floor(Math.random() * simulatorOptions.length)];

      setTimeout(() => {
        setJarvisQuery(selectedOption);
        setIsListening(false);
        soundEngine.success();
      }, 2400);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      const transcriptStr = event.results[0][0].transcript;
      if (transcriptStr) {
        setJarvisQuery(transcriptStr);
      }
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
  };

  // Submit conversation message to JARVIS powered by Gemini
  const handleJarvisSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jarvisQuery.trim() || isJarvisThinking) return;

    const queryStr = jarvisQuery;
    setJarvisQuery('');
    setIsJarvisThinking(true);
    soundEngine.neuralClick();

    // Setup friendly history payload
    const textHistory = [
      { role: 'user' as const, parts: [{ text: "You are JARVIS, the hyper-intelligent holographic companion on the Stark Iron Man suit. Speak mystical, astrophysical, and alphanumeric calculations terms mixed with scientific logic. Answer the aspirant briefly and brilliantly." }] },
      { role: 'model' as const, parts: [{ text: "Synapses aligned. Holographic coordinates established. Seek your answers, Aspirant." }] }
    ];

    try {
      const response = await fetchCosmicChatResponse(queryStr, textHistory, cosmicData);
      const answerVal = response.text || "Operational loop active. The mathematical matrix resonates positively.";
      setJarvisResponseText(answerVal);
      soundEngine.success();

      // Speak answer out loud if vocalizer acts
      if (typeof window !== 'undefined' && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
        const mainUtterance = new SpeechSynthesisUtterance(answerVal);
        const v = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice);
        if (v) mainUtterance.voice = v;
        mainUtterance.rate = speechRate;
        mainUtterance.pitch = speechPitch;
        
        mainUtterance.onstart = () => setIsSpeaking(true);
        mainUtterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(mainUtterance);
      }
    } catch (err: any) {
      console.error(err);
      setJarvisResponseText("An anomaly occurred in our deep space transmitter bandwidth. Retrying cosmic query.");
      soundEngine.error();
    } finally {
      setIsJarvisThinking(false);
    }
  };

  // Resource Filter Action
  const filteredResources = useMemo(() => {
    if (resourceFilter === 'all') return CELESTIAL_RESOURCES;
    return CELESTIAL_RESOURCES.filter(item => item.category === resourceFilter);
  }, [resourceFilter]);

  return (
    <div id="daily-cosmic-section" className="flex flex-col h-full bg-stone-950 font-sans text-stone-300 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Absolute Dynamic Neon Atmosphere */}
      <div className="absolute inset-0 bg-radial-gradient from-stone-950/20 via-black to-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.2)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(18,18,18,0.2)_1px,_transparent_1px)] bg-[size:30px_30px] opacity-15 pointer-events-none" />
      
      {/* Futuristic Astro Comm-Rail Header */}
      <div className="relative z-10 px-8 py-5 border-b border-white/5 bg-black/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 font-bold tracking-widest relative overflow-hidden">
            <Radio className="w-5 h-5 animate-pulse text-indigo-400" />
            <span className="absolute inset-0 bg-indigo-500/10 animate-ping rounded-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
              JARVIS Operational Core <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">STREAMS ON</span>
            </h1>
            <p className="text-[10px] text-stone-400 tracking-wider font-mono uppercase mt-0.5">Atmospheric Real-Time Dynamic Synthesis Deck</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-neutral-900/40 p-1.5 border border-white/5 rounded-2xl backdrop-blur-md">
          <Calendar className="w-4 h-4 text-stone-500" />
          <span className="text-xs text-stone-300 font-bold uppercase tracking-wider">{todayString}</span>
        </div>
      </div>

      {/* Main Core Container */}
      <div className="relative z-10 flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-y-auto custom-scrollbar bg-black/20">
        
        {/* LEFT COLUMN: Summary Widgets & Alignment Indices (8 Cols) */}
        <div className="xl:col-span-7 p-8 space-y-8 border-r border-white/5">
          
          {/* Holographic Diagnostic Panel: Interactive Weather summary */}
          <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-stone-900/40 via-stone-950/60 to-black/80 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Compass className="w-32 h-32 text-indigo-500 animate-spin" style={{ animationDuration: '40s' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lunar Phase */}
              <div className="space-y-1.5 relative">
                <span className="text-[9px] text-indigo-400 font-bold font-mono tracking-widest block uppercase">Astronomical Rhythms</span>
                <div className="flex items-center gap-2.5">
                  <Moon className="w-5 h-5 text-indigo-300" />
                  <span className="text-sm font-bold text-white tracking-wide truncate">{currentLunarPhaseName}</span>
                </div>
                <p className="text-[10px] text-stone-400 leading-normal">Lunar gravitational scales affecting somatic emotion embeddings.</p>
              </div>

              {/* Solfeggio Vibration */}
              <div className="space-y-1.5 relative border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                <span className="text-[9px] text-indigo-400 font-bold font-mono tracking-widest block uppercase">Vibrational Harmony</span>
                <div className="flex items-center gap-2.5">
                  <Hexagon className="w-5 h-5 text-indigo-300 animate-pulse" />
                  <span className="text-sm font-bold text-white tracking-wide">528 Hz Healing Zone</span>
                </div>
                <p className="text-[10px] text-stone-400 leading-normal">Optimized Solfeggio sound metrics mapped to daily alignment.</p>
              </div>

              {/* Transit Target Aspect */}
              <div className="space-y-1.5 relative border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                <span className="text-[9px] text-indigo-400 font-bold font-mono tracking-widest block uppercase">Active Transit aspect</span>
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-indigo-300" />
                  <span className="text-sm font-bold text-white tracking-wide truncate">{activeTransitName}</span>
                </div>
                <p className="text-[10px] text-stone-400 leading-normal">Astrological pressure threshold indicating conscious limits.</p>
              </div>
            </div>
          </div>

          {/* Interactive Core Deck Tabs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-white font-bold">Dynamic Synapse Modules</span>
              
              <div className="flex gap-2.5 bg-black/60 p-1 border border-white/5 rounded-2xl backdrop-blur-md">
                {[
                  { id: 'transits', label: 'Planetary Transits', icon: Activity },
                  { id: 'solfeggio', label: 'Vibrational Hum', icon: Radio },
                  { id: 'tarot', label: 'Oracle Arcana', icon: Moon }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { soundEngine.click(); setActiveTab(tab.id as any); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab.id 
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tab: TRANSITS aspect list */}
                {activeTab === 'transits' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calculatedTransits.map((item, idx) => (
                      <div key={idx} className="p-5 rounded-[2rem] bg-stone-900/20 border border-white/5 hover:border-indigo-500/20 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex justify-between items-start mb-2.5">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 block" />
                            {item.title}
                          </h3>
                          <span className="text-[10px] text-stone-500 font-mono font-bold uppercase tracking-wider">Tension {item.intensity}/10</span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed font-light">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: SOLFEGGIO audio hum generator */}
                {activeTab === 'solfeggio' && (
                  <div className="p-6 rounded-[2.5rem] bg-stone-900/10 border border-white/5 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-1 space-y-2 text-center md:text-left">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Solfeggio Resonance Sound Hum</h3>
                        <p className="text-xs text-stone-400 font-light leading-relaxed">
                          Solfeggio frequencies represent pure sound waves connected to energetic balance and therapeutic DNA adjustments. Tap an alignment frequency node below to generate the actual sound hum natively in your browser!
                        </p>
                      </div>

                      {/* Active Wave pulse indicators */}
                      {activeHumFreq && (
                        <div className="flex items-end gap-1 px-4 py-3 bg-black/40 border border-white/5 rounded-2xl h-14">
                          {waveBarsArr.map(bar => {
                            const randDelay = Math.random() * 0.5;
                            return (
                              <span 
                                key={bar} 
                                className="w-1 bg-indigo-400 rounded-full animate-pulse" 
                                style={{ 
                                  height: `${Math.floor(Math.random() * 32) + 8}px`,
                                  animationDuration: `${0.4 + randDelay}s` 
                                }} 
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { val: 174, label: "174Hz Grounds", labelDetail: "Security & Safety" },
                        { val: 396, label: "396Hz Release", labelDetail: "Fear & Forgiveness" },
                        { val: 417, label: "417Hz Change", labelDetail: "Transformation" },
                        { val: 528, label: "528Hz Miracle", labelDetail: "Healing & Harmony" },
                        { val: 639, label: "639Hz Connect", labelDetail: "Interrelation" },
                        { val: 741, label: "741Hz Awaken", labelDetail: "Aura Intuition" },
                        { val: 852, label: "852Hz Return", labelDetail: "Spiritual Order" },
                        { val: 963, label: "963Hz Transcend", labelDetail: "Divine Link" }
                      ].map(freq => (
                        <button
                          key={freq.val}
                          onClick={() => toggleSolfeggioHum(freq.val)}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            activeHumFreq === freq.val
                              ? 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)] text-white'
                              : 'bg-black/30 border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="text-xs font-bold font-mono tracking-wider">{freq.label}</div>
                          <div className="text-[8px] text-stone-500 uppercase tracking-widest mt-1 font-semibold">{freq.labelDetail}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: TAROT dynamic flipping card */}
                {activeTab === 'tarot' && (
                  <div className="flex flex-col items-center p-6 rounded-[2.5rem] bg-stone-900/15 border border-white/5">
                    <div className="mb-4 text-center">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Interactive Soul Arcana</h3>
                      <p className="text-[11px] text-stone-400">Click the holographic deck below to project your daily archetype guidance.</p>
                    </div>

                    <div className="relative w-44 h-64 cursor-pointer group" onClick={handleTarotFlip}>
                      <AnimatePresence initial={false} mode="wait">
                        {!isTarotFlipped ? (
                          // Back of tarot
                          <motion.div
                            key="card-back"
                            initial={{ rotateY: -180, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: 180, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-gradient-to-b from-stone-900 via-zinc-950 to-stone-950 border-2 border-white/10 rounded-[1.5rem] flex flex-col items-center justify-center p-4 shadow-[0_0_25px_rgba(0,0,0,0.5)] group-hover:border-indigo-500/40"
                          >
                            <div className="w-12 h-12 border border-white/5 rounded-full flex items-center justify-center bg-black/40 text-stone-500 group-hover:text-indigo-400 animate-pulse">
                              <Moon className="w-6 h-6" />
                            </div>
                            <span className="text-[8px] font-mono font-bold tracking-widest uppercase text-stone-600 mt-4 text-center">Click to Align Oracle</span>
                          </motion.div>
                        ) : (
                          // Front of tarot
                          <motion.div
                            key="card-front"
                            initial={{ rotateY: 180, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: -180, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`absolute inset-0 bg-stone-950 border-2 rounded-[1.5rem] flex flex-col items-center justify-between p-5 shadow-[0_0_30px_rgba(99,102,241,0.15)] ${currentTarotCard.design}`}
                          >
                            <div className="text-[9px] font-mono tracking-widest text-stone-500 uppercase">Tarot Alignment</div>
                            <div className="w-10 h-10 border border-white/5 rounded-full flex items-center justify-center bg-indigo-500/10">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="text-center space-y-1">
                              <h4 className="text-sm font-semibold tracking-wide text-white uppercase">{currentTarotCard.name}</h4>
                              <p className="text-[10px] leading-relaxed text-stone-400 font-light italic">"{currentTarotCard.element}"</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setIsTarotFlipped(false); soundEngine.click(); }}
                              className="text-[8px] text-stone-600 font-mono tracking-[0.2em] hover:text-white uppercase inline-flex items-center gap-1"
                            >
                              <RotateCcw className="w-2.5 h-2.5" /> reset card
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CELESTIAL RESOURCE HUB: App recommendation deck */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-white font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" /> Essential Astro-Resource Codex
                </h3>
                <p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-wider font-mono">Curated third-party professional calculations & databases</p>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 bg-neutral-900/40 p-1 border border-white/5 rounded-xl font-mono text-[9px] font-bold">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'charts', label: 'Charts' },
                  { id: 'apps', label: 'Mobile Tools' },
                  { id: 'databases', label: 'Bases' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { soundEngine.click(); setResourceFilter(tab.id as any); }}
                    className={`px-2 py-1 rounded-lg uppercase tracking-wider transition-all ${
                      resourceFilter === tab.id 
                        ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-5 bg-stone-900/10 border border-white/5 rounded-[1.75rem] hover:border-white/10 transition-all flex flex-col justify-between group"
                  onMouseEnter={() => soundEngine.mechHover()}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">{item.name}</span>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={() => soundEngine.click()}
                        className="p-1 px-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-100/10 hover:border-indigo-400/30 font-bold uppercase tracking-wider font-mono text-[8px] rounded-lg inline-flex items-center gap-1 transition-all"
                      >
                        Visit <Compass className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    
                    {/* Badges row */}
                    <div className="flex gap-1 flex-wrap">
                      {item.badges.map((badge, bIdx) => (
                        <span key={bIdx} className="px-2 py-0.5 bg-white/5 text-stone-500 font-mono text-[8.5px] uppercase tracking-wide rounded-md">
                          {badge}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-stone-400 leading-relaxed font-light">{item.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5">
                    <span className="text-[8px] text-stone-600 block uppercase tracking-wide font-mono font-bold">Pro Specialist tip</span>
                    <p className="text-[10px] text-stone-500 italic mt-0.5 leading-normal">"{item.tips}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive JARVIS Speech Center & Voice Command (5 Cols) */}
        <div className="xl:col-span-5 p-8 flex flex-col justify-between space-y-8 bg-gradient-to-b from-black/20 via-stone-950/20 to-black/40">
          
          {/* Section 1: Daily Astrology Reading AI Speaks Segment */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs uppercase tracking-widest text-white font-bold">Astro-Intonation Reader</h3>
              </div>
              <span className="text-[9px] text-indigo-400 font-semibold font-mono tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase">Vocal Alignment</span>
            </div>

            {/* Simulated interactive dialogue reading box with active sentence highlights */}
            <div className="p-6 rounded-[2.25rem] bg-stone-950 border border-white/10 shadow-inner relative overflow-hidden space-y-3.5">
              <div className="text-[9px] text-stone-500 font-mono uppercase tracking-[0.2em] font-semibold border-b border-white/5 pb-2 flex items-center justify-between">
                <span>Vocal Transcriptor Feed</span>
                <span className={isSpeaking ? "animate-pulse font-normal text-indigo-400" : ""}>
                  {isSpeaking ? "● SYNC ACTIVE" : "● IDLE"}
                </span>
              </div>

              <div className="space-y-2 max-h-[14rem] overflow-y-auto custom-scrollbar pr-2">
                {currentReadingSentences.map((sentenceText, idx) => (
                  <motion.p
                    key={idx}
                    animate={{
                      color: currentSentenceIndex === idx ? "#ffffff" : "#78716c",
                      scale: currentSentenceIndex === idx ? 1.012 : 1.0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`text-xs leading-relaxed font-light ${
                      currentSentenceIndex === idx 
                        ? 'font-normal border-l-2 border-indigo-400 pl-2 text-white' 
                        : 'text-stone-500 border-l border-white/5 pl-2'
                    }`}
                  >
                    {sentenceText}
                  </motion.p>
                ))}
              </div>

              {/* TTS Voice Customizer parameters controls */}
              <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8.5px] text-stone-500 font-bold uppercase tracking-wider block mb-1">Speaker Pitch</label>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-stone-500" />
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.05"
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8.5px] text-stone-500 font-bold uppercase tracking-wider block mb-1">Speaker Velocity</label>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-stone-500" />
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.05"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[8.5px] text-stone-500 font-bold uppercase tracking-wider block mb-1">Operational Voice Profile</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full py-1.5 px-3 bg-black/50 text-[10px] font-bold text-indigo-300 font-mono uppercase tracking-wider rounded-xl border border-white/5 focus:outline-none"
                  >
                    {voices.map((v, key) => (
                      <option key={key} value={v.name} className="bg-stone-900 font-mono text-[9px]">
                        {v.name} ({v.lang})
                      </option>
                    ))}
                    {voices.length === 0 && (
                      <option className="bg-stone-900 text-stone-600">Standard Voice (No system profiles loaded)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Speech Synthesis Actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleVocalStart}
                  className="flex-1 bg-white hover:bg-stone-200 text-black font-bold h-10 px-5 rounded-xl transition-all shadow-md text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" /> Hear JARVIS Decode
                </button>

                <div className="flex items-center gap-2">
                  {isSpeaking && !isSpeechPaused && (
                    <button
                      type="button"
                      onClick={handleVocalPause}
                      className="p-3 bg-neutral-900/40 border border-white/5 rounded-xl hover:text-white"
                      title="Pause speech"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isSpeaking && isSpeechPaused && (
                    <button
                      type="button"
                      onClick={handleVocalResume}
                      className="p-3 bg-neutral-900/40 border border-white/5 rounded-xl hover:text-white"
                      title="Resume speech"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleVocalStop}
                    className="p-3 bg-red-950/20 text-red-400 border border-red-500/10 rounded-xl hover:border-red-500/25 transition-all"
                    title="Stop speech synthetics"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Two-way dynamic conversational JARVIS interface */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs uppercase tracking-widest text-white font-bold">2-Way Celestial Comm-Link</h3>
              </div>
              <span className="text-[9px] text-indigo-400 font-semibold font-mono tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase">Live Link</span>
            </div>

            <div className="p-6 bg-gradient-to-b from-stone-900/30 to-black/60 border border-white/10 rounded-[2.25rem] space-y-4 shadow-xl">
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-xs font-mono font-light leading-relaxed text-indigo-200/90 relative overflow-hidden min-h-[6.5rem]">
                <div className="text-[8px] text-stone-600 uppercase tracking-widest font-bold mb-1 border-b border-white/5 pb-1 flex items-center justify-between">
                  <span>JARVIS Output</span>
                  {isJarvisThinking && <span className="animate-pulse text-indigo-400">Processing Synaptic matrix...</span>}
                </div>
                <span>"{jarvisResponseText}"</span>
              </div>

              {/* Input forms segment */}
              <form onSubmit={handleJarvisSubmit} className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVoiceListeningInput}
                  disabled={isListening}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                    isListening 
                      ? 'bg-red-500/20 border-red-400 text-red-300 animate-ping' 
                      : 'bg-indigo-500/10 border-indigo-100/10 text-indigo-400 hover:border-indigo-400/30'
                  }`}
                  title="Speak parameters"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input 
                  type="text" 
                  value={jarvisQuery}
                  onChange={(e) => setJarvisQuery(e.target.value)}
                  placeholder="Ask JARVIS (e.g., Analyze my natal aspects...)"
                  className="flex-grow py-3 px-4 bg-black/60 font-mono text-[11px] rounded-xl border border-white/5 placeholder-stone-600 text-white focus:outline-none focus:border-indigo-500/40"
                  disabled={isJarvisThinking}
                />

                <button
                  type="submit"
                  disabled={!jarvisQuery.trim() || isJarvisThinking}
                  className="p-3 bg-white text-black hover:bg-stone-200 disabled:opacity-40 rounded-xl transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {isListening && (
                <div className="text-[10px] text-red-400 animate-pulse text-center tracking-wider font-mono uppercase bg-red-950/10 py-1.5 border border-red-500/10 rounded-xl">
                  🎙️ Holographic Voice Link active. Speak your question parameters...
                </div>
              )}
            </div>
          </div>

          <div className="border border-white/10 bg-neutral-900/20 p-5 rounded-[1.75rem] relative overflow-hidden">
            <div className="flex gap-3 items-start">
              <Info className="w-4.5 h-4.5 text-stone-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Deep Synthesis Oracle Access</span>
                <p className="text-[10px] text-stone-500 font-light leading-relaxed">
                  Your local calculations are synchronized. Initiate real-time speak options or connect vocal links to study the Swiss Ephemeris grid values.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
