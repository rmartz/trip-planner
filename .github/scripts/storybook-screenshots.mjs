#!/usr/bin/env node
/**
 * Captures Playwright screenshots for every Storybook story whose source file
 * changed in the PR, pushes them to the `gh-screenshots` branch, and posts (or
 * updates) a PR comment with an inline gallery.
 *
 * Expected environment variables:
 *   GITHUB_TOKEN  – token with contents:write and pull-requests:write
 *   REPO          – "owner/repo"
 *   PR_NUMBER     – pull request number
 *   CHANGED_FILES – newline-separated list of changed *.stories.tsx paths
 *   PR_HEAD_SHA   – HEAD SHA of the PR branch
 */

import { chromium } from "playwright";
import { createServer } from "http";
import { execSync } from "child_process";
import { extname, join } from "path";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { pushBranchWithRetry } from "./git-push-utils.mjs";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const REPO = process.env.REPO ?? "";
const PR_NUMBER = process.env.PR_NUMBER ?? "";
const CHANGED_FILES = process.env.CHANGED_FILES ?? "";
const PR_HEAD_SHA = process.env.PR_HEAD_SHA ?? "";

const COMMENT_MARKER = "<!-- storybook-screenshots-bot -->";
const SCREENSHOTS_BRANCH = "gh-screenshots";
const STORYBOOK_PORT = 6006;

const MIME_TYPES = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "application/javascript",
  ".json": "application/json",
  ".mjs": "application/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

// ---------------------------------------------------------------------------
// Story discovery
// ---------------------------------------------------------------------------

const changedFiles = CHANGED_FILES.split("\n")
  .map((f) => f.trim())
  .filter((f) => f.length > 0);

if (changedFiles.length === 0) {
  console.log("No changed story files found — skipping.");
  process.exit(0);
}

const indexJson = JSON.parse(
  readFileSync("storybook-static/index.json", "utf8"),
);
const allEntries = Object.values(indexJson.entries ?? {});

const matchingStories = allEntries.filter((entry) => {
  if (entry.type !== "story") return false;
  // importPath is like "./src/components/Foo/Foo.stories.tsx"
  const normalized = entry.importPath.replace(/^\.\//, "");
  return changedFiles.some((f) => f === normalized);
});

if (matchingStories.length === 0) {
  console.log("No matching stories for changed files — skipping.");
  process.exit(0);
}

console.log(`Found ${matchingStories.length} stories to screenshot.`);

// ---------------------------------------------------------------------------
// Static file server for storybook-static/
// ---------------------------------------------------------------------------

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = req.url.split("?")[0];
      const filePath = join(
        "storybook-static",
        urlPath === "/" ? "index.html" : urlPath.replace(/^\//, ""),
      );
      const mime = MIME_TYPES[extname(filePath)] ?? "application/octet-stream";
      try {
        const content = readFileSync(filePath);
        res.writeHead(200, { "Content-Type": mime });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(STORYBOOK_PORT, () => resolve(server));
  });
}

// ---------------------------------------------------------------------------
// Screenshot capture
// ---------------------------------------------------------------------------

async function captureScreenshots() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const results = [];

  try {
    for (const story of matchingStories) {
      console.log(`  Screenshotting: ${story.title} / ${story.name}`);
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 720 });

      const url = `http://localhost:${STORYBOOK_PORT}/iframe.html?id=${story.id}&viewMode=story`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
      await page
        .waitForSelector("#storybook-root", {
          state: "visible",
          timeout: 10_000,
        })
        .catch(() => {
          // Some stories render outside #storybook-root; continue anyway
        });

      const buffer = await page.screenshot({ type: "png" });
      results.push({ story, buffer });
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  return results;
}

// ---------------------------------------------------------------------------
// Push screenshots to gh-screenshots branch
// ---------------------------------------------------------------------------

function pushScreenshots(screenshots) {
  const shortSha = PR_HEAD_SHA.slice(0, 7);
  const tmpDir = "/tmp/gh-screenshots-worktree";

  execSync(
    'git config user.email "github-actions[bot]@users.noreply.github.com"',
  );
  execSync('git config user.name "github-actions[bot]"');

  // Fetch remote branch if it exists, creating a local tracking ref
  let branchExists = false;
  try {
    execSync(
      `git fetch origin ${SCREENSHOTS_BRANCH}:refs/heads/${SCREENSHOTS_BRANCH}`,
      { stdio: "pipe" },
    );
    branchExists = true;
  } catch {
    // Branch doesn't exist yet — will be created as orphan below
  }

  if (branchExists) {
    execSync(`git worktree add ${tmpDir} ${SCREENSHOTS_BRANCH}`);
  } else {
    execSync(`git worktree add --orphan -b ${SCREENSHOTS_BRANCH} ${tmpDir}`);
  }

  const prDir = `${tmpDir}/pr-${PR_NUMBER}`;
  // Clear stale screenshots from previous runs before writing the new set
  rmSync(prDir, { recursive: true, force: true });
  mkdirSync(prDir, { recursive: true });

  const fileNames = screenshots.map(({ story, buffer }) => {
    const safeName = story.id.replace(/[^a-zA-Z0-9-]/g, "-");
    const fileName = `${safeName}.png`;
    writeFileSync(`${prDir}/${fileName}`, buffer);
    return { story, fileName };
  });

  execSync(`git -C ${tmpDir} add -A`);

  const status = execSync(`git -C ${tmpDir} status --porcelain`, {
    encoding: "utf8",
  }).trim();
  if (status) {
    execSync(
      `git -C ${tmpDir} commit -m "Add screenshots for PR #${PR_NUMBER} (${shortSha})"`,
    );
    pushBranchWithRetry(tmpDir, SCREENSHOTS_BRANCH);
  } else {
    console.log("Screenshots unchanged — skipping commit.");
  }

  execSync(`git worktree remove --force ${tmpDir}`);
  return fileNames;
}

// ---------------------------------------------------------------------------
// Post or update PR comment
// ---------------------------------------------------------------------------

function buildRawUrl(fileName) {
  return `https://raw.githubusercontent.com/${REPO}/${SCREENSHOTS_BRANCH}/pr-${PR_NUMBER}/${fileName}`;
}

function buildCommentBody(fileNames) {
  const shortSha = PR_HEAD_SHA.slice(0, 7);
  const rows = fileNames
    .map(
      ({ story, fileName }) =>
        `| **${story.title}** — ${story.name} | ![${story.name}](${buildRawUrl(fileName)}) |`,
    )
    .join("\n");

  return `${COMMENT_MARKER}
## 📸 Storybook Screenshots

| Story | Preview |
|---|---|
${rows}

<sub>Generated from commit ${shortSha}</sub>`;
}

async function postPrComment(fileNames) {
  const [owner, repoName] = REPO.split("/");
  const apiBase = `https://api.github.com/repos/${owner}/${repoName}`;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "storybook-screenshots-bot",
  };

  const commentBody = buildCommentBody(fileNames);

  // Find existing bot comment (search through all pages)
  let existingCommentId = null;
  let page = 1;
  outer: while (true) {
    const res = await fetch(
      `${apiBase}/issues/${PR_NUMBER}/comments?per_page=100&page=${page}`,
      { headers },
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GitHub API list-comments ${res.status}: ${body}`);
    }
    const comments = await res.json();
    if (!Array.isArray(comments) || comments.length === 0) break;

    for (const comment of comments) {
      if (comment.body?.includes(COMMENT_MARKER)) {
        existingCommentId = comment.id;
        break outer;
      }
    }
    if (comments.length < 100) break;
    page++;
  }

  if (existingCommentId !== null) {
    const patchRes = await fetch(
      `${apiBase}/issues/comments/${existingCommentId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ body: commentBody }),
      },
    );
    if (!patchRes.ok) {
      const body = await patchRes.text();
      throw new Error(`GitHub API update-comment ${patchRes.status}: ${body}`);
    }
    console.log("Updated existing PR comment.");
  } else {
    const postRes = await fetch(`${apiBase}/issues/${PR_NUMBER}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({ body: commentBody }),
    });
    if (!postRes.ok) {
      const body = await postRes.text();
      throw new Error(`GitHub API post-comment ${postRes.status}: ${body}`);
    }
    console.log("Posted new PR comment.");
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const screenshots = await captureScreenshots();

if (screenshots.length === 0) {
  console.log("No screenshots captured — skipping.");
  process.exit(0);
}

const fileNames = pushScreenshots(screenshots);
await postPrComment(fileNames);
console.log("Done.");
