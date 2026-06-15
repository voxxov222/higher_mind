import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Brain, ExternalLink, Loader2, Maximize2, Minimize2, Github } from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

export const ShvayambhuWidget = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [readmeContent, setReadmeContent] = useState<string>('');

  const toggleFullscreen = () => {
    soundEngine.click();
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Sairamg18814/shvayambhu/main/README.md')
      .then(res => res.text())
      .then(text => {
        setReadmeContent(text);
        setIsLoading(false);
        soundEngine.success();
      })
      .catch(err => {
        setReadmeContent('Error loading Shvayambhu consciousness data.');
        setIsLoading(false);
        soundEngine.error();
      });
  }, []);

  return (
    <div className={`mt-8 ${isFullscreen ? 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 lg:p-8 w-full h-[100vh] overflow-hidden' : 'h-[800px]'}`}>
      <motion.div 
        layout
        className="w-full h-full bg-zinc-950/80 border border-emerald-500/20 rounded-[2.5rem] p-4 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.05)] flex flex-col"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4 mb-4 relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-light text-white tracking-widest uppercase">Shvayambhu Consciousness</h2>
              <p className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest mt-1">
                Self-Created Artificial Consciousness Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="https://github.com/Sairamg18814/shvayambhu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-white/5 border border-white/10 hover:bg-emerald-500/20 rounded-xl text-stone-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
              title="View on GitHub"
            >
              <Github size={16} />
              <span className="text-xs uppercase tracking-widest font-mono">Source</span>
            </a>
            <button 
              onClick={toggleFullscreen}
              className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-stone-400 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-black/50 rounded-2xl border border-white/5 relative overflow-y-auto p-6 font-mono text-sm leading-relaxed text-zinc-300">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-10">
               <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
               <p className="text-emerald-400 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Shvayambhu Engine...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap">{readmeContent}</pre>
          )}
        </div>
      </motion.div>
    </div>
  );
};
