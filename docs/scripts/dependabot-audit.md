---
type: Script
title: dependabot-audit
description: Classifies every Dependabot PR's outcome (clean / needed-fix / stuck / churn), attributes each to its Dependabot group, and reports per-group intervention rates.
resource: scripts/dependabot-audit.mjs
tags: [dependencies, dependabot, ci, audit]
timestamp: 2026-09-14
---

# dependabot-audit.mjs

Turns "which Dependabot groups are worth keeping?" into a measured question.

The grouping in [`.github/dependabot.yml`](../../.github/dependabot.yml) is a set
of bets: that isolating certain packages (`prettier`, `typescript`) keeps their
breakages out of the shared batch, and that some version-locked families must bump
atomically — `react` groups all update types (cross-boundary requirement), while
`vite` groups major updates only (its minor/patch bumps are intentionally
individual). trip-planner deliberately runs everything else
**ungrouped** (there is no dev/prod catch-all) so each bump's outcome is
attributable to a single package. This script checks the bets against history —
it reads every Dependabot PR the repository has ever opened, classifies how each
one ended, and reports the per-group rate at which a bump needed a human fix.

A group whose ungrouped members start needing fixes has earned a group; a group
that never needs one is a candidate to re-batch. That re-batch criterion is what
the audit exists to measure — it is the evidence trail behind
[issue #526](https://github.com/rmartz/trip-planner/issues/526).

## Usage

```bash
node scripts/dependabot-audit.mjs                 # report on the current repo
node scripts/dependabot-audit.mjs --repo owner/n  # report on another repo
node scripts/dependabot-audit.mjs --out report.md # also write the report to a file
```

The report is written to stdout as markdown. Repo resolution follows the fleet
convention: `--repo` → `GH_REPO` → `GITHUB_REPOSITORY` → `gh repo view`.

Requires the [`gh` CLI](https://cli.github.com/), authenticated. In CI the
`GITHUB_TOKEN` (exposed as `GH_TOKEN`) is sufficient.

## Classification

Each Dependabot PR is placed in exactly one bucket:

- **clean** — merged, with no fix PR referencing it.
- **needed-fix** — a **merged** fix/unblock PR targets it, by the explicit
  `Dependabot #N` token or as the culprit of a lockfile-corruption repair. Only
  merged fixes count, so a closed investigation that concluded "no code change
  needed" (e.g. an infra/billing failure) does not flag its Dependabot PR.
- **stuck** — still open with a failing check.
- **pending** — still open, checks not failing. Excluded from the
  intervention-rate denominator (undecided).
- **churn** — Dependabot auto-closed it (a routine recreate/supersede). Also
  excluded from the denominator.

Interventions whose fix PR repaired lockfile corruption are tagged
`merge-mechanics (group-independent)`: that failure mode is unrelated to which
group merged that week and should be read separately from the grouping signal.

The group is inferred from the PR title (`the <x> group`, an `owner/repo` bump →
`github-actions`, otherwise a single ungrouped package → `individual`). The
`churn` split is a heuristic on close state, not a per-PR verification of the
closer.

The pure classification and rendering live in the dependency-free
[`scripts/lib/dependabot-audit.mjs`](../../scripts/lib/dependabot-audit.mjs)
(with a `.d.mts` declaration), imported by both the CLI wrapper and the spec at
`src/ci/dependabot-audit.spec.ts`. The script uses only the `gh` CLI and Node
built-ins, so CI runs it without installing dependencies.

## CI

The **Dependabot audit** workflow
([`.github/workflows/dependabot-audit.yml`](../../.github/workflows/dependabot-audit.yml))
runs this monthly, writes the report to the job summary, and upserts a single
`Dependabot grouping audit` tracking issue so the per-group rates stay watchable
over time. It can also be run on demand via `workflow_dispatch`.
