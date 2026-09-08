---
type: Script
title: check-agents-md
description: Enforces the AGENTS.md/CLAUDE.md pairing convention; fails CI unless every AGENTS.md is paired with a bare `@AGENTS.md` CLAUDE.md wrapper.
resource: scripts/check-agents-md.mjs
tags: [agents, documentation, ci, validation]
timestamp: 2026-09-07
---

# check-agents-md.mjs

Enforces the agent directive-file convention (see AGENTS.md "Agent Directive
Files"): directives are authored once, in `AGENTS.md`, and `CLAUDE.md` is a thin
wrapper that imports them via Claude Code's `@AGENTS.md` syntax.

Maintaining `CLAUDE.md` as a full copy of `AGENTS.md` invites silent drift, and a
`CLAUDE.md → AGENTS.md` symlink hides the pairing from tools that walk the tree.
This check makes `AGENTS.md` the single source of truth and `CLAUDE.md` a bare
`@AGENTS.md` import, so there is exactly one place to edit and no copy to fall out
of sync. Exposed as `pnpm run agents:check` and run in CI via the `Agent
directive files` workflow.

## Usage

```bash
pnpm run agents:check
node scripts/check-agents-md.mjs
```

## What it checks

Walks the working tree (skipping `.git`, `.git-worktrees`, `.claude`,
`node_modules`, and build output), groups `AGENTS.md` / `CLAUDE.md` files by
directory, and for each directory asserts:

- **Pairing** — an `AGENTS.md` must have a companion `CLAUDE.md`, and a
  `CLAUDE.md` must have a companion `AGENTS.md`.
- **Bare wrapper** — a `CLAUDE.md` must contain only the single import line
  `@AGENTS.md` (blank lines aside); any other text is a violation.
- **No symlink** — a `CLAUDE.md` must be a real file, not a symlink to
  `AGENTS.md`.

Exits `0` when the whole tree is compliant; exits `1` with a `path: reason` line
per violation.

The decision logic lives in the dependency-free
`scripts/lib/check-agents-md.mjs` (with a `.d.mts` declaration), imported by both
the CLI wrapper and the spec at `src/ci/check-agents-md.spec.ts`. The filesystem
walk stays in the CLI, so the pure pairing/wrapper checks are unit-tested without
touching disk. The script uses only Node built-ins, so CI runs it without
installing dependencies.

## CI gating

The `Agent directive files` workflow is gated with a workflow-level `paths`
allowlist to PRs that touch an `AGENTS.md` / `CLAUDE.md` file, the validator, or
the workflow itself. This is safe because the check has a **closed input set**:
only those paths can change the outcome — the same allowlist rationale as
[check-package-pins](check-package-pins.md), and contrasting the documentation
**denylist** used for the open-input test/build jobs. On a PR that touches none
of those paths the check is _absent_ (non-blocking), leaving `main` unprotected
for non-directive changes — the same absent-vs-skipped rationale as the
[validate-config](validate-config.md) workflow.

## Related

- [check-package-pins](check-package-pins.md) — sibling closed-input validator
  gated by a `paths` allowlist.
