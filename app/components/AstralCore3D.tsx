import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function AstralCore3D({ isSpeaking, isProcessing }: { isSpeaking: boolean, isProcessing: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random particles for the data sphere
  const [sphereData] = React.useState(() => {
    const data = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      const radius = 2.5 + Math.random() * 0.5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      data[i * 3] = radius * Math.sin(phi) * Math.cos(theta); // x
      data[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
      data[i * 3 + 2] = radius * Math.cos(phi); // z
    }
    return data;
  });

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    if (coreRef.current) {
      // Base rotation
      coreRef.current.rotation.x += delta * 0.2;
      coreRef.current.rotation.y += delta * 0.3;
      
      // Pulse effects based on state
      const baseScale = isSpeaking ? 1.2 : 1.0;
      const pulseScale = isProcessing 
        ? baseScale + Math.sin(time * 8) * 0.1 
        : baseScale + Math.sin(time * 2) * 0.05;
        
      coreRef.current.scale.lerp(new THREE.Vector3(pulseScale, pulseScale, pulseScale), 0.1);
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * 0.1;
      pointsRef.current.rotation.z += delta * 0.05;
      
      const speedMultiplier = isProcessing ? 3.0 : (isSpeaking ? 2.0 : 1.0);
      pointsRef.current.scale.setScalar(
        1.0 + Math.sin(time * speedMultiplier) * 0.05
      );
    }
  });

  return (
    <group>
      {/* Outer Particle Shell */}
      <Points ref={pointsRef} positions={sphereData} stride={3}>
        <PointMaterial 
          transparent 
          color="#06b6d4" // Cyan-500
          size={0.05} 
          sizeAttenuation={true} 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Dynamic Core */}
      <Sphere ref={coreRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color={isProcessing ? "#3b82f6" : "#0891b2"} // Blue-500 vs Cyan-600
          emissive={isSpeaking ? "#06b6d4" : "#0e7490"} // Bright cyan vs dark cyan
          emissiveIntensity={isProcessing ? 2.0 : (isSpeaking ? 1.5 : 0.8)}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={isProcessing ? 0.6 : (isSpeaking ? 0.4 : 0.2)}
          speed={isProcessing ? 5 : (isSpeaking ? 3 : 1)}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Inner glowing energy source */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.4} 
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      {/* Ambient and directional lights specific to the core */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={isSpeaking ? 5 : 2} color="#22d3ee" />
      <pointLight position={[5, 5, 5]} intensity={2} color="#0284c7" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#6366f1" />
    </group>
  );
}
