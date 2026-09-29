import React, { useRef, useMemo } from 'react';
import { HigherMindExplanationButton } from './HigherMindExplanationButton';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sphere, Line, Cylinder, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- KABBALAH TREE OF LIFE (Sephirot positions) ---
// Coordinates are roughly mapped to a 3D tree
const SEPHIROT = [
  { id: 'Keter', pos: [0, 6, 0], color: '#ffffff' }, // Crown
  { id: 'Chokhmah', pos: [2, 5, 0], color: '#a8a8a8' }, // Wisdom
  { id: 'Binah', pos: [-2, 5, 0], color: '#333333' }, // Understanding
  { id: 'Chesed', pos: [2, 3, 0], color: '#3b82f6' }, // Mercy
  { id: 'Gevurah', pos: [-2, 3, 0], color: '#ef4444' }, // Severity
  { id: 'Tiferet', pos: [0, 2, 0], color: '#eab308' }, // Beauty
  { id: 'Netzach', pos: [2, 0, 0], color: '#22c55e' }, // Victory
  { id: 'Hod', pos: [-2, 0, 0], color: '#f97316' }, // Splendor
  { id: 'Yesod', pos: [0, -1, 0], color: '#a855f7' }, // Foundation
  { id: 'Malkuth', pos: [0, -3, 0], color: '#10b981' }, // Kingdom
];

const PATHS = [
  [0, 1], [0, 2], [0, 5],
  [1, 2], [1, 3], [1, 5],
  [2, 4], [2, 5],
  [3, 4], [3, 5], [3, 6],
  [4, 5], [4, 7],
  [5, 6], [5, 7], [5, 8],
  [6, 7], [6, 8],
  [7, 8],
  [8, 9]
];

const TreeOfLife = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      {/* Paths */}
      {PATHS.map((path, idx) => {
        const p1 = new THREE.Vector3(...SEPHIROT[path[0]].pos as [number, number, number]);
        const p2 = new THREE.Vector3(...SEPHIROT[path[1]].pos as [number, number, number]);
        return (
          <Line
            key={`path-${idx}`}
            points={[p1, p2]}
            color="rgba(255, 215, 0, 0.4)"
            lineWidth={1.5}
            transparent
          />
        );
      })}

      {/* Sephirot */}
      {SEPHIROT.map((seph, idx) => (
        <Float key={`seph-${idx}`} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group position={seph.pos as [number, number, number]}>
            <Sphere args={[0.3, 32, 32]}>
              <meshStandardMaterial color={seph.color} emissive={seph.color} emissiveIntensity={0.8} />
            </Sphere>
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.25}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="black"
            >
              {seph.id}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  );
};

const MayanPyramidBase = () => {
  return (
    <group position={[0, -4, 0]}>
      <Cylinder args={[3, 4, 0.5, 4]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[2, 3, 0.5, 4]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[1, 2, 0.5, 4]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[1.2, 1.2, 0.1, 32]} position={[0, 1.05, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={0.5} />
      </Cylinder>
      {/* Mayan Calendar Engraving mock */}
      <Text
        position={[0, 1.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.4}
        color="#fef3c7"
      >
        TZOLKIN
      </Text>
    </group>
  );
};

const GnosticOuroboros = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + Math.PI / 2;
    }
  });

  return (
    <group position={[0, 3, 0]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[5, 0.1, 16, 100]} />
        <MeshDistortMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={1.5}
          distort={0.4}
          speed={2}
          wireframe
        />
      </mesh>
      <Text
        position={[0, -5.5, 0]}
        fontSize={0.3}
        color="#22d3ee"
        letterSpacing={0.2}
      >
        AS ABOVE, SO BELOW
      </Text>
    </group>
  );
};

export const SpiritualCosmicNexus = () => {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/50 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
<div className="mt-2 mb-4 pointer-events-auto"><HigherMindExplanationButton sectionName="Spiritual Nexus 3D" topicName="Kabbalah + Mayan + Gnostic Matrix" dataContext={{ description: "3D visual synthesis of esoteric frameworks" }} /></div>
        <div className="mb-2 pointer-events-auto"><HigherMindExplanationButton sectionName="Spiritual Nexus 3D" topicName="Kabbalah + Mayan + Gnostic Matrix" dataContext={{ description: "3D visual synthesis of esoteric frameworks" }} /></div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400">
          The Astral Nexus
        </h2>
        <p className="text-emerald-300/70 text-sm mt-1 max-w-sm">
          A holographic convergence of the Kabbalistic Tree of Life, the Mayan Tzolkin foundation, and the Gnostic Ouroboros.
        </p>
      </div>

      <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#f0fdf4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <TreeOfLife />
        <MayanPyramidBase />
        <GnosticOuroboros />
        
        <OrbitControls 
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minDistance={5}
          maxDistance={30}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-4 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-white/70">
          <span className="text-emerald-400 font-bold">Base:</span> Mayan Foundation
        </div>
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-white/70">
          <span className="text-amber-400 font-bold">Core:</span> Kabbalah Sephirot
        </div>
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-white/70">
          <span className="text-cyan-400 font-bold">Halo:</span> Gnostic Ouroboros
        </div>
      </div>
    </div>
  );
};
