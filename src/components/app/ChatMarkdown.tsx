"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

const components: Components = {
  p: ({ children }) => (
    <p className="mb-2.5 last:mb-0 whitespace-pre-wrap">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-2.5 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2.5 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-blue underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-bg-soft px-1.5 py-0.5 font-switzer text-[13px] text-ink">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-2.5 overflow-x-auto rounded-[12px] border border-bg-border bg-bg-soft p-3 font-switzer text-[13px] last:mb-0">
      {children}
    </pre>
  ),
  h1: ({ children }) => (
    <h3 className="mb-2 font-inter-tight text-[18px] font-semibold tracking-[-0.02em] text-ink">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 font-inter-tight text-[17px] font-semibold tracking-[-0.02em] text-ink">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 font-inter-tight text-[15px] font-semibold tracking-[-0.02em] text-ink">
      {children}
    </h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2.5 border-l-2 border-blue/30 pl-3 text-muted last:mb-0">
      {children}
    </blockquote>
  ),
};

export default function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="ask-md font-switzer text-[15px] leading-relaxed text-ink">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
