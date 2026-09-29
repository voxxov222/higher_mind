import React, { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { NatalChart3DScene } from './NatalChart3DScene';
import { NatalChartIndexHUD } from './NatalChartIndexHUD';
import { 
  NatalPlanet, NatalAspect, NatalChartProfile, 
  RAFAEL_NADAL_CHART, buildProfileFromCosmicData 
} from './natalChartData';
import { CosmicData } from '../../types';
import { soundEngine } from '../../lib/soundEffects';

interface NatalChart3DProps {
  data?: CosmicData | null;
  initialPreset?: 'nadal' | 'user';
  className?: string;
}

export function NatalChart3D({ data, initialPreset = 'nadal', className = '' }: NatalChart3DProps) {
  // Active preset state
  const [activePresetId, setActivePresetId] = useState<string>(initialPreset);
  const [customChart, setCustomChart] = useState<NatalChartProfile | null>(null);

  // Custom Input Modal state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBirthDate, setCustomBirthDate] = useState('');
  const [customBirthTime, setCustomBirthTime] = useState('');
  const [customBirthPlace, setCustomBirthPlace] = useState('');

  // 3D Scene Interactive states
  const [selectedPlanet, setSelectedPlanet] = useState<NatalPlanet | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<NatalAspect | null>(null);
  const [aspectFilter, setAspectFilter] = useState<'all' | 'harmonious' | 'dynamic' | 'selected' | 'major'>('all');
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [viewPerspective, setViewPerspective] = useState<'angle' | 'top' | 'side'>('angle');
  const [showHouseLabels, setShowHouseLabels] = useState(true);
  const [showDegrees, setShowDegrees] = useState(true);
  const [arcHeightMultiplier, setArcHeightMultiplier] = useState(1.0);

  // Compute active chart
  const activeChart = useMemo<NatalChartProfile>(() => {
    if (activePresetId === 'custom' && customChart) {
      return customChart;
    }
    if (activePresetId === 'user' && data) {
      return buildProfileFromCosmicData(data, data.userProfile?.name || 'Cosmic Traveler');
    }
    // Default to Rafael Nadal's official verified birth chart
    return RAFAEL_NADAL_CHART;
  }, [activePresetId, customChart, data]);

  const handleSelectPresetChart = (presetId: 'nadal' | 'user' | 'custom') => {
    setActivePresetId(presetId);
    setSelectedPlanet(null);
    setSelectedAspect(null);
  };

  const handleGenerateCustomChart = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.confirm();

    // Create custom profile based on user input
    const generated: NatalChartProfile = {
      ...RAFAEL_NADAL_CHART,
      id: `custom_${Date.now()}`,
      title: `${customName || 'Cosmic Traveler'}'s Natal Matrix`,
      subjectName: customName || 'Cosmic Traveler',
      birthDate: customBirthDate || 'March 21, 1990',
      birthTime: customBirthTime || '12:00 PM',
      location: customBirthPlace || 'Alexandria, Egypt',
    };

    setCustomChart(generated);
    setActivePresetId('custom');
    setIsCustomModalOpen(false);
  };

  return (
    <div className={`relative w-full h-full min-h-[600px] bg-[#030509] overflow-hidden select-none ${className}`}>
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 42, 48], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerDown={() => {
          // Deselect on clicking empty cosmic space
          setSelectedPlanet(null);
          setSelectedAspect(null);
        }}
      >
        <color attach="background" args={['#030509']} />
        <Suspense fallback={null}>
          <NatalChart3DScene
            chart={activeChart}
            selectedPlanet={selectedPlanet}
            onSelectPlanet={(planet) => {
              setSelectedPlanet(planet);
              setSelectedAspect(null);
            }}
            selectedAspect={selectedAspect}
            onSelectAspect={(aspect) => {
              setSelectedAspect(aspect);
              setSelectedPlanet(null);
            }}
            aspectFilter={aspectFilter}
            isAutoRotate={isAutoRotate}
            rotationSpeed={rotationSpeed}
            viewPerspective={viewPerspective}
            showHouseLabels={showHouseLabels}
            showDegrees={showDegrees}
            arcHeightMultiplier={arcHeightMultiplier}
          />
        </Suspense>
      </Canvas>

      {/* Floating HUD & Information Matrix */}
      <NatalChartIndexHUD
        chart={activeChart}
        selectedPlanet={selectedPlanet}
        onSelectPlanet={setSelectedPlanet}
        selectedAspect={selectedAspect}
        onSelectAspect={setSelectedAspect}
        aspectFilter={aspectFilter}
        setAspectFilter={setAspectFilter}
        isAutoRotate={isAutoRotate}
        setIsAutoRotate={setIsAutoRotate}
        viewPerspective={viewPerspective}
        setViewPerspective={setViewPerspective}
        showDegrees={showDegrees}
        setShowDegrees={setShowDegrees}
        arcHeightMultiplier={arcHeightMultiplier}
        setArcHeightMultiplier={setArcHeightMultiplier}
        onSelectPresetChart={handleSelectPresetChart}
        activePresetId={activePresetId}
        hasUserChart={!!data}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Custom Chart Generation Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/20 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400" />
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Input Natal Coordinates
                  </h3>
                </div>
                <button
                  onClick={() => setIsCustomModalOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGenerateCustomChart} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Rafael Nadal, Carl Jung, Leonardo da Vinci"
                    className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Birth Date</label>
                    <input
                      type="date"
                      value={customBirthDate}
                      onChange={(e) => setCustomBirthDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Birth Time</label>
                    <input
                      type="time"
                      value={customBirthTime}
                      onChange={(e) => setCustomBirthTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Birth Location (City, Country)</label>
                  <input
                    type="text"
                    value={customBirthPlace}
                    onChange={(e) => setCustomBirthPlace(e.target.value)}
                    placeholder="e.g. Manacor, Spain or New York, USA"
                    className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    Project 3D Chart
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NatalChart3D;
