import type { UIMessage } from "ai";

function extractMessageText(message: UIMessage) {
  const text =
    message.parts
      ?.filter(
        (part): part is Extract<UIMessage["parts"][number], { type: "text" }> =>
          part.type === "text",
      )
      .map((part) => part.text)
      .join("") ?? "";

  if (text || message.role === "user") {
    return text;
  }

  return "";
}

function extractSources(message: UIMessage) {
  return (
    message.parts?.filter(
      (part): part is
        | Extract<UIMessage["parts"][number], { type: "source-url" }>
        | Extract<UIMessage["parts"][number], { type: "source-document" }> =>
        part.type === "source-url" || part.type === "source-document",
    ) ?? []
  );
}

export function ChatMessage({
  message,
  isPending = false,
}: Readonly<{ message: UIMessage; isPending?: boolean }>) {
  const isUser = message.role === "user";
  const sources = extractSources(message);
  const text = extractMessageText(message);

  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-[1.6rem] px-5 py-4 shadow-sm ${isUser
          ? "bg-emerald-900 text-emerald-50"
          : "border border-amber-900/10 bg-white/85 text-slate-900"
          }`}
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          <span className={isUser ? "text-emerald-100/80" : "text-slate-500"}>
            {isUser ? "You" : "Berkshire AI"}
          </span>
        </div>

        <div className="whitespace-pre-wrap text-sm leading-7">
          {text || (isPending ? "Thinking..." : "No text returned.")}
        </div>

        {!isUser && sources.length > 0 ? (
          <div className="mt-4 border-t border-amber-900/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sources
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sources.map((source) => {
                const label =
                  source.type === "source-document"
                    ? source.filename || source.title
                    : source.title || source.url;

                return (
                  <span
                    key={`${source.type}-${source.sourceId}`}
                    className="rounded-full border border-amber-900/10 bg-amber-50 px-3 py-1 text-xs text-slate-700"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
