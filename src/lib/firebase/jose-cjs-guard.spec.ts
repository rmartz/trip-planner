// @vitest-environment node
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// Regression guard for the jose v6 ESM-only production outage (2026-06-30,
// route=/middleware): firebase-admin -> jwks-rsa/src/utils.js runs
// `const jose = require("jose")`. jose@6 is ESM-only, so any runtime that
// cannot require() an ES module throws ERR_REQUIRE_ESM. On Vercel that runtime
// is Turbopack's middleware external-module loader — which does NOT use Node
// 24's native require(ESM) support, so the Node-runtime proxy (src/proxy.ts)
// crashed on every request. We pin jose to the last CJS-capable major (5.x)
// via pnpm.overrides in package.json.
//
// This test loads the exact failing module in a child Node process with
// require(ESM) DISABLED (--no-experimental-require-module), faithfully
// reproducing that "cannot require ESM" environment. It stays green while jose
// is CJS-capable and goes RED the moment jose@6 re-enters the require path
// (e.g. the override is dropped before jwks-rsa/firebase-admin load jose via
// dynamic import). Red here = the override is still needed; green with the
// override removed = it is finally safe to remove.
describe("jose stays CommonJS-requireable for the firebase-admin auth path", () => {
  it("jwks-rsa loads in a runtime where require(ESM) is unavailable", () => {
    const script = [
      'const { createRequire } = require("module");',
      'const faReq = createRequire(require.resolve("firebase-admin"));',
      'faReq("jwks-rsa/src/utils");',
    ].join("\n");

    expect(() =>
      execFileSync(
        process.execPath,
        ["--no-experimental-require-module", "-e", script],
        { cwd: process.cwd(), stdio: "pipe" },
      ),
    ).not.toThrow();
  });
});
