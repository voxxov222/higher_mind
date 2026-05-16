import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, 
  OrbitControls, PerspectiveCamera, Stars, Sparkles, PointMaterial, 
  Points, Environment, Float as Floating, Cloud
} from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  color?: string;
  isCinematic?: boolean;
}

const CosmicNebula = ({ color = "#a855f7" }: { color: string }) => {
  return (
    <group>
      <Cloud
        opacity={0.15}
        speed={0.2} 
        width={10} 
        depth={1.5} 
        segments={20} 
        color={color}
        position={[-5, 2, -5]}
      />
      <Cloud
        opacity={0.1}
        speed={0.1} 
        width={20} 
        depth={2} 
        segments={40} 
        color="#1d4ed8"
        position={[5, -2, -8]}
      />
    </group>
  );
};

const SwirlingVortex = ({ color = "#a855f7", isCinematic = false }: SceneProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, sizes] = useMemo(() => {
    const count = isCinematic ? 2000 : 800;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 * 10; // Multiple rotations
      const radius = 2 + (i / count) * 20;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      sz[i] = Math.random();
    }
    return [pos, sz];
  }, [isCinematic]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      pointsRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        alphaTest={0.01}
        size={isCinematic ? 0.15 : 0.08}
        sizeAttenuation={true}
        color={color}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const HolographicStructure = ({ color = "#a855f7", isCinematic = false }: SceneProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
      meshRef.current.rotation.y = time * 0.1;
      if (isCinematic) {
        meshRef.current.scale.setScalar(1 + Math.sin(time) * 0.05);
      }
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -time * 0.05;
      ringRef.current.rotation.x = Math.cos(time * 0.3) * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -time * 0.2;
    }
  });

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < (isCinematic ? 300 : 100); i++) {
      const x = THREE.MathUtils.randFloatSpread(40);
      const y = THREE.MathUtils.randFloatSpread(40);
      const z = THREE.MathUtils.randFloatSpread(20);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [isCinematic]);

  return (
    <group>
      {/* Central Core Structure */}
      <Float speed={isCinematic ? 4 : 2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[3, isCinematic ? 3 : 2]} />
          <MeshDistortMaterial
            color={color}
            speed={isCinematic ? 4 : 2}
            distort={isCinematic ? 0.5 : 0.3}
            radius={1}
            wireframe
            transparent
            opacity={0.4}
            emissive={color}
            emissiveIntensity={1}
          />
        </mesh>
      </Float>
      
      <SwirlingVortex color={color} isCinematic={isCinematic} />
      <CosmicNebula color={color} />

      {/* Internal Energy Pulse */}
      <group ref={coreRef}>
        <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
          <Sphere args={[2.5, 64, 64]}>
            <MeshWobbleMaterial
              color={color}
              speed={3}
              factor={0.6}
              transparent
              opacity={0.2}
              emissive={color}
              emissiveIntensity={2}
            />
          </Sphere>
        </Float>
      </group>

      {/* Orbiting Quantum Rings */}
      <group ref={ringRef}>
        {[...Array(isCinematic ? 12 : 5)].map((_, i) => (
          <Torus key={i} args={[6 + i * 0.8, 0.02, 16, 120]} rotation={[Math.PI / 2 + i * 0.3, Math.sin(i), 0]}>
            <meshStandardMaterial 
              color={color} 
              transparent 
              opacity={0.15 + (i % 3) * 0.1} 
              emissive={color} 
              emissiveIntensity={isCinematic ? 4 : 2} 
            />
          </Torus>
        ))}
      </group>

      {/* Floating Geometric Artifacts */}
      {isCinematic && [...Array(12)].map((_, i) => (
        <Floating key={i} speed={2} rotationIntensity={2} floatIntensity={2} position={[
          Math.cos(i * 0.8) * 12,
          Math.sin(i * 1.5) * 8,
          Math.sin(i * 0.5) * 10
        ]}>
          <mesh rotation={[Math.random(), Math.random(), Math.random()]}>
            {i % 3 === 0 ? <tetrahedronGeometry args={[0.5]} /> : i % 2 === 0 ? <dodecahedronGeometry args={[0.4]} /> : <octahedronGeometry args={[0.4]} />}
            <meshStandardMaterial color={color} wireframe transparent opacity={0.3} emissive={color} emissiveIntensity={2} />
          </mesh>
        </Floating>
      ))}

      {/* Vertical Energy Beams */}
      {isCinematic && [...Array(6)].map((_, i) => (
        <mesh key={`beam-${i}`} position={[Math.sin(i) * 15, 0, Math.cos(i) * 15]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 40, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.3} emissive={color} emissiveIntensity={10} />
        </mesh>
      ))}

      {/* Floating Spatial Particles */}
      <Points positions={particles}>
        <PointMaterial
          transparent
          color={color}
          size={isCinematic ? 0.1 : 0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <Sparkles count={isCinematic ? 200 : 80} scale={30} size={isCinematic ? 4 : 2} speed={0.4} color={color} opacity={0.6} />
      <Stars radius={100} depth={50} count={isCinematic ? 20000 : 7000} factor={4} saturation={0} fade speed={1} />
      
      {isCinematic && (
        <fog attach="fog" args={['#000', 8, 40]} />
      )}
    </group>
  );
};

export const SynthesisCore3D = ({ color = "#a855f7", isCinematic = false }: SceneProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas alpha dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, isCinematic ? 24 : 18]} fov={45} />
        <Environment preset="night" />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color={color} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#fff" />
        <spotLight position={[0, 20, 0]} intensity={3} angle={0.3} penumbra={1} color={color} />
        
        <HolographicStructure color={color} isCinematic={isCinematic} />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={isCinematic ? 2 : 0.8} />
      </Canvas>
    </div>
  );
};
