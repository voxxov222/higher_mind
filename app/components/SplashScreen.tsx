import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const ParticleSphere = () => {
    const pointsRef = useRef<THREE.Points>(null);
    
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.2;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
        }
    });

    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const radius = 2;
    for(let i = 0; i < particlesCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;

        // Colors: mostly cyan, some violet
        const isViolet = Math.random() > 0.8;
        colors[i*3] = isViolet ? 0.54 : 0.0;    // r: 139 / 255 or 0
        colors[i*3+1] = isViolet ? 0.36 : 0.83; // g: 92 / 255 or 212/255
        colors[i*3+2] = isViolet ? 0.96 : 1.0;  // b: 246 / 255 or 255/255
    }

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particlesCount}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                vertexColors
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("INITIALIZING KERNEL...");
    
    useEffect(() => {
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 8) + 2;
            if (currentProgress > 100) currentProgress = 100;
            
            setProgress(currentProgress);
            
            if (currentProgress < 20) setStatusText("LOADING STARK A.O.S CONSTRUCT...");
            else if (currentProgress < 40) setStatusText("ESTABLISHING NEURAL SYNAPSES...");
            else if (currentProgress < 60) setStatusText("CALIBRATING SOLFEGGIO RESONANCE...");
            else if (currentProgress < 85) setStatusText("DECRYPTING AKASHIC RECORDS...");
            else setStatusText("CONSCIOUSNESS MATRIX: ONLINE");
            
            if (currentProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => onComplete(), 800);
            }
        }, 150);
        
        return () => clearInterval(interval);
    }, [onComplete]);

    const hexString = (num: number) => "0x" + Math.floor((num / 100) * 255).toString(16).toUpperCase().padStart(2, '0');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px) brightness(2)" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="fixed inset-0 z-[9999] bg-[#030508] font-orbitron text-white overflow-hidden flex flex-col items-center justify-center pointer-events-auto"
            >
                {/* Scan Line Overlay */}
                <div className="absolute inset-0 pointer-events-none z-50">
                    <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-60 animate-scanline shadow-[0_0_15px_#00d4ff]"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InRyYW5zcGFyZW50Ii8+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>
                </div>

                {/* 3D Particle Sphere Background */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <Canvas>
                        <ambientLight intensity={0.5} />
                        <ParticleSphere />
                        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
                    </Canvas>
                </div>

                {/* Main Boot Terminal */}
                <div className="relative z-10 w-full max-w-lg border border-[#00d4ff]/20 bg-black/50 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,212,255,0.1)]">
                    
                    {/* HUD Corner Decorators */}
                    <div className={"absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg border-[#00d4ff]/70"} />
                    <div className={"absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg border-[#00d4ff]/70"} />
                    <div className={"absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg border-[#00d4ff]/70"} />
                    <div className={"absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg border-[#00d4ff]/70"} />

                    <div className="font-share text-[10px] tracking-[0.4em] text-[#00d4ff]/60 uppercase mb-4 animate-pulse">
                        STARK INDUSTRIES // HIGHER MIND OS
                    </div>
                    
                    <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_#00d4ff] mb-4 flex items-center gap-4">
                        <span className="font-share text-xl text-[#00d4ff]/50 mr-2">{hexString(progress)}</span>
                        {progress}%
                    </div>
                    
                    <div className="font-share text-[11px] tracking-[0.2em] text-[#00d4ff] uppercase mb-8 h-4 shadow-[#00d4ff]/50 drop-shadow-[0_0_10px_#00d4ff]">
                        {statusText}
                    </div>

                    <div className="w-full h-1 bg-[#00d4ff]/10 rounded-full overflow-hidden mb-6 relative">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] shadow-[0_0_15px_#00d4ff] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    
                    <div className="font-share text-[9px] tracking-[0.3em] text-[#00d4ff]/40">
                        HIGHER ✦ MIND ✦ CORTEX
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
