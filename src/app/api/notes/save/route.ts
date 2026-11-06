import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { saveNoteForUser } from "@/lib/notes/save-note";

export const runtime = "nodejs";

const saveSchema = z.object({
  noteId: z.string().min(1),
  title: z.string().max(200),
  contentJson: z.unknown(),
  version: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = saveSchema.parse(await req.json());
    const result = await saveNoteForUser(session.user.id, body);
    return Response.json(result);
  } catch (err) {
    console.error("note save failed:", err);
    const message =
      err instanceof Error ? err.message : "Could not save note";
    return Response.json({ error: message }, { status: 400 });
  }
}
