import type { UIMessage } from "ai";

const CHAT_STORAGE_KEY = "berkshire-hathaway-intelligence-chat";

export interface StoredChatSession {
  threadId: string;
  messages: UIMessage[];
}

function createThreadId() {
  return `berkshire-${crypto.randomUUID()}`;
}

export function createChatSession(): StoredChatSession {
  return {
    threadId: createThreadId(),
    messages: [],
  };
}

export function loadStoredChatSession(): StoredChatSession {
  if (globalThis.window === undefined) {
    return createChatSession();
  }

  const rawSession = globalThis.window.localStorage.getItem(CHAT_STORAGE_KEY);
  if (!rawSession) {
    return createChatSession();
  }

  try {
    const parsed = JSON.parse(rawSession) as Partial<StoredChatSession>;
    if (
      typeof parsed.threadId === "string" &&
      parsed.threadId.length > 0 &&
      Array.isArray(parsed.messages)
    ) {
      return {
        threadId: parsed.threadId,
        messages: parsed.messages,
      };
    }
  } catch {
    // Ignore malformed local storage and start a clean thread.
  }

  return createChatSession();
}

export function persistChatSession(session: StoredChatSession) {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(session));
}

export function resetStoredChatSession(session: StoredChatSession) {
  persistChatSession(session);
}
