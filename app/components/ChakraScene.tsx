import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CosmicData } from '../types';

interface ChakraData {
  name: string;
  status: 'open' | 'blocked' | 'overactive' | 'balanced';
  score: number;
  description: string;
  color: string;
}

const HumanChakraModel = ({ chakras }: { chakras: ChakraData[] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Position chakras along the spine (Y-axis)
  const chakraPositions = [
    [0, -3, 0],   // Root
    [0, -2, 0],   // Sacral
    [0, -1, 0],   // Solar Plexus
    [0, 0.5, 0],  // Heart
    [0, 2, 0],    // Throat
    [0, 3.5, 0],  // Third Eye
    [0, 4.5, 0],  // Crown
  ];

  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Abstract human silhouette using particles or glowing spheres */}
      <mesh position={[0, 0, -1]}>
         <capsuleGeometry args={[1.5, 6, 16, 32]} />
         <meshBasicMaterial color="#ffffff" transparent opacity={0.02} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {chakras.map((chakra, index) => {
        const isHovered = hoveredIndex === index;
        const radius = isHovered ? 0.35 : 0.25;
        const color = new THREE.Color(chakra.color).multiplyScalar(isHovered ? 2 : 1.2);
        
        // Use standard ordering if missing array data
        const posPos = chakraPositions[index] || [0, index - 3, 0];

        return (
          <group 
            key={chakra.name} 
            position={posPos as [number, number, number]}
          >
             {/* Neon Glow */}
             <mesh>
                 <sphereGeometry args={[radius * 1.5, 32, 32]} />
                 <meshBasicMaterial 
                   color={color} 
                   transparent 
                   opacity={isHovered ? 0.6 : 0.2} 
                   blending={THREE.AdditiveBlending} 
                   depthWrite={false}
                 />
             </mesh>

             <mesh 
                onPointerOver={(e) => { e.stopPropagation(); setHoveredIndex(index); }}
                onPointerOut={(e) => { e.stopPropagation(); setHoveredIndex(null); }}
             >
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial 
                  color={color} 
                  emissive={color}
                  emissiveIntensity={isHovered ? 2 : (chakra.score / 50)} 
                  transparent
                  opacity={0.9}
                />
             </mesh>
             
             {isHovered && (
                <Html center distanceFactor={15}>
                  <div className="bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl w-64 pointer-events-none transform translate-x-12 -translate-y-12">
                    <h3 className="text-white font-bold tracking-widest uppercase mb-1" style={{ color: chakra.color }}>
                       {chakra.name} Chakra
                    </h3>
                    <div className="flex justify-between text-xs text-stone-400 mb-2 border-b border-white/10 pb-2">
                       <span>Status: <span className="text-white">{chakra.status}</span></span>
                       <span>Resonance: <span className="text-white">{chakra.score}%</span></span>
                    </div>
                    <p className="text-sm text-stone-300 font-light leading-relaxed">
                       {chakra.description}
                    </p>
                  </div>
                </Html>
             )}
          </group>
        );
      })}
    </group>
  );
};

export default function ChakraScene({ data }: { data: CosmicData }) {
  // If chakras are undefined in older data, generate some default ones based on numerology as a fallback or return null
  if (!data?.chakras || data.chakras.length === 0) {
     return <div className="p-8 text-center text-stone-400">Chakra data requires a new reading. Please regenerate your Cosmic Matrix.</div>;
  }

  return (
    <div className="h-[70vh] rounded-[3rem] overflow-hidden border border-white/10 bg-black/40 relative">
       <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <h2 className="text-2xl font-light text-white tracking-[0.2em] uppercase text-center drop-shadow-lg">
             Pranic Analysis
          </h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest text-center mt-2">
             Interactive 3D Energy Body
          </p>
       </div>
       <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
         <ambientLight intensity={0.5} />
         <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
         <HumanChakraModel chakras={data.chakras} />
         <OrbitControls enableZoom={true} enablePan={true} maxPolarAngle={Math.PI} />
       </Canvas>
       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 pointer-events-none w-full px-8 flex-wrap">
          {data.chakras.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color, boxShadow: `0 0 10px ${c.color}` }} />
                 <span className="text-[10px] text-stone-400 uppercase tracking-wider">{c.name}</span>
              </div>
          ))}
       </div>
    </div>
  );
};
