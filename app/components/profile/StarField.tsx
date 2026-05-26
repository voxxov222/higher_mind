import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

/**
 * StarField Component
 * Provides a highly detailed, 3D starfield background using Three.js.
 */
const StarField = () => {
  return (
    <div 
      id="cosmic-starfield"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      <Canvas camera={{ position: [0, 0, 1] }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        <Stars 
          radius={100} 
          depth={50} 
          count={7000} 
          factor={4} 
          saturation={0.5} 
          fade 
          speed={0.5} 
        />
        <fog attach="fog" args={['#000000', 0, 100]} />
      </Canvas>
      {/* Subtle overlay gradient to blend with the rest of the UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black opacity-60" />
    </div>
  );
};

export default StarField;
