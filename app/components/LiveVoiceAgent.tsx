import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Activity, X } from 'lucide-react';

export default function LiveVoiceAgent() {
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Helper to convert base64 back to Float32Array
  const base64ToFloat32Array = (base64: string): Float32Array => {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
  };

  const playAudioChunk = (audioCtx: AudioContext, base64: string) => {
    try {
      const buffer = base64ToFloat32Array(base64);
      const audioBuffer = audioCtx.createBuffer(1, buffer.length, 24000);
      audioBuffer.getChannelData(0).set(buffer);
  
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
  
      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
         nextStartTimeRef.current = currentTime;
      }
      
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      setIsSpeaking(true);
      
      source.onended = () => {
         // rough approximation, might flutter
         if (audioCtx.currentTime >= nextStartTimeRef.current - 0.1) {
            setIsSpeaking(false);
         }
      };

    } catch(e) {
      console.error("Playback error", e);
    }
  };

  function pcmToBase64(pcmData: Float32Array) {
    // Live API expects 16-bit PCM for input
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < pcmData.length; i++) {
      let s = Math.max(-1, Math.min(1, pcmData[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      view.setInt16(i * 2, s, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 10000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }
    return btoa(binary);
  }

  const startSession = async () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;
      
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputAudioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      ws.onopen = () => {
        setIsConnected(true);
      };

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio) {
          playAudioChunk(outputAudioCtx, msg.audio);
        }
        if (msg.interrupted) {
          nextStartTimeRef.current = 0; // reset queue
          setIsSpeaking(false);
        }
      };

      ws.onclose = () => {
        stopSession();
      };

      setIsActive(true);
    } catch (e) {
      console.error("Failed to start Live API session", e);
      stopSession();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnected(false);
    setIsSpeaking(false);
    
    if (wsRef.current) {
      try { wsRef.current.close(); } catch(e){ console.error(e); }
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(()=>{});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(()=>{});
      outputAudioCtxRef.current = null;
    }
  };

  const toggleListen = () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-stone-900/90 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-4 w-[240px] shadow-[0_0_30px_rgba(20,184,166,0.1)] relative"
          >
            <div className="relative z-10 flex justify-between items-center mb-3 border-b border-teal-500/20 pb-2">
              <span className="text-[10px] text-teal-400 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                {isSpeaking ? <Activity size={12} className="animate-pulse" /> : <Mic size={12} />}
                Live Guidance
              </span>
              <button onClick={stopSession} className="text-stone-500 hover:text-teal-400">
                <X size={14} />
              </button>
            </div>

            <div className="h-16 flex items-center justify-center">
              {isConnected ? (
                <div className="flex gap-1 items-end justify-center h-full">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-teal-500 rounded-t-full"
                      animate={{ height: isSpeaking ? ['20%', '90%', '20%'] : ['10%', '30%', '10%'] }}
                      transition={{ 
                        duration: 0.5 + Math.random() * 0.5, 
                        repeat: Infinity, 
                        repeatType: 'reverse',
                        delay: i * 0.1
                      }}
                      style={{ 
                        boxShadow: '0 0 10px rgba(20,184,166,0.5)',
                        opacity: 0.5 + Math.random() * 0.5 
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-stone-600 font-mono text-xs text-center">
                   Connecting...
                </div>
              )}
            </div>
            
            <div className="mt-2 text-center text-xs text-stone-400 font-light">
                {isSpeaking ? "Speaking..." : "Listening..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border
          ${isActive 
            ? 'bg-teal-600 text-white border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.5)]' 
            : 'bg-stone-900 border-white/10 text-stone-400 hover:text-white hover:border-teal-500/50 hover:bg-stone-800'
          }`}
      >
        <div className="relative">
          <Activity size={24} />
          {isActive && (
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-teal-400"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </motion.button>
    </div>
  );
}
