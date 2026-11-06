import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Liveness/readiness probe.
 * If HEALTH_CHECK_TOKEN is set, require `Authorization: Bearer <token>`
 * or `?token=<token>` so the public internet cannot probe DB reachability.
 */
export async function GET(req: Request) {
  const expected = process.env.HEALTH_CHECK_TOKEN?.trim();
  if (expected) {
    const url = new URL(req.url);
    const bearer = req.headers.get("authorization");
    const fromHeader =
      bearer?.startsWith("Bearer ") ? bearer.slice("Bearer ".length).trim() : "";
    const provided = fromHeader || url.searchParams.get("token") || "";
    if (provided !== expected) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: "valleynote",
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, service: "valleynote" },
      { status: 503 },
    );
  }
}
