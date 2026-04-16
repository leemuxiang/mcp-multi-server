import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./src/mcp-server.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  /**
   * Map to store transports by session ID.
   * This ensures each client has its own isolated MCP server instance.
   */
  const transports: Record<string, StreamableHTTPServerTransport> = {};

  /**
   * 1. MCP Endpoint (POST)
   * Handles JSON-RPC messages from clients.
   * Implements the session-based pattern from the SDK examples.
   */
  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    
    try {
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        // Reuse existing transport for this session
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request - create a new session
        console.log("[MCP] Creating new session...");
        
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true,
          onsessioninitialized: (newSessionId) => {
            console.log(`[MCP] Session initialized: ${newSessionId}`);
            transports[newSessionId] = transport;
          }
        });

        // Create a dedicated server instance for this session
        const sessionServer = createMcpServer();
        await sessionServer.connect(transport);
        
        // Handle the initialization request
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        // Invalid request: no session ID and not an initialization request
        console.warn("[MCP] Bad request: No session ID and not initialization", req.body);
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad Request: No valid session ID provided" },
          id: req.body?.id || null
        });
        return;
      }

      // Handle subsequent requests with the existing transport
      await transport.handleRequest(req, res, req.body);
    } catch (error: any) {
      console.error("[MCP POST] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ 
          jsonrpc: "2.0", 
          error: { code: -32603, message: error.message || "Internal error" }, 
          id: req.body?.id || null 
        });
      }
    }
  });

  /**
   * 2. SSE Endpoint (GET)
   * Optional: Kept for compatibility with clients that prefer SSE.
   */
  app.get("/sse", async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });
      const sessionServer = createMcpServer();
      await sessionServer.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error: any) {
      console.error("[MCP SSE] Error:", error);
      if (!res.headersSent) {
        res.status(500).send("SSE Connection Error");
      }
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      protocol: "mcp", 
      version: "2025-03-26", 
      activeSessions: Object.keys(transports).length
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`MCP Endpoint: http://localhost:${PORT}/mcp`);
  });
}

startServer().catch(console.error);
