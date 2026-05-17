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

function createKeyedItems(values: string[]) {
  const seen = new Map<string, number>();
  let position = 0;

  return values.map((value) => {
    const count = seen.get(value) ?? 0;
    seen.set(value, count + 1);

    return {
      key: `${value}:${count}`,
      value,
      isFirst: position++ === 0,
    };
  });
}

function renderInlineText(text: string) {
  const segments = createKeyedItems(text.split(/(\*\*.*?\*\*)/g));

  return segments.map(({ key, value }) => {
    if (value.startsWith("**") && value.endsWith("**")) {
      return <strong key={key}>{value.slice(2, -2)}</strong>;
    }

    return <Fragment key={key}>{value}</Fragment>;
  });
}

function renderAssistantText(text: string) {
  const blocks = createKeyedItems(text.trim().split(/\n{2,}/));

  return blocks.map(({ key, value: block }) => {
    const lines = createKeyedItems(block.split("\n"));
    const isList = lines.every(({ value }) => value.trim().startsWith("- "));

    if (isList) {
      return (
        <ul key={key} className="list-disc space-y-1 pl-5">
          {lines.map(({ key: lineKey, value }) => (
            <li key={lineKey}>
              {renderInlineText(value.replace(/^\s*-\s*/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={key}>
        {lines.map(({ key: lineKey, value, isFirst }) => (
          <Fragment key={lineKey}>
            {isFirst ? null : <br />}
            {renderInlineText(value)}
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
