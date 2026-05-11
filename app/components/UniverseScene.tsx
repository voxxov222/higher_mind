import * as React from 'react';
import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Text, OrbitControls, PerspectiveCamera, Html, Sparkles, Float as FloatDrei, Center, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, User, Fingerprint, Network, Zap, BookOpen, Compass, Activity, Moon, Sun, Star } from 'lucide-react';
import { CosmicData } from '../types';

interface UniversePortalProps {
  position: [number, number, number];
  title: string;
  id: string;
  icon: any;
  color: string;
  description: string;
  onClick: (id: string) => void;
  isActive: boolean;
}

const UniversePortal = ({ position, title, id, icon: Icon, color, description, onClick, isActive }: UniversePortalProps) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 1;
      meshRef.current.rotation.y = t * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
    }
  });

  return (
    <group position={position} onClick={() => onClick(id)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <group ref={meshRef}>
        <Float speed={3} rotationIntensity={1} floatIntensity={1}>
          {/* Main Sphere */}
          <mesh>
            <sphereGeometry args={[4, 32, 32]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={hovered ? 3 : 1} 
              transparent 
              opacity={hovered ? 0.6 : 0.2} 
              wireframe={!hovered && !isActive} 
            />
          </mesh>

          {/* Internal Glowing Core */}
          <mesh ref={glowRef}>
            <octahedronGeometry args={[2.5, 0]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
          </mesh>

          {/* Pulsing Aura */}
          <Sparkles count={50} scale={6} size={4} speed={0.5} color={color} />

          {/* Icon Representative */}
          <Html center distanceFactor={25} position={[0, 0, 0]}>
            <motion.div 
              animate={{ 
                scale: hovered ? 2 : 1.5,
                filter: hovered ? `drop-shadow(0 0 20px ${color})` : `drop-shadow(0 0 10px ${color})`
              }}
              className="pointer-events-none"
            >
              <Icon size={24} color={hovered ? 'white' : color} />
            </motion.div>
          </Html>

          {/* Rotating Rings */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[5, 0.05, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[5.5, 0.03, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
          </mesh>
        </Float>
      </group>

      {/* Label and Info */}
      <group position={[0, -10, 0]}>
        <Text
          fontSize={2.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.08}
          outlineColor={color}
          font="https://fonts.gstatic.com/s/spacegrotesk/v13/V8mQoQDjQSkFtoMM3T6rjS3F9XRaMDvDVG5mMA.woff"
        >
          {title.toUpperCase()}
        </Text>
        <Text
          position={[0, -3.5, 0]}
          fontSize={1}
          color="white"
          maxWidth={25}
          textAlign="center"
          opacity={hovered ? 0.8 : 0}
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.woff"
        >
          {description}
        </Text>
      </group>

      {/* Volumetric Connection */}
      <Line 
        points={[[0, 0, 0], [-position[0], -position[1], -position[2]]]} 
        color={color} 
        opacity={hovered ? 0.5 : 0.1} 
        transparent 
        lineWidth={hovered ? 2 : 0.5} 
      />
    </group>
  );
};

interface UniverseSceneProps {
  data: CosmicData | null;
  onTravel: (tabId: string) => void;
  activeSection: string;
}

export const UniverseScene = ({ data, onTravel, activeSection }: UniverseSceneProps) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const PORTALS = [
    { id: 'identity', title: 'Soul Identity', icon: User, color: '#f43f5e', position: [-40, 10, 20], description: 'Your core essence and spiritual resonance.' },
    { id: 'planets', title: 'Astrology', icon: Sun, color: '#fbbf24', position: [35, 15, -15], description: 'Celestial alignments and birth chart synthesis.' },
    { id: 'numbers', title: 'Numerology', icon: Fingerprint, color: '#10b981', position: [-25, -20, -30], description: 'Mathematical signatures and destiny codes.' },
    { id: 'torus', title: 'Field Dynamics', icon: Activity, color: '#a855f7', position: [20, -10, 40], description: 'Aura field geometry and energetic flow.' },
    { id: 'findings', title: 'Deep Synthesis', icon: Zap, color: '#3b82f6', position: [45, -5, 10], description: 'Cross-integrated insights and hidden patterns.' },
    { id: 'akashic', title: 'Akashic Records', icon: BookOpen, color: '#ec4899', position: [-15, 30, -35], description: 'The library of spiritual history and purpose.' },
    { id: 'strategy', title: 'Life Paths', icon: Compass, color: '#06b6d4', position: [5, -35, -20], description: 'Strategic navigation through the cosmic matrix.' },
  ];

  return (
    <>
      <PerspectiveCamera makeDefault position={[100, 100, 100]} fov={50} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        maxDistance={250}
        minDistance={30}
        autoRotate
        autoRotateSpeed={0.2}
      />

      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 100, 500]} />

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#ffffff" />
      
      {/* Central Singularity */}
      <group>
        <Sparkles count={200} scale={20} size={6} speed={0.4} color="#ffffff" />
        <mesh>
          <sphereGeometry args={[8, 64, 64]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.1} 
          />
        </mesh>
        <Text
          fontSize={3}
          color="white"
          font="https://fonts.gstatic.com/s/spacegrotesk/v13/V8mQoQDjQSkFtoMM3T6rjS3F9XRaMDvDVG5mMA.woff"
          anchorX="center"
          anchorY="middle"
        >
          CORE
        </Text>
      </group>

      {/* Portals to different sections */}
      {PORTALS.map((portal) => (
        <UniversePortal 
          key={portal.id}
          {...(portal as any)}
          onClick={(id) => onTravel(id)}
          isActive={activeSection === portal.id}
        />
      ))}

      {/* Constellation Lines connecting Portals */}
      {PORTALS.map((portal, i) => {
        const nextPortal = PORTALS[(i + 1) % PORTALS.length];
        return (
          <Line
            key={`constellation-${i}`}
            points={[portal.position, nextPortal.position]}
            color="#ffffff"
            opacity={0.05}
            transparent
            lineWidth={0.5}
            dashed
            dashSize={2}
            gapSize={1}
          />
        );
      })}

      {/* Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -50, 0]}>
        <gridHelper args={[1000, 50, '#ffffff', '#222222']} transparent opacity={0.05} />
      </mesh>
    </>
  );
};
