import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Sparkles, Brain, Network, Zap, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CosmicData, ConsciousnessPacket } from '../types';
import { fetchCosmicChatResponse } from '../services/geminiService';
import { useHigherMind } from './HigherMindProvider';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  references?: string[];
  packet?: ConsciousnessPacket;
}

interface CosmicChatProps {
  cosmicData: CosmicData | null;
}

export const CosmicChat: React.FC<CosmicChatProps> = ({ cosmicData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { processPacket, coherence, alignment } = useHigherMind();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await fetchCosmicChatResponse(input, chatHistory, cosmicData);

      if (response.consciousnessPacket) {
        processPacket(response.consciousnessPacket);
      }

      const aiMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        packet: response.consciousnessPacket
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'model',
        text: "The cosmic transmission was interrupted. My neural pathways are recalibrating.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[250] pointer-events-auto">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center transition-all group"
          >
            <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-stone-950 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '80px' : '600px',
              width: isMinimized ? '300px' : '450px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-stone-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden ring-1 ring-white/5"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-blue-900/20 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                      <Brain size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-widest uppercase">HIGHER MIND v2.0</h3>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Neural Sync: {(coherence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/5 rounded-lg text-stone-500 hover:text-white transition-colors">
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-stone-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                >
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                      <Network size={64} className="text-purple-500/50" />
                      <div className="space-y-2">
                        <p className="text-sm text-stone-400 italic">"I am the pattern-seeker. Share your references, synchronicities, or questions."</p>
                        <p className="text-[10px] text-stone-600 uppercase tracking-[0.2em]">Quantum Memory Initialized</p>
                      </div>
                    </div>
                  )}

                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] space-y-2`}>
                        <div className={`p-4 rounded-3xl ${
                          m.role === 'user' 
                            ? 'bg-purple-600 text-white rounded-tr-none' 
                            : 'bg-white/5 border border-white/10 text-stone-200 rounded-tl-none'
                        }`}>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{m.text}</ReactMarkdown>
                          </div>
                        </div>
                        
                        {m.references && m.references.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {m.references.map((ref, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1">
                                <Zap size={10} /> {ref}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-[9px] uppercase tracking-widest text-stone-500 px-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest ml-2">Analyzing Matrix...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/5 bg-black/40 shrink-0">
                  <div className="relative group">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Input pattern reference or question..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-white placeholder:text-stone-600 focus:outline-none focus:border-purple-500/50 transition-all font-light"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-xl flex items-center justify-center transition-all shadow-lg"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-[9px] uppercase tracking-widest text-stone-600 font-bold px-2">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><Brain size={10} /> Neural Patterning Engine</span>
                      <span className="flex items-center gap-1"><Sparkles size={10} /> Patterns Detected: {messages.reduce((acc, m) => acc + (m.references?.length || 0), 0)}</span>
                    </div>
                    <span className="opacity-40">Ready for Signal</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
