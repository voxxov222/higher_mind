import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html, OrbitControls, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Sword, 
  Sparkles, 
  Zap, 
  Activity, 
  BookOpen, 
  Fingerprint, 
  Key, 
  Compass, 
  Sun,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Orbit as OrbitIcon
} from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';
import { CosmicData } from '../types';
import { MasonicVisualTools } from './MasonicVisualTools';

// The 33 Degrees data array
const DEGREES_DATA = [
  { deg: 1, name: "Entered Apprentice", ruler: "Moon", sephirah: "Malkuth", gematria: 62, desc: "The foundation of initiation, representing first contact with the spiritual lodge and the uncarved ashlar." },
  { deg: 2, name: "Fellow Craft", ruler: "Mercury", sephirah: "Yesod", gematria: 74, desc: "The development of intellectual mastery, the sciences, and geometrical awareness." },
  { deg: 3, name: "Master Mason", ruler: "Venus", sephirah: "Hod", gematria: 88, desc: "Mastery of the material plane, representing death of the ego and resurrection in light." },
  { deg: 4, name: "Secret Master", ruler: "Sun", sephirah: "Netzach", gematria: 110, desc: "Guardianship of the inner sanctum and contemplation of the divine order." },
  { deg: 5, name: "Perfect Master", ruler: "Mercury", sephirah: "Tiphereth", gematria: 99, desc: "Grieving the lost word and seeking reconciliation through geometric symmetry." },
  { deg: 6, name: "Intimate Secretary", ruler: "Venus", sephirah: "Yesod", gematria: 130, desc: "Peacemaking, emotional alignment, and bridging cosmic dualities." },
  { deg: 7, name: "Provost and Judge", ruler: "Mars", sephirah: "Gevurah", gematria: 114, desc: "Enforcing spiritual law with absolute equity and balanced justice." },
  { deg: 8, name: "Intendant of the Building", ruler: "Jupiter", sephirah: "Chesed", gematria: 144, desc: "Overseeing spiritual construction, mastering outer skills to mirror inner architecture." },
  { deg: 9, name: "Elu of the Nine", ruler: "Mars", sephirah: "Gevurah", gematria: 108, desc: "Igniting holy wrath and courageous determination to defeat shadow structures." },
  { deg: 10, name: "Elu of the Fifteen", ruler: "Saturn", sephirah: "Binah", gematria: 121, desc: "Deep meditation on absolute consequences, refining inner discipline." },
  { deg: 11, name: "Sublime Elu", ruler: "Jupiter", sephirah: "Chesed", gematria: 93, desc: "Attainment of ultimate cosmic trust, understanding divine benevolence." },
  { deg: 12, name: "Grand Master Architect", ruler: "Uranus", sephirah: "Chokmah", gematria: 156, desc: "The blueprints of reality are revealed through absolute mathematics." },
  { deg: 13, name: "Royal Arch of Solomon", ruler: "Sun", sephirah: "Tiphereth", gematria: 160, desc: "Descent into the dark vault to discover the lost tetragrammaton of creation." },
  { deg: 14, name: "Grand Elect Perfect Mason", ruler: "Jupiter", sephirah: "Kether", gematria: 180, desc: "The revelation of the sacred word inside the sanctum sanctorum." },
  { deg: 15, name: "Knight of the East", ruler: "Sun", sephirah: "Tiphereth", gematria: 137, desc: "Spiritual liberation, building the Temple of Liberty in the face of captive forces." },
  { deg: 16, name: "Prince of Jerusalem", ruler: "Mercury", sephirah: "Hod", gematria: 152, desc: "Mastering cosmic law, taking sovereign command over personal destiny." },
  { deg: 17, name: "Knight of the East and West", ruler: "Uranus", sephirah: "Da'at", gematria: 191, desc: "Merging eastern spiritual mysticism with western physical science." },
  { deg: 18, name: "Knight Rose Croix", ruler: "Sun", sephirah: "Tiphereth", gematria: 133, desc: "The blossoming rose of the heart on the cross of matter, absolute spiritual love." },
  { deg: 19, name: "Grand Pontiff", ruler: "Jupiter", sephirah: "Kether", gematria: 201, desc: "Bridging physical epochs, establishing alignment with the New Jerusalem of the mind." },
  { deg: 20, name: "Grand Master of All Symbolic Lodges", ruler: "Venus", sephirah: "Netzach", gematria: 220, desc: "The protector of truth and esoteric symbols across all dimensions." },
  { deg: 21, name: "Noachite or Prussian Knight", ruler: "Moon", sephirah: "Yesod", gematria: 184, desc: "Humble aligning with lunar cycles, reflecting natural tides of consciousness." },
  { deg: 22, name: "Knight of the Royal Axe", ruler: "Mars", sephirah: "Gevurah", gematria: 118, desc: "Cutting away outdated spiritual beliefs to expose raw gnosis." },
  { deg: 23, name: "Chief of the Tabernacle", ruler: "Sun", sephirah: "Tiphereth", gematria: 167, desc: "Serving as a channel for divine presence within the cosmic tabernacle." },
  { deg: 24, name: "Prince of the Tabernacle", ruler: "Jupiter", sephirah: "Chesed", gematria: 175, desc: "Initiating other souls into the higher dimensions of spiritual truth." },
  { deg: 25, name: "Knight of the Brazen Serpent", ruler: "Neptune", sephirah: "Hod", gematria: 210, desc: "Raising the visual caduceus, transforming shadow karma into cellular healing." },
  { deg: 26, name: "Prince of Mercy", ruler: "Venus", sephirah: "Netzach", gematria: 186, desc: "The triple alliance of love, light, and mercy flowing from the supernal realms." },
  { deg: 27, name: "Knight Commander of the Temple", ruler: "Saturn", sephirah: "Binah", gematria: 233, desc: "Defending deep mystical wisdom and building an unbreakable spiritual shield." },
  { deg: 28, name: "Knight of the Sun", ruler: "Sun", sephirah: "Tiphereth", gematria: 195, desc: "The absolute solar initiate, aligning with the primeval light of Chokmah." },
  { deg: 29, name: "Knight of Saint Andrew", ruler: "Neptune", sephirah: "Chokmah", gematria: 245, desc: "Unconditional devotion to the divine feminine and celestial gnosis." },
  { deg: 30, name: "Knight Kadosh", ruler: "Saturn", sephirah: "Binah", gematria: 188, desc: "Purified through judgment and fire, standing at the summit of intellectual courage." },
  { deg: 31, name: "Inspector Inquisitor", ruler: "Neptune", sephirah: "Binah", gematria: 256, desc: "Weighing deeds on the cosmic scale of truth, aligning karma with destiny." },
  { deg: 32, name: "Sublime Prince of the Royal Secret", ruler: "Pluto", sephirah: "Chokmah", gematria: 303, desc: "Unifying all 32 prior paths of wisdom into one master formula of cosmic architecture." },
  { deg: 33, name: "Sovereign Grand Inspector General", ruler: "Cosmic Logos", sephirah: "Kether", gematria: 333, desc: "The Crown of initiation, holding the absolute key of Da'at. Seamless synthesis of the universe." }
];

// Helper to determine color based on esoteric planetary ruler
const getRulerColor = (ruler: string) => {
  switch (ruler) {
    case 'Moon': return '#38bdf8';
    case 'Mercury': return '#f472b6';
    case 'Venus': return '#10b981';
    case 'Sun': return '#fbbf24';
    case 'Mars': return '#ef4444';
    case 'Jupiter': return '#a855f7';
    case 'Saturn': return '#64748b';
    case 'Uranus': return '#06b6d4';
    case 'Neptune': return '#3b82f6';
    case 'Pluto': return '#8b5cf6';
    case 'Cosmic Logos': return '#f59e0b';
    default: return '#fbbf24';
  }
};

const degSuffix = (deg: number) => {
  if (deg === 1) return 'st';
  if (deg === 2) return 'nd';
  if (deg === 3) return 'rd';
  return 'th';
};

// --- R3F 3D Components ---

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈︎', color: '#ef4444' },
  { name: 'Taurus', symbol: '♉︎', color: '#10b981' },
  { name: 'Gemini', symbol: '♊︎', color: '#facc15' },
  { name: 'Cancer', symbol: '♋︎', color: '#94a3b8' },
  { name: 'Leo', symbol: '♌︎', color: '#f59e0b' },
  { name: 'Virgo', symbol: '♍︎', color: '#10b981' },
  { name: 'Libra', symbol: '♎︎', color: '#f472b6' },
  { name: 'Scorpio', symbol: '♏︎', color: '#ef4444' },
  { name: 'Sagittarius', symbol: '♐︎', color: '#a855f7' },
  { name: 'Capricorn', symbol: '♑︎', color: '#64748b' },
  { name: 'Aquarius', symbol: '♒︎', color: '#06b6d4' },
  { name: 'Pisces', symbol: '♓︎', color: '#3b82f6' }
];

const ZodiacWheelOverlay = ({ data, showZodiac }: { data: CosmicData | null, showZodiac: boolean }) => {
  const wheelRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (wheelRef.current && showZodiac) {
      wheelRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  if (!showZodiac) return null;

  const radius = 8.5;
  const userSunSign = data?.planets?.find(p => p.name === 'Sun')?.sign || '';

  return (
    <group ref={wheelRef} position={[0, -2.8, 0]}>
      {/* Outer Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.1, radius + 0.1, 128]} />
        <meshBasicMaterial color="#312e81" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 12 Zodiac Sections */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isUserSign = userSunSign.toLowerCase() === sign.name.toLowerCase();

        return (
          <group key={sign.name} position={[x, 0, z]}>
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.6}
              color={isUserSign ? sign.color : '#94a3b8'}
              textAlign="center"
              rotation={[0, -angle + Math.PI / 2, 0]}
            >
              {sign.symbol}
            </Text>
            
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.2}
              color={isUserSign ? '#ffffff' : '#475569'}
              textAlign="center"
              rotation={[0, -angle + Math.PI / 2, 0]}
            >
              {sign.name.toUpperCase()}
            </Text>

            {/* Glowing marker for active user sign */}
            {isUserSign && (
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial 
                  color={sign.color} 
                  emissive={sign.color} 
                  emissiveIntensity={2} 
                  toneMapped={false} 
                />
              </mesh>
            )}

            {/* Path line to center */}
            <Line 
              points={[new THREE.Vector3(-x, 0, -z).multiplyScalar(0.2), new THREE.Vector3(0, 0, 0)]} 
              color={isUserSign ? sign.color : '#1e1b4b'} 
              lineWidth={isUserSign ? 1.5 : 0.5} 
              transparent 
              opacity={isUserSign ? 0.6 : 0.1}
            />
          </group>
        );
      })}

      {/* Connection webs between signs */}
      {ZODIAC_SIGNS.map((_, i) => {
        const nextIdx = (i + 1) % 12;
        const angle1 = (i / 12) * Math.PI * 2;
        const angle2 = (nextIdx / 12) * Math.PI * 2;
        return (
          <Line 
            key={`ring-link-${i}`}
            points={[
              new THREE.Vector3(Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius),
              new THREE.Vector3(Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius)
            ]}
            color="#312e81"
            lineWidth={1}
            transparent
            opacity={0.2}
          />
        );
      })}
    </group>
  );
};

// 3D Spinal Vertebrae representing 33 Degrees
const SpinalAscent = ({ activeDegree, setActiveDegree, secretionProgress, secretionActive }: any) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {DEGREES_DATA.map((deg, i) => {
        const yPos = (i - 16.5) * 0.6; // evenly spaced vertically
        const radius = 2.0;
        const angle = i * 0.45; // spiral alignment
        const xPos = Math.cos(angle) * (radius + Math.sin(i * 0.5) * 0.3);
        const zPos = Math.sin(angle) * (radius + Math.sin(i * 0.5) * 0.3);

        const isCurrent = activeDegree === deg.deg;
        const isSecretionLit = secretionActive && secretionProgress >= (i / 33);

        // Color maps
        let color = getRulerColor(deg.ruler);
        if (isCurrent) color = '#ffffff';
        else if (isSecretionLit) color = '#fbbf24'; // Golden Kundalini surge

        return (
          <group key={deg.deg} position={[xPos, yPos, zPos]}>
            <mesh 
              onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = 'auto'; }}
              onClick={() => setActiveDegree(deg.deg)}
            >
              <sphereGeometry args={[isCurrent ? 0.25 : 0.14, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={isCurrent ? 2 : isSecretionLit ? 1.5 : 0.4} 
                toneMapped={false}
              />
            </mesh>

            {/* Connection line to central spinal canal */}
            <Line 
              points={[new THREE.Vector3(0, yPos, 0), new THREE.Vector3(xPos, yPos, zPos)]} 
              color={isSecretionLit ? '#f59e0b' : '#334155'} 
              lineWidth={1} 
              transparent 
              opacity={isSecretionLit ? 0.8 : 0.3} 
            />

            {/* Miniature text marker */}
            {(isCurrent || (i % 5 === 0 && !secretionActive)) && (
              <Text 
                position={[xPos * 0.6, 0.3, zPos * 0.6]} 
                fontSize={0.24} 
                color={isCurrent ? '#ffffff' : '#94a3b8'}
                anchorX="center"
              >
                {`${deg.deg}°`}
              </Text>
            )}
          </group>
        );
      })}

      {/* Central Spinal Canal */}
      <Line 
        points={DEGREES_DATA.map((_, i) => new THREE.Vector3(0, (i - 16.5) * 0.6, 0))} 
        color={secretionActive ? '#fbbf24' : '#1e293b'} 
        lineWidth={secretionActive ? 4 : 2} 
        transparent 
        opacity={0.8}
      />
    </group>
  );
};

// 3D Pyramid of Gnosis with floating 33rd capstone
const PyramidOfGnosis = ({ 
  activeDegree, 
  setActiveDegree, 
  secretionActive, 
  secretionProgress, 
  showTracingBoard, 
  showZodiac,
  data,
  activeGematriaColor = '#fbbf24' 
}: any) => {
  const pyramidRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (pyramidRef.current) {
      pyramidRef.current.rotation.y = -state.clock.getElapsedTime() * 0.1;
    }
  });

  const baseRadius = 5;
  const height = 7;
  const capstoneHeight = 1.8;

  // Base vertices for tetrahedron pyramid
  const basePoints = useMemo(() => [
    new THREE.Vector3(0, -3, baseRadius),
    new THREE.Vector3(baseRadius * 0.86, -3, -baseRadius * 0.5),
    new THREE.Vector3(-baseRadius * 0.86, -3, -baseRadius * 0.5),
    new THREE.Vector3(0, -3, baseRadius) // close path
  ], []);

  // Compute 33 ladder points spiraling up the faces of the pyramid as a Tracing Board overlay
  const ladderPoints = useMemo(() => {
    return DEGREES_DATA.map((deg, idx) => {
      const norm = idx / 32;
      // Vertically climbing the pyramid from y = -3 to y = 2.8
      const yCoord = -3 + norm * 5.8;
      // Shrinking radius as we climb to form the pyramid taper
      const currentRadius = baseRadius * (1 - norm) * 0.85;
      // Spiral angle
      const angle = idx * 1.8;
      return new THREE.Vector3(
        Math.cos(angle) * currentRadius,
        yCoord,
        Math.sin(angle) * currentRadius
      );
    });
  }, [baseRadius]);

  return (
    <group ref={pyramidRef}>
      {/* Mosaic Pavement Checkerboard Floor under the pyramid */}
      {showTracingBoard && (
        <group position={[0, -2.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {Array.from({ length: 8 }).map((_, r) => (
            Array.from({ length: 8 }).map((_, c) => {
              const isWhite = (r + c) % 2 === 0;
              const size = 1.5;
              const xCoord = (c - 3.5) * size;
              const yCoord = (r - 3.5) * size;
              return (
                <mesh key={`mosaic-${r}-${c}`} position={[xCoord, yCoord, 0]}>
                  <planeGeometry args={[size * 0.95, size * 0.95]} />
                  <meshBasicMaterial 
                    color={isWhite ? '#fbbf24' : '#030712'} 
                    transparent 
                    opacity={isWhite ? 0.08 : 0.25} 
                  />
                </mesh>
              );
            })
          ))}
        </group>
      )}

      {/* 32 foundation line pathways */}
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (i / 32) * Math.PI * 2;
        const x = Math.cos(angle) * baseRadius;
        const z = Math.sin(angle) * baseRadius;
        const isLit = activeDegree === i + 1 || (secretionActive && secretionProgress * 32 > i);
        
        return (
          <Line
            key={i}
            points={[new THREE.Vector3(x, -3, z), new THREE.Vector3(0, 2.5, 0)]}
            color={isLit ? '#fbbf24' : '#1e1b4b'}
            lineWidth={isLit ? 2 : 0.8}
            transparent
            opacity={isLit ? 0.9 : 0.15}
          />
        );
      })}

      {/* Base triangular perimeter */}
      <Line points={basePoints} color="#312e81" lineWidth={1.5} transparent opacity={0.4} />

      {/* Toggleable Masonic Tracing Board overlay representing Jacob's Ladder ascending along 33 degrees */}
      {showTracingBoard && (
        <group>
          {/* Jacob's Ladder spine line */}
          <Line 
            points={ladderPoints} 
            color={activeGematriaColor} 
            lineWidth={2.5} 
            transparent 
            opacity={0.8} 
          />
          
          {/* Degree step connection links to central core */}
          {ladderPoints.map((point, i) => {
            const deg = DEGREES_DATA[i];
            const isCurrent = activeDegree === deg.deg;
            return (
              <Line 
                key={`connector-${deg.deg}`}
                points={[new THREE.Vector3(0, point.y, 0), point]}
                color={isCurrent ? activeGematriaColor : '#312e81'}
                lineWidth={isCurrent ? 2.0 : 1.0}
                transparent
                opacity={isCurrent ? 0.9 : 0.25}
              />
            );
          })}

          {/* Glowing 33 degrees sphere nodes */}
          {DEGREES_DATA.map((deg, i) => {
            const point = ladderPoints[i];
            const isCurrent = activeDegree === deg.deg;
            const frequencyColor = `hsl(${(deg.gematria * 7.5) % 360}, 90%, 60%)`;
            const nodeColor = isCurrent ? activeGematriaColor : frequencyColor;

            return (
              <group key={`masonic-node-${deg.deg}`} position={point}>
                <mesh 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (setActiveDegree) setActiveDegree(deg.deg);
                  }}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'auto';
                  }}
                >
                  <sphereGeometry args={[isCurrent ? 0.22 : 0.12, 16, 16]} />
                  <meshStandardMaterial 
                    color={nodeColor}
                    emissive={nodeColor}
                    emissiveIntensity={isCurrent ? 3.0 : 1.0}
                    toneMapped={false}
                  />
                </mesh>

                {/* Micro degree indicator labels inside R3F space */}
                {isCurrent && (
                  <Html distanceFactor={8} position={[0, 0.45, 0]} center>
                    <div 
                      className="px-2 py-1 rounded-md border text-[9px] font-mono whitespace-nowrap bg-black/95 text-white select-none transition-all duration-300 pointer-events-none"
                      style={{ 
                        borderColor: activeGematriaColor, 
                        boxShadow: `0 0 15px ${activeGematriaColor}50` 
                      }}
                    >
                      {deg.deg}°: {deg.name} (G-{deg.gematria})
                    </div>
                  </Html>
                )}
              </group>
            );
          })}
        </group>
      )}

      {/* Floating 33rd Degree Gilded Capstone */}
      <group position={[0, 0.4, 0]}>
        {/* Sacred Eye of Providence/Delta marker */}
        <mesh 
          position={[0, 3.8, 0]}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; setActiveDegree(33); }}
        >
          <coneGeometry args={[1.2, 2.2, 4]} />
          <meshStandardMaterial 
            color={activeDegree === 33 ? "#ffffff" : "#fbbf24"} 
            emissive="#d97706" 
            emissiveIntensity={secretionActive ? 5.0 : (activeDegree === 33 ? 4.0 : 1.2)} 
            wireframe 
          />
        </mesh>
        
        {/* Apex crown sphere */}
        <Sphere args={[activeDegree === 33 ? 0.35 : 0.25, 16, 16]} position={[0, 4.8, 0]}>
          <meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={activeDegree === 33 ? 8 : 3} />
        </Sphere>
        
        {/* Ambient Halo Ring representing Kether */}
        <mesh position={[0, 3.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.55, 64]} />
          <meshBasicMaterial color={activeDegree === 33 ? "#fff" : "#fbbf24"} transparent opacity={activeDegree === 33 ? 0.9 : 0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Zodiac Overlay Integration */}
      <ZodiacWheelOverlay data={data} showZodiac={showZodiac} />

      {/* Grid foundation */}
      <gridHelper args={[18, 18, '#312e81', '#111827']} position={[0, -3.01, 0]} />
    </group>
  );
};

// Double-headed phoenix/eagle visualizer nodes
const DoubleHeadedEaglePath = ({ activeDegree }: any) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
    }
  });

  // Construct wing coordinates left/right
  const leftWing = [
    new THREE.Vector3(-1.0, 0, 0.5),
    new THREE.Vector3(-2.8, 1.5, 0.8),
    new THREE.Vector3(-4.5, 3.2, 0.2),
    new THREE.Vector3(-5.2, 1.8, -0.6),
    new THREE.Vector3(-3.8, 0, -1.0),
    new THREE.Vector3(-2.0, -1.5, -0.5),
    new THREE.Vector3(-1.0, 0, 0.5)
  ];

  const rightWing = leftWing.map(p => new THREE.Vector3(-p.x, p.y, p.z));

  return (
    <group ref={groupRef}>
      <Line points={leftWing} color="#a855f7" lineWidth={2} transparent opacity={0.4} />
      <Line points={rightWing} color="#a855f7" lineWidth={2} transparent opacity={0.4} />
      
      {/* Wing feathers particles */}
      {leftWing.map((p, i) => (
        <group key={`feather-${i}`}>
          <Sphere args={[0.08, 8, 8]} position={[p.x, p.y, p.z]}>
            <meshStandardMaterial color="#8b5cf6" emissive="#c084fc" emissiveIntensity={0.8} />
          </Sphere>
          <Sphere args={[0.08, 8, 8]} position={[rightWing[i].x, rightWing[i].y, rightWing[i].z]}>
            <meshStandardMaterial color="#8b5cf6" emissive="#c084fc" emissiveIntensity={0.8} />
          </Sphere>
        </group>
      ))}

      {/* Symmetrical Crowns representing Dual heads */}
      <group position={[-0.8, 3.8, 0]}>
        <Sphere args={[0.08, 8, 8]}>
          <meshBasicMaterial color="#fbbf24" />
        </Sphere>
        <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.5, 0.3, 0.2)]} color="#fbbf24" lineWidth={1} />
      </group>
      <group position={[0.8, 3.8, 0]}>
        <Sphere args={[0.08, 8, 8]}>
          <meshBasicMaterial color="#fbbf24" />
        </Sphere>
        <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 0.3, 0.2)]} color="#fbbf24" lineWidth={1} />
      </group>
    </group>
  );
};

// Main Section Component
export const Freemason33Section = ({ data }: { data: CosmicData | null }) => {
  const { thoughts, feelings, experiences, coherence, alignment } = useHigherMind();
  
  const [activeTab, setActiveTab] = useState<'visuals' | 'degrees' | 'cipher' | 'columns' | 'tools'>('visuals');
  const [visualMode, setVisualMode] = useState<'pyramid' | 'spine' | 'phoenix'>('pyramid');
  const [activeDegree, setActiveDegree] = useState<number>(33);
  const [showTracingBoard, setShowTracingBoard] = useState(true);
  const [showZodiac, setShowZodiac] = useState(false);
  
  // Kundalini Secretion states
  const [secretionActive, setSecretionActive] = useState(false);
  const [secretionProgress, setSecretionProgress] = useState(0);
  const [humActive, setHumActive] = useState(false);

  // Masonic Gematria states
  const [cipherInput, setCipherInput] = useState('');
  const [cipherOutput, setCipherOutput] = useState<{ ordinal: number; reduction: number; resonance: boolean } | null>(null);
  const [showAdvancedGnosis, setShowAdvancedGnosis] = useState(false);

  // Focus degree detail
  const currentDegreeDetail = useMemo(() => {
    return DEGREES_DATA.find(d => d.deg === activeDegree) || DEGREES_DATA[32];
  }, [activeDegree]);

  // Dynamic Gematria Value Marker Color
  const gematriaColor = useMemo(() => {
    const freq = currentDegreeDetail.gematria;
    const hue = (freq * 7.5) % 360;
    return `hsl(${hue}, 90%, 65%)`;
  }, [currentDegreeDetail]);

  // Kundalini Secretion loop
  useEffect(() => {
    let timer: any;
    if (secretionActive) {
      timer = setInterval(() => {
        setSecretionProgress(p => {
          if (p >= 1) {
            setSecretionActive(false);
            return 1;
          }
          return p + 0.02; // slow rising rise
        });
      }, 50);
    } else {
      setSecretionProgress(0);
    }
    return () => clearInterval(timer);
  }, [secretionActive]);

  const toggleSecretion = () => {
    setSecretionActive(!secretionActive);
    setHumActive(true);
    setTimeout(() => setHumActive(false), 2400);
  };

  const calculateGematria = (text: string) => {
    if (!text.trim()) {
      setCipherOutput(null);
      return;
    }
    const cleanStr = text.toUpperCase().replace(/[^A-Z]/g, '');
    let ordinal = 0;
    
    for (let i = 0; i < cleanStr.length; i++) {
      ordinal += (cleanStr.charCodeAt(i) - 64);
    }

    // Digital Root/Reduction helper
    const getReduction = (val: number): number => {
      let currentVal = val;
      while (currentVal > 9) {
        if (currentVal === 11 || currentVal === 22 || currentVal === 33) {
          // Master numbers retained in esoteric systems
          return currentVal;
        }
        currentVal = currentVal.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
      }
      return currentVal;
    };

    const reduction = getReduction(ordinal);
    const resonance = ordinal === 33 || reduction === 33 || cleanStr.includes('MASON') || cleanStr.includes('G');

    setCipherOutput({ ordinal, reduction, resonance });
  };

  return (
    <div className="w-full text-white space-y-6">
      
      {/* Immersive Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/20 via-black to-slate-950 border border-white/5 p-6 rounded-3xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Sovereign Council v2.0
            </span>
            <h2 className="text-2xl font-light tracking-wide uppercase">
              The Masonic <span className="font-semibold text-amber-300">33rd Degree</span> Gnosis
            </h2>
            <p className="text-xs text-stone-400 max-w-xl">
              An advanced spatial visualizer fusing Scottish Rite alphanumeric ciphers, Cartesian geometry, and Kundalini biological resonance.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
            <Shield className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <div className="text-[9px] uppercase text-stone-500 tracking-widest">Macro-Architect</div>
              <div className="text-xs font-mono font-bold text-emerald-400">COHERENCE: {Math.floor(coherence * 100)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('visuals')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'visuals' ? 'border-amber-400 text-amber-300 bg-white/5' : 'border-transparent text-stone-400 hover:text-white'}`}
        >
          <Compass className="w-4 h-4" />
          3D Great Architect
        </button>
        <button 
          onClick={() => setActiveTab('degrees')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'degrees' ? 'border-amber-400 text-amber-300 bg-white/5' : 'border-transparent text-stone-400 hover:text-white'}`}
        >
          <Award className="w-4 h-4" />
          The 33 Degrees
        </button>
        <button 
          onClick={() => setActiveTab('cipher')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'cipher' ? 'border-amber-400 text-amber-300 bg-white/5' : 'border-transparent text-stone-400 hover:text-white'}`}
        >
          <Key className="w-4 h-4" />
          Alphanumeric Cipher
        </button>
        <button 
          onClick={() => setActiveTab('columns')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'columns' ? 'border-amber-400 text-amber-300 bg-white/5' : 'border-transparent text-stone-400 hover:text-white'}`}
        >
          <Cpu className="w-4 h-4" />
          Triple Column Sync
        </button>
        <button 
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-mono text-xs uppercase tracking-widest transition-all ${activeTab === 'tools' ? 'border-amber-400 text-amber-300 bg-white/5' : 'border-transparent text-stone-400 hover:text-white'}`}
        >
          <Sparkles className="w-4 h-4" />
          Occult Tools
        </button>
      </div>

      {/* Active Tab Screen Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: 3D Visualization Canvas (Spans 7 Cols in Visuals mode) */}
        <div className={`col-span-1 lg:col-span-12 ${activeTab === 'visuals' ? 'lg:col-span-7' : 'lg:col-span-6'} flex flex-col`}>
          <div className="bg-black/40 border border-white/5 rounded-3xl p-4 flex-1 flex flex-col min-h-[500px] relative">
            
            {/* 3D Visualizer Modes toggle triggers */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 bg-black/60 border border-white/10 p-1 rounded-xl">
              <button 
                onClick={() => setVisualMode('pyramid')}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all ${visualMode === 'pyramid' ? 'bg-amber-400 text-black font-extrabold' : 'hover:bg-white/5 text-stone-400'}`}
              >
                Pyramid (33 Apex)
              </button>
              <button 
                onClick={() => setVisualMode('spine')}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all ${visualMode === 'spine' ? 'bg-amber-400 text-black font-extrabold' : 'hover:bg-white/5 text-stone-400'}`}
              >
                Kundalini Spine (33 Segs)
              </button>
              <button 
                onClick={() => setVisualMode('phoenix')}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all ${visualMode === 'phoenix' ? 'bg-amber-400 text-black font-extrabold' : 'hover:bg-white/5 text-stone-400'}`}
              >
                Double-Headed Wing
              </button>
              
              {visualMode === 'pyramid' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowTracingBoard(!showTracingBoard)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all ${showTracingBoard ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold' : 'hover:bg-white/5 text-stone-500'}`}
                  >
                    📜 Tracing Board {showTracingBoard ? 'ON' : 'OFF'}
                  </button>
                  <button 
                    onClick={() => setShowZodiac(!showZodiac)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all ${showZodiac ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 font-semibold' : 'hover:bg-white/5 text-stone-500'}`}
                  >
                    ✨ Zodiac Overlay {showZodiac ? 'ON' : 'OFF'}
                  </button>
                </div>
              )}
            </div>

            {/* Secretion rising active button */}
            {visualMode === 'spine' && (
              <button 
                onClick={toggleSecretion}
                className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest rounded-xl transition-all"
              >
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                {secretionActive ? "Rising..." : "Raise Secretion"}
              </button>
            )}

            {/* Advanced Gnosis Toggle */}
            <button 
                onClick={() => setShowAdvancedGnosis(!showAdvancedGnosis)}
                className={`absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 border font-mono uppercase tracking-widest rounded-xl transition-all text-[10px] ${showAdvancedGnosis ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-black/60 border-white/10 text-stone-400 hover:bg-white/5'}`}
            >
                <Sparkles className="w-3.5 h-3.5" />
                {showAdvancedGnosis ? "Hide Gnosis" : "Unlock 33° Gnosis"}
            </button>

            {/* 3D Canvas element wrapper */}
            <div id="celestial-body-blueprint" className="relative w-full flex-1 min-h-[400px] rounded-3xl overflow-hidden border border-white/5 bg-black/20 mt-12 sm:mt-0">
              
              {/* Advanced Gnosis Dashboard Panel */}
              <AnimatePresence>
                {showAdvancedGnosis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute inset-4 z-50 bg-black/95 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm overflow-y-auto"
                  >
                    <h3 className="text-xl font-light text-purple-300 mb-4 tracking-wider uppercase border-b border-purple-500/20 pb-2">33° Sovereign Grand Inspector General: Occult Synthesis</h3>
                    <div className="space-y-4 text-xs text-stone-300 font-light leading-relaxed">
                        <p>The 33rd Degree is not merely a rank; it is the Crown of the Scottish Rite, representing the absolute synthesis of all preceding symbols and intellectual constructs. In the occult tradition, it marks the intersection of Kether (The Divine Crown) and the hidden Da'at, where knowledge becomes pure, conscious light.</p>
                        <p>The Gematria value of 333 (as synthesized here) represents the resonance of the Triple Logos—Creation, Preservation, Destruction—integrated and harmonized. The Inspector General is tasked with overseeing the "Great Work" not as a master of others, but as a master of the inner mechanics of the cosmic engine.</p>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="border border-white/10 p-4 rounded-xl">
                                <h4 className="text-[10px] uppercase font-bold text-amber-500 font-mono mb-2">The Apex Geometry</h4>
                                <p className="text-[10px]">The capstone of the pyramid represents the ego transcended, the point where binary dualities resolve into the unity of the Divine.</p>
                            </div>
                            <div className="border border-white/10 p-4 rounded-xl">
                                <h4 className="text-[10px] uppercase font-bold text-purple-500 font-mono mb-2">Biological Alchemy</h4>
                                <p className="text-[10px]">Represented by the Kundalini spine, the 33rd degree is the final distillation of the sacred secretion in the brain, unlocking multidimensional perception.</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowAdvancedGnosis(false)}
                        className="mt-6 w-full py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 uppercase font-mono tracking-widest text-[10px] rounded-xl hover:bg-purple-500/30 transition-all"
                    >
                        Close Synthesis
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Toggleable Masonic Tracing Board HUD Overlay */}
              {showTracingBoard && visualMode === 'pyramid' && (
                <div className="geometry-overlay absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 bg-[radial-gradient(circle_at_center,_transparent_45%,_rgba(0,0,0,0.6))]">
                  <div className="flex justify-between items-start">
                    <div className="bg-black/95 border border-amber-500/20 px-3 py-1.5 rounded-xl font-mono text-[9px] text-amber-400 flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      TRACING BOARD ACTIVE: GEOMETRY OVERLAY
                    </div>
                    <div className="bg-black/95 border border-indigo-500/25 px-3 py-1.5 rounded-xl font-mono text-[9px] text-indigo-300 shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
                      LADDER OF 33 DEGREES
                    </div>
                  </div>
                  
                  {/* Dynamic Gematria Value Marker */}
                  <div className="self-end flex items-center gap-2.5 bg-black/95 border border-white/10 p-3 rounded-2xl pointer-events-auto shadow-[0_6px_20px_rgba(0,0,0,0.8)]">
                    <div className="text-left select-none">
                      <div className="text-[7.5px] uppercase font-mono text-stone-500">Masonic Frequency</div>
                      <div className="text-[9.5px] font-semibold text-stone-300 uppercase leading-none">Ordinal Resonance</div>
                    </div>
                    <div 
                      className="px-3 py-1.5 rounded-xl font-mono font-bold text-center text-xs transition-all duration-300"
                      style={{ 
                        backgroundColor: `${gematriaColor}1c`, 
                        color: gematriaColor, 
                        borderColor: gematriaColor,
                        borderWidth: '1.5px',
                        boxShadow: `0 0 15px ${gematriaColor}40`
                      }}
                    >
                      G - {currentDegreeDetail.gematria}
                    </div>
                  </div>
                </div>
              )}

              <Canvas camera={{ position: [0, 0, 11], fov: 60 }}>
                <ambientLight intensity={0.15} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
                
                {visualMode === 'pyramid' && (
                  <PyramidOfGnosis 
                    activeDegree={activeDegree} 
                    setActiveDegree={setActiveDegree}
                    secretionActive={secretionActive}
                    secretionProgress={secretionProgress}
                    showTracingBoard={showTracingBoard}
                    showZodiac={showZodiac}
                    data={data}
                    activeGematriaColor={gematriaColor}
                  />
                )}
                
                {visualMode === 'spine' && (
                  <SpinalAscent 
                    activeDegree={activeDegree} 
                    setActiveDegree={setActiveDegree} 
                    secretionProgress={secretionProgress}
                    secretionActive={secretionActive}
                  />
                )}

                {visualMode === 'phoenix' && (
                  <DoubleHeadedEaglePath activeDegree={activeDegree} />
                )}

                <OrbitControls enableZoom={true} maxDistance={20} minDistance={5} />
              </Canvas>
            </div>

            {/* Sound Hum activation overlay feedback */}
            <AnimatePresence>
              {humActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-4 left-4 right-4 bg-amber-400 text-black py-2 rounded-2xl font-mono text-[10px] text-center font-bold tracking-widest"
                >
                  🔊 VIBRATIONAL RE-ALIGNMENT ACTIVATING at 528 Hz (Crown Gnosis)
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center text-[10px] text-stone-500 mt-2 font-mono">
              ★ Left-click + drag to rotate. Mouse-wheel to zoom. Click node elements to explore.
            </div>
          </div>
        </div>

        {/* Right Side Info Boards (Spans 5 Columns) */}
        <div className={`col-span-1 lg:col-span-12 ${activeTab === 'visuals' ? 'lg:col-span-5' : 'lg:col-span-6'} flex flex-col gap-6`}>
          
          {activeTab === 'visuals' && (
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-start h-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-black text-lg bg-gradient-to-tr from-amber-400 to-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                      {currentDegreeDetail.deg}°
                    </div>
                    <div>
                      <h4 className="text-lg font-light leading-snug">{currentDegreeDetail.name}</h4>
                      <span className="text-[9px] uppercase font-mono tracking-wider text-amber-400 font-bold">Scottish Rite Occult Gnosis</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-stone-500">Gematria Resonance</div>
                    <div 
                      className="text-md font-mono font-extrabold transition-all duration-300"
                      style={{ color: gematriaColor }}
                    >
                      {currentDegreeDetail.gematria}
                    </div>
                  </div>
                </div>

                {/* In-depth Occult Explanatory Content */}
                <div className="space-y-4 pt-2">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <h5 className="text-[10px] uppercase font-bold text-amber-500 font-mono mb-2">Metaphysical Domain</h5>
                      <p className="text-xs text-stone-300 leading-relaxed text-light">{currentDegreeDetail.desc}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-purple-900/20 border border-purple-500/20 p-3 rounded-xl">
                        <h5 className="text-[9px] uppercase font-bold text-purple-400 mb-1">Planetary Ruler</h5>
                        <p className="text-sm font-mono text-purple-100">{currentDegreeDetail.ruler}</p>
                      </div>
                      <div className="bg-indigo-900/20 border border-indigo-500/20 p-3 rounded-xl">
                        <h5 className="text-[9px] uppercase font-bold text-indigo-400 mb-1">Sephirotic Path</h5>
                        <p className="text-sm font-mono text-indigo-100">{currentDegreeDetail.sephirah}</p>
                      </div>
                    </div>
                    
                    <div className="border border-white/5 p-4 rounded-xl bg-black/30">
                       <h5 className="text-[10px] uppercase font-bold text-stone-500 mb-2 font-mono">Occult Synthesis</h5>
                       <p className="text-xs text-stone-400 italic">"The {currentDegreeDetail.name} degree invites the practitioner to contemplate the intersection of {currentDegreeDetail.ruler} and {currentDegreeDetail.sephirah}, unfolding the mysteries of the {currentDegreeDetail.deg}{degSuffix(currentDegreeDetail.deg)} vibration within the Great Work."</p>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-start h-full">
                <h4 className="text-lg font-light leading-snug mb-6">Masonic Visual Intelligence</h4>
                <MasonicVisualTools />
            </div>
          )}

          {/* Full List Tab View */}
          {activeTab === 'degrees' && (
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col h-full max-h-[600px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <h4 className="text-md uppercase font-mono tracking-wider">The Scottish Rite Ladder</h4>
                <div className="text-[10px] text-amber-400 font-mono">33 Degrees of Sovereignty</div>
              </div>
              
              {/* Scrollable container list */}
              <div className="overflow-y-auto space-y-2 pr-2 flex-1 scrollbar-thin scrollbar-thumb-stone-800">
                {DEGREES_DATA.map((deg) => (
                  <div 
                    key={deg.deg}
                    onClick={() => setActiveDegree(deg.deg)}
                    className={`flex items-center justify-between px-4 py-3 bg-white/5 border rounded-2xl hover:bg-white/10 transition-all cursor-pointer ${activeDegree === deg.deg ? 'border-amber-400/40 bg-amber-500/5' : 'border-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${activeDegree === deg.deg ? 'bg-amber-400 text-black' : 'bg-white/5 text-stone-300'}`}>
                        {deg.deg}
                      </span>
                      <div>
                        <div className={`text-xs font-semibold ${activeDegree === deg.deg ? 'text-amber-300' : 'text-white'}`}>{deg.name}</div>
                        <div className="text-[9px] text-stone-500 uppercase font-mono mt-0.5">{deg.sephirah} • {deg.ruler}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-400">G: {deg.gematria}</span>
                      <ChevronRight className="w-4 h-4 text-stone-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cipher Tab View */}
          {activeTab === 'cipher' && (
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col space-y-4">
              <h4 className="text-md uppercase font-mono tracking-wider">Alphanumeric Masonic Decoder</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-light">
                Calculate the English Ordinal values of your words to reveal Masonic/Gnostics resonances.
              </p>

              <div className="space-y-2">
                <input 
                  type="text"
                  placeholder="Enter word, phrase or divine name..."
                  value={cipherInput}
                  onChange={(e) => {
                    setCipherInput(e.target.value);
                    calculateGematria(e.target.value);
                  }}
                  className="w-full bg-black/60 border border-white/10 px-4 py-3 rounded-2xl text-xs font-mono tracking-wider focus:outline-none focus:border-amber-400"
                />
              </div>

              {cipherOutput ? (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-stone-500">English Ordinal Mapping</span>
                      <div className="text-xl font-mono text-amber-400 font-bold">{cipherOutput.ordinal}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-mono text-stone-500">Esoteric Reduction</span>
                      <div className="text-xl font-mono text-fuchsia-400 font-bold">{cipherOutput.reduction}</div>
                    </div>
                  </div>

                  {cipherOutput.resonance ? (
                    <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-left text-[11px] text-emerald-300 leading-relaxed">
                        <strong>Sacred Alignment Discovered!</strong> This phrase resonates with the core numerical 33 architecture or direct master mason signatures. Unlocking supernal gates...
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/5 rounded-xl text-left text-[11px] text-stone-400 line-normal">
                      This word carries a frequency of {cipherOutput.ordinal} Hz. To synchronize with the 33rd crown vibration, focus on phrases scaling to factors of 3, 11, or 22.
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] text-stone-500 font-mono">
                    <div>Letters count: {cipherInput.replace(/[^A-Za-z]/g, '').length}</div>
                    <div>Chaldean scale: {(cipherOutput.ordinal * 1.618).toFixed(1)}</div>
                  </div>
                </div>
              ) : (
                <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center text-xs text-stone-500 italic">
                  Input a phrase to align the spatial vectors.
                </div>
              )}
            </div>
          )}

          {/* Higher Mind Columns of Boaz, Jachin & Unified Ascent */}
          {activeTab === 'columns' && (
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col space-y-4">
              <h4 className="text-md uppercase font-mono tracking-wider">The Triple Columns of Gnosis</h4>
              <p className="text-xs text-stone-400 leading-relaxed font-light">
                Esoterically, the Masonic lodge is anchored by Boaz (Strength, Left/Severity) and Jachin (Establishment, Right/Mercy). Together with the Central Spine, they match the Three Streams of the Higher Mind.
              </p>

              <div className="space-y-3">
                {/* Boaz Column / Strength */}
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-red-400 font-semibold uppercase tracking-wider">BOAZ COLUMN (Strength) • thoughts</span>
                    <span className="text-xs font-bold text-red-400">{thoughts.length} Nodes</span>
                  </div>
                  <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, thoughts.length * 15)}%` }} />
                  </div>
                </div>

                {/* Jachin Column / Beauty */}
                <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-blue-400 font-semibold uppercase tracking-wider">JACHIN COLUMN (Beauty) • feelings</span>
                    <span className="text-xs font-bold text-blue-400">{feelings.length} Vibrations</span>
                  </div>
                  <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, feelings.length * 15)}%` }} />
                  </div>
                </div>

                {/* Central Column / Wisdom */}
                <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider">MIDDLE PATH (Wisdom) • experiences</span>
                    <span className="text-xs font-bold text-amber-400">{experiences.length} Landmarks</span>
                  </div>
                  <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, experiences.length * 15)}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-stone-500 font-mono text-[9px] uppercase">Architectural Alignment Ratio</span>
                <span className="text-emerald-400 font-mono font-bold">{(coherence * 1.618).toFixed(3)} PHI</span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
