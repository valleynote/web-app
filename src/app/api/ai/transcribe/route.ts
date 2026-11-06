import { z } from "zod";
import { getTranscriptionModel } from "@/lib/ai/config";
import { requireAiAccess } from "@/lib/ai/guard";
import { logAiUsage } from "@/lib/ai/quota";
import { transcribeAudio } from "@/lib/ai/transcribe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024;

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    typeof (value as File).arrayBuffer === "function"
  );
}

export async function POST(req: Request) {
  try {
    const access = await requireAiAccess();
    if (!access.ok) return access.response;
    const { session } = access;

    const form = await req.formData();
    const noteIdRaw = form.get("noteId");
    const noteId =
      typeof noteIdRaw === "string" && noteIdRaw.length > 0
        ? z.string().parse(noteIdRaw)
        : null;
    const entry = form.get("audio");
    if (!isUploadFile(entry) || entry.size === 0) {
      return Response.json({ error: "Record or choose an audio file" }, { status: 400 });
    }
    if (entry.size > MAX_BYTES) {
      return Response.json({ error: "Audio must be under 25 MB" }, { status: 400 });
    }

    const type = entry.type || "audio/webm";
    if (!type.startsWith("audio/") && type !== "video/webm") {
      return Response.json({ error: "File must be audio" }, { status: 400 });
    }

    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId: session.user.id, deletedAt: null },
        select: { id: true },
      });
      if (!note) {
        return Response.json({ error: "Note not found" }, { status: 404 });
      }
    }

    const text = await transcribeAudio(
      entry,
      entry.name || "voice-note.webm",
    );

    await logAiUsage({
      userId: session.user.id,
      feature: "transcribe",
      model: getTranscriptionModel(),
      tokensIn: Math.ceil(entry.size / 1000),
      tokensOut: Math.ceil(text.length / 4),
    });

    return Response.json({ ok: true, text });
  } catch (err) {
    console.error("transcribe failed:", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Could not transcribe audio",
      },
      { status: 400 },
    );
  }
}
