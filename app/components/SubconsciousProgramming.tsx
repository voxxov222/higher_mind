import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Send, Loader2, Maximize2, Minimize2, Waves } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';
import { soundEngine } from '../lib/soundEffects';
import { fetchSubconsciousRewrite } from '../services/geminiService';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const FeedbackLoop3D = ({ 
  colors, 
  mantra, 
  frequency 
}: { 
  colors: string[]; 
  mantra: string; 
  frequency: number; 
}) => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color={colors[0] || '#ffffff'} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color={colors[1] || '#ffffff'} />
        
        <Float speed={frequency / 100} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[1, 64, 64]} scale={1.2}>
            <MeshDistortMaterial 
              color={colors[0] || '#a855f7'}
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              metalness={0.8}
              roughness={0.2}
              distort={0.4}
              speed={frequency / 50}
            />
          </Sphere>
        </Float>
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={[0, -2, 0]}>
          <Text
            fontSize={0.3}
            color={colors[2] || '#ffffff'}
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
            textAlign="center"
          >
            {mantra}
          </Text>
        </Float>
      </Canvas>
    </div>
  );
};

export const SubconsciousProgramming = ({ cosmicData }: { cosmicData: any }) => {
  const { processPacket } = useHigherMind();
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRewrite = async () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    soundEngine.scan(); // Play scan sound
    
    try {
      const response = await fetchSubconsciousRewrite(command, cosmicData);
      setResult(response);
      soundEngine.success();
      
      processPacket({
        thought_id: `t_subconscious_${Date.now()}`,
        thought_content: `Processed subconscious command: ${command.slice(0, 30)}...`,
        feeling_id: `f_subconscious_${Date.now()}`,
        emotion: 'Transmuted',
        frequency: response.neuralFrequency || 528,
        astral_amplitude: 0.9,
        experience_being_encoded: false,
        experience_type: 'meditation',
        synaptic_cluster_strength: 0.8,
        neural_coherence: 0.8,
        emergent_insight: 'Engaged visual feedback loop for cognitive reprogramming.',
        astral_alignment: 0.8,
        next_thought_direction: 'Absorb the visual mantra.'
      });
    } catch (error) {
      console.error(error);
      soundEngine.error();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-black p-8 overflow-y-auto' : 'pb-32'}`}>
      <div className="flex items-center justify-between border-b border-fuchsia-500/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-fuchsia-500/20 border border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
            <Brain size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-light text-white tracking-widest uppercase">Subconscious Programming</h2>
            <p className="text-sm font-light text-fuchsia-300/80 uppercase tracking-widest mt-1">Cognitive Rewrite & Visual Feedback</p>
          </div>
        </div>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-stone-400 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      <div className="bg-black/60 border border-white/10 rounded-[2rem] p-8 space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-3 font-bold">
            Cognitive Rewrite Command
          </label>
          <div className="relative">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 py-4 text-white focus:outline-none focus:border-fuchsia-500/50 transition-all text-sm tracking-wide"
              placeholder="e.g., Delete impostor syndrome and install radical self-confidence..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRewrite();
              }}
            />
            <button
              onClick={handleRewrite}
              disabled={isProcessing || !command.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl disabled:opacity-50 transition-all font-bold"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`grid ${isFullscreen ? 'grid-cols-1 md:grid-cols-2 h-[calc(100vh-250px)]' : 'grid-cols-1 md:grid-cols-2 h-[600px]'} gap-6`}
          >
            {/* Visual Feedback Loop */}
            <div className="bg-black border border-white/10 rounded-[2rem] overflow-hidden relative shadow-[0_0_50px_rgba(217,70,239,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                <Waves className="w-5 h-5 text-fuchsia-400" />
                <span className="text-xs uppercase tracking-widest text-white/70 font-mono">Feedback Loop Active • {result.neuralFrequency}Hz</span>
              </div>
              <FeedbackLoop3D 
                colors={result.colorPattern} 
                mantra={result.visualMantra} 
                frequency={result.neuralFrequency} 
              />
            </div>

            {/* Affirmations */}
            <div className="bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-[2rem] p-8 flex flex-col justify-center space-y-8 relative overflow-hidden">
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />
               <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

               <div>
                 <h3 className="text-sm font-bold uppercase tracking-widest text-fuchsia-400 mb-6 flex items-center gap-2">
                   <Sparkles className="w-4 h-4" /> Neural Affirmations
                 </h3>
                 <div className="space-y-4 relative z-10">
                   {result.affirmations.map((aff: string, index: number) => (
                     <motion.div 
                       key={index}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: index * 0.2 + 0.5 }}
                       className="p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm"
                     >
                       <p className="text-white text-lg font-light leading-relaxed tracking-wide">
                        "{aff}"
                       </p>
                     </motion.div>
                   ))}
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
