---
type: Script
title: update-config
description: Updates a public deployment config value in deployment/{env}.yml, optionally syncing to Vercel.
resource: scripts/update-config.sh
tags: [deployment, config, vercel, firebase]
timestamp: 2026-06-18
---

# update-config.sh

Writes public, non-secret config values into `deployment/{env}.yml`. Part of the
[Deployment Config Pipeline](../systems/deployment-config.md).

## Usage

```bash
scripts/update-config.sh --env=preview KEY=value [KEY=value ...]
scripts/update-config.sh --env=production --firebase-config=/path/to/config.json
scripts/update-config.sh --env=preview --firebase-config=... --sync
```

## Flags

- `--env=<preview|production>` (required) — which `deployment/{env}.yml` to update.
- `KEY=value` — one or more public config pairs to write.
- `--firebase-config=<path>` — path to a JSON file holding the `firebaseConfig`
  object from the Firebase console; the relevant `NEXT_PUBLIC_FIREBASE_*` keys are
  extracted and mapped automatically. Both strict JSON and the JS object-literal
  form the console emits are accepted.
- `--sync` — after writing the YAML, immediately push to Vercel by invoking
  [`deploy-config.sh`](deploy-config.md). Without it, only the local YAML changes.

## Safety

Sensitive values must **never** be passed as `KEY=value` — they leak into shell
history and `ps` output. Use `pnpm exec vercel env add` for secrets, or rotate
them with [`rotate-keys.sh`](rotate-keys.md).

Requires: `node`.
