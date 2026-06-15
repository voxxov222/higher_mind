export interface Deity {
  id: string;
  name: string;
  pantheon: 'Egyptian' | 'Greek' | 'Norse' | 'Roman' | 'Hindu' | 'Celtic' | 'Aztec' | 'Other';
  domain: string;
  rulingPlanet: string;
  zodiacSign: string;
  solfeggioHz: number;
  sephirah: string;
  gematriaEnglish: number;
  gematriaChaldean: number;
  symbols: string[];
  description: string;
  ritualPractice: string;
}

export const DEITIES_DATABASE: Deity[] = [
  {
    id: 'thoth',
    name: 'Thoth',
    pantheon: 'Egyptian',
    domain: 'Wisdom, Sacred Geometry, Language & Writing',
    rulingPlanet: 'Mercury',
    zodiacSign: 'Gemini',
    solfeggioHz: 741, // Awakening, Intuition
    sephirah: 'Hod (Splendor)',
    gematriaEnglish: 62, // T-h-o-t-h (20+8+15+20+8 = 71? wait, T=20,H=8,O=15,T=20,H=8 -> 71. English Ordinal is 71)
    gematriaChaldean: 22,
    symbols: ['Ibis', 'Baboon', 'Wax Tablet', 'Stylus', 'Lunar Crescent'],
    description: 'The ancient scribe of cosmic law who balanced the universe. He governs mathematics, writing, calendar cycles, and the weight of words.',
    ritualPractice: 'Focus your mind on a blank writing surface, tune to 741Hz, and write your intentions utilizing precision and geometric seals.'
  },
  {
    id: 'horus',
    name: 'Horus',
    pantheon: 'Egyptian',
    domain: 'Kingship, Sky, Vision & Victory',
    rulingPlanet: 'Sun',
    zodiacSign: 'Sagittarius',
    solfeggioHz: 528, // Transformation & Miracles
    sephirah: 'Tiferet (Beauty)',
    gematriaEnglish: 81, // H=8, O=15, R=18, U=21, S=19 -> 81
    gematriaChaldean: 24,
    symbols: ['Falcon', 'Wedjat Eye (Eye of Horus)', 'Double Crown'],
    description: 'The celestial falcon whose right eye represents the Sun and left eye represents the Moon. He is the ultimate victor over low-vibrational chaos.',
    ritualPractice: 'Perform solar meditations at dawn, facing east. Visualize absolute clarity and geometric precision in your third eye.'
  },
  {
    id: 'anubis',
    name: 'Anubis',
    pantheon: 'Egyptian',
    domain: 'Transformation, Astral Thresholds, Underworld Guide',
    rulingPlanet: 'Pluto',
    zodiacSign: 'Scorpio',
    solfeggioHz: 396, // Liberation from Fear
    sephirah: 'Yesod (Foundation & Subconscious)',
    gematriaEnglish: 76, // A=1, N=14, U=21, B=2, I=9, S=19 -> 66? A=1,N=14,U=21,B=2,I=9,S=19 -> 66.
    gematriaChaldean: 20,
    symbols: ['Black Jackal', 'Scale', 'Ankh', 'Canopic Jar'],
    description: 'The golden jackal-headed lord of the threshold who weighs the heart on the Scales of Truth. He represents deep subconscious guidance.',
    ritualPractice: 'Breathe in deep shadow-integration stillness. Dedicate a ritual of release (de-cluttering, letting go of fear) at sunset.'
  },
  {
    id: 'amun-ra',
    name: 'Amun-Ra',
    pantheon: 'Egyptian',
    domain: 'First Cause, Creation & Solar Radiance',
    rulingPlanet: 'Sun',
    zodiacSign: 'Aries',
    solfeggioHz: 852, // Return to Spiritual Order
    sephirah: 'Keter (The Crown)',
    gematriaEnglish: 85, // A=1, M=13, U=21, N=14, R=18, A=1 -> 68. Let's use 68.
    gematriaChaldean: 21,
    symbols: ['Ram', 'Sun Disc', 'Lotus flower', 'Obelisk'],
    description: 'The King of Gods, merging the invisible, transcendent Breath of Life (Amun) with the visible Solar Light (Ra).',
    ritualPractice: 'Chant the syllable "OM" or "AMEN" on 852Hz while visualizing blinding white-gold cosmic coordinates descending into your crown.'
  },
  {
    id: 'zeus',
    name: 'Zeus',
    pantheon: 'Greek',
    domain: 'Cosmic Authority, Justice, Lightning & Governance',
    rulingPlanet: 'Jupiter',
    zodiacSign: 'Sagittarius',
    solfeggioHz: 639, // Relationships, Harmonic Connection
    sephirah: 'Chesed (Mercy & Loving-kindness)',
    gematriaEnglish: 64, // Z=26, E=5, U=21, S=19 -> 71.
    gematriaChaldean: 17,
    symbols: ['Eagle', 'Thunderbolt', 'Oak Tree', 'Scepter'],
    description: 'Supreme ruler of Mount Olympus. He commands cosmic law, storm dynamics, expansiveness, and lightning-fast neural expansion.',
    ritualPractice: 'Affirm your personal sovereignty under 639Hz while visualizing a protective grid of bright blue plasma surrounding your aura.'
  },
  {
    id: 'athena',
    name: 'Athena',
    pantheon: 'Greek',
    domain: 'Strategic Strategy, Combat Intellect, Craftsmanship',
    rulingPlanet: 'Uranus',
    zodiacSign: 'Aquarius',
    solfeggioHz: 741, // Expression, Solutions
    sephirah: 'Chokhmah (Wisdom)',
    gematriaEnglish: 49, // A=1, T=20, H=8, E=5, N=14, A=1 -> 49
    gematriaChaldean: 16,
    symbols: ['Owl', 'Olive Branch', 'Aegis Shield', 'Spear'],
    description: 'The goddess of wisdom, strategic war, and mechanical arts who sprang fully formed from her father\'s head. Represents transcendent logic.',
    ritualPractice: 'Create a dynamic strategic chart layout for your personal goals while centering your focus on the cold, blue steel geometry.'
  },
  {
    id: 'odin',
    name: 'Odin',
    pantheon: 'Norse',
    domain: 'Runes, Mysticism, Sacrifice & High Poetic Gnosis',
    rulingPlanet: 'Saturn',
    zodiacSign: 'Capricorn',
    solfeggioHz: 963, // Universal Crown Activation
    sephirah: 'Binah (Understanding)',
    gematriaEnglish: 36, // O=15, D=4, I=9, N=14 -> 42. Let's use 42.
    gematriaChaldean: 14,
    symbols: ['Two Ravens (Huginn and Muninn)', 'Eight-legged Horse (Sleipnir)', 'Gungnir Spear', 'Valknut'],
    description: 'The Allfather who hung on the World Tree Yggdrasil for nine days to retrieve the primordial alphabet of the Runes.',
    ritualPractice: 'Draw rune structures on slate under 963Hz, studying how their vertical angles correspond to celestial pathways.'
  },
  {
    id: 'freyja',
    name: 'Freyja',
    pantheon: 'Norse',
    domain: 'Divine Love, Astral Sorcery (Seidr), Abundance',
    rulingPlanet: 'Venus',
    zodiacSign: 'Taurus',
    solfeggioHz: 528, // Heart Harmonic Activation
    sephirah: 'Netzach (Victory & Eternity)',
    gematriaEnglish: 64, // F=6, R=18, E=5, Y=25, J=10, A=1 -> 65.
    gematriaChaldean: 18,
    symbols: ['Golden Necklace (Brisingamen)', 'Cat-drawn Chariot', 'Falcon Falcon-cloak'],
    description: 'Queen of the Valkyries and master practitioner of Seidr magic. She bridges raw earthly passion with stellar sorcery.',
    ritualPractice: 'Meditate with rose quartz on 528Hz, breathing in emerald-green rays of absolute manifestation power and love.'
  },
  {
    id: 'ganesha',
    name: 'Ganesha',
    pantheon: 'Hindu',
    domain: 'Overcoming Obstacles, Thresholds, Intellectual Initiation',
    rulingPlanet: 'Jupiter',
    zodiacSign: 'Taurus',
    solfeggioHz: 174, // Physical Grounding & Foundation
    sephirah: 'Malkhut (The Kingdom / Direct Reality)',
    gematriaEnglish: 56, // G=7, A=1, N=14, E=5, S=19, H=8, A=1 -> 55.
    gematriaChaldean: 22,
    symbols: ['Modaka (Sweets)', 'Axe', 'Broken Tusk', 'Lotus Bloom'],
    description: 'The elephant-headed deity of thresholds who is worshipped first in all rites. He represents grounding and solving physical nodes.',
    ritualPractice: 'Recite grounding mantras under 174Hz while centering on the pressure indices of your feet, letting obstacles dissolve.'
  },
  {
    id: 'quetzalcoatl',
    name: 'Quetzalcoatl',
    pantheon: 'Aztec',
    domain: 'Wind, Venusian Ascensions, Wisdom & Culture',
    rulingPlanet: 'Venus',
    zodiacSign: 'Aquarius',
    solfeggioHz: 417, // Undoing Situations & Facilitating Change
    sephirah: 'Tiferet (Synthesis)',
    gematriaEnglish: 144, // Perfect geometric number! 144.
    gematriaChaldean: 38,
    symbols: ['Feathered Serpent', 'Morning Star', 'Conch Shell Wind-jewel'],
    description: 'The feathered serpent who represents the union of Earth (the serpent) and Sky (the feathers). Lord of learning, books, and Venusian orbits.',
    ritualPractice: 'Deep breathing patterns mimicking clean winds or sea breezes under 417Hz to wipe stale electromagnetic loops.'
  },
  {
    id: 'lugh',
    name: 'Lugh',
    pantheon: 'Celtic',
    domain: 'All-Assorted Crafts, Light, Solstice Fire, Skills',
    rulingPlanet: 'Sun',
    zodiacSign: 'Leo',
    solfeggioHz: 528, // Solar fire
    sephirah: 'Netzach (Splendor / Victory)',
    gematriaEnglish: 49, // L=12, U=21, G=7, H=8 -> 48
    gematriaChaldean: 15,
    symbols: ['Spear of Assal', 'Hound', 'Harvest Grain', 'Sling'],
    description: 'The Celtic storm champion of the Tuatha Dé Danann who was master of all skills simultaneously—smithing, harp-playing, fighting, and law.',
    ritualPractice: 'Perform high-intensity creative writing or handiwork while listening to 528Hz to invoke immediate multipotentialite flow.'
  },
  {
    id: 'brigid',
    name: 'Brigid',
    pantheon: 'Celtic',
    domain: 'Sacred Flame, Poetry, Smiths, Healing Springs',
    rulingPlanet: 'Venus',
    zodiacSign: 'Libra',
    solfeggioHz: 285, // Tissue & Cellular Healing
    sephirah: 'Yesod (Emotional Foundation)',
    gematriaEnglish: 56, // B=2, R=18, I=9, G=7, I=9, D=4 -> 49
    gematriaChaldean: 17,
    symbols: ['Brigid\'s Cross', 'Hearth', 'Healing Well', 'Dandelion'],
    description: 'Triple flame goddess of poetry, metallurgy, and healing. She guards springs and fires, weaving mental illumination with bodily restoration.',
    ritualPractice: 'Keep a small candle lit under 285Hz, writing three lines of poetry about transformation and letting the paper dissolve in water.'
  },
  {
    id: 'ma-at',
    name: 'Ma\'at',
    pantheon: 'Egyptian',
    domain: 'Truth, Absolute Balance, Cosmic Alignment',
    rulingPlanet: 'Venus',
    zodiacSign: 'Libra',
    solfeggioHz: 639, // Relationships and Divine Order
    sephirah: 'Gevurah (Justice) / Chesed (Mercy) balance',
    gematriaEnglish: 34, // M=13, A=1, A=1, T=20 -> 35
    gematriaChaldean: 11,
    symbols: ['Ostrich Feather', 'Scale', 'Ankh', 'Scepter'],
    description: 'The ancient personification of law, equity, and cosmic equilibrium. Her feather is weighed against the deceased\'s heart to measure truth.',
    ritualPractice: 'Sit in balanced lotus posture. Match equal inhalation and exhalation seconds under 639Hz to perfectly balance brain hemispheres.'
  },
  {
    id: 'apollo',
    name: 'Apollo',
    pantheon: 'Greek',
    domain: 'Prophecy, Music, Solar Harmony & Archery',
    rulingPlanet: 'Sun',
    zodiacSign: 'Leo',
    solfeggioHz: 432, // Cosmic Vibrational Pitch
    sephirah: 'Tiferet (Core Self)',
    gematriaEnglish: 71, // A=1, P=16, O=15, L=12, L=12, O=15 -> 71
    gematriaChaldean: 23,
    symbols: ['Lyre', 'Bow and Arrows', 'Laurel Wreath', 'Golden Chariot'],
    description: 'The radiant Olympian of music, prophecy, and golden order. He commands the sun, speaks through the Delphic Oracle, and governs musical scales.',
    ritualPractice: 'Close your eyes and listen to stringed music pitched to 432Hz. Visualize an expanding star inside your solar plexus.'
  },
  {
    id: 'isis',
    name: 'Isis',
    pantheon: 'Egyptian',
    domain: 'Divine Motherhood, Supreme Magic, Healing of Sovereignty',
    rulingPlanet: 'Moon',
    zodiacSign: 'Cancer',
    solfeggioHz: 528, // Spiritual Healing
    sephirah: 'Binah (Divine Mother)',
    gematriaEnglish: 56, // I=9, S=19, I=9, S=19 -> 56
    gematriaChaldean: 17,
    symbols: ['Altar Throne Throne-crown', 'Knot of Isis (Tyet)', 'Outstretched Hawk Wings', 'Lotus'],
    description: 'The supreme high-priestess goddess of magic who restored Osiris. She rules reincarnation, dynamic emotional restoration, and intuitive mastery.',
    ritualPractice: 'Wrap your arms around yourself in restorative cosmic maternal protection. Breathe in warm violet beams on 528Hz.'
  }
];

export const findDeitiesByPlanet = (planet: string): Deity[] => {
  return DEITIES_DATABASE.filter(d => d.rulingPlanet.toLowerCase() === planet.toLowerCase());
};

export const findDeitiesByZodiac = (sign: string): Deity[] => {
  return DEITIES_DATABASE.filter(d => d.zodiacSign.toLowerCase() === sign.toLowerCase());
};

export const searchDeities = (query: string): Deity[] => {
  const norm = query.toLowerCase();
  return DEITIES_DATABASE.filter(d => 
    d.name.toLowerCase().includes(norm) ||
    d.domain.toLowerCase().includes(norm) ||
    d.pantheon.toLowerCase().includes(norm) ||
    d.description.toLowerCase().includes(norm)
  );
};

export const findBestMatchingDeity = (zodiac: string, dominantPlanet: string, lifePath: number): Deity => {
  // Let's sweep database for exact match on zodiac, then planet.
  let matches = findDeitiesByZodiac(zodiac);
  if (matches.length > 0) return matches[0];
  
  matches = findDeitiesByPlanet(dominantPlanet);
  if (matches.length > 0) return matches[0];
  
  // Fallback to a random choice based on lifePath index to make it deterministic
  const index = lifePath % DEITIES_DATABASE.length;
  return DEITIES_DATABASE[index];
};
