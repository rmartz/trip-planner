---
type: Log
title: Documentation Change Log
description: Dated history of changes to the docs/ reference set.
timestamp: 2026-06-18
---

# Change Log

- **2026-06-29** — Added the Storybook Screenshot Previews System page. Moved PR
  screenshots off the single shared `gh-screenshots` branch (written by every
  PR under a `pr-<N>/` subdir) to a per-PR orphan branch `gh-screenshots-pr-<N>`
  that is force-pushed each run and deleted on PR close — concurrency-safe by
  construction, no new deps or secrets. (#399)
- **2026-06-28** — Removed the `update-config`, `deploy-config`, and `rotate-keys`
  Script pages and trimmed the deployment-config System page: those scripts were
  deleted because the `vercel` CLI they used is gone after dropping
  `vercel-deploy-scripts`; their role is slated for the planned `envctl` CLI.
  Config validation (`validate-config` / `env:validate`) and the YAML configs are
  retained. (#381)
- **2026-06-28** — Added the Debug Auth System page and the `seed-test-profiles`
  Script page for the staging/preview-only custom-token impersonation mode:
  synthetic-profile sign-in without OAuth, gated by environment, reserved uid
  prefix, an allowlist, a `synthetic` token claim, and the
  `NEXT_PUBLIC_ENABLE_DEBUG_AUTH` flag. (#379)
- **2026-06-24** — Removed the gitleaks secret-scan from the deployment-config
  pipeline along with the `vercel-deploy-scripts` dependency; config validation
  (`env:validate`) is retained. Updated the `validate-config` and
  deployment-config pages accordingly. (#377)
- **2026-06-23** — Added the `backfill-transport-gap-count` Script page for the
  one-off migration that backfills the computed `transportGapCount` field onto
  existing trip documents. (#257)
- **2026-06-18** — Established the OKF-structured `docs/` directory. Added the
  type vocabulary (`Index`, `Script`, `System`), the deployment-config pipeline
  System page, and Script pages for `update-config`, `deploy-config`,
  `rotate-keys`, `validate-config`, and `migrate-member-uids`. (#351)
