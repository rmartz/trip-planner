---
type: Script
title: validate-config
description: Validates deployment config files against deployment/schema.yml; runs in CI and on every commit.
resource: scripts/validate-config.mjs
tags: [deployment, config, validation, ci]
timestamp: 2026-06-18
---

# validate-config.mjs

Validates every environment's `deployment/{env}.yml` against
`deployment/schema.yml`. Exposed as `pnpm run env:validate` and run in CI and via
the secrets-check pre-commit hook. Part of the
[Deployment Config Pipeline](../systems/deployment-config.md).

## Usage

```bash
pnpm run env:validate            # validate all environments
node scripts/validate-config.mjs --env=preview   # validate one environment
```

## Behavior

Reads each environment listed in `deployment/environments.yml`, loads the matching
`deployment/{env}.yml`, and checks every key in order:

1. `denied_patterns` — reject immediately (e.g. `*SECRET*`, `*_TOKEN*`,
   `*PRIVATE_KEY*`).
2. `allowed_patterns` — accept if matched (e.g. `NEXT_PUBLIC_*`).
3. `allowed_keys` — accept if listed explicitly.

Exits `0` when all configs are valid, `1` when any violation is found. The YAML
parser is intentionally minimal — it handles the flat `key: value` format used by
these files and does not support anchors, multiline values, or nesting.
