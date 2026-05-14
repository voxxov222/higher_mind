import React, { createContext, useContext, useState, useCallback } from 'react';
import { Thought, Feeling, Experience, SynapticCluster, ConsciousnessPacket } from '../types';

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
}

const HigherMindContext = createContext<HigherMindContextType | undefined>(undefined);

export const HigherMindProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [clusters, setClusters] = useState<SynapticCluster[]>([]);
  const [coherence, setCoherence] = useState(0.5);
  const [alignment, setAlignment] = useState(0.7);
  const [savedMessages, setSavedMessages] = useState<{ id: string; title: string; content: string; type: string }[]>([]);

  const saveToChat = useCallback((title: string, content: string, type: string) => {
    setSavedMessages(prev => [...prev, { id: `save_${Date.now()}`, title, content, type }]);
  }, []);

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
      saveToChat
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
