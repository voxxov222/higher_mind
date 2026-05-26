import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Sparkles, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { calculateAllCiphers, calculateGematriaValue, reduceNumber } from '../utils/gematria';
import { soundEngine } from '../lib/soundEffects';

interface Gematria3DVisualizerProps {
  onNodeClick?: (title: string, content: string) => void;
}

export const Gematria3DVisualizer: React.FC<Gematria3DVisualizerProps> = ({ onNodeClick }) => {
  const [inputText, setInputText] = useState('HIGHER MIND');
  const groupRef = useRef<THREE.Group>(null);
  const portalRef = useRef<THREE.Mesh>(null);
  const [hoveredLetter, setHoveredLetter] = useState<{
    char: string;
    index: number;
    val: number;
    coords: [number, number, number];
  } | null>(null);

  // Synchronize input text with the text entered in Gematria Calculator section
  useEffect(() => {
    const handleInputChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setInputText(detail && detail.trim() !== '' ? detail : 'HIGHER MIND');
    };

    window.addEventListener('gematria_input_change', handleInputChange);
    return () => {
      window.removeEventListener('gematria_input_change', handleInputChange);
    };
  }, []);

  // Compute ciphers for tooltip information
  const cipherResults = useMemo(() => {
    const textToDecode = inputText || 'HIGHER MIND';
    const all = calculateAllCiphers(textToDecode);
    return all.filter(r => ['Ordinal', 'Reduction', 'Reverse', 'Reverse Reduction', 'Satanic', 'Jewish'].includes(r.cipher));
  }, [inputText]);

  // Compute total values
  const totalOrdinalValue = useMemo(() => {
    const cleaned = (inputText || 'HIGHER MIND').toUpperCase().replace(/[^A-Z]/g, '');
    let sum = 0;
    for (let i = 0; i < cleaned.length; i++) {
      sum += cleaned.charCodeAt(i) - 64; // A=1, B=2, etc.
    }
    return sum;
  }, [inputText]);

  // Characters to render in space
  const charNodes = useMemo(() => {
    const cleaned = (inputText || 'HIGHER MIND').toUpperCase();
    const length = cleaned.length;
    
    return cleaned.split('').map((char, index) => {
      // Calculate alphanumeric characteristics
      const asciiVal = char.charCodeAt(0);
      const isLetter = asciiVal >= 65 && asciiVal <= 90;
      const ordinalValue = isLetter ? asciiVal - 64 : (asciiVal >= 48 && asciiVal <= 57 ? asciiVal - 48 : 0);
      const reductionValue = isLetter ? ((ordinalValue - 1) % 9) + 1 : 0;

      // Coordinate systems: Compute mathematical coordinates relative to the Gematria Node center
      const angle = (index / Math.max(1, length)) * Math.PI * 2;
      
      // Radial distance mapped to the letter's ordinal rank (A=1 [narrow], Z=26 [broad])
      const r = 4.5 + (ordinalValue * 0.22);
      
      // X and Z coordinates on the flat orbital grid
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // Height Y corresponds to the spiritual Single-Digit Reduction (mapped into physical height space)
      const y = (reductionValue - 5) * 1.1 + (Math.sin(index + asciiVal) * 0.4);

      return {
        char,
        index,
        ordinalValue,
        reductionValue,
        x,
        y,
        z,
        color: isLetter ? `hsl(${(ordinalValue / 26) * 280 + 190}, 85%, 65%)` : '#cbd5e1'
      };
    });
  }, [inputText]);

  // Rotation and animations
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle orbit rotation for the ring constellation
      groupRef.current.rotation.y = t * 0.12;
    }
    if (portalRef.current) {
      // Inner portal counter-rotates and waves
      portalRef.current.rotation.y = -t * 0.25;
      portalRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
      
      const bounce = 1 + Math.sin(t * 1.5) * 0.04;
      portalRef.current.scale.set(bounce, bounce, bounce);
    }
  });

  const handleNodeClick = (char: string, val: number, idx: number) => {
    if (soundEngine && typeof (soundEngine as any).toneClick === 'function') {
      (soundEngine as any).toneClick();
    } else if (soundEngine && typeof (soundEngine as any).neuralClick === 'function') {
      (soundEngine as any).neuralClick();
    }
    
    if (onNodeClick) {
      onNodeClick(
        `Alphanumeric Node: "${char}"`,
        `This coordinate corresponds to index position ${idx + 1} of "${inputText}". \n\n` +
        `• Ordinal Mapping (A=1, Z=26): ${val}\n` +
        `• Kabbalistic Mathematical Reduction: ${((val - 1) % 9) + 1}\n` +
        `• Resonance Node: ${val * 11} Hz Sinusoidal harmonic modulation.`
      );
    }
  };

  return (
    <group>
      {/* 1. Coordinate Grid System Base */}
      <group position={[0, -5, 0]}>
        {/* XY Spatial Flat Grid */}
        <gridHelper args={[24, 12, '#3b82f6', '#1e293b']} position={[0, 0, 0]} {...{ opacity: 0.15, transparent: true } as any} />
      </group>

      {/* Coordinate Axes Lines */}
      {/* X / Ordinal Axis */}
      <Line 
        points={[[-12, -5, 0], [12, -5, 0]]} 
        color="#3b82f6" 
        lineWidth={0.5} 
        transparent 
        opacity={0.3} 
      />
      {/* Z / Harmonic Scale Axis */}
      <Line 
        points={[[0, -5, -12], [0, -5, 12]]} 
        color="#8b5cf6" 
        lineWidth={0.5} 
        transparent 
        opacity={0.3} 
      />
      {/* Y / Dimensional Reduction Vertical Axis */}
      <Line 
        points={[[0, -5, 0], [0, 8, 0]]} 
        color="#e879f9" 
        lineWidth={0.5} 
        transparent 
        opacity={0.4} 
      />

      {/* Axis Space Labels */}
      <Text position={[13, -5, 0]} fontSize={0.35} color="#60a5fa">
        +X ORDINAL
      </Text>
      <Text position={[-13, -5, 0]} fontSize={0.35} color="#60a5fa">
        -X ORDINAL
      </Text>
      <Text position={[0, -5, 13]} fontSize={0.35} color="#a78bfa">
        +Z PHASE
      </Text>
      <Text position={[0, 8.5, 0]} fontSize={0.35} color="#f472b6">
        +Y REDUCTION
      </Text>

      {/* 2. Central Mathematical Portal / Core Sphere */}
      <group position={[0, 0, 0]}>
        {/* Wireframe structural shell */}
        <mesh ref={portalRef}>
          <icosahedronGeometry args={[2.0, 2]} />
          <meshBasicMaterial 
            color="#ec4899" 
            wireframe 
            transparent 
            opacity={0.12} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Interactive core collider */}
        <mesh 
          onClick={() => {
            soundEngine.scan();
            if (onNodeClick) {
              onNodeClick(
                `Matrix Kernel: "${inputText}"`,
                `Consolidated Gematria matrix coordinate center for "${inputText}".\n\n` +
                `Active Alphanumeric Ciphers:\n` +
                cipherResults.map(c => `• ${c.cipher}: ${c.value} (Reduction: ${reduceNumber(c.value)})`).join('\n')
              );
            }
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshStandardMaterial 
            color="#d946ef" 
            emissive="#a21caf" 
            emissiveIntensity={1.2} 
            transparent 
            opacity={0.25} 
          />
        </mesh>

        {/* Total Gematria Sum Overlay Number inside Core */}
        <Text 
          position={[0, 0, 0]} 
          fontSize={1.1} 
          color="#ffffff" 
          anchorX="center" 
          anchorY="middle"
        >
          {totalOrdinalValue}
        </Text>

        <Text 
          position={[0, -1.8, 0]} 
          fontSize={0.26} 
          color="#f472b6" 
          anchorX="center"
        >
          SUM INDEX
        </Text>
      </group>

      {/* 3. Ring Constellation of Gematria Characters */}
      <group ref={groupRef}>
        {charNodes.map((node, i) => {
          const isHovered = hoveredLetter?.char === node.char && hoveredLetter?.index === i;
          
          return (
            <group key={`node-${i}`} position={[node.x, node.y, node.z]}>
              {/* Particle glow ring under node */}
              <mesh>
                <ringGeometry args={[0.3, 0.45, 12]} />
                <meshBasicMaterial 
                  color={node.color} 
                  side={THREE.DoubleSide} 
                  transparent 
                  opacity={0.4} 
                  blending={THREE.AdditiveBlending}
                />
              </mesh>

              {/* Central node spark sphere */}
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.char, node.ordinalValue, i);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                  setHoveredLetter({
                    char: node.char,
                    index: i,
                    val: node.ordinalValue,
                    coords: [node.x, node.y, node.z]
                  });
                }}
                onPointerOut={(e) => {
                  document.body.style.cursor = 'auto';
                  setHoveredLetter(null);
                }}
              >
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshStandardMaterial 
                  color={node.color} 
                  emissive={node.color} 
                  emissiveIntensity={isHovered ? 3.0 : 1.0} 
                  transparent 
                  opacity={0.9} 
                />
              </mesh>

              {/* Letter display floating above node */}
              <Text
                position={[0, 0.6, 0]}
                fontSize={0.55}
                color={node.color}
                anchorX="center"
                anchorY="middle"
              >
                {node.char}
              </Text>

              {/* Letter numerical index underneath */}
              <Text
                position={[0, -0.45, 0]}
                fontSize={0.22}
                color="#64748b"
                anchorX="center"
                anchorY="middle"
              >
                {node.ordinalValue}
              </Text>

              {/* Connecting glowing web lines from node back to core */}
              <Line 
                points={[[0, 0, 0], [-node.x, -node.y, -node.z]]} 
                color={node.color} 
                lineWidth={0.8} 
                transparent 
                opacity={isHovered ? 0.45 : 0.08} 
              />
            </group>
          );
        })}

        {/* 4. Sequenced Constellation Filament Line Map */}
        {charNodes.length > 1 && (
          <Line
            key={`filament-${inputText}-${charNodes.length}`}
            points={charNodes.map(n => [n.x, n.y, n.z])}
            color="#fbbf24"
            lineWidth={1.2}
            transparent
            opacity={0.35}
            // Loop the last node back to first
          />
        )}
        
        {/* Complete loop closure filament line */}
        {charNodes.length > 2 && (
          <Line
            key={`closure-${inputText}-${charNodes.length}`}
            points={[
              [charNodes[charNodes.length - 1].x, charNodes[charNodes.length - 1].y, charNodes[charNodes.length - 1].z],
              [charNodes[0].x, charNodes[0].y, charNodes[0].z]
            ]}
            color="#fbbf24"
            lineWidth={1.2}
            transparent
            opacity={0.35}
          />
        )}
      </group>

      {/* Floating HTML Hover HUD */}
      {hoveredLetter && (
        <Html position={[hoveredLetter.coords[0], hoveredLetter.coords[1] + 1.2, hoveredLetter.coords[2]]} center>
          <div className="bg-stone-950/90 border border-blue-500/30 rounded-xl p-3 px-4 shadow-[0_0_20px_rgba(59,130,246,0.25)] min-w-[200px] pointer-events-none backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
              <span className="text-sm font-light uppercase tracking-widest text-stone-200">
                Resonance Matrix
              </span>
              <span className="text-xs font-mono font-bold text-blue-400">
                {hoveredLetter.char}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[9px] uppercase text-stone-400 tracking-wider">
              <div>Ordinal Rank: <span className="text-white float-right font-bold">{hoveredLetter.val}</span></div>
              <div>Reduction Index: <span className="text-white float-right font-bold">{((hoveredLetter.val - 1) % 9) + 1}</span></div>
              <div>Harmonic Freq: <span className="text-blue-400 float-right font-bold">{hoveredLetter.val * 11} Hz</span></div>
              <div className="border-t border-white/5 pt-1 mt-1 text-[8px] text-stone-500">
                Coord: [{hoveredLetter.coords[0].toFixed(1)}, {hoveredLetter.coords[1].toFixed(1)}, {hoveredLetter.coords[2].toFixed(1)}]
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Ambient particles surrounding Gematria Grid */}
      <Sparkles
        count={50}
        scale={16}
        size={2}
        speed={0.4}
        color="#3b82f6"
        opacity={0.3}
      />
    </group>
  );
};
