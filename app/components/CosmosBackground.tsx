import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

function Starfield() {
  const groupRef = useRef<THREE.Group>(null);
  
  const [starTexture, skyTexture] = useTexture([
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
      <Canvas camera={{ position: [0, 0, 50], fov: 60 }}>
        <fog attach="fog" args={['#000814', 180, 250]} />
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <Starfield />
        </Suspense>
      </Canvas>
    </div>
  );
};
