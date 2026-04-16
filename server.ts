import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server } from "./src/mcp-server.js";
import { JSONRPCRequest } from "@modelcontextprotocol/sdk/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  /**
   * 1. Streamable HTTP Endpoint (2025-03-26 Spec)
   * 适合现代、高性能的 MCP 客户端
   */
  app.post("/mcp", async (req, res) => {
    const request = req.body as JSONRPCRequest;
    if (!request || typeof request !== "object" || !request.method) {
      return res.status(400).json({ jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" }, id: request?.id || null });
    }
    try {
      // @ts-ignore - handleRequest is the internal entry point for JSON-RPC
      const response = await server.server.handleRequest(request);
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: error.code || -32603, message: error.message || "Internal error" }, id: request.id || null });
    }
  });

  /**
   * 2. SSE Transport (Standard HTTP)
   * 兼容目前主流的 MCP 客户端（如 Claude Desktop, Cursor）
   */
  const sseSessions = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    console.log(`New SSE connection: ${sessionId}`);
    
    const transport = new SSEServerTransport(`/messages/${sessionId}`, res);
    sseSessions.set(sessionId, transport);
    
    await server.connect(transport);
    
    req.on("close", () => {
      console.log(`SSE connection closed: ${sessionId}`);
      sseSessions.delete(sessionId);
    });
  });

  app.post("/messages/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    const transport = sseSessions.get(sessionId);
    
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(404).send("Session not found");
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", protocol: "mcp", version: "2025-03-26", transports: ["streamable-http", "sse"] });
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`MCP Endpoint: http://0.0.0.0:${PORT}/mcp`);
  });
}

startServer().catch(console.error);
