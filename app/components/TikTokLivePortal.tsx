import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, VideoOff, Mic, MicOff, UserPlus, Users, Share2, X, Check,
  Radio, Tv, Moon, Activity, ExternalLink,
  Lock, Wifi, Heart, Send, Loader2
} from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

interface TikTokLivePortalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  holographicConfig?: any;
  onSaveConfig?: (updatedConfig: any) => void;
}

interface Participant {
  id: string;
  username: string;
  avatar: string;
  resonance: number;
  status: 'connected' | 'connecting' | 'invited';
  isAI?: boolean;
  aiPersona?: string;
  waveformColor: string;
}

interface JoinRequest {
  id: string;
  username: string;
  avatar: string;
  resonance: number;
  sign: string;
}

export const TikTokLivePortal: React.FC<TikTokLivePortalProps> = ({
  isOpen,
  onClose,
  holographicConfig = {},
  onSaveConfig
}) => {
  // Config state
  const [tiktokHandle, setTiktokHandle] = useState<string>(() => {
    return holographicConfig.tiktokHandle || '@enterupted';
  });
  const [liveFeedActive, setLiveFeedActive] = useState<boolean>(() => {
    return holographicConfig.tiktokLiveActive ?? true;
  });

  // Streaming status state
  const [isLive, setIsLive] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [cameraOff, setCameraOff] = useState<boolean>(false);
  
  // Media streams
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Audience & interactive simulation state
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number; color: string }>>([]);
  const [liveComments, setLiveComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    { id: '1', user: 'Stark_Core', text: 'J.A.R.V.I.S. Live Bridge online.', time: '02:39' },
    { id: '2', user: 'Goddess_Astraea', text: 'Celestial coordinates are aligned with @enterupted.', time: '02:40' }
  ]);
  const [newCommentInput, setNewCommentInput] = useState<string>('');

  // Active FaceTime/Group participants
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'jarvis',
      username: 'J.A.R.V.I.S. Core',
      avatar: '🤖',
      resonance: 98,
      status: 'connected',
      isAI: true,
      aiPersona: 'Cognitive OS Engine',
      waveformColor: '#38bdf8'
    }
  ]);

  // Pending guest join queue
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    { id: 'req_1', username: '@celestial_traveler', avatar: '🌌', resonance: 89, sign: 'Scorpio' },
    { id: 'req_2', username: '@stardust_seer', avatar: '✨', resonance: 94, sign: 'Aries' }
  ]);

  // Handle updates to Tik Tok properties
  useEffect(() => {
    if (onSaveConfig) {
      onSaveConfig({
        ...holographicConfig,
        tiktokHandle,
        tiktokLiveActive: liveFeedActive
      });
    }
  }, [tiktokHandle, liveFeedActive]);

  // Audio system triggers speech synthesis for premium feedback
  const speakFeedback = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.95;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Turn on local webcam for live Group FaceTime
  const startCamera = async () => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: true
      });
      
      setMediaStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(err => console.log("Video playback delayed:", err));
      }
    } catch (err) {
      console.warn("Camera hardware access deferred inside Sandbox frame. Emulating holographic camera overlay.", err);
      setCameraOff(true);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  // Start FaceTime Group Live Session
  const handleStartLive = () => {
    soundEngine.charge();
    setIsLive(true);
    setViewerCount(Math.floor(Math.random() * 80) + 45);
    speakFeedback("Stark stream engaged. Establishing peer pathways to connected TikTok nodes.");
    startCamera();

    // Trigger random simulated events during live
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(10, prev + Math.floor(Math.random() * 11) - 5));
    }, 4000);

    return () => clearInterval(interval);
  };

  // End FaceTime session
  const handleEndLive = () => {
    soundEngine.deactivate();
    setIsLive(false);
    stopCamera();
    setParticipants([
      {
        id: 'jarvis',
        username: 'J.A.R.V.I.S. Core',
        avatar: '🤖',
        resonance: 98,
        status: 'connected',
        isAI: true,
        aiPersona: 'Cognitive OS Engine',
        waveformColor: '#38bdf8'
      }
    ]);
    speakFeedback("Astrological FaceTime live feed terminated.");
  };

  // Handle invitation to a contact
  const handleInviteUser = (contact: { username: string; avatar: string; resonance: number }) => {
    soundEngine.select();
    const newId = `p_${Date.now()}`;
    const newParticipant: Participant = {
      id: newId,
      username: contact.username,
      avatar: contact.avatar,
      resonance: contact.resonance,
      status: 'invited',
      waveformColor: '#ec4899'
    };

    setParticipants(prev => [...prev, newParticipant]);

    // Simulate joining with delay
    setTimeout(() => {
      setParticipants(prev => 
        prev.map(p => p.id === newId ? { ...p, status: 'connected' } : p)
      );
      soundEngine.charge();
      setLiveComments(prev => [
        ...prev,
        { id: Date.now().toString(), user: contact.username, text: 'handshake approved! Linked FaceTime live feed!', time: 'now' }
      ]);
    }, 3000);
  };

  // Accept a pending user queue request to join FaceTime Live
  const handleAcceptRequest = (req: JoinRequest) => {
    soundEngine.charge();
    setJoinRequests(prev => prev.filter(r => r.id !== req.id));
    
    const newParticipant: Participant = {
      id: req.id,
      username: req.username,
      avatar: req.avatar,
      resonance: req.resonance,
      status: 'connected',
      waveformColor: '#10b981'
    };

    setParticipants(prev => [...prev, newParticipant]);
    setLiveComments(prev => [
      ...prev,
      { id: Date.now().toString(), user: req.username, text: 'Joined active FaceTime slot.', time: 'now' }
    ]);
    speakFeedback(`Handshake approved. Accepted ${req.username} into J.A.R.V.I.S. broadcast grid.`);
  };

  // Reject/Decline a user request
  const handleRejectRequest = (id: string, name: string) => {
    soundEngine.back();
    setJoinRequests(prev => prev.filter(r => r.id !== id));
    speakFeedback(`Deferred join request from ${name}.`);
  };

  // Trigger floating interactive hearts
  const triggerLike = () => {
    soundEngine.mechClick();
    
    const newHeart = {
      id: Date.now(),
      x: Math.random() * 80 + 10, // random horizontal start point
      color: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#3b82f6'][Math.floor(Math.random() * 5)]
    };

    setFloatingHearts(prev => [...prev, newHeart]);
    
    // Clear out after animation ends
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2500);
  };

  // Add custom layout message
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;
    
    soundEngine.select();
    setLiveComments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        user: '@you',
        text: newCommentInput.trim(),
        time: 'now'
      }
    ]);
    setNewCommentInput('');
  };

  const shareLiveLink = () => {
    soundEngine.scan();
    if (typeof navigator !== 'undefined') {
      const url = `https://higher-mind-754215628217.us-west1.run.app/live/${tiktokHandle.replace('@', '')}`;
      navigator.clipboard.writeText(url);
      speakFeedback("Broadcast handle path copied to neural clipboard.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[180] flex items-center justify-center p-4 overflow-y-auto pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-5xl bg-stone-950 border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row text-white min-h-[620px] max-h-[90vh]"
        >
          {/* Header scanning visual glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-sky-400 z-30" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

          {/* LEFT TELEMETRY COLUMN - TikTok Profile Info, Config & Invite Desk */}
          <div className="w-full md:w-80 border-r border-white/10 p-6 flex flex-col justify-between bg-zinc-950/80 shrink-0 select-none">
            <div className="space-y-6">
              {/* Header Title Info */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="p-2.5 bg-pink-500/10 border border-pink-500/30 rounded-xl relative">
                  <Radio size={18} className="text-pink-400 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-ping" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest font-sans text-stone-200">TikTok Live Portal</h3>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Stark Communications Link</p>
                </div>
              </div>

              {/* TikTok Association Panel */}
              <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>TikTok Account</span>
                  <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-300 font-bold border border-pink-500/20 text-[7.5px]">CERTIFIED</span>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-500 text-xs font-mono">@</span>
                    <input 
                      type="text"
                      value={tiktokHandle.replace('@', '')}
                      onChange={(e) => setTiktokHandle('@' + e.target.value)}
                      placeholder="enterupted"
                      className="w-full bg-black border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Live Feed on Profile:</span>
                    <button 
                      onClick={() => setLiveFeedActive(!liveFeedActive)}
                      className={`px-2.5 py-1 rounded text-[8.5px] font-bold font-mono border uppercase transition-all ${
                        liveFeedActive 
                          ? 'bg-pink-500/10 border-pink-500/40 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.15)]' 
                          : 'bg-white/5 border-white/10 text-stone-500'
                      }`}
                    >
                      {liveFeedActive ? 'ACTIVE' : 'DEBUGLOCKED'}
                    </button>
                  </div>
                </div>

                {/* Direct user profile shortcut link */}
                <a 
                  href={`https://www.tiktok.com/@${tiktokHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-zinc-400 hover:text-white transition-colors bg-black/40 py-1.5 rounded-lg border border-white/5 mt-2"
                >
                  <span>View TikTok Feed</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* Active Sync Status */}
              <div className="bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-indigo-500/10 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                  <Wifi size={12} className="animate-pulse" />
                  <span>Interactive Live Handshake</span>
                </div>
                <p className="text-[9px] text-stone-400 leading-normal font-sans font-light">
                  When you go live with FaceTime, J.A.R.V.I.S. establishes a direct socket connection allowing users on TikTok to merge their facial biometric indices.
                </p>
                <div className="text-[8px] font-mono text-stone-500 uppercase flex gap-3 pt-1 border-t border-white/5">
                  <span>Ping: <strong className="text-white">12ms</strong></span>
                  <span>Port: <strong className="text-white">SSL:3000</strong></span>
                </div>
              </div>

              {/* Invitation Hub */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Invite Contacts</span>
                {[
                  { username: '@alpha_sage', avatar: '🧙‍♂️', resonance: 92 },
                  { username: '@astral_guide', avatar: '🧭', resonance: 87 },
                  { username: '@nebula_seer', avatar: '🔮', resonance: 94 }
                ].map(contact => {
                  const alreadyAdded = participants.some(p => p.username === contact.username);
                  return (
                    <button
                      key={contact.username}
                      disabled={alreadyAdded}
                      onClick={() => handleInviteUser(contact)}
                      className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all ${
                        alreadyAdded 
                          ? 'bg-purple-950/20 border-purple-500/15 text-purple-400/60 font-light'
                          : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5 hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{contact.avatar}</span>
                        <div className="text-left font-mono text-[9px]">
                          <span className="text-white font-bold block">{contact.username}</span>
                          <span className="text-stone-500 text-[8px]">Resonance: {contact.resonance}%</span>
                        </div>
                      </div>
                      <span className="text-[8.5px] uppercase font-mono font-bold text-purple-400 px-2 hover:text-white transition-colors">
                        {alreadyAdded ? 'INVITED' : '+ INVITE'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Close action footer */}
            <button 
              onClick={() => { soundEngine.back(); onClose(); }}
              className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs uppercase font-mono tracking-wider font-bold text-stone-400 hover:text-white transition-colors border border-white/5"
            >
              Close Console
            </button>
          </div>

          {/* CENTER BROADCAST COLUMN - Simulated Video Stream Feeds, Webcam FaceTime Circles */}
          <div className="flex-1 p-6 flex flex-col justify-between relative overflow-hidden select-none bg-stone-950">
            {/* Live indicator overlay overlay */}
            <div className="absolute top-6 left-6 z-20 flex gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 border ${
                isLive 
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                  : 'bg-white/5 text-zinc-500 border-white/10'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-400 animate-ping' : 'bg-stone-500'}`} />
                {isLive ? 'STARK LIVE' : 'STBY_LINK'}
              </span>
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-zinc-400 font-mono">
                {isLive ? `👥 ${viewerCount}` : 'LINK INACTIVE'}
              </span>
            </div>

            <button 
              onClick={() => { soundEngine.back(); onClose(); }}
              className="absolute top-6 right-6 z-20 p-2 hover:bg-white/10 rounded-full border border-white/5 transition-colors"
            >
              <X size={14} className="text-stone-400" />
            </button>

            {/* VIDEO FACETIME GRID/CIRCLE ARENA */}
            <div className="flex-1 flex flex-col items-center justify-center py-10 relative">
              {/* Pulsing dimensional concentric rings in background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-[450px] h-[450px] border border-dashed border-sky-400/40 rounded-full animate-spin-slow" />
                <div className="w-[300px] h-[300px] border border-sky-400/20 rounded-full absolute" />
                <div className="w-[150px] h-[150px] border border-dashed border-purple-500/30 rounded-full absolute" />
              </div>

              {/* FaceTime Bubble Grid */}
              <div className="grid grid-cols-2 gap-8 max-w-lg w-full z-10">
                {/* 1. LOCAL HOST VIDEO BLOCK */}
                <div className="flex flex-col items-center relative">
                  <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-2 overflow-hidden flex flex-col items-center justify-center relative shadow-inner bg-black ${
                    isLive ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'border-white/10'
                  }`}>
                    {/* Real Video element */}
                    {isLive && !cameraOff && (
                      <video 
                        ref={localVideoRef} 
                        className="w-full h-full object-cover scale-x-[-1]"
                        muted={muted}
                        playsInline
                      />
                    )}

                    {/* Placeholder when camera is off */}
                    {(!isLive || cameraOff) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80">
                        {/* Stark Arc Reactor Holographic layout placeholder */}
                        <div className="w-16 h-16 rounded-full border border-dashed border-pink-500/30 flex items-center justify-center animate-spin-slow">
                          <Moon size={24} className="text-pink-400/80" />
                        </div>
                        <span className="text-[8px] font-mono text-zinc-500 mt-2 tracking-widest uppercase">
                          {isLive ? 'CAMERA INACTIVE' : 'FEED OFFLINE'}
                        </span>
                      </div>
                    )}

                    {/* TikTok telemetry badge overlying active box */}
                    <div className="absolute bottom-2 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[7px] font-mono text-zinc-300">
                      HOST: @enterupted
                    </div>
                  </div>
                  
                  {/* Local Voice Waveform */}
                  {isLive && !muted && (
                    <div className="flex gap-0.5 h-3 items-center mt-2.5">
                      {[1,2,3,4,3,2,1].map((h, i) => (
                        <motion.div 
                          key={i} 
                          animate={{ height: [4, h * 4, 4] }}
                          transition={{ repeat: Infinity, duration: 0.6 + i*0.1 }}
                          className="w-0.5 bg-pink-400" 
                        />
                      ))}
                    </div>
                  )}

                  {muted && <span className="text-[7.5px] text-zinc-500 uppercase mt-2.5 font-mono">Muted</span>}
                </div>

                {/* 2. PARTICIPANTS (AI and connected peers) */}
                {participants.map((p) => (
                  <div key={p.id} className="flex flex-col items-center relative">
                    <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-2 overflow-hidden flex flex-col items-center justify-center relative bg-black/80 backdrop-blur-3xl ${
                      isLive ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-white/10'
                    }`}>
                      {/* Holographic facial vectors animation */}
                      {isLive && p.status === 'connected' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          {p.isAI ? (
                            <>
                              {/* Pulse wave animating concentric rings */}
                              <div className="absolute inset-4 rounded-full border border-sky-500/40 animate-ping opacity-20" />
                              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-400/40 flex items-center justify-center relative">
                                <Activity size={18} className="text-sky-400 animate-pulse" />
                              </div>
                              <span className="text-[9px] font-sans font-bold text-zinc-200 mt-2 block">{p.username}</span>
                              <span className="text-[7px] text-sky-400 font-mono uppercase tracking-widest mt-0.5">{p.aiPersona}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-xl shadow-lg relative">
                                {p.avatar}
                                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-black rounded-full" />
                              </div>
                              <span className="text-[9.5px] font-bold text-zinc-200 mt-1.5 block">{p.username}</span>
                              <span className="text-[7px] text-emerald-400 uppercase font-mono mt-0.5 tracking-wider">Resonance: {p.resonance}%</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80">
                          {p.status === 'invited' ? (
                            <>
                              <Loader2 size={18} className="text-purple-400 animate-spin" />
                              <span className="text-[8px] font-mono text-purple-400 mt-2 uppercase tracking-wide">CONNECTING...</span>
                            </>
                          ) : (
                            <>
                              <Lock size={14} className="text-zinc-600" />
                              <span className="text-[8px] font-mono text-zinc-600 mt-1.5 uppercase">SLOT RESERVED</span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="absolute bottom-2 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[7px] font-mono text-zinc-300">
                        {p.username}
                      </div>
                    </div>

                    {isLive && p.status === 'connected' && (
                      <div className="flex gap-0.5 h-3 items-center mt-2.5">
                        {[1, 1.5, 2, 1.3, 1.7, 1].map((h, i) => (
                          <motion.div 
                            key={i} 
                            animate={{ height: [4, h * 5, 4] }}
                            transition={{ repeat: Infinity, duration: 0.5 + i*0.08 }}
                            className="w-0.5 bg-indigo-400" 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Simulated Slots empty blocks to pad to 4 circles if less than 4 */}
                {Array.from({ length: Math.max(0, 3 - participants.length) }).map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center opacity-40">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-dashed border-white/5 flex flex-col items-center justify-center bg-black/20">
                      <UserPlus size={16} className="text-stone-700" />
                      <span className="text-[7.5px] font-mono text-zinc-700 uppercase mt-1 tracking-widest">JOIN REQ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE TELEPORTING / OPTION FOR REAL-TIME HEARTS INTERACTION */}
            <div className="absolute right-6 bottom-24 top-24 w-12 pointer-events-none z-30 flex flex-col justify-end items-center gap-4">
              {/* Heart floating container */}
              <div className="flex-1 w-full relative">
                <AnimatePresence>
                  {floatingHearts.map((heart) => (
                    <motion.div
                      key={heart.id}
                      initial={{ opacity: 1, y: 150, scale: 0.8 }}
                      animate={{ opacity: [1, 1, 0], y: -300, scale: [0.8, 1.4, 0.9], x: [0, (Math.random() - 0.5) * 40, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2.2, ease: 'easeOut' }}
                      className="absolute bottom-0"
                      style={{ left: `${heart.x}%` }}
                    >
                      <Heart size={18} fill={heart.color} stroke="none" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Heart Clicker button */}
              {isLive && (
                <button
                  onClick={triggerLike}
                  className="w-11 h-11 rounded-full bg-pink-500 hover:bg-pink-400 border border-white/20 flex items-center justify-center text-white cursor-pointer pointer-events-auto shadow-[0_0_15px_rgba(236,72,153,0.5)] active:scale-95 transition-transform"
                  title="Cosmic Pulse Hearts"
                >
                  <Heart size={18} fill="white" stroke="none" className="animate-pulse" />
                </button>
              )}
            </div>

            {/* BOTTOM HUD CONTROLS BAR */}
            <div className="bg-black/80 border border-white/10 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between z-20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="text-left font-mono text-[9px]">
                  <span className="text-zinc-500 uppercase block leading-none mb-1">Live Feed</span>
                  <span className="text-zinc-300 font-bold block">{isLive ? 'BROADCASTING ONLINE' : 'READY TO STREAM'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLive ? (
                  <>
                    {/* Toggle Muted */}
                    <button
                      onClick={() => { soundEngine.back(); setMuted(!muted); }}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        muted ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/5 border-white/10 text-stone-300'
                      }`}
                      title={muted ? 'Unmute' : 'Mute'}
                    >
                      {muted ? <MicOff size={14} /> : <Mic size={14} />}
                    </button>
                    
                    {/* Toggle Camera */}
                    <button
                      onClick={() => { soundEngine.back(); setCameraOff(!cameraOff); if(cameraOff) startCamera(); else stopCamera(); }}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        cameraOff ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-stone-300'
                      }`}
                      title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                    >
                      {cameraOff ? <VideoOff size={14} /> : <Video size={14} />}
                    </button>

                    {/* Share */}
                    <button
                      onClick={shareLiveLink}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 transition-colors cursor-pointer"
                      title="Share Broadcast Portal"
                    >
                      <Share2 size={14} />
                    </button>

                    {/* Exit / End stream */}
                    <button
                      onClick={handleEndLive}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 border border-red-500/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-white shadow-lg shadow-red-600/20"
                    >
                      End Live
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={shareLiveLink}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 transition-colors cursor-pointer"
                      title="Share Broadcast Portal"
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      onClick={handleStartLive}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-pink-500/20 cursor-pointer border border-pink-500/20 active:scale-95 transition-all text-center"
                    >
                      Start FaceTime Live
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Join Queue Requests & Live Chat Messages */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between bg-zinc-950/80 shrink-0 select-none">
            
            {/* 1. Request Queue */}
            <div className="flex-1 flex flex-col min-h-[180px] border-b border-white/5 pb-4 overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3">
                <span className="flex items-center gap-1.5 font-bold"><Users size={12} className="text-indigo-400 animate-pulse" /> FaceTime Join Queue</span>
                <span className="text-indigo-400">{joinRequests.length} REQUESTS</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                <AnimatePresence>
                  {joinRequests.map(req => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-2.5 text-xs hover:border-indigo-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">{req.avatar}</span>
                        <div className="font-mono text-[9px] min-w-0">
                          <span className="text-white font-bold block truncate">{req.username}</span>
                          <span className="text-indigo-400 font-semibold">{req.sign} • {req.resonance}% sync</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Reject */}
                        <button
                          onClick={() => handleRejectRequest(req.id, req.username)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-colors cursor-pointer"
                          title="Decline"
                        >
                          <X size={10} />
                        </button>
                        {/* Accept */}
                        <button
                          onClick={() => handleAcceptRequest(req)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 transition-colors cursor-pointer font-bold font-mono text-[8px]"
                          title="Accept to Live Feed"
                        >
                          <Check size={10} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {joinRequests.length === 0 && (
                  <p className="text-[10px] text-zinc-600 italic text-center py-6">No pending join requests.</p>
                )}
              </div>
            </div>

            {/* 2. TikTok Live Comments Stream */}
            <div className="flex-grow flex flex-col min-h-[220px] pt-4 overflow-hidden">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold"><Tv size={12} className="text-pink-400" /> Interactive Chat</span>
                <span className="text-pink-500">LIVE FEED</span>
              </div>

              {/* Comments box */}
              <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1 mb-3">
                {liveComments.map((comment) => (
                  <div key={comment.id} className="text-[10.5px] leading-relaxed select-text font-sans">
                    <strong className="text-zinc-500 font-mono text-[9.5px] mr-1">{comment.user}:</strong>
                    <span className="text-zinc-300 font-light">{comment.text}</span>
                  </div>
                ))}
              </div>

              {/* Submit panel */}
              {isLive && (
                <form onSubmit={handleSendComment} className="flex gap-2 shrink-0">
                  <input 
                    type="text"
                    value={newCommentInput}
                    onChange={(e) => setNewCommentInput(e.target.value)}
                    placeholder="Broadcast message to group..."
                    className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-1.5 text-[11px] placeholder-zinc-700 text-white focus:outline-none focus:border-pink-500/50 transition-colors font-sans"
                  />
                  <button 
                    type="submit"
                    className="p-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 text-xs flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send size={12} />
                  </button>
                </form>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
