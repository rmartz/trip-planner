---
type: System
title: Deployment Config Pipeline
description: How public (non-secret) environment config in deployment/{env}.yml is structured and validated against the schema.
resource: deployment/schema.yml
tags: [deployment, config, firebase]
timestamp: 2026-06-18
---

# Deployment Config Pipeline

Public, non-secret environment configuration lives in version-controlled YAML
under `deployment/`, validated against a schema. Secrets never live in these
files — they are managed directly in Vercel. Local tooling to push config to
Vercel and rotate secrets is being replaced by the planned `envctl` CLI; until it
lands, those steps are performed manually against the Vercel dashboard/CLI.

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
edit deployment/{env}.yml  ──pnpm run env:validate──▶  validate-config.mjs
                                                            (schema check)
```

- **Write a value**: hand-edit the relevant `deployment/{env}.yml` (only
  `NEXT_PUBLIC_*` / allowlisted keys).
- **Validate**: [`validate-config.mjs`](../scripts/validate-config.md) (`pnpm run
env:validate`) checks every key against `schema.yml`. Runs in CI (the
  `validate-config` workflow) and on every commit via the pre-commit hook.
- **Push to Vercel / rotate secrets**: pending the planned `envctl` CLI. The
  former `deploy-config.sh` / `rotate-keys.sh` helpers were removed when
  `vercel-deploy-scripts` (which transitively supplied the `vercel` CLI they
  used) was dropped; perform these steps manually via the Vercel dashboard/CLI in
  the meantime.

## Guardrails

- Secrets must never be added to `deployment/{env}.yml`; the denied-pattern rules
  in `schema.yml` reject them, and `pnpm run env:validate` runs on every commit.
- Secrets belong in Vercel's encrypted env settings (or `vercel env add`), never
  in the version-controlled YAML.
