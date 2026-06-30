// Type declarations for the plain-ESM check-package-pins module so the
// TypeScript spec (src/ci/check-package-pins.spec.ts) can import it under strict
// type checking. Keep in sync with check-package-pins.mjs.

export interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface UnpinnedDependency {
  name: string;
  range: string;
}

export function findUnpinnedDependencies(
  pkg: PackageJsonLike,
): UnpinnedDependency[];
