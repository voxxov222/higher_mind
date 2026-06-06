import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Maximize2, Minimize2, Orbit } from 'lucide-react';

const PLANETS = [
  { id: 'sun', name: 'Sun', symbol: '☉', color: '#facc15', size: 1.5, distance: 0, speed: 0, showOrbit: false },
  { id: 'mercury', name: 'Mercury', symbol: '☿', color: '#6ee7b7', size: 0.3, distance: 2.5, speed: 4.15, showOrbit: true },
  { id: 'venus', name: 'Venus', symbol: '♀', color: '#f472b6', size: 0.5, distance: 3.5, speed: 1.62, showOrbit: true },
  { id: 'earth', name: 'Earth', symbol: '⊕', color: '#3b82f6', size: 0.55, distance: 4.8, speed: 1, showOrbit: true },
  { id: 'mars', name: 'Mars', symbol: '♂', color: '#ef4444', size: 0.4, distance: 6.2, speed: 0.53, showOrbit: true },
  { id: 'jupiter', name: 'Jupiter', symbol: '♃', color: '#fb923c', size: 1.2, distance: 9.5, speed: 0.08, showOrbit: true },
  { id: 'saturn', name: 'Saturn', symbol: '♄', color: '#eab308', size: 1.0, distance: 13.0, speed: 0.03, showOrbit: true },
  { id: 'uranus', name: 'Uranus', symbol: '♅', color: '#38bdf8', size: 0.8, distance: 16.5, speed: 0.01, showOrbit: true },
  { id: 'neptune', name: 'Neptune', symbol: '♆', color: '#818cf8', size: 0.75, distance: 20.0, speed: 0.005, showOrbit: true },
  { id: 'pluto', name: 'Pluto', symbol: '♇', color: '#94a3b8', size: 0.2, distance: 23.5, speed: 0.004, showOrbit: true }
];

const OrbitalPath: React.FC<{ distance: number; color: string }> = ({ distance, color }) => {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(theta) * distance, 0, Math.sin(theta) * distance]);
    }
    return pts;
  }, [distance]);

  return <Line points={points} color={color} lineWidth={1} transparent opacity={0.15} />;
};

const CelestialBody: React.FC<{
  data: typeof PLANETS[0];
  isFocused: boolean;
  timeScale: number;
  onFocus: () => void;
}> = ({ data, isFocused, timeScale, onFocus }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { clock } = useThree();

  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(() => {
    if (groupRef.current && data.distance > 0) {
      // Calculate position based on elapsed time and orbital mechanics
      const theta = clock.getElapsedTime() * data.speed * 0.1 * timeScale + randomOffset;
      groupRef.current.position.x = Math.cos(theta) * data.distance;
      groupRef.current.position.z = Math.sin(theta) * data.distance;
    }
    if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      {data.showOrbit && <OrbitalPath distance={data.distance} color={data.color} />}
      <group ref={groupRef}>
        <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onFocus(); }}>
          <sphereGeometry args={[data.size, 32, 32]} />
          <meshStandardMaterial 
            color={data.color} 
            emissive={data.id === 'sun' ? data.color : '#000000'}
            emissiveIntensity={data.id === 'sun' ? 2 : 0}
            roughness={0.4} 
            metalness={0.2} 
          />
          {isFocused && (
             <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
          )}
        </mesh>
        
        {/* Glow point light if it's the sun */}
        {data.id === 'sun' && <pointLight intensity={10} distance={50} color={data.color} />}

        <Float speed={2} rotationIntensity={0} floatIntensity={0.5} position={[0, data.size + 0.5, 0]}>
            <Text
              fontSize={0.5}
              color={isFocused ? '#ffffff' : data.color}
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {data.name}
            </Text>
            <Text
              position={[0, -0.6, 0]}
              fontSize={0.8}
              color={data.color}
              anchorX="center"
              anchorY="top"
              transparent
              opacity={0.5}
            >
              {data.symbol}
            </Text>
        </Float>
      </group>
    </group>
  );
};

const StarChartScene: React.FC<{
    focusedBody: string | null;
    timeScale: number;
    setFocusedBody: (id: string | null) => void;
}> = ({ focusedBody, timeScale, setFocusedBody }) => {
    const controlsRef = useRef<any>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (controlsRef.current && focusedBody) {
             // In a real advanced app, we would calculate the world position of the specific planet 
             // and smoothly interpolate camera target to it.
             // For simplicity, we let the user manually pan via controls when not focused on center.
        }
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <Stars radius={100} depth={50} count={5000} factor={6} saturation={0.5} fade speed={1} />
            
            {PLANETS.map(planet => (
                <CelestialBody 
                    key={planet.id} 
                    data={planet} 
                    isFocused={focusedBody === planet.id}
                    timeScale={timeScale}
                    onFocus={() => setFocusedBody(planet.id)}
                />
            ))}

            <OrbitControls 
                ref={controlsRef}
                enableZoom={true} 
                enablePan={true} 
                maxDistance={50}
                minDistance={2}
                autoRotate={!focusedBody && timeScale > 0}
                autoRotateSpeed={0.5 * timeScale}
            />
        </>
    );
};

export const StarChart3D: React.FC = () => {
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [timeScale, setTimeScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`flex flex-col bg-zinc-950 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden font-sans ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full min-h-[600px] w-full'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
      
      {/* Top HUD */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start z-10 pointer-events-none">
        <div>
          <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center justify-between">
            <span>3D Star Chart</span>
          </h2>
          <p className="text-sm font-mono text-zinc-500 max-w-sm mt-2">
            Real-time planetary simulation. Select a celestial body to focus, rotate to view the astral field.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-black/50 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Viewer"}
            >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            {focusedBody && (
                <button 
                    onClick={() => setFocusedBody(null)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                    Reset Focus
                </button>
            )}
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="flex-1 w-full relative">
        <Canvas camera={{ position: [0, 15, 25], fov: 45 }}>
            <StarChartScene focusedBody={focusedBody} timeScale={timeScale} setFocusedBody={setFocusedBody} />
        </Canvas>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 inset-x-0 p-6 z-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            
            {/* Speed Control */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 backdrop-blur-md pointer-events-auto max-w-sm">
                <div className="flex justify-between items-center text-xs uppercase tracking-wider text-zinc-500 mb-3">
                    <span className="flex items-center gap-2"><Orbit size={14} /> Time Dilation</span>
                    <span className="text-teal-400 font-mono">{timeScale.toFixed(1)}x</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="25" step="0.5" 
                    value={timeScale} 
                    onChange={(e) => setTimeScale(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-teal-500"
                />
            </div>

            {/* Selected Info */}
            <div className="flex justify-end pointer-events-auto">
                <div className="flex flex-wrap gap-2 justify-end">
                    {PLANETS.map(planet => (
                        <button
                            key={planet.id}
                            onClick={() => setFocusedBody(planet.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-mono border transition-all ${
                                focusedBody === planet.id 
                                    ? 'bg-white/10 text-white border-white/20 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                                    : 'bg-black/50 text-zinc-400 border-white/5 hover:bg-white/5'
                            }`}
                            style={{ 
                                borderColor: focusedBody === planet.id ? planet.color : undefined,
                                color: focusedBody === planet.id ? planet.color : undefined
                            }}
                        >
                            <span className="mr-2 opacity-70">{planet.symbol}</span>
                            {planet.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
