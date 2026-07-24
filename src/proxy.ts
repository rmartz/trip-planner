// Next.js proxy always runs on Node.js — this allows firebase-admin usage (unsupported on Edge runtime).
import { type NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { X_USER_ID_HEADER } from "@/lib/constants";

const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];
// Paths an anonymous visitor may view (exact match). The root path is the public
// landing page; page.tsx renders it when no verified user header is present.
const PUBLIC_PAGES = ["/"];
const SESSION_COOKIE_NAME = "session";

// Strip any client-supplied identity header before optionally setting our own,
// so a caller can never spoof X-User-Id (including on the anonymous landing
// path, where the header decides landing-vs-dashboard in page.tsx).
function forwardWithUser(request: NextRequest, uid: string | undefined) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(X_USER_ID_HEADER);
  if (uid) requestHeaders.set(X_USER_ID_HEADER, uid);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

async function getVerifiedUid(
  request: NextRequest,
): Promise<string | undefined> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return undefined;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    return decoded.uid;
  } catch {
    return undefined;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  const uid = await getVerifiedUid(request);

  if (isAuthPage) {
    if (uid) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!uid) {
    if (isPublicPage) return forwardWithUser(request, undefined);
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  return forwardWithUser(request, uid);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/auth/session).*)"],
};
