import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Trail, MeshDistortMaterial, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Square, Activity, Waves, Send, Zap, Wind, Sparkles as SparkleIcon, Shield, ShieldAlert, Radio } from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

interface FrequencyType {
  hz: number;
  name: string;
  color: string;
  outcome: string;
  blockage: string;
}

const FREQUENCIES: FrequencyType[] = [
  { hz: 396, name: 'Root Clearing', color: '#ef4444', outcome: 'Releases fear and guilt. Grounds intention into physical reality.', blockage: 'Root Chakra: Insecurity, survival anxiety.' },
  { hz: 417, name: 'Sacral Flow', color: '#f97316', outcome: 'Undoes negative situations, facilitates change and creative flow.', blockage: 'Sacral Chakra: Creative stagnation, emotional blockage.' },
  { hz: 528, name: 'Miracle Repair', color: '#eab308', outcome: 'DNA repair, attracts miracles, profound quantum transformation.', blockage: 'Solar Plexus: Loss of personal power, fatigue.' },
  { hz: 639, name: 'Heart Coherence', color: '#22c55e', outcome: 'Enhances communication, understanding, and love connections.', blockage: 'Heart Chakra: Grief, relationship disconnect.' },
  { hz: 741, name: 'Throat Resonance', color: '#0ea5e9', outcome: 'Awakens intuition, cleanses aura, empowers expression of desires.', blockage: 'Throat Chakra: Suppressed voice, self-doubt.' },
  { hz: 852, name: 'Pineal Activation', color: '#8b5cf6', outcome: 'Returns to spiritual order, deepens visionary abilities.', blockage: 'Third Eye: Illusion, mental fog.' },
  { hz: 963, name: 'Crown Synthesis', color: '#c084fc', outcome: 'Connects to Light and Spirit, merges intention with universal consciousness.', blockage: 'Crown Chakra: Spiritual disconnection, isolation.' },
];

const ResonanceCoreLine = ({ isActive, frequencyStr, freqObj }: { isActive: boolean, frequencyStr: string, freqObj: FrequencyType }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      if (isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * (freqObj.hz/100)) * 0.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <Trail width={2} color={freqObj.color} length={isActive ? 8 : 2} attenuation={(t) => t * t}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 4]} />
        {isActive ? (
          <MeshDistortMaterial
             color={freqObj.color}
             emissive={freqObj.color}
             emissiveIntensity={1.5}
             distort={0.4}
             speed={freqObj.hz / 50}
             roughness={0.2}
             metalness={0.8}
             wireframe
          />
        ) : (
          <MeshTransmissionMaterial
            color={freqObj.color}
            resolution={256}
            thickness={1}
            roughness={0.2}
            transmission={0.9}
            ior={1.5}
          />
        )}
      </mesh>
    </Trail>
  );
};

const IntentionTextStream = ({ intention, isActive, color }: { intention: string, isActive: boolean, color: string }) => {
  const textRef = useRef<any>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      ringRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
    if (textRef.current && isActive) {
      textRef.current.position.z = Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <group ref={ringRef}>
      {isActive && intention && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Text
            ref={textRef}
            position={[0, 3, 0]}
            fontSize={0.5}
            color={color}
            anchorX="center"
            anchorY="middle"
            maxWidth={10}
            textAlign="center"
            font="/fonts/SpaceGrotesk-Bold.ttf"
          >
            {intention}
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </Text>
        </Float>
      )}
      
      {/* Surrounding orbital particles */}
      <Sparkles
        count={isActive ? 200 : 50}
        scale={10}
        size={isActive ? 6 : 2}
        speed={isActive ? 2 : 0.2}
        color={color}
        opacity={0.6}
      />
    </group>
  );
};


export const VibrationalTuningSection = () => {
  const [intention, setIntention] = useState('');
  const [selectedFreq, setSelectedFreq] = useState<FrequencyType>(FREQUENCIES[2]); // Default 528Hz
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleBroadcast = () => {
    if (!intention) {
      soundEngine.error();
      return;
    }
    
    soundEngine.mysticClick();
    setIsBroadcasting(!isBroadcasting);
    setShowAnalysis(true);
  };

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative font-sans">
      
      {/* 3D Visualization */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color={selectedFreq.color} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
          
          <ResonanceCoreLine 
            isActive={isBroadcasting} 
            frequencyStr={`${selectedFreq.hz}Hz`} 
            freqObj={selectedFreq} 
          />
          
          <IntentionTextStream 
            intention={intention} 
            isActive={isBroadcasting} 
            color={selectedFreq.color} 
          />
          
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isBroadcasting} autoRotateSpeed={1} />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row h-full">
        
        {/* Left Control Panel */}
        <div className="w-full lg:w-[400px] bg-black/60 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
          
          <div>
            <h2 className="text-2xl font-light text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-cyan-400" />
              Vibrational Tuning
            </h2>
            <p className="text-sm text-stone-400 mt-2">
              Encode your intentions with specific cosmic frequencies to project your words across the universal matrix.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-stone-400 font-bold">1. Embed Intention</label>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="State your desire, affirmation, or command..."
              className="w-full bg-black/40 border border-white/20 rounded-xl p-4 text-white placeholder-stone-600 focus:outline-none focus:border-cyan-500/50 transition-colors h-32 resize-none"
              onFocus={() => soundEngine.hover()}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs uppercase tracking-widest text-stone-400 font-bold">2. Select Carrier Wave</label>
            <div className="grid grid-cols-1 gap-2">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq.hz}
                  onClick={() => {
                    setSelectedFreq(freq);
                    soundEngine.select();
                    if (isBroadcasting) {
                        setIsBroadcasting(false);
                    }
                  }}
                  onMouseEnter={() => soundEngine.hover()}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${selectedFreq.hz === freq.hz ? 'bg-white/10 border-white/30' : 'bg-black/30 border-white/5 hover:bg-white/5'}`}
                  style={{ borderLeftColor: selectedFreq.hz === freq.hz ? freq.color : undefined, borderLeftWidth: selectedFreq.hz === freq.hz ? '4px' : '1px' }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{freq.hz} Hz</span>
                    <span className="text-xs font-medium" style={{ color: freq.color }}>{freq.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBroadcast}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              isBroadcasting 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-500/30'
            }`}
          >
            {isBroadcasting ? <Square size={18} /> : <Play size={18} />}
            {isBroadcasting ? 'Cease Broadcast' : 'Initiate Broadcast'}
          </button>
        </div>

        {/* Right Output Panel */}
        <div className="flex-1 p-6 flex flex-col justify-end lg:justify-center items-center pointer-events-none">
          
          <AnimatePresence>
            {showAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl pointer-events-auto"
                style={{ boxShadow: `0 0 40px ${selectedFreq.color}20` }}
              >
                
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <Activity className="w-6 h-6 animate-pulse" style={{ color: selectedFreq.color }} />
                  <div>
                    <h3 className="text-lg text-white font-medium">Aura Index & Quantum Routing</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-stone-400">Carrier Wave:</span>
                      <span style={{ color: selectedFreq.color }} className="font-mono">{selectedFreq.hz} Hz</span>
                      <span className="text-stone-600">|</span>
                      <span className="text-stone-400">Status:</span>
                      <span className={isBroadcasting ? 'text-emerald-400 animate-pulse' : 'text-stone-500'}>
                        {isBroadcasting ? 'TRANSMITTING' : 'IDLE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  
                  {/* Pinpointed Blockage */}
                  <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 flex gap-4">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-red-200 uppercase tracking-wider mb-1">Identified Resistance Block</h4>
                      <p className="text-sm text-red-100/70 leading-relaxed font-light">
                        {selectedFreq.blockage}
                        <br/>
                        <span className="text-xs text-red-300 block mt-2">
                          <Zap className="w-3 h-3 inline mr-1" />
                          The selected frequency directly antagonizes this density, creating friction before breakthrough. Drink water and allow somatic emotional release.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Outcome */}
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 flex gap-4">
                    <SparkleIcon className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-200 uppercase tracking-wider mb-1">Projected Outcome Stream</h4>
                      <p className="text-sm text-emerald-100/70 leading-relaxed font-light">
                        {selectedFreq.outcome}
                        <br/>
                        <span className="text-xs text-emerald-300 block mt-2">
                          <Waves className="w-3 h-3 inline mr-1" />
                          "{intention}" is now encoded into the morphic field. Synchronicity acceleration expected in 24-72 hours. Let go of the "how."
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Dynamic Visual Data */}
                  {isBroadcasting && (
                     <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="bg-white/5 border border-white/5 rounded-lg p-2">
                             <div className="text-xs text-stone-500 mb-1">Amplitude</div>
                             <div className="font-mono text-emerald-400 text-sm animate-pulse">{(Math.random() * 10 + 90).toFixed(1)}%</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-lg p-2">
                             <div className="text-xs text-stone-500 mb-1">Aura Expansion</div>
                             <div className="font-mono text-cyan-400 text-sm animate-pulse">+{(selectedFreq.hz / 10).toFixed(1)}Hz</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-lg p-2">
                             <div className="text-xs text-stone-500 mb-1">Matrix Imprint</div>
                             <div className="font-mono text-fuchsia-400 text-sm animate-pulse">LOCKED</div>
                        </div>
                     </div>
                  )}

                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
