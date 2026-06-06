import { AstralTheme } from '../types';

export const ASTRAL_THEMES: AstralTheme[] = [
  {
    id: 'futuristic',
    name: 'Futuristic Cosmic',
    description: 'High-fidelity glassmorphism, glowing purple neons, and sleek modern typography.',
    primaryColor: '#a855f7', // purple-500
    secondaryColor: '#3b82f6', // blue-500
    fontFamily: 'font-sans',
    bgType: 'stars',
    borderStyle: 'glass',
    glowStyle: 'shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]',
    cardBg: 'bg-black/40 backdrop-blur-xl border border-white/10',
    textStyle: 'text-stone-300',
    headingStyle: 'font-light tracking-widest text-white',
    effects: {}
  },
  {
    id: 'advanced_animated',
    name: 'Advanced Animated',
    description: 'A cinematic hyper-kinetic theme featuring pulsating modules, active cosmic orbits, and animated text streams.',
    primaryColor: '#ec4899', // pink-500
    secondaryColor: '#06b6d4', // cyan-500
    fontFamily: 'font-sans',
    bgType: 'nebula',
    borderStyle: 'neon',
    glowStyle: 'shadow-[0_0_25px_rgba(236,72,153,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.45)] duration-[2000ms]',
    cardBg: 'bg-neutral-950/50 backdrop-blur-md border border-pink-500/20 animate-pulse-slow',
    textStyle: 'text-neutral-200 transition-colors duration-500',
    headingStyle: 'font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-shimmer',
    effects: { animated: true }
  },
  {
    id: 'interactive_tuning',
    name: 'Interactive Nodes',
    description: 'Empowers widgets with audio-reactive controls, custom parameter knobs, and real-time interaction sliders.',
    primaryColor: '#0ea5e9', // sky-500
    secondaryColor: '#10b981', // emerald-500
    fontFamily: 'font-mono',
    bgType: 'particles',
    borderStyle: 'thin',
    glowStyle: 'shadow-[0_0_15px_rgba(14,165,233,0.15)] hover:bg-sky-950/10 hover:border-sky-500/30 transition-all duration-300',
    cardBg: 'bg-stone-950/70 backdrop-blur-lg border border-sky-500/10',
    textStyle: 'text-sky-100 font-mono text-xs',
    headingStyle: 'font-mono uppercase tracking-wider text-sky-400 flex items-center gap-2',
    effects: { interactive: true }
  },
  {
    id: 'drag_and_drop',
    name: 'Dynamic Modular Grid',
    description: 'Enables custom modular visual layout configuration with draggable widgets and live grid snapping.',
    primaryColor: '#6366f1', // indigo-500
    secondaryColor: '#d946ef', // fuchsia-500
    fontFamily: 'font-sans',
    bgType: 'hologram',
    borderStyle: 'neon',
    glowStyle: 'shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:border-fuchsia-500/50 hover:shadow-[0_0_30px_rgba(217,70,239,0.3)]',
    cardBg: 'bg-slate-950/60 backdrop-blur-xl border border-indigo-500/20 hover:scale-[1.01] transition-transform duration-200 cursor-grab active:cursor-grabbing',
    textStyle: 'text-indigo-200/90 font-light',
    headingStyle: 'font-medium uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300',
    effects: { dragAndDrop: true }
  },
  {
    id: 'basic_large_font',
    name: 'Optimized Visibility',
    description: 'An accessible, high-contrast flat layout with bold lines, large typography, and zero distracting motions.',
    primaryColor: '#ffffff', // white
    secondaryColor: '#a8a29e', // stone-400
    fontFamily: 'font-sans',
    bgType: 'none',
    borderStyle: 'thin',
    glowStyle: 'shadow-none',
    cardBg: 'bg-zinc-900 border-2 border-stone-200 p-6 md:p-8 rounded-none',
    textStyle: 'text-stone-100 text-lg md:text-xl font-medium leading-relaxed',
    headingStyle: 'font-extrabold text-3xl md:text-4xl text-white uppercase tracking-normal',
    effects: { largeFont: true }
  },
  {
    id: 'solfeggio_harmony',
    name: 'Solfeggio Resonance',
    description: 'A harmonic healing environment infused with active color frequencies and micro-sound synthesis triggers.',
    primaryColor: '#f59e0b', // amber-500
    secondaryColor: '#ec4899', // pink-500
    fontFamily: 'font-sans',
    bgType: 'aurora',
    borderStyle: 'neon',
    glowStyle: 'shadow-[0_0_30px_rgb(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(236,72,153,0.4)]',
    cardBg: 'bg-amber-950/15 backdrop-blur-2xl border border-amber-500/20 rounded-3xl',
    textStyle: 'text-amber-100/90 tracking-wide font-light',
    headingStyle: 'font-light tracking-widest text-amber-200 uppercase',
    effects: { solfeggio: true }
  },
  {
    id: 'sacred_alchemist',
    name: 'Alchemical Geometry',
    description: 'Drape your space in antique gold wireframes, sacred patterns, and classic editorial typography.',
    primaryColor: '#fbbf24', // amber-400
    secondaryColor: '#78350f', // amber-900
    fontFamily: 'font-serif',
    bgType: 'none',
    borderStyle: 'double_gold',
    glowStyle: 'shadow-[inset_0_0_15px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] border-amber-500/40',
    cardBg: 'bg-stone-950/90 border-double border-4 border-amber-500/20 rounded-none shadow-inner',
    textStyle: 'text-amber-100/80 font-serif leading-relaxed italic',
    headingStyle: 'font-serif tracking-widest text-amber-300 uppercase font-bold text-center border-b border-amber-500/10 pb-2 mb-4',
    effects: { ancientSymbolic: true }
  },
  {
    id: 'cyber_terminal',
    name: 'Cyber-Mystic Terminal',
    description: 'Step into a glowing retro terminal featuring retro scanlines, green matrix code streams, and monospaced command UI.',
    primaryColor: '#22c55e', // green-500
    secondaryColor: '#15803d', // green-700
    fontFamily: 'font-mono',
    bgType: 'hologram',
    borderStyle: 'scanline',
    glowStyle: 'shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]',
    cardBg: 'bg-neutral-950 border border-green-500/40 relative before:absolute before:inset-0 before:bg-scanlines before:pointer-events-none rounded-none',
    textStyle: 'text-green-400 font-mono text-sm leading-snug',
    headingStyle: 'font-mono uppercase tracking-widest text-green-300 border-b border-green-500/20 pb-2 mb-3 flex items-center gap-1 before:content-[">_"]',
    effects: { terminalTech: true }
  },
  {
    id: 'ethereal_light',
    name: 'Ethereal Light',
    description: 'A luminous, airy environment using soft whites, pearlescent overlays, and delicate gold accents.',
    primaryColor: '#fcd34d', // amber-300
    secondaryColor: '#ffffff', // white
    fontFamily: 'font-sans',
    bgType: 'aurora',
    borderStyle: 'glass',
    glowStyle: 'shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(252,211,77,0.4)]',
    cardBg: 'bg-white/10 backdrop-blur-2xl border border-white/40 rounded-[2rem]',
    textStyle: 'text-stone-800 font-medium tracking-wide',
    headingStyle: 'font-light tracking-widest text-stone-900 uppercase drop-shadow-md',
    effects: {}
  },
  {
    id: 'dark_matter',
    name: 'Dark Matter Void',
    description: 'Ultra-minimalist void. Deepest blacks, subtle grays, and razor-sharp high-contrast white text.',
    primaryColor: '#e5e5e5', // neutral-200
    secondaryColor: '#404040', // neutral-700
    fontFamily: 'font-mono',
    bgType: 'none',
    borderStyle: 'thin',
    glowStyle: 'shadow-none',
    cardBg: 'bg-black border border-neutral-800 rounded-none',
    textStyle: 'text-neutral-400 font-mono text-xs',
    headingStyle: 'font-mono uppercase tracking-[0.3em] text-white',
    effects: {}
  },
  {
    id: 'crystalline_matrix',
    name: 'Crystalline Matrix',
    description: 'Prismatic, transparent layouts featuring iridescent gradients, sharp angled borders, and icy blues.',
    primaryColor: '#60a5fa', // blue-400
    secondaryColor: '#c084fc', // purple-400
    fontFamily: 'font-sans',
    bgType: 'particles',
    borderStyle: 'glass',
    glowStyle: 'shadow-[0_0_20px_rgba(96,165,250,0.2)] hover:shadow-[0_0_30px_rgba(192,132,252,0.3)]',
    cardBg: 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md border border-white/20 rounded-xl',
    textStyle: 'text-blue-100 font-light',
    headingStyle: 'font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300',
    effects: {}
  },
  {
    id: 'obsidian_gold',
    name: 'Obsidian & Gold',
    description: 'A premium, grounding aesthetic with heavy jet-black backgrounds and luxurious gold foil accents.',
    primaryColor: '#fbbf24', // amber-400
    secondaryColor: '#000000', // black
    fontFamily: 'font-serif',
    bgType: 'none',
    borderStyle: 'thin',
    glowStyle: 'shadow-xl shadow-amber-900/20',
    cardBg: 'bg-[#0a0a0a] border border-amber-500/30 rounded-sm',
    textStyle: 'text-stone-300 font-serif text-sm',
    headingStyle: 'font-serif uppercase tracking-widest text-amber-500 border-b-2 border-amber-500/20 pb-2 mb-4',
    effects: {}
  },
  {
    id: 'quantum_fluctuation',
    name: 'Quantum Fluctuation',
    description: 'Unstable, shifting geometries with continuous motion, glitching overlays, and energetic cyan bursts.',
    primaryColor: '#2dd4bf', // teal-400
    secondaryColor: '#f43f5e', // rose-500
    fontFamily: 'font-sans',
    bgType: 'hologram',
    borderStyle: 'neon',
    glowStyle: 'shadow-[0_0_15px_rgba(45,212,191,0.4)] animate-pulse',
    cardBg: 'bg-teal-950/30 backdrop-blur-sm border-2 border-teal-500/50 hover:border-rose-500/50 transition-colors duration-[3000ms]',
    textStyle: 'text-teal-100 font-medium',
    headingStyle: 'font-black uppercase tracking-tight text-teal-400 mix-blend-screen',
    effects: { animated: true }
  }
];
