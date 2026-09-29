import React, { useRef, useState } from 'react';
import { HigherMindExplanationButton } from './HigherMindExplanationButton';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Ring, Float, Stars, Trail, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useHigherMind } from './HigherMindProvider';

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

function CenterCore({ activeSign, memoryCount, lastSync }: { activeSign: string | null, memoryCount: number, lastSync: string | null }) {
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.2;
      coreRef.current.rotation.y += delta * 0.3;
      
      // Pulse if recently synced
      if (lastSync) {
        const timeSinceSync = Date.now() - new Date(lastSync).getTime();
        if (timeSinceSync < 3000) {
          const scale = 1 + Math.sin(timeSinceSync * 0.01) * 0.2;
          coreRef.current.scale.set(scale, scale, scale);
        } else {
          coreRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
      }
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
          emissiveIntensity={lastSync && Date.now() - new Date(lastSync).getTime() < 3000 ? 3 : 1.5}
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
      
      {/* Memory Nodes Orbiting the Core */}
      {Array.from({ length: Math.min(memoryCount, 50) }).map((_, i) => {
        const angle = (i / Math.min(memoryCount, 50)) * Math.PI * 2;
        const radius = 1.5 + (i % 3) * 0.2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, (i%2 === 0 ? 0.5 : -0.5)]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
          </mesh>
        )
      })}
    </Float>
  );
}

export function ZodiacWheel3D() {
  const [activeSign, setActiveSign] = useState<string | null>(null);
  const { memoryBase } = useHigherMind();
  
  return (
    <div className="w-full h-full relative z-10 pointer-events-auto bg-black/50 rounded-xl overflow-hidden">
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="mb-2 pointer-events-auto"><HigherMindExplanationButton sectionName="Astrology & Higher Mind Database" topicName="Zodiac Wheel Memory Sync" dataContext={{ activeSign, memoryCount: memoryBase.entries.length }} /></div>
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">Higher Mind Database</h3>
        <p className="text-xs text-cyan-300/70">Archived Memories: {memoryBase.entries.length}</p>
        {memoryBase.lastSync && (
          <p className="text-xs text-fuchsia-400 animate-pulse mt-1">Index Sync Active...</p>
        )}
      </div>
      <Canvas camera={{ position: [0, -4, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#00ffff" intensity={1} />
        
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={100 + memoryBase.entries.length * 5} scale={8} size={2} speed={0.4} opacity={0.2} color="#00ffff" />
        
        <group rotation={[Math.PI / 6, 0, 0]}>
          <ZodiacRing activeSign={activeSign} setActiveSign={setActiveSign} />
          <CenterCore activeSign={activeSign} memoryCount={memoryBase.entries.length} lastSync={memoryBase.lastSync} />
        </group>
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
