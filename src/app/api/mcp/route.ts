import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerTool, verifyBearerToken } from "@/server/mcp";
import { createTripTool, listTripsTool } from "./tools/trips";

/**
 * Remote MCP server over Streamable HTTP, mounted at `/api/mcp`.
 *
 * Authenticated by a Firebase ID token presented as a `Bearer` (Phase 1 /
 * Approach A, #518). `withMcpAuth({ required: true })` verifies the token via
 * {@link verifyBearerToken} and answers `401` before any tool runs; each tool's
 * handler receives only the resolved identity, never the token.
 *
 * Register new tools by adding a `registerTool(server, …)` line below — see
 * `src/server/mcp/README.md`.
 */
const handler = createMcpHandler(
  (server) => {
    registerTool(server, listTripsTool);
    registerTool(server, createTripTool);
  },
  { serverInfo: { name: "trip-planner", version: "0.1.0" } },
);

const authenticatedHandler = withMcpAuth(handler, verifyBearerToken, {
  required: true,
});

export { authenticatedHandler as GET, authenticatedHandler as POST };
