// Vercel "Ignored Build Step" command (wired via vercel.json `ignoreCommand`).
//
// ⚠️ EXIT-CODE SEMANTICS ARE COUNTERINTUITIVE — read carefully:
//   exit code 0      = SKIP / cancel the build
//   exit code 1 (≠0) = PROCEED with the build
// So "deploy" is `process.exit(1)` and "skip" is `process.exit(0)`.
//
// Preview deploys are gated on the `ready for UAT` label (#410): the
// label-driven GitHub Action (.github/workflows/preview-deploy.yml) runs
// `vercel deploy` via the CLI — which bypasses this Ignored Build Step — only
// when a PR is marked ready for UAT. So Vercel's automatic Git-integration
// preview build is disabled here (every preview is skipped) and a preview is
// produced solely through that Action. Production deploys (merge to main)
// always build.

import { shouldBuildForEnv } from "./lib/vercel-ignore-build.mjs";

if (shouldBuildForEnv(process.env.VERCEL_ENV)) {
  console.log("production deploy — building");
  process.exit(1);
}

console.log(
  "preview build — skipping; previews are label-gated via preview-deploy.yml",
);
process.exit(0);
