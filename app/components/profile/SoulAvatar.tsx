import * as React from 'react';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

const SoulEntity = ({ color = '#a855f7' }: { color?: string }) => {
  const meshRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Rotate and oscillate
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <Sparkles count={100} scale={4} size={3} speed={0.4} color={color} />
      
      {/* Central Soul Core (Torso area) */}
      <mesh ref={coreRef} position={[0, -0.2, 0]} scale={[0.8, 1.2, 0.8]}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={3}
          distort={0.4}
          radius={1}
          emissive={color}
          emissiveIntensity={4}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Head Sphere */}
      <mesh position={[0, 1.5, 0]} scale={[0.4, 0.5, 0.4]}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.2}
          emissive={color}
          emissiveIntensity={5}
        />
      </mesh>

      {/* Halo Loop */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Ethereal Limbs (Stylized) */}
      {[
        { pos: [-0.6, 0.2, 0], rot: [0, 0, 0.4], scale: [0.1, 1.5, 0.1] }, // Left Arm
        { pos: [0.6, 0.2, 0], rot: [0, 0, -0.4], scale: [0.1, 1.5, 0.1] }, // Right Arm
        { pos: [-0.4, -1.8, 0], rot: [0, 0, 0.1], scale: [0.15, 1.8, 0.15] }, // Left Leg
        { pos: [0.4, -1.8, 0], rot: [0, 0, -0.1], scale: [0.15, 1.8, 0.15] }, // Right Leg
      ].map((limb, i) => (
        <mesh key={i} position={limb.pos as any} rotation={limb.rot as any} scale={limb.scale as any}>
          <cylinderGeometry args={[1, 1, 1, 16]} />
          <MeshWobbleMaterial color={color} speed={2} factor={0.5} transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Human-like markers (Aura nodes) */}
      {[
        [0, 1.5, 0], // Crown
        [0, 0.8, 0], // Third Eye
        [0, 0.1, 0], // Heart
        [0, -0.6, 0], // Solar Plexus
        [0, -1.3, 0], // Sacral
      ].map((pos, i) => (
        <Float key={i} position={pos as any} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <pointLight position={[0, 0, 0]} intensity={10} color={color} distance={2} />
        </Float>
      ))}
      
      {/* Connection Lines (Lattice) */}
      <group>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5]}>
              <boxGeometry args={[0.02, 3, 0.02]} />
              <meshBasicMaterial color={color} transparent opacity={0.1} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

export const SoulAvatar = ({ color = '#a855f7' }: { color?: string }) => {
  return (
    <div className="w-full h-full min-h-[300px] relative cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: false, stencil: false, depth: true }}>
        <color attach="background" args={['black']} />
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={150} color={color} />
        
        <SoulEntity color={color} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
        </EffectComposer>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/10 rounded-full animate-[spin_20s_linear_infinite] opacity-20" />
    </div>
  );
};
