---
type: System
title: Debug Auth (Staging/Preview Impersonation)
description: A staging/preview-only sign-in mode that mints Firebase custom tokens for synthetic profiles, sidestepping the OAuth authorized-domains restriction on dynamic preview URLs.
resource: src/app/api/debug/impersonate/route.ts
tags: [auth, firebase, debug, staging, preview, security]
timestamp: 2026-06-28
---

# Debug Auth (Staging/Preview Impersonation)

Firebase OAuth (`signInWithPopup`) requires the requesting domain to be in the
Firebase **Authorized domains** list. Vercel preview deployments get dynamic,
per-deployment URLs that cannot be safely allowlisted, which blocks OAuth sign-in
on preview/staging.

Custom-token auth is **not** subject to the authorized-domains list. So this mode
lets testers switch between synthetic profiles by minting Firebase **custom
tokens** server-side and signing in with `signInWithCustomToken`. Because this
yields a real Firebase ID token, Firestore rules and Admin `verifyIdToken`
authorize exactly as in production — the auth _model_ is unchanged, only the
sign-in _mechanism_ is swapped. There is no client-side session faking and no
DB-layer bypass.

## Components

- **Seed script** —
  [`scripts/seed-test-profiles.mjs`](../scripts/seed-test-profiles.md) seeds the
  synthetic `users/{uid}` profiles in the staging Firebase project.
- **Impersonation endpoint** — `src/app/api/debug/impersonate/route.ts` returns
  `getAdminAuth().createCustomToken(uid, { synthetic: true })` for an eligible
  uid. (Admin uses cert-based creds, so `createCustomToken` signs directly with
  no extra IAM roles.)
- **Switcher UI** — `src/components/debug/DebugUserSwitcher.tsx` (a thin wrapper
  wiring hooks) + `DebugUserSwitcherView.tsx` (presentational). Surfaced from the
  sign-in screen, gated on `NEXT_PUBLIC_ENABLE_DEBUG_AUTH`.
- **Shared profile source** —
  [`src/lib/debug-auth/test-profiles.json`](../../src/lib/debug-auth/test-profiles.json),
  imported by both the TS app code and the `.mjs` seed script so the seeded uids
  and the endpoint allowlist never drift.

## Defense in depth

The endpoint is an impersonate-as-uid oracle, so it is gated on multiple
independent layers — any single layer failing still bounds the blast radius:

1. **Environment gate (primary control)** — `if (process.env.VERCEL_ENV ===
"production") return 404`. The same code deploys to prod, so this is what
   keeps the endpoint out of production.
2. **Reserved uid namespace** — only mint for uids with the `synthetic:` prefix.
   Real Firebase uids are 28-char random strings, so a real user's uid cannot
   match, making real-user impersonation structurally impossible.
3. **Explicit allowlist** — the uid must also be one of the seeded profiles.
4. **Synthetic token claim** — minted with `{ synthetic: true }` so sessions are
   detectable for logging/metrics exclusion (and optional Firestore-rule
   confinement later).
5. **Public UI flag** — `NEXT_PUBLIC_ENABLE_DEBUG_AUTH`, set only in
   `deployment/preview.yml`, so the switcher is absent from the production
   bundle.

Worst case (endpoint somehow reachable) is bounded to: non-prod only ×
synthetic-prefixed × allowlisted uids, sessions clearly labeled — never a real
account.

## Setup

1. Seed the staging profiles:
   `node scripts/seed-test-profiles.mjs` (see the
   [script page](../scripts/seed-test-profiles.md)).
2. `NEXT_PUBLIC_ENABLE_DEBUG_AUTH: "true"` is already set in
   `deployment/preview.yml` (and must never be added to `production.yml`).
3. On a preview deployment's sign-in screen, the **Debug sign-in** panel lists
   the synthetic profiles; selecting one signs in via custom token.
