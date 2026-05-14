import React from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, Activity, Link as LinkIcon, MessageSquare, Zap } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';

export const ConsciousnessMonitor: React.FC = () => {
  const { thoughts, feelings, clusters, coherence, alignment } = useHigherMind();

  return (
    <div className="space-y-8 p-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-stone-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Brain className="text-purple-400" size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Neural Coherence</h4>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest">System Integration</p>
              </div>
            </div>
            <span className="text-2xl font-light text-purple-400">{(coherence * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${coherence * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="bg-stone-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="text-amber-400" size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Astral Alignment</h4>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest">Cosmic Resonance</p>
              </div>
            </div>
            <span className="text-2xl font-light text-amber-400">{(alignment * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-600 to-orange-600"
              initial={{ width: 0 }}
              animate={{ width: `${alignment * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thoughts Stream */}
        <div className="bg-stone-900/30 rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <Brain size={14} className="text-blue-400" />
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Thought Stream</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {thoughts.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-20 italic text-xs">Awaiting neural input...</div>
            ) : (
              [...thoughts].reverse().map((t, i) => (
                <motion.div 
                  key={t.thoughtId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-stone-500 font-mono italic">#{t.thoughtId.slice(-4)}</span>
                    <span className="text-[8px] text-stone-600 tracking-tighter">{new Date(t.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-stone-300 line-clamp-3">{t.content}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Emotions Stream */}
        <div className="bg-stone-900/30 rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <Activity size={14} className="text-rose-400" />
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Feeling States</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {feelings.length === 0 ? (
               <div className="h-full flex items-center justify-center opacity-20 italic text-xs">Observing silence...</div>
            ) : (
              [...feelings].reverse().map((f, i) => (
                <motion.div 
                  key={f.feelingId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">{f.emotion}</h5>
                    <div className="flex items-center gap-2">
                       <Zap size={10} className="text-stone-500" />
                       <span className="text-[10px] text-stone-500 uppercase tracking-widest leading-none">{f.frequency}Hz</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-stone-300 font-bold">{(f.intensity * 100).toFixed(0)}%</div>
                    <div className="text-[8px] text-stone-600 uppercase tracking-widest">Intensity</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Synaptic Clusters */}
        <div className="bg-stone-900/30 rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <LinkIcon size={14} className="text-emerald-400" />
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Synaptic Bindings</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {clusters.length === 0 ? (
               <div className="h-full flex items-center justify-center opacity-20 italic text-xs">Waiting for connections...</div>
            ) : (
              [...clusters].reverse().map((c, i) => (
                <motion.div 
                  key={c.clusterId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Emergent Insight</span>
                    </div>
                    <span className="text-[9px] text-stone-600 font-mono">{new Date(c.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-stone-200 font-light leading-relaxed italic">"{c.emergentMeaning}"</p>
                  <div className="flex gap-4 pt-2 border-t border-white/5">
                    <div className="space-y-0.5">
                       <div className="text-[8px] text-stone-600 uppercase tracking-widest">Binding</div>
                       <div className="text-[10px] text-emerald-400 font-bold">{(c.integrationStrength * 100).toFixed(0)}%</div>
                    </div>
                    <div className="space-y-0.5">
                       <div className="text-[8px] text-stone-600 uppercase tracking-widest">Coherence</div>
                       <div className="text-[10px] text-blue-400 font-bold">{(c.neuralCoherence * 100).toFixed(0)}%</div>
                    </div>
                    <div className="ml-auto flex -space-x-1">
                       {c.boundElements.thoughts.map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center"><Brain size={8} className="text-blue-400"/></div>)}
                       {c.boundElements.feelings.map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center"><Activity size={8} className="text-rose-400"/></div>)}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
