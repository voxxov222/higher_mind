import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Line, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Square, Activity, Shield, ShieldAlert, Waves, Radio, Music, Zap, Settings2 } from 'lucide-react';
import { CosmicData } from '../types';

interface AlignmentSectionProps {
  cosmicData: CosmicData;
}

// Custom hook to manage the Web Audio API synthesizer
const useSynthesizer = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  
  const defenseOscRef = useRef<OscillatorNode | null>(null);
  const defenseGainRef = useRef<GainNode | null>(null);

  const lfoRef = useRef<OscillatorNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDefending, setIsDefending] = useState(false);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Main oscillator path
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.value = 0;
      
      filterRef.current = audioCtxRef.current.createBiquadFilter();
      filterRef.current.type = 'lowpass';
      filterRef.current.frequency.value = 20000;

      pannerRef.current = audioCtxRef.current.createStereoPanner();
      pannerRef.current.pan.value = 0;

      gainNodeRef.current.connect(filterRef.current);
      filterRef.current.connect(pannerRef.current);
      pannerRef.current.connect(audioCtxRef.current.destination);

      // Defense oscillator path
      defenseGainRef.current = audioCtxRef.current.createGain();
      defenseGainRef.current.gain.value = 0;
      defenseGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startTone = (hz: number, type: OscillatorType, useHum: boolean) => {
    initAudio();
    if (!audioCtxRef.current || !gainNodeRef.current || !filterRef.current) return;

    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
    }

    oscRef.current = audioCtxRef.current.createOscillator();
    oscRef.current.type = type;
    oscRef.current.frequency.setValueAtTime(hz, audioCtxRef.current.currentTime);
    oscRef.current.connect(gainNodeRef.current);

    if (useHum) {
      filterRef.current.type = 'lowpass';
      filterRef.current.frequency.setTargetAtTime(hz * 1.5, audioCtxRef.current.currentTime, 0.1);
      // Give it a slightly softer attack
      gainNodeRef.current.gain.setTargetAtTime(0.4, audioCtxRef.current.currentTime, 0.5);
    } else {
      filterRef.current.type = 'lowpass';
      filterRef.current.frequency.setTargetAtTime(20000, audioCtxRef.current.currentTime, 0.1);
      gainNodeRef.current.gain.setTargetAtTime(0.5, audioCtxRef.current.currentTime, 0.1);
    }

    oscRef.current.start();
    setIsPlaying(true);
  };

  const stopTone = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
      setTimeout(() => {
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current.disconnect();
          oscRef.current = null;
        }
        setIsPlaying(false);
      }, 300);
    }
  };

  const updateFrequency = (hz: number) => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setTargetAtTime(hz, audioCtxRef.current.currentTime, 0.1);
    }
  };

  const updateWave = (type: OscillatorType, useHum: boolean) => {
    if (oscRef.current && filterRef.current && audioCtxRef.current && gainNodeRef.current) {
      oscRef.current.type = type;
      if (useHum) {
        const hz = oscRef.current.frequency.value;
        filterRef.current.frequency.setTargetAtTime(hz * 1.5, audioCtxRef.current.currentTime, 0.1);
        gainNodeRef.current.gain.setTargetAtTime(0.4, audioCtxRef.current.currentTime, 0.1);
      } else {
        filterRef.current.frequency.setTargetAtTime(20000, audioCtxRef.current.currentTime, 0.1);
        gainNodeRef.current.gain.setTargetAtTime(0.5, audioCtxRef.current.currentTime, 0.1);
      }
    }
  }

  const setPendulum = (active: boolean, speedHz: number = 0.5) => {
    if (!audioCtxRef.current || !pannerRef.current) return;
    
    if (active) {
      if (!lfoRef.current) {
        lfoRef.current = audioCtxRef.current.createOscillator();
        lfoRef.current.type = 'sine';
      }
      lfoRef.current.frequency.value = speedHz;
      // Map LFO (-1, 1) to pan value
      const panGain = audioCtxRef.current.createGain();
      panGain.gain.value = 1; // max pan extent
      lfoRef.current.connect(panGain);
      // Wait, pan is an AudioParam array kind of? In stereo panner it's just a param.
      // Actually, you can connect an oscillator to an AudioParam
      panGain.connect(pannerRef.current.pan);
      try {
        lfoRef.current.start();
      } catch (err) {
        console.warn('LFO start Error', err);
      }
    } else {
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      pannerRef.current.pan.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
    }
  };

  const blastDefense = () => {
    initAudio();
    if (!audioCtxRef.current || !defenseGainRef.current) return;

    if (defenseOscRef.current) {
      defenseOscRef.current.stop();
      defenseOscRef.current.disconnect();
    }

    defenseOscRef.current = audioCtxRef.current.createOscillator();
    defenseOscRef.current.type = 'square';
    // 12 kHz blast to ward off entities
    defenseOscRef.current.frequency.setValueAtTime(12000, audioCtxRef.current.currentTime);
    defenseOscRef.current.connect(defenseGainRef.current);
    
    defenseGainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    defenseGainRef.current.gain.linearRampToValueAtTime(0.8, audioCtxRef.current.currentTime + 0.05);
    defenseGainRef.current.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 1.5);
    
    defenseOscRef.current.start();
    setIsDefending(true);

    setTimeout(() => {
      setIsDefending(false);
      if (defenseOscRef.current) {
        defenseOscRef.current.stop();
        defenseOscRef.current.disconnect();
        defenseOscRef.current = null;
      }
    }, 1500);
  };

  return { startTone, stopTone, updateFrequency, updateWave, setPendulum, blastDefense, isPlaying, isDefending };
};


// 3D Visualization of the Alignment
const AlignmentVisualizer = ({ frequency, waveType, isPlaying, isDefending, pendulumOn, isScanning }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.rotation.y = time * (frequency / 200);
      meshRef.current.rotation.x = time * 0.5;
      
      if (isPlaying) {
         let scaleMod = 1 + Math.sin(time * 5) * 0.05;
         
         if (isDefending) {
            scaleMod += Math.random() * 0.4;
            meshRef.current.position.y = Math.sin(time * 50) * 0.2;
         } else {
            meshRef.current.position.y = 0;
         }
         
         if (pendulumOn) {
            meshRef.current.position.x = Math.sin(time * Math.PI) * 2;
         } else {
            meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, 0.1);
         }
         
         meshRef.current.scale.setScalar(scaleMod);
      } else {
         meshRef.current.scale.setScalar(1);
         meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, 0.1);
         meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.1);
      }
    }
    
    if (ringRef.current && isScanning) {
      ringRef.current.rotation.z = time * 2;
      const pulse = (Math.sin(time * 4) + 1) / 2;
      ringRef.current.scale.setScalar(1 + pulse * 0.5);
      if (ringRef.current.material) {
         (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - pulse;
      }
    }
  });

  return (
    <group>
      {/* Central Identity Frequency Core */}
      <Float speed={isPlaying ? 4 : 1} rotationIntensity={isPlaying ? 1.5 : 0.5} floatIntensity={isPlaying ? 2 : 1}>
        <mesh ref={meshRef}>
          {waveType === 'sine' ? (
            <sphereGeometry args={[1.5, 32, 32]} />
          ) : waveType === 'triangle' ? (
            <octahedronGeometry args={[1.5, 0]} />
          ) : (
            <boxGeometry args={[1.8, 1.8, 1.8]} />
          )}
          <MeshDistortMaterial
            color={isDefending ? "#ef4444" : isPlaying ? "#2dd4bf" : "#475569"}
            emissive={isDefending ? "#f87171" : isPlaying ? "#14b8a6" : "#1e293b"}
            emissiveIntensity={isPlaying ? (isDefending ? 3 : 1.5) : 0.2}
            distort={isPlaying ? 0.3 : 0}
            speed={frequency / 50}
            roughness={0.2}
            metalness={0.8}
            wireframe={waveType !== 'sine'}
          />
        </mesh>
      </Float>

      {/* Scanning Radar Ring for Defense */}
      {isScanning && (
        <mesh ref={ringRef} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[3, 3.2, 64]} />
          <meshBasicMaterial color={isDefending ? "#ef4444" : "#fbbf24"} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Defense Particles */}
      {isDefending && (
        <Sparkles count={200} scale={10} size={8} speed={10} color="#fca5a5" />
      )}
      
      {!isDefending && isPlaying && (
        <Sparkles count={50} scale={6} size={3} speed={1} color="#5eead4" />
      )}
    </group>
  );
};


export const AlignmentSection: React.FC<AlignmentSectionProps> = ({ cosmicData }) => {
  const { startTone, stopTone, updateFrequency, updateWave, setPendulum, blastDefense, isPlaying, isDefending } = useSynthesizer();
  
  // Calculate a user signature frequency
  const signatureFreq = useMemo(() => {
    let hash = 0;
    const str = (cosmicData?.natalChart?.firstName || "Soul") + (cosmicData?.natalChart?.lifePathNumber || 1);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const freq = Math.abs(hash) % 500 + 200; // between 200 and 700 Hz
    return Number(freq.toFixed(2));
  }, [cosmicData]);

  const [frequency, setFrequency] = useState<number>(signatureFreq);
  const [waveShape, setWaveShape] = useState<'sine'|'triangle'|'square'>('sine');
  const [soundMode, setSoundMode] = useState<'hum'|'tone'|'high'>('hum');
  const [pendulumOn, setPendulumOn] = useState(false);
  const [sporadicOn, setSporadicOn] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sporadicIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Audio when states change
  useEffect(() => {
    if (isPlaying) {
      updateFrequency(soundMode === 'high' ? frequency * 4 : frequency); // high mode multiplies frequency
      updateWave(soundShape(), soundMode === 'hum');
      setPendulum(pendulumOn, 0.5);
    }
  }, [frequency, waveShape, soundMode, pendulumOn]);

  useEffect(() => {
    if (sporadicOn && isPlaying) {
      sporadicIntervalRef.current = setInterval(() => {
        // Randomly shift frequency for a "dash" melodic sequence
        const shift = [1, 1.25, 1.5, 0.8][Math.floor(Math.random() * 4)];
        const targetFreq = (soundMode === 'high' ? frequency * 4 : frequency) * shift;
        updateFrequency(targetFreq);
      }, 600);
    } else {
      if (sporadicIntervalRef.current) clearInterval(sporadicIntervalRef.current);
      if (isPlaying) {
        updateFrequency(soundMode === 'high' ? frequency * 4 : frequency);
      }
    }
    return () => {
      if (sporadicIntervalRef.current) clearInterval(sporadicIntervalRef.current);
    };
  }, [sporadicOn, isPlaying, frequency, soundMode]);

  const toggleScanning = () => {
    if (isScanning) {
      setIsScanning(false);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    } else {
      setIsScanning(true);
      // Simulate random environmental scanning
      scanIntervalRef.current = setInterval(() => {
        // 10% chance every 3 seconds to detect an "anomaly" or "archon"
        if (Math.random() > 0.8) {
          handleDetectedAnomaly();
        }
      }, 3000);
    }
  };

  const handleDetectedAnomaly = () => {
    // Suspend main rhythm and blast
    blastDefense();
  };

  useEffect(() => {
    return () => {
      stopTone();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (sporadicIntervalRef.current) clearInterval(sporadicIntervalRef.current);
    };
  }, []);

  const soundShape = () => {
    if (soundMode === 'hum') return 'sine';
    return waveShape;
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopTone();
    } else {
      startTone(soundMode === 'high' ? frequency * 4 : frequency, soundShape(), soundMode === 'hum');
      setPendulum(pendulumOn, 0.5);
    }
  };

  const protectionScore = useMemo(() => {
    let score = 20; // Base score
    
    if (isPlaying) {
       score += 15;
       // Add up to 30 based on how high the frequency is
       score += Math.min(30, (frequency / 1000) * 30);
       
       if (frequency === 528) score += 10;
       if (soundMode === 'high') score += 15;
       if (pendulumOn) score += 5;
       if (sporadicOn) score += 5;
    }
    
    if (isScanning) score += 10;
    
    if (isDefending) {
       // max out when purging
       score = 100;
    }

    return Math.min(100, Math.round(score));
  }, [frequency, isPlaying, isScanning, isDefending, soundMode, pendulumOn, sporadicOn]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Visualizer Canvas */}
        <div className="flex-1 min-h-[400px] bg-stone-900/60 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
          {/* HUD Overlay */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <h3 className="text-white/80 font-mono text-sm tracking-widest flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              SOURCE CODE ALIGNMENT
            </h3>
            {isPlaying && (
              <div className="mt-2 text-stone-400 text-xs font-mono">
                BASE: {frequency}Hz <br/>
                EMITTING: {(soundMode === 'high' ? frequency * 4 : frequency).toFixed(1)}Hz
              </div>
            )}
            {isDefending && (
              <div className="mt-2 text-red-500 font-bold text-sm bg-red-500/20 px-2 py-1 rounded inline-block animate-pulse">
                WARNING: ANOMALY DETECTED. HIGH-FREQ PURGE ENGAGED.
              </div>
            )}
          </div>
          
          {/* Secondary Overlay HUD: Spiritual Protection Score */}
          <div className="absolute top-32 left-4 z-10 pointer-events-none">
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col gap-1 backdrop-blur-sm min-w-[140px]">
               <span className="text-[10px] text-stone-500 font-mono tracking-wider uppercase">Spiritual Shield</span>
               <div className="flex items-center gap-3">
                 <Shield className={`w-5 h-5 ${
                   protectionScore > 80 ? 'text-teal-400' : protectionScore > 50 ? 'text-amber-400' : 'text-rose-400'
                 }`} />
                 <span className={`text-2xl font-bold font-mono ${
                   protectionScore > 80 ? 'text-teal-300' : protectionScore > 50 ? 'text-amber-300' : 'text-rose-300'
                 }`}>
                   {protectionScore}%
                 </span>
               </div>
               <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mt-1">
                 <div 
                   className={`h-full transition-all duration-500 ${
                     protectionScore > 80 ? 'bg-teal-400' : protectionScore > 50 ? 'bg-amber-400' : 'bg-rose-400'
                   }`} 
                   style={{ width: `${protectionScore}%` }} 
                 />
               </div>
               {protectionScore === 100 && (
                 <span className="text-[9px] text-teal-400 animate-pulse mt-1">MAXIMUM PROTECTION</span>
               )}
            </div>
          </div>

          <div className="absolute top-4 right-4 z-10">
             <button
                onClick={toggleScanning}
                className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-2 transition-all ${
                  isScanning 
                    ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-300' 
                    : 'border-white/10 bg-black/40 text-stone-400 hover:text-white'
                }`}
              >
                {isScanning ? (
                  <><Activity className="w-4 h-4 animate-spin" /> SCANNING FOR ENTITIES...</>
                ) : (
                  <><ShieldAlert className="w-4 h-4" /> PROTECT ENERGY (SCAN)</>
                )}
             </button>
          </div>

          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <AlignmentVisualizer 
               frequency={frequency} 
               waveType={waveShape} 
               isPlaying={isPlaying} 
               isDefending={isDefending} 
               pendulumOn={pendulumOn}
               isScanning={isScanning}
            />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isDefending} autoRotateSpeed={2} />
          </Canvas>

          {/* Player controls overlay bottom */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
            <div className="bg-black/50 backdrop-blur-md px-6 py-4 rounded-full border border-white/20 shadow-[0_0_30px_rgba(45,212,191,0.2)] flex items-center gap-6">
              
              <button
                onClick={handlePlayToggle}
                className={`w-14 items-center justify-center flex h-14 rounded-full shadow-lg transition-all ${
                  isPlaying ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/50' : 'bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/50'
                }`}
              >
                {isPlaying ? <Square fill="currentColor" className="w-5 h-5"/> : <Play fill="currentColor" className="w-6 h-6 ml-1"/>}
              </button>
              
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-full md:w-80 space-y-4">
          <div className="bg-stone-900/60 p-5 rounded-2xl border border-white/5 space-y-6 shadow-xl">
            <h4 className="text-white font-medium flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <Settings2 className="w-4 h-4 text-stone-400" />
              Tuning Parameters
            </h4>

            {/* Frequency Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-mono">FREQUENCY PITCH</span>
                <span className="text-teal-400 font-mono font-bold">{frequency} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-teal-500 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                 <button onClick={() => setFrequency(signatureFreq)} className="text-[10px] uppercase text-stone-500 hover:text-teal-400 transition-colors">
                    Reset to Signature
                 </button>
                 <button onClick={() => setFrequency(528)} className="text-[10px] uppercase text-stone-500 hover:text-amber-400 transition-colors">
                    528 Hz (Miracle)
                 </button>
              </div>
            </div>

            {/* Sound Mode */}
            <div className="space-y-2">
              <span className="text-stone-500 text-[10px] font-mono tracking-wider">SOUND PROFILE</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hum', label: 'Hummm' },
                  { id: 'tone', label: 'Tone' },
                  { id: 'high', label: 'High Pitch' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSoundMode(opt.id as any)}
                    className={`py-2 px-1 text-[11px] rounded-lg border transition-all ${
                      soundMode === opt.id 
                        ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]' 
                        : 'bg-stone-900 border-white/5 text-stone-500 hover:text-stone-300 hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wave Shape */}
            <div className="space-y-2">
              <span className="text-stone-500 text-[10px] font-mono tracking-wider">GEOMETRY (SINE / TRIANGLE)</span>
              <div className="grid grid-cols-3 gap-2">
                {['sine', 'triangle', 'square'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setWaveShape(opt as any)}
                    disabled={soundMode === 'hum'}
                    className={`py-2 px-1 text-[11px] rounded-lg border transition-all ${
                      waveShape === opt && soundMode !== 'hum'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                        : 'bg-stone-900 border-white/5 text-stone-500 hover:text-stone-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed'
                    }`}
                  >
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Modifiers */}
            <div className="space-y-2">
              <span className="text-stone-500 text-[10px] font-mono tracking-wider">MODIFIERS</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setPendulumOn(!pendulumOn)}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                    pendulumOn ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-stone-900 border-white/5 text-stone-400 hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs">Pendulum Sweep (L/R)</span>
                  <div className={`w-3 h-3 rounded-full ${pendulumOn ? 'bg-purple-400 animate-pulse' : 'bg-stone-700'}`} />
                </button>
                
                <button
                  onClick={() => setSporadicOn(!sporadicOn)}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                    sporadicOn ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-stone-900 border-white/5 text-stone-400 hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col items-start gap-1">
                     <span className="text-xs">Sporadic Dash Melody</span>
                     <span className="text-[9px] text-stone-500 leading-tight">Generates sequence patterns</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${sporadicOn ? 'bg-blue-400 animate-pulse' : 'bg-stone-700'}`} />
                </button>
              </div>
            </div>

          </div>
          
          {/* Energy Protection Box */}
          <div className="bg-stone-900/40 border border-red-500/20 rounded-2xl p-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
            <h4 className="flex items-center gap-2 text-stone-300 text-sm font-medium mb-3">
              <Shield className="w-4 h-4 text-red-400" />
              Energy Shield
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs mb-4">
              When scanning is active, the system employs near-field simulated phenomena mapping. Once an energy vampire, archon entity, or scanning anomaly is detected, it will automatically blast a 12kHz high-pitch square wave in its direction to clear the field.
            </p>
            <button
               onClick={handleDetectedAnomaly}
               className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono uppercase tracking-widest transition-all focus:ring-2 focus:ring-red-500/50"
            >
               Test Blast Signal
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
