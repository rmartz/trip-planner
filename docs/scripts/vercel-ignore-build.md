---
type: Script
title: vercel-ignore-build
description: Vercel Ignored Build Step gate that deploys previews only for feat/fix PRs; production always builds.
resource: scripts/vercel-ignore-build.mjs
tags: [vercel, ci, deployment]
timestamp: 2026-06-30
---

# vercel-ignore-build.mjs

Wired into `vercel.json` as the `ignoreCommand`, this script runs before every
Vercel build and decides whether the build should proceed. Its purpose is to cut
wasted **preview** deploys (each consumes a daily quota) by building previews
only for PRs whose title is a `feat:`/`fix:` Conventional Commit. Production
deploys (merge to `main`) always build.

A richer, label-based gate (deploy on demand for any PR carrying a label) is
deferred to #410. This title-based version needs no Vercel API token.

## ⚠️ Exit-code semantics (counterintuitive)

Vercel's Ignored Build Step inverts the usual convention:

| exit code     | meaning                 |
| ------------- | ----------------------- |
| `0`           | **SKIP / cancel** build |
| `1` (nonzero) | **PROCEED** with build  |

So "deploy" is `process.exit(1)` and "skip" is `process.exit(0)`.

## Behavior

1. If `VERCEL_ENV === "production"` → build (exit 1).
2. Read `VERCEL_GIT_PULL_REQUEST_ID`, `VERCEL_GIT_REPO_OWNER`, and
   `VERCEL_GIT_REPO_SLUG`. If any is missing/empty → fail open, build (exit 1).
3. Fetch `GET /repos/{owner}/{slug}/pulls/{prId}` from the **public** GitHub REST
   API (trip-planner is public, so no auth header is sent). If the response is not
   OK → fail open, build (exit 1).
4. Run the PR title through `shouldDeployForTitle`: a `feat`/`fix`
   Conventional-Commit title → build (exit 1); anything else → skip the preview
   (exit 0).

The entire network path is wrapped in `try/catch`; any thrown error fails open
(build). **Fail-open on every uncertainty** ensures a needed deploy is never
wrongly skipped.

## Title matching

The pure, dependency-free `scripts/lib/vercel-ignore-build.mjs` (with a `.d.mts`
declaration) exports `shouldDeployForTitle(title)`. It tests the title against
`^(feat|fix)(\([^)]+\))?!?:` — optional scope, optional `!`, then `:` — a
**case-sensitive** mirror of the repo's pr-title-lint
(`.github/workflows/pr-title-lint.yml`), so `Feat:`/`FIX:` do not qualify. The
same module is imported by both the CLI wrapper and the spec at
`src/ci/vercel-ignore-build.spec.ts`. The CLI uses only Node built-ins and the
global `fetch`, so Vercel runs it without installing dependencies.
