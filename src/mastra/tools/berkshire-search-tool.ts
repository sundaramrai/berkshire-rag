import { createVectorQueryTool } from "@mastra/rag";
import { ollama } from "@/lib/ollama-provider";
import { BERKSHIRE_VECTOR_INDEX_NAME, BERKSHIRE_VECTOR_STORE_NAME, LETTER_EMBEDDING_MODEL } from "@/lib/berkshire/config";

export const berkshireSearchTool = createVectorQueryTool({
  id: "berkshire-letter-search",
  description:
    "Search Berkshire Hathaway shareholder letters from 1977 to 2024. Use filter JSON like {\"year\":\"2023\"} when the user asks for a specific year.",
  vectorStoreName: BERKSHIRE_VECTOR_STORE_NAME,
  indexName: BERKSHIRE_VECTOR_INDEX_NAME,
  model: ollama.embedding(LETTER_EMBEDDING_MODEL),
  enableFilter: true,
  includeSources: true,
  databaseConfig: {
    pgvector: {
      minScore: 0.45,
    },
  },
});
