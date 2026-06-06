import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Text, Stars, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, User, Settings, Hash, Map } from 'lucide-react';
import { calculateAllCiphers } from '../utils/gematria';

const ZodiacConstellations: React.FC<{ visible: boolean; color: string }> = ({ visible, color }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const constellationLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    // generate random constellation wireframes along a sphere
    for (let c = 0; c < 12; c++) { 
      const points: [number, number, number][] = [];
      const numStars = 4 + Math.floor(Math.random() * 5);
      const thetaOffset = (c / 12) * Math.PI * 2;
      const phiOffset = (Math.random() - 0.5) * Math.PI * 0.8;
      
      for (let i = 0; i < numStars; i++) {
        const radius = 18 + Math.random() * 2;
        const theta = thetaOffset + (Math.random() - 0.5) * 0.6;
        const phi = phiOffset + (Math.random() - 0.5) * 0.6;
        
        const x = radius * Math.cos(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi);
        const z = radius * Math.cos(phi) * Math.sin(theta);
        
        points.push([x, y, z]);
      }
      lines.push(points);
    }
    return lines;
  }, []);

  useFrame(() => {
    if (meshRef.current) {
        // Slowly align with camera orientation or subtly rotate
        meshRef.current.rotation.y += 0.001; 
    }
  });

  if (!visible) return null;

  return (
    <group ref={meshRef}>
      {constellationLines.map((pts, i) => (
        <Line key={i} points={pts} color={color} lineWidth={1.5} transparent opacity={0.3} />
      ))}
      {constellationLines.map((pts, i) => (
        <group key={`stars-${i}`}>
          {pts.map((p, j) => (
            <mesh key={j} position={p}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const OrbitalMoon: React.FC<{ color: string, distance: number, speed: number, size: number, offset: number }> = ({ color, distance, speed, size, offset }) => {
    const moonRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(moonRef.current) {
            moonRef.current.rotation.y = state.clock.elapsedTime * speed + offset;
            moonRef.current.rotation.z = Math.sin(state.clock.elapsedTime * speed * 0.5 + offset) * 0.2;
        }
    });

    return (
        <group ref={moonRef}>
            <mesh position={[distance, 0, 0]}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
                <pointLight distance={1} intensity={2} color={color} />
            </mesh>
        </group>
    );
};

const OrbitalPlanet: React.FC<{ 
  symbol: string; 
  color: string; 
  distance: number; 
  speed: number; 
  showPath: boolean;
  showMoons: boolean;
}> = ({ symbol, color, distance, speed, showPath, showMoons }) => {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
    }
    if (textRef.current) {
      // Keep text facing camera by opposing the rotation, roughly
      textRef.current.rotation.y = -state.clock.elapsedTime * 0.2 * speed;
    }
  });

  const pathPoints = useMemo(() => {
    if (!showPath) return [];
    const pts: [number, number, number][] = [];
    for(let i=0; i<=64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        pts.push([Math.cos(theta)*distance, 0, Math.sin(theta)*distance]);
    }
    return pts;
  }, [distance, showPath]);

  const moons = useMemo(() => {
     if (!showMoons) return [];
     const m = [];
     const cnt = Math.floor(Math.random() * 3) + 1;
     for(let i=0; i<cnt; i++) {
        m.push({
           distance: 0.8 + Math.random() * 0.5,
           speed: 1 + Math.random() * 2,
           size: 0.1 + Math.random() * 0.15,
           offset: Math.random() * Math.PI * 2
        });
     }
     return m;
  }, [showMoons, symbol]);

  return (
    <group>
        {showPath && pathPoints.length > 0 && (
            <Line points={pathPoints} color={color} lineWidth={1} transparent opacity={0.2} />
        )}
        <group ref={groupRef}>
            <group position={[distance, 0, 0]}>
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
                    <Text
                        ref={textRef}
                        fontSize={1.5}
                        color={color}
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor={color}
                    >
                        {symbol}
                    </Text>
                    <pointLight distance={3} intensity={5} color={color} />
                </Float>
                
                {moons.map((moon, idx) => (
                    <OrbitalMoon key={idx} color={color} {...moon} />
                ))}
            </group>
        </group>
    </group>
  );
};

const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Aries', symbol: '♈', color: '#ef4444' },     // Fire
  { id: 'taurus', name: 'Taurus', symbol: '♉', color: '#10b981' },    // Earth
  { id: 'gemini', name: 'Gemini', symbol: '♊', color: '#f59e0b' },    // Air
  { id: 'cancer', name: 'Cancer', symbol: '♋', color: '#3b82f6' },    // Water
  { id: 'leo', name: 'Leo', symbol: '♌', color: '#f97316' },          // Fire
  { id: 'virgo', name: 'Virgo', symbol: '♍', color: '#059669' },       // Earth
  { id: 'libra', name: 'Libra', symbol: '♎', color: '#fcd34d' },      // Air
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', color: '#1d4ed8' },   // Water
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', color: '#dc2626' }, // Fire
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', color: '#065f46' }, // Earth
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', color: '#fbbf24' },  // Air
  { id: 'pisces', name: 'Pisces', symbol: '♓', color: '#2563eb' }     // Water
];

const PLANETS = [
  { id: 'sun', name: 'Sun', symbol: '☉', color: '#facc15' },
  { id: 'moon', name: 'Moon', symbol: '☽', color: '#cbd5e1' },
  { id: 'mercury', name: 'Mercury', symbol: '☿', color: '#6ee7b7' },
  { id: 'venus', name: 'Venus', symbol: '♀', color: '#f472b6' },
  { id: 'mars', name: 'Mars', symbol: '♂', color: '#ef4444' },
  { id: 'jupiter', name: 'Jupiter', symbol: '♃', color: '#fb923c' },
  { id: 'saturn', name: 'Saturn', symbol: '♄', color: '#eab308' },
  { id: 'uranus', name: 'Uranus', symbol: '♅', color: '#38bdf8' },
  { id: 'neptune', name: 'Neptune', symbol: '♆', color: '#818cf8' },
  { id: 'pluto', name: 'Pluto', symbol: '♇', color: '#94a3b8' }
];

const AURAS = [
  { id: 'rings', name: 'Orbital Rings', particle: false },
  { id: 'particles', name: 'Particle Swarm', particle: true },
  { id: 'glitch', name: 'Glitch Field', particle: true },
  { id: 'none', name: 'Minimal', particle: false }
];

const GEOMETRIES = [
  { id: 'sphere', name: 'Sphere' },
  { id: 'icosahedron', name: 'Icosahedron' },
  { id: 'octahedron', name: 'Octahedron' },
  { id: 'box', name: 'Cube' }
];

const InteractiveGlyph: React.FC<{ symbol: string; color: string; position: [number, number, number]; scale: number }> = ({ symbol, color, position, scale }) => {
  const textRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Text
        ref={textRef}
        position={position}
        fontSize={scale}
        color={hovered ? '#ffffff' : color}
        anchorX="center"
        anchorY="middle"
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        outlineWidth={0.02}
        outlineColor={color}
      >
        {symbol}
        <meshBasicMaterial toneMapped={false} color={hovered ? '#ffffff' : color} />
      </Text>
      {hovered && (
        <pointLight position={position} distance={3} intensity={5} color={color} />
      )}
    </Float>
  );
};

const EnergyCore: React.FC<{ color: string, geometry: string, aura: string }> = ({ color, geometry, aura }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * Math.PI * 0.2;
      ringRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      {/* Central Core */}
      <mesh ref={meshRef}>
        {geometry === 'sphere' && <sphereGeometry args={[1.5, 64, 64]} />}
        {geometry === 'icosahedron' && <icosahedronGeometry args={[1.5, 0]} />}
        {geometry === 'octahedron' && <octahedronGeometry args={[1.5, 0]} />}
        {geometry === 'box' && <boxGeometry args={[2, 2, 2]} />}
        
        <MeshDistortMaterial
          color={color}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          distort={geometry === 'sphere' ? 0.4 : 0.1}
          speed={2}
          transparent
          opacity={0.8}
          wireframe={geometry !== 'sphere' && aura === 'glitch'}
        />
      </mesh>

      {/* Aura Effects */}
      {aura === 'rings' && (
        <mesh ref={ringRef}>
          <torusGeometry args={[2.5, 0.02, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
      {aura === 'particles' && (
        <group scale={1.5}>
          <Stars depth={10} count={300} factor={2} radius={3} fade speed={2} />
        </group>
      )}
      {aura === 'glitch' && (
        <mesh>
          <sphereGeometry args={[1.8, 16, 16]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  );
};

const GematriaOrbiters: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const results = useMemo(() => {
    if (!text || text.trim() === '') return [];
    return calculateAllCiphers(text).filter(r => ['Ordinal', 'Reduction', 'Standard', 'Jewish'].includes(r.cipher));
  }, [text]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  if (results.length === 0) return null;

  return (
    <group ref={groupRef}>
      {results.map((result, i) => {
        const angle = (i / results.length) * Math.PI * 2;
        const radius = 3.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        // Float text up and down slightly based on its index
        const yOffset = Math.sin((i) * Math.PI + (Date.now() / 1000)) * 0.5;

        return (
          <Float key={result.cipher} speed={2} rotationIntensity={0.5} floatIntensity={1} position={[x, yOffset, z]}>
            <Text
              fontSize={0.4}
              color={color}
              outlineWidth={0.02}
              outlineColor="#000000"
              anchorX="center"
              anchorY="middle"
            >
              {`${result.value}`}
            </Text>
            <Text
              position={[0, -0.4, 0]}
              fontSize={0.15}
              color="#aaaaaa"
              anchorX="center"
              anchorY="middle"
            >
              {result.cipher}
            </Text>
          </Float>
        );
      })}
    </group>
  );
};

const FrequencyWaveGraph: React.FC<{ history: number[]; color: string }> = ({ history, color }) => {
  const meshRef = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    const radius = 4.5;
    const pts: [number, number, number][] = [];
    const segments = Math.max(history.length * 2, 64);

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI * 2;
        
        let value = 0;
        if (history.length > 0) {
            // Smoothly distribute the history across the circle
            const exactIndex = t * (history.length - 1);
            const lowerIndex = Math.floor(exactIndex);
            const upperIndex = Math.ceil(exactIndex);
            const fraction = exactIndex - lowerIndex;
            
            const lowerVal = history[lowerIndex] || 0;
            const upperVal = history[upperIndex] || 0;
            // Linear interpolate for a smoother line
            value = lowerVal + (upperVal - lowerVal) * fraction;
        }

        // Add some noise and scale based on value
        const amplitude = (value % 200) / 100;
        const r = radius + amplitude;
        
        pts.push([Math.cos(angle) * r, Math.sin(angle * (history.length || 1)) * (amplitude * 0.5), Math.sin(angle) * r]);
    }
    return pts;
  }, [history]);

  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.y = state.clock.getElapsedTime() * -0.2;
        meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  if (history.length === 0) return null;

  return (
    <group ref={meshRef}>
        <Line 
            points={points} 
            color={color} 
            lineWidth={2} 
            transparent 
            opacity={0.8} 
        />
        <Line 
            points={points} 
            color={color} 
            lineWidth={1} 
            transparent 
            opacity={0.3} 
            position={[0, 0.4, 0]}
        />
        <Line 
            points={points} 
            color={color} 
            lineWidth={1} 
            transparent 
            opacity={0.3} 
            position={[0, -0.4, 0]}
        />
    </group>
  );
};

export const HolographicProfile: React.FC = () => {
  const [selectedZodiac, setSelectedZodiac] = useState(ZODIAC_SIGNS[0]);
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[0]);
  const [selectedAura, setSelectedAura] = useState(AURAS[0]);
  const [selectedGeometry, setSelectedGeometry] = useState(GEOMETRIES[0]);
  const [gematriaText, setGematriaText] = useState("");
  const [gematriaHistory, setGematriaHistory] = useState<number[]>([144, 432, 528, 963, 111, 777, 888, 333, 444, 555]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // New State variables for requested features
  const [showConstellations, setShowConstellations] = useState(false);
  const [orbitalSpeed, setOrbitalSpeed] = useState(1);
  const [showOrbitalPath, setShowOrbitalPath] = useState(true);
  const [showMoons, setShowMoons] = useState(true);

  useEffect(() => {
    if (gematriaText.trim() !== "") {
        const results = calculateAllCiphers(gematriaText);
        const standardResult = results.find(r => r.cipher === 'Standard');
        if (standardResult && standardResult.value > 0) {
            setGematriaHistory(prev => {
                const next = [...prev, standardResult.value];
                return next.slice(-100); 
            });
        }
    }
  }, [gematriaText]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
      
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
          
          <Stars radius={20} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          
          <ZodiacConstellations visible={showConstellations} color={selectedZodiac.color} />

          {/* Core Energy */}
          <EnergyCore color={selectedZodiac.color} geometry={selectedGeometry.id} aura={selectedAura.id} />
          
          {/* Zodiac Glyph */}
          <InteractiveGlyph 
            symbol={selectedZodiac.symbol} 
            color={selectedZodiac.color} 
            position={[-2.5, 0, 0]} 
            scale={1.5} 
          />
          
          {/* Planet Glyph with mechanics */}
          <OrbitalPlanet 
            symbol={selectedPlanet.symbol} 
            color={selectedPlanet.color} 
            distance={3.5}
            speed={orbitalSpeed}
            showPath={showOrbitalPath}
            showMoons={showMoons}
          />

          <GematriaOrbiters text={gematriaText} color={selectedZodiac.color} />
          <FrequencyWaveGraph history={gematriaHistory} color={selectedZodiac.color} />

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col h-full p-8 pointer-events-none">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-10 w-full pointer-events-auto">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              Holo-Profile <Sparkles className="text-purple-400" />
            </h1>
            <p className="text-zinc-400 max-w-md">
              Your customizable 3D cosmic identity representation.
            </p>
          </div>
          
          <button 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Configuration Panel */}
        <AnimatePresence>
          {isConfigOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-24 right-8 w-80 bg-black/80 backdrop-blur-xl border border-white/15 p-6 rounded-2xl pointer-events-auto max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar"
            >
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <User size={16} className="text-purple-400" />
                Identity Configuration
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Hash size={12} /> Gematria Sequence
                  </label>
                  <input 
                    type="text" 
                    value={gematriaText}
                    onChange={(e) => setGematriaText(e.target.value)}
                    placeholder="Enter name or word..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-600 mt-2">Entering text will project its geometric gematria values into your aura.</p>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Zodiac Sign</span>
                    <button 
                      onClick={() => setShowConstellations(!showConstellations)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${showConstellations ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-zinc-500 border-white/10 hover:text-zinc-300'}`}
                    >
                      Constellations: {showConstellations ? 'ON' : 'OFF'}
                    </button>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ZODIAC_SIGNS.map(sign => (
                      <button
                        key={sign.id}
                        onClick={() => setSelectedZodiac(sign)}
                        className={`p-2 rounded-lg text-xl flex items-center justify-center transition-all ${
                          selectedZodiac.id === sign.id 
                            ? 'bg-white/20 border-white/30 text-white translate-y-[-2px] shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                            : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
                        } border`}
                        title={sign.name}
                      >
                        {sign.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 block">Dominant Planet</label>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {PLANETS.map(planet => (
                      <button
                        key={planet.id}
                        onClick={() => setSelectedPlanet(planet)}
                        className={`p-2 rounded-lg text-xl flex items-center justify-center transition-all ${
                          selectedPlanet.id === planet.id 
                            ? 'bg-white/20 border-white/30 text-white translate-y-[-2px] shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                            : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
                        } border`}
                        title={planet.name}
                      >
                        {planet.symbol}
                      </button>
                    ))}
                  </div>
                  
                  <div className="bg-black/40 border border-white/5 rounded-lg p-3 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-zinc-500">
                      <span>Time Dilation (Orbital Speed)</span>
                      <span className="text-zinc-300">{orbitalSpeed.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="10" step="0.1" 
                      value={orbitalSpeed} 
                      onChange={(e) => setOrbitalSpeed(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    
                    <div className="flex gap-2 pt-1 border-t border-white/5">
                      <button 
                        onClick={() => setShowOrbitalPath(!showOrbitalPath)}
                        className={`flex-1 px-2 py-1.5 rounded uppercase text-[9px] tracking-wider border transition-colors ${showOrbitalPath ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-white/5 text-zinc-500 border-white/10 hover:text-zinc-300'}`}
                      >
                        Orbit Path
                      </button>
                      <button 
                        onClick={() => setShowMoons(!showMoons)}
                        className={`flex-1 px-2 py-1.5 rounded uppercase text-[9px] tracking-wider border transition-colors ${showMoons ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-white/5 text-zinc-500 border-white/10 hover:text-zinc-300'}`}
                      >
                        Moons
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 block">Avatar Matrix</label>
                  <div className="flex flex-col gap-2">
                    {GEOMETRIES.map(geom => (
                      <button
                        key={geom.id}
                        onClick={() => setSelectedGeometry(geom)}
                        className={`px-3 py-2 rounded-lg text-xs tracking-wider uppercase font-mono text-left transition-all ${
                          selectedGeometry.id === geom.id 
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' 
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                        } border`}
                      >
                        {geom.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 block">Aura Projection</label>
                  <div className="flex flex-col gap-2">
                    {AURAS.map(aura => (
                      <button
                        key={aura.id}
                        onClick={() => setSelectedAura(aura)}
                        className={`px-3 py-2 rounded-lg text-xs tracking-wider uppercase font-mono text-left transition-all ${
                          selectedAura.id === aura.id 
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' 
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                        } border`}
                      >
                        {aura.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active Selection Display */}
        <div className="mt-auto pointer-events-auto">
          <div className="flex gap-4 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl border" style={{ borderColor: selectedZodiac.color, color: selectedZodiac.color, background: `${selectedZodiac.color}20` }}>
                {selectedZodiac.symbol}
              </div>
              <div>
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Zodiac</div>
                <div className="text-white font-bold">{selectedZodiac.name}</div>
              </div>
            </div>
            
            <div className="w-px bg-white/10 mx-2" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl border" style={{ borderColor: selectedPlanet.color, color: selectedPlanet.color, background: `${selectedPlanet.color}20` }}>
                {selectedPlanet.symbol}
              </div>
              <div>
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Planet</div>
                <div className="text-white font-bold">{selectedPlanet.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
