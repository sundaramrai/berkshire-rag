import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBerkshireLetterSourceLink, getBerkshireLetterYearsFromText } from "@/lib/berkshire/source-links";

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

function createDisplayedSources(message: UIMessage, text: string) {
  const structuredSources = extractSources(message).map((source) => {
    const label =
      source.type === "source-document"
        ? source.filename || source.title
        : source.title || source.url;

    return {
      key: `${source.type}-${source.sourceId}`,
      label,
      href: getBerkshireLetterSourceLink(label),
    };
  });

  if (structuredSources.some((source) => source.href)) {
    return structuredSources;
  }

  return getBerkshireLetterYearsFromText(text).map((year) => ({
    key: `year-${year}`,
    label: `${year} letter`,
    href: getBerkshireLetterSourceLink(year),
  }));
}

function removeTrailingSourcesSection(text: string) {
  return text
    .replace(/\n+(?:\*\*)?Sources used:?(?:\*\*)?[\s\S]*$/i, "")
    .trim();
}

function renderAssistantText(text: string) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, href }) =>
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-500"
            >
              {children}
            </a>
          ) : (
            <>{children}</>
          ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-slate-300 pl-4 text-slate-700">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-slate-100 px-1 py-0.5 text-[0.92em] text-slate-800">
            {children}
          </code>
        ),
        h1: ({ children }) => <h1 className="text-xl font-semibold">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold">{children}</h3>,
        ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
        p: ({ children }) => <p>{children}</p>,
        pre: ({ children }) => (
          <pre className="overflow-x-auto bg-slate-950 p-4 text-sm leading-6 text-slate-100">
            {children}
          </pre>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm leading-6">
              {children}
            </table>
          </div>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        td: ({ children }) => (
          <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-700">
            {children}
          </td>
        ),
        th: ({ children }) => (
          <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">
            {children}
          </th>
        ),
        thead: ({ children }) => <thead>{children}</thead>,
        tr: ({ children }) => <tr>{children}</tr>,
        ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export function ChatMessage({
  message,
  isPending = false,
}: Readonly<{ message: UIMessage; isPending?: boolean }>) {
  const isUser = message.role === "user";
  const text = extractMessageText(message);
  const sources = createDisplayedSources(message, text);
  const displayText = !isUser && sources.length > 0 ? removeTrailingSourcesSection(text) : text;
  let messageContent: React.ReactNode;

  if (displayText) {
    messageContent = isUser ? displayText : renderAssistantText(displayText);
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
              {sources.map(({ key, label, href }) => {
                const className =
                  "border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700";

                return href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${className} transition hover:border-slate-300 hover:bg-white hover:text-slate-950`}
                  >
                    {label}
                  </a>
                ) : (
                  <span
                    key={key}
                    className={className}
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
