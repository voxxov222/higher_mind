import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { GoogleGenAI } from "@google/genai";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  
  try {
    const { prompt, systemInstruction } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI(apiKey ? { apiKey } : {});
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    let result = response.text || "{}";
    // clean potential markdown
    result = result.replace(/```json|```/g, '').trim();

    return json({ data: JSON.parse(result) });
  } catch (err: any) {
    console.error("Raw Gemini Proxy Error:", err);
    return json({ error: err.message }, { status: 500 });
  }
}
