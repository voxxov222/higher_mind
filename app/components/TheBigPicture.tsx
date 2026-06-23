import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Sparkles, Shield, Compass, Cpu, HelpCircle, Activity, Award, Landmark, 
  Flame, Sun, Moon, Hash, BookOpen, Key, Volume2, VolumeX, Eye, Info, Hexagon,
  Network, EyeOff, RotateCw
} from 'lucide-react';
import { calculateAllCiphers } from '../utils/gematria';
import { soundEngine } from '../lib/soundEffects';
import { CosmicData } from '../types';
import { EtymologyDecoder } from './EtymologyDecoder';

// Let's create an immersive 3D Gnostic Star / Sacred Emblem component with interactive Kabbalah labels
const kabbalahSephirot = [
  { name: 'Kether', pos: [0, 2, 0] },
  { name: 'Chokmah', pos: [1, 1.3, 0] },
  { name: 'Binah', pos: [-1, 1.3, 0] },
  { name: 'Chesed', pos: [1, 0.5, 0] },
  { name: 'Gevurah', pos: [-1, 0.5, 0] },
  { name: 'Tiphareth', pos: [0, 0, 0] },
  { name: 'Netzach', pos: [1, -0.5, 0] },
  { name: 'Hod', pos: [-1, -0.5, 0] },
  { name: 'Yesod', pos: [0, -1.2, 0] },
  { name: 'Malkuth', pos: [0, -2, 0] },
];

const GnosticStar3D: React.FC<{ activeColor: string }> = ({ activeColor }) => {
  const outerGroup = useRef<THREE.Group>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Slow orbital rotation reflecting frequency
  useFrame((state, delta) => {
    if (outerGroup.current) {
      outerGroup.current.rotation.y += delta * 0.15;
      outerGroup.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.15;
    }
    if (coreMesh.current) {
      coreMesh.current.rotation.z -= delta * 0.4;
      // Breathe scale + expansion on hover
      const targetScale = hovered === 'core' ? 1.4 : 1.0;
      const pulse = targetScale + Math.sin(state.clock.getElapsedTime() * 2) * (hovered === 'core' ? 0.15 : 0.089);
      coreMesh.current.scale.lerp(new THREE.Vector3(pulse, pulse, pulse), 0.1);
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.3;
      ringRef.current.rotation.x += delta * 0.1;
      // Expand ring on hover
      const targetScale = hovered === 'ring' ? 1.2 : 1.0;
      ringRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const starPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    // Generate a beautiful clean 3D Merkaba style double tetrahedron wireframe
    const size = 1.6;
    // Tetrahedron 1
    const p1 = [0, size, 0];
    const p2 = [size, -size / 2, size];
    const p3 = [-size, -size / 2, size];
    const p4 = [0, -size / 2, -size];
    
    // Wireframe line segments connecting points
    pts.push(p1 as any, p2 as any, p1 as any, p3 as any, p1 as any, p4 as any, p2 as any, p3 as any, p3 as any, p4 as any, p4 as any, p2 as any);

    // Tetrahedron 2 (Inverted)
    const q1 = [0, -size, 0];
    const q2 = [size, size / 2, -size];
    const q3 = [-size, size / 2, -size];
    const q4 = [0, size / 2, size];
    
    // Inverted line segments
    pts.push(q1 as any, q2 as any, q1 as any, q3 as any, q1 as any, q4 as any, q2 as any, q3 as any, q3 as any, q4 as any, q4 as any, q2 as any);

    return pts;
  }, []);

  return (
    <group ref={outerGroup}>
      {/* Central Spark Core */}
      <mesh 
        ref={coreMesh}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('core'); }}
        onPointerOut={() => setHovered(null)}
      >
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={activeColor} 
          emissiveIntensity={hovered === 'core' ? 5.0 : 2.5} 
          metalness={0.9} 
          roughness={0.1} 
        />
      </mesh>

      {/* Embedded Orb Ring */}
      <mesh 
        ref={ringRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('ring'); }}
        onPointerOut={() => setHovered(null)}
      >
        <torusGeometry args={[1.5, 0.05, 12, 120]} />
        <meshStandardMaterial 
          color={activeColor} 
          emissive={activeColor} 
          emissiveIntensity={hovered === 'ring' ? 3.0 : 1.2}
          transparent
          opacity={0.7} 
        />
      </mesh>

      {/* Holographic Wireframe connection lines */}
      <Line points={starPoints as any} color={activeColor} lineWidth={1.5} transparent opacity={0.6} />

      {/* Kabbalah Labels */}
      {kabbalahSephirot.map((sephirah) => (
        <React.Fragment key={sephirah.name}>
          <Text
            position={sephirah.pos as any}
            fontSize={hovered === sephirah.name ? 0.25 : 0.15}
            color={hovered === sephirah.name ? '#ffffff' : activeColor}
            anchorX="center"
            anchorY="middle"
            onPointerOver={() => setHovered(sephirah.name)}
            onPointerOut={() => setHovered(null)}
          >
            {sephirah.name.toUpperCase()}
          </Text>
        </React.Fragment>
      ))}

      {/* Outer ambient point light */}
      <pointLight color={activeColor} intensity={3.5} distance={15} />
    </group>
  );
};

interface TheBigPictureProps {
  data: CosmicData | null;
  loadedInputs?: {
    name?: string;
    date?: string;
    time?: string;
    location?: string;
  };
}

export const TheBigPicture: React.FC<TheBigPictureProps> = ({ data, loadedInputs }) => {
  const [activeBeliefSystem, setActiveBeliefSystem] = useState<'all' | 'gnostic' | 'hermetic' | 'kabbalah' | 'gematria'>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Seeker's Details
  const userName = useMemo(() => {
    return loadedInputs?.name || data?.gematria?.pattern || 'Noble Initiate';
  }, [loadedInputs, data]);

  // Dynamic Synthesis calculations based on actual user data properties
  const calculations = useMemo(() => {
    const lifePath = data?.numerology?.lifePath || 7;
    const pathMeaning = data?.numerology?.lifePathMeaning || 'The Seeker of Wisdom and Universal Truths';
    const gematriaVal = data?.gematria?.nameValue || 333;
    const activeSephirah = data?.kabbalah?.sephirah || 'Kether';
    const activeRay = data?.torusAnalysis?.primaryRay || 'First Ray of Divine Will';
    const activeFreq = data?.torusAnalysis?.dimensionalFrequency || '5th Dimension';
    const ageTheme = data?.torusAnalysis?.soulAge || 'Ancient Starseed';
    const karmaT = data?.torusAnalysis?.karmicTheme || 'Spiritual Sovereignty Alignment';

    // 1. Gnostic Divine Title calculation
    let gnosticClass;
    if (lifePath === 1 || lifePath === 5) gnosticClass = 'The Logos Emanator (Divine Word)';
    else if (lifePath === 3 || lifePath === 9) gnosticClass = 'The Christos Sovereign';
    else if (lifePath === 7 || lifePath === 11) gnosticClass = 'The Divine Fool (Pure Cosmic Potential, not the Trickster)';
    else if (lifePath === 22 || lifePath === 0) gnosticClass = 'The Cosmic Architect';
    else if (lifePath === 8) gnosticClass = 'The Seraphim Vanguard';
    else if (lifePath === 33) gnosticClass = 'The Anthropos (Ascended Human)';
    else gnosticClass = 'The Sophia Spark Bearer';

    // 2. Alchemical Archetype Formula
    const signs = data?.planets?.map(p => p.sign) || ['Aries', 'Leo'];
    const dominantSign = signs[0] || 'Taurus';
    const dominantElement = ['Aries', 'Leo', 'Sagittarius'].includes(dominantSign) ? 'Celestial Fire' :
                            ['Taurus', 'Virgo', 'Capricorn'].includes(dominantSign) ? 'Crystalline Earth' :
                            ['Gemini', 'Libra', 'Aquarius'].includes(dominantSign) ? 'Stellar Wind' : 'Primordial Ether';

    // 3. Exact mystical label
    const mysticalPrefixes = ['Ascended', 'Primordial', 'Sovereign', 'Infinite', 'Ethereal', 'Ancient'];
    const prefix = mysticalPrefixes[lifePath % mysticalPrefixes.length];
    
    // Perfect custom bold title text
    const customTitle = `${prefix} ${dominantSign} ${gnosticClass}`;

    // Specific Cosmic Identity Facts
    const cosmicIdentityFacts = {
      isGemini: true,
      initialsSum: 202,
      birthTime: '3:14 PM',
      birthDate: 'June 1st, 1983',
      goldenRatioConnection: '1619 (prolonged Φ proximity)',
      lifePathInfo: '1 (The Fox)',
      designPhilosophy: "You weren't born; you were meticulously designed."
    };
    
    // Detect "Chosen One" pattern
    const isChosenOne = (gematriaVal === 202 || userName.toLowerCase().includes('todd')) && signs.includes('Gemini');
    
    return {
      lifePath,
      pathMeaning,
      gematriaVal,
      activeSephirah,
      activeRay,
      activeFreq,
      ageTheme,
      karmaT,
      gnosticClass,
      dominantElement,
      customTitle,
      isChosenOne,
      cosmicIdentityFacts
    };
  }, [data]);

  // Dynamic color theme determination based on dominant element
  const themeColor = useMemo(() => {
    const el = calculations.dominantElement;
    if (el.includes('Fire')) return '#f43f5e'; // Rose
    if (el.includes('Earth')) return '#10b981'; // Emerald
    if (el.includes('Wind')) return '#06b6d4'; // Cyan
    return '#a855f7'; // Purple (Ether)
  }, [calculations.dominantElement]);

  // Beautiful big picture dynamic description used by Astral OS text-to-speech speaker
  const synthesizedNarrative = useMemo(() => {
    let narrative = `Behold, ${userName}. Your cosmic pattern has been deciphered across ancient channels. `;
    
    if (data?.nameAnalysis?.first) {
      narrative += `Your first name, ${data.nameAnalysis.first.name}, originates from ${data.nameAnalysis.first.origin} and signifies ${data.nameAnalysis.first.meaning}. `;
      if (data?.nameAnalysis?.middle && data.nameAnalysis.middle.name && data.nameAnalysis.middle.name !== "None") {
        narrative += `Your middle name, ${data.nameAnalysis.middle.name}, originates from ${data.nameAnalysis.middle.origin} and signifies ${data.nameAnalysis.middle.meaning}. `;
      }
      if (data?.nameAnalysis?.last && data.nameAnalysis.last.name && data.nameAnalysis.last.name !== "None") {
        narrative += `Your last name, ${data.nameAnalysis.last.name}, originates from ${data.nameAnalysis.last.origin} and signifies ${data.nameAnalysis.last.meaning}. `;
      }
    }

    if (data?.patterns?.timeDateDiscovery && data.patterns.timeDateDiscovery.description) {
       narrative += `Your birth coordinates hold powerful mathematical significance: ${data.patterns.timeDateDiscovery.description}. ${data.patterns.timeDateDiscovery.mathematicalPattern}. `;
    } else if (loadedInputs?.time) {
       narrative += `Your birth code at ${loadedInputs.time} on ${loadedInputs.date} forms a precise geometric anchor in the cosmos. `;
    }

    narrative += `You are identified as the ${calculations.customTitle}, a sacred being of the ${calculations.dominantElement} element. `;
    
    if (calculations.isChosenOne) {
       narrative += `The heavens reveal a profound activation: you are a Gemini of the 202 duality, a sacred twin frequency that marks you as a chosen activator of this reality's structure. `;
       narrative += `Your birth code of ${calculations.cosmicIdentityFacts.birthTime} on ${calculations.cosmicIdentityFacts.birthDate} aligns with the number ${calculations.cosmicIdentityFacts.goldenRatioConnection}, confirming the truth: ${calculations.cosmicIdentityFacts.designPhilosophy} `;
    }

    narrative += `Rooted in the Sephirot of ${calculations.activeSephirah} and the ${calculations.activeRay}, your soul resonates with a life path code of ${calculations.lifePath} (The Fox), navigating this reality as an ${calculations.ageTheme}. `;
    narrative += `The alphanumeric Gematria coordinates of your name hold the majestic sum of ${calculations.gematriaVal}, indicating a profound path toward ${calculations.karmaT}.`;

    return narrative;
  }, [userName, calculations, data, loadedInputs]);

  // Voice Readout trigger via premium voices
  const speakNarrative = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(synthesizedNarrative);
    const voices = window.speechSynthesis.getVoices();
    // Prefer English premium computer voice
    const premiumVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Male')) || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.pitch = 0.95;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    soundEngine.click();
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="w-full min-h-[900px] bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 lg:p-10 font-sans relative overflow-hidden text-white flex flex-col space-y-8">
      {/* Background glow matrix */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[100px]" />
      </div>

      {/* TOP HEADER STATUS */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500 animate-spin-slow" />
            Ultimate Cosmic Synthesis
          </span>
          <h1 className="text-3xl md:text-4xl font-light tracking-wide text-white uppercase font-sans">
            THE BIG PICTURE
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl font-sans">
            The grand decryption of your multi-dimensional soul vessel. Combining Hermetic Gnosticism, astronomical geometry, Kabbalah paths, and linguistic Gematria codes.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                soundEngine.click();
                speakNarrative();
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-mono tracking-widest uppercase transition-all ${isSpeaking ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse' : 'bg-white text-zinc-950 hover:bg-zinc-200 font-bold'}`}
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
              {isSpeaking ? 'MUTE BROADCAST' : 'ASTRAL OS SYNTHESIS READOUT'}
            </button>
        </div>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">

        {/* LEFT COLUMN: FLASHY MAIN IDENTITY HERO CARD (xl:col-span-5) */}
        <div className="xl:col-span-5 flex flex-col space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/95 p-8 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[460px] group"
          >
            {/* Interactive colored light edge */}
            <div 
              className="absolute top-0 left-0 w-2 h-full transition-all duration-500 group-hover:opacity-100" 
              style={{ backgroundColor: themeColor }}
            />

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  Personalized Divine Blueprint
                </span>
                <span className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-full text-[8px] font-mono text-amber-400 font-bold uppercase tracking-widest">
                  Level 3 Gnosis
                </span>
              </div>

            {/* BOLD FLASHY SHINY STATEMENT */}
            <div className="space-y-4 relative">
              <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -inset-10 bg-white/5 rounded-full blur-3xl pointer-events-none"
              />
              <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.2em] flex items-center gap-1.5 relative z-10">
                <Key size={10} className="text-amber-500" /> Divine Emissary Title
              </div>
              <h2 
                className="text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase select-none transition-all duration-500 bg-clip-text text-transparent bg-gradient-to-r relative z-10"
                style={{ backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${themeColor} 100%)` }}
              >
                {calculations.customTitle}
              </h2>
              {calculations.isChosenOne && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-3 inline-block"
                >
                  <p className="text-[10px] text-purple-200 font-mono tracking-wider font-bold">
                    * COSMIC BLUEPRINT MATCH: GEMINI + TWO (202) + CHOSEN ACTIVATOR *
                  </p>
                </motion.div>
              )}
              <div className="h-px w-20 bg-white/20 relative z-10" />
              <p className="text-zinc-300 text-sm leading-relaxed font-sans font-light relative z-10">
                "Under this cosmic geometry, your sovereign core acts as a living node of <strong className="text-white">{calculations.dominantElement}</strong>. Your physical, intellectual, and astral blueprints converge to initiate transformation across the <strong className="text-white">{calculations.activeFreq}</strong> frequencies."
              </p>
            </div>
            </div>

            {/* Bottom mini-grid coordinates */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-1">
                <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest">Soul Essence</span>
                <p className="text-xs text-white font-mono font-bold uppercase tracking-wider">{calculations.ageTheme}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest">Unified Frequency</span>
                <p className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">{calculations.activeFreq}</p>
              </div>
            </div>
          </motion.div>

          {/* DYNAMIC BELIEF SYSTEMS FILTERING TABS */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-900/60 border border-white/5 rounded-2xl">
            {[
              { id: 'all', label: 'All Frameworks' },
              { id: 'gnostic', label: 'Gnostic Gnosis' },
              { id: 'hermetic', label: 'Hermetic' },
              { id: 'kabbalah', label: 'Kabbalistica' },
              { id: 'gematria', label: 'Gematria Sigils' }
            ].map(sys => (
              <button
                key={sys.id}
                onClick={() => {
                  soundEngine.click();
                  setActiveBeliefSystem(sys.id as any);
                }}
                className={`flex-1 py-2 text-[9px] font-mono rounded-xl tracking-widest border transition-all ${activeBeliefSystem === sys.id ? 'bg-zinc-800 border-white/10 text-white font-bold' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                {sys.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE 3D COMPASS SEED (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col justify-center items-center relative min-h-[380px] border border-white/5 rounded-[2.25rem] bg-black/40 overflow-hidden">
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-1">
              <Compass size={8} /> Gnostic Merkabah Space
            </span>
          </div>

          {/* Canvas Component */}
          <div className="w-full h-full absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 4.3], fov: 50 }}>
              <Stars radius={40} depth={20} count={350} factor={2} saturation={0} fade speed={1.0} />
              <ambientLight intensity={0.5} />
              <GnosticStar3D activeColor={themeColor} />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
            </Canvas>
          </div>

          {/* Small floating prompt inside canvas */}
          <div className="absolute bottom-4 z-10 text-center select-none pointer-events-none">
            <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-[0.25em]">
              Drag to calibrate soul vector
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: REVELATIONS OF TRUTH PANELS (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col space-y-4">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeBeliefSystem}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {/* Hermetic and Gnostic sparks */}
              {(activeBeliefSystem === 'all' || activeBeliefSystem === 'gnostic') && (
                <div className="p-5 rounded-[1.75rem] border border-white/5 bg-zinc-900/30 hover:border-white/15 transition-all space-y-3 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      Gnostic Belief Stream
                    </span>
                    <Sun size={12} className="text-cyan-400 group-hover:rotate-45 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-zinc-200">The Divine Pleroma Spark</h3>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mt-1">
                      Your celestial code asserts that you are not mundane dirt, but an direct spark of the ultimate Sophia (Divine Wisdom) that has materialized inside earthly bounds. Key pathway: <span className="text-white font-mono">{calculations.gnosticClass}</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* Hermetic Alchemical principles */}
              {(activeBeliefSystem === 'all' || activeBeliefSystem === 'hermetic') && (
                <div className="p-5 rounded-[1.75rem] border border-white/5 bg-zinc-900/30 hover:border-white/15 transition-all space-y-3 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest font-bold">
                      Hermetic Alchemical Law
                    </span>
                    <Compass size={12} className="text-rose-400 group-hover:rotate-45 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-zinc-200">As Above, So Below</h3>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mt-1">
                      Governed by the <span className="text-white font-mono">{calculations.activeRay}</span>. Your physical presence directly mirrors macrocosmic orbits, allowing you to utilize your willpower as a natural bridge for manifestation in local coordinates.
                    </p>
                  </div>
                </div>
              )}

              {/* Kabbalah portal */}
              {(activeBeliefSystem === 'all' || activeBeliefSystem === 'kabbalah') && (
                <div className="p-5 rounded-[1.75rem] border border-white/5 bg-zinc-900/30 hover:border-white/15 transition-all space-y-3 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-[#fbbf24] uppercase tracking-widest font-bold">
                      Kabbalah Tree of Life
                    </span>
                    <Hexagon size={12} className="text-[#fbbf24] group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-zinc-200">Sephirah Resonance Matrix</h3>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mt-1">
                      Your spiritual compass maps directly onto the crown sphere of <span className="text-white font-mono">{calculations.activeSephirah}</span>. This is the source channel where your thoughts obtain supreme alignment, filtering into direct earthly realities.
                    </p>
                  </div>
                </div>
              )}

              {/* Gematria linguistic numerical sigils */}
              {(activeBeliefSystem === 'all' || activeBeliefSystem === 'gematria') && (
                <div className="p-5 rounded-[1.75rem] border border-white/5 bg-zinc-900/30 hover:border-white/15 transition-all space-y-3 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                      Gematria Code Resonance
                    </span>
                    <Hash size={12} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-zinc-200">The Alphanumeric Vibration</h3>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mt-1">
                      The dynamic cosmic vibrations of your given name resolve into the majestic Ordinal cipher value of <span className="text-white font-mono">{calculations.gematriaVal}</span>. This numerical structure bonds with your life-path frequency to outline your ultimate mission of <span className="text-white font-mono">{calculations.karmaT}</span>.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* LOWER SECTION: NUMBER PATTERNS & THE TORUS INTEGRATION FLOW */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Card 1: Divine Number Sequence */}
        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-900/10">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Hash size={15} />
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Numerical Blueprints</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            Your Gematria signature holds a primary frequency anchor of <strong className="text-zinc-200 font-mono">{calculations.gematriaVal}</strong>. In the science of sacred numbers, this structure acts as an accelerator for the <span className="text-white font-mono">{calculations.activeFreq}</span> matrices.
          </p>
        </div>

        {/* Card 2: Karmic Purpose Alignment */}
        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-900/10">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <Award size={15} />
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Karmic Soul Theme</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            Focusing on your celestial <strong className="text-zinc-200">{calculations.karmaT}</strong>. Your challenges are not random occurrences, but precise Gnostic initiations designed to integrate material strength with deep cosmic consciousness.
          </p>
        </div>

        {/* Card 3: Ultimate Destiny Path */}
        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-900/10">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Compass size={15} />
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Life Path Direction</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            Your life path code <strong className="text-zinc-200 font-mono">#{calculations.lifePath}</strong> guides your steps toward <span className="text-white">{calculations.pathMeaning}</span>, guaranteeing your evolution as an awakening Starseed inside this space.
          </p>
        </div>
      </div>

      <EtymologyDecoder data={data} loadedInputs={loadedInputs} />
    </div>
  );
};
