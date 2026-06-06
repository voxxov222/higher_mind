import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Calculator, X, Maximize2, Minimize2, Hash, Layers, Move } from 'lucide-react';
import { calculateAllCiphers, reduceNumber } from '../utils/gematria';

const ReactiveParticles: React.FC<{ value: number }> = ({ value }) => {
  // Density: max out around 1000, color intensity scales with value
  const particleCount = Math.min(2000, 50 + value * 2);
  const hue = (value % 360);
  const color = new THREE.Color(`hsl(${hue}, 80%, 60%)`);
  const speed = 0.2 + (value * 0.001);
  const scale = 5 + (value * 0.02);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.rotation.y = state.clock.elapsedTime * (0.1 + value * 0.0001);
    }
  });

  return (
    <group ref={groupRef}>
        <Sparkles
            count={particleCount}
            scale={scale}
            size={1.5 + (value * 0.005)}
            speed={speed}
            color={color}
            opacity={0.6 + (value * 0.0005)}
        />
        <Float speed={2} rotationIntensity={0.5}>
            <Sphere args={[1 + value * 0.002, 32, 32]}>
               <MeshDistortMaterial 
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.5 + value * 0.002}
                  distort={0.4}
                  speed={2 + value * 0.005}
                  wireframe
                  transparent
                  opacity={0.3}
               />
            </Sphere>
        </Float>
    </group>
  );
};

export const GematriaHUD: React.FC<{
  onClose: () => void;
  defaultText?: string;
}> = ({ onClose, defaultText = '' }) => {
  const [input, setInput] = useState(defaultText);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const results = useMemo(() => {
    if (!input) return [];
    return calculateAllCiphers(input).filter(r => ['Ordinal', 'Reduction', 'Standard', 'Jewish', 'Satanic', 'Primes'].includes(r.cipher));
  }, [input]);

  const totalValue = results.reduce((sum, r) => sum + r.value, 0);

  return (
    <motion.div
        drag
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed z-50 flex flex-col pointer-events-auto"
        style={{ width: isMinimized ? 300 : 800, right: 40, top: 40 }}
    >
        <div className="bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col" style={{ height: isMinimized ? 'auto' : 500 }}>
            {/* HUD Header (Drag Handle) */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between cursor-move bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                <div className="flex items-center gap-2">
                    <Hash size={16} className="text-blue-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Holo-Gematria</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="text-stone-400 hover:text-white transition-colors cursor-pointer">
                        {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </button>
                    <button onClick={onClose} className="text-stone-400 hover:text-rose-400 transition-colors cursor-pointer">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {!isMinimized && (
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Calculator */}
                    <div className="w-1/2 p-6 flex flex-col border-r border-white/5 bg-gradient-to-b from-black/40 to-transparent">
                        <div className="mb-6">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="ENTER SEQUENCE..."
                                className="w-full bg-blue-950/20 border border-blue-500/30 rounded-xl px-4 py-3 text-lg font-mono text-white placeholder:text-blue-800 focus:outline-none focus:border-blue-400 transition-all uppercase tracking-widest shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {results.length > 0 ? results.map((result) => (
                                <div key={result.cipher} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between group hover:border-blue-400/30 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-stone-500 uppercase tracking-widest">{result.cipher}</span>
                                        <span className="text-xl font-mono font-light text-white">{result.value}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-stone-500 uppercase tracking-widest">Reduced</span>
                                        <span className="text-sm font-mono text-blue-400">{reduceNumber(result.value)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-blue-400">
                                    <Layers size={32} className="mb-2" />
                                    <span className="text-xs uppercase tracking-widest font-mono">Awaiting Input</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: 3D Visualization */}
                    <div className="w-1/2 relative bg-zinc-950">
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <div className="text-[10px] text-blue-400 uppercase tracking-widest font-mono border border-blue-500/30 bg-blue-950/40 px-2 py-1 rounded">
                                Quantum Resonance Index: {totalValue}
                            </div>
                        </div>
                        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={2} />
                            <ReactiveParticles value={totalValue} />
                            <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={2} />
                        </Canvas>
                    </div>
                </div>
            )}
            
            {/* Minimized State */}
            {isMinimized && (
                <div className="p-4 flex items-center gap-3">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="INPUT..."
                        className="flex-1 bg-black border border-white/10 rounded px-2 py-1 text-xs font-mono text-white uppercase focus:outline-none focus:border-blue-400"
                    />
                    <div className="text-sm font-mono text-blue-400 font-bold w-16 text-right">
                        {totalValue}
                    </div>
                </div>
            )}
        </div>
    </motion.div>
  );
};
