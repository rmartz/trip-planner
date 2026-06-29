---
type: Script
title: seed-test-profiles
description: Idempotent Firestore seeder for the synthetic debug-auth profiles used in staging/preview. Refuses to run against production.
resource: scripts/seed-test-profiles.mjs
tags: [firebase, firestore, auth, debug, staging]
timestamp: 2026-06-28
---

# seed-test-profiles.mjs

Seeds (and refreshes) the synthetic `users/{uid}` profiles that back the
staging/preview **debug auth** mode (see GitHub issue #379). Testers use these
profiles to sign in without OAuth via Firebase custom tokens, sidestepping the
authorized-domains restriction on dynamic Vercel preview URLs.

The script is **idempotent** (re-runnable; writes use `merge: true`) and
**refuses to run against the production project** (`trip-planner-ae59d`) — it
only seeds the isolated staging project (`trip-planner-staging`).

## Single source of truth

The canonical profile list lives in
[`src/lib/debug-auth/test-profiles.json`](../../src/lib/debug-auth/test-profiles.json).
The same JSON is imported by:

- this seed script (`.mjs`, by relative path), and
- the TypeScript app code — `src/lib/debug-auth/test-profiles.ts` (allowlist +
  eligibility helpers), the impersonation endpoint, and the switcher UI.

A `.mjs` admin script cannot import `@/`-aliased TypeScript, so a plain JSON file
is the cleanest shared source: the seeded uids, the endpoint allowlist, and the
UI list can never drift.

## Reserved uid prefix

All synthetic uids use the reserved prefix `synthetic:` (e.g.
`synthetic:planner`). Firebase-generated real uids are 28-character random
strings that never contain a colon, and we never assign custom uids in
production, so a real user's uid can **never** collide with a synthetic one. This
makes real-user impersonation structurally impossible at the prefix layer.

## Usage

```bash
node scripts/seed-test-profiles.mjs --dry-run   # report only, no writes
node scripts/seed-test-profiles.mjs             # seed/refresh all profiles
```

## Flags

- `--dry-run` — list the profiles that would be seeded without writing.

## Safety guard

Before initializing the Admin app, the script resolves the Firebase project id
(`FIREBASE_PROJECT_ID`) and calls `assertNotProduction`, which throws — aborting
the run — if the id is the production project or cannot be resolved.

## Credentials

Uses Firebase Admin. Reads `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
`FIREBASE_PRIVATE_KEY` from the environment when all three are present; otherwise
falls back to application-default credentials (`gcloud auth application-default
login`).

Requires: `node`, `firebase-admin`.
