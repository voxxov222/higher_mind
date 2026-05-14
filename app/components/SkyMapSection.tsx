import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Html, Line, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Search, Info, Stars as StarsIcon, Navigation } from 'lucide-react';

// Procedurally generate a mock star catalog to simulate HR (Harvard Revised) catalogue
const generateStars = (count: number) => {
  const stars = [];
  const constellations = ['Orion', 'Ursa Major', 'Cassiopeia', 'Cygnus', 'Lyra', 'Scorpius', 'Taurus', 'Leo'];
  const spectralTypes = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];
  const colors: Record<string, string> = {
    'O': '#9bb0ff', 'B': '#aabfff', 'A': '#ffffff', 'F': '#fff4e8',
    'G': '#fff2a1', 'K': '#ffc46f', 'M': '#ff8266'
  };

  const hrNumbers = new Set<number>();
  while (hrNumbers.size < count) {
    hrNumbers.add(Math.floor(Math.random() * 9000) + 1);
  }
  const hrNumbersArray = Array.from(hrNumbers);

  for (let i = 0; i < count; i++) {
    const hrNumber = hrNumbersArray[i];
    const spectral = spectralTypes[Math.floor(Math.random() * spectralTypes.length)];
    const dist = 50 + Math.random() * 500;
    
    // Spherical distribution
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = dist * Math.sin(phi) * Math.cos(theta);
    const y = dist * Math.sin(phi) * Math.sin(theta);
    const z = dist * Math.cos(phi);

    stars.push({
      id: `HR ${hrNumber}`,
      position: [x, y, z] as [number, number, number],
      color: colors[spectral],
      size: Math.random() * 1.5 + 0.5,
      spectralType: spectral,
      constellation: Math.random() > 0.7 ? constellations[Math.floor(Math.random() * constellations.length)] : null,
      distance: (dist * 0.326).toFixed(1), // Approx Lightyears
      magnitude: (Math.random() * 6).toFixed(2)
    });
  }
  return stars;
};

// Procedurally generate some mock constellation lines
const generateConstellations = (stars: any[]) => {
  const lines: any[] = [];
  const grouped = stars.reduce((acc, star) => {
    if (star.constellation) {
      if (!acc[star.constellation]) acc[star.constellation] = [];
      acc[star.constellation].push(star);
    }
    return acc;
  }, {} as Record<string, any[]>);

  Object.entries(grouped).forEach(([name, constellationStars]) => {
    // Just connect them in a sequence for a mystical look
    for (let i = 0; i < constellationStars.length - 1; i++) {
      if (Math.random() > 0.3) {
        lines.push({
          start: constellationStars[i].position,
          end: constellationStars[i + 1].position,
          name
        });
      }
    }
  });
  return lines;
};

const SkyMapScene = ({ onSelectStar, travelMode, targetPosition, starDensity, showConstellations }: any) => {
  const { camera } = useThree();
  const allStarsInfo = useMemo(() => generateStars(5000), []);
  const starsInfo = useMemo(() => allStarsInfo.slice(0, starDensity), [allStarsInfo, starDensity]);
  const constellationLines = useMemo(() => generateConstellations(starsInfo), [starsInfo]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Camera smooth travel
  useFrame((state, delta) => {
    if (!travelMode && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02; // Slow rotation
    }

    if (travelMode && targetPosition) {
      // Smoothly move camera towards target
      const targetVec = new THREE.Vector3(...targetPosition).multiplyScalar(0.8); // Stop a bit before the star
      camera.position.lerp(targetVec, 0.02);
      camera.lookAt(new THREE.Vector3(...targetPosition));
    } else if (!travelMode) {
      // Return to origin or stay
      camera.lookAt(0,0,0);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.1} />
      
      {/* Background Starfield */}
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Constellation Lines */}
      {showConstellations && constellationLines.map((line, i) => (
        <Line 
          key={`const_${i}`}
          points={[line.start, line.end]}
          color="#4f46e5"
          opacity={0.3}
          transparent
          lineWidth={0.5}
        />
      ))}

      {/* Interactive HR Stars */}
      {starsInfo.map((star, i) => (
        <group key={`${star.id}-${i}`} position={star.position}>
          <mesh onClick={(e) => { e.stopPropagation(); onSelectStar(star); }}>
            <sphereGeometry args={[star.size, 16, 16]} />
            <meshBasicMaterial color={star.color} />
          </mesh>
          <pointLight color={star.color} intensity={1} distance={star.size * 5} />
          
          {/* Subtle glow */}
          <mesh>
            <sphereGeometry args={[star.size * 2, 16, 16]} />
            <meshBasicMaterial color={star.color} transparent opacity={0.15} />
          </mesh>

          {/* Label visible when close (using distance to camera could be optimized, but let's just make it small) */}
          {star.constellation && Math.random() > 0.8 && (
             <Text
               position={[0, star.size + 2, 0]}
               fontSize={2}
               color="white"
               anchorX="center"
               anchorY="middle"
               opacity={0.5}
             >
               {star.constellation}
             </Text>
          )}
        </group>
      ))}
    </group>
  );
};

export const SkyMapSection = () => {
  const [selectedStar, setSelectedStar] = useState<any | null>(null);
  const [starDetails, setStarDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [travelMode, setTravelMode] = useState(false);
  const [starDensity, setStarDensity] = useState(1000);
  const [showConstellations, setShowConstellations] = useState(true);

  const handleSelectStar = (star: any) => {
    setSelectedStar(star);
    setLoadingDetails(true);
    setStarDetails(null);

    // Mock data fetch simulating an API call
    setTimeout(() => {
      setStarDetails({
        mass: (Math.random() * 10 + 0.1).toFixed(2) + ' M☉',
        temperature: Math.floor(Math.random() * 30000 + 3000) + ' K',
        luminosity: (Math.random() * 10000 + 0.1).toFixed(2) + ' L☉',
        radius: (Math.random() * 20 + 0.1).toFixed(2) + ' R☉',
        composition: 'Hydrogen 74%, Helium 24%, Metals 2%',
        description: `Deep space scans indicate this ${star.spectralType}-class star maintains a stable harmonic resonance near 528Hz. Potential for habitable exoplanets detected in its orbital planes.`
      });
      setLoadingDetails(false);
    }, 1200);
  };

  return (
    <div className="relative w-full h-[85vh] bg-stone-950 rounded-3xl border border-white/10 overflow-hidden flex flex-col group">
      
      {/* Top HUD */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
        <div>
           <h2 className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-500 tracking-[0.2em] mb-1 flex items-center gap-3">
             <StarsIcon size={24} className="text-indigo-400" />
             CELESTIAL ATLAS
           </h2>
           <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">HR Star Catalogue & Coordinates</p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto items-start">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col gap-3 backdrop-blur-md shadow-lg">
             <div className="flex justify-between items-center w-full gap-4">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Density: {starDensity}</span>
                <input 
                  type="range" 
                  min="100" 
                  max="5000" 
                  step="100"
                  value={starDensity} 
                  onChange={(e) => setStarDensity(parseInt(e.target.value))}
                  className="w-24 accent-indigo-500 h-1 bg-stone-700 rounded-full appearance-none outline-none"
                />
             </div>
             <div className="flex justify-between items-center w-full gap-4">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Constellations</span>
                <button onClick={() => setShowConstellations(!showConstellations)} className={`w-8 h-4 rounded-full transition-colors relative flex items-center ${showConstellations ? 'bg-indigo-500' : 'bg-stone-600'}`}>
                   <div className={`w-3 h-3 rounded-full bg-white absolute transition-transform ${showConstellations ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                </button>
             </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-md shadow-lg h-fit">
            <Search size={14} className="text-stone-400" />
            <input 
               type="text" 
               placeholder="Search HR designation..." 
               className="bg-transparent border-none outline-none text-xs text-white placeholder-stone-500 w-40"
            />
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="absolute inset-0 z-10 cursor-crosshair">
        <Canvas camera={{ position: [0, 0, 150], fov: 60 }}>
          <SkyMapScene 
             onSelectStar={handleSelectStar} 
             travelMode={travelMode} 
             targetPosition={selectedStar?.position} 
             starDensity={starDensity}
             showConstellations={showConstellations}
          />
          {!travelMode && <OrbitControls enablePan={true} enableZoom={true} autoRotate={false} />}
        </Canvas>
      </div>

      {/* Bottom Information Panel */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-6 z-20 w-[400px] bg-stone-900/80 backdrop-blur-lg border border-indigo-500/30 rounded-2xl p-6 pointer-events-auto shadow-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-light text-white tracking-wider flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedStar.color, boxShadow: `0 0 10px ${selectedStar.color}` }}></span>
                  {selectedStar.id}
                </h3>
                {selectedStar.constellation && (
                  <p className="text-[10px] text-indigo-400 uppercase tracking-widest mt-1 font-bold">Constellation: {selectedStar.constellation}</p>
                )}
              </div>
              <button 
                onClick={() => { setSelectedStar(null); setStarDetails(null); }} 
                className="text-stone-500 hover:text-white transition-colors"
              >
                <Search size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Classification</span>
                <span className="text-sm font-mono text-stone-300">Class {selectedStar.spectralType}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Apparent Mag</span>
                <span className="text-sm font-mono text-stone-300">+{selectedStar.magnitude}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Distance</span>
                <span className="text-sm font-mono text-stone-300">{selectedStar.distance} LY</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Coordinates</span>
                <span className="text-xs font-mono text-stone-400">
                  [{selectedStar.position[0].toFixed(0)}, {selectedStar.position[1].toFixed(0)}, {selectedStar.position[2].toFixed(0)}]
                </span>
              </div>

              {loadingDetails && (
                <div className="py-4 flex flex-col items-center justify-center gap-2">
                  <motion.div 
                    className="w-5 h-5 border-2 border-indigo-500/30 rounded-full border-t-indigo-400 animate-spin"
                  />
                  <span className="text-[10px] text-indigo-400/70 uppercase tracking-widest font-bold">Connecting to deep space telemetry...</span>
                </div>
              )}

              {starDetails && !loadingDetails && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-stone-500 uppercase tracking-wider">Mass</span>
                    <span className="text-sm font-mono text-stone-300">{starDetails.mass}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-stone-500 uppercase tracking-wider">Temperature</span>
                    <span className="text-sm font-mono text-stone-300">{starDetails.temperature}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-stone-500 uppercase tracking-wider">Luminosity</span>
                    <span className="text-sm font-mono text-stone-300">{starDetails.luminosity}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-stone-500 uppercase tracking-wider">Radius</span>
                    <span className="text-sm font-mono text-stone-300">{starDetails.radius}</span>
                  </div>
                  <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-[10px] text-stone-300 leading-relaxed font-mono">
                           {starDetails.description}
                         </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <button 
               onClick={() => setTravelMode(!travelMode)}
               className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold transition-all
                 ${travelMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-500/30'}`}
            >
              {travelMode ? (
                <><Search size={16} /> Cancel Navigation</>
              ) : (
                <><Navigation size={16} /> Travel to System</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Travel Overlay Effect */}
      <AnimatePresence>
        {travelMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-15 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, rgba(99, 102, 241, 0.1) 80%, rgba(0,0,0,0.8) 100%)'
            }}
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-center">
                <motion.div 
                  className="w-32 h-32 border border-indigo-500/30 rounded-full border-t-indigo-400 animate-spin"
                  style={{ animationDuration: '2s' }}
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
