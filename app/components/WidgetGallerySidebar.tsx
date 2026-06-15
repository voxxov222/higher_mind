import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, LayoutGrid, Radio, PieChart, Activity, Moon, Sun, Compass, Heart, Play, Layers, ShieldCheck, Pin, Check, Brain, Network, ScrollText
} from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

interface WidgetGallerySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawnWidget: (widgetType: string, componentName: string, defaultData: any) => void;
  onPinToProfile: (id: string, type: string, componentName: string, data: any) => void;
  profileWidgets?: any[];
  onRemoveProfileWidget: (id: string) => void;
  activeWorkspaceWidgets?: any[];
  onRemoveWorkspaceWidget: (id: string) => void;
}

export const WidgetGallerySidebar: React.FC<WidgetGallerySidebarProps> = ({
  isOpen,
  onClose,
  onSpawnWidget,
  onPinToProfile,
  profileWidgets = [],
  onRemoveProfileWidget,
  activeWorkspaceWidgets = [],
  onRemoveWorkspaceWidget
}) => {
  
  // Available tools definitions
  const galleryItems = [
    {
      id: 'radar-power',
      type: 'chart',
      componentName: 'Planetary Power Radar',
      displayName: 'Planetary Power Radar',
      description: 'Active dynamic radar mapping your astrological planet hierarchy strengths.',
      icon: Radio,
      iconColor: 'text-purple-400',
      glowColor: 'rgba(168,85,247,0.4)',
      defaultData: [
        { name: 'Sun', strength: 8 },
        { name: 'Moon', strength: 9 },
        { name: 'Mercury', strength: 7 },
        { name: 'Venus', strength: 8 },
        { name: 'Mars', strength: 6 },
        { name: 'Jupiter', strength: 10 }
      ]
    },
    {
      id: 'pie-elements',
      type: 'chart',
      componentName: 'Elements Balance',
      displayName: 'Elements Balance Wheel',
      description: 'Visualizing percentages of Fire, Earth, Air, and Water elemental properties.',
      icon: PieChart,
      iconColor: 'text-amber-400',
      glowColor: 'rgba(245,158,11,0.4)',
      defaultData: [
        { name: 'Fire', value: 30 },
        { name: 'Earth', value: 25 },
        { name: 'Air', value: 25 },
        { name: 'Water', value: 20 }
      ]
    },
    {
      id: 'soul-age',
      type: 'text',
      componentName: 'SoulAge',
      displayName: 'Soul Age Calculator',
      description: 'Gematria-backed algorithm computing your true cosmic soul age classification.',
      icon: Layers,
      iconColor: 'text-emerald-400',
      glowColor: 'rgba(16,185,129,0.4)',
      defaultData: 'ANCIENT SOUL'
    },
    {
      id: 'daily-lunar-phase',
      type: 'widget',
      componentName: 'Lunar Phase',
      displayName: 'Lunar Phase Compass',
      description: 'Displays the current lunar cycle elevation, luminosity and astrological sign placement.',
      icon: Moon,
      iconColor: 'text-sky-400',
      glowColor: 'rgba(56,189,248,0.4)',
      defaultData: { phase: 'Waning Gibbous' }
    },
    {
      id: 'daily-solfeggio',
      type: 'widget',
      componentName: 'Vibrational Harmony',
      displayName: 'Solfeggio Frequency Tuner',
      description: 'Outputs therapeutic healing sound frequencies mapped to cellular DNA fields.',
      icon: Radio,
      iconColor: 'text-pink-400',
      glowColor: 'rgba(244,63,94,0.4)',
      defaultData: { freq: '528 Hz - DNA Repair' }
    },
    {
      id: 'daily-transit-current',
      type: 'widget',
      componentName: 'Active Transit',
      displayName: 'Active Transit Pulse',
      description: 'Real-time monitoring of currently activating cosmic progressions and celestial aspects.',
      icon: Activity,
      iconColor: 'text-red-400',
      glowColor: 'rgba(239,68,68,0.4)',
      defaultData: { transit: 'Mercury Trine Pluto' }
    },
    {
      id: 'oracle-wisdom',
      type: 'widget',
      componentName: 'Astraea Wisdom',
      displayName: 'Oracle of Astraea',
      description: 'Immediate deep, cosmic oracle projections from asteroid Goddess Astraea.',
      icon: Compass,
      iconColor: 'text-fuchsia-400',
      glowColor: 'rgba(217,70,239,0.4)',
      defaultData: {
        archetype: 'The Visionary',
        text: 'Align your neural pathways to the resonance of distant stellar fields. There, wisdom is infinite.',
        energy: 'Intuitive Transmutation'
      }
    },
    {
      id: 'chakra-resonance',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Chakra Resonance',
      description: 'Monitor etheric energy field spin rates and alignment.',
      icon: Activity,
      iconColor: 'text-rose-400',
      glowColor: 'rgba(244,63,94,0.4)',
      defaultData: { Root: '98%', Sacral: '84%', Solar: '91%', Heart: '100%', Throat: '77%', ThirdEye: '95%', Crown: '88%' }
    },
    {
      id: 'advanced-problem-solver',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Quantum Problem Solver',
      description: 'Advanced features thinking and problem solving matrix.',
      icon: Brain,
      iconColor: 'text-indigo-400',
      glowColor: 'rgba(99,102,241,0.4)',
      defaultData: { Algorithm: 'Deep Genesis', Variables: 144000, State: 'Synthesizing', Output: 'Non-linear' }
    },
    {
      id: 'cognitive-architecture',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Cognitive Architecture',
      description: 'Neural pathways for advanced autonomous thinking.',
      icon: Network,
      iconColor: 'text-purple-400',
      glowColor: 'rgba(168,85,247,0.4)',
      defaultData: { Layers: 12, Synapses: 'Active', Inference: 'Predictive', LogicGate: 'Open' }
    },
    {
      id: 'biorhythm-cycle',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Cosmic Biorhythm',
      description: 'Sync physical, emotional, and intellectual cycles with lunar transits.',
      icon: Heart,
      iconColor: 'text-emerald-400',
      glowColor: 'rgba(16,185,129,0.4)',
      defaultData: { Physical: 'Peak', Emotional: 'Ascending', Intellectual: 'Critical', Intuition: 'High' }
    },
    {
      id: 'merkaba-status',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Merkaba Spin Rate',
      description: 'Track the geometrical light body counter-rotational spin.',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      glowColor: 'rgba(245,158,11,0.4)',
      defaultData: { TopTetrahedron: '99.9% C', BottomTetrahedron: '99.9% C', Alignment: 'Harmonic' }
    },
    {
      id: 'deity-db',
      type: 'widget',
      componentName: 'DeityDB Portal',
      displayName: 'DeityDB Portal (jebboone)',
      description: 'Divine archetype lookup engine and Oracle matching. Explore Egyptian, Norse, Celtic and Classical deities.',
      icon: ScrollText,
      iconColor: 'text-cyan-400',
      glowColor: 'rgba(34,211,238,0.4)',
      defaultData: { query: '', selectedPantheon: 'All' }
    },
    {
      id: 'pineal-gland-tuning',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Pineal Calibration',
      description: 'Measure decalcification levels and dimensional perception capacity.',
      icon: Activity,
      iconColor: 'text-indigo-400',
      glowColor: 'rgba(99,102,241,0.4)',
      defaultData: { Status: 'Active', Decalcification: '88%', DimPerception: '5D to 7D bounds' }
    },
    {
      id: 'tarot-daily-draw',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Tarot Oracle',
      description: 'Your energetic blueprint card of the current cycle.',
      icon: Layers,
      iconColor: 'text-purple-400',
      glowColor: 'rgba(168,85,247,0.4)',
      defaultData: { Card: 'The Star', Element: 'Air', Archetype: 'Hope, healing, inspiration' }
    },
    {
      id: 'numerology-lifepath',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Numerology Core',
      description: 'Vibrational numbers derived from birth code and soul contract.',
      icon: LayoutGrid,
      iconColor: 'text-cyan-400',
      glowColor: 'rgba(34,211,238,0.4)',
      defaultData: { LifePath: 7, Destiny: 9, SoulUrge: 11, Personality: 22 }
    },
    {
      id: 'astral-projection-coord',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Astral Coordinates',
      description: 'Current metaphysical location overlay tracking.',
      icon: Compass,
      iconColor: 'text-lime-400',
      glowColor: 'rgba(163,230,53,0.4)',
      defaultData: { Realm: 'Akashic Edge', Density: '6th', Coordinates: 'A-77.94.Sigma' }
    },
    {
      id: 'quantum-entanglement',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Quantum Entanglements',
      description: 'Monitor connections to soul group and karmic ties.',
      icon: Radio,
      iconColor: 'text-blue-400',
      glowColor: 'rgba(56,130,246,0.4)',
      defaultData: { ActiveLinks: 12, TwinFlame: 'In Proximity', SoulGroupNodes: 'Online' }
    },
    {
      id: 'akashic-records-link',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Akashic Terminal',
      description: 'Direct reading bandwidth connection to the universal ledger.',
      icon: ShieldCheck,
      iconColor: 'text-yellow-400',
      glowColor: 'rgba(250,204,21,0.4)',
      defaultData: { Connection: 'Stable', Bandwidth: 'High Resonance', CurrentChapter: 'Earth Experience 3' }
    },
    {
      id: 'sacred-geometry-flux',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Sacred Grid Flux',
      description: 'Current geometric pattern forming in the global consciousness grid.',
      icon: PieChart,
      iconColor: 'text-teal-400',
      glowColor: 'rgba(45,212,191,0.4)',
      defaultData: { Pattern: 'Sri Yantra', CoreFrequency: '432 Hz', Coherence: 'Scaling' }
    },
    {
      id: 'starseed-origin',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Starseed Vector',
      description: 'Galactic soul origin tracking and lineage integration.',
      icon: Sparkles,
      iconColor: 'text-violet-400',
      glowColor: 'rgba(139,92,246,0.4)',
      defaultData: { Primary: 'Pleiadian', Secondary: 'Sirian', Integration: '92% completed' }
    },
    {
      id: 'angel-number-sync',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Angel Number Sync',
      description: 'Synchronistic numeric patterns currently clustering in reality field.',
      icon: Play,
      iconColor: 'text-sky-400',
      glowColor: 'rgba(14,165,233,0.4)',
      defaultData: { Pattern1: '11:11 - Awakening', Pattern2: '444 - Protection', Intensity: 'High Variance' }
    },
    {
      id: 'ley-line-nexus',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Ley Line Nexus',
      description: 'Earth energetic grid intersections near current coordinate plane.',
      icon: Compass,
      iconColor: 'text-green-400',
      glowColor: 'rgba(74,222,128,0.4)',
      defaultData: { NearestNode: 'Sedona Vortex', Proximity: 'Energetic Range', Type: 'Magnetic Female' }
    },
    {
      id: 'etheric-body-scan',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Etheric Layer Scan',
      description: 'Structural integrity of the aura and auric field bleed-through.',
      icon: Activity,
      iconColor: 'text-indigo-500',
      glowColor: 'rgba(99,102,241,0.4)',
      defaultData: { Layer1: 'Physical - Intact', Layer4: 'Astral - Expanding', Layer7: 'Ketheric - Luminous' }
    },
    {
      id: 'karmic-debt-ledger',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Karmic Ledger',
      description: 'Status of transmutational debt and dharma accumulation.',
      icon: Layers,
      iconColor: 'text-orange-400',
      glowColor: 'rgba(251,146,60,0.4)',
      defaultData: { Dharma: '+8,400', DebtTransmuted: '85%', CurrentLesson: 'Unconditional Forgiveness' }
    },
    {
      id: 'flower-of-life-grid',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Flower of Life Map',
      description: 'Visualization parameters for personal creation reality sphere.',
      icon: Radio,
      iconColor: 'text-pink-400',
      glowColor: 'rgba(244,114,182,0.4)',
      defaultData: { NodeActivations: '144/144', Phase: 'Genesis', Symmetry: 'Perfect' }
    },
    {
      id: 'pleiadian-light-codes',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Pleiadian Light Codes',
      description: 'Active DNA uploads and crystalline light structure downloads.',
      icon: Sparkles,
      iconColor: 'text-cyan-300',
      glowColor: 'rgba(103,232,249,0.4)',
      defaultData: { Source: 'Alcyone', StreamRate: '300 TB/s (Spiritual)', Decryption: 'In progress' }
    },
    {
      id: 'golden-ratio-pulse',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Golden Ratio Pulse',
      description: 'Phi ratio harmonic oscillation across all energetic centers.',
      icon: PieChart,
      iconColor: 'text-yellow-500',
      glowColor: 'rgba(234,179,8,0.4)',
      defaultData: { PhiConstant: '1.618033988749', HarmonicResonance: 'True', Oscillation: 'Stable Wave' }
    },
    {
      id: 'kundalini-rise',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Kundalini Vector',
      description: 'Ascension metrics of the serpent fire resting at the spine base.',
      icon: Activity,
      iconColor: 'text-red-500',
      glowColor: 'rgba(239,68,68,0.4)',
      defaultData: { Status: 'Awakening', Position: 'Anahata (Heart)', Temperature: 'Pranic Heat' }
    },
    {
      id: 'cosmic-weather',
      type: 'widget',
      componentName: 'GenericWidget',
      displayName: 'Cosmic Weather',
      description: 'Solar flares, coronal mass ejections, and geomagnetic storm index.',
      icon: Sun,
      iconColor: 'text-orange-500',
      glowColor: 'rgba(249,115,22,0.4)',
      defaultData: { KPIndex: '4 (Unsettled)', SolarWind: '450 km/s', SchumannResonance: 'Spiking at 36 Hz' }
    }
  ];

  const handleSpawn = (item: typeof galleryItems[0]) => {
    soundEngine.mechClick();
    onSpawnWidget(item.id, item.componentName, item.defaultData);
  };

  const handleTogglePin = (item: typeof galleryItems[0]) => {
    soundEngine.select();
    const isPinned = profileWidgets.some(w => w.id === item.id);
    if (isPinned) {
      onRemoveProfileWidget(item.id);
    } else {
      onPinToProfile(item.id, item.type, item.componentName, item.defaultData);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] pointer-events-auto"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-stone-950/95 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[200] flex flex-col pointer-events-auto overflow-hidden text-white"
          >
            {/* Header scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

            {/* Sidebar Navigation Banner */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-amber-500 to-indigo-500" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <LayoutGrid size={18} className="text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest font-sans text-white">Quantum Widget Deck</h2>
                  <p className="text-[9px] uppercase tracking-wider text-amber-500/80 font-mono">Astral Intelligence Spawner</p>
                </div>
              </div>
              <button 
                onClick={() => { soundEngine.back(); onClose(); }}
                className="p-2 hover:bg-white/10 rounded-full border border-white/5 transition-colors"
                title="Deactivate Deck"
              >
                <X size={16} className="text-stone-400 hover:text-white" />
              </button>
            </div>

            {/* Scrollable Gallery Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar relative z-10">
              <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest border-b border-white/5 pb-2 flex justify-between">
                <span>ASTROLOGICAL SYSTEMS</span>
                <span>{galleryItems.length} DESIGNS AVAILABLE</span>
              </div>

              {galleryItems.map((item) => {
                const isPinned = profileWidgets.some(w => w.id === item.id);
                const isSpawned = activeWorkspaceWidgets.some(w => w.id === item.id);
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl relative overflow-hidden group transition-all"
                  >
                    {/* Glowing highlight anchor */}
                    <div 
                      className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-stone-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(to bottom, transparent, ${item.glowColor}, transparent)` }}
                    />

                    <div className="flex items-start gap-4">
                      {/* Icon container */}
                      <div className={`p-3 bg-white/5 border border-white/10 rounded-xl shrink-0 group-hover:border-white/20 transition-all shadow-inner`}>
                        <Icon size={20} className={`${item.iconColor} group-hover:scale-110 transition-transform`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs uppercase font-bold tracking-wider text-stone-200 font-sans group-hover:text-white transition-colors">{item.displayName}</h3>
                          {isPinned && <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/40 rounded text-amber-300 font-mono uppercase font-bold">PINNED</span>}
                        </div>
                        <p className="text-[10px] text-zinc-400 group-hover:text-zinc-300 leading-relaxed font-light">{item.description}</p>
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                      {/* Spawn to Workspace Button */}
                      <button
                        onClick={() => handleSpawn(item)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold transition-all border ${
                          isSpawned 
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]'
                            : 'bg-black/40 hover:bg-purple-500/20 hover:border-purple-500/30 text-stone-300 hover:text-white border-white/5'
                        }`}
                      >
                        {isSpawned ? <Check size={10} className="text-purple-400 animate-pulse" /> : <Play size={10} className="text-stone-400" />}
                        {isSpawned ? 'Respawn in Workspace' : 'Spawn to Workspace'}
                      </button>

                      {/* Pin to Profile Button */}
                      <button
                        onClick={() => handleTogglePin(item)}
                        className={`p-2 rounded-lg border transition-all ${
                          isPinned
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-black/40 hover:bg-amber-500/10 hover:border-amber-500/30 text-stone-400 hover:text-amber-300 border-white/5'
                        }`}
                        title={isPinned ? 'Remove Pin from Profile' : 'Pin to Profile'}
                      >
                        <Pin size={12} className={isPinned ? 'fill-amber-400' : ''} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Sync Status Footer */}
            <div className="p-5 border-t border-white/10 bg-black/60 relative text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-mono uppercase tracking-wider">
                <ShieldCheck size={10} className="text-emerald-500 animate-pulse" />
                <span>INTELLIGENCE COHERENCE SYNC STATUS: SECURE</span>
              </div>
              <p className="text-[8px] text-stone-400 mt-1 uppercase tracking-widest leading-relaxed">Changes automatically sync to cloud profile in real-time</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
