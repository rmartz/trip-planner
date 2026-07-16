#!/usr/bin/env node
/**
 * Dependency-cooldown gate. Fails a PR that introduces a package version younger
 * than RELEASE_AGE_MIN_DAYS (default 7). This is a second layer on top of
 * Dependabot's own `cooldown`: that window is advisory at PR-creation time and
 * has documented reliability gaps for the npm ecosystem
 * (https://github.com/dependabot/dependabot-core/issues/12677) — several
 * same-day patch walks can slip through while each release is only days old,
 * well inside the configured 7-day cooldown. This gate enforces the same policy
 * deterministically, at the layer we control (CI), so a hot version cannot land
 * even when Dependabot's cooldown is bypassed.
 *
 * Why this shape and not pnpm's `minimum-release-age`: putting that setting in
 * committed pnpm config makes Dependabot's own lockfile regeneration honor it,
 * which forces pnpm to fetch publish-time metadata for the whole candidate tree
 * on every update — the full-metadata storm that causes multi-minute/hour
 * Dependabot timeouts on large repos. This gate never touches Dependabot's
 * resolver: it inspects the *result* (the lockfile diff) and queries the
 * registry for only the handful of newly-introduced versions. Diffing the
 * lockfile (not just package.json) also catches fresh *transitive* bumps.
 *
 * Usage:  node scripts/check-release-age.mjs [baseRef]
 *   baseRef  git ref to diff against (default: origin/main). The base
 *            pnpm-lock.yaml is read via `git show <baseRef>:pnpm-lock.yaml`;
 *            the head lockfile is read from ./pnpm-lock.yaml in the working
 *            tree. Only versions present in head but not base are checked.
 *
 * Exits 0 if every newly-introduced version is at least the threshold old (or
 * could not be resolved on the public registry — private/workspace/tarball
 * specifiers are skipped). Exits 1 listing each too-young version. Registry
 * fetch failures are warned and skipped (fail-open) so a flaky registry does
 * not produce a spurious red build; a confirmed too-young version always fails.
 */

import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { lockedPackages, parseKey } from "./lib/check-release-age.mjs";

const baseRef = process.argv[2] ?? "origin/main";
const minDays = Number(process.env.RELEASE_AGE_MIN_DAYS ?? "7");
if (!Number.isFinite(minDays) || minDays <= 0) {
  throw new Error(
    `RELEASE_AGE_MIN_DAYS must be a positive number (got "${process.env.RELEASE_AGE_MIN_DAYS}")`,
  );
}
const minMs = minDays * 24 * 60 * 60 * 1000;

/** Publish timestamp (ms) for name@version, or undefined if unresolvable. */
async function publishedAt(name, version) {
  const url = `https://registry.npmjs.org/${name.replace("/", "%2F")}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return undefined;
  const time = (await res.json()).time?.[version];
  return time ? Date.parse(time) : undefined;
}

const headLock = readFileSync("pnpm-lock.yaml", "utf8");
const baseLock = execFileSync("git", ["show", `${baseRef}:pnpm-lock.yaml`], {
  encoding: "utf8",
});

const basePackages = lockedPackages(baseLock);
const introduced = [...lockedPackages(headLock)]
  .filter((key) => !basePackages.has(key))
  .map(parseKey)
  .filter((parsed) => parsed !== undefined);

const now = Date.now();
const violations = [];
for (const { name, version } of introduced) {
  let published;
  try {
    published = await publishedAt(name, version);
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      console.warn(`  warning: timeout checking ${name}@${version} — skipping`);
    } else {
      console.warn(
        `  warning: could not check ${name}@${version}: ${err.message}`,
      );
    }
    continue;
  }
  if (published === undefined) continue; // private / workspace / unpublished
  const ageDays = (now - published) / (24 * 60 * 60 * 1000);
  if (now - published < minMs) {
    violations.push(`  ${name}@${version} — ${ageDays.toFixed(1)} days old`);
  }
}

if (violations.length > 0) {
  console.error(
    `pnpm-lock.yaml — ${violations.length} newly-introduced version(s) younger than the ${minDays}-day cooldown:`,
  );
  for (const v of violations) console.error(v);
  console.error(
    "\nHold the update until the version ages past the cooldown, then re-run this\n" +
      "check. Malicious releases are typically caught and yanked within days.",
  );
  process.exit(1);
}

console.log(
  `pnpm-lock.yaml — all newly-introduced versions are at least ${minDays} days old. OK`,
);
