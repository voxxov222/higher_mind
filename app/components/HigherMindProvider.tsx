import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Thought, Feeling, Experience, SynapticCluster, ConsciousnessPacket, UserProfileConfig, AstralTheme } from '../types';
import { ASTRAL_THEMES } from '../utils/themes';

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
  projectedItems: { id: string; type: string; componentName: string; children: React.ReactNode }[];
  addProjectedItem: (item: { id: string; type: string; componentName: string; children: React.ReactNode }) => void;
  removeProjectedItem: (id: string) => void;
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
  const [activeThemeId, setActiveThemeIdState] = useState<string>('futuristic');
  const [isProjected, setIsProjectedState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('astral_spatial_projection') === 'true';
    }
    return false;
  });
  const [projectedItems, setProjectedItems] = useState<{ id: string; type: string; componentName: string; children: React.ReactNode }[]>([]);

  const addProjectedItem = (item: { id: string; type: string; componentName: string; children: React.ReactNode }) => {
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

  const activeTheme = ASTRAL_THEMES.find(t => t.id === activeThemeId) || ASTRAL_THEMES[0];
  const themes = ASTRAL_THEMES;

  const [thoughts, setThoughts] = useState<Thought[]>([]);

  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [clusters, setClusters] = useState<SynapticCluster[]>([]);
  const [coherence, setCoherence] = useState(0.5);
  const [alignment, setAlignment] = useState(0.7);
  const [savedMessages, setSavedMessages] = useState<{ id: string; title: string; content: string; type: string }[]>([]);
  const [userData, setUserData] = useState<UserProfileConfig | null>(null);

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
      removeProjectedItem
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
