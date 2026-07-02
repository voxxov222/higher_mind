import { ActionFunction, json } from '@remix-run/node';
import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { term } = await request.json();
    const aiClient = getAI();

    const prompt = `You are a cosmic glossary and automated research database.
Provide a concise, 2-3 sentence definition and spiritual significance of the following term in the context of astrology, gematria, or esotericism.
Term: "${term}"`;

    const result = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });
    
    return json({ text: result.text });
  } catch (error: any) {
    console.error('Error in Oracle Concept API:', error);
    return json({ error: error.message || 'Failed to generate concept detail' }, { status: 500 });
  }
};
