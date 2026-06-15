import { CosmicData } from "../types";

export interface CosmicInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  location: string;
}

const apiProxy = async (action: string, payload: any) => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload })
    });
    
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch ${action} (${response.status})`);
      } else {
        const text = await response.text().catch(() => "");
        throw new Error(`Server error (${response.status}) when fetching ${action}: ${text.substring(0, 120) || "HTML response"}`);
      }
    }
    
    if (!contentType.includes("application/json")) {
      const text = await response.text().catch(() => "");
      throw new Error(`Expected JSON from server for ${action}, but received HTML/text: ${text.substring(0, 120) || "HTML content"}`);
    }
    
    return await response.json();
  } catch (err: any) {
    console.error(`apiProxy error for ${action}:`, err);
    throw err;
  }
};

export const fetchCosmicReading = async (input: CosmicInput): Promise<CosmicData> => {
   return apiProxy("fetchCosmicReading", input);
};

export const fetchAstrologyNatalDetails = async (input: { name: string; birthDate: string; birthTime: string; location: string }): Promise<any> => {
  return apiProxy("fetchAstrologyNatalDetails", input);
};

export const fetchCosmicChatResponse = async (
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[],
  cosmicData: CosmicData | null
): Promise<{ text: string; consciousnessPacket?: any }> => {
  return apiProxy("fetchCosmicChatResponse", { userMessage, chatHistory, cosmicData });
};

export const fetchTarotAgentResponse = async (
  userMessage: string,
  cardName: string,
  meaning: string,
  manifestationPath: string,
  cosmicData: CosmicData | null,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<{ text: string; consciousnessPacket?: any }> => {
  return apiProxy("fetchTarotAgentResponse", { userMessage, cardName, meaning, manifestationPath, cosmicData, chatHistory });
};

export const fetchTimelineDepth = async (event: any, cosmicData: CosmicData) => {
  return apiProxy("fetchTimelineDepth", { event, cosmicData });
};

export const fetchTimelineDeepDiveOption = async (event: any, option: string, cosmicData: CosmicData) => {
  return apiProxy("fetchTimelineDeepDiveOption", { event, option, cosmicData });
};

export const fetchGeneralDeepDive = async (topicTitle: string, topicContent: string, cosmicData: CosmicData) => {
  return apiProxy("fetchGeneralDeepDive", { topicTitle, topicContent, cosmicData });
};

export const fetchAuraInsight = async (prompt: string, cosmicData: CosmicData) => {
  return apiProxy("fetchAuraInsight", { prompt, cosmicData });
};

export const fetchAngelNumberInsight = async (query: string, cosmicData: CosmicData | null) => {
  return apiProxy("fetchAngelNumberInsight", { query, cosmicData });
};

export const fetchUnfoldedNodes = async (canvasCtx: string, cosmicData: CosmicData | null): Promise<{ nodes: any[] }> => {
  return apiProxy("fetchUnfoldedNodes", { canvasCtx, cosmicData });
};

export const streamGeminiChat = async (messages: {role: string, text: string}[], onChunk: (chunk: string) => void) => {
  const response = await fetch("/api/gemini-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  if (!response.ok) throw new Error("Stream failed");
  if (!response.body) throw new Error("No body");
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
};

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
  return apiProxy("fetchGroundedTransitAlerts", { cosmicData });
};

export const parseVoiceBirthDetails = async (transcript: string): Promise<{
  name: string;
  birthDate: string;
  birthTime: string;
  location: string;
}> => {
  return apiProxy("parseVoiceBirthDetails", { transcript });
};


