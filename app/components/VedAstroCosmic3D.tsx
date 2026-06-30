import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetData {
  name: string;
  degree: number;
  sign: string;
}

interface VedAstroCosmic3DProps {
  planets: PlanetData[];
}

const SIGN_NUMBERS: Record<string, number> = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4,
  Leo: 5, Virgo: 6, Libra: 7, Scorpio: 8,
  Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#facc15',      // Bright Yellow
  Moon: '#f1f5f9',     // Pearl Silver
  Mars: '#ef4444',     // Crimson Red
  Mercury: '#06b6d4',  // Teal/Cyan
  Jupiter: '#f97316',  // Solar Orange
  Venus: '#f472b6',    // Rose Pink
  Saturn: '#a8a29e',   // Dusty Stone
  Rahu: '#a855f7',     // Cosmic Purple
  Ketu: '#6366f1',     // Astral Indigo
  Uranus: '#38bdf8',   // Sky Blue
  Neptune: '#3b82f6',  // Deep Blue
  Pluto: '#78716c',    // Dark Charcoal
  Ascendant: '#10b981' // Mystic Emerald
};

const PLANET_RADII: Record<string, number> = {
  Sun: 2.5,
  Moon: 3.5,
  Mercury: 4.5,
  Venus: 5.5,
  Mars: 6.5,
  Jupiter: 7.5,
  Saturn: 8.5,
  Rahu: 9.5,
  Ketu: 9.5, // Rahu & Ketu share a ring
  Uranus: 10.5,
  Neptune: 11.5,
  Pluto: 12.5,
  Ascendant: 13.5
};

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Inner 3D scene handler
const CosmicScene3D = ({ planets }: { planets: PlanetData[] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  // Slow continuous rotation to feel organic
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  const getLongitude = (p: PlanetData) => {
    const signIndex = (SIGN_NUMBERS[p.sign] || 1) - 1;
    const deg = p.degree || 0;
    return (deg > 30) ? deg : (signIndex * 30 + deg);
  };

  const processedPlanets = useMemo(() => {
    return planets.map(p => {
      const long = getLongitude(p);
      const rad = (long * Math.PI) / 180;
      const radius = PLANET_RADII[p.name] || 5;
      
      // If Rahu/Ketu, Ketu is exactly 180 degrees opposite to Rahu
      let finalRad = rad;
      if (p.name === 'Ketu') {
        const rahu = planets.find(pl => pl.name === 'Rahu');
        if (rahu) {
          finalRad = ((getLongitude(rahu) + 180) % 360) * Math.PI / 180;
        }
      }

      return {
        ...p,
        long,
        rad: finalRad,
        radius,
        x: radius * Math.cos(finalRad),
        z: radius * Math.sin(finalRad)
      };
    });
  }, [planets]);

  return (
    <group ref={groupRef}>
      {/* Outer Zodiac Constellation Rim (Radius 15) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[14.8, 15.0, 128]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* 12 Zodiac boundary tick markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 14.5 * Math.cos(angle);
        const z1 = 14.5 * Math.sin(angle);
        const x2 = 15.3 * Math.cos(angle);
        const z2 = 15.3 * Math.sin(angle);

        return (
          <line key={`tick-${i}`}>
            <bufferGeometry attach="geometry" onUpdate={(self) => {
              self.setFromPoints([
                new THREE.Vector3(x1, 0, z1),
                new THREE.Vector3(x2, 0, z2)
              ]);
            }} />
            <lineBasicMaterial attach="material" color="#ec4899" transparent opacity={0.3} />
          </line>
        );
      })}

      {/* 12 Zodiac Text Billboard Labels */}
      {ZODIAC_SIGNS.map((sign, i) => {
        // Position labels in the middle of each 30deg house sector (i.e. angle + 15 degrees)
        const angle = ((i * 30 + 15) * Math.PI) / 180;
        const radius = 16.2;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        return (
          <group key={`sign-lbl-${sign}`} position={[x, 0.2, z]}>
            <Html center distanceFactor={16}>
              <div className="px-2 py-0.5 bg-black/50 backdrop-blur-md border border-fuchsia-500/20 rounded-md text-[9px] font-mono font-bold text-fuchsia-300 uppercase tracking-widest select-none pointer-events-none whitespace-nowrap shadow-[0_0_10px_rgba(217,70,239,0.15)]">
                {sign.slice(0, 3)}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Central Cosmic Sun / Core Anchor */}
      <group position={[0, 0, 0]}>
        {/* Glow Halo */}
        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial 
            color="#facc15" 
            transparent 
            opacity={0.15} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#fbbf24" 
            emissiveIntensity={1.5} 
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Orbital paths & planetary nodes */}
      {processedPlanets.map((p) => {
        const colorHex = PLANET_COLORS[p.name] || '#ffffff';
        const isHovered = hoveredPlanet === p.name;
        const finalColor = new THREE.Color(colorHex).multiplyScalar(isHovered ? 2.5 : 1.2);
        const planetRadius = isHovered ? 0.35 : 0.22;

        return (
          <group key={`node-${p.name}`}>
            {/* Concentric orbital path ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[p.radius - 0.02, p.radius + 0.02, 128]} />
              <meshBasicMaterial 
                color={colorHex} 
                transparent 
                opacity={isHovered ? 0.25 : 0.07} 
                side={THREE.DoubleSide} 
              />
            </mesh>

            {/* Glowing connecting line from core */}
            <line>
              <bufferGeometry attach="geometry" onUpdate={(self) => {
                self.setFromPoints([
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(p.x, 0, p.z)
                ]);
              }} />
              <lineBasicMaterial 
                attach="material" 
                color={colorHex} 
                transparent 
                opacity={isHovered ? 0.4 : 0.08} 
                linewidth={1} 
              />
            </line>

            {/* Planet Body */}
            <group position={[p.x, 0, p.z]}>
              {/* Outer Glow Shield */}
              <mesh>
                <sphereGeometry args={[planetRadius * 1.8, 32, 32]} />
                <meshBasicMaterial 
                  color={finalColor} 
                  transparent 
                  opacity={isHovered ? 0.5 : 0.15} 
                  blending={THREE.AdditiveBlending} 
                  depthWrite={false} 
                />
              </mesh>

              {/* Main Sphere */}
              <mesh
                onPointerOver={(e) => { e.stopPropagation(); setHoveredPlanet(p.name); }}
                onPointerOut={(e) => { e.stopPropagation(); setHoveredPlanet(null); }}
              >
                <sphereGeometry args={[planetRadius, 32, 32]} />
                <meshStandardMaterial 
                  color={finalColor} 
                  emissive={finalColor} 
                  emissiveIntensity={isHovered ? 2.0 : 0.8}
                  roughness={0.2}
                />
              </mesh>

              {/* Holographic Tooltip */}
              {isHovered && (
                <Html center distanceFactor={14}>
                  <div className="bg-[#050510]/95 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-2xl w-48 text-left pointer-events-none transform translate-x-6 -translate-y-6">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: colorHex, color: colorHex }} />
                      <span className="text-white font-bold text-xs uppercase tracking-wider">{p.name}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono space-y-0.5">
                      <div>Rasi Sign: <span className="text-cyan-300 font-bold">{p.sign}</span></div>
                      <div>Longitude: <span className="text-fuchsia-300 font-bold">{p.degree.toFixed(2)}°</span></div>
                      <div>Absolute: <span className="text-amber-300 font-bold">{p.long.toFixed(2)}°</span></div>
                    </div>
                  </div>
                </Html>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
};

export const VedAstroCosmic3D: React.FC<VedAstroCosmic3DProps> = ({ planets }) => {
  if (!planets || planets.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-stone-400 font-mono text-xs uppercase tracking-widest bg-black/40 border border-white/5 rounded-2xl">
        Waiting for cosmic alignments...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative min-h-[300px] border border-cyan-500/10 bg-black/60 rounded-3xl overflow-hidden group">
      {/* HUD Info Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none font-mono">
        <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">SIDEREAL SPACE MODEL</h4>
        <p className="text-[8px] text-stone-400 mt-0.5">Drag to rotate • Scroll to zoom</p>
      </div>

      <Canvas camera={{ position: [0, 18, 22], fov: 50 }}>
        <color attach="background" args={['#020208']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20]} intensity={1.5} color="#ffffff" />
        
        <Stars radius={100} depth={50} count={2500} factor={6} saturation={0.5} fade speed={1.5} />
        
        <CosmicScene3D planets={planets} />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1} // Prevent going below horizon
          minDistance={8}
          maxDistance={32}
        />
      </Canvas>
    </div>
  );
};
