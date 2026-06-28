import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Loader2, X, Brain, BookOpen, Layers, Mic, MicOff, Volume2 } from 'lucide-react';
import { CosmicData } from '../services/gemini.server';

interface Message {
  role: 'user' | 'oracle';
  text: string;
}

interface ConceptPopup {
  term: string;
  x: number;
  y: number;
}

export function HigherMindOracleStory({ cosmicData }: { cosmicData: CosmicData }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeConcept, setActiveConcept] = useState<ConceptPopup | null>(null);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            fetchOracleResponse(transcript);
          }
        };

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
           setIsListening(false);
        };
        recognition.onerror = (e: any) => {
           console.warn("Speech recognition error:", e.error);
        };
        recognitionRef.current = recognition;
      }
      synthRef.current = window.speechSynthesis;
    }
    
    return () => {
       if (recognitionRef.current) recognitionRef.current.stop();
       if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speakText = (text: string) => {
    if (!synthRef.current || !isHandsFree) return;
    
    synthRef.current.cancel(); // Stop any current speech
    
    // Strip XML tags for speaking
    const cleanText = text.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Pick a voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google UK English Female") || v.name.includes("Samantha") || v.name.includes("Female")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    
    // When done speaking, resume listening if hands-free
    utterance.onend = () => {
       if (isHandsFree && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e){ console.warn("Could not start recognition:", e); }
       }
    };

    synthRef.current.speak(utterance);
  };

  useEffect(() => {
     if (isHandsFree) {
        if (!isLoading && synthRef.current && !synthRef.current.speaking && recognitionRef.current && !isListening) {
           try { recognitionRef.current.start(); } catch(e){ console.warn("Could not start recognition:", e); }
        }
     } else {
        if (recognitionRef.current) {
           try { recognitionRef.current.stop(); } catch(e){ console.warn("Could not stop recognition:", e); }
        }
        if (synthRef.current) {
           synthRef.current.cancel();
        }
     }
  }, [isHandsFree, isLoading, isListening]);

  const fetchOracleResponse = async (userMessage?: string) => {
    setIsLoading(true);
    try {
      if (userMessage) {
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
      }

      const response = await fetch('/api/oracle-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cosmicData,
          message: userMessage,
          history: messages
        })
      });
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'oracle', text: data.text }]);
        if (isHandsFree) speakText(data.text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      fetchOracleResponse(); // start the story
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConceptClick = (e: React.MouseEvent<HTMLElement>, term: string) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setActiveConcept({
      term,
      x: rect.left,
      y: rect.top - 10
    });
  };

  const parseMessageText = (text: string) => {
    // Regex to find <concept term="Term Name">word</concept>
    const regex = /<concept term="([^"]+)">([^<]+)<\/concept>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, term, displayWord] = match;
      const index = match.index;
      
      // push text before match
      if (index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.substring(lastIndex, index)}</span>);
      }
      
      // push clickable concept
      parts.push(
        <button
          key={index}
          onClick={(e) => handleConceptClick(e, term)}
          className="text-indigo-400 font-semibold underline decoration-indigo-400/30 underline-offset-4 hover:decoration-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 bg-indigo-400/10 px-1.5 rounded-md"
        >
          <Brain size={12} className="inline" />
          {displayWord}
        </button>
      );
      
      lastIndex = index + fullMatch.length;
    }
    
    // push remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-stone-900 border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
             <Sparkles size={24} />
           </div>
           <div>
             <h2 className="text-xl text-white font-light tracking-wide">Higher Mind Oracle Story</h2>
             <p className="text-stone-400 text-sm">An interactive, intelligent narrative of your cosmic journey.</p>
           </div>
        </div>

        <button
            onClick={() => setIsHandsFree(!isHandsFree)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border ${
                isHandsFree 
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'bg-white/5 text-stone-400 border-white/10 hover:bg-white/10'
            }`}
        >
            {isHandsFree ? (
               <>
                  <Volume2 size={16} className="animate-pulse text-indigo-400" /> Hands-Free Active
               </>
            ) : (
               <>
                  <MicOff size={16} /> Hands-Free Mode
               </>
            )}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 space-y-8 bg-gradient-to-b from-stone-900 to-black relative">
         {/* Background graphic */}
         <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <Layers size={400} />
         </div>

         {messages.map((msg, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
            >
               <div className={`max-w-[80%] rounded-2xl p-5 ${msg.role === 'user' ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/20 rounded-tr-sm' : 'bg-white/5 text-stone-200 border border-white/10 rounded-tl-sm backdrop-blur-sm'}`}>
                  {msg.role === 'oracle' && (
                     <div className="flex items-center gap-2 mb-3 text-indigo-400 text-xs tracking-widest uppercase font-bold">
                        <Sparkles size={12} /> Oracle
                     </div>
                  )}
                  <div className="leading-relaxed font-light text-lg space-y-4">
                     {msg.role === 'oracle' ? parseMessageText(msg.text) : msg.text}
                  </div>
               </div>
            </motion.div>
         ))}
         {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-[80%] rounded-2xl p-5 bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-indigo-400" />
                  <span className="text-stone-400 text-sm animate-pulse tracking-wide">The Oracle is consulting the Akashic Records...</span>
               </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-xl z-10">
         <form 
            onSubmit={(e) => { e.preventDefault(); if(input.trim() && !isLoading) { const val = input; setInput(''); fetchOracleResponse(val); } }}
            className="relative"
         >
            <input 
               type="text"
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder={isHandsFree && isListening ? "Listening..." : "Ask the Oracle a question..."}
               className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-light"
               disabled={isLoading || isHandsFree}
            />
            <button 
               type="submit"
               disabled={!input.trim() || isLoading}
               className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <Send size={18} />
            </button>
         </form>
      </div>

      {/* Concept Popover */}
      <AnimatePresence>
         {activeConcept && (
            <ConceptPopover 
               concept={activeConcept} 
               onClose={() => setActiveConcept(null)} 
            />
         )}
      </AnimatePresence>
    </div>
  );
}

function ConceptPopover({ concept, onClose }: { concept: ConceptPopup, onClose: () => void }) {
   const [details, setDetails] = useState('');
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      // Fetch details about the concept
      const fetchDetails = async () => {
         try {
            const res = await fetch('/api/oracle-concept', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ term: concept.term })
            });
            const data = await res.json();
            setDetails(data.text || "Information not found.");
         } catch(e) {
            setDetails("Could not access the cosmic database.");
         } finally {
            setLoading(false);
         }
      };
      fetchDetails();
   }, [concept.term]);

   return (
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
         {/* Backdrop that catches clicks to close */}
         <div className="absolute inset-0 pointer-events-auto bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
         
         <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto w-full max-w-sm bg-stone-900 border border-indigo-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative z-10"
         >
            <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors">
               <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <BookOpen size={18} />
               </div>
               <h3 className="text-lg text-white font-medium">{concept.term}</h3>
            </div>
            
            <div className="text-stone-300 font-light leading-relaxed text-sm">
               {loading ? (
                  <div className="flex items-center gap-2 text-stone-400 animate-pulse">
                     <Loader2 size={14} className="animate-spin" /> Querying Akashic Database...
                  </div>
               ) : (
                  <p>{details}</p>
               )}
            </div>
         </motion.div>
      </div>
   );
}
