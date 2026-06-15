import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Sparkles, Activity, Info, Zap, Compass, RefreshCw, Layers, Shield, 
  FileText, Cpu, Eye, Minimize2, Sliders, Volume2, VolumeX, EyeOff, Check, Hexagon, Maximize2
} from 'lucide-react';
import { calculateAllCiphers } from '../utils/gematria';
import { soundEngine } from '../lib/soundEffects';
import { CosmicData } from '../types';

// Constants for archetypes
const ZODIAC_SIGNS = [
  { name: 'Aries', element: 'Fire', color: '#f87171', description: 'Cardinal Fire: The spark of initiation, boldness, and primordial essence.' },
  { name: 'Taurus', element: 'Earth', color: '#34d399', description: 'Fixed Earth: The vessel of manifest beauty, abundance, and grounding resilience.' },
  { name: 'Gemini', element: 'Air', color: '#fbbf24', description: 'Mutable Air: The bridge of informational exchange, multi-perspective curiosity, and learning.' },
  { name: 'Cancer', element: 'Water', color: '#60a5fa', description: 'Cardinal Water: The sacred sanctuary of cosmic nurturing, intuitive guidance, and memory roots.' },
  { name: 'Leo', element: 'Fire', color: '#fb923c', description: 'Fixed Fire: The sovereign throne of solar creativity, spiritual heart strength, and expression.' },
  { name: 'Virgo', element: 'Earth', color: '#a3e635', description: 'Mutable Earth: The craft of refining material, practical service, and physical attunement.' },
  { name: 'Libra', element: 'Air', color: '#f472b6', description: 'Cardinal Air: The cosmic scales of relationship harmony, artistic elegance, and equilibrium.' },
  { name: 'Scorpio', element: 'Water', color: '#c084fc', description: 'Fixed Water: The primordial depths of deep transformational alchemy, phoenix fire, and raw power.' },
  { name: 'Sagittarius', element: 'Fire', color: '#e879f9', description: 'Mutable Fire: The ascending arrow of truth seeker, higher expansion, and cosmic philosophy.' },
  { name: 'Capricorn', element: 'Earth', color: '#94a3b8', description: 'Cardinal Earth: The high mountain peak of material mastery, structured alignment, and karmic time.' },
  { name: 'Aquarius', element: 'Air', color: '#22d3ee', description: 'Fixed Air: The dynamic flow of humanitarian awakening, lightning flashes of innovation, and stellar hive mind.' },
  { name: 'Pisces', element: 'Water', color: '#818cf8', description: 'Mutable Water: The boundless ocean of universal oneness, mystical dissolution, and astral dreams.' }
];

const HOUSES_META = [
  { num: 1, title: '1st House (Identity)', keyword: 'Self & Emergence', desc: 'The Ascendant threshold, governing first impressions, physical vitality, and initial life spark.' },
  { num: 2, title: '2nd House (Values)', keyword: 'Abundance & Desires', desc: 'Sovereign material resources, security infrastructure, energetic values, and direct self-worth.' },
  { num: 3, title: '3rd House (Mind)', keyword: 'Mentality & Synapses', desc: 'Immediate communication paths, rational logic, dynamic intellect, and local environmental loops.' },
  { num: 4, title: '4th House (Roots)', keyword: 'Soul Foundation', desc: 'The Imum Coeli depth, governing sacred lineage, emotional sanctuary, home roots, and private world.' },
  { num: 5, title: '5th House (Sovereignty)', keyword: 'Creative Spark', desc: 'Sovereign play, romantic spark, creative expression, celestial joy, and inner child expansion.' },
  { num: 6, title: '6th House (Refinement)', keyword: 'Somatic Service', desc: 'Daily ritual execution, physical bodily health, divine service, and refinement of specialized skills.' },
  { num: 7, title: '7th House (Union)', keyword: 'Relational Mirror', desc: 'The Descendant threshold, outlining sacred partnerships, relational mirrors, contracts, and shadow integration.' },
  { num: 8, title: '8th House (Alchemy)', keyword: 'Occult Transformation', desc: 'Metabolic currents, shared energy vaults, intimate bonds, death/rebirth thresholds, and occult secrets.' },
  { name: '9th House', num: 9, title: '9th House (Wisdom)', keyword: 'Higher Horizons', desc: 'The cosmic temple of esoteric philosophy, prophecy, long journeys, and deep spiritual laws.' },
  { num: 10, title: '10th House (Mastery)', keyword: 'Solar Career', desc: 'The Midheaven zenith, governing public dharma path, systemic authority, architectural mastery, and fame.' },
  { num: 11, title: '11th House (Alliance)', keyword: 'Stellar Networks', desc: 'The communal sphere of progressive alliances, humanitarian goals, and collective stream dreams.' },
  { num: 12, title: '12th House (Unity)', keyword: 'Astral Dissolution', desc: 'The collective memory vault, private meditation, karmic release, cosmic dreamscape, and isolation.' }
];

const PLANET_COLORS: { [key: string]: string } = {
  sun: '#f59e0b',
  moon: '#94a3b8',
  mercury: '#10b981',
  venus: '#ec4899',
  mars: '#ef4444',
  jupiter: '#a855f7',
  saturn: '#64748b',
  uranus: '#06b6d4',
  neptune: '#6366f1',
  pluto: '#7c3aed',
  chiron: '#d97706',
  vertex: '#14b8a6',
  node: '#f43f5e'
};

const DEFAULT_PLANETS = [
  { name: 'Sun', sign: 'Taurus', house: 10, degree: 14.5, interpretation: 'Core solar purpose residing in the house of worldly vocation under Taurus grounding.' },
  { name: 'Moon', sign: 'Pisces', house: 8, degree: 22.8, interpretation: 'Subconscious emotional field connected to cosmic mysteries and mystical dream waves.' },
  { name: 'Mercury', sign: 'Aries', house: 9, degree: 5.2, interpretation: 'Fast, initiating intellect exploring philosophical systems and cosmic horizons.' },
  { name: 'Venus', sign: 'Gemini', house: 11, degree: 29.1, interpretation: 'Attracting community alignment through dual intelligence and charming social networks.' },
  { name: 'Mars', sign: 'Scorpio', house: 4, degree: 1.4, interpretation: 'Deep, highly focused action reserves driving emotional healing inside the home matrix.' },
  { name: 'Jupiter', sign: 'Sagittarius', house: 5, degree: 18.0, interpretation: 'Expansive creative luck flowing abundantly through truth alignment and play.' },
  { name: 'Saturn', sign: 'Capricorn', house: 6, degree: 12.7, interpretation: 'Systemic karma refining the somatic vessel and daily rituals with stellar discipline.' },
  { name: 'Uranus', sign: 'Aquarius', house: 7, degree: 8.9, interpretation: 'Sudden relational mirrors sparking collective awakening through progressive links.' },
  { name: 'Neptune', sign: 'Pisces', house: 8, degree: 15.3, interpretation: 'Spiritual psychic radar tuning into hidden shared dimensions and past residues.' },
  { name: 'Pluto', sign: 'Scorpio', house: 4, degree: 25.6, interpretation: 'Profound core lineage alchemy purging early foundations for a magnificent rise.' }
];

const DEFAULT_ASPECTS = [
  { planet1: 'Sun', planet2: 'Moon', type: 'sextile' as const, meaning: 'Harmonious integration of conscious solar ego drives with deep lunar feeling states.' },
  { planet1: 'Mars', planet2: 'Pluto', type: 'conjunction' as const, meaning: 'Supremely concentrated power reservoir yielding relentless focus and deep transformation.' },
  { planet1: 'Moon', planet2: 'Neptune', type: 'conjunction' as const, meaning: 'Extreme spiritual sensitivity, prophetic dreams, and rich artistic visualization.' },
  { planet1: 'Venus', planet2: 'Mars', type: 'opposition' as const, meaning: 'Dynamic relational polarity highlighting attraction balance and fire adjustments.' },
  { planet1: 'Jupiter', planet2: 'Saturn', type: 'trine' as const, meaning: 'Balanced optimism backed by systemic patience, ensuring steady manifestation progress.' }
];

// Helper to determine element color
const getElementColor = (element: string) => {
  switch (element) {
    case 'Fire': return '#ef4444';
    case 'Earth': return '#10b981';
    case 'Air': return '#06b6d4';
    case 'Water': return '#3b82f6';
    default: return '#6366f1';
  }
};

const SEPHIROT = [
  { name: 'Kether', pos: [0, 8, 2], color: '#ffffff', desc: 'The Crown: Infinite Source, Divine Will, and pure singularity.' },
  { name: 'Chokmah', pos: [2, 7, 2], color: '#d1d5db', desc: 'Wisdom: The primordial flash of creation, dynamic force, and enlightenment.' },
  { name: 'Binah', pos: [-2, 7, 2], color: '#111827', desc: 'Understanding: The great mother, structure, restrictive form, and cosmic womb.' },
  { name: 'Chesed', pos: [2, 5, 2], color: '#2563eb', desc: 'Mercy: Expansive love, benevolence, majesty, and divine grace.' },
  { name: 'Gevurah', pos: [-2, 5, 2], color: '#dc2626', desc: 'Strength: Severity, judgment, discipline, and courageous restraint.' },
  { name: 'Tiphareth', pos: [0, 4, 2], color: '#fbbf24', desc: 'Beauty: The heart of the tree, harmony, balance, and solar mediation.' },
  { name: 'Netzach', pos: [2, 2, 2], color: '#16a34a', desc: 'Victory: Endurance, creative desire, emotion, and rhythmic beauty.' },
  { name: 'Hod', pos: [-2, 2, 2], color: '#ea580c', desc: 'Splendor: Communication, mental intelligence, magic, and scientific form.' },
  { name: 'Yesod', pos: [0, 1, 2], color: '#9333ea', desc: 'Foundation: The subconscious filter, lunar patterns, and imaginative flow.' },
  { name: 'Malkuth', pos: [0, -1, 2], color: '#713f12', desc: 'Kingdom: Physical manifestation, grounding, and the material world.' }
];

interface BrainNode {
  id: string;
  label: string;
  type: 'planet' | 'zodiac' | 'house' | 'core';
  pos: THREE.Vector3;
  color: string;
  description: string;
  meta?: any;
}

interface BrainLink {
  source: string;
  target: string;
  type: 'placement' | 'house_link' | 'aspect' | 'core_gravity';
  aspectType?: 'conjunction' | 'square' | 'trine' | 'opposition' | 'sextile';
  strength: number;
}

// 3D Model Render Component using R3F
const AstrologicalNetwork3D = ({
  nodes,
  links,
  activeNodeId,
  setActiveNodeId,
  speed,
  activeColorProfile,
  filteredAspectTypes
}: {
  nodes: BrainNode[];
  links: BrainLink[];
  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;
  speed: number;
  activeColorProfile: string;
  filteredAspectTypes: string[];
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { clock } = useThree();

  // Slow passive rotation of the whole cosmos
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05 * speed;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  // Filter links based on aspect filter
  const visibleLinks = useMemo(() => {
    return links.filter(link => {
      if (link.type !== 'aspect') return true;
      if (!link.aspectType) return true;
      return filteredAspectTypes.includes(link.aspectType);
    });
  }, [links, filteredAspectTypes]);

  // Color mapper depending on the user's active theme profile
  const adjustColor = (hex: string) => {
    if (activeColorProfile === 'monochrome') return '#06b6d4'; // All Holo Cyan
    if (activeColorProfile === 'purple') {
      const c = new THREE.Color(hex);
      return `#${c.offsetHSL(0.2, 0.1, 0).getHexString()}`;
    }
    return hex;
  };

  return (
    <group ref={groupRef}>
      {/* Draw Nodes */}
      {nodes.map(node => {
        const isHovered = activeNodeId === node.id;
        let scale = 1.0;
        if (node.type === 'core') scale = 1.6;
        else if (node.type === 'planet') scale = 1.25;
        
        // Active pulsing scale
        return (
          <NodeMesh 
            key={node.id} 
            node={node} 
            scale={scale} 
            isHovered={isHovered} 
            adjustColor={adjustColor}
            onClick={() => {
              setActiveNodeId(node.id);
            }} 
          />
        );
      })}

      {/* Draw Links */}
      {visibleLinks.map((link, idx) => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return null;

        const isLinkActive = activeNodeId === link.source || activeNodeId === link.target;

        return (
          <LaserBeam 
            key={`${link.source}-${link.target}-${idx}`}
            source={sourceNode.pos}
            target={targetNode.pos}
            type={link.type}
            aspectType={link.aspectType}
            isLinkActive={isLinkActive}
            adjustColor={adjustColor}
            speed={speed}
          />
        );
      })}

      {/* Dynamic central point light sources */}
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#06b6d4" distance={30} />
      <pointLight position={[5, 10, 5]} intensity={1.5} color="#ec4899" distance={40} />
      <pointLight position={[-8, -5, -8]} intensity={1.5} color="#c084fc" distance={40} />
    </group>
  );
};

// Node component inside Canvas
const NodeMesh = ({ 
  node, 
  scale, 
  isHovered, 
  onClick,
  adjustColor 
}: { 
  node: BrainNode; 
  scale: number; 
  isHovered: boolean; 
  onClick: () => void;
  adjustColor: (hex: string) => string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [localHover, setLocalHover] = useState(false);

  // Soft continuous rotation & breathe pulse
  useFrame((state) => {
    if (meshRef.current) {
      if (node.type === 'core') {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.z -= 0.005;
      } else {
        meshRef.current.rotation.y += 0.02;
      }
      // Floating pulse
      const wave = Math.sin(state.clock.getElapsedTime() * 2 + node.pos.x) * 0.06;
      meshRef.current.scale.setScalar(scale + (isHovered || localHover ? 0.3 : 0) + wave);
    }
  });

  const geometry = useMemo(() => {
    switch (node.type) {
      case 'core':
        return new THREE.IcosahedronGeometry(0.5, 2);
      case 'planet':
        return new THREE.SphereGeometry(0.32, 32, 32);
      case 'house':
        return new THREE.CylinderGeometry(0, 0.25, 0.45, 4); // Cool dynamic pyramid nodes
      case 'zodiac':
        return new THREE.OctahedronGeometry(0.28, 0); // Diamon crystal shape
      default:
        return new THREE.SphereGeometry(0.2, 16, 16);
    }
  }, [node.type]);

  const finalColor = useMemo(() => adjustColor(node.color), [node.color, adjustColor]);

  return (
    <group position={node.pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          soundEngine.click();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setLocalHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setLocalHover(false);
          document.body.style.cursor = 'default';
        }}
      >
        {geometry}
        <meshStandardMaterial
          color={isHovered ? '#ffffff' : finalColor}
          emissive={finalColor}
          emissiveIntensity={isHovered ? 2.5 : (localHover ? 1.5 : 0.6)}
          metalness={node.type === 'core' ? 0.9 : 0.8}
          roughness={0.1}
          wireframe={node.type === 'house'}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Floating 3D Label tag */}
      {(isHovered || localHover) && (
        <Html distanceFactor={8} position={[0, 0.6, 0]} center>
          <div className="bg-black/85 backdrop-blur-md text-[10px] text-zinc-300 font-mono px-2 py-0.5 border border-white/10 rounded-md shadow-2xl uppercase tracking-widest whitespace-nowrap pointer-events-none select-none">
            {node.label}
          </div>
        </Html>
      )}

      {/* Miniature glow aura point light */}
      {(isHovered || node.type === 'core') && (
        <pointLight color={finalColor} intensity={2.0} distance={4} />
      )}
    </group>
  );
};

// Holographic laser beam connecting nodes
const LaserBeam = ({
  source,
  target,
  type,
  aspectType,
  isLinkActive,
  adjustColor,
  speed
}: {
  source: THREE.Vector3;
  target: THREE.Vector3;
  type: string;
  aspectType?: string;
  isLinkActive: boolean;
  adjustColor: (hex: string) => string;
  speed: number;
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const particleRef = useRef<THREE.Mesh>(null);

  // Line path calculations
  const points = useMemo(() => [source, target], [source, target]);
  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  // Specific colors for astro-aspect links
  const beamColor = useMemo(() => {
    if (type === 'aspect') {
      switch (aspectType) {
        case 'conjunction': return adjustColor('#06b6d4'); // Cyan
        case 'square': return adjustColor('#ec4899');      // Pink
        case 'trine': return adjustColor('#fbbf24');       // Gold
        case 'opposition': return adjustColor('#f97316');  // Orange
        case 'sextile': return adjustColor('#60a5fa');     // Blue
        default: return adjustColor('#a855f7');
      }
    }
    if (type === 'core_gravity') return adjustColor('#ffffff'); // High white energy
    if (type === 'placement') return adjustColor('#34d399');    // Emerald flow
    return adjustColor('#94a3b8'); // House connections
  }, [type, aspectType, adjustColor]);

  // Firing synapse particle animation
  useFrame((state) => {
    if (particleRef.current) {
      const t = (state.clock.getElapsedTime() * 0.45 * speed) % 1;
      particleRef.current.position.lerpVectors(source, target, t);
    }
  });

  return (
    <group>
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={isLinkActive ? '#ffffff' : beamColor}
          transparent
          opacity={isLinkActive ? 0.8 : (type === 'aspect' ? 0.35 : 0.15)}
          linewidth={isLinkActive ? 2 : 1}
        />
      </line>

      {/* Interactive flowing packet (synapse firing) */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial 
          color={isLinkActive ? '#ffffff' : beamColor} 
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// Main Export Component
export const NeuralSynapticViz: React.FC<{ data: CosmicData | null }> = ({ data }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [colorProfile, setColorProfile] = useState<string>('cosmic'); // cosmic, monochrome, purple
  const [aspectFilter, setAspectFilter] = useState<string[]>(['conjunction', 'square', 'trine', 'opposition', 'sextile']);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showMetadataHud, setShowMetadataHud] = useState(true);

  // Build the nodes & weights dynamically based on user's birth data
  const { nodes, links } = useMemo(() => {
    const computedNodes: BrainNode[] = [];
    const computedLinks: BrainLink[] = [];

    // Core central vertex representing the seeker
    computedNodes.push({
      id: 'core_soul',
      label: 'Consciousness Core',
      type: 'core',
      pos: new THREE.Vector3(0, 0, -0.75),
      color: '#ffffff',
      description: 'The Unified Consciousness Node tying your geometric terrestrial blueprint to cosmic coordinates.'
    });

    // 1. ZODIAC OUTER TEMPLE RING (R=9)
    ZODIAC_SIGNS.forEach((sign, idx) => {
      const theta = (idx / 12) * Math.PI * 2;
      computedNodes.push({
        id: `zodiac_${sign.name.toLowerCase()}`,
        label: sign.name,
        type: 'zodiac',
        pos: new THREE.Vector3(9.2 * Math.cos(theta), 9.2 * Math.sin(theta), 0),
        color: getElementColor(sign.element),
        description: sign.description,
        meta: { element: sign.element }
      });
    });

    // 2. RETRIEVE RELEVANT PLANETS
    const planetsSource = (data && data.planets && data.planets.length > 0) ? data.planets : DEFAULT_PLANETS;

    // Build Planet list & match layout calculations
    planetsSource.forEach((p) => {
      const planetKey = p.name.toLowerCase();
      const matchedColor = PLANET_COLORS[planetKey] || '#a855f7';
      const cleanSignName = p.sign || 'Aries';
      const signIndex = ZODIAC_SIGNS.findIndex(z => z.name.toLowerCase() === cleanSignName.toLowerCase());
      const baseAngle = signIndex !== -1 ? (signIndex / 12) * Math.PI * 2 : 0;
      
      // Calculate angular displacement using degree offsets
      const degreeOffset = ((p.degree || 15) / 30) * (Math.PI * 2 / 12);
      const theta = baseAngle + degreeOffset;
      const R_planet = 5.2;

      // Z height mapped out cleanly on vertical house shifts (1-12 houses)
      const mappedHouse = p.house || 1;
      const zOffset = (mappedHouse - 6.5) * 0.45;

      const posVec = new THREE.Vector3(R_planet * Math.cos(theta), R_planet * Math.sin(theta), zOffset);

      computedNodes.push({
        id: `planet_${planetKey}`,
        label: p.name,
        type: 'planet',
        pos: posVec,
        color: matchedColor,
        description: p.interpretation || p.meaning || `Your cosmic placement of ${p.name} in high aspect fields.`,
        meta: { ...p, hex: matchedColor }
      });

      // Connect planet to corresponding Zodiac sign node
      computedLinks.push({
        source: `planet_${planetKey}`,
        target: `zodiac_${cleanSignName.toLowerCase()}`,
        type: 'placement',
        strength: 0.95
      });

      // Gravity link to core
      computedLinks.push({
        source: `planet_${planetKey}`,
        target: 'core_soul',
        type: 'core_gravity',
        strength: 0.8
      });
    });

    // 3. RETRIEVE RELEVANT HOUSES METADATA
    const housesSource = (data && data.houses && data.houses.length > 0) ? data.houses : HOUSES_META;
    
    housesSource.forEach((h: any) => {
      const houseNum = h.houseNumber || h.num || 1;
      const theta = ((houseNum - 1) / 12) * Math.PI * 2;
      const posVec = new THREE.Vector3(7.2 * Math.cos(theta), 7.2 * Math.sin(theta), -2.2);

      computedNodes.push({
        id: `house_${houseNum}`,
        label: h.realmName || h.title || `House ${houseNum}`,
        type: 'house',
        pos: posVec,
        color: '#6366f1',
        description: h.description || h.desc,
        meta: { num: houseNum, keyword: h.keyword }
      });

      // Connect planet instances directly to their designated resident house node
      planetsSource.forEach((p) => {
        if (p.house === houseNum) {
          computedLinks.push({
            source: `planet_${p.name.toLowerCase()}`,
            target: `house_${houseNum}`,
            type: 'house_link',
            strength: 0.75
          });
        }
      });
    });

    // 4. DEPLOY CUSTOM PLANETARY ASPECTS
    const aspectsSource = (data && data.aspects && data.aspects.length > 0) ? data.aspects : DEFAULT_ASPECTS;

    aspectsSource.forEach(aspect => {
      const p1Key = `planet_${aspect.planet1.toLowerCase()}`;
      const p2Key = `planet_${aspect.planet2.toLowerCase()}`;

      // Ensure both source nodes reside in network
      if (computedNodes.some(n => n.id === p1Key) && computedNodes.some(n => n.id === p2Key)) {
        computedLinks.push({
          source: p1Key,
          target: p2Key,
          type: 'aspect',
          aspectType: aspect.type,
          strength: aspect.type === 'conjunction' ? 1.0 : 0.6
        });
      }
    });

    // 5. KABBALAH SEPHIROT INTEGRATION
    SEPHIROT.forEach(sph => {
        const id = `sephirah_${sph.name.toLowerCase()}`;
        computedNodes.push({
            id,
            label: sph.name,
            type: 'zodiac', // Reuse zodiac shape or refine if needed
            pos: new THREE.Vector3(...sph.pos),
            color: sph.color,
            description: sph.desc
        });

        // Link to matching Planets by energy signature
        const mapping: {[key: string]: string} = {
            'Kether': 'Neptune',
            'Chokmah': 'Uranus',
            'Binah': 'Saturn',
            'Chesed': 'Jupiter',
            'Gevurah': 'Mars',
            'Tiphareth': 'Sun',
            'Netzach': 'Venus',
            'Hod': 'Mercury',
            'Yesod': 'Moon',
            'Malkuth': 'Pluto' // or Earth/Ascendant
        };

        const targetPlanet = mapping[sph.name];
        if (targetPlanet) {
            computedLinks.push({
                source: id,
                target: `planet_${targetPlanet.toLowerCase()}`,
                type: 'core_gravity',
                strength: 0.5
            });
        }
    });

    return { nodes: computedNodes, links: computedLinks };
  }, [data]);

  // Hook details of active node output
  const activeNodeData = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId);
  }, [selectedNodeId, nodes]);

  // Get aspects linking exclusively to the selected node
  const activeNodeAspects = useMemo(() => {
    if (!selectedNodeId) return [];
    const sourcePlanSource = (data && data.aspects && data.aspects.length > 0) ? data.aspects : DEFAULT_ASPECTS;
    const cleanKey = selectedNodeId.replace('planet_', '').toLowerCase();
    
    return sourcePlanSource.filter(a => {
      return a.planet1.toLowerCase() === cleanKey || a.planet2.toLowerCase() === cleanKey;
    });
  }, [selectedNodeId, data]);

  // Alphanumeric Gematria calculations calculated dynamically for the selected node's coordinates text
  const gematriaResults = useMemo(() => {
    if (!activeNodeData) return [];
    
    let phrase = activeNodeData.label;
    if (activeNodeData.type === 'planet' && activeNodeData.meta) {
      phrase = `${activeNodeData.label} in ${activeNodeData.meta.sign} House ${activeNodeData.meta.house}`;
    } else if (activeNodeData.type === 'zodiac') {
      if (activeNodeData.id.startsWith('sephirah_')) {
        phrase = `Sephirah ${activeNodeData.label}`;
      } else {
        phrase = `Zodiac ${activeNodeData.label} Element ${activeNodeData.meta?.element}`;
      }
    } else if (activeNodeData.type === 'house') {
      phrase = `Astral ${activeNodeData.label}`;
    }

    return calculateAllCiphers(phrase).filter(r => 
      ['Ordinal', 'Chaldean', 'Reduction'].includes(r.cipher)
    );
  }, [activeNodeData]);

  // Text voice readout function
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prefer rich tech English voice
    const premiumVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Google US English')) || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.pitch = 0.92;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    soundEngine.click();
  };

  // Safe release speech
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAspect = (type: string) => {
    soundEngine.click();
    setAspectFilter(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="w-full h-full min-h-[800px] bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden relative font-sans group flex flex-col md:flex-row">
      
      {/* 3D GRAPH FLOATING LAYER */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 4, 13], fov: 60 }}>
          <color attach="background" args={['#010103']} />
          <Stars radius={60} depth={50} count={3500} factor={4} saturation={0} fade speed={1.2} />
          <ambientLight intensity={0.4} />
          
          <AstrologicalNetwork3D 
            nodes={nodes}
            links={links}
            activeNodeId={selectedNodeId}
            setActiveNodeId={(id) => {
              soundEngine.click();
              setSelectedNodeId(id);
            }}
            speed={speed}
            activeColorProfile={colorProfile}
            filteredAspectTypes={aspectFilter}
          />
          
          <OrbitControls maxDistance={25} minDistance={4} enableDamping />
        </Canvas>
      </div>

      {/* FLOATING STATUS HUD COVER */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none flex flex-col gap-3">
        <div className="bg-zinc-950/80 backdrop-blur-3xl p-4 rounded-2xl border border-indigo-500/10 pointer-events-auto flex items-center gap-3.5 shadow-2xl">
          <div className="relative">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <h2 className="text-xs font-bold font-mono text-white tracking-[0.25em] uppercase flex items-center gap-2">
              ASTRAL NEURAL TOPOLOGY
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <Activity size={10} className="text-cyan-400 animate-pulse" />
              <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
                Higher Mind Quantum Grid v2.1
              </span>
            </div>
          </div>
        </div>

        {/* Live System Diagnostics */}
        {showMetadataHud && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/75 backdrop-blur-2xl p-4 rounded-2xl border border-white/5 pointer-events-auto space-y-2 text-[10px] text-zinc-400 font-mono tracking-wider w-64 shadow-xl"
          >
            <div className="flex justify-between">
              <span>ORBIT SYMPATHY:</span> <span className="text-cyan-400 font-bold">100% SECURE</span>
            </div>
            <div className="flex justify-between">
              <span>CELESTIAL NODES:</span> <span className="text-zinc-200">{nodes.length} UNITS</span>
            </div>
            <div className="flex justify-between">
              <span>QUANTUM BEAMS:</span> <span className="text-zinc-200">{links.length} RELAYS</span>
            </div>
            <div className="flex justify-between">
              <span>SOLFEGGIO BEAT:</span> <span className="text-amber-400">528Hz ACTIVE</span>
            </div>
            <div className="pt-1.5 border-t border-white/5 text-[8px] text-zinc-600 uppercase flex items-center gap-1">
              <Shield size={8} /> ASTRAL OS PROTOCOL DEPLOYED
            </div>
          </motion.div>
        )}
      </div>

      {/* FLOAT TOP RIGHT: INTERACTIVE CONTROL COMPASS PANEL */}
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        {/* Toggle Diagnostic Metadata HUD */}
        <button 
          onClick={() => {
            soundEngine.click();
            setShowMetadataHud(!showMetadataHud);
          }}
          className={`p-3 rounded-xl border transition-all shadow-xl bg-zinc-950/80 backdrop-blur-xl hover:border-white/20 ${showMetadataHud ? 'border-cyan-500/25 text-cyan-400' : 'border-white/5 text-zinc-500'}`}
          title="Toggle System Diagnostics HUD"
        >
          {showMetadataHud ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>

      {/* LEFT DRAWER CONTROL OVERLAY: SIMULATION SWITCH & ASPECT FILTERS */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3 min-w-[260px]">
        {/* Slider control component */}
        <div className="bg-zinc-950/80 backdrop-blur-3xl p-4 border border-white/10 rounded-2xl space-y-3.5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h4 className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
              <Sliders size={11} className="text-cyan-400" /> SIMULATION MATRIX
            </h4>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-cyan-400 font-bold">
              SPEED: {speed.toFixed(1)}X
            </span>
          </div>

          <div className="space-y-1">
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.1"
              value={speed}
              onChange={(e) => {
                setSpeed(parseFloat(e.target.value));
              }}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[8px] font-mono text-zinc-600">
              <span>DRIFT</span>
              <span>BALANCED</span>
              <span>MAX PULSE</span>
            </div>
          </div>

          {/* Color profiles */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Holo Color Hue profile</div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'cosmic', label: 'Celestial' },
                { id: 'monochrome', label: 'Holo' },
                { id: 'purple', label: 'Nebula' }
              ].map(profile => (
                <button
                  key={profile.id}
                  onClick={() => {
                    soundEngine.click();
                    setColorProfile(profile.id);
                  }}
                  className={`py-1 text-[8px] font-mono rounded tracking-widest border transition-all ${colorProfile === profile.id ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-transparent border-white/5 text-zinc-500 hover:text-white'}`}
                >
                  {profile.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aspects filters checklist */}
        <div className="bg-zinc-950/80 backdrop-blur-3xl p-4 border border-white/10 rounded-2xl space-y-2.5 shadow-2xl">
          <h4 className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
            <Compass size={11} className="text-amber-400" /> APERTURE SYNAPSE ACTIVE
          </h4>
          
          <div className="space-y-1.5">
            {[
              { id: 'conjunction', label: 'Conjunction (0°)', color: 'border-cyan-500/20 text-cyan-400' },
              { id: 'square', label: 'Square (90°)', color: 'border-pink-500/20 text-pink-400' },
              { id: 'trine', label: 'Trine (120°)', color: 'border-yellow-500/20 text-yellow-400' },
              { id: 'opposition', label: 'Opposition (180°)', color: 'border-orange-500/20 text-orange-400' },
              { id: 'sextile', label: 'Sextile (60°)', color: 'border-blue-500/20 text-blue-400' }
            ].map(aspect => {
              const active = aspectFilter.includes(aspect.id);
              return (
                <button
                  key={aspect.id}
                  onClick={() => handleToggleAspect(aspect.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 border rounded-xl text-[9px] font-mono transition-all text-left ${active ? aspect.color + ' bg-zinc-900/60' : 'border-white/5 text-zinc-600 hover:text-zinc-400'}`}
                >
                  <span>{aspect.label}</span>
                  {active && <Check size={10} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE DETAILS DRAWER: NODE MATRIX COMPASS */}
      <AnimatePresence>
        {activeNodeData && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:absolute top-6 bottom-6 right-6 md:w-[350px] bg-zinc-950/90 md:backdrop-blur-3xl border border-white/10 rounded-[1.75rem] p-5 z-20 flex flex-col justify-between overflow-y-auto shadow-2xl space-y-4"
          >
            {/* Header description */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.25em]">
                  Focal Synapse Node
                </span>
                <button
                  onClick={() => {
                    soundEngine.click();
                    setSelectedNodeId(null);
                  }}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  title="Close Node details"
                >
                  <Minimize2 size={12} className="rotate-45" />
                </button>
              </div>

              {/* Title & Classification */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center p-2"
                  style={{ backgroundColor: `${activeNodeData.color}15`, borderColor: `${activeNodeData.color}35` }}
                >
                  <Hexagon size={18} style={{ color: activeNodeData.color }} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-white font-mono tracking-tight">{activeNodeData.label}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span 
                      className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest border border-white/5"
                      style={{ color: activeNodeData.color }}
                    >
                      {activeNodeData.type}
                    </span>
                    {activeNodeData.meta?.element && (
                      <span className="text-[8px] font-mono text-zinc-500 uppercase bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded">
                        {activeNodeData.meta.element}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Deep Archetypal Narrative */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                <div className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest">Archetype Summary</div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans italic">
                  &ldquo;{activeNodeData.description}&rdquo;
                </p>
                {activeNodeData.meta?.degree && (
                  <div className="pt-2 text-[9px] font-mono text-zinc-500 uppercase flex justify-between">
                    <span>Chart Coordinates:</span>
                    <span className="text-cyan-400">{activeNodeData.meta.degree.toFixed(2)}° degrees</span>
                  </div>
                )}
                {activeNodeData.meta?.house && (
                  <div className="text-[9px] font-mono text-zinc-500 uppercase flex justify-between">
                    <span>House Residence:</span>
                    <span className="text-cyan-400">House {activeNodeData.meta.house}</span>
                  </div>
                )}
              </div>

              {/* Connected Active Aspects */}
              {activeNodeData.type === 'planet' && activeNodeAspects.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap size={10} className="text-amber-400" /> Active Chart Aspects ({activeNodeAspects.length})
                  </h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
                    {activeNodeAspects.map((aspect, idx) => {
                      const isPlanet1 = aspect.planet1.toLowerCase() === activeNodeData.label.toLowerCase();
                      const alliedPlanet = isPlanet1 ? aspect.planet2 : aspect.planet1;
                      return (
                        <div key={idx} className="p-2.5 bg-zinc-900/40 border border-white/5 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-white uppercase font-bold">{aspect.type} to {alliedPlanet}</span>
                            <span className="text-[8px] text-zinc-500 uppercase">Aspect Relational Flow</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-sans leading-snug">{aspect.meaning}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Gematria Alphanumeric Profile calculation */}
              <div className="space-y-2 pt-1">
                <h4 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Network size={10} className="text-cyan-400" /> Alphanumeric Resonance Profile
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {gematriaResults.map((result, index) => (
                    <div key={index} className="p-2.5 bg-black border border-white/5 rounded-xl text-center space-y-1">
                      <div className="text-[7.5px] text-zinc-500 font-mono uppercase tracking-wider">{result.cipher}</div>
                      <div className="text-lg font-mono font-bold text-white leading-none">{result.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Speaking voice & bottom buttons */}
            <div className="space-y-2 pt-4 border-t border-white/5 pointer-events-auto">
              <button
                onClick={() => {
                  let phrase = activeNodeData.description;
                  if (activeNodeData.type === 'planet' && activeNodeData.meta) {
                    phrase = `${activeNodeData.label} placement in ${activeNodeData.meta.sign}, in the ${activeNodeData.meta.house} house. ${activeNodeData.description}`;
                  }
                  speakText(phrase);
                }}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${isSpeaking ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse' : 'bg-cyan-500 hover:bg-cyan-400 text-black border border-transparent font-black'}`}
              >
                {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                {isSpeaking ? 'SILENCE BROADCAST' : 'AOS VOCAL TELEMETRY'}
              </button>
              
              <button
                onClick={() => {
                  soundEngine.click();
                  setSelectedNodeId(null);
                }}
                className="w-full py-3 bg-zinc-900 border border-white/5 hover:border-white/20 transition-all rounded-2xl text-[9px] font-mono text-zinc-400 uppercase tracking-widest hover:text-white"
              >
                Return to Cosmos Space
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM LEGEND OVERLAY */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none hidden lg:block">
        <div className="p-4 bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-2xl pointer-events-auto flex gap-5 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest leading-none">
              Aura core
            </span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
            <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest leading-none">
              Planets
            </span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-[#f87171]" />
            <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest leading-none">
              Zodiac Elements
            </span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#6366f1]" style={{ transform: 'rotate(45deg)' }} />
            <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest leading-none">
              Houses
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
