import { AstralTheme } from '../types';

export const ASTRAL_THEMES: AstralTheme[] = [
  {
    id: 'galactic_core',
    name: 'Galactic Core',
    description: 'Deep cosmic blues, star-field animations, and a pure sci-fi interface with advanced data telemetry.',
    primaryColor: '#3b82f6', // blue-500
    secondaryColor: '#8b5cf6', // violet-500
    fontFamily: 'font-mono',
    bgType: 'stars',
    borderStyle: 'glass',
    glowStyle: 'shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]',
    cardBg: 'bg-black/60 backdrop-blur-xl border border-blue-500/20',
    textStyle: 'text-blue-100',
    headingStyle: 'font-mono tracking-widest text-blue-300 uppercase',
    effects: { animated: true, terminalTech: true },
    lighting: {
      ambientColor: "#1e1b4b",
      ambientIntensity: 0.8,
      point1Color: "#3b82f6",
      point2Color: "#8b5cf6",
      pointIntensity: 3,
      backgroundStyle: "radial-gradient(ellipse at center, #0B1021 0%, #000000 100%)"
    }
  },
  {
    id: 'nebula_genesis',
    name: 'Nebula Genesis',
    description: 'Swirling pinks, cyans, and purples with volumetric lighting and organic, fluid UI components.',
    primaryColor: '#ec4899', // pink-500
    secondaryColor: '#06b6d4', // cyan-500
    fontFamily: 'font-sans',
    bgType: 'nebula',
    borderStyle: 'neon',
    glowStyle: 'shadow-[0_0_25px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] duration-[2000ms]',
    cardBg: 'bg-fuchsia-950/40 backdrop-blur-md border border-fuchsia-500/30 animate-pulse-slow',
    textStyle: 'text-fuchsia-100 transition-colors duration-500',
    headingStyle: 'font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400',
    effects: { animated: true },
    lighting: {
      ambientColor: "#4c1d95",
      ambientIntensity: 1,
      point1Color: "#ec4899",
      point2Color: "#06b6d4",
      pointIntensity: 4,
      backgroundStyle: "radial-gradient(ellipse at center, #2e0930 0%, #0a000a 100%)"
    }
  },
  {
    id: 'void_singularity',
    name: 'Void Singularity',
    description: 'Absolute black minimal interface with high-contrast white tracking nodes and stark data lines.',
    primaryColor: '#ffffff', // white
    secondaryColor: '#52525b', // zinc-500
    fontFamily: 'font-mono',
    bgType: 'none',
    borderStyle: 'thin',
    glowStyle: 'shadow-none',
    cardBg: 'bg-black border border-white/20 rounded-none',
    textStyle: 'text-zinc-300 font-mono text-xs',
    headingStyle: 'font-mono uppercase tracking-[0.3em] text-white',
    effects: { terminalTech: true },
    lighting: {
      ambientColor: "#111111",
      ambientIntensity: 0.2,
      point1Color: "#ffffff",
      point2Color: "#ffffff",
      pointIntensity: 1,
      backgroundStyle: "#000000"
    }
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    description: 'Intense golds, ambers, and reds simulating the heat and energy of a central star. Audio-reactive UI.',
    primaryColor: '#f59e0b', // amber-500
    secondaryColor: '#ef4444', // red-500
    fontFamily: 'font-sans',
    bgType: 'aurora',
    borderStyle: 'neon',
    glowStyle: 'shadow-[0_0_30px_rgb(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]',
    cardBg: 'bg-amber-950/20 backdrop-blur-2xl border border-amber-500/30 rounded-3xl',
    textStyle: 'text-amber-100 tracking-wide font-light',
    headingStyle: 'font-bold tracking-widest text-amber-400 uppercase',
    effects: { interactive: true, solfeggio: true },
    lighting: {
      ambientColor: "#78350f",
      ambientIntensity: 1.5,
      point1Color: "#f59e0b",
      point2Color: "#ef4444",
      pointIntensity: 5,
      backgroundStyle: "radial-gradient(ellipse at center, #351a05 0%, #080300 100%)"
    }
  },
  {
    id: 'astral_projection',
    name: 'Astral Projection',
    description: 'Ethereal greens, teals, and geometric wireframes mapped to sacred proportions (Fibonacci/Golden Ratio).',
    primaryColor: '#10b981', // emerald-500
    secondaryColor: '#14b8a6', // teal-500
    fontFamily: 'font-serif',
    bgType: 'hologram',
    borderStyle: 'glass',
    glowStyle: 'shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]',
    cardBg: 'bg-emerald-950/20 backdrop-blur-lg border border-emerald-500/30 shadow-inner',
    textStyle: 'text-emerald-100/90 font-serif leading-relaxed italic',
    headingStyle: 'font-serif tracking-widest text-emerald-300 uppercase font-bold text-center border-b border-emerald-500/20 pb-2 mb-4',
    effects: { ancientSymbolic: true },
    lighting: {
      ambientColor: "#064e3b",
      ambientIntensity: 1,
      point1Color: "#10b981",
      point2Color: "#14b8a6",
      pointIntensity: 3,
      backgroundStyle: "radial-gradient(ellipse at center, #021a12 0%, #000000 100%)"
    }
  }
];
