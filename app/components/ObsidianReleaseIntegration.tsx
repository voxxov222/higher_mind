import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, ExternalLink, Download, Clock, Tag, ChevronRight, Zap, BookOpen } from 'lucide-react';

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
}

export const ObsidianReleaseIntegration = () => {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState<GitHubRelease | null>(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/obsidianmd/obsidian-releases/releases');
        const data = await res.json();
        if (Array.isArray(data)) {
          setReleases(data.slice(0, 10));
        }
      } catch (e) {
        console.error("Failed to fetch obsidian releases", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReleases();
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 bg-zinc-900/30 rounded-[3rem] p-8 border border-white/5 backdrop-blur-3xl overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
            <Github className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-light text-white tracking-widest uppercase">Obsidian Releases</h2>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mt-1">Core Intelligence Repository Integration</p>
          </div>
        </div>
        
        <a 
          href="https://github.com/obsidianmd/obsidian-releases" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-stone-400 hover:text-white transition-all border border-white/10"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest">Hydrating Repository Data...</span>
          </div>
        ) : (
          releases.map((release) => (
            <motion.div
              key={release.tag_name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedRelease(release)}
              className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Tag size={12} className="text-purple-400" />
                    <span className="text-sm font-bold text-white tracking-wide">{release.name || release.tag_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                    <Clock size={10} />
                    {new Date(release.published_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-2 bg-purple-600/10 text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <ChevronRight size={14} />
                </div>
              </div>
              
              <div className="text-xs text-stone-400 line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                {release.body.replace(/#/g, '').slice(0, 150)}...
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all" />
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedRelease && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedRelease(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.1)]"
            >
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-zinc-900/20 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-purple-600/20 text-purple-400 text-[10px] px-3 py-1 rounded-full border border-purple-500/30 uppercase font-black tracking-widest">
                        {selectedRelease.tag_name}
                      </span>
                      <h3 className="text-3xl font-light text-white tracking-tight">{selectedRelease.name || "Release Package"}</h3>
                    </div>
                    <div className="text-xs text-stone-500 uppercase tracking-widest font-bold">
                      Published on {new Date(selectedRelease.published_at).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRelease(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-stone-500 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                   <a 
                    href={selectedRelease.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                   >
                     <Download size={14} /> Download Release
                   </a>
                   <div className="flex items-center gap-2 text-stone-500 text-[10px] uppercase font-bold tracking-widest">
                      <Zap size={14} className="text-orange-400" /> Sync Priority: Critical
                   </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 bg-zinc-900/20 custom-scrollbar">
                 <div className="prose prose-invert prose-purple max-w-none">
                    {selectedRelease.body.split('\n').map((line, i) => (
                      <p key={i} className="text-stone-400 leading-relaxed mine-text-rendering">{line}</p>
                    ))}
                 </div>
              </div>
              
              <div className="p-6 border-t border-white/5 flex items-center justify-between text-[10px] text-stone-600 uppercase font-black tracking-[0.2em]">
                 <span>Obsidian Intelligence Link: {selectedRelease.tag_name}</span>
                 <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><BookOpen size={12} /> Index Verified</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
