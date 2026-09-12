# MCP server

Firebase-authenticated Model Context Protocol server, exposed over Streamable
HTTP at `/api/mcp`. Phase 1 / Approach A of the MCP epic (rmartz/trip-planner#517,
implemented in #518): a caller presents a **Firebase ID token as a `Bearer`** and
gets tools scoped to their own account.

## Two principles (see the epic)

1. **MCP and HTTP overlap.** Tools call the same `src/services/*` functions the
   HTTP routes call. A tool adds argument parsing and identity injection — never
   its own Firestore/business logic.
2. **MCP follows UI.** Only expose actions already reachable in the UI. If a UI
   action bypasses the service layer today, extract a shared service first.

## How identity flows

```
request → withMcpAuth(required) → verifyBearerToken → resolveIdentity → Identity{uid}
        → withUser(authInfo, handler) → tool(args, identity) → src/services/*
```

- `resolveIdentity` (identity.ts) is the **only** place a token is inspected. It
  is polymorphic over token type — Phase 2's OAuth branch lands here alone.
- `withUser` (define-tool.ts) injects the `uid` from the verified identity. Tools
  take **no** `uid`/owner argument, so a tool cannot touch another user's data.
- The Admin SDK bypasses Firestore security rules, so `withUser` is the only
  thing protecting data. This is security-critical.

## Registering a new tool

1. Define it with `defineTool` next to the route
   (`src/app/api/mcp/tools/<domain>.ts`), calling an existing `src/services`
   function inside the handler:

   ```ts
   export const myTool = defineTool({
     name: "do_thing",
     title: "Do thing",
     description: "…",
     scopes: ["thing:write"], // declared now, unenforced until Phase 3
     inputSchema: z.object({ foo: z.string() }),
     handler: async ({ foo }, identity) => {
       const result = await doThingForUser(identity.uid, foo);
       return { content: [{ type: "text", text: JSON.stringify(result) }] };
     },
   });
   ```

2. Register it in `src/app/api/mcp/route.ts`:

   ```ts
   registerTool(server, myTool);
   ```

No auth boilerplate is needed — `registerTool` wraps every handler in `withUser`.
