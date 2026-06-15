import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Line, Sphere, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { 
  Moon as MoonIcon, 
  Orbit, 
  Compass, 
  Cpu, 
  ChevronRight, 
  Info, 
  Sparkles as SparklesIcon, 
  Activity, 
  TrendingUp, 
  Maximize2, 
  Minimize2,
  Lock,
  Unlock,
  Radio,
  Clock
} from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';

// 3D Moon Phase Sphere Component
const ThreeMoonPhaseSphere = ({ phaseIndex }: { phaseIndex: number }) => {
  const moonRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.003;
    }
  });

  // Calculate the dark/light side alignment by rotating the directional light around the Y axis
  // 0.0 = New Moon (light from deep behind)
  // 0.25 = First Quarter (light from side, 90 degrees)
  // 0.5 = Full Moon (light from front, 180 degrees)
  // 0.75 = Last Quarter (light from other side, 270 degrees)
  const angle = phaseIndex * Math.PI * 2 + Math.PI; // offset to align with camera
  const lightX = 12 * Math.sin(angle);
  const lightZ = 12 * Math.cos(angle);

  return (
    <group>
      {/* Light representing correct lunar phase lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight 
        position={[lightX, 0.5, lightZ]} 
        intensity={2.2} 
        color="#e0f2fe" 
      />
      
      {/* Subtle blue ambient back-glow representing space backscattering */}
      <pointLight position={[-3, -3, -3]} intensity={0.6} color="#8b5cf6" />
      <pointLight position={[3, 3, 3]} intensity={0.4} color="#00d4ff" />

      {/* Moon geometry with detailed craters look using procedural noise or high-tech wireframe */}
      <mesh ref={moonRef} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshStandardMaterial 
          color="#d1d5db"
          roughness={0.88}
          metalness={0.1}
          bumpScale={0.06}
        />
      </mesh>

      {/* Orbits and holographic halo ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.55, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh rotation={[Math.PI / 2.3, 0.2, 0.1]}>
        <ringGeometry args={[2.8, 2.82, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// 3D Astrological Alignment Orbit Matrix
const ThreeAstrologicalMatrix = ({ activeAlignment }: { activeAlignment: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.08;
    }
  });

  // Generate deterministic planets & orbits
  const bodies = useMemo(() => {
    const names = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    const colors = ['#9ca3af', '#f472b6', '#3b82f6', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#6366f1'];
    
    return names.map((name, i) => {
      const radius = 1.6 + i * 0.75;
      const speed = 0.5 / (radius * 0.5);
      const angle = (i * Math.PI * 2) / 8;
      const size = name === 'Earth' ? 0.22 : i === 4 || i === 5 ? 0.38 : 0.16;
      return { name, radius, speed, angle, color: colors[i], size };
    });
  }, []);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#f59e0b" /> {/* Stellar core light */}

      {/* Radiant Central Sun Core */}
      <Sphere args={[0.5, 32, 32]}>
        <meshBasicMaterial color="#f59e0b" />
      </Sphere>
      <Sparkles count={25} scale={1.5} size={2.5} speed={0.4} color="#f59e0b" />

      {/* High-tech Orbits and Floating Spheres */}
      {bodies.map((b, i) => {
        // Draw orbital concentric ring
        const orbitPts: [number, number, number][] = [];
        const resolution = 120;
        for (let idx = 0; idx <= resolution; idx++) {
          const theta = (idx / resolution) * Math.PI * 2;
          orbitPts.push([b.radius * Math.cos(theta), 0, b.radius * Math.sin(theta)]);
        }

        // Current planet angle + rotation over time
        return (
          <group key={b.name}>
            <Line points={orbitPts} color="#00d4ff" lineWidth={0.8} transparent opacity={0.12} />
            
            {/* Spinning orbital coordinate marker */}
            <Float speed={2} floatIntensity={0.25} rotationIntensity={1.5}>
              <mesh position={[b.radius * Math.cos(b.angle), 0, b.radius * Math.sin(b.angle)]}>
                <sphereGeometry args={[b.size, 16, 16]} />
                <meshStandardMaterial 
                  color={b.color} 
                  emissive={b.color}
                  emissiveIntensity={0.6}
                  roughness={0.2}
                  metalness={0.8} 
                />
              </mesh>
            </Float>
          </group>
        );
      })}

      {/* Holographic Alignment Beam Connection if requested */}
      {activeAlignment && (
        <group>
          {/* Connecting Line between specific orbits to visualize alignments */}
          <Line 
            points={[
              [1.6 * Math.cos(0.2), 0, 1.6 * Math.sin(0.2)],
              [0, 0, 0],
              [4.6 * Math.cos(3.8), 0, 4.6 * Math.sin(3.8)]
            ]} 
            color="#8b5cf6" 
            lineWidth={2.5} 
            dashed 
            dashScale={4}
            transparent 
            opacity={0.8} 
          />
          <Line 
            points={[
              [2.35 * Math.cos(1.2), 0.2, 2.35 * Math.sin(1.2)],
              [3.1 * Math.cos(1.4), -0.1, 3.1 * Math.sin(1.4)]
            ]} 
            color="#00d4ff" 
            lineWidth={3} 
            transparent 
            opacity={0.9} 
          />
        </group>
      )}
    </group>
  );
};

export const PersistentAstrological3DLayer = () => {
  const { cosmicContext, setCosmicContext, cosmicData } = useHigherMind();
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'lunar' | 'transits' | 'alignments' | 'research'>('lunar');
  const [telemetrySignal, setTelemetrySignal] = useState(98);

  const containerRef = useRef<HTMLDivElement>(null);

  // Research images metadata
  const researchFiles = useMemo(() => [
    { 
      id: 'dna', 
      title: 'Ancestral DNA Matrix', 
      path: '/src/assets/images/ancestral_dna_hologram_1781102391880.png',
      desc: 'Holographic mapping of genetic celestial markers.'
    },
    { 
      id: 'karma', 
      title: 'Karmic Particle Flow', 
      path: '/src/assets/images/karmic_ripple_research_1781102405050.png',
      desc: 'Spectral analysis of cause-effect ripples in the ether.'
    },
    { 
      id: 'dream', 
      title: 'Astral Dream Nodes', 
      path: '/src/assets/images/astral_dream_research_1781102417557.png',
      desc: 'Sacred geometry clusters captured from REM state.'
    }
  ], []);

  // Fluctuating Stark Telemetry Uplink quality signal
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetrySignal(prev => Math.min(100, Math.max(92, prev + (Math.random() - 0.5) * 4)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate real-time moon phase parameters
  const lunarData = useMemo(() => {
    const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const msDiff = Date.now() - knownNewMoon;
    const days = msDiff / (1000 * 60 * 60 * 24);
    const cycle = 29.530588853;
    const phaseIndex = (days / cycle) % 1;
    const normalizedIndex = phaseIndex < 0 ? phaseIndex + 1 : phaseIndex;

    // Direct match against known phases
    let name: string;
    let status: string;
    let primaryColor: string;
    let energyFreq: number;
    let quote: string;

    if (normalizedIndex < 0.03 || normalizedIndex >= 0.97) {
      name = "New Moon (Conjunction)";
      status = "DARK INITIATION / VOID";
      primaryColor = "#6b7280";
      energyFreq = 174;
      quote = "Perfect alignment of Sun and Moon. Dive into your subconscious repository.";
    } else if (normalizedIndex >= 0.03 && normalizedIndex < 0.22) {
      name = "Waxing Crescent";
      status = "EMERGENT LIGHT INTENSITY";
      primaryColor = "#10b981";
      energyFreq = 285;
      quote = "Sprouting seeds. Execute dynamic intentions and cosmic planning grids.";
    } else if (normalizedIndex >= 0.22 && normalizedIndex < 0.28) {
      name = "First Quarter (Quadrature)";
      status = "CROSSROADS FRICTION";
      primaryColor = "#0ea5e9";
      energyFreq = 396;
      quote = "Direct 90° angle. Harness tension to take radical physical action.";
    } else if (normalizedIndex >= 0.28 && normalizedIndex < 0.47) {
      name = "Waxing Gibbous";
      status = "REFINEMENT FLUIDICS";
      primaryColor = "#c084fc";
      energyFreq = 417;
      quote = "Iterate existing modules. The peak of spiritual clarity arrives soon.";
    } else if (normalizedIndex >= 0.47 && normalizedIndex < 0.53) {
      name = "Full Moon (Opposition)";
      status = "MAX AMPLITUDE INSIGHT";
      primaryColor = "#fbbf24";
      energyFreq = 528;
      quote = "Total illumination. Celebrate full system manifest and clear outcomes.";
    } else if (normalizedIndex >= 0.53 && normalizedIndex < 0.72) {
      name = "Waning Gibbous";
      status = "GRATITUDE BROADCAST";
      primaryColor = "#8b5cf6";
      energyFreq = 639;
      quote = "Disseminating matrix telemetry. Share knowledge with terrestrial nodes.";
    } else if (normalizedIndex >= 0.72 && normalizedIndex < 0.78) {
      name = "Last Quarter (Quadrature)";
      status = "INNER SYSTEM RE-AUDIT";
      primaryColor = "#f43f5e";
      energyFreq = 741;
      quote = "Release obsolete variables. Dismantle legacy workflows and mental blocks.";
    } else {
      name = "Waning Crescent";
      status = "SYSTEM SURRENDER";
      primaryColor = "#06b6d4";
      energyFreq = 852;
      quote = "The solar matrix darkens. Let details slip back into the cosmic source.";
    }

    return { index: normalizedIndex, name, status, primaryColor, energyFreq, quote };
  }, []);

  // System transits
  const currentTransitsList = useMemo(() => {
    return [
      { body: 'Mercury', sign: 'Leo', state: 'D-Direct', degree: 14.5, speed: 'Superluminal', center: 'Throat' },
      { body: 'Venus', sign: 'Cancer', state: 'H-Harmonic', degree: 28.1, speed: 'Optimal', center: 'Heart' },
      { body: 'Mars', sign: 'Gemini', state: 'A-Active', degree: 2.4, speed: 'Accelerating', center: 'Solar Plexus' },
      { body: 'Jupiter', sign: 'Taurus', state: 'E-Expanded', degree: 19.9, speed: 'Slowing Base', center: 'Crown' },
      { body: 'Saturn', sign: 'Pisces', state: 'R-Retrograde ◀', degree: 10.3, speed: 'Static', center: 'Root' },
    ];
  }, []);

  // Alignments list
  const currentAlignmentsList = useMemo(() => {
    return [
      { aspect: 'Mars Conjunct Jupiter', strength: '94%', harmonicIndex: 0.94, description: 'Aggressive growth trajectory locking into earthly structures' },
      { aspect: 'Sun Trine Saturn', strength: '88%', harmonicIndex: 0.88, description: 'Stable self-governance anchoring your physical blueprint' },
      { aspect: 'Mercury Square Uranus', strength: '76%', harmonicIndex: 0.64, description: 'Quantum telemetry spikes requiring dynamic neural adaptation' },
    ];
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`absolute bottom-24 right-4 z-[999] pointer-events-auto font-orbitron select-none ${isLocked ? 'right-4' : ''}`}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          // Minimised 3D Floating Status Widget
          <motion.button
            key="minimised-hud"
            initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 45 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 bg-stone-950/85 backdrop-blur-xl border-2 border-hud-cyan/50 hover:border-hud-cyan text-hud-cyan p-3.5 rounded-full shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_#00d4ff] transition-all cursor-pointer group"
          >
            <div className="relative flex justify-center items-center">
              <Orbit className="w-6 h-6 animate-spin-slow text-hud-cyan/85" />
              <div className="absolute w-2 h-2 rounded-full bg-hud-cyan animate-ping"></div>
            </div>
            <div className="flex flex-col items-start pr-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-hud-cyan/60 leading-none">Astro-Scope</span>
              <span className="text-xs font-black tracking-wider text-hud-cyan drop-shadow-[0_0_5px_currentColor]">ONLINE</span>
            </div>
          </motion.button>
        ) : (
          // Expanded Immersive Holographic HUD Dashboard Matrix
          <motion.div
            key="expanded-hud"
            initial={{ width: 100, height: 100, opacity: 0, y: 15 }}
            animate={{ width: 380, height: 500, opacity: 1, y: 0 }}
            exit={{ width: 100, height: 100, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="relative bg-stone-950/90 backdrop-blur-2xl border-2 border-hud-cyan/40 px-5 pt-4 pb-6 rounded-3xl shadow-[0_0_40px_rgba(0,212,255,0.25)] flex flex-col justify-between overflow-hidden"
            style={{ 
              boxShadow: `0 0 30px rgba(0, 212, 255, 0.15), inset 0 0 15px rgba(139, 92, 246, 0.1)` 
            }}
          >
            {/* Ambient background grids / scanner lines */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-hud-cyan/40 to-transparent"></div>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-hud-cyan via-hud-violet to-stone-950 pointer-events-none"></div>

            {/* Title / Status Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-3 flex-shrink-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hud-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-hud-cyan"></span>
                  </span>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-hud-cyan">
                    HOLO.ASTRO-SCOPE MATRIX
                  </h3>
                </div>
                <div className="flex items-center gap-2 font-share text-[9px] tracking-widest text-hud-violet drop-shadow-[0_0_3px_rgba(139,92,246,0.3)] select-text mt-0.5">
                  <Compass className="w-2.5 h-2.5" />
                  <span>UPLINK AT TARGET {telemetrySignal.toFixed(1)}% QUALITY</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button 
                  onClick={() => setIsLocked(!isLocked)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isLocked ? 'border-hud-violet text-hud-violet bg-hud-violet/10' : 'border-white/10 text-white/40 hover:text-white/80'}`}
                  title={isLocked ? "Unlock HUD Positioning" : "Pin HUD along screen edge"}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:border-hud-cyan/50 transition-all cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 my-3 flex-shrink-0">
              <button 
                onClick={() => setActiveTab('lunar')}
                className={`flex-1 py-1 px-2 rounded-lg text-[9px] tracking-widest font-bold uppercase transition-all ${activeTab === 'lunar' ? 'bg-hud-cyan text-black shadow-[0_0_10px_#00d4ff]' : 'text-white/60 hover:text-white'}`}
              >
                Lunar Phase
              </button>
              <button 
                onClick={() => setActiveTab('transits')}
                className={`flex-1 py-1 px-2 rounded-lg text-[9px] tracking-widest font-bold uppercase transition-all ${activeTab === 'transits' ? 'bg-hud-violet text-white shadow-[0_0_10px_#8b5cf6]' : 'text-white/60 hover:text-white'}`}
              >
                Transits
              </button>
              <button 
                onClick={() => setActiveTab('alignments')}
                className={`flex-1 py-1 px-2 rounded-lg text-[9px] tracking-widest font-bold uppercase transition-all ${activeTab === 'alignments' ? 'bg-hud-cyan text-black shadow-[0_0_10px_#00d4ff]' : 'text-white/60 hover:text-white'}`}
              >
                Alignments
              </button>
              <button 
                onClick={() => setActiveTab('research')}
                className={`flex-1 py-1 px-2 rounded-lg text-[9px] tracking-widest font-bold uppercase transition-all ${activeTab === 'research' ? 'bg-hud-violet text-white shadow-[0_0_10px_#8b5cf6]' : 'text-white/60 hover:text-white'}`}
              >
                Research
              </button>
            </div>

            {/* Immersive 3D Space Render Section */}
            <div className="relative w-full h-40 bg-stone-950/40 border border-white/10 rounded-2xl overflow-hidden pointer-events-auto">
              <div className="absolute inset-0 bg-blue-950/5 pointer-events-none"></div>
              
              {/* Floating Holographic Compass grids */}
              <div className="absolute left-3 top-3 flex flex-col gap-1 z-10 text-[8px] font-mono tracking-wider text-hud-cyan/60">
                <div className="flex items-center gap-1">
                  <Activity size={10} className="text-hud-cyan" />
                  <span>3D VECTOR: AUTO</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-hud-violet" />
                  <span>EPOCH: J2026.4</span>
                </div>
              </div>
              
              <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1 text-[8px] font-mono text-hud-violet/60">
                <span className="font-bold text-hud-cyan">FOV: 45°</span>
                <span>GRID: MERIDIAN</span>
              </div>

              {/* R3F Canvas */}
              <Canvas camera={{ position: [0, 0, 5], fov: 46 }}>
                <Stars radius={100} depth={20} count={300} factor={4} saturation={0.8} fade speed={0.5} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} enablePan={false} />
                
                {activeTab === 'lunar' ? (
                  <ThreeMoonPhaseSphere phaseIndex={lunarData.index} />
                ) : (
                  <ThreeAstrologicalMatrix activeAlignment={activeTab === 'alignments' ? 'Mars Conjunct Jupiter' : ''} />
                )}
              </Canvas>

              {/* Glowing horizontal line */}
              <div className="absolute bottom-0 inset-x-0 h-[10px] bg-gradient-to-t from-hud-cyan/10 to-transparent"></div>
            </div>

            {/* Metadata information displays */}
            <div className="flex-1 overflow-y-auto mt-3 pr-1 text-xs select-text">
              <AnimatePresence mode="wait">
                {activeTab === 'lunar' && (
                  <motion.div
                    key="lunar-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/50 tracking-wider">CURRENT PHASE</span>
                        <span className="text-sm font-black text-hud-cyan drop-shadow-[0_0_4px_rgba(0,212,255,0.4)]">
                          {lunarData.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-hud-violet block">MODULATION</span>
                        <span className="text-xs font-bold text-hud-violet font-mono">{lunarData.status}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[10px] leading-relaxed font-share tracking-wider text-white/80">
                      <p className="border-l-2 border-hud-violet pl-2 mb-2 italic">
                        "{lunarData.quote}"
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[9px] uppercase tracking-wider text-white/50 pt-2 border-t border-white/5 font-mono">
                        <div>Solfeggio: <span className="text-hud-cyan font-bold">{lunarData.energyFreq} Hz</span></div>
                        <div>Phase progress: <span className="text-hud-cyan font-bold">{(lunarData.index * 100).toFixed(1)}%</span></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'transits' && (
                  <motion.div
                    key="transits-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/40 tracking-wider px-1">
                      <span>RADIAL SPHERE BODY</span>
                      <span>POSITION / COORDINATES</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {currentTransitsList.map((transit) => (
                        <div 
                          key={transit.body}
                          className="flex justify-between items-center bg-white/5 py-1.5 px-3 rounded-xl border border-white/5 hover:border-hud-violet/30 transition-all font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: transit.body === 'Saturn' ? '#fb7185' : '#22d3ee' }}></div>
                            <span className="text-[11px] font-bold text-white">{transit.body}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-[10px] tracking-wider text-hud-violet/80">
                            <span>{transit.sign} {transit.degree.toFixed(1)}°</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-tight font-sans font-black ${transit.state.includes('Retrograde') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-hud-cyan/10 text-hud-cyan border border-hud-cyan/20'}`}>
                              {transit.state}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'alignments' && (
                  <motion.div
                    key="alignments-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/40 tracking-wider px-1">
                      <span>ASTRO ASPECT LINK</span>
                      <span>STRENGTH CORRELATION</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {currentAlignmentsList.map((alignment) => (
                        <div 
                          key={alignment.aspect}
                          className="bg-white/5 p-2.5 rounded-xl border border-white/5 hover:border-hud-cyan/30 transition-all flex flex-col gap-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-hud-cyan tracking-wider">
                              {alignment.aspect}
                            </span>
                            <span className="text-[10px] font-mono font-black text-hud-violet bg-hud-violet/10 border border-hud-violet/20 px-1.5 py-0.5 rounded">
                              {alignment.strength}
                            </span>
                          </div>
                          <p className="text-[9px] font-share leading-relaxed tracking-widest text-white/70">
                            {alignment.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'research' && (
                  <motion.div
                    key="research-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1 px-1">
                       <span className="text-[10px] font-bold text-hud-cyan uppercase tracking-widest">Autonomous Data Extraction</span>
                       <span className="text-[9px] text-white/40 italic">Stark Industries Metaphysical Archives</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                       {researchFiles.map(img => (
                         <div key={img.id} className="relative group overflow-hidden rounded-xl border border-white/5 bg-white/5 p-2 transition-all hover:border-hud-cyan/40">
                            <div className="flex gap-3">
                               <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black">
                                  <img 
                                    src={img.path} 
                                    alt={img.title} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex flex-col justify-center">
                                   <span className="text-[10px] font-bold text-white group-hover:text-hud-cyan transition-colors">{img.title}</span>
                                   <p className="text-[8px] text-white/40 leading-tight mt-0.5">{img.desc}</p>
                                </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive system telemetry footer */}
            <div className="border-t border-white/10 pt-3 flex justify-between items-center text-[8px] font-mono tracking-widest text-white/40 flex-shrink-0 mt-2">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-hud-cyan animate-pulse" />
                <span>GRID ALIGNED: AUTO</span>
              </div>
              <span className="text-hud-violet drop-shadow-[0_0_3px_currentColor]">SECURE CORRELATION</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
