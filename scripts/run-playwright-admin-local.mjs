import { spawn } from "node:child_process";
import net from "node:net";

const isWin = process.platform === "win32";
const npmCommand = isWin ? "npm.cmd" : "npm";
const nodeCommand = isWin ? "node.exe" : "node";

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close(() => {
        if (!port) {
          reject(new Error("Unable to determine a free port."));
          return;
        }
        resolve(port);
      });
    });
    server.on("error", reject);
  });
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait for the server to become reachable.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function main() {
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    ADMIN_AUTH_MODE: "token",
    ADMIN_ACCESS_TOKEN: "local-admin-token",
    PLAYWRIGHT_BASE_URL: baseUrl,
    PLAYWRIGHT_ALLOW_REMOTE: "1",
  };

  const server = spawn(npmCommand, ["run", "start", "--", "-p", String(port)], {
    stdio: "inherit",
    env,
    shell: isWin,
  });

  let shuttingDown = false;
  function shutdown(code = 0) {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    server.kill();
    process.exit(code);
  }

  server.on("exit", (code) => {
    if (!shuttingDown) {
      process.exit(code ?? 1);
    }
  });

  await waitForServer(baseUrl);

  const runner = spawn(nodeCommand, ["scripts/run-playwright.mjs", "tests/admin-api-local.spec.ts"], {
    stdio: "inherit",
    env,
    shell: isWin,
  });

  runner.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    shutdown(code ?? 1);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
