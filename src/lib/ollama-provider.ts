import { createOpenAI } from "@ai-sdk/openai";

export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
export const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY ?? "ollama";
export const OLLAMA_CHAT_MODEL =
  process.env.OLLAMA_CHAT_MODEL ?? "gpt-oss:20b-cloud";
export const OLLAMA_EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL ?? "embeddinggemma";
export const OLLAMA_EMBEDDING_DIMENSION = Number(
  process.env.OLLAMA_EMBEDDING_DIMENSION ?? 768,
);

export const ollama = createOpenAI({
  name: "ollama",
  baseURL: OLLAMA_BASE_URL,
  apiKey: OLLAMA_API_KEY,
});
