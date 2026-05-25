import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Sun, Moon, Zap, Sparkles as SparklesIcon, Compass, Activity, 
  Search, Send, Radio, Info, Eye, EyeOff, Navigation, ChevronRight, 
  HelpCircle, RefreshCw, BarChart2, Shield, Calendar, MapPin, Fingerprint
} from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

interface CelestialBlueprintProps {
  data: any;
  setActiveTab?: (tab: string) => void;
}

// ==========================================
// 3D SCENE LEVEL 1: EARTH ORBITAL HOLOGRAPH
// ==========================================
const EarthHolograph = ({ sacredGeometryOn, sacredGeometryPattern, locationCoords }: any) => {
  const earthRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const geoRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (earthRef.current) {
      earthRef.current.rotation.y = t * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = t * 0.13;
      cloudsRef.current.rotation.x = Math.sin(t * 0.05) * 0.05;
    }
    if (auraRef.current) {
      auraRef.current.scale.setScalar(1.25 + Math.sin(t * 1.5) * 0.02);
    }
    if (geoRef.current) {
      const breathingFactor = Math.sin(t * (2 * Math.PI / 5.28)) * 0.08;
      const microVibration = Math.sin(t * 528) * 0.015;
      const scaleVal = 1 + breathingFactor + microVibration;
      geoRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  return (
    <group>
      {/* Atmosphere Aura Glow */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={0.08} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Earth Holographic Base */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial 
          color="#06b6d4" 
          emissive="#0891b2"
          emissiveIntensity={0.8}
          wireframe
          transparent 
          opacity={0.4} 
        />
      </mesh>

      {/* Atmospheric Cloud Simulation Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshStandardMaterial 
          color="#38bdf8" 
          wireframe
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Lat/Long Grid coordinates */}
      <gridHelper args={[8, 16, '#06b6d4', '#1e293b']} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} opacity={0.15} transparent />

      {/* YOU ARE HERE Marker */}
      <group position={[1.4, 1.2, 1.2]}>
        <Sphere args={[0.08, 16, 16]}>
          <meshBasicMaterial color="#ef4444" />
        </Sphere>
        <Html distanceFactor={10}>
          <div className="flex flex-col items-center select-none pointer-events-none">
            <div className="animate-ping w-3 h-3 rounded-full bg-red-500 absolute duration-1000" />
            <div className="bg-red-500/90 border border-red-400/40 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-[0_0_10px_rgba(239,68,68,0.7)] mt-2">
              YOU ARE HERE
            </div>
          </div>
        </Html>
      </group>

      {/* Aurora overlay fields */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.5, 0.05, 8, 48]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Sacred Geometry Overlay */}
      {sacredGeometryOn && (
        <group ref={geoRef} rotation={[0, 0, 0]}>
          {sacredGeometryPattern === 'flower_of_life' && (
            <group>
              {/* Overlapping grid circles for Earth (Seed of life) */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const cx = Math.cos(angle) * 2.0;
                const cy = Math.sin(angle) * 2.0;
                const circlePoints = Array.from({ length: 64 }).map((_, idx) => {
                  const theta = (idx / 64) * Math.PI * 2;
                  return [cx + Math.cos(theta) * 2.0, cy + Math.sin(theta) * 2.0, 0] as [number, number, number];
                });
                return (
                  <Line 
                    key={`earth-seed-${i}`} 
                    points={circlePoints} 
                    color="#fbbf24" 
                    lineWidth={0.6} 
                    transparent 
                    opacity={0.3} 
                  />
                );
              })}
              {/* Outermost boundary ring */}
              <Line 
                points={Array.from({ length: 64 }).map((_, i) => {
                  const theta = (i / 64) * Math.PI * 2;
                  return [Math.cos(theta) * 4.0, Math.sin(theta) * 4.0, 0] as [number, number, number];
                })} 
                color="#fbbf24" 
                lineWidth={1} 
                transparent 
                opacity={0.4} 
              />
            </group>
          )}

          {sacredGeometryPattern === 'metatrons_cube' && (
            <group>
              {/* Metatron's 2D layout around core Earth */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle1 = (i / 12) * Math.PI * 2;
                const angle2 = (((i + 5) % 12) / 12) * Math.PI * 2;
                const p1 = [Math.cos(angle1) * 3.5, Math.sin(angle1) * 3.5, 0] as [number, number, number];
                const p2 = [Math.cos(angle2) * 3.5, Math.sin(angle2) * 3.5, 0] as [number, number, number];
                return (
                  <group key={`metatron-earth-${i}`}>
                    <Line 
                      points={[p1, p2]} 
                      color="#c084fc" 
                      lineWidth={0.5} 
                      transparent 
                      opacity={0.25} 
                    />
                    <Line 
                      points={[[0, 0, 0], p1]} 
                      color="#f43f5e" 
                      lineWidth={0.4} 
                      transparent 
                      opacity={0.2} 
                    />
                  </group>
                );
              })}
            </group>
          )}

          {sacredGeometryPattern === 'vector_equilibrium' && (
            <group>
              {/* Vector matrix lines around spherical core */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const x = Math.cos(angle) * 3.2;
                const y = Math.sin(angle) * 3.2;
                return (
                  <Line 
                    key={`ve-earth-${i}`}
                    points={[[0, 0, 0], [x, y, 0]]} 
                    color="#06b6d4" 
                    lineWidth={0.7} 
                    transparent 
                    opacity={0.45} 
                  />
                );
              })}
              <Line 
                points={Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  return [Math.cos(angle) * 3.2, Math.sin(angle) * 3.2, 0] as [number, number, number];
                })}
                color="#06b6d4"
                lineWidth={0.8}
                transparent
                opacity={0.3}
              />
            </group>
          )}

          {sacredGeometryPattern === 'sri_yantra' && (
            <group>
              {/* Overlapping triangular matrices */}
              {Array.from({ length: 3 }).map((_, i) => {
                const size = 3.5 - i * 0.7;
                return (
                  <group key={`sri-earth-${i}`}>
                    {/* Up triangle */}
                    <Line 
                      points={[[0, size, 0], [size * 0.86, -size * 0.5, 0], [-size * 0.86, -size * 0.5, 0], [0, size, 0]]} 
                      color="#fbbf24" 
                      lineWidth={0.6} 
                      transparent 
                      opacity={0.3} 
                    />
                    {/* Down triangle */}
                    <Line 
                      points={[[0, -size, 0], [size * 0.86, size * 0.5, 0], [-size * 0.86, size * 0.5, 0], [0, -size, 0]]} 
                      color="#22c55e" 
                      lineWidth={0.6} 
                      transparent 
                      opacity={0.3} 
                    />
                  </group>
                );
              })}
            </group>
          )}
        </group>
      )}
    </group>
  );
};


// ==========================================
// 3D SCENE LEVEL 2: SOLAR SYSTEM ORBITALS
// ==========================================
const SolarSystemHolograph = ({ timeDrift, sacredGeometryOn, sacredGeometryPattern }: any) => {
  const sunRef = useRef<THREE.Mesh>(null!);
  const geoRef = useRef<THREE.Group>(null!);
  
  // Real-time planetary parameters
  const planets = useMemo(() => [
    { name: 'Mercury', color: '#94a3b8', r: 1.5, speed: 2.1, size: 0.1 },
    { name: 'Venus', color: '#fef08a', r: 2.2, speed: 1.5, size: 0.18 },
    { name: 'Earth', color: '#06b6d4', r: 3.1, speed: 1.0, size: 0.2 },
    { name: 'Mars', color: '#f87171', r: 4.0, speed: 0.8, size: 0.15 },
    { name: 'Jupiter', color: '#fdba74', r: 5.5, speed: 0.5, size: 0.4 },
    { name: 'Saturn', color: '#fde047', r: 7.0, speed: 0.3, size: 0.35, rings: true }
  ], []);

  // Track coordinates of every planet per frame for geometric synchronization
  const [positions, setPositions] = useState<[number, number, number][]>(() => planets.map(p => [p.r, 0, 0]));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y = t * 0.05;
    }
    
    // Compute current positions
    const newPositions = planets.map((p) => {
      const orbitalPeriod = p.speed * (1 + timeDrift * 0.005);
      const positionAngle = t * orbitalPeriod * 0.3;
      return [Math.cos(positionAngle) * p.r, 0, Math.sin(positionAngle) * p.r] as [number, number, number];
    });
    setPositions(newPositions);

    if (geoRef.current) {
      const breathingFactor = Math.sin(t * (2 * Math.PI / 5.28)) * 0.08;
      const microVibration = Math.sin(t * 528) * 0.015;
      const scaleVal = 1 + breathingFactor + microVibration;
      geoRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  return (
    <group>
      {/* Glowing Star Hub */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <pointLight color="#f59e0b" intensity={3} distance={20} />

      {/* Orbit Rings */}
      {planets.map((planet, idx) => {
        const points = Array.from({ length: 64 }).map((_, i) => {
          const theta = (i / 64) * Math.PI * 2;
          return [Math.cos(theta) * planet.r, 0, Math.sin(theta) * planet.r];
        }) as [number, number, number][];

        return (
          <Line 
            key={`orbit-path-${idx}`}
            points={points} 
            color={planet.color} 
            lineWidth={0.5} 
            transparent 
            opacity={0.15} 
          />
        );
      })}

      {/* Orbiting Planetary Spheres */}
      {planets.map((planet, idx) => {
        const pos = positions[idx];
        if (!pos) return null;
        return (
          <group key={`planet-sphere-${idx}`} position={pos}>
            <Sphere args={[planet.size, 16, 16]}>
              <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.5} />
            </Sphere>
            
            {planet.rings && (
              <mesh rotation={[Math.PI / 2.3, 0, 0]}>
                <ringGeometry args={[planet.size * 1.5, planet.size * 2.3, 32]} />
                <meshBasicMaterial color={planet.color} side={THREE.DoubleSide} transparent opacity={0.3} />
              </mesh>
            )}

            <Html distanceFactor={12}>
              <div className="font-mono text-[7px] text-stone-400 bg-black/80 px-1 py-0.5 rounded border border-white/10 uppercase tracking-widest whitespace-nowrap">
                {planet.name}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Alignment Aspect Lines for Solar Sync */}
      <Line 
        key="sync-aspect-line-1"
        points={[positions[2] || [0,0,0], positions[3] || [0,0,0]]} 
        color="#10b981" 
        lineWidth={0.7} 
        transparent 
        opacity={0.25} 
      />
      <Line 
        key="sync-aspect-line-2"
        points={[[0, 0, 0], positions[2] || [0,0,0]]} 
        color="#fbbf24" 
        lineWidth={0.7} 
        transparent 
        opacity={0.3} 
      />

      {/* Sacred Geometry alignment overlays */}
      {sacredGeometryOn && (
        <group ref={geoRef}>
          {sacredGeometryPattern === 'flower_of_life' && (
            <group>
              {/* 1. Concentric Flower Rings */}
              {planets.map((planet, i) => {
                const circlePoints = Array.from({ length: 64 }).map((_, idx) => {
                  const theta = (idx / 64) * Math.PI * 2;
                  return [Math.cos(theta) * planet.r, 0, Math.sin(theta) * planet.r];
                }) as [number, number, number][];
                return (
                  <Line 
                    key={`sun-flower-ring-${i}`} 
                    points={circlePoints} 
                    color="#fbbf24" 
                    lineWidth={0.8} 
                    transparent 
                    opacity={0.35} 
                  />
                );
              })}

              {/* 2. Seed of life interlocking boundary circles at Venus radius */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const cx = Math.cos(angle) * 2.2;
                const cz = Math.sin(angle) * 2.2;
                const circlePoints = Array.from({ length: 64 }).map((_, idx) => {
                  const theta = (idx / 64) * Math.PI * 2;
                  return [cx + Math.cos(theta) * 2.2, 0, cz + Math.sin(theta) * 2.2];
                }) as [number, number, number][];
                return (
                  <Line 
                    key={`seed-ring-${i}`} 
                    points={circlePoints} 
                    color="#fbbf24" 
                    lineWidth={0.6} 
                    transparent 
                    opacity={0.2} 
                  />
                );
              })}

              {/* 3. Orbit-Aligned Flower circles centered on each planet! */}
              {planets.map((planet, i) => {
                const pos = positions[i];
                if (!pos) return null;
                const rad = planet.r * 0.7;
                const circlePoints = Array.from({ length: 64 }).map((_, idx) => {
                  const theta = (idx / 64) * Math.PI * 2;
                  return [pos[0] + Math.cos(theta) * rad, 0, pos[2] + Math.sin(theta) * rad];
                }) as [number, number, number][];
                return (
                  <Line 
                    key={`planet-flower-ring-${i}`} 
                    points={circlePoints} 
                    color="#34d399" 
                    lineWidth={0.8} 
                    transparent 
                    opacity={0.3} 
                  />
                );
              })}
            </group>
          )}

          {sacredGeometryPattern === 'metatrons_cube' && (
            <group>
              {/* Sun concentric grids */}
              {Array.from({ length: 4 }).map((_, ringIdx) => {
                const rad = 0.5 + ringIdx * 0.4;
                const circlePoints = Array.from({ length: 48 }).map((_, idx) => {
                  const theta = (idx / 48) * Math.PI * 2;
                  return [Math.cos(theta) * rad, 0, Math.sin(theta) * rad];
                }) as [number, number, number][];
                return (
                  <Line 
                    key={`metatron-center-${ringIdx}`} 
                    points={circlePoints} 
                    color="#a855f7" 
                    lineWidth={0.5} 
                    transparent 
                    opacity={0.15} 
                  />
                );
              })}

              {/* Planet node circles */}
              {planets.map((planet, i) => {
                const pos = positions[i];
                if (!pos) return null;
                const circlePoints = Array.from({ length: 32 }).map((_, idx) => {
                  const theta = (idx / 32) * Math.PI * 2;
                  return [pos[0] + Math.cos(theta) * 0.4, 0, pos[2] + Math.sin(theta) * 0.4];
                }) as [number, number, number][];
                return (
                  <Line 
                    key={`metatron-planet-node-${i}`} 
                    points={circlePoints} 
                    color={planet.color} 
                    lineWidth={0.8} 
                    transparent 
                    opacity={0.4} 
                  />
                );
              })}

              {/* Outer boundary circles */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const ox = Math.cos(angle) * 7.5;
                const oz = Math.sin(angle) * 7.5;
                const circlePoints = Array.from({ length: 32 }).map((_, idx) => {
                  const theta = (idx / 32) * Math.PI * 2;
                  return [ox + Math.cos(theta) * 0.5, 0, oz + Math.sin(theta) * 0.5];
                }) as [number, number, number][];
                return (
                  <Line 
                    key={`metatron-outer-node-${i}`} 
                    points={circlePoints} 
                    color="#e9d5ff" 
                    lineWidth={0.6} 
                    transparent 
                    opacity={0.3} 
                  />
                );
              })}

              {/* Sun-to-planet vectors */}
              {planets.map((planet, i) => {
                const pos = positions[i];
                if (!pos) return null;
                return (
                  <Line 
                    key={`sun-to-planet-${i}`} 
                    points={[[0, 0, 0], pos]} 
                    color="#fbbf24" 
                    lineWidth={0.7} 
                    transparent 
                    opacity={0.4} 
                  />
                );
              })}

              {/* Planet-to-planet interconnects (full grid) */}
              {planets.map((p1, i) => {
                const pos1 = positions[i];
                if (!pos1) return null;
                return planets.slice(i + 1).map((p2, j) => {
                  const idx = i + 1 + j;
                  const pos2 = positions[idx];
                  if (!pos2) return null;
                  return (
                    <Line 
                      key={`p1-p2-link-${i}-${idx}`} 
                      points={[pos1, pos2]} 
                      color="#38bdf8" 
                      lineWidth={0.4} 
                      transparent 
                      opacity={0.25} 
                    />
                  );
                });
              })}

              {/* External Hexagons linking outer points */}
              {Array.from({ length: 6 }).map((_, i) => {
                const a1 = (i / 6) * Math.PI * 2;
                const a2 = (((i + 1) % 6) / 6) * Math.PI * 2;
                const x1 = Math.cos(a1) * 7.5;
                const z1 = Math.sin(a1) * 7.5;
                const x2 = Math.cos(a2) * 7.5;
                const z2 = Math.sin(a2) * 7.5;
                return (
                  <Line 
                    key={`outer-hex-line-${i}`} 
                    points={[[x1, 0, z1], [x2, 0, z2]]} 
                    color="#c084fc" 
                    lineWidth={0.5} 
                    transparent 
                    opacity={0.2} 
                  />
                );
              })}

              {/* Connect planets to boundaries */}
              {planets.map((p, i) => {
                const pos = positions[i];
                if (!pos) return null;
                const outerA1 = (i / 6) * Math.PI * 2;
                const outerA2 = (((i + 1) % 6) / 6) * Math.PI * 2;
                const ox1 = Math.cos(outerA1) * 7.5;
                const oz1 = Math.sin(outerA1) * 7.5;
                const ox2 = Math.cos(outerA2) * 7.5;
                const oz2 = Math.sin(outerA2) * 7.5;
                return (
                  <group key={`planet-ground-${i}`}>
                    <Line 
                      points={[pos, [ox1, 0, oz1]]} 
                      color="#fbbf24" 
                      lineWidth={0.4} 
                      transparent 
                      opacity={0.2} 
                    />
                    <Line 
                      points={[pos, [ox2, 0, oz2]]} 
                      color="#fbbf24" 
                      lineWidth={0.4} 
                      transparent 
                      opacity={0.2} 
                    />
                  </group>
                );
              })}
            </group>
          )}

          {sacredGeometryPattern === 'vector_equilibrium' && (
            <group>
              {planets.map((p, i) => {
                const pos = positions[i];
                if (!pos) return null;
                return (
                  <group key={`ve-vec-${i}`}>
                    <Line 
                      points={[[0, 0, 0], pos]} 
                      color="#f43f5e" 
                      lineWidth={0.8} 
                      transparent 
                      opacity={0.45} 
                    />
                    <Line 
                      points={[pos, [0, 3.5, 0]]} 
                      color="#fda4af" 
                      lineWidth={0.5} 
                      transparent 
                      opacity={0.3} 
                    />
                    <Line 
                      points={[pos, [0, -3.5, 0]]} 
                      color="#fda4af" 
                      lineWidth={0.5} 
                      transparent 
                      opacity={0.3} 
                    />
                  </group>
                );
              })}
              <Sphere args={[0.1, 16, 16]} position={[0, 3.5, 0]}>
                <meshBasicMaterial color="#f43f5e" />
              </Sphere>
              <Sphere args={[0.1, 16, 16]} position={[0, -3.5, 0]}>
                <meshBasicMaterial color="#f43f5e" />
              </Sphere>
            </group>
          )}

          {sacredGeometryPattern === 'sri_yantra' && (
            <group>
              {Array.from({ length: 4 }).map((_, i) => {
                const offset = (i * Math.PI) / 4;
                const rTop = 5.0 - i * 0.8;
                const u1 = [Math.cos(offset) * rTop, 0, Math.sin(offset) * rTop];
                const u2 = [Math.cos(offset + (Math.PI * 2 / 3)) * rTop, 0, Math.sin(offset + (Math.PI * 2 / 3)) * rTop];
                const u3 = [Math.cos(offset + (Math.PI * 4 / 3)) * rTop, 0, Math.sin(offset + (Math.PI * 4 / 3)) * rTop];
                
                const dOffset = offset + Math.PI;
                const d1 = [Math.cos(dOffset) * rTop, 0, Math.sin(dOffset) * rTop];
                const d2 = [Math.cos(dOffset + (Math.PI * 2 / 3)) * rTop, 0, Math.sin(dOffset + (Math.PI * 2 / 3)) * rTop];
                const d3 = [Math.cos(dOffset + (Math.PI * 4 / 3)) * rTop, 0, Math.sin(dOffset + (Math.PI * 4 / 3)) * rTop];
                
                return (
                  <group key={`sri-yantra-${i}`}>
                    <Line 
                      points={[u1, u2, u3, u1]} 
                      color="#22c55e" 
                      lineWidth={0.7} 
                      transparent 
                      opacity={0.25} 
                    />
                    <Line 
                      points={[d1, d2, d3, d1]} 
                      color="#06b6d4" 
                      lineWidth={0.7} 
                      transparent 
                      opacity={0.25} 
                    />
                  </group>
                );
              })}
            </group>
          )}
        </group>
      )}
    </group>
  );
};

// Helper component for planetary movement in Fiber
const MovingPlanet = ({ planet, orbitalPeriod }: any) => {
  const planetRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const positionAngle = t * orbitalPeriod * 0.3;
    if (planetRef.current) {
      planetRef.current.position.x = Math.cos(positionAngle) * planet.r;
      planetRef.current.position.z = Math.sin(positionAngle) * planet.r;
    }
  });

  return (
    <group ref={planetRef}>
      <Sphere args={[planet.size, 16, 16]}>
        <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.5} />
      </Sphere>
      
      {/* Rings representation for Saturn */}
      {planet.rings && (
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[planet.size * 1.5, planet.size * 2.3, 32]} />
          <meshBasicMaterial color={planet.color} side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      )}

      {/* HTML Tag for Planet */}
      <Html distanceFactor={12}>
        <div className="font-mono text-[7px] text-stone-400 bg-black/80 px-1 py-0.5 rounded border border-white/10 uppercase tracking-widest whitespace-nowrap">
          {planet.name}
        </div>
      </Html>
    </group>
  );
};


// ==========================================
// 3D SCENE LEVEL 3: GALACTIC CORE BLUEPRINT
// ==========================================
const GalacticHolograph = ({ timeDrift, sacredGeometryOn }: any) => {
  const systemRef = useRef<THREE.Group>(null!);
  const geoRef = useRef<THREE.Group>(null!);

  // Generate spiral galaxy particles
  const particles = useMemo(() => {
    const arr = [];
    const numArms = 2;
    for (let i = 0; i < 800; i++) {
      const distance = Math.pow(Math.random(), 2.5) * 8; // Dense core
      const angle = (i / 800) * Math.PI * 2 * 3; // Twist
      const armOffset = (i % numArms) * (Math.PI * 2 / numArms);
      const x = Math.cos(angle + armOffset) * distance + (Math.random() - 0.5) * 0.3;
      const z = Math.sin(angle + armOffset) * distance + (Math.random() - 0.5) * 0.3;
      const y = (Math.random() - 0.5) * 0.4 * (1 - (distance / 8)); // Flattened thickness
      
      arr.push({ x, y, z, size: Math.random() * 0.08 + 0.02 });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (systemRef.current) {
      systemRef.current.rotation.y = t * 0.05 + (timeDrift * 0.0005);
    }
    if (geoRef.current) {
      const breathingFactor = Math.sin(t * (2 * Math.PI / 5.28)) * 0.08;
      const microVibration = Math.sin(t * 528) * 0.015;
      const scaleVal = 1 + breathingFactor + microVibration;
      geoRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  return (
    <group ref={systemRef}>
      {/* Glowing supermassive black hole at core */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Draw stars */}
      {particles.map((p, idx) => (
        <mesh key={idx} position={[p.x, p.y, p.z]}>
          <boxGeometry args={[p.size, p.size, p.size]} />
          <meshBasicMaterial color={idx % 3 === 0 ? '#38bdf8' : (idx % 3 === 1 ? '#e879f9' : '#ffffff')} />
        </mesh>
      ))}

      {/* Solar system vector indicator */}
      <group position={[4.1, 0.1, -1.8]}>
        <Sphere args={[0.15, 16, 16]}>
          <meshBasicMaterial color="#faff00" />
        </Sphere>
        <Line 
          points={[[0, 0, 0], [0, 1.2, 0]]} 
          color="#fbbf24" 
          lineWidth={0.8} 
        />
        <Html distanceFactor={10}>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-stone-200 bg-stone-900 border border-amber-500/50 px-1 py-0.5 rounded shadow-[0_0_8px_rgba(251,191,36,0.5)] uppercase tracking-wide">
              Sol (Orion Arm)
            </span>
          </div>
        </Html>
      </group>

      {/* Rotating Sacred spirals */}
      {sacredGeometryOn && (
        <group ref={geoRef} rotation={[Math.PI / 2, 0, 0]}>
          <Line 
            points={Array.from({ length: 150 }).map((_, i) => {
              const theta = (i / 150) * Math.PI * 12;
              const r = Math.pow(theta, 0.7) * 0.7;
              return [Math.cos(theta) * r, Math.sin(theta) * r, 0];
            })} 
            color="#fbbf24" 
            lineWidth={0.8} 
            transparent 
            opacity={0.3} 
          />
        </group>
      )}
    </group>
  );
};


// ==========================================
// 3D SCENE LEVEL 4: OBSERVABLE UNIVERSE NETWORK
// ==========================================
const UniverseHolograph = ({ sacredGeometryOn }: any) => {
  const rotationRef = useRef<THREE.Group>(null!);
  const geoRef = useRef<THREE.Group>(null!);

  // Universe galaxy nodes
  const galaxies = useMemo(() => {
    const arr = [];
    const names = ['Virgo Cluster', 'Great Attractor', 'Hydra Supercluster', 'Coma Wall', 'Perseus-Pisces', 'Shapley Supercluster', 'Vega Quad'];
    for (let i = 0; i < 40; i++) {
      const radius = 2 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      arr.push({
        x, y, z, 
        name: i < names.length ? names[i] : `Cluster Node ${100 + i}`,
        size: Math.random() * 0.15 + 0.05
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (rotationRef.current) {
      rotationRef.current.rotation.y = t * 0.03;
      rotationRef.current.rotation.x = Math.sin(t * 0.02) * 0.05;
    }
    if (geoRef.current) {
      const breathingFactor = Math.sin(t * (2 * Math.PI / 5.28)) * 0.08;
      const microVibration = Math.sin(t * 528) * 0.015;
      const scaleVal = 1 + breathingFactor + microVibration;
      geoRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  return (
    <group ref={rotationRef}>
      {/* Network web lines connecting nodes */}
      {galaxies.slice(0, 25).map((node, i) => {
        // Connect to nearest 2 nodes
        const next1 = galaxies[(i + 1) % galaxies.length];
        const next2 = galaxies[(i + 4) % galaxies.length];
        return (
          <group key={`mesh-line-${i}`}>
            <Line 
              points={[[node.x, node.y, node.z], [next1.x, next1.y, next1.z]]} 
              color="#4ade80" 
              lineWidth={0.5} 
              transparent 
              opacity={0.15} 
            />
            <Line 
              points={[[node.x, node.y, node.z], [next2.x, next2.y, next2.z]]} 
              color="#e879f9" 
              lineWidth={0.5} 
              transparent 
              opacity={0.15} 
            />
          </group>
        );
      })}

      {/* Observable nodes */}
      {galaxies.map((g, idx) => (
        <group key={idx} position={[g.x, g.y, g.z]}>
          <Sphere args={[g.size, 8, 8]}>
            <meshBasicMaterial 
              color={idx % 2 === 0 ? '#10b981' : '#a855f7'} 
              transparent 
              opacity={0.7} 
            />
          </Sphere>
        </group>
      ))}

      {/* Local Group / Milky Way Universal Vector Pointer */}
      <group position={[0.5, 1.2, -1.0]}>
        <Sphere args={[0.2, 16, 16]}>
          <meshBasicMaterial color="#ec4899" />
        </Sphere>
        <Html distanceFactor={10}>
          <div className="bg-stone-900/90 border border-pink-500/50 p-1 rounded-md text-[6px] font-mono shadow-[0_0_12px_rgba(236,72,153,0.6)] whitespace-nowrap">
            MILKY WAY (YOU ARE HERE)
          </div>
        </Html>
      </group>

      {/* Sacred Metatron Grid structure */}
      {sacredGeometryOn && (
        <group ref={geoRef}>
          {galaxies.slice(0, 12).map((g, idx) => (
            <Line 
              key={`g-g-${idx}`}
              points={[[0, 0, 0], [g.x, g.y, g.z]]} 
              color="#fbbf24" 
              lineWidth={0.4} 
              transparent 
              opacity={0.12} 
            />
          ))}
        </group>
      )}
    </group>
  );
};


// ==========================================
// CONSTELLATION INSTRUCTOR VISUALS
// ==========================================
const ConstellationInstuctor = ({ visible, currentConstellation }: any) => {
  if (!visible) return null;

  // Build the nodes for chosen Constellation
  let stars: [number, number, number][];
  let lines: [number, number, number][];

  if (currentConstellation === 'Orion') {
    stars = [
      [0, 2, 0],    // Betelgeuse
      [1.5, 1.8, 0.2], // Meissa
      [-1.5, 1.5, -0.2], // Bellatrix
      [-0.4, 0, 0],  // Alnilam
      [0.4, 0, 0],   // Alnitak
      [-1.2, 0, 0],  // Mintaka
      [1.2, -2, 0.4], // Saiph
      [-1.2, -2.1, -0.5] // Rigel
    ];
    lines = [
      // Body outer skeleton
      [0, 2, 0], [-1.5, 1.5, -0.2],
      [-1.5, 1.5, -0.2], [-1.2, 0, 0],
      [-1.2, 0, 0], [-1.2, -2.1, -0.5],
      [0, 2, 0], [1.5, 1.8, 0.2],
      [1.5, 1.8, 0.2], [0.4, 0, 0],
      [0.4, 0, 0], [1.2, -2, 0.4],
      // Belt links
      [-1.2, 0, 0], [-0.4, 0, 0],
      [-0.4, 0, 0], [0.4, 0, 0]
    ];
  } else if (currentConstellation === 'UrsaMajor') {
    stars = [
      [-2, 1.5, 0], [-1, 1.2, 0.2], [0, 0.8, -0.1], [1, 0.9, 0],
      [1.2, -0.2, 0.3], [2.5, -0.1, -0.2], [2.2, 1, 0.1]
    ];
    lines = [
      [-2, 1.5, 0], [-1, 1.2, 0.2],
      [-1, 1.2, 0.2], [0, 0.8, -0.1],
      [0, 0.8, -0.1], [1, 0.9, 0],
      [1, 0.9, 0], [1.2, -0.2, 0.3],
      [1.2, -0.2, 0.3], [2.5, -0.1, -0.2],
      [2.5, -0.1, -0.2], [2.2, 1, 0.1],
      [2.2, 1, 0.1], [1, 0.9, 0]
    ];
  } else {
    // Default Cassiopeia W shape
    stars = [
      [-2, 1, 0], [-1, -0.5, 0.3], [0, 0.8, -0.1], [1, -0.4, 0.5], [2, 1.2, 0]
    ];
    lines = [
      [-2, 1, 0], [-1, -0.5, 0.3],
      [-1, -0.5, 0.3], [0, 0.8, -0.1],
      [0, 0.8, -0.1], [1, -0.4, 0.5],
      [1, -0.4, 0.5], [2, 1.2, 0]
    ];
  }

  return (
    <group position={[-6, 4, -4]} rotation={[0.4, 0.2, 0.1]}>
      {/* Connective links */}
      {Array.from({ length: lines.length / 2 }).map((_, idx) => {
        const start = lines[idx * 2];
        const end = lines[idx * 2 + 1];
        return (
          <Line 
            key={`const-line-${currentConstellation}-${idx}`}
            points={[start, end]} 
            color="#fbbf24" 
            lineWidth={0.8} 
            transparent 
            opacity={0.6} 
          />
        );
      })}

      {/* Main stars */}
      {stars.map((star, idx) => (
        <group key={`star-${idx}`} position={star}>
          <Sphere args={[0.07, 8, 8]}>
            <meshBasicMaterial color="#ffffff" />
          </Sphere>
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}

      {/* Constellation HUD text label */}
      <Html distanceFactor={10}>
        <div className="bg-stone-900/90 border border-amber-500/30 p-2 rounded-xl text-stone-200 shadow-xl backdrop-blur-md pointer-events-none select-none">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1 mb-1">
            <SparklesIcon className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400 font-bold">
              Constellation Sync
            </span>
          </div>
          <span className="font-sans text-xs font-bold font-mono">
            {currentConstellation === 'UrsaMajor' ? 'URSA MAJOR' : (currentConstellation === 'Orion' ? 'ORION' : 'CASSIOPEIA')}
          </span>
        </div>
      </Html>
    </group>
  );
};


// ==========================================
// HOLOGRAPHIC CELESTIAL DNA HELIX
// ==========================================
const CelestialDNAVisuals = ({ visible }: any) => {
  if (!visible) return null;

  useFrame((state) => {
    // Rotation of helix code managed at parent or relative speed
  });

  // Calculate pairs for reference rendering
  const pairs = useMemo(() => {
    const arr = [];
    const height = 9;
    const numPairs = 18;
    for (let i = 0; i < numPairs; i++) {
      const y = (i / numPairs) * height - (height / 2);
      const angle = (i / numPairs) * Math.PI * 5; // Rotation twist
      const x1 = Math.cos(angle) * 1.5;
      const z1 = Math.sin(angle) * 1.5;
      const x2 = Math.cos(angle + Math.PI) * 1.5;
      const z2 = Math.sin(angle + Math.PI) * 1.5;
      arr.push({ x1, y, z1, x2, z2 });
    }
    return arr;
  }, []);

  return (
    <group position={[6, -2, -5]} rotation={[0.4, -0.4, 0.2]}>
      {/* Central DNA Core Thread */}
      {pairs.map((p, idx) => (
        <group key={`dna-pair-${idx}`}>
          {/* Bridge connection line */}
          <Line 
            points={[[p.x1, p.y, p.z1], [p.x2, p.y, p.z2]]} 
            color="#ec4899" 
            lineWidth={0.5} 
            transparent 
            opacity={0.3} 
          />

          {/* S1 Node */}
          <Sphere args={[0.12, 16, 16]} position={[p.x1, p.y, p.z1]}>
            <meshBasicMaterial color="#06b6d4" />
          </Sphere>

          {/* S2 Node */}
          <Sphere args={[0.12, 16, 16]} position={[p.x2, p.y, p.z2]}>
            <meshBasicMaterial color="#ec4899" />
          </Sphere>
        </group>
      ))}

      {/* Helix spine trails */}
      <Line 
        points={pairs.map(p => [p.x1, p.y, p.z1])} 
        color="#06b6d4" 
        lineWidth={1.2} 
        transparent 
        opacity={0.5} 
      />
      <Line 
        points={pairs.map(p => [p.x2, p.y, p.z2])} 
        color="#ec4899" 
        lineWidth={1.2} 
        transparent 
        opacity={0.5} 
      />

      <Html distanceFactor={10}>
        <div className="bg-stone-900/90 border border-pink-500/30 p-2 rounded-xl text-stone-200 shadow-xl backdrop-blur-md pointer-events-none select-none">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1 mb-1">
            <Activity className="w-3 h-3 text-pink-400" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-pink-400">
              Celestial DNA strand
            </span>
          </div>
          <span className="font-mono text-[9px] text-stone-400">
            Resonance: 432 Hz
          </span>
        </div>
      </Html>
    </group>
  );
};


// ===================================================
// MAIN EXPORT CONTROLLER COMPONENT
// ===================================================
export const CelestialBlueprintSection: React.FC<CelestialBlueprintProps> = ({ data, setActiveTab }) => {
  const [level, setLevel] = useState<number>(1); // 1 = Earth, 2 = Solar, 3 = Galactic, 4 = Universe
  const [timeDrift, setTimeDrift] = useState<number>(0); // Scrubber offset
  const [sacredGeometryOn, setSacredGeometryOn] = useState<boolean>(true);
  const [sacredGeometryPattern, setSacredGeometryPattern] = useState<'flower_of_life' | 'metatrons_cube' | 'vector_equilibrium' | 'sri_yantra'>('metatrons_cube');
  const [constellationOn, setConstellationOn] = useState<boolean>(true);
  const [constellationName, setConstellationName] = useState<string>('Orion');
  const [celestialDNAOn, setCelestialDNAOn] = useState<boolean>(true);
  const [zodiacMapOn, setZodiacMapOn] = useState<boolean>(false);

  // Chat/Artificial Guide states
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ sender: 'seeker' | 'guide'; text: string; hz?: number }[]>([
    {
      sender: 'guide',
      text: "Greetings, voyager. I am the Astral Mind Guide. Tap any universal scale tab above to project our physical coordinates, and ask me any spatial or dimensional alignments holding your focus.",
      hz: 528
    }
  ]);
  const [isLuminanceLoading, setIsLuminanceLoading] = useState<boolean>(false);

  // Cosmic Weather properties
  const cosmicWeather = useMemo(() => ({
    solarFlares: "Active M-Class (Modulate Phase)",
    geomagneticStormIndex: "Kp-5 (Moderate Storm Activity)",
    moonPhasePercent: "78.4% (Waxing Gibbous)",
    meteorRadiant: "Sigma Capricornids Alignment"
  }), []);

  // Spatial coordinates generated chronologically
  const calculatedCoords = useMemo(() => {
    // Basic mathematical offsets representing user coords
    return {
      terrestrial: {
        lat: data?.profile?.birthLat || "34.0522° N",
        lng: data?.profile?.birthLng || "118.2437° W",
        zone: "UTC-8 (Pacific Spacetime Core)",
        elevation: "Sea Level Elevation Grid"
      },
      solar: {
        x: (1.23 + (timeDrift * 0.01)).toFixed(4),
        y: (-0.45 + (timeDrift * 0.005)).toFixed(4),
        z: (2.98).toFixed(4),
        syncIdx: Math.min(99, Math.max(34, Math.floor(78 + Math.sin(timeDrift * 0.01) * 12)))
      },
      galactic: {
        ra: "18h 36m 56s (Sagittarius Axis link)",
        dec: "-22° 41' 24\" coordinate offset",
        distance: "26,100 Light Years from Sagittarius A*"
      },
      universal: {
        webFilament: "Virgo Supercluster Core Node 84",
        offset: "102.4 Megaparsecs outward gradient"
      }
    };
  }, [data, timeDrift]);

  const playNavigationSweep = (lvl: number) => {
    setLevel(lvl);
    if (soundEngine && typeof soundEngine.scan === 'function') {
      soundEngine.scan();
    } else if (soundEngine && typeof soundEngine.neuralClick === 'function') {
      soundEngine.neuralClick();
    }
  };

  const handleTimewarpSelection = (offset: number) => {
    setTimeDrift(prev => prev + offset);
    if (soundEngine && typeof soundEngine.synthChord === 'function') {
      soundEngine.synthChord();
    }
  };

  // Submit request to server-side Gemini action of the remix route
  const handleAssistantInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    const currentPrompt = userPrompt;
    setUserPrompt('');
    setChatLog(prev => [...prev, { sender: 'seeker', text: currentPrompt }]);
    setIsLuminanceLoading(true);

    if (soundEngine && typeof soundEngine.neuralClick === 'function') {
      soundEngine.neuralClick();
    }

    try {
      // Maps level integer to string
      const levelNames = ["Earth Environment", "Solar System Dynamics", "Galactic Core Trajectory", "Supercluster Matrix Level"];
      const currentLevelName = levelNames[level - 1];

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fetchCelestialBlueprintExplanation",
          payload: {
            level: currentLevelName,
            userPrompt: currentPrompt,
            cosmicData: data
          }
        })
      });

      const resJson = await response.json();
      if (resJson.error) {
        throw new Error(resJson.error);
      }

      setChatLog(prev => [...prev, { 
        sender: 'guide', 
        text: resJson.explanation,
        hz: resJson.frequency || 528
      }]);

      if (soundEngine && typeof soundEngine.success === 'function') {
        soundEngine.success();
      }
    } catch (err: any) {
      console.error("Guide navigation failure:", err);
      setChatLog(prev => [...prev, { 
        sender: 'guide', 
        text: "The telemetry relay encountered dynamic turbulence on the interstellar channel. However, your local energetic frequency holds alignment.",
        hz: 432
      }]);
    } finally {
      setIsLuminanceLoading(false);
    }
  };

  return (
    <div id="celestial-body-blueprint" className="space-y-6 pb-24">
      {/* 528Hz Solfeggio holographic breathing style */}
      <style>{`
        #celestial-body-blueprint .geometry-overlay {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(168, 85, 247, 0.04) 100%);
          backdrop-filter: blur(12px);
          box-shadow: 0 0 25px rgba(251, 191, 36, 0.25), inset 0 0 15px rgba(251, 191, 36, 0.12);
          border: 1px solid rgba(251, 191, 36, 0.35);
          animation: geometry-breathing 5.28s infinite ease-in-out;
          text-shadow: 0 0 6px rgba(251, 191, 36, 0.4);
        }
        @keyframes geometry-breathing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.2), inset 0 0 12px rgba(251, 191, 36, 0.08);
            border-color: rgba(251, 191, 36, 0.3);
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.5), inset 0 0 25px rgba(251, 191, 36, 0.22);
            border-color: rgba(251, 191, 36, 0.75);
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(168, 85, 247, 0.08) 100%);
          }
        }
      `}</style>
      {/* SECTION BANNER HUD */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-stone-950 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/10 via-emerald-950/20 to-cyan-900/10 opacity-60" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex items-center gap-4">
          <div className="p-4 rounded-3xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '30s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Level Intelligence v2.8
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white mt-1">
              Celestial Body Blueprint
            </h1>
            <p className="text-xs text-stone-400 font-mono mt-0.5 uppercase tracking-wide">
              Universal Position Coordinates & Quantum Spacetime Geometries
            </p>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab && setActiveTab('torus')}
          className="relative px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white rounded-xl text-xs font-mono tracking-widest transition-all uppercase"
        >
          Navigate Home
        </button>
      </div>

      {/* SCALE HEADER NAVIGATION TABS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => playNavigationSweep(1)}
          className={`flex items-center justify-center gap-3 p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            level === 1 
              ? 'border-emerald-500/30 bg-emerald-950/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
              : 'border-white/5 bg-stone-900/40 hover:bg-stone-900/60 text-stone-400 hover:text-stone-200'
          }`}
        >
          {level === 1 && <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          <Globe className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-mono text-[8px] uppercase tracking-widest block">Core Level 1</span>
            <span className="text-xs font-bold font-mono tracking-wide">Earth Position</span>
          </div>
        </button>

        <button
          onClick={() => playNavigationSweep(2)}
          className={`flex items-center justify-center gap-3 p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            level === 2 
              ? 'border-cyan-500/30 bg-cyan-950/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
              : 'border-white/5 bg-stone-900/40 hover:bg-stone-900/60 text-stone-400 hover:text-stone-200'
          }`}
        >
          {level === 2 && <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-cyan-400" />}
          <Sun className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-mono text-[8px] uppercase tracking-widest block">Core Level 2</span>
            <span className="text-xs font-bold font-mono tracking-wide">Solar Orbitals</span>
          </div>
        </button>

        <button
          onClick={() => playNavigationSweep(3)}
          className={`flex items-center justify-center gap-3 p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            level === 3 
              ? 'border-purple-500/30 bg-purple-950/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
              : 'border-white/5 bg-stone-900/40 hover:bg-stone-900/60 text-stone-400 hover:text-stone-200'
          }`}
        >
          {level === 3 && <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-purple-400" />}
          <Zap className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-mono text-[8px] uppercase tracking-widest block">Core Level 3</span>
            <span className="text-xs font-bold font-mono tracking-wide">Galactic Center</span>
          </div>
        </button>

        <button
          onClick={() => playNavigationSweep(4)}
          className={`flex items-center justify-center gap-3 p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
            level === 4 
              ? 'border-indigo-500/30 bg-indigo-950/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
              : 'border-white/5 bg-stone-900/40 hover:bg-stone-900/60 text-stone-400 hover:text-stone-200'
          }`}
        >
          {level === 4 && <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-indigo-400" />}
          <Activity className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-mono text-[8px] uppercase tracking-widest block">Core Level 4</span>
            <span className="text-xs font-bold font-mono tracking-wide">Observable Universe</span>
          </div>
        </button>
      </div>

      {/* CORE OBSERVATORY PANELS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: COORDINATE SCANNER */}
        <div className="lg:col-span-1 border border-white/10 bg-black/40 backdrop-blur-md rounded-[2rem] p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-stone-200 font-bold font-mono text-xs uppercase tracking-widest">
                  Coordinate Registry
                </h2>
                <span className="text-[9px] text-stone-500 font-mono">Reality Integrity Scan</span>
              </div>
            </div>

            {/* Scale-based relative scanner output */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={level} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {level === 1 && (
                  <div className="space-y-3 font-mono text-[10px] uppercase">
                    <div>
                      <span className="text-stone-500 block mb-0.5">Location Anchor</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.terrestrial.lat}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">Longitude Node</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.terrestrial.lng}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">System Spacetime Zone</span>
                      <span className="text-emerald-400 font-bold">{calculatedCoords.terrestrial.zone}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">Terran Level Elevation</span>
                      <span className="text-stone-300">{calculatedCoords.terrestrial.elevation}</span>
                    </div>
                  </div>
                )}

                {level === 2 && (
                  <div className="space-y-3 font-mono text-[10px] uppercase">
                    <div>
                      <span className="text-stone-500 block mb-0.5">Radial Offset X</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.solar.x} AU</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">Radial Offset Y</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.solar.y} AU</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">Radial Offset Z</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.solar.z} AU</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">Solar Synchronization</span>
                      <span className="text-cyan-400 font-bold text-xs">{calculatedCoords.solar.syncIdx}% Alignment</span>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1 mt-1.5">
                        <div 
                          className="bg-cyan-400 h-full transition-all duration-300"
                          style={{ width: `${calculatedCoords.solar.syncIdx}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {level === 3 && (
                  <div className="space-y-3 font-mono text-[10px] uppercase">
                    <div>
                      <span className="text-stone-500 block mb-0.5">Right Ascension</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.galactic.ra}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">Declination offset</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.galactic.dec}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">Galactic Core Distance</span>
                      <span className="text-purple-400 font-bold">{calculatedCoords.galactic.distance}</span>
                    </div>
                  </div>
                )}

                {level === 4 && (
                  <div className="space-y-3 font-mono text-[10px] uppercase">
                    <div>
                      <span className="text-stone-500 block mb-0.5">Supercluster Filament</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.universal.webFilament}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block mb-0.5">Spacetime metric offset</span>
                      <span className="text-white font-bold text-xs">{calculatedCoords.universal.offset}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Core System integrity readings */}
          <div className="border-t border-white/5 pt-4 space-y-3 font-mono text-[9px] uppercase">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Sensor Confidence</span>
              <span className="text-emerald-400 font-bold">99.98% SECURE</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[99.98%]" />
            </div>
            <div className="flex items-center gap-1.5 text-stone-400 mt-2">
              <MapPin className="w-3 h-3 text-stone-500" />
              <span>Solar System Coordinate: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: THE HOLOGRAPHIC Observatory View */}
        <div className="lg:col-span-2 relative flex flex-col justify-between border border-white/10 bg-black/60 rounded-[2.5rem] p-6 h-[500px] overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/10 to-stone-900/40 pointer-events-none" />

          {/* ACTIVE HOVER OVERLAY OPTIONS PANEL */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-auto">
            <button
              onClick={() => {
                setSacredGeometryOn(!sacredGeometryOn);
                soundEngine.neuralClick();
              }}
              className={`px-3 py-1.5 rounded-full text-[9px] font-mono border transition-all flex items-center gap-1.5 ${
                sacredGeometryOn 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.2)]' 
                  : 'bg-black/40 border-white/5 text-stone-400'
              }`}
            >
              <Activity className="w-3 h-3" />
              Geometry: {sacredGeometryOn ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => {
                setConstellationOn(!constellationOn);
                soundEngine.neuralClick();
              }}
              className={`px-3 py-1.5 rounded-full text-[9px] font-mono border transition-all flex items-center gap-1.5 ${
                constellationOn 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.2)]' 
                  : 'bg-black/40 border-white/5 text-stone-400'
              }`}
            >
              <SparklesIcon className="w-3 h-3" />
              Constellation: {constellationOn ? constellationName : "OFF"}
            </button>

            <button
              onClick={() => {
                setCelestialDNAOn(!celestialDNAOn);
                soundEngine.neuralClick();
              }}
              className={`px-3 py-1.5 rounded-full text-[9px] font-mono border transition-all flex items-center gap-1.5 ${
                celestialDNAOn 
                  ? 'bg-pink-500/15 border-pink-500/30 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.2)]' 
                  : 'bg-black/40 border-white/5 text-stone-400'
              }`}
            >
              <Fingerprint className="w-3 h-3" />
              Celestial DNA: {celestialDNAOn ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => {
                setZodiacMapOn(!zodiacMapOn);
                try { soundEngine.neuralClick(); } catch (e) { /* ignore safe */ }
              }}
              className={`px-3 py-1.5 rounded-full text-[9px] font-mono border transition-all flex items-center gap-1.5 ${
                zodiacMapOn 
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]' 
                  : 'bg-black/40 border-white/5 text-stone-400'
              }`}
            >
              <Compass className="w-3 h-3 text-cyan-400" />
              Zodiac Map: {zodiacMapOn ? "ON" : "OFF"}
            </button>
          </div>

          <div className="absolute top-4 right-4 z-20 flex flex-col sm:flex-row gap-2">
            {sacredGeometryOn && (
              <select
                id="geometry-type-select"
                value={sacredGeometryPattern}
                onChange={(e) => {
                  setSacredGeometryPattern(e.target.value as any);
                  soundEngine.neuralClick();
                }}
                className="geometry-type-select bg-stone-950/90 border border-amber-500/30 rounded-lg px-2.5 py-1 text-[9px] font-mono text-amber-300 outline-none cursor-pointer hover:border-amber-500/50 transition-colors"
              >
                <option value="flower_of_life">🌸 Flower of Life</option>
                <option value="metatrons_cube">🌌 Metatron's Cube</option>
                <option value="vector_equilibrium">⚡ Vector Equilibrium</option>
                <option value="sri_yantra">🔱 Sri Yantra</option>
              </select>
            )}

            {constellationOn && (
              <select
                value={constellationName}
                onChange={(e) => {
                  setConstellationName(e.target.value);
                  soundEngine.neuralClick();
                }}
                className="bg-stone-950/90 border border-white/10 rounded-lg px-2.5 py-1 text-[9px] font-mono text-amber-300 outline-none cursor-pointer hover:border-white/25 transition-colors"
              >
                <option value="Orion">Orion</option>
                <option value="UrsaMajor">Ursa Major</option>
                <option value="Cassiopeia">Cassiopeia</option>
              </select>
            )}
          </div>

          {/* THREE.JS OBSERVATORY FRAME */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
              
              {/* Conditional 3D Render base scales */}
              {level === 1 && (
                <EarthHolograph 
                  sacredGeometryOn={sacredGeometryOn} 
                  sacredGeometryPattern={sacredGeometryPattern}
                  locationCoords={calculatedCoords.terrestrial} 
                />
              )}
              {level === 2 && (
                <SolarSystemHolograph 
                  timeDrift={timeDrift} 
                  sacredGeometryOn={sacredGeometryOn} 
                  sacredGeometryPattern={sacredGeometryPattern}
                />
              )}
              {level === 3 && (
                <GalacticHolograph 
                  timeDrift={timeDrift} 
                  sacredGeometryOn={sacredGeometryOn} 
                />
              )}
              {level === 4 && (
                <UniverseHolograph 
                  sacredGeometryOn={sacredGeometryOn} 
                />
              )}

              {/* Auxiliary Overlays inside Canvas scope */}
              <ConstellationInstuctor visible={constellationOn} currentConstellation={constellationName} />
              <CelestialDNAVisuals visible={celestialDNAOn} />

              <OrbitControls enableZoom={true} enablePan={true} maxDistance={20} minDistance={3} />
            </Canvas>

            <AnimatePresence>
              {zodiacMapOn && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-4 bg-black/10 backdrop-blur-[0.5px]"
                >
                  <svg
                    viewBox="0 0 500 500"
                    className="w-[85%] h-[85%] max-w-[420px] max-h-[420px] text-amber-500/30 animate-[spin_300s_linear_infinite]"
                  >
                    {/* Definitions for glow filters/effects */}
                    <defs>
                      <filter id="zodiac-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="faint-zodiac-glow" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Concentric circles */}
                    <circle cx="250" cy="250" r="235" fill="none" stroke="rgba(34, 211, 238, 0.12)" strokeWidth="1" strokeDasharray="3,4" />
                    <circle cx="250" cy="250" r="225" fill="none" stroke="rgba(34, 211, 238, 0.35)" strokeWidth="1.2" filter="url(#faint-zodiac-glow)" />
                    <circle cx="250" cy="250" r="185" fill="none" stroke="rgba(34, 211, 238, 0.18)" strokeWidth="1" />
                    <circle cx="250" cy="250" r="145" fill="none" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="1" strokeDasharray="2,3" />
                    <circle cx="250" cy="250" r="85" fill="none" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="0.8" />
                    <circle cx="250" cy="250" r="3" fill="rgba(34, 211, 238, 0.5)" filter="url(#zodiac-glow)" />

                    {/* Outer tick marks */}
                    {Array.from({ length: 72 }).map((_, i) => {
                      const angle = (i * 360 / 72) * Math.PI / 180;
                      const isMajor = i % 6 === 0;
                      const r1 = 225;
                      const r2 = isMajor ? 218 : 221;
                      return (
                        <line
                          key={`tick-${i}`}
                          x1={250 + r1 * Math.cos(angle)}
                          y1={250 + r1 * Math.sin(angle)}
                          x2={250 + r2 * Math.cos(angle)}
                          y2={250 + r2 * Math.sin(angle)}
                          stroke={isMajor ? "rgba(34, 211, 238, 0.45)" : "rgba(34, 211, 238, 0.18)"}
                          strokeWidth={isMajor ? 1 : 0.6}
                        />
                      );
                    })}

                    {/* 12 Zodiac Cusp Lines and Symbols/Labels */}
                    {[
                      { name: 'Aries', symbol: '♈', element: 'Fire', color: '#f87171' },
                      { name: 'Taurus', symbol: '♉', element: 'Earth', color: '#34d399' },
                      { name: 'Gemini', symbol: '♊', element: 'Air', color: '#22d3ee' },
                      { name: 'Cancer', symbol: '♋', element: 'Water', color: '#60a5fa' },
                      { name: 'Leo', symbol: '♌', element: 'Fire', color: '#fbbf24' },
                      { name: 'Virgo', symbol: '♍', element: 'Earth', color: '#a8a29e' },
                      { name: 'Libra', symbol: '♎', element: 'Air', color: '#2dd4bf' },
                      { name: 'Scorpio', symbol: '♏', element: 'Water', color: '#c084fc' },
                      { name: 'Sagittarius', symbol: '♐', element: 'Fire', color: '#f97316' },
                      { name: 'Capricorn', symbol: '♑', element: 'Earth', color: '#818cf8' },
                      { name: 'Aquarius', symbol: '♒', element: 'Air', color: '#f472b6' },
                      { name: 'Pisces', symbol: '♓', element: 'Water', color: '#ec4899' }
                    ].map((sign, idx) => {
                      const angleDeg = idx * 30;
                      const nextAngleDeg = (idx + 1) * 30;
                      const midAngleDeg = angleDeg + 15;

                      const angleRad = (angleDeg * Math.PI) / 180;
                      const midAngleRad = (midAngleDeg * Math.PI) / 180;

                      // Radial boundary lines
                      const x1 = 250 + 85 * Math.cos(angleRad);
                      const y1 = 250 + 85 * Math.sin(angleRad);
                      const x2 = 250 + 225 * Math.cos(angleRad);
                      const y2 = 250 + 225 * Math.sin(angleRad);

                      // Text and symbol positions
                      const textRadius = 205;
                      const tx = 250 + textRadius * Math.cos(midAngleRad);
                      const ty = 250 + textRadius * Math.sin(midAngleRad);

                      // Constellation stars inside sector
                      let constellationElement: React.ReactNode;
                      if (idx === 0) { // Aries
                        const pts = [[118, 205], [133, 218], [141, 214]];
                        constellationElement = (
                          <g opacity="0.45" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.8">
                            <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[1][0]} y2={pts[1][1]} />
                            <line x1={pts[1][0]} y1={pts[1][1]} x2={pts[2][0]} y2={pts[2][1]} />
                            <circle cx={pts[0][0]} cy={pts[0][1]} r="1.5" fill="#fff" />
                            <circle cx={pts[1][0]} cy={pts[1][1]} r="2" fill="#22d3ee" />
                            <circle cx={pts[2][0]} cy={pts[2][1]} r="1.5" fill="#fff" />
                          </g>
                        );
                      } else if (idx === 4) { // Leo
                        const pts = [[300, 110], [315, 122], [325, 118], [330, 105], [318, 98], [312, 103]];
                        constellationElement = (
                          <g opacity="0.45" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.8">
                            <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" />
                            {pts.map((p, i) => (
                              <circle key={i} cx={p[0]} cy={p[1]} r={i === 1 ? 2.2 : 1.5} fill={i ===  1 ? "#22d3ee" : "#fff"} />
                            ))}
                          </g>
                        );
                      } else if (idx === 7) { // Scorpio
                        const pts = [[218, 320], [210, 335], [215, 345], [225, 350], [235, 348], [242, 338]];
                        constellationElement = (
                          <g opacity="0.45" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.8">
                            <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" />
                            {pts.map((p, i) => (
                              <circle key={i} cx={p[0]} cy={p[1]} r={i === 3 ? 2.5 : 1.5} fill={i ===  3 ? "#22d3ee" : "#fff"} filter="url(#zodiac-glow)" />
                            ))}
                          </g>
                        );
                      } else {
                        const cx = 250 + 120 * Math.cos(midAngleRad);
                        const cy = 250 + 120 * Math.sin(midAngleRad);
                        constellationElement = (
                          <g opacity="0.25">
                            <circle cx={cx} cy={cy} r="1.3" fill="#fff" />
                            <circle cx={cx + 10} cy={cy - 12} r="1" fill="rgba(34, 211, 238, 0.8)" />
                            <circle cx={cx - 8} cy={cy - 4} r="1.1" fill="#fff" />
                            <line x1={cx} y1={cy} x2={cx + 10} y2={cy - 12} stroke="rgba(34, 211, 238, 0.3)" strokeWidth="0.6" />
                            <line x1={cx} y1={cy} x2={cx - 8} y2={cy - 4} stroke="rgba(34, 211, 238, 0.3)" strokeWidth="0.6" />
                          </g>
                        );
                      }

                      return (
                        <g key={sign.name} className="transition-opacity duration-300">
                          {/* Radial Boundary Line */}
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(34, 211, 238, 0.1)"
                            strokeWidth="1"
                          />

                          {/* Outer arc Segment border */}
                          <path
                            d={`M ${250 + 225 * Math.cos(angleRad)} ${250 + 225 * Math.sin(angleRad)} A 225 225 0 0 1 ${250 + 225 * Math.cos((nextAngleDeg * Math.PI) / 180)} ${250 + 225 * Math.sin((nextAngleDeg * Math.PI) / 180)}`}
                            fill="none"
                            stroke="rgba(34, 211, 238, 0.05)"
                            strokeWidth="3"
                          />

                          {/* Constellations */}
                          {constellationElement}

                          {/* Glyph symbol (colored slightly according to element) */}
                          <text
                            x={tx}
                            y={ty - 6}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fill={sign.color}
                            fontSize="11"
                            className="font-semibold cursor-default"
                            style={{ textShadow: '0 0 3px rgba(34,211,238,0.2)' }}
                          >
                            {sign.symbol}
                          </text>

                          {/* Name label */}
                          <text
                            x={tx}
                            y={ty + 7}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fill="#d6d3d1"
                            fontSize="6"
                            className="font-mono uppercase tracking-[0.1em] font-medium opacity-85 select-none cursor-default"
                          >
                            {sign.name.slice(0, 3)}
                          </text>

                          {/* Degree markers */}
                          <text
                            x={250 + 172 * Math.cos(midAngleRad)}
                            y={250 + 172 * Math.sin(midAngleRad)}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fill="rgba(34, 211, 238, 0.35)"
                            fontSize="4.5"
                            className="font-mono select-none cursor-default"
                          >
                            {`${idx * 30}°`}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 528Hz Solfeggio Holographic Breathing Overlay HUD */}
          {sacredGeometryOn && (
            <div className="geometry-overlay absolute bottom-4 left-4 z-20 flex items-center gap-3 pointer-events-none select-none px-4 py-2 rounded-2xl">
              <div className="relative flex items-center justify-center w-6 h-6">
                <div className="absolute inset-0 rounded-full border border-amber-400/40 bg-amber-500/15 animate-ping opacity-75" style={{ animationDuration: '5.28s' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold tracking-widest text-[#fbbf24] text-[9.5px]">SOLFEGGIO 528Hz RESONANCE</span>
                <span className="text-stone-300 text-[8px] tracking-wider font-mono animate-pulse uppercase font-light">Geometric Breathing Active</span>
              </div>
            </div>
          )}

          {/* NAVIGATOR INSTRUCTIONS CARD */}
          <div className="relative z-10 pointer-events-none select-none text-right self-end mt-auto pr-2 pb-2">
            <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest leading-relaxed">
              Drag layout framework to re-adjust orbital viewport angle.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: COSMIC WEATHER */}
        <div className="lg:col-span-1 border border-white/10 bg-black/40 backdrop-blur-md rounded-[2rem] p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
              <div>
                <h2 className="text-stone-200 font-bold font-mono text-xs uppercase tracking-widest">
                  Cosmic Weather
                </h2>
                <span className="text-[9px] text-stone-500 font-mono">Real-time Solar Metrics</span>
              </div>
            </div>

            <div className="space-y-4 font-mono text-[10px]">
              <div>
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span>Solar Flare Activity</span>
                  <span className="text-amber-500 font-bold">{cosmicWeather.solarFlares}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[70%] animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span>Geomagnetic Storm Index</span>
                  <span className="text-purple-400 font-bold">{cosmicWeather.geomagneticStormIndex}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span>Moon Phase Alignment</span>
                  <span className="text-cyan-400 font-bold">{cosmicWeather.moonPhasePercent}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[78.4%]" />
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 mt-3">
                <span className="text-stone-500 block mb-0.5">Active Meteor Radiant</span>
                <span className="text-white font-bold">{cosmicWeather.meteorRadiant}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-2 font-mono text-[9px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Solar Wind Index: 436 km/s</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Magnetosphere Shielding: STABLE</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CONTROLS: TIMELINE WIDGET & AI ASSISTANT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TIME DRIFT SCRUBBER CONTROLLER */}
        <div className="lg:col-span-1 border border-white/10 bg-black/40 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h2 className="text-stone-200 font-bold font-mono text-xs uppercase tracking-widest">
                Cosmic Motion Timeline
              </h2>
            </div>
            <p className="text-[10px] text-stone-400 font-mono mt-2 leading-relaxed">
              Drift heliocentric planetary pathways and coordinate markers across spacetime segments. Watch variables update dynamically.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase">
              <span className="text-stone-500">Universal Time Offset</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                {timeDrift === 0 ? "Real-time sync" : `${timeDrift > 0 ? "+" : ""}${timeDrift} hours delta`}
              </span>
            </div>

            {/* Timewarp buttons */}
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => handleTimewarpSelection(-24)}
                className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-xl font-mono text-[10px] text-stone-300 transition-colors"
              >
                -1 Day
              </button>
              <button
                onClick={() => handleTimewarpSelection(-1)}
                className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-xl font-mono text-[10px] text-stone-300 transition-colors"
              >
                -1 Hr
              </button>
              <button
                onClick={() => handleTimewarpSelection(1)}
                className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-xl font-mono text-[10px] text-stone-300 transition-colors"
              >
                +1 Hr
              </button>
              <button
                onClick={() => handleTimewarpSelection(24)}
                className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-xl font-mono text-[10px] text-stone-300 transition-colors"
              >
                +1 Day
              </button>
            </div>

            <button
              onClick={() => {
                setTimeDrift(0);
                soundEngine.scan();
              }}
              className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-xl font-mono text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset real-time sync
            </button>
          </div>
        </div>

        {/* Neural Cosmic Navigation CHAT PANELS */}
        <div className="lg:col-span-2 border border-white/10 bg-black/40 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-emerald-400" />
              <h2 className="text-stone-200 font-bold font-mono text-xs uppercase tracking-widest">
                Neural Cosmic Navigation
              </h2>
            </div>
            <span className="text-[8px] font-mono text-stone-500 uppercase tracking-widest">
              Luminance Bridge v1
            </span>
          </div>

          {/* CHAT DISPLAY LOG */}
          <div className="flex-1 overflow-y-auto max-h-[160px] min-h-[120px] scrollbar-thin scrollbar-thumb-white/10 pr-2 space-y-3 font-sans text-xs">
            {chatLog.map((chat, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 items-start ${chat.sender === 'seeker' ? 'justify-end' : 'justify-start'}`}
              >
                {chat.sender === 'guide' && (
                  <div className="p-1 rounded-lg border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 mt-1 shrink-0">
                    <Compass className="w-3 h-3" />
                  </div>
                )}
                <div 
                  className={`p-3 rounded-2xl border leading-relaxed ${
                    chat.sender === 'seeker'
                      ? 'bg-blue-950/20 border-blue-500/20 text-blue-200 max-w-[85%]'
                      : 'bg-stone-900/40 border-white/5 text-stone-300 max-w-[85%]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{chat.text}</p>
                  
                  {chat.hz && (
                    <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-white/5 text-[9px] font-mono text-amber-400">
                      <Radio className="w-3 h-3" />
                      <span>Solfeggio Frequency: {chat.hz} Hz</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLuminanceLoading && (
              <div className="flex gap-3 items-start justify-start">
                <div className="p-1 rounded-lg border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 mt-1 shrink-0">
                  <Compass className="w-3 h-3 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl border bg-stone-900/40 border-white/5 text-stone-500 font-mono text-[10px] animate-pulse">
                  Querying multidimensional vector fields...
                </div>
              </div>
            )}
          </div>

          {/* REQUEST INPUT FIELDS */}
          <form onSubmit={handleAssistantInquiry} className="flex gap-2">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              disabled={isLuminanceLoading}
              placeholder="Ask the Guide: Where am I in the universe? Explain Sagittarius coordinates..."
              className="flex-1 bg-stone-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/40 transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={isLuminanceLoading || !userPrompt.trim()}
              className="px-4 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400/30 text-stone-950 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
