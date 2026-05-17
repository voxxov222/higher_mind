import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Database, Image as ImageIcon, Zap, Globe, Video, Scan, Bolt, Brain, Activity, Settings2 } from 'lucide-react';
import { useHigherMind, AIModule } from './HigherMindProvider';
import { soundEngine } from '../lib/soundEffects';

interface HigherMindSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HigherMindSettings: React.FC<HigherMindSettingsProps> = ({ isOpen, onClose }) => {
  const { aiModules, toggleModule } = useHigherMind();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'volume-2': return <Volume2 className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'zap': return <Zap className="w-5 h-5" />;
      case 'globe': return <Globe className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'scan': return <Scan className="w-5 h-5" />;
      case 'bolt': return <Bolt className="w-5 h-5" />;
      case 'brain': return <Brain className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const categories = [
    { id: 'intelligence', name: 'Intelligence Lattice', icon: <Brain className="w-4 h-4" /> },
    { id: 'vision', name: 'Vision Matrix', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'audio', name: 'Vocal Resonance', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'data', name: 'Terrestrial Data', icon: <Globe className="w-4 h-4" /> },
    { id: 'system', name: 'Core Systems', icon: <Settings2 className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-stone-950 border border-white/10 rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden"
          >
            <div className="flex flex-col h-[70vh]">
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-white tracking-tight">Higher Mind Interface</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">AI Module configuration matrix</p>
                  </div>
                </div>
                <button 
                  onClick={() => { soundEngine.close(); onClose(); }}
                  onMouseEnter={() => soundEngine.hover()}
                  className="p-3 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-colors"
                >
                  <X />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(cat => {
                    const modulesInCat = aiModules.filter(m => m.category === cat.id);
                    if (modulesInCat.length === 0) return null;

                    return (
                      <div key={cat.id} className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-purple-400 opacity-60">{cat.icon}</span>
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">{cat.name}</h3>
                        </div>
                        <div className="space-y-2">
                          {modulesInCat.map(module => (
                            <motion.button
                              key={module.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { soundEngine.click(); toggleModule(module.id); }}
                              onMouseEnter={() => soundEngine.hover()}
                              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                                module.enabled 
                                  ? 'bg-white/5 border-purple-500/30 shadow-lg shadow-purple-500/5' 
                                  : 'bg-transparent border-white/5 opacity-50 grayscale'
                              }`}
                            >
                              <div className={`p-2 rounded-xl border ${
                                module.enabled 
                                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' 
                                  : 'bg-white/5 border-white/10 text-stone-600'
                              }`}>
                                {getIcon(module.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-white truncate">{module.name}</h4>
                                  <div className={`w-2 h-2 rounded-full ${module.enabled ? 'bg-purple-500 animate-pulse' : 'bg-stone-800'}`} />
                                </div>
                                <p className="text-[10px] text-stone-500 mt-1 leading-relaxed line-clamp-1">{module.description}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 bg-black/40 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-stone-400">System Coherence:</span>
                    <span className="text-emerald-400 font-mono">98.42%</span>
                  </div>
                  <div className="text-stone-500">
                    Neural Sync: <span className="text-stone-300">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
