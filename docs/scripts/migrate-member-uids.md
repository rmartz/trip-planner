---
type: Script
title: migrate-member-uids
description: One-off Firestore migration that backfills a denormalized memberUids array onto trip documents.
resource: scripts/migrate-member-uids.mjs
tags: [firebase, firestore, migration]
timestamp: 2026-06-18
---

# migrate-member-uids.mjs

A one-off Firestore data migration. For each trip, it collects the member UIDs
(from each member document's `uid` field, falling back to the document id) and
writes the deduplicated, sorted set back onto the trip as a denormalized
`memberUids` array.

## Usage

```bash
node scripts/migrate-member-uids.mjs --dry-run            # report only, no writes
node scripts/migrate-member-uids.mjs                      # migrate all trips
node scripts/migrate-member-uids.mjs --trip-id=<id>       # migrate a single trip
```

## Flags

- `--dry-run` — compute and report changes without writing.
- `--trip-id=<id>` — restrict the migration to a single trip.

## Credentials

Uses Firebase Admin. Reads `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and
`FIREBASE_PRIVATE_KEY` from the environment when all three are present; otherwise
falls back to application-default credentials (`gcloud auth application-default
login`).

Requires: `node`, `firebase-admin`.
