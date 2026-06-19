---
type: Script
title: rotate-keys
description: Rotates Firebase service-account keys and Sentry auth tokens, updates Vercel, and decommissions old credentials after a healthy deployment.
resource: scripts/rotate-keys.sh
tags: [deployment, secrets, firebase, sentry, vercel]
timestamp: 2026-06-18
---

# rotate-keys.sh

Rotates secrets (Firebase service-account keys, Sentry auth tokens) for one or
both environments. Pushes the new values to Vercel, waits for a healthy
deployment, then decommissions the old credentials. Part of the
[Deployment Config Pipeline](../systems/deployment-config.md).

## Usage

```bash
scripts/rotate-keys.sh --env=preview
scripts/rotate-keys.sh --env=production
scripts/rotate-keys.sh                  # rotates both environments
scripts/rotate-keys.sh --force-single   # allow single-environment repos
```

## Flags

- `--env=<preview|production>` — rotate one environment. Omit to rotate both.
- `--force-single` — permit rotation in a repo configured with only one
  environment.

## Credentials

All rotation credentials come from local user auth — nothing is read from Vercel:

- Firebase: `gcloud auth login`
- Sentry: `sentry-cli login` (or `SENTRY_AUTH_TOKEN` in the shell)
- Vercel: `pnpm exec vercel login`

Secrets rotated here are **not** stored in `deployment/{env}.yml` — they go
straight to Vercel.

Requires: `gcloud`, `jq`, `curl`. `vercel` is used via `pnpm exec vercel`.
`sentry-cli` is needed only when `SENTRY_ORG` is configured for a target
environment.
