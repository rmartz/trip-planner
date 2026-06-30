// Pure, dependency-free validation for the "full version pin" rule enforced by
// the Package pins CI check. Given a package.json object (or its
// dependencies/devDependencies maps), it returns the offenders: dependencies
// whose registry semver range does not pin a full major.minor.patch base.
//
// The rule (see CLAUDE.md "Dependency pins"): every registry dependency must
// specify the full major.minor.patch version, with an optional `^`/`~` range
// annotation — e.g. `^4.1.13`, `~1.2.3`, or the exact `19.2.7`, never `^4` or
// `^4.1`. A trailing prerelease/build suffix (`-rc.1`, `+build`) is allowed.
//
// Non-registry specifiers (workspace:, catalog:, link:, file:, git+, http(s):,
// github:, npm: aliases) are NOT version ranges in the same sense and are
// skipped — they are never offenders.

// A registry range is an offender unless its base (after stripping a single
// leading `^` or `~`) starts with `major.minor.patch`.
const FULL_PIN = /^\d+\.\d+\.\d+/;

// Specifiers that are not plain registry semver ranges. These are skipped rather
// than flagged: the full-pin rule only governs registry version ranges.
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

// Returns true when the range pins a full major.minor.patch base.
function isFullPin(range) {
  const base = range.replace(/^[\^~]/, "");
  return FULL_PIN.test(base);
}

// Given a map of { name: range }, returns the offenders that are registry
// ranges without a full major.minor.patch pin.
function offendersInMap(deps) {
  if (!deps) return [];
  return Object.entries(deps)
    .filter(
      ([, range]) =>
        typeof range === "string" &&
        !isNonRegistrySpecifier(range) &&
        !isFullPin(range),
    )
    .map(([name, range]) => ({ name, range }));
}

// Given a parsed package.json object, returns every dependency (across
// `dependencies` and `devDependencies`) whose range is a registry semver range
// without a full major.minor.patch pin, as `{ name, range }` records.
export function findUnpinnedDependencies(pkg) {
  return [
    ...offendersInMap(pkg.dependencies),
    ...offendersInMap(pkg.devDependencies),
  ];
}
