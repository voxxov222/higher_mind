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
        const { prompt, type } = await request.json();
        const aiClient = getAI();
        
        if (type === 'video') {
            const operation = await aiClient.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '16:9'
                }
            });
            return json({ operationName: operation.name });
        } else {
            const response = await aiClient.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: { numberOfImages: 1, aspectRatio: '1:1' },
            });
            let imageUrl = null;
            const generatedImage = response.generatedImages?.[0];
            if (generatedImage?.image?.imageBytes) {
                imageUrl = `data:image/png;base64,${generatedImage.image.imageBytes}`;
            }
            return json({ imageUrl });
        }
    } catch (e) {
        console.error(e);
        return json({ error: 'Failed to generate media' }, { status: 500 });
    }
};
