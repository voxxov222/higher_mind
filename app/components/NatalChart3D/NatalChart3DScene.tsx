import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, Line, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { 
  NatalPlanet, NatalAspect, NatalChartProfile, ZODIAC_SIGNS, SIGN_INFO 
} from './natalChartData';
import { soundEngine } from '../../lib/soundEffects';

interface NatalChart3DSceneProps {
  chart: NatalChartProfile;
  selectedPlanet: NatalPlanet | null;
  onSelectPlanet: (planet: NatalPlanet | null) => void;
  selectedAspect: NatalAspect | null;
  onSelectAspect: (aspect: NatalAspect | null) => void;
  aspectFilter: 'all' | 'harmonious' | 'dynamic' | 'selected' | 'major';
  isAutoRotate: boolean;
  rotationSpeed: number;
  viewPerspective: 'angle' | 'top' | 'side';
  showHouseLabels: boolean;
  showDegrees: boolean;
  arcHeightMultiplier: number;
}

const DISC_RADIUS_BASE = 32;
const ZODIAC_RING_INNER = 16;
const ZODIAC_RING_OUTER = 22;
const HOUSES_RING_INNER = 22;
const HOUSES_RING_OUTER = 27;
const PLANET_ORBIT_RADIUS = 28.5;

// Convert astrological total degree (0-360) into 3D Cartesian coordinates on the X-Z plane
export function degreeToVector3(totalDegree: number, radius: number, y: number = 0): THREE.Vector3 {
  // In astrology wheels, Aries 0° is traditionally at 9 o'clock (East/Ascendant) or top
  // Here we map standard counter-clockwise:
  // Angle in radians (inverted for standard astronomical counter-clockwise view)
  const rad = -((totalDegree - 180) * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const z = Math.sin(rad) * radius;
  return new THREE.Vector3(x, y, z);
}

// Generates smooth 3D points for a vertical parabolic arch bridging two points
export function generateParabolicCurvePoints(
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  peakHeight: number, 
  segments: number = 48
): [number, number, number][] {
  const points: [number, number, number][] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = start.x + t * (end.x - start.x);
    const z = start.z + t * (end.z - start.z);
    // Parabolic arc formula: y = 4 * h * t * (1 - t)
    const y = 4 * peakHeight * t * (1 - t);
    points.push([x, y, z]);
  }
  
  return points;
}

// -------------------------------------------------------------
// 1. Central Sacred Geometry Core (Mandala Starburst Hub)
// -------------------------------------------------------------
const CentralMandalaHub: React.FC<{ selectedPlanet: NatalPlanet | null }> = ({ selectedPlanet }) => {
  const hubRef = useRef<THREE.Group>(null);
  const glowRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (hubRef.current) {
      hubRef.current.rotation.y += delta * 0.05;
    }
    if (glowRingRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
      glowRingRef.current.scale.set(s, s, s);
    }
  });

  const spokeRays = useMemo(() => {
    const rays: [number, number, number][][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const x = Math.cos(angle) * (ZODIAC_RING_INNER - 1);
      const z = Math.sin(angle) * (ZODIAC_RING_INNER - 1);
      rays.push([[0, 0.1, 0], [x, 0.1, z]]);
    }
    return rays;
  }, []);

  return (
    <group ref={hubRef}>
      {/* Dark metallic central basin */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[ZODIAC_RING_INNER - 0.5, ZODIAC_RING_INNER - 0.5, 0.4, 64]} />
        <meshStandardMaterial 
          color="#07090e" 
          roughness={0.4} 
          metalness={0.9} 
        />
      </mesh>

      {/* Inner glowing cyan concentric rings */}
      {[3, 6, 9, 12, 15].map((r, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[r - 0.08, r, 64]} />
          <meshBasicMaterial 
            color="#00e5ff" 
            transparent 
            opacity={idx === 4 ? 0.6 : 0.25} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      ))}

      {/* 12 Radiant Spokes */}
      {spokeRays.map((pts, i) => (
        <Line 
          key={i} 
          points={pts} 
          color="#00e5ff" 
          lineWidth={1.2} 
          transparent 
          opacity={0.35} 
        />
      ))}

      {/* Central Glowing Sigil Core */}
      <mesh ref={glowRingRef} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.8, 32]} />
        <meshBasicMaterial 
          color="#00e5ff" 
          transparent 
          opacity={0.8} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      <pointLight 
        position={[0, 1.5, 0]} 
        color="#00e5ff" 
        intensity={selectedPlanet ? 3.5 : 2} 
        distance={25} 
      />
    </group>
  );
};

// -------------------------------------------------------------
// 2. Zodiac Ring with Luminous Cyan Glyphs
// -------------------------------------------------------------
const ZodiacRingDisc: React.FC = () => {
  return (
    <group>
      {/* Stepped metallic disc segment */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[ZODIAC_RING_OUTER, ZODIAC_RING_OUTER, 0.4, 96]} />
        <meshStandardMaterial 
          color="#0b0f19" 
          roughness={0.3} 
          metalness={0.85} 
        />
      </mesh>

      {/* Segment Dividers between the 12 Signs */}
      {Array.from({ length: 12 }).map((_, i) => {
        const rad = -((i * 30 - 180) * Math.PI) / 180;
        const x1 = Math.cos(rad) * ZODIAC_RING_INNER;
        const z1 = Math.sin(rad) * ZODIAC_RING_INNER;
        const x2 = Math.cos(rad) * ZODIAC_RING_OUTER;
        const z2 = Math.sin(rad) * ZODIAC_RING_OUTER;

        return (
          <Line 
            key={i} 
            points={[[x1, 0.15, z1], [x2, 0.15, z2]]} 
            color="#00e5ff" 
            lineWidth={1.5} 
            transparent 
            opacity={0.5} 
          />
        );
      })}

      {/* 12 Zodiac Neon Glyphs */}
      {ZODIAC_SIGNS.map((sign, index) => {
        const midDegree = index * 30 + 15;
        const rad = -((midDegree - 180) * Math.PI) / 180;
        const r = (ZODIAC_RING_INNER + ZODIAC_RING_OUTER) / 2;
        const x = Math.cos(rad) * r;
        const z = Math.sin(rad) * r;
        const info = SIGN_INFO[sign];

        return (
          <group key={sign} position={[x, 0.2, z]}>
            {/* Luminous Zodiac Symbol */}
            <Text
              fontSize={1.4}
              color="#00f0ff"
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, -rad + Math.PI / 2]}
              outlineWidth={0.03}
              outlineColor="#00384d"
            >
              {info.symbol}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// -------------------------------------------------------------
// 3. Astrological Houses Tier with Prominent Cyan Numerals
// -------------------------------------------------------------
const HousesTierRing: React.FC<{ 
  houses: NatalChartProfile['houses'];
  showLabels: boolean;
}> = ({ houses, showLabels }) => {
  return (
    <group>
      {/* Elevated stepped collar */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[HOUSES_RING_OUTER, HOUSES_RING_OUTER, 0.45, 96]} />
        <meshStandardMaterial 
          color="#090d16" 
          roughness={0.25} 
          metalness={0.9} 
        />
      </mesh>

      {/* House Dividers / Cusps */}
      {Array.from({ length: 12 }).map((_, i) => {
        const rad = -((i * 30 - 180) * Math.PI) / 180;
        const x1 = Math.cos(rad) * HOUSES_RING_INNER;
        const z1 = Math.sin(rad) * HOUSES_RING_INNER;
        const x2 = Math.cos(rad) * (HOUSES_RING_OUTER + 0.5);
        const z2 = Math.sin(rad) * (HOUSES_RING_OUTER + 0.5);

        // Cardinal cusps (1=ASC, 4=IC, 7=DSC, 10=MC) get glowing cyan highlight
        const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;

        return (
          <group key={i}>
            <Line 
              points={[[x1, 0.2, z1], [x2, 0.2, z2]]} 
              color={isCardinal ? "#00ffff" : "#00a3cc"} 
              lineWidth={isCardinal ? 2.5 : 1.2} 
              transparent 
              opacity={isCardinal ? 0.9 : 0.4} 
            />
          </group>
        );
      })}

      {/* House Numbers 1 to 12 in Cyan Neon */}
      {Array.from({ length: 12 }).map((_, i) => {
        const houseNum = i + 1;
        const midDegree = i * 30 + 15;
        const rad = -((midDegree - 180) * Math.PI) / 180;
        const r = (HOUSES_RING_INNER + HOUSES_RING_OUTER) / 2;
        const x = Math.cos(rad) * r;
        const z = Math.sin(rad) * r;

        return (
          <group key={houseNum} position={[x, 0.25, z]}>
            <Text
              fontSize={1.15}
              color="#00f5ff"
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, -rad + Math.PI / 2]}
              outlineWidth={0.03}
              outlineColor="#002433"
            >
              {houseNum.toString()}
            </Text>
          </group>
        );
      })}

      {/* Prominent Cardinal Badges: ASC, IC, DSC, MC */}
      {[
        { label: 'ASC', degree: 0, color: '#00f5ff' },
        { label: 'IC', degree: 90, color: '#38bdf8' },
        { label: 'DSC', degree: 180, color: '#00f5ff' },
        { label: 'MC', degree: 270, color: '#38bdf8' },
      ].map((cardinal) => {
        const rad = -((cardinal.degree - 180) * Math.PI) / 180;
        const r = HOUSES_RING_OUTER + 1.2;
        const x = Math.cos(rad) * r;
        const z = Math.sin(rad) * r;

        return (
          <group key={cardinal.label} position={[x, 0.3, z]}>
            <Text
              fontSize={0.9}
              color={cardinal.color}
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, -rad + Math.PI / 2]}
              outlineWidth={0.04}
              outlineColor="#001824"
            >
              {cardinal.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// -------------------------------------------------------------
// 4. Outer Perimeter Beveled Track with Degree Ticks
// -------------------------------------------------------------
const OuterPerimeterRing: React.FC = () => {
  const tickLines = useMemo(() => {
    const lines: { pts: [number, number, number][]; color: string; width: number }[] = [];
    for (let deg = 0; deg < 360; deg += 2) {
      const rad = -((deg - 180) * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const isMedium = deg % 10 === 0;
      const innerR = HOUSES_RING_OUTER + 0.2;
      const outerR = isMajor ? innerR + 1.2 : isMedium ? innerR + 0.8 : innerR + 0.4;
      
      lines.push({
        pts: [
          [Math.cos(rad) * innerR, 0.1, Math.sin(rad) * innerR],
          [Math.cos(rad) * outerR, 0.1, Math.sin(rad) * outerR],
        ],
        color: isMajor ? '#00f5ff' : isMedium ? '#00b4d8' : '#0077b6',
        width: isMajor ? 2 : 1,
      });
    }
    return lines;
  }, []);

  return (
    <group>
      {/* Outer rim plate */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[DISC_RADIUS_BASE, DISC_RADIUS_BASE, 0.5, 96]} />
        <meshStandardMaterial 
          color="#05070c" 
          roughness={0.4} 
          metalness={0.95} 
        />
      </mesh>

      {/* Degree ticks */}
      {tickLines.map((t, i) => (
        <Line 
          key={i} 
          points={t.pts} 
          color={t.color} 
          lineWidth={t.width} 
          transparent 
          opacity={0.6} 
        />
      ))}

      {/* Outer Cyan Boundary Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <ringGeometry args={[DISC_RADIUS_BASE - 0.2, DISC_RADIUS_BASE, 96]} />
        <meshBasicMaterial 
          color="#00e5ff" 
          transparent 
          opacity={0.7} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
};

// -------------------------------------------------------------
// 5. 3D Celestial Body Sphere & Glyph Billboard
// -------------------------------------------------------------
const CelestialPlanetSphere: React.FC<{
  planet: NatalPlanet;
  isSelected: boolean;
  onSelect: (planet: NatalPlanet) => void;
  showDegree: boolean;
}> = ({ planet, isSelected, onSelect, showDegree }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => degreeToVector3(planet.totalDegree, PLANET_ORBIT_RADIUS, 0.6), [planet.totalDegree]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      if (planet.name === 'Sun') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.08;
        meshRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  const isSun = planet.name === 'Sun';
  const isSaturn = planet.name === 'Saturn';
  const size = isSun ? 1.3 : isSelected || hovered ? 1.1 : 0.85;

  return (
    <group position={pos}>
      {/* Anchor tether to the wheel surface */}
      <Line 
        points={[[0, -0.6, 0], [0, 0, 0]]} 
        color={planet.color} 
        lineWidth={1.5} 
        transparent 
        opacity={0.6} 
      />

      {/* Selection / Hover Aura Ring */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <ringGeometry args={[size * 1.3, size * 1.6, 32]} />
          <meshBasicMaterial 
            color={planet.glowColor} 
            transparent 
            opacity={0.8} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}

      {/* Interactive Planet Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          soundEngine.select();
          onSelect(planet);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={planet.color} 
          emissive={planet.glowColor} 
          emissiveIntensity={isSun ? 3.0 : isSelected || hovered ? 2.2 : 1.2} 
          roughness={0.2} 
          metalness={0.7} 
        />

        {/* Saturn's Iconic Rings */}
        {isSaturn && (
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[size * 1.4, size * 2.2, 32]} />
            <meshStandardMaterial 
              color="#eab308" 
              emissive="#ca8a04" 
              emissiveIntensity={0.6} 
              transparent 
              opacity={0.85} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        )}
      </mesh>

      {/* Point Light for radiant bodies */}
      <pointLight 
        color={planet.glowColor} 
        intensity={isSelected ? 4 : isSun ? 3 : 1} 
        distance={12} 
      />

      {/* Floating Glyph & Label Billboard */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3} position={[0, size + 1.2, 0]}>
        <group>
          {/* Luminous Glyph Symbol */}
          <Text
            fontSize={1.1}
            color={isSelected ? '#ffffff' : planet.color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            {planet.symbol}
          </Text>

          {/* Planet Name */}
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.55}
            color="#ffffff"
            anchorX="center"
            anchorY="top"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {planet.name}
          </Text>

          {/* Degree & Sign Cusp Readout */}
          {showDegree && (
            <Text
              position={[0, -1.0, 0]}
              fontSize={0.45}
              color={planet.glowColor}
              anchorX="center"
              anchorY="top"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {`${Math.floor(planet.degree)}° ${planet.signSymbol}`}
            </Text>
          )}
        </group>
      </Float>
    </group>
  );
};

// -------------------------------------------------------------
// 6. The Signature 3D Parabolic Aspect Arc with Traveling Pulse
// -------------------------------------------------------------
const ParabolicAspectArc: React.FC<{
  aspect: NatalAspect;
  planet1: NatalPlanet | undefined;
  planet2: NatalPlanet | undefined;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (aspect: NatalAspect) => void;
  arcHeightMultiplier: number;
}> = ({ aspect, planet1, planet2, isSelected, isDimmed, onSelect, arcHeightMultiplier }) => {
  const [hovered, setHovered] = useState(false);
  const pulseSphereRef = useRef<THREE.Mesh>(null);
  
  if (!planet1 || !planet2) return null;

  const start = useMemo(() => degreeToVector3(planet1.totalDegree, PLANET_ORBIT_RADIUS, 0.6), [planet1.totalDegree]);
  const end = useMemo(() => degreeToVector3(planet2.totalDegree, PLANET_ORBIT_RADIUS, 0.6), [planet2.totalDegree]);
  const peakHeight = aspect.arcHeight * arcHeightMultiplier;

  // 48-segment smooth 3D parabolic catenary arch
  const curvePoints = useMemo(() => {
    return generateParabolicCurvePoints(start, end, peakHeight, 48);
  }, [start, end, peakHeight]);

  // Animated pulse along the parabolic curve
  useFrame((state) => {
    if (pulseSphereRef.current) {
      // Periodic phase oscillation
      const t = (Math.sin(state.clock.elapsedTime * 1.5 + aspect.angle) + 1) / 2;
      const x = start.x + t * (end.x - start.x);
      const z = start.z + t * (end.z - start.z);
      const y = 4 * peakHeight * t * (1 - t) + 0.6;
      pulseSphereRef.current.position.set(x, y, z);
    }
  });

  const opacity = isDimmed ? 0.12 : isSelected || hovered ? 0.95 : 0.65;
  const lineWidth = isSelected || hovered ? 3.5 : 2.0;

  return (
    <group>
      {/* 3D Curved Arch Line */}
      <Line
        points={curvePoints}
        color={aspect.color}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        onClick={(e) => {
          e.stopPropagation();
          soundEngine.select();
          onSelect(aspect);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      />

      {/* Traveling Luminous Energy Pulse */}
      {!isDimmed && (
        <mesh ref={pulseSphereRef}>
          <sphereGeometry args={[isSelected || hovered ? 0.45 : 0.28, 16, 16]} />
          <meshBasicMaterial 
            color={aspect.color} 
            transparent 
            opacity={0.9} 
          />
        </mesh>
      )}
    </group>
  );
};

// -------------------------------------------------------------
// 7. Master Natal Chart 3D Scene Wrapper
// -------------------------------------------------------------
export const NatalChart3DScene: React.FC<NatalChart3DSceneProps> = ({
  chart,
  selectedPlanet,
  onSelectPlanet,
  selectedAspect,
  onSelectAspect,
  aspectFilter,
  isAutoRotate,
  rotationSpeed,
  viewPerspective,
  showHouseLabels,
  showDegrees,
  arcHeightMultiplier,
}) => {
  const wheelGroupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Handle camera perspective transitions smoothly
  React.useEffect(() => {
    if (!controlsRef.current) return;
    if (viewPerspective === 'top') {
      camera.position.set(0, 75, 0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (viewPerspective === 'side') {
      camera.position.set(0, 12, 60);
      controlsRef.current.target.set(0, 4, 0);
    } else {
      // Standard angled astrolabe perspective (as seen in the reference video!)
      camera.position.set(0, 42, 48);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  }, [viewPerspective, camera]);

  // Slow continuous rotation around celestial axis
  useFrame((_, delta) => {
    if (wheelGroupRef.current && isAutoRotate) {
      wheelGroupRef.current.rotation.y += delta * 0.08 * rotationSpeed;
    }
  });

  // Filter aspects based on user selection
  const filteredAspects = useMemo(() => {
    return chart.aspects.filter(a => {
      if (aspectFilter === 'harmonious') return a.type === 'trine' || a.type === 'sextile';
      if (aspectFilter === 'dynamic') return a.type === 'square' || a.type === 'opposition';
      if (aspectFilter === 'major') return a.type === 'conjunction' || a.type === 'opposition' || a.type === 'trine';
      if (aspectFilter === 'selected' && selectedPlanet) {
        return a.planet1.toLowerCase() === selectedPlanet.name.toLowerCase() ||
               a.planet2.toLowerCase() === selectedPlanet.name.toLowerCase();
      }
      return true;
    });
  }, [chart.aspects, aspectFilter, selectedPlanet]);

  return (
    <>
      {/* Cinematic Ambient Cosmic Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[20, 40, 20]} intensity={1.5} color="#dbeafe" />
      <pointLight position={[-25, 30, -25]} color="#00e5ff" intensity={1.2} />
      <pointLight position={[25, -15, 25]} color="#8b5cf6" intensity={0.8} />

      {/* OrbitControls for smooth 360 navigation */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        maxDistance={140}
        minDistance={15}
        maxPolarAngle={Math.PI / 2 + 0.1} // Prevent looking directly from underneath
      />

      {/* Cosmic Deep Starfield */}
      <Stars radius={120} depth={60} count={6000} factor={5} saturation={0.5} fade speed={0.8} />
      <Sparkles count={150} scale={60} size={2.5} speed={0.3} opacity={0.35} color="#00e5ff" />

      {/* Main Astrolabe Wheel Rotating Assembly */}
      <group ref={wheelGroupRef}>
        {/* 1. Central Core Mandala */}
        <CentralMandalaHub selectedPlanet={selectedPlanet} />

        {/* 2. Inner Zodiac Ring */}
        <ZodiacRingDisc />

        {/* 3. Middle Houses Tier with Cyan Numbers */}
        <HousesTierRing houses={chart.houses} showLabels={showHouseLabels} />

        {/* 4. Outer Rim with Degree Divisions */}
        <OuterPerimeterRing />

        {/* 5. 3D Celestial Body Spheres */}
        {chart.planets.map(planet => (
          <CelestialPlanetSphere
            key={planet.name}
            planet={planet}
            isSelected={selectedPlanet?.name === planet.name}
            onSelect={onSelectPlanet}
            showDegree={showDegrees}
          />
        ))}

        {/* 6. Signature 3D Parabolic Aspect Arcs */}
        {filteredAspects.map((aspect, idx) => {
          const p1 = chart.planets.find(p => p.name.toLowerCase() === aspect.planet1.toLowerCase());
          const p2 = chart.planets.find(p => p.name.toLowerCase() === aspect.planet2.toLowerCase());
          
          const isSelected = selectedAspect === aspect;
          const isConnectedToSelectedPlanet = selectedPlanet ? (
            aspect.planet1.toLowerCase() === selectedPlanet.name.toLowerCase() ||
            aspect.planet2.toLowerCase() === selectedPlanet.name.toLowerCase()
          ) : false;

          const isDimmed = (selectedPlanet && !isConnectedToSelectedPlanet) || 
                          (selectedAspect && !isSelected);

          return (
            <ParabolicAspectArc
              key={`${aspect.planet1}-${aspect.planet2}-${idx}`}
              aspect={aspect}
              planet1={p1}
              planet2={p2}
              isSelected={isSelected || isConnectedToSelectedPlanet}
              isDimmed={!!isDimmed}
              onSelect={onSelectAspect}
              arcHeightMultiplier={arcHeightMultiplier}
            />
          );
        })}
      </group>
    </>
  );
};
