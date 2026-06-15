import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Layers, 
  Zap, 
  Compass, 
  Activity, 
  Brain,
  Search,
  RefreshCw,
  Eye,
  Tornado,
  Waves,
  Square,
  History
} from 'lucide-react';
import { CosmicData } from '../types';

interface TarotCard {
  id: string;
  name: string;
  num: number;
  roman: string;
  element: string;
  keyword: string;
}

const CARDS: TarotCard[] = [
  { id: 'fool', name: 'The Fool', num: 0, roman: '0', element: 'Air', keyword: 'New Beginnings' },
  { id: 'magician', name: 'The Magician', num: 1, roman: 'I', element: 'Air', keyword: 'Manifestation' },
  { id: 'high_priestess', name: 'The High Priestess', num: 2, roman: 'II', element: 'Water', keyword: 'Intuition' },
  { id: 'empress', name: 'The Empress', num: 3, roman: 'III', element: 'Earth', keyword: 'Abundance' },
  { id: 'emperor', name: 'The Emperor', num: 4, roman: 'IV', element: 'Fire', keyword: 'Authority' },
  { id: 'hierophant', name: 'The Hierophant', num: 5, roman: 'V', element: 'Earth', keyword: 'Tradition' },
  { id: 'lovers', name: 'The Lovers', num: 6, roman: 'VI', element: 'Air', keyword: 'Choice' },
  { id: 'chariot', name: 'The Chariot', num: 7, roman: 'VII', element: 'Water', keyword: 'Control' },
  { id: 'strength', name: 'Strength', num: 8, roman: 'VIII', element: 'Fire', keyword: 'Courage' },
  { id: 'hermit', name: 'The Hermit', num: 9, roman: 'IX', element: 'Earth', keyword: 'Solitude' },
  { id: 'wheel_of_fortune', name: 'Wheel of Fortune', num: 10, roman: 'X', element: 'Fire', keyword: 'Cycles' },
  { id: 'justice', name: 'Justice', num: 11, roman: 'XI', element: 'Air', keyword: 'Balance' },
  { id: 'hanged_man', name: 'The Hanged Man', num: 12, roman: 'XII', element: 'Water', keyword: 'Surrender' },
  { id: 'death', name: 'Death', num: 13, roman: 'XIII', element: 'Water', keyword: 'Transition' },
  { id: 'temperance', name: 'Temperance', num: 14, roman: 'XIV', element: 'Fire', keyword: 'Alchemization' },
  { id: 'devil', name: 'The Devil', num: 15, roman: 'XV', element: 'Earth', keyword: 'Shadow' },
  { id: 'tower', name: 'The Tower', num: 16, roman: 'XVI', element: 'Fire', keyword: 'Upheaval' },
  { id: 'star', name: 'The Star', num: 17, roman: 'XVII', element: 'Air', keyword: 'Hope' },
  { id: 'moon', name: 'The Moon', num: 18, roman: 'XVIII', element: 'Water', keyword: 'Dreams' },
  { id: 'sun', name: 'The Sun', num: 19, roman: 'XIX', element: 'Fire', keyword: 'Vitality' },
  { id: 'judgement', name: 'Judgement', num: 20, roman: 'XX', element: 'Fire', keyword: 'Awakening' },
  { id: 'world', name: 'The World', num: 21, roman: 'XXI', element: 'Earth', keyword: 'Completion' },
];

interface TarotHologramProps {
  cosmicData: CosmicData | null;
}

export const TarotHologram: React.FC<TarotHologramProps> = ({ cosmicData }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCard, setCurrentCard] = useState<TarotCard | null>(null);
  const [aiGnosis, setAiGnosis] = useState<any>(null);
  const [isLoadingGnosis, setIsLoadingGnosis] = useState(false);
  const [archetype, setArchetype] = useState('The Fool'); // User specified basis
  const [isSpeaking, setIsSpeaking] = useState(false);

  const vocalizeGnosis = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a premium voice (usually David, Daniel, or another high-tech voice if available)
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Male')) || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;
    utterance.pitch = 0.85;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const drawCard = async () => {
    setIsDrawing(true);
    setAiGnosis(null);
    vocalizeGnosis("Scanning spiritual frequencies and calibrating the arcana matrix. One moment, Seeker.");
    const random = CARDS[Math.floor(Math.random() * CARDS.length)];
    
    // Animate drawing
    setTimeout(() => {
      setCurrentCard(random);
      setIsDrawing(false);
      fetchAIInterpretation(random);
    }, 1500);
  };

  const fetchAIInterpretation = async (card: TarotCard) => {
    setIsLoadingGnosis(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetchTarotGnosis',
          payload: {
            cardName: card.name,
            archetype: archetype,
            cosmicData
          }
        })
      });
      const data = await response.json();
      setAiGnosis(data);
      vocalizeGnosis(`The ${card.name} has emerged. ${data.meaning}`);
    } catch (err) {
      console.error("Gnosis acquisition failure:", err);
    } finally {
      setIsLoadingGnosis(false);
    }
  };

  const resetMatrix = () => {
    window.speechSynthesis.cancel();
    setCurrentCard(null);
    setAiGnosis(null);
  };

  return (
    <div className="w-full h-full min-h-[700px] bg-zinc-950/20 rounded-[3rem] border border-cyan-500/20 backdrop-blur-3xl p-8 flex flex-col items-center relative overflow-hidden group">
      
      {/* Holographic Scanlines & Noise */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />
      
      {/* Dynamic Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

      {/* Header HUD */}
      <header className="z-10 w-full flex justify-between items-start mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tornado className="text-cyan-400 w-5 h-5 animate-spin-slow" />
            <h2 className="text-2xl font-bold text-white tracking-[0.2em] uppercase font-mono italic">Tarot Matrix v4.0</h2>
          </div>
          <p className="text-[10px] text-cyan-300/40 uppercase tracking-[0.4em] font-mono">Autonomous Esoteric Logic Engine // JARVIS Core</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center gap-2 backdrop-blur-md">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            <span className="text-[9px] text-cyan-200 font-mono uppercase tracking-widest">Quantum Link: ACTIVE</span>
          </div>
          <div className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest">Ref. Archetype: {archetype}</div>
        </div>
      </header>

      {/* Main Interaction Area */}
      <div className="z-10 flex-1 w-full flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl">
        
        {/* Left Side: 3D Holographic Card Display */}
        <div className="relative w-72 h-[450px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!currentCard && !isDrawing ? (
              <motion.div
                key="deck"
                initial={{ opacity: 0, rotateY: 45 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="relative group cursor-pointer"
                onClick={drawCard}
              >
                {/* 3D Stack Effect */}
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute inset-0 bg-zinc-900 border border-cyan-500/20 rounded-2xl shadow-2xl"
                    style={{ transform: `translateZ(${-i * 10}px) translateY(${-i * 2}px)` }}
                  />
                ))}
                <div className="w-64 h-96 bg-gradient-to-br from-zinc-900 to-black border-2 border-cyan-500/40 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden group-hover:border-cyan-400 transition-colors">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)]" />
                   <Sparkles className="w-12 h-12 text-cyan-500/50 group-hover:scale-110 group-hover:text-cyan-400 transition-all" />
                   <span className="text-[10px] text-cyan-300 font-mono tracking-[0.3em] uppercase opacity-50">Initiate Draw</span>
                </div>
              </motion.div>
            ) : isDrawing ? (
              <motion.div 
                key="drawing"
                className="flex flex-col items-center gap-8"
              >
                <div className="relative w-48 h-48">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 border-4 border-dashed border-cyan-500/30 rounded-full"
                   />
                   <motion.div 
                     animate={{ rotate: -360 }}
                     transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-4 border border-purple-500/20 rounded-full"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <RefreshCw className="text-cyan-500 animate-spin w-10 h-10" />
                   </div>
                </div>
                <span className="text-xs text-cyan-400 font-mono tracking-[0.4em] uppercase animate-pulse italic">Accessing Akashic Streams...</span>
              </motion.div>
            ) : (
              <motion.div
                key="active_card"
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                className="relative"
              >
                <div className="w-72 h-[450px] bg-zinc-900/90 border-2 border-cyan-500/60 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,213,0.2)] flex flex-col items-center p-6 backdrop-blur-xl relative">
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-cyan-500 italic opacity-50">#{currentCard?.num}</div>
                  
                  {/* Card Icon/Visual Placeholder */}
                  <div className="w-full aspect-[2/3] bg-gradient-to-b from-cyan-500/5 to-transparent border border-cyan-500/10 rounded-2xl mb-6 flex items-center justify-center relative group">
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <Compass className="w-20 h-20 text-cyan-400 animate-pulse group-hover:scale-110 transition-transform" />
                    
                    {/* Floating HUD info */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                       <span className="text-[9px] font-mono text-cyan-300/60 uppercase">{currentCard?.element}</span>
                       <span className="text-[9px] font-mono text-cyan-300/60 uppercase">{currentCard?.roman}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white tracking-widest uppercase mb-2 font-mono italic decoration-cyan-500 underline underline-offset-8">
                    {currentCard?.name}
                  </h3>
                  <p className="text-xs text-cyan-300/40 uppercase tracking-widest font-mono mb-8 italic">
                    {currentCard?.keyword}
                  </p>

                  <div className="mt-auto flex flex-col gap-3 w-full">
                    <button 
                      onClick={resetMatrix}
                      className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 hover:text-cyan-400 font-mono uppercase tracking-[0.2em] transition-colors bg-white/5 py-2 rounded-xl border border-white/10"
                    >
                      <RefreshCw size={12} />
                      Reset Matrix
                    </button>
                    {isSpeaking && (
                      <button 
                        onClick={() => window.speechSynthesis.cancel()}
                        className="flex items-center justify-center gap-2 text-[10px] text-rose-500 hover:text-rose-400 font-mono uppercase tracking-[0.2em] transition-colors bg-rose-500/10 py-2 rounded-xl border border-rose-500/20"
                      >
                        <Square size={12} fill="currentColor" />
                        Silence Voice
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: AI Gnosis Terminal */}
        <div className="flex-1 w-full max-w-md bg-zinc-900/40 border border-cyan-500/10 rounded-[2rem] p-8 backdrop-blur-2xl relative min-h-[400px]">
          <div className="flex items-center gap-3 mb-6 border-b border-cyan-500/20 pb-4">
             <Brain className="text-purple-400 w-5 h-5" />
             <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.4em]">Esoteric Logic Analysis</h4>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isLoadingGnosis ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                  <div className="h-20 w-full bg-white/5 rounded animate-pulse mt-8" />
                </motion.div>
              ) : aiGnosis ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-[10px] text-cyan-400 mb-2">
                        <Waves size={12} />
                        <span>Quantum Resonance: {aiGnosis.quantumFrequency}</span>
                     </div>
                     <p className="text-sm text-zinc-300 leading-relaxed font-mono italic">
                        {aiGnosis.meaning}
                     </p>
                  </div>

                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                       <Zap className="text-amber-400 w-3 h-3" />
                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Manifestation Vector</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-snug">
                       {aiGnosis.manifestationPath}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-48 opacity-30 gap-4"
                >
                   <Search className="w-8 h-8 text-cyan-500" />
                   <p className="text-[10px] text-cyan-300 font-mono text-center uppercase tracking-widest">Awaiting spatial input... Initiate draw to engage AI</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="z-10 w-full mt-12 flex justify-between items-center px-4">
         <div className="flex gap-6">
            <div className="flex flex-col gap-1">
               <span className="text-[8px] text-zinc-600 font-mono uppercase">User Bio-Sign</span>
               <span className="text-[9px] text-zinc-400 font-mono uppercase">{cosmicData?.nameAnalysis?.full || 'IDENT_UNKNOWN'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[8px] text-zinc-600 font-mono uppercase">Session Latency</span>
               <span className="text-[9px] text-zinc-400 font-mono uppercase">0.42ms</span>
            </div>
         </div>

         <div className="flex items-center gap-1.5 opacity-40">
            <History className="w-3 h-3" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Log History: EMPTY</span>
         </div>
      </footer>
    </div>
  );
};
