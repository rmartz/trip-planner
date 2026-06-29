#!/usr/bin/env node
/**
 * Shared git push utilities for CI scripts.
 */

import { execSync } from "child_process";

const PUSH_ATTEMPTS = 3;

/**
 * Push a branch to origin, retrying with a fetch + rebase on non-fast-forward
 * rejection. Each caller's push may race a concurrent push from another job;
 * since each job writes only to its own subdirectory the rebase applies cleanly.
 *
 * @param {string} repoDir - Path to the git repository (passed to `git -C`).
 * @param {string} branch  - Name of the remote branch to push.
 */
export function pushBranchWithRetry(repoDir, branch) {
  for (let attempt = 1; attempt <= PUSH_ATTEMPTS; attempt++) {
    try {
      execSync(`git -C ${repoDir} push origin ${branch}`, { stdio: "pipe" });
      return;
    } catch (error) {
      if (attempt === PUSH_ATTEMPTS) throw error;
      console.log(
        `Push to ${branch} rejected (attempt ${attempt}/${PUSH_ATTEMPTS}); rebasing onto the latest branch and retrying.`,
      );
      execSync(`git -C ${repoDir} fetch origin ${branch}`);
      execSync(`git -C ${repoDir} rebase FETCH_HEAD`);
    }
  }
}
