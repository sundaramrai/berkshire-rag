"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { startTransition, useEffect, useRef, useState } from "react";
import { DEFAULT_CHAT_RESOURCE_ID, SAMPLE_QUESTIONS } from "@/lib/berkshire/config";
import { createChatSession, loadStoredChatSession, persistChatSession, type StoredChatSession } from "@/lib/chat-storage";
import { ChatMessage } from "./chat-message";

function BerkshireChatRuntime({
  initialSession,
  onResetSession,
}: Readonly<{
  initialSession: StoredChatSession;
  onResetSession: (nextSession: StoredChatSession) => void;
}>) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, error, status, stop, setMessages } = useChat({
    id: initialSession.threadId,
    messages: initialSession.messages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        memory: {
          thread: initialSession.threadId,
          resource: DEFAULT_CHAT_RESOURCE_ID,
        },
      },
    }),
  });

  const isStreaming = status === "submitted" || status === "streaming";

  useEffect(() => {
    persistChatSession({
      threadId: initialSession.threadId,
      messages,
    });
  }, [initialSession.threadId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  async function submitPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || isStreaming) {
      return;
    }

    setInput("");
    await sendMessage({ text: trimmed });
  }

  function handleReset() {
    stop();
    setMessages([]);

    const nextSession = createChatSession();
    persistChatSession(nextSession);

    startTransition(() => {
      onResetSession(nextSession);
    });
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-base font-semibold text-slate-950">
            Berkshire Hathaway Intelligence
          </h1>
          <p className="text-sm text-slate-500">Shareholder letters, 1977-2024</p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          New chat
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-80 items-center justify-center">
            <div className="w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-slate-950">
                Ask about Buffett, Berkshire, or the letters.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Answers are grounded in Berkshire Hathaway shareholder letters
                and include the relevant years.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {SAMPLE_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void submitPrompt(question)}
                    disabled={isStreaming}
                    className="border border-slate-200 bg-white px-4 py-3 text-left text-sm leading-6 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isPending={
                  isStreaming &&
                  message.role === "assistant" &&
                  index === messages.length - 1
                }
              />
            ))}

            {isStreaming ? (
              <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Searching the letters...
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submitPrompt(input);
          }}
        >
          <label className="sr-only" htmlFor="chat-input">
            Ask a question about Warren Buffett or Berkshire Hathaway
          </label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submitPrompt(input);
              }
            }}
            placeholder="Ask a question about Buffett or Berkshire..."
            className="min-h-24 w-full resize-none border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500"
          />

          <div className="flex justify-end gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={() => stop()}
                className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Stop
              </button>
            ) : null}

            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function BerkshireChat() {
  const [session, setSession] = useState<StoredChatSession | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setSession(loadStoredChatSession());
    });
  }, []);

  if (!session) {
    return (
      <section className="flex min-h-0 flex-1 items-center justify-center px-6 py-16 sm:px-8">
        <div className="text-sm text-slate-500">Loading conversation...</div>
      </section>
    );
  }

  return (
    <BerkshireChatRuntime
      initialSession={session}
      onResetSession={(nextSession) => setSession(nextSession)}
    />
  );
}
