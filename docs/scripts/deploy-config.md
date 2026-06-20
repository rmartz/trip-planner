---
type: Script
title: deploy-config
description: Pushes public environment config from deployment/{env}.yml to Vercel via atomic upsert.
resource: scripts/deploy-config.sh
tags: [deployment, config, vercel]
timestamp: 2026-06-18
---

# deploy-config.sh

Pushes the public config in `deployment/{env}.yml` to the matching Vercel
environment. Part of the [Deployment Config Pipeline](../systems/deployment-config.md).

## Usage

```bash
scripts/deploy-config.sh --env=preview
scripts/deploy-config.sh --env=production
```

## Behavior

Reads `deployment/{env}.yml` and upserts every variable in its `variables:` block
to the corresponding Vercel environment via the REST API. The upsert is atomic —
there is no remove-then-add window in which a variable is temporarily absent.

To edit the YAML _and_ push in one step, use
[`update-config.sh --sync`](update-config.md) instead of running this directly.

Requires: `node`, `pnpm` (`vercel` as a devDependency), and `.vercel/project.json`.
