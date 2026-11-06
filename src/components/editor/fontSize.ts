import type { Editor } from "@tiptap/react";

export const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
] as const;

export type FontSizeValue = (typeof FONT_SIZES)[number];

export function getSelectionFontSize(editor: Editor): string {
  return (editor.getAttributes("textStyle").fontSize as string | null) || "16px";
}

export function bumpSelectionFontSize(editor: Editor, direction: 1 | -1) {
  if (!editor.state.selection || editor.state.selection.empty) return false;
  const current = getSelectionFontSize(editor);
  const idx = FONT_SIZES.findIndex((size) => size === current);
  const from = idx === -1 ? FONT_SIZES.indexOf("16px") : idx;
  const next = FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, from + direction))];
  if (!next || next === current) return false;
  return editor.chain().focus().setFontSize(next).run();
}
