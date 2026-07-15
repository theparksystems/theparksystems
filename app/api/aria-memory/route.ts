import {
  askSqliteMemory,
  clearSqliteMemory,
  getSqliteMemoryStats,
} from "@/lib/aria-sqlite-memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MemoryRequest = {
  type?: "ask" | "clear" | "stats";
  sessionId?: string;
  text?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MemoryRequest;
    const sessionId = body.sessionId || "default";

    if (body.type === "clear") {
      return Response.json(clearSqliteMemory(sessionId));
    }

    if (body.type === "stats") {
      return Response.json({ ok: true, stats: getSqliteMemoryStats(sessionId) });
    }

    const result = askSqliteMemory(sessionId, body.text || "");
    return Response.json({ ok: true, ...result });
  } catch {
    return Response.json(
      {
        ok: false,
        message: "ARIA SQLite memory is unavailable right now.",
      },
      { status: 500 },
    );
  }
}
