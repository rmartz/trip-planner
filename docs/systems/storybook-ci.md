---
type: System
title: Storybook CI
description: How the gating Storybook test/build checks and the advisory per-PR screenshot gallery are delegated to the shared rmartz/storybook-ci reusable workflows, what the two caller workflows configure, and the PAT the gallery needs.
resource: .github/workflows/storybook-tests.yml
tags: [ci, storybook, screenshots, reusable-workflows]
timestamp: 2026-09-22
---

# Storybook CI

Storybook CI is two thin caller workflows that delegate to the shared
[`rmartz/storybook-ci`](https://github.com/rmartz/storybook-ci) reusable
workflows. The operational reasoning — Chromium provisioning and binary caching
with a retry, docs-only change gating, fail-vs-cancel deadline budgeting, per-PR
concurrency, fork exclusion, advisory isolation — lives upstream once, so a fix
there reaches this repo as a Dependabot pin bump rather than a local edit.

| Workflow                                      | Role     | Jobs                                 |
| --------------------------------------------- | -------- | ------------------------------------ |
| `.github/workflows/storybook-tests.yml`       | gating   | `Storybook Tests`, `Storybook Build` |
| `.github/workflows/storybook-screenshots.yml` | advisory | `Capture Storybook Screenshots`      |

Both pin the shared workflow by full commit SHA with a `# vX.Y.Z` comment, which
is what Dependabot's `github-actions` ecosystem reads to keep the pin current.

## Gating tests

`storybook-tests.yml` runs the Vitest browser-mode story suite in real Chromium
and, separately, the production `build-storybook` compile check. The build job is
a distinct render surface: `pnpm build` is the Next.js bundler and the story
suite renders through the addon-vitest transform, so neither exercises
`storybook build`.

One input is overridden: `test-command: pnpm test:storybook`. The shared default
is `pnpm exec vitest run --project storybook`, which does not resolve here —
this repo's storybook project lives in its own `vitest.storybook.config.ts`
rather than as a project inside `vitest.config.mts`. `build-command` takes the
shared default (`pnpm build-storybook`), which matches the package script.

**Protected invariant (#391).** The suite must run on every code-touching PR, so
the caller carries **no** `on.paths` filter — the docs-only skip is the shared
workflow's `detect-changes` job plus a per-job `if:`. A skipped required job
counts as passing, while a required check that never runs because its paths did
not match hangs the PR forever. `src/ci/storybook-tests-unfiltered.spec.ts`
guards this structurally.

**Required-check contexts.** A reusable workflow reports as
`<caller job> / <called job>`, so the default-branch ruleset requires
`storybook-tests / Storybook Tests`, not the bare `Storybook Tests` that the old
`ci-actions.yml` job reported.

## Advisory screenshots

`storybook-screenshots.yml` builds Storybook, screenshots the stories a PR's
changes touch, and posts them as one update-in-place PR comment (keyed by the
`<!-- storybook-screenshots-bot -->` marker). Images are GitHub
**user-attachments** uploaded with `gh --attach`, so there is no image branch to
push, no `contents: write` grant, and no cleanup workflow.

The job is advisory: `continue-on-error` lives in the shared workflow, so a
Playwright/CDN/build/comment failure shows the job red without blocking the
merge. Fork PRs are skipped so the PAT never reaches fork-authored code. Being
advisory and never a required check, this caller may safely use an `on.paths`
filter (`src/**`, `.storybook/**`) to stay off unrelated PRs.

**Capture scope is `colocation`** (the shared default): the stories a PR changes
directly, plus stories co-located with any changed component, and any
`.storybook/**` change forces a full capture. That is broader than the previous
bespoke changed-stories-only capture, which regenerated nothing when a component
was edited without touching its story — the false negative the wider `on.paths`
filter exists to catch.

### The screenshot PAT

The user-attachments upload endpoint rejects the Actions `GITHUB_TOKEN`, so the
shared workflow authenticates `gh` with a repository Actions secret named
**`STORYBOOK_SCREENSHOT_PAT`**, forwarded by the caller's `secrets: inherit`.

Use a **fine-grained PAT** scoped to this repository with a single permission,
**`Pull requests: Read and write`** (`Metadata: Read` is granted automatically;
`Contents` is not needed, because `actions/checkout` uses the job's own
`GITHUB_TOKEN`). A classic PAT with `repo` scope also works but grants read/write
across every repository its owner can reach. Set an expiration: a preflight step
runs before the expensive Storybook build and, when the PAT is missing or
invalid, posts one non-blocking advisory PR comment and skips the capture — so a
missing or expired token announces itself instead of looking like success.

## What this replaced

Adopting the shared workflows (#554) removed the bespoke implementation:
`pr-screenshots.yml`, `.github/scripts/storybook-screenshots.mjs`, the per-PR
orphan image branch `gh-screenshots-pr-<N>` and its `pr-screenshots-cleanup.yml`,
the `storybook-tests` / `build-storybook` jobs in `ci-actions.yml`, and the
`.github/actions/playwright` composite action (those jobs were its only
consumers).

## Upstream reference

- [Adopting storybook-ci in a consuming repo](https://github.com/rmartz/storybook-ci/blob/main/docs/consuming.md)
- [Configuration reference](https://github.com/rmartz/storybook-ci/blob/main/docs/configuration.md)
- [Authentication](https://github.com/rmartz/storybook-ci/blob/main/docs/authentication.md)
