import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Stars, Center } from '@react-three/drei';

const HumanForm = () => {
  const group = useRef<THREE.Group>(null!);
  
  // Create a stylized humanoid form using particles
  const count = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Head
      if (i < 300) {
        const phi = Math.acos(-1 + (2 * i) / 300);
        const theta = Math.sqrt(300 * Math.PI) * phi;
        pos[i * 3] = 0.2 * Math.cos(theta) * Math.sin(phi);
        pos[i * 3 + 1] = 0.2 * Math.sin(theta) * Math.sin(phi) + 1.2;
        pos[i * 3 + 2] = 0.2 * Math.cos(phi);
      } 
      // Torso
      else if (i < 1500) {
        const h = (Math.random() - 0.5) * 1.2; // -0.6 to 0.6
        const angle = Math.random() * Math.PI * 2;
        const r = (0.3 - Math.abs(h) * 0.1) * Math.random();
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = h + 0.5;
        pos[i * 3 + 2] = Math.sin(angle) * r;
      }
      // Arms
      else if (i < 2200) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const progress = Math.random();
        const length = 0.7;
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.2;
        pos[i * 3] = side * (0.2 + progress * length * Math.cos(angle));
        pos[i * 3 + 1] = 0.9 + progress * length * Math.sin(angle);
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      }
      // Legs
      else {
        const side = Math.random() > 0.5 ? 1 : -1;
        const progress = Math.random();
        const length = 1.0;
        pos[i * 3] = side * (0.15 + (Math.random() - 0.5) * 0.05);
        pos[i * 3 + 1] = -0.1 - progress * length;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      }
    }
    return pos;
  }, []);

  const pointRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pointRef.current) {
      pointRef.current.rotation.y = t * 0.2;
      const positionsArr = pointRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        // Subtle energy flow upwards
        positionsArr[idx + 1] += Math.sin(t * 0.5 + positionsArr[idx]) * 0.001;
      }
      pointRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <points ref={pointRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#a855f7"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      
      {/* Glow centers */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#d8b4fe" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#d8b4fe" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

export const SoulBlueprintAura = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} alpha>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Center top>
            <HumanForm />
          </Center>
        </Float>
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};
