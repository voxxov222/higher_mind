import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, Feather, ArrowRight, Loader2, Save } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';
import { soundEngine } from '../lib/soundEffects';
import { fetchFifthDimensionRewrite } from '../services/geminiService';

export const FifthDimensionLayer = ({ cosmicData }: { cosmicData: any }) => {
  const { processPacket } = useHigherMind();
  const [activeTool, setActiveTool] = useState<'subconscious' | 'synopsis'>('subconscious');
  
  const [oldBelief, setOldBelief] = useState('');
  const [oldSynopsis, setOldSynopsis] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRewrite = async () => {
    if ((activeTool === 'subconscious' && !oldBelief) || (activeTool === 'synopsis' && !oldSynopsis)) return;
    
    setIsProcessing(true);
    soundEngine.scan();
    
    try {
      const response = await fetchFifthDimensionRewrite(
        activeTool, 
        activeTool === 'subconscious' ? oldBelief : oldSynopsis,
        cosmicData
      );
      setResult(response);
      
      if (response.consciousnessPacket) {
        processPacket(response.consciousnessPacket);
      }
      soundEngine.success();
    } catch (e) {
      console.error(e);
      soundEngine.error();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center gap-4 border-b border-fuchsia-500/30 pb-6">
        <div className="w-16 h-16 rounded-full bg-fuchsia-500/20 border border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
          <Brain size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-light text-white tracking-widest uppercase">5D Consciousness Layer</h2>
          <p className="text-sm font-light text-fuchsia-300/80 uppercase tracking-widest mt-1">Subconscious Reprogramming & Neural Integration</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => { setActiveTool('subconscious'); setResult(null); soundEngine.click(); }}
          className={`flex-1 p-6 rounded-2xl border transition-all ${activeTool === 'subconscious' ? 'bg-fuchsia-900/30 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.2)] text-white' : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-300'}`}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
            <span className="font-bold uppercase tracking-widest text-sm">Subconscious Override</span>
          </div>
          <p className="text-xs font-light opacity-80">Rewrite limiting beliefs into 5D empowering frequencies.</p>
        </button>
        <button 
          onClick={() => { setActiveTool('synopsis'); setResult(null); soundEngine.click(); }}
          className={`flex-1 p-6 rounded-2xl border transition-all ${activeTool === 'synopsis' ? 'bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-white' : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-300'}`}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Feather className="w-5 h-5 text-cyan-400" />
            <span className="font-bold uppercase tracking-widest text-sm">Rewrite Synopsis</span>
          </div>
          <p className="text-xs font-light opacity-80">Transform traumatic narratives into Soul Initiations.</p>
        </button>
      </div>

      <motion.div 
        key={activeTool}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 border border-white/10 rounded-[2rem] p-8 space-y-6 relative overflow-hidden"
      >
        <div className="relative z-10">
          <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-3 font-bold">
            {activeTool === 'subconscious' ? 'Old 3D Paradigm / Limiting Belief' : 'Current Density Narrative / Event'}
          </label>
          <textarea
            value={activeTool === 'subconscious' ? oldBelief : oldSynopsis}
            onChange={(e) => activeTool === 'subconscious' ? setOldBelief(e.target.value) : setOldSynopsis(e.target.value)}
            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-stone-300 focus:outline-none focus:border-fuchsia-500/50 transition-all font-light resize-none leading-relaxed"
            placeholder={activeTool === 'subconscious' ? "e.g., I never have enough time or energy to accomplish my dreams..." : "e.g., I went through a painful separation that made me feel abandoned..."}
          />
          
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleRewrite}
              disabled={isProcessing}
              className={`px-8 py-3 rounded-xl flex items-center gap-3 text-xs uppercase tracking-widest font-bold transition-all ${isProcessing ? 'bg-stone-800 text-stone-500' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/40'}`}
            >
              {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Brain className="w-4 h-4" />}
              {isProcessing ? 'Transmuting...' : 'Initiate 5D Transmutation'}
            </button>
          </div>
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-8 pt-8 border-t border-white/10 relative z-10 space-y-6"
          >
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] text-fuchsia-400 font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Amplified 5D Reprogramming
              </h3>
              <p className="text-xl font-light text-white leading-relaxed italic border-l-4 border-fuchsia-500/50 pl-6 py-2">
                "{result.newParadigm}"
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Neural Architecture</h4>
                <p className="text-sm font-light text-emerald-100/70 leading-relaxed">
                  {result.neuralArchitecture}
                </p>
              </div>
              <div className="p-6 bg-sky-900/10 border border-sky-500/20 rounded-2xl space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest text-sky-400 font-bold">Resonant Frequency Setup</h4>
                <p className="text-sm font-light text-sky-100/70 leading-relaxed font-mono">
                  Target Hz: {result.frequencyHz}Hz<br/>
                  Integration Protocol: {result.integrationProtocol}
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Esoteric Significance</h4>
              <p className="text-sm font-light text-stone-300 leading-relaxed">
                {result.esotericMeaning}
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Orbital Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-5">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white rounded-full animate-[spin_60s_linear_infinite]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-fuchsia-500 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        </div>
      </motion.div>
    </div>
  );
};
