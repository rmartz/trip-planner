---
okf_version: "0.2"
---

# Documentation

Reference pages for agents (and humans) to retrieve before a task. This directory
is an [Open Knowledge Format (OKF)](okf.md) bundle: one concept per markdown file,
each with YAML frontmatter, cross-linked so the pages form a navigable graph. See
[okf.md](okf.md) for the format, the frontmatter fields, and the type vocabulary,
and the [authoritative OKF spec](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
for anything beyond it.

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
