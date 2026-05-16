import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";
import { z } from "zod";

import { BERKSHIRE_AGENT_ID } from "@/lib/berkshire/config";
import { mastra } from "@/mastra";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const chatRequestSchema = z.object({
  messages: z.array(z.any()),
  trigger: z.enum(["submit-message", "regenerate-message"]).optional(),
  memory: z
    .object({
      thread: z.string().min(1),
      resource: z.string().min(1),
    })
    .optional(),
});

export async function POST(request: Request) {
  const rawBody = await request.json();
  const params = chatRequestSchema.parse(rawBody);

  const stream = await handleChatStream({
    mastra,
    agentId: BERKSHIRE_AGENT_ID,
    version: "v6",
    sendSources: true,
    params: {
      ...params,
      memory: params.memory ?? {
        thread: "berkshire-demo-thread",
        resource: "berkshire-demo-user",
      },
    },
    onError: (error) =>
      error instanceof Error
        ? error.message
        : "Something went wrong while streaming the response.",
  });

  return createUIMessageStreamResponse({ stream });
}
