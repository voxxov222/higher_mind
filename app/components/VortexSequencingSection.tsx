import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  OrbitControls, 
  PerspectiveCamera, 
  Line, 
  Points, 
  PointMaterial, 
  Sparkles,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { Zap, Target, Command, Radio } from 'lucide-react';

// --- COMPONENTS ---

export const VortexFlowParticles = ({ sequence, count = 3000, speed = 1.0 }) => {
  const points = useRef<THREE.Points>(null!);
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const color = new THREE.Color(sequence === 'spirit' ? '#f59e0b' : (sequence === 'sync' ? '#c026d3' : '#38bdf8'));
    
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const r = 4 + Math.random() * 4;
      const height = (Math.random() - 0.5) * 4;
      
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = height + Math.sin(theta * 2) * 2; // Spiral effect
      pos[i * 3 + 2] = Math.sin(theta) * r;
      
      cols[i * 3] = color.r + (Math.random() - 0.5) * 0.2;
      cols[i * 3 + 1] = color.g + (Math.random() - 0.5) * 0.2;
      cols[i * 3 + 2] = color.b + (Math.random() - 0.5) * 0.2;
    }
    return [pos, cols];
  }, [count, sequence]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (points.current) {
        points.current.rotation.y = t * 0.3 * speed;
        points.current.rotation.z = Math.sin(t * 0.5) * 0.1;
        // Pulse effect
        const scale = 1 + Math.sin(t * 2) * 0.05;
        points.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={1.0}
      />
    </Points>
  );
};

export const DirectionalArrows = ({ points, active }: { points: THREE.Vector3[], active: boolean }) => {
  return (
    <group>
      {points.map((pos, i) => {
        const next = points[(i + 1) % points.length];
        const dir = new THREE.Vector3().subVectors(next, pos).normalize();
        const mid = new THREE.Vector3().addVectors(pos, next).multiplyScalar(0.5);
        
        return (
          <group key={i} position={mid}>
            <Float speed={5} rotationIntensity={0} floatIntensity={0.5}>
               <mesh rotation={new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir))}>
                 <coneGeometry args={[0.1, 0.3, 8]} />
                 <meshStandardMaterial color={active ? "#fff" : "#38bdf8"} emissive="#38bdf8" emissiveIntensity={active ? 10 : 2} />
               </mesh>
            </Float>
          </group>
        );
      })}
    </group>
  );
};

export const HolographicRing = ({ radius, speed, color = "#0ea5e9", thickness = 0.02 }: { radius: number, speed: number, color?: string, thickness?: number }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    mesh.current.rotation.z += speed * 0.5;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.2) * 0.2;
  });

  return (
    <mesh ref={mesh} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, thickness * 2, 16, 100]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={12} 
        transparent 
        opacity={0.4} 
      />
    </mesh>
  );
};

export const ScanningBeam = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 8;
    mesh.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[12, 12, 0.15, 64]} />
      <meshStandardMaterial 
        color="#0ea5e9" 
        emissive="#0ea5e9" 
        emissiveIntensity={8} 
        transparent 
        opacity={0.15} 
      />
    </mesh>
  );
};

export const CelestialBlueprintNodes = ({ numbers }: { numbers: number[] }) => {
  return (
    <group>
      {numbers.map((num, idx) => {
        const radius = 9 + idx * 0.5;
        const speed = 0.2 + (idx * 0.1);
        return <BlueprintNode key={idx} num={num} radius={radius} speed={speed} index={idx} />;
      })}
    </group>
  );
};

export const BlueprintNode = ({ num, radius, speed, index }: { num: number, radius: number, speed: number, index: number }) => {
  const group = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime * speed;
    group.current.position.x = Math.cos(time + index) * radius;
    group.current.position.z = Math.sin(time + index) * radius;
    group.current.position.y = Math.sin(state.clock.elapsedTime + index) * 1.5;
    group.current.rotation.y += 0.02;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
         <mesh>
           <octahedronGeometry args={[0.25]} />
           <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={15} />
         </mesh>
      </Float>
      <Html distanceFactor={15}>
        <div className="flex flex-col items-center gap-1 pointer-events-none group">
          <div className="w-10 h-10 rounded-full border border-sky-400/50 flex items-center justify-center bg-black/40 backdrop-blur-md relative">
            <div className="absolute inset-0 rounded-full border border-sky-400 animate-ping opacity-20" />
            <span className="text-lg font-mono font-bold text-sky-400">{num}</span>
          </div>
          <div className="h-4 w-[1px] bg-sky-400/30" />
          <div className="px-2 py-0.5 bg-sky-950/80 border border-sky-400/20 rounded text-[6px] uppercase tracking-tighter text-sky-300 font-black">
            Lattice_{num}
          </div>
        </div>
      </Html>
      <Sparkles count={10} scale={0.5} size={1} color="#38bdf8" />
    </group>
  );
};

export const ReferencePoint = ({ position, label, sublabel, color = "#38bdf8" }: { position: [number, number, number], label: string, sublabel: string, color?: string }) => {
    return (
        <group position={position}>
            <mesh>
                <ringGeometry args={[0.4, 0.45, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.22, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} side={THREE.DoubleSide} />
            </mesh>
            <Html distanceFactor={12}>
                <div className="flex flex-col items-center">
                    <div className="w-px h-16 bg-gradient-to-t from-transparent to-white" />
                    <div className="bg-black/80 backdrop-blur-md border border-white/20 p-2 rounded-lg text-center min-w-[120px]">
                        <div className="text-[10px] text-white font-bold tracking-widest uppercase">{label}</div>
                        <div className="text-[8px] text-stone-500 uppercase tracking-tighter mt-1">{sublabel}</div>
                    </div>
                </div>
            </Html>
        </group>
    );
};

export const MaterialCircuit = ({ active }: { active: boolean }) => {
  const sequence = [1, 2, 4, 8, 7, 5];
  
  const points = useMemo(() => {
    return sequence.map((num, i) => {
      const angle = (num / 9) * Math.PI * 2;
      // Hyperbolic funnel positioning: further nodes are higher and wider
      const radius = 4 + (num / 9) * 4;
      const height = (num / 9) * 6 - 3;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
    });
  }, []);

  return (
    <group scale={active ? 1.05 : 1}>
      {/* Circuit Nodes with Pulsing Effect */}
      {points.map((pos, i) => (
        <group key={i} position={pos}>
          <Float speed={3} rotationIntensity={2} floatIntensity={0.5}>
            <mesh>
              <octahedronGeometry args={[0.3]} />
              <meshStandardMaterial 
                color="#0ea5e9" 
                emissive="#0ea5e9" 
                emissiveIntensity={active ? 10 : 2} 
                transparent 
                opacity={0.9} 
              />
            </mesh>
          </Float>
          <Html distanceFactor={15}>
            <div className={`text-base font-mono font-black transition-all drop-shadow-[0_0_10px_rgba(14,165,233,0.5)] ${active ? 'text-white scale-150' : 'text-sky-400/50'}`}>
              {sequence[i]}
            </div>
          </Html>
        </group>
      ))}

      {/* Connection Tubes */}
      {points.map((pos, i) => {
        const next = points[(i + 1) % points.length];
        // Create a slight curve
        const mid = new THREE.Vector3().addVectors(pos, next).multiplyScalar(0.5);
        mid.y += 1; // Arch effect
        const curve = new THREE.CatmullRomCurve3([pos, mid, next]);
        const curvePoints = curve.getPoints(20);

        return (
          <Line 
            key={i}
            points={curvePoints} 
            color="#0ea5e9" 
            lineWidth={active ? 5 : 1.5} 
            transparent 
            opacity={active ? 0.9 : 0.2}
          />
        );
      })}

      {/* Directional Flow */}
      <DirectionalArrows points={points} active={active} />
    </group>
  );
};

export const SpiritTrinity = ({ active }: { active: boolean }) => {
  const sequence = [3, 6, 9];
  const radius = 8;
  
  const points = useMemo(() => {
    return sequence.map((num) => {
      const angle = (num / 9) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        num === 9 ? 8 : -4, // 9 is the apex, 3 and 6 are base points
        Math.sin(angle) * radius
      );
    });
  }, []);

  return (
    <group scale={active ? 1.1 : 1}>
      {points.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial 
                color="#f59e0b" 
                emissive="#f59e0b" 
                emissiveIntensity={active ? 15 : 3} 
            />
          </mesh>
          <Html distanceFactor={15}>
             <div className={`text-2xl font-mono font-black transition-all drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] ${active ? 'text-amber-400 scale-150' : 'text-amber-900/50'}`}>
                {sequence[i]}
             </div>
          </Html>
          <Sparkles count={15} scale={2} color="#f59e0b" />
        </group>
      ))}
      
      {/* Heavy Trinity Beams */}
      <Line points={[points[0], points[1]]} color="#f59e0b" lineWidth={6} transparent opacity={active ? 0.9 : 0.2} />
      <Line points={[points[1], points[2]]} color="#f59e0b" lineWidth={6} transparent opacity={active ? 0.9 : 0.2} />
      <Line points={[points[2], points[0]]} color="#f59e0b" lineWidth={6} transparent opacity={active ? 0.9 : 0.2} />
      
      {/* Central Axis Singularity */}
      <group position={[0, 0, 0]}>
          <mesh>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshStandardMaterial 
                color="#fff" 
                emissive="#fff" 
                emissiveIntensity={20} 
                transparent 
                opacity={0.1}
              />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2, 0.05, 16, 100]} />
              <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={10} />
          </mesh>
      </group>
    </group>
  );
};

export const VortexScene = ({ mode, userNumbers }: { mode: 'material' | 'spirit' | 'sync', userNumbers: number[] }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.05;
    groupRef.current.position.y = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <ScanningBeam />
      <HolographicRing radius={11} speed={0.5} thickness={0.05} />
      <HolographicRing radius={13} speed={-0.3} color="#f59e0b" thickness={0.03} />
      <MaterialCircuit active={mode === 'material' || mode === 'sync'} />
      <SpiritTrinity active={mode === 'spirit' || mode === 'sync'} />
      <VortexFlowParticles sequence={mode} speed={mode === 'spirit' ? 1.5 : 1} />
      
      {/* Three Reference Points */}
      <ReferencePoint position={[8, 2, 0]} label="Vector Alignment" sublabel="Resonance Lock: 124857" />
      <ReferencePoint position={[-8, -2, 0]} label="Trinity Apex" sublabel="Primary Harmonic: 3-6-9" color="#f59e0b" />
      <ReferencePoint position={[0, 6, 0]} label="Node Convergence" sublabel="Matter Density: Stable" color="#c026d3" />

      <CelestialBlueprintNodes numbers={userNumbers} />

      {/* Neon Flow Circulation */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[11, 0.03, 16, 120]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={15} transparent opacity={0.4} />
        </mesh>
        <Sparkles count={80} scale={12} size={2} color="#0ea5e9" speed={0.8} />
      </group>

      <gridHelper args={[30, 30, 0x333333, 0x111111]} position={[0, -5, 0]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 15, 10]} intensity={5.0} color="#38bdf8" />
      <pointLight position={[-10, 5, -10]} intensity={4.0} color="#f59e0b" />
      <pointLight position={[0, 0, 5]} intensity={3.0} color="#c026d3" />
      <directionalLight position={[0, 20, 0]} intensity={1.5} />
    </group>
  );
};

export const VortexSequencingSection = ({ cosmicData, vortexMode, setVortexMode }: { cosmicData: any, vortexMode?: 'material' | 'spirit' | 'sync', setVortexMode?: (mode: 'material' | 'spirit' | 'sync') => void }) => {
  const activeMode = vortexMode || 'sync';
  const setActiveMode = setVortexMode || (() => {});
  
  const [tuningFrequency, setTuningFrequency] = useState(432); // Solfeggio tuning
  const [isLocked, setIsLocked] = useState(false);

  const userNumbers = useMemo(() => {
    const counts = cosmicData?.archetype?.distribution || {};
    const nums = Object.entries(counts)
      .map(([num]) => parseInt(num))
      .filter(n => n > 0 && n <= 9);
    
    // Default sequence if no distribution found, ensuring something is visible
    if (nums.length === 0) {
      return [1, 2, 4, 8, 7, 5, 3, 6, 9];
    }
    return nums;
  }, [cosmicData]);

  const stats = [
    { label: 'Circulation Path', value: '1-2-4-8-7-5', color: 'text-sky-400' },
    { label: 'Oscillation Index', value: '3-6-9', color: 'text-amber-400' },
    { label: 'Resonant Ratio', value: '0.618', color: 'text-white' },
    { label: 'Entropy Shield', value: 'Active', color: 'text-emerald-400' }
  ];

  return (
    <div className="relative w-full h-[800px] bg-stone-950 rounded-3xl overflow-hidden border border-white/5 group">
      {/* 3D ENGINE */}
      <div className="absolute inset-0">
        <Canvas gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={55} />
          <OrbitControls 
            enablePan={true} 
            maxPolarAngle={Math.PI} 
            minPolarAngle={0}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={1.0}
            minDistance={5}
            maxDistance={50}
          />
          <VortexScene mode={activeMode} userNumbers={userNumbers} />
          <ambientLight intensity={0.6} />
        </Canvas>
      </div>

      {/* OVERLAY UI */}
      <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
              <h3 className="text-xl text-white font-light uppercase tracking-[0.4em]">Vortex Sequencing</h3>
            </div>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest pl-5">Non-Linear Mathematical Blueprinting</p>
          </div>

          <div className="pointer-events-auto flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
            {(['material', 'spirit', 'sync'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${
                  activeMode === mode ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-stone-500 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-4 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-72 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-sky-400" />
                  <span className="text-[10px] text-white uppercase tracking-widest font-bold">Frequency Tuning</span>
                </div>
                <span className="text-xs text-sky-400 font-mono">{tuningFrequency}Hz</span>
              </div>
              <input 
                type="range" 
                min="396" 
                max="963" 
                step="9"
                value={tuningFrequency}
                onChange={(e) => setTuningFrequency(parseInt(e.target.value))}
                className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <p className="text-[9px] text-stone-500 leading-relaxed italic">
                Calibrating decimal-tuned resonance to internal blueprint nodes. 
                Using sequence 124875 as base decimal circuit.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
               {stats.map((s, i) => (
                 <div key={i} className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-3">
                    <div className="text-[8px] text-stone-600 uppercase tracking-widest">{s.label}</div>
                    <div className={ `text-[10px] font-mono mt-1 ${s.color}` }>{s.value}</div>
                 </div>
               ))}
            </div>
          </div>

          <div className="text-right space-y-4 pointer-events-auto">
             <div className="flex flex-col items-end gap-2">
                <button 
                   onClick={() => setIsLocked(!isLocked)}
                   className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                >
                   {isLocked ? <Command size={20} className="text-emerald-400" /> : <Zap size={20} className="text-sky-400" />}
                </button>
                <div className="text-[9px] text-stone-500 uppercase tracking-tighter">Sync Lock: {isLocked ? 'STABLE' : 'UNSTABLE'}</div>
             </div>
             
             <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-4 w-64 text-left">
                <div className="flex items-center gap-2 mb-2">
                   <Target size={14} className="text-amber-400" />
                   <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Resonance Point</span>
                </div>
                <p className="text-[10px] text-stone-400 font-light leading-relaxed">
                   Current blueprint sequence identified at 4g intersection point. Neon matter circulation stabilized at 1.4c relative to source node.
                </p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Grid Pattern BG */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
    </div>
  );
};
