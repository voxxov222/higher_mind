import { ActionFunctionArgs } from "@remix-run/node";
import { convertToModelMessages, streamText, UIMessage, stepCountIs } from "ai";
import { getModel } from "../lib/ai";
import { getMCPTools } from "../lib/mcp";
import { getSystemPrompt } from "../lib/prompts";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  
  try {
    const body = await request.json();
    const messages: UIMessage[] = body.messages;

    const { tools } = await getMCPTools();

    const result = streamText({
      model: getModel(),
      system: getSystemPrompt(),
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat] Unhandled error:", error);
    return new Response("Internal server error.", { status: 500 });
  }
}
