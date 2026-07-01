import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../lib/soundEffects';

function ParticleField({ count = 5000 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate random positions for the particles
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Spherical distribution for a more cosmic feel
      const r = 20 + Math.random() * 80;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Cosmos colors: purples, blues, cyan, and some starlight white
      const hue = 0.5 + Math.random() * 0.4; // between cyan and magenta
      const lightness = 0.5 + Math.random() * 0.5;
      color.setHSL(hue, 0.8, lightness);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export const CosmosBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-black overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 0, 50], fov: 60 }}>
        <fog attach="fog" args={['#000000', 30, 100]} />
        <ambientLight intensity={0.5} />
        <ParticleField count={8000} />
      </Canvas>
    </div>
  );
};
