// Pure, dependency-free validation for the "exact version pin" rule enforced by
// the Package pins CI check. Given a package.json object (or its
// dependencies/devDependencies maps), it returns the offenders: dependencies
// whose registry semver range is not an exact major.minor.patch pin.
//
// The rule (see AGENTS.md "Dependency pins"): every registry dependency must pin
// an exact major.minor.patch version with NO range operator — e.g. `4.1.13`,
// never `^4.1.13`, `~1.2.3`, `^4`, or `^4.1`. A trailing prerelease/build suffix
// (`-rc.1`, `+build`) is allowed. Exact pins keep every version change — including
// a within-range patch/minor — in its own reviewed, CI'd package.json diff (the
// trusted ones auto-merge via bot-automerge) rather than slipping in through an
// unrelated PR's lockfile regen.
//
// Non-registry specifiers (workspace:, catalog:, link:, file:, git+, http(s):,
// github:, npm: aliases) are NOT version ranges in the same sense and are
// skipped — they are never offenders.

// An exact pin: a major.minor.patch base with no leading range operator, plus an
// optional prerelease (`-rc.1`) and/or build (`+build`) suffix.
const EXACT_PIN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

// Specifiers that are not plain registry semver ranges. These are skipped rather
// than flagged: the exact-pin rule only governs registry version ranges.
const NON_REGISTRY_PREFIXES = [
  "workspace:",
  "catalog:",
  "link:",
  "file:",
  "git+",
  "github:",
  "npm:",
  "http://",
  "https://",
];

function isNonRegistrySpecifier(range) {
  return NON_REGISTRY_PREFIXES.some((prefix) => range.startsWith(prefix));
}

// Returns true when the range is an exact major.minor.patch pin (no ^/~ operator).
function isExactPin(range) {
  return EXACT_PIN.test(range);
}

// Given a map of { name: range }, returns the offenders that are registry
// ranges without an exact major.minor.patch pin.
function offendersInMap(deps) {
  if (!deps) return [];
  return Object.entries(deps)
    .filter(
      ([, range]) =>
        typeof range === "string" &&
        !isNonRegistrySpecifier(range) &&
        !isExactPin(range),
    )
    .map(([name, range]) => ({ name, range }));
}

// Given a parsed package.json object, returns every dependency (across
// `dependencies` and `devDependencies`) whose range is a registry semver range
// that is not an exact major.minor.patch pin, as `{ name, range }` records.
export function findUnpinnedDependencies(pkg) {
  return [
    ...offendersInMap(pkg.dependencies),
    ...offendersInMap(pkg.devDependencies),
  ];
}
