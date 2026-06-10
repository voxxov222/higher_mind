import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Thought, Feeling, Experience, SynapticCluster, ConsciousnessPacket, UserProfileConfig, AstralTheme } from '../types';
import { ASTRAL_THEMES } from '../utils/themes';

export interface CosmicContextConfig {
  enabled: boolean;
  type: 'lunar' | 'transit';
  transit: string;
  blurIntensity: 'low' | 'medium' | 'high';
}

interface HigherMindContextType {
  thoughts: Thought[];
  feelings: Feeling[];
  experiences: Experience[];
  clusters: SynapticCluster[];
  coherence: number;
  alignment: number;
  processPacket: (packet: ConsciousnessPacket) => void;
  clearState: () => void;
  savedMessages: { id: string; title: string; content: string; type: string }[];
  saveToChat: (title: string, content: string, type: string) => void;
  saveToVault: (title: string, content: string, category: string, tags?: string[]) => void;
  aiModules: AIModule[];
  toggleModule: (id: string) => void;
  userData: UserProfileConfig | null;
  setUserData: (data: UserProfileConfig) => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  activeTheme: AstralTheme;
  themes: AstralTheme[];
  isProjected: boolean;
  setIsProjected: (projected: boolean) => void;
  projectedItems: { id: string; type: string; componentName: string; children: React.ReactNode; config?: any }[];
  addProjectedItem: (item: { id: string; type: string; componentName: string; children: React.ReactNode; config?: any }) => void;
  removeProjectedItem: (id: string) => void;
  cosmicContext: CosmicContextConfig;
  setCosmicContext: (ctx: Partial<CosmicContextConfig>) => void;
  cosmicData: CosmicData | null;
  setCosmicData: (data: CosmicData | null) => void;
  addProfileWidget: (widget: { id: string; type: string; componentName: string; data: any }) => void;
  removeProfileWidget: (id: string) => void;
}

export interface AIModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  category: 'audio' | 'vision' | 'intelligence' | 'data' | 'system';
}

const HigherMindContext = createContext<HigherMindContextType | undefined>(undefined);

export const HigherMindProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeThemeId, setActiveThemeIdState] = useState<string>('galactic_core');
  const [isProjected, setIsProjectedState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('astral_spatial_projection') === 'true';
    }
    return false;
  });
  const [projectedItems, setProjectedItems] = useState<{ id: string; type: string; componentName: string; children: React.ReactNode; config?: any }[]>([]);

  const addProjectedItem = (item: { id: string; type: string; componentName: string; children: React.ReactNode; config?: any }) => {
    setProjectedItems(prev => [...prev, item]);
  };

  const removeProjectedItem = (id: string) => {
    setProjectedItems(prev => prev.filter(i => i.id !== id));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('astral_active_theme');
      if (savedTheme && ASTRAL_THEMES.some(t => t.id === savedTheme)) {
        setActiveThemeIdState(savedTheme);
      }
    }
  }, []);

  const setIsProjected = (projected: boolean) => {
    setIsProjectedState(projected);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astral_spatial_projection', projected.toString());
    }
  };

  const setActiveThemeId = (id: string) => {
    setActiveThemeIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astral_active_theme', id);
    }
  };

  // Cosmic Context State
  const [cosmicContext, setCosmicContextState] = useState<CosmicContextConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('astral_cosmic_context');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      enabled: false,
      type: 'lunar',
      transit: 'mercury_retrograde',
      blurIntensity: 'medium',
    };
  });

  const setCosmicContext = (updates: Partial<CosmicContextConfig>) => {
    setCosmicContextState(prev => {
      const next = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('astral_cosmic_context', JSON.stringify(next));
      }
      return next;
    });
  };

  // Lunar Phase Finder
  const getLunarPhase = (date: Date) => {
    const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const msDiff = date.getTime() - knownNewMoon;
    const days = msDiff / (1000 * 60 * 60 * 24);
    const cycle = 29.530588853;
    const phaseIndex = (days / cycle) % 1;
    const finalIndex = phaseIndex < 0 ? phaseIndex + 1 : phaseIndex;

    if (finalIndex < 0.03 || finalIndex >= 0.97) {
      return { name: "New Moon", phase: "new", primary: "#9ca3af", secondary: "#1e1b4b", desc: "Dark Void & Quiet Seed", label: "VOID", freq: 174 };
    } else if (finalIndex >= 0.03 && finalIndex < 0.22) {
      return { name: "Waxing Crescent", phase: "waxing_crescent", primary: "#10b981", secondary: "#115e59", desc: "Emerging Light & Intention Spark", label: "EMERGE", freq: 285 };
    } else if (finalIndex >= 0.22 && finalIndex < 0.28) {
      return { name: "First Quarter", phase: "first_quarter", primary: "#06b6d4", secondary: "#4338ca", desc: "Instigation, Tension & Decision Point", label: "DECISION", freq: 396 };
    } else if (finalIndex >= 0.28 && finalIndex < 0.47) {
      return { name: "Waxing Gibbous", phase: "waxing_gibbous", primary: "#a855f7", secondary: "#db2777", desc: "Refining & Core Focus", label: "ABSORB", freq: 417 };
    } else if (finalIndex >= 0.47 && finalIndex < 0.53) {
      return { name: "Full Moon", phase: "full", primary: "#fef08a", secondary: "#f5f5f5", desc: "Full Cosmic Connection & Manifestation", label: "SUMMIT", freq: 528 };
    } else if (finalIndex >= 0.53 && finalIndex < 0.72) {
      return { name: "Waning Gibbous", phase: "waning_gibbous", primary: "#8b5cf6", secondary: "#4f46e5", desc: "Gratitude, Sharing & Release", label: "SHED", freq: 639 };
    } else if (finalIndex >= 0.72 && finalIndex < 0.78) {
      return { name: "Last Quarter", phase: "last_quarter", primary: "#ef4444", secondary: "#d97706", desc: "Inner Audit & Re-evaluating Path", label: "AUDIT", freq: 741 };
    } else {
      return { name: "Waning Crescent", phase: "waning_crescent", primary: "#14b8a6", secondary: "#020617", desc: "Total Surrender & Deep Slumber", label: "SURRENDER", freq: 852 };
    }
  };

  // Astrological Transits Options
  const TRANSITS_CONFIG: Record<string, { name: string; primary: string; secondary: string; desc: string; label: string; freq: number }> = {
    mercury_retrograde: {
      name: "Mercury Retrograde",
      primary: "#38bdf8", // Sky blue glow
      secondary: "#f97316", // Mercury ginger/amber
      desc: "Time for introspection, back-ups, and reviewing cosmic coordinates.",
      label: "COGNITIVE REST",
      freq: 741
    },
    saturn_return: {
      name: "Saturn Return",
      primary: "#eab308", // Golden amber
      secondary: "#18181b", // Midnight coal
      desc: "Major threshold crossing, demanding discipline and structured alignment.",
      label: "BLUEPRINT LOCK",
      freq: 417
    },
    venus_trine: {
      name: "Venus Trine",
      primary: "#f472b6", // Rose gold
      secondary: "#059669", // Vibrant emerald
      desc: "Sacred aesthetic harmony, deep connection, and beautiful sonic alignment.",
      label: "HARMONIC FLOW",
      freq: 528
    },
    jupiter_conjunction: {
      name: "Jupiter Conjunction",
      primary: "#c084fc", // Radiant amethyst
      secondary: "#eab308", // Shimmering gold
      desc: "Quantum portal trigger, offering cosmic fortune and dynamic synchronization.",
      label: "EXPANSION",
      freq: 963
    }
  };

  const baseActiveTheme = ASTRAL_THEMES.find(t => t.id === activeThemeId) || ASTRAL_THEMES[0];
  const themes = ASTRAL_THEMES;

  const activeTheme = React.useMemo(() => {
    if (!cosmicContext.enabled) return baseActiveTheme;

    let overlay;
    if (cosmicContext.type === 'lunar') {
      overlay = getLunarPhase(new Date());
    } else {
      overlay = TRANSITS_CONFIG[cosmicContext.transit] || TRANSITS_CONFIG.mercury_retrograde;
    }

    // Dynamic blur class override
    let blurClass = 'backdrop-blur-md bg-stone-950/45';
    let borderWeight = 'border';
    if (cosmicContext.blurIntensity === 'low') {
      blurClass = 'backdrop-blur-sm bg-stone-900/40';
      borderWeight = 'border';
    } else if (cosmicContext.blurIntensity === 'high') {
      blurClass = 'backdrop-blur-[24px] bg-black/60';
      borderWeight = 'border-2';
    }

    return {
      ...baseActiveTheme,
      name: `${baseActiveTheme.name} ✦ ${overlay.name}`,
      primaryColor: overlay.primary,
      secondaryColor: overlay.secondary,
      cardBg: `${blurClass} ${borderWeight} border-white/15`,
      glowStyle: `shadow-[0_0_22px_${overlay.primary}30] hover:shadow-[0_0_38px_${overlay.primary}60] duration-1000`,
      effects: {
        ...baseActiveTheme.effects,
        cosmicModified: true,
        cosmicDetails: overlay
      }
    } as any;
  }, [baseActiveTheme, cosmicContext]);

  const [thoughts, setThoughts] = useState<Thought[]>([]);

  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [clusters, setClusters] = useState<SynapticCluster[]>([]);
  const [coherence, setCoherence] = useState(0.5);
  const [alignment, setAlignment] = useState(0.7);
  const [savedMessages, setSavedMessages] = useState<{ id: string; title: string; content: string; type: string }[]>([]);
  const [userData, setUserData] = useState<UserProfileConfig | null>(null);
  const [cosmicData, setCosmicData] = useState<CosmicData | null>(null);

  const addProfileWidget = (widget: { id: string; type: string; componentName: string; data: any }) => {
    setUserData(prev => {
      if (!prev) return prev;
      const currentArray = prev.profileWidgets || [];
      // Replace if exists, or push
      const existingIdx = currentArray.findIndex(w => w.id === widget.id);
      const newArray = [...currentArray];
      if (existingIdx !== -1) {
        newArray[existingIdx] = widget;
      } else {
        newArray.push(widget);
      }
      return { ...prev, profileWidgets: newArray };
    });
  };

  const removeProfileWidget = (id: string) => {
    setUserData(prev => {
      if (!prev) return prev;
      if (!prev.profileWidgets) return prev;
      return { ...prev, profileWidgets: prev.profileWidgets.filter(w => w.id !== id) };
    });
  };

  const [aiModules, setAiModules] = useState<AIModule[]>([
    { id: 'audio_spark', name: 'Voice Matrix', icon: 'volume-2', description: 'Real-time consciousness-to-frequency conversion', enabled: true, category: 'audio' },
    { id: 'auth_db', name: 'Identity Vault', icon: 'database', description: 'Secure permanent storage for soul signatures', enabled: true, category: 'system' },
    { id: 'image', name: 'Vision Engine', icon: 'image', description: 'High-fidelity astral image stabilization', enabled: true, category: 'vision' },
    { id: 'spark', name: 'Gemini Core', icon: 'zap', description: 'Direct neural link to hyper-intelligence', enabled: true, category: 'intelligence' },
    { id: 'google', name: 'Search Stream', icon: 'globe', description: 'Real-time terrestrial data grounding', enabled: false, category: 'data' },
    { id: 'video_spark', name: 'Temporal Motion', icon: 'video', description: 'Fluid state-to-motion generation', enabled: false, category: 'vision' },
    { id: 'document_scanner', name: 'Pattern Analysis', icon: 'scan', description: 'Deep structural meaning extraction from visual inputs', enabled: false, category: 'vision' },
    { id: 'bolt', name: 'Latency Override', icon: 'bolt', description: 'Accelerated synaptic firing for low-latency responses', enabled: true, category: 'system' },
    { id: 'network_intelligence', name: 'High Thinking', icon: 'brain', description: 'Enhanced multi-layered reasoning lattice', enabled: true, category: 'intelligence' },
    { id: 'auto_pilot', name: 'Animated Auto Pilot', icon: 'play', description: 'Autonomous navigation and dynamic animated orchestration of esoteric UI modules.', enabled: false, category: 'system' },
    { id: 'intuitive_autonomous', name: 'Intuitive Autonomous', icon: 'sparkles', description: 'Agentic background synthesis and auto-projections based on neural inference.', enabled: false, category: 'intelligence' }
  ]);

  const toggleModule = (id: string) => {
    setAiModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const saveToChat = useCallback((title: string, content: string, type: string) => {
    setSavedMessages(prev => [...prev, { id: `save_${Date.now()}`, title, content, type }]);
  }, []);

  const saveToVault = useCallback((title: string, content: string, category: string, tags: string[] = []) => {
    if (!userData) return;
    const newItem = {
      id: `vault_${Date.now()}`,
      title,
      content,
      category,
      timestamp: Date.now(),
      tags
    };
    const updatedUser = {
      ...userData,
      researchVault: [...(userData.researchVault || []), newItem]
    };
    setUserData(updatedUser);
  }, [userData]);

  const processPacket = useCallback((packet: ConsciousnessPacket) => {
    // 1. Update Thoughts
    const newThought: Thought = {
      thoughtId: packet.thought_id,
      timestamp: new Date().toISOString(),
      content: packet.thought_content,
    };
    setThoughts(prev => [...prev.slice(-19), newThought]);

    // 2. Update Feelings
    const newFeeling: Feeling = {
      feelingId: packet.feeling_id,
      timestamp: new Date().toISOString(),
      emotion: packet.emotion,
      intensity: (packet.synaptic_cluster_strength + packet.neural_coherence) / 2,
      frequency: packet.frequency,
      astralAmplitude: packet.astral_amplitude,
    };
    setFeelings(prev => [...prev.slice(-19), newFeeling]);

    // 3. Update Experiences (if significant)
    if (packet.experience_being_encoded) {
      const expId = `e_${Date.now()}`;
      const newExperience: Experience = {
        experienceId: expId,
        timestamp: new Date().toISOString(),
        type: packet.experience_type,
        narrative: packet.thought_content,
        keyLearnings: [packet.emergent_insight],
        retentionStrength: (packet.synaptic_cluster_strength + packet.astral_alignment) / 2
      };
      setExperiences(prev => [...prev.slice(-49), newExperience]);
    }

    // 4. Create Synaptic Cluster
    const newCluster: SynapticCluster = {
      clusterId: `sc_${Date.now()}`,
      timestamp: new Date().toISOString(),
      boundElements: {
        thoughts: [packet.thought_id],
        feelings: [packet.feeling_id],
        experiences: packet.experience_being_encoded ? [`e_${Date.now()}`] : []
      },
      integrationStrength: packet.synaptic_cluster_strength,
      neuralCoherence: packet.neural_coherence,
      emergentMeaning: packet.emergent_insight
    };
    setClusters(prev => [...prev.slice(-29), newCluster]);

    // 5. Update Metrics
    setCoherence(packet.neural_coherence);
    setAlignment(packet.astral_alignment);
  }, []);

  const clearState = () => {
    setThoughts([]);
    setFeelings([]);
    setExperiences([]);
    setClusters([]);
    setCoherence(0.5);
    setAlignment(0.7);
    setSavedMessages([]);
  };

  return (
    <HigherMindContext.Provider value={{
      thoughts,
      feelings,
      experiences,
      clusters,
      coherence,
      alignment,
      processPacket,
      clearState,
      savedMessages,
      saveToChat,
      saveToVault,
      aiModules,
      toggleModule,
      userData,
      setUserData,
      activeThemeId,
      setActiveThemeId,
      activeTheme,
      themes,
      isProjected,
      setIsProjected,
      projectedItems,
      addProjectedItem,
      removeProjectedItem,
      cosmicContext,
      setCosmicContext,
      cosmicData,
      setCosmicData,
      addProfileWidget,
      removeProfileWidget
    }}>
      {children}
    </HigherMindContext.Provider>
  );
};

export const useHigherMind = () => {
  const context = useContext(HigherMindContext);
  if (context === undefined) {
    throw new Error('useHigherMind must be used within a HigherMindProvider');
  }
  return context;
};
