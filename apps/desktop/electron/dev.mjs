import { spawn } from "node:child_process";
import process from "node:process";
import { createServer } from "vite";

const server = await createServer({
  configFile: "vite.config.ts",
  server: {
    host: "127.0.0.1",
    strictPort: false
  }
});

await server.listen();
server.printUrls();

const rendererUrl =
  server.resolvedUrls?.local?.[0] ??
  (() => {
    const address = server.httpServer?.address();
    if (address && typeof address === "object") {
      return `http://127.0.0.1:${address.port}/`;
    }

    throw new Error("Não foi possível descobrir a URL do Vite.");
  })();

const electron = spawn("npm", ["run", "electron:start"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    ELECTRON_RENDERER_URL: rendererUrl
  },
  shell: true,
  stdio: "inherit"
});

async function shutdown(code = 0) {
  electron.kill();
  await server.close();
  process.exit(code);
}

electron.on("exit", (code) => {
  void shutdown(code ?? 0);
});

process.on("SIGINT", () => {
  void shutdown(0);
});

process.on("SIGTERM", () => {
  void shutdown(0);
});
