import { createHash } from "node:crypto";
import { aiConfig } from "@/lib/ai/config";

export function hashContent(text: string) {
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}

/** Split note text into overlapping chunks for embedding. */
export function chunkText(
  text: string,
  size = aiConfig.chunkSize,
  overlap = aiConfig.chunkOverlap,
): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  if (cleaned.length <= size) return [cleaned];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    let end = Math.min(start + size, cleaned.length);
    if (end < cleaned.length) {
      const slice = cleaned.slice(start, end);
      const lastBreak = Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("; "),
      );
      if (lastBreak > size * 0.4) {
        end = start + lastBreak + 1;
      }
    }
    const piece = cleaned.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= cleaned.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}
