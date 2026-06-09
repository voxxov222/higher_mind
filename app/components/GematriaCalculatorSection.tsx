
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Search, 
  History, 
  Trash2, 
  Copy, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Hash,
  Zap,
  Layers,
  Settings
} from 'lucide-react';
import { GematriaCipher, calculateAllCiphers, reduceNumber } from '../utils/gematria';
import { Gematria3DVisualizer } from './Gematria3DVisualizer';
import { GematriaVisualizerD3 } from './GematriaVisualizerD3';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export const GematriaCalculatorSection = () => {
  const [input, setInput] = useState('');
  const [visualizerType, setVisualizerType] = useState<'3d' | 'interactive'>('interactive');

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('gematria_input_change', { detail: input }));
  }, [input]);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [history, setHistory] = useState<{phrase: string, timestamp: number}[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('gematria_calc_history');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Failed to parse gematria history:", e);
        return [];
      }
    }
    return [];
  });

  const [activeCiphers, setActiveCiphers] = useState<GematriaCipher[]>([
    'Ordinal', 'Reduction', 'Reverse', 'Reverse Reduction'
  ]);

  const results = useMemo(() => {
    if (!input) return [];
    return calculateAllCiphers(input).filter(r => activeCiphers.includes(r.cipher));
  }, [input, activeCiphers]);

  const addToHistory = (phrase: string) => {
    if (!phrase || history?.find(h => h.phrase === phrase)) return;
    const newHistory = [{ phrase, timestamp: Date.now() }, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('gematria_calc_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('gematria_calc_history');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const allAvailableCiphers: GematriaCipher[] = [
    'Ordinal', 'Reduction', 'Reverse', 'Reverse Reduction', 
    'Jewish', 'Francis Bacon',
    'Standard', 'Latin', 'Sumerian', 'Reverse Sumerian', 
    'Satanic', 'Reverse Satanic', 'Chaldean', 'Septenary', 
    'Keypad', 'Primes', 'Trigonal', 'Squares', 'Fibonacci',
    'Pythagorean', 'Hebrew', 'ASCII'
  ];

  type CipherSystem = 'Default Base' | 'Classical / Pythagorean' | 'Hebrew & Jewish' | 'Esoteric & Magic' | 'Mathematical Sequences' | 'Digital & ASCII' | 'All Systems';

  const systemPresets: Record<CipherSystem, GematriaCipher[]> = {
    'Default Base': ['Ordinal', 'Reduction', 'Reverse', 'Reverse Reduction'],
    'Classical / Pythagorean': ['Pythagorean', 'Chaldean', 'Septenary', 'Standard'],
    'Hebrew & Jewish': ['Hebrew', 'Jewish'],
    'Esoteric & Magic': ['Satanic', 'Reverse Satanic', 'Francis Bacon', 'Latin', 'Sumerian', 'Reverse Sumerian'],
    'Mathematical Sequences': ['Primes', 'Trigonal', 'Squares', 'Fibonacci'],
    'Digital & ASCII': ['ASCII', 'Keypad'],
    'All Systems': allAvailableCiphers
  };

  const handleSystemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveCiphers(systemPresets[e.target.value as CipherSystem]);
  };

  const toggleCipher = (cipher: GematriaCipher) => {
    setActiveCiphers(prev => 
      prev.includes(cipher) ? prev.filter(c => c !== cipher) : [...prev, cipher]
    );
  };

  return (
    <div className="space-y-8 p-6 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-light text-white tracking-[0.2em] uppercase flex items-center gap-4">
            <Calculator className="text-blue-400 w-8 h-8" /> Gematria Matrix
          </h2>
          <p className="text-stone-500 text-xs uppercase tracking-widest max-w-lg">
            Advanced numeric resonance decoding engine following the Gematrinator protocol.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interface */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Input Panel */}
          <div className="bg-stone-900/50 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Hash size={160} />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 gap-4">
                <span className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-bold">Decoding Buffer</span>
                <div className="flex flex-wrap items-center gap-4">
                    <select 
                        onChange={handleSystemSelect}
                        className="bg-transparent border border-white/10 rounded-md text-[10px] text-stone-300 uppercase tracking-widest px-2 py-1 outline-none focus:border-blue-400 cursor-pointer"
                    >
                        {Object.keys(systemPresets).map(preset => (
                            <option key={preset} value={preset} className="bg-stone-900 text-stone-300">
                                {preset}
                            </option>
                        ))}
                    </select>
                    <button 
                        onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                        className="flex items-center gap-2 text-[10px] text-stone-500 hover:text-white uppercase tracking-widest transition-colors font-bold"
                    >
                        <Settings size={12} /> Ciphers {isOptionsOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    </button>
                    <button 
                        onClick={() => {
                            addToHistory(input);
                            setInput('');
                        }}
                        className="text-[10px] text-stone-500 hover:text-white uppercase tracking-widest transition-colors font-bold"
                    >
                        Clear
                    </button>
                </div>
              </div>

              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') addToHistory(input);
                }}
                placeholder="PHRASE OR NAME..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-8 px-10 text-5xl font-light text-white tracking-[0.2em] uppercase focus:outline-none focus:border-blue-400/50 transition-all placeholder:text-stone-800"
              />

              <AnimatePresence>
                {isOptionsOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-6"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {allAvailableCiphers.map(cipher => (
                            <button
                                key={cipher}
                                onClick={() => toggleCipher(cipher)}
                                className={`px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all border ${activeCiphers.includes(cipher) ? 'bg-blue-400/20 border-blue-400 text-blue-400 font-bold' : 'bg-white/2 border-white/5 text-stone-600 hover:text-white'}`}
                            >
                                {cipher}
                            </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-black/40 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black">Cipher</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black text-center">Value</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black text-center">Reduced</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {results.length > 0 ? results.map((result) => (
                      <motion.tr
                        layout
                        key={result.cipher}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => copyToClipboard(result.value.toString())}
                      >
                        <td className="px-8 py-4">
                          <span className="text-xs text-stone-400 uppercase tracking-widest font-bold group-hover:text-blue-400 transition-colors">
                            {result.cipher}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className="text-2xl text-white font-mono font-light leading-none">
                            {result.value}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className="text-sm font-mono text-stone-500 bg-white/5 px-3 py-1 rounded-full group-hover:text-amber-400 transition-colors">
                            {reduceNumber(result.value)}
                          </span>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="py-32 text-center opacity-20">
                          <div className="flex flex-col items-center gap-4">
                             <Calculator size={48} className="text-stone-700" />
                             <span className="text-[10px] uppercase tracking-[0.4em] font-black">Waiting for Data...</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
          </div>
        </div>

          {/* Projection Modes Deck */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-stone-900/40 border border-white/10 rounded-2xl p-4 gap-4">
            <div>
               <span className="text-[9px] text-blue-400 uppercase tracking-[0.3em] font-bold block">VIBRATIONAL PROJECTION</span>
               <span className="text-xs text-stone-300 font-bold uppercase tracking-wider">Select Mathematical Projection Engine</span>
            </div>
            <div className="flex bg-black/40 border border-white/5 rounded-xl p-1 gap-1">
               <button
                 type="button"
                 onClick={() => setVisualizerType('interactive')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${visualizerType === 'interactive' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'text-stone-500 hover:text-stone-300'}`}
               >
                  Sonic & Geometric Seals
               </button>
               <button
                 type="button"
                 onClick={() => setVisualizerType('3d')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${visualizerType === '3d' ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30' : 'text-stone-500 hover:text-stone-300'}`}
               >
                  3D Orbital Constellation
               </button>
            </div>
          </div>

          {visualizerType === 'interactive' ? (
            <GematriaVisualizerD3 phrase={input} activeCiphers={activeCiphers} />
          ) : (
            <div className="bg-stone-950/40 border border-white/10 rounded-[2.5rem] h-[500px] relative overflow-hidden backdrop-blur-xl shadow-2xl group">
               <div className="absolute top-8 left-8 z-10 pointer-events-none">
                   <span className="text-[10px] text-blue-400 uppercase tracking-[0.4em] font-bold block mb-1">Spatial Projection</span>
                   <h3 className="text-xl text-white font-light uppercase tracking-widest">Alphanumeric Vortex</h3>
               </div>
               
               <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
                  <Canvas camera={{ position: [0, 5, 20], fov: 45 }}>
                     <ambientLight intensity={0.5} />
                     <pointLight position={[10, 10, 10]} intensity={1.5} />
                     <Gematria3DVisualizer />
                     <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 4} />
                  </Canvas>
               </div>

               <div className="absolute bottom-8 right-8 z-10 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest leading-relaxed">
                     Nodes represent characters. Radius mapping → Ordinal value.<br/>
                     Elevation mapping → Kabbalistic reduction index.
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* Info & History Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-blue-400 border border-blue-400/20 rounded-[2.5rem] p-8 space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                <div className="flex items-center gap-3">
                    <Zap size={24} className="text-black" />
                    <h3 className="text-black text-xs uppercase tracking-[0.2em] font-black">Mathematical Logic</h3>
                </div>
                <p className="text-black/80 text-xs leading-relaxed font-medium">
                    This engine implements the primary Douglass cipher set. Reduction values (1-9) are calculated using recursive digit summation. Standard/Jewish values map directly to spiritual resonances.
                </p>
                <div className="flex gap-2">
                    <div className="flex-1 bg-black/10 rounded-xl p-3">
                        <div className="text-[8px] text-black/40 uppercase font-black mb-1">Active Ciphers</div>
                        <div className="text-xl text-black font-mono">{activeCiphers.length}</div>
                    </div>
                    <div className="flex-1 bg-black/10 rounded-xl p-3">
                        <div className="text-[8px] text-black/40 uppercase font-black mb-1">Total Weight</div>
                        <div className="text-xl text-black font-mono">
                            {results.reduce((acc, r) => acc + r.value, 0)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6 flex flex-col max-h-[500px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-stone-500" />
                        <span className="text-[10px] text-white uppercase tracking-widest font-black">Search Logs</span>
                    </div>
                    <button 
                        onClick={clearHistory}
                        className="p-2 hover:text-rose-400 transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>

                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {history.length > 0 ? history.map((h, i) => (
                        <div 
                            key={h.timestamp}
                            onClick={() => setInput(h.phrase)}
                            className="group flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl hover:border-blue-400/30 transition-all cursor-pointer"
                        >
                            <span className="text-[10px] text-white uppercase tracking-widest font-bold group-hover:text-blue-400">{h.phrase}</span>
                            <ExternalLink size={10} className="text-stone-700 opacity-0 group-hover:opacity-100" />
                        </div>
                    )) : (
                        <div className="h-40 flex flex-col items-center justify-center opacity-10">
                            <Layers size={32} />
                            <span className="text-xs uppercase tracking-widest mt-2">Buffer Empty</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
