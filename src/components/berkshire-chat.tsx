"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { startTransition, useEffect, useState } from "react";
import { DEFAULT_CHAT_RESOURCE_ID, SAMPLE_QUESTIONS } from "@/lib/berkshire/config";
import { createChatSession, loadStoredChatSession, persistChatSession, resetStoredChatSession, type StoredChatSession } from "@/lib/chat-storage";
import { ChatMessage } from "./chat-message";

function BerkshireChatRuntime({
  initialSession,
  onResetSession,
}: Readonly<{
  initialSession: StoredChatSession;
  onResetSession: (nextSession: StoredChatSession) => void;
}>) {
  const [input, setInput] = useState("");

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
    resetStoredChatSession(nextSession);

    startTransition(() => {
      onResetSession(nextSession);
    });
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-4 border-b border-amber-900/10 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-8">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Suggested prompts
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void submitPrompt(question)}
                disabled={isStreaming}
                className="rounded-full border border-amber-900/10 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-emerald-700/20 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-start sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            New conversation
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-96 items-center justify-center">
            <div className="max-w-xl rounded-[1.75rem] border border-amber-900/10 bg-white/80 p-8 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-700">
                Ready for retrieval
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                Start with Buffett, valuation, acquisitions, or risk.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                The agent is instructed to answer strictly from Berkshire
                Hathaway shareholder letters and to cite the relevant year in
                every grounded answer.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message, index) => (
              <ChatMessage key={message.id} message={message}
                isPending={isStreaming && message.role === "assistant" && index === messages.length - 1}
              />
            ))}

            {isStreaming ? (
              <div className="rounded-3xl border border-amber-900/10 bg-white/80 px-5 py-4 text-sm text-slate-500 shadow-sm">
                Searching Berkshire letters and drafting a grounded response...
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="border-t border-amber-900/10 bg-white/70 px-6 py-5 sm:px-8">
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
            placeholder="Ask about Buffett's investment philosophy, Berkshire's acquisitions, or changes across the 1977 to 2024 letters..."
            className="min-h-28 w-full resize-none rounded-3xl border border-amber-900/10 bg-[#fffdf8] px-5 py-4 text-sm leading-7 text-slate-900 outline-none transition focus:border-emerald-700/30 focus:ring-4 focus:ring-emerald-500/10"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Thread ID:{" "}
              <span className="font-mono text-xs text-slate-700">
                {initialSession.threadId}
              </span>
            </div>

            <div className="flex gap-3">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Stop
                </button>
              ) : null}

              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="rounded-full bg-emerald-900 px-5 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ask Berkshire AI
              </button>
            </div>
          </div>
        </form>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
