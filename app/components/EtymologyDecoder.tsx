import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Search, Loader2, Maximize2, Minimize2, Sparkles, Binary } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';
import { soundEngine } from '../lib/soundEffects';
import { fetchEtymologyDecoder } from '../services/geminiService';
import { CosmicData } from '../types';

export const EtymologyDecoder = ({ data, loadedInputs }: { data: CosmicData | null, loadedInputs?: any }) => {
  const { processPacket } = useHigherMind();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDecode = async () => {
    setIsProcessing(true);
    soundEngine.scan();
    
    try {
      const response = await fetchEtymologyDecoder(data, loadedInputs);
      setResult(response);
      soundEngine.success();
      
      processPacket({
        thought_id: `t_etym_${Date.now()}`,
        thought_content: `Decoded linguistic and numerical origins.`,
        feeling_id: `f_etym_${Date.now()}`,
        emotion: 'Illuminated',
        frequency: 852,
        astral_amplitude: 0.9,
        experience_being_encoded: true,
        experience_type: 'insight',
        synaptic_cluster_strength: 0.9,
        neural_coherence: 0.9,
        emergent_insight: 'The name and birth timestamp hold a perfectly harmonic geometric signature.',
        astral_alignment: 0.95,
        next_thought_direction: 'Meditate on the true vibrational root of the birth code.'
      });
    } catch (e) {
      console.error(e);
      soundEngine.error();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`mt-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-8 overflow-y-auto w-full h-[100vh]' : ''}`}>
      <motion.div 
        layout
        className="w-full bg-zinc-950/80 border border-cyan-500/20 rounded-[2.5rem] p-6 lg:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.05)] group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-cyan-500/10 pb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Fingerprint size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-light text-white tracking-widest uppercase">Etymology & Origin Decoder</h2>
              <p className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest mt-1">Linguistic & Temporal Mathematics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!result && (
              <button 
                onClick={handleDecode}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 rounded-xl transition-all text-xs uppercase tracking-widest font-bold"
              >
                {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                {isProcessing ? 'Decrypting...' : 'Initiate Scan'}
              </button>
            )}
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-stone-400 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 relative z-10"
            >
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-rose-400 mb-4">
                    <Sparkles size={16} />
                    <h3 className="text-sm font-mono uppercase tracking-widest font-bold">Linguistic Genesis</h3>
                  </div>
                  <div className="space-y-4">
                    {result.names.map((n: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-rose-500/30 pl-4 py-1">
                        <span className="text-white font-bold font-mono text-lg">{n.name}</span>
                        <p className="text-xs text-rose-300/80 uppercase tracking-widest font-mono mt-1">{n.origin}</p>
                        <p className="text-sm text-zinc-300 font-light mt-2 leading-relaxed">{n.deepMeaning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-fuchsia-400 mb-4">
                    <Binary size={16} />
                    <h3 className="text-sm font-mono uppercase tracking-widest font-bold">Initial Cipher Code</h3>
                  </div>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2">
                    {result.initials}
                  </p>
                  <p className="text-sm text-zinc-300 font-light leading-relaxed">
                    {result.initialsMeaning}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2 text-cyan-400 mb-4 relative z-10">
                    <Search size={16} />
                    <h3 className="text-sm font-mono uppercase tracking-widest font-bold">Temporal Geometry (Pi & Golden Ratio)</h3>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <p className="text-xs text-cyan-300/80 uppercase tracking-widest font-mono">Timestamp Analysis</p>
                    <p className="text-sm text-white font-light leading-relaxed">
                      {result.temporalGeometry}
                    </p>
                    
                    {result.mathematicalConstants && result.mathematicalConstants.length > 0 && (
                      <div className="pt-4 border-t border-cyan-500/20">
                         <p className="text-xs text-cyan-300/80 uppercase tracking-widest font-mono mb-2">Constant Resonances</p>
                         <ul className="space-y-2">
                           {result.mathematicalConstants.map((constant: string, i: number) => (
                             <li key={i} className="text-sm text-zinc-300 font-mono flex gap-2">
                               <span className="text-cyan-500">▶</span> {constant}
                             </li>
                           ))}
                         </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-bold">The Holographic Synthesis</h3>
                  <p className="text-sm text-zinc-300 font-light leading-relaxed italic border-l-4 border-cyan-500/50 pl-4 py-2">
                    "{result.holographicSynthesis}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
