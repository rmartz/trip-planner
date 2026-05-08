"use client";

import { useRouter } from "next/navigation";
import { ClaimPageView } from "./ClaimPageView";
import type { ClaimContext } from "./ClaimPageView";

interface ClaimActionsProps {
  claimContext: ClaimContext | undefined;
  claimToken: string | undefined;
}

export function ClaimActions({ claimContext, claimToken }: ClaimActionsProps) {
  const router = useRouter();

  const handleClaim = () => {
    const next = claimToken ? `/sign-up?claimToken=${claimToken}` : "/sign-up";
    router.push(next);
  };

  const handleNotMe = () => {
    router.push("/");
  };

  return (
    <ClaimPageView
      claimContext={claimContext}
      onClaim={handleClaim}
      onNotMe={handleNotMe}
    />
  );
}
