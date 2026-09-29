import { json, type ActionFunctionArgs } from "@remix-run/node";
import { GoogleGenAI } from "@google/genai";

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

export const action = async ({ request }: ActionFunctionArgs) => {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const { planet } = await request.json();
        const aiClient = getAI();
        
        const prompt = `A mission patch for ${planet}. It should have a circular badge design, featuring the planet in the center, stylized space exploration motifs like stars, rockets, or orbits. Bold, clean vector-art style, suitable for an embroidered patch.`;
        
        const response = await aiClient.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
                parts: [
                    {
                        text: prompt,
                    }
                ]
            }
        });

        let imageUrl = null;
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64EncodeString = part.inlineData.data;
                    imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
                    break;
                }
            }
        }

        if (!imageUrl) {
            return json({ error: "Failed to extract image" }, { status: 500 });
        }

        return json({ imageUrl });
    } catch (e) {
        console.error(e);
        return json({ error: 'Failed to generate patch' }, { status: 500 });
    }
};
