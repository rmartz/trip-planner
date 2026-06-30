---
type: System
title: Storybook Screenshot Previews
description: How PR Storybook screenshots are captured, hosted on a per-PR branch, posted as a sticky comment, and cleaned up.
resource: .github/scripts/storybook-screenshots.mjs
tags: [ci, storybook, screenshots]
timestamp: 2026-06-29
---

# Storybook Screenshot Previews

For every pull request that changes a `*.stories.tsx` file, CI captures a
Playwright screenshot of each affected story and posts an inline gallery as a
sticky PR comment, so a human can confirm the intended visual change during UAT.

## Pipeline

1. **Gate** — `.github/workflows/pr-screenshots.yml` runs on `pull_request` and
   only proceeds when the diff against the base branch touches a `*.stories.tsx`
   file. The job is **advisory** (`continue-on-error: true`, bounded
   `timeout-minutes`): it is not a correctness gate. Unintended visual
   regressions are caught instead by the always-on `storybook-tests` job in
   `ci-actions.yml`.
2. **Capture** — `.github/scripts/storybook-screenshots.mjs` builds Storybook,
   serves `storybook-static/`, launches Playwright Chromium, and screenshots
   each changed story.
3. **Host** — the PNGs are pushed to a **per-PR orphan branch**
   `gh-screenshots-pr-<N>` (where `<N>` is the PR number). The branch is owned
   solely by that PR, so it is concurrency-safe **by construction** — no PR ever
   writes another PR's branch. Each run rebuilds the branch from a fresh orphan
   commit and **force-pushes** it, giving clean latest-only semantics with no
   fetch/merge/branch-exists/retry logic. Images are referenced via
   `raw.githubusercontent.com/<repo>/gh-screenshots-pr-<N>/<file>.png`.
4. **Comment** — a single sticky PR comment (found by the
   `<!-- storybook-screenshots-bot -->` marker and upserted via PATCH/POST)
   holds the gallery, so re-runs update in place rather than stacking comments.
5. **Cleanup** — `.github/workflows/pr-screenshots-cleanup.yml` runs on
   `pull_request: closed` and deletes `gh-screenshots-pr-<N>`
   (`git push origin --delete`, tolerating a missing branch) so per-PR branches
   don't accumulate.

## Design notes

- **No new dependencies or secrets.** The flow runs entirely on the default
  `GITHUB_TOKEN` with `contents: write` + `pull-requests: write`. Hosting the
  surface in Vercel Blob (cleaner URLs, no git churn) is a deferred enhancement
  that would require a `BLOB_READ_WRITE_TOKEN` secret.
- **Forks are skipped.** A forked PR's `GITHUB_TOKEN` is read-only and cannot
  push or delete a branch, so both workflows guard with
  `if: github.event.pull_request.head.repo.full_name == github.repository`.
- **Per-PR branch supersedes the old shared `gh-screenshots` branch**, which
  every PR mutated under a `pr-<N>/` subdirectory — the cross-PR shared mutable
  resource that motivated earlier push-race work.
