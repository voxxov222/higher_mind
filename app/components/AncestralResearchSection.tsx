import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Globe, Search, Database, GitBranch, Fingerprint, Activity, MapPin } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const EarthGlobe = ({ originCoords }: { originCoords: {lat: number, lng: number, name: string}[] }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  const getPosition = (lat: number, lng: number, radius: number): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return [x, y, z];
  };

  return (
    <group>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color="#60a5fa" />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#a78bfa" />
      
      <Sphere ref={earthRef} args={[2.5, 64, 64]}>
        <meshStandardMaterial 
          color="#0f172a"
          wireframe
          transparent
          opacity={0.3}
          emissive="#1e3a8a"
          emissiveIntensity={0.5}
        />
      </Sphere>

      {originCoords.map((coord, i) => (
        <group key={i} position={getPosition(coord.lat, coord.lng, 2.55)}>
           <mesh>
             <sphereGeometry args={[0.05, 16, 16]} />
             <meshBasicMaterial color="#38bdf8" />
           </mesh>
           <Html distanceFactor={15}>
              <div className="bg-sky-900/80 text-sky-100 text-[8px] uppercase tracking-widest px-2 py-1 rounded border border-sky-400/50 whitespace-nowrap">
                {coord.name}
              </div>
           </Html>
        </group>
      ))}
      <Stars radius={10} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls enableZoom={true} enablePan={false} autoRotate={!originCoords.length} autoRotateSpeed={0.5} />
    </group>
  );
};

export const AncestralResearchSection = ({ initialLastName }: { initialLastName?: string }) => {
  const [lastName, setLastName] = useState(initialLastName || '');
  const [maidenName, setMaidenName] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleResearch = async () => {
    if (!lastName) return;
    setIsResearching(true);
    setResults(null);
    try {
      const response = await fetch('/api/ancestral-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName, maidenName })
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="bg-stone-950 rounded-[3rem] border border-white/5 p-8 relative overflow-hidden mt-8">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <GitBranch className="w-64 h-64 text-sky-500" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-12">
        {/* Left Side: Setup & Input */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div>
             <h3 className="text-2xl font-light text-white mb-2 flex items-center gap-3">
               <Database className="w-6 h-6 text-sky-400" />
               Ancestral Origin Matrix
             </h3>
             <p className="text-sm text-stone-400 leading-relaxed">
               Dive deep into the historical frequency of your lineage. Search global origin databases to uncover the geographical roots, migrations, and meaning behind your family tree.
             </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-4 block mb-2">Primary Last Name / Surname</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-sky-500/50 transition-all font-light"
                placeholder="e.g. Smith, Cohen, Rodriguez"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-4 block mb-2">Mother's Maiden Name (Optional)</label>
              <input 
                type="text" 
                value={maidenName}
                onChange={(e) => setMaidenName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-light"
                placeholder="Connect maternal lineage"
              />
            </div>

            <button 
              onClick={handleResearch}
              disabled={isResearching || !lastName}
              className="w-full mt-4 bg-sky-900/40 hover:bg-sky-800/60 disabled:opacity-50 text-sky-100 border border-sky-500/30 rounded-2xl py-4 flex items-center justify-center gap-3 transition-all"
            >
              {isResearching ? (
                <><Activity className="w-5 h-5 animate-pulse" /> Scanning Global Databases...</>
              ) : (
                <><Search className="w-5 h-5" /> Initiate Heritage Scan</>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Visualizer & Results */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          <div className="h-[400px] bg-black/60 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
             {!results && !isResearching && (
                <div className="absolute inset-0 flex items-center justify-center flex-col text-center opacity-30 z-10 pointer-events-none">
                   <Globe className="w-16 h-16 text-sky-400 mb-4" />
                   <p className="font-light tracking-widest uppercase">Waiting for input</p>
                </div>
             )}
             {isResearching && (
               <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/50 rounded-3xl backdrop-blur-sm">
                   <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
               </div>
             )}
             
             {/* Always render canvas for Earth visual, just update coords */}
             <Canvas camera={{ position: [0, 0, 8] }}>
                <EarthGlobe originCoords={results?.coordinates || []} />
             </Canvas>
          </div>

           {/* Results Breakdown */}
             {results && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="grid grid-cols-1 md:grid-cols-2 gap-4"
               >
                 <div className="bg-sky-950/20 border border-sky-900/30 p-6 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-widest text-xs mb-4">
                      <GitBranch className="w-4 h-4" /> {lastName} Origin
                    </h4>
                    <p className="text-sm text-stone-300 leading-relaxed font-light">{results?.lastNameOrigin?.history || 'No history found.'}</p>
                    {results?.lastNameOrigin?.meaning && (
                      <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase text-stone-500 inline-block mb-1">Etymology</span>
                        <p className="text-sm font-medium text-sky-200">"{results.lastNameOrigin.meaning}"</p>
                      </div>
                    )}
                 </div>

                 {results.maidenNameOrigin ? (
                    <div className="bg-indigo-950/20 border border-indigo-900/30 p-6 rounded-2xl">
                      <h4 className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">
                        <GitBranch className="w-4 h-4" /> Maternal: {maidenName}
                      </h4>
                      <p className="text-sm text-stone-300 leading-relaxed font-light">{results?.maidenNameOrigin?.history || 'No history found.'}</p>
                      {results?.maidenNameOrigin?.meaning && (
                        <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase text-stone-500 inline-block mb-1">Etymology</span>
                          <p className="text-sm font-medium text-indigo-200">"{results.maidenNameOrigin.meaning}"</p>
                        </div>
                      )}
                    </div>
                 ) : (
                    <div className="bg-stone-900/20 border border-white/5 p-6 rounded-2xl flex items-center justify-center text-center">
                      <div>
                        <Fingerprint className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                        <p className="text-xs uppercase tracking-widest text-stone-500">Maternal lineage not scanned</p>
                      </div>
                    </div>
                 )}

                 {results.connections && (
                   <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-emerald-900/20 to-sky-900/20 border border-emerald-500/20 p-6 rounded-2xl">
                     <h4 className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-3">
                       <MapPin className="w-4 h-4" /> Possible Family Tree Connections
                     </h4>
                     <p className="text-sm text-emerald-100 font-light leading-relaxed mb-4">
                       Based on global distribution patterns, your DNA and surname frequency shares high resonance with populations in:
                     </p>
                     <div className="flex flex-wrap gap-2">
                       {results.connections.map((conn: string, i: number) => (
                         <span key={i} className="px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-full text-xs text-emerald-300">
                           {conn}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}
               </motion.div>
             )}
        </div>
      </div>
    </div>
  );
};
