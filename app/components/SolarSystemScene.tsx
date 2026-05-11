import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float, Stars, Text, OrbitControls, PerspectiveCamera, Html, Ring, Sparkles, Line, Grid, Float as FloatDrei } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Info, Sparkle, BookOpen, Send, Bot, Cpu, Zap, Radio, Terminal, MousePointer2, ChevronRight, Binary } from 'lucide-react';
import { CosmicData } from '../types';
import { fetchAuraInsight } from '../services/geminiService';

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

const AstrologicalHouses = ({ data, onHouseHover }: { data: CosmicData | null; onHouseHover: (house: any) => void }) => {
  return (
    <group>
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
                opacity={0.4}
              >
                {houseNum}
              </Text>
              <Text
                position={[0, 0, 8]}
                rotation={[-Math.PI / 2, 0, -midAngle + Math.PI / 2]}
                fontSize={2.5}
                color="white"
                opacity={0.2}
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

const AspectLines = ({ data }: { data: CosmicData | null }) => {
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

        // For simplicity in 3D scene, we use the hardcoded distances from planets list
        // but we need to find them or nodes
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
        
        // Use static degrees for aspect lines to avoid "spaghetti" during animation
        const angle1 = (p1.degree * Math.PI) / 180;
        const angle2 = (p2.degree * Math.PI) / 180;

        const start = new THREE.Vector3(Math.cos(angle1) * d1, 0, Math.sin(angle1) * d1);
        const end = new THREE.Vector3(Math.cos(angle2) * d2, 0, Math.sin(angle2) * d2);

        return (
          <group key={i}>
            <Line 
              points={[start, end]} 
              color={ASPECT_COLORS[aspect.type] || '#ffffff'} 
              lineWidth={1} 
              opacity={0.15} 
              transparent 
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
  const [hovered, setHovered] = React.useState(false);

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
                  {astro && (
                    <>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-0.5">Vibration</div>
                        <div className="text-white text-xs font-bold font-mono">{astro.sign}</div>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-0.5">House</div>
                        <div className="text-white text-xs font-bold font-mono">Sector {astro.house}</div>
                      </div>
                    </>
                  )}
                  {elementInfo && (
                    <div className="col-span-2 bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-0.5">Essence</div>
                        <div className="text-white text-xs font-bold">{elementInfo.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 rounded-full overflow-hidden bg-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className="h-full"
                            style={{ backgroundColor: elementInfo.color }}
                          />
                        </div>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: elementInfo.color }} />
                      </div>
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
                  opacity={0.9}
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

export const SolarSystemScene: React.FC<SolarSystemSceneProps> = ({ data, onPlanetClick }) => {
  const [selectedPlanet, setSelectedPlanet] = React.useState<PlanetData | null>(null);
  const [sunHovered, setSunHovered] = React.useState(false);
  const [hoveredHouse, setHoveredHouse] = React.useState<any>(null);
  const [isStatic, setIsStatic] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'solar' | 'chart'>('solar');
  const [showHouseGuide, setShowHouseGuide] = React.useState(false);

  // Aura AI Agent State
  const [auraNodes, setAuraNodes] = useState<AuraVisualNode[]>([]);
  const [auraEdges, setAuraEdges] = useState<AuraVisualEdge[]>([]);
  const [isAuraOpen, setIsAuraOpen] = useState(false);
  const [auraPrompt, setAuraPrompt] = useState('');
  const [isAuraThinking, setIsAuraThinking] = useState(false);
  const [auraInsight, setAuraInsight] = useState<string | null>(null);
  const [selectedAuraNode, setSelectedAuraNode] = useState<AuraVisualNode | null>(null);

  const controlsRef = useRef<any>(null);

  const handleAuraSubmit = async () => {
    if (!auraPrompt.trim() || !data || isAuraThinking) return;
    
    setIsAuraThinking(true);
    setAuraInsight("Synchronizing with cosmic resonance frequencies...");
    
    try {
      const result = await fetchAuraInsight(auraPrompt, data);
      
      // Seed new nodes into the scene
      setAuraNodes(prev => [...prev, ...result.visualNodes].slice(-10)); // Keep last 10 nodes
      setAuraEdges(prev => [...prev, ...result.visualEdges].slice(-15));
      setAuraInsight(result.insight);
      setAuraPrompt('');
    } catch (error) {
      setAuraInsight("Neural connection unstable. Please re-initiate transmission.");
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
    return data.planets.find(p => p.name.toLowerCase() === name.toLowerCase());
  };

  const getPlanetPos = (planet: PlanetData) => {
    const astro = getAstrologicalData(planet.name);
    if (viewMode === 'chart' && astro?.sign) {
      const baseAngle = SIGN_ANGLES[astro.sign] || 0;
      const t = -((baseAngle + (astro.degree || 0)) * Math.PI) / 180;
      return new THREE.Vector3(Math.cos(t) * planet.distance, 0, Math.sin(t) * planet.distance);
    }
    return null;
  };

  useFrame(({ clock }) => {
    if (controlsRef.current) {
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

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 70, 150]} fov={50} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        maxDistance={400}
        minDistance={10}
        autoRotate={!selectedPlanet}
        autoRotateSpeed={0.5}
      />
      
      <Stars radius={400} depth={80} count={30000} factor={7} saturation={0} fade speed={1.5} />
      <Stars radius={200} depth={40} count={5000} factor={4} saturation={0.5} fade speed={0.5} />
      
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 100, 500]} />
      
      <ambientLight intensity={0.15} />
      
      <AstrologicalHouses data={data} onHouseHover={setHoveredHouse} />
      <AspectLines data={data} />

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
        opacity={0.05}
      />
      
      {/* AI Generated Aura Nodes */}
      {auraNodes.map(node => (
        <AuraNode key={node.id} node={node} onSelect={setSelectedAuraNode} />
      ))}

      {/* Aura Transmission Edges */}
      {auraEdges.map((edge, i) => {
        const sourceNode = auraNodes.find(n => n.id === edge.source);
        let targetPos: [number, number, number] = [0, 0, 0];
        
        if (edge.target === 'Sun') {
          targetPos = [0, 0, 0];
        } else {
          const targetNode = auraNodes.find(n => n.id === edge.target);
          if (targetNode) targetPos = targetNode.position;
        }

        if (sourceNode) {
          return (
            <Line 
              key={i}
              points={[new THREE.Vector3(...sourceNode.position), new THREE.Vector3(...targetPos)]}
              color={edge.color || 'white'}
              lineWidth={0.5}
              opacity={0.2}
              transparent
              dashSize={1}
              gapSize={0.5}
            />
          );
        }
        return null;
      })}

      {/* The Sun */}
      <group 
        onPointerOver={() => setSunHovered(true)}
        onPointerOut={() => setSunHovered(false)}
        onClick={() => {
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
        <Sphere args={[6, 64, 64]}>
          <meshStandardMaterial 
            color={selectedPlanet?.name === 'Sun' ? "#ffffff" : "#FDB813"} 
            emissive={selectedPlanet?.name === 'Sun' ? "#ffffff" : "#FDB813"} 
            emissiveIntensity={2} 
            roughness={0.4}
            metalness={0.6}
          />
        </Sphere>
        <pointLight intensity={4} color="#FDB813" />
        <mesh scale={[1.2, 1.2, 1.2]}>
          <sphereGeometry args={[6, 64, 64]} />
          <meshBasicMaterial color={selectedPlanet?.name === 'Sun' ? "#ffffff" : "#FDB813"} transparent opacity={0.15} />
        </mesh>

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
                opacity={0.8}
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
                <button onClick={(e) => { e.stopPropagation(); setSelectedPlanet(null); }} className="p-2 text-stone-500 hover:text-white">✕</button>
              </div>
              <p className="text-stone-200 text-sm italic leading-relaxed mb-6">
                {selectedPlanet.description}
              </p>
              <div className="pt-4 border-t border-white/10">
                 <div className="text-[9px] uppercase tracking-widest text-stone-500">Gravitational Influence</div>
                 <div className="text-white text-xs mt-1">Prime Source of Awareness</div>
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
            isBirthChartMode={viewMode === 'chart'}
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
            isBirthChartMode={viewMode === 'chart'}
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

      {/* Astro Intelligence Overlay */}
      <Html fullscreen>
        <div className="absolute top-8 left-8 z-50 flex flex-col gap-4 pointer-events-none">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-6 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] pointer-events-auto"
          >
            <div className="flex items-center gap-3 mb-1">
              <Sparkle className="text-yellow-500" size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Birth Chart Mode</span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-widest uppercase">Celestial Blueprint</h2>
            
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => setViewMode(viewMode === 'solar' ? 'chart' : 'solar')}
                className={`px-3 py-1 border rounded-full text-[9px] uppercase tracking-tighter transition-all ${viewMode === 'chart' ? 'bg-purple-500 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-white/50'}`}
              >
                {viewMode === 'chart' ? 'Birth Chart Active' : 'Enable Birth Chart'}
              </button>
              <button 
                onClick={() => setIsStatic(!isStatic)}
                className={`px-3 py-1 border rounded-full text-[9px] uppercase tracking-tighter transition-all ${isStatic ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-white/50'}`}
              >
                {isStatic ? 'Orbits Paused' : 'Pause Orbits'}
              </button>
              <button 
                onClick={() => setShowHouseGuide(!showHouseGuide)}
                className={`px-3 py-1 border rounded-full text-[9px] uppercase tracking-tighter transition-all ${showHouseGuide ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-white/50'}`}
              >
                House Meanings
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {showHouseGuide && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="max-w-[320px] p-6 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] pointer-events-auto h-[400px] overflow-y-auto custom-scrollbar"
              >
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-400">House Lexicon</h3>
                    <button onClick={() => setShowHouseGuide(false)} className="text-stone-500 hover:text-white"><X size={14}/></button>
                 </div>
                 <div className="space-y-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                         <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-emerald-500 uppercase font-bold">House {i+1}</span>
                            <span className="text-[8px] text-stone-600 font-mono tracking-tighter">{SIGN_NAMES[i]}</span>
                         </div>
                         <p className="text-[10px] text-stone-400 leading-relaxed italic">
                            {HOUSE_DESCRIPTIONS[i+1]}
                         </p>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {data?.synthesis && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="max-w-[320px] p-6 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] pointer-events-auto"
              >
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-400 mb-3">Core Resonance</h3>
                <p className="text-xs text-stone-300 leading-relaxed italic">
                  {data.synthesis.slice(0, 150)}...
                </p>
                <div className="mt-4 pt-4 border-t border-white/5">
                   <div className="text-[9px] text-stone-600 uppercase tracking-widest mb-2">Key Harmonic</div>
                   <div className="text-white text-[11px] font-medium">{data.patterns?.coreTheme || 'Integrated Consciousness'}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute top-8 right-8 z-50 pointer-events-auto flex flex-col gap-4 items-end">
          <button 
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white transition-all backdrop-blur-xl"
            onClick={() => {
              if (onPlanetClick) onPlanetClick('Birth Chart Guide', 'Exploring the houses, nodes, and aspects of your celestial blueprint.');
            }}
          >
            <BookOpen size={20} />
          </button>

          <button 
            onClick={() => setIsAuraOpen(!isAuraOpen)}
            className={`p-4 rounded-full border transition-all backdrop-blur-xl ${isAuraOpen ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-black/60 border-white/10 text-white/60 hover:text-white'}`}
          >
            <Bot size={20} />
          </button>
        </div>

        {/* Aura AI Agent Terminal */}
        <AnimatePresence>
          {isAuraOpen && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] z-50 pointer-events-auto"
            >
              <div className="bg-black/80 backdrop-blur-3xl border border-emerald-500/30 rounded-[2.5rem] overflow-hidden shadow-[0_-20px_100px_rgba(16,185,129,0.15)]">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <Terminal size={18} />
                    </div>
                    <div>
                      <div className="text-[8px] text-stone-500 uppercase tracking-widest font-bold">Neural Interface</div>
                      <h3 className="text-xl text-white font-light tracking-widest uppercase">Aura Agent OS</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] text-emerald-500/70 font-mono tracking-tighter uppercase">Sync Active</span>
                    </div>
                    <button onClick={() => setIsAuraOpen(false)} className="text-stone-500 hover:text-white transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {auraInsight && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                      <div className="flex items-center gap-2 mb-3">
                        <Cpu size={12} className="text-emerald-500" />
                        <span className="text-[9px] text-stone-500 uppercase tracking-widest">Neural Insight</span>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed italic pr-4">
                        {auraInsight}
                      </p>
                      {isAuraThinking && (
                        <div className="mt-4 flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="relative group">
                    <input 
                      type="text"
                      value={auraPrompt}
                      onChange={(e) => setAuraPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAuraSubmit()}
                      placeholder="Input command (e.g. 'Build a bridge to Saturn', 'Analyze nodes')..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 transition-all font-light"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-emerald-500 transition-colors">
                      <ChevronRight size={18} />
                    </div>
                    <button 
                      onClick={handleAuraSubmit}
                      disabled={isAuraThinking}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 rounded-xl text-black hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      <Send size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {['Trace Aspects', 'Expand Nodes', 'Neural Sync', 'Deep Space Scan'].map((tag) => (
                      <button 
                        key={tag}
                        onClick={() => setAuraPrompt(tag)}
                        className="text-[8px] uppercase tracking-widest text-stone-600 hover:text-emerald-500 transition-colors bg-white/5 px-2 py-1 rounded-md border border-white/5"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Aura Node Detail */}
        <AnimatePresence>
          {selectedAuraNode && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="absolute top-8 right-8 z-50 w-[300px] pointer-events-auto"
            >
              <div className="bg-black/90 backdrop-blur-3xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[8px] text-stone-500 uppercase tracking-widest font-bold mb-1">AI Seeding Output</div>
                      <h3 className="text-xl text-white font-light tracking-widest uppercase">{selectedAuraNode.label}</h3>
                    </div>
                    <button onClick={() => setSelectedAuraNode(null)} className="text-stone-500 hover:text-white"><X size={16}/></button>
                 </div>
                 <p className="text-xs text-stone-400 leading-relaxed italic mb-4">
                   {selectedAuraNode.description}
                 </p>
                 <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                       <span className="text-[7px] text-stone-600 uppercase block">Coord-X</span>
                       <span className="text-[10px] text-white font-mono">{selectedAuraNode.position[0]}</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                       <span className="text-[7px] text-stone-600 uppercase block">Resonance</span>
                       <span className="text-[10px] text-white font-mono">STABLE</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Html>

      {/* Removed Global Html Panel - Now handled locally in Planet and Sun components */}
    </>
  );
};
