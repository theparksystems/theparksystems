import { createServer } from "node:http";
import next from "next";

const port = Number.parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.BIND_HOST || "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  handle(req, res);
}).listen(port, hostname, () => {
  console.log(`PARKSystems listening on http://${hostname}:${port}`);
});
