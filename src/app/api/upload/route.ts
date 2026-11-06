import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertImageUpload, saveNoteImage } from "@/lib/uploads";

export const runtime = "nodejs";

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "size" in value &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number"
  );
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const burst = checkRateLimit(`upload:${session.user.id}`, {
      limit: 30,
      windowMs: 60_000,
    });
    if (!burst.ok) {
      return Response.json(
        { error: "Too many uploads. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(burst.retryAfterSec) },
        },
      );
    }

    const form = await req.formData();
    const noteId = z.string().min(1).parse(form.get("noteId"));
    const entry = form.get("file");

    if (!isUploadFile(entry) || entry.size === 0) {
      return Response.json({ error: "Please choose an image" }, { status: 400 });
    }

    if (!entry.type) {
      return Response.json(
        { error: "Image type is required" },
        { status: 400 },
      );
    }

    assertImageUpload({ type: entry.type, size: entry.size });

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: session.user.id, deletedAt: null },
      select: { id: true },
    });
    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await entry.arrayBuffer());
    const saved = await saveNoteImage({
      userId: session.user.id,
      buffer,
    });

    const attachment = await prisma.attachment.create({
      data: {
        userId: session.user.id,
        noteId: note.id,
        key: saved.key,
        mimeType: saved.mimeType,
        size: saved.size,
      },
    });

    return Response.json({
      ok: true,
      url: saved.publicUrl,
      attachmentId: attachment.id,
      mimeType: saved.mimeType,
      size: saved.size,
    });
  } catch (err) {
    console.error("upload failed:", err);
    const message =
      err instanceof Error ? err.message : "Could not upload image";
    return Response.json({ error: message }, { status: 400 });
  }
}
