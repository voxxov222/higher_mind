import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Html, Sphere, Ring, Trail, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { HolographicInfoCard } from './HolographicInfoCard';

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const PLANET_MEANINGS: Record<string, string> = {
  'Sun': 'Your core essence and ego. The "I AM" that drives your purpose and vitality.',
  'Moon': 'Your emotional landscape and subconscious needs. How you respond and nurture.',
  'Mercury': 'Your mind and communication style. How you process information and logic.',
  'Venus': 'What you love and value. Governs relationships, beauty, and social harmony.',
  'Mars': 'Your drive and assertion. How you take action, compete, and go after what you want.',
  'Jupiter': 'Expansion and abundance. Where you find growth, luck, and your higher philosophy.',
  'Saturn': 'Karma and structure. Your lessons, boundaries, responsibilities, and discipline.',
  'Uranus': 'Innovation and liberation. Where you seek uniqueness and sudden transformation.',
  'Neptune': 'Spirituality and dreams. Governs intuition, creativity, and the dissolution of boundaries.',
  'Pluto': 'Power and rebirth. Where you experience deep psychological transformation and intensity.',
  'North Node': 'Your soul\'s mission. The direction of growth and destiny in this lifetime.',
  'South Node': 'Karmic background. Talents and habits brought from past experiences.',
  'Chiron': 'The "Wounded Healer." Represents our deepest pain and our capacity to transform it into wisdom.',
  'Lilith': 'The Shadow Self. Represents repressed desires and raw, unpolluted feminine power.'
};

const HOUSE_FALLBACKS: Record<number, { name: string, description: string }> = {
  1: { name: 'Self & Appearance', description: 'The "Front Door" of your personality. How you present yourself and your initial approach to life.' },
  2: { name: 'Values & Resources', description: 'What you value, your material possessions, and your sense of self-worth and security.' },
  3: { name: 'Communication & Learning', description: 'Your everyday mind, sibling relationships, and how you process and share information.' },
  4: { name: 'Home & Roots', description: 'Foundations, family heritage, your inner world, and where you feel most safe.' },
  5: { name: 'Creativity & Joy', description: 'Self-expression, romance, fun, children, and the things that make your heart sing.' },
  6: { name: 'Work & Wellness', description: 'Daily routines, health, service, and how you manage the practical details of life.' },
  7: { name: 'Partnerships', description: 'One-on-one relationships, marriage, and how you mirror yourself through others.' },
  8: { name: 'Transformation', description: 'Deep bonds, shared resources, mystery, sex, and the process of rebirth.' },
  9: { name: 'Expansion & Philosophy', description: 'Higher learning, travel, spirituality, and your quest for meaning and Truth.' },
  10: { name: 'Career & Legacy', description: 'Your public reputation, status, and what you aim to achieve in the world.' },
  11: { name: 'Community & Hopes', description: 'Friends, networks, social causes, and your visions for the future.' },
  12: { name: 'Subconscious & Spirit', description: 'The "Invisible" world. Dreams, intuition, solitude, and universal connection.' }
};
const SIGN_COLORS: Record<string, string> = {
  'Aries': '#ef4444', 'Taurus': '#10b981', 'Gemini': '#fbbf24', 'Cancer': '#94a3b8',
  'Leo': '#f59e0b', 'Virgo': '#84cc16', 'Libra': '#f472b6', 'Scorpio': '#8b5cf6',
  'Sagittarius': '#f97316', 'Capricorn': '#475569', 'Aquarius': '#06b6d4', 'Pisces': '#6366f1'
};

const PLANET_CONFIG: Record<string, { color: string, type: string }> = {
  'Sun': { color: '#FDB813', type: 'star' },
  'Moon': { color: '#E2E8F0', type: 'fluid' },
  'Mercury': { color: '#A5A5A5', type: 'pulse' },
  'Venus': { color: '#E3BB76', type: 'harmonic' },
  'Earth': { color: '#2271B3', type: 'terra' },
  'Mars': { color: '#E27B58', type: 'energetic' },
  'Jupiter': { color: '#D39C7E', type: 'massive' },
  'Saturn': { color: '#C5AB6E', type: 'ringed' },
  'Uranus': { color: '#BBE1E4', type: 'electric' },
  'Neptune': { color: '#6081FF', type: 'fog' },
  'North Node': { color: '#10b981', type: 'karmic' },
  'South Node': { color: '#f43f5e', type: 'karmic' },
  'Chiron': { color: '#8b5cf6', type: 'healer' },
  'Lilith': { color: '#000000', type: 'void' }
};

const ZodiacRing = () => {
  return (
    <group>
      {/* Outer Glow Ring */}
      <mesh rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[100, 102, 128]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Sign Divisions */}
      {SIGN_NAMES.map((sign, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const midAngle = (i * 30 + 15) * Math.PI / 180;
        const color = SIGN_COLORS[sign] || '#ffffff';
        
        return (
          <group key={sign}>
            {/* Divider Line */}
            <mesh rotation={[0, -angle, 0]} position={[50, 0, 0]}>
              <boxGeometry args={[100, 0.1, 0.1]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
            </mesh>

            {/* Constellation Subtle Background */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.2, 0]}>
              <ringGeometry args={[75, 100, 32, 1, angle, 30 * Math.PI / 180]} />
              <meshBasicMaterial color={color} transparent opacity={0.03} side={THREE.DoubleSide} />
            </mesh>

            {/* Sign Label */}
            <Text
              position={[Math.cos(midAngle) * 88, 0, Math.sin(midAngle) * 88]}
              rotation={[-Math.PI/2, 0, -midAngle + Math.PI/2]}
              fontSize={3}
              color={color}
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.8}
            >
              {sign.toUpperCase()}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// Animated Aspect Lines
const AspectLine = ({ start, end, type }: { start: THREE.Vector3, end: THREE.Vector3, type: string }) => {
  const lineRef = useRef<THREE.Line>(null);
  
  let color = '#ffffff';
  let dashSize = 1;
  let gapSize = 0;
  
  if (type === 'trine') { color = '#34d399'; dashSize = 2; gapSize = 1; }
  else if (type === 'square') { color = '#f87171'; dashSize = 0.5; gapSize = 1; }
  else if (type === 'opposition') { color = '#fb7185'; dashSize = 3; gapSize = 3; }
  else if (type === 'sextile') { color = '#60a5fa'; dashSize = 1; gapSize = 1; }
  else if (type === 'conjunction') { color = '#fcd34d'; dashSize = 100; gapSize = 0; }
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    // Required for dashed lines to work in Three.js
    const lineDistances = new Float32Array([0, start.distanceTo(end)]);
    geo.setAttribute('lineDistance', new THREE.BufferAttribute(lineDistances, 1));
    return geo;
  }, [start, end]);

  useFrame((state) => {
    if (lineRef.current && lineRef.current.material instanceof THREE.LineDashedMaterial) {
      if (type === 'trine') {
        lineRef.current.material.dashOffset -= 0.05; // Flowing energy
      } else if (type === 'square') {
        lineRef.current.material.dashOffset += Math.sin(state.clock.elapsedTime * 10) * 0.05; // Vibrating
      } else if (type === 'opposition') {
        lineRef.current.material.dashOffset -= 0.02; 
        lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2; // Pulsing
      } else {
        lineRef.current.material.dashOffset -= 0.01;
      }
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial 
        color={color} 
        dashSize={dashSize} 
        gapSize={gapSize} 
        transparent 
        opacity={0.4} 
        linewidth={2} 
      />
    </line>
  );
};

const getPlanetRadius = (name: string) => {
  const radii: Record<string, number> = {
    'Sun': 15, 'Moon': 22, 'Mercury': 29, 'Venus': 36, 'Mars': 43,
    'Jupiter': 50, 'Saturn': 57, 'Uranus': 64, 'Neptune': 71,
    'North Node': 78, 'South Node': 78, 'Chiron': 85, 'Lilith': 92
  };
  return radii[name] || 45;
};

const AdvancedPlanet = ({ name, degree, sign, house, selected, onClick, planet }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const config = PLANET_CONFIG[name] || { color: '#ffffff', type: 'basic' };
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  // Ensure we map from 0-30 degrees within the sign wedge
  const exactDegree = signIndex * 30 + (degree % 30);
  const angle = -(exactDegree * Math.PI) / 180;
  
  const r = getPlanetRadius(name);
  const pos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      if (config.type === 'pulse') {
        groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      } else if (config.type === 'fluid') {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 2;
      }
      groupRef.current.rotation.y += 0.02;
    }
  });

  const meaning = planet?.meaning || PLANET_MEANINGS[name] || 'A celestial influence in your unique astral blueprint.';

  return (
    <group position={pos}>
      <Trail width={2} length={20} color={config.color} attenuation={(t) => t * t}>
        <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
          <Sphere args={[hovered || selected ? 1.5 : 1, 32, 32]}>
            <meshStandardMaterial 
              color={config.color} 
              emissive={config.color} 
              emissiveIntensity={hovered || selected ? 2 : 0.8} 
              wireframe={config.type === 'geometric'} 
            />
          </Sphere>
          
          <Sparkles count={config.type === 'energetic' ? 100 : 20} scale={3} size={2} color={config.color} />
          
          {(hovered || selected) && (
            <Html center distanceFactor={20} zIndexRange={[100, 0]}>
              <div className="translate-x-32 -translate-y-32">
                <HolographicInfoCard
                  title={name}
                  subtitle={`${Math.floor(degree)}° ${sign} • House ${house}`}
                  description={PLANET_MEANINGS[name] || 'A key player in your celestial drama.'}
                  meaning={meaning}
                  color={config.color}
                  type="planet"
                  visible={true}
                />
              </div>
            </Html>
          )}

          <pointLight color={config.color} intensity={selected ? 4 : 1} distance={20} />
        </group>
      </Trail>
      
      {/* Anchor Line to edge */}
      <Line 
        points={[[0,0,0], [Math.cos(angle) * (100 - r), 0, Math.sin(angle) * (100 - r)]]} 
        color={config.color} 
        transparent 
        opacity={0.1} 
      />
    </group>
  );
};

const HouseWedges = ({ houses }: { houses?: any[] }) => {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  const houseData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const num = i + 1;
      const dataHouse = houses?.find(h => h.houseNumber === num);
      const fallback = HOUSE_FALLBACKS[num];
      return {
        houseNumber: num,
        realmName: dataHouse?.realmName || fallback.name,
        description: dataHouse?.description || fallback.description
      };
    });
  }, [houses]);

  return (
    <group>
      {houseData.map((house, i) => {
        const startAngle = (i * 30) * Math.PI / 180;
        const midAngle = (i * 30 + 15) * Math.PI / 180;
        
        return (
          <group key={house.houseNumber}>
            {/* House segment line */}
            <mesh rotation={[0, -startAngle, 0]} position={[50, -0.4, 0]}>
              <boxGeometry args={[100, 0.1, 0.2]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>

            {/* Hoverable Area */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.5, 0]}
              onPointerEnter={() => setHoveredHouse(house.houseNumber)}
              onPointerLeave={() => setHoveredHouse(null)}
            >
              <ringGeometry args={[10, 75, 32, 1, startAngle, 30 * Math.PI / 180]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={hoveredHouse === house.houseNumber ? 0.05 : 0} 
                side={THREE.DoubleSide} 
              />
            </mesh>

            {/* House Number Label */}
            <Text
              position={[Math.cos(midAngle) * 40, 0.1, Math.sin(midAngle) * 40]}
              rotation={[-Math.PI / 2, 0, -midAngle + Math.PI / 2]}
              fontSize={2.5}
              color={hoveredHouse === house.houseNumber ? "#ffffff" : "#666666"}
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.5}
            >
              {house.houseNumber}
            </Text>

            {/* House Info Card */}
            {hoveredHouse === house.houseNumber && (
              <Html 
                position={[Math.cos(midAngle) * 45, 2, Math.sin(midAngle) * 45]}
                center
                distanceFactor={20}
              >
                <div className="translate-y-[-100%]">
                  <HolographicInfoCard
                    title={`House ${house.houseNumber}`}
                    subtitle={house.realmName}
                    description={house.description}
                    color="#8b5cf6"
                    type="house"
                    visible={true}
                  />
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const NatalChartAdvanced = ({ data, selectedPlanet, onPlanetClick }: any) => {
  const chartRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (chartRef.current) {
      chartRef.current.rotation.y += 0.0005; // Very slow cinematic rotation
    }
  });

  const allBodies = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.planets || []),
      data.nodes?.north && { ...data.nodes.north, name: 'North Node' },
      data.nodes?.south && { ...data.nodes.south, name: 'South Node' },
      data.points?.chiron && { ...data.points.chiron, name: 'Chiron' },
      data.points?.blackMoonLilith && { ...data.points.blackMoonLilith, name: 'Lilith' }
    ].filter(Boolean);
  }, [data]);

  return (
    <group position={[0, -5, 0]}>
      {/* Ambient Cosmic Core */}
      <pointLight color="#3b82f6" intensity={2} distance={100} />
      
      <group ref={chartRef}>
        <ZodiacRing />
        <HouseWedges houses={data?.houses} />
        
        {/* Planets and Points */}
        {allBodies.map((planet: any) => (
          <AdvancedPlanet 
            key={planet.name}
            name={planet.name}
            degree={planet.degree}
            sign={planet.sign}
            house={planet.house}
            planet={planet}
            selected={selectedPlanet?.name === planet.name}
            onClick={() => onPlanetClick(planet)}
          />
        ))}

        {/* Aspects */}
        {data?.aspects?.map((aspect: any, i: number) => {
          const p1 = allBodies.find((p: any) => p.name === aspect.planet1);
          const p2 = allBodies.find((p: any) => p.name === aspect.planet2);
          if (!p1 || !p2) return null;
          
          const getPos = (p: any) => {
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            const signIndex = signs.indexOf(p.sign);
            const exactDegree = signIndex * 30 + (p.degree % 30);
            const angle = -(exactDegree * Math.PI) / 180;
            const r = getPlanetRadius(p.name);
            return new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
          };

          return (
            <AspectLine 
              key={i} 
              start={getPos(p1)} 
              end={getPos(p2)} 
              type={aspect.type} 
            />
          );
        })}
      </group>
    </group>
  );
};
