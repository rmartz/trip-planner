// Shared parser helpers for the dependency release-age gate.
// Plain ESM so CI can run the gate with only Node built-ins (no pnpm install);
// exported here so the TypeScript spec (src/ci/check-release-age.spec.ts) can
// import them directly under Vitest.

/** Semver pattern for versions that may appear in a pnpm lockfile. */
const SEMVER_VERSION =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

/**
 * Collect the `name@version` keys from the top-level `packages:` block of a
 * pnpm v9 lockfile. That block lists each resolved package canonically, without
 * the peer-dependency suffixes that appear in `snapshots:`, so its keys are
 * exactly the `name@version` pairs we want. Returns a Set of "name@version".
 */
export function lockedPackages(lockfileText) {
  const packages = new Set();
  let inPackages = false;
  for (const rawLine of lockfileText.split("\n")) {
    const topLevel = /^(\S.*):\s*$/.exec(rawLine);
    if (topLevel) {
      inPackages = topLevel[1] === "packages";
      continue;
    }
    if (!inPackages) continue;
    // A package key is indented exactly two spaces and ends with a colon.
    const entry = /^ {2}(\S.*):\s*$/.exec(rawLine);
    if (entry) packages.add(entry[1].replace(/^['"]|['"]$/g, ""));
  }
  return packages;
}

/** Split a `name@version` key into its name and semver version, else undefined. */
export function parseKey(key) {
  const at = key.lastIndexOf("@");
  if (at <= 0) return undefined;
  const name = key.slice(0, at);
  const version = key.slice(at + 1).split("(")[0];
  if (!SEMVER_VERSION.test(version)) return undefined;
  return { name, version };
}
