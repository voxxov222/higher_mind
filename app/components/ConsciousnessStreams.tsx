import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Thought, Feeling, Experience } from '../types';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  maxAge: number;
  type: 'thought' | 'feeling' | 'experience';
}

const STREAM_COLORS = {
  thought: new THREE.Color('#0ea5e9'), // Cyan
  feeling: new THREE.Color('#f43f5e'), // Rose
  experience: new THREE.Color('#f59e0b'), // Amber
};

interface ConsciousnessStreamsProps {
  thoughts?: Thought[];
  feelings?: Feeling[];
  experiences?: Experience[];
  coherence?: number;
}

export const ConsciousnessStreams: React.FC<ConsciousnessStreamsProps> = ({ 
  thoughts = [], 
  feelings = [], 
  experiences = [],
  coherence = 0.5 
}) => {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const particleCount = 1500;
  
  // Initialize particles
  const particles = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
        list.push(resetParticle({} as Particle));
    }
    return list;
  }, []);

  function resetParticle(p: Particle): Particle {
    const types: ('thought' | 'feeling' | 'experience')[] = ['thought', 'feeling', 'experience'];
    
    // Weighted selection based on available data
    const thoughtCount = Math.max(1, thoughts.length);
    const feelingCount = Math.max(1, feelings.length);
    const experienceCount = Math.max(1, experiences.length);
    const total = thoughtCount + feelingCount + experienceCount;
    
    const rand = Math.random() * total;
    if (rand < thoughtCount) p.type = 'thought';
    else if (rand < thoughtCount + feelingCount) p.type = 'feeling';
    else p.type = 'experience';
    
    // Spawn in structured streams (trails)
    const streamIndex = Math.floor(Math.random() * 8); // 8 entry points
    const baseAngle = (streamIndex / 8) * Math.PI * 2;
    const spread = 0.5;
    const theta = baseAngle + (Math.random() - 0.5) * spread;
    const phi = (Math.random() - 0.5) * spread * 2;
    const r = 25 + Math.random() * 25;
    
    p.position = new THREE.Vector3(
      r * Math.cos(theta),
      r * Math.sin(phi),
      r * Math.sin(theta)
    );
    
    // Velocity towards center (the brain core)
    p.velocity = p.position.clone().normalize().multiplyScalar(-0.02 - Math.random() * 0.05);
    p.age = 0;
    p.maxAge = 150 + Math.random() * 250;
    return p;
  }

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      p.age++;
      
  // Update position
      const speed = 0.05 + Math.random() * 0.1;
      const velocity = p.velocity.clone().multiplyScalar(speed);
      p.position.add(velocity);
      
      // Pull strongly towards center as they get closer (acceleration)
      const dist = p.position.length();
      const pullStrength = mapRange(dist, 0, 50, 0.02, 0.001);
      const toCenter = new THREE.Vector3(0, 0, 0).sub(p.position).normalize().multiplyScalar(pullStrength);
      p.velocity.add(toCenter);

      // Turbulence based on consciousness metrics
      const noise = Math.sin(t * 2 + p.position.x * 0.5) * 0.02;
      p.position.x += noise;
      p.position.z += Math.cos(t * 2 + p.position.y * 0.5) * 0.02;

      if (p.age > p.maxAge || dist < 0.5) {
        resetParticle(p);
      }

      // Trail-like trailing effect (using position history would be better for real trails, but we compress it here)
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      const color = STREAM_COLORS[p.type];
      // Fade in at start, fade out at end
      let alpha = 1.0;
      if (p.age < 20) alpha = p.age / 20;
      if (p.age > p.maxAge - 20) alpha = (p.maxAge - p.age) / 20;
      
      // Also fade based on proximity to brain (dissolve into neural lattice)
      if (dist < 3) alpha *= (dist - 0.5) / 2.5;

      colors[i * 3] = color.r * alpha;
      colors[i * 3 + 1] = color.g * alpha;
      colors[i * 3 + 2] = color.b * alpha;
    }

    function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
