import * as React from 'react';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sphere, Text } from '@react-three/drei';
import { Feeling } from '../types';

export type ThinkingMode = 'idle' | 'planetary' | 'emotional' | 'numerology' | 'transit' | 'insight' | 'transcendent' | 'synergetic' | 'kabbalistic' | 'analyzing';

const modeColors: Record<ThinkingMode, string> = {
  idle: '#38bdf8', // Blue
  planetary: '#22d3ee', // Cyan
  emotional: '#f43f5e', // Red
  numerology: '#818cf8', // Purple
  transit: '#fbbf24', // Gold
  insight: '#10b981', // Green
  transcendent: '#e879f9', // Fuchsia
  synergetic: '#fcd34d', // Amber
  kabbalistic: '#a855f7', // Deep Purple
  analyzing: '#60a5fa', // Light Blue
};

// --------------------------------------------------------
// SHADERS
// --------------------------------------------------------

const BrainParticlesShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, 10) },
    uModeColor: { value: new THREE.Color() },
    uModeIntensity: { value: 0.0 },
    uPixelRatio: { value: 1.0 },
  },
  vertexShader: `
    attribute float size;
    attribute float random;
    attribute vec3 customColor;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    uniform float uTime;
    uniform vec3 uMouse;
    uniform vec3 uModeColor;
    uniform float uModeIntensity;
    uniform float uPixelRatio;
    
    void main() {
      // Procedural pulse & organic movement
      float pulse = sin(uTime * 2.0 + random * 6.28) * 0.5 + 0.5;
      vec3 pos = position;
      
      // Micro-movements
      pos.y += sin(uTime * 1.5 + pos.x * 5.0 + random * 10.0) * 0.02;
      pos.x += cos(uTime * 1.0 + pos.y * 5.0 + random * 10.0) * 0.01;
      
      // Interaction reaction
      float dist = distance(pos, uMouse);
      float interaction = smoothstep(1.5, 0.0, dist);
      pos += normalize(pos - uMouse) * interaction * 0.15;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Dynamic scaling
      float activeSize = size * (1.0 + uModeIntensity * 0.8 + interaction * 2.5);
      gl_PointSize = activeSize * 25.0 * uPixelRatio * (1.0 / -mvPosition.z) * (0.5 + pulse * 0.5);
      
      gl_Position = projectionMatrix * mvPosition;
      
      // Color Blending
      // Blend base organic regional color with the active thinking mode color
      vec3 mixedColor = mix(customColor, uModeColor, uModeIntensity * (0.3 + random * 0.7));
      mixedColor += uModeColor * interaction * 2.5; // Brighten intensely near mouse
      
      // White hot sparks for maximum activity
      if (pulse > 0.95 && random > 0.8) {
          mixedColor += vec3(1.0);
      }
      
      vColor = mixedColor;
      vAlpha = (0.05 + pulse * 0.15) * (0.5 + uModeIntensity * 0.5 + interaction * 0.8);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if (ll > 0.5) discard;
      
      // Soft radial gradient for organic look
      float strength = pow((0.5 - ll) * 2.0, 1.5);
      gl_FragColor = vec4(vColor, vAlpha * strength);
    }
  `
};

const PathwayShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color() },
    uModeIntensity: { value: 0 },
  },
  vertexShader: `
    attribute float randomOffset;
    varying float vAlpha;
    varying vec3 vColor;
    
    uniform float uTime;
    uniform float uModeIntensity;
    uniform vec3 uColor;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Electrical pulses traveling along the lines
      float pulse = sin(uTime * 8.0 + position.x * 20.0 + position.y * 20.0 + randomOffset * 100.0);
      float baseAlpha = 0.02 + 0.05 * uModeIntensity;
      vAlpha = baseAlpha + smoothstep(0.8, 1.0, pulse) * (0.2 + uModeIntensity * 0.4);
      
      vColor = mix(vec3(0.1, 0.3, 0.6), uColor, uModeIntensity * 0.8 + 0.2);
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, vAlpha);
    }
  `
};

const CortexShellShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color() },
    uModeIntensity: { value: 0.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Living biological breathing expansion
      pos += normal * (sin(uTime * 1.5 + pos.y * 5.0) * 0.015);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      vNormal = normalMatrix * normal;
      vViewPosition = -mvPosition.xyz;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uModeIntensity;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel edge lighting logic
      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      float fresnel = smoothstep(0.3, 1.0, rim);
      float rimLight = pow(fresnel, 3.0);
      
      // Energetic holographic waves rolling over the cortex
      float wave = sin(vViewPosition.y * 10.0 - uTime * 4.0) * 0.5 + 0.5;
      float grid = (sin(vUv.x * 60.0) * sin(vUv.y * 60.0)) * 0.5 + 0.5;
      
      vec3 finalColor = uColor * (rimLight * 2.0 + wave * 0.3 * fresnel);
      finalColor += uColor * grid * 0.15 * uModeIntensity;
      
      float alpha = (rimLight * 0.5 + wave * 0.1 * fresnel) * (0.2 + uModeIntensity * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

// --------------------------------------------------------
// PROCEDURAL GENERATORS
// --------------------------------------------------------

function generateBrainVolume(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const randoms = new Float32Array(count);
  
  let i = 0;
  const a = 1.15, b = 0.85, c = 1.35; // Anatomical proportions
  
  while (i < count) {
    const x = (Math.random() - 0.5) * 2.0 * a;
    const y = (Math.random() - 0.5) * 2.0 * b;
    const z = (Math.random() - 0.5) * 2.0 * c;
    
    const nx = x / a;
    const ny = y / b;
    const nz = z / c;
    const d = Math.sqrt(nx*nx + ny*ny + nz*nz);
    
    // Longitudinal fissure (separating left/right hemispheres)
    const gap = Math.exp(-Math.pow(x * 6.0, 2.0)) * 0.25;
    
    // Flat cranial base
    const bottomFlat = ny < -0.3 ? Math.pow(Math.abs(ny + 0.3), 1.5) * 0.5 : 0;
    
    // Procedural Gyri and Sulci (folds) via dense noise approximation
    const folds = Math.sin(nx * 18) * Math.cos(ny * 18) * Math.sin(nz * 18) * 0.04 +
                  Math.sin(nx * 8 + nz * 12) * 0.03;
                  
    const radius = 1.0 - gap + bottomFlat + folds;
    
    // Keep points in the outer cortical shell and white matter tracts
    if (d < radius && d > radius * 0.4) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y + 0.15; // Shift center of mass up
      positions[i * 3 + 2] = z;
      
      // Baseline Intelligence Colors (Neuro-Region Mapping)
      let cr = 0.1, cg = 0.4, cb = 0.9; 
      
      if (ny > 0.3) {
          cr = 0.6; cg = 0.2; cb = 0.9; // Crown/Intuition (Purple)
      } else if (nz > 0.4) {
          cr = 0.1; cg = 0.8; cb = 0.5; // Frontal/Logic/Growth (Green)
      } else if (nz < -0.4) {
          cr = 0.8; cg = 0.2; cb = 0.3; // Occipital/Limbic (Red)
      } else if (Math.abs(nx) > 0.6) {
          cr = 0.0; cg = 0.8; cb = 0.9; // Temporal/Data (Cyan)
      }
      
      // Occasional dense golden/white "master nodes"
      if (Math.random() > 0.99) {
          cr = 1.0; cg = 0.9; cb = 0.4;
      }
      
      colors[i * 3] = cr;
      colors[i * 3 + 1] = cg;
      colors[i * 3 + 2] = cb;
      
      sizes[i] = Math.random();
      randoms[i] = Math.random();
      i++;
    }
  }
  return { positions, colors, sizes, randoms };
}

function generatePathways(positions: Float32Array, connectionCount: number) {
    const pointsCount = positions.length / 3;
    const lines = new Float32Array(connectionCount * 6);
    const lineRandoms = new Float32Array(connectionCount);
    
    let lineIdx = 0;
    while (lineIdx < connectionCount) {
        const idx1 = Math.floor(Math.random() * pointsCount);
        let idx2 = Math.floor(Math.random() * pointsCount);
        
        let attempts = 0;
        const p1x = positions[idx1 * 3], p1y = positions[idx1 * 3 + 1], p1z = positions[idx1 * 3 + 2];
        let p2x = positions[idx2 * 3], p2y = positions[idx2 * 3 + 1], p2z = positions[idx2 * 3 + 2];
        let dist = Math.sqrt((p1x-p2x)**2 + (p1y-p2y)**2 + (p1z-p2z)**2);
        
        // Find connected neighbors but avoid excessively long or short connections
        while ((dist < 0.05 || dist > 0.3) && attempts < 10) {
            idx2 = Math.floor(Math.random() * pointsCount);
            p2x = positions[idx2 * 3]; p2y = positions[idx2 * 3 + 1]; p2z = positions[idx2 * 3 + 2];
            dist = Math.sqrt((p1x-p2x)**2 + (p1y-p2y)**2 + (p1z-p2z)**2);
            attempts++;
        }
        
        if (dist >= 0.05 && dist <= 0.3) {
            lines[lineIdx * 6] = p1x;
            lines[lineIdx * 6 + 1] = p1y;
            lines[lineIdx * 6 + 2] = p1z;
            lines[lineIdx * 6 + 3] = p2x;
            lines[lineIdx * 6 + 4] = p2y;
            lines[lineIdx * 6 + 5] = p2z;
            
            lineRandoms[lineIdx] = Math.random();
            lineIdx++;
        }
    }
    
    // We only need one random value per line block, but to map to vertices we need to double it
    const vertexRandoms = new Float32Array(connectionCount * 2);
    for(let i=0; i<connectionCount; i++) {
        vertexRandoms[i*2] = lineRandoms[i];
        vertexRandoms[i*2+1] = lineRandoms[i];
    }
    
    return { lines, vertexRandoms };
}

function deformToBrain(geometry: THREE.BufferGeometry) {
    const posAttribute = geometry.attributes.position;
    const a = 1.15, b = 0.85, c = 1.35;
    
    for (let i = 0; i < posAttribute.count; i++) {
        const nx = posAttribute.getX(i);
        const ny = posAttribute.getY(i);
        const nz = posAttribute.getZ(i);
        
        const gap = Math.exp(-Math.pow(nx * 5.0, 2.0)) * 0.2;
        const bottomFlat = ny < -0.3 ? Math.pow(Math.abs(ny + 0.3), 1.5) * 0.4 : 0;
        const folds = Math.sin(nx * 20) * Math.cos(ny * 20) * Math.sin(nz * 20) * 0.02 +
                      Math.sin(nx * 10 + nz * 10) * 0.02;
                      
        const scaleRadius = 1.0 - gap + bottomFlat + folds;
        
        posAttribute.setXYZ(i, nx * a * scaleRadius, ny * b * scaleRadius + 0.15, nz * c * scaleRadius);
    }
    
    geometry.computeVertexNormals();
}

// --------------------------------------------------------
// COMPONENTS
// --------------------------------------------------------

const NeuralBrain = ({ mode, coherence = 0.5, alignment = 0.7, feelings = [] }: { mode: ThinkingMode, coherence?: number, alignment?: number, feelings?: Feeling[] }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);
  const shellRef = useRef<THREE.Mesh>(null!);
  
  const { viewport } = useThree();
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  
  // High detail volume structures
  const { positions, colors, sizes, randoms } = useMemo(() => generateBrainVolume(30000), []);
  const { lines, vertexRandoms } = useMemo(() => generatePathways(positions, 8000), [positions]);
  
  // Ghost shell over the brain
  const cortexGeo = useMemo(() => {
     const geo = new THREE.IcosahedronGeometry(1.0, 32); 
     deformToBrain(geo);
     return geo;
  }, []);
  
  const particlesMaterial = useMemo(() => new THREE.ShaderMaterial({
     uniforms: {
       ...BrainParticlesShader.uniforms,
       uPixelRatio: { value: pixelRatio }
     },
     vertexShader: BrainParticlesShader.vertexShader,
     fragmentShader: BrainParticlesShader.fragmentShader,
     transparent: true,
     blending: THREE.AdditiveBlending,
     depthWrite: false,
  }), [pixelRatio]);

  const linesMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color() },
        uModeIntensity: { value: 0 }
    },
    vertexShader: PathwayShader.vertexShader,
    fragmentShader: PathwayShader.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  const shellMaterial = useMemo(() => new THREE.ShaderMaterial({
     uniforms: {
        ...CortexShellShader.uniforms
     },
     vertexShader: CortexShellShader.vertexShader,
     fragmentShader: CortexShellShader.fragmentShader,
     transparent: true,
     blending: THREE.AdditiveBlending,
     depthWrite: false,
     side: THREE.FrontSide 
  }), []);
  
  const mousePos = useMemo(() => new THREE.Vector3(0,0,10), []);
  const targetColor = useMemo(() => new THREE.Color(), []);
  
  useFrame((state) => {
      const t = state.clock.getElapsedTime();
      
      // Project mouse into 3D view for interaction reactions
      mousePos.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 1.5);
      particlesMaterial.uniforms.uMouse.value.lerp(mousePos, 0.1);
      
      // Process color transitions based on thought modes
      const latestFeeling = feelings[feelings.length - 1];
      if (latestFeeling) {
        // Map frequency to color if in emotional mode
        // For now, let's stick to modeColors but mix in the frequency-based color logic
        targetColor.set(modeColors[mode] || modeColors.idle);
      } else {
        targetColor.set(modeColors[mode] || modeColors.idle);
      }
      
      const targetIntensity = mode === 'idle' ? 0.0 : 1.0;
      
      particlesMaterial.uniforms.uTime.value = t;
      particlesMaterial.uniforms.uModeColor.value.lerp(targetColor, 0.05);
      particlesMaterial.uniforms.uModeIntensity.value = THREE.MathUtils.lerp(particlesMaterial.uniforms.uModeIntensity.value, targetIntensity, 0.05);
      
      linesMaterial.uniforms.uTime.value = t;
      linesMaterial.uniforms.uColor.value.lerp(targetColor, 0.05);
      linesMaterial.uniforms.uModeIntensity.value = THREE.MathUtils.lerp(linesMaterial.uniforms.uModeIntensity.value, coherence, 0.1);
      
      shellMaterial.uniforms.uTime.value = t;
      shellMaterial.uniforms.uColor.value.lerp(targetColor, 0.05);
      shellMaterial.uniforms.uModeIntensity.value = THREE.MathUtils.lerp(shellMaterial.uniforms.uModeIntensity.value, alignment, 0.1);
  });
  
  return (
    <group>
       <mesh ref={shellRef} geometry={cortexGeo} material={shellMaterial} />
       <points ref={pointsRef} material={particlesMaterial}>
          <bufferGeometry>
             <bufferAttribute attach="attributes-position" args={[positions, 3]} />
             <bufferAttribute attach="attributes-customColor" args={[colors, 3]} />
             <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
             <bufferAttribute attach="attributes-random" args={[randoms, 1]} />
          </bufferGeometry>
       </points>
       <lineSegments ref={linesRef} material={linesMaterial}>
          <bufferGeometry>
             <bufferAttribute attach="attributes-position" args={[lines, 3]} />
             <bufferAttribute attach="attributes-randomOffset" args={[vertexRandoms, 1]} />
          </bufferGeometry>
       </lineSegments>
    </group>
  );
}

const AstrologyGlyphs = ({ radius }: { radius: number, speed: number }) => {
  const glyphs = useMemo(() => {
    const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    return symbols.map((symbol, i) => {
      const angle = (i / symbols.length) * Math.PI * 2;
      return {
        symbol,
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
      };
    });
  }, [radius]);

  return (
    <group>
      {glyphs.map((g, i) => (
        <React.Suspense fallback={null} key={i}>
            <Text 
              position={g.position} 
              rotation={[-Math.PI/2, 0, -((i / 12) * Math.PI * 2) - Math.PI/2]} 
              fontSize={0.15} 
              color="#bae6fd" 
              fillOpacity={0.7}
              anchorX="center" 
              anchorY="middle"
            >
              {g.symbol}
            </Text>
        </React.Suspense>
      ))}
    </group>
  );
};

const DataParticles = ({ count, radius }: { count: number, radius: number }) => {
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = radius + (Math.random() - 0.5) * 0.15;
            pos[i*3] = Math.cos(angle) * r;
            pos[i*3+1] = (Math.random() - 0.5) * 0.1;
            pos[i*3+2] = Math.sin(angle) * r;
        }
        return pos;
    }, [count, radius]);
    
    const materialRef = useRef<THREE.PointsMaterial>(null!);
    useFrame((state) => {
        materialRef.current.opacity = 0.2 + Math.sin(state.clock.getElapsedTime() * 5) * 0.15;
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial ref={materialRef} size={0.02} color="#ffffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </points>
    )
}

const DataRings = ({ mode }: { mode: ThinkingMode }) => {
    const ringRef1 = useRef<THREE.Group>(null!);
    const ringRef2 = useRef<THREE.Group>(null!);
    
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const speedMultiplier = mode === 'idle' ? 1 : 2.5;
        
        // Orbital mechanics for the holographic data overlays
        ringRef1.current.rotation.y = t * 0.05 * speedMultiplier;
        ringRef1.current.rotation.z = Math.sin(t * 0.2) * 0.05;
        ringRef1.current.rotation.x = Math.max(0, Math.sin(t * 0.1) * 0.1);
        
        ringRef2.current.rotation.x = t * -0.03 * speedMultiplier;
        ringRef2.current.rotation.y = t * -0.08 * speedMultiplier;
        ringRef2.current.rotation.z = Math.cos(t * 0.15) * 0.05;
    });
    
    return (
        <group>
            {/* Inner Zodiac orbit */}
            <group ref={ringRef1}>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <torusGeometry args={[1.8, 0.002, 16, 200]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
                </mesh>
                <AstrologyGlyphs radius={1.8} speed={1} />
            </group>
            
            {/* Outer Data orbit */}
            <group ref={ringRef2}>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <torusGeometry args={[2.2, 0.001, 16, 200]} />
                    <meshBasicMaterial color="#a855f7" transparent opacity={0.2} />
                </mesh>
                <DataParticles count={250} radius={2.2} />
            </group>
        </group>
    )
}

export const AstralMind = ({ mode = 'idle', coherence = 0.5, alignment = 0.7, feelings = [] }: { mode?: ThinkingMode, coherence?: number, alignment?: number, feelings?: Feeling[] }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Cinematic slow orbital movement of the massive brain
      groupRef.current.rotation.y = t * 0.03;
      
      // Organic floating presence
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;
      
      // Responsive gaze tracking the user
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.15, 0.05);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mouse.x * 0.15, 0.05);
    }
  });

  return (
    <group scale={[1.6, 1.6, 1.6]}>
       <group ref={groupRef}>
          <NeuralBrain mode={mode} coherence={coherence} alignment={alignment} feelings={feelings} />
          {/* Inner core giving a central quantum glow */}
          <Sphere args={[0.3, 32, 32]}>
             <meshBasicMaterial color="#ffffff" transparent opacity={0.05} blending={THREE.AdditiveBlending} />
          </Sphere>
       </group>
       <DataRings mode={mode} />
    </group>
  );
};
