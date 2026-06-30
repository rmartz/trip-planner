// Pure, dependency-free helper for the Vercel Ignored Build Step gate. Kept in
// plain ESM so the thin `.mjs` CLI can import it and the TypeScript spec
// (src/ci/vercel-ignore-build.spec.ts) can import it under strict tooling.
//
// `shouldDeployForTitle` decides whether a preview deploy is warranted for a PR
// based solely on its title: only `feat`/`fix` Conventional-Commit titles earn a
// preview. The regex mirrors the repo's pr-title-lint
// (.github/workflows/pr-title-lint.yml): optional scope, optional `!`, then `:`.
// It is case-sensitive, matching the lint, so `Feat:`/`FIX:` do not qualify.

const FEAT_FIX_TITLE = /^(feat|fix)(\([^)]+\))?!?:/;

export function shouldDeployForTitle(title) {
  return FEAT_FIX_TITLE.test(title);
}
