import type { ActionFunctionArgs } from "@remix-run/node";
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

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messages } = await request.json();
    const ai = getAI();
    const contents = messages.map((m: any) => ({
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
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
          controller.close();
        } catch (e: any) {
          controller.error(e);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (err: any) {
    console.error("Gemini API stream error:", err);
    return new Response(err.message, { status: 500 });
  }
}
