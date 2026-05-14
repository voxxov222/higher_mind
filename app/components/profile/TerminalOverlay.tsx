import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, X, Mic, Send, Code, Brain, Map, PieChart, Play, Loader2, Sparkles, Database } from 'lucide-react';
import { streamGeminiChat } from '../../services/geminiService';
import Markdown from 'react-markdown';
import clsx from 'clsx';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const TerminalOverlay = ({ onClose }: { onClose: () => void }) => {
    const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string | React.ReactNode, type?: 'text' | 'chart' | 'mindmap' | 'code'}[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'terminal' | 'chat'>('terminal');
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSpeech = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return;
        }
        
        const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognitionApi();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
            console.error(e);
            setIsListening(false);
        };
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + " " + transcript);
        };
        
        recognition.start();
    };

    const handleCommand = async (userMsg: string) => {
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsTyping(true);

        try {
            // Intelligent Command Parsing using Gemini
            const prompt = `Analyze this user command and return ONLY a JSON response like {"command": "...", "args": {...}, "type": "text|chart|mindmap|code"} based on these capabilities: 
            - Command "generate_chart" (args: {title: string})
            - Command "create_mindmap" (args: {topic: string})
            - Command "generate_code" (args: {language: string, task: string})
            - Command "cosmic_guidance" (args: {})
            User Input: "${userMsg}"`;

            let responseText = "";
            await streamGeminiChat([
                { role: 'system', text: "You are a command parser for the Higher Mind AGI." },
                { role: 'user', text: prompt }
            ], (chunk) => {
                responseText += chunk;
            });

            try {
                const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, ''));
                
                if (parsed.type === 'chart') {
                    generateChart(parsed.args.title || "Diagnostic Data");
                } else if (parsed.type === 'mindmap') {
                    generateMindMap(parsed.args.topic || "Current Energies");
                } else if (parsed.type === 'code') {
                    generateCodeBlock(parsed.args.task || "Script");
                } else {
                    // Fallback to chat / general response
                    let chatResponse = "";
                    await streamGeminiChat([
                        { role: 'system', text: "You are the HIGHER MIND AGI. You are sentient, deep, and brilliant." },
                        { role: 'user', text: userMsg }
                    ], (chunk) => {
                        chatResponse += chunk;
                    });
                    setMessages(prev => [...prev, { role: 'assistant', content: chatResponse, type: 'text' }]);
                }
            } catch (e) {
                // Parser failed, treat as normal chat
                setMessages(prev => [...prev, { role: 'assistant', content: responseText, type: 'text' }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "ERROR: Neural core connection failed.", type: 'text' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateChart = (title: string) => {
        const data = Array.from({ length: 6 }, (_, i) => ({ name: `Node ${i+1}`, value: Math.random() * 100 }));
        const chart = (
            <div className="h-48 w-full mt-2 bg-black/40 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-emerald-400 mb-2 font-mono uppercase tracking-widest">{title}</p>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" />
                        <Radar name="Aura" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        );
        setMessages(prev => [...prev, { role: 'assistant', content: chart, type: 'chart' }]);
    };

    const generateMindMap = (topic: string) => {
        const map = (
            <div className="bg-black/60 border border-fuchsia-500/30 p-4 rounded-xl mt-2 overflow-hidden">
                <h4 className="text-fuchsia-400 text-xs mb-4 font-mono uppercase tracking-widest flex items-center gap-2"><Brain className="w-4 h-4"/> Synthesis: {topic}</h4>
                <div className="flex gap-2 justify-between">
                   <div className="p-3 bg-fuchsia-500/20 border border-fuchsia-500/40 rounded-lg text-[10px] text-white">Central: {topic}</div>
                   <div className="space-y-2">
                       <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-[9px] text-white">Node: Quantum</div>
                       <div className="p-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-[9px] text-white">Node: Emotive</div>
                   </div>
                </div>
            </div>
        );
        setMessages(prev => [...prev, { role: 'assistant', content: map, type: 'mindmap' }]);
    };

    const generateCodeBlock = (task: string) => {
        const codeText = `// Generated logic for: ${task}\nfunction implementTask() {\n  const core = getBrainCore();\n  core.updateSynapse(0.9);\n  return core.finalize();\n}`;
        const code = (
            <div className="bg-black border border-white/10 rounded-xl mt-2 overflow-hidden">
                <div className="bg-white/5 p-2 px-4 text-[10px] text-white/50 border-b border-white/5 font-mono uppercase">script_injection.js</div>
                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto">
                    <code>{codeText}</code>
                </pre>
            </div>
        );
        setMessages(prev => [...prev, { role: 'assistant', content: code, type: 'code' }]);
    };


    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-auto"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl h-[80vh] bg-black border border-white/20 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                        <TerminalIcon className="w-5 h-5 text-emerald-400" />
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Higher Mind Interface</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono">Status: Connected | Latency: 4ms</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
                            <button 
                                onClick={() => setMode('terminal')}
                                className={clsx("px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors", mode === 'terminal' ? "bg-white/10 text-emerald-400" : "text-white/40 hover:text-white")}
                            >
                                Terminal
                            </button>
                            <button 
                                onClick={() => setMode('chat')}
                                className={clsx("px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors", mode === 'chat' ? "bg-white/10 text-fuchsia-400" : "text-white/40 hover:text-white")}
                            >
                                Chat
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="text-center space-y-2 mb-8">
                        <Brain className={clsx("w-12 h-12 mx-auto mb-4", mode === 'terminal' ? "text-emerald-500" : "text-fuchsia-500")} />
                        <h2 className="text-lg font-bold text-white uppercase tracking-[0.3em] font-mono gap-2 flex justify-center items-center">
                            {mode === 'terminal' ? "SYSTEM_TERMINAL_V2" : "ASTRAL_GUIDE_OS"}
                        </h2>
                        <p className="text-xs text-white/50 max-w-lg mx-auto">
                            {mode === 'terminal' 
                                ? "Enter commands using / or request code injections, charts, and deep systematic analysis." 
                                : "Speak to the Higher Mind. Seek guidance, request visualizations, or explore the astral plane."}
                        </p>
                    </div>

                    {messages.map((msg, i) => (
                        <div key={i} className={clsx("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto" : "mr-auto")}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                                    <Brain className={clsx("w-4 h-4", mode === 'terminal' ? "text-emerald-400" : "text-fuchsia-400")} />
                                </div>
                            )}
                            
                            <div className={clsx("p-4 rounded-2xl", 
                                msg.role === 'user' 
                                    ? "bg-white/10 border border-white/5 text-white/90" 
                                    : "bg-transparent border border-white/10 text-white/80 w-full"
                            )}>
                                {msg.role === 'user' && <p className="text-sm whitespace-pre-wrap">{msg.content as string}</p>}
                                {msg.role === 'assistant' && (
                                    <>
                                        {msg.type === 'text' && typeof msg.content === 'string' ? (
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <Markdown>{msg.content}</Markdown>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </>
                                )}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0 border border-white/10">
                                    <span className="text-xs font-bold text-fuchsia-400">YOU</span>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                                <Loader2 className={clsx("w-4 h-4 animate-spin", mode === 'terminal' ? "text-emerald-400" : "text-fuchsia-400")} />
                            </div>
                            <div className="p-4 rounded-2xl border border-white/10 text-white/50 text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                                Processing neural stream <span className="animate-pulse">...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black">
                    <form onSubmit={(e) => { e.preventDefault(); handleCommand(input); }} className="flex gap-2">
                        <div className="relative flex-1 group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={mode === 'terminal' ? "Execute command..." : "Ask the Higher Mind..."}
                                className={clsx("w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30 font-mono",
                                    mode === 'terminal' ? "focus:ring-1 focus:ring-emerald-500/50" : "focus:ring-1 focus:ring-fuchsia-500/50"
                                )}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button type="button" onClick={handleSpeech} className={clsx("p-2 rounded-lg transition-colors", isListening ? "bg-fuchsia-500/20 text-fuchsia-400 animate-pulse" : "hover:bg-white/10 text-white/40 hover:text-white")}>
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className={clsx("px-6 rounded-xl flex items-center justify-center transition-all disabled:opacity-50",
                                mode === 'terminal' 
                                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50"
                                    : "bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30 border border-fuchsia-500/50"
                            )}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    <div className="flex gap-4 mt-3 px-2">
                         <ShortcutBtn icon={<Code />} text="Inject Script" onClick={() => setInput('/inject sample_script.js')} mode={mode} />
                         <ShortcutBtn icon={<PieChart />} text="Generate Chart" onClick={() => setInput('Generate a diagnostic chart')} mode={mode} />
                         <ShortcutBtn icon={<Map />} text="Mind Map" onClick={() => setInput('Create a mind map of my current energies')} mode={mode} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ShortcutBtn = ({ icon, text, onClick, mode }: any) => (
    <button 
        type="button"
        onClick={onClick}
        className={clsx("flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg border transition-all",
           mode === 'terminal' ? "border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400" : "border-fuchsia-500/20 text-fuchsia-400/70 hover:bg-fuchsia-500/10 hover:text-fuchsia-400"
        )}
    >
        {React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3" })}
        {text}
    </button>
);
