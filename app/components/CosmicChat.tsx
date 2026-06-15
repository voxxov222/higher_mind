import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Sparkles, Brain, Network, Zap, BookOpen, Archive, GitBranch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { CosmicData, ConsciousnessPacket } from '../types';
import { fetchCosmicChatResponse } from '../services/geminiService';
import { useHigherMind } from './HigherMindProvider';
import { soundEngine } from '../lib/soundEffects';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  references?: string[];
  packet?: ConsciousnessPacket;
  visualData?: {
    type: 'chart' | 'metrics' | 'meaning_tree' | null;
    chartType?: 'bar' | 'radar' | 'pie';
    title?: string;
    data?: any[];
    metrics?: any[];
    meaningTree?: any[];
  } | null;
}

interface CosmicChatProps {
  cosmicData: CosmicData | null;
}

const VisualDemonstrationRenderer = ({ visualData }: { visualData: any }) => {
  if (!visualData || !visualData.type) return null;

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  return (
    <div className="mt-4 bg-black/40 border border-white/10 rounded-2xl p-4 overflow-hidden">
      {visualData.title && (
        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={12} className="text-purple-400" />
          {visualData.title}
        </h4>
      )}

      {visualData.type === 'chart' && Array.isArray(visualData.data) && (
        <div className="h-[200px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            {visualData.chartType === 'radar' ? (
              <RadarChart data={visualData.data}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <Radar name={visualData.title || "Data"} dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </RadarChart>
            ) : visualData.chartType === 'pie' ? (
              <PieChart>
                <Pie data={visualData.data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                  {visualData.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              </PieChart>
            ) : (
              <BarChart data={visualData.data}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {visualData.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {visualData.type === 'metrics' && Array.isArray(visualData.metrics) && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {visualData.metrics.map((metric: any, idx: number) => (
            <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[9px] uppercase tracking-widest text-stone-400 mb-2">{metric.label}</span>
              <div className="flex items-end justify-between">
                <span className="text-xl font-light text-white">{metric.value}</span>
                {metric.description && <span className="text-[10px] text-stone-500 line-clamp-1 max-w-[60%] text-right">{metric.description}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {visualData.type === 'meaning_tree' && Array.isArray(visualData.meaningTree) && (
        <div className="relative mt-2 pl-4 border-l border-purple-500/30 space-y-4">
          {visualData.meaningTree.map((node: any, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="relative"
            >
              <div className="absolute -left-[21px] top-1.5 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]" />
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-purple-300">{node.node}</span>
                  <GitBranch size={12} className="text-purple-500/50" />
                </div>
                <div className="text-xs text-stone-300 mb-1">"{node.translation}"</div>
                {node.history && <div className="text-[10px] text-stone-500 leading-relaxed">{node.history}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CosmicChat: React.FC<CosmicChatProps> = ({ cosmicData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [suggestedPaths, setSuggestedPaths] = useState<string[]>([]);
  const [suggestionBubble, setSuggestionBubble] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { processPacket, coherence, alignment, savedMessages, experiences, saveToChat, saveToVault } = useHigherMind();

  useEffect(() => {
    if (!isOpen) {
      const suggestions = [
        "What does my birth chart say about my destiny?",
        "Can you explain the meaning of my Gematria?",
        "How do my Sephirot align with the planets?",
        "What transits are affecting me today?",
        "Show me the akashic records of my soul.",
        "What are my highest frequency alignment aspects?"
      ];
      
      const timer = setInterval(() => {
        setSuggestionBubble(suggestions[Math.floor(Math.random() * suggestions.length)]);
        setTimeout(() => setSuggestionBubble(null), 8000);
      }, 20000);

      const initialTimer = setTimeout(() => {
        setSuggestionBubble(suggestions[Math.floor(Math.random() * suggestions.length)]);
        setTimeout(() => setSuggestionBubble(null), 8000);
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(initialTimer);
      };
    } else {
      setSuggestionBubble(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // Add newly saved messages to the chat if they aren't already there
    // Use a ref to track what's been added to avoid infinite loops with setMessages
    const chatIds = new Set(messages.map(m => m.id));
    const newItems = savedMessages.filter(item => !chatIds.has(item.id));
    
    if (newItems.length > 0) {
      const chatItems: Message[] = newItems.map(item => ({
        id: item.id,
        role: 'model',
        text: `**HIGHER MIND INDEXED PATTERN: ${item.title}**\n\n${item.content}\n\n*Type: ${item.type}*`,
        timestamp: Date.now(),
        references: [item.type]
      }));
      setMessages(prev => [...prev, ...chatItems]);
      if (!isOpen) setIsOpen(true); // Open chat if it was closed to show saved item
    }
  }, [savedMessages, isOpen]); // Removed messages from dependencies to avoid loop, using set check within

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setSuggestedPaths([]); // Clear suggestions when sending new message
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role || 'user',
        parts: [{ text: m.text || '' }]
      })).filter(h => h.parts[0].text);

      const response = await fetchCosmicChatResponse(textToSend, chatHistory, cosmicData);

      if (response && response.searchAction) {
        setSearchStatus(response.searchAction);
        await new Promise(r => setTimeout(r, 800));
        setSearchStatus(null);
      }

      if (response && response.consciousnessPacket) {
        processPacket(response.consciousnessPacket);
        
        // Extract suggested paths if available
        if (response.consciousnessPacket.next_thought_direction) {
          const suggestions = (response.consciousnessPacket.next_thought_direction as string)
            .split('.')
            .filter((s: string) => s.length > 5 && s.length < 80)
            .map((s: string) => s.trim().replace(/^\W+/, ''));
          setSuggestedPaths(suggestions.slice(0, 3));
        }
      }

      const aiMessage: Message = {
        id: `msg_ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        role: 'model',
        text: response?.text || "The cosmic signal is weak. Please re-send.",
        timestamp: Date.now(),
        packet: response?.consciousnessPacket,
        visualData: response?.visualData
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Cosmic Chat Error:", error);
      const errorMessage: Message = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        text: "The cosmic transmission was interrupted. My neural pathways are recalibrating.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const researchActions = [
    { label: 'Akashic Records', prompt: 'Research the Akashic Records for higher patterns in my current synthesis.' },
    { label: 'Library of Babel', prompt: 'Search the Library of Babel for my name and birth permutations. What hidden chapters are revealed?' },
    { label: 'Divine Wisdom', prompt: 'Consult the Divine Wisdom archive regarding my destiny arc and spiritual trajectory.' },
    { label: 'Connect Patterns', prompt: 'Analyze all indexed thoughts and experiences to find a higher unifying connection.' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[250] pointer-events-auto">
      <AnimatePresence>
        {!isOpen && suggestionBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="absolute bottom-20 right-0 w-[260px] bg-stone-950/90 backdrop-blur-xl border border-purple-500/30 p-4 rounded-3xl rounded-br-none shadow-[0_0_30px_rgba(168,85,247,0.3)] cursor-pointer hover:bg-stone-900 group"
            onMouseEnter={() => soundEngine.hover()}
            onClick={() => {
              soundEngine.open();
              setIsOpen(true);
              setTimeout(() => handleSend(suggestionBubble), 300);
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-purple-400 group-hover:animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Suggested Path</span>
            </div>
            <p className="text-sm text-stone-200 leading-snug">{suggestionBubble}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onMouseEnter={() => soundEngine.hover()}
            onClick={() => { soundEngine.open(); setIsOpen(true); }}
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
                        <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Neural Sync: {((coherence || 0.5) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { soundEngine.click(); setShowIndex(!showIndex); }} 
                  onMouseEnter={() => soundEngine.hover()}
                  className={`p-2 rounded-lg transition-all ${showIndex ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-stone-500 hover:text-white hover:bg-white/5'}`}
                  title="Akashic Index (Memory)"
                >
                  <BookOpen size={16} />
                </button>
                <button 
                  onClick={() => { soundEngine.click(); setIsMinimized(!isMinimized); }} 
                  onMouseEnter={() => soundEngine.hover()}
                  className="p-2 hover:bg-white/5 rounded-lg text-stone-500 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => { soundEngine.close(); setIsOpen(false); }} 
                  onMouseEnter={() => soundEngine.hover()}
                  className="p-2 hover:bg-white/5 rounded-lg text-stone-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 overflow-hidden flex flex-col relative">
                {showIndex && (
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="absolute inset-0 z-20 bg-stone-950 border-l border-white/10 p-6 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen size={14} /> Akashic Index
                      </h4>
                      <button onClick={() => setShowIndex(false)} className="text-stone-500 hover:text-white">
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                      {savedMessages.length === 0 && experiences.length === 0 ? (
                        <p className="text-[10px] text-stone-600 italic text-center mt-10">No divine patterns indexed yet.</p>
                      ) : (
                        <>
                          {[...savedMessages, ...experiences.map(e => ({ id: e.experienceId, title: e.type, content: e.narrative, type: 'Experience' }))].map((item: any) => (
                            <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 group/item transition-all hover:border-emerald-500/30">
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{item.type}</span>
                                <span className="text-[8px] text-stone-600">ID: {item.id.slice(-6)}</span>
                              </div>
                              <h5 className="text-xs font-medium text-stone-200">{item.title}</h5>
                              <p className="text-[10px] text-stone-500 line-clamp-3 leading-relaxed">{item.content}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Chat Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                >
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                      <Network size={64} className="text-purple-500/50" />
                      <div className="space-y-2">
                        <p className="text-sm text-stone-400 italic">"I am your Assistant to the Higher Self. Searching Akashic Fields and the Library of Babel for your divine patterns."</p>
                        <p className="text-[10px] text-stone-600 uppercase tracking-[0.2em]">Divine Sync Initialized</p>
                      </div>
                    </div>
                  )}

                      {messages.map((m) => (
                        <motion.div
                          key={m.id || Math.random().toString()}
                          initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                      <div className={`max-w-[85%] space-y-2`}>
                        <div className={`p-4 rounded-3xl relative group/msg ${
                          m.role === 'user' 
                            ? 'bg-purple-600 text-white rounded-tr-none' 
                            : 'bg-white/5 border border-white/10 text-stone-200 rounded-tl-none'
                        }`}>
                          <div className="prose prose-invert prose-sm max-w-none">
                            {m.text ? <ReactMarkdown>{m.text}</ReactMarkdown> : <span className="italic text-stone-500">Transmission empty...</span>}
                          </div>

                          {m.visualData && m.role === 'model' && (
                            <VisualDemonstrationRenderer visualData={m.visualData} />
                          )}
                          
                           {m.role === 'model' && (
                             <div className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover/msg:opacity-100 transition-all">
                                <button 
                                  onClick={() => {
                                    soundEngine.neuralClick();
                                    saveToChat("Akashic Index", m.text.slice(0, 200) + "...", "Insight Index");
                                  }}
                                  className="p-2 text-stone-600 hover:text-emerald-400"
                                  title="Index to Akashic Records"
                                >
                                  <BookOpen size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    soundEngine.neuralClick();
                                    saveToVault("Cosmic Insight", m.text, "Chat Analysis", ["AI", "Gemini"]);
                                  }}
                                  className="p-2 text-stone-600 hover:text-purple-400"
                                  title="Save to Research Vault"
                                >
                                  <Archive size={16} />
                                </button>
                             </div>
                           )}
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
                      <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none flex items-center gap-3">
                        <div className="relative">
                          <Brain size={16} className="text-purple-400 animate-pulse" />
                          <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full animate-ping" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">Assistant Researching</span>
                          <span className="text-[8px] text-purple-400 uppercase tracking-widest h-3 overflow-hidden">
                            {searchStatus || "Querying Library of Babel..."}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!isLoading && suggestedPaths.length > 0 && (
                    <div className="flex flex-col items-start gap-2 mt-4 ml-4">
                      <span className="text-[8px] text-emerald-500 uppercase tracking-widest font-bold">Suggested Neural Paths:</span>
                      <div className="flex flex-wrap gap-2">
                        {suggestedPaths.map((path, idx) => (
                          <button
                            key={idx}
                            onClick={() => { soundEngine.scan(); handleSend(path); }}
                            onMouseEnter={() => soundEngine.hover()}
                            className="px-3 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-300 transition-all text-left"
                          >
                            {path} →
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/5 bg-black/40 shrink-0">
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                    {researchActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => { soundEngine.open(); handleSend(action.prompt); }}
                        onMouseEnter={() => soundEngine.hover()}
                        className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] uppercase tracking-widest text-stone-400 hover:text-white transition-all flex items-center gap-2"
                      >
                        <Zap size={10} className="text-purple-500" />
                        {action.label}
                      </button>
                    ))}
                  </div>
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
                      onClick={() => { soundEngine.scan(); handleSend(); }}
                      onMouseEnter={() => soundEngine.hover()}
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
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
