import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, Hexagon, Flame, Zap, Compass, Shield, Eye, Database, Share2, Award, Activity } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Center, Sparkles as Sparkles3D, Line, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// --- Chinese Zodiac Data ---
const CHINESE_ZODIAC_DATA = [
  { animal: 'Rat', symbol: '鼠', color: '#3b82f6', element: 'Water' },
  { animal: 'Ox', symbol: '牛', color: '#10b981', element: 'Earth' },
  { animal: 'Tiger', symbol: '虎', color: '#f59e0b', element: 'Wood' },
  { animal: 'Rabbit', symbol: '兔', color: '#f472b6', element: 'Wood' },
  { animal: 'Dragon', symbol: '龍', color: '#ef4444', element: 'Earth' },
  { animal: 'Snake', symbol: '蛇', color: '#a855f7', element: 'Fire' },
  { animal: 'Horse', symbol: '馬', color: '#f97316', element: 'Fire' },
  { animal: 'Goat', symbol: '羊', color: '#94a3b8', element: 'Earth' },
  { animal: 'Monkey', symbol: '猴', color: '#06b6d4', element: 'Metal' },
  { animal: 'Rooster', symbol: '雞', color: '#fbbf24', element: 'Metal' },
  { animal: 'Dog', symbol: '狗', color: '#cbd5e1', element: 'Earth' },
  { animal: 'Pig', symbol: '豬', color: '#d946ef', element: 'Water' }
];

// --- 3D Zodiac Wheel ---
const ChineseZodiacWheel = ({ activeAnimalIdx, setActiveAnimalIdx }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => { 
    if (groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05; 
  });
  const radius = 6;
  return (
    <group position={[0, 0, 0]}>
      <group ref={groupRef}>
        {CHINESE_ZODIAC_DATA.map((item, idx) => {
          const angle = (idx / 12) * Math.PI * 2;
          const isActive = activeAnimalIdx === idx;
          return (
            <group key={item.animal} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
              <mesh onClick={() => setActiveAnimalIdx(idx)}>
                <boxGeometry args={[1, 1.4, 0.1]} />
                <meshStandardMaterial 
                  color={isActive ? item.color : "#0f172a"} 
                  emissive={item.color} 
                  emissiveIntensity={isActive ? 1.5 : 0} 
                  roughness={0.1}
                  metalness={0.8}
                />
                <Text position={[0, 0, 0.06]} fontSize={0.5} color="#ffffff" anchorX="center" anchorY="middle">
                  {item.symbol}
                </Text>
              </mesh>
            </group>
          );
        })}
      </group>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial 
          color={CHINESE_ZODIAC_DATA[activeAnimalIdx].color} 
          speed={2} 
          distort={0.4} 
          emissive={CHINESE_ZODIAC_DATA[activeAnimalIdx].color} 
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

interface MatrixNode {
  id: string;
  title: string;
  description: string;
  overview: string;
  shadow: string;
  gift: string;
  frequencyHZ: number;
  resonanceName: string;
  sephirahName: string;
  sephirahDesc: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  glowColor: string;
}

const DESTINY_NODES: MatrixNode[] = [
  { 
    id: '1', 
    title: 'Core Essence', 
    description: 'The central nexus of your eternal soul matrix, defining your sovereign identity and spiritual signature.',
    overview: 'Your core essence represents the divine spark that remains unchanging across lifetimes. It is the unadulterated consciousness that observes all thoughts, feelings, and temporal experiences.',
    shadow: 'Spiritual amnesia, seeking external validation, and losing alignment with supreme sovereign authority.',
    gift: 'Sovereign authenticity, innate authority, crystal-clear awareness, and seamless connection to higher planes of light.',
    frequencyHZ: 528,
    resonanceName: "Transformation and DNA Repair (Solfeggio 528Hz)",
    sephirahName: "Crown Sephirah - Kether",
    sephirahDesc: "The point of primary emanation, bridging the absolute unmanifest light (Ein Sof) into spatial, structured consciousness.",
    colorBg: 'bg-amber-500/10',
    colorBorder: 'border-amber-500/30',
    colorText: 'text-amber-400',
    glowColor: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]'
  },
  { 
    id: '2', 
    title: 'Karmic Path', 
    description: 'The path of chosen trials, lessons, and ancestral patterns that must be integrated to achieve ultimate liberation.',
    overview: 'Your Karmic Path is not a punishment, but a carefully selected curriculum for the soul\'s refinement. It governs the primary friction points of your earthly life, pushing you to transcend old loops.',
    shadow: 'Repetitive reactive patterns, fear of accepting destiny, resentment towards initiatory challenges.',
    gift: 'Karmic clearance, deep alchemical emotional resilience, wisdom born of survived fire, and ancestral alignment.',
    frequencyHZ: 396,
    resonanceName: "Liberation from Fear and Guilt (Solfeggio 396Hz)",
    sephirahName: "Severity Sephirah - Gevurah",
    sephirahDesc: "The channel of divine restriction, boundary-setting, and karmic justice that strips away false structures.",
    colorBg: 'bg-indigo-500/10',
    colorBorder: 'border-indigo-500/30',
    colorText: 'text-indigo-400',
    glowColor: 'shadow-[0_0_20px_rgba(129,140,248,0.15)]'
  },
  { 
    id: '3', 
    title: 'Divinity Spark', 
    description: 'The direct, unmediated portal connecting your individual consciousness to the infinite primordial source.',
    overview: 'The Divinity Spark is the constant hum of source energy in your heart. It manifests as moments of pure inspiration, sudden gnosis, cosmic love, and overwhelming structural interconnectedness.',
    shadow: 'Messianism, spiritual bypassing, or feelings of profound absolute isolation and cosmic despair.',
    gift: 'Transpersonal intuition, unconditional loving-kindness, effortless manifestation, and divine inspiration.',
    frequencyHZ: 741,
    resonanceName: "Awakening Intuition & Clear Expression (Solfeggio 741Hz)",
    sephirahName: "Beauty Sephirah - Tiphereth",
    sephirahDesc: "The harmonious heart of the Tree of Life, balancing severity and mercy, shining with pure celestial brilliance.",
    colorBg: 'bg-emerald-500/10',
    colorBorder: 'border-emerald-500/30',
    colorText: 'text-emerald-400',
    glowColor: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]'
  },
  { 
    id: '4', 
    title: 'Future Potential', 
    description: 'The high-evolutionary trajectory currently activating in your stargate, guiding you toward ultimate cosmic fulfillment.',
    overview: 'Future Potential outlines the latent faculties and cosmic alignments that are ripe for integration in your current cycle. It is the north star of your developmental trajectory.',
    shadow: 'Procrastination, living in comfortable fantasy, and dreading the active responsibility of your highest power.',
    gift: 'Visionary leadership, sudden evolutionary leaps, manifesting the future self in the present moment.',
    frequencyHZ: 852,
    resonanceName: "Return to Spiritual Order & Deep Wisdom (Solfeggio 852Hz)",
    sephirahName: "Foundation Sephirah - Yesod",
    sephirahDesc: "The astral storehouse that gathers spiritual energies from upper Sephirot to crystalize them into the physical realm of Malkuth.",
    colorBg: 'bg-pink-500/10',
    colorBorder: 'border-pink-500/30',
    colorText: 'text-pink-400',
    glowColor: 'shadow-[0_0_20px_rgba(244,114,182,0.15)]'
  },
];

export const DestinyMatrix: React.FC<{ data: any }> = ({ data }) => {
  const [activeNode, setActiveNode] = useState<MatrixNode | null>(DESTINY_NODES[0]);
  const [mode, setMode] = useState<'matrix' | 'zodiac'>('matrix');
  const [subTab, setSubTab] = useState<'overview' | 'frequency' | 'kabbalah' | 'visual'>('overview');
  const [activeAnimalIdx, setActiveAnimalIdx] = useState(4); // Default to Dragon (index 4)
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/zodiac-illustration')
      .then(res => res.json())
      .then(data => {
        if (data && data.url) {
          setIllustrationUrl(data.url);
        }
      })
      .catch(err => console.error("Could not fetch zodiac illustration:", err));
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/60 p-5 rounded-3xl border border-white/10 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="text-emerald-400 animate-spin-slow" size={24} />
            Destiny Matrix Portal
          </h1>
          <p className="text-xs text-stone-400 mt-1 font-mono">HIGHER MIND V2.0 // Multi-Dimensional Blueprint Analysis</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMode('matrix')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 ${mode === 'matrix' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' : 'text-stone-500 border border-transparent hover:text-stone-300'}`}
          >
            <Hexagon size={14} />
            Blueprints Matrix
          </button>
          <button 
            onClick={() => setMode('zodiac')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 ${mode === 'zodiac' ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 'text-stone-500 border border-transparent hover:text-stone-300'}`}
          >
            <Flame size={14} />
            Zodiac Gnosis 3D
          </button>
        </div>
      </div>
      
      {mode === 'matrix' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Destiny Sector Grid Buttons */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-fit">
            {DESTINY_NODES.map((node) => {
              const isActive = activeNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => {
                    setActiveNode(node);
                    setSubTab('overview');
                  }}
                  className={`p-6 bg-black/60 border rounded-3xl transition-all text-left group flex flex-col justify-between h-[180px] relative overflow-hidden ${
                    isActive 
                      ? `${node.colorBorder} ${node.glowColor} bg-${node.colorBg}` 
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`text-4xl mb-3 ${node.colorText} transition-transform group-hover:scale-110 duration-300`}>
                    <Hexagon />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{node.title}</h3>
                    <p className="text-xs text-stone-400 leading-snug line-clamp-2">{node.description}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}

            {/* Illustration Display Banner under nodes */}
            <div className="col-span-2 bg-black/60 border border-white/5 p-4 rounded-3xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-900 border border-white/10 flex-shrink-0">
                {illustrationUrl ? (
                  <img src={illustrationUrl} alt="Mystical Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-stone-600 font-mono">N/A</div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase text-stone-400">Sacred Archetype Visual</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-tight">Visual representative of the dominant spiritual energy found in your astral blueprint.</p>
              </div>
            </div>
          </div>

          {/* Sub-menu / Detailed Analysis Section */}
          <AnimatePresence mode="wait">
            {activeNode && (
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-7 bg-black/80 border border-white/10 p-8 rounded-3xl backdrop-blur-xl flex flex-col justify-between"
              >
                <div>
                  {/* Title Area */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border ${activeNode.colorBorder} ${activeNode.colorText}`}>
                          Sector {activeNode.id}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-stone-700" />
                        <span className="text-xs font-mono text-stone-500"> Blueprints Analysis</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mt-2">{activeNode.title}</h2>
                    </div>
                  </div>

                  {/* SUB MENU NAVIGATION */}
                  <div className="flex flex-wrap gap-1 border-b border-white/5 pb-3 mb-6">
                    <button
                      onClick={() => setSubTab('overview')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        subTab === 'overview' ? 'bg-white/10 text-white' : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setSubTab('frequency')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        subTab === 'frequency' ? 'bg-white/10 text-white' : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      Resonance
                    </button>
                    <button
                      onClick={() => setSubTab('kabbalah')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        subTab === 'kabbalah' ? 'bg-white/10 text-white' : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      Hermetic Tree
                    </button>
                    <button
                      onClick={() => setSubTab('visual')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        subTab === 'visual' ? 'bg-white/10 text-white' : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      Sacred Art
                    </button>
                  </div>

                  {/* SUB MENU DETAILS RENDER */}
                  <div className="min-h-[220px]">
                    <AnimatePresence mode="wait">
                      {subTab === 'overview' && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-4"
                        >
                          <p className="text-stone-300 text-sm leading-relaxed">{activeNode.overview}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 bg-red-950/15 border border-red-900/30 rounded-2xl">
                              <h4 className="text-xs font-mono uppercase text-red-400 flex items-center gap-1.5 mb-2">
                                <Shield size={12} /> The Shadow Edge
                              </h4>
                              <p className="text-xs text-stone-450 leading-relaxed">{activeNode.shadow}</p>
                            </div>
                            <div className="p-4 bg-emerald-950/15 border border-emerald-900/30 rounded-2xl">
                              <h4 className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5 mb-2">
                                <Award size={12} /> The Light Gift
                              </h4>
                              <p className="text-xs text-stone-450 leading-relaxed">{activeNode.gift}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {subTab === 'frequency' && (
                        <motion.div
                          key="frequency"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <div className="w-16 h-16 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl font-bold font-mono">
                              {activeNode.frequencyHZ}Hz
                            </div>
                            <div>
                              <h4 className="text-xs font-mono uppercase text-stone-400">Sound Frequency Resonance</h4>
                              <p className="text-sm font-bold text-white mt-1">{activeNode.resonanceName}</p>
                            </div>
                          </div>
                          
                          <p className="text-stone-400 text-xs leading-relaxed">
                            Resonating at this specific frequency initiates high spiritual cohesion, aligning cellular matrices and physical synapses with higher dimensional wisdom. Meditation and sound bath healing at this frequency will clear systemic blockages.
                          </p>

                          <div className="flex items-center gap-2 p-3 bg-stone-900/60 rounded-xl border border-white/5 text-[11px] text-stone-400">
                            <Activity size={14} className="text-emerald-500 animate-pulse" />
                            <span>Recommended practice: 15-minute contemplative sound meditation at <strong>{activeNode.frequencyHZ}Hz</strong> before rest.</span>
                          </div>
                        </motion.div>
                      )}

                      {subTab === 'kabbalah' && (
                        <motion.div
                          key="kabbalah"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-4"
                        >
                          <div className="border border-indigo-500/20 bg-indigo-500/5 p-4 rounded-2xl">
                            <h4 className="text-xs font-mono uppercase text-indigo-400 mb-1">Tree of Life Attribution</h4>
                            <p className="text-base font-bold text-white">{activeNode.sephirahName}</p>
                            <p className="text-xs text-stone-400 mt-2 leading-relaxed">{activeNode.sephirahDesc}</p>
                          </div>
                          <p className="text-xs text-stone-500 leading-relaxed font-mono mt-2">
                             // HEURISTIC BOUNDS: Hermetic alignment mapping matches this node energy directly to the structural pathways of consciousness.
                          </p>
                        </motion.div>
                      )}

                      {subTab === 'visual' && (
                        <motion.div
                          key="visual"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-4 flex flex-col items-center"
                        >
                          {illustrationUrl ? (
                            <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">
                              <img 
                                src={illustrationUrl} 
                                alt="Dominant Celestial Sign Illustration" 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                                <div>
                                  <div className="text-[10px] uppercase tracking-widest font-mono text-amber-400">Celestial Guardian</div>
                                  <div className="text-sm font-bold text-white">Dominant Sign Energy</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-stone-500 text-xs font-mono p-4 text-center">
                              <Database size={24} className="mb-2 text-stone-600 animate-pulse" />
                              Generating visual assets... The celestial art files are updating in background.
                            </div>
                          )}
                          <p className="text-[11px] text-stone-500 text-center uppercase tracking-wider font-mono">
                            Visual focus sigil for transpersonal meditation.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-stone-500">
                  <span>Higher Consciousness Coherence Vector</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < Number(activeNode.id) + 1 ? 'bg-amber-400' : 'bg-stone-850'}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="h-[500px] bg-black/40 border border-white/5 rounded-3xl overflow-hidden relative">
          <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
            <Stars radius={100} depth={50} count={5000} />
            <Center>
              <ChineseZodiacWheel activeAnimalIdx={activeAnimalIdx} setActiveAnimalIdx={setActiveAnimalIdx} />
            </Center>
            <OrbitControls enableZoom={false} />
          </Canvas>
          <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex justify-between items-center bg-black/80 p-4 border border-white/10 rounded-2xl">
            <div>
              <p className="text-[10px] font-mono uppercase text-red-400">Interaction Guide</p>
              <h3 className="text-sm font-bold text-white mt-0.5">Click outside cards to drag orbit. Select symbols on cards to explore alignments.</h3>
            </div>
            <div className="hidden sm:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs text-stone-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gematria 3D Coherence: Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
