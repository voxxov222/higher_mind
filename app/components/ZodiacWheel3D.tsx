import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Ring, Float, Stars, Trail, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const SIGNS = [
  { name: 'Aries', symbol: '♈', color: '#ff4d4d' },
  { name: 'Taurus', symbol: '♉', color: '#4dff4d' },
  { name: 'Gemini', symbol: '♊', color: '#ffff4d' },
  { name: 'Cancer', symbol: '♋', color: '#d9d9d9' },
  { name: 'Leo', symbol: '♌', color: '#ffcc00' },
  { name: 'Virgo', symbol: '♍', color: '#b366ff' },
  { name: 'Libra', symbol: '♎', color: '#ffb3ff' },
  { name: 'Scorpio', symbol: '♏', color: '#8c1aff' },
  { name: 'Sagittarius', symbol: '♐', color: '#ff6600' },
  { name: 'Capricorn', symbol: '♑', color: '#8c8c8c' },
  { name: 'Aquarius', symbol: '♒', color: '#4dffff' },
  { name: 'Pisces', symbol: '♓', color: '#4d4dff' },
];

function ZodiacRing({ activeSign, setActiveSign }: { activeSign: string | null, setActiveSign: (v: string | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current && !activeSign) {
      groupRef.current.rotation.z -= delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Ring args={[2.5, 3.2, 64]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#2a2a35" transparent opacity={0.6} side={THREE.DoubleSide} roughness={0.2} metalness={0.8} />
      </Ring>

      {SIGNS.map((sign, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const radius = 2.85;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <ZodiacSign 
            key={sign.name} 
            sign={sign} 
            position={[x, y, 0.1]} 
            rotation={[0, 0, angle - Math.PI / 2]} 
            isActive={activeSign === sign.name}
            onHover={(isHovered) => setActiveSign(isHovered ? sign.name : null)}
          />
        );
      })}
    </group>
  );
}

function ZodiacSign({ sign, position, rotation, isActive, onHover }: any) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3().setScalar(hovered || isActive ? 1.4 : 1), 0.1);
    }
  });

  return (
    <group 
      position={position} 
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { setHovered(false); onHover(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh ref={meshRef}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial 
          color={hovered || isActive ? sign.color : '#1a1a24'} 
          emissive={hovered || isActive ? sign.color : '#000000'}
          emissiveIntensity={hovered || isActive ? 2 : 0}
          transparent opacity={0.9} 
        />
      </mesh>
      
      <Text
        position={[0, 0, 0.05]}
        fontSize={0.25}
        color={hovered || isActive ? '#ffffff' : sign.color}
        anchorX="center"
        anchorY="middle"
      >
        {sign.symbol}
      </Text>
      
      {isActive && (
        <Text
          position={[0, 0.5, 0.1]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          rotation={[0, 0, 0]}
        >
          {sign.name}
        </Text>
      )}
    </group>
  );
}

function CenterCore({ activeSign }: { activeSign: string | null }) {
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.2;
      coreRef.current.rotation.y += delta * 0.3;
    }
  });

  const activeColor = activeSign ? SIGNS.find(s => s.name === activeSign)?.color || '#00d2ff' : '#00d2ff';

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial 
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={1.5}
          wireframe
          distort={0.4}
          speed={2}
          transparent opacity={0.8}
        />
      </mesh>
      {activeSign && (
        <Text
          position={[0, 0, 1.5]}
          fontSize={0.4}
          color={activeColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {activeSign.toUpperCase()}
        </Text>
      )}
    </Float>
  );
}

export function ZodiacWheel3D() {
  const [activeSign, setActiveSign] = useState<string | null>(null);

  return (
    <div className="w-full h-full relative z-10 pointer-events-auto bg-black/50 rounded-xl">
      <Canvas camera={{ position: [0, -4, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#00ffff" intensity={1} />
        
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={100} scale={8} size={2} speed={0.4} opacity={0.2} color="#00ffff" />

        <group rotation={[Math.PI / 6, 0, 0]}>
          <ZodiacRing activeSign={activeSign} setActiveSign={setActiveSign} />
          <CenterCore activeSign={activeSign} />
        </group>
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
