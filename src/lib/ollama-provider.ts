import { createOpenAI } from "@ai-sdk/openai";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY ?? "ollama";
export const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? "gpt-oss:20b-cloud";

export const ollama = createOpenAI({
  name: "ollama",
  baseURL: OLLAMA_BASE_URL,
  apiKey: OLLAMA_API_KEY,
});
