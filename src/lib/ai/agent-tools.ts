import { tool } from "ai";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { countWords, emptyDoc, plainTextToDoc } from "@/lib/notes";
import { scheduleNoteReindex } from "@/lib/ai/reindex";
import { retrieveNotesForQuestion } from "@/lib/ai/retrieve";
import { getPlan } from "@/lib/plans";

export type AgentAction = {
  type:
    | "search_notes"
    | "list_notebooks"
    | "create_notebook"
    | "rename_notebook"
    | "archive_notebook"
    | "create_note"
    | "update_note"
    | "delete_note"
    | "restore_note"
    | "favorite_note";
  label: string;
  noteId?: string;
  notebookId?: string;
  title?: string;
};

async function ensureNoteQuota(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const plan = getPlan(sub?.plan ?? "free");
  if (plan.maxNotes === null) return;

  const noteCount = await prisma.note.count({
    where: { userId, deletedAt: null },
  });
  if (noteCount >= plan.maxNotes) {
    throw new Error(
      `${plan.name} plan limit reached (${plan.maxNotes} notes). Upgrade for more.`,
    );
  }
}

function revalidateWorkspace() {
  revalidatePath("/app");
}

export function createAgentTools(
  userId: string,
  onAction?: (action: AgentAction) => void,
) {
  const track = (action: AgentAction) => {
    onAction?.(action);
  };

  return {
    search_notes: tool({
      description:
        "Search the user's notes with semantic + keyword retrieval. Use when you need more context than the system notes block.",
      inputSchema: z.object({
        query: z.string().min(1).max(500).describe("Search query"),
        limit: z.number().int().min(1).max(10).optional(),
      }),
      execute: async ({ query, limit }) => {
        const hits = await retrieveNotesForQuestion(userId, query, limit ?? 6);
        track({
          type: "search_notes",
          label: `Searched notes for “${query.slice(0, 48)}”`,
        });
        return {
          results: hits.map((n, i) => ({
            index: i + 1,
            id: n.id,
            title: n.title || "Untitled",
            excerpt: (n.contentText || "").slice(0, 600),
          })),
        };
      },
    }),

    list_notebooks: tool({
      description: "List the user's notebooks with note counts.",
      inputSchema: z.object({}),
      execute: async () => {
        const notebooks = await prisma.notebook.findMany({
          where: { userId, archivedAt: null },
          orderBy: [{ position: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            _count: { select: { notes: { where: { deletedAt: null } } } },
          },
        });
        track({ type: "list_notebooks", label: "Listed notebooks" });
        return {
          notebooks: notebooks.map((n) => ({
            id: n.id,
            name: n.name,
            icon: n.icon,
            color: n.color,
            noteCount: n._count.notes,
          })),
        };
      },
    }),

    create_notebook: tool({
      description: "Create a new notebook for the user.",
      inputSchema: z.object({
        name: z.string().min(1).max(80),
        icon: z.string().max(8).optional(),
      }),
      execute: async ({ name, icon }) => {
        const maxPos = await prisma.notebook.aggregate({
          where: { userId, parentId: null },
          _max: { position: true },
        });
        const notebook = await prisma.notebook.create({
          data: {
            userId,
            name: name.trim(),
            icon: icon?.trim() || "📓",
            color: "#3745f1",
            position: (maxPos._max.position ?? -1) + 1,
          },
        });
        revalidateWorkspace();
        track({
          type: "create_notebook",
          label: `Created notebook “${notebook.name}”`,
          notebookId: notebook.id,
          title: notebook.name,
        });
        return {
          ok: true,
          notebookId: notebook.id,
          name: notebook.name,
          href: `/app/nb/${notebook.id}`,
        };
      },
    }),

    rename_notebook: tool({
      description: "Rename an existing notebook.",
      inputSchema: z.object({
        notebookId: z.string().min(1),
        name: z.string().min(1).max(80),
      }),
      execute: async ({ notebookId, name }) => {
        const existing = await prisma.notebook.findFirst({
          where: { id: notebookId, userId, archivedAt: null },
        });
        if (!existing) return { ok: false, error: "Notebook not found" };

        const notebook = await prisma.notebook.update({
          where: { id: notebookId },
          data: { name: name.trim() },
        });
        revalidateWorkspace();
        track({
          type: "rename_notebook",
          label: `Renamed notebook to “${notebook.name}”`,
          notebookId: notebook.id,
          title: notebook.name,
        });
        return {
          ok: true,
          notebookId: notebook.id,
          name: notebook.name,
          href: `/app/nb/${notebook.id}`,
        };
      },
    }),

    archive_notebook: tool({
      description:
        "Archive a notebook and move its notes to trash. Only use when the user clearly asked to delete/archive that notebook.",
      inputSchema: z.object({
        notebookId: z.string().min(1),
      }),
      execute: async ({ notebookId }) => {
        const existing = await prisma.notebook.findFirst({
          where: { id: notebookId, userId, archivedAt: null },
        });
        if (!existing) return { ok: false, error: "Notebook not found" };

        const now = new Date();
        await prisma.$transaction([
          prisma.note.updateMany({
            where: { notebookId, userId, deletedAt: null },
            data: { deletedAt: now },
          }),
          prisma.notebook.update({
            where: { id: notebookId },
            data: { archivedAt: now },
          }),
        ]);
        revalidateWorkspace();
        track({
          type: "archive_notebook",
          label: `Archived notebook “${existing.name}”`,
          notebookId: existing.id,
          title: existing.name,
        });
        return {
          ok: true,
          notebookId: existing.id,
          name: existing.name,
          notesMovedToTrash: true,
        };
      },
    }),

    create_note: tool({
      description:
        "Create a new note. Optionally set title, body text, and target notebook.",
      inputSchema: z.object({
        title: z.string().max(200).optional(),
        content: z
          .string()
          .max(20_000)
          .optional()
          .describe("Plain-text body for the note"),
        notebookId: z
          .string()
          .optional()
          .describe("Target notebook id; defaults to first notebook"),
        notebookName: z
          .string()
          .max(80)
          .optional()
          .describe("Resolve notebook by name if id unknown"),
      }),
      execute: async ({ title, content, notebookId, notebookName }) => {
        await ensureNoteQuota(userId);

        let notebook =
          notebookId != null
            ? await prisma.notebook.findFirst({
                where: { id: notebookId, userId, archivedAt: null },
              })
            : null;

        if (!notebook && notebookName?.trim()) {
          notebook = await prisma.notebook.findFirst({
            where: {
              userId,
              archivedAt: null,
              name: { equals: notebookName.trim(), mode: "insensitive" },
            },
          });
        }

        if (!notebook) {
          notebook = await prisma.notebook.findFirst({
            where: { userId, archivedAt: null, parentId: null },
            orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          });
        }

        if (!notebook) {
          notebook = await prisma.notebook.create({
            data: {
              userId,
              name: "Getting started",
              icon: "✨",
              color: "#3745f1",
              position: 0,
            },
          });
        }

        const contentJson = content?.trim()
          ? plainTextToDoc(content)
          : emptyDoc();
        const contentText = content?.trim() ?? "";
        const noteTitle = title?.trim() || "Untitled";

        const note = await prisma.note.create({
          data: {
            userId,
            notebookId: notebook.id,
            title: noteTitle,
            contentJson,
            contentText,
            wordCount: countWords(contentText),
          },
        });

        if (contentText) scheduleNoteReindex(note.id, userId);
        revalidateWorkspace();
        track({
          type: "create_note",
          label: `Created note “${note.title}”`,
          noteId: note.id,
          notebookId: notebook.id,
          title: note.title,
        });
        return {
          ok: true,
          noteId: note.id,
          title: note.title,
          notebookId: notebook.id,
          notebookName: notebook.name,
          href: `/app/n/${note.id}`,
        };
      },
    }),

    update_note: tool({
      description:
        "Update a note's title and/or replace its body with plain text.",
      inputSchema: z.object({
        noteId: z.string().min(1),
        title: z.string().max(200).optional(),
        content: z
          .string()
          .max(20_000)
          .optional()
          .describe("Full plain-text replacement body"),
      }),
      execute: async ({ noteId, title, content }) => {
        const existing = await prisma.note.findFirst({
          where: { id: noteId, userId, deletedAt: null },
        });
        if (!existing) return { ok: false, error: "Note not found" };
        if (title === undefined && content === undefined) {
          return { ok: false, error: "Provide title and/or content" };
        }

        const nextTitle =
          title !== undefined
            ? title.trim() || "Untitled"
            : existing.title;
        const contentJson =
          content !== undefined
            ? plainTextToDoc(content)
            : (existing.contentJson as object);
        const contentText =
          content !== undefined ? content : existing.contentText;

        const note = await prisma.note.update({
          where: { id: noteId },
          data: {
            title: nextTitle,
            contentJson,
            contentText,
            wordCount: countWords(contentText),
            version: { increment: 1 },
          },
        });

        scheduleNoteReindex(note.id, userId);
        revalidateWorkspace();
        track({
          type: "update_note",
          label: `Updated note “${note.title}”`,
          noteId: note.id,
          title: note.title,
        });
        return {
          ok: true,
          noteId: note.id,
          title: note.title,
          href: `/app/n/${note.id}`,
        };
      },
    }),

    delete_note: tool({
      description:
        "Move a note to trash (soft delete). Only when the user clearly asked to delete that note.",
      inputSchema: z.object({
        noteId: z.string().min(1),
      }),
      execute: async ({ noteId }) => {
        const existing = await prisma.note.findFirst({
          where: { id: noteId, userId, deletedAt: null },
        });
        if (!existing) return { ok: false, error: "Note not found" };

        await prisma.note.update({
          where: { id: noteId },
          data: { deletedAt: new Date() },
        });
        revalidateWorkspace();
        track({
          type: "delete_note",
          label: `Moved “${existing.title || "Untitled"}” to trash`,
          noteId: existing.id,
          title: existing.title || "Untitled",
        });
        return {
          ok: true,
          noteId: existing.id,
          title: existing.title || "Untitled",
          href: "/app/trash",
        };
      },
    }),

    restore_note: tool({
      description: "Restore a note from trash.",
      inputSchema: z.object({
        noteId: z.string().min(1),
      }),
      execute: async ({ noteId }) => {
        const existing = await prisma.note.findFirst({
          where: { id: noteId, userId, deletedAt: { not: null } },
        });
        if (!existing) return { ok: false, error: "Trashed note not found" };

        await prisma.note.update({
          where: { id: noteId },
          data: { deletedAt: null },
        });
        revalidateWorkspace();
        track({
          type: "restore_note",
          label: `Restored “${existing.title || "Untitled"}”`,
          noteId: existing.id,
          title: existing.title || "Untitled",
        });
        return {
          ok: true,
          noteId: existing.id,
          title: existing.title || "Untitled",
          href: `/app/n/${existing.id}`,
        };
      },
    }),

    favorite_note: tool({
      description: "Star or unstar a note.",
      inputSchema: z.object({
        noteId: z.string().min(1),
        favorite: z.boolean().describe("true to favorite, false to unfavorite"),
      }),
      execute: async ({ noteId, favorite }) => {
        const existing = await prisma.note.findFirst({
          where: { id: noteId, userId, deletedAt: null },
        });
        if (!existing) return { ok: false, error: "Note not found" };

        const note = await prisma.note.update({
          where: { id: noteId },
          data: { isFavorite: favorite },
        });
        revalidateWorkspace();
        track({
          type: "favorite_note",
          label: favorite
            ? `Favorited “${note.title || "Untitled"}”`
            : `Unfavorited “${note.title || "Untitled"}”`,
          noteId: note.id,
          title: note.title || "Untitled",
        });
        return {
          ok: true,
          noteId: note.id,
          title: note.title || "Untitled",
          isFavorite: note.isFavorite,
          href: `/app/n/${note.id}`,
        };
      },
    }),
  };
}
