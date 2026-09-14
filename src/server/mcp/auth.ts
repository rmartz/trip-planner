import type { AuthInfo } from "@modelcontextprotocol/server";
import { isIdentity, resolveIdentity } from "./identity";
import type { Identity } from "./identity";

/** Key under which the normalized {@link Identity} rides inside `AuthInfo.extra`. */
const IDENTITY_KEY = "identity";

/**
 * Adapter between our {@link Identity} seam and mcp-handler's `withMcpAuth`,
 * which expects `verifyToken(request, bearerToken) => AuthInfo | undefined`.
 *
 * Verifies via {@link resolveIdentity} and packs the normalized identity into
 * `AuthInfo.extra` so tools receive it — never the raw token — through
 * {@link identityFromAuthInfo}. Returning `undefined` makes `withMcpAuth`
 * answer `401` before any tool runs.
 */
export async function verifyBearerToken(
  _request: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  const identity = await resolveIdentity(bearerToken);
  if (!identity) return undefined;
  return {
    token: bearerToken ?? "",
    clientId: identity.uid,
    scopes: [],
    extra: { [IDENTITY_KEY]: identity },
  };
}

/** Recover the verified {@link Identity} a tool call carries, or `undefined` if absent/malformed. */
export function identityFromAuthInfo(
  authInfo: AuthInfo | undefined,
): Identity | undefined {
  const candidate = authInfo?.extra?.[IDENTITY_KEY];
  return isIdentity(candidate) ? candidate : undefined;
}
