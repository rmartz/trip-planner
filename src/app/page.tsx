import { headers } from "next/headers";
import { LandingPageView } from "@/components/marketing/LandingPageView";
import { HomeDashboard } from "@/components/trips/HomeDashboard";
import { X_USER_ID_HEADER } from "@/lib/constants";

// The proxy sets X-User-Id only for a verified session, so its presence
// distinguishes an authenticated user (show their dashboard) from an anonymous
// visitor (show the public landing page).
export default async function Home() {
  const uid = (await headers()).get(X_USER_ID_HEADER);
  return uid ? <HomeDashboard /> : <LandingPageView />;
}
