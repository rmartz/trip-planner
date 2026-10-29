import { headers } from "next/headers";
import { LandingPageView } from "@/components/marketing/LandingPageView";
import { HomeDashboard } from "@/features/trips";
import { X_USER_ID_HEADER } from "@/lib/constants";

// The proxy sets X-User-Id only for a verified session, so its presence
// distinguishes an authenticated user (show their dashboard) from an anonymous
// visitor (show the public landing page).
export default async function Home() {
  // Next.js only runs React Compiler on client code, so this server component
  // ships uncompiled. Opt out explicitly so Vitest's transform (which compiles
  // every module) matches, letting the spec call it as a plain async function.
  "use no memo";
  const uid = (await headers()).get(X_USER_ID_HEADER);
  return uid ? <HomeDashboard /> : <LandingPageView />;
}
