import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, SpotLight, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Eye, Triangle, Zap, Info } from 'lucide-react';

const Prism = ({ angle = 0 }: { angle?: number }) => {
    const shape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-1, -1);
        shape.lineTo(1, -1);
        shape.lineTo(0, 1);
        shape.lineTo(-1, -1);
        return shape;
    }, []);

    const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false }), [shape]);

    return (
        <mesh geometry={geometry} position={[0, -0.5, -0.5]} rotation={[0, 0, angle * 0.2]}>
            <meshPhysicalMaterial color="white" transparent opacity={0.6} transmission={0.9} thickness={0.5} roughness={0.1} />
            <lineSegments>
                <edgesGeometry args={[geometry]} />
                <lineBasicMaterial color="white" transparent opacity={0.3} />
            </lineSegments>
        </mesh>
    );
};

const LightRefraction = ({ angle = 0 }: { angle?: number }) => {
    return (
        <group position={[0, 0, 0]} rotation={[0, 0, angle * 0.1]}>
            {/* Incident Light */}
            <mesh position={[-3, 0.2, 0]} rotation={[0, 0, -1.3]}>
                <cylinderGeometry args={[0.03, 0.03, 4]} />
                <meshBasicMaterial color="white" transparent opacity={0.8} />
            </mesh>
            
            {/* Refracted Spectrum Inside */}
            <mesh position={[0, -0.1, 0.2]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[1.5, 0.4, 0.01]} />
                <meshBasicMaterial transparent opacity={0.6} onBeforeCompile={(shader) => {
                    shader.vertexShader = `
                        varying vec2 vUv;
                        ${shader.vertexShader.replace(
                            'void main() {',
                            'void main() { vUv = uv;'
                        )}
                    `;
                    shader.fragmentShader = `
                        varying vec2 vUv;
                        ${shader.fragmentShader.replace(
                            `#include <colorspace_fragment>`,
                            `
                            vec3 color = vec3(1.0);
                            float v = vUv.y;
                            if (v < 0.2) color = vec3(1.0, 0.0, 0.0);
                            else if (v < 0.4) color = vec3(1.0, 0.5, 0.0);
                            else if (v < 0.6) color = vec3(1.0, 1.0, 0.0);
                            else if (v < 0.8) color = vec3(0.0, 1.0, 0.0);
                            else color = vec3(0.0, 0.0, 1.0);
                            gl_FragColor = vec4(color, 0.5 * (1.0 - vUv.x));
                            `
                        )}
                    `;
                }} />
            </mesh>
            
            {/* Refracted Spectrum Exit */}
            <mesh position={[2.5, -0.5 - (angle * 0.5), 0]} rotation={[0, 0, -0.4 - (angle * 0.1)]}>
                <boxGeometry args={[4, 2 + Math.abs(angle), 0.05]} />
                <meshBasicMaterial transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} onBeforeCompile={(shader) => {
                    shader.vertexShader = `
                        varying vec2 vUv;
                        ${shader.vertexShader.replace(
                            'void main() {',
                            'void main() { vUv = uv;'
                        )}
                    `;
                    shader.fragmentShader = `
                        varying vec2 vUv;
                        ${shader.fragmentShader.replace(
                            `#include <colorspace_fragment>`,
                            `
                            vec3 color = vec3(1.0);
                            float v = vUv.y;
                            if (v < 0.2) color = vec3(1.0, 0.0, 0.0);
                            else if (v < 0.4) color = vec3(1.0, 0.5, 0.0);
                            else if (v < 0.6) color = vec3(1.0, 1.0, 0.0);
                            else if (v < 0.8) color = vec3(0.0, 1.0, 0.0);
                            else color = vec3(0.5, 0.0, 1.0);
                            gl_FragColor = vec4(color, 0.9 * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x));
                            `
                        )}
                    `;
                }} />
            </mesh>
        </group>
    );
};

const CrepuscularRays = ({ sunHeight = 2 }: { sunHeight?: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.05;
        }
    });

    // The angle spread depends on sun height
    const spreadFunc = (i: number) => {
         const centerOffset = i - 5.5;
         const spreadBase = 0.15 * (5 / Math.max(sunHeight, 0.5));
         return centerOffset * spreadBase;
    };

    return (
        <group ref={groupRef} position={[0, sunHeight, 0]}>
            <Sphere args={[sunHeight > 0 ? 0.3 : 0, 32, 32]} position={[0, 0, 0]}>
                <meshBasicMaterial color="#ffffff" />
            </Sphere>
            <pointLight intensity={3} distance={20} color="#fbbf24" />
            {/* Sun Rays forming a triangle point down */}
            {Array.from({length: 12}).map((_, i) => (
                <mesh key={i} rotation={[0, 0, spreadFunc(i)]} position={[0, -2.5, 0]}>
                    <cylinderGeometry args={[0.01, 1.5, 5, 8]} />
                    <meshBasicMaterial color="#fbbf24" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
                </mesh>
            ))}
            
            {/* Cloud obstruction layers - keep static relative to group or absolute? Absolute is better for ray tracing through them */}
            <group position={[0, -sunHeight, 0]}>
                {[-2, -1, 0, 1, 2].map((x, i) => (
                    <mesh key={`cloud-${i}`} position={[x, 0.5, 1]}>
                        <sphereGeometry args={[0.7 + Math.random() * 0.4, 16, 16]} />
                        <meshStandardMaterial color="#334155" transparent opacity={0.9} />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

const HolographicMatrix = ({ glitchIntensity = 1 }: { glitchIntensity?: number }) => {
    return (
        <group>
            {/* Rainbow Hologram Arc */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                <torusGeometry args={[3, 0.2, 16, 100, Math.PI]} />
                <meshBasicMaterial 
                  color="#ffffff" 
                  transparent 
                  side={THREE.DoubleSide}
                  blending={THREE.AdditiveBlending}
                  onBeforeCompile={(shader) => {
                      shader.vertexShader = `
                          varying vec2 vUv;
                          ${shader.vertexShader.replace(
                              'void main() {',
                              'void main() { vUv = uv;'
                          )}
                      `;
                      shader.fragmentShader = `
                          uniform float uGlitch;
                          varying vec2 vUv;
                          ${shader.fragmentShader.replace(
                              'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
                              `
                              vec3 color = vec3(1.0);
                              float h = vUv.x;
                              if (h < 0.2) color = vec3(1.0, 0.0, 0.0);
                              else if (h < 0.4) color = vec3(1.0, 0.5, 0.0);
                              else if (h < 0.6) color = vec3(1.0, 1.0, 0.0);
                              else if (h < 0.8) color = vec3(0.0, 1.0, 0.0);
                              else color = vec3(0.0, 0.0, 1.0);
                              
                              // Glitch effect / Matrix simulation
                              float glitch = sin(vUv.x * 50.0) * cos(vUv.y * 500.0) * uGlitch;
                              float alpha = diffuseColor.a * (0.4 + 0.6 * step(0.1, glitch));
                              
                              gl_FragColor = vec4(color, alpha);
                              `
                          )}
                      `;
                  }}
                  userData={{ shader: null }}
                  onUpdate={(self: THREE.Mesh) => {
                      const mat = self.material as THREE.ShaderMaterial;
                      if (!mat.userData.inited) {
                           mat.onBeforeCompile = (shader) => {
                               shader.uniforms.uGlitch = { value: glitchIntensity };
                               mat.userData.shader = shader;
                               
                               shader.vertexShader = `
                                   varying vec2 vUv;
                                   ${shader.vertexShader.replace(
                                       'void main() {',
                                       'void main() { vUv = uv;'
                                   )}
                               `;
                               shader.fragmentShader = `
                                   uniform float uGlitch;
                                   varying vec2 vUv;
                                   ${shader.fragmentShader.replace(
                                       'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
                                       `
                                       vec3 color = vec3(1.0);
                                       float h = vUv.x;
                                       if (h < 0.2) color = vec3(1.0, 0.0, 0.0);
                                       else if (h < 0.4) color = vec3(1.0, 0.5, 0.0);
                                       else if (h < 0.6) color = vec3(1.0, 1.0, 0.0);
                                       else if (h < 0.8) color = vec3(0.0, 1.0, 0.0);
                                       else color = vec3(0.0, 0.0, 1.0);
                                       
                                       // Glitch effect / Matrix simulation
                                       float glitch = sin(vUv.x * 50.0) * cos(vUv.y * 500.0);
                                       float alpha = diffuseColor.a * (0.4 + 0.6 * step(1.0 - uGlitch, glitch));
                                       
                                       gl_FragColor = vec4(color, alpha);
                                       `
                                   )}
                               `;
                            };
                            mat.userData.inited = true;
                       } else if (mat.userData.shader) {
                           mat.userData.shader.uniforms.uGlitch.value = glitchIntensity;
                       }
                  }}
                />
            </mesh>

            {/* Matrix Data Grid */}
            <gridHelper args={[20, 40, '#8b5cf6', '#4c1d95']} position={[0, -1, 0]} />
        </group>
    );
};

const IlluminatiSymbol = ({ revealMode = false }: { revealMode?: boolean }) => {
    return (
        <group position={[0, 0.5, 0]}>
            <mesh position={[0, 0.5, -0.2]}>
                <cylinderGeometry args={[0, 2, 3, 4]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} transparent opacity={0.6} wireframe={revealMode} />
                <lineSegments>
                    <edgesGeometry args={[new THREE.CylinderGeometry(0, 2, 3, 4)]} />
                    <lineBasicMaterial color={revealMode ? "#10b981" : "#fcd34d"} />
                </lineSegments>
            </mesh>
            
            {/* The Eye */}
            <mesh position={[0, 1.2, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[0.3, 32, 16]} />
                <meshPhysicalMaterial color={revealMode ? "#10b981" : "#ffffff"} transmission={0.9} thickness={0.1} />
            </mesh>
            <mesh position={[0, 1.2, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color={revealMode ? "#047857" : "#000000"} />
            </mesh>
            
            {/* Halo */}
            <mesh position={[0, 1.2, 0.5]}>
                <ringGeometry args={[0.5, 0.6, 32]} />
                <meshBasicMaterial color={revealMode ? "#34d399" : "#fef3c7"} side={THREE.DoubleSide} transparent opacity={revealMode ? 0.4 : 0.8} wireframe={revealMode} />
            </mesh>
            
            {revealMode && (
                <group>
                    <mesh position={[0, -1.2, 0]}>
                        <cylinderGeometry args={[2, 2.5, 0.5, 4]} />
                        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.3} />
                    </mesh>
                    <mesh position={[0, 2.5, 0]}>
                        <cylinderGeometry args={[0.01, 1, 2, 4]} />
                        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.3} />
                    </mesh>
                </group>
            )}
        </group>
    );
};

export const HolographicRainbowSection = () => {
    const [view, setView] = useState<'prism'|'crepuscular'|'matrix'|'illuminati'>('prism');
    
    // Interactive state controls
    const [prismAngle, setPrismAngle] = useState(0);
    const [sunHeight, setSunHeight] = useState(2);
    const [matrixGlitch, setMatrixGlitch] = useState(0.2);
    const [revealIlluminati, setRevealIlluminati] = useState(false);

    return (
        <div className="h-[600px] w-full bg-black/90 rounded-3xl overflow-hidden border border-white/5 relative flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="md:w-72 bg-black/60 border-r border-white/5 flex flex-col p-4 z-10 shrink-0">
                <h3 className="text-white font-mono text-xs uppercase tracking-widest mb-6 opacity-70 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Visual Tools
                </h3>
                
                <div className="flex flex-col gap-2">
                    <button onClick={() => setView('prism')} className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${view === 'prism' ? 'bg-purple-900/30 border-purple-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <Triangle className={`w-5 h-5 shrink-0 ${view === 'prism' ? 'text-purple-400' : 'text-stone-500'}`} />
                        <div>
                            <div className={`font-mono text-[10px] uppercase font-bold ${view === 'prism' ? 'text-purple-300' : 'text-stone-400'}`}>Prism Matrix</div>
                            <div className="text-[9px] text-stone-500 mt-1 leading-tight">Light refraction reveals the hidden spectrum.</div>
                        </div>
                    </button>
                    
                    <button onClick={() => setView('crepuscular')} className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${view === 'crepuscular' ? 'bg-amber-900/30 border-amber-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <Sun className={`w-5 h-5 shrink-0 ${view === 'crepuscular' ? 'text-amber-400' : 'text-stone-500'}`} />
                        <div>
                            <div className={`font-mono text-[10px] uppercase font-bold ${view === 'crepuscular' ? 'text-amber-300' : 'text-stone-400'}`}>The Local Sun</div>
                            <div className="text-[9px] text-stone-500 mt-1 leading-tight">Crepuscular rays expose a localized light source geometry.</div>
                        </div>
                    </button>
                    
                    <button onClick={() => setView('matrix')} className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${view === 'matrix' ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <Zap className={`w-5 h-5 shrink-0 ${view === 'matrix' ? 'text-indigo-400' : 'text-stone-500'}`} />
                        <div>
                            <div className={`font-mono text-[10px] uppercase font-bold ${view === 'matrix' ? 'text-indigo-300' : 'text-stone-400'}`}>Holographic Rainbow</div>
                            <div className="text-[9px] text-stone-500 mt-1 leading-tight">The projection mechanism independent of physical droplets.</div>
                        </div>
                    </button>
                    
                    <button onClick={() => setView('illuminati')} className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${view === 'illuminati' ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <Eye className={`w-5 h-5 shrink-0 ${view === 'illuminati' ? 'text-emerald-400' : 'text-stone-500'}`} />
                        <div>
                            <div className={`font-mono text-[10px] uppercase font-bold ${view === 'illuminati' ? 'text-emerald-300' : 'text-stone-400'}`}>Illuminati Symbol</div>
                            <div className="text-[9px] text-stone-500 mt-1 leading-tight">The capstone, the eye, and the triangle of power.</div>
                        </div>
                    </button>
                </div>
                
                <div className="mt-auto pt-4">
                     <p className="text-[10px] text-stone-500 italic font-light">
                         "The phenomena we perceive are projections bound by the architecture of the consciousness matrix."
                     </p>
                </div>
            </div>

            {/* Main Interactive Canvas Area */}
            <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black border-l border-white/5">
                {/* Overlay Information HUD */}
                <div className="absolute top-6 left-6 z-10 max-w-sm pointer-events-auto">
                     <AnimatePresence mode="wait">
                          {view === 'prism' && (
                              <motion.div key="prism" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="backdrop-blur-md bg-black/60 border border-purple-500/30 p-5 rounded-2xl">
                                  <h4 className="text-purple-300 font-mono text-xs uppercase font-bold tracking-widest mb-2">Prism Refraction</h4>
                                  <p className="text-xs text-stone-300 font-light leading-relaxed mb-4">White light is not empty—it is the unified field of all visible frequencies. When forced through an angular medium (the triangle), the speed of light varies by wavelength, bending the unified field into its constituent parts: the rainbow band.</p>
                                  
                                  {/* Interactive Tool */}
                                  <div className="space-y-2 mt-4 bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
                                      <div className="flex justify-between items-center text-[10px] font-mono text-purple-300 uppercase">
                                          <span>Incident Angle</span>
                                          <span>{prismAngle.toFixed(1)}°</span>
                                      </div>
                                      <input 
                                          type="range" 
                                          min="-5" max="5" 
                                          step="0.1" 
                                          value={prismAngle} 
                                          onChange={(e) => setPrismAngle(parseFloat(e.target.value))} 
                                          className="w-full accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                      />
                                      <p className="text-[9px] text-purple-400 mt-2 text-center">Adjusting angle modulates frequency diffusion.</p>
                                  </div>
                                  <div className="h-1 w-full rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 mt-4" />
                              </motion.div>
                          )}
                          
                          {view === 'crepuscular' && (
                              <motion.div key="crepuscular" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="backdrop-blur-md bg-black/60 border border-amber-500/30 p-5 rounded-2xl">
                                  <h4 className="text-amber-300 font-mono text-xs uppercase font-bold tracking-widest mb-2">Crepuscular Proof</h4>
                                  <p className="text-xs text-stone-300 font-light leading-relaxed mb-4">If the sun were 93 million miles away, its rays arriving on Earth would be perfectly parallel. Instead, crepuscular rays—radiating outwards from a central point through clouds—demonstrate geometric convergence, suggesting a closer, localized light source operating within the atmospheric firmament.</p>
                                  
                                  {/* Interactive Tool */}
                                  <div className="space-y-2 bg-amber-950/30 p-3 rounded-xl border border-amber-500/20">
                                      <div className="flex justify-between items-center text-[10px] font-mono text-amber-300 uppercase">
                                          <span>Source Altitude</span>
                                          <span>{sunHeight.toFixed(1)} unit</span>
                                      </div>
                                      <input 
                                          type="range" 
                                          min="0.5" max="4" 
                                          step="0.1" 
                                          value={sunHeight} 
                                          onChange={(e) => setSunHeight(parseFloat(e.target.value))} 
                                          className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                      />
                                      <p className="text-[9px] text-amber-400 mt-2 text-center">Lowering source reveals pronounced local spreading geometry.</p>
                                  </div>
                              </motion.div>
                          )}
                          
                          {view === 'matrix' && (
                              <motion.div key="matrix" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="backdrop-blur-md bg-black/60 border border-indigo-500/30 p-5 rounded-2xl">
                                  <h4 className="text-indigo-300 font-mono text-xs uppercase font-bold tracking-widest mb-2">Holographic Projection</h4>
                                  <p className="text-xs text-stone-300 font-light leading-relaxed mb-4">The rainbow is not a physical object located in space. It is an optical illusion, a holographic projection resulting from the observer's angle relative to the light source and refractive medium. If you move, the rainbow moves. The foundational light scaffold exists independently of the water droplets that momentarily reveal it.</p>
                                  
                                  {/* Interactive Tool */}
                                  <div className="space-y-2 bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/20">
                                      <div className="flex justify-between items-center text-[10px] font-mono text-indigo-300 uppercase">
                                          <span>Matrix Glitch Intensity</span>
                                          <span>{(matrixGlitch * 100).toFixed(0)}%</span>
                                      </div>
                                      <input 
                                          type="range" 
                                          min="0" max="1" 
                                          step="0.05" 
                                          value={matrixGlitch} 
                                          onChange={(e) => setMatrixGlitch(parseFloat(e.target.value))} 
                                          className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                      />
                                      <p className="text-[9px] text-indigo-400 mt-2 text-center">Expose the underlying optical framework scaffold.</p>
                                  </div>
                              </motion.div>
                          )}
                          
                          {view === 'illuminati' && (
                              <motion.div key="illuminati" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}} className="backdrop-blur-md bg-black/60 border border-emerald-500/30 p-5 rounded-2xl">
                                  <h4 className="text-emerald-300 font-mono text-xs uppercase font-bold tracking-widest mb-2">The Apex Symbol</h4>
                                  <p className="text-xs text-stone-300 font-light leading-relaxed mb-4">The pyramid and the All-Seeing Eye represent the architecture of control and enlightenment. The triangle (prism) filters the Divine Light (unity) into the material spectrum (multiplicity). The floating capstone signifies the hidden hierarchy directing the grand design from outside the structural matrix.</p>
                                  
                                  {/* Interactive Tool */}
                                  <div className="mt-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30">
                                      <button 
                                          onClick={() => setRevealIlluminati(!revealIlluminati)}
                                          className={`w-full py-2 px-4 rounded-lg font-mono text-[10px] uppercase border transition-all ${revealIlluminati ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-black/40 border-emerald-700 text-stone-400 hover:text-emerald-200'}`}
                                      >
                                          {revealIlluminati ? 'Hide Power Geometry' : 'Reveal Occult Architecture'}
                                      </button>
                                  </div>
                              </motion.div>
                          )}
                     </AnimatePresence>
                </div>

                <Canvas camera={{ position: [0, 1.5, 6] }}>
                    <ambientLight intensity={0.2} />
                    <pointLight position={[5, 10, 5]} intensity={1} />
                    
                    {view === 'prism' && (
                        <group>
                            <Prism angle={prismAngle} />
                            <LightRefraction angle={prismAngle} />
                        </group>
                    )}
                    
                    {view === 'crepuscular' && <CrepuscularRays sunHeight={sunHeight} />}
                    {view === 'matrix' && <HolographicMatrix glitchIntensity={matrixGlitch} />}
                    {view === 'illuminati' && <IlluminatiSymbol revealMode={revealIlluminati} />}
                    
                    <OrbitControls enablePan={true} enableZoom={true} />
                </Canvas>
            </div>
        </div>
    );
};
