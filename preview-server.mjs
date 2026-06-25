import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const preferredPort = Number(process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] || 4181);
const host = "127.0.0.1";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function safePathFromUrl(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}`).pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = resolve(root, relativePath);
  return filePath.startsWith(root) ? filePath : null;
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function createPreviewServer(port) {
  const server = createServer(async (request, response) => {
    const filePath = safePathFromUrl(request.url || "/");
    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const resolvedPath = (await fileExists(filePath)) ? filePath : resolve(root, "index.html");
    try {
      const content = await readFile(resolvedPath);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": mimeTypes[extname(resolvedPath).toLowerCase()] || "application/octet-stream",
      });
      response.end(content);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, host, () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });

  return server;
}

async function start() {
  for (let port = preferredPort; port < preferredPort + 20; port += 1) {
    try {
      await createPreviewServer(port);
      console.log(`Local preview ready: http://${host}:${port}/index.html`);
      console.log("Press Ctrl+C to stop.");
      return;
    } catch (error) {
      if (error.code !== "EADDRINUSE") throw error;
    }
  }

  throw new Error(`No available port found from ${preferredPort} to ${preferredPort + 19}.`);
}

start().catch((error) => {
  console.error(`Preview server failed: ${error.message}`);
  process.exitCode = 1;
});
