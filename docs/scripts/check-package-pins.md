---
type: Script
title: check-package-pins
description: Enforces the full major.minor.patch dependency-pin rule on package.json; runs in CI on package-changing PRs.
resource: scripts/check-package-pins.mjs
tags: [dependencies, ci, validation]
timestamp: 2026-06-30
---

# check-package-pins.mjs

Enforces the "full version pin" rule (see CLAUDE.md "Dependency pins"): every
registry dependency in `package.json` must specify a full `major.minor.patch`
version, with an optional `^`/`~` range annotation — e.g. `^4.1.13`, `~1.2.3`,
or the exact `19.2.7`, never a bare `^4` or `^4.1`. Full pins make every
Dependabot bump (including minor/patch) surface as a `package.json` diff rather
than landing silently in the lockfile. Exposed as `pnpm run pins:check` and run
in CI via the `Package pins` workflow.

## Usage

```bash
pnpm run pins:check          # validate the root package.json
node scripts/check-package-pins.mjs
```

## Behavior

Reads the root `package.json` and checks each entry in `dependencies` and
`devDependencies`. A range is an offender when, after stripping a single leading
`^` or `~`, its base does not start with `major.minor.patch`. A trailing
prerelease/build suffix (`-rc.1`, `+build`) is allowed. Exits `0` when all
ranges are fully pinned, `1` (with one line per offender) otherwise.

Non-registry specifiers are skipped (never offenders): `workspace:*`,
`catalog:`/`catalog:<name>`, `link:`, `file:`, `git+…`, `http(s)://…`,
`github:…`, and `npm:<alias>@…`.

The validation logic lives in the dependency-free
`scripts/lib/check-package-pins.mjs` (with a `.d.mts` declaration), imported by
both the CLI wrapper and the spec at `src/ci/check-package-pins.spec.ts`. The
script uses only Node built-ins, so CI runs it without installing dependencies.

## CI gating

The `Package pins` workflow is gated with a workflow-level `paths` allowlist to
package-changing PRs. This is safe because the check has a **closed input set**:
only a `package.json`, the validator, or the workflow itself can change the
outcome — contrast the documentation **denylist** used for the open-input
test/build jobs. On a PR that touches none of those paths the check is _absent_
(non-blocking), leaving `main` unprotected for non-package changes — the same
absent-vs-skipped rationale as the [validate-config](validate-config.md)
workflow.
