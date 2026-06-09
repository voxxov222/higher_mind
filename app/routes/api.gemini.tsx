import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import * as geminiServer from "../services/gemini.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  
  try {
    const { action, payload: rawPayload } = await request.json();
    const payload = rawPayload || {};
    
    switch (action) {
      case "fetchAstrologyNatalDetails":
        return json(await geminiServer.fetchAstrologyNatalDetails(payload));
      case "fetchCosmicReading":
        return json(await geminiServer.fetchCosmicReading(payload));
      case "fetchCosmicChatResponse":
        return json(await geminiServer.fetchCosmicChatResponse(payload.userMessage, payload.chatHistory, payload.cosmicData));
      case "fetchTimelineDepth":
        return json(await geminiServer.fetchTimelineDepth(payload.event, payload.cosmicData));
      case "fetchTimelineDeepDiveOption":
        return json(await geminiServer.fetchTimelineDeepDiveOption(payload.event, payload.option, payload.cosmicData));
      case "fetchGeneralDeepDive":
        return json(await geminiServer.fetchGeneralDeepDive(payload.topicTitle, payload.topicContent, payload.cosmicData));
      case "fetchAuraInsight":
        return json(await geminiServer.fetchAuraInsight(payload.prompt, payload.cosmicData));
      case "fetchAngelNumberInsight":
        return json(await geminiServer.fetchAngelNumberInsight(payload.query, payload.cosmicData));
      case "fetchUnfoldedNodes":
        return json(await geminiServer.fetchUnfoldedNodes(payload.canvasCtx, payload.cosmicData));
      case "fetchCelestialBlueprintExplanation":
        return json(await geminiServer.fetchCelestialBlueprintExplanation(payload.level, payload.userPrompt, payload.cosmicData));
      case "generateSoulPathReport":
        return json(await geminiServer.generateSoulPathReport(payload.cosmicData));
      case "fetchTarotGnosis":
        return json(await geminiServer.fetchTarotGnosis(payload.cardName, payload.archetype, payload.cosmicData));
      case "fetchGroundedTransitAlerts":
        return json(await geminiServer.fetchGroundedTransitAlerts(payload.cosmicData));
      case "parseVoiceBirthDetails":
        return json(await geminiServer.parseVoiceBirthDetails(payload.transcript));
      default:
        return json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Gemini API proxy error:", err);
    return json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
