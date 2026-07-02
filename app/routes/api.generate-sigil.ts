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
    const { cosmicData } = await request.json();
    const aiClient = getAI();
    
    const prompt = `You are an expert esoteric artist, alchemist, and symbologist.
    
Based on the following cosmic blueprint of the user:
${JSON.stringify(cosmicData, null, 2)}

Design a completely unique, visually striking, and spiritually meaningful "Personal Ancient Symbol" or "Sigil" for this user.
The symbol should incorporate sacred geometry, astrological glyphs, numerological patterns (like their Life Path number), and elements of their name or essence.

Requirements:
- The output MUST be valid, raw SVG code.
- Do NOT wrap the SVG in markdown code blocks. Output ONLY the raw <svg>...</svg> string.
- Use a dark theme compatible color palette (e.g., gold (#fbbf24), cyan (#22d3ee), violet (#c084fc), ethereal white) on a transparent background.
- Make it scalable, using viewBox="0 0 500 500".
- Make it highly intricate and symmetrical, using paths, circles, polygons, and celestial elements.
- Add some glowing effects (e.g. SVG drop-shadow filters) or gradients to make it look magical and ancient.
- Do not output any explanation, ONLY the raw SVG code starting with <svg> and ending with </svg>.`;

    const result = await aiClient.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        temperature: 0.9,
      }
    });
    
    let svg = result.text || "";
    
    // basic cleanup in case it wrapped in markdown
    if (svg.includes('<svg') && svg.includes('</svg>')) {
        svg = svg.substring(svg.indexOf('<svg'), svg.lastIndexOf('</svg>') + 6);
    }

    return json({ svg: svg.trim() });
  } catch (error: any) {
    console.error('Error generating sigil:', error);
    return json({ error: error.message || 'Failed to generate sigil' }, { status: 500 });
  }
};
