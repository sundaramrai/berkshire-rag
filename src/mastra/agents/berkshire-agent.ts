import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { ollama } from "@/lib/ollama-provider";
import { BERKSHIRE_AGENT_ID, LETTER_RESPONSE_MODEL } from "@/lib/berkshire/config";
import { berkshireAgentInstructions } from "../prompts";
import { berkshireSearchTool } from "../tools/berkshire-search-tool";

export const berkshireAgent = new Agent({
  id: BERKSHIRE_AGENT_ID,
  name: "Berkshire Hathaway Intelligence",
  instructions: berkshireAgentInstructions,
  model: ollama.chat(LETTER_RESPONSE_MODEL),
  tools: {
    berkshireSearchTool,
  },
  memory: new Memory({
    options: {
      lastMessages: 12,
    },
  }),
});
