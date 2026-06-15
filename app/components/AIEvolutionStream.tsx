import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, Layers, Cpu, Code, Database, RefreshCw, Brain, Infinity as InfinityIcon, Atom } from 'lucide-react';
import { fetchCosmicChatResponse } from '../services/geminiService';
import { useHigherMind } from './HigherMindProvider';

interface EvolutionEntry {
  id: string;
  type: 'component' | 'concept' | 'logic';
  title: string;
  description: string;
  codeSnippet?: string;
  status: 'pending' | 'integrated' | 'rejected';
  timestamp: number;
}

export const AIEvolutionStream = () => {
  const { cosmicData } = useHigherMind();
  const [entries, setEntries] = useState<EvolutionEntry[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionInput, setEvolutionInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleEvolve = async () => {
    if (isEvolving) return;
    setIsEvolving(true);
    
    try {
      const prompt = `
        As the HIGHER MIND Evolution Engine, manifest a NEW advanced spiritual-scientific section or feature for this app.
        The user wants to explore: ${evolutionInput || 'The intersection of Quantum Mechanics and Ancient Kabbalah'}.
        
        Generate a JSON object with:
        {
          "title": "...",
          "type": "component",
          "description": "...",
          "logicHighlight": "A cool conceptual formula or logic path"
        }
      `;
      
      const response = await fetchCosmicChatResponse(prompt, [], cosmicData);
      
      // Attempt to parse JSON from AI response
      let manifest;
      try {
        const responseText = response.text || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          manifest = JSON.parse(jsonMatch[0]);
        } else {
          // Graceful fallback for non-JSON response instead of Cosmic Anomaly
          manifest = { 
            title: 'Evolution Synthesis', 
            description: responseText.trim() || 'A new perspective has emerged from the void.',
            logicHighlight: '// Integration in progress'
          };
        }
      } catch (error) {
        console.warn("Failed to parse manifestation format:", error);
        manifest = { 
          title: 'Spontaneous Insight', 
          description: response.text?.trim()?.substring(0, 200) + '...',
          logicHighlight: '// Re-calibrating pathways'
        };
      }

      const newEntry: EvolutionEntry = {
        id: Math.random().toString(36).substring(7),
        type: 'component',
        title: manifest.title || 'New Manifestation',
        description: manifest.description || 'Deepening the neural architecture...',
        codeSnippet: manifest.logicHighlight || '// Logic sequence initiated',
        status: 'pending',
        timestamp: Date.now()
      };

      setEntries([newEntry, ...entries]);
      setEvolutionInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvolving(false);
    }
  };

  const handleIntegrate = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'integrated' } : e));
    // In a real self-evolving app, this would trigger a build or update local state that renders these
  };

  return (
    <div className="h-full flex flex-col gap-6 bg-zinc-950/20 rounded-[3rem] p-8 border border-white/5 relative overflow-hidden backdrop-blur-3xl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 px-4">
        <div>
          <h2 className="text-3xl font-light text-white tracking-[0.2em] uppercase flex items-center gap-4">
            <RefreshCw className={isEvolving ? "animate-spin text-purple-400" : "text-purple-400"} /> 
            Self-Evolution Stream
          </h2>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mt-2">Active AI Self-Modification Logic v2.5</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-purple-900/40 flex items-center justify-center overflow-hidden">
                <Brain className="w-4 h-4 text-purple-300 opacity-60" />
              </div>
            ))}
          </div>
          <div className="leading-none">
            <span className="text-[8px] text-purple-400 uppercase font-black tracking-widest block">Neural Sync</span>
            <span className="text-xs text-white/40">3 Active Agents</span>
          </div>
        </div>
      </div>

      {/* Input Stage */}
      <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-4 group focus-within:border-purple-500/30 transition-all shrink-0">
        <Atom className="text-purple-400 transition-transform group-focus-within:rotate-180 duration-1000" />
        <input 
          type="text" 
          placeholder="DIRECTIVE: Suggest a new spiritual-scientific domain to integrate..."
          value={evolutionInput}
          onChange={(e) => setEvolutionInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEvolve()}
          className="flex-1 bg-transparent border-none text-white placeholder:text-stone-600 focus:outline-none text-sm tracking-wide font-light"
        />
        <button 
          onClick={handleEvolve}
          disabled={isEvolving}
          className="bg-white text-black px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
        >
          {isEvolving ? 'Processing...' : 'Manifest'}
        </button>
      </div>

      {/* Stream Display */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-6" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {entries.length === 0 && !isEvolving && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4"
             >
                <InfinityIcon size={64} />
                <div className="max-w-xs">
                  <p className="text-sm uppercase tracking-widest">Waiting for evolution trigger.</p>
                  <p className="text-[10px] mt-2 font-mono">Input a directive to begin manifestation.</p>
                </div>
             </motion.div>
          )}
          {entries.map((entry, idx) => (
             <motion.div
               key={entry.id}
               initial={{ opacity: 0, y: 20, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${
                 entry.status === 'integrated' ? 'bg-purple-900/10 border-purple-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
               }`}
             >
                <div className="flex items-start justify-between relative z-10">
                   <div className="space-y-4 max-w-2xl">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${entry.status === 'integrated' ? 'bg-purple-600 text-white' : 'bg-white/5 text-stone-500'}`}>
                            {entry.type === 'component' ? <Layers size={16} /> : <Code size={16} />}
                         </div>
                         <h3 className="text-xl font-bold text-white tracking-wide">{entry.title}</h3>
                         {entry.status === 'integrated' && (
                           <span className="bg-green-500/20 text-green-400 text-[8px] px-2 py-1 rounded-full border border-green-500/30 uppercase font-black">Integrated</span>
                         )}
                      </div>
                      <p className="text-stone-400 text-sm leading-relaxed font-light">{entry.description}</p>
                      
                      {entry.codeSnippet && (
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-[10px] text-purple-300 relative group/code">
                           <div className="absolute top-2 right-4 text-[8px] text-stone-600 uppercase font-bold tracking-widest">Logic Extract</div>
                           <code>{entry.codeSnippet}</code>
                        </div>
                      )}
                   </div>

                   <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleIntegrate(entry.id)}
                        disabled={entry.status === 'integrated'}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          entry.status === 'integrated' ? 'bg-white/5 text-stone-600 cursor-default' : 'bg-purple-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40'
                        }`}
                      >
                         {entry.status === 'integrated' ? 'Synced' : 'Integrate'}
                      </button>
                      <button className="px-6 py-2 rounded-xl text-[10px] font-black underline text-stone-500 hover:text-white transition-all uppercase tracking-widest">
                         Archival
                      </button>
                   </div>
                </div>

                {/* Decorative mesh background for entry */}
                <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
                   <Box size={200} />
                </div>
             </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer / Status HUD */}
      <div className="flex items-center justify-between text-[10px] text-stone-600 px-4 shrink-0 border-t border-white/5 pt-6 uppercase tracking-[0.2em] font-bold">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> AI Agent: Online</span>
            <span className="flex items-center gap-2"><Cpu size={12} /> GPU Cluster: 48.2 TFLOPS</span>
            <span className="flex items-center gap-2"><Database size={12} /> Sync Level: High</span>
         </div>
         <div className="flex items-center gap-4">
            <span>Latent Space: Expanding</span>
            <button className="text-purple-400 hover:text-purple-300 transition-colors">Manifesto Docs</button>
         </div>
      </div>
    </div>
  );
};
