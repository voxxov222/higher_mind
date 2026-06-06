
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Lock, Shield, Moon, Sun, Star, Clock, Calendar, Compass, Hexagon, Activity } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

const DailyOrb: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial 
          color={isPremium ? "#a855f7" : "#0ea5e9"} 
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0} 
          metalness={0.8} 
          roughness={0.2}
          distort={0.4} 
          speed={isPremium ? 3 : 1.5} 
        />
      </Sphere>
      <Stars radius={10} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
    </Float>
  );
};

export const DailyCosmicPulse: React.FC = () => {
  const { cosmicData } = useHigherMind();
  const [isPremium, setIsPremium] = useState(false);
  const [activeView, setActiveView] = useState<'transits' | 'numerology' | 'tarot'>('transits');

  // Simulated daily data
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const dailyInsights = {
    transits: [
      { aspect: "Moon Trine Jupiter", desc: "Emotional expansion, good fortune, and optimism.", intensity: 8 },
      { aspect: "Sun Square Saturn", desc: "Friction between ego and responsibilities.", intensity: 6 }
    ],
    numerology: {
      dailyNumber: 7,
      theme: "Introspection, spiritual growth, analysis.",
      vibration: 741
    },
    tarot: {
      card: "The High Priestess",
      meaning: "Intuition, the subconscious, divine feminine energy."
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950" />
      
      {/* 3D Cosmos Background Element */}
      <div className="absolute inset-x-0 top-0 h-[40vh] md:h-full md:w-1/2 md:right-0 md:left-auto opacity-60">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <DailyOrb isPremium={isPremium} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row h-full">
        {/* Left Content Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
              <Calendar size={14} />
              {today}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              Daily Pulse <Sparkles className={isPremium ? "text-purple-400" : "text-sky-400"} />
            </h1>
            <p className="text-zinc-400 max-w-md">
              Your personalized algorithmic forecast bridging cosmic weather, numerology, and deep archetypal rhythms.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 bg-black/40 p-1 rounded-2xl border border-white/5 backdrop-blur-md w-fit">
            {[
              { id: 'transits', icon: Compass, label: 'Transits' },
              { id: 'numerology', icon: Hexagon, label: 'Numerology' },
              { id: 'tarot', icon: Moon, label: 'Tarot' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as 'transits' | 'numerology' | 'tarot')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeView === tab.id 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeView === 'transits' && (
                <div className="grid gap-4">
                  {dailyInsights.transits.map((transit, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Activity size={18} className="text-indigo-400" />
                          {transit.aspect}
                        </h3>
                        <div className="flex text-xs font-mono items-center gap-1 text-zinc-500">
                          Intensity <span className="text-white">{transit.intensity}/10</span>
                        </div>
                      </div>
                      <p className="text-zinc-400">{transit.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeView === 'numerology' && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Hexagon size={120} />
                  </div>
                  <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-4">Daily Universal Number</h3>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600 mb-4 inline-block">
                    {dailyInsights.numerology.dailyNumber}
                  </div>
                  <p className="text-lg text-white mb-2">{dailyInsights.numerology.theme}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/50 rounded-lg text-xs font-mono text-indigo-300">
                    <RadioWaveIcon /> Frequency: {dailyInsights.numerology.vibration}Hz
                  </div>
                </div>
              )}

              {activeView === 'tarot' && (
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-2xl flex flex-col items-center">
                   <div className="w-32 h-48 border border-white/20 rounded-xl bg-black/50 mb-6 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen mix-blend-overlay"></div>
                      <Moon className="text-zinc-600 w-12 h-12" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{dailyInsights.tarot.card}</h3>
                   <p className="text-zinc-400 text-center text-sm max-w-sm">{dailyInsights.tarot.meaning}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Premium Section Overlay */}
          <div className={`mt-8 relative overflow-hidden rounded-3xl ${isPremium ? 'hidden' : 'p-[1px] bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
            <div className={`bg-zinc-950 p-6 rounded-[23px] h-full ${isPremium ? 'hidden' : 'block'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-purple-400" />
                  <h3 className="text-white font-bold">Deep Synthesis Oracle (Premium)</h3>
                </div>
                <Lock size={16} className="text-zinc-600" />
              </div>
              <p className="text-zinc-400 text-sm mb-6">
                Unlock daily personalized AI guidance analyzing the exact intersection of your natal chart with today's complex cosmic environment.
              </p>
              <button 
                onClick={() => setIsPremium(true)}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                Activate Oracle Access
              </button>
            </div>
          </div>
          
          {/* Unlocked Premium View */}
          {isPremium && (
            <motion.div 
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: 'auto'}}
              className="mt-8 bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
              <div className="flex items-center gap-2 mb-6 text-purple-300">
                <Zap size={20} className="animate-pulse" />
                <h3 className="font-bold tracking-widest text-sm uppercase">AI Deep Synthesis Oracle</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 border-l-2 border-l-purple-500 text-zinc-300">
                  <p className="font-mono text-sm leading-relaxed">
                    "The current transit of the Moon across your natal Midheaven activates a dormant career trajectory. Coupled with today's 7-frequency numerology, the algorithm detect a 94% alignment for strategic introspection regarding public life."
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <h4 className="text-xs text-purple-400 font-mono uppercase mb-2">Ideal Flow State</h4>
                    <span className="text-white">Between 14:00 - 16:30</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <h4 className="text-xs text-purple-400 font-mono uppercase mb-2">Avoidance Vector</h4>
                    <span className="text-white">Impulsive financial choices</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

// Helper SVG Icon
const RadioWaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </svg>
);
