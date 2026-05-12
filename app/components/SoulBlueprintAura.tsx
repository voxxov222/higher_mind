import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Stars, Center } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'motion/react';
import { Activity } from 'lucide-react';

const BlueprintGrid = () => {
  return (
    <group>
      <gridHelper args={[100, 100, '#0284c7', '#0284c7']} position={[0, -2, 0]} material-opacity={0.15} material-transparent={true} />
      <gridHelper args={[100, 100, '#0284c7', '#0284c7']} position={[0, -2, 0]} rotation={[0, 0, Math.PI / 2]} material-opacity={0.05} material-transparent={true} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
        <ringGeometry args={[2, 2.05, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
        <ringGeometry args={[4, 4.02, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.1} />
      </mesh>
      {/* Decorative technical markers */}
      <mesh position={[2, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>
      <mesh position={[-2, -1.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>
      <mesh position={[0, -1.9, 2]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>
      <mesh position={[0, -1.9, -2]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>
    </group>
  );
};

const HumanForm = ({ scrollYProgress }: { scrollYProgress: number }) => {
  const group = useRef<THREE.Group>(null!);
  
  // Create a stylized humanoid form using particles
  const count = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Head
      if (i < 300) {
        const phi = Math.acos(-1 + (2 * i) / 300);
        const theta = Math.sqrt(300 * Math.PI) * phi;
        pos[i * 3] = 0.2 * Math.cos(theta) * Math.sin(phi);
        pos[i * 3 + 1] = 0.2 * Math.sin(theta) * Math.sin(phi) + 1.2;
        pos[i * 3 + 2] = 0.2 * Math.cos(phi);
      } 
      // Torso
      else if (i < 1500) {
        const h = (Math.random() - 0.5) * 1.2; // -0.6 to 0.6
        const angle = Math.random() * Math.PI * 2;
        const r = (0.3 - Math.abs(h) * 0.1) * Math.random();
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = h + 0.5;
        pos[i * 3 + 2] = Math.sin(angle) * r;
      }
      // Arms
      else if (i < 2200) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const progress = Math.random();
        const length = 0.7;
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.2;
        pos[i * 3] = side * (0.2 + progress * length * Math.cos(angle));
        pos[i * 3 + 1] = 0.9 + progress * length * Math.sin(angle);
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      }
      // Legs
      else {
        const side = Math.random() > 0.5 ? 1 : -1;
        const progress = Math.random();
        const length = 1.0;
        pos[i * 3] = side * (0.15 + (Math.random() - 0.5) * 0.05);
        pos[i * 3 + 1] = -0.1 - progress * length;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      }
    }
    return pos;
  }, []);

  const pointRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pointRef.current) {
      pointRef.current.rotation.y = t * 0.1;
      
      // Parallax and fly away based on scroll
      pointRef.current.position.z = scrollYProgress * 3;
      pointRef.current.position.y = -scrollYProgress * 2;
      pointRef.current.rotation.x = scrollYProgress * 0.5;

      const positionsArr = pointRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        // Subtle energy flow upwards
        positionsArr[idx + 1] += Math.sin(t * 0.5 + positionsArr[idx]) * 0.001;
      }
      pointRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (group.current) {
        group.current.position.z = scrollYProgress * 5;
        // Breathing effect
        const scale = 1 + Math.sin(t * 0.5) * 0.05;
        group.current.scale.set(scale, scale, scale);

        // Animate Rings
        const ring1 = group.current.getObjectByName('outerRing1');
        const ring2 = group.current.getObjectByName('outerRing2');
        if (ring1) ring1.rotation.z = t * 0.2;
        if (ring2) ring2.rotation.z = -t * 0.1;
    }
  });

  return (
    <group ref={group}>
      <points ref={pointRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#38bdf8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      
      {/* Glow centers */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
      </mesh>
      
      <group position={[0, 0.5, 0]}>
        <mesh>
          <torusGeometry args={[0.8, 0.01, 16, 100]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.01, 16, 100]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.3} />
        </mesh>
        <mesh ref={(mesh) => { if(mesh) mesh.rotation.x = Math.PI / 2; }} name="outerRing1">
          <torusGeometry args={[1.5, 0.005, 16, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
        </mesh>
        <mesh ref={(mesh) => { if(mesh) mesh.rotation.x = -Math.PI / 2; }} name="outerRing2">
          <torusGeometry args={[2.2, 0.002, 16, 100]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
};

const CameraRig = ({ scrollYProgress }: { scrollYProgress: number }) => {
  const { camera, pointer } = useThree();
  useFrame(() => {
    // Zoom effect on scroll
    const targetZ = 4 - scrollYProgress * 3;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    
    // Subtle mouse tracking
    camera.position.x += (pointer.x * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (pointer.y * 1.5 - camera.position.y) * 0.05;

    camera.lookAt(0, 0, 0);
  });
  return null;
};

export const SoulBlueprintAura = ({ scrollYProgress = 0 }: { scrollYProgress?: number }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
        <CameraRig scrollYProgress={scrollYProgress} />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Center top>
            <HumanForm scrollYProgress={scrollYProgress} />
          </Center>
        </Float>
        <BlueprintGrid />
        <Stars radius={50} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

// Blueprint Section Wrapper using framer-motion scroll
export const SoulBlueprintTab = ({ data, ResearchBox, Section }: { data: any, ResearchBox: any, Section: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end end"]
  });

  const [currentScrollY, setCurrentScrollY] = React.useState(0);
  
  React.useEffect(() => {
    return scrollYProgress.onChange((v) => setCurrentScrollY(v));
  }, [scrollYProgress]);

  return (
    <div className="absolute inset-0 -mx-6 -my-6 overflow-hidden rounded-3xl group">
      <SoulBlueprintAura scrollYProgress={currentScrollY} />
      
      {/* HUD overlays */}
      <div className="absolute top-8 left-8 flex flex-col gap-4 z-20 pointer-events-none">
         {data.torusAnalysis?.soulAge && (
           <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.5}} className="bg-sky-950/50 backdrop-blur-md border border-sky-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
             <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold block mb-1">Soul Age</span>
             <span className="text-xl text-sky-100 font-light">{data.torusAnalysis.soulAge}</span>
           </motion.div>
         )}
         {data.torusAnalysis?.primaryRay && (
           <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.7}} className="bg-sky-950/50 backdrop-blur-md border border-sky-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
             <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold block mb-1">Primary Ray</span>
             <span className="text-xl text-sky-100 font-light">{data.torusAnalysis.primaryRay}</span>
           </motion.div>
         )}
      </div>

      <div className="absolute top-8 right-8 flex flex-col gap-4 z-20 pointer-events-none items-end">
         {data.torusAnalysis?.dimensionalFrequency && (
           <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.6}} className="bg-sky-950/50 backdrop-blur-md border border-sky-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)] text-right">
             <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold block mb-1">Resonance Freq</span>
             <span className="text-xl text-sky-100 font-light">{data.torusAnalysis.dimensionalFrequency}</span>
           </motion.div>
         )}
         {data.torusAnalysis?.karmicTheme && (
           <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.8}} className="bg-sky-950/50 backdrop-blur-md border border-sky-500/30 p-4 rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.15)] text-right max-w-[200px]">
             <span className="text-[10px] text-sky-400 uppercase tracking-widest font-bold block mb-1">Karmic Theme</span>
             <span className="text-sm text-sky-100 font-light leading-snug">{data.torusAnalysis.karmicTheme}</span>
           </motion.div>
         )}
      </div>

      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto no-scrollbar pt-[80vh] pb-[40vh] px-8 scroll-smooth"
      >
         <motion.div className="space-y-48 max-w-2xl mx-auto pb-48">
             
             {/* Box 1 */}
             <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
               whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' }}
               viewport={{ once: false, amount: 0.5, margin: "-100px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="relative z-10"
             >
                <div className="absolute -inset-4 bg-sky-500/20 blur-2xl rounded-[3rem]" />
                <ResearchBox 
                  title="Torus: Body & Flow" 
                  content={data.torusAnalysis?.bodyAndFlow || 'Analyzing...' } 
                  className="bg-sky-950/40 backdrop-blur-3xl border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                >
                  <div className="text-sky-200 font-light leading-relaxed">
                    <Section title="Body & Flow" content={data.torusAnalysis?.bodyAndFlow || 'Analyzing...' } />
                  </div>
                </ResearchBox>
             </motion.div>

             {/* Box 2 */}
             <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
               whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' }}
               viewport={{ once: false, amount: 0.5, margin: "-100px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="relative z-10"
             >
                <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-[3rem]" />
                <ResearchBox 
                  title="Torus: Mind & Spirit" 
                  content={data.torusAnalysis?.mindAndSpiritual || 'Analyzing...' } 
                  className="bg-blue-950/40 backdrop-blur-3xl border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                >
                  <div className="text-blue-200 font-light leading-relaxed">
                    <Section title="Mind & Spirit" content={data.torusAnalysis?.mindAndSpiritual || 'Analyzing...' } />
                  </div>
                </ResearchBox>
             </motion.div>

             {/* Box 3 */}
             <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
               whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' }}
               viewport={{ once: false, amount: 0.5, margin: "-100px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="relative z-10"
             >
                 <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-[3rem]" />
                 <ResearchBox 
                  title="Torus: Cosmic Alignment" 
                  content={data.torusAnalysis?.cosmicAlignment || 'Analyzing...' } 
                  className="bg-cyan-950/40 backdrop-blur-3xl border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                >
                  <div className="text-cyan-200 font-light leading-relaxed">
                    <Section title="Cosmic Alignment" content={data.torusAnalysis?.cosmicAlignment || 'Analyzing...' } />
                  </div>
                </ResearchBox>
             </motion.div>

             {/* Box 4 */}
             <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
               whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' }}
               viewport={{ once: false, amount: 0.5, margin: "-100px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
               className="relative z-10"
             >
                 <div className="absolute -inset-4 bg-sky-400/20 blur-2xl rounded-[3rem]" />
                 <ResearchBox 
                  title="Torus Reading Synthesis" 
                  content={data.torusAnalysis?.overallAnalogy || 'Analyzing...' } 
                  className="bg-sky-900/40 backdrop-blur-3xl border-sky-400/30 shadow-[0_0_50px_rgba(56,189,248,0.3)]"
                >
                  <h4 className="text-sky-300 font-medium mb-4 flex items-center gap-2"><Activity className="w-5 h-5"/> Torus Synthesis</h4>
                  <p className="text-lg leading-relaxed text-sky-100/90 font-light italic border-l-2 border-sky-500/50 pl-4">{data.torusAnalysis?.overallAnalogy || 'Analyzing...'}</p>
                </ResearchBox>
             </motion.div>

         </motion.div>
      </div>
      
      {/* Scroll indicator overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none opacity-50">
         <span className="text-[10px] text-sky-300 uppercase tracking-[0.3em] font-bold mb-2">Scroll To Explore</span>
         <div className="w-px h-12 bg-gradient-to-b from-sky-400 to-transparent" />
      </div>
    </div>
  );
};

