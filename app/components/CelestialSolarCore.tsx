import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshDistortMaterial, Sphere, Sparkles, Ring, Line, Html, useTexture } from '@react-three/drei';

export const CelestialSolarCore = ({ selected, hovered, onClick, onPointerOver, onPointerOut }: any) => {
  const coreRef = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const ringsRef = useRef<THREE.Group>(null!);
  const sunTexture = useTexture('/textures/sun.jpg');

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
       <Sphere ref={coreRef} args={[6, 64, 64]}>
         <meshStandardMaterial 
            map={sunTexture}
            emissive="#FF8800"
            emissiveIntensity={selected || hovered ? 1.5 : 1.0}
            emissiveMap={sunTexture}
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

// At the top level or inside the file (we'll just replace the CelestialDNAHelix function)
export const CelestialDNAHelix = () => {
    const helixRef = useRef<THREE.Group>(null!);
    const [hoveredNode, setHoveredNode] = useState<{index: number, strand: number} | null>(null);
    const [clickedNode, setClickedNode] = useState<{index: number, strand: number, data: any} | null>(null);
    
    useFrame((state) => {
        if (helixRef.current) {
            helixRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
            helixRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 2;
        }
    });

    const numPairs = 30;
    const heightSpread = 40;
    const radius = 5;

    // Generate mock karmic data for each node
    const karmicTraits = [
        "Soul Retrieval", "Timeline Harmonization", "Ancestral Clearing", 
        "Shadow Integration", "Lightbody Activation", "Akashic Defrag",
        "Quantum Forgiveness", "Galactic Reconnection", "Karmic Absolution"
    ];

    const generateNodeData = (i: number, strand: number) => {
        const hash = (i * 17 + strand * 31) % karmicTraits.length;
        const activation = 40 + (Math.sin(i) * 30) + 30; // 40-100%
        const integration = 20 + (Math.cos(i * 2) * 40) + 40; // 20-100%
        return {
            trait: karmicTraits[hash],
            activation: Math.min(100, Math.max(0, activation)),
            integration: Math.min(100, Math.max(0, integration)),
        };
    };

    const handlePointerOver = (e: any, index: number, strand: number) => {
        e.stopPropagation();
        setHoveredNode({ index, strand });
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = (e: any) => {
        e.stopPropagation();
        setHoveredNode(null);
        document.body.style.cursor = 'auto';
    };

    const handleClick = (e: any, index: number, strand: number) => {
        e.stopPropagation();
        if (clickedNode?.index === index && clickedNode?.strand === strand) {
            setClickedNode(null); // toggle off
        } else {
            setClickedNode({ index, strand, data: generateNodeData(index, strand) });
        }
    };

    const DnaNode = ({ position, color, index, strand }: { position: [number, number, number], color: string, index: number, strand: number }) => {
        const meshRef = useRef<THREE.Mesh>(null!);
        const isHovered = hoveredNode?.index === index && hoveredNode?.strand === strand;
        const isClicked = clickedNode?.index === index && clickedNode?.strand === strand;
        const data = generateNodeData(index, strand);
        
        useFrame((state) => {
            if (meshRef.current) {
                // Pulsate based on activation percentage
                const baseScale = isHovered ? 1.5 : 1.0;
                const pulseAmp = (data.activation / 100) * 0.3;
                const scale = baseScale + Math.sin(state.clock.elapsedTime * 3 + index) * pulseAmp;
                meshRef.current.scale.set(scale, scale, scale);
            }
        });

        return (
            <group position={position}>
                <mesh 
                    ref={meshRef}
                    onPointerOver={(e) => handlePointerOver(e, index, strand)}
                    onPointerOut={handlePointerOut}
                    onClick={(e) => handleClick(e, index, strand)}
                >
                    <sphereGeometry args={[isHovered ? 0.7 : 0.5, 16, 16]} />
                    <meshStandardMaterial 
                        color={isHovered || isClicked ? "#ffffff" : color} 
                        emissive={isHovered || isClicked ? color : "#000000"}
                        emissiveIntensity={isHovered || isClicked ? 1 : 0}
                    />
                </mesh>
                
                {isClicked && (
                    <Html position={[1.5, 1.5, 0]} center zIndexRange={[100, 0]}>
                        <div className="bg-slate-900/90 border border-indigo-500/50 backdrop-blur-md p-4 rounded-xl text-xs font-mono shadow-[0_0_20px_rgba(99,102,241,0.3)] w-56 select-none pointer-events-none">
                            <h3 className="text-indigo-400 font-bold mb-2 text-sm border-b border-indigo-500/30 pb-1">Karmic Evolution</h3>
                            <div className="text-white mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                {data.trait}
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-[10px] text-white/50 mb-1">
                                        <span>Activation Level</span>
                                        <span className="text-emerald-400">{data.activation.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${data.activation}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-white/50 mb-1">
                                        <span>Integration</span>
                                        <span className="text-cyan-400">{data.integration.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500" style={{ width: `${data.integration}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Html>
                )}
            </group>
        );
    };

    return (
        <group ref={helixRef} position={[-60, 0, -60]}>
            <ambientLight intensity={0.5} />
            {Array.from({ length: numPairs }).map((_, i) => {
                const y = (i / numPairs) * heightSpread - heightSpread / 2;
                const angle = (i / numPairs) * Math.PI * 4; 
                
                const x1 = Math.cos(angle) * radius;
                const z1 = Math.sin(angle) * radius;
                
                const x2 = Math.cos(angle + Math.PI) * radius;
                const z2 = Math.sin(angle + Math.PI) * radius;
                
                return (
                    <group key={i}>
                        <DnaNode position={[x1, y, z1]} color="#38bdf8" index={i} strand={1} />
                        <DnaNode position={[x2, y, z2]} color="#818cf8" index={i} strand={2} />
                        <Line 
                            points={[[x1, y, z1], [x2, y, z2]]}
                            color="#ffffff"
                            transparent
                            opacity={hoveredNode?.index === i ? 0.8 : 0.3}
                            lineWidth={hoveredNode?.index === i ? 2 : 1}
                        />
                    </group>
                );
            })}
            <Sparkles count={80} scale={[radius * 2.5, heightSpread, radius * 2.5]} size={2} color="#818cf8" opacity={0.6} speed={0.4} />
            <pointLight intensity={2} color="#818cf8" distance={30} />
        </group>
    );
};
