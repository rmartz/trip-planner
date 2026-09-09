---
type: Script
title: check-docs
description: Enforces the docs/ OKF conventions — frontmatter on every page and per-directory index.md navigability.
resource: scripts/check-docs.mjs
tags: [documentation, okf, ci, validation]
timestamp: 2026-09-08
---

# check-docs.mjs

Enforces the two structural conventions of the `docs/` reference set (see
AGENTS.md "Documentation"): every page carries OKF frontmatter, and the pages
form a navigable tree rooted at [`docs/index.md`](../index.md). Exposed as
`pnpm run docs:check` and run in CI via the `Docs structure` workflow.

## Usage

```bash
pnpm run docs:check
node scripts/check-docs.mjs
```

## What it checks

Walks the `docs/` tree and asserts two independent rule groups, reporting every
violation:

- **Frontmatter** — every non-reserved `*.md` file opens with a YAML frontmatter
  block (`---` … `---`) containing a non-empty `type` field, per
  [OKF SPEC](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
  §3.1. `README.md` is exempt: OKF reserves only `index.md` and `log.md`, and
  `README.md` is treated as a general-documentation landing file rather than an
  OKF concept.
- **Navigability** — every directory that holds content has an `index.md`; that
  `index.md` links every content page in its own directory; and it links the
  `index.md` of every subdirectory that itself holds content. By induction the
  whole tree is reachable from `docs/index.md` as
  `index.md → sub/index.md → sub/page.md`. `index.md`, `log.md`, and `README.md`
  are not themselves "content pages" and need not be listed.

Exits `0` when the tree is compliant; exits `1` with a `path: reason` line per
violation.

The decision logic lives in the dependency-free `scripts/lib/check-docs.mjs`
(with a `.d.mts` declaration): `frontmatterError`, `extractLinkTargets`, and
`navigationViolations`. The filesystem walk and markdown-link resolution stay in
the CLI, so those pure checks are unit-tested from
`src/ci/check-docs.spec.ts` without touching disk. The script uses only Node
built-ins, so CI runs it without installing dependencies.

## CI gating

The `Docs structure` workflow is gated with a workflow-level `paths` allowlist to
PRs that touch `docs/**`, the validator, or the workflow itself. This is safe
because the check has a **closed input set**: only those paths can change the
outcome — the same allowlist rationale as [check-package-pins](check-package-pins.md)
and [check-agents-md](check-agents-md.md), and contrasting the documentation
**denylist** used for the open-input test/build jobs. On a PR that touches none
of those paths the check is _absent_ (non-blocking), leaving `main` unprotected
for non-docs changes — the same absent-vs-skipped rationale as the
[validate-config](validate-config.md) workflow.

## Related

- [check-agents-md](check-agents-md.md), [check-package-pins](check-package-pins.md)
  — sibling closed-input validators gated by a `paths` allowlist.
