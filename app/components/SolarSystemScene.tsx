import * as React from 'react';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import { Sphere, Trail, Float, Stars, Text, OrbitControls, PerspectiveCamera, Html, Ring, Sparkles, Line, Grid, Float as FloatDrei } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkle, Send, Bot, Zap, Radio, Layers, Loader2, 
  Minimize2, Maximize2 
} from 'lucide-react';
import { CosmicData } from '../types';
import { fetchAuraInsight } from '../services/geminiService';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { soundEngine } from '../lib/soundEffects';

import { ClassicBirthChart } from './ClassicBirthChart';
import { CelestialSolarCore, PlanetaryGravityNetwork, CelestialDNAHelix } from './CelestialSolarCore';

interface AuraVisualNode {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  description: string;
}

interface AuraVisualEdge {
  source: string;
  target: string;
  color: string;
}

const AuraNode = ({ node, onSelect }: { node: AuraVisualNode; onSelect: (node: AuraVisualNode) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const colors: Record<string, string> = {
    emerald: '#10b981',
    sky: '#0ea5e9',
    rose: '#f43f5e',
    amber: '#f59e0b',
    purple: '#9333ea',
    fuchsia: '#c026d3',
    white: '#ffffff'
  };

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <FloatDrei speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={node.position}>
        <Sphere 
          ref={meshRef}
          args={[2, 16, 16]}
          onPointerOver={() => { soundEngine.hover(); setHovered(true); }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => { e.stopPropagation(); soundEngine.select(); onSelect(node); }}
        >
          <meshStandardMaterial 
            color={colors[node.color] || '#ffffff'} 
            emissive={colors[node.color] || '#ffffff'}
            emissiveIntensity={hovered ? 2 : 1}
            wireframe
          />
        </Sphere>
        <Sparkles count={20} scale={4} size={1} color={colors[node.color] || '#ffffff'} />
        
        {hovered && (
          <Html position={[0, 4, 0]} center>
            <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg whitespace-nowrap">
              <div className="text-[10px] uppercase tracking-widest font-bold text-white mb-0.5">{node.label}</div>
              <div className="text-[8px] text-stone-400 italic">AI Seeded Structure</div>
            </div>
          </Html>
        )}
      </group>
    </FloatDrei>
  );
};

interface PlanetData {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  description: string;
}

const planets: PlanetData[] = [
  { name: 'Mercury', color: '#A5A5A5', size: 0.8, distance: 15, speed: 1.5, description: 'Smallest planet, closest to the Sun. A world of extremes.' },
  { name: 'Venus', color: '#E3BB76', size: 1.2, distance: 22, speed: 1.1, description: 'Earth\'s "evil twin". Second planet, hottest in the solar system due to runaway greenhouse effect.' },
  { name: 'Earth', color: '#2271B3', size: 1.3, distance: 30, speed: 1.0, description: 'Our home planet, the only known world to harbor life. Rich in oxygen and water.' },
  { name: 'Mars', color: '#E27B58', size: 1.0, distance: 38, speed: 0.8, description: 'The Red Planet. Home to the solar system\'s largest volcano and vast canyons.' },
  { name: 'Jupiter', color: '#D39C7E', size: 3.5, distance: 55, speed: 0.5, description: 'The gas giant king. Over 1,300 Earths could fit inside this massive protector.' },
  { name: 'Saturn', color: '#C5AB6E', size: 3.0, distance: 75, speed: 0.4, description: 'The ringed jewel. A gas giant with orbits made of ice and rock particles.' },
  { name: 'Uranus', color: '#BBE1E4', size: 2.2, distance: 95, speed: 0.3, description: 'The ice giant. A unique world that rotates on its side, casting a blue-green hue.' },
  { name: 'Neptune', color: '#6081FF', size: 2.1, distance: 110, speed: 0.2, description: 'The distant giant. An ice world with supersonic winds and deep blue methane clouds.' },
];

const SPECIAL_POINTS = [
  { name: 'North Node', color: '#10b981', size: 0.6, distance: 45, speed: 0.1, description: 'The North Node (Rahu) points to your soul destiny and where you are growing.' },
  { name: 'South Node', color: '#ef4444', size: 0.6, distance: 45, speed: 0.1, description: 'The South Node (Ketu) represents past life habits and karmic leftovers.' },
  { name: 'Chiron', color: '#fbbf24', size: 0.7, distance: 85, speed: 0.2, description: 'The Wounded Healer. Where you have deep wounds that, once healed, become your greatest gift.' },
  { name: 'Lilith', color: '#111111', size: 0.5, distance: 25, speed: 1.2, description: 'Black Moon Lilith. Represents your primal nature, suppressed desires, and wild feminine power.' },
];

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const spectralTypes: Record<string, string> = {
  Sun: 'G2V (Yellow Dwarf)',
  Moon: 'Spectral class: Rocky Luna',
  Mercury: 'Spectral class: Iron Silicate',
  Venus: 'Spectral class: Greenhouse Alpha',
  Mars: 'Spectral class: Ferric Ore',
  Jupiter: 'Spectral class: Gas Giant (Gas-M)',
  Saturn: 'Spectral class: Ringed Giant (Gas-S)',
  Uranus: 'Spectral class: Ice Giant (Ice-U)',
  Neptune: 'Spectral class: Ice Giant (Ice-N)',
  Pluto: 'Spectral class: Binary Dwarf (TNO)',
  Ascendant: 'Point: Ascending Horizon'
};

const ZodiacLabels = ({ radius }: { radius: number }) => {
  return (
    <group>
      {SIGN_NAMES.map((name, i) => {
        const angle = (i * 30 + 15) * Math.PI / 180;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const element = SIGN_ELEMENTS[name];

        return (
          <group key={name} position={[x, 0.5, z]}>
            <Text
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
              fontSize={4}
              color={element.color}
              anchorX="center"
              anchorY="middle"
              depthOffset={-1}
            >
              {name.toUpperCase()}
            </Text>
            {/* Visual separator */}
            <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
               <circleGeometry args={[1, 32]} />
               <meshBasicMaterial color={element.color} transparent opacity={0.1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const AstrologicalHouses = ({ data, onHouseHover }: { data: CosmicData | null; onHouseHover: (house: any) => void }) => {
  return (
    <group>
      <ZodiacLabels radius={130} />
      {Array.from({ length: 12 }).map((_, i) => {
        const houseNum = i + 1;
        const houseData = data?.houses?.find(h => h.houseNumber === houseNum);
        const angle = (i * 30 * Math.PI) / 180;
        const midAngle = (i * 30 + 15) * Math.PI / 180;
        const signName = houseData?.sign || SIGN_NAMES[i];
        
        return (
          <group key={i}>
            {/* Divider Line */}
            <group rotation={[0, angle, 0]}>
              <mesh position={[75, 0, 0]}>
                 <boxGeometry args={[150, 0.02, 0.02]} />
                 <meshBasicMaterial color="white" transparent opacity={0.15} />
              </mesh>
            </group>

            {/* House Interactive Zone */}
            <group 
              position={[Math.cos(midAngle) * 110, 0.1, Math.sin(midAngle) * 110]}
              onPointerOver={(e) => {
                e.stopPropagation();
                soundEngine.hover();
                onHouseHover(houseData || { 
                  houseNumber: houseNum, 
                  realmName: 'Sector of Experience', 
                  sign: signName,
                  description: HOUSE_DESCRIPTIONS[houseNum] || 'A unique sector of your life experience.' 
                });
              }}
              onPointerOut={() => onHouseHover(null)}
            >
              {/* Invisible trigger with box for better hover area */}
              <mesh visible={false}>
                <boxGeometry args={[40, 1, 40]} />
              </mesh>

              <Text
                rotation={[-Math.PI / 2, 0, -midAngle + Math.PI / 2]}
                fontSize={5}
                color={houseData ? "#fbbf24" : "white"}
                fillOpacity={0.4}
              >
                {houseNum}
              </Text>
              <Text
                position={[0, 0, 8]}
                rotation={[-Math.PI / 2, 0, -midAngle + Math.PI / 2]}
                fontSize={2.5}
                color="white"
                fillOpacity={0.2}
              >
                {signName.toUpperCase()}
              </Text>
            </group>

            {/* Subtle background wedge */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
              <ringGeometry args={[10, 150, 64, 1, angle, (30 * Math.PI) / 180]} />
              <meshBasicMaterial 
                color={i % 2 === 0 ? "#ffffff" : "#3b82f6"} 
                transparent 
                opacity={0.008} 
                side={THREE.DoubleSide} 
              />
            </mesh>
          </group>
        );
      })}
      {/* Circumference Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[135, 136, 128]} />
        <meshBasicMaterial color="white" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[145, 146, 128]} />
        <meshBasicMaterial color="white" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const AspectLines = ({ data, onAspectClick }: { data: CosmicData | null; onAspectClick?: (aspect: any) => void }) => {
  if (!data?.aspects) return null;

  const ASPECT_COLORS: Record<string, string> = {
    conjunction: '#ffffff',
    sextile: '#60a5fa',
    trine: '#34d399',
    square: '#f87171',
    opposition: '#fb7185',
  };

  return (
    <group>
      {data.aspects.map((aspect, i) => {
        const p1 = data.planets?.find(p => p.name === aspect.planet1);
        const p2 = data.planets?.find(p => p.name === aspect.planet2);
        
        if (!p1 || !p2) return null;

        const getDistance = (name: string) => {
          const planet = planets?.find(p => p.name === name);
          if (planet) return planet.distance;
          const special = SPECIAL_POINTS.find(p => p.name === name);
          if (special) return special.distance;
          if (name === 'Sun') return 0;
          return 30; // Default
        };

        const d1 = getDistance(aspect.planet1);
        const d2 = getDistance(aspect.planet2);
        
        const getAngle = (p: any) => {
          const baseAngle = SIGN_ANGLES[p.sign] || 0;
          return ((baseAngle + (p.degree || 0)) * Math.PI) / 180;
        };

        const angle1 = getAngle(p1);
        const angle2 = getAngle(p2);

        const start = new THREE.Vector3(Math.cos(angle1) * d1, 0, Math.sin(angle1) * d1);
        const end = new THREE.Vector3(Math.cos(angle2) * d2, 0, Math.sin(angle2) * d2);

        return (
          <group key={i}>
            <Line 
              points={[start, end]} 
              color={ASPECT_COLORS[aspect.type] || '#ffffff'} 
              lineWidth={1.5} 
              opacity={0.3} 
              transparent 
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.select();
                onAspectClick?.(aspect);
              }}
              onPointerOver={(e) => {
                soundEngine.hover();
                (e.object as any).material.opacity = 0.8;
              }}
              onPointerOut={(e) => {
                (e.object as any).material.opacity = 0.3;
              }}
            />
          </group>
        );
      })}
    </group>
  );
};

const SIGN_ELEMENTS: Record<string, { type: string; color: string }> = {
  'Aries': { type: 'Fire', color: '#ef4444' },
  'Leo': { type: 'Fire', color: '#f59e0b' },
  'Sagittarius': { type: 'Fire', color: '#f97316' },
  'Taurus': { type: 'Earth', color: '#10b981' },
  'Virgo': { type: 'Earth', color: '#84cc16' },
  'Capricorn': { type: 'Earth', color: '#475569' },
  'Gemini': { type: 'Air', color: '#fbbf24' },
  'Libra': { type: 'Air', color: '#f472b6' },
  'Aquarius': { type: 'Air', color: '#06b6d4' },
  'Cancer': { type: 'Water', color: '#94a3b8' },
  'Scorpio': { type: 'Water', color: '#7e22ce' },
  'Pisces': { type: 'Water', color: '#6366f1' },
};

const OrbitalResonanceRipples = ({ size, color }: { size: number, color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
       const t = clock.getElapsedTime() * 2;
       groupRef.current.children.forEach((child, i) => {
         const scale = 1 + ((t + i * 1.5) % 3) * 0.5;
         child.scale.set(scale, scale, scale);
         (child as any).material.opacity = Math.max(0, 0.6 - ((t + i * 1.5) % 3) * 0.2);
       });
    }
  });

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]}>
      {[1, 2, 3].map((r, i) => (
        <mesh key={`ripple-${i}`}>
          <ringGeometry args={[size * 1.5 + r * 1.5, size * 1.5 + r * 1.5 + 0.1, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.6 - r * 0.15} />
        </mesh>
      ))}
    </group>
  );
};

interface PlanetProps extends PlanetData {
  onSelect: (p: PlanetData) => void;
  onPlanetClick?: (title: string, content: string) => void;
  active?: boolean;
  astro?: any;
  isStatic?: boolean;
  isBirthChartMode?: boolean;
  showTracking?: boolean;
}

const SIGN_ANGLES: Record<string, number> = {
  'Aries': 0, 'Taurus': 30, 'Gemini': 60, 'Cancer': 90, 'Leo': 120, 'Virgo': 150,
  'Libra': 180, 'Scorpio': 210, 'Sagittarius': 240, 'Capricorn': 270, 'Aquarius': 300, 'Pisces': 330
};

const Planet = ({ name, color, size, distance, speed, onSelect, onPlanetClick, active, astro, isStatic, isBirthChartMode, showTracking }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const particlesGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const elementInfo = astro?.sign ? SIGN_ELEMENTS[astro.sign] : null;

  useFrame(({ clock }) => {
    let t;
    if (isBirthChartMode && astro?.sign) {
      const baseAngle = SIGN_ANGLES[astro.sign] || 0;
      t = ((baseAngle + (astro.degree || 0)) * Math.PI) / 180;
    } else {
      const startAngle = astro?.degree ? (astro.degree * Math.PI) / 180 : 0;
      t = isStatic ? startAngle : (startAngle + clock.getElapsedTime() * speed * 0.1);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = -t;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.015;
      cloudsRef.current.rotation.z += 0.002;
    }
    if (particlesGroupRef.current) {
      const time = clock.getElapsedTime();
      const significance = (name === 'Sun' || name === 'Moon') ? 1.5 : 1.0;
      const pulse = 1 + Math.sin(time * 2 + distance) * 0.15 * significance;
      particlesGroupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const isLuminary = name === 'Sun' || name === 'Moon';
  const particleCount = isLuminary ? 120 : 40;

  return (
    <group ref={groupRef}>
      <group position={[distance, 0, 0]}>
        <group ref={particlesGroupRef}>
          <Sparkles 
            count={particleCount}
            scale={size * 3}
            size={isLuminary ? size * 5 : size * 3}
            speed={0.4}
            opacity={0.6}
            color={active ? '#ffffff' : color}
            noise={0.1}
          />
        </group>
        <Trail width={1.5} length={25} color={color} attenuation={(t) => t * t}>
          <Sphere 
            ref={meshRef} 
            args={[size, 64, 64]} 
            onPointerOver={() => { soundEngine.hover(); setHovered(true); }}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.select();
              onSelect({ name, color, size, distance, speed, description: '' });
              if (onPlanetClick && astro) {
                onPlanetClick(name, `In House ${astro.house}. ${astro.sign} alignment.`);
              }
            }}
            scale={active ? 1.3 : (hovered ? 1.2 : 1)}
          >
            <meshStandardMaterial 
              color={active ? "#ffffff" : color} 
              emissive={active ? "#ffffff" : color} 
              emissiveIntensity={active ? 1.5 : (hovered ? 1 : 0.2)} 
              roughness={0.4} 
              metalness={0.6} 
            />
          </Sphere>
        </Trail>
        
        {active && (
          <OrbitalResonanceRipples size={size} color={color} />
        )}
        
        {name === 'Saturn' && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[size * 1.5, size * 2.5, 64]} />
            <meshStandardMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}

        {name === 'Earth' && (
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[size * 1.05, 64, 64]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} />
          </mesh>
        )}

        {/* Declination / Drop Line */}
        {showTracking && (
          <group position={[0, -5, 0]}>
             <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0)]} color={color} transparent opacity={0.3} dashSize={0.5} gapSize={0.5} />
             <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
               <circleGeometry args={[size * 0.8, 32]} />
               <meshBasicMaterial color={color} transparent opacity={0.2} />
             </mesh>
             {astro?.degree !== undefined && (
                 <Text position={[0, -1, 0]} fontSize={1} color={color} anchorX="center" anchorY="middle">
                   {`${Math.floor(astro.degree)}°`}
                 </Text>
             )}
          </group>
        )}

        {/* Local Detail Panel for Selected Planet */}
        {active && (
          <Html position={[size * 2, size * 2, 0]} center distanceFactor={15}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-[300px] bg-black/90 backdrop-blur-3xl border border-white/20 p-5 rounded-[2.5rem] pointer-events-auto shadow-[0_0_40px_rgba(0,0,0,0.6)]"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_10px_currentcolor]" style={{ backgroundColor: color }} />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-stone-500">Celestial Insight</span>
                  </div>
                  <h3 className="text-3xl font-light text-white uppercase tracking-widest">{name}</h3>
                </div>
                <button 
                   onClick={(e) => { e.stopPropagation(); onSelect(null as any); }} 
                   className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-stone-500 hover:text-white transition-colors border border-white/5"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-stone-300 text-[13px] font-light leading-relaxed italic">
                    {name === 'Earth' ? 'The focal point of Gaia consciousness. A living library of physical experience.' : astro?.interpretation || astro?.meaning || 'Planetary frequency synchronized. Exploring resonance.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {astro ? (
                    <>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-0.5">Vibration</div>
                        <div className="text-white text-xs font-bold font-mono">{astro.sign}</div>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-0.5">Degree</div>
                        <div className="text-white text-xs font-bold font-mono">{Math.floor(astro.degree)}°</div>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-0.5">House</div>
                        <div className="text-white text-xs font-bold font-mono">Sector {astro.house}</div>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                         <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-0.5">Element</div>
                         <div className="text-white text-xs font-bold font-mono">{elementInfo?.type || 'Space'}</div>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                       <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-1">Status</div>
                       <div className="text-white text-[10px] font-mono">NODE_UNSYNCED</div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[8px] text-stone-600 uppercase tracking-widest">{distance} AU FROM RADIUS</span>
                  <span className="text-[9px] text-stone-500 uppercase font-bold tracking-tighter">NODE SYNCED</span>
                </div>
              </div>
            </motion.div>
          </Html>
        )}

        {/* Visual Indicator for Active Planet */}
        {active && (
          <group>
            <Ring args={[size * 1.5, size * 1.6, 64]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
            </Ring>
            <Ring args={[size * 1.8, size * 1.85, 64]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
            </Ring>
            <Sparkles count={50} scale={size * 2} size={2} speed={0.5} color={color} />
          </group>
        )}

        {hovered && !active && (
          <group position={[0, size + 1.2, 0]}>
            <Text
              fontSize={0.8}
              color="#ffffff"
              anchorX="center"
              anchorY="bottom"
              letterSpacing={0.2}
            >
              {name.toUpperCase()}
            </Text>
            {astro && (
              <group position={[0, -0.2, 0]}>
                <Text
                  fontSize={0.4}
                  color={color}
                  anchorX="center"
                  anchorY="top"
                  fillOpacity={0.9}
                  letterSpacing={0.1}
                  position={[0, 0, 0]}
                >
                  {`${astro.sign.toUpperCase()} ${Math.floor(astro.degree)}° • H${astro.house}`}
                </Text>
                <Text
                  fontSize={0.25}
                  color="#a8a29e"
                  anchorX="center"
                  anchorY="top"
                  fillOpacity={0.6}
                  letterSpacing={0.15}
                  position={[0, -0.6, 0]}
                >
                  {spectralTypes[name] || 'O-CLASS RESONANCE'}
                </Text>
                {elementInfo && (
                   <mesh position={[0, -1, 0]} rotation={[-Math.PI/2, 0, 0]}>
                      <circleGeometry args={[0.07, 32]} />
                      <meshBasicMaterial color={elementInfo.color} />
                   </mesh>
                )}
              </group>
            )}
          </group>
        )}
      </group>
      
      {/* Orbit Path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.05, distance + 0.05, 128]} />
        <meshBasicMaterial color="white" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

interface SolarSystemSceneProps {
  data: CosmicData | null;
  onPlanetClick?: (title: string, content: string) => void;
  isBirthChartMode?: boolean;
  onResearch?: (query: string) => void;
  onSave?: (data: any) => void;
}

const HOUSE_DESCRIPTIONS: Record<number, string> = {
  1: 'Self, identity, physical appearance, and first impressions.',
  2: 'Values, possessions, money, and self-worth.',
  3: 'Communication, siblings, local environment, and lower mind.',
  4: 'Home, family, roots, ancestry, and emotional security.',
  5: 'Creativity, romance, pleasure, children, and self-expression.',
  6: 'Health, daily routines, work, and service.',
  7: 'Partnerships, marriage, open enemies, and one-on-one relationships.',
  8: 'Transformation, shared resources, intimacy, and mystery.',
  9: 'Higher learning, philosophy, long-distance travel, and belief systems.',
  10: 'Career, public status, authority, and destiny.',
  11: 'Friendships, groups, community, and hopes/wishes.',
  12: 'Subconscious, secrets, spiritual retreat, and karmic endings.',
};

const AscendantAxis = ({ data }: { data: CosmicData | null }) => {
  const ascendantSign = data?.natalChart?.ascendantSign;
  if (!ascendantSign) return null;
  const angle = SIGN_ANGLES[ascendantSign];
  if (angle === undefined) return null;

  const rad = (angle * Math.PI) / 180;
  const length = 160;
  const start = new THREE.Vector3(0, 0, 0);
  const end = new THREE.Vector3(Math.cos(-rad) * length, 0, Math.sin(-rad) * length);

  return (
    <group>
      {/* Ascendant Line */}
      <Line points={[start, end]} color="#d97706" lineWidth={2} transparent opacity={0.6} />
      
      {/* Descendant Line (Opposite) */}
      <Line points={[start, new THREE.Vector3(-end.x, 0, -end.z)]} color="#64748b" lineWidth={1} transparent opacity={0.3} dashSize={2} gapSize={2} />
      
      {/* Ascendant Marker */}
      <group position={[end.x * 0.9, 0, end.z * 0.9]}>
        <mesh rotation={[-Math.PI/2, Math.PI + rad, 0]}>
          <coneGeometry args={[2, 6, 3]} />
          <meshBasicMaterial color="#d97706" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 4, 0]}
          rotation={[-Math.PI / 2, 0, rad + Math.PI / 2]}
          fontSize={6}
          color="#d97706"
        >
          ASC
        </Text>
      </group>
    </group>
  );
};

const CelestialEquator = () => {
  const config = [
    { radius: 45, opacity: 0.1, color: '#3b82f6', width: 0.2 },
    { radius: 85, opacity: 0.05, color: '#10b981', width: 0.5 },
    { radius: 125, opacity: 0.08, color: '#8b5cf6', width: 0.3 }
  ];

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {config.map((ring, i) => (
        <mesh key={i} position={[0, 0, -0.5]}>
          <ringGeometry args={[ring.radius, ring.radius + ring.width, 128]} />
          <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

const EclipticPlane = () => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
       <mesh position={[0, 0, -1]}>
         <planeGeometry args={[300, 300]} />
         <meshBasicMaterial color="#ffffff" transparent opacity={0.015} side={THREE.DoubleSide} />
       </mesh>
       <Grid 
         position={[0, 0, -1.01]}
         args={[300, 300]}
         cellSize={20}
         cellThickness={0.5}
         cellColor="#d97706"
         sectionSize={100}
         sectionThickness={1}
         sectionColor="#d97706"
         fadeDistance={200}
         fadeStrength={3}
         transparent
         opacity={0.1}
       />
    </group>
  );
};

// Pure React-Three-Fiber component handling only R3F 3D Canvas Elements
const SolarSystem3DScene = ({
  data,
  selectedPlanet,
  setSelectedPlanet,
  rotationPerspective,
  isStatic,
  showHouseGuide,
  isLatticeActive,
  sceneMode,
  sunHovered,
  setSunHovered,
  hoveredHouse,
  setHoveredHouse,
  setSelectedAspect,
  auraNodes,
  auraEdges,
  isNeuralSyncActive,
  onPlanetClick,
  controlsRef,
  getAstrologicalData,
  getPlanetPos,
  setSelectedAuraNode
}: any) => {

  useFrame(({ clock }) => {
    if (controlsRef.current) {
      if (rotationPerspective === 'top') {
        controlsRef.current.object.position.lerp(new THREE.Vector3(0, 200, 0), 0.05);
        controlsRef.current.object.lookAt(0, 0, 0);
      } else if (rotationPerspective === 'isometric') {
        controlsRef.current.object.position.lerp(new THREE.Vector3(120, 120, 120), 0.05);
        controlsRef.current.object.lookAt(0, 0, 0);
      }

      if (selectedPlanet) {
        if (selectedPlanet.name === 'Sun') {
          controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        } else {
          const chartPos = getPlanetPos(selectedPlanet);
          if (chartPos) {
            controlsRef.current.target.lerp(chartPos, 0.1);
          } else {
            const t = clock.getElapsedTime() * selectedPlanet.speed * 0.1;
            const x = Math.cos(t) * selectedPlanet.distance;
            const z = -Math.sin(t) * selectedPlanet.distance;
            const targetPos = new THREE.Vector3(x, 0, z);
            controlsRef.current.target.lerp(targetPos, 0.1);
          }
        }
      } else {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      }
      controlsRef.current.update();
    }
  });

  const mappedPlanetsForGravity = useMemo(() => {
    return [...planets, ...SPECIAL_POINTS].map(p => {
      const astro = getAstrologicalData(p.name);
      return {
        ...p,
        degree: astro?.degree,
        distance: p.name === 'Sun' ? 40 : p.distance
      };
    }).filter(p => p.degree !== undefined);
  }, [data, getAstrologicalData]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[120, 120, 120]} fov={50} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        maxDistance={500}
        minDistance={10}
        autoRotate={!selectedPlanet && rotationPerspective === 'orbit'}
        autoRotateSpeed={0.5}
      />
      
      <Stars radius={400} depth={80} count={30000} factor={7} saturation={0} fade speed={1.5} />
      <Stars radius={200} depth={40} count={5000} factor={4} saturation={0.5} fade speed={0.5} />
      
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 100, 600]} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[100, 100, 100]} intensity={1} color="#ffffff" />
      
      {showHouseGuide && (
        <>
          <AstrologicalHouses data={data} onHouseHover={setHoveredHouse} />
          <AscendantAxis data={data} />
          <CelestialEquator />
          <EclipticPlane />
        </>
      )}
      <AspectLines data={data} onAspectClick={setSelectedAspect} />
      <PlanetaryGravityNetwork planets={mappedPlanetsForGravity} />
      <CelestialDNAHelix />
      
      {/* Grid Floor for Futuristic Feel */}
      <Grid 
        infiniteGrid 
        fadeDistance={200} 
        fadeStrength={5}
        sectionColor="#ffffff" 
        sectionSize={50} 
        sectionThickness={0.5} 
        cellColor="#3b82f6" 
        cellSize={10} 
        cellThickness={0.2} 
        position={[0, -2, 0]}
        rotation={[0, 0, 0]}
      />

      {/* The Center Point (Sun in Solar) */}
      <group 
        onPointerOver={() => { soundEngine.hover(); setSunHovered(true); }}
        onPointerOut={() => setSunHovered(false)}
        onClick={() => {
          soundEngine.select();
          const sunData = getAstrologicalData('Sun');
          if (sunData) {
            setSelectedPlanet({
              name: 'Sun',
              color: '#FDB813',
              size: 6,
              distance: 0,
              speed: 0,
              description: `The core of your identity. Centered in ${sunData.sign} in the ${sunData.house}${sunData.house % 10 === 1 ? 'st' : sunData.house % 10 === 2 ? 'nd' : sunData.house % 10 === 3 ? 'rd' : 'th'} House. ${sunData.meaning}`
            });
          }
        }}
      >
        <CelestialSolarCore selected={selectedPlanet?.name === 'Sun'} hovered={sunHovered} />

        {sunHovered && !selectedPlanet && (
          <group position={[0, 8, 0]}>
            <Text
              fontSize={1}
              color="#ffffff"
              anchorX="center"
              anchorY="bottom"
              letterSpacing={0.2}
            >
              SUN
            </Text>
            {getAstrologicalData('Sun') && (
              <Text
                position={[0, -0.2, 0]}
                fontSize={0.6}
                color="#FDB813"
                anchorX="center"
                anchorY="top"
                fillOpacity={0.8}
                letterSpacing={0.1}
              >
                {`${getAstrologicalData('Sun')?.sign.toUpperCase()} • HOUSE ${getAstrologicalData('Sun')?.house}`}
              </Text>
            )}
          </group>
        )}

        {selectedPlanet?.name === 'Sun' && (
          <Html position={[8, 8, 0]} center distanceFactor={20}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-[400px] bg-black/80 backdrop-blur-3xl border border-white/20 p-8 rounded-[40px] shadow-[0_0_80px_rgba(253,184,19,0.2)] pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.5em] text-amber-500 mb-2">Solar Core</h4>
                  <h3 className="text-4xl font-light text-white uppercase tracking-widest">Sun</h3>
                  <div className="w-16 h-1 mt-3 bg-amber-500" />
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSelectedPlanet(null); }} className="p-2 text-stone-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {(() => {
                  const sunAstro = getAstrologicalData('Sun');
                  return (
                    <>
                      <div className="white/5 p-5 rounded-3xl border border-white/10">
                        <p className="text-stone-200 text-sm italic leading-relaxed font-light">
                          {sunAstro?.interpretation || sunAstro?.meaning || selectedPlanet.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Vibration</div>
                          <div className="text-white text-sm font-bold font-mono">{sunAstro?.sign || 'Aries'}</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Degree</div>
                          <div className="text-white text-sm font-bold font-mono">{Math.floor(sunAstro?.degree || 0)}°</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">House</div>
                          <div className="text-white text-sm font-bold font-mono">Sector {sunAstro?.house || 1}</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Element</div>
                          <div className="text-white text-sm font-bold font-mono">{sunAstro?.sign ? SIGN_ELEMENTS[sunAstro.sign]?.type : 'Fire'}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                   <div className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">Gravitational Influence</div>
                   <div className="text-amber-500 text-[10px] uppercase tracking-tighter">Prime Source</div>
                </div>
              </div>
            </motion.div>
          </Html>
        )}
      </group>

      {planets.map((planet) => {
        const astro = getAstrologicalData(planet.name);
        return (
          <Planet 
            key={planet.name} 
            {...planet} 
            active={selectedPlanet?.name === planet.name}
            astro={astro}
            isStatic={isStatic}
            isBirthChartMode={false}
            showTracking={showHouseGuide}
            onSelect={(p) => setSelectedPlanet(p ? planets?.find(item => item.name === p.name) || p : null)} 
            onPlanetClick={onPlanetClick}
          />
        );
      })}

      {SPECIAL_POINTS.map((point) => {
        const astro = getAstrologicalData(point.name);
        return (
          <Planet 
            key={point.name} 
            {...point} 
            active={selectedPlanet?.name === point.name}
            astro={astro}
            isStatic={isStatic}
            isBirthChartMode={false}
            showTracking={showHouseGuide}
            onSelect={(p) => setSelectedPlanet(p ? (SPECIAL_POINTS.find(item => item.name === p.name) as any) || p : null)} 
            onPlanetClick={onPlanetClick}
          />
        );
      })}

      {hoveredHouse && (
        <Html 
          position={[
            Math.cos(((hoveredHouse.houseNumber - 1) * 30 + 15) * Math.PI / 180) * 100,
            5,
            Math.sin(((hoveredHouse.houseNumber - 1) * 30 + 15) * Math.PI / 180) * 100
          ]} 
          center 
          distanceFactor={20}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-[300px] bg-black/90 backdrop-blur-3xl border border-blue-500/40 p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(59,130,246,0.3)] pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                  <Radio size={16} />
                </div>
                <div>
                  <div className="text-[8px] text-stone-500 uppercase tracking-[0.4em] font-bold">Resonance Point</div>
                  <h3 className="text-xl text-white font-light tracking-widest uppercase">House {hoveredHouse.houseNumber}</h3>
                </div>
              </div>
              <div className="text-[10px] text-blue-500 font-mono font-bold tracking-tighter">
                {hoveredHouse.sign?.toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[8px] text-blue-400 uppercase tracking-widest mb-1">Archetypal Domain</div>
                <div className="text-white text-xs font-medium leading-relaxed italic pr-2">
                  {hoveredHouse.realmName || 'Sector of existence'}
                </div>
              </div>
              
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <p className="text-[11px] text-stone-300 leading-relaxed font-light italic">
                  {hoveredHouse.description || HOUSE_DESCRIPTIONS[hoveredHouse.houseNumber]}
                </p>
              </div>
              
              <div className="pt-2 flex justify-between items-center">
                 <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-blue-500/30" />)}
                 </div>
                 <span className="text-[8px] text-stone-600 uppercase font-bold tracking-widest">Active Influence</span>
              </div>
            </div>
          </motion.div>
        </Html>
      )}

      {/* Neural Lattice */}
      {isLatticeActive && (
        <group>
          {planets.map((p1, i) => 
            planets.slice(i + 1).map((p2, j) => {
              const astro1 = getAstrologicalData(p1.name);
              const astro2 = getAstrologicalData(p2.name);
              
              if (!astro1 || !astro2) return null;
              
              const distance = p1.distance - p2.distance;
              if (Math.abs(distance) < 80 || (astro1?.sign === astro2?.sign)) {
                return (
                  <Line 
                    key={`latt-${p1.name}-${p2.name}`}
                    points={[
                      [Math.cos((astro1.degree * Math.PI)/180) * p1.distance, 0, Math.sin((astro1.degree * Math.PI)/180) * p1.distance],
                      [Math.cos((astro2.degree * Math.PI)/180) * p2.distance, 0, Math.sin((astro2.degree * Math.PI)/180) * p2.distance]
                    ]} 
                    color={sceneMode === 'quantum' ? '#f43f5e' : (astro1?.sign === astro2?.sign ? '#fbbf24' : '#3b82f6')}
                    opacity={0.08}
                    transparent
                    lineWidth={1}
                  />
                );
              }
              return null;
            })
          )}
        </group>
      )}

      {/* Aura Nodes and Edges */}
      {isNeuralSyncActive && (
        <group>
          {auraNodes.map((node: any) => (
            <AuraNode 
              key={node.id} 
              node={node} 
              onSelect={setSelectedAuraNode} 
            />
          ))}

          {auraEdges.map((edge: any) => {
            const p1 = auraNodes?.find(n => n.id === edge.source);
            const p2 = auraNodes?.find(n => n.id === edge.target);
            if (!p1 || !p2) return null;

            return (
              <Line 
                key={`${edge.source}-${edge.target}`}
                points={[p1.position, p2.position]}
                color={edge.color === 'sky' ? '#38bdf8' : (edge.color === 'rose' ? '#fb7185' : '#10b981')}
                lineWidth={1}
                opacity={0.3}
                transparent
              />
            );
          })}
        </group>
      )}

      {/* Advanced Post-Processing Effects */}
      <EffectComposer>
         <Bloom 
           intensity={sceneMode === 'quantum' ? 2 : (sceneMode === 'void' ? 0.5 : 1.2)} 
           mipmapBlur 
           luminanceThreshold={0.7} 
         />
         <Noise opacity={sceneMode === 'void' ? 0.4 : 0.08} />
         <Vignette eskil={false} offset={0.2} darkness={sceneMode === 'void' ? 1.6 : 1.2} />
         {sceneMode === 'quantum' && <ChromaticAberration {...{ blendFunction: BlendFunction.NORMAL, offset: new THREE.Vector2(0.003, 0.003) } as any} />}
      </EffectComposer>
    </>
  );
};

// Orchestrating main wrapper component (natively placed over general flat/3D layout views)
export const SolarSystemScene = ({ data, onPlanetClick, onResearch, onSave }: SolarSystemSceneProps) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [sunHovered, setSunHovered] = useState(false);
  const [hoveredHouse, setHoveredHouse] = useState<any>(null);
  const [selectedAspect, setSelectedAspect] = useState<any>(null);
  const [isStatic, setIsStatic] = useState(false);
  const [viewMode, setViewMode] = useState<'solar' | 'chart'>('chart');
  const [rotationPerspective, setRotationPerspective] = useState<'top' | 'isometric' | 'orbit' | 'free'>('free');
  const [showHouseGuide, setShowHouseGuide] = useState(false);
  const [sceneMode, setSceneMode] = useState<'cosmic' | 'quantum' | 'verdant' | 'void'>('cosmic');
  const [isLatticeActive, setIsLatticeActive] = useState(true);
  const [isNeuralSyncActive, setIsNeuralSyncActive] = useState(false);
  const [isBlueprintMinimized, setIsBlueprintMinimized] = useState(false);

  // Aura AI Agent State
  const [auraNodes, setAuraNodes] = useState<AuraVisualNode[]>([]);
  const [auraEdges, setAuraEdges] = useState<AuraVisualEdge[]>([]);
  const [isAuraOpen, setIsAuraOpen] = useState(false);
  const [auraPrompt, setAuraPrompt] = useState('');
  const [isAuraThinking, setIsAuraThinking] = useState(false);
  const [auraInsight, setAuraInsight] = useState<string | null>(null);
  const [selectedAuraNode, setSelectedAuraNode] = useState<AuraVisualNode | null>(null);
  const [auraLogs, setAuraLogs] = useState<string[]>(["Core systems initialized.", "Scanning celestial resonance..."]);
  const [isAuraMinimized, setIsAuraMinimized] = useState(false);

  const controlsRef = useRef<any>(null);

  const handleAuraSubmit = async () => {
    if (!auraPrompt.trim() || !data || isAuraThinking) return;
    
    setIsAuraThinking(true);
    setAuraLogs(prev => [...prev.slice(-4), `Analyzing prompt: "${auraPrompt}"`]);
    setAuraInsight("Synchronizing with cosmic resonance frequencies...");
    
    try {
      const result = await fetchAuraInsight(auraPrompt, data);
      
      setAuraLogs(prev => [...prev.slice(-4), "Vibrational match found.", "Synthesizing 3D manifestation..."]);
      setAuraNodes(prev => [...prev, ...result.visualNodes].slice(-10)); 
      setAuraEdges(prev => [...prev, ...result.visualEdges].slice(-15));
      setAuraInsight(result.insight);
      setAuraPrompt('');
    } catch (error) {
      setAuraInsight("Neural connection unstable. Please re-initiate transmission.");
      setAuraLogs(prev => [...prev.slice(-4), "ERROR: Connection timeout."]);
    } finally {
      setIsAuraThinking(false);
    }
  };

  const getAstrologicalData = useMemo(() => {
    return (name: string) => {
      if (!data) return null;
      if (name === 'North Node') return data.nodes?.north;
      if (name === 'South Node') return data.nodes?.south;
      if (name === 'Chiron') return data.points?.chiron;
      if (name === 'Lilith') return data.points?.blackMoonLilith;
      if (name === 'Sun') return data.planets?.find(p => p.name.toLowerCase() === 'sun');
      if (name === 'Earth') return { name: 'Earth', sign: 'N/A', degree: 0, house: 0, meaning: 'Center of observation' };
      return data.planets?.find(p => p.name.toLowerCase() === name.toLowerCase());
    };
  }, [data]);

  const getPlanetPos = useMemo(() => {
    return (planet: PlanetData) => {
      const astro = getAstrologicalData(planet.name);
      if (viewMode === 'chart') {
        if (planet.name === 'Earth') return new THREE.Vector3(0, 0, 0);
        if (astro?.sign) {
          const baseAngle = SIGN_ANGLES[astro.sign] || 0;
          const t = -((baseAngle + (astro.degree || 0)) * Math.PI) / 180;
          const d = planet.name === 'Sun' ? 40 : planet.distance;
          return new THREE.Vector3(Math.cos(t) * d, 0, Math.sin(t) * d);
        }
      }
      return null;
    };
  }, [getAstrologicalData, viewMode]);

  return (
    <div className="w-full h-full relative bg-[#020205] text-white overflow-hidden">
      
      {/* Background stardust glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,2,24,0.3)_0%,transparent_70%)] pointer-events-none select-none z-0" />
      
      {/* Core View Switching Panel */}
      <AnimatePresence mode="wait">
        {viewMode === 'chart' ? (
          <motion.div
            key="2d-radial-chart"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full h-full p-2 md:p-6 flex items-center justify-center bg-[#020205] select-none"
          >
            <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center">
              <ClassicBirthChart 
                data={data} 
                selectedPlanet={selectedPlanet} 
                onPlanetClick={(p: any) => {
                  setSelectedPlanet(p);
                  if (onPlanetClick && p) {
                    onPlanetClick(p.name, p.meaning || p.description);
                  }
                }} 
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="3d-interactive-canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full absolute inset-0 z-10"
          >
            <div className="w-full h-full absolute inset-0 z-10" id="solar-system-canvas-container">
            <Canvas id="solar-canvas" shadows dpr={[1, 1.5]} gl={{ powerPreference: "high-performance" }} className="w-full h-full block">
              <SolarSystem3DScene 
                data={data}
                selectedPlanet={selectedPlanet}
                setSelectedPlanet={setSelectedPlanet}
                rotationPerspective={rotationPerspective}
                isStatic={isStatic}
                showHouseGuide={showHouseGuide}
                isLatticeActive={isLatticeActive}
                sceneMode={sceneMode}
                sunHovered={sunHovered}
                setSunHovered={setSunHovered}
                hoveredHouse={hoveredHouse}
                setHoveredHouse={setHoveredHouse}
                setSelectedAspect={setSelectedAspect}
                auraNodes={auraNodes}
                auraEdges={auraEdges}
                isNeuralSyncActive={isNeuralSyncActive}
                onPlanetClick={onPlanetClick}
                controlsRef={controlsRef}
                getAstrologicalData={getAstrologicalData}
                getPlanetPos={getPlanetPos}
                setSelectedAuraNode={setSelectedAuraNode}
              />
            </Canvas>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Astro Intelligence Absolute Overlays (Natively structured over general flat/3D layouts) */}
      <div className="absolute top-8 left-8 z-[110] flex flex-col gap-4 pointer-events-none">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-6 bg-stone-950/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] pointer-events-auto relative shadow-2xl"
        >
          <button 
            onClick={() => setIsBlueprintMinimized(!isBlueprintMinimized)}
            className="absolute top-6 right-6 p-2 rounded-full text-stone-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isBlueprintMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          
          <div className="flex items-center gap-3 mb-1 pr-8">
            <Sparkle className="text-amber-500" size={16} />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-500">Core Matrix</span>
          </div>
          <h2 className="text-2xl font-light text-white tracking-widest uppercase pr-8 font-serif">Celestial Blueprint</h2>
          
          <AnimatePresence>
            {!isBlueprintMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex flex-wrap gap-2 max-w-[280px]">
                  <button 
                    onClick={() => {
                      soundEngine.select();
                      setViewMode(viewMode === 'solar' ? 'chart' : 'solar');
                    }}
                    className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] font-bold' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                  >
                    {viewMode === 'chart' ? 'Zodiac Wheel' : 'Solar Dynamics'}
                  </button>

                  {viewMode === 'solar' && (
                    <>
                      <div className="flex bg-white/5 rounded-full border border-white/10 p-0.5">
                        {[
                          { id: 'top', icon: Globe, label: 'Flat' },
                          { id: 'isometric', icon: Compass, label: '3D' },
                          { id: 'orbit', icon: Activity, label: 'Spin' },
                          { id: 'free', icon: Eye, label: 'Free' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              soundEngine.select();
                              setRotationPerspective(opt.id as any);
                            }}
                            className={`p-2 rounded-full transition-all ${rotationPerspective === opt.id ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            title={opt.label}
                          >
                            <opt.icon size={14} />
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => {
                          soundEngine.select();
                          setIsStatic(!isStatic);
                        }}
                        className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-all ${isStatic ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                      >
                        {isStatic ? 'Orbits Paused' : 'Dynamic Flow'}
                      </button>
                      
                      <button 
                        onClick={() => {
                          soundEngine.select();
                          setShowHouseGuide(!showHouseGuide);
                        }}
                        className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-all ${showHouseGuide ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 font-bold' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                      >
                        Chart Synthesis
                      </button>
                      
                      <button 
                        onClick={() => {
                          soundEngine.select();
                          setIsLatticeActive(!isLatticeActive);
                        }}
                        className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-all ${isLatticeActive ? 'bg-blue-500/20 border-blue-500 text-blue-500 font-bold' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                      >
                        Neural Lattice
                      </button>
                    </>
                  )}
                </div>

                {viewMode === 'solar' && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="text-blue-400" size={14} />
                      <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Vibrational Dimension</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-[280px]">
                      {[
                        { id: 'cosmic', color: 'bg-blue-500', label: 'Cosmic-1', icon: Globe2 },
                        { id: 'quantum', color: 'bg-rose-500', label: 'Quantum-X', icon: Atom },
                        { id: 'verdant', color: 'bg-emerald-500', label: 'Verdant-Z', icon: Wind },
                        { id: 'void', color: 'bg-stone-500', label: 'Deep Void', icon: Ghost }
                      ].map(mode => (
                        <button 
                          key={mode.id}
                          onClick={() => {
                            soundEngine.select();
                            setSceneMode(mode.id as any);
                          }}
                          className={`flex items-center justify-between gap-3 px-4 py-2 rounded-2xl border transition-all ${sceneMode === mode.id ? 'bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'bg-transparent border-transparent opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                        >
                          <div className="flex items-center gap-2">
                             <mode.icon size={12} className={sceneMode === mode.id ? 'text-white' : 'text-stone-500'} />
                             <span className="text-[9px] text-white uppercase tracking-widest font-medium font-mono">{mode.label}</span>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full ${mode.color} ${sceneMode === mode.id ? 'animate-ping' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Aura AI Agent Panel Overlay */}
      <div className="absolute top-8 right-8 z-[115] flex flex-col gap-4 pointer-events-none">
         <motion.div 
           drag
           dragMomentum={false}
           initial={{ x: 20, opacity: 0 }}
           animate={{ 
             x: 0, 
             opacity: 1,
             height: isAuraMinimized ? 84 : 'auto',
             width: isAuraMinimized ? 300 : 450
           }}
           className="bg-stone-950/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl pointer-events-auto overflow-hidden cursor-grab active:cursor-grabbing flex flex-col"
         >
           <div className="flex justify-between items-start mb-6 shrink-0">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
                 <Bot size={20} className={isAuraThinking ? 'animate-spin' : ''} />
               </div>
               <div>
                 <div className="text-[8px] text-stone-500 uppercase tracking-[0.4em] font-bold">Neural Core</div>
                 <h3 className="text-xl text-white font-light tracking-widest font-serif uppercase">Aura Oracle</h3>
               </div>
             </div>
             
             <div className="flex items-center gap-2">
                 <button
                     onClick={(e) => {
                         e.stopPropagation();
                         setIsAuraMinimized(!isAuraMinimized);
                     }}
                     className="px-2 py-2 border rounded-full text-white/40 hover:text-white transition-all bg-white/5 border-white/10 hover:bg-white/10"
                 >
                     {isAuraMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                 </button>
                 {!isAuraMinimized && viewMode === 'solar' && (
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       soundEngine.select();
                       setIsNeuralSyncActive(!isNeuralSyncActive);
                     }}
                     className={`px-4 py-2 border rounded-full text-[9px] uppercase tracking-widest font-mono transition-all ${isNeuralSyncActive ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                   >
                     {isNeuralSyncActive ? 'SYNC_ONLINE' : 'SYNC_OFFLINE'}
                   </button>
                 )}
             </div>
           </div>

           <AnimatePresence>
             {!isAuraMinimized && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="flex flex-col gap-4"
               >
                 <div className="space-y-4 mb-4">
                    <div className="h-[140px] bg-black/40 border border-white/5 rounded-3xl p-4 overflow-y-auto space-y-2 font-mono text-[9px] text-[#00ff22]/60 scrollbar-hide">
                      <div className="text-stone-500 text-[8px] uppercase tracking-widest border-b border-white/5 pb-1 mb-2">Diagnostic Stream</div>
                      {auraLogs.map((log, i) => (
                        <div key={i} className="flex gap-2 items-start leading-relaxed">
                          <span className="text-stone-700">►</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>

                    {auraPrompt && (
                      <div className="flex gap-2">
                        <div className="flex bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 gap-3">
                          <Zap className="text-purple-400 animate-pulse mt-0.5" size={14} />
                          <p className="text-stone-300 text-xs font-light leading-relaxed">
                            {auraInsight || "The Aura Oracle is scanning planetary transits. Ask which zodiac placement is governing your focal energy."}
                          </p>
                        </div>
                      </div>
                    )}
                 </div>

                 <div className="flex gap-2 max-w-full">
                    <input 
                      type="text" 
                      placeholder="Synthesize current natal transits..." 
                      value={auraPrompt}
                      onChange={(e) => setAuraPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAuraSubmit()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="flex-grow px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500 transition-colors"
                      disabled={isAuraThinking}
                    />
                    <button 
                      onClick={handleAuraSubmit}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="p-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-2xl text-white transition-colors flex items-center justify-center border border-purple-400"
                      disabled={isAuraThinking}
                    >
                      {isAuraThinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
         </motion.div>

         {selectedAuraNode && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-black/95 backdrop-blur-3xl border border-purple-500/40 p-5 rounded-[2.5rem] mt-4 shadow-3xl pointer-events-auto"
           >
             <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                 <span className="text-[9px] uppercase tracking-widest text-[#9333ea] font-mono">Sync node active</span>
               </div>
               <button onClick={() => setSelectedAuraNode(null)} className="p-1 rounded-full text-stone-500 hover:text-white hover:bg-white/10">
                 <X size={12} />
               </button>
             </div>
             <h4 className="text-md font-bold text-white mb-1">{selectedAuraNode.label}</h4>
             <p className="text-xs text-stone-400 leading-relaxed font-light italic">{selectedAuraNode.description}</p>
           </motion.div>
         )}

         {selectedAspect && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-black/95 backdrop-blur-3xl border border-yellow-500/30 p-6 rounded-[2.5rem] mt-4 shadow-3xl pointer-events-auto"
           >
             <div className="flex justify-between items-start mb-4">
               <div>
                 <div className="text-[8px] uppercase tracking-[0.4em] text-yellow-500 font-bold mb-1">Geometric Aspect Link</div>
                 <h4 className="text-xl font-light text-white uppercase tracking-widest font-serif">{selectedAspect.planet1} {selectedAspect.type} {selectedAspect.planet2}</h4>
               </div>
               <button onClick={() => setSelectedAspect(null)} className="p-1.5 bg-white/5 border border-white/10 rounded-full text-stone-500 hover:text-white transition-colors">
                 <X size={12} />
               </button>
             </div>
             
             {selectedAspect.meaning ? (
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                 <p className="text-stone-300 text-xs font-light leading-relaxed italic">{selectedAspect.meaning}</p>
               </div>
             ) : (
               <p className="text-stone-500 text-xs leading-relaxed">Aspect synchronization successfully engaged. Represents a key geometric energy bridge between physical drives.</p>
             )}
           </motion.div>
         )}
      </div>

      {/* House Guide Timeline Overview Scroll */}
      <AnimatePresence>
        {showHouseGuide && data && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-8 left-8 right-8 z-[110] bg-stone-950/90 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 pointer-events-auto shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6 pb-2 border-b border-white/5">
              <div>
                <span className="text-[8px] text-stone-500 uppercase tracking-[0.5em] font-bold block mb-1">Interactive Diagnostic Directory</span>
                <h3 className="text-3xl font-light tracking-wide font-serif text-white uppercase">House Synthesis Map</h3>
              </div>
              <button 
                onClick={() => setShowHouseGuide(false)}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-stone-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Planetary Nodes summary */}
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between">
                 <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#fbbf24] font-bold font-mono mb-4">Core Planetary Axis</h4>
                    <div className="space-y-4">
                       <div>
                         <span className="text-[9px] text-stone-500 block mb-1 uppercase tracking-wider font-bold">Primal Identity (Sun)</span>
                         <p className="text-xs text-stone-300 italic font-serif">
                           {data.planets?.find(p => p.name === 'Sun')?.meaning || 'The solar frequency is active in your blueprint.'}
                         </p>
                       </div>
                       {data.nodes?.north && (
                         <div>
                           <span className="text-[9px] text-stone-500 block mb-1 uppercase tracking-wider font-bold">Directional Intent (North Node)</span>
                           <p className="text-xs text-stone-300 italic font-serif">{data.nodes.north.meaning}</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Center & Right Fields: Interactive House cards */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-[250px] overflow-y-auto pr-2 scrollbar-none">
                {data.houses?.map(house => (
                  <div 
                    key={house.houseNumber} 
                    className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer"
                    onClick={() => {
                      soundEngine.select();
                      setHoveredHouse(house);
                    }}
                  >
                     <div className="flex justify-between items-start mb-2">
                       <div className="text-emerald-500 font-mono text-lg font-bold opacity-50 group-hover:opacity-100">{house.houseNumber}</div>
                       <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">{house.realmName}</span>
                     </div>
                     <p className="text-[11px] text-stone-400 leading-relaxed font-light italic">{house.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
