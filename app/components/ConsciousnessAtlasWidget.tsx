import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, ExternalLink, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

export const ConsciousnessAtlasWidget = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleFullscreen = () => {
    soundEngine.click();
    setIsFullscreen(!isFullscreen);
  };

  const handleLoad = () => {
    soundEngine.success();
    setIsLoading(false);
  };

  return (
    <div className={`mt-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 lg:p-8 w-full h-[100vh] overflow-hidden' : 'h-[800px]'}`}>
      <motion.div 
        layout
        className="w-full h-full bg-zinc-950/80 border border-cyan-500/20 rounded-[2.5rem] p-4 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.05)] flex flex-col"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4 mb-4 relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-light text-white tracking-widest uppercase">Consciousness Atlas</h2>
              <p className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest mt-1">
                Robert Lawrence Kuhn's Landscape Mapping
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="https://consciousnessatlas.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-stone-400 hover:text-cyan-400 transition-colors"
              title="Open external atlas"
            >
              <ExternalLink size={16} />
            </a>
            <button 
              onClick={toggleFullscreen}
              className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-stone-400 hover:text-white transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-black/50 rounded-2xl border border-white/5 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-10">
               <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
               <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Consciousness Atlas...</p>
            </div>
          )}
          <iframe 
            src="https://consciousnessatlas.com" 
            title="Consciousness Atlas"
            className="w-full h-full border-0 absolute inset-0 z-0"
            onLoad={handleLoad}
          />
        </div>
      </motion.div>
    </div>
  );
};
