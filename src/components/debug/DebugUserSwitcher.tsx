"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithSyntheticProfile } from "@/services/auth";
import { TEST_PROFILES } from "@/lib/debug-auth/test-profiles";
import { DebugUserSwitcherView } from "./DebugUserSwitcherView";

export function DebugUserSwitcher() {
  const router = useRouter();
  const [pendingUid, setPendingUid] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  // Public flag set only in deployment/preview.yml, so the switcher is absent
  // from the production bundle.
  if (process.env["NEXT_PUBLIC_ENABLE_DEBUG_AUTH"] !== "true") {
    return null;
  }

  async function handleSelect(uid: string) {
    setError(undefined);
    setPendingUid(uid);
    try {
      await signInWithSyntheticProfile(uid);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPendingUid(undefined);
    }
  }

  return (
    <DebugUserSwitcherView
      profiles={TEST_PROFILES}
      pendingUid={pendingUid}
      error={error}
      onSelect={(uid) => void handleSelect(uid)}
    />
  );
}
