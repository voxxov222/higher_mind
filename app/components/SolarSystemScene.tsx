import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float, Stars, Text, OrbitControls, PerspectiveCamera, Html, Ring, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { CosmicData } from '../types';

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

const AstrologicalHouses = () => {
  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const midAngle = (i * 30 + 15) * Math.PI / 180;
        
        return (
          <group key={i}>
            {/* Divider Line */}
            <mesh rotation={[0, -angle, 0]} position={[75, 0, 0]}>
               <boxGeometry args={[150, 0.02, 0.02]} />
               <meshBasicMaterial color="white" transparent opacity={0.1} />
            </mesh>

            {/* House Label */}
            <Text
              position={[Math.cos(midAngle) * 140, 0.1, Math.sin(midAngle) * 140]}
              rotation={[-Math.PI / 2, 0, -midAngle + Math.PI / 2]}
              fontSize={4}
              color="white"
              opacity={0.15}
            >
              {i + 1}
            </Text>

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
}

const Planet = ({ name, color, size, distance, speed, onSelect, active, astro }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  const elementInfo = astro?.sign ? SIGN_ELEMENTS[astro.sign] : null;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed * 0.1;
    if (groupRef.current) {
      groupRef.current.rotation.y = t;
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
                  {`${astro.sign.toUpperCase()} • H${astro.house}`}
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
}

export const SolarSystemScene: React.FC<SolarSystemSceneProps> = ({ data, onPlanetClick }) => {
  const [selectedPlanet, setSelectedPlanet] = React.useState<PlanetData | null>(null);
  const [sunHovered, setSunHovered] = React.useState(false);

  // Map astrological data to planets
  const getAstrologicalData = (name: string) => {
    if (!data) return null;
    return data.planets.find(p => p.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 70, 150]} fov={50} />
      <OrbitControls 
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
      
      <AstrologicalHouses />
      
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
            onSelect={(p) => setSelectedPlanet(p ? planets.find(item => item.name === p.name) || p : null)} 
          />
        );
      })}

      {/* Removed Global Html Panel - Now handled locally in Planet and Sun components */}
    </>
  );
};
