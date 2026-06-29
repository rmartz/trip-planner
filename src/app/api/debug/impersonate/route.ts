import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  hasSyntheticPrefix,
  isEligibleTestUid,
} from "@/lib/debug-auth/test-profiles";

/**
 * Gated impersonation endpoint for staging/preview debug auth.
 *
 * Mints a Firebase custom token for a synthetic test uid so testers can sign in
 * without OAuth (which is blocked on dynamic Vercel preview URLs by Firebase's
 * authorized-domains list). Because the token yields a real Firebase ID token,
 * Firestore rules and Admin `verifyIdToken` authorize exactly as in production.
 *
 * Defense in depth — a token is minted only when ALL hold:
 *   1. Not production (`VERCEL_ENV !== "production"`), else 404.
 *   2. The uid carries the reserved `synthetic:` prefix (real uids cannot).
 *   3. The uid is in the seeded allowlist.
 * Tokens carry a `{ synthetic: true }` claim so sessions are detectable.
 */
export async function POST(request: Request) {
  if (process.env["VERCEL_ENV"] === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as { uid: unknown };
  if (typeof body.uid !== "string" || !body.uid) {
    return NextResponse.json({ error: "uid is required" }, { status: 400 });
  }

  if (!hasSyntheticPrefix(body.uid) || !isEligibleTestUid(body.uid)) {
    return NextResponse.json({ error: "uid is not eligible" }, { status: 403 });
  }

  const customToken = await getAdminAuth().createCustomToken(body.uid, {
    synthetic: true,
  });

  return NextResponse.json({ customToken });
}
