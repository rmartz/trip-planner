#!/usr/bin/env node
/**
 * Dependabot grouping-outcome audit (CLI wrapper).
 *
 * Reconstructs, from the GitHub API, how every Dependabot PR in the repository
 * turned out — merged cleanly, needed a human fix to unblock, still stuck, or
 * routine Dependabot supersede-churn — attributes each to its Dependabot group,
 * and prints a per-group intervention-rate report as markdown.
 *
 * This is the standing instrument behind issue #526: it turns "which groups are
 * worth keeping?" into a measured question. trip-planner deliberately runs its
 * dev/prod dependencies ungrouped so each bump's outcome is attributable to a
 * single package — this audit reads that signal back out. A group whose members
 * repeatedly need a fix has earned a group; one that never does is a candidate
 * to re-batch.
 *
 * The classification and rendering are pure and live in
 * scripts/lib/dependabot-audit.mjs (tested by src/ci/dependabot-audit.spec.ts);
 * this wrapper is only the `gh` I/O and CLI glue.
 *
 * Usage:
 *   node scripts/dependabot-audit.mjs [--repo owner/name] [--out report.md]
 *
 * Repo resolution: --repo → GH_REPO → GITHUB_REPOSITORY → `gh repo view`.
 * Requires the `gh` CLI, authenticated (GITHUB_TOKEN in CI).
 */

import { execFileSync } from "child_process";
import { writeFileSync } from "fs";
import {
  buildReport,
  parseArgs,
  renderMarkdown,
} from "./lib/dependabot-audit.mjs";

function gh(args) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function resolveRepo(argRepo) {
  const repo = argRepo || process.env.GH_REPO || process.env.GITHUB_REPOSITORY;
  if (repo) return repo;
  return JSON.parse(gh(["repo", "view", "--json", "nameWithOwner"]))
    .nameWithOwner;
}

function listPrs(repo, extraFields, author) {
  const fields = ["number", "title", "state", ...extraFields].join(",");
  const args = [
    "pr",
    "list",
    "--repo",
    repo,
    "--state",
    "all",
    "--limit",
    "1000",
    "--json",
    fields,
  ];
  if (author) args.push("--author", author);
  return JSON.parse(gh(args));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repo = resolveRepo(args.repo);
  const dependabotPrs = listPrs(repo, ["statusCheckRollup"], "app/dependabot");
  const otherPrs = listPrs(repo, ["body", "author"]).filter(
    (pr) =>
      pr.author?.login !== "app/dependabot" &&
      pr.author?.login !== "dependabot" &&
      pr.author?.login !== "dependabot[bot]",
  );

  const report = renderMarkdown(buildReport(dependabotPrs, otherPrs), repo);
  process.stdout.write(`${report}\n`);
  if (args.out) writeFileSync(args.out, `${report}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
