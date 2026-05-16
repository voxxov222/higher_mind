import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html, OrbitControls, Sphere, Box, Line, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

// Tetragrammaton: YHVH - Yud, Hei, Vav, Hei
const YHVH = ['י', 'ה', 'ו', 'ה'];
const ALEPH_TAV = ['א', 'ת'];

const InteractiveNode = ({ node, index, type, activeNode, setActiveNode, setHovered }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const isActive = activeNode?.type === type && activeNode?.index === index;
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
    if (glowRef.current && isActive) {
      const glowScale = 1.2 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      glowRef.current.scale.set(glowScale, glowScale, glowScale);
    }
  });

  return (
    <group 
      position={node.position as [number, number, number]}
      onPointerOver={() => { setActiveNode({ type, index }); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setActiveNode(null); setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh ref={meshRef} rotation={type === 'yhvh' ? [Math.PI/2, 0, 0] : [0, 0, 0]}>
        {type === 'yhvh' ? <cylinderGeometry args={[0.8, 0.8, 1, 6]} /> : <octahedronGeometry args={[0.8, 0]} />}
        <meshStandardMaterial color={isActive ? '#ffffff' : node.color} emissive={isActive ? '#ffffff' : node.color} emissiveIntensity={isActive ? 2 : 0.8} transparent opacity={0.8} />
      </mesh>
      
      {/* Subtle Glow Effect for Active Node */}
      {isActive && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={1} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}

      <Text position={[0, 0, 0.8]} fontSize={0.6} color="#0f172a" anchorX="center" anchorY="center">
        {node.letter}
      </Text>
      {isActive && (
        <Html position={[1, 1, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-black/80 border border-[#fbbf24]/30 backdrop-blur-md p-3 rounded-lg font-mono text-xs w-56 shadow-[0_0_15px_rgba(251,191,36,0.3)] select-none pointer-events-none">
            <div className="text-[#fbbf24] font-bold mb-1 text-lg flex items-center justify-between">
                <span>{node.letter}</span>
                <span className="text-[9px] uppercase text-white/40 tracking-widest">{type === 'yhvh' ? 'Tetragrammaton' : 'Aleph-Tav'}</span>
            </div>
            <div className="text-white/80 leading-relaxed mb-2">{node.meaning}</div>
            <div className="flex justify-between items-center text-[10px] pt-2 border-t border-white/10">
                <span className="text-white/40">Resonance Freq</span>
                <span className="text-emerald-400">{Math.floor(Math.random() * 500) + 400} Hz</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const GridRings = ({ activeNode, radius }: any) => {
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (innerRingRef.current) {
        if (activeNode?.type === 'yhvh') {
            const scale = 1 + Math.sin(time * 5) * 0.05;
            innerRingRef.current.scale.set(scale, scale, 1);
            if(innerRingRef.current.material) {
                (innerRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.min(0.5, 0.3 + Math.sin(time * 5) * 0.1);
            }
        } else {
            innerRingRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            if(innerRingRef.current.material) {
                (innerRingRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp((innerRingRef.current.material as THREE.MeshBasicMaterial).opacity, 0.1, 0.1);
            }
        }
    }
    
    if (outerRingRef.current) {
        if (activeNode?.type === 'alephtav') {
            const scale = 1 + Math.sin(time * 3) * 0.05;
            outerRingRef.current.scale.set(scale, scale, 1);
            if (outerRingRef.current.material) {
                (outerRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.min(0.4, 0.2 + Math.sin(time * 3) * 0.1);
            }
        } else {
            outerRingRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            if (outerRingRef.current.material) {
                (outerRingRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp((outerRingRef.current.material as THREE.MeshBasicMaterial).opacity, 0.05, 0.1);
            }
        }
    }
  });

  return (
    <group>
      <mesh ref={innerRingRef} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[radius - 0.1, radius, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={outerRingRef} rotation={[Math.PI/2, 0, 0]}>
        <ringGeometry args={[radius * 1.5 - 0.1, radius * 1.5, 64]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const TetragrammatonNodes = ({ isHovered, setHovered, activeNode, setActiveNode }: any) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const radius = 4;
  const nodes = useMemo(() => {
    return YHVH.map((letter, i) => {
      const angle = (i / YHVH.length) * Math.PI * 2;
      return {
        letter,
        position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as [number, number, number],
        color: ['#fbbf24', '#f43f5e', '#38bdf8', '#c084fc'][i],
        meaning: ['Yud (Father/Fire): The spark of creation and source of all things.', 'Hei (Mother/Water): The vessel of understanding and manifestation.', 'Vav (Son/Air): The connection and vital force between realms.', 'Hei (Daughter/Earth): The final materialization and grounded reality.'][i]
      };
    });
  }, []);

  const alephTavNodes = useMemo(() => {
    return ALEPH_TAV.map((letter, i) => {
      return {
        letter,
        position: [i === 0 ? -1.5 : 1.5, 0, 0] as [number, number, number],
        color: ['#10b981', '#f59e0b'][i],
        meaning: ['Aleph (Alpha/Source): The primordial unity, silence before creation.', 'Tav (Omega/Truth): The culmination, seal of truth, and infinity.'][i]
      };
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central Core */}
      <Sphere args={[1.2, 32, 32]}>
        <meshStandardMaterial color="#0f172a" emissive="#fbbf24" emissiveIntensity={0.3} wireframe />
      </Sphere>

      {/* Aleph-Tav Nodes */}
      {alephTavNodes.map((node, i) => (
        <InteractiveNode 
          key={`alephtav-${i}`} 
          node={node} 
          index={i} 
          type="alephtav" 
          activeNode={activeNode} 
          setActiveNode={setActiveNode} 
          setHovered={setHovered} 
        />
      ))}

      {/* Connecting lines for YHVH */}
      {nodes.map((node, i) => (
        <Line 
          key={`line-${i}`}
          points={[[0,0,0], node.position]} 
          color={node.color} 
          lineWidth={2} 
          transparent 
          opacity={0.4} 
        />
      ))}

      {/* Outer YHVH Nodes */}
      {nodes.map((node, i) => (
        <InteractiveNode 
          key={`yhvh-${i}`} 
          node={node} 
          index={i} 
          type="yhvh" 
          activeNode={activeNode} 
          setActiveNode={setActiveNode} 
          setHovered={setHovered} 
        />
      ))}

      {/* Grid rings */}
      <GridRings activeNode={activeNode} radius={radius} />
    </group>
  );
};

const AlephTavIndexHUD = ({ activeNode }: { activeNode: { type: string, index: number } | null }) => {
    // Generate some matrix-like index data
    const indices = useMemo(() => {
        return Array.from({length: 22}).map((_, i) => ({
            id: i,
            symbol: String.fromCharCode(0x05D0 + i), // Hebrew aleph-bet
            baseValue: Math.random() * 100,
            state: Math.random() > 0.5 ? 'ACTIVE' : 'DORMANT'
        }));
    }, []);

    const sortedIndices = useMemo(() => {
        if (!activeNode) return indices;
        const seed = activeNode.type === 'yhvh' ? activeNode.index + 1 : activeNode.index + 7;
        return [...indices].sort((a, b) => {
            const aVal = (a.id * seed) % 22;
            const bVal = (b.id * seed) % 22;
            return aVal - bVal;
        });
    }, [indices, activeNode]);

    return (
        <div className="absolute top-4 left-4 w-64 pointer-events-none">
            <div className="bg-slate-950/80 border border-emerald-500/30 backdrop-blur-md p-4 rounded-xl text-xs font-mono shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="text-emerald-400 font-bold mb-2 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeNode !== null ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                        ALEPH-TAV INDEX
                    </span>
                    <span className="opacity-70">v2.09</span>
                </div>
                <div className="h-px bg-emerald-500/30 mb-3 w-full"></div>
                
                <div className="grid grid-cols-4 gap-1.5 min-h-[200px]">
                    {sortedIndices.map((idx, i) => {
                        const isFocused = activeNode !== null;
                        const activeIndex = activeNode?.index || 0;
                        const valueString = isFocused 
                            ? (idx.baseValue + activeIndex * 15 + Math.random() * 5).toFixed(2) 
                            : idx.baseValue.toFixed(2);
                        
                        return (
                            <motion.div 
                                layout
                                key={idx.id} 
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ 
                                    opacity: 1, 
                                    scale: 1, 
                                    y: 0,
                                    backgroundColor: isFocused && idx.state === 'ACTIVE' 
                                        ? 'rgba(16, 185, 129, 0.2)' 
                                        : idx.state === 'ACTIVE' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0, 0, 0, 0.4)',
                                    borderColor: isFocused && idx.state === 'ACTIVE'
                                        ? 'rgba(16, 185, 129, 0.8)'
                                        : isFocused ? 'rgba(148, 163, 184, 0.2)' : idx.state === 'ACTIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(30, 41, 59, 0.4)'
                                }}
                                transition={{ 
                                    opacity: { duration: 0.4 },
                                    layout: { type: "spring", stiffness: 200, damping: 20 },
                                    default: { duration: 0.4 }
                                }}
                                className={`p-1.5 border rounded-md flex flex-col items-center justify-center relative overflow-hidden`}
                            >
                                {isFocused && idx.state === 'ACTIVE' && (
                                    <motion.div 
                                        className="absolute inset-0 bg-emerald-400/20"
                                        animate={{ opacity: [0, 0.6, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: Math.random() * 2 }}
                                    />
                                )}
                                <motion.span 
                                    className={`text-lg relative z-10 ${isFocused && idx.state === 'ACTIVE' ? 'text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]' : idx.state === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-500'}`}
                                    animate={{ 
                                        scale: isFocused && idx.state === 'ACTIVE' ? [1, 1.1, 1] : 1
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {idx.symbol}
                                </motion.span>
                                <motion.span 
                                    className={`text-[8px] mt-0.5 relative z-10 font-bold ${isFocused ? 'text-emerald-200' : 'text-slate-600'}`}
                                    animate={{ opacity: isFocused ? [0.7, 1, 0.7] : 0.7 }}
                                    transition={{ duration: 0.5, repeat: isFocused ? Infinity : 0 }}
                                >
                                    {valueString}
                                </motion.span>
                            </motion.div>
                        );
                    })}
                </div>
                
                <div className="mt-4 text-[10px] text-emerald-500/70 border-t border-emerald-900/50 pt-2 flex justify-between items-center">
                    <span className="flex items-center gap-1">
                        SYS.INTEGRITY
                        {activeNode !== null && <motion.span animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="inline-block w-2 h-2 border-t border-emerald-500 rounded-full"></motion.span>}
                    </span>
                    <span className="text-emerald-400 font-bold">{activeNode !== null ? 'RECALIBRATING...' : '100%'}</span>
                </div>
            </div>
        </div>
    );
};

export const TetragrammatonHUD = ({ activeTab, data }: { activeTab?: string, data?: any }) => {
  const [isHovered, setHovered] = useState(false);
  const [activeNode, setActiveNode] = useState<{ type: string, index: number } | null>(null);

  return (
    <div className="w-full h-full relative bg-[#020617] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-[#020617] pointer-events-none z-0"></div>
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, -8, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
          
          <TetragrammatonNodes isHovered={isHovered} setHovered={setHovered} activeNode={activeNode} setActiveNode={setActiveNode} />

          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={3} 
            maxDistance={20} 
            makeDefault 
            autoRotate={!isHovered}
            autoRotateSpeed={0.5}
          />

          {/* Background particles */}
          <group>
            {Array.from({ length: 200 }).map((_, i) => (
              <Box 
                key={`particle-${i}`} 
                args={[0.05, 0.05, 0.05]} 
                position={[
                  (Math.random() - 0.5) * 20, 
                  (Math.random() - 0.5) * 20, 
                  (Math.random() - 0.5) * 20
                ]}
              >
                <meshBasicMaterial color="#38bdf8" transparent opacity={Math.random() * 0.5} />
              </Box>
            ))}
          </group>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
            <AlephTavIndexHUD activeNode={activeNode} />

            <div className="bg-slate-950/80 border border-[#fbbf24]/30 backdrop-blur-md p-4 rounded-xl text-right pointer-events-auto shadow-[0_0_20px_rgba(251,191,36,0.1)]">
                <h2 className="text-[#fbbf24] font-bold tracking-widest uppercase text-sm mb-1">Tetragrammaton Sequence</h2>
                <div className="flex items-center gap-2 justify-end text-xs text-white/50 mb-4 font-mono">
                <span className={`w-2 h-2 rounded-full border ${activeNode !== null ? 'border-amber-400 bg-amber-400 animate-pulse' : 'border-green-500 bg-green-500/50'}`}></span>
                {activeNode !== null ? 'DECODING NODE...' : 'HUD LINK ACTIVE'}
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1 gap-6">
                        <span className="text-white/40">Resonance Freq</span>
                        <span className="text-[#38bdf8] font-mono">{activeNode !== null ? `${(528 * (activeNode.index + 1)).toFixed(0)} Hz` : '528 Hz'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1 gap-6">
                        <span className="text-white/40">Geometric Phase</span>
                        <span className="text-[#f43f5e] font-mono">{activeNode !== null ? (activeNode.type === 'yhvh' ? ['Tetrahedron', 'Hexahedron', 'Octahedron', 'Dodecahedron'][activeNode.index] : ['Point', 'Line'][activeNode.index]) : 'Merkhaba'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs gap-6">
                        <span className="text-white/40">Dimensional Tier</span>
                        <span className="text-[#c084fc] font-mono">{activeNode !== null ? `${5 + activeNode.index}D Transit` : '5D Core'}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="pointer-events-auto self-center pb-4 text-center">
            <p className="text-xs text-white/40 tracking-widest uppercase bg-black/50 px-4 py-2 border border-white/10 rounded-full backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                {activeNode !== null ? `Synchronizing with Node ${activeNode.type}-${activeNode.index + 1}` : 'Interact with nodes to decode YHVH sequence'}
            </p>
        </div>
      </div>
    </div>
  );
};
