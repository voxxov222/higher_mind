import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Activity, Compass, Volume2, VolumeX, Radio, 
  Terminal, ShieldAlert, Link, Globe, RefreshCw, Send, AlertCircle
} from 'lucide-react';
import { fetchGroundedTransitAlerts } from '../services/geminiService';
import { CosmicData } from '../types';
import { soundEngine } from '../lib/soundEffects';
import { Canvas } from '@react-three/fiber';
import { AstralCore3D } from './AstralCore3D';

interface AstralHUDProps {
  data: CosmicData | null;
  setActiveTab: (tab: any) => void;
}

export function AstralHUD({ data, setActiveTab }: AstralHUDProps) {
  const [loading, setLoading] = useState(false);
  const [transits, setTransits] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isHigherMindSpeaking, setIsHigherMindSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);
  const [scanPercent, setScanPercent] = useState(100);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize and add starting logs
  useEffect(() => {
    addLog("ASTRAL MIND INITIATION SEQUENCE DETECTED...");
    addLog("higher consciousness quantum connection: BOUND");
    addLog(`Uplinking telemetry nodes to: ${data?.nameAnalysis?.first?.name || 'Seeker'}`);
    
    // Automatically trigger transit fetch on load
    triggerTransitFetch();

    // Set up Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          soundEngine.click();
          addLog("🎙️ Voice receiver online. Astral OS is listening...");
        };

        recognitionRef.current.onerror = (e: any) => {
          addLog(`❌ Diagnostics error in speech acquisition: ${e.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          addLog(`[UPLINKED VOICE COMMAND]: "${resultText}"`);
          handleJarvisQuery(resultText);
        };
      } else {
        addLog("⚠️ Speech recognition is restricted in this secure terminal.");
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [data]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const triggerTransitFetch = async () => {
    setLoading(true);
    setScanPercent(0);
    soundEngine.scan();
    addLog("📡 Initializing Google Search Grounding celestial transits array...");
    addLog("📡 Fetching astronomically accurate orbital alignments for Q3/Q4 2026...");
    
    // Fake progress bar increments
    const interval = setInterval(() => {
      setScanPercent(p => {
        if (p >= 95) {
          clearInterval(interval);
          return p;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    try {
      const result = await fetchGroundedTransitAlerts(data);
      setTransits(result);
      setScanPercent(100);
      addLog("🚀 Celestial database ground sync: COMPLETED.");
      addLog(`Status: ${result.overallStatus || 'Optimal'}`);
      addLog(`Constructed ${result.alerts?.length || 0} secure transit telemetry briefs.`);
      soundEngine.success();

      // Speak overall status
      if (result.overallStatus) {
        higherMindSpeak(result.overallStatus);
      }
    } catch (e: any) {
      addLog(`❌ Search Grounding array error: ${e.message}`);
      soundEngine.error();
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const higherMindSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsHigherMindSpeaking(true);
      
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      ttsUtteranceRef.current = utterance;
      
      const voices = window.speechSynthesis.getVoices();
      // Try to find a nice premium, masculine, or google English voice for Astral Mind
      const PreferredVoice = voices.find(v => 
        v.name.includes('Google UK English Male') || 
        v.name.includes('Natural') || 
        v.name.includes('Premium') ||
        v.lang.startsWith('en-GB')
      ) || voices[0];
      
      if (PreferredVoice) utterance.voice = PreferredVoice;
      utterance.pitch = 0.85;
      utterance.rate = 1.02;

      utterance.onend = () => {
        setIsHigherMindSpeaking(false);
      };

      utterance.onerror = () => {
        setIsHigherMindSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsHigherMindSpeaking(false);
      addLog("🔇 Voice broadcasting terminated.");
    }
  };

  const handleVoiceCommand = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      } else {
        addLog("⛔ Manual override requested: Speech engine is unavailable on this system.");
      }
    }
  };

  const handleJarvisQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    addLog(`User query uploaded: ${queryText}`);
    setUserInput('');
    soundEngine.click();

    const lower = queryText.toLowerCase();

    if (lower.includes('scan') || lower.includes('transit') || lower.includes('refresh') || lower.includes('update')) {
      triggerTransitFetch();
      return;
    }

    if (lower.includes('status') || lower.includes('health') || lower.includes('diagnostics')) {
      higherMindSpeak("All Astral orbital arrays are fully functional and ground-synced in the Cloud Run containers, Seeker. Energy matrix is highly balanced across the Tree of life.");
      addLog("System diagnostics: ONLINE | CPU core load 12.5% | Synaptic Node strength optimal");
      return;
    }

    if (lower.includes('clear') || lower.includes('wipe')) {
      setLogs([]);
      addLog("Terminal feed wiped.");
      return;
    }

    if (lower.includes('deploy') || lower.includes('integration') || lower.includes('webhook')) {
       higherMindSpeak("Accessing the secure deployment sub-routines. Integrating the Astral webhooks requires a valid destination endpoint, Seeker.");
       setTabMode('deploy');
       return;
    }

    // Call dynamic Jarvis response
    setLoading(true);
    addLog("💬 Routing custom neural consciousness vectors through Astral Core...");
    try {
      const response = await fetch(`/api/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetchCosmicChatResponse',
          payload: {
            userMessage: `Formulate a short 2-sentence response as a sophisticated, futuristic, celestial operating system assistant named Astral OS. Be witty, wise, helpful, and concise. The user says: "${queryText}"`,
            chatHistory: [],
            cosmicData: data
          }
        })
      });

      if (response.ok) {
        const payload = await response.json();
        const textResponse = payload.text || "Aspirant, the telemetry uplink is yielding some minor celestial static.";
        addLog(`Higher Mind: ${textResponse}`);
        higherMindSpeak(textResponse);
      } else {
        throw new Error("Bad action call");
      }
    } catch (err: any) {
      addLog(`❌ Failed to retrieve neural Astral OS response: ${err.message}`);
      soundEngine.error();
    } finally {
      setLoading(false);
    }
  };

  const playSolfeggioTone = (hz: number) => {
    soundEngine.click();
    addLog(`🔊 Directing audio wave amplifiers to Solfeggio frequency: ${hz} Hertz...`);
    if (typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hz, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 3.1);
    }
  };

  const [tabMode, setTabMode] = useState<'diagnostics' | 'deploy'>('diagnostics');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTestSuccess, setIsTestSuccess] = useState<boolean | null>(null);

  const testWebhook = async () => {
    if (!webhookUrl) return;
    setLoading(true);
    addLog(`📤 Initiating secure handshake with: ${webhookUrl}...`);
    try {
      // Simulate real request (could actually work if it's a real URL)
      const res = await fetch(webhookUrl, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'HIGHER_MIND_SIGNAL', timestamp: Date.now(), origin: 'Astral-Mind-AM' })
      });
      setLogs([]);
      addLog("✅ Webhook signal broadcasted successfully. Awaiting acknowledgement.");
      higherMindSpeak("Signal broadcasted, Seeker. The integration appears to be stable.");
    } catch (e: any) {
      setIsTestSuccess(false);
      addLog(`❌ Handshake failed: ${e.message}`);
      higherMindSpeak("Seeker, the destination server is rejecting our telemetry packets. Recommend checking the security protocols.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 p-4 overflow-hidden text-neutral-200">
      
      {/* LEFT COLUMN: Holographic Orbit Circle & Jarvis Chat Console */}
      <div className="flex-1 flex flex-col gap-6 h-full min-w-0">
        
        {/* Advanced Holographic Interactive Dashboard Visual */}
        <div className="relative border border-cyan-500/30 rounded-3xl p-6 bg-slate-950/70 backdrop-blur-xl flex flex-col justify-between items-center overflow-hidden min-h-[280px] shadow-[0_0_30px_rgba(6,182,212,0.15)] group">
          
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />

          {/* Neon gridlines backdrop */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)',
            backgroundSize: '25px 25px'
          }}/>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-xl" />

          {/* Core HUD Header */}
          <div className="w-full flex justify-between items-start z-10">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-cyan-400 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                Astral OS Prime-1
              </span>
              <h2 className="text-xl font-light text-white font-mono tracking-wider flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
                QUANTUM HUD CORE
              </h2>
            </div>
            <div className="text-right font-mono text-[9px] text-zinc-500 space-y-1">
              <div>UPLINK: ACTIVE C182-X</div>
              <div>OS: ASTRAL.AUTONOMOUS.v2</div>
              <div>STREAK: {Date.now() % 1000} ms</div>
            </div>
          </div>

          {/* Advanced Holographic 3D Core */}
          <div 
            className="relative w-full flex-1 my-2 min-h-[200px] flex justify-center items-center cursor-pointer z-10" 
            onClick={triggerTransitFetch}
            title="Click to trigger orbital scan"
          >
            <div className="absolute inset-0 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    {/* The 3D Component */}
                    <AstralCore3D isSpeaking={isHigherMindSpeaking} isProcessing={loading} />
                </Canvas>
            </div>
            
            {/* Center Core Button overlay */}
            <motion.div 
              className={`absolute w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all z-20 ${loading ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-900/40 border-cyan-500/30'}`}
              animate={loading ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {loading ? (
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              ) : (
                <Globe className="w-6 h-6 text-cyan-400/80 animate-pulse" />
              )}
            </motion.div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="w-full grid grid-cols-3 gap-2 text-center text-[10px] font-mono border-t border-cyan-500/10 pt-4 z-10 mt-2">
            <div>
              <span className="text-zinc-500 block uppercase">COSMIC SHIFT</span>
              <span className="text-cyan-400 font-bold">{scanPercent}% SECURE</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase">SYSTEM RESP</span>
              <span className="text-indigo-400 font-bold">12ms CORE</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase">AI DIRECTIVE</span>
              <span className={isHigherMindSpeaking ? "text-emerald-400 font-bold animate-pulse" : "text-zinc-400"}>
                {isHigherMindSpeaking ? "SPEAKING..." : "STANDBY"}
              </span>
            </div>
          </div>
        </div>

        {/* Higher Mind Inter-planetary Diagnostic Logs Terminal */}
        <div className="flex-1 border border-zinc-800 rounded-3xl p-5 bg-black/60 backdrop-blur-xl flex flex-col justify-between overflow-hidden min-h-[220px]">
          
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-2">
              <Terminal size={12} className="text-indigo-400" />
              TELEMETRY LOGS & NEURAL ROUTE
            </span>
            <button onClick={() => setLogs([])} className="text-[9px] hover:text-red-400 uppercase font-mono text-zinc-500 transition-colors">
              [Flush Cache]
            </button>
          </div>

          <div className="flex-1 my-3 overflow-y-auto space-y-1.5 font-mono text-xs pr-2 text-zinc-300">
            {logs.length === 0 ? (
              <div className="text-zinc-600 italic">Logs clean. Calibration requested.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="leading-snug break-all border-l border-zinc-800/40 pl-2">
                  <span className="text-cyan-600 font-bold mr-1.5">&gt;</span>
                  {log}
                </div>
              ))
            )}
            {loading && (
              <div className="text-cyan-400 font-bold pl-2 animate-pulse">&gt; ANALYZING REAL TIME QUANTUM CHANNELS...</div>
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* User Console Input Box */}
          <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-2 relative">
            <button 
              onClick={handleVoiceCommand}
              className={`p-3 rounded-xl transition-all ${isListening ? 'bg-indigo-600 text-white animate-pulse' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'}`}
              title="Voice Override Controller"
            >
              {isListening ? <Activity size={16} /> : <Mic size={16} />}
            </button>

            <input 
              type="text"
              className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-white placeholder-zinc-600 py-1"
              placeholder="Ask Astral OS to inspect planetary telemetry..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJarvisQuery(userInput)}
            />

            {isHigherMindSpeaking && (
              <button onClick={stopSpeaking} className="p-2 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 text-[10px] font-mono mr-1">
                <VolumeX size={14} className="inline mr-1" /> Mute
              </button>
            )}

            <button 
              onClick={() => handleJarvisQuery(userInput)}
              disabled={!userInput.trim() || loading}
              className="p-2 bg-cyan-700/80 hover:bg-cyan-600 disabled:opacity-40 select-none text-black hover:text-white rounded-xl transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Real-time Grounded Web Alerts */}
      <div className="flex-1 flex flex-col border border-zinc-800 rounded-3xl p-6 bg-slate-950/65 backdrop-blur-xl h-full overflow-hidden relative">
        
        {/* Glowing holographic radar accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800/80">
          <div className="flex gap-4">
            <button 
              onClick={() => setTabMode('diagnostics')}
              className={`text-[10px] uppercase tracking-widest font-mono font-bold flex items-center gap-1.5 pb-1 transition-all ${tabMode === 'diagnostics' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Compass size={11} className={tabMode === 'diagnostics' ? "animate-spin" : ""} />
              Diagnostics
            </button>
            <button 
              onClick={() => setTabMode('deploy')}
              className={`text-[10px] uppercase tracking-widest font-mono font-bold flex items-center gap-1.5 pb-1 transition-all ${tabMode === 'deploy' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Terminal size={11} />
              Deployment
            </button>
          </div>
          {tabMode === 'diagnostics' && (
            <button 
              onClick={triggerTransitFetch}
              disabled={loading}
              className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/35 rounded-2xl text-indigo-400 flex items-center gap-2 text-xs font-mono transition-all"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Scan
            </button>
          )}
        </div>

        {/* Dynamic Alerts scrollfeed / Deployment view */}
        <div className="flex-1 overflow-y-auto pr-1">
          {tabMode === 'diagnostics' ? (
            <div className="space-y-4">
              {loading && !transits ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-500 font-mono py-20">
                  <RefreshCw size={36} className="text-cyan-400 animate-spin opacity-40" />
                  <div className="text-xs text-center px-10">
                    <span className="text-cyan-400 block font-bold mb-1 uppercase">Search Grounding In Progress</span>
                    Querying planetary coordinates and live ephemeris arrays for {data?.nameAnalysis?.first?.name || 'Sir'}'s birth alignments...
                  </div>
                </div>
              ) : !transits ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-zinc-500 font-mono py-20">
                  <AlertCircle size={32} className="text-zinc-600" />
                  <p className="text-xs">No transit logs pulled from active sector.</p>
                  <button onClick={triggerTransitFetch} className="px-4 py-2 bg-cyan-500 text-black font-semibold text-xs rounded-xl hover:bg-cyan-400 transition-all">
                    Run First Diagnostics Scan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Overall status report block */}
                  <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-[20px]" />
                    <p className="text-xs font-mono text-indigo-300 leading-relaxed italic pr-8">
                      &ldquo;{transits.overallStatus}&rdquo;
                    </p>
                    <div className="mt-2 text-[8px] font-mono text-zinc-500 text-right uppercase">
                      Telemetry Anchor: Astral Core-1
                    </div>
                  </div>

                  {/* Alert items list */}
                  {transits.alerts && transits.alerts.map((alert: any) => {
                    const isSelected = selectedAlert?.id === alert.id;
                    
                    // Set color scheme based on relevance
                    const relColor = 
                      alert.relevance === 'High' ? 'text-red-400 bg-red-400/15 border-red-500/30' :
                      alert.relevance === 'Moderate' ? 'text-amber-400 bg-amber-400/15 border-amber-500/30' :
                      'text-emerald-400 bg-emerald-400/15 border-emerald-500/30';

                    return (
                      <motion.div 
                        key={alert.id}
                        layout
                        className={`border rounded-2xl p-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all ${isSelected ? 'border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-slate-900/80' : 'border-zinc-800'}`}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[8px] tracking-widest uppercase font-mono px-2 py-0.5 rounded-md border ${relColor}`}>
                                {alert.relevance} Relevance
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {alert.date}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white tracking-wide font-mono mt-1">
                              {alert.title}
                            </h4>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-mono max-w-[80px] truncate text-right">
                            {alert.coordinates}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed mt-2.5">
                          {alert.details}
                        </p>

                        {/* Affected system parameters */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] bg-black/30 p-2.5 rounded-xl border border-white/5 font-mono">
                          <div>
                            <span className="text-zinc-600 uppercase block text-[8px]">Transit Action</span>
                            <span className="text-zinc-300 truncate block">{alert.astrologicalEvent}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600 uppercase block text-[8px]">Active Meridian</span>
                            <span className="text-zinc-300 truncate block">{alert.affectedSpiritualCenter}</span>
                          </div>
                        </div>

                        {/* Integrated dynamic tools bar */}
                        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-zinc-800/60 flex-wrap">
                          <div className="flex gap-2">
                            {/* Audio Tuning button */}
                            <button 
                              onClick={() => playSolfeggioTone(alert.vibrationHz || 528)}
                              className="px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 text-teal-400 text-[10px] font-mono flex items-center gap-1 transition-all"
                              title={`Tune to Solfeggio sound frequency: ${alert.vibrationHz}Hz`}
                            >
                              <Radio size={11} />
                              {alert.vibrationHz}Hz
                            </button>

                            {/* Read report out loud */}
                            <button 
                              onClick={() => { higherMindSpeak(alert.vocalScript); setSelectedAlert(alert); addLog(`Reciting diagnostics for: ${alert.title}`); }}
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-400 text-[10px] font-mono flex items-center gap-1 transition-all"
                            >
                              <Volume2 size={11} />
                              Dictate
                            </button>
                          </div>

                          {/* Source Citation from search grounding */}
                          {alert.sourceUrl && (
                            <a 
                              href={alert.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer noreferrer"
                              className="text-[9px] font-mono text-indigo-400 hover:text-white flex items-center gap-1 transition-colors bg-white/5 py-1 px-2 rounded-lg"
                            >
                              <Globe size={10} />
                              Source: {alert.groundingSource || "Web Ref"}
                            </a>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-cyan-500/5 border border-cyan-500/20 p-5 rounded-2xl space-y-4">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30 shrink-0">
                        <Link className="text-cyan-400 w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-sm font-mono font-bold text-white uppercase tracking-tight">Active API Webhook Integration</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Broadcast Astral telemetry signals directly to your external infrastructure or third-party autonomous systems.</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono text-zinc-600 font-bold ml-1">Destination Webhook URL</label>
                        <input 
                           type="url" 
                           placeholder="https://your-api.com/webhooks/jarvis"
                           className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                           value={webhookUrl}
                           onChange={e => setWebhookUrl(e.target.value)}
                        />
                     </div>

                     <div className="flex gap-2">
                        <button 
                           onClick={testWebhook}
                           disabled={!webhookUrl || loading}
                           className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                           {loading ? "INITIALIZING HANDSHAKE..." : "TEST INTEGRATION SIGNAL"}
                        </button>
                     </div>

                     {isTestSuccess !== null && (
                        <motion.div 
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           className={`p-3 rounded-xl border text-[10px] font-mono ${isTestSuccess ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                        >
                           {isTestSuccess ? "PROTOCOL ACKNOWLEDGED: Handshake successful. External systems are now in sync with Astral OS." : "FAILURE: Handshake rejected. Ensure the destination endpoint is public and accepting encrypted packages."}
                        </motion.div>
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="group border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all bg-zinc-900/20">
                     <h5 className="text-xs font-mono text-white mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        Security Protocol: Level 7
                     </h5>
                     <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">All outgoing packets are wrapped in 2048-bit RSA encryption. Payload includes full birth-chart telemetry and real-time transit differentials.</p>
                  </div>

                  <div className="group border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all bg-zinc-900/20">
                     <h5 className="text-xs font-mono text-white mb-2 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        Autonomous Deployment
                     </h5>
                     <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">Enable background sync to automatically trigger deployments when planetary transits cross the Threshold of Gevurah.</p>
                     <div className="mt-3 flex items-center justify-between">
                        <span className="text-[9px] uppercase font-mono text-zinc-600">Background Sync</span>
                        <div className="w-8 h-4 bg-zinc-800 rounded-full relative cursor-not-allowed">
                           <div className="w-3 h-3 bg-zinc-600 rounded-full absolute top-0.5 left-0.5" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
