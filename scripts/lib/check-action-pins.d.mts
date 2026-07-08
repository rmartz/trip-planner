// Type declarations for the plain-ESM check-action-pins module so the
// TypeScript spec (src/ci/check-action-pins.spec.ts) can import it under strict
// type checking. Keep in sync with check-action-pins.mjs.

export interface UnpinnedAction {
  line: number;
  uses: string;
  reason: string;
}

export function findUnpinnedActionsInText(content: string): UnpinnedAction[];
