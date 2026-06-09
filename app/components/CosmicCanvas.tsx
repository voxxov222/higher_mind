import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, Pause, Star, Circle, Sparkles, Compass 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define planets interface
interface CosmicPlanet {
  id: string;
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  baseAngle: number;
  description: string;
  astrologySig: string;
}

// Synthesis Solfeggio Frequency Player
const playSolfeggioTone = (frequency: number) => {
  if (typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 2.0);
  } catch (e) {
    console.warn('Audio Web API not supported or user gesture required: ', e);
  }
};

const PLANETS_CONFIG: CosmicPlanet[] = [
  { id: 'mer', name: 'Mercury', color: '#a855f7', size: 0.28, distance: 3.5, speed: 2.2, baseAngle: 0.5, description: 'Keeper of intellect, linguistic paths, and divine messages.', astrologySig: 'Gematria Resonance & Mental Transmission' },
  { id: 'ven', name: 'Venus', color: '#ec4899', size: 0.45, distance: 5.2, speed: 1.6, baseAngle: 1.2, description: 'Emanation of harmony, beauty, and emotional magnetic bonds.', astrologySig: 'Coherence, Grace, and Sacred Balance' },
  { id: 'ear', name: 'Earth', color: '#06b6d4', size: 0.48, distance: 7.2, speed: 1.2, baseAngle: 2.1, description: 'Core grounding medium for physical incarnation and conscious logs.', astrologySig: 'Synaptic Synthesis & Terrestrial Focus' },
  { id: 'mar', name: 'Mars', color: '#f43f5e', size: 0.38, distance: 9.0, speed: 0.9, baseAngle: 3.0, description: 'Driver of dynamic physical output, expression, and kinetic spirit.', astrologySig: 'Primal Fuel, Sovereignty, and Assertion' },
  { id: 'jup', name: 'Jupiter', color: '#eab308', size: 0.95, distance: 12.0, speed: 0.55, baseAngle: 4.0, description: 'Amplifier of consciousness expansion, wisdom, and synchronicity.', astrologySig: 'Evolution, Deep Abundance & Portal Opening' },
  { id: 'sat', name: 'Saturn', color: '#d97706', size: 0.82, distance: 15.0, speed: 0.38, baseAngle: 5.0, description: 'The cosmic chronometer. Governor of natural laws, time, and structures.', astrologySig: 'Karmic Blueprint, Threshold, Discipline' },
  { id: 'ura', name: 'Uranus', color: '#10b981', size: 0.62, distance: 18.0, speed: 0.26, baseAngle: 0.1, description: 'Generator of higher intuition, lightning breakthroughs, and change.', astrologySig: 'Cosmic Matrix Code, Liberation, Intuitive spark' },
  { id: 'nep', name: 'Neptune', color: '#3b82f6', size: 0.60, distance: 21.0, speed: 0.18, baseAngle: 1.8, description: 'Conduit to dreams, astral projections, and unconditional flow.', astrologySig: 'Unconscious Depths, Mysticism, Unveiling' }
];

const ALIGNMENTS = [
  { name: 'Linear Syzygy', id: 'syzygy', formula: '0', freq: 528, label: 'Grand Solar Conjunction', desc: 'All orbits line up perfectly along the prime meridian vectors, initiating an intense portal of linear energy.', color: '#38bdf8' },
  { name: 'Grand Trine (120°)', id: 'trine', formula: '120', freq: 417, label: 'Sacred Triad Integration', desc: 'Planets distribute at perfect 120-degree intervals relative to one another, forming an equilateral celestial triangle.', color: '#d946ef' },
  { name: 'Golden Ratio (137.5°)', id: 'golden', formula: 'phi', freq: 639, label: 'Fibonacci Spiral Alignment', desc: 'The angle between consecutive orbits conforms to the Golden Angle, creating infinite natural harmony.', color: '#eab308' },
  { name: 'Pentalpha Star (72°)', id: 'pentalpha', formula: '72', freq: 741, label: 'Sacred Pentagram Alignment', desc: 'Symmetrical five-point alignment mimicking the geometry of the mystical star, mapping the pathways of the mind.', color: '#10b981' },
  { name: 'Quantum Helix', id: 'helix', formula: 'helix', freq: 852, label: 'Dimensional Spiral Array', desc: 'Orbital spheres ascend sequentially along a vertical axis representation, demonstrating vibrational evolution.', color: '#ec4899' }
];

// Inside the Three.js Canvas
const PlanetarySystem = ({ 
  selectedPlanet, 
  setSelectedPlanet, 
  isPlaying, 
  speed, 
  alignmentModel,
  showOrbits,
  holographicGrid,
  gravitationalWaves
}: {
  selectedPlanet: string|null;
  setSelectedPlanet: (p: string|null) => void;
  isPlaying: boolean;
  speed: number;
  alignmentModel: string;
  showOrbits: boolean;
  holographicGrid: boolean;
  gravitationalWaves: boolean;
}) => {
  const systemRef = useRef<THREE.Group>(null);
  const timeRef = useRef<number>(0);
  const waveRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (isPlaying) {
      timeRef.current += delta * speed * 0.15;
    }

    if (waveRef.current && gravitationalWaves) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
      waveRef.current.scale.set(s, 1, s);
      const mat = waveRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = (2 - s) * 0.15;
      }
    }
  });

  return (
    <group ref={systemRef}>
      {/* Central Star - The Sun */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color="#f59e0b" 
          emissive="#fb923c" 
          emissiveIntensity={1.8} 
        />
        <pointLight color="#fb923c" intensity={3} distance={50} />
      </mesh>

      {/* Holographic Orbits, Waves, or Grids */}
      {holographicGrid && (
        <gridHelper args={[46, 46, '#1e1b4b', '#0f172a']} position={[0, -0.01, 0]} />
      )}

      {/* Gravitational Wave Pulse Plane */}
      {gravitationalWaves && (
        <mesh ref={waveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0, 20, 64]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Loop through each planet */}
      {PLANETS_CONFIG.map((planet, index) => {
        return (
          <PlanetSphere
            key={planet.id}
            planet={planet}
            index={index}
            timeRef={timeRef}
            alignmentModel={alignmentModel}
            showOrbits={showOrbits}
            isSelected={selectedPlanet === planet.id}
            onSelect={() => setSelectedPlanet(planet.id === selectedPlanet ? null : planet.id)}
          />
        );
      })}

      {/* Alignment Visual Geometries (Sacred Energy Vectors) */}
      {alignmentModel !== 'none' && (
        <AlignmentConnections alignmentModel={alignmentModel} />
      )}
    </group>
  );
};

const PlanetSphere = ({ 
  planet, 
  index, 
  timeRef, 
  alignmentModel, 
  showOrbits,
  isSelected,
  onSelect
}: {
  planet: CosmicPlanet;
  index: number;
  timeRef: React.MutableRefObject<number>;
  alignmentModel: string;
  showOrbits: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Compute live positions inside useFrame to support alignments
  useFrame(() => {
    if (meshRef.current) {
      let finalAngle: number;
      let finalY = 0;

      if (alignmentModel === 'syzygy') {
        // Line them all up perfectly at 0 radians (straight line)
        finalAngle = 0;
      } else if (alignmentModel === 'trine') {
        // Equilateral triangle layout (distribute at 120 deg sequence)
        finalAngle = (index % 3) * (Math.PI * 2 / 3);
      } else if (alignmentModel === 'golden') {
        // Golden Angle distribution (137.5 degrees sequence)
        finalAngle = index * (137.5 * Math.PI / 180);
      } else if (alignmentModel === 'pentalpha') {
        // Distribute uniformly to outline standard pentagram node vertices (72 deg intervals)
        finalAngle = (index % 5) * (72 * Math.PI / 180);
      } else if (alignmentModel === 'helix') {
        // Helix spiral ascending
        finalAngle = index * 0.9;
        finalY = index * 0.6 - 2.0;
      } else {
        // Standard normal free orbital movement based on simulation time
        finalAngle = planet.baseAngle + timeRef.current * planet.speed;
      }

      meshRef.current.position.x = Math.cos(finalAngle) * planet.distance;
      meshRef.current.position.z = Math.sin(finalAngle) * planet.distance;
      meshRef.current.position.y = finalY;
      
      // Spinner rotation of sphere
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group>
      {/* Orbit Line Ring */}
      {showOrbits && (
        <group>
          {alignmentModel === 'helix' ? (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, index * 0.6 - 2.0, 0]}>
              <ringGeometry args={[planet.distance - 0.03, planet.distance + 0.03, 128]} />
              <meshBasicMaterial color={planet.color} opacity={0.12} transparent />
            </mesh>
          ) : (
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.distance - 0.03, planet.distance + 0.03, 128]} />
              <meshBasicMaterial color={planet.color} opacity={0.16} transparent />
            </mesh>
          )}
        </group>
      )}

      {/* Planet Active Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial 
          color={planet.color} 
          emissive={planet.color}
          emissiveIntensity={isSelected ? 1.6 : (hovered ? 0.9 : 0.4)}
          wireframe={isSelected}
        />

        {/* Outer Halo aura aura */}
        {isSelected && (
          <pointLight color={planet.color} intensity={1.5} distance={5} />
        )}

        {/* Dynamic HTML floating tag */}
        {(hovered || isSelected) && (
          <Html position={[0, planet.size + 0.4, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-black/95 opacity-90 border border-white/20 px-3 py-1.5 rounded-lg text-center select-none shadow-xl pointer-events-none whitespace-nowrap">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-mono">{planet.name}</span>
              <span className="text-[10px] text-white block mt-0.5">{planet.astrologySig}</span>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};

// Component to render energy connections between aligned planets
const AlignmentConnections = ({ alignmentModel }: { alignmentModel: string }) => {
  const lineRef = useRef<THREE.LineSegments>(null);

  // Dynamically build vertex array matching active alignment model
  const connectionPoints = useMemo(() => {
    const coords: THREE.Vector3[] = [];
    const positions = PLANETS_CONFIG.map((planet, index) => {
      if (alignmentModel === 'syzygy') {
        const angle = 0;
        return new THREE.Vector3(Math.cos(angle) * planet.distance, 0, Math.sin(angle) * planet.distance);
      } else if (alignmentModel === 'trine') {
        const angle = (index % 3) * (Math.PI * 2 / 3);
        return new THREE.Vector3(Math.cos(angle) * planet.distance, 0, Math.sin(angle) * planet.distance);
      } else if (alignmentModel === 'golden') {
        const angle = index * (137.5 * Math.PI / 180);
        return new THREE.Vector3(Math.cos(angle) * planet.distance, 0, Math.sin(angle) * planet.distance);
      } else if (alignmentModel === 'pentalpha') {
        const angle = (index % 5) * (72 * Math.PI / 180);
        return new THREE.Vector3(Math.cos(angle) * planet.distance, 0, Math.sin(angle) * planet.distance);
      } else if (alignmentModel === 'helix') {
        const angle = index * 0.9;
        return new THREE.Vector3(Math.cos(angle) * planet.distance, index * 0.6 - 2.0, Math.sin(angle) * planet.distance);
      }
      return new THREE.Vector3(0, 0, 0);
    });

    // Generate lines connecting planets for beautiful sacred geometry webs
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        // Draw full star polygons or custom loops depending on the style
        if (alignmentModel === 'trine' && i % 3 === j % 3) {
          coords.push(positions[i], positions[j]);
        } else if (alignmentModel === 'pentalpha' && i % 5 === j % 5) {
          coords.push(positions[i], positions[j]);
        } else if (alignmentModel === 'syzygy' || alignmentModel === 'golden' || alignmentModel === 'helix') {
          // Linear sequential web connection
          if (j === i + 1) {
            coords.push(positions[i], positions[j]);
          }
        }
      }
    }
    return coords;
  }, [alignmentModel]);

  useFrame(() => {
    if (lineRef.current) {
      // Gentle floating/scaling/glowing speed
      const scaleVal = 1 + Math.sin(Date.now() / 300) * 0.02;
      lineRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(connectionPoints.length * 3);
    connectionPoints.forEach((pt, k) => {
      arr[k * 3] = pt.x;
      arr[k * 3 + 1] = pt.y;
      arr[k * 3 + 2] = pt.z;
    });
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, [connectionPoints]);

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial 
        color={alignmentModel === 'trine' ? '#d946ef' : alignmentModel === 'pentalpha' ? '#10b981' : '#a855f7'} 
        linewidth={1.5}
        transparent
        opacity={0.7}
      />
    </lineSegments>
  );
};


// Main Component exported
export const CosmicCanvas = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string|null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.2);
  const [alignmentModel, setAlignmentModel] = useState<string>('none');
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [holographicGrid, setHolographicGrid] = useState<boolean>(true);
  const [gravitationalWaves, setGravitationalWaves] = useState<boolean>(false);
  const [activeFov, setActiveFov] = useState<number>(65);

  const activePlanetObj = useMemo(() => {
    return PLANETS_CONFIG.find(p => p.id === selectedPlanet) || null;
  }, [selectedPlanet]);

  const activeAlignmentObj = useMemo(() => {
    return ALIGNMENTS.find(a => a.id === alignmentModel) || null;
  }, [alignmentModel]);

  const handleAlignmentChange = (alignId: string) => {
    setAlignmentModel(alignId);
    if (alignId !== 'none') {
      const selectedAlign = ALIGNMENTS.find(a => a.id === alignId);
      if (selectedAlign) {
        playSolfeggioTone(selectedAlign.freq);
      }
    }
  };

  return (
    <div className="bg-zinc-950 rounded-3xl border border-indigo-500/20 overflow-hidden relative min-h-[750px] flex flex-col md:flex-row font-sans text-white">
      
      {/* 3D Web Canvas Section */}
      <div className="flex-1 relative min-h-[500px] md:min-h-0 bg-black">
        <Canvas camera={{ position: [0, 16, 22], fov: activeFov }}>
          <color attach="background" args={['#020202']} />
          <ambientLight intensity={0.15} />
          <Stars radius={120} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1.5} />
          
          <PlanetarySystem 
            selectedPlanet={selectedPlanet} 
            setSelectedPlanet={setSelectedPlanet}
            isPlaying={isPlaying} 
            speed={speed} 
            alignmentModel={alignmentModel}
            showOrbits={showOrbits}
            holographicGrid={holographicGrid}
            gravitationalWaves={gravitationalWaves}
          />
          <OrbitControls 
            maxDistance={40} 
            minDistance={4} 
            maxPolarAngle={Math.PI / 1.8} 
          />
        </Canvas>

        {/* Overlay Interactive Legend of planets */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="flex items-center gap-3 bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
            <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Planetary Array</h2>
              <p className="text-[9px] text-zinc-400 tracking-widest uppercase mt-0.5">Quantum Vector Alignment</p>
            </div>
          </div>
        </div>

        {/* Real-time Status Overlay HUD */}
        <div className="absolute bottom-6 left-6 z-10 p-4 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col gap-2 shadow-2xl">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 font-bold">
            <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
            Cosmos Status
          </div>
          <div className="flex flex-col gap-1 text-[11px] font-mono text-zinc-300">
            <div>Vector Mode: <span className="text-indigo-400 uppercase">{alignmentModel === 'none' ? 'Dynamic' : alignmentModel}</span></div>
            <div>Time Multiplier: <span className="text-indigo-400">x{speed.toFixed(1)}</span></div>
            <div>Grav Waves: <span className={gravitationalWaves ? "text-emerald-400" : "text-zinc-500"}>{gravitationalWaves ? "Active" : "Disabled"}</span></div>
          </div>
        </div>

        {/* Small Navigation helper keys */}
        <div className="absolute right-6 bottom-6 z-10 flex flex-col gap-1 p-2 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
          <button 
            onClick={() => setActiveFov(prev => Math.min(prev + 5, 85))} 
            className="w-8 h-8 flex items-center justify-center text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors font-mono"
            title="Zoom Out"
          >
            -
          </button>
          <button 
            onClick={() => setActiveFov(prev => Math.max(prev - 5, 35))} 
            className="w-8 h-8 flex items-center justify-center text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors font-mono"
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>

      {/* Side HUD Control Console Panel */}
      <div className="w-full md:w-96 bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-none shadow-2xl relative z-10">
        <div>
          {/* Header */}
          <div className="border-b border-white/10 pb-4 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Stellar Alignment Engine</h3>
            <p className="text-xs text-zinc-400 mt-1">Simulate galactic synchronicity vectors using astronomical ratios.</p>
          </div>

          {/* Alignment Selection Grid */}
          <div className="mb-6">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block mb-3">Alignments Configuration</span>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleAlignmentChange('none')}
                className={`py-3 px-4 rounded-xl text-left text-xs font-mono transition-all border ${
                  alignmentModel === 'none' 
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-100 shadow-md shadow-indigo-950' 
                    : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>● Dynamic Coordinates</span>
                  <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">FREE STATE</span>
                </div>
              </button>

              {ALIGNMENTS.map(align => (
                <button
                  key={align.id}
                  onClick={() => handleAlignmentChange(align.id)}
                  className={`py-3 px-4 rounded-xl text-left text-xs font-mono transition-all border ${
                    alignmentModel === align.id 
                      ? 'bg-white/10 text-white' 
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                  style={{ 
                    borderColor: alignmentModel === align.id ? align.color : 'transparent',
                    boxShadow: alignmentModel === align.id ? `0 0 12px ${align.color}15` : '' 
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Star size={10} style={{ color: align.color }} /> {align.name}
                    </span>
                    <span className="text-[8px] tracking-widest text-[#f0abfc]">{align.freq} Hz</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">{align.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Speed & Controls Panel */}
          <div className="mb-6 bg-white/5 rounded-2xl border border-white/5 p-4">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block mb-3">Spacecraft Orbit Velocity</span>
            <div className="flex gap-4 items-center mb-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${
                  isPlaying 
                    ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20' 
                    : 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/40'
                }`}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              
              <div className="flex-1">
                <input 
                  type="range" 
                  min="0.1" 
                  max="4" 
                  step="0.1" 
                  value={speed} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-1">
                  <span>Slow</span>
                  <span>x{speed.toFixed(1)}</span>
                  <span>Hyper</span>
                </div>
              </div>
            </div>

            {/* Orbital toggles */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => setShowOrbits(!showOrbits)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-mono border transition-colors ${
                  showOrbits 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' 
                    : 'bg-transparent border-white/5 text-zinc-500'
                }`}
              >
                Orbit rings
              </button>
              <button
                onClick={() => setHolographicGrid(!holographicGrid)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-mono border transition-colors ${
                  holographicGrid 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' 
                    : 'bg-transparent border-white/5 text-zinc-500'
                }`}
              >
                Chamber grid
              </button>
              <button
                onClick={() => setGravitationalWaves(!gravitationalWaves)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-mono border transition-colors col-span-2 ${
                  gravitationalWaves 
                    ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' 
                    : 'bg-transparent border-white/5 text-zinc-500'
                }`}
              >
                Gravitational Waves {gravitationalWaves ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>

        {/* Selected Alignment Info or Planet Info inside HUD */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <AnimatePresence mode="wait">
            {activePlanetObj ? (
              <motion.div
                key="planet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-widest text-[#f472b6] font-mono font-bold">Selected Sphere</span>
                  <button 
                    onClick={() => setSelectedPlanet(null)} 
                    className="text-[9px] text-zinc-400 hover:text-white uppercase font-mono p-1"
                  >
                    Clear [x]
                  </button>
                </div>
                <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Circle size={10} fill={activePlanetObj.color} style={{ color: activePlanetObj.color }} />
                  {activePlanetObj.name}
                </h4>
                <span className="text-[11px] font-mono text-indigo-300 block mb-2 font-bold uppercase">{activePlanetObj.astrologySig}</span>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">{activePlanetObj.description}</p>
                
                <div className="mt-3 bg-black/40 border border-white/5 p-2 rounded-lg font-mono text-[10px] text-indigo-200 flex justify-between">
                  <span>Relative Orbit Velocity:</span>
                  <span>{activePlanetObj.speed.toFixed(2)} rad/s</span>
                </div>
              </motion.div>
            ) : activeAlignmentObj ? (
              <motion.div
                key="alignment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-mono font-bold">Cosmic Matrix Alignment</span>
                  <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-bold uppercase font-mono">Resonating</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-emerald-400" />
                  {activeAlignmentObj.label}
                </h4>
                <div className="text-[10px] font-mono text-[#fb7185] font-bold block mb-2 uppercase">SOLFEGGIO ENERGY: {activeAlignmentObj.freq} Hz</div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">{activeAlignmentObj.desc}</p>
                <div className="mt-3 bg-black/40 border border-white/5 p-2.5 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block font-mono">Synchronicity Resonance Coherence</span>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-emerald-500 w-[95%] animate-pulse" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 block mt-1 font-bold">95% INTEGRATED</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 text-center"
              >
                <p className="text-xs text-zinc-400 italic">Select an alignment model above or click a planet inside the 3D space to analyze its celestial coordinates.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
