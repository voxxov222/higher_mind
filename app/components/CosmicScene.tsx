// --- CORE IMPORTS & THREE.JS FIBER REFS ---
import * as React from 'react';
import { useRef, useMemo, useState, useEffect, createContext, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Ring, Sparkles, Stars, Text, Trail, OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
// --- POST-PROCESSING EFFX ---
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { CosmicData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Lock, Unlock, Play, Square, Palette, Zap, Move, RefreshCw, Activity, Flame, History, ArrowLeftRight, Wind, Cpu, Infinity, Magnet, Shuffle, Waves } from 'lucide-react';

/**
 * Procedural Animation Types for Scene Objects
 */
type AnimationType = 'none' | 'spin' | 'bounce' | 'zigzag' | 'flash' | 'jump' | 'orbit' | 'randomPop' | 'pulse' | 'shake' | 'wobble' | 'slide' | 'vortex' | 'quantum' | 'infinity' | 'attractor' | 'chaos' | 'pendulum';
/**
 * Shared State Structure for Interactive Nodes
 */
interface InteractionState {
  id: string;
  animation: AnimationType;
  color: string;
  isLocked: boolean;
  isMinimized: boolean;
  glowIntensity: number;
}

interface CosmicSceneProps {
  data: CosmicData | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onPlanetClick?: (title: string, content: string) => void;
  isPresentationActive?: boolean;
}

// --- GLOBAL OBJECT REGISTRY (VOLATILE) ---
const objectStates: Record<string, InteractionState> = {};

/**
 * HolographicMenu Component
 * Floating UI overlay within the 3D canvas for controlling individual object properties.
 */
const HolographicMenu = ({ state, onUpdate, onClose }: { state: InteractionState, onUpdate: (update: Partial<InteractionState>) => void, onClose: () => void }) => {
  if (state.isMinimized) {
    return (
      <Html center>
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          className="bg-black/80 backdrop-blur-xl border border-white/20 p-2 rounded-full cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          onClick={() => onUpdate({ isMinimized: false })}
        >
          <Zap className="w-4 h-4 text-rose-400" />
        </motion.div>
      </Html>
    );
  }

  const animations: { type: AnimationType, icon: any, label: string }[] = [
    { type: 'none', icon: Square, label: 'Still' },
    { type: 'spin', icon: RefreshCw, label: 'Spin' },
    { type: 'bounce', icon: Move, label: 'Bounce' },
    { type: 'pulse', icon: Activity, label: 'Pulse' },
    { type: 'shake', icon: Flame, label: 'Shake' },
    { type: 'wobble', icon: History, label: 'Wobble' },
    { type: 'slide', icon: ArrowLeftRight, label: 'Slide' },
    { type: 'vortex', icon: Wind, label: 'Vortex' },
    { type: 'quantum', icon: Cpu, label: 'Quantum' },
    { type: 'infinity', icon: Infinity, label: 'Infinity' },
    { type: 'attractor', icon: Magnet, label: 'Attractor' },
    { type: 'chaos', icon: Shuffle, label: 'Chaos' },
    { type: 'pendulum', icon: Waves, label: 'Pendulum' },
    { type: 'orbit', icon: Play, label: 'Orbit' },
  ];

  return (
    <Html center>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-64 bg-stone-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-rose-500 animate-pulse`} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Object Matrix</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onUpdate({ isMinimized: true })} className="p-1 hover:bg-white/10 rounded transition-colors">
              <Minus className="w-3 h-3 text-stone-500" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
              <X className="w-3 h-3 text-stone-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-stone-500">Kinematics</span>
            <div className="grid grid-cols-3 gap-2">
              {animations.map((anim) => (
                <button
                  key={anim.type}
                  onClick={() => onUpdate({ animation: anim.type })}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${state.animation === anim.type ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-white/5 border-white/5 text-stone-500 hover:border-white/20'}`}
                >
                  <anim.icon className="w-4 h-4 mb-1" />
                  <span className="text-[8px] uppercase tracking-tighter">{anim.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Glow Intensity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-widest text-stone-500">Glow Resonance</span>
              <span className="text-[9px] font-mono text-rose-400">{(state.glowIntensity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="0.1" 
              value={state.glowIntensity} 
              onChange={(e) => onUpdate({ glowIntensity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400 transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onUpdate({ isLocked: !state.isLocked })}
                className={`p-2 rounded-lg border transition-all ${state.isLocked ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-white/5 border-white/5 text-stone-500 hover:border-white/20'}`}
              >
                {state.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-stone-500">Integrity</span>
                <span className="text-[10px] text-stone-300 font-mono">{state.isLocked ? 'LOCKED' : 'SYNCHRONIZED'}</span>
              </div>
            </div>
            
            <div className="flex gap-1">
              {['#f43f5e', '#3b82f6', '#10b981', '#fbbf24'].map(c => (
                <button 
                  key={c}
                  onClick={() => onUpdate({ color: c })}
                  className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${state.color === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-2 bg-rose-500/5 text-center">
          <span className="text-[7px] text-stone-600 uppercase tracking-[0.3em]">Quantum Interaction Interface v2.0</span>
        </div>
      </motion.div>
    </Html>
  );
};

const InteractionContext = createContext<{ color: string; animation: AnimationType; isLocked: boolean; glowIntensity: number } | null>(null);

/**
 * InteractiveObject Higher-Order Component
 * Wraps Three.js primitives with procedural animation logic and mouse interaction states.
 */
const InteractiveObject = ({ id, children, initialColor, onSelect }: any) => {
  // --- LOCAL KINEMATICS STATE ---
  const [state, setState] = useState<InteractionState>({
    id,
    animation: 'none',
    color: initialColor,
    isLocked: false,
    isMinimized: false,
    glowIntensity: 1.0
  });
  const [isSelected, setIsSelected] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const originalPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const hasCapturedPos = useRef(false);

  // --- KINEMATIC UPDATE LOOP (R3F) ---
  useFrame((sceneState) => {
    if (!meshRef.current) return;
    if (!hasCapturedPos.current) {
      originalPos.current.copy(meshRef.current.position);
      hasCapturedPos.current = true;
    }

    if (state.isLocked) return;

    const t = sceneState.clock.getElapsedTime();
    
    switch (state.animation) {
      case 'spin':
        meshRef.current.rotation.y += 0.05;
        break;
      case 'bounce':
        meshRef.current.position.y = originalPos.current.y + Math.sin(t * 3) * 2;
        break;
      case 'zigzag':
        meshRef.current.position.x = originalPos.current.x + Math.sin(t * 2) * 3;
        break;
      case 'flash':
        const s = 1 + Math.sin(t * 10) * 0.1;
        meshRef.current.scale.set(s, s, s);
        break;
      case 'jump':
        meshRef.current.position.y = originalPos.current.y + Math.abs(Math.sin(t * 5)) * 4;
        break;
      case 'orbit':
        meshRef.current.position.x = originalPos.current.x + Math.cos(t * 1.5) * 5;
        meshRef.current.position.z = originalPos.current.z + Math.sin(t * 1.5) * 5;
        break;
      case 'pulse':
        const pScale = 1 + Math.sin(t * 3) * 0.25;
        meshRef.current.scale.set(pScale, pScale, pScale);
        break;
      case 'shake':
        meshRef.current.position.x = originalPos.current.x + (Math.random() - 0.5) * 0.3;
        meshRef.current.position.y = originalPos.current.y + (Math.random() - 0.5) * 0.3;
        break;
      case 'wobble':
        meshRef.current.rotation.z = Math.sin(t * 4) * 0.4;
        meshRef.current.rotation.x = Math.cos(t * 4) * 0.2;
        break;
      case 'slide':
        meshRef.current.position.z = originalPos.current.z + Math.sin(t * 2) * 6;
        break;
      case 'vortex':
        meshRef.current.position.y = originalPos.current.y + Math.sin(t * 0.5) * 3;
        meshRef.current.rotation.y += 0.15;
        meshRef.current.position.x = originalPos.current.x + Math.cos(t * 4) * (2 + Math.sin(t));
        meshRef.current.position.z = originalPos.current.z + Math.sin(t * 4) * (2 + Math.sin(t));
        break;
      case 'quantum':
        if (Math.random() > 0.96) {
          meshRef.current.position.set(
            originalPos.current.x + (Math.random() - 0.5) * 4,
            originalPos.current.y + (Math.random() - 0.5) * 4,
            originalPos.current.z + (Math.random() - 0.5) * 4
          );
        } else {
          meshRef.current.position.lerp(originalPos.current, 0.1);
        }
        break;
      case 'infinity':
        meshRef.current.position.x = originalPos.current.x + Math.sin(t) * 8;
        meshRef.current.position.y = originalPos.current.y + Math.sin(t * 2) * 3;
        break;
      case 'attractor':
        const rAttr = 6 + Math.sin(t * 0.5) * 4;
        meshRef.current.position.x = originalPos.current.x + Math.cos(t) * rAttr;
        meshRef.current.position.z = originalPos.current.z + Math.sin(t * 1.3) * rAttr;
        break;
      case 'chaos':
        const cScale = 1 + (Math.random() - 0.5) * 0.4;
        meshRef.current.scale.lerp(new THREE.Vector3(cScale, cScale, cScale), 0.1);
        meshRef.current.position.x += (Math.random() - 0.5) * 0.1;
        meshRef.current.position.y += (Math.random() - 0.5) * 0.1;
        meshRef.current.position.z += (Math.random() - 0.5) * 0.1;
        if (meshRef.current.position.distanceTo(originalPos.current) > 5) {
          meshRef.current.position.lerp(originalPos.current, 0.05);
        }
        break;
      case 'pendulum':
        const pAngle = Math.sin(t * 2) * 0.8;
        meshRef.current.rotation.z = pAngle;
        meshRef.current.position.x = originalPos.current.x + Math.sin(pAngle) * 5;
        meshRef.current.position.y = originalPos.current.y - (1 - Math.cos(pAngle)) * 5;
        break;
    }
  });

  return (
    <InteractionContext.Provider value={{ color: state.color, animation: state.animation, isLocked: state.isLocked, glowIntensity: state.glowIntensity }}>
      <group 
        ref={meshRef} 
        onClick={(e) => { e.stopPropagation(); setIsSelected(true); onSelect?.(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        {children}
        {isSelected && (
          <HolographicMenu 
            state={state} 
            onUpdate={(u) => setState(prev => ({ ...prev, ...u }))} 
            onClose={() => setIsSelected(false)} 
          />
        )}
      </group>
    </InteractionContext.Provider>
  );
};

const CosmicMaterial = (props: any) => {
  const context = useContext(InteractionContext);
  return (
    <meshStandardMaterial 
      {...props} 
      color={context?.color || props.color} 
      emissive={context?.color || props.emissive} 
      emissiveIntensity={context?.glowIntensity !== undefined ? context.glowIntensity : (props.emissiveIntensity || 1)}
    />
  );
};

const CosmicText = (props: any) => {
  const context = useContext(InteractionContext);
  return (
    <Text 
      {...props} 
      color={context?.color || props.color} 
    />
  );
};

const NavNode = ({ position, title, active, onClick, color }: any) => {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);

  return (
    <group 
      position={position} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { setHovered(false); }}
    >
      <Float speed={2} rotationIntensity={active ? 2 : 0.5} floatIntensity={1}>
        <mesh scale={hovered || active ? 1.5 : 1}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={color} transparent opacity={hovered ? 0.8 : 0.4} emissive={color} emissiveIntensity={active ? 1 : 0.2} />
        </mesh>
        <mesh scale={hovered || active ? 1.8 : 1.2}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={color} wireframe transparent opacity={0.6} />
        </mesh>
        <Text position={[0, -2, 0]} fontSize={0.8} color={active ? "#ffffff" : color} anchorX="center" anchorY="top" outlineWidth={0.05} outlineColor="#000000">
          {title}
        </Text>
      </Float>
    </group>
  );
};

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', color: '#ef4444', element: 'Fire', description: 'Energetic, adventurous, and dynamic.' },
  { name: 'Taurus', symbol: '♉', color: '#10b981', element: 'Earth', description: 'Reliable, patient, and practical.' },
  { name: 'Gemini', symbol: '♊', color: '#fbbf24', element: 'Air', description: 'Adaptable, versatile, and intellectual.' },
  { name: 'Cancer', symbol: '♋', color: '#94a3b8', element: 'Water', description: 'Intuitive, sentimental, and compassionate.' },
  { name: 'Leo', symbol: '♌', color: '#f59e0b', element: 'Fire', description: 'Confident, ambitious, and generous.' },
  { name: 'Virgo', symbol: '♍', color: '#84cc16', element: 'Earth', description: 'Analytical, industrious, and kind.' },
  { name: 'Libra', symbol: '♎', color: '#f472b6', element: 'Air', description: 'Diplomatic, artistic, and social.' },
  { name: 'Scorpio', symbol: '♏', color: '#7e22ce', element: 'Water', description: 'Determined, forceful, and loyal.' },
  { name: 'Sagittarius', symbol: '♐', color: '#f97316', element: 'Fire', description: 'Optimistic, freedom-loving, and honest.' },
  { name: 'Capricorn', symbol: '♑', color: '#475569', element: 'Earth', description: 'Responsible, disciplined, and self-controlled.' },
  { name: 'Aquarius', symbol: '♒', color: '#06b6d4', element: 'Air', description: 'Progressive, original, and independent.' },
  { name: 'Pisces', symbol: '♓', color: '#6366f1', element: 'Water', description: 'Compassionate, artistic, and gentle.' },
];

const PlanetNode = ({ degree, name, color, size, radius, active, onClick }: { degree: number, name: string, color: string, size: number, radius: number, active?: boolean, onClick?: () => void }) => {
  const ref = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  
  // Calculate position based on astrological degree
  const angle = (degree) * (Math.PI / 180);
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame(({ clock }) => {
    if (ref.current) {
      // Gentle orbit revolution
      const t = clock.getElapsedTime() * 0.1;
      ref.current.position.x = Math.cos(angle + t) * radius;
      ref.current.position.z = Math.sin(angle + t) * radius;
      
      if (textRef.current) {
        textRef.current.position.x = ref.current.position.x;
        textRef.current.position.z = ref.current.position.z + size + 0.8;
      }
    }
  });

  return (
    <group>
      <Trail width={1.5} color={color} length={15} attenuation={(t) => t * t}>
        <mesh 
          ref={ref} 
          position={[x, 0, z]}
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.5 : 1}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial 
            color={active ? "#ffffff" : color} 
            emissive={active ? "#ffffff" : color} 
            emissiveIntensity={active ? 2 : (hovered ? 1 : 0.5)} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
      </Trail>
      <Text
        ref={textRef}
        position={[x, size + 0.5, z]}
        fontSize={0.5}
        color={active ? "#ffffff" : "white"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor={active ? color : "#000000"}
      >
        {name}
      </Text>
    </group>
  );
};

const HOUSE_DATA = [
  { house: 1, realm: "Self", keywords: "Identity, Appearance, Beginnings" },
  { house: 2, realm: "Value", keywords: "Possessions, Income, Self-Worth" },
  { house: 3, realm: "Mind", keywords: "Communication, Siblings, Learning" },
  { house: 4, realm: "Roots", keywords: "Home, Family, Subconscious" },
  { house: 5, realm: "Joy", keywords: "Creativity, Romance, Children" },
  { house: 6, realm: "Health", keywords: "Service, Routine, Wellness" },
  { house: 7, realm: "Others", keywords: "Partnerships, Marriage, Balance" },
  { house: 8, realm: "Depth", keywords: "Transformation, Shared Assets, Secrets" },
  { house: 9, realm: "Spirit", keywords: "Philosophy, Travel, Expansion" },
  { house: 10, realm: "Success", keywords: "Career, Status, Public Image" },
  { house: 11, realm: "Vision", keywords: "Friends, Hopes, Community" },
  { house: 12, realm: "Soul", keywords: "Spirituality, Solitude, Completion" },
];

const HouseNode = ({ houseNumber, angle, houseInfo, onClick }: { houseNumber: number, angle: number, houseInfo?: any, onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const hx = Math.cos(angle) * 7.5;
  const hz = Math.sin(angle) * 7.5;
  
  const fallback = HOUSE_DATA[houseNumber - 1];
  const title = houseInfo?.realmName || fallback.realm;
  const description = houseInfo?.description || fallback.keywords;

  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer';
    else document.body.style.cursor = 'auto';
  }, [hovered]);

  return (
    <group position={[hx, 0.1, hz]}>
      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={hovered ? 0.8 : 0.6}
        color={hovered ? "#60a5fa" : "#3b82f6"}
        fillOpacity={hovered ? 1 : 0.6}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => { setHovered(false); }}
      >
        {houseNumber}
      </Text>
      
      <AnimatePresence>
        {hovered && (
          <Html center distanceFactor={15} position={[0, 1, 0]}>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="bg-black/90 backdrop-blur-md border border-blue-500/30 p-3 rounded-xl min-w-[120px] shadow-2xl pointer-events-none"
            >
              <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">House {houseNumber}</div>
              <div className="text-[13px] text-white font-medium mb-0.5">{title.toUpperCase()}</div>
              <div className="text-[9px] text-stone-400 font-light leading-tight">{description}</div>
            </motion.div>
          </Html>
        )}
      </AnimatePresence>
      
      {/* Visual ring/marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[0.7, 0.8, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={hovered ? 0.3 : 0.1} />
      </mesh>
    </group>
  );
};

const Astrolabe = ({ data, onPlanetClick, setActiveTab }: { data: CosmicData, onPlanetClick: (title: string, content: string) => void, setActiveTab: (tab: any) => void }) => {
  const ref = useRef<THREE.Group>(null);
  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const getPlanetColor = (name: string) => {
    const colors: Record<string, string> = {
      Sun: '#fbbf24', Moon: '#e2e8f0', Mercury: '#94a3b8', Venus: '#f472b6',
      Mars: '#ef4444', Jupiter: '#f59e0b', Saturn: '#64748b', Uranus: '#38bdf8',
      Neptune: '#818cf8', Pluto: '#57534e', Ascendant: '#10b981'
    };
    return colors[name] || '#ffffff';
  };

  const getPos = (degree: number, r: number) => {
    const angle = ((degree + 180) % 360) * (Math.PI / 180);
    return [Math.cos(angle) * r, 0, Math.sin(angle) * r] as [number, number, number];
  };

  return (
    <group ref={ref}>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
        {/* Astrolabe Rings */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[14.5, 15, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[10, 10.1, 64]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5, 5.05, 64]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>

        {/* Zodiac Wedges */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = (i * 30 * Math.PI) / 180;
          return (
            <mesh key={`wedge-${sign.name}`} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[14.5, 17.5, 32, 1, startAngle, (30 * Math.PI) / 180]} />
              <meshBasicMaterial color={sign.color} transparent opacity={0.05} side={THREE.DoubleSide} />
            </mesh>
          );
        })}

        {/* House Wedges (Subtle background) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const startAngle = (i * 30 * Math.PI) / 180;
          return (
            <mesh key={`house-wedge-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
              <ringGeometry args={[5, 14.5, 32, 1, startAngle, (30 * Math.PI) / 180]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={i % 2 === 0 ? 0.015 : 0} side={THREE.DoubleSide} />
            </mesh>
          );
        })}

        {/* Zodiac Divisions & Labels */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = (i * 30 * Math.PI) / 180;
          const labelAngle = (i * 30 + 15) * Math.PI / 180;
          const lx = Math.cos(labelAngle) * 16.5;
          const lz = Math.sin(labelAngle) * 16.5;

          return (
            <group key={sign.name}>
              <Line
                points={[
                  [Math.cos(startAngle) * 10, 0, Math.sin(startAngle) * 10],
                  [Math.cos(startAngle) * 17, 0, Math.sin(startAngle) * 17]
                ]}
                color="#ffffff"
                opacity={0.15}
                transparent
              />
              <Text
                position={[lx, 0, lz]}
                rotation={[-Math.PI / 2, 0, -labelAngle + Math.PI / 2]}
                fontSize={0.8}
                color={sign.color}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlanetClick(sign.name, `${sign.symbol}: ${sign.element} sign. ${sign.description}`);
                }}
                onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; }}
              >
                {sign.symbol}
              </Text>
              <Text
                position={[Math.cos(labelAngle) * 18.5, -0.1, Math.sin(labelAngle) * 18.5]}
                rotation={[-Math.PI / 2, 0, -labelAngle + Math.PI / 2]}
                fontSize={0.4}
                color="white"
                opacity={0.5}
              >
                {sign.name.toUpperCase()}
              </Text>
            </group>
          );
        })}

        {/* Outer Zodiac Belt */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[16, 17.5, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.03} side={THREE.DoubleSide} />
        </mesh>

        {/* House Labels */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 + 15) * Math.PI / 180;
          const houseInfo = data.houses?.find(h => h.houseNumber === i + 1);

          return (
            <HouseNode 
              key={`house-node-${i}`}
              houseNumber={i + 1}
              angle={angle}
              houseInfo={houseInfo}
              onClick={() => {
                onPlanetClick(`House ${i + 1}`, `${houseInfo?.realmName || HOUSE_DATA[i].realm}. ${houseInfo?.description || HOUSE_DATA[i].keywords}`);
              }}
            />
          );
        })}

        {/* Planets */}
        {data.planets.map((p, i) => {
          const radius = 11 + (i % 3) * 1.5; 
          const color = getPlanetColor(p.name);
          
          return (
            <PlanetNode 
              key={p.name} 
              name={p.name}
              degree={p.degree}
              color={color}
              size={0.4}
              radius={radius}
              active={activePlanet === p.name}
              onClick={() => { 
                setActivePlanet(p.name);
                setActiveTab('planets'); 
                onPlanetClick(p.name, `In House ${p.house}. ${p.meaning}`); 
              }} 
            />
          );
        })}

        {/* Aspects */}
        {data.aspects && data.aspects.map((aspect, i) => {
          const p1 = data.planets.find(p => p.name === aspect.planet1);
          const p2 = data.planets.find(p => p.name === aspect.planet2);
          if (!p1 || !p2) return null;
          
          const radius1 = 11 + (data.planets.indexOf(p1) % 3) * 1.2;
          const pos1 = getPos(p1.degree, radius1);
          
          const radius2 = 11 + (data.planets.indexOf(p2) % 3) * 1.2;
          const pos2 = getPos(p2.degree, radius2);
          
          let color = '#ffffff';
          if (aspect.type === 'conjunction') color = '#fbbf24';
          if (aspect.type === 'square') color = '#ef4444';
          if (aspect.type === 'trine') color = '#10b981';
          if (aspect.type === 'opposition') color = '#a855f7';
          if (aspect.type === 'sextile') color = '#f59e0b';
          
          return (
             <group key={`aspect-${i}`}>
               <Line 
                 points={[pos1, pos2]} 
                 color={color} 
                 lineWidth={2} 
                 opacity={0.6} 
                 transparent 
                 onClick={(e) => { e.stopPropagation(); setActiveTab('planets'); onPlanetClick(aspect.type.toUpperCase(), `${aspect.planet1} & ${aspect.planet2}. ${aspect.meaning}`); }}
                 onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                 onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
               />
             </group>
          )
        })}

        {/* Additional Points */}
        {['north', 'south'].map((node, i) => {
          const n = (data.nodes as any)[node];
          const pos = getPos(n.degree, 14);
          return (
            <group key={node} position={pos}>
               <mesh
                 onClick={(e) => { e.stopPropagation(); setActiveTab('planets'); onPlanetClick(n.name, `In House ${n.house}. ${n.meaning || ''}`); }}
                 onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                 onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
               >
                 <sphereGeometry args={[0.3, 16, 16]} />
                 <meshStandardMaterial color="#fca5a5" emissive="#ef4444" emissiveIntensity={1}/>
               </mesh>
               <Text position={[0,-0.6,0]} fontSize={0.3} color="#fca5a5">{n.name}</Text>
            </group>
          );
        })}
      </Float>
    </group>
  );
};

/**
 * TorusField Component
 * Represents the central energetic blueprint (Soul Blueprint) using nested geometries.
 */
const TorusField = () => {
  const outerRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const knotRef = useRef<THREE.Mesh>(null);
  
  // Rotating the fields over time
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.x = Math.PI / 2;
      outerRef.current.rotation.z = t * 0.05;
    }
    if (midRef.current) {
      midRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.1;
      midRef.current.rotation.y = Math.cos(t * 0.2) * 0.1;
      midRef.current.rotation.z = -t * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.2;
      innerRef.current.rotation.x = t * 0.1;
    }
    if (knotRef.current) {
      knotRef.current.rotation.z = t * 0.3;
      knotRef.current.rotation.x = t * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      {/* Outer Torus */}
      <InteractiveObject id="torus_outer" initialColor="#a855f7">
        <mesh ref={outerRef}>
          <torusGeometry args={[10, 0.1, 8, 50]} />
          <CosmicMaterial 
            color="#a855f7" 
            transparent 
            opacity={0.3} 
            emissive="#7e22ce" 
            emissiveIntensity={1} 
          />
        </mesh>
      </InteractiveObject>

      {/* Mid Energetic Torus */}
      <InteractiveObject id="torus_mid" initialColor="#8b5cf6">
        <mesh ref={midRef}>
          <torusGeometry args={[7, 2, 16, 50]} />
          <CosmicMaterial 
            color="#8b5cf6" 
            wireframe 
            transparent 
            opacity={0.15} 
            emissive="#6d28d9" 
            emissiveIntensity={0.8} 
          />
        </mesh>
      </InteractiveObject>

      {/* Inner Torus for depth */}
      <InteractiveObject id="torus_inner" initialColor="#3b82f6">
        <mesh ref={innerRef}>
           <torusGeometry args={[3, 0.5, 16, 50]} />
           <CosmicMaterial color="#3b82f6" wireframe transparent opacity={0.4} emissive="#1d4ed8" emissiveIntensity={0.5} />
        </mesh>
      </InteractiveObject>

      {/* Core Sacred Knot (represents the center of the field) */}
      <InteractiveObject id="torus_knot" initialColor="#fbbf24">
        <mesh ref={knotRef}>
          <torusKnotGeometry args={[1, 0.3, 100, 16]} />
          <CosmicMaterial color="#fbbf24" wireframe transparent opacity={0.6} emissive="#d97706" emissiveIntensity={1} />
        </mesh>
      </InteractiveObject>
    </Float>
  );
}

const SEPHIROTH_DATA = [
  { id: 1, name: 'Kether', pos: [0, 10, 0], meaning: 'Crown, Divine Will' },
  { id: 2, name: 'Chokhmah', pos: [4, 8, 0], meaning: 'Wisdom, Creative Power' },
  { id: 3, name: 'Binah', pos: [-4, 8, 0], meaning: 'Understanding, Form' },
  { id: 4, name: 'Chesed', pos: [4, 4, 0], meaning: 'Mercy, Expansion' },
  { id: 5, name: 'Gevurah', pos: [-4, 4, 0], meaning: 'Severity, Restriction' },
  { id: 6, name: 'Tiferet', pos: [0, 2, 0], meaning: 'Beauty, Harmony, Balance' },
  { id: 7, name: 'Netzach', pos: [4, -2, 0], meaning: 'Victory, Emotion' },
  { id: 8, name: 'Hod', pos: [-4, -2, 0], meaning: 'Splendor, Intellect' },
  { id: 9, name: 'Yesod', pos: [0, -4, 0], meaning: 'Foundation, Subconscious' },
  { id: 10, name: 'Malkuth', pos: [0, -9, 0], meaning: 'Kingdom, Physical Reality' }
];

const TREE_PATHS = [
  { id: 11, nodes: [1, 2], name: 'Aleph', hebrew: 'א' },
  { id: 12, nodes: [1, 3], name: 'Beth', hebrew: 'ב' },
  { id: 13, nodes: [1, 6], name: 'Gimel', hebrew: 'ג' },
  { id: 14, nodes: [2, 3], name: 'Daleth', hebrew: 'ד' },
  { id: 15, nodes: [2, 6], name: 'He', hebrew: 'ה' },
  { id: 16, nodes: [2, 4], name: 'Vav', hebrew: 'ו' },
  { id: 17, nodes: [3, 6], name: 'Zayin', hebrew: 'ז' },
  { id: 18, nodes: [3, 5], name: 'Cheth', hebrew: 'ח' },
  { id: 19, nodes: [4, 5], name: 'Teth', hebrew: 'ט' },
  { id: 20, nodes: [4, 6], name: 'Yod', hebrew: 'י' },
  { id: 21, nodes: [4, 7], name: 'Kaph', hebrew: 'כ' },
  { id: 22, nodes: [5, 6], name: 'Lamed', hebrew: 'ל' },
  { id: 23, nodes: [5, 8], name: 'Mem', hebrew: 'מ' },
  { id: 24, nodes: [6, 7], name: 'Nun', hebrew: 'נ' },
  { id: 25, nodes: [6, 8], name: 'Samekh', hebrew: 'ס' },
  { id: 26, nodes: [6, 9], name: 'Ayin', hebrew: 'ע' },
  { id: 27, nodes: [7, 8], name: 'Pe', hebrew: 'פ' },
  { id: 28, nodes: [7, 9], name: 'Tzaddi', hebrew: 'צ' },
  { id: 29, nodes: [7, 10], name: 'Qoph', hebrew: 'ק' },
  { id: 30, nodes: [8, 9], name: 'Resh', hebrew: 'ר' },
  { id: 31, nodes: [8, 10], name: 'Shin', hebrew: 'ש' },
  { id: 32, nodes: [9, 10], name: 'Tav', hebrew: 'ת' }
];

const TreeOfLife = ({ activeSephirah, activePaths = [] }: { activeSephirah: string, activePaths?: string[] }) => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredPath, setHoveredPath] = useState<number | null>(null);

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      {/* 22 paths of the Tree */}
      {TREE_PATHS.map((path) => {
        const start = SEPHIROTH_DATA.find(s => s.id === path.nodes[0])!;
        const end = SEPHIROTH_DATA.find(s => s.id === path.nodes[1])!;
        
        // Check if path is active in user profile
        const isPathActive = activePaths.some(ap => ap.toLowerCase().includes(path.name.toLowerCase()) || ap.includes(path.id.toString()));
        const isHovered = hoveredPath === path.id;

        return (
          <group key={`path-${path.id}`}>
            <Line
              points={[start.pos as [number, number, number], end.pos as [number, number, number]]}
              color={isPathActive ? "#fbbf24" : (isHovered ? "#ffffff" : "#fbbf24")}
              opacity={isPathActive ? 1 : (isHovered ? 0.6 : 0.15)}
              transparent
              lineWidth={isPathActive ? 3 : (isHovered ? 2 : 1)}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredPath(path.id); }}
              onPointerOut={() => setHoveredPath(null)}
            />
            
            {(isHovered || isPathActive) && (
              <Html distanceFactor={15} position={[
                (start.pos[0] + end.pos[0]) / 2,
                (start.pos[1] + end.pos[1]) / 2 + 0.5,
                (start.pos[2] + end.pos[2]) / 2
              ]}>
                <div className={`px-2 py-1 ${isPathActive ? 'bg-amber-500/90' : 'bg-black/80'} backdrop-blur-md border border-amber-500/30 rounded text-[9px] text-white uppercase tracking-tighter whitespace-nowrap`}>
                  {path.hebrew} {path.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}
      
      {/* 10 Sephiroth */}
      {SEPHIROTH_DATA.map(s => {
        const isActive = activeSephirah.toLowerCase().includes(s.name.toLowerCase());
        const isHovered = hoveredNode === s.id;
        
        // Theme-based colors
        const color = isActive ? "#fca5a5" : (isHovered ? "#ffffff" : "#d8b4fe");
        const emissive = isActive ? "#ef4444" : (isHovered ? "#ffffff" : "#c084fc");
        const intensity = isActive ? 4 : (isHovered ? 2 : 0.5);
        
        return (
          <InteractiveObject 
            key={s.id} 
            id={`sephirah-${s.id}`} 
            initialColor={color}
          >
            <group 
              position={s.pos as [number, number, number]}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(s.id); }}
              onPointerOut={() => setHoveredNode(null)}
            >
              {/* Outer Glow */}
              <mesh scale={isActive ? 1.4 : 1.2}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial 
                  color={color} 
                  transparent 
                  opacity={0.1} 
                  emissive={emissive} 
                  emissiveIntensity={intensity} 
                />
              </mesh>

              {/* Core Node */}
              <mesh>
                <sphereGeometry args={[isActive ? 0.6 : 0.45, 32, 32]} />
                <CosmicMaterial emissiveIntensity={intensity} />
              </mesh>

              {isActive && (
                <Sparkles 
                  count={20} 
                  scale={1.5} 
                  size={4} 
                  speed={0.5} 
                  color="#fbbf24" 
                />
              )}

              {/* Sephirah Label */}
              <Text 
                position={[0, -1, 0]} 
                fontSize={0.5} 
                anchorY="top" 
                color="white"
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                {s.name}
              </Text>

              {/* Insight Label on Hover/Active */}
              {(isHovered || isActive) && (
                <Html distanceFactor={15} position={[0, 1.2, 0]}>
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-black/90 backdrop-blur-xl border border-white/20 p-3 rounded-xl min-w-[150px] shadow-2xl text-center pointer-events-none"
                   >
                     <div className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">Sephirah {s.id}</div>
                     <div className="text-sm text-white font-medium mb-1">{s.name.toUpperCase()}</div>
                     <div className="text-[9px] text-stone-400 italic">"{s.meaning}"</div>
                   </motion.div>
                </Html>
              )}
            </group>
          </InteractiveObject>
        );
      })}
    </Float>
  );
};

const NameNode = ({ position, label, content, color, radius = 0.5, onSelect }: any) => {
  const [hovered, setHovered] = useState(false);
  return (
    <InteractiveObject id={`name-node-${label}`} initialColor={color} onSelect={() => onSelect?.(content)}>
      <group position={position}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh 
            onPointerOver={() => setHovered(true)} 
            onPointerOut={() => setHovered(false)}
          >
            <sphereGeometry args={[radius, 32, 32]} />
            <CosmicMaterial emissiveIntensity={hovered ? 2 : 1} />
          </mesh>
          <Text position={[0, -radius - 0.4, 0]} fontSize={0.3} color="white" anchorY="top">
            {label}
          </Text>
        </Float>
      </group>
    </InteractiveObject>
  );
};

const NameMindMap = ({ analysis, onNodeClick, name }: { analysis: any, onNodeClick: (t: string) => void, name?: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  const nodes = useMemo(() => {
    const items: any[] = [];
    const nameParts = [
      { key: 'first', data: analysis.first, angle: 0, color: '#38bdf8' },
      { key: 'middle', data: analysis.middle, angle: (Math.PI * 2) / 3, color: '#818cf8' },
      { key: 'last', data: analysis.last, angle: (Math.PI * 4) / 3, color: '#c084fc' }
    ].filter(p => p.data?.name);

    nameParts.forEach((part, i) => {
      const radius = 6;
      const x = Math.cos(part.angle) * radius;
      const z = Math.sin(part.angle) * radius;
      const partPos = [x, 0, z];

      // Main Part Node
      items.push({
        type: 'main',
        label: part.data.name,
        content: `${part.key.toUpperCase()} NAME: ${part.data.name}. Origin: ${part.data.origin}. Meaning: ${part.data.meaning}`,
        pos: partPos,
        color: part.color,
        radius: 0.8
      });

      // Sub-nodes (Origin, Meaning, Impact)
      const subRadius = 3;
      const subNodes = [
        { label: 'Origin', content: part.data.origin, offset: [-1, 2, 1] },
        { label: 'Meaning', content: part.data.meaning, offset: [1, -1, 2] },
        { label: 'Impact', content: part.data.impact, offset: [2, 1, -1] }
      ];

      subNodes.forEach((sub, j) => {
        const subPos = [
          partPos[0] + sub.offset[0] * 1.5,
          partPos[1] + sub.offset[1] * 1.5,
          partPos[2] + sub.offset[2] * 1.5
        ];
        items.push({
          type: 'sub',
          parentPos: partPos,
          label: sub.label,
          content: `${part.data.name} ${sub.label}: ${sub.content}`,
          pos: subPos,
          color: part.color,
          radius: 0.4
        });
      });
    });

    return items;
  }, [analysis]);

  return (
    <group ref={groupRef}>
      {/* Central Identity Node */}
      <NameNode 
        position={[0, 0, 0]} 
        label={name || "IDENTITY"} 
        content={analysis.overallBigPicture} 
        color="#ffffff" 
        radius={1.2} 
        onSelect={onNodeClick}
      />
      
      {nodes.map((node, i) => (
        <group key={i}>
          {node.parentPos && (
            <Line 
              points={[node.parentPos, node.pos]} 
              color={node.color} 
              opacity={0.3} 
              transparent 
              lineWidth={1}
            />
          )}
          {!node.parentPos && (
             <Line 
               points={[[0, 0, 0], node.pos]} 
               color={node.color} 
               opacity={0.5} 
               transparent 
               lineWidth={2}
               dashed
               dashScale={2}
             />
          )}
          <NameNode 
            position={node.pos} 
            label={node.label} 
            content={node.content} 
            color={node.color} 
            radius={node.radius} 
            onSelect={onNodeClick}
          />
        </group>
      ))}

      {/* Energy Rings */}
      <Ring args={[5, 5.1, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} />
      </Ring>
      <Ring args={[8, 8.1, 64]} rotation={[Math.PI / 2, 0.2, 0]}>
        <meshBasicMaterial color="#818cf8" transparent opacity={0.05} />
      </Ring>
    </group>
  );
};

/**
 * CameraController Component
 * Manages reactive camera positioning based on the active research module (activeTab).
 * Implements smooth lerping for transitions between different metaphysical viewports.
 */
const CameraController = ({ isPresentationActive, activeTab, data }: { isPresentationActive?: boolean, activeTab: string, data: CosmicData | null }) => {
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);
  const lastActiveTab = useRef(activeTab);

  useEffect(() => {
    if (activeTab !== lastActiveTab.current) {
      setIsAutoFollowing(true);
      lastActiveTab.current = activeTab;
    }
  }, [activeTab]);

  // --- RENDERING LOOP: CAMERA LOGIC ---
  useFrame((state) => {
    if (isPresentationActive) {
      const t = state.clock.getElapsedTime();
      state.camera.position.x = Math.sin(t * 0.2) * 25;
      state.camera.position.z = Math.cos(t * 0.2) * 25;
      state.camera.position.y = 15 + Math.sin(t * 0.1) * 8;
      state.camera.lookAt(0, 0, 0);
      return;
    }

    if (!isAutoFollowing) return;

    const targetPos = new THREE.Vector3(0, 15, 20);
    const lookAtTarget = new THREE.Vector3(0, 0, 0);

    if (activeTab === 'torus') {
      targetPos.set(0, 15, 25);
      lookAtTarget.set(0, 0, 0);
    } else if (activeTab === 'planets') {
      targetPos.set(-20, 5, 10);
      lookAtTarget.set(-15, 0, 0);
    } else if (activeTab === 'numbers') {
      targetPos.set(20, 5, 10);
      lookAtTarget.set(15, 0, 0);
    } else if (activeTab === 'kabbalah') {
      targetPos.set(0, 10, -25);
      lookAtTarget.set(0, 0, -15);
    } else if (activeTab === 'cycles') {
      targetPos.set(0, 5, 30);
      lookAtTarget.set(0, 0, 15);
    } else if (activeTab === 'houses') {
      targetPos.set(15, 10, 20);
      lookAtTarget.set(0, -5, 10);
    } else if (activeTab === 'daily') {
      targetPos.set(-20, 10, -20);
      lookAtTarget.set(-10, 0, -10);
    } else if (activeTab === 'synthesis') {
      targetPos.set(0, 30, 5);
      lookAtTarget.set(0, 0, 0);
    } else if (activeTab === 'findings') {
      targetPos.set(0, 40, 20);
      lookAtTarget.set(0, 0, 0);
    } else if (activeTab === 'strategy') {
      targetPos.set(0, 25, 0);
      lookAtTarget.set(0, 0, 0);
    } else if (activeTab === 'timeline') {
      targetPos.set(10, 5, 35);
      lookAtTarget.set(10, 0, 20);
    } else if (activeTab === 'name') {
      targetPos.set(0, 10, -35); 
      lookAtTarget.set(0, 0, -20);
    } else if (activeTab === 'akashic') {
      targetPos.set(-20, 15, -20);
      lookAtTarget.set(-15, 0, -15);
    } else if (activeTab === 'patterns') {
      targetPos.set(20, 15, -20);
      lookAtTarget.set(15, 0, -15);
    }
    
    const distance = state.camera.position.distanceTo(targetPos);
    const targetDistance = (state.get().controls as any)?.target.distanceTo(lookAtTarget) || 0;

    if (distance > 0.05 || targetDistance > 0.05) {
      state.camera.position.lerp(targetPos, 0.05);
      if (state.get().controls) {
        (state.get().controls as any).target.lerp(lookAtTarget, 0.05);
      } else {
        state.camera.lookAt(lookAtTarget);
      }
    }
  });

  return (
    <OrbitControls 
      makeDefault 
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={1.2}
      maxDistance={60} 
      minDistance={5} 
      autoRotate={!data} 
      autoRotateSpeed={0.5}
      onStart={() => setIsAutoFollowing(false)}
    />
  );
};

/**
 * NumerologyGeometria Component
 * Visualizes the mathematical reduction and geometric patterns of name and birthday.
 * [GEOMETRIA & KABBALAH VISUALIZATION]
 */
const NumerologyGeometria = ({ data, onSelect }: { data: CosmicData, onSelect: (title: string, content: string) => void }) => {
  const letters = data.gematria.nameSequence?.split(' ') || [];
  
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Central Core: The Reduction */}
        <InteractiveObject id="reduction-core" initialColor="#e879f9" onSelect={() => onSelect("Numerical Reduction", data.gematria.pattern)}>
          <mesh>
            <icosahedronGeometry args={[1.5, 2]} />
            <CosmicMaterial wireframe emissiveIntensity={2} transparent opacity={0.4} />
          </mesh>
          <CosmicText position={[0, 0, 0]} fontSize={1.2} fillOpacity={1}>
            {data.gematria.reduction}
          </CosmicText>
        </InteractiveObject>

        {/* Outer Orbit: Individual Numerology Units */}
        <group>
          {[
            { label: 'Life Path', value: data.numerology.lifePath, pos: [6, 4, 2], color: '#60a5fa' },
            { label: 'Expression', value: data.numerology.expression, pos: [-6, 2, -2], color: '#c084fc' },
            { label: 'Soul Urge', value: data.numerology.soulUrge, pos: [0, 8, -4], color: '#a78bfa' }
          ].map((item, i) => (
            <group key={item.label} position={item.pos as [number, number, number]}>
              <InteractiveObject id={`num-${item.label}`} initialColor={item.color} onSelect={() => onSelect(item.label, `The ${item.label} vibration: ${item.value}`)}>
                <mesh>
                  <octahedronGeometry args={[0.8, 0]} />
                  <CosmicMaterial emissiveIntensity={1.5} />
                </mesh>
                <CosmicText position={[0, 1.2, 0]} fontSize={0.6} anchorY="bottom">
                  {item.value}
                </CosmicText>
                <CosmicText position={[0, -1.2, 0]} fontSize={0.3} anchorY="top" color="#94a3b8">
                  {item.label}
                </CosmicText>
              </InteractiveObject>
              
              {/* Connection to Core */}
              <Line 
                points={[[0, 0, 0], [-item.pos[0], -item.pos[1], -item.pos[2]]]} 
                color={item.color} 
                lineWidth={1} 
                transparent 
                opacity={0.3} 
              />
            </group>
          ))}
        </group>

        {/* The Geometria Ring: Letters/Numbers forming a pattern */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          {letters.map((char, i) => {
            const angle = (i / letters.length) * Math.PI * 2;
            const r = 10;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            return (
              <group key={i} position={[x, y, 0]}>
                <InteractiveObject id={`char-${i}`} initialColor="#3b82f6" onSelect={() => onSelect("Character Frequency", `Vibration of character: ${char}`)}>
                  <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.3, 0.8, 4]} />
                    <CosmicMaterial emissiveIntensity={1} />
                  </mesh>
                  <CosmicText position={[0, 0.8, 0]} fontSize={0.4} rotation={[-Math.PI / 2, 0, 0]}>
                    {char}
                  </CosmicText>
                </InteractiveObject>
                
                {/* Geometria web lines */}
                {letters.map((_, nextI) => {
                   if (nextI === i) return null;
                   const nextAngle = (nextI / letters.length) * Math.PI * 2;
                   const nextX = Math.cos(nextAngle) * r;
                   const nextY = Math.sin(nextAngle) * r;
                   return (
                     <Line 
                       key={`web-${nextI}`}
                       points={[[0,0,0], [nextX - x, nextY - y, 0]]}
                       color="#1e3a8a"
                       lineWidth={0.5}
                       transparent
                       opacity={0.1}
                     />
                   );
                })}
              </group>
            )
          })}
        </group>

        {/* Date of Birth Path: Secondary Ring */}
        {data.gematria.dobSequence && (
          <group rotation={[-Math.PI / 4, 0, 0]}>
            {data.gematria.dobSequence.split('').map((num, i, arr) => {
              const angle = (i / arr.length) * Math.PI * 2;
              const r = 6;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <group key={`dob-${i}`} position={[x, y, 0]}>
                   <mesh rotation={[Math.PI / 2, 0, 0]}>
                     <torusGeometry args={[0.2, 0.05, 12, 24]} />
                     <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} />
                   </mesh>
                   <CosmicText position={[0, 0.5, 0]} fontSize={0.3} color="#93c5fd">
                     {num}
                   </CosmicText>
                </group>
              );
            })}
          </group>
        )}

        {/* Kabbalah Connection Pulses */}
        <group>
           <Text position={[0, -8, 0]} fontSize={0.7} color="#a855f7" italic>
              Sephirah Alignment: {data.kabbalah.sephirah}
           </Text>
           <Line 
             points={[[0, 0, 0], [0, -15, -10]]} 
             color="#a855f7" 
             lineWidth={2} 
             dashed 
             dashScale={0.5}
             transparent 
             opacity={0.4} 
           />
        </group>
      </Float>
    </group>
  );
};

/**
 * Main CosmicScene Component
 * The primary 3D rendering context using React Three Fiber.
 * Integrates geometry, lighting, effects, and camera management.
 */
export const CosmicScene = ({ data, activeTab, setActiveTab, onPlanetClick, isPresentationActive }: CosmicSceneProps) => {

  return (
    <Canvas id="cosmic-canvas" camera={{ position: [0, 15, 20], fov: 60 }} className="w-full h-full absolute inset-0 bg-black">
      {/* --- SCENE INFRASTRUCTURE --- */}
      <CameraController isPresentationActive={isPresentationActive} activeTab={activeTab} data={data} />
      <fog attach="fog" args={['#000', 5, 50]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
      
      {/* Lightened particle fields for mobile performance */}
      <Stars radius={100} depth={50} count={150} factor={4} saturation={0} fade />

      {/* --- CENTRAL BLUEPRINT GEOMETRY --- */}
      <TorusField />
      
      {/* --- MODULE NODES (NAVIGATION) --- */}
      {data && (
        <group>
          <NavNode position={[0, -8, 10]} title="Soul Blueprint" active={activeTab === 'torus'} onClick={() => setActiveTab('torus')} color="#fbbf24" />
          <NavNode position={[-15, -15, 0]} title="Astrology" active={activeTab === 'planets'} onClick={() => setActiveTab('planets')} color="#e2e8f0" />
          <NavNode position={[15, -15, 0]} title="Numerology" active={activeTab === 'numbers'} onClick={() => setActiveTab('numbers')} color="#60a5fa" />
          <NavNode position={[0, -15, -15]} title="Kabbalah" active={activeTab === 'kabbalah'} onClick={() => setActiveTab('kabbalah')} color="#d8b4fe" />
          <NavNode position={[0, -15, 15]} title="Cycles & Lots" active={activeTab === 'cycles'} onClick={() => setActiveTab('cycles')} color="#f43f5e" />
          <NavNode position={[-10, -15, -10]} title="Daily Insight" active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} color="#facc15" />
          <NavNode position={[10, -15, -10]} title="Houses" active={activeTab === 'houses'} onClick={() => setActiveTab('houses')} color="#c084fc" />
          <NavNode position={[-5, -15, 20]} title="Synthesis" active={activeTab === 'synthesis'} onClick={() => setActiveTab('synthesis')} color="#f0abfc" />
          <NavNode position={[10, -15, 20]} title="Timeline" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} color="#f43f5e" />
          <NavNode position={[0, 15, 0]} title="Life Strategy" active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} color="#2dd4bf" />
          <NavNode position={[0, -15, -20]} title="Name Analysis" active={activeTab === 'name'} onClick={() => setActiveTab('name')} color="#38bdf8" />
          <NavNode position={[-15, 0, -15]} title="Akashic Records" active={activeTab === 'akashic'} onClick={() => setActiveTab('akashic')} color="#818cf8" />
          <NavNode position={[15, 0, -15]} title="Synchronicities" active={activeTab === 'patterns'} onClick={() => setActiveTab('patterns')} color="#2dd4bf" />
        </group>
      )}

      {/* --- MODULE-SPECIFIC CONTENT (CONTEXTUAL RENDERING) --- */}
      {data && activeTab === 'patterns' && (
        <group position={[15, 0, -15]}>
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
             <mesh
               onClick={(e) => { e.stopPropagation(); setActiveTab('patterns'); }}
               onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
               onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
             >
               <icosahedronGeometry args={[2.5, 0]} />
               <meshStandardMaterial color="#2dd4bf" wireframe transparent opacity={0.3} emissive="#0d9488" emissiveIntensity={0.8} />
             </mesh>
             <Html center position={[0, -4, 0]}>
               <div className="bg-teal-950/80 backdrop-blur border border-teal-500/30 px-3 py-1.5 rounded-full text-teal-200 text-xs tracking-widest uppercase whitespace-nowrap shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                 Synchronicities
               </div>
             </Html>
          </Float>
        </group>
      )}

      {data && activeTab === 'akashic' && (
        <group position={[-15, 0, -15]}>
          <Float speed={1} rotationIntensity={0.8} floatIntensity={0.5}>
             <mesh
               onClick={(e) => { e.stopPropagation(); setActiveTab('akashic'); }}
               onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
               onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
             >
               <octahedronGeometry args={[2.5, 0]} />
               <meshStandardMaterial color="#818cf8" wireframe transparent opacity={0.3} emissive="#4f46e5" emissiveIntensity={0.8} />
             </mesh>
             <Html center position={[0, -4, 0]}>
               <div className="bg-indigo-950/80 backdrop-blur border border-indigo-500/30 px-3 py-1.5 rounded-full text-indigo-200 text-xs tracking-widest uppercase whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                 Akashic Records
               </div>
             </Html>
          </Float>
        </group>
      )}

      {data && activeTab === 'name' && (
        <group position={[0, 0, -20]}>
          <NameMindMap 
            analysis={data.nameAnalysis} 
            name={data.nameAnalysis?.first?.name ? `${data.nameAnalysis.first.name} ${data.nameAnalysis.last?.name || ''}` : 'IDENTITY'}
            onNodeClick={(content) => onPlanetClick?.("Name Analysis", content)} 
          />
          <pointLight color="#0ea5e9" intensity={2} distance={30} />
          <Stars radius={50} depth={20} count={100} factor={2} saturation={0} fade />
        </group>
      )}

      {data && activeTab === 'planets' && (
        <group position={[-15, 0, 0]}>
          <Astrolabe data={data} onPlanetClick={(title, content) => onPlanetClick?.(title, content)} setActiveTab={setActiveTab} />
        </group>
      )}

      {data && activeTab === 'numbers' && (
        <group position={[15, 5, 0]}>
          <NumerologyGeometria data={data} onSelect={(title, content) => onPlanetClick?.(title, content)} />
          <Stars radius={40} depth={10} count={50} factor={1} saturation={0} fade />
        </group>
      )}

      {data && activeTab === 'kabbalistic_numerology' && data.kabbalisticNumerology && (
        <group position={[0, -2, -15]} rotation={[0, Math.PI, 0]}>
           <TreeOfLife 
             activeSephirah={`${data.kabbalisticNumerology.lifePathCorrespondence.sephirah} ${data.kabbalisticNumerology.expressionCorrespondence.sephirah} ${data.kabbalisticNumerology.soulUrgeCorrespondence.sephirah}`} 
             activePaths={[
               data.kabbalisticNumerology.lifePathCorrespondence.path,
               data.kabbalisticNumerology.expressionCorrespondence.path,
               data.kabbalisticNumerology.soulUrgeCorrespondence.path,
               ...(data.planets.map(p => p.treeOfLifeConnection).filter(Boolean) as string[])
             ]}
           />
           <group position={[0, 10, 0]}>
             <CosmicText fontSize={0.8} color="#10b981">
               Hierarchy of the Sephirah
             </CosmicText>
             <CosmicText position={[0, -1.2, 0]} fontSize={0.4} color="#6ee7b7">
               Soul Journey Synthesis
             </CosmicText>
           </group>
        </group>
      )}

      {data && activeTab === 'kabbalah' && (
        <group position={[0, -2, -15]} rotation={[0, Math.PI, 0]}>
           <TreeOfLife 
             activeSephirah={data.kabbalah.sephirah} 
             activePaths={[data.kabbalah.path]}
           />
           <Text 
             position={[0, -6, 0]} 
             fontSize={0.8} 
             color="white" 
             anchorY="top"
             onClick={(e) => { e.stopPropagation(); setActiveTab('kabbalah'); onPlanetClick?.("Kabbalah", `Sephirah: ${data.kabbalah.sephirah}`); }}
             onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
             onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
           >
             Path: {data.kabbalah.path}
           </Text>
        </group>
      )}

      {data && activeTab === 'cycles' && (
        <group position={[0, 0, 15]}>
          <Float speed={3} rotationIntensity={1} floatIntensity={2}>
             <Ring 
               args={[2, 2.2, 32]} 
               rotation={[Math.PI / 2, 0, 0]}
               onClick={(e) => { e.stopPropagation(); setActiveTab('cycles'); }}
               onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
               onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
             >
               <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={2} transparent opacity={0.6}/>
             </Ring>
             <Ring args={[3, 3.1, 32]} rotation={[Math.PI / 2, 0, 0]}>
               <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1} transparent opacity={0.4}/>
             </Ring>
             <mesh position={[0,0,0]}>
               <sphereGeometry args={[1, 16, 16]}/>
               <meshStandardMaterial color="#fca5a5" wireframe opacity={0.5} transparent />
             </mesh>
             <Text position={[0, -2, 0]} fontSize={0.6} color="#fda4af">
               Cosmic Cycles
             </Text>
          </Float>
        </group>
      )}

      {data && activeTab === 'houses' && data.houses && (
        <group position={[0, -5, 10]}>
           <Float speed={1} rotationIntensity={0.2} floatIntensity={1}>
             {data.houses.map((house, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const r = 8;
                const pos = [Math.cos(angle) * r, Math.sin(angle * 2) * 1, Math.sin(angle) * r] as [number, number, number];
                
                return (
                  <InteractiveObject key={house.houseNumber} id={`house-${house.houseNumber}`} initialColor="#8b5cf6" onSelect={() => onPlanetClick?.(house.realmName, house.description)}>
                    <group position={pos}>
                      <mesh rotation={[0, -angle, 0]}>
                         <boxGeometry args={[1.5, 1.5, 1.5]} />
                         <CosmicMaterial wireframe transparent opacity={0.3} emissiveIntensity={1} />
                      </mesh>
                      <mesh rotation={[0, -angle, 0]} scale={0.5}>
                         <octahedronGeometry args={[1, 0]} />
                         <CosmicMaterial emissiveIntensity={2} />
                      </mesh>
                      <CosmicText position={[0, 1.5, 0]} fontSize={0.4} anchorY="bottom">
                        H{house.houseNumber}
                      </CosmicText>
                    </group>
                  </InteractiveObject>
                );
             })}
           </Float>
        </group>
      )}

      {data && activeTab === 'daily' && (
        <group position={[-10, 0, -10]}>
          <Float speed={2} rotationIntensity={2} floatIntensity={3}>
             <mesh
               onClick={(e) => { e.stopPropagation(); setActiveTab('daily'); }}
               onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
               onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
             >
               <octahedronGeometry args={[2, 0]} />
               <meshStandardMaterial color="#facc15" wireframe emissive="#fbbf24" emissiveIntensity={1.5} />
             </mesh>
             <mesh scale={[1.2, 1.2, 1.2]}>
               <icosahedronGeometry args={[2, 1]} />
               <meshStandardMaterial color="#fef08a" wireframe transparent opacity={0.2} emissive="#facc15" emissiveIntensity={0.5} />
             </mesh>
             <Text position={[0, -3, 0]} fontSize={0.8} color="#fef08a">
               Daily Illumination
             </Text>
             <pointLight color="#fef08a" intensity={2} distance={15} />
          </Float>
        </group>
      )}

      {data && activeTab === 'synthesis' && (
        <group position={[-5, 0, 20]}>
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
             <mesh
               onClick={(e) => { e.stopPropagation(); setActiveTab('synthesis'); }}
               onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
               onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
             >
               <torusKnotGeometry args={[1.5, 0.4, 64, 8]} />
               <meshStandardMaterial color="#f0abfc" wireframe emissive="#c084fc" emissiveIntensity={1} />
             </mesh>
             <mesh scale={[1.3, 1.3, 1.3]}>
               <sphereGeometry args={[1.5, 16, 16]} />
               <meshStandardMaterial color="#e879f9" wireframe transparent opacity={0.2} emissive="#f0abfc" emissiveIntensity={0.5} />
             </mesh>
             <Text position={[0, -3.5, 0]} fontSize={0.8} color="#f0abfc">
               Neural Synthesis
             </Text>
             <pointLight color="#f0abfc" intensity={2} distance={15} />
          </Float>
        </group>
      )}

      {data && activeTab === 'strategy' && (
        <group position={[0, -5, 0]}>
          <Float speed={1} rotationIntensity={0.5} floatIntensity={2}>
             <mesh 
               rotation={[-Math.PI / 2, 0, 0]}
               onClick={(e) => { e.stopPropagation(); setActiveTab('strategy'); }}
               onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
               onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
             >
               <cylinderGeometry args={[2, 0, 4, 4]} />
               <meshStandardMaterial color="#2dd4bf" wireframe emissive="#0f766e" emissiveIntensity={2} />
             </mesh>
             <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
               <cylinderGeometry args={[2, 0, 4, 4]} />
               <meshStandardMaterial color="#5eead4" wireframe transparent opacity={0.2} emissive="#14b8a6" emissiveIntensity={0.5} />
             </mesh>
             <Text position={[0, 3, 0]} fontSize={0.8} color="#99f6e4">
               Ascension Path
             </Text>
             <pointLight color="#5eead4" intensity={2} distance={15} />
             <pointLight color="#0f766e" intensity={1} position={[0, -4, 0]} distance={15} />
          </Float>
        </group>
      )}

      {data && activeTab === 'timeline' && (
        <group position={[10, 0, 20]}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
             <mesh 
               rotation={[Math.PI / 2, 0, 0]}
               onClick={(e) => { e.stopPropagation(); setActiveTab('timeline'); }}
               onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
               onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
             >
               <ringGeometry args={[2, 4, 32]} />
               <meshStandardMaterial color="#f43f5e" wireframe transparent opacity={0.5} emissive="#e11d48" emissiveIntensity={1} />
             </mesh>
             <Text position={[0, 0, 0]} fontSize={0.8} color="#fda4af" rotation={[-Math.PI/4, 0, 0]}>
               Chronos Loop
             </Text>
             <pointLight color="#f43f5e" intensity={2} distance={15} />
          </Float>
        </group>
      )}


      {/* --- POST-PROCESSING PIPELINE --- */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.002, 0.002)} />
        <Noise opacity={0.025} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};
