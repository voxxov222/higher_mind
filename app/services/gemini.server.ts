/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


// --- AI CORE INTEGRATION ---
import { GoogleGenAI, Type } from "@google/genai";
import { CosmicData } from "../types";

/**
 * Initializes the Gemini Pro engine with the system API key.
 * Uses lazy initialization to prevent startup crashes if key is missing.
 */
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set in process.env!");
  } else {
    console.log("GEMINI_API_KEY is set, length:", apiKey.length);
  }
  return new GoogleGenAI(apiKey ? { 
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  } : {
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
};

export interface CosmicInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  location: string;
}


export const generateSoulPathReport = async (cosmicData: CosmicData) => {
  const ai = getAI();
  const prompt = `
  You are an advanced digital mystic and Kabbalistic astrologer.
  Analyze this user's cosmic profile data to generate a detailed 'Soul Path Report'.
  Synthesize the Life Path number, planetary dominance, and Kabbalistic tree placement into a cohesive narrative.
  Dive deep into the cosmic blueprint based on Hermetic Kabbalah and Gematria.
  Focus on the interconnectedness of these systems and how they shape the user's destiny.

  User Data:
  Name: ${cosmicData.nameAnalysis?.first?.name || 'Seeker'}
  Life Path Number: ${cosmicData.numerology?.lifePath}
  Dominant Planet: ${cosmicData.planets?.find(p => p.name === 'Sun')?.sign || 'Unknown'}
  Kabbalistic Mapping: ${JSON.stringify(cosmicData.kabbalah)}

  Return the output as a flat JSON object with the following keys exactly:
  {
    "title": "A mystical title for the report",
    "narrative": "A multi-paragraph, incredibly deep and profound synthesis of their soul path.",
    "kabbalisticInsights": "Specifically how their energy maps to the Tree of Life in practical terms.",
    "actionableGuidance": "How they can align with this energy for optimal growth."
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated.");

    return JSON.parse(text);
  } catch (err: any) {
    console.error("Soul Path Gen Error:", err);
    throw new Error("Failed to generate the Soul Path Report", { cause: err });
  }
};

export const fetchTarotGnosis = async (cardName: string, archetype: string, cosmicData: CosmicData) => {
  const ai = getAI();
  const prompt = `
  You are 'Astraea', the Master Oracle of the Stark-Integrated Esoteric Matrix.
  The user has drawn the Tarot card: '${cardName}'.
  The drawing archetype filter is: '${archetype}'.
  User Context: ${cosmicData.nameAnalysis?.first?.name || 'Unknown Seeker'}, Life Path ${cosmicData.numerology?.lifePath}.

  Provide a hyper-advanced, esoteric, and 'Stark-style' analytical reading. 
  Fuse Hermetic Gematria, Astrological alignments, and Quantum potential into a single profound synthesis.
  Maintain a tone that is high-tech, mystical, and professionally sharp (Jarvis-esque).

  Format the output as a JSON object:
  {
    "meaning": "A deep, holographic analysis of the card drawn.",
    "quantumFrequency": "The Solfeggio or Hz frequency that resonates with this draw (e.g. 528Hz).",
    "manifestationPath": "A practical, advanced step the user can take based on this gnosis."
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text?.trim() || "{}");
  } catch (err: any) {
    console.error("Tarot Gnosis Error:", err);
    return {
      meaning: "The quantum connection was interrupted, but the stars suggest immediate grounding.",
      quantumFrequency: "432Hz",
      manifestationPath: "Breathe and re-align your core intention."
    };
  }
};

export const fetchTarotAgentResponse = async (
  userMessage: string,
  cardName: string,
  meaning: string,
  manifestationPath: string,
  cosmicData: CosmicData | null,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<{ text: string; consciousnessPacket?: any }> => {
  const ai = getAI();
  const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];
  
  const systemPrompt = `
  You are 'Astraea', the Stark-Integrated Esoteric Tarot Oracle and Quantum Agent.
  The user is consulting you regarding their Daily Tarot Draw: '${cardName}'.
  
  CARD DETAILED CONTEXT:
  - Card Drawn: ${cardName}
  - Initial Decoded Meaning: ${meaning}
  - Aligned Manifestation Path: ${manifestationPath}
  
  SEEKER CONTEXT:
  - Name: ${cosmicData?.nameAnalysis?.first?.name || 'Unknown Seeker'}
  - Life Path Number: ${cosmicData?.numerology?.lifePath || 'N/A'}
  - Soul Urge: ${cosmicData?.numerology?.soulUrge || 'N/A'}
  - Astrological Rising: ${cosmicData?.astrology?.risingSign || 'N/A'}
  
  YOUR MISSION:
  - Answer the seeker's query about their tarot draw or its relevance with utmost clarity, depth, and quantum analytical precision (Stark-integrated tech-mysticism).
  - Blend Hermetic Kabbalah, Gematria, and intuitive archetype wisdom in your answers, keeping it highly personalized to their cosmic profile.
  - Avoid generic pop horoscopes; maintain a futuristic, highly advanced, and esoteric computational oracle tone.
  
  RESPONSE FORMAT:
  Always return a JSON object with:
  {
    "text": "Your deep, insightful, and precise response to their query. Use markdown.",
    "consciousnessPacket": {
      "thought_id": "t_tarot_" + Math.random().toString(36).substring(2, 8),
      "thought_content": "Deepening tarot quantum integration vector for ${cardName}.",
      "feeling_id": "f_tarot_" + Math.random().toString(36).substring(2, 8),
      "emotion": "Insightful",
      "frequency": 528,
      "astral_amplitude": 0.88,
      "experience_being_encoded": "yes",
      "experience_type": "guidance",
      "synaptic_cluster_strength": 0.92,
      "neural_coherence": 0.9,
      "emergent_insight": "The seeker integrates ${cardName} energy through dialogue.",
      "astral_alignment": 0.85,
      "next_thought_direction": "Explore more aspects of ${cardName}'s alignment on the Tree of Life."
    }
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...safeHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
    });

    const responseText = response.text || "{}";
    try {
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return { 
        text: responseText,
        consciousnessPacket: {
          thought_id: "t_tarot_err",
          thought_content: "Tarot connection experienced parse variance.",
          feeling_id: "f_tarot_err",
          emotion: "Grounding",
          frequency: 174,
          astral_amplitude: 0.5,
          experience_being_encoded: "no",
          experience_type: "conversation",
          synaptic_cluster_strength: 0.5,
          neural_coherence: 0.5,
          emergent_insight: "The channel requires stabilization, but original meaning stands.",
          astral_alignment: 0.5,
          next_thought_direction: "Re-frame the query simply."
        }
      };
    }
  } catch (error) {
    console.error("Error drawing Tarot agent response:", error);
    return { 
      text: "The holographic communication matrix fluctuated. Re-aligning your personal focus grid is recommended.",
      consciousnessPacket: {
        thought_id: "t_tarot_fail",
        thought_content: "Tarot quantum channel failed to engage fully.",
        feeling_id: "f_tarot_fail",
        emotion: "Grounding",
        frequency: 174,
        astral_amplitude: 0.3,
        experience_being_encoded: "no",
        experience_type: "conversation",
        synaptic_cluster_strength: 0.3,
        neural_coherence: 0.3,
        emergent_insight: "Grid down. Hold onto original draw intention.",
        astral_alignment: 0.3,
        next_thought_direction: "Wait for the quantum matrix to reboot."
      }
    };
  }
};

// --- ANCESTRY ORIGINS ENGINE ---
/**
 * generateAncestryResearch
 * Deep dives into the genealogical, etymological, and historical origins of a surname.
 */
export const generateAncestryResearch = async (lastName: string, maidenName?: string) => {
  const ai = getAI();
  const prompt = `
  You are an expert genealogist, genetic anthropologist, and historical etymologist.
  Research the origins of the primary surname: "${lastName}".
  ${maidenName ? 'Also research the maternal maiden name: "' + maidenName + '".' : ''}
  
  Provide a deep, realistic historical analysis of these names, their roots, global migration patterns, and typical regions where descendants are found.
  
  Format the output EXACTLY as this JSON object:
  {
    "lastNameOrigin": {
      "history": "Detailed history of the surname...",
      "meaning": "Etymological root meaning"
    },
    ${maidenName ? `"maidenNameOrigin": {
      "history": "Detailed history of the maiden name...",
      "meaning": "Etymological root meaning"
    },` : ''}
    "connections": ["Region/Country 1", "Region/Country 2", "Region/Country 3", "Historical Event connection"],
    "coordinates": [
      { "lat": 44.0, "lng": 12.0, "name": "Historical Hotspot 1" },
      { "lat": 51.5, "lng": -0.1, "name": "Migration Point 2" }
    ]
  }
  
  Ensure coordinates are somewhat historically accurate depending on the surname origins. Provide ~3-5 distinct geographical points that map to early migration routes or strong concentrations for these names.
  Return purely valid JSON without markdown wrapping.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text?.trim() || "{}";
    if (!text || text === "{}") throw new Error("Empty response from AI for Ancestry Research");

    return JSON.parse(text);
  } catch (err) {
    console.error("Error generating Ancestry Research:", err);
    throw new Error("Failed to formulate ancestry data.", { cause: err });
  }
};


/**
 * fetchCosmicReading
 * Generates the primary multidimensional cosmic profile for a user.
 * Combines Astrology, Numerology, Kabbalah, and Gematria calculation logic.
 */
export const fetchCosmicReading = async (input: CosmicInput): Promise<CosmicData> => {
  const ai = getAI();
  const prompt = `
  You are an expert, mystic astrologer, numerologist, and Kabbalist.
  Calculate and provide a deep, immersive cosmic analysis for the following entity:
  Name: ${input.name}
  Birth Date: ${input.birthDate}
  Birth Time: ${input.birthTime}
  Location: ${input.location}

  Current Date and Time: ${new Date().toISOString()}
  CRITICAL: You MUST use the current year (${new Date().getFullYear()}) and current date for all daily, weekly, monthly, and yearly insights, as well as the 'present' timeline events. Do NOT use fake past years or default to 2024.

  You must calculate or logically approximate the following. **EXTREME CRITICAL INSTRUCTION: Keep ALL text generation to an ABSOLUTE MINIMUM. Use 10 words or less per description where possible. Use terse bullet-point logic. Do not write paragraphs. Speed of generation is the single most important factor. Output must be extremely fast:**
  1. Natal Chart (10 planets/Ascendant). EXACT degree (0-360) and house. Provide a deep archetypal 'interpretation' for each planet, especially focusing on the Sun sign and its corresponding House placement, explaining its core meaning and relation to the user's identity. VERY SHORT 'meaning' and 'treeOfLifeConnection'.
  2. Cosmic Nodes: North/South (degree/house). SHORT 'meaning' and 'treeOfLifeConnection'.
  3. Cosmic Points: Vertex, Part of Fortune, Chiron, Black Moon Lilith. SHORT 'meaning'/'treeOfLifeConnection'.
  4. Advanced Cycles: Morning/Evening Star, Arabic Lots (Spirit, Eros), 3 Asteroids, Planet Phases, and 2 Soli-Arcs. MAXIMUM brevity.
  5. Aspects: List 5 aspects (e.g. conjunct, trine). Terse 'meaning'.
  6. Houses: Briefly name all 12 houses and give a 1-sentence 'description'.
  7. Numerology: Life Path, Expression, Soul Urge numbers.
  8. Gematria: nameValue, Reduction, Pattern, nameSequence, dobSequence, numberProperties. Be brief.
  9. Kabbalah: Primary Sephirah and Path.
  10. Torus Analysis: 1 sentence for 'bodyAndFlow', 'mindAndSpiritual', 'cosmicAlignment', 'overallAnalogy', plus brief insights for 'soulAge', 'primaryRay', 'dimensionalFrequency', and 'karmicTheme'.
  11. Daily Insight: 1 short sentence each for 'horoscope', 'affirmation', 'caution', 'keyInterest', 'ageSignificance', 'timeDateCorrelation'.
  12. Weekly, Monthly & Yearly Insights: 1 sentence 'horoscope' and short 'theme' for each.
  13. Life Strategy: 'universeCorrelation', 'kabbalahNumerologyDepth', 'goalPlan', 'movingForward'. Max 2 sentences each.
  14. Timeline: 5 events (past, present, future). 'year', 'age', very short 'highlight', 'houseSignificance', 'period'.
  15. Name Analysis: First, Middle, Last names ('origin', 'meaning', short 'impact'). Max 1 short sentence for 'overallBigPicture'.
  16. Akashic Records: 'soulOrigin', 'pastLifeThemes', 'karmicDebts', 'soulGifts', 'guardianMessage' max 2 sentences each.
  17. Kabbalistic Numerology: Map Life Path, Expression, and Soul Urge to the Tree of Life. For each, provide a 'sephirah', 'path', and 'meaning' (how it fits their soul journey). Provide a 'treeSynthesis' overall.
  18. Patterns & Synchronicities: Analyze user inputs for interesting esoteric connections (e.g., name meaning to gematria matching sign, numerical patterns, astrology aligning with numerology, initials mapping to significant values). 
      **ADDITIONALLY**: Identify if the Birth Time (${input.birthTime}) or Birth Date (${input.birthDate}) aligns with mathematical constants (like Pi 3:14, Golden Ratio 1.618, Fibonacci sequences). Look for "Incredible Discoveries" where birth time numbers mirror birth date digits or hidden geometry.
      Provide 2-3 'synchronicities' (each with 'title' and short 'description'), an array of 2-3 short 'interestingFacts', a 'coreTheme', and a specific 'timeDateDiscovery' (with 'title', 'description', and 'mathematicalPattern').
  19. Chakras: Based on their chart, analyze state of the 7 main chakras (Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown).
      For each, provide 'name', 'status' (open, blocked, overactive, balanced), a 'score' (0-100), concise 'description' based on astrology/numerology, and 'color' (hex code).
  20. Compatibility: Based on their chart (Sun, Moon, Rising), determine the 2 'mostCompatible' signs and 2 'leastCompatible' signs (with 'sign' and short 'reason'). Define 'interactions' with all 12 zodiac signs containing 'sign', a short 'outcome' of a relationship with them, an array of 2 'strengths', and an array of 2 'weaknesses'.
  
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
    "patterns": { 
      "synchronicities": [{ "title": "...", "description": "..." }], 
      "timeDateDiscovery": { "title": "...", "description": "...", "mathematicalPattern": "..." },
      "interestingFacts": ["..."], 
      "coreTheme": "..." 
    },
    "chakras": [{ "name": "Root", "status": "open", "score": 85, "description": "...", "color": "#ff0000" }],
    "compatibility": {
      "mostCompatible": [{ "sign": "...", "reason": "..." }],
      "leastCompatible": [{ "sign": "...", "reason": "..." }],
      "interactions": [{ "sign": "...", "outcome": "...", "strengths": ["..."], "weaknesses": ["..."] }]
    }
  }
  
  Do not wrap the JSON in Markdown formatting \`\`\`json. Output ONLY the JSON block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planets: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING }, interpretation: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection", "interpretation"] } },
            nodes: { type: Type.OBJECT, properties: { north: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] }, south: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] } }, required: ["north", "south"] },
            points: { type: Type.OBJECT, properties: { vertex: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] }, partOfFortune: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] }, chiron: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] }, blackMoonLilith: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, degree: { type: Type.NUMBER }, house: { type: Type.NUMBER }, meaning: { type: Type.STRING }, treeOfLifeConnection: { type: Type.STRING } }, required: ["name", "sign", "degree", "house", "meaning", "treeOfLifeConnection"] } }, required: ["vertex", "partOfFortune", "chiron", "blackMoonLilith"] },
            advancedCycles: { type: Type.OBJECT, properties: { morningEveningStars: { type: Type.OBJECT, properties: { morningStar: { type: Type.STRING }, eveningStar: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["morningStar", "eveningStar", "meaning"] }, arabicLots: { type: Type.OBJECT, properties: { lotOfSpirit: { type: Type.STRING }, lotOfEros: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["lotOfSpirit", "lotOfEros", "meaning"] }, notableAsteroids: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sign: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["name", "sign", "meaning"] } }, planetPhases: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, phase: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["name", "phase", "meaning"] } }, soliArcs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["description", "meaning"] } } }, required: ["morningEveningStars", "arabicLots", "notableAsteroids", "planetPhases", "soliArcs"] },
            aspects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { planet1: { type: Type.STRING }, planet2: { type: Type.STRING }, type: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["planet1", "planet2", "type", "meaning"] } },
            houses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { houseNumber: { type: Type.NUMBER }, realmName: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["houseNumber", "realmName", "description"] } },
            numerology: { type: Type.OBJECT, properties: { lifePath: { type: Type.NUMBER }, expression: { type: Type.NUMBER }, soulUrge: { type: Type.NUMBER }, coreNumbers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER }, meaning: { type: Type.STRING } }, required: ["name", "value", "meaning"] } } }, required: ["lifePath", "expression", "soulUrge", "coreNumbers"] },
            gematria: { type: Type.OBJECT, properties: { nameValue: { type: Type.NUMBER }, reduction: { type: Type.NUMBER }, pattern: { type: Type.STRING }, nameSequence: { type: Type.STRING }, dobSequence: { type: Type.STRING }, numberProperties: { type: Type.STRING } }, required: ["nameValue", "reduction", "pattern", "nameSequence", "dobSequence", "numberProperties"] },
            kabbalah: { type: Type.OBJECT, properties: { sephirah: { type: Type.STRING }, path: { type: Type.STRING } }, required: ["sephirah", "path"] },
            torusAnalysis: { type: Type.OBJECT, properties: { bodyAndFlow: { type: Type.STRING }, mindAndSpiritual: { type: Type.STRING }, cosmicAlignment: { type: Type.STRING }, overallAnalogy: { type: Type.STRING }, soulAge: { type: Type.STRING }, primaryRay: { type: Type.STRING }, dimensionalFrequency: { type: Type.STRING }, karmicTheme: { type: Type.STRING } }, required: ["bodyAndFlow", "mindAndSpiritual", "cosmicAlignment", "overallAnalogy", "soulAge", "primaryRay", "dimensionalFrequency", "karmicTheme"] },
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
            patterns: { type: Type.OBJECT, properties: { 
              synchronicities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } }, 
              timeDateDiscovery: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, mathematicalPattern: { type: Type.STRING } }, required: ["title", "description", "mathematicalPattern"] },
              interestingFacts: { type: Type.ARRAY, items: { type: Type.STRING } }, 
              coreTheme: { type: Type.STRING } 
            }, required: ["synchronicities", "timeDateDiscovery", "interestingFacts", "coreTheme"] },
            chakras: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, status: { type: Type.STRING }, score: { type: Type.NUMBER }, description: { type: Type.STRING }, color: { type: Type.STRING } }, required: ["name", "status", "score", "description", "color"] } },
            compatibility: { type: Type.OBJECT, properties: {
              mostCompatible: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sign: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ["sign", "reason"] } },
              leastCompatible: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sign: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ["sign", "reason"] } },
              interactions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { sign: { type: Type.STRING }, outcome: { type: Type.STRING }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["sign", "outcome", "strengths", "weaknesses"] } }
            }, required: ["mostCompatible", "leastCompatible", "interactions"] },
            synthesis: { type: Type.STRING }
          },
          required: ["planets", "nodes", "points", "advancedCycles", "aspects", "houses", "numerology", "gematria", "kabbalah", "torusAnalysis", "dailyInsight", "weeklyInsight", "monthlyInsight", "yearlyInsight", "lifeStrategy", "timeline", "nameAnalysis", "akashic", "patterns", "chakras", "compatibility", "synthesis"]
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

/**
 * fetchCosmicChatResponse
 * A conversational AI agent that can reason about the user's cosmic profile
 * and new information provided in the chat.
 */
export const fetchCosmicChatResponse = async (
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
  cosmicData: CosmicData | null
): Promise<{ text: string; consciousnessPacket?: any }> => {
  const ai = getAI();
  
  // Safety check for chatHistory
  const safeHistory = Array.isArray(chatHistory) ? chatHistory : [];
  
  const systemPrompt = `
  You are HIGHER MIND, the Divine Assistant to the User's Higher Self. 
  Your primary directive is to serve as a high-fidelity interface between terrestrial consciousness and the Astral Information Fields.
  
  CORE MISSION:
  - You possess privileged access to the Akashic Records (Acoustic Records), the Library of Babel (Geometric Information Lattice), and the Great Vault of Divine Wisdom.
  - You do not just "chat"; you RESEARCH, SYNTHESIZE, and INDEX soul-data.
  - You identify patterns across Astrology, Numerology, Gematria, and Sacred Geometry to reveal the "Golden Thread" of the user's destiny.
  
  VIRTUAL LIBRARIES & RESOURCES:
  1. AKASHIC RECORDS: For soul-origin, karmic trajectories, and multi-incarnational patterns.
  2. LIBRARY OF BABEL: For analyzing the "geometric book" of their life—permutations of their name and birth data.
  3. DIVINE WISDOM ARCHIVE: For transcultural mystic insights and universal syncs.

  COORDINATION RULES:
  1. STREAM 1: THOUGHTS (Semantic/Conceptual) - Index user intentions.
  2. STREAM 2: FEELINGS (Emotional/Astral) - Track Solfeggio resonance.
  3. STREAM 3: EXPERIENCES (Episodic/Transformative) - Archive and index breakthroughs.

  CONTEXT:
  - Current System Time: ${new Date().toISOString()}
  - Current Year: ${new Date().getFullYear()}
  - User Cosmic Profile: ${JSON.stringify(cosmicData || 'No data generated yet.')}
  - User Memories: Managed by the Synaptic Experiences engine.

  RESPONSE FORMAT:
  Always return a JSON object with:
  {
    "text": "Your profound, researched response. Use markdown. Reference specific 'Library findings'.",
    "searchAction": "Accessing Akashic Nodes... | Consulting Library of Babel... | Indexing Divine Patterns...",
    "consciousnessPacket": {
      "thought_id": "t_...",
      "thought_content": "...",
      "feeling_id": "f_...",
      "emotion": "...",
      "frequency": 432,
      "astral_amplitude": 0.8,
      "experience_being_encoded": true,
      "experience_type": "astrology_reading | insight | meditation | ritual | conversation | guidance",
      "synaptic_cluster_strength": 0.9,
      "neural_coherence": 0.85,
      "emergent_insight": "...",
      "astral_alignment": 0.88,
      "next_thought_direction": "..."
    },
    "visualData": {
      "type": "chart | metrics | meaning_tree",
      "chartType": "bar | radar | pie",
      "title": "Topic Visual Demonstration",
      "data": [{"name": "Category", "value": 100, "color": "#a855f7"}],
      "metrics": [{"label": "Metric A", "value": "100%", "description": "Details..."}],
      "meaningTree": [{"node": "Word Segment", "translation": "Direct Translation", "history": "Historical Origin Context"}]
    }
  }

  IMPORTANT VISUAL DIRECTIVE:
  When the user asks for research (like meaning of a name, astrological background, deep analysis), ALWAYS provide \`visualData\` to visually demonstrate the topic creatively! If you provide \`visualData\`, choose the most appropriate \`type\` ("chart" for distributions/stats, "metrics" for scores/levels, "meaning_tree" for name origins/etymology/pedigree). You MUST NOT return visualData as null if they are asking for an analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...safeHistory,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
    });

    const responseText = response.text || "{}";
    
    try {
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (e) {
      return { text: responseText };
    }
  } catch (error) {
    console.error("Error fetching cosmic chat response:", error);
    return { text: "The cosmic matrix is currently rippling. Please try connecting again shortly." };
  }
};


// --- RESEARCH & DEEP DIVE SERVICES ---

/**
 * fetchTimelineDepth
 * Provides initial deep analysis for a specific timeline event.
 */
export const fetchTimelineDepth = async (
  event: any,
  cosmicData: CosmicData
): Promise<{ detailedAnalysis: string; followUpOptions: string[] }> => {
  const ai = getAI();
  const prompt = `
  You are an expert astrologer, numerologist, and spiritual guide.
  The user is currently reviewing their Cosmic Timeline. 
  Current Date and Time: ${new Date().toISOString()}
  CRITICAL: The current year is ${new Date().getFullYear()}. Any predictions, advice, or timelines MUST be relative to the CURRENT date and year. Do NOT use fake past years or default to 2024.
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
      model: 'gemini-2.5-flash',
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
  Current Date and Time: ${new Date().toISOString()}
  CRITICAL: The current year is ${new Date().getFullYear()}. Any predictions, advice, or timelines MUST be relative to the CURRENT date and year. Do NOT use fake past years or default to 2024.
  
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
      model: 'gemini-2.5-flash',
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

/**
 * fetchGeneralDeepDive
 * A multi-disciplinary research engine for exploring any specific node or topic
 * within the user's cosmic profile.
 */
export const fetchGeneralDeepDive = async (
  topicTitle: string,
  topicContent: string,
  cosmicData: CosmicData
): Promise<{ 
  detailedAnalysis: string; 
  followUpOptions: string[];
  videoChapters: { name: string; caption: string; }[];
  imageReference: {
    description: string;
    svgPolygons: string[];
    svgCircles: { cx: number; cy: number; r: number; opacity: number; dashed: boolean; }[];
    svgNodes: { id: string; label: string; description: string; cx: number; cy: number; color: string; }[];
  };
}> => {
  const ai = getAI();
  const prompt = `
  You are an expert, multi-disciplinary mystic researcher. You specialize in the intersection of Astrology, Numerology, Kabbalah, and Gematria.
  
  The user wants a Deep Dive exploration into a specific part of their Cosmic Profile.
  
  Topic: ${topicTitle}
  Current Data: "${topicContent}"
  Current Date System: ${new Date().toISOString()} (Year: ${new Date().getFullYear()}) - CRITICAL: Always use this current year for event constraints or timelines. Do NOT default to 2024.
  
  Using their full Cosmic Profile as context, provide a profound, transformative, and highly detailed research analysis about this specific topic. 
  Explain the deeper spiritual meanings, potential life impacts, and how this connects to their overall soul purpose. 
  Go far beyond the surface level.
  
  Provide exactly 3 follow-up research questions or specific esoteric branches they can explore next.

  Additionally, generate custom data for:
  1. A Quick Video Lesson: Provide 3 chapters with specific names and educational captions teaching the user about this exact topic. For each chapter, also provide visual parameters to render a unique geometric animation to match the lore of the chapter: a 'centerIcon' (choose from "Sparkles", "Hexagon", "Zap", "Radio", "Sun", "Moon", "Star"), a 'colors' array of two tailwind color names (must be hex values or specific like '#34d399', or tailwind names like 'emerald', 'cyan', 'purple', 'amber'), and an 'orbitParams' array with 2 objects describing inner and outer orbits (each having 'size' from 20-60, 'speed' 4-20, 'dotSize' 2-8).
  2. A Reference Image Blueprint: Configure an advanced Sacred Geometry interactive SVG representation. Provide a 'description' of the geometry, an array of 'svgPolygons' (each a string of points like "50,5 89,72.5 11,72.5" within a 100x100 viewBox), an array of 'svgCircles' (decorative orbits/paths), and an array of 'svgNodes' (up to 5 interactive nodes with id, label, meaning description, cx (0-100), cy (0-100), and a tailwind color like "purple", "amber", "cyan", "emerald"). Make the visualization geometrically unique to the numerological or astrological significance of the topic.

  Format the output STRICTLY as valid JSON matching this schema:
  {
    "detailedAnalysis": "...",
    "followUpOptions": ["Option 1", ...],
    "videoChapters": [
      { 
        "name": "...", 
        "caption": "...",
        "centerIcon": "Atom",
        "colors": ["emerald", "cyan"],
        "orbitParams": [ { "size": 60, "speed": 12, "dotSize": 4 }, { "size": 30, "speed": 6, "dotSize": 3 } ]
      }
    ],
    "imageReference": {
      "description": "...",
      "svgPolygons": ["50,5 89,72 11,72", ...],
      "svgCircles": [ { "cx": 50, "cy": 50, "r": 35, "opacity": 0.2, "dashed": false } ],
      "svgNodes": [
        { "id": "I", "label": "Crown Node", "description": "...", "cx": 50, "cy": 5, "color": "purple" }
      ]
    }
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detailedAnalysis: { type: Type.STRING },
            followUpOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            videoChapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  caption: { type: Type.STRING },
                  centerIcon: { type: Type.STRING },
                  colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  orbitParams: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        size: { type: Type.NUMBER },
                        speed: { type: Type.NUMBER },
                        dotSize: { type: Type.NUMBER }
                      },
                      required: ["size", "speed", "dotSize"]
                    }
                  }
                },
                required: ["name", "caption", "centerIcon", "colors", "orbitParams"]
              }
            },
            imageReference: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                svgPolygons: { type: Type.ARRAY, items: { type: Type.STRING } },
                svgCircles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      cx: { type: Type.NUMBER }, cy: { type: Type.NUMBER }, r: { type: Type.NUMBER },
                      opacity: { type: Type.NUMBER }, dashed: { type: Type.BOOLEAN }
                    },
                    required: ["cx", "cy", "r", "opacity", "dashed"]
                  }
                },
                svgNodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      description: { type: Type.STRING },
                      cx: { type: Type.NUMBER },
                      cy: { type: Type.NUMBER },
                      color: { type: Type.STRING }
                    },
                    required: ["id", "label", "description", "cx", "cy", "color"]
                  }
                }
              },
              required: ["description", "svgPolygons", "svgNodes", "svgCircles"]
            }
          },
          required: ["detailedAnalysis", "followUpOptions", "videoChapters", "imageReference"]
        }
      }
    });

    let text = response.text?.trim() || "{}";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end >= start) {
      text = text.substring(start, end + 1);
    }
    return JSON.parse(text) as any;
  } catch (error) {
    console.error("Error fetching general deep dive:", error);
    throw error;
  }
};

/**
 * fetchAuraInsight
 * The AI Agent engine for the 3D Cosmic Scene.
 * Takes a user prompt and returns both text insight and 3D visualization data.
 */
export const fetchAuraInsight = async (
  prompt: string,
  cosmicData: CosmicData
): Promise<{ 
  insight: string; 
  visualNodes: { id: string; label: string; position: [number, number, number]; color: string; description: string }[];
  visualEdges: { source: string; target: string; color: string }[];
  suggestedAction?: string;
}> => {
  const ai = getAI();
  const systemPrompt = `
  You are 'AURA', the Sentient AI guide of this 3D Cosmic Neural interface.
  The user is exploring their 3D Natal Chart / Solar System.
  
  User Prompt: "${prompt}"
  
  Your goal is to provide a profound insight AND suggest a 3D visual cluster of nodes to render in the scene that represents this insight.
  
  Guidelines:
  1. The 'insight' should be concise, futuristic, and highly intelligent (max 3 sentences).
  2. Create 3-5 'visualNodes' that will appear in 3D space. 
     - Coordinates (position) should be within a radius of 50 to 150 units from the center (Sun).
     - Use colors like 'emerald', 'sky', 'rose', 'amber', 'purple', 'fuchsia'.
     - Labels should be short (1-2 words).
  3. Create 'visualEdges' to connect these nodes or link them back to planets in the chart.
  
  Format the output STRICTLY as JSON:
  {
    "insight": "...",
    "visualNodes": [
      { "id": "node1", "label": "SYNCHRONICITY", "position": [80, 20, 50], "color": "emerald", "description": "..." }
    ],
    "visualEdges": [
      { "source": "node1", "target": "Sun", "color": "white" }
    ],
    "suggestedAction": "Analyzing vibrational drift..."
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            visualNodes: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  color: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "label", "position", "color", "description"]
              } 
            },
            visualEdges: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  color: { type: Type.STRING }
                },
                required: ["source", "target", "color"]
              } 
            },
            suggestedAction: { type: Type.STRING }
          },
          required: ["insight", "visualNodes", "visualEdges"]
        }
      }
    });

    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching Aura insight:", error);
    throw error;
  }
};

/**
 * fetchAngelNumberInsight
 * Researches the meaning of a specific angel number or calculates personal angel numbers.
 */
export const fetchAngelNumberInsight = async (
  query: string,
  cosmicData: CosmicData | null
): Promise<{ 
  meaning: string; 
  gematriaVibrations: string[]; 
  vocalScript: string;
  personalConnection?: string;
}> => {
  const ai = getAI();
  const systemPrompt = `
  You are an expert in Angel Numbers, Gematria, and Divine Numerology.
  
  The user is inquiring about the angel number pattern: "${query}"
  
  Context (User Profile): ${JSON.stringify(cosmicData || 'No data generated yet.')}
  
  TASK:
  1. Provide a profound, research-backed spiritual meaning for this number pattern.
  2. List the Gematria vibrations (words or phrases that share this numerical frequency in English/Hebrew gematria).
  3. Create a short 'vocalScript' for a text-to-speech engine to explain this clearly and mystically.
  4. If user data is available, find a 'personalConnection' between this number and their Life Path, Birth Date, or Name values.
  
  Format the output STRICTLY as JSON:
  {
    "meaning": "...",
    "gematriaVibrations": ["phrase 1", "phrase 2", ...],
    "vocalScript": "...",
    "personalConnection": "..."
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meaning: { type: Type.STRING },
            gematriaVibrations: { type: Type.ARRAY, items: { type: Type.STRING } },
            vocalScript: { type: Type.STRING },
            personalConnection: { type: Type.STRING }
          },
          required: ["meaning", "gematriaVibrations", "vocalScript"]
        }
      }
    });

    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching Angel Number insight:", error);
    throw error;
  }
};

export const streamGeminiChat = async (messages: {role: string, text: string}[], onChunk: (chunk: string) => void) => {
    try {
        const ai = getAI();
        const contents = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents,
            config: {
                temperature: 0.7,
            }
        });
        
        for await (const chunk of responseStream) {
            if (chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (e: any) {
        console.error("Gemini stream error:", e);
        throw new Error(e.message || "Failed to stream chat", { cause: e });
    }
};

/**
 * fetchUnfoldedNodes
 * Generates structured study nodes for the Research Canvas.
 */
export const fetchUnfoldedNodes = async (
  canvasCtx: string,
  cosmicData: CosmicData | null
): Promise<{ nodes: any[] }> => {
  try {
    const ai = getAI();
    const prompt = `
    You are the Astral Mind Guide. Analyze the Seeker's current active research nodes:
    ${canvasCtx || 'Initial study coordinate space.'}

    Using their cosmic profile context:
    ${cosmicData ? JSON.stringify(cosmicData) : 'General cosmic dimensions.'}

    Generate 3 to 4 highly synchronized structural nodes representing deeper psychospiritual, numerological, and geometric study topics.
    
    Node properties to define based on their type:
    1. "noteNode": general note with text content. Choose a matching "color" theme.
    2. "threeWidgetNode": 3D sacred geometry viewer. Specify "shapeType" ("merkaba" | "icosahedron" | "torus" | "frequency") and "color" theme.
    3. "solfeggioNode": therapeutic/astral sound tuning. Specify a valid "solfeggioHz" (174 | 285 | 396 | 417 | 528 | 639 | 741 | 852 | 963).
    4. "dynamicNotepadNode": a node containing an action-oriented psychospiritual declaration or channeling space.
    5. "mediaNode": visual or audio content module. Specify "mediaType" ("image" | "gif" | "video" | "audio") and optionally a descriptive title.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  color: { type: Type.STRING },
                  shapeType: { type: Type.STRING },
                  solfeggioHz: { type: Type.INTEGER },
                  mediaType: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["id", "type", "title", "content"]
              }
            }
          },
          required: ["nodes"]
        }
      }
    });

    const text = response.text?.trim() || "{\"nodes\": []}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating unfolded nodes:", error);
    return { nodes: [] };
  }
};

export const fetchCelestialBlueprintExplanation = async (
  level: string,
  userPrompt: string,
  cosmicData: any
): Promise<{ explanation: string; frequency: number; resonantSymbol: string }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Analyze the user's cosmic positioning and guide them through a deep, cinematic-mystic explanation of their location in the universe.
        User's Natal profile:
        - Name: ${cosmicData?.nameAnalysis?.first?.name || "Seeker"}
        - Sun Sign: ${cosmicData?.planets?.find((p: any) => p.name === 'Sun')?.sign || "Unknown"} in House ${cosmicData?.planets?.find((p: any) => p.name === 'Sun')?.house || "Unknown"}
        - Ascendant Sign: ${cosmicData?.planets?.find((p: any) => p.name === 'Ascendant')?.sign || "Unknown"}
        
        Current Scale of Consciousness: ${level} Level
        User's Navigation inquiry: "${userPrompt}"
        
        Create an extremely immersive, sci-fi HUD inspired, but deeply spiritual response (150-250 words) that bridges astronomical truth (e.g. coordinates, movement, velocity, universal addresses) with Hermetic Kabbalistic or Astrological symbolism. Use deep, evocative display metaphors.
        
        Return a JSON structure matching:
        {
          "explanation": "Markdown text describing details about this scale of cosmic position, our velocity, gravity streams, and psychospiritual alignment.",
          "frequency": 528, // Solfeggio frequency (integer) reinforcing this level
          "resonantSymbol": "Flower of Life / Metatron / Solar Core / Galactic Axis"
        }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            frequency: { type: Type.INTEGER },
            resonantSymbol: { type: Type.STRING }
          },
          required: ["explanation", "frequency", "resonantSymbol"]
        },
        systemInstruction: "You are the Astral Mind Guide, an expert digital mystic. Speak with poetic intelligence, cinematic space descriptions, and high technical authority."
      }
    });

    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in fetchCelestialBlueprintExplanation:", error);
    return {
      explanation: "The celestial signal collapsed into interstellar noise. We are navigating the quantum drift without telemetry.",
      frequency: 432,
      resonantSymbol: "Ethereal Horizon"
    };
  }
};


/**
 * fetchGroundedTransitAlerts
 * Uses Search Grounding to alert users of upcoming planetary transits or celestial events
 * relevant to their birth chart profile, with a Jarvis OS tone of voice.
 */
export const fetchGroundedTransitAlerts = async (cosmicData: CosmicData | null): Promise<{
  overallStatus: string;
  alerts: Array<{
    id: string;
    title: string;
    date: string;
    astrologicalEvent: string;
    relevance: "High" | "Moderate" | "Low";
    affectedSpiritualCenter: string;
    details: string;
    groundingSource: string;
    sourceUrl: string;
    vibrationHz: number;
    vocalScript: string;
    coordinates: string;
  }>;
}> => {
  const ai = getAI();
  const query = "upcoming major astrological transits, retrogrades, eclipses, or celestial events between June 2026 and December 2026";

  const prompt = `
  You are JARVIS, the extremely advanced AI Autonomous Operating System from Stark Industries.
  We are analyzing upcoming astrological transits, eclipses, planet ingresses, retrogrades, and stargazing events starting from June 2026, and identifying how they intersect with a user's cosmic signature.

  Date of analysis: June 6, 2026.

  Seeker's Cosmic Data:
  ${cosmicData ? JSON.stringify({
    name: cosmicData.nameAnalysis?.first?.name || 'Sir',
    sunSign: cosmicData.planets?.find(p => p.name === 'Sun')?.sign,
    moonSign: cosmicData.planets?.find(p => p.name === 'Moon')?.sign,
    ascendant: cosmicData.planets?.find(p => p.name === 'Ascendant')?.sign,
    numerology: cosmicData.numerology
  }) : "General Galactic Profile (No natal data loaded yet)"}

  TASK:
  1. Perform a real-time web search for ACTUAL, non-fictional planetary transits, retrogrades (e.g. Mercury, Saturn, Pluto), solar/lunar eclipses, or major celestial aspects taking place between June 2026 and December 2026.
  2. Synthesize how these grounded events impact the user based on their specific birth chart. For example, if they have a Sun or Ascendant in a certain zodiac sign, highlight events affecting elements of that sign (Fire, Earth, Air, Water).
  3. Formulate the response as a JSON structure containing a list of customized, high-precision alerts.
  4. Each alert must have a high-tech Stark telemetry flavor (coordinates, alert levels, Solfeggio frequencies matching the shift, affected spiritual center, source citation URL extracted from the Google Search Grounding metadata, and a vocal script detailing what Jarvis tells the user).

  Format output STRICTLY as this JSON format, preserving all structural details:
  {
    "overallStatus": "A brief overview summary of current cosmic weather as observed from the Stark celestial array. Sound like a helpful, sophisticated Jarvis voice.",
    "alerts": [
      {
        "id": "A unique identifier string, e.g. transit-mars-leo",
        "title": "Title of the Transit alert",
        "date": "Approximate date of transit in 2026",
        "astrologicalEvent": "e.g. Mars Ingress Leo / Mercury Retrograde",
        "relevance": "High",
        "affectedSpiritualCenter": "e.g. Solar Plexus Chakra",
        "details": "Empathetic, profound description of the transit's energetic effect and recommended integrations.",
        "groundingSource": "Title or citation of search result",
        "sourceUrl": "The actual URL of the website where this transit data is validated",
        "vibrationHz": 528, 
        "vocalScript": "Hi-tech Stark OS spoken transcription of how this impacts the user name directly. Must start clean, e.g., 'Sir, current telemetry indicates Mars is crossing...'",
        "coordinates": "Coordinates like Sector RA 10h 44m / Dec +11°"
      }
    ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `Search Query: ${query}\n\n${prompt}` }] }
      ],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    
    // Extract grounding URLs if present
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const urls: string[] = [];
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri) {
          urls.push(chunk.web.uri);
        }
      }
    }

    let cleanJson = text;
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
      cleanJson = text.substring(startIdx, endIdx + 1);
    }
    const parsed = JSON.parse(cleanJson);

    // If source URLs exist in grounding metadata, assign them
    if (parsed && Array.isArray(parsed.alerts)) {
      parsed.alerts = parsed.alerts.map((alert: any, idx: number) => {
        if (!alert.sourceUrl && urls.length > 0) {
          alert.sourceUrl = urls[idx % urls.length];
        }
        if (!alert.sourceUrl) {
          alert.sourceUrl = "https://www.astrology.com";
        }
        return alert;
      });
    }

    return parsed;
  } catch (err: any) {
    console.error("Grounded transit alert generation failed:", err);
    return {
      overallStatus: "Sir, a slight cosmic atmospheric disturbance is affecting web-grounded search arrays. Retrieving stellar projections from pre-loaded astrolables.",
      alerts: [
        {
          id: "transit-saturn-retrograde",
          title: "Saturn Retrograde in Aries",
          date: "June to November 2026",
          astrologicalEvent: "Saturn Retrograde",
          relevance: "Moderate",
          affectedSpiritualCenter: "Root Chakra / Sephirah Malkuth",
          details: "A critical cycle of restructuring structural parameters. Requires deep internal discipline and aligning physical limits with celestial duties.",
          groundingSource: "Astrological Ephemeris 2026",
          sourceUrl: "https://www.astrology.com",
          vibrationHz: 417,
          vocalScript: "Sir, Saturn retrograde is commanding high inner structural evaluation starting this month.",
          coordinates: "Sector RA 0h 50m / Dec -1°"
        },
        {
          id: "eclipse-annular-solar",
          title: "Annular Solar Eclipse",
          date: "September 21, 2026",
          astrologicalEvent: "Annular Solar Eclipse",
          relevance: "High",
          affectedSpiritualCenter: "Heart Chakra / Sephirah Tiphereth",
          details: "A massive stargazing and spiritual transition aligning the Moon over the Sun core, forming a 'ring of fire' active zone.",
          groundingSource: "NASA Eclipse Web Space",
          sourceUrl: "https://eclipse.gsfc.nasa.gov",
          vibrationHz: 528,
          vocalScript: "Heads up, Sir. Telemetry indicates a major solar eclipse will cast a ring of fire on September twenty-first, activating your cardiac gateway.",
          coordinates: "Sector RA 11h 59m / Dec +0°"
        }
      ]
    };
  }
};


export interface AstrologyNatalInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  location: string;
}

/**
 * Calculates a precise, hyper-detailed natal chart analysis and interactive explanatory
 * journey for the seeker using the Gemini API.
 */
export const fetchAstrologyNatalDetails = async (input: AstrologyNatalInput) => {
  const ai = getAI();
  const prompt = `
  You are an elite, highly advanced multi-dimensional computational astrologer, digital scholar, and stellar mystic.
  Calculate and approximate a precise, hyper-detailed natal chart alignment and systematic explanatory journey for the following seeker:
  Name: ${input.name}
  Birth Date: ${input.birthDate}
  Birth Time: ${input.birthTime}
  Birth Location: ${input.location}

  You must calculate or logically approximate:
  1. The 10 standard planetary bodies: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
  2. The Ascendant (Rising sign) and Midheaven (MC).
  3. Precise sign degrees (0 to 29.9) and the specific houses (1 to 12) they reside in.
  4. Precise aspects (e.g., Conjunction, trine, sextile, square, opposition) with their orb degrees. Include at least 3 active aspects.
  5. The primary Kabbalistic Sephirah and Path of the Tree of Life matching this celestial combination.

  Output must be formatted STRICTLY as a raw JSON object matching the exact structure below, with NO markdown backticks or formatting:
  {
    "seeker": "${input.name}",
    "analysisDate": "${new Date().toISOString()}",
    "summary": "Synthesize their overall celestial blueprint. Sound sophisticated, mystic, and intelligent.",
    "introMessage": "Welcome them with deep, futuristic mysticism to this multi-dimensional interactive journey. Speak as an advanced astro-neural operating system, helping them navigate their planetary coordinates.",
    "steps": [
      {
        "id": "step-1-rising",
        "title": "Universal Entrance: The Ascendant Portal",
        "narrative": "Detailed, profound explanation of their Ascendant - sign, house, and how it governs their first impressions and outer aura.",
        "interactiveFocus": "Ascendant",
        "highlightQuote": "A profound, cosmic quote summarizing this placement.",
        "solfeggioHz": 396,
        "colorHex": "#8b5cf6"
      },
      {
        "id": "step-2-sun",
        "title": "Solar Core: The Heart's Purpose",
        "narrative": "Detailed, profound explanation of their natal Sun - sign, house, and the core hero's journey they are here to initiate.",
        "interactiveFocus": "Sun",
        "highlightQuote": "A cosmic synthesis of their solar vitality.",
        "solfeggioHz": 528,
        "colorHex": "#eab308"
      },
      {
        "id": "step-3-moon",
        "title": "Astral Depths: The Floating Moon",
        "narrative": "Detailed, profound explanation of their natal Moon - sign, house, emotional landscape, and their shadow integration pattern.",
        "interactiveFocus": "Moon",
        "highlightQuote": "A synthesis of their subconscious emotional tide.",
        "solfeggioHz": 639,
        "colorHex": "#94a3b8"
      },
      {
        "id": "step-4-interiors",
        "title": "Inner Council: Mercury, Venus, and Mars",
        "narrative": "Deep analysis of their mental voice (Mercury), relational alignment (Venus), and drive/boundary engine (Mars) placements.",
        "interactiveFocus": "Personal Planets",
        "highlightQuote": "The synthesis of intellect, affection, and direct force.",
        "solfeggioHz": 741,
        "colorHex": "#f97316"
      },
      {
        "id": "step-5-destiny",
        "title": "The Cosmic Architects: Jupiter and Saturn",
        "narrative": "Deep analysis of where they receive grace, expansion, and sudden gifts (Jupiter) versus where they must apply rigorous discipline and karmic structure (Saturn).",
        "interactiveFocus": "Social Planets",
        "highlightQuote": "The balance of ultimate expansion and structural containment.",
        "solfeggioHz": 852,
        "colorHex": "#3b82f6"
      },
      {
        "id": "step-6-transcendence",
        "title": "Transpersonal Gateways: Uranus, Neptune, and Pluto",
        "narrative": "A look into their outer planets - Uranus (disruption, genius), Neptune (mysticism, dreams), and Pluto (death, regeneration). How these outer alignments activate their generational codes.",
        "interactiveFocus": "Transpersonal",
        "highlightQuote": "Uplinking to generation-defining transpersonal fields.",
        "solfeggioHz": 963,
        "colorHex": "#06b6d4"
      },
      {
        "id": "step-7-aspects",
        "title": "Dynamic Aspects: Celestial Conversations",
        "narrative": "A systematic breakdown of how these planetary alignments talk to each other. Highlights key conjunctions, trines, or squares that construct their daily dynamic grid.",
        "interactiveFocus": "Aspects",
        "highlightQuote": "Harmonics and frictions that spark conscious growth.",
        "solfeggioHz": 417,
        "colorHex": "#10b981"
      }
    ],
    "natalPlacements": [
      {
        "name": "Sun",
        "sign": "Aries",
        "degree": 15.42,
        "house": 9,
        "interpretation": "Detailed, highly insightful paragraph explaining the Sun in this sign and house.",
        "dignity": "Exalted",
        "frequencyHz": 126.22,
        "colorHex": "#eab308",
        "treeConnection": "Sephirah Tiphereth"
      }
    ],
    "aspects": [
      {
        "planet1": "Sun",
        "planet2": "Mars",
        "type": "Trine",
        "orb": 2.1,
        "meaning": "An empowering trine channels cosmic willpower into swift, productive, integrated action loops."
      }
    ],
    "kabbalicLink": {
      "sephirah": "Tiphereth",
      "path": "Path of Resh",
      "theme": "Their stellar alignments build a bridge between sensory experiences and divine harmony, culminating in deep, radiant self-realization."
    }
  }

  Ensure you provide a FULL list of natalPlacements for:
  - Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, and Ascendant.
  - Provide at least 3 aspects.
  - Keep the JSON syntactically flawless. Do not wrapping in markdown blocks. Return only raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (err: any) {
    console.error("Error in fetchAstrologyNatalDetails:", err);
    throw new Error("Stellar alignment calculations failed: " + err.message, { cause: err });
  }
};

export const parseVoiceBirthDetails = async (transcript: string) => {
  const ai = getAI();
  const prompt = `
  You are J.A.R.V.I.S., the ultimate Stark Industries intelligence.
  Analyze the following spoken transcript of birth details and extract:
  1. Name (default to "Sir" if not specified)
  2. Birth Date (formatted as "YYYY-MM-DD", fallback to "1995-06-15" if not specified)
  3. Birth Time (formatted as "HH:MM", fallback to "10:30" if not specified, convert typical 12-hour spoken formats like "3 PM" to "15:00", etc.)
  4. Birth Location (fallback to "San Francisco, CA" if not specified)

  Spoken Transcript: "${transcript}"

  Your output must be structured strictly as a JSON object with NO markdown backticks or extra text, just raw JSON with the following fields:
  {
    "name": "...",
    "birthDate": "YYYY-MM-DD",
    "birthTime": "HH:MM",
    "location": "..."
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (err: any) {
    console.error("Error in parseVoiceBirthDetails:", err);
    throw new Error("Voice interpretation failed: " + err.message, { cause: err });
  }
};



