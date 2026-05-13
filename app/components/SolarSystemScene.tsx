import * as React from 'react';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float, Stars, Text, OrbitControls, PerspectiveCamera, Html, Ring, Sparkles, Line, Grid, Float as FloatDrei } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Info, Sparkle, BookOpen, Send, Bot, Cpu, Zap, Radio, Terminal, MousePointer2, ChevronRight, Binary, Layers, Wind, Ghost, Atom, Eye, Loader2, Globe, Globe2, Compass, Minimize2, Maximize2 } from 'lucide-react';
import { CosmicData } from '../types';
import { fetchAuraInsight } from '../services/geminiService';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import { NatalChartAdvanced } from './NatalChartAdvanced';
import { CelestialSolarCore, CelestialDNAHelix, PlanetaryGravityNetwork } from './CelestialSolarCore';

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

  useFrame((state) => {
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
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => { e.stopPropagation(); onSelect(node); }}
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
            <mesh rotation={[0, -angle, 0]} position={[75, 0, 0]}>
               <boxGeometry args={[150, 0.02, 0.02]} />
               <meshBasicMaterial color="white" transparent opacity={0.1} />
            </mesh>

            {/* House Interactive Zone */}
            <group 
              position={[Math.cos(midAngle) * 110, 0.1, Math.sin(midAngle) * 110]}
              onPointerOver={(e) => {
                e.stopPropagation();
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
        const p1 = data.planets.find(p => p.name === aspect.planet1);
        const p2 = data.planets.find(p => p.name === aspect.planet2);
        
        if (!p1 || !p2) return null;

        const getDistance = (name: string) => {
          const planet = planets.find(p => p.name === name);
          if (planet) return planet.distance;
          const special = SPECIAL_POINTS.find(p => p.name === name);
          if (special) return special.distance;
          if (name === 'Sun') return 0;
          return 30; // Default
        };

        const d1 = getDistance(aspect.planet1);
        const d2 = getDistance(aspect.planet2);
        
        const angle1 = (p1.degree * Math.PI) / 180;
        const angle2 = (p2.degree * Math.PI) / 180;

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
                onAspectClick?.(aspect);
              }}
              onPointerOver={(e) => {
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

interface PlanetProps extends PlanetData {
  onSelect: (p: PlanetData) => void;
  active?: boolean;
  astro?: any;
  isStatic?: boolean;
  isBirthChartMode?: boolean;
}

const SIGN_ANGLES: Record<string, number> = {
  'Aries': 0, 'Taurus': 30, 'Gemini': 60, 'Cancer': 90, 'Leo': 120, 'Virgo': 150,
  'Libra': 180, 'Scorpio': 210, 'Sagittarius': 240, 'Capricorn': 270, 'Aquarius': 300, 'Pisces': 330
};

const Planet = ({ name, color, size, distance, speed, onSelect, active, astro, isStatic, isBirthChartMode }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const elementInfo = astro?.sign ? SIGN_ELEMENTS[astro.sign] : null;

  useFrame(({ clock }) => {
    let t;
    if (isBirthChartMode && astro?.sign) {
      const baseAngle = SIGN_ANGLES[astro.sign] || 0;
      // Subtracting 90 degrees (Math.PI/2) common in astro charts for Aries at 9 o'clock or 0 degrees at top
      // Here we map 0 to angle 0 (right/Aries)
      t = ((baseAngle + (astro.degree || 0)) * Math.PI) / 180;
    } else {
      const startAngle = astro?.degree ? (astro.degree * Math.PI) / 180 : 0;
      t = isStatic ? startAngle : (startAngle + clock.getElapsedTime() * speed * 0.1);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = -t; // Negative for counter-clockwise zodiac flow
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[distance, 0, 0]}>
        <Trail width={1.5} length={25} color={color} attenuation={(t) => t * t}>
          <Sphere 
            ref={meshRef} 
            args={[size, 64, 64]} 
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect({ name, color, size, distance, speed, description: '' });
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
        
        {name === 'Saturn' && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[size * 1.5, size * 2.5, 64]} />
            <meshStandardMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
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
                    {name === 'Earth' ? 'The focal point of Gaia consciousness. A living library of physical experience.' : astro?.meaning || 'Planetary frequency synchronized. Exploring resonance.'}
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
              fontSize={0.6}
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
                  fontSize={0.35}
                  color={color}
                  anchorX="center"
                  anchorY="top"
                  fillOpacity={0.9}
                  letterSpacing={0.1}
                >
                  {`${astro.sign.toUpperCase()} ${Math.floor(astro.degree)}° • H${astro.house}`}
                </Text>
                {elementInfo && (
                   <mesh position={[0, -0.4, 0]} rotation={[-Math.PI/2, 0, 0]}>
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

export const SolarSystemScene = ({ data, onPlanetClick }: SolarSystemSceneProps) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [sunHovered, setSunHovered] = useState(false);
  const [hoveredHouse, setHoveredHouse] = useState<any>(null);
  const [selectedAspect, setSelectedAspect] = useState<any>(null);
  const [isStatic, setIsStatic] = useState(false);
  const [viewMode, setViewMode] = useState<'solar' | 'chart'>('chart');
  const [rotationPerspective, setRotationPerspective] = useState<'top' | 'isometric' | 'orbit'>('isometric');
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

  // Map astrological data to planets and special points
  const getAstrologicalData = (name: string) => {
    if (!data) return null;
    if (name === 'North Node') return data.nodes?.north;
    if (name === 'South Node') return data.nodes?.south;
    if (name === 'Chiron') return data.points?.chiron;
    if (name === 'Lilith') return data.points?.blackMoonLilith;
    if (name === 'Sun') return data.planets.find(p => p.name.toLowerCase() === 'sun');
    if (name === 'Earth') return { name: 'Earth', sign: 'N/A', degree: 0, house: 0, meaning: 'Center of observation' };
    return data.planets.find(p => p.name.toLowerCase() === name.toLowerCase());
  };

  const getPlanetPos = (planet: PlanetData) => {
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
  }, [data]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[120, 120, 120]} fov={50} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
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
      
      {viewMode === 'chart' ? (
        <NatalChartAdvanced data={data} selectedPlanet={selectedPlanet} onPlanetClick={setSelectedPlanet} />
      ) : (
        <>
          <AstrologicalHouses data={data} onHouseHover={setHoveredHouse} />
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
            transparent
            material-opacity={0.05}
          />

          {/* The Center Point (Sun in Solar) */}
          <group 
            onPointerOver={() => setSunHovered(true)}
            onPointerOut={() => setSunHovered(false)}
            onClick={() => {
              if (viewMode === 'solar') {
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
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                            <p className="text-stone-200 text-sm italic leading-relaxed font-light">
                              {sunAstro?.meaning || selectedPlanet.description}
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
                onSelect={(p) => setSelectedPlanet(p ? planets.find(item => item.name === p.name) || p : null)} 
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
                onSelect={(p) => setSelectedPlanet(p ? (SPECIAL_POINTS.find(item => item.name === p.name) as any) || p : null)} 
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
        </>
      )}

      {/* Astro Intelligence Overlay */}
      <Html fullscreen>
        <div className="absolute top-8 left-8 z-[110] flex flex-col gap-4 pointer-events-none">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-6 bg-stone-950/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] pointer-events-auto relative"
          >
            <button 
              onClick={() => setIsBlueprintMinimized(!isBlueprintMinimized)}
              className="absolute top-6 right-6 p-2 rounded-full text-stone-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isBlueprintMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <div className="flex items-center gap-3 mb-1 pr-8">
              <Sparkle className="text-yellow-500" size={16} />
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-500">Core Matrix</span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-widest uppercase pr-8">Celestial Blueprint</h2>
            
            <AnimatePresence>
              {!isBlueprintMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button 
                      onClick={() => setViewMode(viewMode === 'solar' ? 'chart' : 'solar')}
                      className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                    >
                      {viewMode === 'chart' ? 'Zodiac Wheel' : 'Solar Dynamics'}
                    </button>
                    <div className="flex bg-white/5 rounded-full border border-white/10 p-0.5">
                      {[
                        { id: 'top', icon: Globe, label: 'Flat' },
                        { id: 'isometric', icon: Compass, label: '3D' },
                        { id: 'orbit', icon: Activity, label: 'Spin' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setRotationPerspective(opt.id as any)}
                          className={`p-2 rounded-full transition-all ${rotationPerspective === opt.id ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}
                          title={opt.label}
                        >
                          <opt.icon size={14} />
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setIsStatic(!isStatic)}
                      className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-all ${isStatic ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                    >
                      {isStatic ? 'Orbits Paused' : 'Dynamic Flow'}
                    </button>
                    <button 
                      onClick={() => setShowHouseGuide(!showHouseGuide)}
                      className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-all ${showHouseGuide ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                    >
                      Chart Synthesis
                    </button>
                    <button 
                      onClick={() => setIsLatticeActive(!isLatticeActive)}
                      className={`px-4 py-2 border rounded-full text-[10px] uppercase tracking-widest transition-all ${isLatticeActive ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                    >
                      Neural Lattice
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="text-blue-400" size={14} />
                      <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Vibrational Dimension</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cosmic', color: 'bg-blue-500', label: 'Cosmic-1', icon: Globe2 },
                        { id: 'quantum', color: 'bg-rose-500', label: 'Quantum-X', icon: Atom },
                        { id: 'verdant', color: 'bg-emerald-500', label: 'Verdant-Z', icon: Wind },
                        { id: 'void', color: 'bg-stone-500', label: 'Deep Void', icon: Ghost }
                      ].map(mode => (
                        <button 
                          key={mode.id}
                          onClick={() => setSceneMode(mode.id as any)}
                          className={`flex items-center justify-between gap-3 px-4 py-2 rounded-2xl border transition-all ${sceneMode === mode.id ? 'bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'bg-transparent border-transparent opacity-40 hover:opacity-100 hover:bg-white/5'}`}
                        >
                          <div className="flex items-center gap-2">
                             <mode.icon size={12} className={sceneMode === mode.id ? 'text-white' : 'text-stone-500'} />
                             <span className="text-[9px] text-white uppercase tracking-widest font-medium">{mode.label}</span>
                          </div>
                          <div className={`w-1.5 h-1.5 rounded-full ${mode.color} ${sceneMode === mode.id ? 'animate-ping' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {viewMode === 'solar' && !isBlueprintMinimized && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-6 bg-stone-950/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] pointer-events-auto mt-4"
            >
              <h3 className="text-stone-500 uppercase text-[9px] tracking-[0.3em] mb-4">Solar Frequency Map</h3>
              <div className="space-y-4">
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] uppercase">
                     <span className="text-rose-400">Emotional Resonance</span>
                     <span className="text-white">78%</span>
                   </div>
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden flex">
                     <div className="h-full bg-rose-500 w-[78%] shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                   </div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] uppercase">
                     <span className="text-sky-400">Cognitive Clarity</span>
                     <span className="text-white">92%</span>
                   </div>
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden flex">
                     <div className="h-full bg-sky-500 w-[92%] shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                   </div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] uppercase">
                     <span className="text-emerald-400">Spiritual Alignment</span>
                     <span className="text-white">88%</span>
                   </div>
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden flex">
                     <div className="h-full bg-emerald-500 w-[88%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   </div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] uppercase">
                     <span className="text-amber-400">Creative Flow</span>
                     <span className="text-white">85%</span>
                   </div>
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden flex">
                     <div className="h-full bg-amber-500 w-[85%] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                   </div>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                   <span className="text-[9px] text-stone-500 uppercase">Cosmic Weather</span>
                   <span className="text-[10px] text-white font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">OPTIMAL</span>
                 </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'solar' && !isBlueprintMinimized && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-6 bg-stone-950/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] pointer-events-auto mt-4"
            >
              <h3 className="text-stone-500 uppercase text-[9px] tracking-[0.3em] mb-4">Destiny Probability</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                     <Layers className="text-purple-400" size={16} />
                   </div>
                   <div>
                     <div className="text-[10px] uppercase text-stone-400 tracking-widest">Primary Timeline</div>
                     <div className="text-white text-xs font-mono">Convergence Approaching</div>
                   </div>
                 </div>
                 <div className="text-xs text-stone-300 font-light italic opacity-80 border-l-2 border-purple-500/50 pl-3">
                    A period of rapid growth and creative expansion is mapped in the probability field.
                 </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Aura Sentient Agent Hub Toggle */}
        <div className="absolute bottom-8 right-8 z-[110] flex flex-col items-end gap-4 pointer-events-none">
          <AnimatePresence>
            {isAuraOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-[400px] bg-stone-950/95 backdrop-blur-3xl border border-emerald-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] pointer-events-auto"
              >
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/5 cursor-default">
                   <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                        <Bot className="text-emerald-500 relative z-10" size={24} />
                      </div>
                      <div>
                        <div className="text-[8px] text-stone-500 uppercase tracking-[0.6em] font-bold">Resonance Engine</div>
                        <h3 className="text-lg text-white font-light tracking-[0.2em] uppercase mt-1">Agent Aura</h3>
                      </div>
                   </div>
                   <button onClick={() => setIsAuraOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="bg-black/60 rounded-3xl p-5 border border-white/5 font-mono text-[10px] max-h-32 overflow-y-auto scrollbar-hide">
                     {auraLogs.map((log, i) => (
                       <div key={i} className="flex gap-3 mb-2">
                          <span className="text-stone-800 shrink-0">[{1000 + i}]</span>
                          <span className={`${i === auraLogs.length - 1 ? 'text-emerald-400' : 'text-stone-600'}`}>{log}</span>
                       </div>
                     ))}
                  </div>

                  {auraInsight && (
                    <motion.div 
                      key={auraInsight}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <p className="text-xs text-stone-300 leading-relaxed italic pr-4 font-light">{auraInsight}</p>
                    </motion.div>
                  )}

                  <div className="relative">
                    <input 
                      type="text"
                      value={auraPrompt}
                      onChange={(e) => setAuraPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAuraSubmit()}
                      placeholder="Enter command..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-stone-700 focus:outline-none focus:border-emerald-500/50 transition-all pr-14"
                    />
                    <button 
                      onClick={handleAuraSubmit}
                      disabled={isAuraThinking}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 hover:scale-125 disabled:opacity-50 transition-transform"
                    >
                      {isAuraThinking ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {['Resonance Link', 'Neural Bloom', 'Void Search', 'Deep Sync'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => { setAuraPrompt(tag); handleAuraSubmit(); }}
                        className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                      >
                         <Zap size={12} className="text-stone-600 group-hover:text-emerald-400 group-hover:animate-pulse" />
                         <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold group-hover:text-emerald-500">{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsAuraOpen(!isAuraOpen)}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all pointer-events-auto shadow-2xl ${isAuraOpen ? 'bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500' : 'bg-stone-900 border border-white/10 text-white hover:border-emerald-500'}`}
          >
            {isAuraOpen ? <X size={28} /> : <Bot size={32} className="animate-pulse" />}
          </button>
        </div>

        {/* Aspect Detail Overlay */}
        <AnimatePresence>
          {selectedAspect && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="absolute top-1/2 -translate-y-1/2 left-8 z-[120] w-[380px] pointer-events-auto"
            >
              <div className="bg-stone-950/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                <div className="flex justify-between items-start mb-6 relative">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedAspect.type === 'conjunction' ? 'bg-white' :
                        selectedAspect.type === 'square' ? 'bg-red-500' :
                        selectedAspect.type === 'trine' ? 'bg-emerald-500' : 'bg-blue-500'
                      } animate-pulse`} />
                      <div className="text-[10px] text-stone-500 uppercase tracking-[0.4em] font-bold">Planetary Aspect</div>
                    </div>
                    <h3 className="text-2xl text-white font-light tracking-widest uppercase">
                      {selectedAspect.planet1} <span className="text-stone-600">to</span> {selectedAspect.planet2}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedAspect(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-stone-500 hover:text-white">
                    <X size={20}/>
                  </button>
                </div>

                <div className="space-y-6 relative">
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group hover:border-purple-500/30 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                      {selectedAspect.type.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[9px] text-purple-400 uppercase tracking-widest mb-0.5">Energy Relationship</div>
                      <div className="text-white text-lg font-light uppercase tracking-widest">{selectedAspect.type}</div>
                    </div>
                  </div>

                  <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                    <p className="text-sm text-stone-300 leading-relaxed font-light italic">
                      {selectedAspect.meaning}
                    </p>
                  </div>

                  <div className="pt-4 flex justify-between items-center text-[9px] uppercase tracking-widest text-stone-600 font-bold">
                    <span>Harmonic Synchronicity</span>
                    <span className="text-purple-500">Active Node</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Aura Node Detail Overlay */}
        <AnimatePresence>
          {selectedAuraNode && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="absolute top-32 right-12 z-[110] w-[350px] pointer-events-auto"
            >
              <div className="bg-stone-950/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] shadow-2xl">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-[10px] text-emerald-500 uppercase tracking-[0.4em] font-bold mb-2">Neural Seeding Result</div>
                      <h3 className="text-2xl text-white font-light tracking-widest uppercase">{selectedAuraNode.label}</h3>
                    </div>
                    <button onClick={() => setSelectedAuraNode(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-stone-500 hover:text-white">
                      <X size={20}/>
                    </button>
                 </div>
                 <p className="text-sm text-stone-400 leading-relaxed italic mb-6 font-light">{selectedAuraNode.description}</p>
                 <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center hover:bg-white/10 transition-colors">
                       <span className="text-[8px] text-stone-600 uppercase tracking-widest block mb-1">Spatial-X</span>
                       <span className="text-xs text-white font-mono">{selectedAuraNode.position[0].toFixed(2)}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center hover:bg-white/10 transition-colors">
                       <span className="text-[8px] text-stone-600 uppercase tracking-widest block mb-1">Status</span>
                       <span className="text-xs text-emerald-500 font-bold">STABLE</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Soul Synthesis Reference Guide */}
        <AnimatePresence>
          {showHouseGuide && data && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[95%] max-w-[1000px] z-[120] pointer-events-auto"
            >
               <div className="bg-stone-950/95 backdrop-blur-3xl border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl p-12">
                  <div className="flex justify-between items-start mb-10">
                     <div>
                        <div className="text-[10px] text-stone-500 uppercase tracking-[0.6em] font-bold mb-3">Synthesis Engine</div>
                        <h3 className="text-4xl text-white font-light tracking-widest uppercase leading-none">Astrological Synthesis</h3>
                        <p className="text-stone-400 mt-4 text-xs tracking-wider uppercase font-medium">Putting your entire celestial blueprint together</p>
                     </div>
                     <button onClick={() => setShowHouseGuide(false)} className="p-4 hover:bg-white/5 rounded-full transition-all text-stone-500 hover:text-white">
                        <X size={28} />
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Dominant Themes */}
                    <div className="space-y-6">
                      <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                        <h4 className="text-xs uppercase tracking-widest text-emerald-400 mb-4">Core Resonance</h4>
                        <div className="space-y-4">
                           <div>
                             <span className="text-[10px] text-stone-500 block mb-1 uppercase">Primal Identity (Sun)</span>
                             <p className="text-sm text-stone-200">{data.planets.find(p => p.name === 'Sun')?.meaning || 'The solar frequency is active.'}</p>
                           </div>
                           <div>
                             <span className="text-[10px] text-stone-500 block mb-1 uppercase">Directional Intent</span>
                             <p className="text-sm text-stone-200">{data.nodes.north.meaning}</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: House Dynamics */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                      {data.houses?.map(house => (
                        <div key={house.houseNumber} className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                           <div className="flex justify-between items-start mb-3">
                             <div className="text-emerald-500 font-mono text-xl opacity-50 group-hover:opacity-100">{house.houseNumber}</div>
                             <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">{house.realmName}</span>
                           </div>
                           <p className="text-xs text-stone-300 leading-relaxed font-light italic">{house.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-4">
                    {data.aspects?.slice(0, 4).map((aspect, i) => (
                      <div key={i} className="px-5 py-3 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="text-[10px] text-stone-300 uppercase tracking-widest">{aspect.planet1} {aspect.type} {aspect.planet2}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>

      {/* Advanced Post-Processing Effects */}
      <EffectComposer>
         <Bloom 
           intensity={sceneMode === 'quantum' ? 2 : (sceneMode === 'void' ? 0.5 : 1.2)} 
           mipmapBlur 
           luminanceThreshold={0.7} 
         />
         <Noise opacity={sceneMode === 'void' ? 0.4 : 0.08} />
         <Vignette eskil={false} offset={0.2} darkness={sceneMode === 'void' ? 1.6 : 1.2} />
         {sceneMode === 'quantum' && <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.003, 0.003)} />}
      </EffectComposer>
    </>
  );
};
