import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { PgVector } from "@mastra/pg";
import { getPostgresConnectionString } from "@/lib/env";
import { BERKSHIRE_INDEX_TABLE_ID, BERKSHIRE_VECTOR_STORE_NAME } from "@/lib/berkshire/config";
import { berkshireAgent } from "./agents/berkshire-agent";
import { ingestShareholderLettersWorkflow } from "./workflows/ingest-shareholder-letters-workflow";

export const mastra = new Mastra({
  agents: {
    berkshireAgent,
  },
  workflows: {
    ingestShareholderLettersWorkflow,
  },
  vectors: {
    [BERKSHIRE_VECTOR_STORE_NAME]: new PgVector({
      id: BERKSHIRE_INDEX_TABLE_ID,
      connectionString: getPostgresConnectionString(),
    }),
  },
  storage: new LibSQLStore({
    id: "berkshire-memory",
    url: "file:./mastra.db",
  }),
  logger: new PinoLogger({
    name: "BerkshireMastra",
    level: "info",
  }),
});
