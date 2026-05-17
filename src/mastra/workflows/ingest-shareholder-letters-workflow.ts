import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { ingestShareholderLetters } from "@/lib/berkshire/ingest";

const ingestInputSchema = z.object({
  recreateIndex: z.boolean().default(false),
});

const ingestionSummarySchema = z.object({
  processedFiles: z.array(
    z.object({
      fileName: z.string(),
      year: z.string(),
      chunkCount: z.number(),
    }),
  ),
  totalDocuments: z.number(),
  totalChunks: z.number(),
});

const ingestLettersStep = createStep({
  id: "ingest-shareholder-letters",
  description:
    "Parses Berkshire Hathaway shareholder letters, chunks them with MDocument, generates embeddings, and stores them in pgvector.",
  inputSchema: ingestInputSchema,
  outputSchema: ingestionSummarySchema,
  execute: async ({ inputData }) => {
    return ingestShareholderLetters({
      recreateIndex: inputData?.recreateIndex ?? false,
    });
  },
});

export const ingestShareholderLettersWorkflow = createWorkflow({
  id: "ingest-shareholder-letters-workflow",
  inputSchema: ingestInputSchema,
  outputSchema: ingestionSummarySchema,
}).then(ingestLettersStep);

ingestShareholderLettersWorkflow.commit();
