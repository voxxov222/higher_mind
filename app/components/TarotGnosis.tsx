import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Html, Float, Center, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { 
  Sparkles as SparklesIcon, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  BookOpen, 
  Compass, 
  Sun, 
  Moon, 
  CheckCircle, 
  Compass as CompassIcon, 
  ArrowRight, 
  RotateCw, 
  HelpCircle,
  Eye,
  Activity,
  Layers,
  Flame,
  Droplet,
  Wind
} from 'lucide-react';

// Tarot Cards Gnosis Database
interface TarotCardData {
  id: string;
  name: string;
  num: number;
  roman: string;
  astrology: string;
  kabbalah: string;
  gematria: number;
  solfeggio: number;
  element: 'Air' | 'Water' | 'Fire' | 'Earth' | 'Aether';
  keyword: string;
  description: string;
  shadow: string;
  divineGnosis: string;
  sephirah: string;
  practices: string[];
}

const TAROT_DATABASE: TarotCardData[] = [
  {
    id: 'fool',
    name: 'The Fool',
    num: 0,
    roman: '0',
    astrology: 'Uranus / Cosmic Wind',
    kabbalah: 'Path of Aleph (Kether to Chokmah)',
    gematria: 45,
    solfeggio: 396,
    element: 'Air',
    keyword: 'Spontaneous Emergence & Raw Potential',
    description: 'The archetype of the ultimate leap, stepping off the physical cliff into celestial alignment, trustful of the divine coordinate system.',
    shadow: 'Naivety, reckless disregard of spatial constraints, escapism from earthly duties.',
    divineGnosis: 'You are the zero point. Every coordinate is birthed from your willingness to step into the complete unknown without cellular hesitation.',
    sephirah: 'Kether (The Sovereign Crown)',
    practices: [
      'Breathe into the void without anchoring a specific thought.',
      'Calibrate with Solfeggio 396 Hz to dissolve genetic fear of failure.',
      'Take an experimental action that bypasses standard logic.'
    ]
  },
  {
    id: 'magician',
    name: 'The Magician',
    num: 1,
    roman: 'I',
    astrology: 'Mercury / Temporal Scribe',
    kabbalah: 'Path of Beth (Kether to Binah)',
    gematria: 412,
    solfeggio: 528,
    element: 'Air',
    keyword: 'Unified Channeling of Manifest Force',
    description: 'Bridging the infinite below with the boundless above. Placing the wand, cup, sword, and pentacle in perfect geometric focus to construct reality.',
    shadow: 'Egoic manipulation, deceit, scattered focus, misaligning psychic power for self-interest.',
    divineGnosis: 'As above, so below. Your mind is an antenna. When you organize your inner elementals, the physical world must crystallize around your intent.',
    sephirah: 'Chokmah (Cosmic Wisdom)',
    practices: [
      'Align key tools on an altar to anchor spatial focus.',
      'Practice deep breathing matching the cadence of 528 Hz.',
      'Journal absolute intentions in clear, non-negotiable sentences.'
    ]
  },
  {
    id: 'high_priestess',
    name: 'The High Priestess',
    num: 2,
    roman: 'II',
    astrology: 'Moon / Intuitive Ocean',
    kabbalah: 'Path of Gimel (Kether to Tiphereth)',
    gematria: 83,
    solfeggio: 741,
    element: 'Water',
    keyword: 'Silent Oracle & Unseen Blueprint',
    description: 'Guardian of the temple pillars of Boaz and Jachin. She spans the celestial void and keeps the scrolls of ancient esoteric pathways.',
    shadow: 'Secrets used as poison, frozen inaction, denial of human emotions, spiritual superiority.',
    divineGnosis: 'Know without thinking. Let your third eye float on the dark waters. The scroll of wisdom only unrolls when you yield to stillness.',
    sephirah: 'Binah (Supreme Understanding)',
    practices: [
      'Sit in total sensory darkness for 15 minutes before sleep.',
      'Listen to Gemini-attuned frequencies and track subtle cellular echoes.',
      'Acknowledge dreams as the true blueprints of daily events.'
    ]
  },
  {
    id: 'empress',
    name: 'The Empress',
    num: 3,
    roman: 'III',
    astrology: 'Venus / Earth Mother',
    kabbalah: 'Path of Daleth (Chokmah to Binah)',
    gematria: 434,
    solfeggio: 639,
    element: 'Earth',
    keyword: 'Infinite Synthesis & Fertile Abundance',
    description: 'The golden crown of twelve stars, bringing the formless concept into organic physical birth. She presides over the rich, living matrix of life.',
    shadow: 'Suffocation, sensory overindulgence, financial dependency, creative stagnancy.',
    divineGnosis: 'Every seedling carries the geometry of the forest. Trust the slow, sacred gestation of your core projects; do not force the bloom early.',
    sephirah: 'Chesed (Loving Kindness and Expansion)',
    practices: [
      'Meditate while focusing on the expansion of your heart center.',
      'Walk barefoot on damp earth to sync with planetary cycles.',
      'Create or synthesize a physical relic of artistic expression.'
    ]
  },
  {
    id: 'emperor',
    name: 'The Emperor',
    num: 4,
    roman: 'IV',
    astrology: 'Aries / Primal Spark',
    kabbalah: 'Path of Heh (Chokmah to Tiphereth)',
    gematria: 10,
    solfeggio: 174,
    element: 'Fire',
    keyword: 'Structural Mastery & Divine Order',
    description: 'The stone throne of law and geometry. Applying strategic order to the fluid streams of the cosmos to build lasting castles in reality.',
    shadow: 'Brutal tyranny, dogmatic stiffness, emotional emotional arrest, fragile security complexes.',
    divineGnosis: 'Stability is the womb of exploration. Set boundaries not to cage yourself, but to structure a sanctuary where your light can shine unhampered.',
    sephirah: 'Gevurah (Spiritual Might & Boundary)',
    practices: [
      'Organize your calendar with geometric, sacred schedules.',
      'Stand in power posture for 2 minutes to charge solar plexus energy.',
      'Discard clutter or broken patterns that drain sovereign energy.'
    ]
  },
  {
    id: 'hierophant',
    name: 'The Hierophant',
    num: 5,
    roman: 'V',
    astrology: 'Taurus / Sacred Foundation',
    kabbalah: 'Path of Vav (Chokmah to Chesed)',
    gematria: 12,
    solfeggio: 285,
    element: 'Earth',
    keyword: 'Esoteric Wisdom & Celestial Lineage',
    description: 'The master initiator who sits between the cosmic columns. He holds the triple key to unlock celestial secrets and coordinates rituals.',
    shadow: 'Orthodox brainwashing, blind peer allegiance, rigid academic gatekeeping, spiritual dogma.',
    divineGnosis: 'The keys are in your hand. Systemized knowledge is only a map; the true initiator is the quiet cellular voice that recognizes Truth.',
    sephirah: 'Tiphereth (Celestial Beauty & Hub)',
    practices: [
      'Engage in deep study of numeric codes (Gematria) or astronomy.',
      'Hum a continuous note to resonate your vocal chords at 285 Hz.',
      'Perform a simple daily ritual to anchor your highest intent.'
    ]
  },
  {
    id: 'lovers',
    name: 'The Lovers',
    num: 6,
    roman: 'VI',
    astrology: 'Gemini / Alchemical Balance',
    kabbalah: 'Path of Zayin (Binah to Tiphereth)',
    gematria: 17,
    solfeggio: 639,
    element: 'Air',
    keyword: 'Polar Synergy & Sacred Conjunction',
    description: 'The cosmic choice, synthesizing the masculine and feminine currents of consciousness under the wings of the celestial angel of harmony.',
    shadow: 'Internal fragmentation, superficial relationships, betrayal of values to fit in.',
    divineGnosis: 'You are whole. When you seek the divine beloved outside, you chase shadows. Synthesize the dualities within, and reality will reflect unity.',
    sephirah: 'Netzach (Triumphant Victory)',
    practices: [
      'Map your light and shadow attributes side-by-side with complete honesty.',
      'Re-anchor damaged relationships with a heartfelt message of harmony.',
      'Use 639 Hz to bridge cerebral polarities in your daily meditation.'
    ]
  },
  {
    id: 'chariot',
    name: 'The Chariot',
    num: 7,
    roman: 'VII',
    astrology: 'Cancer / Celestial Shield',
    kabbalah: 'Path of Cheth (Binah to Gevurah)',
    gematria: 418,
    solfeggio: 417,
    element: 'Water',
    keyword: 'Channeled Momentum & Psychic Armor',
    description: 'Riding the chariot of contrasting black and white sphinxes. Directing contrasting emotional states to storm the peaks of victory.',
    shadow: 'Violent control, loss of grip, directionless hustle, burning out from fighting self.',
    divineGnosis: 'Real control is silent alignment. You do not whip your dualities into submission; you command them by remaining centered in the absolute present.',
    sephirah: 'Hod (Majestic Resonance & Code)',
    practices: [
      'Define a core daily mission and remove all secondary tangents.',
      'Let go of emotional resistance by practicing breathing cycles in 417 Hz.',
      'Visualize a shimmering silver-indigo aura surrounding your fields as protective armor.'
    ]
  },
  {
    id: 'hermit',
    name: 'The Hermit',
    num: 9,
    roman: 'IX',
    astrology: 'Virgo / Alchemical Dust',
    kabbalah: 'Path of Yod (Chesed to Gevurah)',
    gematria: 20,
    solfeggio: 852,
    element: 'Earth',
    keyword: 'Solitary Illumination & Inner Coordinate',
    description: 'The ancient wanderer walking the dark mountains with a single lantern. This lantern holds the six-pointed star of self-referential truth.',
    shadow: 'Desolate isolation, cynicism, intellectual arrogance, hiding from the world out of fear of action.',
    divineGnosis: 'The light you seek in the distance is your own reflection. Safe-guard your solitude. It is the kiln in which your cosmic essence is baked.',
    sephirah: 'Yesod (The Astral Foundation)',
    practices: [
      'Spend 6 hours offline in meditative self-containment.',
      'Stare at a single candle flame to wake up the solar optic pathway.',
      'Hum with 852 Hz to adjust the third-eye spiritual frequency.'
    ]
  },
  {
    id: 'wheel_of_fortune',
    name: 'Wheel of Fortune',
    num: 10,
    roman: 'X',
    astrology: 'Jupiter / Cosmic Spindle',
    kabbalah: 'Path of Kaph (Chesed to Netzach)',
    gematria: 100,
    solfeggio: 528,
    element: 'Fire',
    keyword: 'Synchronic Loops & Dimensional Spheres',
    description: 'The spinning wheel governed by the sphinx, the jackal, and the serpent. It reminds us of cosmic cycles, spinning timelines, and lucky orbits.',
    shadow: 'Hopeless passivity, gambling on outer variables, feeling trapped by fate.',
    divineGnosis: 'If you cling to the rim of the wheel, you suffer the rise and fall. Leap to the absolute center—the hub. There, you rotate the cosmos: still, eternal, free.',
    sephirah: 'Malkuth (The Grounded Kingdom)',
    practices: [
      'Write down 3 sudden synchronicities that occurred to you this week.',
      'Draw a mandala to visualize your current lifespan loop.',
      'Align projects with lunar transits to catch the upward cosmic currents.'
    ]
  },
  {
    id: 'hanged_man',
    name: 'The Hanged Man',
    num: 12,
    roman: 'XII',
    astrology: 'Neptune / Oceanic Astral',
    kabbalah: 'Path of Mem (Gevurah to Hod)',
    gematria: 90,
    solfeggio: 396,
    element: 'Water',
    keyword: 'Divine Suspension & Reversed Perception',
    description: 'Hanging upside down from the living wood, a halo of blinding gold surrounding his crown. Sacrificing control to perceive stellar truths.',
    shadow: 'Martyr complex, perpetual stagnation, playing victim, refusal to let go of dead weight.',
    divineGnosis: 'Inversion reveals the truth. When you hit a wall, stop fighting the gravity. Suspend your struggle, look at the sky, and wait for the timeline to pivot.',
    sephirah: 'Binah (Supreme Intellect)',
    practices: [
      'Lay with your head hanging off the edge of your bed to reverse cerebral blood flow.',
      'Practice "Do Nothing Meditation" for 20 minutes.',
      'Identify something you are desperately forcing and release it completely.'
    ]
  },
  {
    id: 'death',
    name: 'Death',
    num: 13,
    roman: 'XIII',
    astrology: 'Scorpio / Serpent Alchemy',
    kabbalah: 'Path of Nun (Gevurah to Netzach)',
    gematria: 700,
    solfeggio: 417,
    element: 'Water',
    keyword: 'Radical Transmutation & Timeline Pruning',
    description: 'The dark harvester riding a pale horse. Clearing out dead neural pathways and obsolete realities to liberate fertile ground for future cosmic seeds.',
    shadow: 'Hysterical clinging to decaying situations, decay of physical vitality, paralysis of mourning.',
    divineGnosis: 'No seed can sprout unless its shell decomposes. Death is not an ending, but a sacred transmutation. Let it burn so that you may fly.',
    sephirah: 'Gevurah (Divine Pruning)',
    practices: [
      'Burn a piece of paper representing an expired belief system.',
      'Do a rigorous physical detox/fast to release old cellular tissue.',
      'Repeat: "I release what is no longer in absolute resonance with my cosmic path."'
    ]
  },
  {
    id: 'tower',
    name: 'The Tower',
    num: 16,
    roman: 'XVI',
    astrology: 'Mars / Spiritual Flame',
    kabbalah: 'Path of Peh (Netzach to Hod)',
    gematria: 80,
    solfeggio: 396,
    element: 'Fire',
    keyword: 'Lightning Cleaving Illusion',
    description: 'A stone tower shattered by direct lightning of absolute truth. The golden crowns of false authority tumble as the core light emerges.',
    shadow: 'Catastrophic ruin, unintegrated trauma, violent outbursts, denying structural instability.',
    divineGnosis: 'If it can be shattered by truth, it should be shattered. The lightning bolt destroys only your defense mechanisms—never your divine soul.',
    sephirah: 'Hod (Mental Structures)',
    practices: [
      'Acknowledge one harsh realization you have spent months evading.',
      'Cleanse your living environment of stagnant items that harbor structural stress.',
      'Practice deep breathing, shouting into a pillow if necessary to release stored nervous energy.'
    ]
  },
  {
    id: 'star',
    name: 'The Star',
    num: 17,
    roman: 'XVII',
    astrology: 'Aquarius / Cosmic Current',
    kabbalah: 'Path of Tzaddi (Netzach to Yesod)',
    gematria: 104,
    solfeggio: 741,
    element: 'Air',
    keyword: 'Stellar Flow & Vibrant Restoration',
    description: 'A glowing celestial body casting cascading rays upon the earth. Piling pristine waters into earth and stream, restoring the ecological spirit.',
    shadow: 'Nihilism, detachment from reality, beautiful plans lacking physical anchor points.',
    divineGnosis: 'Your solar system is nourished by the stars. Pour your inspiration directly into your daily tasks; do not leave your wisdom floating in the stratosphere.',
    sephirah: 'Yesod (The Intuitive Wellspring)',
    practices: [
      'Gaze at the night stars, breathing in their quantum starlight.',
      'Drink structure-charged water while repeating a mantra of deep restoration.',
      'Listen to cosmic synths matching 741 Hz to trigger spiritual dreams.'
    ]
  },
  {
    id: 'moon',
    name: 'The Moon',
    num: 18,
    roman: 'XVIII',
    astrology: 'Pisces / Oceanic Dream',
    kabbalah: 'Path of Qoph (Netzach to Malkuth)',
    gematria: 180,
    solfeggio: 396,
    element: 'Water',
    keyword: 'Subconscious Threshold & Dream Alchemy',
    description: 'The towers flanking a bay under a dual moon. The lobster climbs from the warm silt of the primeval oceanic deeps to travel paths of gnosis.',
    shadow: 'Paranoid delusions, losing grip on logical coordinates, severe psychic dampness.',
    divineGnosis: 'Welcome your terrors. The shadow path is the only road to the solar dawn. In the dream depths lies the gold of your forgotten lifetimes.',
    sephirah: 'Malkuth (Materialized Dreams)',
    practices: [
      'Set a notebook beside your bed and record dream symbols immediately upon waking.',
      'Bathe in water enriched by natural mineral sea salts.',
      'Acknowledge fear as raw energy waiting to be integrated.'
    ]
  },
  {
    id: 'sun',
    name: 'The Sun',
    num: 19,
    roman: 'XIX',
    astrology: 'Sun / Solar Apex',
    kabbalah: 'Path of Resh (Hod to Yesod)',
    gematria: 200,
    solfeggio: 528,
    element: 'Fire',
    keyword: 'Solar Illumination & Cosmic Cheer',
    description: 'The golden solar disk overlooking children riding white horses inside a sunflower field. Pure, unobstructed, cellular life-force.',
    shadow: 'Exasperated burnout, egotistical demanding of praise, blinding self with superficial hope.',
    divineGnosis: 'Let there be light. You do not need to hide your gifts or pretend to be small. Stand in your solar authority and warm the solar system.',
    sephirah: 'Tiphereth (Solar Heart Core)',
    practices: [
      'Stand in bright morning sunlight for 5 full minutes without screens.',
      'Align yourself with 528 Hz to stimulate creative and cellular vitality.',
      'Encourage and illuminate a sibling or friend with genuine praise.'
    ]
  },
  {
    id: 'world',
    name: 'The World',
    num: 21,
    roman: 'XXI',
    astrology: 'Saturn / Dimensional Seal',
    kabbalah: 'Path of Tav (Yesod to Malkuth)',
    gematria: 400,
    solfeggio: 852,
    element: 'Earth',
    keyword: 'Spacial Realization & Infinite Dance',
    description: 'The cosmic maiden dancing inside a golden wreath of laurels, flanked by the four beastly keepers of the cardinal elemental coordinate directions.',
    shadow: 'Inertia, fear of graduation, repeating old loops, feeling unable to break into a new plane.',
    divineGnosis: 'The circle is complete. You have traveled the full arcana. Stand in the center of your universe and realize you are the creator, the guardian, and the dance.',
    sephirah: 'Malkuth (The Ultimate Physical Reality)',
    practices: [
      'Create a physical map of your life achievements and express deep gratitude.',
      'Walk in a continuous circle around a room, then stand completely still in the center.',
      'Initiate the next quantum loop by writing down your next grand direction.'
    ]
  }
];

// Single 3D Interactive Card Component
const Card3D = ({ 
  card, 
  index, 
  isSelected, 
  isFlipped, 
  onClick, 
  hoveredId, 
  setHoveredId, 
  spreadSlot 
}: {
  card: TarotCardData;
  index: number;
  isSelected: boolean;
  isFlipped: boolean;
  onClick: () => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  spreadSlot?: string;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const isHovered = hoveredId === card.id;

  // Frame based hover and flip animations
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const t = state.clock.getElapsedTime();
    
    // Smooth hover bobbing and rotation
    const baseAngle = (index * 0.4) + (spreadSlot ? 0 : t * 0.2);
    
    if (spreadSlot) {
      // Slot coordinates
      let targetX = 0;
      const targetZ = 0;
      if (spreadSlot === 'past') targetX = -2.8;
      if (spreadSlot === 'future') targetX = 2.8;
      
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, isHovered ? 0.3 : 0, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
    } else {
      // Spiral layout for deck choosing
      const radius = 3.5;
      const angle = (index / (TAROT_DATABASE.length - 1)) * Math.PI * 1.5 - (Math.PI * 0.75);
      const targetX = Math.sin(angle) * radius;
      const targetZ = Math.cos(angle) * (radius * 0.3) - 1.5;
      
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.12);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, isHovered ? 1.0 :Math.sin(t * 1.5 + index) * 0.15 - 0.5, 0.12);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.12);
    }

    // Flip Rotation math
    const targetYRot = isFlipped ? Math.PI : 0;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetYRot, 0.12);
    
    // Tilt on hover
    const targetXRot = isHovered ? -0.15 : 0;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetXRot, 0.1);
    
    // Scale pulse
    const s = isSelected ? 1.15 : isHovered ? 1.05 : 1.0;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, s, 0.15));
  });

  // Unique card color mapping
  const cardColor = useMemo(() => {
    switch (card.element) {
      case 'Fire': return '#ef4444'; // Red
      case 'Water': return '#3b82f6'; // Blue
      case 'Air': return '#38bdf8'; // Sky cyan
      case 'Earth': return '#10b981'; // Emerald Green
      default: return '#fbbf24'; // Amber
    }
  }, [card.element]);

  return (
    <group 
      ref={meshRef} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredId(card.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredId(null);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Front Face of the Tarot Card (Visible when flipped / Rotated Math.PI) */}
      <group rotation={[0, Math.PI, 0]}>
        {/* Card base chassis */}
        <mesh>
          <boxGeometry args={[1.6, 2.6, 0.04]} />
          <meshStandardMaterial 
            color="#090a0f" 
            roughness={0.2} 
            metalness={0.7} 
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Glow neon frame border */}
        <Line 
          points={[
            new THREE.Vector3(-0.75, 1.25, 0.025),
            new THREE.Vector3(0.75, 1.25, 0.025),
            new THREE.Vector3(0.75, -1.25, 0.025),
            new THREE.Vector3(-0.75, -1.25, 0.025),
            new THREE.Vector3(-0.75, 1.25, 0.025)
          ]}
          color={cardColor}
          lineWidth={2.0}
        />

        {/* Outer dark geometric card frame */}
        <Line 
          points={[
            new THREE.Vector3(-0.7, 1.2, 0.027),
            new THREE.Vector3(0.7, 1.2, 0.027),
            new THREE.Vector3(0.7, -1.2, 0.027),
            new THREE.Vector3(-0.7, -1.2, 0.027),
            new THREE.Vector3(-0.7, 1.2, 0.027)
          ]}
          color="#1e293b"
          lineWidth={1.0}
        />

        {/* Internal Mystical Sacred Symbol Matrix */}
        <group position={[0, 0, 0.028]}>
          {/* Card numeric text */}
          <Html position={[0, 1.0, 0]} transform distanceFactor={3.5} pointerEvents="none">
            <div className="text-[10px] font-bold text-center uppercase tracking-widest font-mono select-none" style={{ color: cardColor }}>
              {card.roman}
            </div>
          </Html>

          {/* Golden Diamond Core */}
          <Line 
            points={[
              new THREE.Vector3(0, 0.5, 0),
              new THREE.Vector3(0.4, 0, 0),
              new THREE.Vector3(0, -0.5, 0),
              new THREE.Vector3(-0.4, 0, 0),
              new THREE.Vector3(0, 0.5, 0)
            ]}
            color="#fbbf24"
            lineWidth={1.2}
          />

          {/* Elemental Icon Glyph projection inside 3D card */}
          {card.element === 'Fire' ? (
            <mesh position={[0, 0, 0.005]}>
              <coneGeometry args={[0.2, 0.4, 4]} />
              <meshBasicMaterial color="#ef4444" wireframe />
            </mesh>
          ) : card.element === 'Water' ? (
            <mesh position={[0, 0, 0.005]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.2, 0.4, 4]} />
              <meshBasicMaterial color="#3b82f6" wireframe />
            </mesh>
          ) : card.element === 'Air' ? (
            <mesh position={[0, 0, 0.005]}>
              <octahedronGeometry args={[0.22]} />
              <meshBasicMaterial color="#38bdf8" wireframe />
            </mesh>
          ) : (
            <mesh position={[0, 0, 0.005]}>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshBasicMaterial color="#10b981" wireframe />
            </mesh>
          )}

          {/* Star flares on card face */}
          <Sparkles count={5} scale={1.0} size={1} color="#fbbf24" speed={0.4} />

          {/* Core bottom title name */}
          <Html position={[0, -0.92, 0]} transform distanceFactor={3.5} pointerEvents="none">
            <div className="bg-black/95 px-1.5 py-0.5 rounded text-[7.5px] font-mono border border-white/10 uppercase select-none tracking-wider text-center text-stone-200">
              {card.name}
            </div>
          </Html>
        </group>
      </group>

      {/* Back Face of the Card (Visually exposed by default) */}
      <group rotation={[0, 0, 0]}>
        {/* Base card thickness back side */}
        <mesh>
          <boxGeometry args={[1.605, 2.605, 0.038]} />
          <meshStandardMaterial color="#0b0d19" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Backside Cosmic Pattern */}
        <Line 
          points={[
            new THREE.Vector3(-0.73, 1.23, 0.022),
            new THREE.Vector3(0.73, 1.23, 0.022),
            new THREE.Vector3(0.73, -1.23, 0.022),
            new THREE.Vector3(-0.73, -1.23, 0.022),
            new THREE.Vector3(-0.73, 1.23, 0.022)
          ]}
          color="#fbbf24"
          lineWidth={1.0}
          transparent
          opacity={0.6}
        />

        {/* Double-headed spiral geometric helix */}
        <group position={[0, 0, 0.023]}>
          <Line 
            points={[
              new THREE.Vector3(-0.3, 0.7, 0),
              new THREE.Vector3(0.3, -0.7, 0)
            ]}
            color="#4f46e5"
            lineWidth={1.5}
          />
          <Line 
            points={[
              new THREE.Vector3(0.3, 0.7, 0),
              new THREE.Vector3(-0.3, -0.7, 0)
            ]}
            color="#4f46e5"
            lineWidth={1.5}
          />

          {/* Mystical Hub Eye */}
          <mesh>
            <ringGeometry args={[0.15, 0.22, 16]} />
            <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export const TarotGnosis = () => {
  // Navigation: Spreads
  const [spreadMode, setSpreadMode] = useState<'single' | 'trinity'>('single');
  
  // Card Spreads State management
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
  
  // Spread outcomes
  const [singleCard, setSingleCard] = useState<TarotCardData | null>(null);
  const [trinityCards, setTrinityCards] = useState<{
    past: TarotCardData | null;
    present: TarotCardData | null;
    future: TarotCardData | null;
  }>({ past: null, present: null, future: null });

  // Flipped trackers
  const [singleFlipped, setSingleFlipped] = useState(false);
  const [trinityFlipped, setTrinityFlipped] = useState({ past: false, present: false, future: false });

  // Render & Pointer state
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // sound frequency oscillator state
  const [isPlayingOsc, setIsPlayingOsc] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Vocal text-to-speech oracle management
  const [narrator, setNarrator] = useState<'sybilla' | 'thoth' | 'socrates'>('sybilla');
  const [rate, setRate] = useState<number>(0.85); // slower speed for ancient deep focus
  const [pitch, setPitch] = useState<number>(0.9); 
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenProgress, setSpokenProgress] = useState<string>('');
  const [audioWaves, setAudioWaves] = useState<number[]>(Array.from({ length: 15 }, () => 10));

  // Speech support checkpoint
  const isSpeechSupported = useMemo(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }, []);

  // Sync animation waves with speech state
  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        setAudioWaves(Array.from({ length: 18 }, () => Math.floor(Math.random() * 45) + 12));
      }, 100);
    } else {
      setAudioWaves(Array.from({ length: 18 }, () => 8));
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Handle card select and draw logic
  const handleDrawSingle = () => {
    // Pick random mystical card
    const randomCard = TAROT_DATABASE[Math.floor(Math.random() * TAROT_DATABASE.length)];
    setSingleCard(randomCard);
    setSelectedCard(randomCard);
    setSingleFlipped(false);
    
    // Stop speaking old reading
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Trigger subtle Audio Synth frequency spike representing drawing the card
    playOscillatorFrequency(randomCard.solfeggio, 0.5);

    setTimeout(() => {
      setSingleFlipped(true);
    }, 450);
  };

  const handleDrawTrinity = () => {
    // Pick 3 unique cards
    const shuffled = [...TAROT_DATABASE].sort(() => Math.random() - 0.5);
    const past = shuffled[0];
    const present = shuffled[1];
    const future = shuffled[2];

    setTrinityCards({ past, present, future });
    setSelectedCard(present); // Default focal choice
    setTrinityFlipped({ past: false, present: false, future: false });
    
    // Stop index voices
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Play core chord
    playOscillatorFrequency(present.solfeggio, 0.4);

    setTimeout(() => {
      setTrinityFlipped({ past: true, present: true, future: true });
    }, 550);
  };

  // Web Audio Solfeggio Resonator
  const playOscillatorFrequency = (freq: number, duration: number = 2.0) => {
    try {
      if (typeof window === 'undefined') return;
      
      // Stop old if already running
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }

      // Initialize
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillatorRef.current = osc;
      gainNodeRef.current = gainNode;

      // Soft sine waves + subtle harmonic overtone sawtooth
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      setIsPlayingOsc(true);

      setTimeout(() => {
        setIsPlayingOsc(false);
      }, duration * 1000);

    } catch (e) {
      console.warn('Audio synthesis not supported or blocked by sandbox permissions:', e);
    }
  };

  // Toggle solid hum of Solfeggio Frequency
  const toggleSolfeggioImmersion = (freq: number) => {
    if (isPlayingOsc) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      setIsPlayingOsc(false);
    } else {
      playOscillatorFrequency(freq, 120.0); // play sustained 2 minute hum
    }
  };

  // Oracle Voice Synthesizer
  const handleVocalizeOracle = (textToSpeak: string) => {
    if (!isSpeechSupported) {
      simulateTextReadout(textToSpeak);
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const cleanText = textToSpeak.replace(/[^\w\s.,!?:;]/gi, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose voice profile
    const voices = window.speechSynthesis.getVoices();

    if (narrator === 'sybilla') {
      // Mystical high accent, pure air
      utterance.voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Zara') || v.name.includes('Zira') || v.name.includes('Google US English') || v.name.includes('Female'))) || null;
      utterance.pitch = pitch * 1.25;
      utterance.rate = rate * 0.95;
    } else if (narrator === 'thoth') {
      // Low authority, ancient scribe
      utterance.voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Daniel') || v.name.includes('Microsoft David') || v.name.includes('Male'))) || null;
      utterance.pitch = pitch * 0.72;
      utterance.rate = rate * 0.85;
    } else {
      // standard philosopher
      utterance.voice = voices.find(v => v.lang.startsWith('en')) || null;
      utterance.pitch = pitch;
      utterance.rate = rate;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpokenProgress('Seeking cosmic resonance...');
    };

    utterance.onboundary = (event) => {
      const remainingBytes = cleanText.substring(event.charIndex, event.charIndex + 45);
      setSpokenProgress(remainingBytes + '...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpokenProgress('Oracle speech matrix synchronized.');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error, falling back to dynamic translation overlay.', e);
      setIsSpeaking(false);
      simulateTextReadout(textToSpeak);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handcrafted Beautiful Simulated Speech readout overlay in case of iframe browser limitations
  const simulateTextReadout = (fullText: string) => {
    setIsSpeaking(true);
    let index = 0;
    const words = fullText.split(' ');
    
    const playNextWord = () => {
      if (index >= words.length) {
        setIsSpeaking(false);
        setSpokenProgress('Blueprint comprehension completed.');
        return;
      }
      const segment = words.slice(index, index + 5).join(' ');
      setSpokenProgress(segment);
      index += 5;
      
      // Make low synth blips simulating voice synthesis output
      if (selectedCard) {
        playOscillatorFrequency(selectedCard.solfeggio * (1.0 + (index * 0.005)), 0.12);
      }
      
      setTimeout(playNextWord, 650);
    };

    playNextWord();
  };

  // Keep voices active
  useEffect(() => {
    return () => {
      if (isSpeechSupported) {
        window.speechSynthesis.cancel();
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    };
  }, [isSpeechSupported]);

  // Compute Active Selection elements
  const focusedCard = useMemo(() => {
    return selectedCard || singleCard || trinityCards.present || TAROT_DATABASE[0];
  }, [selectedCard, singleCard, trinityCards]);

  const cardElementColor = useMemo(() => {
    switch (focusedCard.element) {
      case 'Fire': return 'rgba(239, 68, 68, 1)';
      case 'Water': return 'rgba(59, 130, 246, 1)';
      case 'Air': return 'rgba(56, 189, 248, 1)';
      case 'Earth': return 'rgba(16, 185, 129, 1)';
      default: return 'rgba(251, 191, 36, 1)';
    }
  }, [focusedCard]);

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 bg-black/30 border border-white/5 rounded-3xl p-4 sm:p-6 text-stone-200">
      
      {/* LEFT COLUMN: 3D Canvas Board Controls & Oracle Draws */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        
        {/* Board Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/50 border border-white/5 p-4 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-400 animate-pulse" />
              <h1 className="text-xl font-bold font-sans tracking-tight text-white uppercase sm:text-2xl">
                Tarot Arcana Gnosis
              </h1>
            </div>
            <p className="text-xs font-mono text-stone-400 mt-1">
              Spheres of Alchemical Synthesis, Destiny Spreads, and Sacred Frequencies
            </p>
          </div>

          {/* Spread Mode Selector */}
          <div className="flex bg-stone-900 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => {
                setSpreadMode('single');
                setSelectedCard(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 ${spreadMode === 'single' ? 'bg-amber-400 text-black font-extrabold' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Daily Oracle
            </button>
            <button
              onClick={() => {
                setSpreadMode('trinity');
                setSelectedCard(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 ${spreadMode === 'trinity' ? 'bg-amber-400 text-black font-extrabold' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Trinity Spread
            </button>
          </div>
        </div>

        {/* 3D Interactive Sanctuary */}
        <div className="relative h-[480px] bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_80%)] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
          
          {/* Spatial Grid Design Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.02)_1.5px,transparent_1.5px)] bg-[size:30px_30px] pointer-events-none" />
          
          {/* Celestial Circle Geometric Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-white/5 opacity-50 flex items-center justify-center pointer-events-none">
            <div className="w-[280px] h-[280px] rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-[180px] h-[180px] rounded-full border border-dashed border-amber-400/20 flex items-center justify-center" />
            </div>
          </div>

          {/* Interactive Information Overlay Prompt */}
          <div className="p-3 bg-black/80 border-b border-white/10 flex justify-between items-center z-10 pointer-events-none select-none">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400 uppercase">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Interactive 3D Stage Space
            </div>
            <div className="font-mono text-[9px] text-amber-300">
              {spreadMode === 'single' ? 'Deal single card' : 'Deal past / present / future spread'}
            </div>
          </div>

          {/* R3F Canvas showing cards */}
          <div className="w-full flex-1 relative">
            <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
              
              <Center>
                {spreadMode === 'single' && singleCard && (
                  <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.3}>
                    <Card3D 
                      card={singleCard}
                      index={0}
                      isSelected={focusedCard?.id === singleCard.id}
                      isFlipped={singleFlipped}
                      onClick={() => setSelectedCard(singleCard)}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                    />
                  </Float>
                )}

                {spreadMode === 'trinity' && trinityCards.present && (
                  <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.2}>
                    {trinityCards.past && (
                      <Card3D 
                        card={trinityCards.past}
                        index={0}
                        isSelected={focusedCard?.id === trinityCards.past.id}
                        isFlipped={trinityFlipped.past}
                        onClick={() => setSelectedCard(trinityCards.past)}
                        hoveredId={hoveredId}
                        setHoveredId={setHoveredId}
                        spreadSlot="past"
                      />
                    )}
                    {trinityCards.present && (
                      <Card3D 
                        card={trinityCards.present}
                        index={1}
                        isSelected={focusedCard?.id === trinityCards.present.id}
                        isFlipped={trinityFlipped.present}
                        onClick={() => setSelectedCard(trinityCards.present)}
                        hoveredId={hoveredId}
                        setHoveredId={setHoveredId}
                        spreadSlot="present"
                      />
                    )}
                    {trinityCards.future && (
                      <Card3D 
                        card={trinityCards.future}
                        index={2}
                        isSelected={focusedCard?.id === trinityCards.future.id}
                        isFlipped={trinityFlipped.future}
                        onClick={() => setSelectedCard(trinityCards.future)}
                        hoveredId={hoveredId}
                        setHoveredId={setHoveredId}
                        spreadSlot="future"
                      />
                    )}
                  </Float>
                )}
              </Center>

              {/* Mystical Background Stars Sparkle */}
              <Sparkles count={40} scale={10} size={1.2} speed={0.4} color="#fbbf24" />
            </Canvas>

            {/* Empty state overlay before deal */}
            {((spreadMode === 'single' && !singleCard) || (spreadMode === 'trinity' && !trinityCards.present)) && (
              <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center bg-black/60 backdrop-blur-sm transition-all">
                <div className="w-16 h-16 rounded-full bg-stone-900 border border-white/10 flex items-center justify-center mb-4">
                  <CompassIcon className="w-8 h-8 text-amber-400 rotate-45 animate-spin" style={{ animationDuration: '60s' }} />
                </div>
                <h3 className="text-md font-sans font-bold text-white uppercase tracking-wider">
                  Gathering the Astral Blueprint
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mt-1 sm:text-[13px]">
                  Select your spiritual spread method above, quiet your neural field, and draw from the cosmic deck of 22 Major Arcana.
                </p>

                <div className="flex gap-3 mt-6">
                  {spreadMode === 'single' ? (
                    <button
                      onClick={handleDrawSingle}
                      className="px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-widest bg-amber-400 text-black font-extrabold hover:bg-amber-300 transition duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    >
                      🔮 Draw Daily Gnosis Card
                    </button>
                  ) : (
                    <button
                      onClick={handleDrawTrinity}
                      className="px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-widest bg-amber-400 text-black font-extrabold hover:bg-amber-300 transition duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    >
                      🧬 Deal Holy Trinity Cards
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom quick deal toolbar */}
          {((spreadMode === 'single' && singleCard) || (spreadMode === 'trinity' && trinityCards.present)) && (
            <div className="p-3 bg-black/80 border-t border-white/10 flex justify-between items-center z-10">
              <div className="flex items-center gap-1.5 font-mono text-[9.5px] text-zinc-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                CARD ENVELOPE OPEN
              </div>

              <button
                onClick={spreadMode === 'single' ? handleDrawSingle : handleDrawTrinity}
                className="px-3.5 py-1.5 rounded-lg text-[9px] uppercase font-mono tracking-widest bg-stone-900 border border-white/10 hover:bg-white/5 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <RotateCw className="w-3 h-3 text-amber-400" />
                Redeal Cards
              </button>
            </div>
          )}
        </div>

        {/* ALCHEMICAL MATRICES & ELEMENTAL BLUEPRINT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-black/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
            <Activity className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="text-[10px] uppercase font-mono tracking-wider text-stone-400 leading-none">
              Solfeggio Frequency
            </h4>
            <div className="text-xl font-bold font-mono text-zinc-200 mt-1">
              {focusedCard.solfeggio} Hz
            </div>
            <p className="text-[10px] text-stone-500 mt-1 lines-clamp-2">
              Harmonic sound signature linked to the third-eye chakra and neural optimization.
            </p>
          </div>

          <div className="bg-black/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
            {focusedCard.element === 'Fire' ? <Flame className="w-5 h-5 text-red-400 mb-2" /> :
             focusedCard.element === 'Water' ? <Droplet className="w-5 h-5 text-blue-400 mb-2" /> :
             focusedCard.element === 'Air' ? <Wind className="w-5 h-5 text-sky-400 mb-2" /> :
             <Compass className="w-5 h-5 text-emerald-400 mb-2" />}
            <h4 className="text-[10px] uppercase font-mono tracking-wider text-stone-400 leading-none">
              Alchemical Element
            </h4>
            <div className="text-xl font-bold font-mono text-zinc-200 mt-1">
              {focusedCard.element}
            </div>
            <p className="text-[10px] text-stone-500 mt-1 lines-clamp-2">
              The building block of the astral body that organizes psychological behaviors.
            </p>
          </div>

          <div className="bg-black/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
            <BookOpen className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-[10px] uppercase font-mono tracking-wider text-stone-400 leading-none">
              Gematria Profile
            </h4>
            <div className="text-xl font-bold font-mono text-zinc-200 mt-1">
              G-{focusedCard.gematria}
            </div>
            <p className="text-[10px] text-stone-500 mt-1 lines-clamp-2">
              Numerical essence and secret pathways connecting to the divine Sephirot structure.
            </p>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: CARD DETAILS ORACLE TRANSMISSION */}
      <div className="xl:col-span-5 flex flex-col gap-5 bg-black/60 border border-white/10 p-5 rounded-3xl relative overflow-hidden">
        
        {/* Shimmer background glowing with element color */}
        <div 
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full filter blur-[100px] opacity-15 transition-all duration-700 pointer-events-none" 
          style={{ backgroundColor: cardElementColor }}
        />

        {/* Detailed Section Title */}
        <div className="flex justify-between items-center bg-black/40 border border-white/5 p-3 rounded-xl">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-stone-300">
              Arcana Deep Dive Details
            </span>
          </div>
          <div 
            className="px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold tracking-widest text-[#090a0f]"
            style={{ backgroundColor: cardElementColor }}
          >
            {focusedCard.element}
          </div>
        </div>

        {/* Focal Card Presentation */}
        <div className="space-y-4">
          <div className="flex items-baseline gap-2.5">
            <span className="text-sm font-mono text-amber-400 font-extrabold">
              {focusedCard.roman}
            </span>
            <h2 className="text-2xl font-bold font-sans tracking-tight text-white uppercase leading-none">
              {focusedCard.name}
            </h2>
          </div>

          {/* Subtitle / Keyword metrics */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-1.5 text-[11px] font-mono">
              <span className="text-stone-400">Astrology</span>
              <span className="text-stone-200 text-right">{focusedCard.astrology}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-1.5 text-[11px] font-mono">
              <span className="text-stone-400">Path of Tree</span>
              <span className="text-indigo-300 text-right">{focusedCard.kabbalah}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-stone-400">Kabbalah Mount</span>
              <span className="text-emerald-400 text-right">{focusedCard.sephirah}</span>
            </div>
          </div>

          {/* Detailed Oracle Text & Gnosis */}
          <div className="space-y-3 pt-1">
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Key Theme</span>
              <p className="text-sm text-amber-100 font-medium leading-relaxed font-sans mt-0.5">
                {focusedCard.keyword}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Spiritual Gnosis & Blueprint</span>
              <p className="text-[12.5px] text-stone-300 leading-relaxed font-sans mt-0.5">
                {focusedCard.description}
              </p>
            </div>

            <div className="border-l-2 p-3 bg-amber-400/[0.02] rounded-r-xl border-amber-400/30">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-extrabold block">
                The Divine Word
              </span>
              <p className="text-xs text-stone-200 mt-1 italic font-sans leading-relaxed">
                "{focusedCard.divineGnosis}"
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-red-400/80 uppercase tracking-wider">Shadow Projection Warning</span>
              <p className="text-xs text-stone-400 leading-relaxed font-sans mt-0.5">
                {focusedCard.shadow}
              </p>
            </div>
          </div>

          {/* Cosmic Practices to integrate card energy */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              Divine Integration Practices
            </span>
            <div className="flex flex-col gap-2">
              {focusedCard.practices.map((practice, idx) => (
                <div key={idx} className="flex gap-2.5 items-start bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-stone-300 font-sans leading-normal leading-relaxed">
                    {practice}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic Gematria Resonance Bar */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[8.5px] font-mono uppercase text-ston-400 text-stone-500">Numerical Weight Resonance</span>
              <h4 className="text-xs font-mono font-bold text-amber-400 leading-none">
                Gematria Sequence Value
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-400">Scale:</span>
              <div 
                className="px-2.5 py-1 rounded bg-black border font-mono text-xs font-bold font-extrabold text-amber-400 shadow-inner"
                style={{ color: cardElementColor, borderColor: `${cardElementColor}60` }}
              >
                {focusedCard.gematria}
              </div>
            </div>
          </div>
          
          {/* Dynamic Interactive Gematria Meter */}
          <div className="relative w-full h-8 bg-zinc-950 rounded-lg overflow-hidden border border-white/5 p-1 flex items-center justify-between">
            <div 
              className="absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-500 rounded-lg"
              style={{ 
                width: `${Math.min(100, (focusedCard.gematria / 700) * 100)}%`, 
                backgroundColor: cardElementColor 
              }}
            />
            {Array.from({ length: 24 }).map((_, i) => {
              const weight = (focusedCard.gematria * i) % 100;
              const isHighType = weight > 45;
              return (
                <div 
                  key={i} 
                  className={`w-1 h-3.5 rounded-full transition-all duration-300`} 
                  style={{ 
                    backgroundColor: isHighType ? cardElementColor : 'rgba(255, 255, 255, 0.1)',
                    opacity: isHighType ? 0.9 : 0.35,
                    height: `${Math.max(4, (weight / 100) * 16)}px`
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* VOCAL ORACLE OPTIONS & TEXT-TO-SPEECH TRANSMISSION */}
        <div className="bg-black/95 border border-amber-500/10 rounded-2xl p-4 space-y-4">
          
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-[10px] uppercase text-zinc-300">
                Acoustic Oracle Synthesis
              </span>
            </div>
            
            {/* Play Sound hum trigger */}
            <button
              onClick={() => toggleSolfeggioImmersion(focusedCard.solfeggio)}
              className={`px-2 py-1 rounded text-[8px] font-mono font-bold uppercase transition-all duration-300 ${isPlayingOsc ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'}`}
            >
              {isPlayingOsc ? '🔇 Block Hum' : '🔊 Play Solfeggio Hum'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Select voice personality */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono uppercase text-stone-500 leading-none">
                Oracle Personality
              </label>
              <select
                value={narrator}
                onChange={(e) => setNarrator(e.target.value as any)}
                className="bg-stone-900 border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-stone-300 focus:outline-none focus:border-amber-400"
              >
                <option value="sybilla">Sybilla the Oracle</option>
                <option value="thoth">Thoth the Scribe</option>
                <option value="socrates">Socrates of Gnosis</option>
              </select>
            </div>

            {/* Vocal speed rate */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono uppercase text-stone-500 leading-none flex justify-between">
                Vocal Cadence <span>{rate}x</span>
              </label>
              <input 
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2.5"
              />
            </div>
          </div>

          {/* Wave animation and Read Voice buttons */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={() => {
                const readingText = `${focusedCard.name}. Archetype of ${focusedCard.keyword}. ${focusedCard.description}. Divine directive. ${focusedCard.divineGnosis}`;
                handleVocalizeOracle(readingText);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-mono text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2.5 transition-all duration-300 ${isSpeaking ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:bg-amber-300'}`}
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-4 h-4 fill-current animate-pulse" />
                  Mute Oracle Wave
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Vocalize Deep Meanings
                </>
              )}
            </button>

            {/* Simulated Vocalizer dynamic audio visualization bar */}
            <div className="flex items-end gap-1 px-3 h-8 bg-black/40 rounded-xl border border-white/5">
              {audioWaves.map((h, i) => (
                <div 
                  key={i} 
                  className="w-1 rounded-t-sm transition-all duration-150"
                  style={{ 
                    height: `${h}px`, 
                    backgroundColor: isSpeaking ? cardElementColor : 'rgba(255, 255, 255, 0.1)',
                    opacity: isSpeaking ? 0.9 : 0.2
                  }}
                />
              ))}
            </div>

          </div>

          {/* Speaking transcript progress overlay */}
          {spokenProgress && (
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-1.5">
              <span className="text-[8px] font-mono text-zinc-500 uppercase leading-none block">
                Cosmic Auditory Transcript Buffer
              </span>
              <p className="text-[11px] font-mono text-emerald-400 animate-pulse leading-normal select-none">
                {spokenProgress}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
