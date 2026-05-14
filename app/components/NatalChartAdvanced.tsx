import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text, Html, Sphere, Ring, Trail, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Compass } from 'lucide-react';
import { HolographicInfoCard } from './HolographicInfoCard';

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const PLANET_MEANINGS: Record<string, string> = {
  'Sun': 'Your core essence and ego. The "I AM" that drives your purpose and vitality.',
  'Moon': 'Your emotional landscape and subconscious needs. How you respond and nurture.',
  'Mercury': 'Your mind and communication style. How you process information and logic.',
  'Venus': 'What you love and value. Governs relationships, beauty, and social harmony.',
  'Mars': 'Your drive and assertion. How you take action, compete, and go after what you want.',
  'Jupiter': 'Expansion and abundance. Where you find growth, luck, and your higher philosophy.',
  'Saturn': 'Karma and structure. Your lessons, boundaries, responsibilities, and discipline.',
  'Uranus': 'Innovation and liberation. Where you seek uniqueness and sudden transformation.',
  'Neptune': 'Spirituality and dreams. Governs intuition, creativity, and the dissolution of boundaries.',
  'Pluto': 'Power and rebirth. Where you experience deep psychological transformation and intensity.',
  'North Node': 'Your soul\'s mission. The direction of growth and destiny in this lifetime.',
  'South Node': 'Karmic background. Talents and habits brought from past experiences.',
  'Chiron': 'The "Wounded Healer." Represents our deepest pain and our capacity to transform it into wisdom.',
  'Lilith': 'The Shadow Self. Represents repressed desires and raw, unpolluted feminine power.'
};

const HOUSE_FALLBACKS: Record<number, { name: string, description: string }> = {
  1: { name: 'Self & Appearance', description: 'The "Front Door" of your personality. How you present yourself and your initial approach to life.' },
  2: { name: 'Values & Resources', description: 'What you value, your material possessions, and your sense of self-worth and security.' },
  3: { name: 'Communication & Learning', description: 'Your everyday mind, sibling relationships, and how you process and share information.' },
  4: { name: 'Home & Roots', description: 'Foundations, family heritage, your inner world, and where you feel most safe.' },
  5: { name: 'Creativity & Joy', description: 'Self-expression, romance, fun, children, and the things that make your heart sing.' },
  6: { name: 'Work & Wellness', description: 'Daily routines, health, service, and how you manage the practical details of life.' },
  7: { name: 'Partnerships', description: 'One-on-one relationships, marriage, and how you mirror yourself through others.' },
  8: { name: 'Transformation', description: 'Deep bonds, shared resources, mystery, sex, and the process of rebirth.' },
  9: { name: 'Expansion & Philosophy', description: 'Higher learning, travel, spirituality, and your quest for meaning and Truth.' },
  10: { name: 'Career & Legacy', description: 'Your public reputation, status, and what you aim to achieve in the world.' },
  11: { name: 'Community & Hopes', description: 'Friends, networks, social causes, and your visions for the future.' },
  12: { name: 'Subconscious & Spirit', description: 'The "Invisible" world. Dreams, intuition, solitude, and universal connection.' }
};
const SIGN_COLORS: Record<string, string> = {
  'Aries': '#ef4444', 'Taurus': '#10b981', 'Gemini': '#fbbf24', 'Cancer': '#94a3b8',
  'Leo': '#f59e0b', 'Virgo': '#84cc16', 'Libra': '#f472b6', 'Scorpio': '#8b5cf6',
  'Sagittarius': '#f97316', 'Capricorn': '#475569', 'Aquarius': '#06b6d4', 'Pisces': '#6366f1'
};

const PLANET_CONFIG: Record<string, { color: string, type: string }> = {
  'Sun': { color: '#FDB813', type: 'star' },
  'Moon': { color: '#E2E8F0', type: 'fluid' },
  'Mercury': { color: '#A5A5A5', type: 'pulse' },
  'Venus': { color: '#E3BB76', type: 'harmonic' },
  'Earth': { color: '#2271B3', type: 'terra' },
  'Mars': { color: '#E27B58', type: 'energetic' },
  'Jupiter': { color: '#D39C7E', type: 'massive' },
  'Saturn': { color: '#C5AB6E', type: 'ringed' },
  'Uranus': { color: '#BBE1E4', type: 'electric' },
  'Neptune': { color: '#6081FF', type: 'fog' },
  'North Node': { color: '#10b981', type: 'karmic' },
  'South Node': { color: '#f43f5e', type: 'karmic' },
  'Chiron': { color: '#8b5cf6', type: 'healer' },
  'Lilith': { color: '#000000', type: 'void' }
};

const ZODIAC_DATA: Record<string, { element: string, ruler: string, archetype: string, description: string, constellation: string, architect: string }> = {
  'Aries': { element: 'Fire', ruler: 'Mars', archetype: 'The Pioneer', architect: 'Primal Spark', description: 'Initiation, courage, and the spark of creation.', constellation: 'Aries' },
  'Taurus': { element: 'Earth', ruler: 'Venus', archetype: 'The Builder', architect: 'Stable Foundation', description: 'Stability, sensuality, and material mastery.', constellation: 'Taurus' },
  'Gemini': { element: 'Air', ruler: 'Mercury', archetype: 'The Messenger', architect: 'Dual Logic', description: 'Curiosity, communication, and duality.', constellation: 'Gemini' },
  'Cancer': { element: 'Water', ruler: 'Moon', archetype: 'The Nurturer', architect: 'Mother of Soul', description: 'Emotion, intuition, and protective instincts.', constellation: 'Cancer' },
  'Leo': { element: 'Fire', ruler: 'Sun', archetype: 'The Sovereign', architect: 'Solar Heart', description: 'Creativity, pride, and radiant self-expression.', constellation: 'Leo' },
  'Virgo': { element: 'Earth', ruler: 'Mercury', archetype: 'The Healer', architect: 'Precision Craft', description: 'Analysis, service, and practical perfection.', constellation: 'Virgo' },
  'Libra': { element: 'Air', ruler: 'Venus', archetype: 'The Diplomat', architect: 'Harmonic Bridge', description: 'Balance, harmony, and relational aesthetics.', constellation: 'Libra' },
  'Scorpio': { element: 'Water', ruler: 'Pluto/Mars', archetype: 'The Alchemist', architect: 'Deep Diver', description: 'Transformation, intensity, and hidden power.', constellation: 'Scorpius' },
  'Sagittarius': { element: 'Fire', ruler: 'Jupiter', archetype: 'The Explorer', architect: 'Higher Truth', description: 'Philosophy, expansion, and the quest for truth.', constellation: 'Sagittarius' },
  'Capricorn': { element: 'Earth', ruler: 'Saturn', archetype: 'The Architect', architect: 'Elder Pillar', description: 'Discipline, structure, and worldly ambition.', constellation: 'Capricornus' },
  'Aquarius': { element: 'Air', ruler: 'Uranus/Saturn', archetype: 'The Visionary', architect: 'Cosmic Genius', description: 'Innovation, rebellion, and collective consciousness.', constellation: 'Aquarius' },
  'Pisces': { element: 'Water', ruler: 'Neptune/Jupiter', archetype: 'The Mystic', architect: 'Oceanic Oneness', description: 'Compassion, imagination, and universal dissolution.', constellation: 'Pisces' }
};

const ZodiacSign = ({ sign, index, selected, onSelect, onResearch, onSave }: any) => {
  const [hovered, setHovered] = useState(false);
  const angle = (index * 30) * Math.PI / 180;
  const midAngle = (index * 30 + 15) * Math.PI / 180;
  const color = SIGN_COLORS[sign] || '#ffffff';
  const data = ZODIAC_DATA[sign];
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      if (hovered || selected) {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, Math.sin(state.clock.elapsedTime * 3) * 2 + 1, 0.1);
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1.1, 0.1));
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1, 0.1));
      }
    }
  });

  return (
    <group>
      {/* Divider Line */}
      <mesh rotation={[0, -angle, 0]} position={[50, 0, 0]}>
        <boxGeometry args={[100, 0.1, 0.1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>

      {/* Interactive wedge */}
      <mesh 
        ref={ringRef}
        rotation={[-Math.PI/2, 0, 0]} 
        position={[0, -0.2, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(selected ? null : sign); }}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <ringGeometry args={[75, 105, 32, 1, angle, 30 * Math.PI / 180]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.2 : hovered ? 0.1 : 0.03} side={THREE.DoubleSide} />
      </mesh>

      <group ref={groupRef}>
        {/* Sign Label */}
        <Text
          position={[Math.cos(midAngle) * 88, 0, Math.sin(midAngle) * 88]}
          rotation={[-Math.PI/2, 0, -midAngle + Math.PI/2]}
          fontSize={3}
          color={color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={selected || hovered ? 1 : 0.6}
        >
          {sign.toUpperCase()}
        </Text>

        {hovered && !selected && (
           <Sparkles 
             position={[Math.cos(midAngle) * 88, 1, Math.sin(midAngle) * 88]}
             count={30} 
             scale={15} 
             size={4} 
             color={color} 
             speed={0.5} 
           />
        )}

        {selected && (
          <Html 
            position={[Math.cos(midAngle) * 115, 10, Math.sin(midAngle) * 115]}
            center
            distanceFactor={20}
            zIndexRange={[100, 0]}
          >
            <div className="translate-x-12 -translate-y-12">
              <HolographicInfoCard
                title={sign.toUpperCase()}
                subtitle={`${data.element} • Ruler: ${data.ruler}`}
                description={`Architect: ${data.architect}\nArchetype: ${data.archetype}\nConstellation: ${data.constellation}\n\n${data.description}`}
                color={color}
                type="sign"
                visible={true}
                onResearch={onResearch}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden"
                style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
              >
                 <div className="absolute top-0 right-0 p-2 opacity-20">
                    <Sparkles size={16} style={{ color }} />
                 </div>
                 <h5 className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">Celestial Blueprint</h5>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <span className="text-[8px] text-stone-500 uppercase block">Element</span>
                       <span className="text-xs text-white" style={{ color }}>{data.element}</span>
                    </div>
                    <div>
                       <span className="text-[8px] text-stone-500 uppercase block">Modality</span>
                       <span className="text-xs text-white">{index % 3 === 0 ? 'Cardinal' : index % 3 === 1 ? 'Fixed' : 'Mutable'}</span>
                    </div>
                 </div>
              </motion.div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

const ZodiacRing = ({ onResearch, onSave }: any) => {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (ringGroupRef.current) {
      // Rotate the entire zodiac ring gently around the center
      // This represents the progression of time and cosmic cycles
      ringGroupRef.current.rotation.y -= delta * 0.02; 
    }
  });

  return (
    <group ref={ringGroupRef}>
      {/* Outer Glow Ring */}
      <mesh rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[100, 102, 128]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Sign Divisions */}
      {SIGN_NAMES.map((sign, i) => (
        <ZodiacSign 
          key={sign} 
          sign={sign} 
          index={i} 
          selected={selectedSign === sign} 
          onSelect={setSelectedSign} 
          onResearch={onResearch}
          onSave={onSave}
        />
      ))}
    </group>
  );
};

// Animated Aspect Lines
const AspectLine = ({ start, end, type }: { start: THREE.Vector3, end: THREE.Vector3, type: string }) => {
  const lineRef = useRef<THREE.Line>(null);
  
  let color = '#ffffff';
  let dashSize = 1;
  let gapSize = 0;
  
  if (type === 'trine') { color = '#34d399'; dashSize = 2; gapSize = 1; }
  else if (type === 'square') { color = '#f87171'; dashSize = 0.5; gapSize = 1; }
  else if (type === 'opposition') { color = '#fb7185'; dashSize = 3; gapSize = 3; }
  else if (type === 'sextile') { color = '#60a5fa'; dashSize = 1; gapSize = 1; }
  else if (type === 'conjunction') { color = '#fcd34d'; dashSize = 100; gapSize = 0; }
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    // Required for dashed lines to work in Three.js
    const lineDistances = new Float32Array([0, start.distanceTo(end)]);
    geo.setAttribute('lineDistance', new THREE.BufferAttribute(lineDistances, 1));
    return geo;
  }, [start, end]);

  useFrame((state) => {
    if (lineRef.current && lineRef.current.material instanceof THREE.LineDashedMaterial) {
      if (type === 'trine') {
        lineRef.current.material.dashOffset -= 0.05; // Flowing energy
      } else if (type === 'square') {
        lineRef.current.material.dashOffset += Math.sin(state.clock.elapsedTime * 10) * 0.05; // Vibrating
      } else if (type === 'opposition') {
        lineRef.current.material.dashOffset -= 0.02; 
        lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2; // Pulsing
      } else {
        lineRef.current.material.dashOffset -= 0.01;
      }
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial 
        color={color} 
        dashSize={dashSize} 
        gapSize={gapSize} 
        transparent 
        opacity={0.4} 
        linewidth={2} 
      />
    </line>
  );
};

const getPlanetRadius = (name: string) => {
  const radii: Record<string, number> = {
    'Sun': 15, 'Moon': 22, 'Mercury': 29, 'Venus': 36, 'Mars': 43,
    'Jupiter': 50, 'Saturn': 57, 'Uranus': 64, 'Neptune': 71,
    'North Node': 78, 'South Node': 78, 'Chiron': 85, 'Lilith': 92
  };
  return radii[name] || 45;
};

const AdvancedPlanet = ({ name, degree, sign, house, selected, onClick, planet, onResearch, onSave }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const config = PLANET_CONFIG[name] || { color: '#ffffff', type: 'basic' };
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  // Ensure we map from 0-30 degrees within the sign wedge
  const exactDegree = signIndex * 30 + (degree % 30);
  const angle = -(exactDegree * Math.PI) / 180;
  
  const r = getPlanetRadius(name);
  const pos = new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      if (config.type === 'pulse') {
        groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      } else if (config.type === 'fluid') {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 2;
      }
      groupRef.current.rotation.y += 0.02;
    }
  });

  const meaning = planet?.meaning || PLANET_MEANINGS[name] || 'A celestial influence in your unique astral blueprint.';

  return (
    <group position={pos}>
      <Trail width={2} length={20} color={config.color} attenuation={(t) => t * t}>
        <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
          <Sphere args={[hovered || selected ? 1.5 : 1, 32, 32]}>
            <meshStandardMaterial 
              color={config.color} 
              emissive={config.color} 
              emissiveIntensity={hovered || selected ? 2 : 0.8} 
              wireframe={config.type === 'geometric'} 
            />
          </Sphere>
          
          <Sparkles count={config.type === 'energetic' ? 100 : 20} scale={3} size={2} color={config.color} />
          
          {(hovered || selected) && (
            <Html center distanceFactor={20} zIndexRange={[100, 0]}>
              <div className="translate-x-32 -translate-y-32">
                <HolographicInfoCard
                  title={name}
                  subtitle={`${Math.floor(degree)}° ${sign} • House ${house}`}
                  description={PLANET_MEANINGS[name] || 'A key player in your celestial drama.'}
                  meaning={meaning}
                  color={config.color}
                  type="planet"
                  visible={true}
                  onResearch={onResearch}
                />
              </div>
            </Html>
          )}

          <pointLight color={config.color} intensity={selected ? 4 : 1} distance={20} />
        </group>
      </Trail>
      
      {/* Anchor Line to edge */}
      <Line 
        points={[[0,0,0], [Math.cos(angle) * (100 - r), 0, Math.sin(angle) * (100 - r)]]} 
        color={config.color} 
        transparent 
        opacity={0.1} 
      />
    </group>
  );
};

const HouseMarker = ({ house, index, hoveredHouse, setHoveredHouse, relevance = 1, onResearch, onSave }: any) => {
  const markerRef = useRef<THREE.Group>(null);
  const startAngle = (index * 30) * Math.PI / 180;
  const midAngle = (index * 30 + 15) * Math.PI / 180;

  useFrame((state) => {
    if (markerRef.current) {
      // Subtle float/pulse for active/hovered houses
      // Energetic relevance drives the speed and scale of the pulse
      const pulse = Math.sin(state.clock.elapsedTime * (1.5 * relevance) + index) * (0.05 * relevance);
      markerRef.current.position.y = pulse;
      
      const targetScale = hoveredHouse === house.houseNumber ? 1.05 + Math.sin(state.clock.elapsedTime * 8) * 0.02 : 1;
      markerRef.current.scale.setScalar(THREE.MathUtils.lerp(markerRef.current.scale.x, targetScale, 0.1));
    }
  });

  return (
    <group ref={markerRef}>
      {/* House segment line */}
      <mesh rotation={[0, -startAngle, 0]} position={[50, -0.4, 0]}>
        <boxGeometry args={[100, 0.1, 0.2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 + (relevance * 0.1)} />
      </mesh>

      {/* Hoverable Area */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        onPointerEnter={() => setHoveredHouse(house.houseNumber)}
        onPointerLeave={() => setHoveredHouse(null)}
      >
        <ringGeometry args={[10, 75, 32, 1, startAngle, 30 * Math.PI / 180]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={hoveredHouse === house.houseNumber ? 0.05 : 0} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* House Number Label */}
      <Text
        position={[Math.cos(midAngle) * 40, 0.1, Math.sin(midAngle) * 40]}
        rotation={[-Math.PI / 2, 0, -midAngle + Math.PI / 2]}
        fontSize={2.5}
        color={hoveredHouse === house.houseNumber ? "#ffffff" : "#666666"}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.5}
      >
        {house.houseNumber}
      </Text>

      {/* House Info Card */}
      {hoveredHouse === house.houseNumber && (
        <Html 
          position={[Math.cos(midAngle) * 45, 2, Math.sin(midAngle) * 45]}
          center
          distanceFactor={20}
        >
          <div className="translate-y-[-100%]">
            <HolographicInfoCard
              title={`House ${house.houseNumber}`}
              subtitle={house.realmName}
              description={house.description}
              color="#8b5cf6"
              type="house"
              visible={true}
              onResearch={onResearch}
            />
          </div>
        </Html>
      )}
    </group>
  );
};

const HouseWedges = ({ houses, planets, onResearch, onSave }: { houses?: any[], planets?: any[], onResearch?: any, onSave?: any }) => {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  const houseData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const num = i + 1;
      const dataHouse = houses?.find(h => h.houseNumber === num);
      const fallback = HOUSE_FALLBACKS[num];
      
      // Calculate relevance based on occupied planets
      const planetCount = planets?.filter(p => p.house === num).length || 0;
      const relevance = 1 + (planetCount * 0.5);

      return {
        houseNumber: num,
        realmName: dataHouse?.realmName || fallback.name,
        description: dataHouse?.description || fallback.description,
        relevance
      };
    });
  }, [houses, planets]);

  return (
    <group>
      {houseData.map((house, i) => (
        <HouseMarker 
          key={house.houseNumber} 
          house={house} 
          index={i} 
          hoveredHouse={hoveredHouse} 
          setHoveredHouse={setHoveredHouse}
          relevance={house.relevance}
          onResearch={onResearch}
          onSave={onSave}
        />
      ))}
    </group>
  );
};

const ChartLegend = () => {
  const [show, setShow] = useState(false);
  
  const planets = Object.keys(PLANET_CONFIG).map(p => ({ name: p, color: PLANET_CONFIG[p].color }));
  const aspects = [
    { name: 'Conjunction', color: '#fcd34d', desc: '0° - Unity, focus, intensity' },
    { name: 'Opposition', color: '#fb7185', desc: '180° - Conflict, balance, awareness' },
    { name: 'Trine', color: '#34d399', desc: '120° - Flow, talent, ease' },
    { name: 'Square', color: '#f87171', desc: '90° - Tension, friction, growth' },
    { name: 'Sextile', color: '#60a5fa', desc: '60° - Opportunity, connection' },
  ];
  
  const signs = [
    { name: 'Aries', element: 'Fire', modality: 'Cardinal' },
    { name: 'Taurus', element: 'Earth', modality: 'Fixed' },
    { name: 'Gemini', element: 'Air', modality: 'Mutable' },
    { name: 'Cancer', element: 'Water', modality: 'Cardinal' },
    { name: 'Leo', element: 'Fire', modality: 'Fixed' },
    { name: 'Virgo', element: 'Earth', modality: 'Mutable' },
    { name: 'Libra', element: 'Air', modality: 'Cardinal' },
    { name: 'Scorpio', element: 'Water', modality: 'Fixed' },
    { name: 'Sagittarius', element: 'Fire', modality: 'Mutable' },
    { name: 'Capricorn', element: 'Earth', modality: 'Cardinal' },
    { name: 'Aquarius', element: 'Air', modality: 'Fixed' },
    { name: 'Pisces', element: 'Water', modality: 'Mutable' },
  ];

  return (
    <Html position={[-140, 60, 0]} center>
      <div className="pointer-events-auto">
        <motion.button
          onClick={() => setShow(!show)}
          className="bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-[10px] text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-2"
        >
          {show ? 'Close Cosmic Legend' : 'Open Cosmic Legend'}
          <Compass size={12} className={show ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </motion.button>
        
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-4 bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl w-72 shadow-2xl space-y-6"
            >
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-4 font-bold">Planetary Bodies</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {planets.map(p => (
                    <div key={p.name} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                      <span className="text-[9px] text-stone-300">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-4 font-bold">Aspect Matrix</h4>
                <div className="space-y-3">
                  {aspects.map(a => (
                    <div key={a.name} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-medium text-white">{a.name}</span>
                        <div className="h-0.5 w-12" style={{ backgroundColor: a.color }}></div>
                      </div>
                      <p className="text-[8px] text-stone-500 italic">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-stone-500 mb-4 font-bold">Zodiac Archetypes</h4>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {signs.map(s => (
                    <div key={s.name} className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <div className="text-[9px] font-bold text-white mb-0.5">{s.name}</div>
                      <div className="flex gap-1 text-[7px] uppercase tracking-tighter">
                        <span className="text-orange-400">{s.element}</span>
                        <span className="text-sky-400">{s.modality}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                 <p className="text-[8px] text-stone-600 leading-relaxed">
                   The chart visualizes cosmic resonance between celestial bodies and your unique soul frequency.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
};

export const NatalChartAdvanced = ({ data, selectedPlanet, onPlanetClick, onResearch, onSave }: any) => {
  const chartRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (chartRef.current) {
      chartRef.current.rotation.y += 0.0005; // Very slow cinematic rotation
    }
  });

  const allBodies = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.planets || []),
      data.nodes?.north && { ...data.nodes.north, name: 'North Node' },
      data.nodes?.south && { ...data.nodes.south, name: 'South Node' },
      data.points?.chiron && { ...data.points.chiron, name: 'Chiron' },
      data.points?.blackMoonLilith && { ...data.points.blackMoonLilith, name: 'Lilith' }
    ].filter(Boolean);
  }, [data]);

  return (
    <group position={[0, -5, 0]}>
      {/* Ambient Cosmic Core */}
      <pointLight color="#3b82f6" intensity={2} distance={100} />
      
      <ChartLegend />
      
      <group ref={chartRef}>
        <ZodiacRing onResearch={onResearch} onSave={onSave} />
        <HouseWedges houses={data?.houses} planets={allBodies} onResearch={onResearch} onSave={onSave} />
        
        {/* Planets and Points */}
        {allBodies.map((planet: any) => (
          <AdvancedPlanet 
            key={planet.name}
            name={planet.name}
            degree={planet.degree}
            sign={planet.sign}
            house={planet.house}
            planet={planet}
            selected={selectedPlanet?.name === planet.name}
            onClick={() => onPlanetClick(planet)}
            onResearch={onResearch}
            onSave={onSave}
          />
        ))}

        {/* Aspects */}
        {data?.aspects?.map((aspect: any, i: number) => {
          const p1 = allBodies.find((p: any) => p.name === aspect.planet1);
          const p2 = allBodies.find((p: any) => p.name === aspect.planet2);
          if (!p1 || !p2) return null;
          
          const getPos = (p: any) => {
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            const signIndex = signs.indexOf(p.sign);
            const exactDegree = signIndex * 30 + (p.degree % 30);
            const angle = -(exactDegree * Math.PI) / 180;
            const r = getPlanetRadius(p.name);
            return new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
          };

          return (
            <AspectLine 
              key={i} 
              start={getPos(p1)} 
              end={getPos(p2)} 
              type={aspect.type} 
            />
          );
        })}
      </group>
    </group>
  );
};
