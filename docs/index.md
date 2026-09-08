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

## Sections

Pages are grouped into per-directory indexes, so navigation flows
`index.md → sub/index.md → sub/page.md`. This root index links each section
index; each section index lists its own pages.

- [Systems](systems/index.md) — cross-cutting subsystems: pipelines, data
  layers, and their invariants.
- [Scripts](scripts/index.md) — executable helpers in `scripts/` and the CI
  validators that guard the repo's conventions.

See [log.md](log.md) for the change history.

## Enforcement

This structure is enforced in CI by the `Docs structure` workflow
(`scripts/check-docs.mjs`, run locally with `pnpm run docs:check`): every
non-reserved page must carry frontmatter with a non-empty `type`, and every page
must be reachable from this index through the per-directory `index.md` files. See
[`scripts/check-docs.md`](scripts/check-docs.md). `README.md` is exempt (reserved
for general, non-index documentation).
