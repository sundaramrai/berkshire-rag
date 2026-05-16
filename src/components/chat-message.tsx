import type { UIMessage } from "ai";
import { Fragment } from "react";

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

function renderInlineText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((segment) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={segment}>{segment.slice(2, -2)}</strong>;
    }

    return <Fragment key={segment}>{segment}</Fragment>;
  });
}

function renderAssistantText(text: string) {
  const blocks = text.trim().split(/\n{2,}/);

  return blocks.map((block) => {
    const lines = block.split("\n");
    const isList = lines.every((line) => line.trim().startsWith("- "));

    if (isList) {
      return (
        <ul key={block} className="list-disc space-y-1 pl-5">
          {lines.map((line) => (
            <li key={line}>{renderInlineText(line.replace(/^\s*-\s*/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={block}>
        {lines.map((line, lineIndex) => (
          <Fragment key={`${line}-${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {renderInlineText(line)}
          </Fragment>
        ))}
      </p>
    );
  });
}

export function ChatMessage({
  message,
  isPending = false,
}: Readonly<{ message: UIMessage; isPending?: boolean }>) {
  const isUser = message.role === "user";
  const sources = extractSources(message);
  const text = extractMessageText(message);
  let messageContent: React.ReactNode;

  if (text) {
    messageContent = isUser ? text : renderAssistantText(text);
  } else if (isPending) {
    messageContent = "Thinking...";
  } else {
    messageContent = "No text returned.";
  }

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

        <div className="space-y-3 text-[15px] leading-7">
          {messageContent}
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
