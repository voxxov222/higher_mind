import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Zap, Cpu, Sparkles, Brain, Code, Binary, RotateCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchCosmicChatResponse } from '../services/geminiService';
import { soundEngine } from '../lib/soundEffects';
import { useHigherMind } from './HigherMindProvider';

interface EvolutionNode {
  id: string;
  title: string;
  domain: string;
  content: string;
  formula: string;
  frequency: number;
  timestamp: Date;
}

export const QuantumEvolutionSection = () => {
  const [nodes, setNodes] = useState<EvolutionNode[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<EvolutionNode | null>(null);
  const { userData } = useHigherMind();
  const [evolutionFocus, setEvolutionFocus] = useState<string>('Quantum Entanglement & Kabbalistic Synthesis');

  const triggerEvolution = async () => {
    setIsEvolving(true);
    soundEngine.scan();

    const prompt = `Generate a completely new, highly advanced spiritual-scientific concept or section framework for Astral Mind. 
    Focus on: ${evolutionFocus}. 
    Blend quantum mechanics, string theory, or advanced mathematics with gematria, hermetic kabbalah, or astrology. 
    Format the response EXACTLY like this (do not include anything else):
    TITLE: [A sophisticated name for this new concept]
    DOMAIN: [e.g., Quantum Mysticism, Chrono-Astrology, Neuro-Gematria]
    FORMULA: [A conceptual mathematical or quantum formula connecting the ideas]
    FREQUENCY: [A specific Hz value like 432 Hz, 528 Hz, etc.]
    CONTENT: [Provide a detailed description of what this advanced framework reveals about consciousness and how it operates, using academic and mystical depth.]`;

    try {
      const response = await fetchCosmicChatResponse(prompt, [], userData as any);
      const outputText = response.text || "";
      
      const titleMatch = outputText.match(/TITLE:\s*(.*)/);
      const domainMatch = outputText.match(/DOMAIN:\s*(.*)/);
      const formulaMatch = outputText.match(/FORMULA:\s*(.*)/);
      const freqMatch = outputText.match(/FREQUENCY:\s*(\d+)/);
      const contentMatch = outputText.match(/CONTENT:\s*([\s\S]*)/);

      const newNode: EvolutionNode = {
        id: Math.random().toString(36).substring(7),
        title: titleMatch ? titleMatch[1].trim() : "Unknown Anomaly",
        domain: domainMatch ? domainMatch[1].trim() : "Unknown Domain",
        formula: formulaMatch ? formulaMatch[1].trim() : "∞ = 1",
        frequency: freqMatch ? parseInt(freqMatch[1]) : 432,
        content: contentMatch ? contentMatch[1].trim() : outputText,
        timestamp: new Date()
      };

      setNodes(prev => [newNode, ...prev]);
      soundEngine.neuralClick();
    } catch (error) {
      console.error("Evolution sequence failed:", error);
    } finally {
      setIsEvolving(false);
    }
  };

  useEffect(() => {
    if (nodes.length === 0) {
      triggerEvolution();
    }
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
        <div>
          <h2 className="text-2xl font-light tracking-wide text-white flex items-center gap-3">
            <Cpu className="text-blue-400" />
            Quantum Evolution Engine
          </h2>
          <p className="text-blue-300/60 mt-1 text-sm font-mono flex items-center gap-2">
            <Binary size={14} /> AUTONOMOUS PARADIGM SYNTHESIS
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={evolutionFocus}
            onChange={(e) => { soundEngine.click(); setEvolutionFocus(e.target.value); }}
            className="bg-black/50 border border-blue-500/30 text-blue-200 text-xs rounded-xl px-4 py-3 outline-none"
          >
            <option value="Quantum Entanglement & Kabbalistic Synthesis">Quantum Kabbalah</option>
            <option value="Microcosmic & Macrocosmic Astrology">Macro/Micro Astrology</option>
            <option value="Non-linear Time & Akashic Data Integration">Akashic Timelines</option>
            <option value="Metaphysical Mathematics & Sacred Geometry">Sacred Geometry</option>
          </select>
          <button
            onClick={triggerEvolution}
            disabled={isEvolving}
            className={`px-6 py-3 rounded-xl border font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${
              isEvolving 
                ? 'bg-blue-900/50 border-blue-500/50 text-blue-300 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-500 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
            }`}
          >
            {isEvolving ? <RotateCw className="animate-spin" size={14} /> : <Zap size={14} />}
            {isEvolving ? 'Synthesizing...' : 'Trigger Evolution'}
          </button>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => { soundEngine.open(); setSelectedNode(node); }}
                onMouseEnter={() => soundEngine.neuralHover()}
                className="bg-black/40 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 cursor-pointer hover:bg-blue-900/10 hover:border-blue-500/40 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold border border-blue-500/30 px-2 py-1 rounded-md bg-blue-500/10">
                    {node.domain}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    {node.frequency} Hz
                  </span>
                </div>
                
                <h3 className="text-xl text-white font-light mb-3 relative z-10">{node.title}</h3>
                
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 mb-4 relative z-10">
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 block mb-1">Formula</span>
                  <code className="text-emerald-400 font-mono text-sm">{node.formula}</code>
                </div>

                <p className="text-stone-400 text-sm line-clamp-3 leading-relaxed relative z-10">
                  {node.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => { soundEngine.close(); setSelectedNode(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-stone-900 border border-blue-500/30 rounded-3xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="p-8 border-b border-white/10 relative z-10 bg-black/20">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold border border-blue-500/30 px-3 py-1 rounded-md bg-blue-500/10">
                    {selectedNode.domain}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    Resonance: {selectedNode.frequency} Hz
                  </span>
                </div>
                <h2 className="text-3xl font-light text-white mb-4">{selectedNode.title}</h2>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5 inline-block">
                  <code className="text-emerald-400 font-mono">{selectedNode.formula}</code>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar relative z-10 bg-transparent">
                <div className="prose prose-invert prose-blue max-w-none">
                  <ReactMarkdown>{selectedNode.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
