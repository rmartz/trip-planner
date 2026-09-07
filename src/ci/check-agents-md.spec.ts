import { describe, expect, it } from "vitest";
// The directive-file check is plain ESM (.mjs) so CI can run it with only Node
// built-ins (no pnpm install). This spec imports that same module directly so
// the pairing and bare-wrapper logic is verified under TypeScript tooling.
import {
  directoryViolations,
  wrapperError,
} from "../../scripts/lib/check-agents-md.mjs";

describe("wrapperError — bare wrapper passes", () => {
  it("accepts a lone @AGENTS.md line with a trailing newline", () => {
    expect(wrapperError("@AGENTS.md\n")).toBeUndefined();
  });
});

describe("wrapperError — extra content fails", () => {
  it("flags a wrapper that carries directives beyond the import line", () => {
    expect(wrapperError("@AGENTS.md\n\n- Always use pnpm.")).toBeDefined();
  });
});

describe("wrapperError — empty file fails", () => {
  it("flags a CLAUDE.md with no meaningful lines", () => {
    expect(wrapperError("\n  \n")).toBeDefined();
  });
});

describe("directoryViolations — compliant pair passes", () => {
  it("returns no violations for a paired AGENTS.md and bare CLAUDE.md", () => {
    const violations = directoryViolations({
      hasAgents: true,
      hasClaude: true,
      claude: { symlink: false, file: true, content: "@AGENTS.md\n" },
    });

    expect(violations).toEqual([]);
  });
});

describe("directoryViolations — orphan AGENTS.md fails", () => {
  it("flags an AGENTS.md with no companion CLAUDE.md", () => {
    const violations = directoryViolations({
      hasAgents: true,
      hasClaude: false,
    });

    expect(violations).toEqual(["AGENTS.md has no companion CLAUDE.md"]);
  });
});

describe("directoryViolations — orphan CLAUDE.md fails", () => {
  it("flags a CLAUDE.md with no companion AGENTS.md", () => {
    const violations = directoryViolations({
      hasAgents: false,
      hasClaude: true,
      claude: { symlink: false, file: true, content: "@AGENTS.md\n" },
    });

    expect(violations).toEqual(["CLAUDE.md has no companion AGENTS.md"]);
  });
});

describe("directoryViolations — symlinked CLAUDE.md fails", () => {
  it("flags a CLAUDE.md that is a symlink rather than a real file", () => {
    const violations = directoryViolations({
      hasAgents: true,
      hasClaude: true,
      claude: { symlink: true, file: false, content: "" },
    });

    expect(violations).toEqual([
      "CLAUDE.md is a symlink; it must be a real file containing only `@AGENTS.md`",
    ]);
  });
});
