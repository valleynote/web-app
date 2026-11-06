import type { Editor } from "@tiptap/react";
import { parseVideoUrl } from "@/lib/video-url";

export async function uploadNoteImage(noteId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("noteId", noteId);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Upload failed");
  }
  return data.url;
}

export async function insertImageFile(
  editor: Editor,
  noteId: string,
  file: File,
) {
  const url = await uploadNoteImage(noteId, file);
  // insertContent with a plain attrs object (avoids null-prototype attr loss on save)
  editor
    .chain()
    .focus()
    .insertContent({
      type: "image",
      attrs: { src: url, alt: file.name || null, title: null },
    })
    .run();
}

export function insertVideoFromUrl(editor: Editor, rawUrl: string): boolean {
  const parsed = parseVideoUrl(rawUrl);
  if (!parsed) return false;
  editor
    .chain()
    .focus()
    .setVideoEmbed({ src: parsed.embedUrl, provider: parsed.provider })
    .run();
  return true;
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function isImageFile(file: File) {
  return ALLOWED_IMAGE_TYPES.has(file.type);
}
