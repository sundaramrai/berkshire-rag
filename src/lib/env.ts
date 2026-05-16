import { z } from "zod";

const envSchema = z.object({
  MISTRAL_API_KEY: z.string().min(1, "MISTRAL_API_KEY is required."),
  POSTGRES_CONNECTION_STRING: z
    .string()
    .min(1, "POSTGRES_CONNECTION_STRING is required."),
});

const DEFAULT_POSTGRES_CONNECTION_STRING =
  "postgresql://postgres:postgres@localhost:5432/berkshire";

export function getRequiredEnv() {
  return envSchema.parse({
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING,
  });
}

export function getPostgresConnectionString() {
  return process.env.POSTGRES_CONNECTION_STRING ?? DEFAULT_POSTGRES_CONNECTION_STRING;
}
