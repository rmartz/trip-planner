// Type declarations for the plain-ESM check-release-age helpers so the
// TypeScript spec (src/ci/check-release-age.spec.ts) can import them under
// strict type checking. Keep in sync with check-release-age.mjs.

export interface ParsedPackage {
  name: string;
  version: string;
}

export function lockedPackages(lockfileText: string): Set<string>;
export function parseKey(key: string): ParsedPackage | undefined;
