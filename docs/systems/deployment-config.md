---
type: System
title: Deployment Config Pipeline
description: How public (non-secret) environment config flows from deployment/{env}.yml through validation to Vercel, and how secrets are rotated.
resource: deployment/schema.yml
tags: [deployment, config, vercel, secrets, firebase]
timestamp: 2026-06-18
---

# Deployment Config Pipeline

Public, non-secret environment configuration lives in version-controlled YAML
under `deployment/` and is pushed to Vercel by helper scripts. Secrets never live
in these files — they are managed directly in Vercel and rotated out-of-band.

## Files

- `deployment/environments.yml` — the list of environments (e.g. `preview`,
  `production`) the tooling iterates over.
- `deployment/{env}.yml` — per-environment public config. Each file has a
  `variables:` block of `KEY: value` pairs.
- `deployment/schema.yml` — the allow/deny rules every config key is checked
  against:
  1. `denied_patterns` — reject immediately (belt-and-suspenders). Patterns
     matching `*SECRET*`, `*_TOKEN*`, or `*PRIVATE_KEY*` are hard-denied.
  2. `allowed_patterns` — accept if matched (e.g. `NEXT_PUBLIC_*`).
  3. `allowed_keys` — accept if listed explicitly.

## Flow

```
edit deployment/{env}.yml  ──update-config.sh──▶  validated YAML
        │                                              │
        │                                       deploy-config.sh
        ▼                                              ▼
  validate-config.mjs  ◀──pnpm run env:validate──   Vercel env
```

- **Write a value**: [`update-config.sh`](../scripts/update-config.md) edits the
  YAML (and with `--sync`, immediately pushes to Vercel).
- **Validate**: [`validate-config.mjs`](../scripts/validate-config.md) (`pnpm run
env:validate`) checks every key against `schema.yml`. Runs in CI (the
  `validate-config` workflow) and on every commit via the pre-commit hook.
- **Push to Vercel**: [`deploy-config.sh`](../scripts/deploy-config.md) upserts
  the YAML's `variables:` block to the corresponding Vercel environment.
- **Rotate secrets**: [`rotate-keys.sh`](../scripts/rotate-keys.md) rotates
  Firebase service-account keys and Sentry auth tokens — these are _not_ in the
  YAML; they are pushed straight to Vercel and the old credentials decommissioned
  after a healthy deployment.

## Guardrails

- Secrets must never be added to `deployment/{env}.yml`; the denied-pattern rules
  in `schema.yml` reject them, and `pnpm run env:validate` runs on every commit.
- Sensitive values must never be passed as `KEY=value` arguments to
  `update-config.sh` — they would leak into shell history and `ps` output. Use
  `pnpm exec vercel env add` for secrets instead.
