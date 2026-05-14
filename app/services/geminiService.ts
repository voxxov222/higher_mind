import { CosmicData } from "../types";

export interface CosmicInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  location: string;
}

const apiProxy = async (action: string, payload: any) => {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch ${action}`);
  }
  return response.json();
};

export const fetchCosmicReading = async (input: CosmicInput): Promise<CosmicData> => {
   return apiProxy("fetchCosmicReading", input);
};

export const fetchCosmicChatResponse = async (
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[],
  cosmicData: CosmicData | null
): Promise<{ text: string; consciousnessPacket?: any }> => {
  return apiProxy("fetchCosmicChatResponse", { userMessage, chatHistory, cosmicData });
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
