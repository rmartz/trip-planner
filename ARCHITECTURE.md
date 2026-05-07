# Technical Architecture Reference

This document captures non-business-logic technical decisions, patterns, and infrastructure setup for building a Next.js application with Firebase, Vercel, and high test coverage.

## Stack

| Layer           | Technology                      | Purpose                                        |
| --------------- | ------------------------------- | ---------------------------------------------- |
| Framework       | Next.js (App Router)            | Fullstack React with SSR/API routes            |
| Language        | TypeScript (strict mode)        | Type safety throughout                         |
| Package Manager | pnpm                            | Fast, disk-efficient dependency management     |
| UI Components   | ShadCN UI + Tailwind CSS        | Composable, accessible component primitives    |
| State (server)  | TanStack Query                  | Server state caching, polling, invalidation    |
| State (client)  | Redux Toolkit                   | Local UI state (forms, config panels)          |
| Database        | Firestore                       | Primary persistent storage                     |
| Real-time state | Firebase Realtime Database      | Lightweight real-time push (e.g. badge counts) |
| Auth            | Firebase Admin SDK (server)     | Session-based auth via API routes              |
| Hosting         | Vercel                          | Deployment, preview URLs, edge functions       |
| Testing         | Vitest + @testing-library/react | Unit, component, and integration tests         |
| Visual Testing  | Storybook 10                    | Component development and visual documentation |
| CI/CD           | GitHub Actions                  | Lint, format, test, build on every PR          |
| Monitoring      | Sentry                          | Error tracking (client + server + edge)        |

## Project Structure

```
project-root/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── page.tsx            # Home page
│   │   ├── [dynamic]/          # Dynamic route segments
│   │   └── api/                # API route handlers
│   ├── components/
│   │   ├── ui/                 # ShadCN UI primitives (auto-generated, excluded from lint/prettier)
│   │   ├── {feature}/          # Feature-specific components with co-located stories and tests
│   │   └── {shared}/           # Shared components
│   ├── lib/
│   │   ├── firebase/           # Firebase Admin + client SDK wrappers
│   │   │   ├── admin.ts        # Server-side Firebase Admin initialization
│   │   │   ├── client.ts       # Client-side Firebase SDK initialization
│   │   │   └── schema/         # TypeScript types and serialization helpers
│   │   ├── types/              # Core domain types (barrel-exported)
│   │   └── utils.ts            # Shared utility functions (e.g., cn() for Tailwind)
│   ├── server/
│   │   ├── types/              # API response types (public-facing)
│   │   └── utils/              # Server-only helpers (auth, validation)
│   ├── services/               # Data access layer (Firebase-backed)
│   ├── hooks/                  # Custom React hooks (barrel-exported)
│   ├── store/                  # Redux Toolkit slices
│   └── test-setup/             # Vitest setup files (mocks, globals)
├── .storybook/                 # Storybook configuration
├── .github/
│   ├── actions/setup/          # Composite action: pnpm + Node.js + install
│   └── workflows/              # CI workflows
├── docs/                       # Feature documentation
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.mts
├── eslint.config.js            # Flat config with typescript-eslint + react-hooks + storybook
├── postcss.config.mjs
└── .prettierignore
```

## Firebase Architecture

### Database strategy

**Firestore** is the primary datastore. The relational structure of trips, stops, legs, members, lodging, transportation, and activity preferences maps naturally to Firestore subcollections with richer querying than RTDB's flat tree model.

**Firebase Realtime Database (RTDB)** is used only for real-time state that needs push-without-polling. In practice this means a single unread-count path per user for the notification badge:

```
users/{uid}/unreadCount    # Incremented server-side; client subscribes via onValue
```

Prefer Firestore for everything else. Reach for RTDB only when you need guaranteed sub-second client push and polling is not acceptable.

### Packages

- `firebase` (client SDK) — browser-side Firestore and RTDB access
- `firebase-admin` (server SDK) — server-side Firestore and RTDB access via API routes

### Initialization

Both SDKs are lazily initialized to avoid errors during static builds (CI has no env vars). Import the specific Firebase product on top of the shared app accessor:

```typescript
// Example usage (in a service or hook):

// Client-side (browser)
import { getClientApp } from "@/lib/firebase/client";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // RTDB — only for real-time state

const db = getFirestore(getClientApp());

// Server-side (API route)
import { getAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database"; // RTDB — only for real-time state

const db = getFirestore(getAdminApp());
```

Product instances should be accessed via function calls, never module-level constants.

### Firestore schema patterns

Collections are organized as top-level collections with subcollections:

```
users/{uid}                                    # User profile document
users/{uid}/destinations/{destinationId}       # Personal destination catalog
users/{uid}/notifications/{notificationId}     # Per-user notification records

trips/{tripId}                                 # Trip document
trips/{tripId}/members/{uid}                   # Member role (Planner / Guest)
trips/{tripId}/stops/{stopId}                  # Stop document
trips/{tripId}/stops/{stopId}/activities/{id}  # Activity proposals per stop
trips/{tripId}/stops/{stopId}/lodging/{uid}    # Lodging status per guest per stop
trips/{tripId}/legs/{legId}                    # Leg document (between stops)
trips/{tripId}/legs/{legId}/transport/{uid}    # Transport status per guest per leg
trips/{tripId}/expenses/{expenseId}            # Expense records
```

Security rules scope all reads and writes to the authenticated `uid`. Trip-scoped data is readable by members of that trip.

### Serialization layer

- TypeScript interfaces define the domain model — co-located with their feature or in `src/lib/types/` as the project grows
- `{domain}ToFirebase()` converts domain objects to Firestore-safe format — no `undefined` values; use `null` only when the Firestore schema explicitly requires it
- `firebaseTo{Domain}()` converts Firestore `DocumentSnapshot` data back to domain objects, applying defaults
- Boolean fields are always written explicitly (not sparse) and deserialized with `?? false`
- Timestamps are converted to `Date` at the service boundary; never store raw `Timestamp` objects in domain types

### Real-time updates (RTDB only)

RTDB is used exclusively for the notification badge unread count:

- Server increments `users/{uid}/unreadCount` when writing a notification record to Firestore
- Client subscribes via `onValue` (wrapped in a custom hook) — no polling needed
- All other data is fetched from Firestore via TanStack Query; mutations go through API routes

### Environment variables

| Variable                            | Side   | Description                                       |
| ----------------------------------- | ------ | ------------------------------------------------- |
| `FIREBASE_PROJECT_ID`               | Server | Firebase project ID                               |
| `FIREBASE_CLIENT_EMAIL`             | Server | Service account email                             |
| `FIREBASE_PRIVATE_KEY`              | Server | Service account key (literal `\n`)                |
| `FIREBASE_DATABASE_URL`             | Server | RTDB URL (required for notification badge counts) |
| `NEXT_PUBLIC_FIREBASE_*`            | Client | Client SDK config (API key, auth domain, etc.)    |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Client | RTDB URL (client subscribes to unread-count path) |

`NEXT_PUBLIC_` variables are bundled into client JavaScript — this is by design. Access control is enforced by Firestore security rules and RTDB rules, not by hiding these keys.

## Vitest Configuration

Three test projects in `vitest.config.mts`:

```typescript
{
  test: {
    projects: [
      {
        // Unit tests (actions, services, utilities)
        test: { name: "node", environment: "node", include: ["src/**/*.spec.ts"] },
      },
      {
        // Hook tests (require React context)
        test: { name: "hooks", environment: "happy-dom", include: ["src/hooks/**/*.spec.ts"] },
      },
      {
        // Component tests (require DOM)
        test: { name: "components", environment: "happy-dom", include: ["src/**/*.spec.tsx"] },
      },
    ],
  },
}
```

The file extension convention (`.spec.ts` vs `.spec.tsx`) determines which project runs each test. This keeps the split automatic — no manual tagging or directory-based routing needed.

### Test File Conventions

- Co-located with source: `Component.spec.tsx`, `utility.spec.ts`
- Component tests use `@testing-library/react` with `afterEach(cleanup)`
- No jest-dom matchers — use `.toBeDefined()` or `.textContent`
- Test fixtures use `make{Domain}()` factory functions
- Large test files split into `{module}-tests/` directories

## Storybook Configuration

### Setup

- Framework: `@storybook/nextjs-vite`
- Addons: `addon-a11y`, `addon-docs`, `eslint-plugin-storybook`
- Tailwind loaded via `globals.css` import in `.storybook/preview.ts`

### Conventions

- Stories co-located as `ComponentName.stories.tsx`
- Presentational split for hook-dependent components: `{Component}View` accepts callbacks
- Mock data fixtures — no Firebase, no providers
- ESLint: strict TS rules relaxed for `.stories.tsx`; `.storybook/` and `storybook-static/` ignored

### Future Evaluation

- Chromatic for visual regression testing
- `@storybook/addon-vitest` for story-based integration testing
- `@storybook/addon-onboarding` — interactive first-launch walkthrough. Low value for solo/small-team projects where conventions are documented in AGENTS.md. May be useful for projects with frequent new contributors who need to learn the story writing workflow.

## ESLint Configuration

Flat config (`eslint.config.js`) with:

- `typescript-eslint` strict + stylistic type-checked rules for `src/**/*.{ts,tsx}`
- `react-hooks` plugin (rules-of-hooks + exhaustive-deps as errors)
- `eslint-plugin-storybook` flat/recommended
- Relaxed rules for test files (`*.test.ts`) and story files (`*.stories.tsx`)
- Ignored: `dist/`, `node_modules/`, `.next/`, `storybook-static/`, `.storybook/`, `src/components/ui/`

## CI/CD Pipeline

### GitHub Actions

**Composite setup action** (`.github/actions/setup/action.yml`):

```yaml
- pnpm/action-setup (install pnpm)
- actions/setup-node (with cache: "pnpm")
- pnpm install --frozen-lockfile
```

**CI checks** (run on every PR):
| Job | Command | Purpose |
|---|---|---|
| Tests | `pnpm test` | Vitest across all projects |
| Lint | `pnpm lint` | ESLint with zero warnings |
| Format | `pnpm format:check` | Prettier check |
| Build | `pnpm build` | Next.js production build |

**Claude Code** (`issue_comment`, `pull_request_review_comment`, `issues`): Optional — runs Claude Code action when `@claude` is mentioned in issues/PRs. Requires `ANTHROPIC_API_KEY` secret.

### Vercel

- Automatic preview deployments on every PR
- Production deployment on merge to main
- Root directory: project root (no subdirectory)

## Service Layer Pattern

### Separation of Concerns

```
API Route → Service (data access) → Firebase
```

- **Services**: Pure data access — read/write Firebase. No business logic.
- **Business logic modules**: Domain-specific logic separated from data access.

### Service Conventions

- Service functions accept and return typed interfaces, never raw Firebase snapshots
- Timestamps converted to `Date` objects at the service boundary
- Each domain gets its own service file or directory
- Components never import Firebase directly — all data access goes through services or hooks

## State Management

### Server State (TanStack Query)

- Data fetched via `useQuery` → API routes → Firestore (Admin SDK)
- Mutations via `useMutation` → API routes → Firestore (Admin SDK); cache invalidated on success
- RTDB `onValue` subscriptions are used only for the notification badge unread count — not for general data fetching

### Client State (Redux Toolkit)

- Used for local UI state only (forms, config panels)
- Slices in `store/{feature}-slice.ts`
- Connected to components via `useAppSelector` / `useAppDispatch`

### Providers Pattern

A client boundary component wraps the app with all required providers:

```
Root Layout → Providers ("use client") → QueryClientProvider → AuthProvider → Pages
```

`QueryClient` is created via `useState` inside the Providers component to avoid re-creation on re-renders.

### Real-Time Pattern (notification badge only)

```
Server writes to Firestore + increments RTDB unreadCount → onValue callback → React re-render
```

All other data follows a request/response pattern through TanStack Query. Mutations go through API routes → Firestore Admin SDK → TanStack Query cache invalidation.

## Authentication Pattern

The template uses Firebase Auth with server-side session cookies for SSR compatibility.

### AuthProvider → useAuth() contract

`AuthProvider` (`src/components/auth/AuthProvider.tsx`) subscribes to `onAuthStateChanged` and exposes `{ user: User | null, profile: UserProfile | undefined, loading: boolean }` via React context. Components and hooks access this via `useAuth()` from `src/hooks/use-auth.ts` — never import Firebase Auth directly in components. `profile` is populated asynchronously after sign-in from the `users/{uid}` Firestore document and is `undefined` while loading or when signed out.

### Session cookie flow

1. User signs in via `signIn()` / `signUp()` from `src/services/auth.ts`
2. Client calls `user.getIdToken()` and POSTs it to `POST /api/auth/session`
3. The server calls `getAdminAuth().createSessionCookie()` and sets an `HttpOnly`, `Secure`, `SameSite=Strict` cookie
4. Proxy (`src/proxy.ts`) verifies the cookie on every request via `getAdminAuth().verifySessionCookie(cookie, true)` and redirects unauthenticated requests to `/sign-in?next=<path>`
5. On sign-out, call `DELETE /api/auth/session` to clear the cookie, then call `signOut()` from the auth service

The proxy runs in the Node.js runtime (not Edge) because `firebase-admin` does not support the Edge runtime.

### Adding SSO providers (Google, Apple, etc.)

Adding a provider requires only client-side changes — no server modifications needed. Add a function to `src/services/auth.ts` and call it from the component:

```typescript
// src/services/auth.ts
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export async function signInWithGoogle() {
  const credential = await signInWithPopup(
    getClientAuth(),
    new GoogleAuthProvider(),
  );
  await createSession(await credential.user.getIdToken());
}

// In your component:
import { signInWithGoogle } from "@/services/auth";
await signInWithGoogle();
```

### Scoping data to the authenticated user

The verified session cookie decoded by `verifySessionCookie()` contains `uid`. Use this to scope all database reads and writes to the authenticated user's paths.

## Key Packages

### Dependencies

| Package                                                | Purpose                       |
| ------------------------------------------------------ | ----------------------------- |
| `next`                                                 | Fullstack React framework     |
| `react` / `react-dom`                                  | UI rendering                  |
| `@reduxjs/toolkit` / `react-redux`                     | Client state management       |
| `@tanstack/react-query`                                | Server state management       |
| `firebase`                                             | Client SDK (Firestore + RTDB) |
| `firebase-admin`                                       | Server SDK (Firestore + RTDB) |
| `@sentry/nextjs`                                       | Error tracking                |
| `@vercel/analytics`                                    | Usage analytics               |
| `class-variance-authority` / `clsx` / `tailwind-merge` | ShadCN UI utilities           |
| `lucide-react`                                         | Icons                         |

### Dev Dependencies

| Package                                                                                  | Purpose                                        |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `typescript`                                                                             | Type checking                                  |
| `vitest` / `@testing-library/react` / `happy-dom`                                        | Testing                                        |
| `storybook` / `@storybook/nextjs-vite`                                                   | Component development                          |
| `eslint` / `typescript-eslint` / `eslint-plugin-react-hooks` / `eslint-plugin-storybook` | Linting                                        |
| `prettier`                                                                               | Formatting                                     |
| `prettier-plugin-tailwindcss`                                                            | Automatic Tailwind class sorting (recommended) |
| `husky` / `lint-staged`                                                                  | Pre-commit hooks                               |
| `tailwindcss` / `@tailwindcss/postcss` / `postcss`                                       | Styling                                        |
| `shadcn`                                                                                 | ShadCN UI CLI                                  |

## Initialization Checklist

When starting a new project from this template:

1. Click "Use this template" on GitHub
2. Clone the new repository and run `pnpm install`
3. Copy `.env.example` to `.env.local` and fill in Firebase credentials
4. Configure Firebase project + environment variables
5. Set up Vercel project with GitHub integration
6. Add `ANTHROPIC_API_KEY` secret to GitHub repository settings (for Claude Code workflow)
7. Update `AGENTS.md` / `CLAUDE.md` with project-specific conventions
