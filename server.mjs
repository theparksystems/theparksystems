import { createServer } from "node:http";
import next from "next";
import {
  askSqliteMemory,
  clearSqliteMemory,
  getSqliteMemoryStats,
} from "./lib/aria-sqlite-memory.js";

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.BIND_HOST || "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "manifest-src 'self'",
      "worker-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
      "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
    ].join("; "),
  );

  if (req.url) {
    const requestUrl = new URL(req.url, `http://${req.headers.host || hostname}`);
    if (requestUrl.pathname === "/api/aria-memory") {
      await handleAriaMemoryRequest(req, res);
      return;
    }
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 405;
    res.end();
    return;
  }

  handle(req, res);
}).listen(port, hostname, () => {
  console.log(`The Park Systems listening on http://${hostname}:${port}`);
});

async function handleAriaMemoryRequest(req, res) {
  if (req.method !== "POST") {
    writeJson(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const sessionId = body.sessionId || "default";

    if (body.type === "clear") {
      writeJson(res, 200, clearSqliteMemory(sessionId));
      return;
    }

    if (body.type === "stats") {
      writeJson(res, 200, { ok: true, stats: getSqliteMemoryStats(sessionId) });
      return;
    }

    writeJson(res, 200, { ok: true, ...askSqliteMemory(sessionId, body.text || "") });
  } catch {
    writeJson(res, 500, {
      ok: false,
      message: "ARIA SQLite memory is unavailable right now.",
    });
  }
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16 * 1024) {
      throw new Error("Request body too large.");
    }
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function writeJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
