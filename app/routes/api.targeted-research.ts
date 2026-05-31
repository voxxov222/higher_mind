import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    return new GoogleGenAI(apiKey ? { 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    } : {
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { targetContext, cosmicDataString } = await request.json();
    
    if (!targetContext) {
      return json({ error: "Target context is required" }, { status: 400 });
    }

    const ai = getAI();
    const prompt = `You are an expert cosmic investigator and data researcher.
The user's astrological and identity data is: ${cosmicDataString}

Your directive is to deep search the public internet for the following context:
"${targetContext}"

CRITICAL INSTRUCTION: If the target context implies searching for the user's public footprint (e.g. "Public records", "ancestral traces"), you MUST use the Google Search tool to search for real public records, articles, social presence, or database entries referencing their EXACT name and Date of Birth.

Find exact matches, historical data, spiritual correlations, public databases, and specific records.
Compile a detailed dossier of findings. Emphasize actual facts found on the web.
Provide your output as a comprehensive synthesis.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const output = response.text || "No insights could be generated.";
    
    // Extract URLs
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const links: string[] = [];
    if (chunks) {
        chunks.forEach(chunk => {
            if (chunk.web?.uri) {
                links.push(chunk.web.uri);
            }
        });
    }

    return json({ result: output, links });
  } catch (error) {
    console.error("Targeted Research API Error:", error);
    return json({ error: "Failed to generate targeted research" }, { status: 500 });
  }
};
