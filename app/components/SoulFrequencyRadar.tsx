import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'motion/react';
import { Mic, MicOff } from 'lucide-react';
import * as THREE from 'three';
import { HUDPanel } from './HUDPanel';

const CHAKRA_MAP = [
  { hz: 174, name: 'ROOT', color: '#f43f5e' },
  { hz: 285, name: 'SACRAL', color: '#f97316' },
  { hz: 396, name: 'SOLAR PLEXUS', color: '#eab308' },
  { hz: 417, name: 'HEART', color: '#10b981' },
  { hz: 528, name: 'HEART (MIRACLE)', color: '#34d399' },
  { hz: 639, name: 'THROAT', color: '#06b6d4' },
  { hz: 741, name: 'THIRD EYE', color: '#8b5cf6' },
  { hz: 852, name: 'CROWN', color: '#c084fc' },
  { hz: 963, name: 'CROWN (DIVINE)', color: '#d8b4fe' }
];

const getNearestSolfeggio = (hz: number) => {
    let nearest = CHAKRA_MAP[0];
    for (const c of CHAKRA_MAP) {
        if (Math.abs(c.hz - hz) < Math.abs(nearest.hz - hz)) nearest = c;
    }
    return nearest;
};

const RadarCore = ({ frequency, intensity }: { frequency: number, intensity: number }) => {
    const materialRef = useRef<any>(null);
    const chakra = getNearestSolfeggio(frequency);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.2 + (intensity * 0.6), 0.1);
            materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, 1 + (intensity * 4), 0.1);
        }
    });

    return (
        <group>
            {/* Inner Core */}
            <Sphere args={[1, 64, 64]}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color={chakra.color}
                    emissive={chakra.color}
                    emissiveIntensity={0.5 + intensity}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
            
            {/* Outer Rings */}
            <mesh rotation-x={Math.PI / 2}>
                <torusGeometry args={[1.5, 0.01, 16, 100]} />
                <meshBasicMaterial color={chakra.color} transparent opacity={0.3} />
            </mesh>
            <mesh rotation-x={Math.PI / 2} rotation-y={Math.PI / 3}>
                <torusGeometry args={[2, 0.01, 16, 100]} />
                <meshBasicMaterial color={chakra.color} transparent opacity={0.2} />
            </mesh>
            <mesh rotation-x={Math.PI / 2} rotation-y={-Math.PI / 3}>
                <torusGeometry args={[2.5, 0.01, 16, 100]} />
                <meshBasicMaterial color={chakra.color} transparent opacity={0.1} />
            </mesh>
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color={chakra.color} />
        </group>
    );
};

export const SoulFrequencyRadar = () => {
    const [isListening, setIsListening] = useState(false);
    const [frequency, setFrequency] = useState(528);
    const [intensity, setIntensity] = useState(0);
    
    // Audio analysis refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number>();

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyzerRef.current = audioContextRef.current.createAnalyser();
            
            analyzerRef.current.fftSize = 2048;
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyzerRef.current);
            
            setIsListening(true);
            analyzeAudio();
        } catch (err) {
            console.error("Mic access denied", err);
        }
    };

    const stopListening = () => {
        if (sourceRef.current) sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        
        setIsListening(false);
        setIntensity(0);
    };

    const analyzeAudio = () => {
        if (!analyzerRef.current) return;
        
        const bufferLength = analyzerRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const update = () => {
            if (!analyzerRef.current) return;
            analyzerRef.current.getByteFrequencyData(dataArray);
            
            // Calculate avg intensity
            let sum = 0;
            let maxIndex = 0;
            let maxValue = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
                if (dataArray[i] > maxValue) {
                    maxValue = dataArray[i];
                    maxIndex = i;
                }
            }
            
            const avgIntensity = sum / bufferLength;
            const normalizedIntensity = Math.min(1, avgIntensity / 100);
            
            // Map dominant frequency index to approximate hz
            // Frequency = index * sampleRate / fftSize
            const sampleRate = audioContextRef.current?.sampleRate || 44100;
            const dominantFreq = (maxIndex * sampleRate) / analyzerRef.current.fftSize;
            
            if (normalizedIntensity > 0.05) {
                setIntensity(normalizedIntensity);
                
                // Snap dominant frequency to nearest Solfeggio if it's within range, otherwise use raw
                if (dominantFreq >= 100 && dominantFreq <= 1000) {
                     setFrequency(dominantFreq);
                }
            } else {
                setIntensity(Math.max(0, intensity - 0.05)); // decay
            }
            
            animationFrameRef.current = requestAnimationFrame(update);
        };
        
        update();
    };

    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    const roundedFreq = Math.round(frequency);
    const activeChakra = getNearestSolfeggio(roundedFreq);

    return (
        <HUDPanel title="SOUL FREQUENCY RADAR" idLabel="SYS.RADAR.01" solfeggioFreq={activeChakra.hz}>
            <div className="flex flex-col h-[400px]">
                {/* 3D Visualizer */}
                <div className="flex-1 rounded-lg overflow-hidden border border-white/5 relative bg-black/60 shadow-inner">
                    <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={isListening ? stopListening : startListening}
                            className={`px-4 py-2 rounded-full font-orbitron text-xs flex items-center gap-2 border transition-all shadow-lg ${
                                isListening 
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-rose-500/20' 
                                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-cyan-500/20'
                            }`}
                        >
                            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                            {isListening ? "DEACTIVATE SCANNER" : "ACTIVATE SCANNER"}
                        </motion.button>
                    </div>

                    <div className="absolute top-4 left-4 z-10">
                        <div className="font-share text-[10px] text-white/50 tracking-widest mb-1">DOMINANT FREQUENCY</div>
                        <div className="font-orbitron font-bold text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ color: activeChakra.color }}>
                            {roundedFreq} <span className="text-sm">Hz</span>
                        </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 z-10 text-right">
                        <div className="font-share text-[10px] text-white/50 tracking-widest mb-1">NEAREST RESONANCE</div>
                        <div className="font-orbitron font-bold text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ color: activeChakra.color }}>
                            {activeChakra.name}
                        </div>
                    </div>

                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <RadarCore frequency={roundedFreq} intensity={intensity} />
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2 + (intensity * 10)} />
                    </Canvas>
                </div>

                {/* Telemetry Footer */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="bg-black/40 border border-white/5 rounded p-2 text-center">
                        <div className="font-share text-[9px] text-white/40 uppercase tracking-widest">Alignment Match</div>
                        <div className="font-orbitron text-sm text-hud-cyan mt-1">
                            {Math.max(0, 100 - Math.abs(roundedFreq - activeChakra.hz)).toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded p-2 text-center">
                        <div className="font-share text-[9px] text-white/40 uppercase tracking-widest">Energy Amplitude</div>
                        <div className="font-orbitron text-sm text-hud-violet mt-1">
                            {(intensity * 100).toFixed(0)}%
                        </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded p-2 text-center">
                        <div className="font-share text-[9px] text-white/40 uppercase tracking-widest">Solfeggio Anchor</div>
                        <div className="font-orbitron text-sm mt-1" style={{ color: activeChakra.color }}>
                            {activeChakra.hz} Hz
                        </div>
                    </div>
                </div>
            </div>
        </HUDPanel>
    );
};
