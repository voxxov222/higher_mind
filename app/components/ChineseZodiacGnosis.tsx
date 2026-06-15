import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Center, Sparkles, Line, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { 
  Sparkles as SparklesIcon, 
  Flame, 
  Droplet, 
  Trees, 
  Zap,
  Compass
} from 'lucide-react';

// --- Chinese Zodiac Database ---
interface ChineseZodiacData {
  animal: string;
  symbol: string;
  element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
  yinYang: 'Yin' | 'Yang';
  traits: string[];
  description: string;
  advice: string;
  color: string;
  compatibility: string[];
}

const CHINESE_ZODIAC_DATA: ChineseZodiacData[] = [
  {
    animal: 'Rat',
    symbol: '鼠',
    element: 'Water',
    yinYang: 'Yang',
    traits: ['Quick-witted', 'Resourceful', 'Versatile', 'Kind'],
    description: 'The Rat is a symbol of resourcefulness and intelligence. They excel in social situations and are master opportunists.',
    advice: 'Trust your sharp instincts, but avoid being overly calculating in matters of the heart.',
    color: '#3b82f6',
    compatibility: ['Ox', 'Dragon', 'Monkey']
  },
  {
    animal: 'Ox',
    symbol: '牛',
    element: 'Earth',
    yinYang: 'Yin',
    traits: ['Diligence', 'Dependable', 'Strength', 'Determination'],
    description: 'The Ox is known for patience and steady effort. They are the backbone of any structure, providing unwavering stability.',
    advice: 'Your persistence is your superpower; ensure you take time to listen to the innovative ideas of others.',
    color: '#10b981',
    compatibility: ['Rat', 'Snake', 'Rooster']
  },
  {
    animal: 'Tiger',
    symbol: '虎',
    element: 'Wood',
    yinYang: 'Yang',
    traits: ['Brave', 'Confident', 'Magnetic', 'Competitive'],
    description: 'The Tiger is a powerful force of charisma and courage. They lead with passion and are never afraid to take the leap.',
    advice: 'Channel your intensity into creative projects, but beware of impulsive actions that bypass strategy.',
    color: '#f59e0b',
    compatibility: ['Dragon', 'Horse', 'Dog']
  },
  {
    animal: 'Rabbit',
    symbol: '兔',
    element: 'Wood',
    yinYang: 'Yin',
    traits: ['Elegant', 'Kind', 'Responsible', 'Patient'],
    description: 'The Rabbit is a beacon of peace and artistic sensitivity. They seek harmony and have a deep appreciation for beauty.',
    advice: 'Your diplomacy is a gift; use it to bridge divides that others find insurmountable.',
    color: '#f472b6',
    compatibility: ['Goat', 'Dog', 'Pig']
  },
  {
    animal: 'Dragon',
    symbol: '龍',
    element: 'Earth',
    yinYang: 'Yang',
    traits: ['Confident', 'Intelligent', 'Enthusiastic', 'Powerful'],
    description: 'The Dragon is a majestic archetype of supreme power and luck. They are natural visionaries who inspire all they touch.',
    advice: 'Your fire is meant to light the way for others, not to consume the path. Practice humility in your triumphs.',
    color: '#ef4444',
    compatibility: ['Rat', 'Tiger', 'Snake']
  },
  {
    animal: 'Snake',
    symbol: '蛇',
    element: 'Fire',
    yinYang: 'Yin',
    traits: ['Wise', 'Enigmatic', 'Intuitive', 'Subtle'],
    description: 'The Snake possesses deep wisdom and a strategic mind. They move with grace and possess an aura of mystery.',
    advice: 'Trust the silent whispers of your intuition; the most powerful move is often the most subtle one.',
    color: '#a855f7',
    compatibility: ['Dragon', 'Rooster']
  },
  {
    animal: 'Horse',
    symbol: '馬',
    element: 'Fire',
    yinYang: 'Yang',
    traits: ['Energetic', 'Independent', 'Impatient', 'Animated'],
    description: 'The Horse is an embodiment of freedom and unbridled spirit. They thrive on movement and independence.',
    advice: "Your speed is impressive, but ensure your heart is fully committed before you gallop toward a new horizon.",
    color: '#f97316',
    compatibility: ['Tiger', 'Goat', 'Dog']
  },
  {
    animal: 'Goat',
    symbol: '羊',
    element: 'Earth',
    yinYang: 'Yin',
    traits: ['Gentle', 'Empathetic', 'Creative', 'Shy'],
    description: 'The Goat is a nurturer and an artist. They possess a gentle strength that heals and brings cohesion to the group.',
    advice: 'Do not mistake your kindness for weakness; your empathy is a conduit for profound alchemical change.',
    color: '#94a3b8',
    compatibility: ['Rabbit', 'Horse', 'Pig']
  },
  {
    animal: 'Monkey',
    symbol: '猴',
    element: 'Metal',
    yinYang: 'Yang',
    traits: ['Sharp', 'Smart', 'Curious', 'Innovative'],
    description: 'The Monkey is a master of innovation and play. They solve complex puzzles with ease and a sense of humor.',
    advice: "Use your wit to solve problems, but ensure your playfulness doesn't turn into manipulation.",
    color: '#06b6d4',
    compatibility: ['Rat', 'Dragon']
  },
  {
    animal: 'Rooster',
    symbol: '雞',
    element: 'Metal',
    yinYang: 'Yin',
    traits: ['Observant', 'Hardworking', 'Courageous', 'Proud'],
    description: 'The Rooster is focused, alert, and deeply loyal. They are the first to wake the world and command respect naturally.',
    advice: 'Your attention to detail is unmatched, but try to avoid perfectionism that delays your progress.',
    color: '#fbbf24',
    compatibility: ['Ox', 'Snake']
  },
  {
    animal: 'Dog',
    symbol: '狗',
    element: 'Earth',
    yinYang: 'Yang',
    traits: ['Loyal', 'Honest', 'Cautious', 'Kind'],
    description: 'The Dog is a guardian of truth and loyalty. They stand by their values and are the truest friends in the zodiac.',
    advice: "Your integrity is your shield; just make sure you aren't defending structures that no longer serve the whole.",
    color: '#cbd5e1',
    compatibility: ['Tiger', 'Rabbit', 'Horse']
  },
  {
    animal: 'Pig',
    symbol: '豬',
    element: 'Water',
    yinYang: 'Yin',
    traits: ['Compassionate', 'Generous', 'Diligent', 'Optimistic'],
    description: 'The Pig is a lover of life and a generous spirit. They work hard to provide comfort and joy for everyone around them.',
    advice: 'Your generosity is a light; remember to reserve some of that warmth for your own self-nourishment.',
    color: '#d946ef',
    compatibility: ['Goat', 'Rabbit']
  }
];

// --- 3D Visualization Components ---

const ChineseZodiacWheel = ({ activeAnimalIdx, setActiveAnimalIdx }: any) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  // ... inside ZodiacWheel component
  const radius = 6;
  const boxesRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (boxesRef.current) {
        CHINESE_ZODIAC_DATA.forEach((item, idx) => {
            const angle = (idx / 12) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const matrix = new THREE.Matrix4();
            matrix.setPosition(x, 0, z);
            matrix.lookAt(new THREE.Vector3(0,0,0), new THREE.Vector3(x,0,z), new THREE.Vector3(0,1,0));
            boxesRef.current!.setMatrixAt(idx, matrix);
            boxesRef.current!.setColorAt(idx, new THREE.Color(item.color));
        });
        boxesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Rotating Ring */}
      <group ref={groupRef}>
        <instancedMesh ref={boxesRef} args={[null, null, 12]} frustumCulled={true}>
            <boxGeometry args={[1, 1.4, 0.1]} />
            <meshStandardMaterial metalness={0.9} roughness={0.1} />
        </instancedMesh>
        
        {CHINESE_ZODIAC_DATA.map((item, idx) => {
          const angle = (idx / 12) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const isActive = activeAnimalIdx === idx;

          return (
            <group key={item.animal} position={[x, 0, z]}>
              <Float speed={isActive ? 3 : 1} rotationIntensity={0.2}>
                <mesh onClick={() => setActiveAnimalIdx(idx)} frustumCulled={true} transparent opacity={0.01}>
                   <boxGeometry args={[1, 1.4, 0.1]} />
                </mesh>
                  <Text
                    position={[0, 0.4, 0.06]}
                    fontSize={0.5}
                    color="#ffffff"
                    textAlign="center"
                  >
                    {item.symbol}
                  </Text>
                  <Text
                    position={[0, -0.4, 0.06]}
                    fontSize={0.12}
                    color="#ffffff"
                    textAlign="center"
                  >
                    {item.animal.toUpperCase()}
                  </Text>
              </Float>

              {/* Connector to center */}
              <Line 
                points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(-x, 0, -z)]} 
                color={isActive ? item.color : "#1e293b"} 
                lineWidth={isActive ? 2 : 0.5}
                opacity={isActive ? 0.6 : 0.1}
                transparent
                frustumCulled={true}
              />
            </group>
          );
        })}
      </group>


      {/* Central Elemental Sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial 
          color={CHINESE_ZODIAC_DATA[activeAnimalIdx].color} 
          speed={2} 
          distort={0.4} 
          radius={1} 
          emissive={CHINESE_ZODIAC_DATA[activeAnimalIdx].color}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <Sparkles count={50} scale={10} size={2} color={CHINESE_ZODIAC_DATA[activeAnimalIdx].color} speed={0.5} />
    </group>
  );
};

export const ChineseZodiacGnosis = () => {
  const [activeAnimalIdx, setActiveAnimalIdx] = useState(0);
  const [birthYear, setBirthYear] = useState('');
  const [showCalculation, setShowCalculation] = useState(false);

  const [mediaResult, setMediaResult] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMedia = async (type: 'image' | 'video') => {
      setIsGenerating(true);
      try {
          const response = await fetch('/api/generate-media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: `A cinematic ${activeAnimal.animal} Zodiac artwork representing the ${activeAnimal.element} element.`, type })
          });
          const data = await response.json();
          if (type === 'video') {
             // simplified: assume image for now to avoid complex polling
             setMediaResult({ url: data.imageUrl || '', type: 'image' });
          } else {
              setMediaResult({ url: data.imageUrl, type: 'image' });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  }

  const activeAnimal = CHINESE_ZODIAC_DATA[activeAnimalIdx];

  const calculateZodiac = (year: number) => {
    // 1900 was the year of the Rat
    const index = (year - 1900) % 12;
    // Handle negative results for years before 1900 if necessary, but we'll focus on 1900+
    const normalizedIndex = index < 0 ? (index + 12) % 12 : index;
    setActiveAnimalIdx(normalizedIndex);
    setShowCalculation(true);
  };

  const handleYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthYear) {
      calculateZodiac(parseInt(birthYear));
    }
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 bg-black/40 border border-white/5 rounded-3xl p-6 text-stone-200">
      
      {/* 3D Visualizer Section */}
      <div className="xl:col-span-12 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/60 border border-white/10 p-5 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-2xl font-bold font-sans tracking-tight text-white uppercase">Chinese Zodiac Gnosis</h2>
            </div>
            <p className="text-[10px] font-mono text-stone-400 mt-1 uppercase tracking-widest">
              Elemental Spherics • Alchemical Archetypes • Quantum Destiny
            </p>
          </div>

          <form onSubmit={handleYearSubmit} className="flex gap-2">
            <input 
              type="number"
              placeholder="Birth Year"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-white focus:border-red-500/50 outline-none w-32"
            />
            <button 
              type="submit"
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all"
            >
              Reveal
            </button>
          </form>
        </div>

        {/* 3D Canvas Board */}
        <div className="relative h-[550px] bg-slate-950/50 rounded-2xl overflow-hidden border border-white/10 group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] pointer-events-none" />
          
          <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ef4444" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <Center>
              <ChineseZodiacWheel 
                activeAnimalIdx={activeAnimalIdx} 
                setActiveAnimalIdx={setActiveAnimalIdx} 
              />
            </Center>
            
            <OrbitControls enableZoom={false} autoRotate={false} />
          </Canvas>

          {/* Interactive HUD Elements */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-3">
             <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: activeAnimal.color }}
                  >
                    {activeAnimal.symbol}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase leading-none">{activeAnimal.animal}</h3>
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-tighter">Current Archetype</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {activeAnimal.traits.slice(0, 3).map(trait => (
                    <span key={trait} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] text-stone-400 uppercase">
                      {trait}
                    </span>
                  ))}
                </div>
             </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-stone-300 uppercase">
              <Compass size={12} className="text-red-400" />
              Spatial Hub Active
            </div>
          </div>
        </div>
      </div>

      {/* Readings & Data Matrix Section */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        <div className="bg-black/60 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div 
            className="absolute top-0 right-0 w-64 h-64 blur-[120px] opacity-20 pointer-events-none"
            style={{ backgroundColor: activeAnimal.color }}
          />
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-bold text-white tracking-tighter uppercase">{activeAnimal.animal}</h2>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-red-400 font-bold uppercase">
                    {activeAnimal.yinYang} Energy
                  </div>
                </div>
                <p className="text-stone-300 text-lg leading-relaxed font-light">
                  {activeAnimal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <h4 className="text-[10px] font-mono uppercase text-stone-500 mb-2">Divine Council</h4>
                  <p className="text-stone-200 text-sm font-medium italic">"{activeAnimal.advice}"</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                  <h4 className="text-[10px] font-mono uppercase text-stone-500 mb-2">Visualization</h4>
                  <button onClick={() => generateMedia('image')} className="text-xs bg-red-500/20 text-red-300 rounded-lg py-1 hover:bg-red-500/30">
                    {isGenerating ? 'Generating...' : 'Generate Art'}
                  </button>
                  {mediaResult && mediaResult.url && (
                    <img src={mediaResult.url} alt="Generated" className="mt-2 w-full h-32 object-cover rounded-xl border border-white/10"/>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elemental Synthesis Sidebar */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        <div className="bg-black/60 border border-white/10 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-mono uppercase text-stone-400 tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-yellow-400" />
            Elemental Attribution
          </h3>

          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border transition-all ${activeAnimal.element === 'Fire' ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-white">Fire</span>
                <Flame size={16} className={activeAnimal.element === 'Fire' ? 'text-red-400' : 'text-stone-600'} />
              </div>
              <p className="text-[10px] text-stone-400 leading-tight">Passion, dynamism, and expansion of the soul matrix.</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${activeAnimal.element === 'Water' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-white">Water</span>
                <Droplet size={16} className={activeAnimal.element === 'Water' ? 'text-blue-400' : 'text-stone-600'} />
              </div>
              <p className="text-[10px] text-stone-400 leading-tight">Intuition, fluidity, and deep emotional connectivity.</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${activeAnimal.element === 'Earth' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-white">Earth</span>
                <Compass size={16} className={activeAnimal.element === 'Earth' ? 'text-emerald-400' : 'text-stone-600'} />
              </div>
              <p className="text-[10px] text-stone-400 leading-tight">Stability, grounding, and materialization of thought.</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${activeAnimal.element === 'Wood' ? 'bg-green-500/10 border-green-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-white">Wood</span>
                <Trees size={16} className={activeAnimal.element === 'Wood' ? 'text-green-400' : 'text-stone-600'} />
              </div>
              <p className="text-[10px] text-stone-400 leading-tight">Growth, flexibility, and creative vitality of the mind.</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${activeAnimal.element === 'Metal' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-white">Metal</span>
                <Zap size={16} className={activeAnimal.element === 'Metal' ? 'text-cyan-400' : 'text-stone-600'} />
              </div>
              <p className="text-[10px] text-stone-400 leading-tight">Precision, discipline, and structural integrity of being.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
