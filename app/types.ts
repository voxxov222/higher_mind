/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface CelestialBody {
  name: string;
  sign: string;
  degree: number; // 0 to 360
  house: number;
  meaning?: string;
  treeOfLifeConnection?: string;
  interpretation?: string;
}

export interface CosmicData {
  planets: CelestialBody[];
  nodes: { north: CelestialBody; south: CelestialBody };
  points: { vertex: CelestialBody; partOfFortune: CelestialBody; chiron: CelestialBody; blackMoonLilith: CelestialBody };
  numerology: {
    lifePath: number;
    expression: number;
    soulUrge: number;
    coreNumbers?: { name: string; value: number; meaning: string; }[];
    lifePathMeaning?: string;
  };
  gematria: {
    nameValue: number;
    reduction: number;
    pattern: string;
    nameSequence?: string;
    dobSequence?: string;
    numberProperties?: string;
  };
  kabbalah: {
    sephirah: string;
    path: string;
  };
  chakras?: {
    name: string;
    status: 'open' | 'blocked' | 'overactive' | 'balanced';
    score: number; // 0 to 100
    description: string;
    color: string;
  }[];
  compatibility?: {
    mostCompatible: { sign: string; reason: string }[];
    leastCompatible: { sign: string; reason: string }[];
    interactions: {
      sign: string;
      outcome: string;
      strengths: string[];
      weaknesses: string[];
    }[];
  };
  advancedCycles?: {
    morningEveningStars: { morningStar: string; eveningStar: string; meaning: string; };
    arabicLots: { lotOfSpirit: string; lotOfEros: string; meaning: string; };
    notableAsteroids: { name: string; sign: string; meaning: string; }[];
    planetPhases?: { name: string; phase: string; meaning: string; }[];
    soliArcs?: { description: string; meaning: string; }[];
  };
  aspects?: {
    planet1: string;
    planet2: string;
    type: 'conjunction' | 'square' | 'trine' | 'opposition' | 'sextile';
    meaning: string;
  }[];
  houses?: {
    houseNumber: number;
    realmName: string;
    description: string;
    sign?: string;
  }[];
  torusAnalysis: {
    bodyAndFlow: string;
    mindAndSpiritual: string;
    cosmicAlignment: string;
    overallAnalogy: string;
    soulAge?: string;
    primaryRay?: string;
    dimensionalFrequency?: string;
    karmicTheme?: string;
  };
  dailyInsight?: {
    date: string;
    horoscope: string;
    affirmation: string;
    caution: string;
    keyInterest: string;
    ageSignificance: string;
    timeDateCorrelation: string;
  };
  weeklyInsight?: { horoscope: string; theme: string; };
  monthlyInsight?: { horoscope: string; theme: string; };
  yearlyInsight?: { horoscope: string; theme: string; };
  lifeStrategy?: {
    universeCorrelation: string;
    kabbalahNumerologyDepth: string;
    goalPlan: string;
    movingForward: string;
  };
  nameAnalysis?: {
    first: { name: string; origin: string; meaning: string; impact: string; };
    middle: { name: string; origin: string; meaning: string; impact: string; };
    last: { name: string; origin: string; meaning: string; impact: string; };
    overallBigPicture: string;
  };
  timeline?: {
    year: number;
    age: number;
    highlight: string;
    houseSignificance: string;
    period: 'past' | 'present' | 'future';
  }[];
  akashic?: {
    soulOrigin: string;
    pastLifeThemes: string;
    karmicDebts: string;
    soulGifts: string;
    guardianMessage: string;
  };
  kabbalisticNumerology?: {
    lifePathCorrespondence: { sephirah: string; path: string; meaning: string; };
    expressionCorrespondence: { sephirah: string; path: string; meaning: string; };
    soulUrgeCorrespondence: { sephirah: string; path: string; meaning: string; };
    treeSynthesis: string;
  };
  patterns?: {
    synchronicities: {
      title: string;
      description: string;
    }[];
    timeDateDiscovery?: {
      title: string;
      description: string;
      mathematicalPattern: string;
    };
    interestingFacts: string[];
    coreTheme: string;
  };
  synthesis?: string;
  mindMap?: {
    nodes: MindMapNode[];
    centerNode: MindMapNode;
  };
}

export interface Thought {
  thoughtId: string;
  timestamp: string;
  content: string;
  semanticEmbedding?: number[];
  intent?: { clarity: number; complexity: number; purpose: string };
}

export interface Feeling {
  feelingId: string;
  timestamp: string;
  emotion: string;
  intensity: number;
  frequency: number;
  astralAmplitude: number;
}

export interface Experience {
  experienceId: string;
  timestamp: string;
  type: string;
  narrative: string;
  keyLearnings: string[];
  astralLocation?: string;
  retentionStrength: number;
}

export interface SynapticCluster {
  clusterId: string;
  timestamp: string;
  boundElements: {
    thoughts: string[];
    feelings: string[];
    experiences: string[];
  };
  integrationStrength: number;
  neuralCoherence: number;
  emergentMeaning: string;
}

export interface ConsciousnessPacket {
  thought_id: string;
  thought_content: string;
  feeling_id: string;
  emotion: string;
  frequency: number;
  astral_amplitude: number;
  experience_being_encoded: boolean;
  experience_type: string;
  synaptic_cluster_strength: number;
  neural_coherence: number;
  emergent_insight: string;
  astral_alignment: number;
  next_thought_direction: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
  type: 'core' | 'category' | 'insight' | 'custom';
}

export interface CosmicWidget {
  id: string;
  type: 'bio' | 'about' | 'astrology' | 'personality' | 'media' | 'socials' | 'quotes' | 'journal' | 'audio' | 'video' | 'nft' | 'timeline' | 'achievements' | 'ai_insights' | 'cosmic_stats' | 'energy' | 'pinned' | 'custom';
  title?: string;
  config?: any;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    isPinned?: boolean;
    isVisible?: boolean;
  };
  customContent?: {
    html?: string;
    markdown?: string;
    css?: string;
    js?: string;
  };
}

export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'astrology_insight' | 'ritual_share' | 'question' | 'reflection';
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  tags: string[];
  likes: number;
  comments: number;
  astralContext?: {
    posterResonance: number;
    topicalFrequency?: number;
    relatedAspects?: string[];
  };
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'astrology_reading';
  mediaUrl?: string;
  astralContext?: {
    senderResonance: number;
    compatibilityScore?: number;
    suggestedFrequency?: number;
  };
}

export interface MasterNumberMeaning {
  name: string;
  archetype: string;
  traits: string[];
  gifts: string;
  shadow: string;
  purpose: string;
  relatedFrequency: number;
  relatedColor: string;
  keyPractice: string;
}

export interface WallPost {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  timestamp: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
}

export interface UserProfileConfig {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarType?: 'image' | 'video' | 'animated';
  bannerUrl?: string;
  bannerType?: 'image' | 'video' | 'animated';
  astrology?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    masterNumber?: number;
    masterNumberMeaning?: string;
    personalSignificance?: string;
    resonanceLevel: number;
    resonanceMeaning?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    glowIntensity: number;
    transparency: number;
    borderStyle: 'none' | 'thin' | 'neon' | 'glass';
    fontFamily: string;
    backgroundEffect: 'stars' | 'nebula' | 'particles' | 'hologram' | 'aurora' | '3d_room' | 'none';
  };
  layout: {
    widgets: CosmicWidget[];
    mainLayoutType: 'bento' | 'free' | 'column';
    snapToGrid: boolean;
  };
  socialLinks: {
    platform: string;
    url: string;
    icon?: string;
    label?: string;
  }[];
  bio: {
    text: string;
    formatting?: 'rich' | 'markdown';
    moodStatus?: string;
    voiceIntroUrl?: string;
    spiritualPractices?: string[];
    interests?: string[];
    personalSymbols?: string[];
  };
  researchVault: {
    id: string;
    title: string;
    content: string;
    category: string;
    timestamp: number;
    tags?: string[];
  }[];
}
