import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Bot, 
  Send, 
  X, 
  Volume2, 
  VolumeX, 
  Activity, 
  Maximize2, 
  Minimize2, 
  Cpu, 
  RefreshCw, 
  User, 
  ShieldAlert, 
  Zap, 
  Compass, 
  Coins, 
  Flame, 
  Droplet, 
  Wind, 
  Layers
} from 'lucide-react';
import { fetchTarotAgentResponse } from '../services/geminiService';
import { useHigherMind } from './HigherMindProvider';
import { soundEngine } from '../lib/soundEffects';

interface DailyTarotPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TarotCard {
  id: string;
  name: string;
  num: number;
  roman: string;
  element: 'Air' | 'Water' | 'Fire' | 'Earth' | 'Aether';
  keyword: string;
  frequency: string;
  shortDesc: string;
  metricLabel: string;
}

const DAILY_CARDS: TarotCard[] = [
  { id: 'fool', name: 'The Fool', num: 0, roman: '0', element: 'Air', keyword: 'Infinite Leap & Void potential', frequency: '396Hz', shortDesc: 'The cosmic step into the completely uncharted space, discarding fear.', metricLabel: 'Pure Intention' },
  { id: 'magician', name: 'The Magician', num: 1, roman: 'I', element: 'Air', keyword: 'Conscious Manifest Force', frequency: '528Hz', shortDesc: 'Translating spiritual thoughts directly into physical reality.', metricLabel: 'Focal Control' },
  { id: 'high_priestess', name: 'The High Priestess', num: 2, roman: 'II', element: 'Water', keyword: 'Mysterious Silent Blueprint', frequency: '741Hz', shortDesc: 'Tuning into the hidden currents below the physical surface.', metricLabel: 'Intuitive Focus' },
  { id: 'empress', name: 'The Empress', num: 3, roman: 'III', element: 'Earth', keyword: 'Infinite孕育 Abundant Gestation', frequency: '639Hz', shortDesc: 'Letting your physical projects organic gestation in perfect cycles.', metricLabel: 'Synthesis Rate' },
  { id: 'emperor', name: 'The Emperor', num: 4, roman: 'IV', element: 'Fire', keyword: 'Strategic Geometry & Structural Might', frequency: '174Hz', shortDesc: 'Erecting solid personal boundaries to structuralize exploration.', metricLabel: 'Structural Order' },
  { id: 'hierophant', name: 'The Hierophant', num: 5, roman: 'V', element: 'Earth', keyword: 'Traditional Pillars of Ancient Gnosis', frequency: '28)Hz', shortDesc: 'Accessing the deep, trans-generational line of cosmic knowledge.', metricLabel: 'Pillar Sync' },
  { id: 'lovers', name: 'The Lovers', num: 6, roman: 'VI', element: 'Air', keyword: 'Attraction Resonance & Divine Duality', frequency: '528Hz', shortDesc: 'Aligned choices echoing throughout the emotional landscape.', metricLabel: 'Resonant Union' },
  { id: 'chariot', name: 'The Chariot', num: 7, roman: 'VII', element: 'Water', keyword: 'Sovereign Control & Focus Direction', frequency: '417Hz', shortDesc: 'Guarding opposite elemental forces with sheer intent to move forward.', metricLabel: 'Thrust Potential' },
  { id: 'strength', name: 'Strength', num: 8, roman: 'VIII', element: 'Fire', keyword: 'Compassionate Lion Mastery', frequency: '852Hz', shortDesc: 'Integrating your shadow wild beast through loving understanding.', metricLabel: 'Mental Fortitude' },
  { id: 'hermit', name: 'The Hermit', num: 9, roman: 'IX', element: 'Earth', keyword: 'Inner Lighthouse Sparking Null State', frequency: '963Hz', shortDesc: 'Withdrawing physical senses into the silence to retrieve ancient scrolls.', metricLabel: 'Solitude Vector' },
  { id: 'wheel', name: 'Wheel of Fortune', num: 10, roman: 'X', element: 'Fire', keyword: 'Karmic Cycles of Cosmic Calibration', frequency: '432Hz', shortDesc: 'Synchronizing with the rhythmic turns of galactic pathways.', metricLabel: 'Calibrative Sync' },
  { id: 'justice', name: 'Justice', num: 11, roman: 'XI', element: 'Air', keyword: 'Geometric Equilibrium of Cause-Effect', frequency: '528Hz', shortDesc: 'Perfect spatial feedback where every action balance itself out.', metricLabel: 'Equilibrium Coefficient' },
  { id: 'star', name: 'The Star', num: 17, roman: 'XVII', element: 'Air', keyword: 'Celestial Luminary of Clear Vision', frequency: '852Hz', shortDesc: 'Pouring ethereal waters onto the landscape of hope and regeneration.', metricLabel: 'Luminary Brightness' },
  { id: 'moon', name: 'The Moon', num: 18, roman: 'XVIII', element: 'Water', keyword: 'Underworld Dream Navigation Matrix', frequency: '417Hz', shortDesc: 'Exploring shadowy corridors without fear of illusion.', metricLabel: 'Astral Intensity' },
  { id: 'sun', name: 'The Sun', num: 19, roman: 'XIX', element: 'Fire', keyword: 'Radiant Vitality & Golden Awakening', frequency: '528Hz', shortDesc: 'Absolute clearance of shadow, charging cells with supreme warmth.', metricLabel: 'Solar Output' },
  { id: 'world', name: 'The World', num: 21, roman: 'XXI', element: 'Earth', keyword: 'Spherical Completion of Galactic Loop', frequency: '963Hz', shortDesc: 'Complete graduation of lesson loops, unifying seeker and cosmic space.', metricLabel: 'Unification Rate' }
];

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const DailyTarotPopup: React.FC<DailyTarotPopupProps> = ({ isOpen, onClose }) => {
  const { cosmicData } = useHigherMind();
  const [isDrawing, setIsDrawing] = useState(false);
  const [card, setCard] = useState<TarotCard | null>(null);
  const [meaning, setMeaning] = useState<string>('');
  const [manifestPath, setManifestPath] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);

  // Chat agent fields
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);

  // Holographic 3D card tilt values
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAgentLoading]);

  // Load daily drawing state from localStorage if exists
  useEffect(() => {
    if (isOpen) {
      soundEngine.open();
      const savedCardId = localStorage.getItem('daily_tarot_card_id');
      const savedMeaning = localStorage.getItem('daily_tarot_meaning');
      const savedPath = localStorage.getItem('daily_tarot_path');
      const savedDate = localStorage.getItem('daily_tarot_date');
      const today = new Date().toDateString();

      if (savedCardId && savedMeaning && savedPath && savedDate === today) {
        const found = DAILY_CARDS.find(c => c.id === savedCardId);
        if (found) {
          setCard(found);
          setMeaning(savedMeaning);
          setManifestPath(savedPath);
        }
      }
    }
  }, [isOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Map bounds to max 15 degrees tilt
    setTilt({
      x: -(y / rect.height) * 15,
      y: (x / rect.width) * 15,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleDrawCard = async () => {
    if (isDrawing) return;
    soundEngine.click();
    setIsDrawing(true);
    setCard(null);
    setMeaning('');
    setManifestPath('');

    let iterations = 15;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * DAILY_CARDS.length);
      setCard(DAILY_CARDS[idx]);
      soundEngine.tick();
      iterations--;
      if (iterations <= 0) {
        clearInterval(interval);
        executeRealGnosisDraw();
      }
    }, 100);
  };

  const executeRealGnosisDraw = async () => {
    const finalCard = DAILY_CARDS[Math.floor(Math.random() * DAILY_CARDS.length)];
    setCard(finalCard);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetchTarotGnosis',
          payload: {
            cardName: finalCard.name,
            archetype: 'Daily Integration Aura',
            cosmicData
          }
        })
      });

      const body = await response.json();
      const drawnMeaning = body.meaning || finalCard.shortDesc;
      const drawnPath = body.manifestationPath || 'Calibrate intention with your quantum matrix.';

      setMeaning(drawnMeaning);
      setManifestPath(drawnPath);

      // Save to daily state so it doesn't change on refresh
      localStorage.setItem('daily_tarot_card_id', finalCard.id);
      localStorage.setItem('daily_tarot_meaning', drawnMeaning);
      localStorage.setItem('daily_tarot_path', drawnPath);
      localStorage.setItem('daily_tarot_date', new Date().toDateString());

      soundEngine.success();
      soundEngine.magic();
      
      // Auto-vocalize
      vocalizeOracle(`Your Daily Calibration Card is ${finalCard.name}. ${drawnMeaning}`);

    } catch (err) {
      console.error(err);
      setMeaning(finalCard.shortDesc);
      setManifestPath('Align with immediate cellular awareness and breathe.');
      soundEngine.success();
    } finally {
      setIsDrawing(false);
    }
  };

  const vocalizeOracle = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voicesList = window.speechSynthesis.getVoices();
    const voiceSelected = voicesList.find(v => v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Male') || v.lang.startsWith('en')) || voicesList[0];
    
    if (voiceSelected) {
      utterance.voice = voiceSelected;
    }
    utterance.pitch = 0.95;
    utterance.rate = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleVocalizer = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      soundEngine.deactivate();
    } else if (card && meaning) {
      soundEngine.click();
      vocalizeOracle(`Daily tarot frequency drawn: ${card.name}. Divine meaning: ${meaning}. Calibration target: ${manifestPath}`);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !card || isAgentLoading) return;
    soundEngine.click();

    const userMsgText = chatInput;
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: userMsgText,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAgentLoading(true);

    try {
      // Map previous chat messages to the format expected by the API
      const historyPayload = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const body = await fetchTarotAgentResponse(
        userMsgText,
        card.name,
        meaning,
        manifestPath,
        cosmicData,
        historyPayload
      );

      const agentReply: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        text: body.text || 'The astral lines are fluctuating. Please repeat your query.',
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, agentReply]);
      soundEngine.select();
    } catch (err) {
      console.error(err);
      const errReply: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        text: 'Autonomous uplink experienced quantum interference. Retrying the sync is recommended.',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errReply]);
      soundEngine.error();
    } finally {
      setIsAgentLoading(false);
    }
  };

  const handleClose = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    soundEngine.close();
    onClose();
  };

  if (!isOpen) return null;

  const elementColors: Record<string, string> = {
    Air: 'text-cyan-400 border-cyan-500/30 shadow-cyan-500/20 bg-cyan-950/20',
    Water: 'text-blue-400 border-blue-500/30 shadow-blue-500/20 bg-blue-950/20',
    Fire: 'text-amber-500 border-amber-500/30 shadow-amber-500/20 bg-amber-950/20',
    Earth: 'text-emerald-400 border-emerald-500/30 shadow-emerald-500/20 bg-emerald-950/20',
    Aether: 'text-purple-400 border-purple-500/30 shadow-purple-500/20 bg-purple-950/20'
  };

  const currentColors = card ? elementColors[card.element] : 'text-zinc-400 border-zinc-500/20 shadow-zinc-500/10 bg-zinc-900/10';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full max-w-6xl min-h-[580px] bg-stone-950 border border-hud-cyan/20 rounded-[2.5rem] shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden font-orbitron"
        >
          {/* Grid visual accents */}
          <div className="absolute inset-0 pointer-events-none opacity-4 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px]" />
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-hud-cyan/10 to-transparent pointer-events-none" />

          {/* Golden Corner Accents */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-hud-cyan/50 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-hud-cyan/50 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-hud-cyan/50 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-hud-cyan/50 rounded-br-lg pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-hud-cyan/10 px-8 py-5">
            <div className="flex items-center gap-3">
              <Sparkles className="text-hud-cyan animate-pulse" size={20} />
              <div>
                <h1 className="text-sm font-bold tracking-[0.25em] text-white uppercase leading-none">
                  JARVIS A.O.S. // Tarot Calibration
                </h1>
                <span className="text-[9px] text-hud-cyan/40 tracking-wider">
                  AUTONOMOUS FREQUENCY ALIGNMENT FIELD
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-hud-cyan/5 border border-hud-cyan/20 rounded-lg text-[9.5px] text-hud-cyan/80">
                <span className="w-1.5 h-1.5 rounded-full bg-hud-cyan animate-ping" />
                DREAM GRID HYPER-STABLE
              </div>
              <button
                onClick={handleClose}
                className="p-1 px-2.5 rounded-lg border border-hud-red/20 text-hud-red/80 hover:bg-hud-red/10 transition-colors"
                title="Deactivate system link"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Main Visual Panels */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 overflow-y-auto">
            
            {/* Left Col: The holographic rotating card deck */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 border border-white/5 bg-white/[0.01] rounded-3xl relative overflow-hidden min-h-[380px]">
              
              <AnimatePresence mode="wait">
                {!card && !isDrawing ? (
                  // Deck Draw State
                  <motion.div
                    key="draw-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6 text-center cursor-pointer group"
                    onClick={handleDrawCard}
                  >
                    {/* Back Card Stack Graphic */}
                    <div className="relative w-48 h-72">
                      <div className="absolute inset-0 bg-stone-900 border border-hud-cyan/10 rounded-2xl transform rotate-3 scale-95" />
                      <div className="absolute inset-0 bg-stone-900 border border-hud-cyan/20 rounded-2xl transform -rotate-3 scale-95" />
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 to-black border border-hud-cyan/40 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.1)] group-hover:border-hud-cyan ease-out transform group-hover:scale-105 duration-300">
                        <Cpu className="text-hud-cyan/40 animate-pulse w-10 h-10" />
                        <span className="text-[10px] text-hud-cyan/40 font-mono tracking-[0.3em] uppercase">ARCANA CORE</span>
                        
                        <div className="absolute inset-x-2 bottom-5 border-t border-dashed border-hud-cyan/10 pt-2 text-[8px] font-mono text-white/30 tracking-widest leading-none">
                          REF: LUNAR CHRONOS
                        </div>
                      </div>
                    </div>

                    <button className="px-5 py-2.5 bg-hud-cyan/25 border border-hud-cyan/50 text-hud-cyan rounded-xl text-xs uppercase tracking-[0.2em] font-bold group-hover:bg-hud-cyan group-hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                      Draw Daily Tarot Calibration
                    </button>
                    <p className="text-[9px] text-white/30 font-mono tracking-wider max-w-[240px]">
                      Engages the Stark Telemetry Uplink to synchronize your aura cells.
                    </p>
                  </motion.div>
                ) : isDrawing ? (
                  // Fast stream drawing state
                  <motion.div
                    key="drawing-loader"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-48 h-72 rounded-2xl border-2 border-dashed border-hud-cyan/50 flex flex-col items-center justify-center bg-hud-cyan/5 animate-pulse relative overflow-hidden">
                      <RefreshCw className="animate-spin text-hud-cyan w-12 h-12" />
                      <span className="text-xs text-hud-cyan tracking-[0.2em] font-extrabold mt-4 animate-pulse">
                        SCANNING CORE...
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  // Active Card Render with tilt & beautiful visuals
                  <motion.div
                    key="active-draw"
                    initial={{ scale: 0.85, opacity: 0, rotateY: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="flex flex-col items-center gap-6"
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  >
                    <div className={`relative w-52 h-80 rounded-2xl border bg-gradient-to-b from-stone-900 to-black p-4 flex flex-col justify-between shadow-2xl overflow-hidden group border-hud-cyan`}>
                      
                      {/* Interactive glare reflection overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                      {/* Header metrics */}
                      <div className="flex items-center justify-between text-[10px] font-mono tracking-widest border-b border-white/5 pb-1.5">
                        <span className="text-white/40 uppercase">NO. {card?.roman}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border border-hud-cyan bg-hud-cyan/10 text-hud-cyan `}>
                          {card?.element}
                        </span>
                      </div>

                      {/* Card Graphic visual core */}
                      <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
                        {/* Glowing radial backplate */}
                        <div className="absolute w-24 h-24 rounded-full bg-hud-cyan/5 blur-xl pointer-events-none animate-pulse" />
                        
                        <div className="relative text-center select-none">
                          <span className="font-serif italic text-white/5 text-[5rem] block leading-none font-bold">
                            {card?.roman}
                          </span>
                          <span className="text-lg font-bold text-white tracking-widest mt-2 block font-share">
                            {card?.name}
                          </span>
                        </div>
                      </div>

                      {/* Bottom values */}
                      <div className="border-t border-white/5 pt-1.5 flex justify-between items-center font-mono text-[9px]">
                        <span className="text-white/40">CALIBRATION FREQ</span>
                        <span className="text-hud-cyan font-bold">{card?.frequency}</span>
                      </div>
                    </div>

                    {/* Quick Statistics telemetry view below drawn card */}
                    <div className="w-full grid grid-cols-2 gap-3 max-w-sm mt-2 font-mono text-[10px]">
                      <div className="p-2 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col justify-center">
                        <span className="text-[8px] text-white/40 uppercase">Aura Resonance</span>
                        <span className="text-xs font-bold text-hud-cyan">98.2% calibrated</span>
                      </div>
                      <div className="p-2 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col justify-center">
                        <span className="text-[8px] text-white/40 uppercase">{card?.metricLabel}</span>
                        <span className="text-xs font-bold text-hud-violet">High Harmonic</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleDrawCard}
                        className="p-2 rounded-xl border border-white/10 hover:border-hud-cyan text-white/60 hover:text-white transition-all text-xs flex items-center gap-1.5 font-mono"
                        title="Reset daily calibration"
                      >
                        <RefreshCw size={13} />
                        Recalibrate
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Col: Details / Intelligent Oracle conversation agent */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Meaning card review panel */}
              {card && meaning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 border border-hud-cyan/10 bg-hud-cyan/[0.02] rounded-3xl flex flex-col gap-3 font-share relative"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={toggleVocalizer}
                      className={`p-2 rounded-xl transition-all ${isSpeaking ? 'bg-hud-red/20 text-hud-red animate-pulse' : 'bg-hud-cyan/15 text-hud-cyan hover:bg-hud-cyan/35'}`}
                      title={isSpeaking ? 'Stop voice readout' : 'AOS Vocal readout'}
                    >
                      {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                  </div>

                  <span className="text-[10px] font-mono tracking-[0.25em] text-hud-cyan uppercase">
                    DIVINE COGNITION VECTOR
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-widest">{card.name} / Oracle Guidance</h2>
                  
                  <p className="text-xs text-stone-300 leading-relaxed font-light mt-1 text-justify">
                    {meaning}
                  </p>

                  <div className="border-t border-white/5 mt-2 pt-3 flex flex-col gap-1.5 font-mono text-[10px]">
                    <span className="text-[8px] uppercase tracking-widest text-hud-violet">Stark Manifestation Pathway</span>
                    <p className="text-xs text-hud-violet/90 font-light leading-relaxed">
                      {manifestPath}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Chat section container */}
              {card && meaning && (
                <div className="flex-1 flex flex-col border border-white/5 bg-white/[0.015] rounded-3xl overflow-hidden min-h-[290px]">
                  
                  {/* Chat Header */}
                  <div className="border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                      <Bot size={15} className="text-hud-cyan" />
                      <div>
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                          Uplink: Astraea Oracle Agent
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                          <span className="text-[8px] text-zinc-500 uppercase">Interactive Dialogue Standby</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-white/70 uppercase tracking-widest hover:text-white transition-all font-mono"
                    >
                      {isChatOpen ? 'Collapse Terminal' : 'Engage Agent Chat'}
                    </button>
                  </div>

                  {/* Messaging Panel or Prompt to Engage */}
                  {!isChatOpen ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                      <Bot size={32} className="text-hud-cyan/40 animate-bounce" />
                      <p className="text-xs text-white/60 tracking-wider max-w-[340px]">
                        Have specific inquiries regarding how <strong className="text-hud-cyan">{card.name}</strong> aligns with your life trajectory or current transits?
                      </p>
                      <button
                        onClick={() => {
                          setIsChatOpen(true);
                          soundEngine.magic();
                        }}
                        className="px-4 py-2 bg-hud-cyan/10 border border-hud-cyan/35 text-hud-cyan rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-hud-cyan/25 transition-all mt-1"
                      >
                        Initiate 2-Way Gnosis Scan
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      
                      {/* Messages scroll content */}
                      <div 
                        ref={chatScrollRef}
                        className="flex-1 overflow-y-auto px-5 py-4 space-y-4 max-h-[190px] text-xs leading-normal font-sans"
                      >
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-zinc-500 py-4 italic font-sans font-light text-[11px]">
                            Connection established with Astraea. Ask questions like: "What is the shadow warning here?" or "How does this relate to my love path today?"
                          </div>
                        ) : (
                          chatMessages.map(msg => (
                            <div 
                              key={msg.id} 
                              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              {msg.role !== 'user' && (
                                <div className="w-6 h-6 rounded-lg bg-hud-cyan/10 border border-hud-cyan/30 flex items-center justify-center text-hud-cyan flex-shrink-0 font-mono text-[9px]">
                                  AS
                                </div>
                              )}
                              
                              <div className={`p-3 rounded-2xl max-w-[85%] border font-light ${msg.role === 'user' ? 'bg-hud-cyan/10 border-hud-cyan/30 text-white rounded-br-none' : 'bg-stone-900/50 border-white/5 text-stone-200 rounded-bl-none'}`}>
                                <p className="leading-relaxed whitespace-pre-line text-[11px]">{msg.text}</p>
                              </div>

                              {msg.role === 'user' && (
                                <div className="w-6 h-6 rounded-lg bg-hud-violet/10 border border-hud-violet/30 flex items-center justify-center text-hud-violet flex-shrink-0 font-mono text-[9px]">
                                  ME
                                </div>
                              )}
                            </div>
                          ))
                        )}

                        {isAgentLoading && (
                          <div className="flex gap-2.5 justify-start">
                            <div className="w-6 h-6 rounded-lg bg-hud-cyan/10 border border-hud-cyan/30 flex items-center justify-center text-hud-cyan flex-shrink-0 animate-spin font-mono text-[9px]">
                              ●
                            </div>
                            <div className="p-3 bg-stone-900/50 border border-white/5 rounded-2xl rounded-bl-none text-[11px] text-zinc-500 animate-pulse">
                              Oracle analyzing temporal coordinates...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input row */}
                      <div className="p-3 border-t border-white/5 bg-stone-950 flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendChatMessage();
                          }}
                          placeholder="Decrypt further arcana layers..."
                          className="flex-1 bg-stone-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-hud-cyan font-mono"
                        />
                        <button
                          onClick={handleSendChatMessage}
                          disabled={!chatInput.trim() || isAgentLoading}
                          className="p-2.5 px-4 bg-hud-cyan hover:bg-hud-cyan/85 disabled:bg-hud-cyan/20 text-black leading-none font-bold rounded-xl transition-all"
                        >
                          <Send size={14} />
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* Welcome card if card is not drew yet */}
              {!card && !isDrawing && (
                <div className="p-8 border border-white/5 bg-white/[0.01] rounded-3xl flex flex-col justify-center gap-3 text-center text-zinc-400 font-sans font-light text-xs">
                  <Compass className="text-hud-cyan mx-auto w-12 h-12 stroke-[1px] animate-spin-slow mb-2" />
                  <p className="max-w-[360px] mx-auto leading-relaxed">
                    "Every layout drew in the Stark matrix represents some quantum coordinates of your life trajectory. Let's calibrate your daily resonance."
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* Footer bar status */}
          <div className="border-t border-white/5 px-8 py-4 bg-stone-950 font-mono text-[9.5px] text-white/40 flex justify-between items-center bg-black/50">
            <span>SECURE SYSTEM: STARK-MATRIX v4.2 / ASTRAL CONSCIOUSNESS ENGAGED</span>
            <span>COHERENCE CALIBRATION RATE: 99.85%</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
