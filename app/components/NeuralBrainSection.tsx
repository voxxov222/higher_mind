import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Brain as BrainIcon, Activity, Zap, Waves, Network, Lock, Sliders, Search, Eye, ArrowLeft, Code, Minimize2, Power, Palette, Fingerprint, Terminal, Box } from 'lucide-react';
import { TerminalOverlay } from './profile/TerminalOverlay';
import { ConsciousnessStreams } from './ConsciousnessStreams';
import { useHigherMind } from './HigherMindProvider';

// Import sound engine
import { soundEngine } from '../lib/soundEffects';

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
                        emissiveIntensity={40}  // Increased intensity
                        transparent 
                        opacity={0.5} 
                        wireframe
                    />
                    <Sparkles count={200} scale={5} color={colorTheme.primary} speed={1.5} size={4} />
                    <pointLight intensity={10} color={colorTheme.primary} />
                </mesh>
            )}
            
            {/* Added Glow Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.2, 0.02, 16, 100]} />
                <meshBasicMaterial color={colorTheme.accent} transparent opacity={0.6} />
            </mesh>
            
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


export default function NeuralBrainSection({ data, setActiveTab, projectedTab, isMinimal }: { data?: any, setActiveTab?: (tab: any) => void, projectedTab?: string, isMinimal?: boolean }) {
    const { thoughts, feelings, experiences, coherence, alignment } = useHigherMind();
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
    const [initialTerminalCommand, setInitialTerminalCommand] = useState<string | undefined>(undefined);

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
    const startPos = useRef<{x: number, y: number}>({x: 0, y: 0});

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const x = e.clientX;
        const y = e.clientY;
        startPos.current = { x, y };
        touchTimer.current = setTimeout(() => {
            setShowBrainMenu({ x, y });
        }, 600); // 600ms long press
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (touchTimer.current) {
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            if (dx * dx + dy * dy > 100) { // 10px threshold
                clearTimeout(touchTimer.current);
                touchTimer.current = null;
            }
        }
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
            className="h-[80vh] rounded-[3rem] overflow-hidden border border-white/10 bg-black relative font-mono select-none"
            onPointerDownCapture={handlePointerDown}
            onPointerMoveCapture={handlePointerMove}
            onPointerUpCapture={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onContextMenuCapture={handleContextMenu}
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

                <ConsciousnessStreams 
                    thoughts={thoughts} 
                    feelings={feelings} 
                    experiences={experiences} 
                    coherence={coherence} 
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
                
                <OrbitControls enablePan={true} maxPolarAngle={Math.PI} minPolarAngle={0} enableZoom={true} />
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
                            onClick={(e) => { e.stopPropagation(); setShowBrainMenu(null); setInitialTerminalCommand("gh repo clone cline/cline"); setIsTerminalOpen(true); }}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-500/20 rounded-lg text-white/80 hover:text-white transition-colors text-xs uppercase tracking-wider"
                        >
                            <Code size={14} className="text-blue-400" /> Clone Cline Repo
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

            {/* Quality of Life Controls Overlay */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-3 pointer-events-auto w-64">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl">
                    <h3 className="text-xs text-white uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                        <Sliders size={14} className="text-purple-400" /> QoL Overrides
                    </h3>
                    <div className="flex flex-col gap-2">
                        <QoLToggle 
                            icon={<Zap />} 
                            label="Overdrive Mode" 
                            active={overdrive} 
                            onClick={() => setOverdrive(!overdrive)} 
                            color="#ef4444"
                        />
                        <QoLToggle 
                            icon={<Sliders />} 
                            label="Schema Refinement" 
                            active={schemaRefine} 
                            onClick={() => setSchemaRefine(!schemaRefine)} 
                            color="#3b82f6"
                        />
                        <QoLToggle 
                            icon={<Waves />} 
                            label="Emotive Synthesis" 
                            active={emotiveSynth} 
                            onClick={() => setEmotiveSynth(!emotiveSynth)} 
                            color="#fb7185"
                        />
                        <QoLToggle 
                            icon={<Search />} 
                            label="Indexing Mode" 
                            active={indexingMode} 
                            onClick={() => setIndexingMode(!indexingMode)} 
                            color="#f59e0b"
                        />
                        <QoLToggle 
                            icon={<Network />} 
                            label="Collective Link" 
                            active={collectiveLink} 
                            onClick={() => setCollectiveLink(!collectiveLink)} 
                            color="#a855f7"
                        />
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
            {!isMinimal && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 z-30 space-y-6">
                
                {/* Advanced Core Toggles Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                        icon={<Minimize2 />} 
                        label="Compression" 
                        active={compression} 
                        onClick={() => setCompression(!compression)} 
                        subLabel="Memory Pack"
                        color="#f43f5e"
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
            )}

            {/* Spatial Projection Overlay - Floating Panels */}
            <AnimatePresence>
                {projectedTab && projectedTab !== 'brain' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        className="absolute top-32 right-8 w-80 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 z-40 overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent animate-pulse" />
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold mb-1">Spatial Projection</h3>
                                <div className="text-lg text-white font-light uppercase tracking-widest">{projectedTab.replace('_', ' ')}</div>
                            </div>
                            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 animate-pulse">
                                <Zap size={16} />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Summary Projection based on tool */}
                            <ProjectionSummary tab={projectedTab} data={data} />
                        </div>

                        <div className="mt-8 pt-4 border-t border-white/5">
                            <p className="text-[9px] text-stone-500 uppercase tracking-widest leading-relaxed italic">
                                "Mapping {projectedTab} data into global consciousness field..."
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Terminal Overlay */}
            <AnimatePresence>
                {isTerminalOpen && <TerminalOverlay onClose={() => { setIsTerminalOpen(false); setInitialTerminalCommand(undefined); }} initialCommand={initialTerminalCommand} />}
            </AnimatePresence>
        </div>
    );
};

// Enhanced Toggle Switch
const ToggleSwitch = ({ icon, label, active, onClick, subLabel, color }: any) => {
    return (
        <button 
            onClick={(e) => {
                soundEngine.neuralClick();
                if (onClick) onClick(e);
            }}
            onMouseEnter={() => soundEngine.neuralHover()}
            className={`group relative flex flex-col items-start p-4 rounded-2xl border transition-all text-left overflow-hidden ${active ? `bg-${color}/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]` : 'bg-black/20 border-white/5 hover:border-white/10'}`}
        >
            <div className="flex justify-between w-full mb-3 z-10">
                <div className={`p-2 rounded-xl transition-all ${active ? 'bg-white/10 text-white scale-110 shadow-lg' : 'bg-black/40 text-stone-600'}`} style={{ color: active && color ? color : undefined }}>
                    {React.cloneElement(icon as React.ReactElement, { size: 16 })}
                </div>
                <div className={`w-3 h-3 rounded-full transition-all ${active ? 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)] scale-125' : 'bg-stone-800'}`}></div>
            </div>
            <div className="z-10">
                <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 block transition-colors ${active ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}`}>{label}</span>
                <span className={`text-[8px] uppercase tracking-[0.2em] transition-colors ${active ? 'text-white/60' : 'text-stone-600'}`}>{subLabel}</span>
            </div>
            {active && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
                    style={{ backgroundColor: `${color}10` }}
                />
            )}
            {active && (
                <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
                />
            )}
        </button>
    );
}

// Compact QoL Toggle specifically for the overriding panel
const QoLToggle = ({ icon, label, active, onClick, color }: any) => {
    return (
        <button 
            onClick={(e) => {
                soundEngine.neuralClick();
                if (onClick) onClick(e);
            }}
            onMouseEnter={() => soundEngine.neuralHover()}
            className={`group flex items-center justify-between p-3 rounded-2xl border transition-all text-left relative overflow-hidden ${active ? 'bg-white/10 border-white/30 shadow-[0_0_25px_rgba(0,0,0,0.5)]' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
        >
            <div className="flex items-center gap-3 z-10">
                <div className={`p-1.5 rounded-lg transition-all ${active ? 'bg-white/20 text-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-black/40 text-stone-500 group-hover:text-stone-400'}`} style={{ color: active && color ? color : undefined }}>
                    {React.cloneElement(icon as React.ReactElement, { size: 14 })}
                </div>
                <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${active ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}`}>{label}</span>
                    {active && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[7px] text-green-400/80 uppercase tracking-widest mt-1">Status: Active</motion.span>}
                </div>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full transition-all z-10 ${active ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,1)] scale-125' : 'bg-stone-800'}`}></div>
            
            {active && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: color }}
                />
            )}
        </button>
    );
};

function ProjectionSummary({ tab, data }: { tab: string, data?: any }) {
    if (!data) return null;

    switch (tab) {
        case 'numbers':
        case 'gematria_calc':
        case 'angel_numbers':
            return (
                <div className="space-y-4">
                    <ProjectionItem label="Life Path" value={data.numerology.lifePath} />
                    <ProjectionItem label="Expression" value={data.numerology.expression} />
                    <ProjectionItem label="Soul Urge" value={data.numerology.soulUrge} />
                </div>
            );
        case 'celestial_dna':
        case 'torus':
        case 'sky_map':
        case 'daily':
            return (
                <div className="space-y-4">
                    <ProjectionItem label="Sun" value={data.astrology?.sun?.sign || 'N/A'} subValue={`H${data.astrology?.sun?.house || '?'}`} />
                    <ProjectionItem label="Moon" value={data.astrology?.moon?.sign || 'N/A'} subValue={`H${data.astrology?.moon?.house || '?'}`} />
                    <ProjectionItem label="Ascendant" value={data.astrology?.ascendant?.sign || 'N/A'} />
                </div>
            );
        case 'chakras':
            return (
                <div className="space-y-4">
                    <ProjectionItem label="Dominant" value={data.chakras?.[0]?.name || 'N/A'} subValue="Focus Point" />
                    <ProjectionItem label="Energy State" value="Optimized" />
                </div>
            );
        case 'kabbalah':
        case 'kabbalistic_numerology':
        case 'tetragrammaton':
            return (
                <div className="space-y-4">
                    <ProjectionItem label="Primary Sephirah" value={data.kabbalah?.sephirah || 'N/A'} />
                    <ProjectionItem label="Tree Path" value={data.kabbalah?.path || 'N/A'} />
                </div>
            );
        case 'tarot':
            return (
                 <div className="space-y-4">
                    <ProjectionItem label="Active Arcana" value="The Magician" subValue="Spatial Rank 1" />
                    <ProjectionItem label="Frequency" value="Quantum / High" />
                </div>
            );
        case 'chinese_zodiac':
            return (
                <div className="space-y-4">
                    <ProjectionItem label="Animal" value="Dragon" subValue="Empirical" />
                    <ProjectionItem label="Element" value="Fire" />
                    <ProjectionItem label="Energy" value="Yang" />
                </div>
            );
        case 'freemason33':
            return (
                <div className="space-y-4">
                    <ProjectionItem label="Degree" value="33°" subValue="Master" />
                    <ProjectionItem label="Vibration" value="Sovereign" />
                </div>
            );
        default:
            return <div className="text-stone-500 text-[10px] uppercase tracking-widest italic animate-pulse">Synchronizing Neural Metadata...</div>;
    }
}

function ProjectionItem({ label, value, subValue }: { label: string, value: any, subValue?: string }) {
    return (
        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
            <div className="text-[8px] uppercase tracking-widest text-stone-500 mb-1">{label}</div>
            <div className="flex justify-between items-end">
                <div className="text-emerald-300 font-medium tracking-wide">{value}</div>
                {subValue && <div className="text-[9px] text-stone-500 font-mono italic">{subValue}</div>}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
        </div>
    );
}
