import "dotenv/config";

import { ensureBerkshireVectorIndex } from "@/lib/berkshire/vector-store";

async function main() {
  const recreate = process.argv.includes("--recreate");

  await ensureBerkshireVectorIndex({ recreate });
  console.log(recreate ? "Vector index was recreated." : "Vector index is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
