import path from "node:path";
export { MISTRAL_EMBEDDING_MODEL as LETTER_EMBEDDING_MODEL } from "@/lib/mistral-provider";
export { OLLAMA_CHAT_MODEL as LETTER_RESPONSE_MODEL } from "@/lib/ollama-provider";

export const BERKSHIRE_AGENT_ID = "berkshire-intelligence-agent";
export const BERKSHIRE_INDEX_TABLE_ID = "berkshire-pgvector";
export const BERKSHIRE_VECTOR_INDEX_NAME = "berkshire_letters";
export const BERKSHIRE_VECTOR_STORE_NAME = "berkshireVector";
export const DEFAULT_CHAT_RESOURCE_ID = "berkshire-demo-user";
export const LETTERS_DIRECTORY = path.join(process.cwd(), "src", "documents");
export const FIRST_LETTER_YEAR = 1977;
export const LAST_LETTER_YEAR = 2024;
export const REQUIRED_LETTER_YEARS = Array.from(
  { length: LAST_LETTER_YEAR - FIRST_LETTER_YEAR + 1 },
  (_, index) => String(FIRST_LETTER_YEAR + index),
);

export const SAMPLE_QUESTIONS = [
  "What is Warren Buffett's investment philosophy?",
  "Can you elaborate on Buffett's views about diversification?",
  "How has Berkshire's acquisition strategy evolved over time?",
  "What companies did Berkshire acquire in 2023?",
  "What does Buffett say about market volatility and timing?",
];
