---
type: Index
title: Documentation Index
description: OKF-structured reference pages for trip-planner scripts and subsystems.
timestamp: 2026-06-18
---

# Documentation

Reference pages for agents (and humans) to retrieve before a task. This directory
follows Google's [Open Knowledge Format
(OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md):
one concept per markdown file, each with YAML frontmatter, cross-linked with plain
markdown links so the pages form a traversable graph.

## Frontmatter

Every page carries YAML frontmatter. Only `type` is required; the rest are
recommended:

```yaml
---
type: Script # the type vocabulary below
title: validate-config
description: One-line summary of what this documents.
resource: scripts/validate-config.mjs # repo-relative path to the documented file
tags: [deployment, config]
timestamp: 2026-06-18
---
```

## Type vocabulary

| `type`   | Meaning                                                                      |
| -------- | ---------------------------------------------------------------------------- |
| `Index`  | A directory listing (this page).                                             |
| `Log`    | A dated change-history file (per OKF's reserved `log.md` convention).        |
| `Script` | An executable helper in `scripts/`.                                          |
| `System` | A cross-cutting subsystem spanning several files (a pipeline, a data layer). |

`Convention` is reserved for future use (e.g. documenting a workflow or process
that is not tied to a single script or subsystem). Add new types here when a page
genuinely does not fit the existing set — OKF consumers tolerate unknown types,
but the table should stay authoritative.

## Pages

### Systems

- [Deployment Config Pipeline](systems/deployment-config.md) — how public config
  in `deployment/{env}.yml` is structured and validated against the schema.
- [Debug Auth (Staging/Preview Impersonation)](systems/debug-auth.md) — the
  staging-only custom-token sign-in mode for synthetic profiles, and its
  defense-in-depth safety layers.
- [Storybook Screenshot Previews](systems/storybook-screenshots.md) — how PR
  Storybook screenshots are captured, hosted on a per-PR branch, posted as a
  sticky comment, and cleaned up.

### Scripts

- [validate-config](scripts/validate-config.md) — validate config against
  `deployment/schema.yml`.
- [migrate-member-uids](scripts/migrate-member-uids.md) — backfill the
  `memberUids` array on trip documents.
- [backfill-transport-gap-count](scripts/backfill-transport-gap-count.md) —
  backfill the computed `transportGapCount` field on trip documents.
- [seed-test-profiles](scripts/seed-test-profiles.md) — idempotent seeder for the
  synthetic debug-auth profiles in the staging Firebase project.

See [log.md](log.md) for the change history.
