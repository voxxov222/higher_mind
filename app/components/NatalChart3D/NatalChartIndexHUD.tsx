import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Eye, RotateCw, Filter, Sparkles, ChevronDown, 
  ChevronUp, Layers, Table, Grid, Info, Volume2, 
  Maximize2, Minimize2, Search, Award, Activity, 
  Calendar, MapPin, Clock, X, ExternalLink, Brain, RefreshCw
} from 'lucide-react';
import { 
  NatalPlanet, NatalAspect, NatalHouse, NatalChartProfile, 
  RAFAEL_NADAL_CHART 
} from './natalChartData';
import { soundEngine } from '../../lib/soundEffects';

interface NatalChartIndexHUDProps {
  chart: NatalChartProfile;
  selectedPlanet: NatalPlanet | null;
  onSelectPlanet: (planet: NatalPlanet | null) => void;
  selectedAspect: NatalAspect | null;
  onSelectAspect: (aspect: NatalAspect | null) => void;
  aspectFilter: 'all' | 'harmonious' | 'dynamic' | 'selected' | 'major';
  setAspectFilter: (filter: 'all' | 'harmonious' | 'dynamic' | 'selected' | 'major') => void;
  isAutoRotate: boolean;
  setIsAutoRotate: (v: boolean) => void;
  viewPerspective: 'angle' | 'top' | 'side';
  setViewPerspective: (v: 'angle' | 'top' | 'side') => void;
  showDegrees: boolean;
  setShowDegrees: (v: boolean) => void;
  arcHeightMultiplier: number;
  setArcHeightMultiplier: (v: number) => void;
  onSelectPresetChart: (presetId: 'nadal' | 'user' | 'custom') => void;
  activePresetId: string;
  hasUserChart: boolean;
  onOpenCustomModal: () => void;
  onSynthesizeReading?: () => void;
}

export const NatalChartIndexHUD: React.FC<NatalChartIndexHUDProps> = ({
  chart,
  selectedPlanet,
  onSelectPlanet,
  selectedAspect,
  onSelectAspect,
  aspectFilter,
  setAspectFilter,
  isAutoRotate,
  setIsAutoRotate,
  viewPerspective,
  setViewPerspective,
  showDegrees,
  setShowDegrees,
  arcHeightMultiplier,
  setArcHeightMultiplier,
  onSelectPresetChart,
  activePresetId,
  hasUserChart,
  onOpenCustomModal,
  onSynthesizeReading,
}) => {
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'planets' | 'houses' | 'aspects' | 'elements'>('planets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isControlsMinimized, setIsControlsMinimized] = useState(false);

  // Audio voice synthesis for planet readings
  const handleSpeakPlanet = (planet: NatalPlanet) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${planet.name} in ${planet.sign}, House ${planet.house}. ${planet.interpretation}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredPlanets = chart.planets.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.archetype.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAspects = chart.aspects.filter(a =>
    a.planet1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.planet2.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between overflow-hidden">
      {/* -------------------------------------------------------------
          TOP BAR: Identity Banner & Presets
      ------------------------------------------------------------- */}
      <div className="p-3 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-mono">
              <Sparkles size={10} className="text-cyan-400" />
              3D Spatial Astrolabe
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {chart.timezone}
            </span>
          </div>

          <h2 className="text-lg md:text-2xl font-bold text-white tracking-wide flex items-center gap-2 mt-0.5">
            {chart.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-1 font-light">
            <span className="flex items-center gap-1 text-amber-300">
              <Calendar size={12} /> {chart.birthDate}
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <Clock size={12} /> {chart.birthTime}
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <MapPin size={12} /> {chart.location}
            </span>
          </div>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex rounded-full bg-zinc-900/90 border border-white/15 p-0.5 backdrop-blur-md">
            <button
              onClick={() => {
                soundEngine.select();
                onSelectPresetChart('nadal');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activePresetId === 'nadal'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Rafael Nadal
            </button>

            {hasUserChart && (
              <button
                onClick={() => {
                  soundEngine.select();
                  onSelectPresetChart('user');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activePresetId === 'user'
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                My Chart
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.select();
                onOpenCustomModal();
              }}
              className="px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-white transition-all flex items-center gap-1"
            >
              <RefreshCw size={11} />
              Custom
            </button>
          </div>

          {/* Full Indexed Matrix Toggle */}
          <button
            onClick={() => {
              soundEngine.click();
              setIsIndexOpen(!isIndexOpen);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 backdrop-blur-md border ${
              isIndexOpen
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                : 'bg-black/70 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/40'
            }`}
          >
            <Table size={14} />
            <span>{isIndexOpen ? 'Close Index' : 'Indexed Matrix'}</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CENTER INTERACTION: Planet / Aspect Holographic Card
      ------------------------------------------------------------- */}
      <div className="pointer-events-none flex-1 flex items-center justify-start p-4 md:p-8">
        <AnimatePresence>
          {selectedPlanet && !isIndexOpen && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto max-w-sm w-full bg-zinc-950/90 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden"
              style={{
                boxShadow: `0 0 40px ${selectedPlanet.glowColor}25`,
                borderLeft: `4px solid ${selectedPlanet.color}`
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg"
                    style={{ 
                      backgroundColor: `${selectedPlanet.color}25`,
                      color: selectedPlanet.color,
                      border: `1px solid ${selectedPlanet.color}50`
                    }}
                  >
                    {selectedPlanet.symbol}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      {selectedPlanet.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      {selectedPlanet.degree}° {selectedPlanet.sign} • House {selectedPlanet.house}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSpeakPlanet(selectedPlanet)}
                    className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                    title="Synthesize vocal transmission"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    onClick={() => onSelectPlanet(null)}
                    className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Dignity & Archetype Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                  selectedPlanet.dignity === 'Exaltation' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  selectedPlanet.dignity === 'Domicile' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                  selectedPlanet.dignity === 'Detriment' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  selectedPlanet.dignity === 'Fall' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {selectedPlanet.dignity}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                  {selectedPlanet.element} • {selectedPlanet.modality}
                </span>

                {selectedPlanet.isRetrograde && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                    ℞ Retrograde
                  </span>
                )}
              </div>

              {/* Archetype & Description */}
              <div className="text-xs text-zinc-300 leading-relaxed font-light space-y-2 max-h-48 overflow-y-auto pr-1">
                <p className="font-medium text-cyan-300 text-sm">
                  {selectedPlanet.archetype}
                </p>
                <p className="text-zinc-300">
                  {selectedPlanet.interpretation}
                </p>
              </div>

              {/* Associated Aspects */}
              <div className="pt-2 border-t border-white/10">
                <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2 font-mono">
                  Aspect Energy Conduits
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {chart.aspects
                    .filter(a => a.planet1.toLowerCase() === selectedPlanet.name.toLowerCase() || 
                                 a.planet2.toLowerCase() === selectedPlanet.name.toLowerCase())
                    .map((a, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          soundEngine.select();
                          onSelectAspect(a);
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono bg-white/5 hover:bg-white/15 transition-all flex items-center gap-1 border border-white/10"
                        style={{ borderLeftColor: a.color, borderLeftWidth: '3px' }}
                      >
                        <span>{a.type}</span>
                        <span className="text-zinc-400">
                          {a.planet1 === selectedPlanet.name ? a.planet2 : a.planet1}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedAspect && !selectedPlanet && !isIndexOpen && (
            <motion.div
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto max-w-sm w-full bg-zinc-950/90 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl space-y-3 relative overflow-hidden"
              style={{
                boxShadow: `0 0 40px ${selectedAspect.color}30`,
                borderLeft: `4px solid ${selectedAspect.color}`
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: selectedAspect.color }}>
                    {selectedAspect.nature} Aspect Arc ({selectedAspect.angle}°)
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-wide mt-0.5">
                    {selectedAspect.planet1} {selectedAspect.type.toUpperCase()} {selectedAspect.planet2}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Orb: {selectedAspect.orbFormatted}
                  </p>
                </div>
                <button
                  onClick={() => onSelectAspect(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-light">
                {selectedAspect.synthesis}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* -------------------------------------------------------------
          BOTTOM CONTROLS BAR: Filters, Views & Toggles
      ------------------------------------------------------------- */}
      <div className="p-3 md:p-5 pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Quick Aspect Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mr-1 hidden sm:inline">
            Arcs:
          </span>
          {[
            { id: 'all', label: 'All Arcs' },
            { id: 'harmonious', label: 'Harmonious (△/⚹)' },
            { id: 'dynamic', label: 'Dynamic (□/☍)' },
            { id: 'major', label: 'Major Only' },
            ...(selectedPlanet ? [{ id: 'selected', label: `${selectedPlanet.name}'s Arcs` }] : []),
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                soundEngine.select();
                setAspectFilter(f.id as any);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                aspectFilter === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-semibold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Right: Camera Presets & Arc Height Controls */}
        <div className="flex items-center gap-2">
          {/* Camera View Switcher */}
          <div className="flex rounded-full bg-zinc-900/90 border border-white/15 p-0.5">
            {[
              { id: 'angle', label: '45° 3D' },
              { id: 'top', label: 'Top Flat' },
              { id: 'side', label: 'Horizon' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => {
                  soundEngine.select();
                  setViewPerspective(v.id as any);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                  viewPerspective === v.id
                    ? 'bg-white/20 text-white font-semibold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => {
              soundEngine.click();
              setIsAutoRotate(!isAutoRotate);
            }}
            className={`p-2 rounded-full border transition-all ${
              isAutoRotate
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Celestial Rotation"
          >
            <RotateCw size={15} className={isAutoRotate ? 'animate-spin' : ''} />
          </button>

          {/* Degrees toggle */}
          <button
            onClick={() => {
              soundEngine.click();
              setShowDegrees(!showDegrees);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
              showDegrees
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-zinc-900 border-white/10 text-zinc-500'
            }`}
            title="Toggle exact degrees on planets"
          >
            ° Degrees
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          FULL INDEXED COSMIC MATRIX DRAWER (EXPANDABLE)
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {isIndexOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-50 pointer-events-auto flex flex-col overflow-hidden text-white"
          >
            {/* Index Header */}
            <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Comprehensive Astrological Index
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {chart.subjectName}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-wide mt-1">
                  Indexed Planetary Blueprint & Aspect Resonances
                </h2>
              </div>

              {/* Search and Close */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search planets, signs, aspects..."
                    className="w-full bg-zinc-900 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  onClick={() => setIsIndexOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="px-4 md:px-6 pt-3 border-b border-white/10 flex gap-2 overflow-x-auto">
              {[
                { id: 'planets', label: `Planetary Bodies (${chart.planets.length})` },
                { id: 'houses', label: `Houses & Angles (12 Cusps)` },
                { id: 'aspects', label: `Aspect Conduits (${chart.aspects.length})` },
                { id: 'elements', label: `Elemental Balance` },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    soundEngine.select();
                    setActiveTab(t.id as any);
                  }}
                  className={`pb-3 px-3 text-xs font-semibold tracking-wider transition-all border-b-2 whitespace-nowrap ${
                    activeTab === t.id
                      ? 'border-cyan-400 text-cyan-300 font-bold'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Index Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* TAB 1: PLANETS INDEX */}
              {activeTab === 'planets' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlanets.map(planet => {
                    const isSelected = selectedPlanet?.name === planet.name;
                    return (
                      <div
                        key={planet.name}
                        onClick={() => {
                          soundEngine.select();
                          onSelectPlanet(planet);
                          setIsIndexOpen(false);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                            : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/10 hover:border-white/20'
                        }`}
                        style={{ borderLeftColor: planet.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span 
                              className="text-2xl font-bold w-10 h-10 rounded-xl flex items-center justify-center shadow"
                              style={{ backgroundColor: `${planet.color}20`, color: planet.color }}
                            >
                              {planet.symbol}
                            </span>
                            <div>
                              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {planet.name}
                              </h4>
                              <p className="text-xs text-zinc-400 font-mono">
                                {planet.degree}° {planet.sign} {planet.signSymbol}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-mono text-zinc-400 px-2 py-1 rounded bg-white/5">
                            House {planet.house}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                            planet.dignity === 'Exaltation' ? 'bg-emerald-500/20 text-emerald-300' :
                            planet.dignity === 'Domicile' ? 'bg-indigo-500/20 text-indigo-300' :
                            planet.dignity === 'Detriment' ? 'bg-rose-500/20 text-rose-300' :
                            planet.dignity === 'Fall' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {planet.dignity}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-zinc-300">
                            {planet.element}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-zinc-300">
                            {planet.modality}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 font-light mt-3 line-clamp-3 leading-relaxed">
                          {planet.interpretation}
                        </p>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 group-hover:text-cyan-400 font-mono">
                          <span>Focus in 3D Wheel →</span>
                          <span>{planet.archetype}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: HOUSES & ANGLES INDEX */}
              {activeTab === 'houses' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Ascendant (ASC)', sign: chart.ascendantSign, degree: chart.ascendantDegree, desc: 'Persona, vitality, and physical fortitude' },
                      { label: 'Midheaven (MC)', sign: chart.midheavenSign, degree: chart.midheavenDegree, desc: 'Public destiny, career pinnacle, and legacy' },
                      { label: 'Descendant (DSC)', sign: chart.descendantSign, degree: chart.descendantDegree, desc: 'Opponents, mirror duels, and lifelong allies' },
                      { label: 'Imum Coeli (IC)', sign: chart.imumCoeliSign, degree: chart.imumCoeliDegree, desc: 'Ancestral roots and private sanctuary' },
                    ].map(angle => (
                      <div key={angle.label} className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
                        <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">{angle.label}</div>
                        <div className="text-lg font-bold text-white mt-1">{angle.sign} {Math.floor(angle.degree)}°</div>
                        <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">{angle.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chart.houses.map(house => (
                      <div key={house.houseNumber} className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            House {house.houseNumber} ({house.quality})
                          </span>
                          <span className="text-xs text-zinc-300 font-mono">
                            {house.sign} {house.signSymbol}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-white">
                          {house.realmName}
                        </h4>

                        <p className="text-xs text-zinc-300 font-light leading-relaxed">
                          {house.description}
                        </p>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                          <span>Ruler: {house.rulingPlanet}</span>
                          <span>Planets: {house.planetsInHouse.join(', ') || 'None'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ASPECTS INDEX */}
              {activeTab === 'aspects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAspects.map((aspect, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        soundEngine.select();
                        onSelectAspect(aspect);
                        setIsIndexOpen(false);
                      }}
                      className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 transition-all cursor-pointer group"
                      style={{ borderLeftColor: aspect.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-cyan-300">
                              {aspect.planet1} {aspect.type.toUpperCase()} {aspect.planet2}
                            </span>
                            <span 
                              className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase"
                              style={{ backgroundColor: `${aspect.color}20`, color: aspect.color }}
                            >
                              {aspect.nature}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            Nominal: {aspect.angle}° • Orb: {aspect.orbFormatted}
                          </p>
                        </div>

                        <span className="text-xs text-zinc-400 font-mono">
                          Arc: {aspect.arcHeight}u
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 font-light mt-3 leading-relaxed">
                        {aspect.synthesis}
                      </p>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                        <span>Click to highlight this 3D parabolic arch in the wheel</span>
                        <span>Arc {idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: ELEMENTS & MODALITIES */}
              {activeTab === 'elements' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-6">
                  {/* Elements */}
                  <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-cyan-400" />
                      Four Elemental Distribution
                    </h3>

                    <div className="space-y-3">
                      {[
                        { name: 'Fire (Spirit, Will, Vital Drive)', val: chart.elementBalance.fire, color: '#ef4444' },
                        { name: 'Earth (Clay, Stamina, Mastery)', val: chart.elementBalance.earth, color: '#10b981' },
                        { name: 'Air (Mind, Strategy, Spin Tactics)', val: chart.elementBalance.air, color: '#fbbf24' },
                        { name: 'Water (Emotion, Depth, Intuition)', val: chart.elementBalance.water, color: '#60a5fa' },
                      ].map(el => (
                        <div key={el.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-zinc-300">{el.name}</span>
                            <span className="font-bold text-white">{el.val}%</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-700" 
                              style={{ width: `${el.val}%`, backgroundColor: el.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modalities */}
                  <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity size={16} className="text-purple-400" />
                      Three Modality Currents
                    </h3>

                    <div className="space-y-3">
                      {[
                        { name: 'Cardinal (Initiation, Aggression)', val: chart.modalityBalance.cardinal, color: '#a855f7' },
                        { name: 'Fixed (Relentless Grind, Endurance)', val: chart.modalityBalance.fixed, color: '#06b6d4' },
                        { name: 'Mutable (Shapeshifting, Adjustment)', val: chart.modalityBalance.mutable, color: '#f59e0b' },
                      ].map(mo => (
                        <div key={mo.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-zinc-300">{mo.name}</span>
                            <span className="font-bold text-white">{mo.val}%</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-700" 
                              style={{ width: `${mo.val}%`, backgroundColor: mo.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
