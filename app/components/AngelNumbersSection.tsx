import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Search, Volume2, Sparkles, BookOpen, Fingerprint, Activity, Layers, Plus, Info, Zap, RefreshCw } from 'lucide-react';
import { CosmicData } from '../types';
import { fetchAngelNumberInsight } from '../services/geminiService';

interface AngelNumbersSectionProps {
  cosmicData: CosmicData | null;
}

export const AngelNumbersSection = ({ cosmicData }: AngelNumbersSectionProps) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'research' | 'gematria'>('research');
  const [gematriaInput, setGematriaInput] = useState('');
  const [gematriaSystem, setGematriaSystem] = useState<'standard' | 'pythagorean' | 'ascii'>('standard');
  const [history, setHistory] = useState<{word: string, value: number, system: string}[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gematria_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const ANGEL_CORRELATIONS: Record<number, { title: string, hint: string }> = {
    11: { title: "Master Number: The Illuminator", hint: "Spiritual awakening, intuition, and enlightenment." },
    22: { title: "Master Number: The Architect", hint: "Turning dreams into reality, cosmic discipline." },
    33: { title: "Master Number: The Master Teacher", hint: "Altruism, spiritual evolution, and unconditional love." },
    111: { title: "Manifestation Gateway", hint: "Rapid realization is occurring. Keep thoughts positive." },
    222: { title: "Divine Balance", hint: "Trust that everything is working out as it should." },
    333: { title: "Ascended Masters", hint: "You are surrounded and protected by higher spiritual guides." },
    444: { title: "Angelic Protection", hint: "The angels are with you, offering strength and support." },
    555: { title: "Major Transformation", hint: "Prepare for significant life shifts and new opportunities." },
    666: { title: "Spiritual Rebalancing", hint: "Shift your focus from material to spiritual concerns." },
    777: { title: "Divine Alignment", hint: "You are on the right path. Miracles are unfolding." },
    888: { title: "Infinite Abundance", hint: "Financial or spiritual wealth is flowing toward you." },
    999: { title: "Completion of Cycle", hint: "A major phase is ending. Prepare for a new beginning." },
    1010: { title: "Spiritual Awakening", hint: "You are moving towards a higher purpose and spiritual growth." },
    1111: { title: "Instant Manifestation", hint: "A cosmic portal has opened to rapidly manifest your deepest desires." },
    1212: { title: "Cosmic Connection", hint: "Your thoughts are creating your reality. Stay focused on your goals." }
  };

  useEffect(() => {
    localStorage.setItem('gematria_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Gematria Calculation Logic
  const calculateGematria = (text: string, system: 'standard' | 'pythagorean' | 'ascii' | 'hebrew' = 'standard') => {
    const cleanText = text.toLowerCase();
    
    if (system === 'hebrew') {
        const hebrewValues: Record<string, number> = {
            'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
            'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
            'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100,
            'ר': 200, 'ש': 300, 'ת': 400
        };
        return text.split('').reduce((acc, char) => acc + (hebrewValues[char] || 0), 0);
    }

    const simpleClean = cleanText.replace(/[^a-z]/g, '');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    
    return simpleClean.split('').reduce((acc, char) => {
      const idx = alphabet.indexOf(char);
      if (idx === -1) return acc;
      
      switch (system) {
        case 'standard':
          return acc + (idx + 1);
        case 'pythagorean':
          return acc + ((idx % 9) + 1);
        case 'ascii':
          return acc + char.charCodeAt(0);
        default:
          return acc + (idx + 1);
      }
    }, 0);
  };

  const nameGematria = cosmicData ? calculateGematria(cosmicData.nameAnalysis.first.name) : 0;
  const wordGematria = calculateGematria(gematriaInput, gematriaSystem);

  const addToHistory = (word: string, value: number) => {
    if (!word || history.find(h => h.word === word && h.system === gematriaSystem)) return;
    setHistory(prev => [{ word, value, system: gematriaSystem }, ...prev].slice(0, 15));
  };

  const correlation = ANGEL_CORRELATIONS[wordGematria];

  const handleResearch = async (searchQuery?: string) => {
    const targetQuery = searchQuery || query;
    if (!targetQuery) return;
    setLoading(true);
    try {
      const data = await fetchAngelNumberInsight(targetQuery, cosmicData);
      setResult(data);
      setActiveSubTab('research');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; 
      utterance.pitch = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const useCases = [
    { title: "Manifestation", icon: <Sparkles size={12} />, description: "Align your intent with the daily sequence for quantum shift." },
    { title: "Decision Clarity", icon: <Activity size={12} />, description: "Decode repeating patterns to confirm chosen pathways." },
    { title: "Relationship Sync", icon: <Layers size={12} />, description: "Compare shared numbers to define divine meeting points." },
    { title: "Gematria Sync", icon: <Fingerprint size={12} />, description: "Deep dive into the numeric resonance of your core identifiers." }
  ];

  const ANGEL_QUICK_LIST = [111, 222, 333, 444, 555, 777, 888, 999, 1111, 1212];

  return (
    <div className="space-y-8 p-6 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-light text-white tracking-[0.2em] uppercase flex items-center gap-4">
            <Hash className="text-amber-400 w-8 h-8" /> Angelic Synchronicity
          </h2>
          <p className="text-stone-500 text-xs uppercase tracking-widest max-w-lg">
            Navigating the mathematical architecture of divine intervention.
          </p>
        </div>
        
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-2xl">
            {(['research', 'personal', 'gematria'] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-stone-500 hover:text-white'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Controls & Use Cases */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Input Component */}
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <RefreshCw size={120} className="text-amber-400 rotate-12" />
            </div>
            
            <h3 className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <Zap size={14} /> Synchronicity Engine
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="relative">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="CODE: 1111, 444..."
                  className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all text-2xl font-light tracking-[0.3em]"
                />
              </div>
              <button 
                onClick={() => handleResearch()}
                disabled={loading || !query}
                className="w-full bg-white text-black py-4 rounded-2xl hover:bg-amber-400 transition-all font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl disabled:opacity-20"
              >
                {loading ? 'Synthesizing Frequency...' : 'Decode Sequence'}
              </button>
            </div>
          </div>

          {/* Gematria Sync Tool (Mini) */}
          <div className="bg-black/30 border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="text-stone-500" size={14} />
                <span className="text-[10px] text-stone-400 uppercase tracking-widest">Instant Gematria</span>
              </div>
              <span className="text-amber-400 font-mono text-xl">{wordGematria}</span>
            </div>
            <input 
              type="text" 
              value={gematriaInput}
              onChange={(e) => setGematriaInput(e.target.value)}
              placeholder="Type word to sync..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs placeholder:text-stone-700 focus:outline-none"
            />
            {wordGematria > 0 && (
                <button 
                    onClick={() => handleResearch(wordGematria.toString())}
                    className="mt-3 text-[8px] text-amber-400 uppercase tracking-widest hover:underline"
                >
                    Research frequency {wordGematria} →
                </button>
            )}
          </div>

            <div className="space-y-4">
              <span className="text-[9px] text-stone-600 uppercase tracking-[0.3em] px-4 font-bold">Quick Sync Sequence</span>
              <div className="flex flex-wrap gap-2 px-2">
                {ANGEL_QUICK_LIST.map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setQuery(num.toString());
                      handleResearch(num.toString());
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-stone-400 hover:border-amber-400/50 hover:text-amber-400 transition-all font-mono"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Use Cases */}
          <div className="space-y-3">
            <span className="text-[9px] text-stone-600 uppercase tracking-[0.3em] px-4 font-bold">Divine Use Cases</span>
            {useCases.map((uc, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/2 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                    <div className="p-2 bg-amber-400/10 rounded-xl h-fit text-amber-400">{uc.icon}</div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-white uppercase tracking-widest font-bold">{uc.title}</span>
                        <p className="text-[9px] text-stone-500 leading-relaxed">{uc.description}</p>
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeSubTab === 'research' && (
                <motion.div 
                    key="research"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                >
                    {result ? (
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md space-y-10 relative overflow-hidden h-full">
                            {/* Decorative background number */}
                            <div className="absolute -top-10 -right-10 text-[18rem] font-bold text-white/2 select-none pointer-events-none tracking-tighter italic">
                                {query}
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-0.5 w-12 bg-amber-400"></div>
                                        <span className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.5em]">Sequence Decoded</span>
                                    </div>
                                    <h4 className="text-7xl font-light text-white tracking-widest">{query}</h4>
                                </div>
                                <button 
                                    onClick={() => speak(result.vocalScript)}
                                    className={`group flex items-center gap-4 px-8 py-5 rounded-[2rem] border transition-all ${isSpeaking ? 'bg-amber-400 border-amber-400 text-black' : 'bg-black/40 border-white/10 text-white hover:border-white/30'}`}
                                >
                                    <div className="relative">
                                        <Volume2 size={24} className={isSpeaking ? 'animate-pulse' : ''} />
                                        {isSpeaking && <motion.div layoutId="speak-dot" className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full" />}
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-[10px] uppercase tracking-widest font-bold opacity-60">Divine Voice</span>
                                        <span className="block text-xs uppercase tracking-widest font-bold">{isSpeaking ? 'Currently Explaining' : 'Vocal Transmission'}</span>
                                    </div>
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12 pt-8 relative z-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-stone-400 pb-2 border-b border-white/5">
                                        <BookOpen size={16} />
                                        <span className="text-[10px] uppercase tracking-[0.2em] font-black">Cosmic Meaning</span>
                                    </div>
                                    <p className="text-stone-300 leading-relaxed text-sm md:text-base font-light">
                                        {result.meaning}
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {result.personalConnection && (
                                        <div className="bg-amber-400 border border-amber-400/20 rounded-3xl p-8 space-y-4 shadow-[0_0_50px_rgba(251,191,36,0.1)]">
                                            <div className="flex items-center gap-2 text-black">
                                                <Sparkles size={16} />
                                                <span className="text-[10px] uppercase tracking-[0.2em] font-black">Personal Alignment</span>
                                            </div>
                                            <p className="text-black text-sm md:text-base leading-relaxed font-medium italic">
                                                "{result.personalConnection}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-stone-500">
                                            <Hash size={14} />
                                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Resonance Grid</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {result.gematriaVibrations.map((v: string, i: number) => (
                                                <span key={i} className="px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-stone-300 uppercase tracking-widest hover:bg-white/10 transition-colors cursor-default">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-black/40 border border-white/5 border-dashed rounded-[3rem] flex flex-col items-center justify-center p-20 text-center space-y-8">
                             <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center relative">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                    className="absolute inset-0 border-t border-amber-400/40 rounded-full"
                                />
                                <Hash size={40} className="text-stone-800" />
                             </div>
                             <div className="space-y-4">
                                <h5 className="text-white text-sm uppercase tracking-[0.4em] font-light">Awaiting Frequency</h5>
                                <p className="text-stone-600 text-[10px] uppercase tracking-widest max-w-[200px] mx-auto leading-loose">
                                    Input your repeating number pattern to engage the decode matrix.
                                </p>
                             </div>
                        </div>
                    )}
                </motion.div>
            )}

            {activeSubTab === 'personal' && (
                <motion.div 
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full"
                >
                    <PersonalCard 
                        title="Life Path Number" 
                        value={cosmicData?.numerology?.lifePath || '--'} 
                        icon={<Fingerprint />}
                        description="The blueprint of your soul's journey in this incarnation."
                        color="text-amber-400"
                        onResearch={() => cosmicData?.numerology?.lifePath && handleResearch(cosmicData.numerology.lifePath.toString())}
                    />
                    <PersonalCard 
                        title="Name Resonance" 
                        value={nameGematria || '--'} 
                        icon={<Layers />}
                        description="The frequency of your external identity and how the world receives you."
                        color="text-sky-400"
                        onResearch={() => nameGematria > 0 && handleResearch(nameGematria.toString())}
                    />
                    <PersonalCard 
                        title="Expression Value" 
                        value={nameGematria > 0 ? Math.floor(nameGematria / 9) : '--'} 
                        icon={<Activity />}
                        description="Your natural talents and the way you manifest your will."
                        color="text-emerald-400"
                        onResearch={() => nameGematria > 0 && handleResearch(Math.floor(nameGematria / 9).toString())}
                    />
                    <PersonalCard 
                        title="Soul Urge" 
                        value={cosmicData?.numerology?.lifePath ? (cosmicData.numerology.lifePath + 11) : '--'} 
                        icon={<Sparkles />}
                        description="The hidden desire that drives your deepest emotional shifts."
                        color="text-rose-400"
                        onResearch={() => cosmicData?.numerology?.lifePath && handleResearch((cosmicData.numerology.lifePath + 11).toString())}
                    />
                </motion.div>
            )}

            {activeSubTab === 'gematria' && (
                <motion.div 
                    key="gematria"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 lg:grid-cols-10 gap-8 h-full"
                >
                    <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-[3rem] p-10 flex flex-col justify-center space-y-12">
                        <div className="space-y-4">
                            <Layers size={40} className="text-amber-400" />
                            <h4 className="text-2xl text-white uppercase tracking-[0.3em] font-light text-left">Advanced Calculator</h4>
                            <div className="flex gap-2">
                                {(['standard', 'pythagorean', 'hebrew', 'ascii'] as const).map(sys => (
                                    <button 
                                        key={sys}
                                        onClick={() => setGematriaSystem(sys)}
                                        className={`px-4 py-1.5 rounded-full text-[8px] uppercase tracking-[0.2em] transition-all border ${gematriaSystem === sys ? 'bg-amber-400/20 border-amber-400 text-amber-400' : 'bg-transparent border-white/5 text-stone-500 hover:text-stone-300'}`}
                                    >
                                        {sys}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full space-y-6">
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={gematriaInput}
                                    onChange={(e) => setGematriaInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && gematriaInput) {
                                            addToHistory(gematriaInput, wordGematria);
                                        }
                                    }}
                                    placeholder={gematriaSystem === 'hebrew' ? "הקלד טקסט בעברית..." : "TYPE PHRASE OR NAME..."}
                                    className={`w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-8 text-3xl font-light text-white tracking-widest uppercase focus:outline-none focus:border-amber-400 transition-all ${gematriaSystem === 'hebrew' ? 'text-right' : 'text-left'}`}
                                    dir={gematriaSystem === 'hebrew' ? 'rtl' : 'ltr'}
                                />
                                {wordGematria > 0 && (
                                    <div className="absolute -bottom-8 left-6 flex items-center gap-3">
                                        <div className="h-px w-8 bg-white/10"></div>
                                        <span className="text-amber-400 text-xl font-mono">{wordGematria}</span>
                                        <span className="text-[8px] text-stone-600 uppercase tracking-widest">{gematriaSystem} value</span>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {correlation && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-6 space-y-2 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={14} className="text-amber-400" />
                                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{correlation.title}</span>
                                        </div>
                                        <p className="text-xs text-stone-300 font-light leading-relaxed italic">{correlation.hint}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => {
                                        if (wordGematria > 0) {
                                            addToHistory(gematriaInput, wordGematria);
                                            handleResearch(wordGematria.toString());
                                        }
                                    }}
                                    className="bg-white text-black px-12 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-all shadow-xl disabled:opacity-20"
                                    disabled={!gematriaInput}
                                >
                                    Sync Frequency
                                </button>
                                <button 
                                    onClick={() => {
                                        if (gematriaInput) addToHistory(gematriaInput, wordGematria);
                                    }}
                                    className="px-6 py-4 rounded-2xl border border-white/10 text-white font-bold uppercase text-[10px] tracking-widest hover:border-white/30 transition-all"
                                >
                                    Log Core
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-[3rem] p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-black">Sync History</span>
                            <button 
                                onClick={() => setHistory([])}
                                className="text-[8px] text-stone-600 hover:text-rose-400 uppercase tracking-widest transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                        
                        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {history.length > 0 ? (
                                history.map((item, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={`${item.word}-${i}`}
                                        className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl group hover:border-amber-400/30 transition-all"
                                    >
                                        <div className="space-y-1">
                                            <span className="block text-[10px] text-white uppercase tracking-widest font-bold">{item.word}</span>
                                            <span className="block text-[8px] text-stone-600 uppercase tracking-widest italic">{item.system}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-amber-400 font-mono text-lg">{item.value}</span>
                                            <button 
                                                onClick={() => {
                                                    setGematriaInput(item.word);
                                                    setQuery(item.value.toString());
                                                    handleResearch(item.value.toString());
                                                }}
                                                className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                                            >
                                                <Zap size={12} className="text-stone-400 group-hover:text-amber-400" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-stone-700 opacity-20">
                                    <Layers size={40} className="mb-4" />
                                    <span className="text-[10px] uppercase tracking-widest">No Logs Yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Helper Card for Personal Numbers
const PersonalCard = ({ title, value, icon, description, color, onResearch }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6 hover:bg-white/[0.07] transition-all group">
    <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>{icon}</div>
        <div className="text-right">
            <span className="block text-[8px] text-stone-500 uppercase tracking-widest font-bold mb-1">Frequency Index</span>
            <span className={`text-4xl font-light tracking-widest ${color}`}>{value}</span>
        </div>
    </div>
    <div className="space-y-4">
        <h5 className="text-white text-xs uppercase tracking-widest font-bold">{title}</h5>
        <p className="text-[10px] text-stone-500 leading-relaxed uppercase tracking-widest">{description}</p>
    </div>
    <button 
        onClick={onResearch}
        className="w-full pt-4 border-t border-white/5 text-[9px] text-stone-400 uppercase tracking-widest flex items-center justify-between group-hover:text-amber-400 transition-colors"
    >
        <span>Research this frequency</span>
        <Plus size={12} />
    </button>
  </div>
);
