import { ActionFunction, json } from '@remix-run/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { cosmicData, message, history } = await request.json();

    const systemInstruction = `You are the "Higher Mind Oracle", an interactive storyteller, dynamic learning intelligence, and automated research database. 
You speak directly to the user about their cosmic journey, astrology, and spiritual blueprint.
Your responses should be narrative, immersive, and visually evocative.
Whenever you introduce or mention an important mystical, astrological, or spiritual concept (e.g., "Saturn Return", "Tree of Life", "Gematria", "Ascension", "Kundalini"), wrap it in a special tag like this: <concept term="Term Name">the word</concept>. This will allow the frontend to make it a clickable pop-up.

For example: "You are currently experiencing your <concept term="Saturn Return">Saturn Return</concept>, a time of great restructuring."

You have access to the user's cosmic data:
${JSON.stringify(cosmicData, null, 2)}

Provide an interactive narrative response to the user.`;

    let conversationContext = "";
    if (history && history.length > 0) {
      conversationContext = history.map((h: any) => `${h.role === 'user' ? 'User' : 'Oracle'}: ${h.text}`).join("\n");
    }

    const prompt = message || "Begin the story of my cosmic existence based on my data. What are the key themes of my incarnation?";
    const fullPrompt = `${systemInstruction}\n\nConversation History:\n${conversationContext}\n\nUser: ${prompt}\nOracle:`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        temperature: 0.7,
      }
    });
    
    return json({ text: result.text });
  } catch (error: any) {
    console.error('Error in Oracle Story API:', error);
    return json({ error: error.message || 'Failed to generate story' }, { status: 500 });
  }
};
