---
type: Script
title: backfill-transport-gap-count
description: One-off Firestore migration that backfills the server-computed transportGapCount field onto existing trip documents.
resource: scripts/backfill-transport-gap-count.mjs
tags: [firebase, firestore, migration, transport]
timestamp: 2026-06-23
---

# backfill-transport-gap-count.mjs

A one-off Firestore data migration. `transportGapCount` is a server-side computed
field on trip documents that is recomputed after every leg mutation. Trips
created before that field was introduced have no value stored, so the dashboard
gap pill reads `0` until a future leg mutation triggers a recompute. This script
recomputes the count for each trip from its current legs and transportation
entries and writes the result back, so existing trips show an accurate gap count
immediately.

## Usage

```bash
node scripts/backfill-transport-gap-count.mjs --dry-run        # report only, no writes
node scripts/backfill-transport-gap-count.mjs                  # backfill all trips
node scripts/backfill-transport-gap-count.mjs --trip-id=<id>   # backfill a single trip

pnpm run backfill:transport-gap-count -- --dry-run             # via the package script
```

Run once post-deploy. The script is idempotent: a trip whose stored
`transportGapCount` already equals the recomputed value is skipped, so it is safe
to re-run.

## Flags

- `--dry-run` — compute and report changes without writing.
- `--trip-id=<id>` — restrict the backfill to a single trip.

## What it computes

For each trip the script reads the `legs`, `transportation`, and `members`
subcollections and computes `transportGapCount` the same way the runtime does
(`computeLegSummary` in `src/services/transportation.ts` and
`computeTransportGapCount` in `src/lib/trips/transport.ts`):

- Only **active** legs (`isActive !== false`) are counted.
- Per leg, the gap is `max(0, needRide − openSeats)`, where `needRide` is the
  number of trip members with status `need-transportation` and `openSeats` is the
  sum of `driving-with-seats` offers, each reduced by the members assigned to ride
  with that driver.
- Only entries whose `uid` is a current trip member are counted.
- Per-leg gaps are summed; a surplus on one leg never offsets a deficit on
  another.

The pure computation lives in `scripts/lib/transport-gap.mjs` (a plain-ESM mirror
of the TypeScript runtime logic, since a `.mjs` admin script cannot import the
path-aliased, firebase-admin-coupled TS services). It is verified against the
runtime logic by `src/lib/trips/backfill-transport-gap.spec.ts`.

## Credentials

Uses Firebase Admin. Reads `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
`FIREBASE_PRIVATE_KEY` from the environment when all three are present; otherwise
falls back to application-default credentials (`gcloud auth application-default
login`).

Requires: `node`, `firebase-admin`.
