"use client";

import { Button } from "@/components/ui/button";
import type { TestProfile } from "@/lib/debug-auth/test-profiles";
import { DEBUG_USER_SWITCHER_COPY } from "./DebugUserSwitcher.copy";

export interface DebugUserSwitcherViewProps {
  profiles: readonly TestProfile[];
  pendingUid?: string;
  error?: string;
  onSelect: (uid: string) => void;
}

export function DebugUserSwitcherView({
  profiles,
  pendingUid,
  error,
  onSelect,
}: DebugUserSwitcherViewProps) {
  return (
    <div className="w-full space-y-3 rounded-md border border-dashed border-amber-400 p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-amber-700">
          {DEBUG_USER_SWITCHER_COPY.title}
        </h2>
        <p className="text-xs text-gray-500">
          {DEBUG_USER_SWITCHER_COPY.description}
        </p>
      </div>
      <div className="space-y-2">
        {profiles.map((profile) => (
          <Button
            key={profile.uid}
            variant="outline"
            disabled={pendingUid !== undefined}
            onClick={() => {
              onSelect(profile.uid);
            }}
            className="w-full justify-start"
          >
            {pendingUid === profile.uid
              ? `${profile.displayName}…`
              : profile.displayName}
          </Button>
        ))}
      </div>
      {error !== undefined && (
        <p className="text-sm text-red-600">
          {DEBUG_USER_SWITCHER_COPY.errorPrefix}
          {error}
        </p>
      )}
    </div>
  );
}
