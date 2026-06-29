import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard for issue #391's protected invariant: the `storybook-tests`
// job in ci-actions.yml must run on every code-touching PR, so the CI workflow
// must NOT path-filter `pull_request` events. A `paths:` / `paths-ignore:`
// filter under `on.pull_request` would skip the whole workflow (storybook-tests
// included) for PRs that don't touch the listed paths, letting a non-Storybook
// edit sneak a visual/behavioral regression past the always-on test suite.
//
// This is a dependency-free structural check (the repo intentionally has no YAML
// parser): it isolates the top-level `on:` block by indentation and asserts no
// pull_request path filter lives inside it. A job-level documentation-only skip
// added later (#392) lives on the job, not in `on.pull_request`, so it does not
// trip this guard.

const workflowPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.github/workflows/ci-actions.yml",
);

function onTriggerBlock(yaml: string): string {
  const lines = yaml.split("\n");
  const start = lines.findIndex((line) => line.startsWith("on:"));
  expect(
    start,
    "ci-actions.yml must declare a top-level `on:` trigger",
  ).toBeGreaterThanOrEqual(0);

  // The block runs until the next line that begins at column 0 (a sibling
  // top-level key such as `permissions:` or `jobs:`).
  const rest = lines.slice(start + 1);
  const endOffset = rest.findIndex(
    (line) => line.length > 0 && !/^\s/.test(line),
  );
  const blockLines = endOffset === -1 ? rest : rest.slice(0, endOffset);
  return blockLines.join("\n");
}

describe("ci-actions.yml storybook-tests invariant (#391)", () => {
  const yaml = readFileSync(workflowPath, "utf8");

  it("does not path-filter pull_request events", () => {
    const block = onTriggerBlock(yaml);
    expect(/^\s+paths(-ignore)?:/m.test(block)).toBe(false);
  });

  it("still defines the storybook-tests job", () => {
    expect(/^\s{2}storybook-tests:/m.test(yaml)).toBe(true);
  });
});
