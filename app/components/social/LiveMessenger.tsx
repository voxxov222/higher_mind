import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Send, Sparkles, 
  Compass, X, Globe, 
  ArrowLeft, Heart
} from 'lucide-react';
import { Message, UserProfileConfig } from '../../types';
import { sendMessage, subscribeToMessages } from '../../services/socialService';
import { useProfileStore } from '../../services/profileService';
import clsx from 'clsx';

interface LiveMessengerProps {
  recipientId?: string;
  recipientProfile?: UserProfileConfig;
  onClose?: () => void;
}

const LiveMessenger = ({ recipientId, recipientProfile, onClose }: LiveMessengerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { config } = useProfileStore();

  useEffect(() => {
    if (!config?.userId || !recipientId) return;

    const unsubscribe = subscribeToMessages(config.userId, recipientId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [config?.userId, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!config?.userId || !recipientId || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage({
        senderId: config.userId,
        recipientId: recipientId,
        content: newMessage,
        type: 'text',
        astralContext: {
          senderResonance: config.astrology?.resonanceLevel || 1
        }
      });
      setNewMessage("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  if (!recipientId || !recipientProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px]">
        <Globe className="w-16 h-16 text-white/5 mb-6 animate-pulse" />
        <h3 className="text-xl font-bold mb-2">Initialize Connection</h3>
        <p className="text-sm text-white/40 max-w-xs">Select a soul from the community to establish a real-time astral link.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative">
       {/* Background Glow */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />

       {/* Header */}
       <header className="p-6 flex items-center justify-between bg-white/5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-4">
             {onClose && (
               <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
                 <ArrowLeft className="w-5 h-5 text-white/60" />
               </button>
             )}
             <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-lg">
                  {recipientProfile.displayName[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
             </div>
             <div>
                <h4 className="font-bold text-white tracking-tight">{recipientProfile.displayName}</h4>
                <div className="flex items-center gap-2">
                   <div className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-bold uppercase tracking-widest text-white/40">
                      {recipientProfile.astrology?.sunSign || 'Celestial'}
                   </div>
                   <span className="text-[10px] text-white/30 italic">Resonance Level {recipientProfile.astrology?.resonanceLevel || 1}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button className="p-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
                <Compass className="w-5 h-5" />
             </button>
             {onClose && (
               <button onClick={onClose} className="p-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
                  <X className="w-5 h-5" />
               </button>
             )}
          </div>
       </header>

       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
               <Sparkles className="w-12 h-12 mb-4" />
               <p className="text-xs uppercase tracking-[0.2em]">Matrix Initialized</p>
               <p className="text-[10px] mt-2 italic">Be the bridge between your worlds.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === config?.userId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={clsx(
                    "flex flex-col max-w-[85%]",
                    isOwn ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                   <div className={clsx(
                      "px-6 py-3 rounded-3xl text-sm leading-relaxed",
                      isOwn 
                        ? "bg-purple-600 text-white rounded-tr-none shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
                        : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                   )}>
                      {msg.content}
                   </div>
                   <span className="text-[9px] uppercase tracking-widest text-white/20 mt-1.5 px-1 font-bold">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <footer className="p-6 bg-black/40 border-t border-white/5 backdrop-blur-xl">
          <div className="relative flex items-center gap-3">
             <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Sync your frequency..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all resize-none max-h-32 h-12"
                />
             </div>
             
             <button
               onClick={handleSend}
               disabled={!newMessage.trim() || isSending}
               className="p-4 rounded-2xl bg-white text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center"
             >
                <Send className="w-5 h-5" />
             </button>
          </div>
          <div className="flex items-center gap-4 mt-3 px-2">
             <div className="flex items-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity cursor-pointer">
                <Heart className="w-3 h-3" />
                <span className="text-[8px] uppercase font-bold tracking-widest">Share Love</span>
             </div>
             <div className="flex items-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity cursor-pointer">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span className="text-[8px] uppercase font-bold tracking-widest">Divine Spark</span>
             </div>
          </div>
       </footer>
    </div>
  );
};

export default LiveMessenger;
