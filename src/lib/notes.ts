/** TipTap-compatible empty doc — keep free of @tiptap/* imports (server-safe). */
export function emptyDoc() {
  return {
    type: "doc" as const,
    content: [{ type: "paragraph" }],
  };
}

/** Plain text → TipTap doc (agent / import safe, no editor deps). */
export function plainTextToDoc(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trimEnd();
  if (!normalized.trim()) return emptyDoc();

  const content = normalized.split("\n").map((line) => ({
    type: "paragraph" as const,
    content: line
      ? [{ type: "text" as const, text: line }]
      : ([] as { type: "text"; text: string }[]),
  }));

  return { type: "doc" as const, content };
}

export function jsonToPlainText(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const parts: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (n.type === "text" && typeof n.text === "string") {
      parts.push(n.text);
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child);
      if (
        n.type === "paragraph" ||
        n.type === "heading" ||
        n.type === "blockquote" ||
        n.type === "codeBlock" ||
        n.type === "listItem" ||
        n.type === "taskItem"
      ) {
        parts.push("\n");
      }
    }
  }

  walk(doc);
  return parts.join("").replace(/\n{3,}/g, "\n\n").trim();
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function readingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}
