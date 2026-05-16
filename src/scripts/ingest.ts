import "dotenv/config";

import { ingestShareholderLetters } from "@/lib/berkshire/ingest";

async function main() {
  const summary = await ingestShareholderLetters({
    recreateIndex: process.argv.includes("--recreate-index"),
  });

  console.log("Ingestion complete.");
  console.table(summary.processedFiles);
  console.log(`Documents: ${summary.totalDocuments}`);
  console.log(`Chunks: ${summary.totalChunks}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
