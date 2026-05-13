import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Html, Sphere, Ring, Trail, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
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

const AdvancedPlanet = ({ name, degree, sign, house, selected, onClick }: any) => {
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
              <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] translate-x-8 -translate-y-8 pointer-events-none whitespace-nowrap">
                <div className="text-[10px] uppercase tracking-widest" style={{ color: config.color }}>{name}</div>
                <div className="text-white font-mono text-sm">{Math.floor(degree)}° {sign}</div>
                <div className="text-stone-400 text-[10px]">House {house}</div>
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
        
        {/* Planets and Points */}
        {allBodies.map((planet: any) => (
          <AdvancedPlanet 
            key={planet.name}
            name={planet.name}
            degree={planet.degree}
            sign={planet.sign}
            house={planet.house}
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
