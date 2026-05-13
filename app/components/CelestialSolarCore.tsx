import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshDistortMaterial, Sphere, Sparkles, Ring, Trail, Line } from '@react-three/drei';

export const CelestialSolarCore = ({ selected, hovered, onClick, onPointerOver, onPointerOut }: any) => {
  const coreRef = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const ringsRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
        coreRef.current.rotation.y = t * 0.1;
        coreRef.current.rotation.z = t * 0.05;
    }
    if (auraRef.current) {
        auraRef.current.rotation.y = -t * 0.05;
        auraRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.02);
    }
    if (ringsRef.current) {
        ringsRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
        ringsRef.current.rotation.y = t * 0.1;
        ringsRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <group 
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
    >
       {/* Core Plasma */}
       <Sphere ref={coreRef} args={[6, 128, 128]}>
         <MeshDistortMaterial 
            color="#FF4D00" 
            emissive={selected || hovered ? "#FF8800" : "#FF2200"}
            emissiveIntensity={selected || hovered ? 4 : 2.5}
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
         />
       </Sphere>

       {/* Volumetric Flare / Aura */}
       <Sphere ref={auraRef} args={[6.8, 64, 64]}>
         <meshBasicMaterial 
            color="#FFAA00"
            transparent
            opacity={selected || hovered ? 0.3 : 0.15}
            blending={THREE.AdditiveBlending}
            wireframe
         />
       </Sphere>
       
       <Sphere args={[6.4, 32, 32]}>
          <meshBasicMaterial 
            color="#FF8800"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
       </Sphere>

       {/* Sacred Geometry / Magnetic Rings */}
       <group ref={ringsRef}>
          {[0, 1, 2, 3].map((i) => (
             <group key={i} rotation={[Math.PI / 2 + (i * 0.5), i * 0.2, 0]}>
                <Ring args={[7.5 + i * 0.8, 7.6 + i * 0.8, 64]}>
                    <meshBasicMaterial color="#FFB800" transparent opacity={0.4 - i*0.08} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
                </Ring>
                <Ring args={[7.7 + i * 0.8, 7.75 + i * 0.8, 64]}>
                    <meshBasicMaterial color="#FF6600" transparent opacity={0.2 - i*0.05} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
                </Ring>
             </group>
          ))}
       </group>

       {/* Atmospheric Particles */}
       <Sparkles count={300} scale={18} size={4} speed={1.5} color="#FFAA00" opacity={0.6} />
       <Sparkles count={100} scale={25} size={2} speed={3} color="#FF4400" opacity={0.4} />
       
       <pointLight intensity={6} color="#FF7700" distance={150} decay={1.5} />
    </group>
  );
};

export const PlanetaryGravityNetwork = ({ planets }: { planets: any[] }) => {
    return (
        <group>
            {planets.map((p, i) => {
                if (!p) return null;
                // Calculate position based on distance and degree
                const angle = -(p.degree || 0) * Math.PI / 180;
                const r = p.distance || 30; // approx
                const pos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
                
                return (
                    <group key={`grav-${p.name}`}>
                        {/* Gravity Tether connecting to Sun */}
                        <Line 
                            points={[[0, 0, 0], pos.toArray()]} 
                            color={p.color || "#3b82f6"} 
                            transparent 
                            opacity={0.15} 
                            lineWidth={1}
                        />
                        {/* Gravity wells around the planet */}
                        <Ring position={pos} args={[p.size ? p.size + 1 : 3, p.size ? p.size + 1.2 : 3.2, 32]} rotation={[-Math.PI/2, 0, 0]}>
                            <meshBasicMaterial color={p.color || "#3b82f6"} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
                        </Ring>
                        <Ring position={pos} args={[p.size ? p.size + 2 : 4, p.size ? p.size + 2.1 : 4.1, 32]} rotation={[-Math.PI/2, 0, 0]}>
                            <meshBasicMaterial color={p.color || "#3b82f6"} transparent opacity={0.1} blending={THREE.AdditiveBlending} />
                        </Ring>
                    </group>
                );
            })}
        </group>
    );
};

export const CelestialDNAHelix = () => {
    const helixRef = useRef<THREE.Group>(null!);
    
    useFrame((state) => {
        if (helixRef.current) {
            helixRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
            helixRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 5;
        }
    });

    // Create DNA strands
    const numPairs = 30;
    const heightSpread = 40;
    const radius = 5;

    return (
        <group ref={helixRef} position={[-60, 0, -60]}>
            {Array.from({ length: numPairs }).map((_, i) => {
                const y = (i / numPairs) * heightSpread - heightSpread / 2;
                const angle = (i / numPairs) * Math.PI * 4; // 2 full twists
                
                const x1 = Math.cos(angle) * radius;
                const z1 = Math.sin(angle) * radius;
                
                const x2 = Math.cos(angle + Math.PI) * radius;
                const z2 = Math.sin(angle + Math.PI) * radius;
                
                return (
                    <group key={i}>
                        {/* Strand 1 */}
                        <mesh position={[x1, y, z1]}>
                            <sphereGeometry args={[0.5, 16, 16]} />
                            <meshBasicMaterial color="#38bdf8" />
                        </mesh>
                        {/* Strand 2 */}
                        <mesh position={[x2, y, z2]}>
                            <sphereGeometry args={[0.5, 16, 16]} />
                            <meshBasicMaterial color="#818cf8" />
                        </mesh>
                        {/* Connection */}
                        <Line 
                            points={[[x1, y, z1], [x2, y, z2]]}
                            color="#ffffff"
                            transparent
                            opacity={0.3}
                        />
                    </group>
                );
            })}
            <Sparkles count={50} scale={[radius * 2, heightSpread, radius * 2]} size={2} color="#ffffff" opacity={0.5} />
            <pointLight intensity={2} color="#818cf8" distance={30} />
        </group>
    );
};
