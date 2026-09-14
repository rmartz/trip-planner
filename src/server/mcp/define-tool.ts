import type {
  AuthInfo,
  CallToolResult,
  McpServer,
  ServerContext,
  ToolCallback,
} from "@modelcontextprotocol/server";
import type { z } from "zod";
import { identityFromAuthInfo } from "./auth";
import type { Identity } from "./identity";

/**
 * A tool's handler result. Kept as the SDK's `CallToolResult` so tools return
 * exactly what the protocol expects with no adapter layer.
 */
export type ToolResult = CallToolResult;

/**
 * Declarative description of one MCP tool.
 *
 * The handler receives the parsed args and the resolved {@link Identity} — it
 * never sees the raw token, and it takes no `uid`/owner argument, so it is
 * structurally impossible for a tool to act on another user's data.
 */
export interface McpToolDefinition<Schema extends z.ZodObject = z.ZodObject> {
  name: string;
  title: string;
  description: string;
  /**
   * OAuth-style scopes this tool would require. Declared now but UNENFORCED in
   * Phase 1 — carrying the field from the start avoids a tool-by-tool retrofit
   * when Phase 3 turns enforcement on (see the epic, #517).
   */
  scopes: string[];
  inputSchema: Schema;
  handler: (
    args: z.infer<Schema>,
    identity: Identity,
  ) => Promise<ToolResult> | ToolResult;
}

/**
 * Identity function that pins a tool definition's generic to its `inputSchema`,
 * so a tool's `handler` args are inferred from its own schema at the call site.
 */
export function defineTool<Schema extends z.ZodObject>(
  definition: McpToolDefinition<Schema>,
): McpToolDefinition<Schema> {
  return definition;
}

/**
 * The security backbone. Resolves the verified {@link Identity} from the request
 * auth and hands it to `run`; fails closed with an error result if it is absent.
 *
 * Mounting behind `withMcpAuth({ required: true })` already rejects
 * unauthenticated calls with `401`, but a tool must never trust the transport to
 * have done so — this is the one place `uid` enters tool logic.
 */
export async function withUser(
  authInfo: AuthInfo | undefined,
  run: (identity: Identity) => Promise<ToolResult> | ToolResult,
): Promise<ToolResult> {
  const identity = identityFromAuthInfo(authInfo);
  if (!identity) {
    return {
      isError: true,
      content: [{ type: "text", text: "Unauthorized" }],
    };
  }
  return run(identity);
}

/** Register a {@link McpToolDefinition} onto a server, wrapping its handler in {@link withUser}. */
export function registerTool<Schema extends z.ZodObject>(
  server: McpServer,
  tool: McpToolDefinition<Schema>,
): void {
  // The generic schema cannot flow through the SDK's `registerTool` overloads,
  // so type the callback via the SDK's own `ToolCallback<Schema>` at this one
  // seam. `args` is already validated against `inputSchema` by the SDK.
  const callback = (args: z.infer<Schema>, ctx: ServerContext) =>
    withUser(ctx.http?.authInfo, (identity) => tool.handler(args, identity));

  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
    callback as unknown as ToolCallback<Schema>,
  );
}
