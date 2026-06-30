// Type declarations for the plain-ESM vercel-ignore-build helper so the
// TypeScript spec (src/ci/vercel-ignore-build.spec.ts) can import it under strict
// type checking. Keep in sync with vercel-ignore-build.mjs.

export function shouldDeployForTitle(title: string): boolean;
