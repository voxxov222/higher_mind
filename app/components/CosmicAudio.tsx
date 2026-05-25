import React, { useEffect, useRef, useState } from 'react';
import { useHigherMind } from './HigherMindProvider';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CosmicAudio: React.FC = () => {
  const { coherence, alignment } = useHigherMind();
  const [isStarted, setIsStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  
  // Starting the audio context requires user gesture
  const startAudio = () => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setIsStarted(true);
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Create a base harmonic hum (complex drone)
    // 174Hz - Grounding, 528Hz - Transformation
    const baseFreqs = [174, 528, 852];
    
    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.Q.setValueAtTime(5, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.15 / baseFreqs.length, ctx.currentTime);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      oscillatorsRef.current.push(osc);
      filtersRef.current.push(filter);
    });

    setIsStarted(true);
  };

  const toggleMute = () => {
    if (!masterGainRef.current || !audioContextRef.current) return;
    
    const targetGain = isMuted ? 0.3 : 0;
    masterGainRef.current.gain.linearRampToValueAtTime(targetGain, audioContextRef.current.currentTime + 0.5);
    setIsMuted(!isMuted);
  };

  // Update audio parameters based on coherence
  useEffect(() => {
    if (!isStarted || isMuted || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    // Solfeggio frequencies from AGENTS_md
    const SOLFEGGIO = [174, 285, 396, 417, 528, 639, 741, 852];
    
    // Select base frequency based on coherence
    const freqIndex = Math.floor(coherence * (SOLFEGGIO.length - 1));
    const baseFreq = SOLFEGGIO[freqIndex];
    
    filtersRef.current.forEach((filter, i) => {
      // Neural coherence affects the filter frequency and resonance
      // Higher coherence = clearer, more resonant sound
      const sweep = Math.sin(now * 0.2) * 500;
      const targetFreq = baseFreq + (coherence * 2000) + sweep;
      filter.frequency.exponentialRampToValueAtTime(Math.max(20, targetFreq), now + 0.5);
      filter.Q.linearRampToValueAtTime(1 + (coherence * 10), now + 0.5);
    });

    // Update oscillator frequencies slightly towards the solfeggio scale
    oscillatorsRef.current.forEach((osc, i) => {
      const targetFreq = SOLFEGGIO[(freqIndex + i) % SOLFEGGIO.length];
      osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 1);
    });

    // Alignment affects "vibrato" or spatial movement
    if (masterGainRef.current) {
        const volumeOsc = 0.25 + (Math.sin(now * (0.5 + alignment)) * 0.05);
        masterGainRef.current.gain.linearRampToValueAtTime(isMuted ? 0 : volumeOsc, now + 0.5);
    }
  }, [coherence, alignment, isStarted, isMuted]);

  return (
    <div className="fixed bottom-10 right-10 z-50">
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={startAudio}
            className="flex items-center gap-3 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/40 backdrop-blur-xl border border-indigo-500/50 rounded-full text-indigo-100 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse"
          >
            <Volume2 size={16} />
            Initialize Harmonic Hum
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={toggleMute}
            className={`p-4 rounded-full backdrop-blur-xl border transition-all ${isMuted ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'}`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
