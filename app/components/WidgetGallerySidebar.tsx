import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, LayoutGrid, Radio, PieChart, Activity, Moon, Compass, Heart, Play, Layers, ShieldCheck, Pin, Check, Trash2 
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
