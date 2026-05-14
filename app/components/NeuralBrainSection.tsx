import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Brain as BrainIcon, Activity, Zap, Waves, Network, Lock, Sliders, Search, Eye, ArrowLeft, Code, Minimize2, Power, Palette, Fingerprint, Terminal } from 'lucide-react';
import { TerminalOverlay } from './profile/TerminalOverlay';

// Brain Point Cloud Component with Shader Optimization
const NeuralParticlesShader = {
    uniforms: {
        uTime: { value: 0 },
        uOverdrive: { value: 0 },
        uSchemaRefine: { value: 0 },
        uEmotiveSynth: { value: 0 },
        uCompression: { value: 0 },
        uVisMode: { value: 0 },
        uThemePrimary: { value: new THREE.Color() },
        uThemeAccent: { value: new THREE.Color() },
    },
    vertexShader: `
        attribute vec3 originalPosition;
        attribute vec3 customColor;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        uniform float uTime;
        uniform float uOverdrive;
        uniform float uSchemaRefine;
        uniform float uEmotiveSynth;
        uniform float uCompression;
        uniform float uVisMode;
        uniform vec3 uThemePrimary;
        uniform vec3 uThemeAccent;
        
        void main() {
            vec3 pos = originalPosition;
            
            // Compression
            pos *= (1.0 - uCompression * 0.3);
            
            // Schema Refine: Snapping to lattice (approximated in shader)
            if (uSchemaRefine > 0.5) {
                pos = mix(pos, floor(pos * 2.0 + 0.5) / 2.0, uSchemaRefine * 0.5);
            }
            
            // Organic Pulse
            float pulse = sin(uTime * (uOverdrive > 0.5 ? 10.0 : 2.0) + pos.x * 2.0) * 0.02;
            pos *= (1.0 + pulse);
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (uOverdrive > 0.5 ? 8.0 : 4.0) * (1.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            
            // Emotive Synth: Color Vibrancy
            vec3 color = customColor;
            if (uEmotiveSynth > 0.5) {
                float shift = (sin(uTime * 5.0 + pos.y * 5.0) + 1.0) * 0.5;
                color = mix(color, vec3(1.0), shift * 0.4 * uEmotiveSynth);
            }
            
            vColor = color;
            vAlpha = uVisMode > 0.5 ? 0.3 : 0.8;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
            gl_FragColor = vec4(vColor, vAlpha);
        }
    `
};

const NeuralBrainCore = ({ colorTheme, overdrive, schemaRefine, indexingMode, emotiveSynth, scriptInjection, compression, collectiveLink, naturalCore, setHoveredNode, hapticMode, visMode }: any) => {
    const pointsRef = useRef<THREE.Points>(null!);
    const streamsRef = useRef<THREE.Group>(null!);
    const naturalCoreRef = useRef<THREE.Mesh>(null!);
    
    // Generate brain shape point cloud
    const { positions, colors, originalPositions } = useMemo(() => {
        const particleCount = 6000; // Increased density with shader optimization
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const originalPositions = new Float32Array(particleCount * 3);
        
        const color = new THREE.Color();
        const baseColor = new THREE.Color(colorTheme.primary);
        const accentColor = new THREE.Color(colorTheme.accent);

        for (let i = 0; i < particleCount; i++) {
            const hemisphere = Math.random() > 0.5 ? 1 : -1;
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = 4 + Math.random() * 0.5;
            
            const x = r * Math.sin(phi) * Math.cos(theta) + hemisphere * 1.5;
            const y = r * Math.sin(phi) * Math.sin(theta) * 0.8;
            const z = r * Math.cos(phi) * 1.2;
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            const mixColor = Math.random() > 0.5 ? baseColor : accentColor;
            color.copy(mixColor);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        return { positions, colors, originalPositions };
    }, [colorTheme]);

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(NeuralParticlesShader.uniforms),
        vertexShader: NeuralParticlesShader.vertexShader,
        fragmentShader: NeuralParticlesShader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }), []);

    useEffect(() => {
        shaderMaterial.uniforms.uThemePrimary.value.set(colorTheme.primary);
        shaderMaterial.uniforms.uThemeAccent.value.set(colorTheme.accent);
    }, [colorTheme, shaderMaterial]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        shaderMaterial.uniforms.uTime.value = t;
        shaderMaterial.uniforms.uOverdrive.value = overdrive ? 1 : 0;
        shaderMaterial.uniforms.uSchemaRefine.value = schemaRefine ? 1 : 0;
        shaderMaterial.uniforms.uEmotiveSynth.value = emotiveSynth ? 1 : 0;
        shaderMaterial.uniforms.uCompression.value = compression ? 1 : 0;
        shaderMaterial.uniforms.uVisMode.value = visMode === 'ghost' ? 1 : 0;

        if (pointsRef.current) {
            pointsRef.current.rotation.y = t * (overdrive ? 0.6 : 0.05);
        }

        if (streamsRef.current) {
            streamsRef.current.rotation.z = t * 0.2;
            streamsRef.current.scale.setScalar(1 + Math.sin(t * 10) * 0.05 * (scriptInjection ? 1 : 0));
        }

        if (naturalCoreRef.current && naturalCore) {
            naturalCoreRef.current.rotation.y = t * 0.5;
            naturalCoreRef.current.position.y = Math.sin(t) * 0.2;
            naturalCoreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
        }
    });

    return (
        <group>
            <points ref={pointsRef} material={shaderMaterial}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-originalPosition" count={originalPositions.length / 3} array={originalPositions} itemSize={3} />
                    <bufferAttribute attach="attributes-customColor" count={colors.length / 3} array={colors} itemSize={3} />
                </bufferGeometry>
            </points>

            {/* Natural Core Visualization */}
            {naturalCore && (
                <mesh ref={naturalCoreRef} position={[0, 0, 0]}>
                    <sphereGeometry args={[2.5, 64, 64]} />
                    <meshStandardMaterial 
                        color={colorTheme.primary} 
                        emissive={colorTheme.primary} 
                        emissiveIntensity={20} 
                        transparent 
                        opacity={0.3} 
                        wireframe
                    />
                    <Sparkles count={100} scale={4} color={colorTheme.primary} speed={1} size={3} />
                </mesh>
            )}
            
            {/* Advanced Script Injection Streams */}
            <group ref={streamsRef} visible={scriptInjection}>
                {Array.from({length: 10}).map((_, i) => (
                    <mesh key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                        <torusGeometry args={[5 + i * 0.2, 0.01, 16, 100]} />
                        <meshStandardMaterial color={colorTheme.accent} emissive={colorTheme.accent} emissiveIntensity={5} transparent opacity={0.2} />
                    </mesh>
                ))}
            </group>
            
            {/* Indexing Upgrade Nodes */}
            {indexingMode && Array.from({length: 20}).map((_, i) => {
                const angle = (i / 20) * Math.PI * 2;
                const r = 6;
                const x = Math.cos(angle) * r;
                const z = Math.sin(angle) * r;
                const y = Math.cos(angle * 2) * 3;
                
                return (
                    <mesh 
                        key={i} 
                        position={[x, y, z]} 
                        onClick={() => {
                            setHoveredNode(`INDEX_ENTRY_${i.toString(16).toUpperCase()}: ${['LOGIC_STREAM', 'MEMORY_BUFFER', 'EMOTIVE_CORE', 'SYNTH_ENGINE'][i%4]}`);
                            if (hapticMode) {
                                // Simulate click feedback
                            }
                        }}
                        onPointerEnter={() => hapticMode && setHoveredNode(`SCANNING_NODE_${i}`)}
                        onPointerLeave={() => setHoveredNode(null)}
                    >
                        <boxGeometry args={[0.3, 0.3, 0.3]} />
                        <meshStandardMaterial 
                            color={colorTheme.primary} 
                            emissive={colorTheme.primary} 
                            emissiveIntensity={collectiveLink ? 15 : 5} 
                        />
                    </mesh>
                )
            })}
        </group>
    );
}


export const NeuralBrainSection = ({ setActiveTab }: { data: any, setActiveTab?: (tab: any) => void }) => {
    // Persistent Toggles using localStorage
    const [hudActive, setHudActive] = useState(() => {
        if (typeof window === 'undefined') return true;
        return localStorage.getItem('neural_hud') !== 'false';
    });
    const [schemaRefine, setSchemaRefine] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_schemaRefine') === 'true';
    });
    const [overdrive, setOverdrive] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_overdrive') === 'true';
    });
    const [indexingMode, setIndexingMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_indexing') === 'true';
    });
    const [emotiveSynth, setEmotiveSynth] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_emotive') === 'true';
    });
    const [safetyProtocol, setSafetyProtocol] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_safety') === 'true';
    });
    const [scriptInjection, setScriptInjection] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_script') === 'true';
    });
    const [collectiveLink, setCollectiveLink] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_collective') === 'true';
    });
    const [naturalCore, setNaturalCore] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_naturalCore') === 'true';
    });
    const [compression, setCompression] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('neural_compression') === 'true';
    });
    
    // New Advanced Toggles
    const [hapticMode, setHapticMode] = useState(false);
    const [visMode, setVisMode] = useState<'solid' | 'ghost' | 'wire'>('solid');
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('neural_hud', hudActive.toString());
        localStorage.setItem('neural_schemaRefine', schemaRefine.toString());
        localStorage.setItem('neural_overdrive', overdrive.toString());
        localStorage.setItem('neural_indexing', indexingMode.toString());
        localStorage.setItem('neural_emotive', emotiveSynth.toString());
        localStorage.setItem('neural_safety', safetyProtocol.toString());
        localStorage.setItem('neural_script', scriptInjection.toString());
        localStorage.setItem('neural_collective', collectiveLink.toString());
        localStorage.setItem('neural_naturalCore', naturalCore.toString());
        localStorage.setItem('neural_compression', compression.toString());
        localStorage.setItem('neural_haptic', hapticMode.toString());
        localStorage.setItem('neural_visMode', visMode);
    }, [hudActive, schemaRefine, overdrive, indexingMode, emotiveSynth, safetyProtocol, scriptInjection, collectiveLink, naturalCore, compression, hapticMode, visMode]);

    // Logs
    const [systemLogs, setSystemLogs] = useState<string[]>(['Neural OS 2.0 Initialization Complete.', 'Advanced Core Options Loaded.']);

    useEffect(() => {
        const addLog = (msg: string) => {
            setSystemLogs(prev => [...prev.slice(-4), msg]);
        };

        if (overdrive) addLog('> OVERDRIVE: Disabling cortex limiters. Extreme rotation.');
        if (indexingMode) addLog('> DB_UPGRADE: knowledge_lattice.idx - Multi-thread indexing.');
        if (scriptInjection) addLog('> INJECT: behavioral_payload.js - Initializing script streams.');
        if (schemaRefine) addLog('> REFINE: Synaptic grid snapping enabled. Optimizing data.');
        if (safetyProtocol) addLog('> FIREWALL: Red zones active. Protecting core consciousness.');
        if (collectiveLink) addLog('> SYNC: HiveMind link established. Global node access.');
        if (naturalCore) addLog('> CORE: Natural harmonics activated. Organic synapse flow.');
        if (hapticMode) addLog('> TOUCH: Proximity sensors calibrated. High sensitivity.');
        if (compression) addLog('> COMPRESS: Synaptic data folding active.');
    }, [overdrive, indexingMode, scriptInjection, schemaRefine, safetyProtocol, collectiveLink, hapticMode, naturalCore, compression]);

    // Customization
    const themes = [
        { name: 'Quantum Cyan', primary: '#0ea5e9', accent: '#0284c7' },
        { name: 'Synaptic Violet', primary: '#8b5cf6', accent: '#d946ef' },
        { name: 'Nebula Rose', primary: '#f43f5e', accent: '#fb7185' },
        { name: 'Matrix Green', primary: '#22c55e', accent: '#10b981' }
    ];
    const [currentTheme, setCurrentTheme] = useState(themes[1]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const [showBrainMenu, setShowBrainMenu] = useState<{x: number, y: number} | null>(null);

    const touchTimer = useRef<NodeJS.Timeout | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const x = e.clientX;
        const y = e.clientY;
        touchTimer.current = setTimeout(() => {
            setShowBrainMenu({ x, y });
        }, 800); // 800ms long press
    };

    const handlePointerUp = () => {
        if (touchTimer.current) {
            clearTimeout(touchTimer.current);
            touchTimer.current = null;
        }
    };
    
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowBrainMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <div 
            className="h-[80vh] rounded-[3rem] overflow-hidden border border-white/10 bg-black relative font-mono"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                <color attach="background" args={['#000000']} />
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color={currentTheme.primary} />
                <pointLight position={[-10, -10, -10]} intensity={overdrive ? 3 : 0.5} color={currentTheme.accent} />
                
                <NeuralBrainCore 
                    colorTheme={currentTheme} 
                    overdrive={overdrive}
                    schemaRefine={schemaRefine}
                    indexingMode={indexingMode}
                    emotiveSynth={emotiveSynth}
                    scriptInjection={scriptInjection}
                    compression={compression}
                    collectiveLink={collectiveLink}
                    naturalCore={naturalCore}
                    setHoveredNode={setHoveredNode}
                    hapticMode={hapticMode}
                    visMode={visMode}
                />
                
                {safetyProtocol && (
                    <group>
                        {[10, 12.5, 15].map((radius, i) => (
                            <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
                                <torusGeometry args={[radius, 0.04, 16, 120]} />
                                <meshStandardMaterial 
                                    color="#ff0000" 
                                    emissive="#ff0000" 
                                    emissiveIntensity={20} 
                                    transparent 
                                    opacity={0.5 - (i * 0.15)} 
                                />
                            </mesh>
                        ))}
                    </group>
                )}
                
                {hudActive && (
                    <group>
                        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -5.5, 0]}>
                            <torusGeometry args={[9, 0.05, 16, 100]} />
                            <meshStandardMaterial color={currentTheme.primary} emissive={currentTheme.primary} emissiveIntensity={5} transparent opacity={0.3} />
                        </mesh>
                    </group>
                )}
                
                {emotiveSynth && <Sparkles count={800} scale={15} color={currentTheme.accent} speed={2} opacity={0.5} />}
                
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI} minPolarAngle={0} enableZoom={true} />
            </Canvas>

            {/* Brain Popup Menu */}
            <AnimatePresence>
                {showBrainMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            position: 'fixed',
                            top: Math.min(showBrainMenu.y, window.innerHeight - 200),
                            left: Math.min(showBrainMenu.x, window.innerWidth - 200),
                        }}
                        className="z-50 bg-black/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-2 w-48 shadow-2xl flex flex-col pointer-events-auto"
                        onMouseLeave={() => setShowBrainMenu(null)}
                    >
                        <div className="px-3 py-2 text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold border-b border-emerald-500/20 mb-1">
                            Neural Core Actions
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowBrainMenu(null); setIsTerminalOpen(true); }}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-500/20 rounded-lg text-white/80 hover:text-white transition-colors text-xs uppercase tracking-wider"
                        >
                            <Terminal size={14} className="text-emerald-400" /> Open Terminal
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowBrainMenu(null); if (setActiveTab) setActiveTab('sandbox'); }}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-500/20 rounded-lg text-white/80 hover:text-white transition-colors text-xs uppercase tracking-wider"
                        >
                            <Box size={14} className="text-amber-400" /> Sandbox Env
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowBrainMenu(null); setOverdrive(!overdrive); }}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-500/20 rounded-lg text-white/80 hover:text-white transition-colors text-xs uppercase tracking-wider"
                        >
                            <Zap size={14} className="text-rose-400" /> Toggle Overdrive
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowBrainMenu(null); setEmotiveSynth(!emotiveSynth); }}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-500/20 rounded-lg text-white/80 hover:text-white transition-colors text-xs uppercase tracking-wider"
                        >
                            <Activity size={14} className="text-fuchsia-400" /> Emotive Synth
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UI Overlays */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 pointer-events-none">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 pointer-events-auto">
                    <BrainIcon className="text-white w-6 h-6 animate-pulse" style={{ color: currentTheme.primary }} />
                    <div>
                        <h2 className="text-sm text-white font-bold uppercase tracking-[0.2em]">Neural Brain Lattice</h2>
                        <span className="text-[8px] text-stone-500 uppercase tracking-widest">{overdrive ? 'OVERDRIVE ACTIVE' : 'NOMINAL STATUS'}</span>
                    </div>
                </div>
            </div>

            {/* Node Info Overlay */}
            <AnimatePresence>
                {hoveredNode && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/20 p-4 rounded-xl z-20 pointer-events-none"
                    >
                        <div className="flex items-center gap-3">
                            <Activity size={16} className="text-green-400 animate-pulse" />
                            <span className="text-[10px] text-white tracking-[0.2em] font-bold">{hoveredNode}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Panel */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 z-30 space-y-6">
                
                {/* Advanced Core Toggles Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <ToggleSwitch 
                        icon={<Zap />} 
                        label="Database Index" 
                        active={indexingMode} 
                        onClick={() => setIndexingMode(!indexingMode)} 
                        subLabel="Vector Search"
                        color="#f59e0b"
                    />
                    <ToggleSwitch 
                        icon={<Sliders />} 
                        label="Info Refine" 
                        active={schemaRefine} 
                        onClick={() => setSchemaRefine(!schemaRefine)} 
                        subLabel="Synaptic Snapping"
                        color="#3b82f6"
                    />
                    <ToggleSwitch 
                        icon={<Code />} 
                        label="Script Injection" 
                        active={scriptInjection} 
                        onClick={() => setScriptInjection(!scriptInjection)} 
                        subLabel="Logic Payload"
                        color="#14b8a6"
                    />
                    <ToggleSwitch 
                        icon={<Palette />} 
                        label="Visual Mode" 
                        active={visMode === 'ghost'} 
                        onClick={() => setVisMode(prev => prev === 'solid' ? 'ghost' : 'solid')} 
                        subLabel={visMode === 'solid' ? 'Solid' : 'Ghost'}
                        color="#ec4899"
                    />
                    <ToggleSwitch 
                        icon={<Zap />} 
                        label="Overdrive" 
                        active={overdrive} 
                        onClick={() => setOverdrive(!overdrive)} 
                        subLabel="6.2GHz Active"
                        color="#ef4444"
                    />
                    <ToggleSwitch 
                        icon={<Fingerprint />} 
                        label="Natural Core" 
                        active={naturalCore} 
                        onClick={() => setNaturalCore(!naturalCore)} 
                        subLabel="Organic Sync"
                        color="#10b981"
                    />
                    <ToggleSwitch 
                        icon={<Activity />} 
                        label="Touch Mode" 
                        active={hapticMode} 
                        onClick={() => setHapticMode(!hapticMode)} 
                        subLabel="Haptic Sense"
                        color="#6366f1"
                    />
                    <ToggleSwitch 
                        icon={<Network />} 
                        label="Collective" 
                        active={collectiveLink} 
                        onClick={() => setCollectiveLink(!collectiveLink)} 
                        subLabel="Hive Mind"
                        color="#a855f7"
                    />
                    <ToggleSwitch 
                        icon={<Minimize2 />} 
                        label="Compression" 
                        active={compression} 
                        onClick={() => setCompression(!compression)} 
                        subLabel="Memory Pack"
                        color="#f43f5e"
                    />
                    <ToggleSwitch 
                        icon={<Waves />} 
                        label="Emotive Synth" 
                        active={emotiveSynth} 
                        onClick={() => setEmotiveSynth(!emotiveSynth)} 
                        subLabel="Freq: 432Hz"
                        color="#fb7185"
                    />
                    <ToggleSwitch 
                        icon={<Lock />} 
                        label="Firewall" 
                        active={safetyProtocol} 
                        onClick={() => setSafetyProtocol(!safetyProtocol)} 
                        subLabel="Shield: Max"
                        color="#dc2626"
                    />
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex gap-3">
                        {themes.map(t => (
                            <button 
                                key={t.name}
                                onClick={() => setCurrentTheme(t)}
                                className={`w-8 h-8 rounded-xl border-2 transition-all ${currentTheme.name === t.name ? 'scale-110 border-white' : 'opacity-40 border-transparent hover:opacity-80'}`}
                                style={{ backgroundColor: t.primary }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsTerminalOpen(true)}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 px-4 py-2 rounded-xl text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] transition-all border border-emerald-500/50 hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <Terminal size={14} /> Wake AI
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest leading-none mb-1">Neural Logs</span>
                            <div className="flex gap-1 h-3">
                                {systemLogs.slice(-1).map((log, i) => (
                                    <span key={i} className="text-[9px] text-green-400/70 font-mono italic">{log}</span>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={setActiveTab ? () => setActiveTab('torus') : undefined}
                            className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-xl text-[10px] text-white uppercase tracking-[0.2em] transition-all border border-white/10"
                        >
                            Return to Blueprint
                        </button>
                    </div>
                </div>
            </div>

            {/* Terminal Overlay */}
            <AnimatePresence>
                {isTerminalOpen && <TerminalOverlay onClose={() => setIsTerminalOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

// Enhanced Toggle Switch
const ToggleSwitch = ({ icon, label, active, onClick, subLabel, color }: any) => {
    return (
        <button 
            onClick={onClick}
            className={`group relative flex flex-col items-start p-4 rounded-2xl border transition-all text-left overflow-hidden ${active ? 'bg-white/5 border-white/20' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
        >
            <div className="flex justify-between w-full mb-3">
                <div className={`p-2 rounded-xl ${active ? 'bg-white/10 text-white' : 'bg-black/40 text-stone-600'}`} style={{ color: active && color ? color : undefined }}>
                    {React.cloneElement(icon as React.ReactElement, { size: 16 })}
                </div>
                <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-stone-800'}`}></div>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${active ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}`}>{label}</span>
            <span className="text-[8px] text-stone-600 uppercase tracking-[0.2em]">{subLabel}</span>
            {active && (
                <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
                />
            )}
        </button>
    );
}

// Removing duplicate ToggleSwitch definition
