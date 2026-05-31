import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Trail, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Compass, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';

const AnimatedTrail = ({ startPos, endPos }: { startPos: THREE.Vector3, endPos: THREE.Vector3 }) => {
  const ref = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    if (ref.current) {
      // Interpolate position back and forth
      const t = (Math.sin(time.current * 0.8) + 1) / 2; // 0 to 1 back and forth
      ref.current.position.lerpVectors(startPos, endPos, t);
    }
  });

  return (
    <Trail
      local={false}
      width={2.5}
      length={12}
      color={new THREE.Color('#c084fc')}
      attenuation={(t) => t * t}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#e9d5ff" />
      </mesh>
    </Trail>
  );
};

const SoulPathScene = ({ northNode, southNode }: { northNode: any, southNode: any }) => {
  const startPos = new THREE.Vector3(-12, 0, 0);
  const endPos = new THREE.Vector3(12, 0, 0);

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* South Node (Past) */}
      <group position={startPos}>
        <Sphere args={[2, 32, 32]}>
          <meshStandardMaterial color="#64748b" wireframe />
        </Sphere>
        <Sphere args={[1.9, 32, 32]}>
          <meshBasicMaterial color="#334155" transparent opacity={0.5} />
        </Sphere>
        <Text position={[0, -3.5, 0]} fontSize={0.8} color="#94a3b8" anchorX="center" anchorY="middle">
          South Node (Past)
        </Text>
        <Text position={[0, -4.8, 0]} fontSize={0.6} color="#64748b" anchorX="center" anchorY="middle">
          {southNode?.sign || 'Unknown'}
        </Text>
      </group>

      {/* North Node (Future) */}
      <group position={endPos}>
        <Sphere args={[2.5, 32, 32]}>
          <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.8} wireframe />
        </Sphere>
        <pointLight color="#a855f7" intensity={2} distance={10} />
        <Text position={[0, -4, 0]} fontSize={0.8} color="#d8b4fe" anchorX="center" anchorY="middle">
          North Node (Future)
        </Text>
        <Text position={[0, -5.3, 0]} fontSize={0.6} color="#a855f7" anchorX="center" anchorY="middle">
          {northNode?.sign || 'Unknown'}
        </Text>
      </group>

      {/* Connecting Trail representing the soul's journey */}
      <AnimatedTrail startPos={startPos} endPos={endPos} />
      
      {/* Visual connection line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...startPos.toArray(), ...endPos.toArray()])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial {...{ color: "#475569", transparent: true, opacity: 0.3, dashed: true } as any} />
      </line>

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </group>
  );
};

export const SoulPathSection = ({ data }: { data: any }) => {
  if (!data) return null;

  const nodesList = Array.isArray(data.nodes) ? data.nodes : Object.values(data.nodes || {});
  const northNode = nodesList.find((n: any) => n?.name?.toLowerCase().includes('north'));
  const southNode = nodesList.find((n: any) => n?.name?.toLowerCase().includes('south'));
  const { saveToChat, cosmicData, saveToVault } = useHigherMind();

  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleSaveToChat = () => {
    saveToChat(
      'Karmic Soul Path Analysis',
      `SOUTH NODE (${southNode?.sign || 'Unknown'}): ${southNode?.interpretation || 'Inherent strengths from past incarnations.'}\n\nNORTH NODE (${northNode?.sign || 'Unknown'}): ${northNode?.interpretation || 'The path of spiritual growth.'}${data.akashic ? '\n\nAkashic Echoes: ' + data.akashic.pastLifeThemes + '\n\nSoul Gifts: ' + data.akashic.soulGifts : ''}`,
      'experience'
    );
  };

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
       const response = await fetch('/api/gemini', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
               action: 'generateSoulPathReport',
               payload: { cosmicData }
           })
       });
       const result = await response.json();
       if (result && !result.error) {
           setReport(result);
           saveToChat(
             'Soul Path Synthesis Report Logged',
             `New Soul Path Report Generated: ${result.title}. Insights: ${result.kabbalisticInsights}.`,
             'experience'
           );
           if (saveToVault) {
             saveToVault(
               `Soul Path: ${result.title}`,
               `Deep Synthesis Report:\n\n${result.narrative}\n\nKabbalistic Resonance:\n${result.kabbalisticInsights}\n\nActionable Guidance:\n${result.actionableGuidance}`,
               'synthesis',
               ['soul_path', 'kabbalah', 'deep_report']
             );
           }
       }
    } catch (e) {
       console.error(e);
    }
    setLoadingReport(false);
  };

  return (
    <div className="flex flex-col h-[85vh] bg-stone-950 rounded-[3rem] border border-white/10 overflow-hidden relative shadow-2xl">
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <h2 className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-600 tracking-[0.2em] mb-1 flex items-center gap-3">
          <Compass className="text-purple-500 w-6 h-6" />
          SOUL PATH
        </h2>
        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Karmic Journey & Destiny Arc</p>
      </div>

      <div className="absolute top-8 right-8 z-20 flex gap-4">
        <button
          onClick={handleGenerateReport}
          disabled={loadingReport}
          className="bg-black/60 backdrop-blur-md border border-fuchsia-500/30 hover:border-fuchsia-500/60 px-4 py-2 rounded-full text-fuchsia-400 hover:text-fuchsia-300 transition-all flex items-center gap-2 shadow-lg"
        >
          {loadingReport ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span className="text-xs uppercase tracking-widest font-bold whitespace-nowrap">{loadingReport ? "Synthesizing..." : "Generate Deep Report"}</span>
        </button>

        <button
          onClick={handleSaveToChat}
          className="bg-black/60 backdrop-blur-md border border-purple-500/30 hover:border-purple-500/60 p-3 rounded-full text-purple-400 hover:text-purple-300 transition-all flex items-center gap-2 group shadow-lg"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Save to Chat</span>
          <MessageCircle size={20} />
        </button>
      </div>

      {report && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-full max-w-4xl max-h-full overflow-y-auto bg-stone-900 border border-purple-500/30 p-8 rounded-3xl shadow-2xl"
           >
              <div className="flex justify-between items-start mb-6 border-b border-purple-500/20 pb-4">
                 <h2 className="text-2xl font-serif text-purple-300">{report.title}</h2>
                 <button onClick={() => setReport(null)} className="text-stone-400 hover:text-white p-2">Close</button>
              </div>
              
              <div className="space-y-6 text-stone-300 font-serif leading-relaxed">
                 <div>
                    <h3 className="text-xs font-mono text-fuchsia-400 uppercase tracking-widest mb-2">Narrative Synthesis</h3>
                    <p className="whitespace-pre-wrap">{report.narrative}</p>
                 </div>
                 
                 <div className="grid md:grid-cols-2 gap-6 pt-6">
                     <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800">
                         <h3 className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-2">Kabbalistic Insights</h3>
                         <p className="text-sm">{report.kabbalisticInsights}</p>
                     </div>
                     <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800">
                         <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Actionable Guidance</h3>
                         <p className="text-sm">{report.actionableGuidance}</p>
                     </div>
                 </div>
              </div>
           </motion.div>
        </div>
      )}

      {/* 3D Visualizer */}
      <div className="h-[55%] w-full relative z-0 cursor-move border-b border-white/5">
        <Canvas camera={{ position: [0, 5, 25], fov: 60 }}>
          <SoulPathScene northNode={northNode} southNode={southNode} />
        </Canvas>
      </div>

      {/* Info Panels */}
      <div className="flex-1 p-8 bg-black/60 backdrop-blur-md relative z-10 overflow-y-auto scrollbar-thin">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-4 items-center">
           
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4 p-6 bg-stone-900/40 rounded-3xl border border-stone-800 h-full">
             <div className="flex items-center gap-4 border-b border-stone-800 pb-4 mb-4">
               <div className="w-12 h-12 rounded-full border border-stone-600 flex items-center justify-center bg-stone-800 text-stone-300 text-sm tracking-widest shadow-inner">
                 SN
               </div>
               <div>
                  <h3 className="text-xl text-stone-200 font-light">South Node in {southNode?.sign || 'Unknown'}</h3>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Past Life & Comfort Zone</p>
               </div>
             </div>
             <p className="text-sm font-light text-stone-400 leading-relaxed italic">
               "{southNode?.interpretation || 'Inherent strengths from past incarnations. This represents the comfort zone you are meant to evolve beyond.'}"
             </p>
             {data.akashic?.pastLifeThemes && (
               <div className="mt-6 p-4 bg-stone-950 rounded-2xl border border-stone-800/80">
                 <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-1 font-bold">Akashic Echoes</p>
                 <p className="text-xs text-stone-400 leading-relaxed font-light">{data.akashic.pastLifeThemes}</p>
               </div>
             )}
           </motion.div>

           <div className="hidden md:flex flex-col items-center justify-center h-full px-4">
             <motion.div
               animate={{ x: [0, 10, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
             >
                <ArrowRight className="w-8 h-8 text-purple-600 opacity-50" />
             </motion.div>
           </div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-4 p-6 bg-purple-950/20 rounded-3xl border border-purple-500/20 h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-20"><Sparkles className="w-24 h-24 text-purple-400" /></div>
             
             <div className="flex items-center gap-4 border-b border-purple-900/50 pb-4 mb-4 relative z-10">
               <div className="w-12 h-12 rounded-full border border-purple-500/50 flex items-center justify-center bg-purple-900/40 text-purple-300 text-sm tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                 NN
               </div>
               <div>
                  <h3 className="text-xl text-purple-200 font-light">North Node in {northNode?.sign || 'Unknown'}</h3>
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Future Potential & Destiny</p>
               </div>
             </div>
             <p className="text-sm font-light text-purple-200/80 leading-relaxed italic relative z-10">
               "{northNode?.interpretation || 'The path of greatest spiritual growth and ultimate fulfillment in this lifetime. Lean into this energy.'}"
             </p>
             {data.akashic?.soulGifts && (
               <div className="mt-6 p-4 bg-purple-950/50 rounded-2xl border border-purple-500/30 relative z-10 shadow-inner">
                 <p className="text-[10px] uppercase tracking-widest text-purple-400 mb-1 font-bold">Emerging Soul Gifts</p>
                 <p className="text-xs text-purple-300/80 leading-relaxed font-light">{data.akashic.soulGifts}</p>
               </div>
             )}
           </motion.div>

        </div>
      </div>
    </div>
  );
};
