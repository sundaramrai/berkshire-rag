import { PgVector } from "@mastra/pg";

import { getRequiredEnv } from "@/lib/env";
import { OLLAMA_EMBEDDING_DIMENSION } from "@/lib/ollama-provider";
import {
  BERKSHIRE_INDEX_TABLE_ID,
  BERKSHIRE_VECTOR_INDEX_NAME,
} from "./config";

export function createBerkshireVectorStore() {
  const { POSTGRES_CONNECTION_STRING } = getRequiredEnv();

  return new PgVector({
    id: BERKSHIRE_INDEX_TABLE_ID,
    connectionString: POSTGRES_CONNECTION_STRING,
    pgPoolOptions: {
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 60000,
      max: 5,
    },
  });
}

export async function ensureBerkshireVectorIndex({
  recreate = false,
}: {
  recreate?: boolean;
} = {}) {
  const vectorStore = createBerkshireVectorStore();

  try {
    const indexes = await vectorStore.listIndexes();
    const hasIndex = indexes.includes(BERKSHIRE_VECTOR_INDEX_NAME);

    if (recreate && hasIndex) {
      await vectorStore.deleteIndex({ indexName: BERKSHIRE_VECTOR_INDEX_NAME });
    }

    if (!hasIndex || recreate) {
      await vectorStore.createIndex({
        indexName: BERKSHIRE_VECTOR_INDEX_NAME,
        dimension: OLLAMA_EMBEDDING_DIMENSION,
        metric: "cosine",
        metadataIndexes: ["year", "source", "type"],
      });
    }
  } finally {
    await vectorStore.disconnect();
  }
}
