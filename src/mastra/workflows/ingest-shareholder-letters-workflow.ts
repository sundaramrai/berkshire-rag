import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { ingestShareholderLetters } from "@/lib/berkshire/ingest";

const ingestLettersStep = createStep({
  id: "ingest-shareholder-letters",
  description:
    "Parses Berkshire Hathaway shareholder letters, chunks them with MDocument, generates embeddings, and stores them in pgvector.",
  inputSchema: z.object({
    recreateIndex: z.boolean().default(false),
  }),
  outputSchema: z.object({
    processedFiles: z.array(
      z.object({
        fileName: z.string(),
        year: z.string(),
        chunkCount: z.number(),
      }),
    ),
    totalDocuments: z.number(),
    totalChunks: z.number(),
  }),
  execute: async ({ inputData }) => {
    return ingestShareholderLetters({
      recreateIndex: inputData?.recreateIndex ?? false,
    });
  },
});

export const ingestShareholderLettersWorkflow = createWorkflow({
  id: "ingest-shareholder-letters-workflow",
  inputSchema: z.object({
    recreateIndex: z.boolean().default(false),
  }),
  outputSchema: z.object({
    processedFiles: z.array(
      z.object({
        fileName: z.string(),
        year: z.string(),
        chunkCount: z.number(),
      }),
    ),
    totalDocuments: z.number(),
    totalChunks: z.number(),
  }),
}).then(ingestLettersStep);

ingestShareholderLettersWorkflow.commit();
