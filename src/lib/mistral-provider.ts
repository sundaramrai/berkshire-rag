import { createOpenAI } from "@ai-sdk/openai";

export const MISTRAL_BASE_URL = process.env.MISTRAL_BASE_URL ?? "https://api.mistral.ai/v1";
export const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
export const MISTRAL_EMBEDDING_MODEL = process.env.MISTRAL_EMBEDDING_MODEL ?? "mistral-embed";
export const MISTRAL_EMBEDDING_DIMENSION = Number(process.env.MISTRAL_EMBEDDING_DIMENSION ?? 1024);

export const mistral = createOpenAI({
  name: "mistral",
  baseURL: MISTRAL_BASE_URL,
  apiKey: MISTRAL_API_KEY,
});
