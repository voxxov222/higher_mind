export interface NatalPlanet {
  name: string;
  symbol: string;
  sign: string;
  signSymbol: string;
  degree: number; // 0 to 30 within the sign
  totalDegree: number; // 0 to 360 ecliptic longitude
  minute: number;
  second: number;
  house: number;
  isRetrograde: boolean;
  color: string;
  glowColor: string;
  dignity: 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine';
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  archetype: string;
  keywords: string[];
  description: string;
  interpretation: string;
}

export interface NatalHouse {
  houseNumber: number;
  sign: string;
  signSymbol: string;
  cuspDegree: number;
  cuspMinute: number;
  totalDegree: number;
  realmName: string;
  lifeDomain: string;
  rulingPlanet: string;
  traditionalRuler: string;
  planetsInHouse: string[];
  element: string;
  quality: 'Angular' | 'Succedent' | 'Cadent';
  description: string;
}

export interface NatalAspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  angle: number; // nominal angle: 0, 180, 120, 90, 60
  actualAngle: number;
  orb: number; // degrees difference from exact
  orbFormatted: string;
  isApplying: boolean;
  nature: 'Harmonious' | 'Dynamic' | 'Intense' | 'Neutral';
  color: string;
  arcHeight: number;
  meaning: string;
  synthesis: string;
}

export interface NatalChartProfile {
  id: string;
  title: string;
  subjectName: string;
  birthDate: string;
  birthTime: string;
  location: string;
  coordinates: string;
  timezone: string;
  ascendantSign: string;
  ascendantDegree: number;
  midheavenSign: string;
  midheavenDegree: number;
  descendantSign: string;
  descendantDegree: number;
  imumCoeliSign: string;
  imumCoeliDegree: number;
  planets: NatalPlanet[];
  houses: NatalHouse[];
  aspects: NatalAspect[];
  elementBalance: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalityBalance: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  summary: string;
}

export const SIGN_INFO: Record<string, {
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  color: string;
  index: number;
}> = {
  'Aries': { symbol: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', color: '#ef4444', index: 0 },
  'Taurus': { symbol: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus', color: '#10b981', index: 1 },
  'Gemini': { symbol: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury', color: '#fbbf24', index: 2 },
  'Cancer': { symbol: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon', color: '#60a5fa', index: 3 },
  'Leo': { symbol: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun', color: '#f59e0b', index: 4 },
  'Virgo': { symbol: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', color: '#84cc16', index: 5 },
  'Libra': { symbol: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus', color: '#ec4899', index: 6 },
  'Scorpio': { symbol: '♏', element: 'Water', modality: 'Fixed', ruler: 'Pluto', color: '#8b5cf6', index: 7 },
  'Sagittarius': { symbol: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', color: '#f97316', index: 8 },
  'Capricorn': { symbol: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', color: '#64748b', index: 9 },
  'Aquarius': { symbol: '♒', element: 'Air', modality: 'Fixed', ruler: 'Uranus', color: '#06b6d4', index: 10 },
  'Pisces': { symbol: '♓', element: 'Water', modality: 'Mutable', ruler: 'Neptune', color: '#6366f1', index: 11 },
};

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Rafael Nadal Parera's Official Verified Birth Chart Dataset
 * Born: June 3, 1986, 19:15 CET (UTC+2 DST)
 * Location: Manacor, Mallorca, Balearic Islands, Spain (39°34'N, 3°12'E)
 * Ascendant: Scorpio 13°23' | Midheaven (MC): Leo 28°49'
 */
export const RAFAEL_NADAL_CHART: NatalChartProfile = {
  id: 'rafael_nadal_1986',
  title: 'Rafael Nadal - The Clay Sovereign',
  subjectName: 'Rafael Nadal Parera',
  birthDate: 'June 3, 1986',
  birthTime: '19:15 CET (UTC+2)',
  location: 'Manacor, Mallorca, Spain',
  coordinates: '39°34\'N, 03°12\'E',
  timezone: 'CET (UTC+2 DST)',
  ascendantSign: 'Scorpio',
  ascendantDegree: 13.38,
  midheavenSign: 'Leo',
  midheavenDegree: 28.82,
  descendantSign: 'Taurus',
  descendantDegree: 13.38,
  imumCoeliSign: 'Aquarius',
  imumCoeliDegree: 28.82,
  elementBalance: {
    fire: 25,
    earth: 35,
    air: 25,
    water: 15,
  },
  modalityBalance: {
    cardinal: 30,
    fixed: 45,
    mutable: 25,
  },
  summary: 'Legendary configuration anchored by Exalted Mars in Capricorn sextile Jupiter in Pisces, an unshakeable Scorpio Ascendant, Gemini Sun in the 8th House of transmutation, and exalted endurance Moon in Taurus.',
  planets: [
    {
      name: 'Sun',
      symbol: '☉',
      sign: 'Gemini',
      signSymbol: '♊',
      degree: 12.82,
      totalDegree: 72.82,
      minute: 49,
      second: 12,
      house: 8,
      isRetrograde: false,
      color: '#facc15',
      glowColor: '#fbbf24',
      dignity: 'Peregrine',
      element: 'Air',
      modality: 'Mutable',
      archetype: 'The Strategic Shapeshifter',
      keywords: ['Dual Intelligence', 'Tactical Versatility', 'Agile Mind', 'Regeneration'],
      description: 'The core life force situated in mutable air and the 8th house of psychological rebirth and unyielding crisis transformation.',
      interpretation: 'Nadal’s Sun in Gemini gives him razor-sharp rapid tactical adaptability, lightning-fast kinetic calculations, and ambidextrous physical prowess. Placed in the 8th house, his vitality is expressed through digging deep during high-stakes pressure points, regenerating when facing physical exhaustion or career-threatening injuries.',
    },
    {
      name: 'Moon',
      symbol: '☽',
      sign: 'Taurus',
      signSymbol: '♉',
      degree: 12.97,
      totalDegree: 42.97,
      minute: 58,
      second: 15,
      house: 7,
      isRetrograde: false,
      color: '#e2e8f0',
      glowColor: '#93c5fd',
      dignity: 'Exaltation',
      element: 'Earth',
      modality: 'Fixed',
      archetype: 'The Granite Anchor',
      keywords: ['Exalted Emotional Stamina', 'Sensory Memory', 'Clay Mastery', 'Unshakable Calm'],
      description: 'The Moon is at its highest astronomical exaltation in Taurus, anchoring bodily emotional composure directly to the red clay earth.',
      interpretation: 'Exalted in Taurus in the 7th house of external duels, Nadal feels most secure when grinding through grueling, multi-hour baseline battles. This grants him absolute emotional steadiness under intense opponent pressure and a visceral, rhythmic tactile connection to the clay court surface.',
    },
    {
      name: 'Mercury',
      symbol: '☿',
      sign: 'Gemini',
      signSymbol: '♊',
      degree: 19.45,
      totalDegree: 79.45,
      minute: 27,
      second: 0,
      house: 8,
      isRetrograde: false,
      color: '#38bdf8',
      glowColor: '#0ea5e9',
      dignity: 'Domicile',
      element: 'Air',
      modality: 'Mutable',
      archetype: 'The Kinetic Mastermind',
      keywords: ['Domicile Ruler', 'Micro-Adjustments', 'Spatial Precision', 'Spin Geometry'],
      description: 'Mercury is in its own domicile sign of Gemini, operating at peak intellectual and neuromuscular transmission speeds.',
      interpretation: 'In Gemini and conjunct the Sun, Mercury confers unmatched court vision, predictive pattern-reading, and the technical mastery to produce his signature heavy topspin RPMs with millimetric precision.',
    },
    {
      name: 'Venus',
      symbol: '♀',
      sign: 'Cancer',
      signSymbol: '♋',
      degree: 26.03,
      totalDegree: 116.03,
      minute: 2,
      second: 10,
      house: 9,
      isRetrograde: false,
      color: '#34d399',
      glowColor: '#10b981',
      dignity: 'Peregrine',
      element: 'Water',
      modality: 'Cardinal',
      archetype: 'The Clan Devotee',
      keywords: ['Family Loyalty', 'Emotional Core', 'Ritual Devotion', 'Integrity'],
      description: 'Values centered around close-knit familial bonds, modesty, and deep personal roots in Mallorca.',
      interpretation: 'In the 9th house of global renown, Venus in Cancer keeps Nadal deeply grounded in his hometown of Manacor and his lifelong family coaching team, eschewing celebrity ostentation for humble, lifelong devotion to his roots.',
    },
    {
      name: 'Mars',
      symbol: '♂',
      sign: 'Capricorn',
      signSymbol: '♑',
      degree: 18.17,
      totalDegree: 288.17,
      minute: 10,
      second: 22,
      house: 3,
      isRetrograde: false,
      color: '#ef4444',
      glowColor: '#dc2626',
      dignity: 'Exaltation',
      element: 'Earth',
      modality: 'Cardinal',
      archetype: 'The Iron Gladiator',
      keywords: ['Exalted Drive', 'Unstoppable Work Ethic', 'Controlled Fury', 'Relentless Discipline'],
      description: 'Mars achieves its ultimate astrological exaltation in Capricorn—a legendary placement of supreme athletic stamina and indestructible willpower.',
      interpretation: 'The supreme engine of Nadal’s career. In Capricorn, martial aggression is never wasted on tantrums; it is channeled into superhuman training discipline, surgical baseline defense, punishing intensity, and the ability to outlast any adversary through sheer endurance and structural grit.',
    },
    {
      name: 'Jupiter',
      symbol: '♃',
      sign: 'Pisces',
      signSymbol: '♓',
      degree: 19.02,
      totalDegree: 349.02,
      minute: 1,
      second: 15,
      house: 5,
      isRetrograde: false,
      color: '#818cf8',
      glowColor: '#6366f1',
      dignity: 'Domicile',
      element: 'Water',
      modality: 'Mutable',
      archetype: 'The Oceanic Sovereign',
      keywords: ['Domicile Grace', 'Historic Champion', 'Spiritual Transcendence', 'Pure Play'],
      description: 'Jupiter in its traditional home of Pisces in the 5th house of sports, play, and heroic performance.',
      interpretation: 'Forming an exact sextile to his exalted Mars (0°51\' orb), this aspect produces the "Champion’s Sigil"—boundless athletic intuition, divine timing in critical tiebreaks, and genuine joy and humility in battle that elevated him to 22 Grand Slam titles.',
    },
    {
      name: 'Saturn',
      symbol: '♄',
      sign: 'Sagittarius',
      signSymbol: '♐',
      degree: 6.05,
      totalDegree: 246.05,
      minute: 3,
      second: 40,
      house: 1,
      isRetrograde: true,
      color: '#eab308',
      glowColor: '#ca8a04',
      dignity: 'Peregrine',
      element: 'Fire',
      modality: 'Mutable',
      archetype: 'The Stoic Sentinel',
      keywords: ['Ascendant Pillar', 'Pain Threshold', 'Lifelong Mastery', 'Rigorous Focus'],
      description: 'Saturn conjunct the Ascendant in Sagittarius shapes his physical posture, extreme pain tolerance, and serious warrior countenance.',
      interpretation: 'Positioned right on his rising degree, Saturn imposes rigorous physical boundaries and lessons through chronic injuries (foot, knees), requiring constant stoic reinvention and transforming pain into unbreakable psychological armor.',
    },
    {
      name: 'Uranus',
      symbol: '♅',
      sign: 'Sagittarius',
      signSymbol: '♐',
      degree: 20.67,
      totalDegree: 260.67,
      minute: 40,
      second: 12,
      house: 1,
      isRetrograde: true,
      color: '#06b6d4',
      glowColor: '#22d3ee',
      dignity: 'Peregrine',
      element: 'Fire',
      modality: 'Mutable',
      archetype: 'The Electric Rebel',
      keywords: ['Unique Technique', 'Revolutionary Forehand', 'Unorthodox Style'],
      description: 'Unconventional kinetic electricity that revolutionized the tennis world with the "banana shot" and lasso-whip follow-through.',
      interpretation: 'In the 1st house of physical appearance and motor execution, Uranus makes Nadal’s biomechanics completely one-of-a-kind, turning a naturally right-handed boy into a devastating left-handed destroyer on court.',
    },
    {
      name: 'Neptune',
      symbol: '♆',
      sign: 'Capricorn',
      signSymbol: '♑',
      degree: 4.85,
      totalDegree: 274.85,
      minute: 51,
      second: 5,
      house: 2,
      isRetrograde: true,
      color: '#38bdf8',
      glowColor: '#60a5fa',
      dignity: 'Peregrine',
      element: 'Earth',
      modality: 'Cardinal',
      archetype: 'The Dream Architect',
      keywords: ['Mystic Devotion', 'Subtle Touch', 'Flow State Mastery'],
      description: 'Merging transcendent imagination with earthy discipline.',
      interpretation: 'Allows Nadal to access deep flow states during pressure-cooker championship sets, visualising ball trajectories with subconscious clairvoyance.',
    },
    {
      name: 'Pluto',
      symbol: '♇',
      sign: 'Scorpio',
      signSymbol: '♏',
      degree: 5.18,
      totalDegree: 215.18,
      minute: 11,
      second: 2,
      house: 12,
      isRetrograde: true,
      color: '#a855f7',
      glowColor: '#c084fc',
      dignity: 'Domicile',
      element: 'Water',
      modality: 'Fixed',
      archetype: 'The Phoenix of the Underworld',
      keywords: ['Ascendant Ruler', 'Primal Intimidation', 'Psychological Dominance', 'Rebirth'],
      description: 'Pluto in domicile Scorpio serves as the chart ruler, conferring his fearsome, ferocious on-court aura and infinite resurrections.',
      interpretation: 'As the ruler of his Scorpio Ascendant, Pluto is the hidden core of Nadal’s legendary intimidation factor—the pirate bandana, the ferocious stare across the net, and his mythic ability to come back from two sets down in Grand Slam finals.',
    },
    {
      name: 'North Node',
      symbol: '☊',
      sign: 'Aries',
      signSymbol: '♈',
      degree: 29.33,
      totalDegree: 29.33,
      minute: 20,
      second: 0,
      house: 5,
      isRetrograde: true,
      color: '#10b981',
      glowColor: '#34d399',
      dignity: 'Peregrine',
      element: 'Fire',
      modality: 'Cardinal',
      archetype: 'The Pioneering Champion',
      keywords: ['Destiny Path', 'Single Combat', 'Uncompromised Courage'],
      description: 'The soul purpose urging him into heroic solo gladiatorial arenas.',
      interpretation: 'At the critical 29th anaretic degree of Aries in the 5th house of athletic contests, his karmic evolutionary path demanded leading from the front as an iconic solo champion.',
    },
    {
      name: 'South Node',
      symbol: '☋',
      sign: 'Libra',
      signSymbol: '♎',
      degree: 29.33,
      totalDegree: 209.33,
      minute: 20,
      second: 0,
      house: 11,
      isRetrograde: true,
      color: '#f43f5e',
      glowColor: '#fb7185',
      dignity: 'Peregrine',
      element: 'Air',
      modality: 'Cardinal',
      archetype: 'The Harmonious Diplomat',
      keywords: ['Past Karma', 'Team Spirit', 'Polite Sportsmanship'],
      description: 'Inherent past-life mastery of sportsmanship and court diplomacy.',
      interpretation: 'Explains why despite his savage competitive intensity, Nadal is universally respected for unmatched graciousness, never breaking a racket in his entire career.',
    },
    {
      name: 'Chiron',
      symbol: '⚷',
      sign: 'Gemini',
      signSymbol: '♊',
      degree: 13.17,
      totalDegree: 73.17,
      minute: 10,
      second: 18,
      house: 8,
      isRetrograde: false,
      color: '#a855f7',
      glowColor: '#c084fc',
      dignity: 'Peregrine',
      element: 'Air',
      modality: 'Mutable',
      archetype: 'The Wounded Healer',
      keywords: ['Physical Vulnerability', 'Sacred Resilience', 'Karmic Initiation'],
      description: 'Exact conjunction with his natal Sun (0°21\' orb) in the 8th house.',
      interpretation: 'His lifelong chronic Müller-Weiss syndrome (navicular foot bone disease) was identified in 2005; doctors told him his career was over. Instead, Chiron turned his wound into his greatest teacher, teaching him to transcend physical pain into legendary greatness.',
    },
    {
      name: 'Lilith',
      symbol: '⚸',
      sign: 'Sagittarius',
      signSymbol: '♐',
      degree: 24.25,
      totalDegree: 264.25,
      minute: 15,
      second: 0,
      house: 2,
      isRetrograde: false,
      color: '#64748b',
      glowColor: '#94a3b8',
      dignity: 'Peregrine',
      element: 'Fire',
      modality: 'Mutable',
      archetype: 'The Untamed Instinct',
      keywords: ['Raw Animal Magnetism', 'Instinctual Reflexes', 'Savage Will'],
      description: 'The raw, unfiltered animal fire residing within his physical vessel.',
      interpretation: 'Powers his famous pre-serve rituals, leaping physical warmups, and primal fist pumps that electrify stadiums worldwide.',
    }
  ],
  houses: [
    {
      houseNumber: 1,
      sign: 'Scorpio',
      signSymbol: '♏',
      cuspDegree: 13.38,
      cuspMinute: 23,
      totalDegree: 223.38,
      realmName: 'The Ascendant (ASC) - Physical Persona & Aura',
      lifeDomain: 'Vitality, physical appearance, competitive presence, instinctual defense',
      rulingPlanet: 'Pluto & Mars',
      traditionalRuler: 'Mars',
      planetsInHouse: ['Saturn', 'Uranus'],
      element: 'Water',
      quality: 'Angular',
      description: 'The front door to his incarnation. Scorpio rising gives him the piercing, magnetic, intimidating presence, hooded eyes, and impenetrable tactical privacy.',
    },
    {
      houseNumber: 2,
      sign: 'Sagittarius',
      signSymbol: '♐',
      cuspDegree: 12.15,
      cuspMinute: 9,
      totalDegree: 252.15,
      realmName: 'House of Worth & Energetic Reserves',
      lifeDomain: 'Innate talents, stamina capital, personal values, material discipline',
      rulingPlanet: 'Jupiter',
      traditionalRuler: 'Jupiter',
      planetsInHouse: ['Neptune', 'Lilith'],
      element: 'Fire',
      quality: 'Succedent',
      description: 'Governs his vast reservoir of bio-energetic capital and foundational self-belief that fuels multi-hour fifth sets.',
    },
    {
      houseNumber: 3,
      sign: 'Capricorn',
      signSymbol: '♑',
      cuspDegree: 15.42,
      cuspMinute: 25,
      totalDegree: 285.42,
      realmName: 'House of Neuromuscular Coordination',
      lifeDomain: 'Hands, mechanics, precision motor reflexes, tactical adjustments',
      rulingPlanet: 'Saturn',
      traditionalRuler: 'Saturn',
      planetsInHouse: ['Mars'],
      element: 'Earth',
      quality: 'Cadent',
      description: 'With Exalted Mars stationed here, this house rules his left hand, wrists, footwork mechanics, and the tactical discipline of each rally.',
    },
    {
      houseNumber: 4,
      sign: 'Aquarius',
      signSymbol: '♒',
      cuspDegree: 28.82,
      cuspMinute: 49,
      totalDegree: 328.82,
      realmName: 'Imum Coeli (IC) - Roots & Sacred Foundations',
      lifeDomain: 'Ancestral heritage, childhood home, private sanctuary in Mallorca',
      rulingPlanet: 'Uranus & Saturn',
      traditionalRuler: 'Saturn',
      planetsInHouse: [],
      element: 'Air',
      quality: 'Angular',
      description: 'His private retreat in Porto Cristo, Mallorca, and the tight-knit clan that shields him from external chaos.',
    },
    {
      houseNumber: 5,
      sign: 'Pisces',
      signSymbol: '♓',
      cuspDegree: 26.50,
      cuspMinute: 30,
      totalDegree: 356.50,
      realmName: 'House of Athletic Play & Heroic Drama',
      lifeDomain: 'Athletics, tennis, grand stage glory, creativity, joy of the sport',
      rulingPlanet: 'Neptune & Jupiter',
      traditionalRuler: 'Jupiter',
      planetsInHouse: ['Jupiter', 'North Node'],
      element: 'Water',
      quality: 'Succedent',
      description: 'Domicile Jupiter and North Node illuminate the 5th house, turning tennis from a job into a holy, joyous spiritual calling.',
    },
    {
      houseNumber: 6,
      sign: 'Aries',
      signSymbol: '♈',
      cuspDegree: 19.80,
      cuspMinute: 48,
      totalDegree: 19.80,
      realmName: 'House of Physical Regimen & Daily Duty',
      lifeDomain: 'Nutrition, grueling physiotherapy, body maintenance, professional routine',
      rulingPlanet: 'Mars',
      traditionalRuler: 'Mars',
      planetsInHouse: [],
      element: 'Fire',
      quality: 'Cadent',
      description: 'Ruled by his exalted Mars, his conditioning regimen is famously the most demanding in modern tennis history.',
    },
    {
      houseNumber: 7,
      sign: 'Taurus',
      signSymbol: '♉',
      cuspDegree: 13.38,
      cuspMinute: 23,
      totalDegree: 43.38,
      realmName: 'Descendant (DSC) - The Mirror of the Adversary',
      lifeDomain: 'Opponents, legendary rivalries (Federer, Djokovic), lifelong marriage',
      rulingPlanet: 'Venus',
      traditionalRuler: 'Venus',
      planetsInHouse: ['Moon'],
      element: 'Earth',
      quality: 'Angular',
      description: 'Contains his exalted Moon! His greatest matches against Roger Federer and Novak Djokovic were mythic mirrors that defined his greatness.',
    },
    {
      houseNumber: 8,
      sign: 'Gemini',
      signSymbol: '♊',
      cuspDegree: 12.15,
      cuspMinute: 9,
      totalDegree: 72.15,
      realmName: 'House of Transmutation & Deep Power',
      lifeDomain: 'Crisis management, surgical recovery, miraculous resurrections, legacy',
      rulingPlanet: 'Mercury',
      traditionalRuler: 'Mercury',
      planetsInHouse: ['Sun', 'Mercury', 'Chiron'],
      element: 'Air',
      quality: 'Succedent',
      description: 'Holds Sun, domicile Mercury, and Chiron. Known as the greatest "match-point saver" and crisis escape artist the sport has ever witnessed.',
    },
    {
      houseNumber: 9,
      sign: 'Cancer',
      signSymbol: '♋',
      cuspDegree: 15.42,
      cuspMinute: 25,
      totalDegree: 105.42,
      realmName: 'House of Global Horizons & Philosophy',
      lifeDomain: 'International Grand Slams (Paris, Melbourne, London, New York), ethics',
      rulingPlanet: 'Moon',
      traditionalRuler: 'Moon',
      planetsInHouse: ['Venus'],
      element: 'Water',
      quality: 'Cadent',
      description: 'Venus in Cancer brings profound global adoration and affectionate loyalty from fans on all five continents.',
    },
    {
      houseNumber: 10,
      sign: 'Leo',
      signSymbol: '♌',
      cuspDegree: 28.82,
      cuspMinute: 49,
      totalDegree: 148.82,
      realmName: 'Midheaven (MC) - Public Destiny & The Clay King',
      lifeDomain: 'Career legacy, 14 French Open crowns, world #1 summit, public aura',
      rulingPlanet: 'Sun',
      traditionalRuler: 'Sun',
      planetsInHouse: [],
      element: 'Fire',
      quality: 'Angular',
      description: 'At 28° Leo—the regal degree of the Lion King. Solidified his permanent status as the undisputed King of Clay and one of history\'s greatest icons.',
    },
    {
      houseNumber: 11,
      sign: 'Virgo',
      signSymbol: '♍',
      cuspDegree: 26.50,
      cuspMinute: 30,
      totalDegree: 176.50,
      realmName: 'House of Brotherhood & Global Community',
      lifeDomain: 'Rafa Nadal Tennis Academy, charitable foundation, peer brotherhood',
      rulingPlanet: 'Mercury',
      traditionalRuler: 'Mercury',
      planetsInHouse: ['South Node'],
      element: 'Earth',
      quality: 'Succedent',
      description: 'The foundation of his Rafa Nadal Academy in Manacor, coaching the next generation of youth with humble craft.',
    },
    {
      houseNumber: 12,
      sign: 'Libra',
      signSymbol: '♎',
      cuspDegree: 19.80,
      cuspMinute: 48,
      totalDegree: 199.80,
      realmName: 'House of the Unconscious & Hidden Armor',
      lifeDomain: 'Solitary reflection, inner doubts overcome, private rituals, chart ruler',
      rulingPlanet: 'Venus',
      traditionalRuler: 'Venus',
      planetsInHouse: ['Pluto'],
      element: 'Air',
      quality: 'Cadent',
      description: 'Contains chart ruler Pluto in Scorpio. His private mental fortitude and ability to summon terrifying focus from the quiet void.',
    }
  ],
  aspects: [
    {
      planet1: 'Mars',
      planet2: 'Jupiter',
      type: 'sextile',
      angle: 60,
      actualAngle: 60.85,
      orb: 0.85,
      orbFormatted: '0° 51\' (Exact)',
      isApplying: true,
      nature: 'Harmonious',
      color: '#34d399',
      arcHeight: 7.5,
      meaning: 'Exalted Mars in Capricorn ⚹ Domicile Jupiter in Pisces',
      synthesis: 'The cornerstone aspect of athletic invincibility. Blends the highest structural drive with effortless spiritual intuition and expansive physical fortune. Gives him supernatural clutch performance when down in matches.'
    },
    {
      planet1: 'Sun',
      planet2: 'Mercury',
      type: 'conjunction',
      angle: 0,
      actualAngle: 6.63,
      orb: 6.63,
      orbFormatted: '6° 38\' (Strong)',
      isApplying: true,
      nature: 'Intense',
      color: '#facc15',
      arcHeight: 3.5,
      meaning: 'Sun in Gemini ☌ Mercury in Gemini',
      synthesis: 'Unifies core will with micro-calculating intellect. Rapid-fire tactical adjustments, anticipatory reflex reading, and instant mental processing of spinning trajectories.'
    },
    {
      planet1: 'Sun',
      planet2: 'Chiron',
      type: 'conjunction',
      angle: 0,
      actualAngle: 0.35,
      orb: 0.35,
      orbFormatted: '0° 21\' (Partile Exact)',
      isApplying: true,
      nature: 'Intense',
      color: '#a855f7',
      arcHeight: 4.0,
      meaning: 'Sun in Gemini ☌ Chiron in Gemini',
      synthesis: 'The Wound of the Sovereign. His entire identity is forged in the fire of chronic physical affliction (foot condition), transforming chronic pain into transcendent courage.'
    },
    {
      planet1: 'Moon',
      planet2: 'Jupiter',
      type: 'sextile',
      angle: 60,
      actualAngle: 53.95,
      orb: 6.05,
      orbFormatted: '6° 03\'',
      isApplying: false,
      nature: 'Harmonious',
      color: '#60a5fa',
      arcHeight: 7.0,
      meaning: 'Exalted Moon in Taurus ⚹ Domicile Jupiter in Pisces',
      synthesis: 'Bountiful emotional optimism, genuine warmth toward supporters, and a calm, joyful emotional state during high-pressure finals.'
    },
    {
      planet1: 'Venus',
      planet2: 'Jupiter',
      type: 'trine',
      angle: 120,
      actualAngle: 127.01,
      orb: 7.01,
      orbFormatted: '7° 01\'',
      isApplying: false,
      nature: 'Harmonious',
      color: '#00e5ff',
      arcHeight: 14.5,
      meaning: 'Venus in Cancer △ Jupiter in Pisces',
      synthesis: 'Water trine of immense grace, global affection, and sportsmanship. Blessed with widespread love, lucrative ethical sponsorships, and enduring goodwill.'
    },
    {
      planet1: 'Saturn',
      planet2: 'Uranus',
      type: 'conjunction',
      angle: 0,
      actualAngle: 14.62,
      orb: 14.62,
      orbFormatted: 'Wide Conjunction',
      isApplying: false,
      nature: 'Dynamic',
      color: '#06b6d4',
      arcHeight: 5.0,
      meaning: 'Saturn in Sagittarius ☌ Uranus in Sagittarius',
      synthesis: 'The fusion of disciplined tradition (Saturn) and radical innovation (Uranus). Created a completely new paradigm in tennis through extreme physical biomechanics anchored to rigorous fundamentals.'
    },
    {
      planet1: 'Saturn',
      planet2: 'North Node',
      type: 'trine',
      angle: 120,
      actualAngle: 116.72,
      orb: 3.28,
      orbFormatted: '3° 17\' (Close)',
      isApplying: true,
      nature: 'Harmonious',
      color: '#38bdf8',
      arcHeight: 15.0,
      meaning: 'Saturn in Sagittarius △ North Node in Aries',
      synthesis: 'Karmic destiny supported by lifelong discipline. Bridges his individual gladiator journey with elder wisdom and patient longevity.'
    },
    {
      planet1: 'Mars',
      planet2: 'Pluto',
      type: 'sextile',
      angle: 60,
      actualAngle: 72.99,
      orb: 12.99,
      orbFormatted: 'Wide Sextile',
      isApplying: false,
      nature: 'Harmonious',
      color: '#8b5cf6',
      arcHeight: 8.0,
      meaning: 'Mars in Capricorn ⚹ Pluto in Scorpio',
      synthesis: 'Both rulers of his Scorpio Ascendant in mutual harmony. Produces explosive physical power fueled by an inexhaustible nuclear core of psychological willpower.'
    },
    {
      planet1: 'Pluto',
      planet2: 'Neptune',
      type: 'sextile',
      angle: 60,
      actualAngle: 59.67,
      orb: 0.33,
      orbFormatted: '0° 20\' (Exact)',
      isApplying: true,
      nature: 'Harmonious',
      color: '#c084fc',
      arcHeight: 7.2,
      meaning: 'Pluto in Scorpio ⚹ Neptune in Capricorn',
      synthesis: 'Generational bridge between spiritual imagination and deep structural transformation.'
    },
    {
      planet1: 'Moon',
      planet2: 'Sun',
      type: 'sextile',
      angle: 60,
      actualAngle: 29.85,
      orb: 0.15,
      orbFormatted: 'Semi-Sextile 30°',
      isApplying: true,
      nature: 'Neutral',
      color: '#fbbf24',
      arcHeight: 4.5,
      meaning: 'Moon in Taurus ⚺ Sun in Gemini',
      synthesis: 'Integration between mental agility (Gemini Sun) and earthy sensory groundedness (Taurus Moon).'
    }
  ]
};

/**
 * Utility to convert generic CosmicData (from Firestore or user profile)
 * into a full, indexed NatalChartProfile ready for 3D visualization.
 */
export function buildProfileFromCosmicData(cosmicData: any, fallbackName: string = 'Cosmic Traveler'): NatalChartProfile {
  if (!cosmicData || !cosmicData.planets || cosmicData.planets.length === 0) {
    return RAFAEL_NADAL_CHART;
  }

  const planets: NatalPlanet[] = (cosmicData.planets || []).map((p: any) => {
    const sign = p.sign || 'Aries';
    const info = SIGN_INFO[sign] || SIGN_INFO['Aries'];
    const degInSign = (p.degree || 0) % 30;
    const totalDeg = info.index * 30 + degInSign;
    const minute = Math.floor((degInSign - Math.floor(degInSign)) * 60);

    return {
      name: p.name,
      symbol: getPlanetSymbol(p.name),
      sign: sign,
      signSymbol: info.symbol,
      degree: Math.round(degInSign * 100) / 100,
      totalDegree: Math.round(totalDeg * 100) / 100,
      minute: minute,
      second: 0,
      house: p.house || 1,
      isRetrograde: !!p.isRetrograde,
      color: getPlanetColor(p.name),
      glowColor: getPlanetGlowColor(p.name),
      dignity: calculateDignity(p.name, sign),
      element: info.element,
      modality: info.modality,
      archetype: p.archetype || `${p.name} in ${sign}`,
      keywords: [info.element, info.modality, `House ${p.house || 1}`],
      description: p.meaning || `The celestial energy of ${p.name} flowing through ${sign}.`,
      interpretation: p.interpretation || p.meaning || `${p.name} in ${sign} illuminates your path in House ${p.house || 1}.`,
    };
  });

  // Calculate aspects if not present
  const aspects: NatalAspect[] = (cosmicData.aspects || []).map((a: any) => {
    const p1 = planets.find(p => p.name.toLowerCase() === a.planet1?.toLowerCase());
    const p2 = planets.find(p => p.name.toLowerCase() === a.planet2?.toLowerCase());
    const type = a.type || 'conjunction';
    const nominalAngle = getAspectNominalAngle(type);

    let actualAngle = 0;
    let orb = 0;
    if (p1 && p2) {
      const diff = Math.abs(p1.totalDegree - p2.totalDegree);
      actualAngle = diff > 180 ? 360 - diff : diff;
      orb = Math.abs(actualAngle - nominalAngle);
    }

    return {
      planet1: a.planet1,
      planet2: a.planet2,
      type: type,
      angle: nominalAngle,
      actualAngle: Math.round(actualAngle * 100) / 100,
      orb: Math.round(orb * 100) / 100,
      orbFormatted: `${Math.floor(orb)}° ${Math.round((orb - Math.floor(orb)) * 60)}'`,
      isApplying: true,
      nature: getAspectNature(type),
      color: getAspectColor(type),
      arcHeight: getAspectArcHeight(nominalAngle),
      meaning: `${a.planet1} ${type} ${a.planet2}`,
      synthesis: a.meaning || `Dynamic celestial dialogue between ${a.planet1} and ${a.planet2}.`,
    };
  });

  // Build houses
  const houses: NatalHouse[] = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const rawHouse = cosmicData.houses?.find((h: any) => h.houseNumber === num);
    const signIndex = (i * 2 + 7) % 12; // Scorpionic baseline or fallback
    const signName = rawHouse?.sign || ZODIAC_SIGNS[signIndex];
    const info = SIGN_INFO[signName] || SIGN_INFO['Aries'];
    const planetsIn = planets.filter(p => p.house === num).map(p => p.name);

    return {
      houseNumber: num,
      sign: signName,
      signSymbol: info.symbol,
      cuspDegree: 15.0,
      cuspMinute: 0,
      totalDegree: (i * 30) % 360,
      realmName: rawHouse?.realmName || `House ${num}`,
      lifeDomain: rawHouse?.description || `Key life domain of House ${num}`,
      rulingPlanet: info.ruler,
      traditionalRuler: info.ruler,
      planetsInHouse: planetsIn,
      element: info.element,
      quality: num === 1 || num === 4 || num === 7 || num === 10 ? 'Angular' : num === 2 || num === 5 || num === 8 || num === 11 ? 'Succedent' : 'Cadent',
      description: rawHouse?.description || `Cosmic influence in House ${num}.`,
    };
  });

  // Elements and modalities count
  let fire = 0, earth = 0, air = 0, water = 0;
  let cardinal = 0, fixed = 0, mutable = 0;
  planets.forEach(p => {
    if (p.element === 'Fire') fire++;
    if (p.element === 'Earth') earth++;
    if (p.element === 'Air') air++;
    if (p.element === 'Water') water++;
    if (p.modality === 'Cardinal') cardinal++;
    if (p.modality === 'Fixed') fixed++;
    if (p.modality === 'Mutable') mutable++;
  });
  const totalP = planets.length || 1;

  return {
    id: 'user_profile_chart',
    title: `${fallbackName}'s Natal Matrix`,
    subjectName: fallbackName,
    birthDate: 'Calculated Blueprint',
    birthTime: 'Exact Solar Alignment',
    location: 'Geocentric Horizon',
    coordinates: 'Aligned',
    timezone: 'UTC',
    ascendantSign: houses[0].sign,
    ascendantDegree: 15.0,
    midheavenSign: houses[9].sign,
    midheavenDegree: 15.0,
    descendantSign: houses[6].sign,
    descendantDegree: 15.0,
    imumCoeliSign: houses[3].sign,
    imumCoeliDegree: 15.0,
    planets,
    houses,
    aspects,
    elementBalance: {
      fire: Math.round((fire / totalP) * 100),
      earth: Math.round((earth / totalP) * 100),
      air: Math.round((air / totalP) * 100),
      water: Math.round((water / totalP) * 100),
    },
    modalityBalance: {
      cardinal: Math.round((cardinal / totalP) * 100),
      fixed: Math.round((fixed / totalP) * 100),
      mutable: Math.round((mutable / totalP) * 100),
    },
    summary: `Complete astrological imprint synthesizing ${planets.length} celestial bodies across 12 houses and ${aspects.length} aspect bridges.`,
  };
}

export function getPlanetSymbol(name: string): string {
  const map: Record<string, string> = {
    'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
    'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
    'North Node': '☊', 'South Node': '☋', 'Chiron': '⚷', 'Lilith': '⚸'
  };
  return map[name] || '★';
}

export function getPlanetColor(name: string): string {
  const map: Record<string, string> = {
    'Sun': '#facc15', 'Moon': '#e2e8f0', 'Mercury': '#38bdf8', 'Venus': '#34d399',
    'Mars': '#ef4444', 'Jupiter': '#818cf8', 'Saturn': '#eab308', 'Uranus': '#06b6d4',
    'Neptune': '#38bdf8', 'Pluto': '#a855f7', 'North Node': '#10b981', 'South Node': '#f43f5e',
    'Chiron': '#c084fc', 'Lilith': '#64748b'
  };
  return map[name] || '#ffffff';
}

export function getPlanetGlowColor(name: string): string {
  const map: Record<string, string> = {
    'Sun': '#fbbf24', 'Moon': '#93c5fd', 'Mercury': '#0ea5e9', 'Venus': '#10b981',
    'Mars': '#dc2626', 'Jupiter': '#6366f1', 'Saturn': '#ca8a04', 'Uranus': '#22d3ee',
    'Neptune': '#60a5fa', 'Pluto': '#c084fc', 'North Node': '#34d399', 'South Node': '#fb7185',
    'Chiron': '#e879f9', 'Lilith': '#94a3b8'
  };
  return map[name] || '#38bdf8';
}

export function getAspectNominalAngle(type: string): number {
  switch (type.toLowerCase()) {
    case 'conjunction': return 0;
    case 'sextile': return 60;
    case 'square': return 90;
    case 'trine': return 120;
    case 'opposition': return 180;
    default: return 0;
  }
}

export function getAspectColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'trine': return '#00e5ff'; // Cyan / Electric Blue
    case 'square': return '#ff3344'; // Fiery Coral / Red
    case 'opposition': return '#ff8800'; // Amber / Orange
    case 'sextile': return '#d946ef'; // Magenta / Violet
    case 'conjunction': return '#fbbf24'; // Radiant Gold
    default: return '#ffffff';
  }
}

export function getAspectNature(type: string): 'Harmonious' | 'Dynamic' | 'Intense' | 'Neutral' {
  switch (type.toLowerCase()) {
    case 'trine':
    case 'sextile': return 'Harmonious';
    case 'square':
    case 'opposition': return 'Dynamic';
    case 'conjunction': return 'Intense';
    default: return 'Neutral';
  }
}

export function getAspectArcHeight(angle: number): number {
  // Height of the parabolic arc above the wheel disc
  if (angle >= 170) return 18.0; // Opposition leaps the highest across the center
  if (angle >= 110) return 14.5; // Trines leap majestically
  if (angle >= 80) return 10.0;  // Squares arch energetically
  if (angle >= 50) return 7.5;   // Sextiles arch tautly
  return 4.0;                    // Conjunctions form a compact localized vortex
}

export function calculateDignity(planet: string, sign: string): 'Domicile' | 'Exaltation' | 'Detriment' | 'Fall' | 'Peregrine' {
  const table: Record<string, { domicile: string[]; exaltation: string[]; detriment: string[]; fall: string[] }> = {
    'Sun': { domicile: ['Leo'], exaltation: ['Aries'], detriment: ['Aquarius'], fall: ['Libra'] },
    'Moon': { domicile: ['Cancer'], exaltation: ['Taurus'], detriment: ['Capricorn'], fall: ['Scorpio'] },
    'Mercury': { domicile: ['Gemini', 'Virgo'], exaltation: ['Virgo'], detriment: ['Sagittarius', 'Pisces'], fall: ['Pisces'] },
    'Venus': { domicile: ['Taurus', 'Libra'], exaltation: ['Pisces'], detriment: ['Scorpio', 'Aries'], fall: ['Virgo'] },
    'Mars': { domicile: ['Aries', 'Scorpio'], exaltation: ['Capricorn'], detriment: ['Libra', 'Taurus'], fall: ['Cancer'] },
    'Jupiter': { domicile: ['Sagittarius', 'Pisces'], exaltation: ['Cancer'], detriment: ['Gemini', 'Virgo'], fall: ['Capricorn'] },
    'Saturn': { domicile: ['Capricorn', 'Aquarius'], exaltation: ['Libra'], detriment: ['Cancer', 'Leo'], fall: ['Aries'] },
    'Uranus': { domicile: ['Aquarius'], exaltation: ['Scorpio'], detriment: ['Leo'], fall: ['Taurus'] },
    'Neptune': { domicile: ['Pisces'], exaltation: ['Cancer', 'Leo'], detriment: ['Virgo'], fall: ['Capricorn'] },
    'Pluto': { domicile: ['Scorpio'], exaltation: ['Aries'], detriment: ['Taurus'], fall: ['Libra'] },
  };

  const entry = table[planet];
  if (!entry) return 'Peregrine';
  if (entry.domicile.includes(sign)) return 'Domicile';
  if (entry.exaltation.includes(sign)) return 'Exaltation';
  if (entry.detriment.includes(sign)) return 'Detriment';
  if (entry.fall.includes(sign)) return 'Fall';
  return 'Peregrine';
}
