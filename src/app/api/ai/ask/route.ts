import { isStepCount, streamText } from "ai";
import { z } from "zod";
import { createAgentTools, type AgentAction } from "@/lib/ai/agent-tools";
import { buildAskSystemPrompt } from "@/lib/ai/ask-system";
import { aiConfig } from "@/lib/ai/config";
import { requireAiAccess } from "@/lib/ai/guard";
import { getLanguageModel } from "@/lib/ai/provider";
import { logAiUsage } from "@/lib/ai/quota";
import { retrieveNotesForQuestion } from "@/lib/ai/retrieve";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  question: z.string().min(1).max(4000),
  threadId: z.string().optional(),
  scope: z.enum(["all", "notebook", "note"]).optional(),
  scopeId: z.string().optional(),
});

type Source = { id: string; title: string; index: number };

type StreamEvent =
  | { type: "meta"; threadId: string; sources: Source[] }
  | { type: "action"; action: AgentAction }
  | { type: "text"; text: string }
  | { type: "sources"; sources: Source[] }
  | { type: "done" };

/** Only keep notes the model actually cited as [1], [2], … */
function filterCitedSources(text: string, all: Source[]): Source[] {
  if (!text || all.length === 0) return [];
  const used = new Set<number>();
  for (const match of text.matchAll(/\[(\d+)\]/g)) {
    used.add(Number(match[1]));
  }
  if (used.size === 0) return [];
  return all.filter((s) => used.has(s.index));
}

function encodeEvent(event: StreamEvent) {
  return `${JSON.stringify(event)}\n`;
}

export async function POST(req: Request) {
  const access = await requireAiAccess();
  if (!access.ok) return access.response;
  const { session } = access;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const question = parsed.data.question.trim();
  const userId = session.user.id;

  let threadId = parsed.data.threadId;
  if (threadId) {
    const owned = await prisma.chatThread.findFirst({
      where: { id: threadId, userId },
      select: { id: true },
    });
    if (!owned) threadId = undefined;
  }

  if (!threadId) {
    const thread = await prisma.chatThread.create({
      data: {
        userId,
        title: question.slice(0, 60) || "New chat",
        scope: parsed.data.scope ?? "all",
        scopeId: parsed.data.scopeId ?? null,
      },
    });
    threadId = thread.id;
  }

  const priorMessages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    take: 24,
    select: { role: true, content: true },
  });

  await prisma.chatMessage.create({
    data: {
      threadId,
      role: "user",
      content: question,
    },
  });

  const hits = await retrieveNotesForQuestion(userId, question, 6);

  const sources: Source[] = hits.map((n, i) => ({
    id: n.id,
    title: n.title || "Untitled",
    index: i + 1,
  }));

  const context = hits
    .map(
      (n, i) =>
        `[${i + 1}] id=${n.id} · ${n.title || "Untitled"}\n${n.contentText || ""}`,
    )
    .join("\n\n---\n\n");

  const actions: AgentAction[] = [];
  const tools = createAgentTools(userId, (action) => {
    actions.push(action);
  });

  const history = priorMessages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const encoder = new TextEncoder();

  try {
    const result = streamText({
      model: getLanguageModel(),
      system: buildAskSystemPrompt(context),
      messages: [...history, { role: "user", content: question }],
      tools,
      stopWhen: isStepCount(6),
      onFinish: async ({ usage, text }) => {
        const cited = filterCitedSources(text, sources);
        await prisma.chatMessage.create({
          data: {
            threadId: threadId!,
            role: "assistant",
            content: text,
            citations: {
              sources: cited,
              actions,
            },
            tokensIn: usage.inputTokens ?? 0,
            tokensOut: usage.outputTokens ?? 0,
          },
        });
        await prisma.chatThread.update({
          where: { id: threadId! },
          data: { updatedAt: new Date() },
        });
        await logAiUsage({
          userId,
          feature: "ask_notes",
          model: aiConfig.chatModel,
          tokensIn: usage.inputTokens ?? 0,
          tokensOut: usage.outputTokens ?? 0,
        });
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        let actionCursor = 0;
        let assembled = "";
        const flushActions = () => {
          while (actionCursor < actions.length) {
            const action = actions[actionCursor++];
            controller.enqueue(
              encoder.encode(encodeEvent({ type: "action", action })),
            );
          }
        };

        controller.enqueue(
          encoder.encode(
            encodeEvent({ type: "meta", threadId: threadId!, sources: [] }),
          ),
        );

        try {
          for await (const part of result.fullStream) {
            if (
              part.type === "tool-result" ||
              part.type === "tool-call" ||
              part.type === "finish-step"
            ) {
              flushActions();
            }
            if (part.type === "text-delta") {
              flushActions();
              const text = "text" in part ? String(part.text ?? "") : "";
              if (text) {
                assembled += text;
                controller.enqueue(
                  encoder.encode(encodeEvent({ type: "text", text })),
                );
              }
            }
          }

          flushActions();
          const cited = filterCitedSources(assembled, sources);
          controller.enqueue(
            encoder.encode(encodeEvent({ type: "sources", sources: cited })),
          );
          controller.enqueue(encoder.encode(encodeEvent({ type: "done" })));
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "AI provider unavailable";
          controller.enqueue(
            encoder.encode(
              encodeEvent({
                type: "text",
                text: message.includes("API_KEY")
                  ? "I found related notes, but an AI API key is not configured yet."
                  : `Could not reach the AI provider: ${message}`,
              }),
            ),
          );
          controller.enqueue(
            encoder.encode(encodeEvent({ type: "sources", sources: [] })),
          );
          controller.enqueue(encoder.encode(encodeEvent({ type: "done" })));
          controller.close();
        }
      },
    });

    const citedHeader = Buffer.from(JSON.stringify([])).toString("base64url");

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-ValleyNote-Sources": citedHeader,
        "X-ValleyNote-Thread": threadId,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI provider unavailable";
    const fallback = message.includes("API_KEY")
      ? "I found related notes, but an AI API key is not configured yet."
      : `Could not reach the AI provider: ${message}`;

    await prisma.chatMessage.create({
      data: {
        threadId,
        role: "assistant",
        content: fallback,
        citations: { sources: [], actions: [] },
      },
    });

    const body =
      encodeEvent({ type: "meta", threadId, sources: [] }) +
      encodeEvent({ type: "text", text: fallback }) +
      encodeEvent({ type: "sources", sources: [] }) +
      encodeEvent({ type: "done" });

    return new Response(encoder.encode(body), {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "X-ValleyNote-Sources": Buffer.from("[]").toString("base64url"),
        "X-ValleyNote-Thread": threadId,
      },
    });
  }
}
