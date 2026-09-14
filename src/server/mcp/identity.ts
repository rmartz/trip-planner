import { getAdminAuth } from "@/lib/firebase/admin";

/**
 * Normalized caller identity — the single currency every MCP tool sees.
 *
 * Deliberately transport- and IdP-agnostic. Phase 1 derives it from a Firebase
 * ID token; Phase 2 will derive the same shape from an OAuth access token
 * (see the epic, #517). Because the shape says nothing about Firebase, adding
 * that branch touches only {@link resolveIdentity} — never `withUser` or a tool.
 */
export interface Identity {
  uid: string;
}

/** Runtime guard so an `Identity` recovered from untyped transport data is validated, never trusted. */
export function isIdentity(value: unknown): value is Identity {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { uid?: unknown }).uid === "string" &&
    (value as { uid: string }).uid.length > 0
  );
}

/**
 * The ONE place a bearer token is inspected. Verifies a Firebase ID token with
 * the Admin SDK and returns a normalized {@link Identity}, or `undefined` when
 * the token is absent, expired, or otherwise invalid.
 *
 * Polymorphic by contract: the parameter is an opaque bearer string and the
 * return type is IdP-agnostic, so a later phase can branch on token type here
 * (Firebase ID token today, OAuth access token tomorrow) leaving every tool and
 * the `withUser` wrapper unchanged.
 */
export async function resolveIdentity(
  bearerToken: string | undefined,
): Promise<Identity | undefined> {
  if (!bearerToken) return undefined;
  try {
    const decoded = await getAdminAuth().verifyIdToken(bearerToken);
    return { uid: decoded.uid };
  } catch {
    return undefined;
  }
}
