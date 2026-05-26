import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { generateAncestryResearch } from "../services/gemini.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { lastName, maidenName } = await request.json();
    
    if (!lastName) {
      return json({ error: "Last name is required" }, { status: 400 });
    }

    const researchData = await generateAncestryResearch(lastName, maidenName);
    
    return json(researchData);
  } catch (error) {
    console.error("Ancestry API Error:", error);
    return json({ error: "Failed to generate ancestry data" }, { status: 500 });
  }
};
