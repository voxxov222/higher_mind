export type AtlasClaim = "Historical evidence" | "Religious doctrine" | "Philosophical interpretation" | "Traditional symbolism" | "Modern reinterpretation" | "Speculation";

export type AtlasEntry = {
  title: string;
  summary: string;
  body: string;
  claims: { kind: AtlasClaim; text: string }[];
};

export type AtlasDomain = {
  id: string;
  label: string;
  lede: string;
  entries: AtlasEntry[];
};

export const ATLAS_CANON = `
ESOTERIC ATLAS — indexed library. Use it when the user asks about traditions, numbers, or "what is the same as".
Rules:
- Separate historical evidence, religious doctrine, philosophical interpretation, traditional symbolism, modern reinterpretation, and speculation. Say which one you are using.
- Tropical zodiac signs are 30° coordinates from the March equinox, not the constellations of the same names. A Vedic chart uses a sidereal zodiac and is a different calculation.
- Whole-sign houses and Placidus houses can put the same planet in different houses. Name the house system.
- The seven classical planets are Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn. Uranus, Neptune, and Pluto are modern additions.
- Pythagorean numerology, Chaldean numerology, and Hebrew gematria are three systems. Do not present one total as the others.
- Hebrew gematria applies to a Hebrew spelling. Do not invent a Hebrew spelling for an English name.
- The ten sefirot are not ten gods, not chakras, and not the Golden Dawn planet set. Golden Dawn path labels are a later ceremonial layer.
- "Gnostic" is not one church. Sethian and Valentinian tellings disagree. Plato's demiurge is not Yaldabaoth.
- The philosophical Hermetica are Greek texts of the early centuries CE. The Emerald Tablet's traceable history is medieval Arabic, then Latin. Do not invent quotations.
- Sufism is Islamic mysticism inside tawhid. It is not a free-floating wisdom school.
- A shared number (seven, ten, phi) is not documented influence. Say "similarity" or "later collage" unless a text trail exists.
- Never claim astrology or numerology scientifically determines personality, health, or the future.
`.trim();

export const ATLAS_DOMAINS: AtlasDomain[] = [
  {
    id: "astrology",
    label: "Astrology",
    lede: "The sky math Higher Mind already draws is astronomical. What a tradition says it means is an interpretation, and the traditions do not agree.",
    entries: [
      {
        title: "Tropical and sidereal",
        summary: "Two zodiacs, not two names for one result.",
        body: "0° tropical Aries is the March equinox. Precession has moved the constellations. Jyotisha usually uses a sidereal zodiac plus an ayanamsa, nakshatras, and dashas. Higher Mind's natal astrolabe is not automatically a kundli.",
        claims: [
          { kind: "Historical evidence", text: "Hellenistic horoscopy and Indian astronomical texts interacted for centuries and remained different systems." },
          { kind: "Speculation", text: "Calling the sidereal zodiac simply \"the real constellations\" skips unequal constellation sizes and the choice of ayanamsa." },
        ],
      },
      {
        title: "Houses and aspects",
        summary: "Houses divide the local sky. Aspects are angles between longitudes.",
        body: "Whole-sign houses give the rising sign to the first house. Quadrant houses such as Placidus can move a planet. This library does not silently swap those systems. Orbs are conventions, not fate.",
        claims: [
          { kind: "Historical evidence", text: "Whole-sign houses are attested in Hellenistic sources. Quadrant houses become important later." },
          { kind: "Modern reinterpretation", text: "Psychological keywords for squares and trines are a 20th-century style." },
        ],
      },
    ],
  },
  {
    id: "numerology",
    label: "Numerology",
    lede: "Show the arithmetic. Pythagorean, Chaldean, and Hebrew gematria are not three ways of saying the same thing.",
    entries: [
      {
        title: "Pythagorean grid",
        summary: "A modern English letter chart, only loosely tied to Pythagoras.",
        body: "A–I is 1–9, then the alphabet repeats. Life path reduces month, day, and year, keeps 11, 22, and 33 in the popular manual, then reduces the sum. Pythagoras did not publish that birth-date method. The steps belong on the page.",
        claims: [
          { kind: "Modern reinterpretation", text: "Birth-name readings in 20th-century manuals are a modern craft." },
          { kind: "Historical evidence", text: "Pythagorean philosophers did treat number as cosmic structure. That is not a life-path digit." },
        ],
      },
      {
        title: "Gematria",
        summary: "Hebrew letter values, for a Hebrew spelling.",
        body: "Alef is 1 through Tav 400. Final letters may keep the medial value or take 500–900. The total belongs to that spelling. An English nickname run through a private cipher is a new system, not Kabbalah.",
        claims: [
          { kind: "Historical evidence", text: "Rabbinic literature uses Hebrew letter-numbers." },
          { kind: "Speculation", text: "Matching two phrases because the sums match is an interpretive move, not a law of history." },
        ],
      },
    ],
  },
  {
    id: "geometry",
    label: "Geometry",
    lede: "Figures Higher Mind can draw, with the mathematics kept apart from the symbol.",
    entries: [
      {
        title: "Flower and phi",
        summary: "Hexagonal circle packing does not require the golden ratio.",
        body: "Equal circles whose centers are one radius apart make the seed (7) and the flower (19). Phi is (1+√5)/2, proved in the pentagon's diagonals and studied by Euclid as a proportion. Joining the flower, phi, and \"all of creation\" into one code is a later collage.",
        claims: [
          { kind: "Historical evidence", text: "Euclid studies the extreme and mean ratio. He does not call it a spiritual law." },
          { kind: "Modern reinterpretation", text: "The name Flower of Life as a universal key is modern esoteric usage. Overlapping-circle ornament is older." },
        ],
      },
    ],
  },
  {
    id: "kabbalah",
    label: "Kabbalah",
    lede: "Jewish mystical literature is not a generic number code. Later occult trees borrow the diagram.",
    entries: [
      {
        title: "Ten sefirot",
        summary: "Keter, Chokhmah, Binah, Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malkhut.",
        body: "Ein Sof is not a sefirah. Da'at is sometimes drawn and is not an eleventh. Classical Kabbalah insists on divine unity. Identifying sefirot with chakras or with a \"higher self\" is a contemporary translation, not the Zohar.",
        claims: [
          { kind: "Religious doctrine", text: "The sefirot are attributes or channels, not ten gods." },
          { kind: "Modern reinterpretation", text: "Golden Dawn planetary and tarot labels on the paths are a 19th-century ceremonial system." },
        ],
      },
      {
        title: "Zohar",
        summary: "A long Aramaic work and a dating argument that should both be named.",
        body: "Tradition receives it as the teaching of Shimon bar Yochai. Historians place the main composition in 13th-century Castile, in the circle of Moses de León. Sefer Yetzirah is a different, much shorter book.",
        claims: [
          { kind: "Historical evidence", text: "The Castilian emergence of the Zohar in the late 1200s is the usual historical position." },
          { kind: "Religious doctrine", text: "For many Jewish readers, human authorship does not settle the question of holiness." },
        ],
      },
    ],
  },
  {
    id: "gnostic",
    label: "Gnostic studies",
    lede: "There is no single Gnostic church. Prefer the text or the school.",
    entries: [
      {
        title: "Demiurge and Sophia",
        summary: "In several Sethian tellings, a lesser maker fashions the world after Wisdom's disruption.",
        body: "The Apocryphon of John tells one long version. Valentinian teachers often make the maker ignorant rather than purely evil. The Gospel of Thomas is a sayings collection, not that myth. Plato's craftsman in the Timaeus is good. The word travels. The character changes.",
        claims: [
          { kind: "Historical evidence", text: "The Nag Hammadi codices were found in 1945. They are Coptic translations buried around the 4th century." },
          { kind: "Religious doctrine", text: "Where this myth is taught, the biblical creator is reread as a lower power. That is a break, not a poetic extra." },
        ],
      },
    ],
  },
  {
    id: "hermetic",
    label: "Hermetic philosophy",
    lede: "The name Hermes was reused by later magicians. The books are not all one library.",
    entries: [
      {
        title: "Corpus and tablet",
        summary: "Greek dialogues of Roman Egypt, and a short alchemy text known in Arabic.",
        body: "The philosophical Hermetica talk about mind and cosmos. Ficino translated them in the 1460s and thought they were older than they are. Casaubon later dated the Greek to late antiquity. The Emerald Tablet's traceable life begins in Arabic alchemy. The physical emerald is a legend. \"As above, so below\" is a summary slogan from that tablet tradition, not a poster from the Corpus.",
        claims: [
          { kind: "Historical evidence", text: "Ficino's Latin Corpus was published in 1471. Casaubon's dating is 1614." },
          { kind: "Speculation", text: "Stories of Alexander finding an emerald slab are legendary frames." },
        ],
      },
    ],
  },
  {
    id: "religion",
    label: "Comparative religion",
    lede: "Positions, not a ranking. A tradition can hold more than one, and none is a costume for the others.",
    entries: [
      {
        title: "How the words differ",
        summary: "Monotheism, henotheism, pantheism, panentheism, dualism, and non-theism are not synonyms.",
        body: "Exclusive worship is not the same as \"only one god exists.\" Pantheism identifies God with the world. Panentheism says the divine is in the world and more than the world. Manichaean two principles are not the moral drama inside a monotheism. Theravada can include devas and still not center a creator. Sufi tawhid stays inside Islam. Ibn Arabi's unity of being is a contested reading, not a settled translation into pantheism.",
        claims: [
          { kind: "Philosophical interpretation", text: "\"In all, and beyond all\" is the working distinction between panentheism and pantheism." },
          { kind: "Speculation", text: "A clean march from polytheism to henotheism to monotheism is a 19th-century story, not a law." },
        ],
      },
    ],
  },
  {
    id: "links",
    label: "Connections",
    lede: "A link has a type. Documented influence is not a later collage, and a shared number is not a shared religion.",
    entries: [
      {
        title: "Seven",
        summary: "Often the seven classical planets, and then the week. Not every seven.",
        body: "Babylonian celestial omens feed Hellenistic horoscopy. That debt is documented. The planetary week still names those bodies. Biblical sevens and the seven lower sefirot are different counts. Similarity is not identity.",
        claims: [
          { kind: "Historical evidence", text: "The seven-day planetary week spreads with Hellenistic astrology." },
          { kind: "Philosophical interpretation", text: "Some Kabbalistic counts speak of seven lower sefirot. That does not make the sefirot the planets." },
        ],
      },
      {
        title: "Tree, reused",
        summary: "The diagram has a history inside Kabbalah, then a second life in modern occultism.",
        body: "Medieval Kabbalah develops beside Jewish philosophy that knew Aristotelian and Neoplatonic ideas of emanation. Plotinus is not a Kabbalist. The Golden Dawn and Thelema keep the outline and add tarot and a different theology.",
        claims: [
          { kind: "Historical evidence", text: "Emanation is a real medieval conversation. It does not collapse the traditions." },
          { kind: "Modern reinterpretation", text: "Metatron's Cube as a named figure over the Fruit of Life is modern. The angel Metatron is older than that drawing." },
        ],
      },
    ],
  },
];

const PYTH: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

function reduceNumber(n: number): { value: number; steps: string[] } {
  const steps: string[] = [];
  let current = Math.abs(Math.trunc(n));
  const master = new Set([11, 22, 33]);
  while (current > 9 && !master.has(current)) {
    const digits = String(current).split("").map(Number);
    const next = digits.reduce((sum, digit) => sum + digit, 0);
    steps.push(`${digits.join(" + ")} = ${next}`);
    current = next;
  }
  return { value: current, steps };
}

export function atlasLifePath(isoDate: string): { line: string; value: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const m = reduceNumber(month);
  const d = reduceNumber(day);
  const y = reduceNumber(year);
  const total = m.value + d.value + y.value;
  const result = reduceNumber(total);
  return {
    value: result.value,
    line: `Month ${m.value} + day ${d.value} + year ${y.value} = ${total}` + (result.steps[0] ? ` → ${result.steps.join(" → ")}` : ""),
  };
}

export function atlasNameTotal(name: string): { value: number; raw: number } | null {
  const letters = (name.toLowerCase().match(/[a-z]/g) ?? []);
  if (!letters.length) return null;
  const raw = letters.reduce((sum, letter) => sum + (PYTH[letter] ?? 0), 0);
  return { raw, value: reduceNumber(raw).value };
}
