import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Stars, Center, Html, Line, Points, PointMaterial, OrbitControls } from '@react-three/drei';

import { CelestialBody } from '../types';

// --------------------------------------------------------
// SHADERS
// --------------------------------------------------------
const SoulParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#38bdf8') },
  },
  vertexShader: `
    attribute float size;
    attribute float random;
    
    varying float vAlpha;
    varying vec3 vColor;
    
    uniform float uTime;
    uniform vec3 uColor;
    
    void main() {
      vec3 pos = position;
      
      // Organic waving motion based on height and time
      float wave = sin(pos.y * 3.0 + uTime * 1.5 + random * 6.28) * 0.05;
      float waveZ = cos(pos.y * 2.0 + uTime * 1.2 + random * 6.28) * 0.05;
      
      pos.x += wave;
      pos.z += waveZ;
      
      // Gentle breathing scale
      float breath = sin(uTime * 0.5) * 0.02;
      pos *= (1.0 + breath + random * 0.05 * sin(uTime * 3.0));

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Depth based sizing
      gl_PointSize = size * (30.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      // Shimmering alpha
      vAlpha = 0.3 + 0.7 * sin(uTime * 2.0 + random * 10.0);
      
      // mix some violet/indigo into the core color
      vec3 highlight = vec3(0.6, 0.2, 1.0);
      vColor = mix(uColor, highlight, random * 0.5 + wave * 2.0);
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if (ll > 0.5) discard;
      
      // Soft glow
      float strength = pow((0.5 - ll) * 2.0, 1.5);
      gl_FragColor = vec4(vColor, vAlpha * strength);
    }
  `
};

const HumanSilhouette = () => {
  const count = 50000;
  
  const { positions, sizes, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const rand = new Float32Array(count);
    
    let i = 0;
    while (i < count) {
      // Generate points within a bounding box
      const x = (Math.random() - 0.5) * 2.0; // -1 to 1
      const y = (Math.random() - 0.5) * 3.0; // -1.5 to 1.5 (taller)
      const z = (Math.random() - 0.5) * 1.0; // -0.5 to 0.5 (flatter)
      
      // Shape logic
      const absX = Math.abs(x);
      let inside = false;
      
      // Head
      if (y > 0.8) {
         const headRad = 0.35;
         const hx = x;
         const hy = y - 1.15;
         const hz = z;
         if (hx*hx + hy*hy + hz*hz < headRad*headRad) inside = true;
      }
      // Torso
      else if (y > -0.2 && y <= 0.8) {
         // Shoulders logic
         const shoulderWidth = 0.7 - (0.8 - y) * 0.2; // wider at top
         if (absX < shoulderWidth && Math.abs(z) < 0.25 + (y+0.2)*0.1) inside = true;
      }
      // Hips/Legs
      else if (y <= -0.2) {
         const legWidth = 0.35;
         // Split legs
         if (absX > 0.05 && absX < legWidth && Math.abs(z) < 0.2) inside = true;
         // Connect hips
         if (y > -0.4 && absX < legWidth && Math.abs(z) < 0.2) inside = true;
      }
      
      // Arms
      if (y > -0.5 && y <= 0.7 && absX > 0.6 && absX < 0.85 && Math.abs(z) < 0.2) {
         inside = true;
      }
      
      if (inside) {
        
        // Add some noise/fuzziness to the edges
        const fuzz = 0.05;
        pos[i * 3] = x + (Math.random() - 0.5) * fuzz;
        pos[i * 3 + 1] = y + (Math.random() - 0.5) * fuzz;
        pos[i * 3 + 2] = z + (Math.random() - 0.5) * fuzz;
        
        // Size variation
        sz[i] = Math.random() * 0.8 + 0.2;
        rand[i] = Math.random();
        i++;
      }
    }
    
    return { positions: pos, sizes: sz, randoms: rand };
  }, [count]);
  
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  
  useFrame((state) => {
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (pointsRef.current) {
        pointsRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  return (
    <points ref={pointsRef}>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            <bufferAttribute attach="attributes-random" args={[randoms, 1]} />
        </bufferGeometry>
        <shaderMaterial 
            ref={materialRef}
            uniforms={SoulParticleShader.uniforms}
            vertexShader={SoulParticleShader.vertexShader}
            fragmentShader={SoulParticleShader.fragmentShader}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    </points>
  );
};

const CosmicVortex = () => {
    const vortexRef = useRef<THREE.Points>(null!);
    const count = 30000;
    
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const radius = 6.0;
        const tube = 2.5;
        
        for(let i=0; i<count; i++) {
            // Torus distribution
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI * 2;
            
            // Random displacement within the tube
            const targetTube = tube * Math.pow(Math.random(), 0.5);
            
            const x = (radius + targetTube * Math.cos(v)) * Math.cos(u);
            const y = targetTube * Math.sin(v);
            const z = (radius + targetTube * Math.cos(v)) * Math.sin(u);
            
            pos[i*3] = x;
            pos[i*3+1] = y;
            pos[i*3+2] = z;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if(vortexRef.current) {
            vortexRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
            vortexRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.2;
            vortexRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.05) * 0.2;
            
            // Pulse effect
            const scale = 1.0 + Math.sin(state.clock.getElapsedTime() * 2.0) * 0.05;
            vortexRef.current.scale.set(scale, scale, scale);
        }
    })

    return (
        <points ref={vortexRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
    )
}

const PlanetNode = ({ 
    planet, 
    index, 
    total, 
    onSelect, 
    isSelected 
}: { 
    planet: CelestialBody, 
    index: number, 
    total: number, 
    onSelect: () => void, 
    isSelected: boolean 
}) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const angle = (index / total) * Math.PI * 2;
    const radius = 2.8;
    const initialPos: [number, number, number] = [
        Math.cos(angle) * radius,
        (index % 3) * 0.4 - 0.4,
        Math.sin(angle) * radius
    ];

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = initialPos[1] + Math.sin(state.clock.getElapsedTime() * 0.8 + index) * 0.15;
            meshRef.current.rotation.y += 0.02;
            meshRef.current.rotation.x += 0.01;
            
            // Pulse color/scale when selected
            if (isSelected) {
                const s = 1.0 + Math.sin(state.clock.getElapsedTime() * 4) * 0.1;
                meshRef.current.scale.set(s, s, s);
            } else {
                meshRef.current.scale.set(1, 1, 1);
            }
        }
    });

    return (
        <group position={initialPos}>
            <mesh 
                ref={meshRef} 
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                <icosahedronGeometry args={[0.12, 1]} />
                <meshStandardMaterial 
                    color={isSelected ? "#fff" : "#a855f7"} 
                    emissive={isSelected ? "#fff" : "#a855f7"} 
                    emissiveIntensity={isSelected ? 10 : 3}
                    wireframe
                />
            </mesh>
            
            {isSelected && (
                <Html distanceFactor={8} position={[0, 0.4, 0]}>
                    <div className="bg-black/80 backdrop-blur-2xl border border-purple-500/50 p-6 rounded-[2rem] min-w-[280px] shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-in fade-in zoom-in duration-500 pointer-events-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                                <span className="text-sm text-white uppercase font-black tracking-[0.2em]">{planet.name}</span>
                            </div>
                            <span className="text-[10px] text-purple-400 font-mono tracking-tighter">{planet.degree.toFixed(2)}°</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[10px] text-purple-300/60 uppercase font-black tracking-widest mb-1">Celestial State</h4>
                                <p className="text-white text-base font-light tracking-tight">In {planet.sign} • {planet.house}th House</p>
                            </div>

                            {planet.meaning && (
                                <div>
                                    <h4 className="text-[10px] text-purple-300/60 uppercase font-black tracking-widest mb-1">Archival Meaning</h4>
                                    <p className="text-stone-300 text-xs leading-relaxed font-light">{planet.meaning}</p>
                                </div>
                            )}

                            {planet.interpretation && (
                                <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                    <h4 className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Soul Guidance
                                    </h4>
                                    <p className="text-stone-200 text-xs leading-relaxed italic">{planet.interpretation}</p>
                                </div>
                            )}

                            {planet.treeOfLifeConnection && (
                                <div className="border-t border-white/10 pt-4 mt-2">
                                    <h4 className="text-[10px] text-sky-400 uppercase font-black tracking-widest mb-1">Kabbalistic Node</h4>
                                    <p className="text-sky-100 text-[11px] font-medium">{planet.treeOfLifeConnection}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-6 flex gap-2">
                             <button className="flex-1 bg-white text-black py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Research Deeply</button>
                             <button className="px-4 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-600/40 transition-colors">Listen</button>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};

const AspectLine = ({ 
    p1, p2, aspect, onSelect, isSelected 
}: { 
    p1: [number, number, number], 
    p2: [number, number, number], 
    aspect: any,
    onSelect: () => void,
    isSelected: boolean
}) => {
    const type = aspect.type;
    const color = type === 'conjunction' ? '#fff' : type === 'trine' ? '#34d399' : type === 'sextile' ? '#60a5fa' : type === 'square' ? '#f87171' : '#fb923c';
    
    // Calculate middle point for the aspect junction
    const mid: [number, number, number] = [
        (p1[0] + p2[0]) / 2,
        (p1[1] + p2[1]) / 2,
        (p1[2] + p2[2]) / 2
    ];

    return (
        <group>
            <Line 
                points={[p1, p2]} 
                color={color} 
                lineWidth={isSelected ? 1.5 : 0.5} 
                transparent 
                opacity={isSelected ? 0.8 : 0.2} 
                dashed={type === 'square' || type === 'opposition'}
            />
            
            {/* Aspect Junction Node */}
            <mesh 
                position={mid} 
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            >
                <octahedronGeometry args={[0.06, 0]} />
                <meshStandardMaterial 
                    color={color} 
                    emissive={color} 
                    emissiveIntensity={isSelected ? 5 : 1}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            
            {isSelected && (
                <Html distanceFactor={8} position={mid}>
                    <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] min-w-[260px] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs text-white uppercase font-black tracking-widest">{aspect.type}</span>
                            <span className="text-[10px] text-stone-500 font-mono tracking-widest ml-auto">{aspect.planet1} ⚺ {aspect.planet2}</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[9px] text-stone-500 uppercase font-black tracking-widest mb-1 italic">Geometric Frequency</h4>
                                <p className="text-white text-sm font-medium leading-relaxed">{aspect.meaning || "A profound alignment in the cosmic lattice."}</p>
                            </div>
                            
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-[8px] text-stone-600 block mb-1 font-bold uppercase">Dynamic Interaction</span>
                                <p className="text-[10px] text-stone-300 leading-relaxed">
                                    This {aspect.type} represents the {aspect.planet1}'s energy blending with the {aspect.planet2}, creating a unique resonance in your soul blueprint.
                                </p>
                            </div>
                        </div>

                        <button className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">
                            Explore Alignment
                        </button>
                    </div>
                </Html>
            )}
        </group>
    );
};

export const SoulBlueprintAura = ({ data }: { data?: any }) => {
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<number | null>(null);

  const planets = useMemo(() => data?.planets || [], [data]);

  const planetPositions = useMemo(() => {
    return planets.map((p: any, i: number) => {
      const angle = (i / planets.length) * Math.PI * 2;
      const radius = 2.8;
      return {
        name: p.name,
        pos: [
          Math.cos(angle) * radius,
          (i % 3) * 0.4 - 0.4,
          Math.sin(angle) * radius
        ] as [number, number, number]
      };
    });
  }, [planets]);

  const onHandleSelectBody = (id: string) => {
    setSelectedBody(id);
    setSelectedAspect(null);
  };

  const onHandleSelectAspect = (idx: number) => {
    setSelectedAspect(idx);
    setSelectedBody(null);
  };
  
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto mix-blend-screen opacity-90" style={{ transform: 'translateZ(-100px)'}}>
      <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 7], fov: 45 }} onClick={() => { setSelectedBody(null); setSelectedAspect(null); }}>
        <OrbitControls enableZoom={true} enablePan={true} maxDistance={20} minDistance={2} />
        <fog attach="fog" args={['#000', 3, 15]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#a855f7" />

        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <Center>
            <HumanSilhouette />
          </Center>
        </Float>
        
        <group>
           {planets.map((p: any, i: number) => (
             <PlanetNode 
               key={p.name} 
               planet={p} 
               index={i} 
               total={planets.length} 
               isSelected={selectedBody === p.name}
               onSelect={() => onHandleSelectBody(p.name)}
             />
           ))}

           {data?.aspects?.map((aspect: any, idx: number) => {
             const p1 = planetPositions.find(p => p.name === aspect.planet1);
             const p2 = planetPositions.find(p => p.name === aspect.planet2);
             if (p1 && p2) {
               return (
                <AspectLine 
                    key={idx} 
                    p1={p1.pos} 
                    p2={p2.pos} 
                    aspect={aspect} 
                    isSelected={selectedAspect === idx}
                    onSelect={() => onHandleSelectAspect(idx)}
                />
               );
             }
             return null;
           })}
        </group>

        <CosmicVortex />
        
        <Stars radius={50} depth={50} count={20000} factor={4} saturation={1} fade speed={1} />
        

      </Canvas>
    </div>
  );
};
