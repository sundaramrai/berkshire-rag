import fs from "node:fs";
import path from "node:path";
import { embedMany } from "ai";
import { MDocument } from "@mastra/rag";
import { mistral } from "@/lib/mistral-provider";
import { BERKSHIRE_VECTOR_INDEX_NAME, FIRST_LETTER_YEAR, LAST_LETTER_YEAR, LETTER_EMBEDDING_MODEL, LETTERS_DIRECTORY, REQUIRED_LETTER_YEARS } from "./config";
import { extractPdfText } from "./pdf";
import type { IngestedLetterSummary, IngestionSummary, ShareholderLetterFile } from "./types";
import { createBerkshireVectorStore, ensureBerkshireVectorIndex } from "./vector-store";

const INGEST_BATCH_SIZE = Number(process.env.RAG_INGEST_BATCH_SIZE ?? 8);

export function listShareholderLetterFiles(): ShareholderLetterFile[] {
  if (!fs.existsSync(LETTERS_DIRECTORY)) {
    throw new Error(
      `Expected shareholder letters folder at ${LETTERS_DIRECTORY}.`,
    );
  }

  const files = fs
    .readdirSync(LETTERS_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => {
      const year = /(?:19|20)\d{2}/.exec(entry.name)?.[0];

      if (!year) {
        throw new Error(
          `Could not infer year from "${entry.name}". Use a filename such as 2023.pdf or letter-2023.pdf.`,
        );
      }

      const yearNumber = Number(year);
      if (yearNumber < FIRST_LETTER_YEAR || yearNumber > LAST_LETTER_YEAR) {
        throw new Error(
          `Unsupported Berkshire letter year "${year}" in ${entry.name}. Expected ${FIRST_LETTER_YEAR}-${LAST_LETTER_YEAR}.`,
        );
      }

      return {
        fileName: entry.name,
        filePath: path.join(LETTERS_DIRECTORY, entry.name),
        year,
      };
    })
    .sort((left, right) => left.year.localeCompare(right.year));

  const missingYears = REQUIRED_LETTER_YEARS.filter(
    (year) => !files.some((file) => file.year === year),
  );

  if (missingYears.length > 0) {
    throw new Error(
      `Missing Berkshire letters for: ${missingYears.join(", ")}. Place all PDFs from ${FIRST_LETTER_YEAR} through ${LAST_LETTER_YEAR} inside src/documents/.`,
    );
  }

  return files;
}

export async function ingestShareholderLetters({
  recreateIndex = false,
}: {
  recreateIndex?: boolean;
} = {}): Promise<IngestionSummary> {
  await ensureBerkshireVectorIndex({ recreate: recreateIndex });

  const vectorStore = createBerkshireVectorStore();
  const processedFiles: IngestedLetterSummary[] = [];

  try {
    const letters = listShareholderLetterFiles();

    for (const [letterIndex, letter] of letters.entries()) {
      console.log(
        `Processing ${letter.fileName} (${letterIndex + 1}/${letters.length})...`,
      );

      const extractedText = await extractPdfText(letter.filePath);
      if (!extractedText) {
        throw new Error(`No text was extracted from ${letter.fileName}.`);
      }

      const document = MDocument.fromText(extractedText, {
        source: letter.fileName,
        year: letter.year,
        type: "berkshire_shareholder_letter",
      });

      const chunks = await document.chunk({
        strategy: "recursive",
        maxSize: 1200,
        overlap: 150,
      });

      console.log(`  ${chunks.length} chunks generated.`);

      await vectorStore.deleteVectors({
        indexName: BERKSHIRE_VECTOR_INDEX_NAME,
        filter: {
          source: letter.fileName,
        },
      });

      for (let start = 0; start < chunks.length; start += INGEST_BATCH_SIZE) {
        const chunkBatch = chunks.slice(start, start + INGEST_BATCH_SIZE);
        const batchNumber = Math.floor(start / INGEST_BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(chunks.length / INGEST_BATCH_SIZE);

        console.log(
          `  Embedding batch ${batchNumber}/${totalBatches} (${chunkBatch.length} chunks)...`,
        );

        const { embeddings } = await embedMany({
          model: mistral.embedding(LETTER_EMBEDDING_MODEL),
          values: chunkBatch.map((chunk) => chunk.text),
        });

        console.log(`  Upserting batch ${batchNumber}/${totalBatches}...`);

        await vectorStore.upsert({
          indexName: BERKSHIRE_VECTOR_INDEX_NAME,
          vectors: embeddings,
          metadata: chunkBatch.map((chunk, batchIndex) => ({
            text: chunk.text,
            source: letter.fileName,
            year: letter.year,
            type: "berkshire_shareholder_letter",
            chunkIndex: start + batchIndex,
          })),
        });
      }

      console.log(`Finished ${letter.fileName}.`);

      processedFiles.push({
        fileName: letter.fileName,
        year: letter.year,
        chunkCount: chunks.length,
      });
    }
  } finally {
    await vectorStore.disconnect();
  }

  return {
    processedFiles,
    totalDocuments: processedFiles.length,
    totalChunks: processedFiles.reduce(
      (sum, current) => sum + current.chunkCount,
      0,
    ),
  };
}
