import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Trail, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Orbit } from 'lucide-react';
import { CosmicData } from '../types';

const PLANET_COLORS: Record<string, string> = {
  'Sun': '#facc15',
  'Moon': '#cbd5e1',
  'Mercury': '#6ee7b7',
  'Venus': '#f472b6',
  'Mars': '#ef4444',
  'Jupiter': '#fb923c',
  'Saturn': '#eab308',
  'Uranus': '#38bdf8',
  'Neptune': '#818cf8',
  'Pluto': '#94a3b8',
  'Ascendant': '#ffffff',
  'Midheaven': '#ffffff'
};

const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀',
  'Mars': '♂', 'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅',
  'Neptune': '♆', 'Pluto': '♇', 'Ascendant': 'Asc', 'Midheaven': 'MC'
};

const EclipticRing: React.FC = () => {
    return (
        <mesh rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[10, 0.02, 16, 100]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </mesh>
    );
};

const ZodiacMarkers: React.FC = () => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const radius = 10.5;
    
    return (
        <group>
            {signs.map((sign, i) => {
                const angle = (i * 30) * (Math.PI / 180);
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                
                return (
                    <Text key={sign} position={[x, 0, z]} rotation={[-Math.PI/2, 0, angle + Math.PI/2]} fontSize={0.8} color="rgba(255,255,255,0.2)" anchorX="center" anchorY="middle">
                        {sign}
                    </Text>
                );
            })}
        </group>
    );
};

const PlanetaryBody: React.FC<{ name: string; degree: number; color: string; symbol: string; onClick: () => void }> = ({ name, degree, color, symbol, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const radius = 10;
    
    // Degree 0 is Aries, counter-clockwise
    const radians = degree * (Math.PI / 180);
    const x = Math.cos(radians) * radius;
    const z = Math.sin(radians) * radius;
    // Add some random y offset so they aren't all perfectly on the ecliptic
    const yOffset = useMemo(() => (Math.random() - 0.5) * 2, []);

    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group position={[x, yOffset, z]} onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)}>
            <Trail width={1} length={20} color={color} attenuation={(t) => t * t}>
               <mesh ref={meshRef}>
                   <sphereGeometry args={[hovered ? 0.6 : 0.4, 32, 32]} />
                   <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 2 : 0.5} roughness={0.2} metalness={0.8} />
               </mesh>
            </Trail>
            <pointLight distance={3} intensity={hovered ? 2 : 0.5} color={color} />
            
            <Billboard>
                <Text position={[0, hovered ? 1.5 : 1, 0]} fontSize={hovered ? 0.6 : 0.4} color={hovered ? '#ffffff' : color} outlineWidth={0.02} outlineColor="#000000">
                    {symbol}
                </Text>
                {hovered && (
                    <Text position={[0, -0.8, 0]} fontSize={0.3} color="#aaaaaa">
                        {name} ({degree.toFixed(1)}°)
                    </Text>
                )}
            </Billboard>
        </group>
    );
};

import { Billboard } from '@react-three/drei';

export const CelestialSphereSection = ({ data }: { data: CosmicData }) => {
    const [selectedPlanet, setSelectedPlanet] = useState<any>(null);

    return (
        <div className="flex flex-col h-full bg-zinc-950 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
            
            <div className="absolute inset-0">
                <Canvas camera={{ position: [0, 15, 20], fov: 45 }}>
                    <color attach="background" args={['#000000']} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[0, 0, 0]} intensity={1} color="#facc15" /> {/* Use the center as the sun approx */}
                    
                    <Stars radius={50} depth={50} count={3000} factor={6} saturation={0} fade speed={1} />
                    
                    {/* Center Core */}
                    <mesh>
                        <sphereGeometry args={[2, 32, 32]} />
                        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.05} />
                    </mesh>

                    <EclipticRing />
                    <ZodiacMarkers />

                    {data.planets.map((planet) => (
                        <PlanetaryBody 
                            key={planet.name}
                            name={planet.name}
                            degree={planet.degree}
                            color={PLANET_COLORS[planet.name] || '#ffffff'}
                            symbol={PLANET_SYMBOLS[planet.name] || '?'}
                            onClick={() => setSelectedPlanet(planet)}
                        />
                    ))}

                    <OrbitControls maxDistance={50} minDistance={5} />
                </Canvas>
            </div>

            {/* UI Overlay */}
            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                    Astrolabe <Orbit className="text-indigo-400" />
                </h1>
                <p className="text-zinc-400 max-w-sm">
                    Interactive 3D celestial mapping of real-time planetary positions based on your natal alignment.
                </p>
            </div>

            <AnimatePresence>
                {selectedPlanet && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute bottom-8 right-8 w-80 bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl pointer-events-auto"
                    >
                        <button onClick={() => setSelectedPlanet(null)} className="absolute top-4 right-4 text-stone-500 hover:text-white">✕</button>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl" style={{ border: `1px solid ${PLANET_COLORS[selectedPlanet.name] || '#ffffff'}40`, color: PLANET_COLORS[selectedPlanet.name] || '#ffffff', background: `${PLANET_COLORS[selectedPlanet.name] || '#ffffff'}10` }}>
                                {PLANET_SYMBOLS[selectedPlanet.name] || '?'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedPlanet.name}</h3>
                                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{selectedPlanet.sign} • {selectedPlanet.degree.toFixed(2)}°</div>
                            </div>
                        </div>
                        
                        <div className="space-y-4 text-sm text-zinc-300 border-t border-white/10 pt-4 mt-4">
                            <div>
                                <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest block mb-1">House Placement</span>
                                <span className="font-bold text-white">House {selectedPlanet.house}</span>
                            </div>
                            {selectedPlanet.meaning && (
                                <div>
                                    <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest block mb-1">Archetypal Meaning</span>
                                    <span className="leading-relaxed">{selectedPlanet.meaning}</span>
                                </div>
                            )}
                            {selectedPlanet.treeOfLifeConnection && (
                                <div>
                                    <span className="text-[10px] text-fuchsia-400 font-mono uppercase tracking-widest block mb-1">Kabbalistic Link</span>
                                    <span className="leading-relaxed">{selectedPlanet.treeOfLifeConnection}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
