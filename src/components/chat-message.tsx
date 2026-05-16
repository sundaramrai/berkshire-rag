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
        className={`max-w-3xl px-4 py-3 ${isUser
          ? "bg-slate-950 text-white"
          : "border border-slate-200 bg-white text-slate-900"
          }`}
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className={isUser ? "text-slate-300" : "text-slate-500"}>
            {isUser ? "You" : "Berkshire AI"}
          </span>
        </div>

        <div className="whitespace-pre-wrap text-sm leading-6">
          {text || (isPending ? "Thinking..." : "No text returned.")}
        </div>

        {!isUser && sources.length > 0 ? (
          <div className="mt-4 border-t border-slate-200 pt-3">
            <p className="text-xs font-medium text-slate-500">
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
                    className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
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
