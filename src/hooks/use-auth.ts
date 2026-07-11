// Grandfathered layering exception: this hook wraps the auth React context, which
// currently lives alongside its provider component. Relocating that context out of
// components/ (so hooks no longer import UI) is tracked in #454.
// eslint-disable-next-line boundaries/dependencies
import { useAuthContext } from "@/components/auth/AuthProvider";

export function useAuth() {
  return useAuthContext();
}
