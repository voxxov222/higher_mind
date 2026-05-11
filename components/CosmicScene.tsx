import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Ring, Sparkles, Stars, Text, Trail, OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { CosmicData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Lock, Unlock, Play, Square, Palette, Zap, Move, RefreshCw, Activity, Flame, History, ArrowLeftRight, Wind, Cpu, Infinity, Magnet, Shuffle, Waves } from 'lucide-react';

type AnimationType = 'none' | 'spin' | 'bounce' | 'zigzag' | 'flash' | 'jump' | 'orbit' | 'randomPop' | 'pulse' | 'shake' | 'wobble' | 'slide' | 'vortex' | 'quantum' | 'infinity' | 'attractor' | 'chaos' | 'pendulum';

interface InteractionState {
  id: string;
  animation: AnimationType;
  color: string;
  isLocked: boolean;
  isMinimized: boolean;
}

interface CosmicSceneProps {
  data: CosmicData | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onPlanetClick?: (text: string) => void;
}

// Global state for object interactions (simplified for direct use in scene)
const objectStates: Record<string, InteractionState> = {};

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

const InteractionContext = React.createContext<{ color: string; animation: AnimationType; isLocked: boolean } | null>(null);

const InteractiveObject = ({ id, children, initialColor, onSelect }: any) => {
  const [state, setState] = useState<InteractionState>({
    id,
    animation: 'none',
    color: initialColor,
    isLocked: false,
    isMinimized: false
  });
  const [isSelected, setIsSelected] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const originalPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const hasCapturedPos = useRef(false);

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
    <InteractionContext.Provider value={{ color: state.color, animation: state.animation, isLocked: state.isLocked }}>
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
  const context = React.useContext(InteractionContext);
  return (
    <meshStandardMaterial 
      {...props} 
      color={context?.color || props.color} 
      emissive={context?.color || props.emissive} 
    />
  );
};

const CosmicText = (props: any) => {
  const context = React.useContext(InteractionContext);
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

const Planet = ({ degree, name, color, size, radius }: { degree: number, name: string, color: string, size: number, radius: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null);
  
  // Calculate position based on astrologocal degree
  // 0 degree = Aries (Usually mapped to right/East in standard charts, so angle = 0 in polar)
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
        textRef.current.position.z = ref.current.position.z + size + 0.5;
        // make text face camera softly
        // textRef.current.quaternion.copy(camera.quaternion);
      }
    }
  });

  return (
    <group>
      <Trail width={1} color={color} length={10} attenuation={(t) => t * t}>
        <mesh ref={ref} position={[x, 0, z]}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
        </mesh>
      </Trail>
      <Text
        ref={textRef}
        position={[x, size + 0.5, z]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

const Astrolabe = ({ data, onPlanetClick, setActiveTab }: { data: CosmicData, onPlanetClick: (text: string) => void, setActiveTab: (tab: any) => void }) => {
  const ref = useRef<THREE.Group>(null);
  
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

        {/* Zodiac Divisions */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          return (
            <Line
              key={i}
              points={[
                [Math.cos(angle) * 10, 0, Math.sin(angle) * 10],
                [Math.cos(angle) * 15, 0, Math.sin(angle) * 15]
              ]}
              color="#ffffff"
              opacity={0.1}
              transparent
            />
          );
        })}

        {/* Planets */}
        {data.planets.map((p, i) => {
          const radius = 11 + (i % 3) * 1.2; 
          const pos = getPos(p.degree, radius);
          const color = getPlanetColor(p.name);
          
          return (
            <InteractiveObject key={p.name} id={p.name} initialColor={color} onSelect={() => { setActiveTab('planets'); onPlanetClick(`${p.name} in House ${p.house}`); }}>
              <group position={pos}>
                <mesh>
                  <sphereGeometry args={[0.4, 32, 32]} />
                  <CosmicMaterial emissiveIntensity={1.5} />
                </mesh>
                <CosmicText position={[0, -0.8, 0]} fontSize={0.5} anchorX="center" anchorY="top">
                  {p.name}
                </CosmicText>
                <Line points={[[0,0,0], [pos[0] * -0.1, 0, pos[2] * -0.1]]} opacity={0.3} transparent />
              </group>
            </InteractiveObject>
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
                 onClick={(e) => { e.stopPropagation(); setActiveTab('planets'); onPlanetClick(`${aspect.type.toUpperCase()}: ${aspect.planet1} & ${aspect.planet2}. ${aspect.meaning}`); }}
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
                 onClick={(e) => { e.stopPropagation(); setActiveTab('planets'); onPlanetClick(`${n.name} in House ${n.house}. ${n.meaning || ''}`); }}
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

const TorusField = () => {
  const outerRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const knotRef = useRef<THREE.Mesh>(null);
  
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
      <mesh ref={outerRef}>
        <torusGeometry args={[10, 0.1, 8, 50]} />
        <meshStandardMaterial 
          color="#a855f7" 
          transparent 
          opacity={0.3} 
          emissive="#7e22ce" 
          emissiveIntensity={1} 
        />
      </mesh>

      {/* Mid Energetic Torus */}
      <mesh ref={midRef}>
        <torusGeometry args={[7, 2, 16, 50]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          wireframe 
          transparent 
          opacity={0.15} 
          emissive="#6d28d9" 
          emissiveIntensity={0.8} 
        />
      </mesh>

      {/* Inner Torus for depth */}
      <mesh ref={innerRef}>
         <torusGeometry args={[3, 0.5, 16, 50]} />
         <meshStandardMaterial color="#3b82f6" wireframe transparent opacity={0.4} emissive="#1d4ed8" emissiveIntensity={0.5} />
      </mesh>

      {/* Core Sacred Knot (represents the center of the field) */}
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <meshStandardMaterial color="#fbbf24" wireframe transparent opacity={0.6} emissive="#d97706" emissiveIntensity={1} />
      </mesh>
    </Float>
  );
}

const TreeOfLife = ({ activeSephirah }: { activeSephirah: string }) => {
  const sephiroth = [
    { id: 1, name: 'Kether', pos: [0, 8, 0] },
    { id: 2, name: 'Chokhmah', pos: [3, 6, 0] },
    { id: 3, name: 'Binah', pos: [-3, 6, 0] },
    { id: 4, name: 'Chesed', pos: [3, 2, 0] },
    { id: 5, name: 'Gevurah', pos: [-3, 2, 0] },
    { id: 6, name: 'Tiferet', pos: [0, 4, 0] },
    { id: 7, name: 'Netzach', pos: [3, -1, 0] },
    { id: 8, name: 'Hod', pos: [-3, -1, 0] },
    { id: 9, name: 'Yesod', pos: [0, 1, 0] },
    { id: 10, name: 'Malkuth', pos: [0, -4, 0] }
  ];

  const paths = [
    [1, 2], [1, 3], [1, 6],
    [2, 3], [2, 4], [2, 6],
    [3, 5], [3, 6],
    [4, 5], [4, 6], [4, 7],
    [5, 6], [5, 8],
    [6, 7], [6, 8], [6, 9],
    [7, 8], [7, 9], [7, 10],
    [8, 9], [8, 10],
    [9, 10]
  ];

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
      {paths.map((path, i) => {
        const start = sephiroth.find(s => s.id === path[0])!;
        const end = sephiroth.find(s => s.id === path[1])!;
        return (
          <Line
            key={`path-${i}`}
            points={[start.pos as [number, number, number], end.pos as [number, number, number]]}
            color="#fbbf24"
            opacity={0.3}
            transparent
            lineWidth={1}
          />
        );
      })}
      
      {sephiroth.map(s => {
        const isActive = activeSephirah.toLowerCase().includes(s.name.toLowerCase());
        const color = isActive ? "#fca5a5" : "#d8b4fe";
        const emissive = isActive ? "#ef4444" : "#c084fc";
        
        return (
          <InteractiveObject key={s.id} id={`sephirah-${s.id}`} initialColor={color}>
            <group position={s.pos as [number, number, number]}>
              <mesh>
                <sphereGeometry args={[isActive ? 0.7 : 0.4, 32, 32]} />
                <CosmicMaterial emissiveIntensity={isActive ? 2 : 1} />
              </mesh>
              <CosmicText position={[0, -0.8, 0]} fontSize={0.4} anchorY="top">
                {s.name}
              </CosmicText>
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

export const CosmicScene: React.FC<CosmicSceneProps> = ({ data, activeTab, setActiveTab, onPlanetClick }) => {
  
  const getPlanetColor = (name: string) => {
    const colors: Record<string, string> = {
      'Sun': '#fbbf24',
      'Moon': '#e2e8f0',
      'Mercury': '#94a3b8',
      'Venus': '#f472b6',
      'Mars': '#ef4444',
      'Jupiter': '#f59e0b',
      'Saturn': '#d97706',
      'Uranus': '#06b6d4',
      'Neptune': '#3b82f6',
      'Pluto': '#475569',
      'Ascendant': '#10b981'
    };
    return colors[name] || '#a855f7';
  };

  const CameraController = () => {
    const [isAutoFollowing, setIsAutoFollowing] = useState(true);
    const lastActiveTab = useRef(activeTab);

    useEffect(() => {
      if (activeTab !== lastActiveTab.current) {
        setIsAutoFollowing(true);
        lastActiveTab.current = activeTab;
      }
    }, [activeTab]);

    useFrame((state) => {
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
        targetPos.set(-5, 5, 35);
        lookAtTarget.set(-5, 0, 20);
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
      } else {
        // We've arrived, but we stay in auto-following mode until the user moves
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

  return (
    <Canvas id="cosmic-canvas" camera={{ position: [0, 15, 20], fov: 60 }} className="w-full h-full absolute inset-0 bg-black">
      <CameraController />
      <fog attach="fog" args={['#000', 5, 50]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
      
      {/* Lightened particle fields for mobile performance */}
      <Stars radius={100} depth={50} count={150} factor={4} saturation={0} fade />

      <TorusField />
      
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
            onNodeClick={(t) => onPlanetClick?.(t)} 
          />
          <pointLight color="#0ea5e9" intensity={2} distance={30} />
          <Stars radius={50} depth={20} count={100} factor={2} saturation={0} fade />
        </group>
      )}

      {data && activeTab === 'planets' && (
        <group position={[-15, 0, 0]}>
          <Astrolabe data={data} onPlanetClick={(t) => onPlanetClick?.(t)} setActiveTab={setActiveTab} />
        </group>
      )}

      {data && activeTab === 'numbers' && (
        <group position={[15, 5, 0]}>
          <Float speed={3} rotationIntensity={0.5} floatIntensity={2}>
             <InteractiveObject id="life-path" initialColor="#60a5fa" onSelect={() => onPlanetClick?.(`Life path: ${data.numerology.lifePath}`)}>
               <CosmicText position={[0, 3, 2]} fontSize={2} material-toneMapped={false}>
                 {data.numerology.lifePath}
               </CosmicText>
             </InteractiveObject>
             <InteractiveObject id="expression" initialColor="#c084fc" onSelect={() => onPlanetClick?.(`Expression: ${data.numerology.expression}`)}>
               <CosmicText position={[-3, 1, 0]} fontSize={1.5}>
                 {data.numerology.expression}
               </CosmicText>
             </InteractiveObject>
             <InteractiveObject id="soul-urge" initialColor="#a78bfa" onSelect={() => onPlanetClick?.(`Soul urge: ${data.numerology.soulUrge}`)}>
               <CosmicText position={[3, 2, -1]} fontSize={1.2}>
                 {data.numerology.soulUrge}
               </CosmicText>
             </InteractiveObject>
             <InteractiveObject id="reduction" initialColor="#e879f9" onSelect={() => onPlanetClick?.(`Reduction: ${data.gematria.reduction}`)}>
               <CosmicText position={[0, -1, 3]} fontSize={1.8} fillOpacity={0.6}>
                 {data.gematria.reduction}
               </CosmicText>
             </InteractiveObject>
          </Float>
        </group>
      )}

      {data && activeTab === 'kabbalah' && (
        <group position={[0, -2, -15]} rotation={[0, Math.PI, 0]}>
           <TreeOfLife activeSephirah={data.kabbalah.sephirah} />
           <Text 
             position={[0, -6, 0]} 
             fontSize={0.8} 
             color="white" 
             anchorY="top"
             onClick={(e) => { e.stopPropagation(); setActiveTab('kabbalah'); onPlanetClick?.(`Kabbalah sephirah is ${data.kabbalah.sephirah}`); }}
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
                  <InteractiveObject key={house.houseNumber} id={`house-${house.houseNumber}`} initialColor="#8b5cf6" onSelect={() => onPlanetClick?.(`${house.realmName}: ${house.description}`)}>
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


      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.002, 0.002)} />
        <Noise opacity={0.025} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};
