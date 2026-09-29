import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, X, Loader2, Database } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface HigherMindExplanationProps {
  sectionName: string;
  topicName: string;
  dataContext: any;
  className?: string;
}

export function HigherMindExplanationButton({ sectionName, topicName, dataContext, className = "" }: HigherMindExplanationProps) {
  const { askHigherMind, archiveIndexSync } = useHigherMind();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleAsk = async () => {
    setIsOpen(true);
    setLoading(true);
    
    // Animate sync process
    archiveIndexSync();
    
    const response = await askHigherMind(sectionName, topicName, dataContext);
    setExplanation(response);
    setLoading(false);
    archiveIndexSync(); // Sync after receiving data
  };

  return (
    <>
      <button 
        onClick={handleAsk}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/40 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] ${className}`}
      >
        <Brain className="w-4 h-4 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider">Ask Higher Mind</span>
        <Sparkles className="w-3 h-3 text-fuchsia-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-3xl max-h-[85vh] bg-stone-900 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-cyan-500/20 border border-cyan-500/50">
                    <Brain className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Higher Mind Analysis
                      <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                    </h3>
                    <p className="text-xs text-cyan-300/70 uppercase tracking-widest">{sectionName} • {topicName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                      <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-cyan-300 font-medium">Accessing Cosmic Database...</p>
                      <p className="text-xs text-fuchsia-400/70 uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-3 h-3" />
                        Archiving to Memory Index
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-cyan max-w-none prose-headings:text-cyan-300 prose-a:text-fuchsia-400 prose-strong:text-cyan-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {explanation || ""}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loading && (
                <div className="p-4 border-t border-white/10 bg-black/40 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <Database className="w-4 h-4" />
                    Stored in Memory Base
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-500/50 transition-colors text-sm font-medium"
                  >
                    Close & Integrate
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
