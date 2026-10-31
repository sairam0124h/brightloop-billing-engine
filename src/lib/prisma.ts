import { PrismaClient } from "@prisma/client";
import net from "node:net";
import dns from "node:dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

let proxyServer: net.Server | null = null;
const PROXY_PORT = 54332;

function initBridge(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes("neon.tech")) {
      const host = parsed.hostname;
      const endpoint = host.split(".")[0];
      const targetDomain = host.substring(host.indexOf(".") + 1);

      if (!proxyServer) {
        proxyServer = net.createServer(async (clientSocket) => {
          try {
            const addresses = await dns.promises.resolve4(targetDomain).catch(() => ["52.2.183.93"]);
            const targetIp = addresses.find((ip) => !ip.startsWith("100.")) || "52.2.183.93";
            const remote = net.connect(5432, targetIp, () => {
              clientSocket.pipe(remote).pipe(clientSocket);
            });
            remote.on("error", () => clientSocket.destroy());
            clientSocket.on("error", () => remote.destroy());
          } catch {
            clientSocket.destroy();
          }
        });

        proxyServer.on("error", (err: any) => {
          if (err.code === "EADDRINUSE") {
            // Another build or test worker is already running the bridge on this port
            return;
          }
        });

        // Don't keep Node process alive just for the proxy server
        proxyServer.unref();
        try {
          proxyServer.listen(PROXY_PORT, "127.0.0.1");
        } catch {}
      }

      parsed.hostname = "127.0.0.1";
      parsed.port = String(PROXY_PORT);
      parsed.searchParams.set("options", `endpoint=${endpoint}`);
      parsed.searchParams.set("sslmode", "require");
      parsed.searchParams.set("sslaccept", "accept_invalid_certs");
      return parsed.toString();
    }
  } catch {}

  return rawUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const resolvedUrl = initBridge();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
