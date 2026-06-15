import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Text, Stars, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Sparkles, User as UserIcon, Settings, Hash, Map, Upload, Image as ImageIcon, 
  FileText, X, RefreshCw, Database, CloudLightning, ShieldAlert, Sparkle, Loader2,
  Cpu, Moon, Hexagon, Zap, Heart, Activity, Pin, Radio, ExternalLink, ScrollText
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { calculateAllCiphers } from '../utils/gematria';
import { soundEngine } from '../lib/soundEffects';
import { type User as FirebaseUser } from 'firebase/auth';
import { type CosmicData } from '../types';
import { useHigherMind } from './HigherMindProvider';
import { TikTokLivePortal } from './TikTokLivePortal';

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

const EnergyCore: React.FC<{ color: string, geometry: string, aura: string, filter: string }> = ({ color, geometry, aura, filter }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const speedMult = filter === 'neural' ? 3 : 1;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3 * speedMult;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4 * speedMult;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * Math.PI * 0.2;
      ringRef.current.rotation.y += 0.01;
    }
  });

  const distortValue = useMemo(() => {
    if (filter === 'neural') return 0.8;
    return geometry === 'sphere' ? 0.4 : 0.1;
  }, [filter, geometry]);

  const finalColor = filter === 'monochrome' ? '#888888' : color;

  return (
    <group>
      {/* Central Core */}
      <mesh ref={meshRef}>
        {geometry === 'sphere' && <sphereGeometry args={[1.5, 64, 64]} />}
        {geometry === 'icosahedron' && <icosahedronGeometry args={[1.5, 0]} />}
        {geometry === 'octahedron' && <octahedronGeometry args={[1.5, 0]} />}
        {geometry === 'box' && <boxGeometry args={[2, 2, 2]} />}
        
        <MeshDistortMaterial
          color={finalColor}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.8}
          roughness={0.2}
          distort={distortValue}
          speed={filter === 'neural' ? 5 : 2}
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

interface HolographicProfileProps {
  user?: FirebaseUser | null;
  onSignIn?: () => void;
  data?: CosmicData | null;
  loadedInputs?: any;
}

// ----- Widget Renderer Component -----
const ProfileWidgetRenderer = ({ widget, onRemove }: { widget: any, onRemove: (id: string) => void }) => {
    const { componentName, data, type } = widget;
    
    // Fallback UI or specific UI based on componentName
    let renderContent: React.ReactNode;

    if (componentName === 'Planetary Power Radar') {
        renderContent = (
            <div className="h-48 w-full p-2 relative pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 8 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} stroke="none" />
                  <Radar name="Planetary Power" dataKey="strength" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
        );
    } else if (componentName === 'Elements Balance') {
        const ELEMENT_COLORS: any = { Fire: '#f87171', Earth: '#fbbf24', Air: '#60a5fa', Water: '#34d399' };
        renderContent = (
            <div className="h-48 w-full relative pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                      {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={ELEMENT_COLORS[entry.name]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-[10px] text-white font-bold opacity-50">BALANCE</span>
                </div>
            </div>
        );
    } else if (componentName === 'SoulAge') {
        renderContent = (
            <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-serif text-white mb-2 pb-2 border-b border-white/10 uppercase tracking-[0.2em]">{data}</div>
                <div className="text-xs text-white/50 tracking-widest uppercase">Computed Soul Age</div>
            </div>
        );
    } else if (componentName === 'AIAgent') {
        const roleColor = data.role === 'analyst' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' :
                          data.role === 'mystic' ? 'text-purple-400 border-purple-500/20 bg-purple-500/10' :
                          data.role === 'guide' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                          'text-amber-400 border-amber-500/20 bg-amber-500/10';
        renderContent = (
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 ${roleColor}`}>
                <Cpu size={24} className="animate-pulse" />
                <div className="font-mono text-xs font-bold uppercase tracking-widest">{data.name}</div>
                <div className="text-[9px] uppercase tracking-widest opacity-70">Lvl {data.level} {data.role}</div>
            </div>
        );
    } else if (componentName === 'PlanetCard') {
        renderContent = (
            <div className="p-4 flex flex-col items-start bg-black/40 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-2 w-full border-b border-white/10 pb-2">
                    <span className="text-2xl" style={{ color: '#' + Math.floor(Math.random()*16777215).toString(16) }}>{data.symbol}</span>
                    <span className="text-sm font-bold text-white uppercase tracking-widest">{data.name}</span>
                </div>
                <div className="text-xs text-white/70 font-mono">Sign: <span className="text-white">{data.sign}</span></div>
                <div className="text-xs text-white/70 font-mono">House: <span className="text-white">{data.house}</span></div>
                <div className="text-xs text-white/70 font-mono">Degree: <span className="text-white">{data.degree}</span></div>
            </div>
        );
    } else if (componentName === 'Astraea Wisdom') {
        renderContent = (
            <div className="p-4 space-y-4 text-center">
                <span className="text-[10px] text-pink-500/60 uppercase tracking-[0.4em] font-mono">Archetype: {data.archetype}</span>
                <p className="text-sm font-serif text-white italic">"{data.text}"</p>
                <div className="flex gap-2 justify-center">
                    <div className="px-2 py-1 bg-pink-500/5 rounded flex items-center gap-1 border border-pink-500/20">
                        <Heart size={10} className="text-pink-500" />
                        <span className="text-[8px] text-white font-mono">{data.energy}</span>
                    </div>
                </div>
            </div>
        );
    } else if (componentName === 'Lunar Phase') {
        renderContent = (
            <div className="p-4 flex flex-col items-center gap-2">
                <Moon size={24} className="text-indigo-300" />
                <div className="text-xs font-bold text-white uppercase tracking-widest">{data.phase}</div>
            </div>
        );
    } else if (componentName === 'Vibrational Harmony') {
        renderContent = (
            <div className="p-4 flex flex-col items-center gap-2">
                <Hexagon size={24} className="text-indigo-300" />
                <div className="text-xs font-bold text-white uppercase tracking-widest">{data.freq}</div>
            </div>
        );
    } else if (componentName === 'Active Transit') {
        renderContent = (
            <div className="p-4 flex flex-col items-center gap-2">
                <Activity size={24} className="text-indigo-300" />
                <div className="text-xs font-bold text-white uppercase tracking-widest">{data.transit}</div>
            </div>
        );
    } else if (componentName === 'DeityDB Portal') {
        renderContent = (
            <div className="p-4 flex flex-col items-center justify-center text-center space-y-3">
                <ScrollText size={32} className="text-cyan-400 animate-pulse" />
                <div>
                    <div className="text-sm font-bold text-white uppercase tracking-widest">DeityDB Portal</div>
                    <div className="text-[9px] text-zinc-500 font-mono uppercase mt-1">Status: Active Uplink</div>
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                    Connecting your material frequency to deep archetypal models of Egyptian, Classical, and Celtic gods via the jebboone datasets.
                </p>
            </div>
        );
    } else {
        // Generic Data Renderer for any new widget type
        renderContent = (
            <div className="p-4 flex flex-col gap-2">
                <style>{`
                    .generic-widget-scroll::-webkit-scrollbar { width: 4px; }
                    .generic-widget-scroll::-webkit-scrollbar-track { background: transparent; }
                    .generic-widget-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                `}</style>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest border-b border-white/10 pb-1 mb-1 shadow-[0_0_10px_rgba(255,255,255,0.05)_inset]">DATA STREAM</div>
                <div className="max-h-[120px] overflow-y-auto generic-widget-scroll space-y-2">
                    {typeof data === 'object' && data !== null ? (
                        Object.entries(data).map(([k, v]) => (
                            <div key={k} className="flex flex-col bg-white/5 p-1.5 rounded border border-white/[0.02]">
                                <span className="text-[8px] text-indigo-300 font-mono uppercase tracking-wider">{k}</span>
                                <span className="text-xs text-white break-words">{String(v)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-white font-serif italic text-center p-2">{String(data)}</div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 relative group overflow-hidden pointer-events-auto shadow-xl">
            <button 
                onClick={(e) => { e.stopPropagation(); onRemove(widget.id); }}
                className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded z-10 hover:bg-red-500/40"
            >
                <X size={12} />
            </button>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-transparent" />
            <div className="pt-3 px-2 pb-1 text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold border-b border-white/5 mb-2">
                {componentName}
            </div>
            {renderContent}
        </div>
    );
};

export const HolographicProfile: React.FC<HolographicProfileProps> = ({ user, onSignIn, data, loadedInputs }) => {
  const { userData, removeProfileWidget } = useHigherMind();
  const [selectedZodiac, setSelectedZodiac] = useState(ZODIAC_SIGNS[0]);
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[0]);
  const [selectedAura, setSelectedAura] = useState(AURAS[0]);
  const [selectedGeometry, setSelectedGeometry] = useState(GEOMETRIES[0]);
  const [gematriaText, setGematriaText] = useState("");
  const [gematriaHistory, setGematriaHistory] = useState<number[]>([144, 432, 528, 963, 111, 777, 888, 333, 444, 555]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tiktokHandle, setTiktokHandle] = useState("@enterupted");
  const [tiktokLiveActive, setTiktokLiveActive] = useState(true);
  const [isTikTokOpen, setIsTikTokOpen] = useState(false);
  
  // Customization State
  const [activeFilter, setActiveFilter] = useState<'none' | 'neural' | 'monochrome' | 'scanline'>('none');
  const [activeTheme, setActiveTheme] = useState<'default' | 'cosmic' | 'ethereal' | 'monarchy'>('default');

  // New State variables for requested features
  const [showConstellations, setShowConstellations] = useState(false);
  const [orbitalSpeed, setOrbitalSpeed] = useState(1);
  const [showOrbitalPath, setShowOrbitalPath] = useState(true);
  const [showMoons, setShowMoons] = useState(true);

  // File Upload State & Handlers
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, type: 'image' | 'text', url: string, content?: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => {
        const isImage = file.type.startsWith('image/');
        const url = URL.createObjectURL(file);
        
        const fileObj: {name: string, type: 'image'|'text', url: string, content?: string} = {
            name: file.name,
            type: isImage ? 'image' : 'text',
            url: url
        };

        if (!isImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setUploadedFiles(prev => prev.map(f => f.url === url ? {...f, content: text} : f));
            };
            reader.readAsText(file);
        }

        return fileObj;
      });
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (url: string) => {
    setUploadedFiles(prev => prev.filter(f => f.url !== url));
  };

  // Firestore Sync & State
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'synced' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Auto-align visual parameters with computed natal chart
  const alignWithNatalChart = () => {
    if (!data) return;
    
    // Find Sun sign from natal chart
    const sunPlanet = data.planets?.find((p: any) => p.name === 'Sun');
    if (sunPlanet && sunPlanet.sign) {
      const matchedZodiac = ZODIAC_SIGNS.find(z => z.name.toLowerCase() === sunPlanet.sign.toLowerCase());
      if (matchedZodiac) {
        setSelectedZodiac(matchedZodiac);
      }
    }

    // Find dominant or first planet from natal chart
    if (data.planets && data.planets.length > 0) {
      const activePlanetName = data.planets[0].name;
      const matchedPlanet = PLANETS.find(p => p.name.toLowerCase() === activePlanetName.toLowerCase());
      if (matchedPlanet) {
        setSelectedPlanet(matchedPlanet);
      }
    }
  };

  // Harmonize on data load
  useEffect(() => {
    if (data) {
      alignWithNatalChart();
    }
  }, [data]);

  // Load existing Holographic profile configuration
  useEffect(() => {
    let active = true;
    const fetchHoloConfig = async () => {
      if (!user) {
        setSyncStatus('idle');
        return;
      }
      setSyncStatus('loading');
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && active) {
          const docData = docSnap.data();
          const hc = docData.holographicConfig;
          if (hc) {
            if (hc.selectedZodiacId) {
              const matchingZodiac = ZODIAC_SIGNS.find(z => z.id === hc.selectedZodiacId);
              if (matchingZodiac) setSelectedZodiac(matchingZodiac);
            }
            if (hc.selectedPlanetId) {
              const matchingPlanet = PLANETS.find(p => p.id === hc.selectedPlanetId);
              if (matchingPlanet) setSelectedPlanet(matchingPlanet);
            }
            if (hc.selectedAuraId) {
              const matchingAura = AURAS.find(a => a.id === hc.selectedAuraId);
              if (matchingAura) setSelectedAura(matchingAura);
            }
            if (hc.selectedGeometryId) {
              const matchingGeom = GEOMETRIES.find(g => g.id === hc.selectedGeometryId);
              if (matchingGeom) setSelectedGeometry(matchingGeom);
            }
            if (hc.gematriaText !== undefined) setGematriaText(hc.gematriaText);
            if (hc.showConstellations !== undefined) setShowConstellations(hc.showConstellations);
            if (hc.orbitalSpeed !== undefined) setOrbitalSpeed(hc.orbitalSpeed);
            if (hc.showOrbitalPath !== undefined) setShowOrbitalPath(hc.showOrbitalPath);
            if (hc.showMoons !== undefined) setShowMoons(hc.showMoons);
            if (hc.tiktokHandle !== undefined) setTiktokHandle(hc.tiktokHandle);
            if (hc.tiktokLiveActive !== undefined) setTiktokLiveActive(hc.tiktokLiveActive);
            if (hc.activeFilter !== undefined) setActiveFilter(hc.activeFilter);
            if (hc.activeTheme !== undefined) setActiveTheme(hc.activeTheme);
            if (hc.uploadedFiles !== undefined) {
              // Convert saved relative info back to visual files state (with local placeholder object URLs)
              setUploadedFiles(hc.uploadedFiles.map((uf: any) => ({
                ...uf,
                url: uf.url || '#'
              })));
            }
            setSyncStatus('synced');
            if (docData.updatedAt) {
              try {
                const date = docData.updatedAt.toDate ? docData.updatedAt.toDate() : new Date(docData.updatedAt);
                setLastSyncedAt(date.toLocaleString());
              } catch {
                setLastSyncedAt(new Date().toLocaleString());
              }
            }
          } else {
            setSyncStatus('synced');
            alignWithNatalChart();
          }
        } else {
          setSyncStatus('idle');
          alignWithNatalChart();
        }
      } catch (err) {
        console.error("Failed to load Holographic Profile from Firestore:", err);
        setSyncStatus('error');
      }
    };

    fetchHoloConfig();
    return () => {
      active = false;
    };
  }, [user]);

  // Save/Sync Holographic state to Firestore
  const handleSaveHoloProfile = async () => {
    if (!user) {
      if (onSignIn) {
        onSignIn();
      }
      return;
    }

    setIsSaving(true);
    setSyncStatus('loading');
    soundEngine.scan();

    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      const configToSave = {
        selectedZodiacId: selectedZodiac.id,
        selectedPlanetId: selectedPlanet.id,
        selectedAuraId: selectedAura.id,
        selectedGeometryId: selectedGeometry.id,
        gematriaText,
        showConstellations,
        orbitalSpeed,
        showOrbitalPath,
        showMoons,
        tiktokHandle,
        tiktokLiveActive,
        activeFilter,
        activeTheme,
        uploadedFiles: uploadedFiles.map(f => ({
          name: f.name,
          type: f.type,
          content: f.content || ''
        }))
      };

      const payload: any = {
        userId: user.uid,
        holographicConfig: configToSave,
        updatedAt: serverTimestamp()
      };

      if (loadedInputs) {
        payload.input = loadedInputs;
      }
      if (data) {
        payload.cosmicData = data;
      }

      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });

      setSyncStatus('synced');
      setLastSyncedAt(new Date().toLocaleString());
      setIsSaving(false);
      soundEngine.neuralClick();
      
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Astral profile integrated. Cloud decryption deck is secured.");
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Critical: Failed to sync Holographic Profile:", err);
      setSyncStatus('error');
      setIsSaving(false);
    }
  };
  
  

  // Compute dynamic colors based on theme
  const themeColors = useMemo(() => {
    if (activeTheme === 'cosmic') return { primary: '#6366f1', secondary: '#1e1b4b', bg: 'from-indigo-950' };
    if (activeTheme === 'ethereal') return { primary: '#22d3ee', secondary: '#0f172a', bg: 'from-cyan-950' };
    if (activeTheme === 'monarchy') return { primary: '#fbbf24', secondary: '#451a03', bg: 'from-amber-950' };
    return { primary: selectedZodiac.color, secondary: '#18181b', bg: 'from-indigo-900/10' };
  }, [activeTheme, selectedZodiac.color]);

  const primaryColor = activeFilter === 'monochrome' ? '#ffffff' : themeColors.primary;

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden font-sans">
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${themeColors.bg} via-zinc-950 to-zinc-950 pointer-events-none`} />
      
      {/* Scanline Filter Overlay */}
      {activeFilter === 'scanline' && (
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] animate-pulse" />
        </div>
      )}

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color={primaryColor} />
          
          <Stars radius={20} depth={50} count={activeFilter === 'neural' ? 5000 : 2000} factor={activeFilter === 'neural' ? 8 : 4} saturation={0} fade speed={activeFilter === 'neural' ? 5 : 1} />
          
          <ZodiacConstellations visible={showConstellations} color={primaryColor} />

          {/* Core Energy */}
          <EnergyCore color={primaryColor} geometry={selectedGeometry.id} aura={selectedAura.id} filter={activeFilter} />
          
          {/* Zodiac Glyph */}
          <InteractiveGlyph 
            symbol={selectedZodiac.symbol} 
            color={primaryColor} 
            position={[-2.5, 0, 0]} 
            scale={1.5} 
          />
          
          {/* Planet Glyph with mechanics */}
          <OrbitalPlanet 
            symbol={selectedPlanet.symbol} 
            color={activeFilter === 'monochrome' ? '#cccccc' : selectedPlanet.color} 
            distance={3.5}
            speed={orbitalSpeed}
            showPath={showOrbitalPath}
            showMoons={showMoons}
          />

          <GematriaOrbiters text={gematriaText} color={primaryColor} />
          <FrequencyWaveGraph history={gematriaHistory} color={primaryColor} />

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={activeFilter === 'neural' ? 2 : 0.5} />
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
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { soundEngine.charge(); setIsTikTokOpen(true); }}
              className="p-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/35 rounded-xl transition-all text-pink-400 hover:text-white flex items-center gap-2 text-xs font-mono uppercase font-bold tracking-wider relative overflow-hidden shadow-[0_0_15px_rgba(236,72,153,0.15)] hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] cursor-pointer"
            >
              <Radio size={16} className="text-pink-400 animate-pulse" />
              <span>TikTok Live</span>
              {tiktokLiveActive && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />}
            </button>

            <button 
              onClick={() => { soundEngine.select(); setIsConfigOpen(!isConfigOpen); }}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-zinc-400 hover:text-white cursor-pointer"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* File Upload / Context Panel */}
        <div className="absolute top-36 left-8 w-72 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Upload size={16} className="text-emerald-400" /> Identity Data
                    </h3>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{uploadedFiles.length} files</div>
                </div>
                
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef}
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept="image/*,.txt,.pdf,.csv,.json"
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 mb-4 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white group"
                >
                    <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                    <span className="text-xs font-mono">Upload images or text</span>
                </button>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-black/40 border border-white/5 relative group">
                            {file.type === 'image' ? (
                                <div className="w-8 h-8 rounded-md bg-zinc-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-md bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                                    <FileText size={14} className="text-blue-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 pr-6">
                                <div className="text-xs text-white truncate">{file.name}</div>
                                <div className="text-[9px] text-zinc-500 uppercase">{file.type}</div>
                            </div>
                            <button 
                                onClick={() => removeFile(file.url)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500/20"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {uploadedFiles.length === 0 && (
                        <div className="text-[10px] text-zinc-600 italic text-center p-2">
                            Upload natal charts, numerology reports, or identity images for the AI to synthesize.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Astral Mind Cloud Sync & Astrological Handshake Panel */}
        <div className="absolute top-[490px] left-8 w-72 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
                {/* Glowing decorative tech lines */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500/50 to-transparent" />
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Database size={16} className="text-purple-400" /> Quantum Sync Core
                    </h3>
                    <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{user ? 'Online' : 'Local'}</span>
                    </div>
                </div>

                {!user ? (
                    <div className="space-y-3">
                        <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-xs text-amber-300">
                            <div className="flex items-center gap-2 font-semibold mb-1">
                                <ShieldAlert size={14} className="text-amber-400" /> SECURITY LOCK ACTIVE
                            </div>
                            Authenticate with your Higher Mind Core to serialize and save your coordinates permanently.
                        </div>
                        <button
                            onClick={onSignIn}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold tracking-widest uppercase transition-all duration-300 border border-purple-500/20 text-white shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <CloudLightning size={14} className="animate-bounce" /> AUTHORIZE NODE
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-zinc-900/50 border border-white/5 p-3 space-y-1.5 font-mono text-[10px] text-zinc-400">
                            <div className="text-zinc-200 font-semibold flex items-center justify-between text-xs mb-1">
                                <span className="truncate">Deck: {user.displayName || user.email?.split('@')[0]}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">AGENT</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Node Sync:</span>
                                <span className={
                                    syncStatus === 'synced' ? 'text-emerald-400 font-semibold' :
                                    syncStatus === 'loading' ? 'text-purple-400 font-semibold' :
                                    syncStatus === 'error' ? 'text-red-400 font-semibold' : 'text-zinc-300'
                                }>
                                    {syncStatus === 'synced' ? 'SECURED' :
                                     syncStatus === 'loading' ? 'SYNCING...' :
                                     syncStatus === 'error' ? 'MISALIGNED' : 'OFFLINE'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Last Synced:</span>
                                <span className="text-zinc-300">{lastSyncedAt || 'No Cloud Record'}</span>
                            </div>
                        </div>

                        {/* Birth Details Handshake */}
                        {loadedInputs || data ? (
                            <div className="rounded-xl bg-purple-950/20 border border-purple-500/10 p-3 space-y-1.5 font-mono text-[10px] text-purple-200">
                                <div className="text-white font-semibold flex items-center gap-1.5 text-xs mb-1">
                                    <Sparkle size={12} className="text-purple-400 animate-spin-slow" /> Birth Decryption Key
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-purple-400/70">Name:</span>
                                    <span className="text-white truncate max-w-[150px]">{loadedInputs?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-purple-400/70">Sun Sign:</span>
                                    <span className="text-white">
                                        {data?.planets?.find((p: any) => p.name === 'Sun')?.sign || 'Leo'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-purple-400/70">Dominant:</span>
                                    <span className="text-white">
                                        {data?.planets?.[0]?.name || 'Sun'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-white/10 p-3 text-[10px] text-zinc-500 italic text-center">
                                Compute your natal chart in the main engine to pair your birth blueprint.
                            </div>
                        )}

                        <div className="flex gap-2">
                            {data && (
                                <button
                                    onClick={alignWithNatalChart}
                                    title="Harmonize visual geometry with calculated birth alignments instantly"
                                    className="flex-1 py-2 px-1 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 text-[10px] transition-all flex items-center justify-center gap-1 text-zinc-400 font-mono cursor-pointer"
                                // Remove relative references to alignWithNatalChart error if exists
                                >
                                    <RefreshCw size={12} /> HARMONIZE
                                </button>
                            )}
                            <button
                                onClick={handleSaveHoloProfile}
                                disabled={isSaving}
                                className={`flex-[2] py-2 px-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-[10px] tracking-wider uppercase transition-all duration-300 border border-purple-500/20 shadow-lg shadow-purple-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" /> COMMITTING...
                                    </>
                                ) : (
                                    <>
                                        <CloudLightning size={12} /> COMMIT TO CLOUD
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Astral TikTok Broadcast HUD Panel */}
        <div className="absolute top-36 left-[340px] w-72 pointer-events-auto hidden xl:block">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500/50 to-transparent" />
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Radio size={16} className="text-pink-400 animate-pulse" /> TikTok Spacetime
                    </h3>
                    <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${tiktokLiveActive ? 'bg-pink-400 animate-ping' : 'bg-zinc-600'}`} />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{tiktokLiveActive ? 'Live' : 'Off'}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* TikTok User Account Node */}
                    <div className="rounded-xl bg-zinc-900/50 border border-white/5 p-3 space-y-1.5 font-mono text-[10px] text-zinc-400">
                      <div className="text-zinc-200 font-semibold flex items-center justify-between text-xs mb-1">
                        <span className="truncate">Node: {tiktokHandle}</span>
                        <a 
                          href={`https://www.tiktok.com/@${tiktokHandle.replace('@', '')}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[9px] text-pink-400 hover:text-pink-300 flex items-center gap-1"
                        >
                          Profile <ExternalLink size={8} />
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span>Streaming Status:</span>
                        <span className={tiktokLiveActive ? 'text-pink-400 font-bold' : 'text-zinc-500'}>
                          {tiktokLiveActive ? 'ACTIVE BROADCAST' : 'STANDBY'}
                        </span>
                      </div>
                    </div>

                    {/* Simulating active feed view */}
                    {tiktokLiveActive ? (
                      <div className="p-3 bg-pink-950/20 border border-pink-500/15 rounded-xl text-center space-y-3 relative overflow-hidden">
                        {/* Scanline design effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent h-1/2 w-full animate-pulse pointer-events-none" />
                        
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                          <span className="text-[10px] font-mono font-bold tracking-widest text-pink-300 uppercase">STREAMING TO PROFILE</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 leading-normal">
                          Live video stream feed & active FaceTime handshakes are live on your profile coordinates page.
                        </p>
                        
                        <button
                          onClick={() => { soundEngine.charge(); setIsTikTokOpen(true); }}
                          className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-bold text-[10px] tracking-wider uppercase rounded-xl border border-pink-500/20 text-white shadow-lg cursor-pointer transition-all"
                        >
                          Launch FaceTime Arena
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 p-4 text-[10px] text-zinc-500 italic text-center space-y-2.5">
                        <p>TikTok live feed is currently in standby mode on your profile configuration.</p>
                        <button
                          onClick={() => { soundEngine.select(); setTiktokLiveActive(true); }}
                          className="px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 font-sans text-[9px] uppercase font-bold text-center mx-auto hover:bg-pink-500/20 transition-all cursor-pointer block"
                        >
                          Enable Live Stream
                        </button>
                      </div>
                    )}

                    {/* Visual metrics lines */}
                    <div className="rounded-xl border border-white/5 bg-black/40 p-2 text-[8px] font-mono text-zinc-600 flex justify-between items-center select-none">
                      <span>SYNC INDEX: 0.985</span>
                      <span>FREQ: 528HZ</span>
                      <span>GRID_COHERENT: YES</span>
                    </div>
                </div>
            </div>
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

                <div>
                   <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                      <Sparkles size={12} className="text-emerald-400" /> Resonance Themes
                   </label>
                   <div className="grid grid-cols-2 gap-2">
                      {(['default', 'cosmic', 'ethereal', 'monarchy'] as const).map(theme => (
                        <button
                          key={theme}
                          onClick={() => { soundEngine.select(); setActiveTheme(theme); }}
                          className={`px-3 py-2 rounded-lg text-[10px] tracking-widest uppercase font-mono transition-all ${
                            activeTheme === theme 
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' 
                              : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                          } border`}
                        >
                          {theme}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                      <Activity size={12} className="text-cyan-400" /> Neural Filters
                   </label>
                   <div className="grid grid-cols-2 gap-2">
                      {(['none', 'neural', 'monochrome', 'scanline'] as const).map(filter => (
                        <button
                          key={filter}
                          onClick={() => { soundEngine.charge(); setActiveFilter(filter); }}
                          className={`px-3 py-2 rounded-lg text-[10px] tracking-widest uppercase font-mono transition-all ${
                            activeFilter === filter 
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200' 
                              : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                          } border`}
                        >
                          {filter}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <label className="text-xs font-mono text-pink-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <Radio size={12} className="text-pink-400 animate-pulse" /> TikTok Integration
                  </label>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">TikTok Handle</span>
                      <input 
                        type="text" 
                        value={tiktokHandle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTiktokHandle(val.startsWith('@') ? val : '@' + val);
                        }}
                        placeholder="@enterupted"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50 transition-colors font-mono"
                      />
                    </div>

                    <div className="flex justify-between items-center bg-white/5 border border-white/5 p-2 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-300 font-sans block font-semibold">Live Broadcast Feed</span>
                        <span className="text-[8px] text-zinc-500 block font-mono">Stream active video on profile</span>
                      </div>
                      <button 
                        onClick={() => { soundEngine.select(); setTiktokLiveActive(!tiktokLiveActive); }}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-mono border transition-all cursor-pointer font-bold ${tiktokLiveActive ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:text-zinc-400'}`}
                      >
                        {tiktokLiveActive ? 'ACTIVE' : 'STANDBY'}
                      </button>
                    </div>

                    <button
                      onClick={() => { soundEngine.charge(); setIsTikTokOpen(true); }}
                      className="w-full py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 hover:text-white rounded-xl border border-pink-500/20 font-mono text-[9px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Radio size={12} className="animate-pulse" /> Launch FaceTime Arena
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pinned Widgets Deck */}
        {userData?.profileWidgets && userData.profileWidgets.length > 0 && (
          <div className="absolute md:top-24 top-20 right-4 md:right-8 w-[calc(100%-2rem)] md:w-80 max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-150px)] overflow-y-auto pointer-events-auto custom-scrollbar space-y-4" style={{ display: isConfigOpen ? 'none' : 'block' }}>
            <div className="flex items-center gap-2 mb-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest px-2">
               <Pin size={12} className="text-amber-400 animate-pulse" /> Synced Intelligence Deck ({userData.profileWidgets.length})
            </div>
            {userData.profileWidgets.map(widget => (
              <ProfileWidgetRenderer key={widget.id} widget={widget} onRemove={removeProfileWidget} />
            ))}
          </div>
        )}
        
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

      {/* TikTok Live FaceTime Spacetime Arena Overlay */}
      <TikTokLivePortal 
        isOpen={isTikTokOpen}
        onClose={() => setIsTikTokOpen(false)}
        user={user}
        holographicConfig={{
          tiktokHandle,
          tiktokLiveActive
        }}
        onSaveConfig={(updatedConfig) => {
          if (updatedConfig.tiktokHandle !== undefined) {
            setTiktokHandle(updatedConfig.tiktokHandle);
          }
          if (updatedConfig.tiktokLiveActive !== undefined) {
            setTiktokLiveActive(updatedConfig.tiktokLiveActive);
          }
          setTimeout(() => {
            handleSaveHoloProfile();
          }, 200);
        }}
      />
    </div>
  );
};
