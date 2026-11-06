import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import sharp from "sharp";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function assertImageUpload(file: {
  type: string;
  size: number;
  maxBytes?: number;
}) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("File must be a JPEG, PNG, WebP, GIF, or AVIF image");
  }
  const max = file.maxBytes ?? MAX_BYTES;
  if (file.size > max) {
    throw new Error(`Image must be under ${Math.round(max / (1024 * 1024))} MB`);
  }
}

export async function saveNoteImage(input: {
  userId: string;
  buffer: Buffer;
}): Promise<{ key: string; publicUrl: string; size: number; mimeType: string }> {
  // Re-encode via sharp so untrusted payloads never land as-is on disk.
  const optimized = await sharp(input.buffer, { failOn: "warning" })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const id = nanoid(16);
  const relative = path.posix.join("uploads", "notes", input.userId, `${id}.webp`);
  const absolute = path.join(process.cwd(), "public", relative);

  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, optimized);

  return {
    key: relative,
    publicUrl: `/${relative}`,
    size: optimized.byteLength,
    mimeType: "image/webp",
  };
}
