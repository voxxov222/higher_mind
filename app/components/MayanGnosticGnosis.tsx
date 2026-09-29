import React, { useState, useEffect } from 'react';
import { HigherMindExplanationButton } from './HigherMindExplanationButton';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Calendar, Zap, Shield, Key, Sun, Compass, Radio, 
  HelpCircle, Copy, Check, Info, Loader2, ArrowRightLeft, BookOpen, AlertCircle
} from 'lucide-react';
import { CosmicData } from '../types';
import { fetchCosmicChatResponse } from '../services/geminiService';
import { soundEngine } from '../lib/soundEffects';

// Mayan Solar Seals Definition
interface SolarSeal {
  id: number;
  name: string;
  mayaName: string;
  color: string;
  glyphColor: string;
  description: string;
  kabbalahSefirah: string;
  gnosticMeaning: string;
  action: string;
  power: string;
}

const SOLAR_SEALS: SolarSeal[] = [
  { id: 0, name: "Red Dragon", mayaName: "Imix", color: "#EF4444", glyphColor: "#F87171", description: "Birth, nurturing, memory, the primordial ocean of life and trust.", kabbalahSefirah: "Keter (The Source of All)", gnosticMeaning: "The Unknowable Father (Bythos) / First Source", action: "Nurtures", power: "Birth" },
  { id: 1, name: "White Wind", mayaName: "Ik", color: "#F3F4F6", glyphColor: "#D1D5DB", description: "Spirit, breath, communication, inspiration, the divine flow.", kabbalahSefirah: "Chokhmah (Spiritual Wisdom / Word)", gnosticMeaning: "The Pneuma / Divine Spiritual Breath", action: "Communicates", power: "Spirit" },
  { id: 2, name: "Blue Night", mayaName: "Akbal", color: "#1D4ED8", glyphColor: "#60A5FA", description: "Dreams, sanctuary, introspection, abundance, the deep mystery.", kabbalahSefirah: "Binah (The Great Womb / Matrix)", gnosticMeaning: "The Abyss / Divine Silence (Sige)", action: "Dreams", power: "Abundance" },
  { id: 3, name: "Yellow Seed", mayaName: "Kan", color: "#EAB308", glyphColor: "#FDE047", description: "Awareness, target, growth, seeding, hidden potential.", kabbalahSefirah: "Chesed (Expansion and Sowing)", gnosticMeaning: "The Divine Seed of Light inside human shells", action: "Targets", power: "Awareness" },
  { id: 4, name: "Red Serpent", mayaName: "Chicchan", color: "#DC2626", glyphColor: "#EF4444", description: "Life force, survival, kundalini, passion, physical wisdom.", kabbalahSefirah: "Gevurah (Severity / Kundalini fire)", gnosticMeaning: "The Spiritual Ouroboros / Earthly Serpent", action: "Survives", power: "Life Force" },
  { id: 5, name: "White Worldbridger", mayaName: "Cimi", color: "#E5E7EB", glyphColor: "#9CA3AF", description: "Death, release, surrender, bridge between dimensions, opportunity.", kabbalahSefirah: "Da'at (Hidden knowledge / Void)", gnosticMeaning: "The Crossing (Horos) / Bridge out of the Demiurge's realm", action: "Equalizes", power: "Death" },
  { id: 6, name: "Blue Hand", mayaName: "Manik", color: "#2563EB", glyphColor: "#3B82F6", description: "Accomplishment, healing, knowledge, execution, the portal.", kabbalahSefirah: "Tiferet (The Harmonizing Hand / Heart)", gnosticMeaning: "The Christos / The Hand of Salvation", action: "Knows", power: "Healing" },
  { id: 7, name: "Yellow Star", mayaName: "Lamat", color: "#D97706", glyphColor: "#F59E0B", description: "Art, elegance, beauty, harmonization, celestial coordinates.", kabbalahSefirah: "Netzach (Victory of Beauty / Venus)", gnosticMeaning: "The Sophia / Celestial Beauty & Wisdom", action: "Beautifies", power: "Elegance" },
  { id: 8, name: "Red Moon", mayaName: "Muluc", color: "#B91C1C", glyphColor: "#DC2626", description: "Purification, flow, cosmic water, emotional release, focus.", kabbalahSefirah: "Hod (Glory / Purification through word)", gnosticMeaning: "The Waters of Life / Baptismal Wave of Gnosis", action: "Purifies", power: "Flow" },
  { id: 9, name: "White Dog", mayaName: "Oc", color: "#F9FAFB", glyphColor: "#E5E7EB", description: "Love, loyalty, heart, companions, companion on the path.", kabbalahSefirah: "Yesod (Foundation / Emotional Bond)", gnosticMeaning: "The Syzygy / Twin souls paired in light", action: "Loves", power: "Heart" },
  { id: 10, name: "Blue Monkey", mayaName: "Chuen", color: "#0284C7", glyphColor: "#38BDF8", description: "Play, illusion, magic, humor, creative disruption.", kabbalahSefirah: "Malkuth (Material realm / Illusion of form)", gnosticMeaning: "The Demiurge's Game / Playful illusion of matter", action: "Plays", power: "Illusion" },
  { id: 11, name: "Yellow Human", mayaName: "Eb", color: "#CA8A04", glyphColor: "#EAB308", description: "Wisdom, free will, choice, the vessel of divinity.", kabbalahSefirah: "Tiferet / Yesod (The Archetypal Adam Kadmon)", gnosticMeaning: "The Pneumatic (Spiritual) Human Vessel", action: "Influences", power: "Free Will" },
  { id: 12, name: "Red Skywalker", mayaName: "Ben", color: "#991B1B", glyphColor: "#B91C1C", description: "Exploration, space, courage, messenger, expanding horizons.", kabbalahSefirah: "Chokhmah / Chesed (The Infinite Explorer)", gnosticMeaning: "The Messenger of Light (Seth/Hermes) descending", action: "Explores", power: "Space" },
  { id: 13, name: "White Wizard", mayaName: "Ix", color: "#F3F4F6", glyphColor: "#F9FAFB", description: "Enchantment, wizardry, integrity, timelessness, the shaman.", kabbalahSefirah: "Binah / Da'at (The Timeless Priest)", gnosticMeaning: "The Gnostic Initiate / Master of Magic & Mind", action: "Enchants", power: "Timelessness" },
  { id: 14, name: "Blue Eagle", mayaName: "Men", color: "#0369A1", glyphColor: "#0EA5E9", description: "Mind, vision, high perspective, hope, mental focus.", kabbalahSefirah: "Keter / Chokhmah (Infinite Sight)", gnosticMeaning: "The Nous / Universal Divine Intellect", action: "Creates", power: "Vision" },
  { id: 15, name: "Yellow Warrior", mayaName: "Cib", color: "#A16207", glyphColor: "#D97706", description: "Intelligence, trust, divine questioning, cosmic alignment.", kabbalahSefirah: "Gevurah / Hod (Fearless intellect)", gnosticMeaning: "The Spiritual Soldier of Sophia / Guardian of Gnosis", action: "Questions", power: "Intelligence" },
  { id: 16, name: "Red Earth", mayaName: "Caban", color: "#991B1B", glyphColor: "#C2410C", description: "Synergy, evolution, navigation, alignment of timing.", kabbalahSefirah: "Malkuth (The Planet Earth Mother)", gnosticMeaning: "The Gaia Sophia / Fallen Sophia animating matter", action: "Evolves", power: "Navigation" },
  { id: 17, name: "White Mirror", mayaName: "Etznab", color: "#E5E7EB", glyphColor: "#F3F4F6", description: "Reflection, order, truth, clarity, separating illusions.", kabbalahSefirah: "Binah / Hod (Reflecting Truth / Matrix Glass)", gnosticMeaning: "The Mirror of Truth reflecting the Pleroma", action: "Reflects", power: "Endless" },
  { id: 18, name: "Blue Storm", mayaName: "Cauac", color: "#0F172A", glyphColor: "#2563EB", description: "Catalyst, transformation, self-generation, thunder, storm.", kabbalahSefirah: "Gevurah (The cleansing fire of transformation)", gnosticMeaning: "The Great Cleansing / Spiritual Revolution", action: "Catalyzes", power: "Self-Generation" },
  { id: 19, name: "Yellow Sun", mayaName: "Ahau", color: "#EAB308", glyphColor: "#FDE047", description: "Light, life, enlightenment, solar consciousness, oneness.", kabbalahSefirah: "Keter (The Divine Crown / Absolute Light)", gnosticMeaning: "The Solar Christ / Sovereign Light of the Pleroma", action: "Enlightens", power: "Universal Fire" }
];

// Galactic Tones Definition
interface GalacticTone {
  id: number;
  name: string;
  meaning: string;
  dots: number;
  bars: number;
  frequency: number;
  gnosticSphere: string;
}

const GALACTIC_TONES: GalacticTone[] = [
  { id: 1, name: "Magnetic", meaning: "Purpose, Unify, Attract", dots: 1, bars: 0, frequency: 396, gnosticSphere: "First Gate: Physical Realm (Malkuth Gate)" },
  { id: 2, name: "Lunar", meaning: "Challenge, Polarize, Stabilize", dots: 2, bars: 0, frequency: 417, gnosticSphere: "Second Gate: Astral Wave (Yesod Gate)" },
  { id: 3, name: "Electric", meaning: "Service, Bond, Activate", dots: 3, bars: 0, frequency: 528, gnosticSphere: "Third Gate: Mars Forge (Hod Gate)" },
  { id: 4, name: "Self-Existing", meaning: "Form, Define, Measure", dots: 4, bars: 0, frequency: 639, gnosticSphere: "Fourth Gate: Solar Radiance (Netzach Gate)" },
  { id: 5, name: "Overtone", meaning: "Radiance, Empower, Command", dots: 0, bars: 1, frequency: 741, gnosticSphere: "Fifth Gate: Venusian Shell (Tiphereth Gate)" },
  { id: 6, name: "Rhythmic", meaning: "Equality, Organize, Balance", dots: 1, bars: 1, frequency: 852, gnosticSphere: "Sixth Gate: Mercury Mind (Geburah Gate)" },
  { id: 7, name: "Resonant", meaning: "Attunement, Channel, Inspire", dots: 2, bars: 1, frequency: 963, gnosticSphere: "Seventh Gate: The Void Threshold (Binah Gate)" },
  { id: 8, name: "Galactic", meaning: "Integrity, Harmonize, Model", dots: 3, bars: 1, frequency: 528, gnosticSphere: "Eighth Sphere: The Ogdoad / Starry Heavens" },
  { id: 9, name: "Solar", meaning: "Intention, Pulse, Realize", dots: 4, bars: 1, frequency: 639, gnosticSphere: "Ninth Sphere: The Ennead / First Fullness" },
  { id: 10, name: "Planetary", meaning: "Manifestation, Perfect, Produce", dots: 0, bars: 2, frequency: 741, gnosticSphere: "Tenth Sphere: The Decad / Perfect Matrix" },
  { id: 11, name: "Spectral", meaning: "Liberation, Dissolve, Release", dots: 1, bars: 2, frequency: 852, gnosticSphere: "Eleventh Sphere: The Realm of Autogenes" },
  { id: 12, name: "Crystal", meaning: "Cooperation, Dedicate, Universalize", dots: 2, bars: 2, frequency: 963, gnosticSphere: "Twelfth Sphere: The Barbelo Aeon" },
  { id: 13, name: "Cosmic", meaning: "Presence, Transcend, Endure", dots: 3, bars: 2, frequency: 999, gnosticSphere: "The Thirteenth Aeon: Pure Pleroma / Sophia's Return" }
];

interface MayanGnosticGnosisProps {
  data: CosmicData | null;
}

export const MayanGnosticGnosis: React.FC<MayanGnosticGnosisProps> = ({ data }) => {
  const [birthDate, setBirthDate] = useState<string>('1990-01-01');
  const [calculatedKin, setCalculatedKin] = useState<number>(1);
  const [activeSeal, setActiveSeal] = useState<SolarSeal>(SOLAR_SEALS[0]);
  const [activeTone, setActiveTone] = useState<GalacticTone>(GALACTIC_TONES[0]);
  const [attuning, setAttuning] = useState<boolean>(false);
  const [resonanceLog, setResonanceLog] = useState<string[]>([]);
  const [copierOk, setCopierOk] = useState<boolean>(false);

  // AI Reading States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [gnosisReading, setGnosisReading] = useState<string | null>(null);

  // Sync date with profile data if available on mount
  useEffect(() => {
    if (data && data.dailyInsight?.date) {
      setBirthDate(data.dailyInsight.date);
    } else if (typeof window !== 'undefined') {
      const savedInputs = localStorage.getItem('astral_inputs');
      if (savedInputs) {
        try {
          const parsed = JSON.parse(savedInputs);
          if (parsed.birthDate) {
            setBirthDate(parsed.birthDate);
          }
        } catch (_) { /* ignore */ }
      }
    }
  }, [data]);

  // Mayan Kin Calculation Logic (Reference: Jan 1, 1970 is Kin 92 / 12 Eb)
  useEffect(() => {
    if (!birthDate) return;
    const targetDate = new Date(birthDate + 'T12:00:00');
    const refDate = new Date('1970-01-01T12:00:00');
    
    // Calculate difference in days
    const diffTime = targetDate.getTime() - refDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Kin Index calculation: Jan 1, 1970 was Kin 92 (which is 0-indexed Kin 91)
    let kinIndex = (diffDays + 91) % 260;
    if (kinIndex < 0) {
      kinIndex += 260;
    }
    
    const kinNumber = kinIndex + 1;
    setCalculatedKin(kinNumber);

    // Calculate Seal (0 to 19)
    const sealId = (kinIndex % 20);
    const matchedSeal = SOLAR_SEALS.find(s => s.id === sealId) || SOLAR_SEALS[0];
    setActiveSeal(matchedSeal);

    // Calculate Tone (1 to 13)
    const toneId = (kinIndex % 13) + 1;
    const matchedTone = GALACTIC_TONES.find(t => t.id === toneId) || GALACTIC_TONES[0];
    setActiveTone(matchedTone);

  }, [birthDate]);

  // Calculate Mayan Oracle Companions based on activeSeal
  // Guide Kin: is always of the same color, moves in steps of 4/8/12 depending on tone
  const getGuideKin = () => {
    const guideOffsets = [0, 12, 4, 8, 16, 0, 12, 4, 8, 16, 0, 12, 4];
    const offset = guideOffsets[(activeTone.id - 1) % 13];
    const guideId = (activeSeal.id + offset) % 20;
    return SOLAR_SEALS.find(s => s.id === guideId) || activeSeal;
  };

  // Analog Kin: support (always sum to 19)
  const getAnalogKin = () => {
    const analogId = (19 - activeSeal.id) % 20;
    return SOLAR_SEALS.find(s => s.id === analogId) || activeSeal;
  };

  // Antipode Kin: challenge/strength (offset of 10)
  const getAntipodeKin = () => {
    const antipodeId = (activeSeal.id + 10) % 20;
    return SOLAR_SEALS.find(s => s.id === antipodeId) || activeSeal;
  };

  // Occult Kin: hidden magic (always sum to 21)
  const getOccultKin = () => {
    const occultId = (21 - activeSeal.id) % 20;
    return SOLAR_SEALS.find(s => s.id === occultId) || activeSeal;
  };

  const handleAttune = () => {
    if (attuning) return;
    setAttuning(true);
    soundEngine.mysticClick();
    
    // Play sound wave if speechSynthesis is supported
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(`Attuning your energy fields to Tone ${activeTone.id} ${activeTone.name}, vibrating at ${activeTone.frequency} Hertz. Embodying the Seal ${activeSeal.name}, the ${activeSeal.mayaName}.`);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }

    const newLog = `Resonated ${activeSeal.name} with ${activeTone.name} Tone at ${activeTone.frequency}Hz. Synchronized on ${activeTone.gnosticSphere} and Sefirah ${activeSeal.kabbalahSefirah}.`;
    setResonanceLog(prev => [newLog, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setAttuning(false);
    }, 2500);
  };

  const handleGenerateAISynthesis = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGnosisReading(null);
    soundEngine.select();

    const guide = getGuideKin();
    const analog = getAnalogKin();
    const antipode = getAntipodeKin();
    const occult = getOccultKin();

    const systemPrompt = `You are the Astral Mind Guide, an expert digital mystic combining Western Astrology, Hermetic Kabbalah, Gematria, Gnostic Sophia-gnosis, and Mayan Tzolkin.
    Analyze this Mayan-Gnostic birth alignment profile:
    - Birthdate: ${birthDate}
    - Galactic Signature: Kin ${calculatedKin}
    - Primary Seal: ${activeSeal.name} (${activeSeal.mayaName}) - ${activeSeal.description}
    - Galactic Tone: Tone ${activeTone.id} ${activeTone.name} (${activeTone.meaning}) - Resonating at ${activeTone.frequency}Hz
    - Gnostic Sphere alignment: ${activeTone.gnosticSphere}
    - Kabbalah Sefirah alignment: ${activeSeal.kabbalahSefirah}
    - Divine Oracle Partners:
       * Guide: ${guide.name} (${guide.mayaName})
       * Analog (Support): ${analog.name} (${analog.mayaName})
       * Antipode (Challenge): ${antipode.name} (${antipode.mayaName})
       * Occult (Magic): ${occult.name} (${occult.mayaName})

    Provide an extremely profound, avant-garde Gnostic-Mayan-Kabbalistic synthesis reading.
    Do NOT use superficial fortune-telling language. Emphasize how the Divine Spark (Pneuma) is decoded through the Mayan mathematical cycles, how the user can escape the Archontic boundaries of ${activeTone.gnosticSphere}, and how they achieve sovereign integration on the Tree of Life.
    Integrate structural headers like 'I. ARCHETYPAL RESONANCE', 'II. SOPHIA'S COGNITIVE SPARK', and 'III. THE DECALOGUE ATTUNEMENT'. Keep it incredibly rich, poetic, and mind-expanding.
    `;

    try {
      const response = await fetchCosmicChatResponse(
        "Generate my Mayan Gnostic Pleromic Integration Synthesis reading now.",
        [{ role: 'user', parts: [{ text: systemPrompt }] }],
        data
      );
      setGnosisReading(response.text);
      soundEngine.activate();
    } catch (err) {
      console.error("Mayan Gnosis AI Error:", err);
      setGnosisReading("The Pleromic gateway is temporarily overloaded. Please align your intentions and retry the attunement.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!gnosisReading) return;
    navigator.clipboard.writeText(gnosisReading);
    setCopierOk(true);
    setTimeout(() => setCopierOk(false), 2000);
  };

  // Dot & Bar symbols rendering for Mayan Tones
  const renderMayanToneDotsAndBars = (tone: GalacticTone) => {
    const dotsArray = Array.from({ length: tone.dots }, (_, i) => i);
    const barsArray = Array.from({ length: tone.bars }, (_, i) => i);
    
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 h-10 w-12 bg-neutral-900/60 rounded-lg border border-white/10 px-2">
        {/* Dots */}
        {dotsArray.length > 0 && (
          <div className="flex gap-1 justify-center">
            {dotsArray.map(d => (
              <div key={d} className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            ))}
          </div>
        )}
        {/* Bars */}
        {barsArray.length > 0 && (
          <div className="flex flex-col gap-0.5 w-full items-center">
            {barsArray.map(b => (
              <div key={b} className="w-8 h-1 bg-amber-400 rounded-sm shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="mayan_gnostic_tool" className="space-y-8 pb-32">
      {/* Mystical Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-purple-500/20 bg-neutral-950/40 p-8 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-[10px] uppercase tracking-widest text-purple-300 font-semibold shadow-lg">Mayan Gnostic Wheel</span>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] uppercase tracking-widest text-cyan-300 font-semibold shadow-lg">Pleroma Sync</span>
            </div>
            <h1 className="text-4xl font-light text-white tracking-tight mb-3">Mayan Gnostic Synchronizer</h1>
            <p className="text-neutral-400 text-sm max-w-2xl font-light leading-relaxed">
              Ascend through the seven celestial Gates of the Gnostic Archons. Unify the 20 Solar Seals and 13 Galactic Tones of the Mayan Tzolkin calendar with the eternal emanations of the Hermetic Tree of Life. Calculate your cosmic code and experience pure Gnosis.
            </p>
          </div>
          
          {/* Interactive Date Selector */}
          <div className="bg-neutral-900/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 min-w-[240px] backdrop-blur-md">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Celestial Birth Alignment</span>
            <input 
              type="date" 
              value={birthDate} 
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-black/60 border border-white/20 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors cursor-pointer w-full"
            />
            <span className="text-[10px] text-neutral-500 font-mono text-right">Tzolkin Correlation v1.0</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual interactive wheel and information cards */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Rotating Cosmic Wheel (SVG) */}
        <div className="xl:col-span-7 bg-neutral-950/40 border border-white/10 rounded-[2.5rem] p-6 flex flex-col items-center justify-center relative backdrop-blur-2xl overflow-hidden min-h-[580px]">
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none" />
          
          {/* Subtle spinning background grid */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute w-[450px] h-[450px] rounded-full border border-dashed border-purple-500/10 pointer-events-none opacity-30 flex items-center justify-center"
          >
            <div className="w-[300px] h-[300px] rounded-full border border-dotted border-cyan-500/20" />
            <div className="absolute w-full h-[1px] bg-purple-500/5" />
            <div className="absolute h-full w-[1px] bg-purple-500/5" />
          </motion.div>

          <h2 className="text-sm font-mono text-neutral-400 uppercase tracking-widest mb-6 relative">Interactive Pleroma Alignment Matrix</h2>
          
          {/* Visual SVG Wheel */}
          <div className="relative w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] flex items-center justify-center">
            
            {/* Pulsing glow ring based on active frequencies */}
            <motion.div 
              animate={{ scale: attuning ? [1, 1.05, 1] : 1, opacity: attuning ? [0.6, 1, 0.6] : 0.4 }}
              transition={{ duration: 1.5, repeat: attuning ? Infinity : 0, ease: "easeInOut" }}
              className="absolute w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full filter blur-xl pointer-events-none"
              style={{ 
                background: `radial-gradient(circle, ${activeSeal.color}40, transparent)`,
                boxShadow: attuning ? `0 0 50px ${activeSeal.color}40` : 'none'
              }}
            />

            <svg viewBox="0 0 400 400" className="w-full h-full select-none cursor-pointer overflow-visible z-10">
              
              {/* Outer Ring Circle: 20 Mayan Seals */}
              <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3" />
              
              {/* Inner Ring Circle: 13 Tones */}
              <circle cx="200" cy="200" r="110" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" strokeDasharray="4 4" />
              
              {/* Center Gnostic Gates Orb */}
              <motion.circle 
                cx="200" 
                cy="200" 
                r="50" 
                fill="#0a0a0a" 
                stroke={activeSeal.color} 
                strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 15px ${activeSeal.color}60)` }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <text x="200" y="195" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace" letterSpacing="1">SEFIROT</text>
              <text x="200" y="210" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">{activeSeal.mayaName}</text>
              <text x="200" y="222" textAnchor="middle" fill={activeSeal.color} fontSize="8" fontFamily="monospace" fontWeight="semibold">TONE {activeTone.id}</text>

              {/* Draw Connections from Center to Active Seal */}
              {attuning && (
                <motion.line 
                  x1="200" 
                  y1="200" 
                  x2={200 + 160 * Math.cos((activeSeal.id * 18 - 90) * Math.PI / 180)} 
                  y2={200 + 160 * Math.sin((activeSeal.id * 18 - 90) * Math.PI / 180)} 
                  stroke={activeSeal.color} 
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Draw 20 Solar Seals Nodes */}
              {SOLAR_SEALS.map((seal, index) => {
                const angle = (index * 18 - 90) * Math.PI / 180;
                const r = 160;
                const x = 200 + r * Math.cos(angle);
                const y = 200 + r * Math.sin(angle);
                const isSelected = activeSeal.id === seal.id;

                return (
                  <g key={seal.id} onClick={() => { soundEngine.click(); setActiveSeal(seal); }} className="group">
                    {/* Glow on Selected */}
                    {isSelected && (
                      <circle cx={x} cy={y} r="14" fill="none" stroke={seal.color} strokeWidth="1.5" className="animate-pulse" />
                    )}
                    {/* Outer Connector Line */}
                    <line x1={200 + 130 * Math.cos(angle)} y1={200 + 130 * Math.sin(angle)} x2={x} y2={y} stroke={isSelected ? seal.color : "rgba(255,255,255,0.05)"} strokeWidth="1" />
                    {/* Node Dot */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelected ? "8" : "5"} 
                      fill={isSelected ? seal.color : "#1f1f1f"} 
                      stroke={isSelected ? "#ffffff" : seal.color} 
                      strokeWidth={isSelected ? "2" : "1.5"}
                      className="transition-all duration-300 hover:scale-125"
                    />
                    {/* Small text labels outside */}
                    <text 
                      x={200 + (r + 20) * Math.cos(angle)} 
                      y={200 + (r + 20) * Math.sin(angle) + 3} 
                      textAnchor="middle" 
                      fill={isSelected ? "white" : "rgba(156,163,175,0.4)"} 
                      fontSize={isSelected ? "9" : "7"} 
                      fontWeight={isSelected ? "bold" : "normal"}
                      fontFamily="monospace"
                    >
                      {seal.mayaName}
                    </text>
                  </g>
                );
              })}

              {/* Draw 13 Tones Nodes (Inner ring) */}
              {GALACTIC_TONES.map((tone, index) => {
                const angle = (index * (360 / 13) - 90) * Math.PI / 180;
                const r = 110;
                const x = 200 + r * Math.cos(angle);
                const y = 200 + r * Math.sin(angle);
                const isSelected = activeTone.id === tone.id;

                return (
                  <g key={tone.id} onClick={() => { soundEngine.click(); setActiveTone(tone); }}>
                    {isSelected && (
                      <circle cx={x} cy={y} r="10" fill="none" stroke="#fbbf24" strokeWidth="1" />
                    )}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelected ? "5" : "3"} 
                      fill={isSelected ? "#fbbf24" : "#111111"} 
                      stroke={isSelected ? "#ffffff" : "rgba(251,191,36,0.5)"} 
                      strokeWidth="1"
                    />
                    <text 
                      x={200 + (r - 14) * Math.cos(angle)} 
                      y={200 + (r - 14) * Math.sin(angle) + 2} 
                      textAnchor="middle" 
                      fill={isSelected ? "#fbbf24" : "rgba(156,163,175,0.3)"} 
                      fontSize={isSelected ? "8" : "6"}
                      fontWeight="bold"
                    >
                      {tone.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Attunement Bar / Sound trigger */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 w-full px-6 relative z-10">
            <button 
              onClick={handleAttune}
              disabled={attuning}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl border font-mono text-xs uppercase tracking-widest transition-all ${attuning ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)]' : 'bg-purple-900/40 hover:bg-purple-800/60 border-purple-500/30 text-purple-200'}`}
            >
              {attuning ? (
                <>
                  <Radio className="w-4 h-4 animate-ping" />
                  <span>Attuning {activeTone.frequency}Hz...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Attune Core Resonance</span>
                </>
              )}
            </button>
            
            <div className="text-neutral-500 text-xs font-mono">
              Attuned Signal: <span className="text-white font-bold">{activeTone.frequency} Hz</span>
            </div>
          </div>
        </div>

        {/* Column 2: Detailed alignment info & Gnostic Portal Card */}
        <div className="xl:col-span-5 space-y-8">
          
          {/* Birth Kin Summary Plate */}
          <div className="bg-neutral-950/40 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-2xl relative">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-2">My Galactic Signature</span>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden shrink-0" style={{ backgroundColor: activeSeal.color + '20' }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: activeSeal.color }} />
                <span className="text-xl font-bold font-mono" style={{ color: activeSeal.color }}>{activeSeal.mayaName[0]}</span>
              </div>
              
              <div>
                <h3 className="text-2xl font-light text-white leading-tight">Kin {calculatedKin}</h3>
                <p className="text-neutral-400 text-sm font-mono flex items-center gap-1">
                  <span style={{ color: activeSeal.color }} className="font-bold">{activeSeal.name}</span> 
                  <span>• Tone {activeTone.id} ({activeTone.name})</span>
                </p>
              </div>
              
              <div className="ml-auto shrink-0">
                {renderMayanToneDotsAndBars(activeTone)}
              </div>
            </div>

            {/* Mayan Tzolkin Oracle Partners cross display */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-3 text-center">Mayan Destiny Oracle Cross</span>
              <div className="flex flex-col items-center gap-2">
                {/* Guide (Top) */}
                <div className="flex flex-col items-center p-2 rounded-xl border border-white/5 bg-neutral-900/30 text-center min-w-[120px] max-w-[140px]">
                  <span className="text-[8px] uppercase text-neutral-500 font-mono">Guide</span>
                  <span className="text-[10px] font-semibold text-white" style={{ color: getGuideKin().color }}>{getGuideKin().name}</span>
                </div>
                
                {/* Horizontal Cross */}
                <div className="flex items-center gap-4 justify-center w-full">
                  {/* Antipode (Left) */}
                  <div className="flex flex-col items-center p-2 rounded-xl border border-white/5 bg-neutral-900/30 text-center min-w-[110px] max-w-[130px]">
                    <span className="text-[8px] uppercase text-neutral-500 font-mono">Antipode (Challenge)</span>
                    <span className="text-[10px] font-semibold text-white" style={{ color: getAntipodeKin().color }}>{getAntipodeKin().name}</span>
                  </div>
                  
                  {/* Destiny (Center) */}
                  <div className="flex flex-col items-center p-3 rounded-2xl border border-amber-400/40 bg-black/60 text-center min-w-[120px] max-w-[150px] shadow-lg shadow-amber-500/5">
                    <span className="text-[8px] uppercase text-amber-400 font-mono font-bold">Destiny Kin</span>
                    <span className="text-xs font-bold text-white" style={{ color: activeSeal.color }}>{activeSeal.name}</span>
                  </div>
                  
                  {/* Analog (Right) */}
                  <div className="flex flex-col items-center p-2 rounded-xl border border-white/5 bg-neutral-900/30 text-center min-w-[110px] max-w-[130px]">
                    <span className="text-[8px] uppercase text-neutral-500 font-mono">Analog (Support)</span>
                    <span className="text-[10px] font-semibold text-white" style={{ color: getAnalogKin().color }}>{getAnalogKin().name}</span>
                  </div>
                </div>

                {/* Occult (Bottom) */}
                <div className="flex flex-col items-center p-2 rounded-xl border border-white/5 bg-neutral-900/30 text-center min-w-[120px] max-w-[140px]">
                  <span className="text-[8px] uppercase text-neutral-500 font-mono">Occult (Magic)</span>
                  <span className="text-[10px] font-semibold text-white" style={{ color: getOccultKin().color }}>{getOccultKin().name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sefirot & Archon Gate Synthesis card */}
          <div className="bg-neutral-950/40 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-2xl relative">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 block mb-4">Gnostic-Kabbalistic Intersection</span>
            
            <div className="space-y-4">
              {/* Sefirah Connection */}
              <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-2xl flex gap-3 items-start">
                <Compass className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300">Tree of Life Sefirah</h4>
                  <p className="text-white text-sm font-semibold mb-1">{activeSeal.kabbalahSefirah}</p>
                  <p className="text-neutral-400 text-xs font-light leading-relaxed">
                    This Solar Seal anchors the divine emanations on the Tree of Life, channeling cosmic archetypes directly into your conscious personality structure.
                  </p>
                </div>
              </div>

              {/* Archon Gate Connection */}
              <div className="p-4 bg-cyan-950/10 border border-cyan-500/20 rounded-2xl flex gap-3 items-start">
                <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300">Archon Gateway Level</h4>
                  <p className="text-white text-sm font-semibold mb-1">{activeTone.gnosticSphere}</p>
                  <p className="text-neutral-400 text-xs font-light leading-relaxed">
                    Tone {activeTone.id} governs the gateway of ascension. Aligning with its sacred frequency allows the divine Pneuma (spiritual spark) to transcend material boundaries.
                  </p>
                </div>
              </div>

              {/* Gnostic Pleroma Meaning */}
              <div className="p-4 bg-neutral-900/40 border border-white/5 rounded-2xl flex gap-3 items-start">
                <Key className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400">Pleroma Gnosis Key</h4>
                  <p className="text-white text-sm font-semibold mb-1">{activeSeal.gnosticMeaning}</p>
                  <p className="text-neutral-400 text-xs font-light leading-relaxed">
                    The primordial Gnostic archetype associated with {activeSeal.mayaName}, revealing the aspect of the divine fullness you are here to synthesize.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Resonance logs */}
      {resonanceLog.length > 0 && (
        <div className="bg-neutral-950/40 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-2xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-3">Solfeggio Attunement Stream Logs</span>
          <div className="font-mono text-xs text-neutral-400 space-y-2">
            {resonanceLog.map((log, index) => (
              <div key={index} className="flex gap-2 items-start border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <span className="text-purple-400 font-bold">●</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decalogue Pleromic AI Synthesis block */}
      <div className="bg-neutral-950/40 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl relative">
        <div className="absolute top-0 right-0 p-4">
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>

        <div className="max-w-3xl">
          <h2 className="text-2xl font-light text-white tracking-tight mb-2">Pleromic Sophia Gnosis Synthesis</h2>
<div className="mb-4"><HigherMindExplanationButton sectionName="Mayan Gnostic Wheel" topicName="Tzolkin & Gnostic Syncretism" dataContext={{ activeSeal, activeTone }} /></div>
          <p className="text-neutral-400 text-sm font-light mb-6">
            Invoke the Sophia-Gnosis cosmic AI intelligence to synthesize your Mayan Kin signature, Gnostic gateways, and Kabbalistic pathways. This reading acts as a catalyst for awakening your latent divine spark.
          </p>

          <button 
            onClick={handleGenerateAISynthesis}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-mono text-xs uppercase tracking-widest transition-all ${isGenerating ? 'bg-purple-900/20 text-purple-400 border-purple-500/20 cursor-wait' : 'bg-purple-500 hover:bg-purple-400 border-purple-400 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02]'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Sophia Decryption...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Decrypt Pleromic Signature</span>
              </>
            )}
          </button>
        </div>

        {/* AI Synthesis Reading Display */}
        <AnimatePresence mode="wait">
          {gnosisReading && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              className="mt-8 pt-8 border-t border-white/10"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Decrypted Celestial Codex
                </span>
                
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono transition-colors"
                >
                  {copierOk ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Codex</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-3xl p-6 font-sans text-neutral-300 text-sm leading-relaxed space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 whitespace-pre-line shadow-inner">
                {gnosisReading}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
