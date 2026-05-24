import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, Sparkles, CircleAlert, CheckCircle, 
  Terminal, BarChart2, Shield, Wand2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer
} from 'recharts';
import { CosmicData } from '../types';
import { soundEngine } from '../lib/soundEffects';

interface AvatarMatrixProps {
  data: CosmicData | null;
}

// -------------------------------------------------------------
// Interactive 3D Humanoid Hologram (Constructed via Particles)
// -------------------------------------------------------------
const AvatarHologramModel = ({ 
  chakras, 
  onSelectNode, 
  selectedNodeIndex 
}: { 
  chakras: any[]; 
  onSelectNode: (idx: number) => void; 
  selectedNodeIndex: number | null;
}) => {
  const outerSphereRef = useRef<THREE.Group>(null);
  const particleGroupRef = useRef<THREE.Group>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate abstract particle positions representing a humanoid meridian silhouette
  const avatarParticles = useMemo(() => {
    const points: [number, number, number][] = [];
    
    // Spine (central core channel)
    for (let i = -3; i <= 3; i += 0.15) {
      points.push([0, i, 0]);
    }
    
    // Head orbit
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      points.push([
        Math.cos(angle) * 0.7, 
        3.5 + Math.sin(angle * 2) * 0.2, 
        Math.sin(angle) * 0.7
      ]);
    }

    // Torso cage (ribs/energy bands)
    for (let r = -1.5; r <= 1.5; r += 0.5) {
      const radius = 1.1 * (1.0 - Math.abs(r) * 0.15);
      for (let j = 0; j < 16; j++) {
        const theta = (j / 16) * Math.PI * 2;
        points.push([
          Math.cos(theta) * radius,
          r,
          Math.sin(theta) * radius
        ]);
      }
    }

    // Limbs (Arms)
    for (let left = 0; left < 15; left++) {
      const parentX = -0.8 - (left * 0.12);
      const parentY = 1.2 - (left * 0.15);
      points.push([parentX, parentY, Math.sin(left * 0.4) * 0.1]);
      points.push([-parentX, parentY, -Math.sin(left * 0.4) * 0.1]); // Right arm
    }

    // Limbs (Legs)
    for (let leftLeg = 0; leftLeg < 20; leftLeg++) {
      const parentX = -0.4 - (leftLeg * 0.05);
      const parentY = -1.5 - (leftLeg * 0.14);
      points.push([parentX, parentY, Math.cos(leftLeg * 0.2) * 0.05]);
      points.push([-parentX, parentY, -Math.cos(leftLeg * 0.2) * 0.05]); // Right leg
    }

    return points;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.y = t * 0.15;
    }
    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y = -t * 0.08;
      outerSphereRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
    }
  });

  // Canonical positions for energy centers (chakras) along the central coordinate path
  const chakraPositions: [number, number, number][] = [
    [0, -2.6, 0],   // Root
    [0, -1.7, 0],   // Sacral
    [0, -0.8, 0],   // Solar Plexus
    [0, 0.4, 0],    // Heart
    [0, 1.5, 0],    // Throat
    [0, 2.6, 0],    // Third Eye
    [0, 3.6, 0],    // Crown
  ];

  return (
    <group>
      {/* Surrounding Auric field (constellation orbit) */}
      <group ref={outerSphereRef}>
        {[...Array(90)].map((_, i) => {
          const lat = Math.acos((Math.random() * 2) - 1);
          const lon = Math.random() * Math.PI * 2;
          const r = 4.2 + Math.sin(lat * 5) * 0.1;
          const x = r * Math.sin(lat) * Math.cos(lon);
          const y = r * Math.sin(lat) * Math.sin(lon);
          const z = r * Math.cos(lat);
          
          return (
            <mesh key={`aura_node_${i}`} position={[x, y, z]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial 
                color={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#a855f7" : "#3b82f6"} 
                transparent 
                opacity={0.18} 
              />
            </mesh>
          );
        })}
      </group>

      {/* Primary Cybernetic Avatar Coordinates */}
      <group ref={particleGroupRef}>
        {avatarParticles.map((pt, i) => (
          <mesh key={`av_pt_${i}`} position={pt}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial 
              color="#06b6d4" 
              transparent 
              opacity={0.35 + Math.sin(pt[1] * 2 + i) * 0.15} 
            />
          </mesh>
        ))}

        {/* Dynamic Connected Lines of the Meridian Lattice */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 1.0;
          return (
            <line key={`meridian_line_${i}`}>
              <bufferGeometry>
                <float32Array attach="attributes-position" args={[
                  new Float32Array([
                    0, -2.8, 0,
                    Math.cos(angle) * r, 0, Math.sin(angle) * r,
                    0, 3.7, 0
                  ]),
                  3
                ]} />
              </bufferGeometry>
              <lineBasicMaterial color="#0891b2" transparent opacity={0.06} />
            </line>
          );
        })}
      </group>

      {/* Render 7 Interactive Energy Center Spheres */}
      {chakras.map((chk, i) => {
        const isSelected = selectedNodeIndex === i;
        const isHovered = hoveredIndex === i;
        const pos = chakraPositions[i] || [0, i - 3, 0];
        const chkColor = new THREE.Color(chk.color);
        
        return (
          <group key={`energy_gate_${i}`} position={pos}>
            {/* Outer Glowing Pulsing Ring */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.6 : isHovered ? 0.45 : 0.3, 16, 16]} />
              <meshBasicMaterial 
                color={chkColor} 
                transparent 
                opacity={isSelected ? 0.55 : isHovered ? 0.35 : 0.15} 
                blending={THREE.AdditiveBlending} 
              />
            </mesh>

            {/* Solid Center Node */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                const playSelect = soundEngine.select || soundEngine.mysticClick;
                if (playSelect) playSelect();
                onSelectNode(i);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredIndex(i);
                const playHover = soundEngine.hover || soundEngine.mysticHover;
                if (playHover) playHover();
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredIndex(null);
              }}
            >
              <sphereGeometry args={[isSelected ? 0.22 : 0.14, 16, 16]} />
              <meshStandardMaterial 
                color={chkColor} 
                emissive={chkColor}
                emissiveIntensity={isSelected ? 4 : isHovered ? 2 : 1.2}
              />
            </mesh>

            {/* Projected Floating Node Label in 3D Space */}
            <Html distanceFactor={8} position={[0.7, 0.1, 0]}>
              <div 
                onClick={() => {
                  const playSelect = soundEngine.select || soundEngine.mysticClick;
                  if (playSelect) playSelect();
                  onSelectNode(i);
                }}
                className={`px-2 py-0.5 rounded cursor-pointer backdrop-blur-md border border-white/10 text-[9px] font-mono tracking-widest whitespace-nowrap transition-all select-none ${
                  isSelected 
                    ? 'bg-white/15 text-white scale-110 border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.15)]' 
                    : isHovered 
                      ? 'bg-black/80 text-cyan-300 border-cyan-500/50' 
                      : 'bg-black/60 text-stone-400'
                }`}
                style={{
                  borderLeft: isSelected ? `2px solid ${chk.color}` : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {chk.name.toUpperCase()} • {chk.score}%
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// -------------------------------------------------------------
// Real-time Scrolling Matrix Stream Component
// -------------------------------------------------------------
const SystemMatrixStream = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const logPool = [
      'SYS_CORE: INITIALIZING HUMAN MATRIX bluePrint...',
      'SIGNAL_LOCK: 528Hz SOLAR CHAKRA SYNCED',
      'AURA_SCAN: RESOLVING SPECTRAL VALUE DEVIATION',
      'KATHARA_GRID: ACTIVE NODE LINKS SYMMETRIC',
      'SACRED_GEO: HEXAGONAL RE-ALIGNMENT AT [23.4, 11]',
      'KARMIC_DEBT: DETECTING ACCRUED RESONANCE INDEX',
      'VORTEX_STREAM: SPIRAL SEQUENCING RESOLVED',
      'COSMIC_GATE: ACCESS OPEN [GATEWAYS_11:11]',
      'NEURAL_LINK: MERIDIAN TELEMETRY STREAMING LIVE',
      'GEMATRIA_TRANS: REDUCTION MATRIX COMPUTATION COMPLETED',
      'UNIVERSAL_BLUEPRINT: ATTAINING STABLE COHERENCY',
      'ALIGN_VAL: 94.8% OPTIMAL CONGRUENCE CAPTURES',
    ];

    setLogs([
      'SYS_CORE: DEPLOYING ASTRAL EMBEDDING ENGINES',
      'SIGNAL_LOCK: SCANNING CHROMATIC VIBRATIONS',
      'NEURAL_LINK: MERIDIAN TELEMETRY CONSTRUCT CONFIRMED'
    ]);

    const interval = setInterval(() => {
      const randomMsg = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toISOString().slice(11, 19);
      setLogs((prev) => {
        const next = [...prev, `[${timestamp}] ${randomMsg}`];
        if (next.length > 20) next.shift();
        return next;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={containerRef}
      className="h-32 bg-stone-950/95 border border-white/5 rounded-xl p-3 font-mono text-[10px] text-cyan-500/90 overflow-y-auto space-y-1 scrollbar-none"
    >
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-1 mb-2 text-cyan-400/60 text-[9px] uppercase tracking-wider font-semibold">
        <Terminal className="w-3.5 h-3.5" />
        <span>Holographic Stream Telemetry Logs</span>
      </div>
      {logs.map((log, idx) => (
        <div key={`stream_log_${idx}`} className="leading-relaxed truncate hover:text-white transition-colors">
          <span className="text-cyan-600/60 mr-1.5">❯</span>
          {log}
        </div>
      ))}
    </div>
  );
};

export const AvatarMatrix = ({ data }: AvatarMatrixProps) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(3); // Default to Heart Chakra

  // Fallback structures if the server hasn't generated dynamic chakra metadata yet
  const defaultChakras = useMemo(() => [
    { name: 'Root', status: 'balanced', score: 78, description: 'Base grounding center, regulating survival forces, safety indicators, and earthly anchors.', color: '#ef4444' },
    { name: 'Sacral', status: 'open', score: 82, description: 'Creative and creative flow matrix, managing expressive patterns, artistic core, and emotional currents.', color: '#f97316' },
    { name: 'Solar Plexus', status: 'balanced', score: 85, description: 'Willpower and authority engine, coordinating personal sovereignty, mental stamina, and inner sun radiance.', color: '#eab308' },
    { name: 'Heart', status: 'balanced', score: 91, description: 'Unifying bridge point, balancing somatic earth aspects with celestial high-mind frequencies.', color: '#22c55e' },
    { name: 'Throat', status: 'open', score: 75, description: 'Communicative frequency channel, projecting truth configurations and sonic self-expression.', color: '#06b6d4' },
    { name: 'Third Eye', status: 'balanced', score: 88, description: 'Inner sight lens and geometric logic hub, integrating intuition vectors and spiritual vision streams.', color: '#6366f1' },
    { name: 'Crown', status: 'open', score: 94, description: 'Universal gate antenna, registering transcendental cosmic alignments and connection to source order.', color: '#a855f7' }
  ], []);

  const rawChakras = data?.chakras || defaultChakras;

  // Key strength/weakness matrix constructed dynamically
  const avatarProperties = useMemo(() => {
    // Collect celestial distributions to build customized outputs
    const elementsCount = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
    if (data?.planets) {
      data.planets.forEach(p => {
        const sign = p.sign.toLowerCase();
        if (['aries', 'leo', 'sagittarius'].includes(sign)) elementsCount.Fire++;
        else if (['cancer', 'scorpio', 'pisces'].includes(sign)) elementsCount.Water++;
        else if (['gemini', 'libra', 'aquarius'].includes(sign)) elementsCount.Air++;
        else if (['taurus', 'virgo', 'capricorn'].includes(sign)) elementsCount.Earth++;
      });
    }

    // Determine strengths based on data
    const strengths = [
      { 
        title: "Adaptive Chromatic Frequency", 
        desc: "High energetic amplitude in upper energy centers provides heightened cognitive synthesis capabilities.",
        category: "ASTRAL"
      },
      { 
        title: `Life Path ${data?.numerology?.lifePath || 7} Anchor`, 
        desc: `Integrated cosmic logic from root values stabilizes emotional wave vectors.`,
        category: "NUMERICAL"
      },
      { 
        title: "Sephirah Resonance Synchronizer", 
        desc: "Direct conduit paths on the Tree of Life facilitate organic alignment under transit squares.",
        category: "MIND"
      }
    ];

    const weaknesses = [
      { 
        title: "Somatic Aura Bleedout", 
        desc: "Vulnerability to sensory overload due to hyper-radiant crown energy, causing grounding displacement.",
        category: "PHYSICAL"
      },
      { 
        title: "Expression Number Disconnect", 
        desc: `Minor coordination delay between core intention parameters and current emotional field valence.`,
        category: "SOUL"
      }
    ];

    return { strengths, weaknesses };
  }, [data]);

  // Chart data matching chakra index properties
  const chartData = useMemo(() => {
    return rawChakras.map(ch => ({
      aspect: ch.name,
      resonance: ch.score,
      limit: 100
    }));
  }, [rawChakras]);

  // Overall aura index details
  const auraIndex = useMemo(() => {
    const avgScore = Math.round(rawChakras.reduce((acc, ch) => acc + ch.score, 0) / rawChakras.length);
    
    // Choose dominant colors
    const topChakras = [...rawChakras].sort((a,b) => b.score - a.score);
    const primaryAuraColor = topChakras[0]?.color || '#a855f7';
    const primaryAuraName = topChakras[0]?.name || 'Crown';
    const secondaryAuraColor = topChakras[1]?.color || '#06b6d4';
    const secondaryAuraName = topChakras[1]?.name || 'Throat';

    return {
      coherency: avgScore,
      primaryColor: primaryAuraColor,
      primaryName: primaryAuraName,
      secondaryColor: secondaryAuraColor,
      secondaryName: secondaryAuraName,
    };
  }, [rawChakras]);

  const activeNodeInfo = rawChakras[selectedNodeIndex] || rawChakras[3];

  return (
    <div className="bg-stone-900/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-8 text-stone-100 shadow-2xl relative overflow-hidden">
      
      {/* Absolute Geometric Ornaments for Mystic Aesthetics */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <UserIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold tracking-wider text-white select-none">COSMIC AVATAR CORE</h2>
            <span className="text-[10px] font-mono border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              MATRIX v3.1 LIVE
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed max-w-xl font-light">
            Interactive multi-variant synthesis mapping. Coordinate Western planetary blueprints, numerical soul currents, 
            and auric density distributions in a unified digital humanoid avatar configuration.
          </p>
        </div>

        {/* Core Numerology Grid Badge */}
        <div className="flex gap-4 items-center self-start">
          <div className="bg-stone-950/80 border border-white/5 p-3 rounded-xl flex items-center gap-3.5 pr-5 shadow-inner">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono font-bold text-lg">
              {data?.numerology?.lifePath || 7}
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-500 font-semibold">Life Path</div>
              <div className="text-xs font-semibold text-white">Universal Key</div>
            </div>
          </div>
          <div className="bg-stone-950/80 border border-white/5 p-3 rounded-xl flex items-center gap-3.5 pr-5 shadow-inner">
            <div className="w-9 h-9 rounded-lg bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-300 font-mono font-bold text-lg">
              {data?.numerology?.soulUrge || 9}
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-purple-500 font-semibold">Soul Urge</div>
              <div className="text-xs font-semibold text-white">Desired Vector</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: INTERACTIVE THREE.JS CANVASES */}
        <div className="lg:col-span-7 flex flex-col gap-4 relative">
          <div className="h-[480px] w-full bg-stone-950/90 border border-white/5 rounded-2xl relative overflow-hidden group">
            {/* Absolute overlay instructions */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-0.5 font-mono select-none">
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">AVATAR LATTICE</span>
              <span className="text-[9px] text-stone-500">Rotate Drag • Click Nodes list</span>
            </div>

            {/* Canvas Component */}
            <Canvas camera={{ position: [0, 0, 7.5], fov: 60 }} dpr={[1, 2]}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              <AvatarHologramModel 
                chakras={rawChakras} 
                onSelectNode={setSelectedNodeIndex} 
                selectedNodeIndex={selectedNodeIndex} 
              />
              
              <OrbitControls 
                enableZoom={true} 
                maxDistance={12} 
                minDistance={5} 
                enablePan={false}
              />
            </Canvas>

            {/* Active Node Detail Pane Overlay inside the Scene */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeNodeInfo.name}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-4 left-4 right-4 bg-stone-950/80 backdrop-blur-md border border-white/10 rounded-xl p-4 flex gap-4 pr-6 select-none shadow-xl"
              >
                <div 
                  className="w-1.5 rounded-full shrink-0" 
                  style={{ backgroundColor: activeNodeInfo.color }}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-xs font-bold font-mono uppercase tracking-widest"
                      style={{ color: activeNodeInfo.color }}
                    >
                      {activeNodeInfo.name} GATEWAY
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono border border-white/5 px-2 py-0.5 rounded-full bg-stone-900">
                      Coherency • {activeNodeInfo.score}%
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    {activeNodeInfo.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Matrix System Live Log Console */}
          <SystemMatrixStream />
        </div>

        {/* RIGHT COLUMN: CHARTS, AURA ANALYSIS, & BLUEPRINTS */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Aura index analysis cards */}
          <div className="bg-stone-950/80 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-cyan-400 flex items-center gap-1.5 pb-2.5 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AURA SPECTRUM ANALYSIS</span>
            </h3>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 select-none font-mono">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: auraIndex.primaryColor }} />
                  <span>Primary: <b className="text-white">{auraIndex.primaryName}</b> Resonance</span>
                </span>
                <span className="text-cyan-400 font-bold">{auraIndex.coherency}% density</span>
              </div>
              
              {/* Outer Glow Progress Bar */}
              <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${auraIndex.coherency}%`,
                    backgroundColor: auraIndex.primaryColor,
                    boxShadow: `0 0 10px ${auraIndex.primaryColor}`
                  }}
                />
              </div>
            </div>

            {/* Aura indexes breakdowns */}
            <div className="grid grid-cols-2 gap-4 pt-1 select-none">
              <div className="bg-stone-900/60 border border-white/5 p-3 rounded-xl">
                <div className="text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-0.5">Primary Frequency</div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: auraIndex.primaryColor }} />
                  <span className="text-xs font-semibold text-stone-200">{auraIndex.primaryName}</span>
                </div>
              </div>

              <div className="bg-stone-900/60 border border-white/5 p-3 rounded-xl">
                <div className="text-[9px] font-mono uppercase tracking-widest text-stone-500 mb-0.5">Harmonic Secondary</div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: auraIndex.secondaryColor }} />
                  <span className="text-xs font-semibold text-stone-200">{auraIndex.secondaryName}</span>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-stone-500 font-mono text-center">
              Coherency matrix derived from weighted chakra node distribution scores.
            </p>
          </div>

          {/* Recharts Resonance Radar Charts */}
          <div className="bg-stone-950/80 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-purple-400 flex items-center gap-1.5 pb-2 border-b border-white/5">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <span>ENERGY HUB RESONANCE</span>
            </h3>

            <div className="h-60 w-full flex items-center justify-center p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="80%" data={chartData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                  <PolarAngleAxis 
                    dataKey="aspect" 
                    tick={{ fill: 'rgba(214, 211, 209, 0.6)', fontSize: 9, fontFamily: 'monospace' }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: 'rgba(214, 211, 209, 0.4)', fontSize: 7 }} 
                  />
                  <Radar 
                    name="Resonance Score" 
                    dataKey="resonance" 
                    stroke="#a855f7" 
                    fill="#a855f7" 
                    fillOpacity={0.25} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strengths & Weaknesses Panel */}
          <div className="bg-stone-950/80 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl flex-grow">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-white/5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>AVATAR PROFILE STRENGTH / WEAKNESS INDEXING</span>
            </h3>

            <div className="space-y-4 text-xs font-light">
              {/* Strengths */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">KEY STRENGTHS</div>
                {avatarProperties.strengths.map((str, idx) => (
                  <div key={`str_${idx}`} className="flex gap-2.5 items-start bg-emerald-950/15 border border-emerald-500/10 p-2.5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-stone-200">
                        {str.title} <span className="text-[8px] font-mono font-normal opacity-50 px-1 border border-emerald-500/20 rounded ml-1.5">{str.category}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{str.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weaknesses */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">CORE SHADOWS / EDGE LIMITATONS</div>
                {avatarProperties.weaknesses.map((wk, idx) => (
                  <div key={`wk_${idx}`} className="flex gap-2.5 items-start bg-rose-950/15 border border-rose-500/10 p-2.5 rounded-lg">
                    <CircleAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-stone-200">
                        {wk.title} <span className="text-[8px] font-mono font-normal opacity-50 px-1 border border-rose-500/20 rounded ml-1.5">{wk.category}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{wk.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER: UNIVERSAL SPIIRTUAL SEQUENCES REFERENCE AND PORTALS */}
      <div className="bg-stone-950/80 border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-amber-500 flex items-center gap-1.5 pb-2.5 border-b border-white/5">
          <Wand2 className="w-4 h-4 text-amber-500" />
          <span>UNIVERSAL BLUEPRINT & SPIRITUAL SEQUENCES</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          <div className="border border-white/5 bg-stone-900/40 p-3.5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-amber-500/20 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
              01
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Aura Color Band</div>
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">{auraIndex.primaryName} Magenta</div>
            </div>
          </div>

          <div className="border border-white/5 bg-stone-900/40 p-3.5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
              02
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Universal Blueprint</div>
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">Ray Type {data?.torusAnalysis?.primaryRay || "6 (Indigo)"}</div>
            </div>
          </div>

          <div className="border border-white/5 bg-stone-900/40 p-3.5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-purple-500/20 flex items-center justify-center text-xs font-mono font-bold text-purple-400">
              03
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Spiritual Sequence</div>
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">Portal Gate 11:11</div>
            </div>
          </div>

          <div className="border border-white/5 bg-stone-900/40 p-3.5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-rose-500/20 flex items-center justify-center text-xs font-mono font-bold text-rose-400">
              04
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Dimensional Index</div>
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">Fitted to {data?.torusAnalysis?.dimensionalFrequency || "7D Consciousness"}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
