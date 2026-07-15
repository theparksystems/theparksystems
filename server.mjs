import { createServer } from "node:http";
import next from "next";

const port = Number.parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.BIND_HOST || "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

createServer((req, res) => {
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

  if (req.method === "OPTIONS") {
    res.statusCode = 405;
    res.end();
    return;
  }

  handle(req, res);
}).listen(port, hostname, () => {
  console.log(`The Park Systems listening on http://${hostname}:${port}`);
});
