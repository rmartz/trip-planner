// Vercel "Ignored Build Step" command (wired via vercel.json `ignoreCommand`).
//
// ⚠️ EXIT-CODE SEMANTICS ARE COUNTERINTUITIVE — read carefully:
//   exit code 0      = SKIP / cancel the build
//   exit code 1 (≠0) = PROCEED with the build
// So "deploy" is `process.exit(1)` and "skip" is `process.exit(0)`.
//
// Goal: cut wasted Vercel *preview* deploys (they consume a daily quota) by only
// building previews for PRs whose title is a `feat:`/`fix:` Conventional Commit.
// Production deploys always build. We read the PR title from the public GitHub
// REST API (trip-planner is public → no token needed). We FAIL OPEN: on any
// uncertainty we build (exit 1), so a needed deploy is never wrongly skipped.

import { shouldDeployForTitle } from "./lib/vercel-ignore-build.mjs";

// Production deploys (merge to main) must always build.
if (process.env.VERCEL_ENV === "production") {
  console.log("production deploy — building");
  process.exit(1);
}

const prId = process.env.VERCEL_GIT_PULL_REQUEST_ID;
const owner = process.env.VERCEL_GIT_REPO_OWNER;
const slug = process.env.VERCEL_GIT_REPO_SLUG;

if (!prId || !owner || !slug) {
  console.log(
    "missing PR/repo env (VERCEL_GIT_PULL_REQUEST_ID/REPO_OWNER/REPO_SLUG) — failing open, building",
  );
  process.exit(1);
}

try {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${slug}/pulls/${prId}`,
    {
      headers: {
        "User-Agent": "trip-planner-vercel-ignore",
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!res.ok) {
    console.log(`GitHub API returned ${res.status} — failing open, building`);
    process.exit(1);
  }

  const { title } = await res.json();

  if (shouldDeployForTitle(title)) {
    console.log(`title is feat/fix — building (${title})`);
    process.exit(1);
  }

  console.log(`title not feat:/fix: — skipping preview deploy (${title})`);
  process.exit(0);
} catch (error) {
  console.log(`error checking PR title — failing open, building: ${error}`);
  process.exit(1);
}
