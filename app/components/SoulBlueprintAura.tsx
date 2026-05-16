import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Stars, Center } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// --------------------------------------------------------
// SHADERS
// --------------------------------------------------------
const SoulParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#38bdf8') },
  },
  vertexShader: `
    attribute float size;
    attribute float random;
    
    varying float vAlpha;
    varying vec3 vColor;
    
    uniform float uTime;
    uniform vec3 uColor;
    
    void main() {
      vec3 pos = position;
      
      // Organic waving motion based on height and time
      float wave = sin(pos.y * 3.0 + uTime * 1.5 + random * 6.28) * 0.05;
      float waveZ = cos(pos.y * 2.0 + uTime * 1.2 + random * 6.28) * 0.05;
      
      pos.x += wave;
      pos.z += waveZ;
      
      // Gentle breathing scale
      float breath = sin(uTime * 0.5) * 0.02;
      pos *= (1.0 + breath + random * 0.05 * sin(uTime * 3.0));

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Depth based sizing
      gl_PointSize = size * (30.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      // Shimmering alpha
      vAlpha = 0.3 + 0.7 * sin(uTime * 2.0 + random * 10.0);
      
      // mix some violet/indigo into the core color
      vec3 highlight = vec3(0.6, 0.2, 1.0);
      vColor = mix(uColor, highlight, random * 0.5 + wave * 2.0);
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if (ll > 0.5) discard;
      
      // Soft glow
      float strength = pow((0.5 - ll) * 2.0, 1.5);
      gl_FragColor = vec4(vColor, vAlpha * strength);
    }
  `
};

const HumanSilhouette = () => {
  const count = 50000;
  
  const { positions, sizes, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const rand = new Float32Array(count);
    
    let i = 0;
    while (i < count) {
      // Generate points within a bounding box
      const x = (Math.random() - 0.5) * 2.0; // -1 to 1
      const y = (Math.random() - 0.5) * 3.0; // -1.5 to 1.5 (taller)
      const z = (Math.random() - 0.5) * 1.0; // -0.5 to 0.5 (flatter)
      
      // Shape logic
      const absX = Math.abs(x);
      let inside = false;
      
      // Head
      if (y > 0.8) {
         const headRad = 0.35;
         const hx = x;
         const hy = y - 1.15;
         const hz = z;
         if (hx*hx + hy*hy + hz*hz < headRad*headRad) inside = true;
      }
      // Torso
      else if (y > -0.2 && y <= 0.8) {
         // Shoulders logic
         const shoulderWidth = 0.7 - (0.8 - y) * 0.2; // wider at top
         if (absX < shoulderWidth && Math.abs(z) < 0.25 + (y+0.2)*0.1) inside = true;
      }
      // Hips/Legs
      else if (y <= -0.2) {
         const legWidth = 0.35;
         // Split legs
         if (absX > 0.05 && absX < legWidth && Math.abs(z) < 0.2) inside = true;
         // Connect hips
         if (y > -0.4 && absX < legWidth && Math.abs(z) < 0.2) inside = true;
      }
      
      // Arms
      if (y > -0.5 && y <= 0.7 && absX > 0.6 && absX < 0.85 && Math.abs(z) < 0.2) {
         inside = true;
      }
      
      if (inside) {
        
        // Add some noise/fuzziness to the edges
        const fuzz = 0.05;
        pos[i * 3] = x + (Math.random() - 0.5) * fuzz;
        pos[i * 3 + 1] = y + (Math.random() - 0.5) * fuzz;
        pos[i * 3 + 2] = z + (Math.random() - 0.5) * fuzz;
        
        // Size variation
        sz[i] = Math.random() * 0.8 + 0.2;
        rand[i] = Math.random();
        i++;
      }
    }
    
    return { positions: pos, sizes: sz, randoms: rand };
  }, [count]);
  
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  
  useFrame((state) => {
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (pointsRef.current) {
        pointsRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  return (
    <points ref={pointsRef}>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            <bufferAttribute attach="attributes-random" args={[randoms, 1]} />
        </bufferGeometry>
        <shaderMaterial 
            ref={materialRef}
            uniforms={SoulParticleShader.uniforms}
            vertexShader={SoulParticleShader.vertexShader}
            fragmentShader={SoulParticleShader.fragmentShader}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
        />
    </points>
  );
};

const CosmicVortex = () => {
    const vortexRef = useRef<THREE.Points>(null!);
    const count = 30000;
    
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const radius = 6.0;
        const tube = 2.5;
        
        for(let i=0; i<count; i++) {
            // Torus distribution
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI * 2;
            
            // Random displacement within the tube
            const targetTube = tube * Math.pow(Math.random(), 0.5);
            
            const x = (radius + targetTube * Math.cos(v)) * Math.cos(u);
            const y = targetTube * Math.sin(v);
            const z = (radius + targetTube * Math.cos(v)) * Math.sin(u);
            
            pos[i*3] = x;
            pos[i*3+1] = y;
            pos[i*3+2] = z;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if(vortexRef.current) {
            vortexRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
            vortexRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.2;
            vortexRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.05) * 0.2;
            
            // Pulse effect
            const scale = 1.0 + Math.sin(state.clock.getElapsedTime() * 2.0) * 0.05;
            vortexRef.current.scale.set(scale, scale, scale);
        }
    })

    return (
        <points ref={vortexRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
    )
}


export const SoulBlueprintAura = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-80" style={{ transform: 'translateZ(-100px)'}}>
      <Canvas gl={{ alpha: true, antialias: false }} camera={{ position: [0, 0, 5], fov: 45 }}>
        <fog attach="fog" args={['#000', 3, 10]} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Center>
            <HumanSilhouette />
          </Center>
        </Float>
        
        <CosmicVortex />
        
        {/* Massive starfield */}
        <Stars radius={50} depth={50} count={30000} factor={4} saturation={1} fade speed={1} />
        <Stars radius={100} depth={100} count={20000} factor={6} saturation={0.5} fade speed={0.5} />
        
        <EffectComposer disableNormalPass>
          <Bloom 
            intensity={2.0} 
            luminanceThreshold={0.1} 
            luminanceSmoothing={0.9} 
            blendFunction={BlendFunction.SCREEN} 
          />
          <ChromaticAberration 
            offset={new THREE.Vector2(0.002, 0.002)} 
            blendFunction={BlendFunction.NORMAL} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
