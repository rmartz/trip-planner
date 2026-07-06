// Pure, dependency-free helper for the Vercel Ignored Build Step gate. Kept in
// plain ESM so the thin `.mjs` CLI can import it and the TypeScript spec
// (src/ci/vercel-ignore-build.spec.ts) can import it under strict tooling.
//
// Preview deploys are now produced exclusively by the label-gated GitHub Action
// (.github/workflows/preview-deploy.yml, #410), which runs `vercel deploy` via
// the CLI only when a PR carries `ready for UAT` — a path that bypasses this
// Ignored Build Step. So Vercel's automatic Git-integration build proceeds only
// for the production deploy (merge to main); every preview build is skipped here.
export function shouldBuildForEnv(vercelEnv) {
  return vercelEnv === "production";
}
