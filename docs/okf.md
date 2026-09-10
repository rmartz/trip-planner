---
type: Convention
title: Open Knowledge Format (OKF)
description: How the docs/ tree uses Google's Open Knowledge Format, and the pointer to the authoritative spec.
resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
tags: [documentation, okf, convention]
timestamp: 2026-09-08
---

# Open Knowledge Format (OKF)

The `docs/` tree is structured as an **Open Knowledge Format** bundle — Google's
open convention for storing knowledge as plain markdown files that both humans
and agents can traverse. One concept lives per file, each file carries YAML
frontmatter describing what it is, and files link to one another with ordinary
relative markdown links so the set forms a navigable graph.

> **Authoritative reference.** This page describes how _this repository_ applies
> OKF. For anything it does not cover — the full field families, conformance
> levels, or edge cases — the
> [OKF specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
> is authoritative. Where this page and the spec disagree, the spec wins; open an
> issue so this page can be corrected.

## Reserved filenames

OKF reserves two filenames (SPEC §3.1); this repo uses both:

| Filename   | Purpose                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `index.md` | A directory listing. One per content-bearing directory; see below.       |
| `log.md`   | A dated change history. The repo keeps a single top-level [log](log.md). |

An `index.md` is **exempt** from the frontmatter/`type` requirement: per SPEC §8
an index carries **no frontmatter at all**, with one exception — the bundle-root
[`docs/index.md`](index.md) MAY carry a single `okf_version` key (and nothing
else). Nested `index.md` files open straight into their listing body. `log.md`
keeps its `type` (SPEC §9).

`README.md` is **not** an OKF concept — it is reserved here for general,
non-index documentation and is exempt from the frontmatter and index rules.

## Frontmatter

Every non-reserved page opens with a YAML frontmatter block (the reserved
`index.md` and `README.md` are the exceptions — see above). Only `type` is
required (a concept carrying just `type` is fully conformant per SPEC §3.1); the
rest are recommended:

```yaml
---
type: Script # from the type vocabulary below
title: validate-config
description: One-line summary of what this documents.
resource: scripts/validate-config.mjs # repo-relative path to the documented asset
tags: [deployment, config]
timestamp: 2026-06-18
---
```

## Type vocabulary

`type` is a short string naming the kind of concept. This repo uses:

| `type`       | Meaning                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| `Log`        | A dated change-history file (the reserved `log.md`).                               |
| `Script`     | An executable helper in `scripts/`.                                                |
| `System`     | A cross-cutting subsystem spanning several files (a pipeline, a data layer).       |
| `Convention` | A repo-wide convention or process not tied to one script or subsystem (this page). |

(An `index.md` no longer carries a `type` — it is frontmatter-exempt per §8, so
there is no `Index` type.)

Add a new row here when a page genuinely does not fit the existing set — OKF
consumers tolerate unknown types, but this table should stay authoritative for
the repo.

## Navigation

Pages are reachable through a per-directory `index.md` chain. The root
[`docs/index.md`](index.md) links each section's `index.md`; each section index
lists that directory's pages and links the `index.md` of any content-bearing
subdirectory. So a reader (or agent) walks
`index.md → sub/index.md → sub/page.md` and never has to guess a path. Links are
plain relative markdown links; index entries should carry the linked page's
one-line description (SPEC §8).

## Enforcement

The frontmatter and navigation rules are enforced in CI by the `Docs structure`
workflow — see [`scripts/check-docs.md`](scripts/check-docs.md). Run it locally
with `pnpm run docs:check`.
