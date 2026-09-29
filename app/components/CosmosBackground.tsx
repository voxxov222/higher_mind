import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSafeTexture } from '../hooks/useSafeTexture';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

function ZodiacRing() {
  const ringRef = useRef<THREE.Group>(null);
  const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  
  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.05;
      ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={ringRef}>
      {signs.map((sign, i) => {
        const angle = (i / signs.length) * Math.PI * 2;
        const radius = 25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <Text
            key={sign}
            position={[x, 0, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            fontSize={3}
            color="#06b6d4"
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.8}
          >
            {sign}
          </Text>
        );
      })}
      
      {/* Neural Core / Brain Placeholder representing the Database */}
      <mesh>
        <sphereGeometry args={[10, 32, 32]} />
        <meshStandardMaterial 
          color="#0ea5e9"
          emissive="#38bdf8"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Inner pulsating core */}
      <mesh>
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial color="#f472b6" wireframe />
      </mesh>
    </group>
  );
}

function Starfield() {
  const groupRef = useRef<THREE.Group>(null);
  
  const [starTexture, skyTexture] = useSafeTexture([
    '/textures/8k_stars.jpg',
    '/textures/stars.jpg'
  ]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.005;
      groupRef.current.rotation.x += delta * 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[200, 64, 64]} />
        <meshBasicMaterial 
          map={starTexture} 
          side={THREE.BackSide} 
          toneMapped={false}
          color={new THREE.Color(1.2, 1.2, 1.2)}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[190, 64, 64]} />
        <meshBasicMaterial 
          map={skyTexture} 
          side={THREE.BackSide} 
          toneMapped={false}
          transparent={true}
          opacity={0.3}
          color={new THREE.Color(0.8, 0.9, 1.0)}
        />
      </mesh>
    </group>
  );
}

export const CosmosBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#000814] overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 20, 60], fov: 60 }}>
        <fog attach="fog" args={['#000814', 180, 250]} />
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <Starfield />
          <ZodiacRing />
        </Suspense>
      </Canvas>
    </div>
  );
};
