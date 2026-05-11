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
}

export interface CosmicData {
  planets: CelestialBody[];
  nodes: { north: CelestialBody; south: CelestialBody };
  points: { vertex: CelestialBody; partOfFortune: CelestialBody; chiron: CelestialBody; blackMoonLilith: CelestialBody };
  numerology: {
    lifePath: number;
    expression: number;
    soulUrge: number;
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
  }[];
  torusAnalysis: {
    bodyAndFlow: string;
    mindAndSpiritual: string;
    cosmicAlignment: string;
    overallAnalogy: string;
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

export interface UserProfileConfig {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  avatarType?: 'image' | 'video' | 'animated';
  bannerUrl?: string;
  bannerType?: 'image' | 'video' | 'animated';
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
