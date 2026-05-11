/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GoogleGenAI, Type } from "@google/genai";
import { CosmicData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CosmicInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  location: string;
}

export const fetchCosmicReading = async (input: CosmicInput): Promise<CosmicData> => {
  const ai = getAI();
  const prompt = `
  You are an expert, mystic astrologer, numerologist, and Kabbalist.
  Calculate and provide a deep, immersive cosmic analysis for the following entity:
  Name: ${input.name}
  Birth Date: ${input.birthDate}
  Birth Time: ${input.birthTime}
  Location: ${input.location}

  You must calculate or logically approximate the following. **EXTREME CRITICAL INSTRUCTION: Keep ALL text generation to an ABSOLUTE MINIMUM. Use 10 words or less per description where possible. Use terse bullet-point logic. Do not write paragraphs. Speed of generation is the single most important factor. Output must be extremely fast:**
  1. Natal Chart (10 planets/Ascendant). EXACT degree (0-360) and house. VERY SHORT 'meaning' and 'treeOfLifeConnection'.
  2. Cosmic Nodes: North/South (degree/house). SHORT 'meaning' and 'treeOfLifeConnection'.
  3. Cosmic Points: Vertex, Part of Fortune, Chiron, Black Moon Lilith. SHORT 'meaning'/'treeOfLifeConnection'.
  4. Advanced Cycles: Morning/Evening Star, Arabic Lots (Spirit, Eros), 3 Asteroids, Planet Phases, and 2 Soli-Arcs. MAXIMUM brevity.
  5. Aspects: List 5 aspects (e.g. conjunct, trine). Terse 'meaning'.
  6. Houses: Briefly name all 12 houses and give a 1-sentence 'description'.
  7. Numerology: Life Path, Expression, Soul Urge numbers.
  8. Gematria: nameValue, Reduction, Pattern, nameSequence, dobSequence, numberProperties. Be brief.
  9. Kabbalah: Primary Sephirah and Path.
  10. Torus Analysis: 1 sentence for 'bodyAndFlow', 'mindAndSpiritual', 'cosmicAlignment', 'overallAnalogy'.
  11. Daily Insight: 1 short sentence each for 'horoscope', 'affirmation', 'caution', 'keyInterest', 'ageSignificance', 'timeDateCorrelation'.
  12. Weekly, Monthly & Yearly Insights: 1 sentence 'horoscope' and short 'theme' for each.
  13. Life Strategy: 'universeCorrelation', 'kabbalahNumerologyDepth', 'goalPlan', 'movingForward'. Max 2 sentences each.
  14. Timeline: 5 events (past, present, future). 'year', 'age', very short 'highlight', 'houseSignificance', 'period'.
  15. Name Analysis: First, Middle, Last names ('origin', 'meaning', short 'impact'). Max 1 short sentence for 'overallBigPicture'.
  16. Akashic Records: 'soulOrigin', 'pastLifeThemes', 'karmicDebts', 'soulGifts', 'guardianMessage' max 2 sentences each.
  17. Kabbalistic Numerology: Map Life Path, Expression, and Soul Urge to the Tree of Life. For each, provide a 'sephirah', 'path', and 'meaning' (how it fits their soul journey). Provide a 'treeSynthesis' overall.
  18. Patterns & Synchronicities: Analyze user inputs for interesting esoteric connections (e.g., name meaning to gematria matching sign, numerical patterns, astrology aligning with numerology, initials mapping to significant values). Provide 2-3 'synchronicities' (each with 'title' and short 'description'), an array of 2-3 short 'interestingFacts', and a 'coreTheme'.
  
  Format the output STRICTLY as valid JSON matching this schema:
  {
    "planets": [{ "name": "Sun", "sign": "...", "degree": 120, "house": 1, "meaning": "...", "treeOfLifeConnection": "..." }, ... ],
    "nodes": { "north": { "name": "North Node", "sign": "...", "degree": 45, "house": 2, "meaning": "...", "treeOfLifeConnection": "..." }, "south": { ... } },
    "points": { "vertex": { ... }, "partOfFortune": { ... }, "chiron": { ... }, "blackMoonLilith": { ... } },
    "advancedCycles": { 
      "morningEveningStars": { "morningStar": "...", "eveningStar": "...", "meaning": "..." },
      "arabicLots": { "lotOfSpirit": "...", "lotOfEros": "...", "meaning": "..." },
      "notableAsteroids": [{ "name": "...", "sign": "...", "meaning": "..." }],
      "planetPhases": [{ "name": "...", "phase": "...", "meaning": "..." }],
      "soliArcs": [{ "description": "...", "meaning": "..." }]
    },
    "aspects": [{ "planet1": "Sun", "planet2": "Moon", "type": "conjunction", "meaning": "..." }],
    "houses": [{ "houseNumber": 1, "realmName": "...", "description": "..." }],
    "numerology": { "lifePath": 7, "expression": 5, "soulUrge": 3 },
    "gematria": { "nameValue": 144, "reduction": 9, "pattern": "...", "nameSequence": "...", "dobSequence": "...", "numberProperties": "..." },
    "kabbalah": { "sephirah": "...", "path": "..." },
    "torusAnalysis": { "bodyAndFlow": "...", "mindAndSpiritual": "...", "cosmicAlignment": "...", "overallAnalogy": "..." },
    "dailyInsight": { "date": "...", "horoscope": "...", "affirmation": "...", "caution": "...", "keyInterest": "...", "ageSignificance": "...", "timeDateCorrelation": "..." },
    "weeklyInsight": { "horoscope": "...", "theme": "..." },
    "monthlyInsight": { "horoscope": "...", "theme": "..." },
    "yearlyInsight": { "horoscope": "...", "theme": "..." },
    "lifeStrategy": { "universeCorrelation": "...", "kabbalahNumerologyDepth": "...", "goalPlan": "...", "movingForward": "..." },
    "timeline": [{ "year": 2010, "age": 20, "highlight": "...", "houseSignificance": "...", "period": "past" }],
    "nameAnalysis": { "first": { "name": "...", "origin": "...", "meaning": "...", "impact": "..." }, "middle": { "name": "...", "origin": "...", "meaning": "...", "impact": "..." }, "last": { "name": "...", "origin": "...", "meaning": "...", "impact": "..." }, "overallBigPicture": "..." },
    "akashic": { "soulOrigin": "...", "pastLifeThemes": "...", "karmicDebts": "...", "soulGifts": "...", "guardianMessage": "..." },
    "kabbalisticNumerology": {
      "lifePathCorrespondence": { "sephirah": "...", "path": "...", "meaning": "..." },
      "expressionCorrespondence": { "sephirah": "...", "path": "...", "meaning": "..." },
      "soulUrgeCorrespondence": { "sephirah": "...", "path": "...", "meaning": "..." },
      "treeSynthesis": "..."
    },
    "patterns": { "synchronicities": [{ "title": "...", "description": "..." }], "interestingFacts": ["..."], "coreTheme": "..." }
  }
  
  Do not wrap the JSON in Markdown formatting \`\`\`json. Output ONLY the JSON block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planets: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] } },
            nodes: { type: Type.OBJECT, properties: { north: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] }, south: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] } }, required: ["north", "south"] },
            points: { type: Type.OBJECT, properties: { vertex: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] }, partOfFortune: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] }, chiron: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] }, blackMoonLilith: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] } }, required: ["vertex", "partOfFortune", "chiron", "blackMoonLilith"] },
            advancedCycles: { type: Type.OBJECT, properties: { morningEveningStars: { type: Type.OBJECT, properties: { morningStar: { type: Type.STRING }, eveningStar: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["morningStar", "eveningStar", "meaning"] }, arabicLots: { type: Type.OBJECT, properties: { lotOfSpirit: { type: Type.STRING }, lotOfEros: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["lotOfSpirit", "lotOfEros", "meaning"] }, notableAsteroids: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["name", "sign", "meaning"] } }, planetPhases: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, phase: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["name", "phase", "meaning"] } }, soliArcs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["description", "meaning"] } } }, required: ["morningEveningStars", "arabicLots", "notableAsteroids", "planetPhases", "soliArcs"] },
            aspects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet1: { type: Type.STRING }, planet2: { type: Type.STRING }, type: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["planet1", "planet2", "type", "meaning"] } },
            houses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { houseNumber: { type: Type.NUMBER }, realmName: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["houseNumber", "realmName", "description"] } },
            numerology: { type: Type.OBJECT, properties: { lifePath: { type: Type.NUMBER }, expression: { type: Type.NUMBER }, soulUrge: { type: Type.NUMBER } }, required: ["lifePath", "expression", "soulUrge"] },
            gematria: { type: Type.OBJECT, properties: { nameValue: { type: Type.NUMBER }, reduction: { type: Type.NUMBER }, pattern: { type: Type.STRING }, nameSequence: { type: Type.STRING }, dobSequence: { type: Type.STRING }, numberProperties: { type: Type.STRING } }, required: ["nameValue", "reduction", "pattern", "nameSequence", "dobSequence", "numberProperties"] },
            kabbalah: { type: Type.OBJECT, properties: { sephirah: { type: Type.STRING }, path: { type: Type.STRING } }, required: ["sephirah", "path"] },
            torusAnalysis: { type: Type.OBJECT, properties: { bodyAndFlow: { type: Type.STRING }, mindAndSpiritual: { type: Type.STRING }, cosmicAlignment: { type: Type.STRING }, overallAnalogy: { type: Type.STRING } }, required: ["bodyAndFlow", "mindAndSpiritual", "cosmicAlignment", "overallAnalogy"] },
            dailyInsight: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, horoscope: { type: Type.STRING }, affirmation: { type: Type.STRING }, caution: { type: Type.STRING }, keyInterest: { type: Type.STRING }, ageSignificance: { type: Type.STRING }, timeDateCorrelation: { type: Type.STRING } }, required: ["date", "horoscope", "affirmation", "caution", "keyInterest", "ageSignificance", "timeDateCorrelation"] },
            weeklyInsight: { type: Type.OBJECT, properties: { horoscope: { type: Type.STRING }, theme: { type: Type.STRING } }, required: ["horoscope", "theme"] },
            monthlyInsight: { type: Type.OBJECT, properties: { horoscope: { type: Type.STRING }, theme: { type: Type.STRING } }, required: ["horoscope", "theme"] },
            yearlyInsight: { type: Type.OBJECT, properties: { horoscope: { type: Type.STRING }, theme: { type: Type.STRING } }, required: ["horoscope", "theme"] },
            lifeStrategy: { type: Type.OBJECT, properties: { universeCorrelation: { type: Type.STRING }, kabbalahNumerologyDepth: { type: Type.STRING }, goalPlan: { type: Type.STRING }, movingForward: { type: Type.STRING } }, required: ["universeCorrelation", "kabbalahNumerologyDepth", "goalPlan", "movingForward"] },
            timeline: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.NUMBER }, age: { type: Type.NUMBER }, highlight: { type: Type.STRING }, houseSignificance: { type: Type.STRING }, period: { type: Type.STRING } }, required: ["year", "age", "highlight", "houseSignificance", "period"] } },
            nameAnalysis: { type: Type.OBJECT, properties: { first: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, origin: { type: Type.STRING }, meaning: { type: Type.STRING }, impact: { type: Type.STRING } }, required: ["name", "origin", "meaning", "impact"] }, middle: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, origin: { type: Type.STRING }, meaning: { type: Type.STRING }, impact: { type: Type.STRING } }, required: ["name", "origin", "meaning", "impact"] }, last: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, origin: { type: Type.STRING }, meaning: { type: Type.STRING }, impact: { type: Type.STRING } }, required: ["name", "origin", "meaning", "impact"] }, overallBigPicture: { type: Type.STRING } }, required: ["first", "middle", "last", "overallBigPicture"] },
            akashic: { type: Type.OBJECT, properties: { soulOrigin: { type: Type.STRING }, pastLifeThemes: { type: Type.STRING }, karmicDebts: { type: Type.STRING }, soulGifts: { type: Type.STRING }, guardianMessage: { type: Type.STRING } }, required: ["soulOrigin", "pastLifeThemes", "karmicDebts", "soulGifts", "guardianMessage"] },
            kabbalisticNumerology: { type: Type.OBJECT, properties: {
              lifePathCorrespondence: { type: Type.OBJECT, properties: { sephirah: { type: Type.STRING }, path: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["sephirah", "path", "meaning"] },
              expressionCorrespondence: { type: Type.OBJECT, properties: { sephirah: { type: Type.STRING }, path: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["sephirah", "path", "meaning"] },
              soulUrgeCorrespondence: { type: Type.OBJECT, properties: { sephirah: { type: Type.STRING }, path: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["sephirah", "path", "meaning"] },
              treeSynthesis: { type: Type.STRING }
            }, required: ["lifePathCorrespondence", "expressionCorrespondence", "soulUrgeCorrespondence", "treeSynthesis"] },
            patterns: { type: Type.OBJECT, properties: { synchronicities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } }, interestingFacts: { type: Type.ARRAY, items: { type: Type.STRING } }, coreTheme: { type: Type.STRING } }, required: ["synchronicities", "interestingFacts", "coreTheme"] }
          },
          required: ["planets", "nodes", "points", "advancedCycles", "aspects", "houses", "numerology", "gematria", "kabbalah", "torusAnalysis", "dailyInsight", "weeklyInsight", "monthlyInsight", "yearlyInsight", "lifeStrategy", "timeline", "nameAnalysis", "akashic", "patterns"]
        }
      }
    });

    let text = response.text?.trim() || "{}";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end >= start) {
      text = text.substring(start, end + 1);
    }
    const data = JSON.parse(text) as CosmicData;
    return data;
  } catch (error) {
    console.error("Error fetching cosmic reading:", error);
    throw error;
  }
};


export const fetchTimelineDepth = async (
  event: any,
  cosmicData: CosmicData
): Promise<{ detailedAnalysis: string; followUpOptions: string[] }> => {
  const ai = getAI();
  const prompt = `
  You are an expert astrologer, numerologist, and spiritual guide.
  The user is currently reviewing their Cosmic Timeline. 
  Here is the timeline period they selected:
  Period: ${event.period}
  Highlight: ${event.highlight}
  Age: ${event.age} (Year: ${event.year})
  House Significance: ${event.houseSignificance}
  
  Provide a deep, profound analysis of this timeline period in their life. Explain the astrological and numerological currents in motion, what they should focus on, potential challenges, and opportunities for soul growth.
  
  Also, provide EXACTLY 3 follow-up questions or specific subject areas the user can choose to explore further regarding this time period. Ensure these questions are thought-provoking and deep.
  
  Format the output STRICTLY as valid JSON matching this schema:
  {
    "detailedAnalysis": "...",
    "followUpOptions": ["Option 1", "Option 2", "Option 3"]
  }
  
  Do not wrap the JSON in Markdown formatting \`\`\`json. Output ONLY the JSON block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detailedAnalysis: { type: Type.STRING },
            followUpOptions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["detailedAnalysis", "followUpOptions"]
        }
      }
    });

    let text = response.text?.trim() || "{}";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end >= start) {
      text = text.substring(start, end + 1);
    }
    return JSON.parse(text) as { detailedAnalysis: string; followUpOptions: string[] };
  } catch (error) {
    console.error("Error fetching timeline depth:", error);
    throw error;
  }
};

export const fetchTimelineDeepDiveOption = async (
  event: any,
  option: string,
  cosmicData: CosmicData
): Promise<{ detailedAnalysis: string; followUpOptions: string[] }> => {
  const ai = getAI();
  const prompt = `
  You are an expert astrologer, numerologist, and spiritual guide.
  The user is reviewing their Cosmic Timeline, specifically the period at age ${event.age} (Year: ${event.year}) highlighted by: "${event.highlight}".
  
  They selected the following specific topic to dive deeper into:
  "${option}"
  
  Provide a highly specialized, profound analysis focusing ONLY on this requested topic related to this time period in their life.
  
  Provide EXACTLY 3 NEW follow-up questions or sub-topics they can choose to explore further.
  
  Format the output STRICTLY as valid JSON matching this schema:
  {
    "detailedAnalysis": "...",
    "followUpOptions": ["Option 1", "Option 2", "Option 3"]
  }

  Do not wrap the JSON in Markdown formatting \`\`\`json. Output ONLY the JSON block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detailedAnalysis: { type: Type.STRING },
            followUpOptions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["detailedAnalysis", "followUpOptions"]
        }
      }
    });

    let text = response.text?.trim() || "{}";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end >= start) {
      text = text.substring(start, end + 1);
    }
    return JSON.parse(text) as { detailedAnalysis: string; followUpOptions: string[] };
  } catch (error) {
    console.error("Error fetching timeline specific deep dive:", error);
    throw error;
  }
};

export const fetchGeneralDeepDive = async (
  topicTitle: string,
  topicContent: string,
  cosmicData: CosmicData
): Promise<{ detailedAnalysis: string; followUpOptions: string[] }> => {
  const ai = getAI();
  const prompt = `
  You are an expert, multi-disciplinary mystic researcher. You specialize in the intersection of Astrology, Numerology, Kabbalah, and Gematria.
  
  The user wants a Deep Dive exploration into a specific part of their Cosmic Profile.
  
  Topic: ${topicTitle}
  Current Data: "${topicContent}"
  
  Using their full Cosmic Profile as context, provide a profound, transformative, and highly detailed research analysis about this specific topic. 
  Explain the deeper spiritual meanings, potential life impacts, and how this connects to their overall soul purpose. 
  Go far beyond the surface level.
  
  Provide exactly 3 follow-up research questions or specific esoteric branches they can explore next.
  
  Format the output STRICTLY as valid JSON matching this schema:
  {
    "detailedAnalysis": "...",
    "followUpOptions": ["Option 1", "Option 2", "Option 3"]
  }
  
  Do not wrap the JSON in Markdown formatting. Output ONLY the JSON block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detailedAnalysis: { type: Type.STRING },
            followUpOptions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["detailedAnalysis", "followUpOptions"]
        }
      }
    });

    let text = response.text?.trim() || "{}";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end >= start) {
      text = text.substring(start, end + 1);
    }
    return JSON.parse(text) as { detailedAnalysis: string; followUpOptions: string[] };
  } catch (error) {
    console.error("Error fetching general deep dive:", error);
    throw error;
  }
};
