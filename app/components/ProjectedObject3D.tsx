import React, { useState, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { motion } from 'motion/react';
import { useHigherMind } from './HigherMindProvider';
import * as THREE from 'three';

export const ProjectedObject3D = ({ item, position: initialPos }: { item: any, position: [number, number, number] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { removeProjectedItem } = useHigherMind();
  const groupRef = useRef<THREE.Group>(null);
  
  const [position, setPosition] = useState<[number, number, number]>(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  
  const config = item.config || {};
  const isLocked = config.locked || false;
  const animation = config.animation || 'None';

  // Animation logic
  useFrame((state, delta) => {
      if (!groupRef.current || animation === 'None') return;

      const time = state.clock.getElapsedTime();
      
      switch(animation) {
          case '360 Spin':
              groupRef.current.rotation.y += delta;
              break;
          case 'Orbit Around Core':
              groupRef.current.position.x = position[0] + Math.cos(time) * 5;
              groupRef.current.position.z = position[2] + Math.sin(time) * 5;
              break;
          case 'Orbit Self':
              groupRef.current.rotation.y += delta * 0.5;
              groupRef.current.rotation.z += delta * 0.2;
              break;
          case 'Zig Zag':
              groupRef.current.position.y = position[1] + Math.sin(time * 5) * 0.5;
              groupRef.current.position.x = position[0] + Math.cos(time * 3) * 0.5;
              break;
          case 'Pulse & Glow':
              { const s = 1 + Math.sin(time * 3) * 0.1; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Zoom In Out':
              { const s = 1 + Math.sin(time) * 0.5; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Hover Float':
              groupRef.current.position.y = position[1] + Math.sin(time) * 0.5;
              break;
          case 'Quantum Jitter':
              groupRef.current.position.x = position[0] + (Math.random() - 0.5) * 0.2;
              groupRef.current.position.y = position[1] + (Math.random() - 0.5) * 0.2;
              groupRef.current.position.z = position[2] + (Math.random() - 0.5) * 0.2;
              break;
          case 'Hyper-drive Drift':
              groupRef.current.position.z = position[2] + ((time * 15) % 50) - 25;
              break;
          case 'Sine Wave':
              groupRef.current.position.y = position[1] + Math.sin(time * 2);
              break;
          case 'Cosine Wave':
              groupRef.current.position.x = position[0] + Math.cos(time * 2);
              break;
          case 'Torus Spin':
              groupRef.current.rotation.x += delta;
              groupRef.current.rotation.y += delta * 1.5;
              break;
          case 'Flower of Life Bloom':
              { const s = 1 + Math.sin(time * 6) * 0.1 + Math.cos(time * 3) * 0.05; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Metatron\'s Spin':
              groupRef.current.rotation.x += delta * 2;
              groupRef.current.rotation.y += delta * 3;
              groupRef.current.rotation.z -= delta;
              break;
          case 'Merkaba Rotate':
              groupRef.current.rotation.y = time * 2;
              groupRef.current.rotation.z = -time * 2;
              break;
          case 'Fibonacci Spiral In':
              { 
                  const r = Math.exp(-0.1 * (time % 10)) * 5; 
                  groupRef.current.position.x = position[0] + r * Math.cos(time * 3); 
                  groupRef.current.position.z = position[2] + r * Math.sin(time * 3); 
              }
              break;
          case 'Fibonacci Spiral Out':
              { 
                  const r = Math.exp(0.1 * (time % 10)) * 0.5; 
                  groupRef.current.position.x = position[0] + r * Math.cos(time * 3); 
                  groupRef.current.position.z = position[2] + r * Math.sin(time * 3); 
              }
              break;
          case 'Celestial Sweep':
              groupRef.current.position.x = position[0] + Math.sin(time * 0.5) * 10;
              groupRef.current.position.y = position[1] + Math.cos(time * 0.3) * 5;
              break;
          case 'Tachyon Burst':
              if (Math.random() > 0.95) {
                  groupRef.current.position.x = position[0] + (Math.random() - 0.5) * 10;
                  groupRef.current.position.y = position[1] + (Math.random() - 0.5) * 10;
              } else {
                  groupRef.current.position.lerp(new THREE.Vector3(...position), 0.1);
              }
              break;
          case 'Gravity Well Drop':
              groupRef.current.position.y = position[1] - Math.pow(time % 3, 3);
              break;
          case 'Anti-gravity Lift':
              groupRef.current.position.y = position[1] + (Math.pow(time % 4, 2));
              break;
          case 'Pendulum Swing':
              groupRef.current.rotation.z = Math.sin(time * 2) * 0.5;
              groupRef.current.position.x = position[0] + Math.sin(time * 2) * 2;
              break;
          case 'Magnetic Tremor':
              groupRef.current.position.x = position[0] + Math.sin(time * 50) * 0.05;
              groupRef.current.position.y = position[1] + Math.cos(time * 40) * 0.05;
              break;
          case 'Dimensional Fold':
              groupRef.current.scale.x = Math.max(0.1, Math.abs(Math.sin(time)));
              groupRef.current.scale.y = Math.max(0.1, Math.abs(Math.cos(time)));
              break;
          case 'Nebula Swirl':
              groupRef.current.position.x = position[0] + Math.sin(time * 0.5) * 3 + Math.cos(time * 1.5) * 1;
              groupRef.current.position.z = position[2] + Math.cos(time * 0.5) * 3 + Math.sin(time * 1.5) * 1;
              break;
          case 'Black Hole Suck':
              {
                  const progress = 1 - ((time % 5) / 5);
                  groupRef.current.scale.set(progress, progress, progress);
                  groupRef.current.position.x = position[0] + Math.cos(time * 10) * progress * 2;
                  groupRef.current.position.z = position[2] + Math.sin(time * 10) * progress * 2;
              }
              break;
          case 'White Hole Expand':
              {
                  const progress = (time % 5) / 5;
                  groupRef.current.scale.set(progress * 2, progress * 2, progress * 2);
                  groupRef.current.position.x = position[0] + Math.cos(time * 10) * progress * 2;
                  groupRef.current.position.z = position[2] + Math.sin(time * 10) * progress * 2;
              }
              break;
          case 'Astral Projection':
              groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 1.5;
              { const s = 1 + Math.sin(time * 4) * 0.05; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Etheric Phase':
              groupRef.current.rotation.y += delta * 0.5;
              { const s = 0.8 + Math.abs(Math.sin(time * 0.5)) * 0.4; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Chakra Align Spin':
              groupRef.current.rotation.y = Math.floor(time * 2) * (Math.PI / 4);
              break;
          case 'DNA Double Helix Twist':
              groupRef.current.position.x = position[0] + Math.sin(time * 3) * 2;
              groupRef.current.position.z = position[2] + Math.cos(time * 3) * 2;
              groupRef.current.position.y = position[1] + ((time * 2) % 10) - 5;
              break;
          case 'Kundalini Rise':
              groupRef.current.position.y = position[1] + (time % 5) - 2.5; 
              groupRef.current.position.x = position[0] + Math.sin(time * 10) * 0.2;
              break;
          case 'Pineal Pulse':
              { const s = 0.8 + Math.pow(Math.sin(time * 3), 4) * 0.5; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Sacred Geometry Morph':
              groupRef.current.rotation.x += delta * 1.618;
              groupRef.current.rotation.y += delta * 1.0;
              groupRef.current.rotation.z += delta * 0.618;
              break;
          case 'Golden Ratio Dance':
              groupRef.current.position.x = position[0] + Math.sin(time * 1.618) * 3;
              groupRef.current.position.y = position[1] + Math.cos(time * 1.0) * 3;
              break;
          case 'Vesica Piscis Orbit':
              groupRef.current.position.x = position[0] + Math.sin(time * 2) * 3;
              groupRef.current.position.y = position[1] + Math.sin(time) * 1.5;
              break;
          case 'Kabbalistic Tree Climb':
              groupRef.current.position.y = position[1] + Math.floor(time % 10);
              break;
          case 'Sephirot Flash':
              { const s = time % 1 < 0.1 ? 1.5 : 1; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Tarot Shuffle Draw':
              if (time % 2 < 1) {
                  groupRef.current.rotation.z += delta * 10;
                  groupRef.current.position.x = position[0] + Math.sin(time * 20) * 0.5;
              } else {
                  groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
                  groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, position[0], 0.1);
              }
              break;
          case 'Zodiac Wheel Spin':
              groupRef.current.rotation.z -= delta * 0.2;
              break;
          case 'Astrological Transit Move':
              groupRef.current.position.x = position[0] + Math.cos(time * 0.5) * 4;
              groupRef.current.position.z = position[2] + Math.sin(time * 0.5) * 2;
              break;
          case 'Planetary Retrograde Slide':
              groupRef.current.position.x = position[0] + (time % 10) - 5 + Math.sin(time * 3);
              break;
          case 'Solar Eclipse Cast':
              groupRef.current.position.x = position[0] + Math.sin(time * 0.5) * 5;
              { const s = 1 - Math.max(0, 1 - Math.abs(groupRef.current.position.x - position[0])); groupRef.current.scale.set(s || 0.1, s || 0.1, s || 0.1); }
              break;
          case 'Lunar Eclipse Shadow':
              groupRef.current.rotation.y += delta * 0.5;
              { const opacityScale = Math.abs(Math.sin(time * 0.5)); groupRef.current.position.z = position[2] - opacityScale * 2; }
              break;
          case 'Starseed Awakening':
              groupRef.current.position.y = position[1] + Math.min(10, time * 0.5);
              { const s = 1 + Math.min(1, time * 0.1); groupRef.current.scale.set(s, s, s); }
              break;
          case 'Cosmic Web Shiver':
              groupRef.current.position.x = position[0] + Math.sin(time * 25) * 0.08;
              groupRef.current.position.y = position[1] + Math.cos(time * 20) * 0.08;
              groupRef.current.position.z = position[2] + Math.sin(time * 30) * 0.08;
              break;
          case 'Galactic Core Rotation':
              groupRef.current.position.x = position[0] + Math.cos(time * 0.2) * 8;
              groupRef.current.position.z = position[2] + Math.sin(time * 0.2) * 8;
              groupRef.current.rotation.y += delta;
              break;
          case 'Harmonic Resonance Pulse':
              { const s = 1 + Math.sin(time)*0.1 + Math.sin(time*3)*0.05 + Math.sin(time*6)*0.025; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Fractal Expansion':
              { const s = 1 + Math.pow(time % 3, 2) * 0.2; groupRef.current.scale.set(s, s, s); }
              break;
          case 'Fibonacci Spiral Rotation':
              groupRef.current.position.x = position[0] + Math.cos(time * Math.PI * 1.618) * 3;
              groupRef.current.position.y = position[1] + Math.sin(time * Math.PI * 1.618) * 3;
              groupRef.current.rotation.z += delta * 1.618;
              break;
          case 'Morphogenic Grid Shift':
              groupRef.current.position.x = position[0] + Math.round(Math.sin(time)*3);
              groupRef.current.position.y = position[1] + Math.round(Math.cos(time)*3);
              break;
          default:
              // Fallback spin if unmapped specifically yet
              groupRef.current.rotation.y += delta * 0.2;
              break;
      }
  });

  return (
    <group 
      ref={groupRef}
      position={position} 
      onClick={(e) => { 
          e.stopPropagation(); 
          setShowMenu(!showMenu); 
      }}
      onPointerDown={(e) => {
          if (isLocked) return;
          e.stopPropagation();
          (e.target as any).setPointerCapture(e.pointerId);
          setIsDragging(true);
      }}
      onPointerUp={(e) => {
          if (isLocked) return;
          e.stopPropagation();
          (e.target as any).releasePointerCapture(e.pointerId);
          setIsDragging(false);
      }}
      onPointerMove={(e) => {
          if (isDragging && !isLocked) {
              e.stopPropagation();
              setPosition([e.point.x, e.point.y, e.point.z]);
          }
      }}
    >
      <Html occlude center>
        <div 
          className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 p-2 shadow-2xl transition-transform"
          style={{ transform: isDragging ? 'scale(1.05)' : 'scale(1)', cursor: isLocked ? 'pointer' : 'grab' }}
        >
            {item.children}
        </div>
      </Html>
      {showMenu && (
        <Html center position={[0, -2, 0]}>
           <div className="bg-black/90 text-white p-3 rounded-lg border border-white/20 z-50 shadow-2xl w-32 flex flex-col gap-2">
             <div className="text-[10px] uppercase font-bold text-teal-400 truncate">{item.componentName}</div>
             <button onClick={() => removeProjectedItem(item.id)} className="w-full text-xs py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded border border-rose-500/30">Remove</button>
             <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} className="w-full text-xs py-1.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-300">Close</button>
           </div>
        </Html>
      )}
    </group>
  );
};
